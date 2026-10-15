import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

const root = process.env.RAILWAY_DATA_DIR || path.resolve("railways-master");
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your local shell. Never put the service-role key in Vite env or commit it.");
  process.exit(1);
}
const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const chunks = (rows, size = 1000) => Array.from({ length: Math.ceil(rows.length / size) }, (_, i) => rows.slice(i * size, (i + 1) * size));
const asBool = value => value == null ? null : (value === true || value === 1 || value === "1" || value === "true");
async function upsertAll(table, rows, conflict, batchSize = 1000) {
  let done = 0;
  for (const batch of chunks(rows, batchSize)) {
    let attempt = 0;
    while (true) {
      const { error } = await db.from(table).upsert(batch, { onConflict: conflict, ignoreDuplicates: false });
      if (!error) break;
      if (++attempt >= 4) throw new Error(`${table} batch ${done} failed: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
    done += batch.length;
    if (done % 10000 === 0 || done === rows.length) console.log(`${table}: ${done}/${rows.length}`);
  }
}
const stationsGeo = read("stations.json");
const stationRows = stationsGeo.features.map(f => {
  const p = f.properties || {};
  const [longitude, latitude] = f.geometry?.coordinates || [];
  return { code: String(p.code || "").trim().toUpperCase(), name: String(p.name || "").trim(), state: p.state || null, zone: p.zone || null, address: p.address || null, longitude: Number.isFinite(longitude) ? longitude : null, latitude: Number.isFinite(latitude) ? latitude : null, geometry: f.geometry || null, raw_properties: p };
}).filter(x => x.code && x.name);
await upsertAll("railway_stations", stationRows, "code", 1000);

const trainsGeo = read("trains.json");
const trainRows = trainsGeo.features.map(f => {
  const p = f.properties || {};
  const n = String(p.number || "").trim();
  return {
    number: n, name: String(p.name || n).trim(), from_station_code: p.from_station_code || null, from_station_name: p.from_station_name || null,
    to_station_code: p.to_station_code || null, to_station_name: p.to_station_name || null, departure: p.departure && p.departure !== "None" ? p.departure : null,
    arrival: p.arrival && p.arrival !== "None" ? p.arrival : null, duration_h: Number.isFinite(Number(p.duration_h)) ? Number(p.duration_h) : null,
    duration_m: Number.isFinite(Number(p.duration_m)) ? Number(p.duration_m) : null, distance_km: Number.isFinite(Number(p.distance)) ? Number(p.distance) : null,
    return_train: p.return_train || null, zone: p.zone || null, train_type: p.type || null, classes: p.classes || null,
    first_ac: asBool(p.first_ac), second_ac: asBool(p.second_ac), third_ac: asBool(p.third_ac), sleeper: asBool(p.sleeper), chair_car: asBool(p.chair_car),
    first_class: asBool(p.first_class), geometry: f.geometry || null, raw_properties: p
  };
}).filter(x => x.number && x.name);
await upsertAll("railway_trains", trainRows, "number", 500);

const scheduleRows = read("schedules.json").map((s, i) => ({
  id: Number.isFinite(Number(s.id)) ? Number(s.id) : i + 1,
  train_number: String(s.train_number || "").trim(),
  train_name: s.train_name || null,
  station_code: String(s.station_code || "").trim().toUpperCase(),
  station_name: String(s.station_name || "").trim(),
  arrival: s.arrival || null,
  departure: s.departure || null,
  journey_day: Number.isFinite(Number(s.day)) ? Number(s.day) : null,
  stop_order: Number.isFinite(Number(s.day)) ? Number(s.day) : null,
  raw_record: s
})).filter(x => x.train_number && x.station_code && x.station_name);
await upsertAll("railway_schedules", scheduleRows, "id", 1000);

const [s, t, q] = await Promise.all([
  db.from("railway_stations").select("code", { count: "exact", head: true }),
  db.from("railway_trains").select("number", { count: "exact", head: true }),
  db.from("railway_schedules").select("id", { count: "exact", head: true })
]);
if (s.error || t.error || q.error) throw new Error([s.error, t.error, q.error].filter(Boolean).map(e => e.message).join("; "));
console.log(JSON.stringify({ imported: { stations: stationRows.length, trains: trainRows.length, schedules: scheduleRows.length }, databaseCounts: { stations: s.count, trains: t.count, schedules: q.count } }, null, 2));
