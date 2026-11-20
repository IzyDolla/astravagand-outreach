'use strict';
// Lead-Finder: Firmen suchen (Google Maps oder OpenStreetMap) und ihre Websites nach Kontaktdaten durchsuchen.
const dns = require('dns').promises;
const net = require('net');

const UA = 'AstravagandOutreach-LeadFinder/1.0 (+https://astravagand.com)';
let _sb = null; const setDb = f => { _sb = f; };
const sb = () => _sb();
async function q(p) { const { data, error, count } = await p; if (error) { const e = new Error(error.message); e.db = true; throw e; } return count != null && data == null ? count : data; }
let _fetch = (...a) => fetch(...a); const setFetch = f => { _fetch = f; };
let _lookup = (h) => dns.lookup(h, { all: true, verbatim: true }); const setLookup = f => { _lookup = f; };

/* ---------- Branchen ---------- */
// osm: Tag-Filter für OpenStreetMap, g: Suchbegriff für Google Maps
const CATS = [
  ['cleaning', 'Reinigung & Facility', 'Dienstleistung', [], 'Reinigungsfirma', 'reinigung|cleaning|facility'],
  ['electrician', 'Elektriker', 'Handwerk', ['craft=electrician'], 'Elektriker'],
  ['plumber', 'Installateur / Sanitär / Heizung', 'Handwerk', ['craft=plumber', 'craft=hvac', 'craft=heating_engineer'], 'Installateur'],
  ['roofer', 'Dachdecker', 'Handwerk', ['craft=roofer'], 'Dachdecker'],
  ['painter', 'Maler', 'Handwerk', ['craft=painter'], 'Malerbetrieb'],
  ['carpenter', 'Tischler / Schreiner', 'Handwerk', ['craft=carpenter', 'craft=joiner', 'shop=furniture_maker'], 'Tischlerei'],
  ['tiler', 'Fliesenleger', 'Handwerk', ['craft=tiler'], 'Fliesenleger'],
  ['gardener', 'Gartenbau', 'Handwerk', ['craft=gardener', 'shop=garden_centre'], 'Gartenbau'],
  ['car_repair', 'Kfz-Werkstatt', 'Auto', ['shop=car_repair'], 'Autowerkstatt'],
  ['tyres', 'Reifenhandel', 'Auto', ['shop=tyres'], 'Reifenhändler'],
  ['car_dealer', 'Autohaus', 'Auto', ['shop=car'], 'Autohaus'],
  ['estate_agent', 'Immobilienmakler', 'Büro', ['office=estate_agent'], 'Immobilienmakler'],
  ['property_mgmt', 'Hausverwaltung', 'Büro', ['office=property_management'], 'Hausverwaltung'],
  ['tax_advisor', 'Steuerberater', 'Büro', ['office=tax_advisor', 'office=accountant'], 'Steuerberater'],
  ['lawyer', 'Rechtsanwalt', 'Büro', ['office=lawyer'], 'Rechtsanwalt'],
  ['architect', 'Architekt', 'Büro', ['office=architect'], 'Architekt'],
  ['insurance', 'Versicherungsmakler', 'Büro', ['office=insurance'], 'Versicherungsmakler'],
  ['restaurant', 'Restaurant', 'Gastro & Tourismus', ['amenity=restaurant'], 'Restaurant'],
  ['cafe', 'Café', 'Gastro & Tourismus', ['amenity=cafe'], 'Café'],
  ['hotel', 'Hotel / Pension', 'Gastro & Tourismus', ['tourism=hotel', 'tourism=guest_house'], 'Hotel'],
  ['hairdresser', 'Friseur', 'Beauty & Gesundheit', ['shop=hairdresser'], 'Friseur'],
  ['beauty', 'Kosmetik / Nagelstudio', 'Beauty & Gesundheit', ['shop=beauty'], 'Kosmetikstudio'],
  ['dentist', 'Zahnarzt', 'Beauty & Gesundheit', ['amenity=dentist'], 'Zahnarzt'],
  ['physio', 'Physiotherapie', 'Beauty & Gesundheit', ['healthcare=physiotherapist'], 'Physiotherapie'],
  ['fitness', 'Fitnessstudio', 'Beauty & Gesundheit', ['leisure=fitness_centre'], 'Fitnessstudio'],
  ['driving_school', 'Fahrschule', 'Dienstleistung', ['amenity=driving_school'], 'Fahrschule'],
  ['florist', 'Blumen', 'Handel', ['shop=florist'], 'Blumengeschäft'],
  ['bakery', 'Bäckerei', 'Handel', ['shop=bakery'], 'Bäckerei'],
  ['optician', 'Optiker', 'Handel', ['shop=optician'], 'Optiker']
].map(([key, label, group, osm, g, name]) => ({ key, label, group, osm, g, name }));
const catByKey = k => CATS.find(c => c.key === k);

