'use strict';
// Astravagand Outreach – Server-Logik (Vercel Functions + Supabase)
const crypto = require('crypto');
const dns = require('dns').promises;
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const GWS = require('./gworkspace');
let ImapFlow = null, simpleParser = null;
try { ({ ImapFlow } = require('imapflow')); ({ simpleParser } = require('mailparser')); } catch (e) {}

const ENV = process.env;
let SB = null;
function sb() {
  if (SB) return SB;
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_SERVICE_KEY) { const e = new Error('Server ist noch nicht fertig eingerichtet (SUPABASE_SERVICE_KEY fehlt in Vercel).'); e.status = 503; throw e; }
  SB = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  return SB;
}
function setClient(c) { SB = c; }   // für Tests
async function q(p) { const { data, error, count } = await p; if (error) { const e = new Error(error.message || String(error)); e.db = true; throw e; } return count !== undefined && count !== null && data === null ? count : data; }
async function cnt(p) { const { count, error } = await p; if (error) throw new Error(error.message); return count || 0; }
const nowIso = () => new Date().toISOString();

/* ---------------- Verschlüsselung der App-Passwörter ---------------- */
function key() {
  const k = ENV.ENCRYPTION_KEY || '';
  if (!/^[0-9a-f]{64}$/i.test(k)) { const e = new Error('ENCRYPTION_KEY fehlt oder ist ungültig.'); e.status = 503; throw e; }
  return Buffer.from(k, 'hex');
}
function enc(text) {
  const iv = crypto.randomBytes(12), c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const out = Buffer.concat([c.update(String(text), 'utf8'), c.final()]);
  return ['v1', iv.toString('hex'), c.getAuthTag().toString('hex'), out.toString('hex')].join(':');
}
function dec(blob) {
  const [, iv, tag, data] = String(blob).split(':');
  const d = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'hex'));
  d.setAuthTag(Buffer.from(tag, 'hex'));
  return Buffer.concat([d.update(Buffer.from(data, 'hex')), d.final()]).toString('utf8');
}
function safeEq(a, b) { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); }

/* ---------------- Zeit & Limits ---------------- */
const defaultSettings = name => ({ company: name, timezone: 'Europe/Vienna', testTo: '', footer: `${name}\nKeine weiteren Nachrichten? Antworten Sie einfach mit „Abmelden“.`, onb: { welcomed: false, lesson: false, testmail: false } });
function dateKey(d, tz) { return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d)); }
function localParts(d, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(d)).map(x => [x.type, x.value]));
  return { wd: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(p.weekday), hm: `${p.hour}:${p.minute}` };
}
function inWindow(sch, tz, d = Date.now()) { const { wd, hm } = localParts(d, sch.timezone || tz); return !!(sch.days || [])[wd] && hm >= (sch.from || '08:00') && hm < (sch.to || '17:00'); }
function addBusinessDays(d, n) { const x = new Date(d); let left = Math.max(0, Number(n) || 0); while (left > 0) { x.setUTCDate(x.getUTCDate() + 1); const wd = x.getUTCDay(); if (wd !== 0 && wd !== 6) left--; } return x.toISOString(); }
const warmLimit = d => d <= 7 ? Math.round(5 + d * 0.7) : d <= 14 ? Math.round(10 + (d - 7) * 1.4) : d <= 21 ? Math.round(20 + (d - 14) * 1.4) : 40;
const accDay = a => Math.max(1, Math.floor((Date.now() - new Date(a.warmup_start).getTime()) / 864e5) + 1);
const accLimit = a => a.warmup ? Math.min(a.max_per_day, warmLimit(accDay(a))) : a.max_per_day;
function startOfLocalDay(tz) {
  // UTC-Zeitpunkt von heute 00:00 in der Zeitzone
  const now = new Date(), k = dateKey(now, tz);
  for (let h = -14; h <= 14; h++) { const t = new Date(`${k}T00:00:00Z`); t.setUTCHours(t.getUTCHours() - h); if (dateKey(t, tz) === k && dateKey(new Date(t - 1), tz) !== k) return t.toISOString(); }
  return new Date(`${k}T00:00:00Z`).toISOString();
}

