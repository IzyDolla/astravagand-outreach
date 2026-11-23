// Test der Admin-Verbindung mit simulierter Google-API
const crypto = require('crypto'), assert = require('assert');
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
process.env.GOOGLE_SA_JSON = JSON.stringify({ type: 'service_account', client_email: 'mailer@proj.iam.gserviceaccount.com', client_id: '1234567890', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) });
process.env.GWS_DOMAINS = 'astravagand.com';
const sent = []; let inbox = [];
const realFetch = global.fetch;
global.fetch = async (url, opts = {}) => {
  url = String(url);
  const J = (o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { 'content-type': 'application/json' } });
  if (url.startsWith('https://oauth2.googleapis.com/token')) {
    const a = new URLSearchParams(opts.body).get('assertion'); const [h, b, sg] = a.split('.');
    const ok = crypto.createVerify('RSA-SHA256').update(h + '.' + b).verify(publicKey, Buffer.from(sg, 'base64url'));
    const cl = JSON.parse(Buffer.from(b, 'base64url'));
    if (!ok || cl.scope !== 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly') return J({ error: 'unauthorized_client' }, 401);
    if (cl.sub === 'gibtsnicht@astravagand.com') return J({ error: 'invalid_grant' }, 400);
    return J({ access_token: 'AT-' + cl.sub, expires_in: 3600 });
  }
  if (url.startsWith('https://gmail.googleapis.com/gmail/v1/users/me/')) {
    const who = String(opts.headers.Authorization).replace('Bearer AT-', ''); const path = url.split('/users/me/')[1];
    if (path === 'profile') return J({ emailAddress: who });
    if (path === 'messages/send') { const bj = JSON.parse(opts.body); if (bj.threadId === 'GONE') return { ok: false, status: 404, json: async () => ({ error: { message: 'Requested entity was not found.' } }) }; const raw = Buffer.from(bj.raw, 'base64url').toString(); const id = 'm' + sent.length; sent.push({ who, raw, id, threadId: bj.threadId || null }); return J({ id, threadId: bj.threadId || 't' + id }); }
    if (path.startsWith('messages/m') && path.includes('format=metadata')) { const s = sent.find(x => path.startsWith('messages/' + x.id + '?')); return J({ payload: { headers: [{ name: 'Message-ID', value: '<gmail-' + s.id + '@mail.gmail.com>' }] } }); }
    if (path.startsWith('messages?')) return J({ messages: inbox.map(m => ({ id: m.id })) });
    if (path.startsWith('messages/') && path.includes('format=raw')) { const m = inbox.find(x => path.startsWith('messages/' + x.id + '?')); return J({ raw: Buffer.from(m.raw).toString('base64url') }); }
  }
  return realFetch(url, opts);
};
process.env.PORT = 3303;
const { fake, C } = require('./server'); const { fakeToken } = require('./fake-supabase');
const B = 'http://127.0.0.1:3303'; let TOKEN;
const call = async (m, p, body) => { const r = await realFetch(B + p, { method: m, headers: { 'X-AO': '1', 'Content-Type': 'application/json', Authorization: 'Bearer ' + TOKEN }, body: body ? JSON.stringify(body) : undefined }); return { status: r.status, j: await r.json().catch(() => null) }; };
const ok = (n, c) => { console.log((c ? '  ✓ ' : '  ✗ ') + n); if (!c) process.exitCode = 1; };
(async () => {
  await new Promise(r => setTimeout(r, 300)); TOKEN = '';
  await call('POST', '/api/setup', { token: 'SETUP-123', company: 'A', name: 'Izy', email: 'izy@astravagand.com', password: 'Mein Kaffee um 7 ist heilig!' });
  const u = [...fake.users.values()][0]; TOKEN = fakeToken(u.id);
  let r = await call('GET', '/api/gworkspace'); ok('Status zeigt Client-ID, nie den Schlüssel', r.j.configured && r.j.clientId === '1234567890' && !JSON.stringify(r.j).includes('PRIVATE'));
  r = await call('POST', '/api/gworkspace/accounts', { emails: ['vertrieb@astravagand.com'] }); ok('ohne 2FA blockiert', r.status === 403);
  u.factors = [{ status: 'verified' }]; TOKEN = fakeToken(u.id, 'aal2');
  r = await call('POST', '/api/gworkspace/accounts', { emails: ['vertrieb@astravagand.com', 'office@astravagand.com', 'evil@fremd.com', 'gibtsnicht@astravagand.com'], name: 'Izy Sinani' });
  const res = Object.fromEntries(r.j.results.map(x => [x.email, x]));
  ok('2 verbunden', res['vertrieb@astravagand.com'].ok && res['office@astravagand.com'].ok);
  ok('fremde Domain abgelehnt', !res['evil@fremd.com'].ok && /Domain/.test(res['evil@fremd.com'].error));
  ok('unbekanntes Postfach → klare Meldung', !res['gibtsnicht@astravagand.com'].ok && /existiert nicht/.test(res['gibtsnicht@astravagand.com'].error));
  ok('kein Passwort gespeichert', fake.db.accounts.every(a => a.pass_enc === null && a.auth_type === 'gworkspace'));
  r = await call('POST', '/api/import', { listName: 'L', rows: [{ email: 'kunde@firma-test.at', first: 'Karl', company: 'Firma' }] });
  r = await call('POST', '/api/campaigns', { name: 'K', lists: [r.j.listId] }); const camp = r.j.id;
  await call('PATCH', '/api/campaigns/' + camp, { steps: [{ subject: 'Hallo {Firma}', body: 'Hallo {Vorname}, Test' }, { wait: 1, thread: true, body: 'Nachgehakt' }], schedule: { days: [1, 1, 1, 1, 1, 1, 1], from: '00:00', to: '23:59', minGap: 0, maxGap: 0 } });
  r = await call('POST', `/api/campaigns/${camp}/start`); ok('Kampagne gestartet', r.j.ok);
  await realFetch(B + '/api/cron', { method: 'POST', headers: { 'x-cron-secret': 'cron-test' } });
  ok('über Gmail-API gesendet', sent.length === 1 && /Subject: Hallo Firma/.test(sent[0].raw) && /List-Unsubscribe/.test(sent[0].raw));
  ok('echte Gmail-Message-ID gespeichert', fake.db.sends[0].message_id === '<gmail-m0@mail.gmail.com>');
  inbox = [{ id: 'in1', raw: `From: Karl <kunde@firma-test.at>\r\nTo: ${sent[0].who}\r\nSubject: Re: Hallo Firma\r\nMessage-ID: <antwort1@firma-test.at>\r\nIn-Reply-To: <gmail-m0@mail.gmail.com>\r\nDate: ${new Date().toUTCString()}\r\n\r\nJa gerne, rufen Sie an.\r\n` }];
  const acc = fake.db.accounts.find(a => a.email === sent[0].who); acc.last_imap_at = null;
  await realFetch(B + '/api/cron', { method: 'POST', headers: { 'x-cron-secret': 'cron-test' } });
  ok('Antwort über Gmail-API erkannt', fake.db.inbox.length === 1 && fake.db.inbox[0].cat === 'interested');
  acc.last_imap_at = null; await realFetch(B + '/api/cron', { method: 'POST', headers: { 'x-cron-secret': 'cron-test' } });
  ok('nicht doppelt verarbeitet', fake.db.inbox.length === 1);
  r = await call('GET', '/api/state'); ok('kein Geheimnis im Zustand', !JSON.stringify(r.j).includes('PRIVATE KEY') && r.j.accounts[0].authType === 'gworkspace');
  // Mitglied darf nicht
  fake.db.allowed_signups.push({ email: 'm@astravagand.com' }); const m = (await fake.auth.admin.createUser({ email: 'm@astravagand.com', password: 'x' })).data.user;
  fake.db.members.push({ ws_id: fake.db.workspaces[0].id, user_id: m.id, role: 'member' }); TOKEN = fakeToken(m.id);
  r = await call('POST', '/api/gworkspace/accounts', { emails: ['x@astravagand.com'] }); ok('Mitglied darf keine Admin-Postfächer', r.status === 403);
  // Gmail-Verlauf: threadId wird mitgeschickt; ist der Verlauf weg, wird normal gesendet
  const G = require('../lib/gworkspace');
  let rs = await G.send('vertrieb@astravagand.com', { from: 'vertrieb@astravagand.com', to: 'a@b.at', subject: 'Re: x', text: 'y', threadId: 'T1' });
  ok('Follow-up im Gmail-Verlauf (threadId)', sent[sent.length - 1].threadId === 'T1' && rs.threadId === 'T1');
  const n0 = sent.length; rs = await G.send('vertrieb@astravagand.com', { from: 'vertrieb@astravagand.com', to: 'a@b.at', subject: 'Re: x', text: 'y', threadId: 'GONE' });
  ok('Verlauf gelöscht → trotzdem gesendet', sent.length === n0 + 1 && !sent[sent.length - 1].threadId);
  console.log(process.exitCode ? '\nFEHLER' : '\nALLES OK'); process.exit(process.exitCode || 0);
})().catch(e => { console.error(e); process.exit(1); });
