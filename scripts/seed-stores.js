// ============================================================
// One-time store seeder — pulls real shops from OpenStreetMap
// and inserts them into Supabase.
//
// Setup:
//   1. Get your service_role key from:
//      Supabase → Project Settings → API → service_role (secret)
//   2. Fill in SUPABASE_URL and SERVICE_ROLE_KEY below
//   3. Run: node scripts/seed-stores.js
//
// The service_role key bypasses RLS — never put it in frontend code.
// ============================================================

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL     = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const TANDIL_LAT  = -37.3217
const TANDIL_LNG  = -59.1332
const RADIUS_M    = 5000

// ============================================================
// 1. Fetch shops from OpenStreetMap via Overpass API
// ============================================================
const overpassQuery = `
[out:json][timeout:30];
(
  node["shop"](around:${RADIUS_M},${TANDIL_LAT},${TANDIL_LNG});
  node["amenity"="supermarket"](around:${RADIUS_M},${TANDIL_LAT},${TANDIL_LNG});
  node["amenity"="convenience"](around:${RADIUS_M},${TANDIL_LAT},${TANDIL_LNG});
  node["amenity"="marketplace"](around:${RADIUS_M},${TANDIL_LAT},${TANDIL_LNG});
);
out body;
`

const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
]

let osmJson = null

for (const endpoint of OVERPASS_ENDPOINTS) {
  console.log(`Trying ${endpoint}...`)
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: overpassQuery,
    })
    const text = await res.text()
    if (text.trim().startsWith('<')) {
      console.log('Got HTML response (server busy), trying next...')
      continue
    }
    osmJson = JSON.parse(text)
    console.log('Success.')
    break
  } catch (e) {
    console.log(`Failed: ${e.message}, trying next...`)
  }
}

if (!osmJson) {
  console.error('All Overpass endpoints failed. Try again in a few minutes.')
  process.exit(1)
}

// ============================================================
// 2. Filter and shape the results
// ============================================================
const stores = osmJson.elements
  .filter(n => n.tags?.name)           // skip unnamed nodes
  .map(n => ({
    place_id: `osm_${n.id}`,           // stable OSM ID as dedup key
    name:     n.tags.name,
    lat:      n.lat,
    lng:      n.lon,
  }))

console.log(`Found ${stores.length} named stores in Tandil`)

if (stores.length === 0) {
  console.log('Nothing to insert. Exiting.')
  process.exit(0)
}

// ============================================================
// 3. Insert into Supabase in batches of 50
// upsert with onConflict: place_id → safe to re-run
// ============================================================
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const BATCH_SIZE = 50

for (let i = 0; i < stores.length; i += BATCH_SIZE) {
  const batch = stores.slice(i, i + BATCH_SIZE)

  const { error } = await supabase
    .from('stores')
    .upsert(batch, { onConflict: 'place_id' })

  if (error) {
    console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message)
  } else {
    console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} inserted (${batch.length} stores)`)
  }
}

console.log('Done. Check Supabase Table Editor → stores.')