/* ---------------- Texte ---------------- */
const VAR_MAP = { Vorname: 'first', Nachname: 'last', Firma: 'company', Stadt: 'city', Branche: 'industry' };
// Ohne Vornamen wird jede Begrüßung wie „Hallo {Vorname},“ zu „Sehr geehrte Damen und Herren,“
const GREET_RE = /^[ \t]*(?:Hallo|Hi|Hey|Servus|Guten Tag|Guten Morgen|Grüß Gott|Grüezi|Liebe[rs]?|Sehr geehrte[rs]?(?:\s+(?:Herr|Frau))?)\s+\{Vorname\}(?:\s+\{Nachname\})?[ \t]*[,!]?/gim;
const anredeOf = lead => { const f = String(lead.first || '').trim(), l = String(lead.last || '').trim(); return f ? 'Guten Tag ' + [f, l].filter(Boolean).join(' ') : 'Sehr geehrte Damen und Herren'; };
function render(text, lead, acc) {
  const hasName = !!String(lead.first || '').trim();
  const val = k => k === 'Absender' ? (acc ? acc.name || '' : '') : k === 'Anrede' ? anredeOf(lead) : (lead[VAR_MAP[k]] || (lead.custom || {})[k] || '');
  return String(text || '').replace(GREET_RE, m => hasName ? m : 'Sehr geehrte Damen und Herren,').replace(/^[ \t]*Sehr geehrte[rs]?\s+(?:Herr|Frau)\s+\{Nachname\}[ \t]*,?/gim, m => String(lead.last || '').trim() ? m : 'Sehr geehrte Damen und Herren,').replace(/ \{(\w+)\}(?=[,.!?:;]|\s|$)/g, (m, k) => val(k) ? ' ' + val(k) : '').replace(/\{(\w+)\}/g, (m, k) => val(k));
}
const SPAM = ['kostenlos', 'gratis', 'garantiert', '100%', '100 %', 'jetzt kaufen', 'gewinn', 'dringend', '!!!', 'risikofrei', 'billig', 'sofort zugreifen'];
const domainOf = e => (String(e || '').split('@')[1] || '').toLowerCase();
const FREEMAIL = new Set(['gmail.com', 'googlemail.com', 'gmx.at', 'gmx.de', 'gmx.net', 'web.de', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'aon.at', 'chello.at', 'live.com', 'me.com', 't-online.de']);
const ROLE = /^(info|office|kontakt|contact|mail|hello|hallo|service|team|admin|buero|büro|verwaltung|empfang|sales|vertrieb)@/i;
function stripQuote(text) {
  const out = [];
  for (const l of String(text || '').replace(/\r/g, '').split('\n')) {
    if (/^>/.test(l) || /^(Am |On ).{5,200}(schrieb|wrote).*:\s*$/i.test(l) || /^-{2,}\s*(Ursprüngliche|Original) (Nachricht|Message)/i.test(l) || (/^(Von|From):\s/.test(l) && out.length > 1)) break;
    out.push(l);
  }
  return out.join('\n').trim();
}
function classify(text) {
  const t = String(text || '').toLowerCase();
  if (/(kein (bedarf|interesse)|nicht interessiert|keine weiteren|bitte (nicht|keine)|kein thema|brauchen wir nicht)/.test(t)) return 'no';
  if (/(später|nächstes jahr|im (jänner|januar|februar|märz|frühjahr|herbst)|aktuell nicht|derzeit nicht|momentan nicht|melden sie sich (gern )?(im|in))/.test(t)) return 'later';
  if (/(interess|gerne|gern |ja,|ja |schicken sie|senden sie|termin|telefon|anrufen|rückruf|was kostet|preis|angebot)/.test(t)) return 'interested';
  return 'open';
}
function friendly(err) {
  const m = String((err && (err.response || err.message)) || err);
  if (/535|534|Username and Password not accepted|Invalid login|AUTHENTICATIONFAILED|Authentication failed|auth/i.test(m)) return 'Anmeldung abgelehnt – App-Passwort prüfen (nicht das normale Passwort).';
  if (/ENOTFOUND|EAI_AGAIN/i.test(m)) return 'Server nicht gefunden – Serveradresse prüfen.';
  if (/ETIMEDOUT|ECONNREFUSED|ECONNRESET|timeout/i.test(m)) return 'Keine Verbindung zum Server – Port und Internet prüfen.';
  if (/550|553|554|rejected/i.test(m)) return 'Vom Mailserver abgelehnt: ' + m.slice(0, 160);
  return m.slice(0, 200);
}

