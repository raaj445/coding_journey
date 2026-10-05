import { mkdir, rm, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const SOURCE = "https://raw.githubusercontent.com/prasenjit-27/Indian-Railway-Data/main/trains.json";
const outputRoot = new URL("../public/rail/", import.meta.url);
const routesRoot = new URL("./routes/", outputRoot);

console.log("Downloading railway timetable dataset...");
const response = await fetch(SOURCE);
if (!response.ok) throw new Error(`Unable to download train dataset: ${response.status}`);
const trains = await response.json();
if (!Array.isArray(trains) || !trains.length) throw new Error("Train dataset is empty");

await rm(outputRoot, { recursive: true, force: true });
await mkdir(routesRoot, { recursive: true });

const index = [];
const chunks = new Map();

for (const raw of trains) {
  const number = String(raw.trainNumber || "").trim().padStart(5, "0");
  if (!/^\d{5}$/.test(number)) continue;

  const route = Array.isArray(raw.completeOrderedRoute)
    ? raw.completeOrderedRoute.map((stop) => ({
        sequence: Number(stop.sequence || 0),
        stationCode: String(stop.stationCode || "").trim().toUpperCase(),
        stationName: String(stop.stationName || "").trim(),
        arrivalTime: stop.arrivalTime || null,
        departureTime: stop.departureTime || null,
        journeyDay: Number(stop.journeyDay || 1),
        distance: Number(stop.distance || 0),
      })).filter((stop) => stop.stationCode)
    : [];

  const runsOn = Object.entries(raw.runningDays || {})
    .filter(([, value]) => Boolean(value))
    .map(([day]) => day);

  index.push({
    number,
    name: String(raw.trainName || "").trim(),
    type: String(raw.type || "").trim(),
    source: raw.source?.code ? String(raw.source.code).toUpperCase() : route[0]?.stationCode || "",
    destination: raw.destination?.code ? String(raw.destination.code).toUpperCase() : route.at(-1)?.stationCode || "",
    runsOn,
  });

  const prefix = number.slice(0, 2);
  if (!chunks.has(prefix)) chunks.set(prefix, {});
  chunks.get(prefix)[number] = { number, name: String(raw.trainName || "").trim(), route };
}

index.sort((a, b) => a.number.localeCompare(b.number));

await writeFile(
  new URL("./train-index.json", outputRoot),
  JSON.stringify({ generatedAt: new Date().toISOString(), source: SOURCE, count: index.length, trains: index })
);

for (const [prefix, data] of chunks) {
  const payload = Buffer.from(JSON.stringify(data));
  await writeFile(new URL(`./routes/${prefix}.json.gz`, outputRoot), gzipSync(payload, { level: 9 }));
}

console.log(`Generated ${index.length} trains in ${chunks.size} route chunks.`);
