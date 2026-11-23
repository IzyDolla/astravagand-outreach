// Google-Suche in Großstädten: Kacheln statt einer Abfrage (Google liefert pro Abfrage max. 60)
process.env.GOOGLE_PLACES_KEY = 'g-test';
const { createFake } = require('./fake-supabase');
const F = require('../lib/finder');
const fake = createFake(); F.setDb(() => fake);
// 900 Firmen gleichmäßig um Berlin-Mitte verteilt (±0,3° Breite, ±0,45° Länge ≈ 33 km)
const C0 = { lat: 52.52, lon: 13.405 }, PLACES = [];
for (let i = 0; i < 30; i++) for (let k = 0; k < 30; k++) PLACES.push({ id: `p${i}_${k}`, lat: C0.lat - 0.3 + i * 0.02 + 0.003, lon: C0.lon - 0.45 + k * 0.03 + 0.004 });
let calls = 0, biasCalls = 0, delay = 0;
F.setFetch(async (url, opts = {}) => {
  url = String(url);
  if (url.startsWith('https://nominatim')) return new Response(JSON.stringify([{ lat: String(C0.lat), lon: String(C0.lon), display_name: 'Berlin, Deutschland' }]), { headers: { 'content-type': 'application/json' } });
  if (url.includes('places:searchText')) {
    calls++; if (delay) await new Promise(r => setTimeout(r, delay));
    const b = JSON.parse(opts.body);
    let inArea = PLACES;
    if (b.locationRestriction) { const { low, high } = b.locationRestriction.rectangle; inArea = PLACES.filter(p => p.lat >= low.latitude && p.lat < high.latitude && p.lon >= low.longitude && p.lon < high.longitude); }
    else biasCalls++;
    const capped = inArea.slice(0, 60), start = b.pageToken ? Number(b.pageToken) : 0, page = capped.slice(start, start + 20);
    const next = start + 20 < capped.length ? String(start + 20) : undefined;
    return new Response(JSON.stringify({ places: page.map(p => ({ id: p.id, displayName: { text: 'Elektro ' + p.id }, location: { latitude: p.lat, longitude: p.lon }, businessStatus: 'OPERATIONAL', websiteUri: '' })), nextPageToken: next }), { headers: { 'content-type': 'application/json' } });
  }
  return new Response('', { status: 404 });
});
let bad = 0; const ok = (n, c) => { console.log((c ? '  ✓ ' : '  ✗ ') + n); if (!c) bad++; };
(async () => {
  const ws = '11111111-1111-4111-8111-111111111111';
  const mk = async (max, extra = {}) => (await fake.from('finder_jobs').insert({ ws_id: ws, source: 'google', category: 'electrician', location: 'Berlin', radius_km: 50, max_results: max, label: 'x', next_try_at: new Date(0).toISOString(), ...extra }).select('*').single()).data;
  // 1) kleine Suche: eine Abfrage wie bisher
  const j1 = await mk(60);
  await F.process(Date.now() + 40000, ws, j1.id);
  let r1 = fake.db.finder_results.filter(r => r.job_id === j1.id);
  ok('bis 60: eine normale Abfrage (max. 60)', r1.length === 60 && biasCalls === 3);
  // 2) große Suche: Kacheln über mehrere Aufrufe
  calls = 0; delay = 40;
  const j2 = await mk(1000);
  let rounds = 0;
  while (rounds < 20) {
    rounds++;
    await F.process(Date.now() + 10500, ws, j2.id);
    const st = fake.db.finder_jobs.find(j => j.id === j2.id).status;
    if (st === 'done' || st === 'crawling' || st === 'error') break;
  }
  const job2 = fake.db.finder_jobs.find(j => j.id === j2.id);
  const r2 = fake.db.finder_results.filter(r => r.job_id === j2.id);
  ok(`alle 900 Firmen gefunden (statt 60) – ${r2.length} in ${rounds} Aufrufen, ${calls} Google-Abfragen`, r2.length === 900);
  ok('keine doppelten Einträge', new Set(r2.map(r => r.ext_id)).size === r2.length);
  ok('Suche ist fertig', job2.status === 'done' && job2.total === 900);
  ok('Fortschritt wurde zwischen den Aufrufen gespeichert', rounds > 1 && job2.cursor && job2.cursor.calls === calls);
  delay = 0;
  // 3) Ziel kleiner als vorhanden: hört beim Ziel auf, nächstgelegene zuerst
  calls = 0;
  const j3 = await mk(150);
  for (let i = 0; i < 10; i++) { await F.process(Date.now() + 12000, ws, j3.id); const st = fake.db.finder_jobs.find(j => j.id === j3.id).status; if (st !== 'queued' && st !== 'searching') break; }
  const r3 = fake.db.finder_results.filter(r => r.job_id === j3.id);
  ok(`stoppt beim Ziel (150): ${r3.length}`, r3.length === 150);
  // 4) Automodus: bereits gefundene Firmen werden nicht noch einmal aufgenommen
  const j4 = await mk(1000, { autopilot_id: '22222222-2222-4222-8222-222222222222' });
  for (let i = 0; i < 20; i++) { await F.process(Date.now() + 12000, ws, j4.id); const st = fake.db.finder_jobs.find(j => j.id === j4.id).status; if (st !== 'queued' && st !== 'searching') break; }
  ok('Automodus: schon bekannte Firmen nicht doppelt', fake.db.finder_results.filter(r => r.job_id === j4.id).length === 0);
  console.log(bad ? '\nFEHLER' : '\nALLES OK'); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