/* ---------------- Mail ---------------- */
function transport(a) {
  const port = Number(a.smtp_port) || 465;
  return nodemailer.createTransport({ host: a.smtp_host, port, secure: port === 465, auth: { user: a.email, pass: dec(a.pass_enc) }, connectionTimeout: 15000, greetingTimeout: 10000, socketTimeout: 20000 });
}
async function sendMail(a, mail) {
  if (a.auth_type === 'gworkspace') return GWS.send(a.email, mail);
  const info = await transport(a).sendMail(mail);
  return { messageId: info.messageId || mail.messageId };
}
async function verifyAccount(a) {
  if (a.auth_type === 'gworkspace') return GWS.verify(a.email);
  return transport(a).verify();
}
async function verifySmtp(cfg) {
  const port = Number(cfg.smtpPort) || 465;
  await nodemailer.createTransport({ host: cfg.smtpHost, port, secure: port === 465, auth: { user: cfg.email, pass: cfg.password }, connectionTimeout: 15000 }).verify();
}
async function verifyImap(cfg) {
  if (!ImapFlow) throw new Error('imapflow fehlt');
  const c = new ImapFlow({ host: cfg.imapHost, port: Number(cfg.imapPort) || 993, secure: true, auth: { user: cfg.email, pass: cfg.password }, logger: false, socketTimeout: 20000 });
  c.on('error', () => {});
  await c.connect(); await c.logout();
}
let dnsWorks = null;
async function dnsAvailable() { if (dnsWorks !== null) return dnsWorks; try { await dns.resolveMx('gmail.com'); dnsWorks = true; } catch (e) { dnsWorks = false; } return dnsWorks; }
async function checkDns(email) {
  if (!(await dnsAvailable())) return null;
  const d = domainOf(email);
  const txt = async n => { try { return (await dns.resolveTxt(n)).map(r => r.join('')); } catch (e) { return []; } };
  const spf = (await txt(d)).some(r => /^v=spf1/i.test(r));
  const dmarc = (await txt('_dmarc.' + d)).some(r => /^v=DMARC1/i.test(r));
  let dkim = false;
  for (const sel of ['google', 'selector1', 'selector2', 'default', 'k1', 's1', 'dkim', 'mail', 'smtp']) {
    const n = `${sel}._domainkey.${d}`;
    if ((await txt(n)).some(r => /p=/i.test(r))) { dkim = true; break; }
    try { if ((await dns.resolveCname(n)).length) { dkim = true; break; } } catch (e) {}
  }
  return { spf, dkim, dmarc, checkedAt: nowIso() };
}
const mxCache = new Map();
async function mxOk(domain) {
  if (!domain) return false;
  if (!(await dnsAvailable())) return true;
  if (mxCache.has(domain)) return mxCache.get(domain);
  const p = (async () => {
    try { const r = await Promise.race([dns.resolveMx(domain), new Promise((_, j) => setTimeout(() => j(new Error('timeout')), 5000))]); return r.length > 0; }
    catch (e) { if (e && (e.code === 'ENOTFOUND' || e.code === 'ENODATA')) { try { await dns.resolve4(domain); return true; } catch (e2) { return false; } } return true; }
  })();
  mxCache.set(domain, p); return p;
}

