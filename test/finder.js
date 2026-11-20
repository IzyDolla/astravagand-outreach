// Lead-Finder: Suche, Crawler, Sicherheit, Filter, Übernahme in Leadliste
const realFetch = global.fetch;
const H = (body, status = 200, headers = {}) => new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', ...headers } });
const J = (o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { 'content-type': 'application/json' } });
const fetched = [];
const SITES = {
  'https://firma-a.at/': H(`<html><body><h1>Firma A Reinigung</h1><a href="/impressum">Impressum</a><a href="/kontakt">Kontakt</a><a href="https://www.facebook.com/firmaA">FB</a><a href="https://other.com/impressum">fremd</a></body></html>`),
  'https://firma-a.at/impressum': H(`<p>Firma A GmbH<br>Geschäftsführer: Mag. Karl Huber<br>E-Mail: office (at) firma-a.at<br><a href="tel:+43 732 123456">Tel</a> datenschutz@firma-a.at</p>`),
  'https://firma-a.at/kontakt': H(`<p>Schreiben Sie uns: <a href="mailto:anfrage@firma-a.at">anfrage@firma-a.at</a> bild@2x.png max.mustermann@example.com</p>`),
  'https://firma-b.at/': H(`<a href="mailto:jobs@firma-b.at">Jobs</a> <a href="mailto:info@firma-b.at">Info</a> <a href="/kontakt">Kontakt</a> Inhaberin: Frau Anna Berger`),
  'https://firma-b.at/robots.txt': new Response('User-agent: *\nDisallow: /kontakt\n', { headers: { 'content-type': 'text/plain' } }),
  'https://firma-b.at/kontakt': H('geheim@firma-b.at'),
  'https://redirect.at/': new Response('', { status: 302, headers: { location: 'http://127.0.0.1/admin' } }),
  'https://evil.at/': H('should never be fetched'),
  'https://pdf.at/': new Response('%PDF', { headers: { 'content-type': 'application/pdf' } })
};
let overpassCalls = 0;
global.fetch = async (url, opts = {}) => {
  url = String(url);
  if (url.startsWith('http://127.0.0.1:3304')) return realFetch(url, opts);
  fetched.push(url);
  if (url.startsWith('https://nominatim.openstreetmap.org/')) return J(url.includes('Nirgendwo') ? [] : [{ lat: '48.3059', lon: '14.2862', display_name: 'Linz, Oberösterreich, Österreich' }]);
  if (url.includes('/api/interpreter')) {
    overpassCalls++;
    if (url.startsWith('https://overpass-api.de')) return new Response('busy', { status: 504 });
    const ql = decodeURIComponent(String(opts.body).slice(5));
    if (!/reinigung/.test(ql)) return J({ elements: [] });
    return J({ elements: [
      { type: 'node', id: 1, lat: 48.306, lon: 14.287, tags: { name: 'Firma A Reinigung', 'addr:street': 'Hauptstraße', 'addr:housenumber': '1', 'addr:postcode': '4020', 'addr:city': 'Linz', website: 'firma-a.at' } },
      { type: 'way', id: 2, center: { lat: 48.31, lon: 14.29 }, tags: { name: 'Firma B Facility', 'addr:city': 'Linz', website: 'https://firma-b.at', phone: '+43 732 999' } },
      { type: 'node', id: 3, lat: 48.32, lon: 14.3, tags: { name: 'Evil GmbH', 'addr:city': 'Leonding', website: 'https://evil.at' } },
      { type: 'node', id: 4, lat: 48.30, lon: 14.28, tags: { name: 'Redirect KG', 'addr:city': 'Linz', website: 'https://redirect.at' } },
      { type: 'node', id: 5, lat: 48.30, lon: 14.28, tags: { name: 'Ohne Web OG', 'addr:city': 'Linz', phone: '0732 555' } },
      { type: 'node', id: 6, lat: 49.5, lon: 15.5, tags: { name: 'Zu weit weg', website: 'https://firma-a.at' } },
      { type: 'node', id: 7, lat: 48.30, lon: 14.28, tags: { name: 'PDF Firma', website: 'https://pdf.at' } },
      { type: 'node', id: 8, lat: 48.30, lon: 14.28, tags: { 'addr:city': 'Linz' } }
    ] });
  }
  const k = Object.keys(SITES).find(x => x === url);
  if (k) return SITES[k].clone();
  if (url.endsWith('/robots.txt')) return new Response('', { status: 404 });
  return new Response('not found', { status: 404, headers: { 'content-type': 'text/html' } });
};
process.env.PORT = 3304;
const F = require('../lib/finder');
F.setLookup(async h => h === 'evil.at' ? [{ address: '10.0.0.5' }] : [{ address: '93.184.216.34' }]);
const { fake } = require('./server'); const { fakeToken } = require('./fake-supabase');
const B = 'http://127.0.0.1:3304'; let TOKEN = '';
const call = async (m, p, body) => { const r = await realFetch(B + p, { method: m, headers: { 'X-AO': '1', 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN }, body: body ? JSON.stringify(body) : undefined }); const t = await r.text(); try { return { status: r.status, j: JSON.parse(t) }; } catch (e) { return { status: r.status, t }; } };
const ok = (n, c, extra) => { console.log((c ? '  ✓ ' : '  ✗ ') + n + (c || extra === undefined ? '' : '  → ' + JSON.stringify(extra))); if (!c) process.exitCode = 1; };
(async () => {
  await new Promise(r => setTimeout(r, 300));
  // Einheiten
  ok('privat-IPs erkannt', F.privateIp('10.1.2.3') && F.privateIp('192.168.0.1') && F.privateIp('127.0.0.1') && F.privateIp('169.254.169.254') && F.privateIp('::1') && F.privateIp('::ffff:10.0.0.1') && F.privateIp('fd00::1') && !F.privateIp('93.184.216.34'));
  ok('E-Mail-Verschleierung entschlüsselt', JSON.stringify(F.extractEmails('a (at) b.at · c[at]d[dot]at · e&#64;f.at · <a href="mailto:x@y.at?subject=1">'))=== JSON.stringify(['x@y.at', 'a@b.at', 'c@d.at', 'e@f.at']), F.extractEmails('a (at) b.at · c[at]d[dot]at · e&#64;f.at · <a href="mailto:x@y.at?subject=1">'));
  ok('Müll-Adressen gefiltert', F.extractEmails('logo@2x.png max.mustermann@example.com abc@sentry.io noreply@firma.at real@firma.at').join() === 'real@firma.at');
  ok('Ansprechpartner aus Impressum', JSON.stringify(F.extractContact('<p>Geschäftsführer: Mag. Karl Huber</p>')) === JSON.stringify({ first: 'Karl', last: 'Huber', role: 'Geschäftsführung' }));
  ok('Firmenseite bevorzugt, Jobs-Adresse hinten', F.rankEmails(['jobs@firma.at', 'x@gmail.com', 'office@firma.at'], 'https://www.firma.at').join() === 'office@firma.at,x@gmail.com,jobs@firma.at');
  await fake.auth.admin; TOKEN = '';
  await call('POST', '/api/setup', { token: 'SETUP-123', company: 'A', name: 'Izy', email: 'izy@astravagand.com', password: 'Mein Kaffee um 7 ist heilig!' });
  const u = [...fake.users.values()][0]; TOKEN = fakeToken(u.id);
  let r = await call('GET', '/api/finder'); ok('Branchen + Quelle geliefert', r.j.ok && r.j.categories.length > 20 && r.j.sources.osm && !r.j.sources.google);
  r = await call('POST', '/api/finder/search', { category: 'cleaning', location: 'Nirgendwo', radius: 15 }); ok('unbekannter Ort → klare Meldung', r.j.job.status === 'error' && /nicht gefunden/.test(r.j.job.error), r.j);
  r = await call('POST', '/api/finder/search', { location: 'Linz' }); ok('ohne Branche/Begriff abgelehnt', r.status === 400);
  r = await call('POST', '/api/finder/search', { category: 'cleaning', location: 'Linz', radius: 15, max: 100 });
  const job = r.j.job;
  ok('Suche: Ausfall-Server übersprungen, Ersatz genutzt', overpassCalls >= 2 && job.total === 6, { calls: overpassCalls, job });
  ok('zu weit weg + namenlos aussortiert', !fake.db.finder_results.some(x => x.name === 'Zu weit weg') && fake.db.finder_results.length === 6);
  for (let i = 0; i < 4 && fake.db.finder_jobs.find(j => j.id === job.id).status !== 'done'; i++) await call('POST', `/api/finder/jobs/${job.id}/step`);
  const R = n => fake.db.finder_results.find(x => x.name === n);
  const A = R('Firma A Reinigung');
  ok('Firma A: beste Mail von Firmen-Domain, Impressum gelesen', A.email === 'office@firma-a.at' && A.emails.includes('anfrage@firma-a.at') && A.emails.at(-1) === 'datenschutz@firma-a.at', A.emails);
  ok('Firma A: Ansprechpartner, Telefon, Facebook', A.contact_first === 'Karl' && A.contact_last === 'Huber' && A.phone === '+43 732 123456' && /facebook\.com\/firmaA/.test(A.socials.facebook), A);
  ok('fremde Domain nicht gecrawlt', !fetched.includes('https://other.com/impressum'));
  const Bf = R('Firma B Facility');
  ok('robots.txt respektiert (Kontaktseite gesperrt)', !fetched.includes('https://firma-b.at/kontakt') && !Bf.emails.includes('geheim@firma-b.at'));
  ok('Firma B: info@ vor jobs@, Inhaberin erkannt', Bf.email === 'info@firma-b.at' && Bf.contact_first === 'Anna' && Bf.contact_role === 'Inhaber', Bf);
  ok('interne Adresse (DNS → 10.x) blockiert, nie abgerufen', R('Evil GmbH').crawl_status === 'error' && /blockiert/.test(R('Evil GmbH').crawl_error) && !fetched.includes('https://evil.at/'));
  ok('Weiterleitung auf 127.0.0.1 blockiert', R('Redirect KG').crawl_status === 'error' && !fetched.some(f => f.startsWith('http://127.0.0.1/')), R('Redirect KG'));
  ok('PDF statt HTML abgelehnt', R('PDF Firma').crawl_status === 'error');
  ok('ohne Website übersprungen, Telefon bleibt', R('Ohne Web OG').crawl_status === 'skipped' && R('Ohne Web OG').phone === '0732 555');
  const jj = fake.db.finder_jobs.find(j => j.id === job.id);
  ok('Suche fertig + Zähler stimmen', jj.status === 'done' && jj.with_email === 2 && jj.total === 6 && jj.with_phone === 3, jj);
  r = await call('GET', `/api/finder/results?job=${job.id}&has=email`); ok('Filter „mit E-Mail“', r.j.total === 2 && r.j.rows.every(x => x.email));
  r = await call('GET', `/api/finder/results?job=${job.id}&q=berger`); ok('Suche nach Ansprechpartner', r.j.total === 1 && r.j.rows[0].name === 'Firma B Facility', r.j);
  r = await call('GET', `/api/finder/results?job=${job.id}&has=phone&sort=name`); ok('Filter Telefon + Sortierung', r.j.rows.map(x => x.name).join() === 'Firma A Reinigung,Firma B Facility,Ohne Web OG', r.j.rows.map(x => x.name));
  ok('Facetten (Orte)', r.j.facets.cities.some(c => c.v === 'Linz'));
  r = await call('GET', `/api/finder/results/${A.id}`); ok('Detail', r.j.result.contact.first === 'Karl' && r.j.result.emails.length === 3);
  r = await call('GET', `/api/finder/export?job=${job.id}`); ok('Excel-Export', typeof r.t === 'string' && r.t.includes('Firma A Reinigung') && r.t.includes('office@firma-a.at') && r.t.includes('Karl Huber'));
  r = await call('POST', '/api/finder/import', { ids: [A.id, R('Ohne Web OG').id], listId: 'new', listName: 'Reinigung Linz' });
  ok('Übernahme: nur mit E-Mail, Vorname/Firma/Website übernommen', r.j.ok && r.j.imported === 1 && r.j.noEmail === 1 && fake.db.leads.some(l => l.email === 'office@firma-a.at' && l.first === 'Karl' && l.company === 'Firma A Reinigung' && l.website === 'https://firma-a.at/'), r.j);
  ok('als übernommen markiert', !!R('Firma A Reinigung').imported_at && R('Firma A Reinigung').imported_list === r.j.listId);
  const listId = r.j.listId;
  r = await call('POST', '/api/finder/import', { filter: { job: job.id, has: 'email' }, listId });
  ok('„Alle übernehmen“ mit Filter, Duplikat erkannt', r.j.ok && r.j.imported === 1 && r.j.duplicates === 1, r.j);
  r = await call('GET', `/api/finder/results?job=${job.id}&imported=no`); ok('Filter „noch nicht übernommen“', r.j.rows.every(x => !x.imported) && r.j.total === 4);
  r = await call('POST', '/api/finder/results/recrawl', { ids: [Bf.id] }); ok('neu prüfen', fake.db.finder_results.find(x => x.id === Bf.id).crawl_status === 'pending');
  // anderer Workspace sieht nichts
  const other = fake.db.workspaces.length; fake.db.workspaces.push({ id: '00000000-0000-4000-8000-000000000099', name: 'X', settings: {} });
  fake.db.allowed_signups.push({ email: 'o@x.at' }); const o = (await fake.auth.admin.createUser({ email: 'o@x.at', password: 'x' })).data.user;
  fake.db.members.push({ ws_id: '00000000-0000-4000-8000-000000000099', user_id: o.id, role: 'owner' }); fake.db.profiles.push({ user_id: o.id, current_ws: '00000000-0000-4000-8000-000000000099' });
  TOKEN = fakeToken(o.id);
  r = await call('GET', `/api/finder/results?job=all`); ok('fremder Workspace sieht keine Ergebnisse', r.j.total === 0, r.j);
  r = await call('GET', `/api/finder/results/${A.id}`); ok('fremder Workspace: Detail gesperrt', r.status === 404 || r.status === 403, r);
  r = await call('DELETE', `/api/finder/jobs/${job.id}`); ok('fremder Workspace: löschen gesperrt', r.status === 404 || r.status === 403);
  TOKEN = fakeToken(u.id);
  r = await call('DELETE', `/api/finder/jobs/${job.id}`); ok('Suche löschen entfernt Ergebnisse, Leads bleiben', !fake.db.finder_results.some(x => x.job_id === job.id) && fake.db.leads.some(l => l.email === 'office@firma-a.at'));
  console.log(process.exitCode ? '\nFEHLER' : '\nALLES OK'); process.exit(process.exitCode || 0);
})().catch(e => { console.error(e); process.exit(1); });
