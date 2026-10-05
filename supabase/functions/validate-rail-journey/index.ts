import { withSupabase } from "npm:@supabase/server@^1";

const REPO = "raaj445/coding_journey";
const BRANCH = "main";

function extractCode(value: string) {
  const match = String(value || "").match(/\\(([A-Z0-9]{2,10})\\)\\s*$/i);
  return match?.[1]?.toUpperCase() || "";
}

function timeToMinutes(value: string | null) {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
}

function dayNameFromDate(date: string) {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const day = new Date(`${date}T00:00:00+05:30`).getDay();
  return days[day];
}

async function loadChunk(trainNumber: string) {
  const prefix = trainNumber.slice(0, 2);
  const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/public/rail/routes/${prefix}.json.gz`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const bytes = await response.arrayBuffer();
  const decompressed = new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")));
  return await decompressed.json();
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req) => {
    if (req.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

    try {
      const body = await req.json();
      const trainNumber = String(body.trainNumber || "").trim().padStart(5, "0");
      const fromCode = String(body.fromCode || "").trim().toUpperCase();
      const toCode = String(body.toCode || "").trim().toUpperCase();
      const journeyDate = String(body.journeyDate || "").trim();

      if (!/^\\d{5}$/.test(trainNumber) || !/^[A-Z0-9]{2,10}$/.test(fromCode) || !/^[A-Z0-9]{2,10}$/.test(toCode) || !/^\\d{4}-\\d{2}-\\d{2}$/.test(journeyDate)) {
        return Response.json({ valid: false, code: "BAD_INPUT", message: "Train number, stations and journey date are required." }, { status: 400 });
      }

      const chunk = await loadChunk(trainNumber);
      const train = chunk?.[trainNumber];
      if (!train) return Response.json({ valid: false, code: "TRAIN_NOT_FOUND", message: "Train number was not found in the synced timetable." }, { status: 404 });

      const from = train.route.find((stop: any) => stop.stationCode === fromCode);
      const to = train.route.find((stop: any) => stop.stationCode === toCode);

      if (!from || !to) {
        return Response.json({ valid: false, code: "STATION_NOT_ON_TRAIN", message: "The selected train does not stop at both selected stations." }, { status: 422 });
      }

      if (from.sequence >= to.sequence) {
        return Response.json({ valid: false, code: "WRONG_DIRECTION", message: "The selected train does not travel from the selected origin to the selected destination in that order." }, { status: 422 });
      }

      const sourceStop = train.route[0];
      const sourceDate = new Date(`${journeyDate}T00:00:00+05:30`);
      sourceDate.setDate(sourceDate.getDate() - (Number(from.journeyDay || 1) - 1));
      const sourceDay = dayNameFromDate(sourceDate.toISOString().slice(0, 10));

      const runningDays = train.runningDays || [];
      if (runningDays.length && !runningDays.includes(sourceDay)) {
        return Response.json({ valid: false, code: "NOT_RUNNING", message: `This train does not run on the required day (${sourceDay}).` }, { status: 422 });
      }

      const departureMinutes = timeToMinutes(from.departureTime ?? from.arrivalTime);
      const arrivalMinutes = timeToMinutes(to.arrivalTime ?? to.departureTime);
      if (departureMinutes === null) {
        return Response.json({ valid: false, code: "NO_DEPARTURE_TIME", message: "No departure time is available for the selected boarding station." }, { status: 422 });
      }

      const journeyDayOffset = Number(from.journeyDay || 1) - 1;
      const departureDate = new Date(`${journeyDate}T00:00:00+05:30`);
      departureDate.setDate(departureDate.getDate() + journeyDayOffset);
      const [dh, dm] = (from.departureTime ?? from.arrivalTime).split(":").map(Number);
      departureDate.setHours(dh, dm, 0, 0);

      let durationMinutes = null;
      if (arrivalMinutes !== null) {
        durationMinutes = (Number(to.journeyDay || 1) - Number(from.journeyDay || 1)) * 1440 + arrivalMinutes - departureMinutes;
        if (durationMinutes < 0) durationMinutes += 1440;
      }

      return Response.json({
        valid: true,
        train: { number: train.number, name: train.name },
        from: { code: from.stationCode, name: from.stationName, sequence: from.sequence },
        to: { code: to.stationCode, name: to.stationName, sequence: to.sequence },
        departureTime: from.departureTime ?? from.arrivalTime,
        arrivalTime: to.arrivalTime ?? to.departureTime,
        journeyDay: from.journeyDay,
        sourceStation: sourceStop?.stationCode || null,
        sourceDate: sourceDate.toISOString().slice(0, 10),
        departureAt: departureDate.toISOString(),
        durationMinutes,
      });
    } catch (error) {
      console.error(error);
      return Response.json({ valid: false, code: "VALIDATION_ERROR", message: "Railway validation is temporarily unavailable." }, { status: 500 });
    }
  }),
};