/* ---------------- Daten-Helfer ---------------- */
async function wsSettings(wsId) { const w = await q(sb().from('workspaces').select('id,name,settings').eq('id', wsId).single()); return { ws: w, st: { ...defaultSettings(w.name), ...(w.settings || {}), onb: { ...defaultSettings(w.name).onb, ...((w.settings || {}).onb || {}) } } }; }
async function isBlocked(email, wsId) {
  const e = String(email).toLowerCase();
  const n = await cnt(sb().from('blocklist').select('id', { count: 'exact', head: true }).eq('ws_id', wsId).in('value', [e, '@' + domainOf(e)]));
  return n > 0;
}
async function addBlock(value, wsId, reason) {
  value = String(value).toLowerCase().trim(); if (!value) return;
  await q(sb().from('blocklist').upsert({ ws_id: wsId, value, reason: reason || 'manuell' }, { onConflict: 'ws_id,value', ignoreDuplicates: true }));
}
async function sentTodayCount(a, tz) {
  return cnt(sb().from('sends').select('id', { count: 'exact', head: true }).eq('account_id', a.id).eq('test', false).gte('at', startOfLocalDay(tz)));
}
async function newTodayCount(c, tz) {
  return cnt(sb().from('sends').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('step', 0).eq('test', false).gte('at', startOfLocalDay(tz)));
}
async function bounceRate(accId) {
  const s = await q(sb().from('sends').select('enroll_id').eq('account_id', accId).eq('test', false).order('at', { ascending: false }).limit(100));
  if (!s.length) return 0;
  const ids = [...new Set(s.map(x => x.enroll_id).filter(Boolean))];
  const b = ids.length ? await cnt(sb().from('enrollments').select('id', { count: 'exact', head: true }).in('id', ids).eq('status', 'bounced')) : 0;
  return b / s.length * 100;
}
async function ensureEnroll(c) {
  if (!c.lists.length) return 0;
  let added = 0, from = 0;
  const have = new Set((await q(sb().from('enrollments').select('lead_id').eq('campaign_id', c.id).limit(100000))).map(x => x.lead_id));
  for (;;) {
    const leads = await q(sb().from('leads').select('id').in('list_id', c.lists).order('created_at').range(from, from + 999));
    const rows = leads.filter(l => !have.has(l.id)).map(l => ({ ws_id: c.ws_id, campaign_id: c.id, lead_id: l.id, status: 'pending' }));
    for (let i = 0; i < rows.length; i += 500) await q(sb().from('enrollments').upsert(rows.slice(i, i + 500), { onConflict: 'campaign_id,lead_id', ignoreDuplicates: true }));
    added += rows.length;
    if (leads.length < 1000) break; from += 1000;
  }
  return added;
}
async function audit(ws, ctx, event, detail) {
  try { await q(sb().from('audit').insert({ ws_id: ws || null, user_email: ctx && ctx.user ? ctx.user.email : null, ip: ctx ? ctx.ip : null, event, detail: detail || null })); } catch (e) {}
}