const googleKey = () => process.env.GOOGLE_PLACES_KEY || '';
function sources() { return { google: !!googleKey(), osm: true }; }

/* ---------- Ortssuche ---------- */
const geoCache = new Map();
async function geocode(loc) {
  const k = loc.toLowerCase().trim(); if (geoCache.has(k)) return geoCache.get(k);
  const r = await _fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(loc), { headers: { 'User-Agent': UA, 'Accept-Language': 'de' }, signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error('Ortssuche nicht erreichbar (' + r.status + ')');
  const j = await r.json(); if (!j.length) { const e = new Error(`Ort „${loc}“ nicht gefunden.`); e.final = true; throw e; }
  const g = { lat: Number(j[0].lat), lon: Number(j[0].lon), name: String(j[0].display_name || loc).split(',').slice(0, 2).join(',').trim() };
  geoCache.set(k, g); return g;
}
const distKm = (a, b, c, d) => { const R = 6371, r = x => x * Math.PI / 180; const x = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
const cleanKw = s => String(s || '').replace(/[^\p{L}\p{N} &\-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);

/* ---------- Quelle: OpenStreetMap ---------- */
const MIRRORS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter'];
async function searchOsm(job, center, deadline) {
  const r = job.radius_km, dLat = r / 111.32, dLon = r / (111.32 * Math.cos(center.lat * Math.PI / 180));
  const bb = [center.lat - dLat, center.lon - dLon, center.lat + dLat, center.lon + dLon].map(x => x.toFixed(5)).join(',');
  const cat = catByKey(job.category), kw = cleanKw(job.keyword);
  const parts = [];
  if (cat) cat.osm.forEach(t => { const [k, v] = t.split('='); parts.push(`nwr["${k}"="${v}"](${bb});`); });
  const nameRe = kw ? kw.replace(/[-]/g, ' ').split(' ').filter(Boolean).join('.*') : (cat && cat.name);
  if (nameRe) parts.push(`nwr["name"~"${nameRe}",i](${bb});`);
  const ql = `[out:json][timeout:25];(${parts.join('')});out center tags ${Math.min(1000, job.max_results * 3)};`;
  let lastErr = 'keine Antwort';
  for (const m of MIRRORS) {
    const left = deadline - Date.now(); if (left < 6000) break;
    try {
      const res = await _fetch(m, { method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(ql), signal: AbortSignal.timeout(Math.min(28000, left - 2000)) });
      if (!res.ok) { lastErr = 'Server ' + res.status; continue; }
      const j = await res.json();
      return (j.elements || []).map(e => {
        const t = e.tags || {}, lat = e.lat ?? (e.center && e.center.lat), lon = e.lon ?? (e.center && e.center.lon);
        return { ext_id: `osm:${e.type}/${e.id}`, name: t.name, category: cat ? cat.label : kw,
          street: [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' '), postcode: t['addr:postcode'] || '', city: t['addr:city'] || t['addr:place'] || '', country: t['addr:country'] || '',
          lat, lon, phone: t.phone || t['contact:phone'] || t['contact:mobile'] || '', website: t.website || t['contact:website'] || t.url || '', email: (t.email || t['contact:email'] || '').toLowerCase(),
          opening: t.opening_hours || '', socials: { facebook: t['contact:facebook'] || '', instagram: t['contact:instagram'] || '' } };
      }).filter(x => x.name && x.lat != null);
    } catch (e) { lastErr = e.name === 'TimeoutError' ? 'Zeitüberschreitung' : e.message; }
  }
  const e = new Error('Kartendaten-Server ausgelastet (' + lastErr + ')'); e.retry = true; throw e;
}

/* ---------- Quelle: Google Maps (Places API, neu) ---------- */
const FIELDS = 'places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.primaryTypeDisplayName,places.rating,places.userRatingCount,places.businessStatus,nextPageToken';
async function searchGoogle(job, center, deadline) {
  const cat = catByKey(job.category), kw = cleanKw(job.keyword);
  const text = `${kw || (cat ? cat.g : '')} in ${job.location}`.trim();
  const out = []; let page = '';
  for (let i = 0; i < 3 && out.length < job.max_results; i++) {
    if (deadline - Date.now() < 5000) break;
    const body = { textQuery: text, languageCode: 'de', pageSize: 20, locationBias: { circle: { center: { latitude: center.lat, longitude: center.lon }, radius: Math.min(50000, job.radius_km * 1000) } } };
    if (page) body.pageToken = page;
    const r = await _fetch('https://places.googleapis.com/v1/places:searchText', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': googleKey(), 'X-Goog-FieldMask': FIELDS }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error('Google Maps: ' + String((j.error && j.error.message) || r.status).slice(0, 160)); if (r.status === 429 || r.status >= 500) e.retry = true; else e.final = true; throw e; }
    for (const p of j.places || []) {
      if (p.businessStatus && p.businessStatus !== 'OPERATIONAL') continue;
      const comp = t => ((p.addressComponents || []).find(c => (c.types || []).includes(t)) || {}).longText || '';
      out.push({ ext_id: 'g:' + p.id, name: (p.displayName && p.displayName.text) || '', category: (p.primaryTypeDisplayName && p.primaryTypeDisplayName.text) || (cat ? cat.label : kw),
        street: [comp('route'), comp('street_number')].filter(Boolean).join(' '), postcode: comp('postal_code'), city: comp('locality') || comp('postal_town'), country: comp('country'),
        lat: p.location && p.location.latitude, lon: p.location && p.location.longitude, phone: p.nationalPhoneNumber || p.internationalPhoneNumber || '', website: p.websiteUri || '', email: '',
        rating: p.rating ?? null, reviews: p.userRatingCount ?? null, opening: '', socials: {} });
    }
    page = j.nextPageToken || ''; if (!page) break;
  }
  return out.filter(x => x.name);
}

/* ---------- Sicherer Abruf fremder Websites ---------- */
function privateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19));
  }
  const x = ip.toLowerCase();
  if (x.startsWith('::ffff:')) return privateIp(x.slice(7));
  return x === '::' || x === '::1' || x.startsWith('fc') || x.startsWith('fd') || x.startsWith('fe8') || x.startsWith('fe9') || x.startsWith('fea') || x.startsWith('feb') || x.startsWith('ff');
}
async function assertPublic(host) {
  const h = host.replace(/^\[|\]$/g, '');
  if (!h || /^localhost$|\.local$|\.internal$|\.lan$/i.test(h)) throw new Error('blockierte Adresse');
  const ips = net.isIP(h) ? [{ address: h }] : await _lookup(h);
  if (!ips.length || ips.some(i => privateIp(i.address))) throw new Error('blockierte Adresse');
}
async function safeFetch(url, { timeout = 8000, max = 1500000, types = /text\/html|application\/xhtml/ } = {}) {
  let u = new URL(url);
  for (let hop = 0; hop < 5; hop++) {
    if (!/^https?:$/.test(u.protocol)) throw new Error('nur http/https');
    if (u.port && !['80', '443'].includes(u.port)) throw new Error('ungewöhnlicher Port');
    if (u.username || u.password) throw new Error('Zugangsdaten in URL');
    await assertPublic(u.hostname);
    const r = await _fetch(u.href, { redirect: 'manual', headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5', 'Accept-Language': 'de-AT,de;q=0.9,en;q=0.5' }, signal: AbortSignal.timeout(timeout) });
    if (r.status >= 300 && r.status < 400 && r.headers.get('location')) { try { r.body && r.body.cancel && r.body.cancel(); } catch (e) {} u = new URL(r.headers.get('location'), u); continue; }
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const ct = r.headers.get('content-type') || '';
    if (types && !types.test(ct)) { try { r.body && r.body.cancel && r.body.cancel(); } catch (e) {} throw new Error('kein HTML'); }
    let text = '';
    if (r.body && r.body.getReader) {
      const rd = r.body.getReader(), dec = new TextDecoder('utf-8'); let size = 0;
      for (;;) { const { done, value } = await rd.read(); if (done) break; size += value.length; text += dec.decode(value, { stream: true }); if (size > max) { try { await rd.cancel(); } catch (e) {} break; } }
    } else text = (await r.text()).slice(0, max);
    return { url: u.href, text };
  }
  throw new Error('zu viele Weiterleitungen');
}

/* ---------- robots.txt ---------- */
const robotsCache = new Map();
async function robotsAllows(u) {
  const origin = u.origin;
  if (!robotsCache.has(origin)) {
    let rules = [];
    try {
      const { text } = await safeFetch(origin + '/robots.txt', { timeout: 4000, max: 200000, types: null });
      let applies = false, any = false;
      for (const raw of text.split(/\r?\n/)) {
        const line = raw.replace(/#.*/, '').trim(); if (!line) continue;
        const [k, ...v] = line.split(':'); const key = k.trim().toLowerCase(), val = v.join(':').trim();
        if (key === 'user-agent') { if (any) { applies = false; any = false; } applies = applies || val === '*' || /astravagand/i.test(val); }
        else { any = true; if (applies && key === 'disallow' && val) rules.push(val); if (applies && key === 'allow' && val) rules.push('!' + val); }
      }
    } catch (e) { rules = []; }
    robotsCache.set(origin, rules);
  }
  const rules = robotsCache.get(origin), p = u.pathname || '/';
  let best = null;
  for (const r of rules) { const allow = r.startsWith('!'), pat = allow ? r.slice(1) : r; const prefix = pat.replace(/\*.*$/, '').replace(/\$$/, ''); if (p.startsWith(prefix) && (!best || prefix.length > best.len)) best = { len: prefix.length, allow }; }
  return !best || best.allow;
}

/* ---------- Kontaktdaten aus HTML lesen ---------- */
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', auml: 'ä', ouml: 'ö', uuml: 'ü', Auml: 'Ä', Ouml: 'Ö', Uuml: 'Ü', szlig: 'ß', commat: '@', period: '.' };
const decode = s => String(s).replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);?/g, (_, d) => String.fromCodePoint(Number(d))).replace(/&([a-z]+);/gi, (m, n) => ENT[n] ?? m);
const BAD_DOM = /(^|\.)(example\.(com|org|de|at)|sentry\.io|wixpress\.com|sentry-next\.wixpress\.com|domain\.(com|de|at)|email\.(com|de)|beispiel\.(de|at)|test\.(de|com)|mysite\.com|yourdomain\.com|ihre-domain\.de|godaddy\.com|schema\.org)$/i;
const BAD_LOCAL = /^(no-?reply|noreply|donotreply|mailer-daemon|postmaster|abuse|your|name|vorname\.nachname|max\.mustermann|mustermann|user|username|email|e-mail)$/i;
function extractEmails(html) {
  const s = decode(html).replace(/\s*[\[(\{]\s*(at|ät|@)\s*[\])\}]\s*/gi, '@').replace(/\s*[\[(\{]\s*(dot|punkt)\s*[\])\}]\s*/gi, '.');
  const found = [];
  for (const m of s.matchAll(/mailto:([^"'?<>\s]+)/gi)) found.push(decodeURIComponent(m[1]));
  for (const m of s.matchAll(/[a-z0-9][a-z0-9._%+-]{0,63}@[a-z0-9.-]+\.[a-z]{2,24}/gi)) found.push(m[0]);
  const out = [];
  for (let e of found) {
    e = e.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
    const [local, dom] = e.split('@');
    if (!local || !dom || e.length > 120) continue;
    if (/\.(png|jpe?g|gif|webp|svg|css|js|ico|bmp|tiff?)$/i.test(dom) || /@\d+x\./.test(e)) continue;
    if (BAD_DOM.test(dom) || BAD_LOCAL.test(local) || /^[0-9a-f]{16,}$/.test(local)) continue;
    if (!out.includes(e)) out.push(e);
  }
  return out;
}
const textOf = html => decode(String(html).replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ').replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr|td)>/gi, '\n').replace(/<[^>]+>/g, ' ')).replace(/[ \t]+/g, ' ');
function extractPhone(html) { const m = String(html).match(/href=["']tel:([^"']{5,40})["']/i); return m ? decodeURIComponent(m[1]).replace(/\s+/g, ' ').trim() : ''; }
const NAME = "[A-ZÄÖÜ][a-zäöüßéè]+(?:-[A-ZÄÖÜ][a-zäöüß]+)?";
function extractContact(html) {
  const t = textOf(html);
  const re = new RegExp(`(Geschäftsführ(?:er|erin|ung)|Inhaber(?:in)?|Vertreten durch|Vertretungsberechtigt(?:e|er)?|Firmeninhaber(?:in)?)\\s*[:\\-–]?\\s*(?:(?:Frau|Herr|Mag\\.(?:a)?|Dr\\.|Ing\\.|DI|Dipl\\.-Ing\\.|KR|Bmstr\\.|BSc|MSc|BA|MA|MBA)\\s*)*(${NAME})\\s+(${NAME})`);
  const m = t.match(re);
  if (!m) return null;
  const role = /inhaber/i.test(m[1]) ? 'Inhaber' : 'Geschäftsführung';
  if (/^(Gmbh|Und|Der|Die|Das|Firma|Unternehmen)$/i.test(m[2]) || /^(Gmbh|Kg|Og|Ag|Eu)$/i.test(m[3])) return null;
  return { first: m[2], last: m[3], role };
}
function extractSocials(html) {
  const s = {}; const h = String(html);
  const f = (k, re) => { const m = h.match(re); if (m && !s[k]) s[k] = m[0].replace(/["'<\s].*$/, ''); };
  f('facebook', /https?:\/\/(www\.)?facebook\.com\/(?!sharer|share|dialog|plugins|tr\b)[A-Za-z0-9.\-_/]+/i);
  f('instagram', /https?:\/\/(www\.)?instagram\.com\/(?!p\/|explore)[A-Za-z0-9._\-]+/i);
  f('linkedin', /https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/(company|in)\/[A-Za-z0-9\-_%]+/i);
  return s;
}
function contactLinks(html, base) {
  const out = []; const b = new URL(base);
  for (const m of String(html).matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]{0,200}?)<\/a>/gi)) {
    const href = m[1], label = textOf(m[2]).trim();
    if (!/impressum|imprint|kontakt|contact|about|ueber-uns|über-uns|team|legal-notice|offenlegung/i.test(href + ' ' + label)) continue;
    try { const u = new URL(decode(href), b); if (!/^https?:$/.test(u.protocol)) continue; if (u.hostname.replace(/^www\./, '') !== b.hostname.replace(/^www\./, '')) continue; u.hash = ''; if (!out.includes(u.href) && u.href !== b.href) out.push(u.href); } catch (e) {}
  }
  out.sort((a, c) => (/impressum|imprint|offenlegung/i.test(c) ? 1 : 0) - (/impressum|imprint|offenlegung/i.test(a) ? 1 : 0));
  return out.slice(0, 3);
}
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch (e) { return ''; } };
const baseDomain = h => h.split('.').slice(-2).join('.');
function rankEmails(list, website) {
  const d = baseDomain(hostOf(website));
  const score = e => { const dom = e.split('@')[1]; let s = 0; if (d && baseDomain(dom) === d) s += 10; if (/^(office|info|kontakt|contact|hallo|hello|mail|service|anfrage|buero|büro)@/.test(e)) s += 2; if (/^(jobs?|karriere|bewerbung|career|datenschutz|privacy|dsgvo|webmaster|presse|press|rechnung|buchhaltung|invoice)@/.test(e)) s -= 14; return s; };
  return list.map((e, i) => [e, score(e), i]).sort((a, b) => b[1] - a[1] || a[2] - b[2]).map(x => x[0]);
}
function normUrl(w) { let s = String(w || '').trim(); if (!s) return ''; if (!/^https?:\/\//i.test(s)) s = 'https://' + s.replace(/^\/+/, ''); try { const u = new URL(s); u.hash = ''; return u.href; } catch (e) { return ''; } }

async function crawlSite(website, deadline) {
  const start = normUrl(website); if (!start) throw new Error('ungültige Website');
  const left = () => deadline - Date.now();
  let home;
  try { home = await safeFetch(start, { timeout: Math.min(8000, left()) }); }
  catch (e) { if (start.startsWith('https://') && !/blockiert/.test(e.message)) home = await safeFetch(start.replace(/^https:/, 'http:'), { timeout: Math.min(6000, left()) }); else throw e; }
  const pages = [home];
  const links = contactLinks(home.text, home.url);
  const allowed = [];
  for (const l of links) { try { if (await robotsAllows(new URL(l))) allowed.push(l); } catch (e) {} }
  if (left() > 3000) pages.push(...(await Promise.all(allowed.map(l => safeFetch(l, { timeout: Math.min(6000, left() - 500) }).catch(() => null)))).filter(Boolean));
  const emails = rankEmails([...new Set(pages.flatMap(p => extractEmails(p.text)))], home.url).slice(0, 10);
  let contact = null; for (const p of pages.slice().reverse()) { contact = extractContact(p.text); if (contact) break; }
  const socials = Object.assign({}, ...pages.map(p => extractSocials(p.text)));
  const phone = pages.map(p => extractPhone(p.text)).find(Boolean) || '';
  return { emails, contact, socials, phone, finalUrl: home.url };
}

/* ---------- Ablauf ---------- */
async function updateCounts(jobId) {
  const rows = await q(sb().from('finder_results').select('email,phone,website,crawl_status').eq('job_id', jobId));
  const p = { total: rows.length, with_email: rows.filter(r => r.email).length, with_phone: rows.filter(r => r.phone).length, with_website: rows.filter(r => r.website).length, crawled: rows.filter(r => ['done', 'skipped', 'error'].includes(r.crawl_status)).length, updated_at: new Date().toISOString() };
  const open = rows.some(r => ['pending', 'running'].includes(r.crawl_status));
  const job = await q(sb().from('finder_jobs').select('status').eq('id', jobId).maybeSingle());
  if (job && job.status === 'crawling' && !open) p.status = 'done';
  await q(sb().from('finder_jobs').update(p).eq('id', jobId));
}
async function runSearch(job, deadline) {
  const center = job.center || await geocode(job.location);
  const raw = job.source === 'google' ? await searchGoogle(job, center, deadline) : await searchOsm(job, center, deadline);
  const seen = new Set(); const rows = [];
  for (const x of raw) {
    const d = distKm(center.lat, center.lon, x.lat, x.lon);
    if (d > job.radius_km * 1.15) continue;
    const key = (x.name + '|' + (x.street || '')).toLowerCase(); if (seen.has(key)) continue; seen.add(key);
    const website = normUrl(x.website);
    rows.push({ job_id: job.id, ws_id: job.ws_id, ext_id: String(x.ext_id).slice(0, 200), name: String(x.name).slice(0, 200), category: String(x.category || '').slice(0, 100), street: String(x.street || '').slice(0, 200), postcode: String(x.postcode || '').slice(0, 20), city: String(x.city || '').slice(0, 100), country: String(x.country || '').slice(0, 60),
      lat: x.lat, lon: x.lon, distance_km: Math.round(d * 10) / 10, phone: String(x.phone || '').slice(0, 60), website: website.slice(0, 500), email: x.email ? String(x.email).slice(0, 254) : null, emails: x.email ? [String(x.email).slice(0, 254)] : [],
      socials: x.socials || {}, opening: String(x.opening || '').slice(0, 300), rating: x.rating ?? null, reviews: x.reviews ?? null, crawl_status: website ? 'pending' : 'skipped' });
  }
  rows.sort((a, b) => a.distance_km - b.distance_km);
  const keep = rows.slice(0, job.max_results);
  for (let i = 0; i < keep.length; i += 200) await q(sb().from('finder_results').upsert(keep.slice(i, i + 200), { onConflict: 'job_id,ext_id', ignoreDuplicates: true }));
  await q(sb().from('finder_jobs').update({ status: keep.some(r => r.crawl_status === 'pending') ? 'crawling' : 'done', center, error: null, claimed_at: null, updated_at: new Date().toISOString() }).eq('id', job.id));
  await updateCounts(job.id);
  return keep.length;
}
async function claimSearch(wsId, jobId) {
  const now = new Date();
  // hängengebliebene Suchen wieder freigeben
  await q(sb().from('finder_jobs').update({ status: 'queued' }).eq('status', 'searching').lt('claimed_at', new Date(now - 120e3).toISOString()));
  let qb = sb().from('finder_jobs').select('*').eq('status', 'queued').lte('next_try_at', now.toISOString()).order('created_at', { ascending: true }).limit(1);
  if (wsId) qb = qb.eq('ws_id', wsId); if (jobId) qb = qb.eq('id', jobId);
  const [job] = await q(qb); if (!job) return null;
  const got = await q(sb().from('finder_jobs').update({ status: 'searching', claimed_at: now.toISOString(), attempts: job.attempts + 1 }).eq('id', job.id).eq('status', 'queued').select('*'));
  return got && got[0] ? got[0] : null;
}
async function crawlBatch(deadline, wsId, jobId, n = 10) {
  await q(sb().from('finder_results').update({ crawl_status: 'pending' }).eq('crawl_status', 'running').lt('claimed_at', new Date(Date.now() - 180e3).toISOString()));
  let qb = sb().from('finder_results').select('id,job_id,website,phone,email,emails').eq('crawl_status', 'pending').order('created_at', { ascending: true }).limit(n);
  if (wsId) qb = qb.eq('ws_id', wsId); if (jobId) qb = qb.eq('job_id', jobId);
  const cand = await q(qb); const mine = [];
  for (const r of cand) { const got = await q(sb().from('finder_results').update({ crawl_status: 'running', claimed_at: new Date().toISOString() }).eq('id', r.id).eq('crawl_status', 'pending').select('id')); if (got && got.length) mine.push(r); }
  const jobs = new Set();
  await Promise.all(mine.map(async r => {
    jobs.add(r.job_id);
    const patch = { crawled_at: new Date().toISOString(), claimed_at: null };
    try {
      if (deadline - Date.now() < 4000) { patch.crawl_status = 'pending'; }
      else {
        const res = await crawlSite(r.website, deadline - 1000);
        const emails = rankEmails([...new Set([...(r.emails || []), ...res.emails])], r.website).slice(0, 10);
        Object.assign(patch, { crawl_status: 'done', crawl_error: null, emails, email: emails[0] || null, socials: res.socials || {} });
        if (!r.phone && res.phone) patch.phone = res.phone.slice(0, 60);
        if (res.contact) Object.assign(patch, { contact_first: res.contact.first, contact_last: res.contact.last, contact_role: res.contact.role });
      }
    } catch (e) { Object.assign(patch, { crawl_status: 'error', crawl_error: String(e.name === 'TimeoutError' ? 'Website antwortet nicht' : e.message).slice(0, 160) }); }
    await q(sb().from('finder_results').update(patch).eq('id', r.id));
  }));
  for (const j of jobs) await updateCounts(j);
  return mine.length;
}
async function process_(deadline, wsId, jobId) {
  const out = { searched: 0, crawled: 0 };
  const job = await claimSearch(wsId, jobId);
  if (job) {
    try { out.searched = await runSearch(job, deadline); }
    catch (e) {
      const final = e.final || job.attempts >= 6;
      await q(sb().from('finder_jobs').update(final ? { status: 'error', error: String(e.message).slice(0, 200), claimed_at: null } : { status: 'queued', error: String(e.message).slice(0, 200), claimed_at: null, next_try_at: new Date(Date.now() + 30e3 * 2 ** Math.min(job.attempts, 4)).toISOString() }).eq('id', job.id));
    }
  }
  while (deadline - Date.now() > 9000) { const n = await crawlBatch(deadline, wsId, jobId); out.crawled += n; if (!n) break; }
  return out;
}

module.exports = { CATS, catByKey, sources, geocode, process: process_, crawlSite, safeFetch, extractEmails, extractContact, extractSocials, contactLinks, rankEmails, privateIp, normUrl, updateCounts, setDb, setFetch, setLookup, cleanKw, robotsAllows };
