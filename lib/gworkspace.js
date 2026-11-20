'use strict';
// Google Workspace – Admin-Verbindung über domainweite Delegierung (Gmail API)
// Der Dienstkonto-Schlüssel liegt NUR als Vercel-Umgebungsvariable GOOGLE_SA_JSON vor.
// Er wird nie gespeichert, nie geloggt und von keiner Schnittstelle zurückgegeben.
const crypto = require('crypto');
const MailComposer = require('nodemailer/lib/mail-composer');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'];
let SA = undefined;
function sa() {
  if (SA !== undefined) return SA;
  SA = null;
  const raw = process.env.GOOGLE_SA_JSON;
  if (!raw) return SA;
  try {
    const j = JSON.parse(raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'));
    if (j.type === 'service_account' && j.client_email && j.private_key && j.client_id) SA = { email: j.client_email, key: j.private_key, clientId: String(j.client_id), tokenUri: j.token_uri || 'https://oauth2.googleapis.com/token' };
  } catch (e) { SA = null; }
  return SA;
}
function domains() { return String(process.env.GWS_DOMAINS || '').toLowerCase().split(/[\s,]+/).filter(Boolean); }
function allowedEmail(email) { const d = String(email || '').toLowerCase().split('@')[1] || ''; return domains().includes(d); }
function info() { const s = sa(); return { configured: !!s, clientEmail: s ? s.email : null, clientId: s ? s.clientId : null, domains: domains(), scopes: SCOPES }; }

const b64url = b => Buffer.from(b).toString('base64url');
const cache = new Map();   // nur im Arbeitsspeicher, max. 55 Minuten
async function token(email) {
  const s = sa(); if (!s) throw new Error('Admin-Verbindung ist nicht eingerichtet (GOOGLE_SA_JSON fehlt).');
  if (!allowedEmail(email)) throw new Error('Diese Domain ist für die Admin-Verbindung nicht freigegeben.');
  const c = cache.get(email); if (c && c.exp > Date.now() + 60e3) return c.token;
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify({ iss: s.email, sub: email, scope: SCOPES.join(' '), aud: s.tokenUri, iat: now, exp: now + 3600 }));
  const sig = crypto.createSign('RSA-SHA256').update(head + '.' + body).sign(s.key).toString('base64url');
  const r = await fetch(s.tokenUri, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${body}.${sig}` }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) {
    const e = String(j.error_description || j.error || r.status);
    if (/unauthorized_client/i.test(e)) throw new Error('Google lehnt ab: Domainweite Delegierung fehlt oder die Berechtigungen (Scopes) stimmen nicht.');
    if (/invalid_grant/i.test(e)) throw new Error('Google lehnt ab: Postfach existiert nicht, ist gesperrt oder wurde noch nie angemeldet.');
    throw new Error('Google-Anmeldung fehlgeschlagen: ' + e.slice(0, 120));
  }
  cache.set(email, { token: j.access_token, exp: Date.now() + Math.min(3300, j.expires_in || 3600) * 1000 });
  return j.access_token;
}
async function gmail(email, path, opts = {}) {
  const t = await token(email);
  const r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/' + path, { ...opts, headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const m = (j.error && j.error.message) || String(r.status); if (r.status === 401) cache.delete(email); throw new Error('Gmail: ' + m.slice(0, 160)); }
  return j;
}
async function verify(email) {
  const p = await gmail(email, 'profile');
  if (String(p.emailAddress || '').toLowerCase() !== String(email).toLowerCase()) throw new Error('Postfach stimmt nicht überein.');
  return true;
}
async function send(email, mail) {
  const raw = await new MailComposer(mail).compile().build();
  const r = await gmail(email, 'messages/send', { method: 'POST', body: JSON.stringify({ raw: Buffer.from(raw).toString('base64url') }) });
  // tatsächliche Message-ID nachlesen (für die Antwort-Zuordnung)
  let messageId = mail.messageId || null;
  try { const m = await gmail(email, `messages/${r.id}?format=metadata&metadataHeaders=Message-ID`); const h = (m.payload && m.payload.headers || []).find(x => /^message-id$/i.test(x.name)); if (h) messageId = h.value; } catch (e) {}
  return { messageId };
}
async function listInbox(email, max = 100) {
  const ids = []; let page = '';
  do {
    const j = await gmail(email, `messages?q=${encodeURIComponent('in:inbox newer_than:3d')}&maxResults=100${page ? '&pageToken=' + page : ''}`);
    (j.messages || []).forEach(m => ids.push(m.id)); page = j.nextPageToken || '';
  } while (page && ids.length < max);
  return ids.slice(0, max);
}
async function raw(email, id) { const m = await gmail(email, `messages/${id}?format=raw`); return Buffer.from(m.raw, 'base64url'); }

module.exports = { info, allowedEmail, verify, send, listInbox, raw, SCOPES };