/* ---------------- Versand-Engine ---------------- */
async function updEnroll(e, patch) { Object.assign(e, patch); await q(sb().from('enrollments').update(patch).eq('id', e.id)); }
async function sendStep(c, e, a, st) {
  const lead = await q(sb().from('leads').select('*').eq('id', e.lead_id).maybeSingle());
  const step = c.steps[e.step];
  if (!lead || !step) return updEnroll(e, { status: 'done', next_at: null });
  const hist = Array.isArray(e.history) ? e.history : [];
  if (!lead.email || lead.email_check === 'invalid') return updEnroll(e, { status: 'error', next_at: null, history: [...hist, { type: 'error', at: nowIso(), text: 'Keine gültige E-Mail-Adresse' }] });
  if (await isBlocked(lead.email, c.ws_id)) return updEnroll(e, { status: 'stopped', next_at: null, history: [...hist, { type: 'stopped', at: nowIso(), text: 'Auf der Sperrliste' }] });
  const first = c.steps[0];
  const thread = e.step > 0 && step.thread && e.last_msg_id;
  const subject = thread ? 'Re: ' + render(first.subject, lead, a) : render(step.subject || first.subject, lead, a);
  const footer = st.footer ? '\n\n--\n' + st.footer : '';
  const text = render(step.body, lead, a) + footer;
  const messageId = `<${crypto.randomUUID()}@${domainOf(a.email) || 'localhost'}>`;
  const mail = { from: a.name ? { name: a.name, address: a.email } : a.email, to: lead.email, subject, text, messageId, headers: { 'List-Unsubscribe': `<mailto:${a.email}?subject=Abmelden>` } };
  if (thread) { mail.inReplyTo = e.last_msg_id; mail.references = (e.refs || []).join(' '); }
  let sentId = messageId;
  try { sentId = (await sendMail(a, mail)).messageId || messageId; }
  catch (err) {
    const msg = friendly(err);
    if (/Anmeldung abgelehnt|Server nicht gefunden|Google lehnt ab|Admin-Verbindung ist nicht|nicht freigegeben/.test(msg)) await q(sb().from('accounts').update({ status: 'error', error: msg }).eq('id', a.id));
    const errors = (e.errors || 0) + 1;
    return updEnroll(e, { errors, history: [...hist, { type: 'error', at: nowIso(), step: e.step, text: msg }], ...(errors >= 3 ? { status: 'error', next_at: null } : { next_at: new Date(Date.now() + 30 * 60e3).toISOString() }) });
  }
  const at = nowIso();
  const refs = [...(thread ? (e.refs || []) : []), sentId].slice(-10);
  await q(sb().from('sends').insert({ ws_id: c.ws_id, account_id: a.id, campaign_id: c.id, lead_id: lead.id, enroll_id: e.id, step: e.step, at, message_id: sentId }));
  const next = e.step + 1;
  await updEnroll(e, { step: next, refs, last_msg_id: sentId, thread_msg_id: thread ? e.thread_msg_id : sentId,
    history: [...hist, { type: 'sent', at, step: e.step, subject, text, account: a.email, messageId: sentId }],
    ...(next < c.steps.length ? { status: 'active', next_at: addBusinessDays(at, c.steps[next].wait) } : { status: 'done', next_at: null }) });
  await q(sb().from('accounts').update({ last_send_at: at }).eq('id', a.id));
  return true;
}

