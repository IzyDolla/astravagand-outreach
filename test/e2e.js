const assert = require('assert');
const { SMTPServer } = require('smtp-server');
const sink = []; new SMTPServer({ authOptional: false, allowInsecureAuth: true, disabledCommands: ['STARTTLS'], onAuth(a, s, cb) { cb(null, { user: a.username }); }, onData(st, s, cb) { let d = ''; st.on('data', c => d += c); st.on('end', () => { sink.push(d); cb(); }); } }).listen(2526, '127.0.0.1');
process.env.PORT = 3301;
const { fake, C } = require('./server');
const { fakeToken } = require('./fake-supabase');
const B = 'http://127.0.0.1:3301';
let TOKEN = null;
async function call(method, path, body, extra = {}) {
  const h = { 'X-AO': '1', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(TOKEN ? { Authorization: 'Bearer ' + TOKEN } : {}), ...extra };
  const r = await fetch(B + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
  const ct = r.headers.get('content-type') || ''; return { status: r.status, j: ct.includes('json') ? await r.json() : await r.text() };
}
const ok = (name, cond) => { console.log((cond ? '  ✓ ' : '  ✗ ') + name); if (!cond) process.exitCode = 1; };
(async () => {
  await new Promise(r => setTimeout(r, 300));
  let r = await call('GET', '/api/state'); ok('state ohne Login → 401', r.status === 401);
  r = await call('GET', '/api/auth/status'); ok('setupNeeded', r.j.setupNeeded === true);
  r = await call('POST', '/api/setup', { token: 'falsch', email: 'izy@astravagand.com', password: 'Mein Kaffee um 7 ist heilig!' }); ok('Setup mit falschem Code abgelehnt', r.status === 403);
  r = await call('POST', '/api/setup', { token: 'SETUP-123', email: 'izy@astravagand.com', password: 'kurz' }); ok('schwaches Passwort abgelehnt', r.status === 400);
  r = await call('POST', '/api/setup', { token: 'SETUP-123', company: 'Astravagand', name: 'Izy Sinani', email: 'izy@astravagand.com', password: 'Mein Kaffee um 7 ist heilig!' }); ok('Setup ok', r.j.ok);
  r = await call('POST', '/api/setup', { token: 'SETUP-123', email: 'x@y.at', password: 'Ein ganz anderes Passwort!' }); ok('zweites Setup blockiert', r.status === 409);
  const owner = [...fake.users.values()][0]; TOKEN = fakeToken(owner.id);
  r = await call('GET', '/api/state'); ok('state mit Login', r.j.ok && r.j.workspace.name === 'Astravagand' && r.j.templates.length === 16);
  r = await call('POST', '/api/workspaces', { name: 'x' }, { 'X-AO': '' }); ok('ohne X-AO → 403', r.status === 403);
  // fremder Benutzer ohne Workspace
  fake.db.allowed_signups.push({ email: 'fremd@x.at' }); const f = (await fake.auth.admin.createUser({ email: 'fremd@x.at', password: 'x' })).data.user;
  const save = TOKEN; TOKEN = fakeToken(f.id); r = await call('GET', '/api/state'); ok('Benutzer ohne Workspace → 403', r.status === 403); TOKEN = save;
  // MFA
  owner.factors = [{ status: 'verified' }]; r = await call('GET', '/api/state'); ok('2FA aktiv + aal1 → 401 mfa', r.status === 401 && r.j.mfa);
  TOKEN = fakeToken(owner.id, 'aal2'); r = await call('GET', '/api/state'); ok('2FA aktiv + aal2 → ok', r.j.ok);
  // Konto
  r = await call('POST', '/api/accounts', { provider: 'other', email: 'izy@astravagand-mail.com', name: 'Izy Sinani', password: 'abcd efgh', smtpHost: '127.0.0.1', smtpPort: 2526, imapHost: '' }); ok('Konto verbinden', r.j.ok); const acc = r.j.id;
  ok('App-Passwort verschlüsselt gespeichert', fake.db.accounts[0].pass_enc.startsWith('v1:') && !fake.db.accounts[0].pass_enc.includes('abcd'));
  r = await call('GET', '/api/state'); ok('state ohne pass_enc', !JSON.stringify(r.j).includes('pass_enc') && !JSON.stringify(r.j).includes('v1:'));
  // Import
  r = await call('POST', '/api/import', { listName: 'Reinigung Linz', fileName: 't.csv', rows: [
    { email: 'm.huber@huber-reinigung.at', first: 'Martin', company: 'Huber Reinigung GmbH', city: 'Linz', phone: '+43 1' },
    { email: 'office@glanzwerk.at', company: 'Glanzwerk', city: 'Leonding' }, { email: 'kaputt@' }, { email: 'm.huber@huber-reinigung.at' },
    { email: 's.kollege@huber-reinigung.at', first: 'Sepp', company: '=HYPERLINK("x")' }, { email: 'bounce@nirgendwo.at', first: 'Bo' } ] });
  ok('Import: 4 ok, 1 ungültig, 1 Duplikat', r.j.imported === 4 && r.j.invalid === 1 && r.j.duplicates === 1); const list = r.j.listId;
  r = await call('GET', '/api/leads?list=all'); ok('Leads-Liste', r.j.total === 4);
  // Kampagne
  r = await call('POST', '/api/campaigns', { name: 'Test', lists: [list] }); const camp = r.j.id; ok('Kampagne erstellt', r.j.ok);
  ok('neue Kampagne startet mit fertiger Vorlage', fake.db.campaigns.find(c => c.id === camp).steps[0].body.startsWith('{Anrede},'));
  await call('PATCH', `/api/campaigns/${camp}`, { steps: [{ subject: 'x', body: 'Hallo {Vorname},\n\n[Dein Angebot in 2–3 Sätzen]' }] });
  r = await call('POST', `/api/campaigns/${camp}/start`); ok('Start mit Platzhalter blockiert', !r.j.ok && r.j.checks.some(c => /Platzhalter/.test(c.text)));
  r = await call('PATCH', `/api/campaigns/${camp}`, { steps: [{ subject: 'Frage zu {Firma}', body: 'Hallo {Vorname},\n\nTest.\n\n{Absender}' }, { wait: 2, thread: true, body: 'Hallo {Vorname}, nachgehakt.' }], schedule: { days: [1, 1, 1, 1, 1, 1, 1], from: '00:00', to: '23:59', minGap: 0, maxGap: 0 } });
  r = await call('POST', `/api/campaigns/${camp}/start`); ok('Start ok', r.j.ok); ok('4 Enrollments', fake.db.enrollments.length === 4);
  // Cron
  r = await call('POST', '/api/cron', {}, { 'x-cron-secret': 'falsch' }); ok('Cron mit falschem Secret → 401', r.status === 401);
  for (let i = 0; i < 4; i++) { r = await call('POST', '/api/cron', {}, { 'x-cron-secret': 'cron-test' }); }
  await new Promise(r => setTimeout(r, 300));
  ok(`4 Mails verschickt (Warm-up-Limit 6)`, sink.length === 4);
  r = await call('GET', '/api/live'); ok('Live-Versand: 4 gesendet sichtbar', r.j.ok && r.j.sentToday === 4 && r.j.sent.length === 4 && r.j.sent[0].lead && r.j.sent[0].subject.length > 0);
  ok('Live-Versand: nächster Versand geplant', Array.isArray(r.j.next) && r.j.next.length > 0);
  // Signatur + Testmail als HTML
  r = await call('POST', '/api/signature', { html: '<b>{Name}</b><br>Astravagand<script>alert(1)</script><img src="https://astravagand.com/logo.png" onerror="x()">' });
  ok('Signatur gespeichert + bereinigt', r.j.ok && !/script|onerror/.test(r.j.html) && r.j.html.includes('<b>{Name}</b>'));
  const before = sink.length; const stx = await call('GET', '/api/state'); const accId = (stx.j.accounts[0] || {}).id;
  r = await call('POST', '/api/test-send', { accountId: accId, to: 'izy@astravagand.com', subject: '[TEST] Sig', text: 'Hallo\nTest' });
  await new Promise(r => setTimeout(r, 300));
  const tm = sink.slice(before).join('\n');
  ok('Testmail mit HTML-Signatur', r.j.ok && /text\/html/i.test(tm) && tm.includes('Izy Sinani') && !/<script/i.test(tm));
  r = await call('GET', '/api/ai'); ok('KI-Status ohne Key', r.j.ok && r.j.configured === false && r.j.usage.calls === 0);
  r = await call('GET', '/api/ai/icebreakers'); ok('KI-Einstiege Status', r.j.ok && typeof r.j.withWebsite === 'number');
  r = await call('POST', '/api/ai/icebreakers', {}); ok('KI-Einstiege ohne Key → 503 mit Hinweis', r.status === 503 && /OPENAI_KEY/.test(r.j.error));
  const g = sink.find(m => m.includes('office@glanzwerk.at')); ok('fehlender Vorname → „Sehr geehrte Damen und Herren,“', /Sehr geehrte Damen und Herren,\r?\n/.test(g)); ok('Fußzeile + List-Unsubscribe', g.includes('Abmelden') && /List-Unsubscribe/i.test(g));
  // Antwort
  const hub = fake.db.sends.find(s => fake.db.leads.find(l => l.id === s.lead_id).email === 'm.huber@huber-reinigung.at');
  const A = fake.db.accounts[0];
  await C.handleIncoming(A, { messageId: '<r1@x>', from: { value: [{ address: 'm.huber@huber-reinigung.at', name: 'Martin Huber' }] }, subject: 'Re: Frage', text: 'Ja, gerne – rufen Sie mich an.\n\nAm 1.1. schrieb X:\n> alt', inReplyTo: hub.message_id, date: new Date() });
  await C.handleIncoming(A, { messageId: '<r1@x>', from: { value: [{ address: 'm.huber@huber-reinigung.at' }] }, subject: 'Re: Frage', text: 'doppelt', inReplyTo: hub.message_id });
  ok('Antwort erkannt, Duplikat ignoriert', fake.db.inbox.length === 1 && fake.db.inbox[0].cat === 'interested' && !fake.db.inbox[0].text.includes('alt'));
  const sepp = fake.db.enrollments.find(e => fake.db.leads.find(l => l.id === e.lead_id).email.startsWith('s.kollege'));
  ok('Kollege derselben Firma gestoppt', sepp.status === 'stopped');
  await C.handleIncoming(A, { messageId: '<b1@x>', from: { value: [{ address: 'MAILER-DAEMON@x.at' }] }, subject: 'Undeliverable', text: 'bounce@nirgendwo.at unknown' });
  ok('Bounce → Sperrliste', fake.db.blocklist.some(b => b.value === 'bounce@nirgendwo.at'));
  await C.handleIncoming(A, { messageId: '<o1@x>', from: { value: [{ address: 'office@glanzwerk.at' }] }, subject: 'Automatische Antwort', text: 'Bin weg', headers: new Map([['auto-submitted', 'auto-replied']]) });
  const gl = fake.db.enrollments.find(e => fake.db.leads.find(l => l.id === e.lead_id).email === 'office@glanzwerk.at');
  ok('Abwesenheit stoppt nicht', gl.status === 'active');
  // Follow-up fällig machen
  gl.next_at = new Date(Date.now() - 1000).toISOString(); A.next_send_at = null;
  await call('POST', '/api/cron', {}, { 'x-cron-secret': 'cron-test' }); await new Promise(r => setTimeout(r, 300));
  const fu = sink[sink.length - 1]; ok('Follow-up im selben Verlauf', /In-Reply-To/i.test(fu) && /Subject: Re: Frage zu Glanzwerk/.test(fu));
  // Posteingang, Antwort senden
  r = await call('GET', '/api/inbox?cat=all'); ok('Posteingang', r.j.items.length === 1 && r.j.items[0].from === 'm.huber@huber-reinigung.at');
  r = await call('POST', `/api/inbox/${r.j.items[0].id}/reply`, { text: 'Danke! Dienstag?' }); ok('Antwort senden', r.j.ok && /In-Reply-To: <r1@x>/i.test(sink[sink.length - 1]));
  // Export + CSV-Injection
  r = await call('GET', `/api/export?campaign=${camp}&filter=call`); ok('Anrufliste nur Interessierte/Done', typeof r.j === 'string' && r.j.includes('Huber') && !r.j.includes('bounce@'));
  r = await call('GET', '/api/export?list=all'); ok('CSV-Injection entschärft', r.j.includes(`"'=HYPERLINK(""x"")"`));
  // Zustand / Statistik
  r = await call('GET', '/api/state'); const cs = r.j.campaigns[0].stats; ok('Statistik', cs.contacted === 4 && cs.replies === 1 && cs.bounces === 1 && cs.positive === 1 && cs.steps[1].sent === 1);
  ok('KPI', r.j.kpi.sentToday === 5 && r.j.kpi.totalSent === 5);
  // fremde IDs (Workspace-Isolation)
  r = await call('POST', '/api/workspaces', { name: 'Kunde B' }); r = await call('GET', '/api/state'); ok('Workspace gewechselt', r.j.workspace.name === 'Kunde B');
  r = await call('GET', `/api/campaigns/${camp}/leads`); ok('Kampagne aus anderem Workspace → 404', r.status === 404);
  r = await call('DELETE', `/api/accounts/${acc}`); ok('Konto aus anderem Workspace löschen → 404', r.status === 404 && fake.db.accounts.length === 1);
  r = await call('GET', '/api/leads/not-a-uuid'); ok('ungültige ID → 400', r.status === 400);
  // Benutzer
  r = await call('POST', '/api/auth/users', { name: 'Team', email: 'team@astravagand.com', password: 'Grüne Bananen fliegen nachts 42' }); ok('Benutzer anlegen', r.j.ok);
  const mem = [...fake.users.values()].find(u => u.email === 'team@astravagand.com'); const ot = TOKEN; TOKEN = fakeToken(mem.id);
  r = await call('POST', '/api/auth/users', { email: 'z@z.at', password: 'Grüne Bananen fliegen nachts 43' }); ok('Mitglied darf keine Benutzer anlegen', r.status === 403);
  TOKEN = ot; r = await call('GET', '/api/auth/security'); ok('Sicherheit-Seite', r.j.ok && r.j.users.length === 2);
  console.log(process.exitCode ? '\nFEHLER' : '\nALLES OK'); process.exit(process.exitCode || 0);
})().catch(e => { console.error(e); process.exit(1); });
