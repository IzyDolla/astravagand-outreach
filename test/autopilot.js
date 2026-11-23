// Automodus Ende-zu-Ende: Anlegen → Suche → Übernahme ohne Dubletten → Personalisierung → Freigabe → Versand → Follow-up → Stopp → Bremsen → Nachsuchen
process.env.OPENAI_KEY = 'sk-test';
const { SMTPServer } = require('smtp-server');
const sink = []; new SMTPServer({ authOptional: false, allowInsecureAuth: true, disabledCommands: ['STARTTLS'], onAuth(a, s, cb) { cb(null, { user: a.username }); }, onData(st, s, cb) { let d = ''; st.on('data', c => d += c); st.on('end', () => { sink.push(d); cb(); }); } }).listen(2527, '127.0.0.1');
process.env.PORT = 3305;
const { fake, C } = require('./server');
const { fakeToken } = require('./fake-supabase');
const AI = require('../lib/ai'), AP = require('../lib/autopilot');
const B = 'http://127.0.0.1:3305';
let TOKEN = null, bad = 0, good = 0;
const realFetch = global.fetch;
let aiCalls = 0, aiMode = 'ok';
global.fetch = async (url, opts) => {
  if (!String(url).includes('api.openai.com')) return realFetch(url, opts);
  aiCalls++;
  const b = JSON.parse(opts.body), sys = b.messages[0].content;
  let content = '{}';
  if (/Kaltakquise-Sequenz (an|für) EINE/.test(sys)) {
    const crit = aiMode === 'critic' && aiCalls % 2 === 1;
    content = JSON.stringify({ steps: [
      { subject: 'Kurz zu Ihren Terminen', body: `{Anrede},\n\n${crit ? 'Auf Ihrer Website fehlt eine Online-Buchung.' : 'Sie betreuen Kunden in Wien seit vielen Jahren.'}\n\nWie laufen bei Ihnen eigentlich Terminanfragen – eher telefonisch?\n\nBeste Grüße\n{Absender}` },
      { subject: '', body: '{Anrede},\n\nkurz nachgehakt zu meiner Nachricht – PERSOENLICHES FOLLOW-UP.\n\nBeste Grüße\n{Absender}' },
      { subject: '', body: '{Anrede},\n\ndas ist meine letzte Nachricht.\n\nAlles Gute\n{Absender}' }] });
  }
  return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }], usage: { prompt_tokens: 10, completion_tokens: 10 } }) };
};
async function call(method, path, body) {
  const r = await realFetch(B + path, { method, headers: { 'X-AO': '1', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(TOKEN ? { Authorization: 'Bearer ' + TOKEN } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, j: await r.json() };
}
const ok = (n, c) => { console.log((c ? '  ✓ ' : '  ✗ ') + n); if (c) good++; else bad++; };
const cron = () => call('POST', '/api/cron', {}).catch(() => null);
const cronRaw = () => realFetch(B + '/api/cron', { method: 'POST', headers: { 'x-cron-secret': 'cron-test', 'Content-Type': 'application/json' }, body: '{}' }).then(r => r.json());
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await wait(300);
  await call('POST', '/api/setup', { token: 'SETUP-123', company: 'Astravagand', name: 'Isah Sinani', email: 'izy@astravagand.com', password: 'Mein Kaffee um 7 ist heilig!' });
  TOKEN = fakeToken([...fake.users.values()][0].id);
  let r = await call('POST', '/api/accounts', { provider: 'other', email: 'izy@astravagand-mail.com', name: 'Isah Sinani', password: 'abcd efgh', smtpHost: '127.0.0.1', smtpPort: 2527, imapHost: '' });
  ok('Konto verbunden', r.j.ok);
  const ws = fake.db.workspaces[0].id;
  // bestehender Lead in anderer Liste (für die Dubletten-Prüfung)
  r = await call('POST', '/api/import', { listName: 'Alt', fileName: 'a.csv', rows: [{ email: 'office@existing.at', company: 'Existing GmbH' }, { email: 'chef@schon-da.at', company: 'Schon da' }] });
  ok('Altliste importiert', r.j.imported === 2);

  // 1) Automodus anlegen + starten
  r = await call('POST', '/api/autopilots', { category: 'plumber', locations: 'Wien\nWien Umgebung', radius: 10, source: 'osm', start: true,
    settings: { dailyNew: 2, bufferDays: 2, reviewFirst: 1, personalize: true, schedule: { days: [1, 1, 1, 1, 1, 1, 1], allDay: true } } });
  ok('Automodus angelegt + gestartet', r.j.ok && r.j.autopilot.status === 'active');
  const apId = r.j.autopilot.id;
  let ap = fake.db.autopilots.find(x => x.id === apId);
  const camp = fake.db.campaigns.find(c => c.id === ap.campaign_id);
  ok('Kampagne + Liste angelegt (aktiv, personalisiert, Freigabe 1)', camp && camp.status === 'active' && camp.personalize === true && camp.review_first === 1 && camp.lists[0] === ap.list_id);
  ok('Kampagne nutzt Branchen-Vorlage Handwerk', /Baustelle/.test(camp.steps[0].body));
  let jobs = fake.db.finder_jobs.filter(j => j.autopilot_id === apId);
  ok('erste Suche gestartet (Wien)', jobs.length === 1 && jobs[0].location === 'Wien' && jobs[0].status === 'queued');
  ok('Ort steht auf „läuft“', ap.locations[0].state === 'running');

  // 2) Suche fertig: Ergebnisse simulieren
  const job = jobs[0]; Object.assign(job, { status: 'done', total: 6, with_email: 5 });
  const ins = { people: [{ anrede: 'Herr', first: 'Karl', last: 'Huber', role: 'Geschäftsführer' }], target: 0, profile: 'Installateur in Wien.', facts: ['seit 1990'], angles: [{ title: 'Online-Termine', why: 'Spart Telefonate.' }], signals: [], at: new Date().toISOString() };
  const mk = o => fake.db.finder_results.push({ id: require('crypto').randomUUID(), job_id: job.id, ws_id: ws, name: 'X', category: 'Installateur', city: 'Wien', crawl_status: 'done', emails: [], socials: {}, imported_at: null, created_at: new Date().toISOString(), ...o });
  mk({ name: 'Huber Installationen', email: 'office@huber-inst.at', website: 'https://huber-inst.at', contact_first: 'Karl', contact_last: 'Huber', ai_status: 'done', insights: ins, icebreaker: 'Seit 1990 installieren Sie in Wien Heizungen und Bäder.' });
  mk({ name: 'Bad & Wärme', email: 'office@bad-waerme.at', website: 'https://bad-waerme.at', ai_status: 'done', insights: { ...ins, people: [], target: -1 } });
  mk({ name: 'Noch in Prüfung', email: 'office@pruefung.at', website: 'https://pruefung.at', ai_status: 'queued', ai_at: new Date().toISOString() });
  mk({ name: 'Existing Filiale', email: 'info@existing.at', website: 'https://existing.at', ai_status: 'done', insights: ins });
  mk({ name: 'Schon da', email: 'chef@schon-da.at', website: 'https://schon-da.at', ai_status: 'done', insights: ins });
  mk({ name: 'Ohne Mail', email: null, website: 'https://ohne.at', ai_status: 'done' });
  await AP.run(Date.now() + 10000, apId);
  ap = fake.db.autopilots.find(x => x.id === apId);
  const leads = fake.db.leads.filter(l => l.list_id === ap.list_id);
  ok('2 neue Firmen übernommen (Dubletten nach Adresse + Domain übersprungen, in Prüfung wartet)', leads.length === 2);
  const huber = leads.find(l => l.email === 'office@huber-inst.at');
  ok('Firmencheck übernommen: Name, Herr, Einstieg', huber && huber.first === 'Karl' && huber.salutation === 'Herr' && huber.icebreaker && huber.ice_status === 'done');
  ok('Anrede „Guten Tag Herr Huber“', C.render('{Anrede},', huber, {}, {}) === 'Guten Tag Herr Huber,');
  ok('Anrede-Stil „Hallo Herr Huber“', C.render('{Anrede},', huber, {}, { greeting: 'hallo' }) === 'Hallo Herr Huber,');
  ok('übersprungene als erledigt markiert', fake.db.finder_results.filter(x => x.job_id === job.id && x.imported_at).length === 4);
  ok('Ort Wien erledigt', ap.locations[0].state === 'done' && ap.locations[0].found === 6);
  jobs = fake.db.finder_jobs.filter(j => j.autopilot_id === apId);
  ok('Vorrat zu klein → nächste Suche (Wien Umgebung)', jobs.length === 2 && jobs[1].location === 'Wien Umgebung');
  ok('Protokoll geschrieben', ap.log.some(l => /2 neue Firmen übernommen/.test(l.text)));
  let ens = fake.db.enrollments.filter(e => e.campaign_id === camp.id);
  ok('2 Leads in der Kampagne', ens.length === 2 && ens.every(e => e.status === 'pending'));

  // 3) Vor der Personalisierung wird nichts gesendet
  fake.db.accounts.forEach(a => { a.next_send_at = null; });
  await cronRaw(); await wait(300);
  ok('ohne fertige Personalisierung kein Versand', sink.length === 0);

  // 4) Personalisierung (die Kritik-Formulierung wird verworfen und neu geschrieben)
  aiMode = 'critic';
  await AI.processPersonalize(Date.now() + 60000, ws, 5000);
  ens = fake.db.enrollments.filter(e => e.campaign_id === camp.id);
  ok('beide personalisiert', ens.every(e => e.pers_status === 'done' && e.personal && e.personal.steps.length === 3));
  ok('kritischer Entwurf („fehlt“) wurde verworfen', ens.every(e => !/fehlt/.test(e.personal.steps[0].body)));
  ok('erste Mail wartet auf Freigabe, zweite nicht', ens.filter(e => e.review === 'pending').length === 1 && ens.filter(e => !e.review).length === 1);
  aiMode = 'ok';

  // 5) Freigabe-Liste
  r = await call('GET', `/api/review?autopilot=${apId}`);
  ok('Freigabe-Liste mit Vorschau', r.j.ok && r.j.total === 1 && r.j.items[0].steps[0].preview.body.startsWith(r.j.items[0].lead.name ? 'Guten Tag' : 'Sehr geehrte'));
  const revId = r.j.items[0].id;

  // 6) Versand: nur die freigegebene / freigabefreie Mail geht raus
  fake.db.accounts.forEach(a => { a.next_send_at = null; });
  await cronRaw(); await wait(400);
  ok('1 Mail verschickt (die ohne Freigabe-Pflicht)', sink.length === 1);
  ok('verschickte Mail ist personalisiert', /Kurz zu Ihren Terminen/.test(sink[0]) && /Sie betreuen Kunden in Wien/.test(sink[0]));
  const pendingOne = fake.db.enrollments.find(e => e.id === revId);
  ok('Mail mit offener Freigabe wurde nicht gesendet', pendingOne.status === 'pending');

  // 7) Freigeben mit Änderung → wird gesendet
  const edited = pendingOne.personal.steps.map((s, i) => i === 0 ? { ...s, body: s.body.replace('Sie betreuen', 'BEARBEITET: Sie betreuen') } : s);
  r = await call('POST', `/api/review/${revId}`, { action: 'approve', steps: edited });
  ok('Freigabe gespeichert', r.j.ok && fake.db.enrollments.find(e => e.id === revId).review === 'ok');
  fake.db.accounts.forEach(a => { a.next_send_at = null; });
  await cronRaw(); await wait(400);
  ok('freigegebene Mail mit Änderung verschickt', sink.length === 2 && /BEARBEITET/.test(sink[1]));
  ok('Anrede in der Mail: „Guten Tag Herr Huber“ bzw. neutral', sink.some(m => /Guten Tag Herr Huber,/.test(m)) && sink.some(m => /Sehr geehrte Damen und Herren,/.test(m)));

  // 8) Follow-up: im selben Verlauf, mit dem wirklich gesendeten Betreff, persönlicher Text
  const e1 = fake.db.enrollments.find(e => e.campaign_id === camp.id && e.lead_id === huber.id);
  ok('nach Mail 1: Follow-up geplant', e1.status === 'active' && e1.step === 1 && e1.next_at);
  e1.personal.steps[0].subject = 'GEÄNDERTER BETREFF';                       // späteres Ändern darf den Verlauf nicht brechen
  e1.next_at = new Date(Date.now() - 60e3).toISOString();
  fake.db.accounts.forEach(a => { a.next_send_at = null; });
  const before = sink.length;
  await cronRaw(); await wait(400);
  const fu = sink.slice(before).join('\n');
  ok('Follow-up verschickt', sink.length === before + 1);
  ok('Follow-up: Betreff „Re: <tatsächlich gesendeter Betreff>“', /Subject: Re: Kurz zu Ihren Terminen/.test(fu) && !/GEÄNDERTER/.test(fu));
  ok('Follow-up: In-Reply-To gesetzt', /In-Reply-To: </i.test(fu));
  ok('Follow-up: persönlicher Text', /PERSOENLICHES FOLLOW-UP/.test(fu));
  ok('Follow-up 2 geplant', fake.db.enrollments.find(e => e.id === e1.id).step === 2);

  // 9) Antwort stoppt die Sequenz
  const other = fake.db.enrollments.find(e => e.campaign_id === camp.id && e.lead_id !== huber.id);
  const sentMsg = fake.db.sends.find(s => s.enroll_id === other.id);
  await C.handleIncoming(fake.db.accounts[0], { messageId: '<rep1@x>', from: { value: [{ address: 'office@bad-waerme.at' }] }, subject: 'Re: Kurz', text: 'Interessant, rufen Sie an.', inReplyTo: sentMsg.message_id });
  other.next_at = new Date(Date.now() - 60e3).toISOString();
  fake.db.accounts.forEach(a => { a.next_send_at = null; });
  const before2 = sink.length;
  await cronRaw(); await wait(300);
  ok('nach Antwort kein Follow-up mehr', fake.db.enrollments.find(e => e.id === other.id).status === 'replied' && sink.slice(before2).every(m => !/bad-waerme/.test(m)));

  // 9b) Einstellungen speichern ohne Vorlagenwechsel: Personalisierung bleibt erhalten
  const persBefore = JSON.stringify(fake.db.enrollments.find(x => x.id === e1.id).personal);
  r = await call('PATCH', `/api/autopilots/${apId}`, { settings: { dailyNew: 3, templateId: null, personalize: true, reviewFirst: 1, accounts: [fake.db.accounts[0].id] } });
  ok('Speichern ohne Vorlagenwechsel lässt Personalisierung stehen', r.j.ok && JSON.stringify(fake.db.enrollments.find(x => x.id === e1.id).personal) === persBefore && fake.db.campaigns.find(c => c.id === camp.id).daily_new === 3);
  // 9c) Konto aus der Kampagne genommen: Follow-up geht trotzdem vom selben Konto
  const acc1 = fake.db.accounts[0].id;
  const c9 = fake.db.campaigns.find(c => c.id === camp.id); const keepAccs = c9.accounts; c9.accounts = [];
  const e9 = fake.db.enrollments.find(x => x.id === e1.id); e9.next_at = new Date(Date.now() - 60e3).toISOString();
  fake.db.accounts.forEach(a => { a.next_send_at = null; });
  const b9 = sink.length; await cronRaw(); await wait(400);
  ok('Follow-up vom ursprünglichen Konto, obwohl es nicht mehr in der Kampagne ist', sink.length === b9 + 1 && /Subject: Re: Kurz zu Ihren Terminen/.test(sink[sink.length - 1]) && fake.db.enrollments.find(x => x.id === e1.id).account_id === acc1);
  c9.accounts = keepAccs;
  // 9d) Alle Leads fertig → Automodus-Kampagne bleibt aktiv (es kommen neue)
  const e9b = fake.db.enrollments.find(x => x.id === e1.id);
  ok('Sequenz nach letzter Mail beendet', e9b.status === 'done');
  ok('Automodus-Kampagne wird nicht auf „fertig“ gesetzt', fake.db.campaigns.find(c => c.id === camp.id).status === 'active');
  // 9e) Sperre: läuft gerade ein Durchgang, wird kein zweiter gestartet
  ap = fake.db.autopilots.find(x => x.id === apId);
  ap.lock_until = new Date(Date.now() + 60e3).toISOString(); const jobsBefore = fake.db.finder_jobs.length, logBefore = ap.log.length;
  const rr = await AP.run(Date.now() + 5000, apId);
  ok('Sperre verhindert doppelten Durchgang', rr.autopilots === 0 && fake.db.finder_jobs.length === jobsBefore);
  ap.lock_until = '1970-01-01T00:00:00.000Z';

  // 10) Kennzahlen + Übersicht
  r = await call('GET', '/api/autopilots');
  const st = r.j.autopilots[0].stats;
  ok('Kennzahlen', r.j.ok && st.imported === 2 && st.sentTotal === 4 && st.replied === 1 && st.found === 6);

  // 11) Nachsuchen: alle Orte durch → Umkreis erweitern → danach Hinweis „weitere Orte“
  ap = fake.db.autopilots.find(x => x.id === apId);
  fake.db.finder_jobs.filter(j => j.autopilot_id === apId).forEach(j => { j.status = 'done'; });
  ap.next_run_at = new Date(0).toISOString();
  await AP.run(Date.now() + 10000, apId);
  ap = fake.db.autopilots.find(x => x.id === apId);
  ok('Umkreis verdoppelt und neue Runde gestartet', ap.radius_km === 20 && /Umkreis auf 20 km/.test(ap.log.map(l => l.text).join('|')));
  for (let i = 0; i < 3; i++) { fake.db.finder_jobs.filter(j => j.autopilot_id === apId).forEach(j => { j.status = 'done'; }); await AP.run(Date.now() + 10000, apId); }
  ap = fake.db.autopilots.find(x => x.id === apId);
  ok('danach Hinweis: weitere Orte hinzufügen', ap.state.needMore === true && ap.log.some(l => /weitere Orte/.test(l.text)));
  r = await call('PATCH', `/api/autopilots/${apId}`, { locations: 'Wien\nWien Umgebung\nMödling' });
  ok('Ort hinzufügen setzt fort', r.j.ok && r.j.autopilot.locations.length === 3 && r.j.autopilot.state.needMore === false);

  // 11b) Ort mit nur 60 Google-Treffern (alte Suche) wird gründlich in Teilgebieten nachgesucht
  ap = fake.db.autopilots.find(x => x.id === apId);
  fake.db.finder_jobs.filter(j => j.autopilot_id === apId).forEach(j => { j.status = 'done'; });
  const gj = { id: require('crypto').randomUUID(), ws_id: ws, autopilot_id: apId, source: 'google', location: 'Graz', status: 'done', total: 59, with_email: 40, cursor: null, created_at: new Date().toISOString() };
  fake.db.finder_jobs.push(gj);
  ap.locations.push({ name: 'Graz', state: 'done', job_id: gj.id }); ap.state.needMore = false; ap.settings = { ...ap.settings, goal: 500 };
  ap.locations.forEach(l => { if (l.name !== 'Graz') l.state = 'done'; });
  await AP.run(Date.now() + 10000, apId); await AP.run(Date.now() + 10000, apId);
  ap = fake.db.autopilots.find(x => x.id === apId);
  const deep = fake.db.finder_jobs.filter(j => j.autopilot_id === apId && j.location === 'Graz' && j.id !== gj.id);
  ok('Ort mit 59 Google-Treffern wird gründlich nachgesucht (mehr als 60)', deep.length === 1 && deep[0].max_results > 60 && ap.log.some(l => /gründlich/.test(l.text)));

  // 12) Bremse: hohe Bounce-Rate pausiert alles
  for (let i = 0; i < 30; i++) fake.db.sends.push({ id: require('crypto').randomUUID(), ws_id: ws, campaign_id: camp.id, step: 0, test: false, at: new Date().toISOString() });
  for (let i = 0; i < 3; i++) fake.db.enrollments.push({ id: require('crypto').randomUUID(), ws_id: ws, campaign_id: camp.id, lead_id: require('crypto').randomUUID(), status: 'bounced', step: 1, history: [] });
  await AP.run(Date.now() + 10000, apId);
  ap = fake.db.autopilots.find(x => x.id === apId);
  ok('Bremse: Bounce-Rate → Automodus + Kampagne pausiert', ap.status === 'paused' && fake.db.campaigns.find(c => c.id === camp.id).status === 'paused' && ap.log.some(l => /Bounce-Rate/.test(l.text)));

  // 13) Pausieren/Fortsetzen + Löschen lässt Kampagne und Verlauf stehen
  r = await call('DELETE', `/api/autopilots/${apId}`);
  ok('Automodus gelöscht, Kampagne + Versandverlauf bleiben', r.j.ok && fake.db.campaigns.some(c => c.id === camp.id) && fake.db.sends.filter(s => s.campaign_id === camp.id).length >= 3);

  // 14) Prüfregeln der Personalisierung
  const tpl = [{ body: '{Anrede},\n\nText.\n\nGrüße\n{Absender}', subject: 'x' }];
  ok('Prüfregel: Kritik-Wort', AI.checkPersonal(tpl, [{ subject: 'a', body: '{Anrede},\n\nIhre Website ist veraltet.\n\nGrüße\n{Absender}' }]).length > 0);
  ok('Prüfregel: fehlende {Anrede}', AI.checkPersonal(tpl, [{ subject: 'a', body: 'Hallo,\n\nText.\n\nGrüße\n{Absender}' }]).length > 0);
  ok('Prüfregel: erfundener Platzhalter', AI.checkPersonal(tpl, [{ subject: 'a', body: '{Anrede},\n\n{Umsatz} Text.\n\nGrüße\n{Absender}' }]).length > 0);
  ok('Prüfregel: sauberer Text ok', AI.checkPersonal(tpl, [{ subject: 'a', body: '{Anrede},\n\nText. Wie machen Sie das?\n\nGrüße\n{Absender}' }]).length === 0);
  const tplH = [{ subject: 'x', body: '{Anrede},\n\n{Einstieg}\n\nim Handwerk klingelt das Telefon meistens genau dann, wenn man auf der Baustelle steht. Viele Kunden rufen dann einfach den nächsten Betrieb an.\n\nWir bauen für Betriebe wie {Firma} einen digitalen Assistenten, der Anrufe und Anfragen annimmt.\n\nWäre so etwas für Sie interessant?\n\nBeste Grüße\n{Absender}' }];
  const ctxH = 'Zertifizierter Elektromeisterbetrieb für Elektroinstallationen, Reparaturen, Wartung und Ladeinfrastruktur. Betreut Unternehmen, Wohnumfeld und öffentliche Einrichtungen. Anfragen außerhalb der Zeiten Wiederkehrende Fragen Wallbox Zählerschränke Tankstellentechnik';
  const lazy = '{Anrede},\n\nIhre Website stellt den Elektromeisterbetrieb mit Leistungen für Zählerschränke klar in den Mittelpunkt.\n\nIm Handwerk klingelt das Telefon meistens genau dann, wenn man auf der Baustelle steht. Viele Kunden rufen dann einfach den nächsten Betrieb an.\n\nWir bauen für Betriebe wie {Firma} einen digitalen Assistenten, der Anrufe und Anfragen annimmt.\n\nWäre so etwas für Sie interessant?\n\nBeste Grüße\n{Absender}';
  const errsLazy = AI.checkPersonal(tplH, [{ subject: 'a', body: lazy }], ctxH);
  ok('Prüfregel: Vorlage mit einem Satz davor wird abgelehnt', errsLazy.some(e => /wörtlich aus der Vorlage/.test(e)) && errsLazy.some(e => /Beschreibung der Website/.test(e)));
  const goodMail = '{Anrede},\n\nsie decken vom Zählerschrank bis zur Ladeinfrastruktur für Unternehmen und öffentliche Einrichtungen in Berlin ziemlich viel ab.\n\nGerade bei Wallboxen kommen oft dieselben Fragen zu Förderung und Ablauf. Bei Ihnen laufen Anfragen über Telefon und E-Mail – wie halten Sie das am Laufen, wenn Sie gerade beim Kunden sind?\n\nWir bauen für Betriebe wie {Firma} einen digitalen Assistenten, der solche Anfragen rund um die Uhr annimmt und Ihnen gesammelt schickt.\n\nWäre das für Sie interessant?\n\nBeste Grüße\n{Absender}';
  ok('Prüfregel: zugeschnittene Mail wird angenommen', AI.checkPersonal(tplH, [{ subject: 'Anfragen zur Ladeinfrastruktur', body: goodMail }], ctxH).length === 0);

  ok('Großschreibung: „Sie“ und Firmenname am Absatzanfang', AI.fixCase('{Anrede},\n\nsie betreuen.\n\nim Handwerk', 'X').startsWith('{Anrede},\n\nSie betreuen.\n\nIm Handwerk') && AI.fixCase('{Anrede},\n\npmw elektro plant.', 'Pmw Elektro GmbH').includes('Pmw Elektro plant') && AI.fixCase('{Anrede},\n\nbei Ihnen läuft viel.', 'X').includes('bei Ihnen'));
  console.log(`\nautopilot: ${good} ok, ${bad} fehlgeschlagen`); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