async function tick(deadline) {
  const out = { sent: 0, campaigns: 0 };
  const settingsCache = new Map();
  const stOf = async wsId => { if (!settingsCache.has(wsId)) settingsCache.set(wsId, (await wsSettings(wsId)).st); return settingsCache.get(wsId); };
  const camps = await q(sb().from('campaigns').select('*').eq('status', 'active'));
  for (const c of camps) {
    if (Date.now() > deadline) break;
    out.campaigns++;
    const st = await stOf(c.ws_id), tz = st.timezone || 'Europe/Vienna';
    if (!inWindow(c.schedule || {}, tz)) continue;
    const accs = c.accounts.length ? await q(sb().from('accounts').select('*').in('id', c.accounts).eq('status', 'ok')) : [];
    for (const a of accs) {
      if (Date.now() > deadline) break;
      if (a.next_send_at && Date.now() < new Date(a.next_send_at).getTime()) continue;
      if ((await sentTodayCount(a, tz)) >= accLimit(a)) continue;
      let e = (await q(sb().from('enrollments').select('*').eq('campaign_id', c.id).eq('status', 'active').eq('account_id', a.id).lte('next_at', nowIso()).order('next_at').limit(1)))[0];
      if (!e && (await newTodayCount(c, tz)) < c.daily_new) {
        const cand = (await q(sb().from('enrollments').select('*').eq('campaign_id', c.id).eq('status', 'pending').is('account_id', null).order('created_at').limit(1)))[0];
        if (cand) {
          const claimed = await q(sb().from('enrollments').update({ account_id: a.id }).eq('id', cand.id).eq('status', 'pending').is('account_id', null).select('*'));
          e = claimed[0];
        }
      }
      if (!e) continue;
      await sendStep(c, e, a, st);
      out.sent++;
      const sc = c.schedule || {};
      const gap = (Number(sc.minGap) || 0) + Math.random() * Math.max(0, (Number(sc.maxGap) || 0) - (Number(sc.minGap) || 0));
      await q(sb().from('accounts').update({ next_send_at: new Date(Date.now() + gap * 60e3).toISOString() }).eq('id', a.id));
    }
    const open = await cnt(sb().from('enrollments').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).in('status', ['pending', 'active']));
    const any = await cnt(sb().from('enrollments').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id));
    if (!open && any) await q(sb().from('campaigns').update({ status: 'done' }).eq('id', c.id));
  }
  return out;
}

/* ---------------- Eingehende Mails ---------------- */
async function handleIncoming(a, m) {
  const msgId = m.messageId || `${a.id}:${m.date}:${m.subject}`;
  const ins = await q(sb().from('processed').upsert({ message_id: msgId }, { onConflict: 'message_id', ignoreDuplicates: true }).select('message_id'));
  if (!ins || !ins.length) return null;
  const fv = m.from && m.from.value && m.from.value[0] || {};
  const fromAddr = String(fv.address || '').toLowerCase(), fromName = fv.name || fromAddr;
  const subject = m.subject || '', text = String(m.text || '');
  const refs = [m.inReplyTo, ...(Array.isArray(m.references) ? m.references : m.references ? [m.references] : [])].filter(Boolean);
  let e = null;
  if (refs.length) {
    const s = (await q(sb().from('sends').select('enroll_id').in('message_id', refs).limit(1)))[0];
    if (s && s.enroll_id) e = await q(sb().from('enrollments').select('*').eq('id', s.enroll_id).maybeSingle());
  }
  const isBounce = /mailer-daemon|postmaster/i.test(fromAddr) || /(undeliver|unzustellbar|delivery status|returned mail|failure notice|nicht zugestellt|delivery has failed|mail delivery failed)/i.test(subject);
  if (isBounce) {
    if (!e) {
      const cands = await q(sb().from('enrollments').select('*, leads!inner(email)').eq('account_id', a.id).in('status', ['active', 'done']).limit(2000));
      e = cands.find(x => x.leads && text.toLowerCase().includes(String(x.leads.email).toLowerCase())) || null;
      if (e) delete e.leads;
    }
    if (!e) return null;
    const lead = await q(sb().from('leads').select('*').eq('id', e.lead_id).maybeSingle());
    await updEnroll(e, { status: 'bounced', next_at: null, history: [...(e.history || []), { type: 'bounce', at: nowIso(), text: 'Adresse nicht zustellbar' }] });
    if (lead) { await q(sb().from('leads').update({ email_check: 'invalid' }).eq('id', lead.id)); await addBlock(lead.email, a.ws_id, 'Bounce'); }
    const total = await cnt(sb().from('sends').select('id', { count: 'exact', head: true }).eq('account_id', a.id).eq('test', false));
    const br = await bounceRate(a.id);
    if (br > 3 && total >= 20) await q(sb().from('accounts').update({ status: 'paused', error: `Automatisch pausiert: Bounce-Rate ${br.toFixed(1)} % (über 3 %)` }).eq('id', a.id));
    return 'bounce';
  }
  if (!e && fromAddr) {
    const leadIds = (await q(sb().from('leads').select('id').eq('ws_id', a.ws_id).ilike('email', fromAddr))).map(x => x.id);
    if (leadIds.length) {
      const ens = await q(sb().from('enrollments').select('*').in('lead_id', leadIds).neq('status', 'pending').order('created_at', { ascending: false }).limit(5));
      e = ens.find(x => (x.history || []).some(h => h.type === 'sent')) || null;
    }
  }
  if (!e) return null;
  const c = await q(sb().from('campaigns').select('*').eq('id', e.campaign_id).maybeSingle());
  const lead = await q(sb().from('leads').select('*').eq('id', e.lead_id).maybeSingle());
  const hget = k => m.headers && typeof m.headers.get === 'function' ? m.headers.get(k) : undefined;
  const auto = (hget('auto-submitted') && hget('auto-submitted') !== 'no') || hget('x-autoreply') || hget('x-autorespond') || /(automatische antwort|abwesen|out of office|autoreply|auto-reply|automatic reply|urlaub|nicht im büro)/i.test(subject);
  const body = stripQuote(text);
  const repliedStep = Math.max(0, e.step - 1);
  const item = { ws_id: a.ws_id, account_id: a.id, account: a.email, enroll_id: e.id, campaign_id: e.campaign_id, campaign: c ? c.name : '', lead_id: e.lead_id,
    from_addr: fromAddr, from_name: fromName, company: lead ? lead.company : '', subject, text: body.slice(0, 20000), at: (m.date ? new Date(m.date) : new Date()).toISOString(),
    message_id: m.messageId || null, step: c && c.steps[repliedStep] ? (repliedStep === 0 ? 'Mail 1' : 'Follow-up ' + repliedStep) : '', read: false };
  const hist = e.history || [];
  if (auto) { await updEnroll(e, { history: [...hist, { type: 'ooo', at: item.at, text: body.slice(0, 400) }] }); await q(sb().from('inbox').insert({ ...item, type: 'ooo', cat: 'ooo' })); return 'ooo'; }
  if (/\b(abmelden|abbestellen|unsubscribe|austragen)\b/i.test(body.slice(0, 400)) || /^abmelden/i.test(subject)) {
    await updEnroll(e, { status: 'unsub', next_at: null, history: [...hist, { type: 'unsub', at: item.at, text: body.slice(0, 400) }] });
    if (lead) await addBlock(lead.email, a.ws_id, 'Abmeldung');
    await q(sb().from('inbox').insert({ ...item, type: 'unsub', cat: 'no' })); return 'unsub';
  }
  const cat = classify(body);
  await updEnroll(e, { status: 'replied', next_at: null, replied_step: repliedStep, history: [...hist, { type: 'reply', at: item.at, text: body.slice(0, 5000), step: repliedStep }] });
  await q(sb().from('inbox').insert({ ...item, type: 'reply', cat, auto_cat: cat }));
  if (c && c.stop_company && lead) {
    const d = domainOf(lead.email);
    if (d && !FREEMAIL.has(d)) {
      const others = await q(sb().from('enrollments').select('*, leads!inner(email)').eq('campaign_id', c.id).in('status', ['pending', 'active']).ilike('leads.email', '%@' + d));
      for (const x of others) { if (x.id === e.id) continue; delete x.leads; await updEnroll(x, { status: 'stopped', next_at: null, history: [...(x.history || []), { type: 'stopped', at: nowIso(), text: `Kollege hat geantwortet (${lead.email})` }] }); }
    }
  }
  return 'reply';
}

async function pollGmail(a, deadline) {
  const patch = { last_imap_at: nowIso() };
  try {
    const ids = await GWS.listInbox(a.email, 150);
    const keys = ids.map(id => 'g:' + a.id + ':' + id);
    const seen = new Set();
    for (let i = 0; i < keys.length; i += 200) (await q(sb().from('processed').select('message_id').in('message_id', keys.slice(i, i + 200)))).forEach(x => seen.add(x.message_id));
    for (const id of ids.slice().reverse()) {
      const k = 'g:' + a.id + ':' + id; if (seen.has(k)) continue;
      if (deadline && Date.now() > deadline) break;
      try { await handleIncoming(a, await simpleParser(await GWS.raw(a.email, id))); } catch (e) { console.error('gmail incoming', e.message); }
      await q(sb().from('processed').upsert({ message_id: k }, { onConflict: 'message_id', ignoreDuplicates: true }));
    }
    patch.imap_error = null;
  } catch (err) { patch.imap_error = String(err.message || err).slice(0, 200); }
  await q(sb().from('accounts').update(patch).eq('id', a.id));
}
async function pollAccount(a, deadline) {
  if (a.auth_type === 'gworkspace') return simpleParser ? pollGmail(a, deadline) : undefined;
  if (!ImapFlow || !simpleParser || a.status === 'error' || !a.imap_host) return;
  const client = new ImapFlow({ host: a.imap_host, port: Number(a.imap_port) || 993, secure: true, auth: { user: a.email, pass: dec(a.pass_enc) }, logger: false, socketTimeout: 25000 });
  client.on('error', () => {});
  const patch = { last_imap_at: nowIso() };
  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const mb = client.mailbox;
      let last = Number(a.imap_last_uid) || 0;
      if (a.imap_uid_validity && String(a.imap_uid_validity) !== String(mb.uidValidity)) last = 0;
      patch.imap_uid_validity = String(mb.uidValidity);
      let range = null;
      if (last) range = `${last + 1}:*`;
      else { const uids = await client.search({ since: new Date(new Date(a.created_at).getTime() - 864e5) }, { uid: true }); if (uids && uids.length) range = uids.slice(-300).join(','); }
      let maxUid = last;
      if (range) {
        for await (const msg of client.fetch(range, { uid: true, source: true }, { uid: true })) {
          if (msg.uid <= last) continue;
          maxUid = Math.max(maxUid, msg.uid);
          try { await handleIncoming(a, await simpleParser(msg.source)); } catch (e) { console.error('incoming', e.message); }
          if (deadline && Date.now() > deadline) break;
        }
      }
      if (!last) maxUid = Math.max(maxUid, (mb.uidNext || 1) - 1);
      patch.imap_last_uid = maxUid; patch.imap_error = null;
    } finally { lock.release(); }
    await client.logout();
  } catch (err) { patch.imap_error = friendly(err); try { await client.logout(); } catch (e) {} }
  await q(sb().from('accounts').update(patch).eq('id', a.id));
}
async function pollDue(deadline, wsId) {
  let qb = sb().from('accounts').select('*').eq('status', 'ok').order('last_imap_at', { ascending: true, nullsFirst: true }).limit(10);
  if (wsId) qb = qb.eq('ws_id', wsId);
  const accs = await q(qb);
  for (const a of accs) {
    if (Date.now() > deadline) break;
    if (!wsId && a.last_imap_at && Date.now() - new Date(a.last_imap_at).getTime() < 2.5 * 60e3) continue;
    await pollAccount(a, deadline);
  }
}

module.exports = { sb, setClient, q, cnt, enc, dec, safeEq, nowIso, defaultSettings, dateKey, inWindow, addBusinessDays, warmLimit, accDay, accLimit, startOfLocalDay, render, SPAM, domainOf, ROLE, classify, stripQuote, friendly,
  transport, sendMail, verifyAccount, GWS, verifySmtp, verifyImap, checkDns, mxOk, wsSettings, isBlocked, addBlock, sentTodayCount, newTodayCount, bounceRate, ensureEnroll, audit, sendStep, tick, handleIncoming, pollAccount, pollDue, updEnroll };
