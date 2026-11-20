'use strict';
const crypto = require('crypto');
const C = require('./core');
const { sb, q, cnt, nowIso, enc, safeEq } = C;
const ENV = process.env;

const routes = [];
const route = (method, pattern, fn, opts = {}) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), fn, ...opts });
const err = (status, message) => { const e = new Error(message); e.status = status; return e; };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const id = v => { if (!UUID.test(String(v || ''))) throw err(400, 'Ungültige ID'); return v; };
async function own(table, rowId, ws, cols = '*') {
  const r = await q(sb().from(table).select(cols).eq('id', id(rowId)).eq('ws_id', ws).maybeSingle());
  if (!r) throw err(404, 'Nicht gefunden'); return r;
}
const DEFAULT_STEPS = () => require('./templates').steps(require('./templates').IND.find(t => t.key === 'allgemein'));
const TPL = require('./templates');
const SEED_TEMPLATES = ws => ([
  ...TPL.all(ws),
  { ws_id: ws, type: 'mail', name: 'Kurzes Nachhaken', subject: '', body: 'Hallo {Vorname},\n\nich wollte kurz nachhaken, ob meine Nachricht angekommen ist. Ein kurzes „Ja“ reicht.\n\nBeste Grüße\n{Absender}' },
  { ws_id: ws, type: 'mail', name: 'Letzte Nachricht (Break-up)', subject: '', body: 'Hallo {Vorname},\n\nletzte Nachricht von mir – ich möchte nicht nerven. Falls es gerade nicht passt, ist das völlig in Ordnung.\n\nAlles Gute\n{Absender}' },
  { ws_id: ws, type: 'seq', name: 'Standard – 3 Schritte', steps: DEFAULT_STEPS() }
]);
const WEAK = ['passwort', 'password', '123456', 'qwertz', 'qwerty', 'astravagand', 'admin', 'letmein', 'willkommen', 'sommer', 'winter'];
function passwordProblem(pw, email) {
  pw = String(pw || ''); const low = pw.toLowerCase();
  if (pw.length < 12) return 'Mindestens 12 Zeichen.';
  if (pw.length > 72) return 'Maximal 72 Zeichen.';
  if (WEAK.some(w => low.includes(w))) return 'Zu leicht zu erraten – bitte keine gängigen Wörter.';
  if (email && low.includes(String(email).split('@')[0].toLowerCase())) return 'Das Passwort darf nicht deinen E-Mail-Namen enthalten.';
  if (new Set(pw).size < 6) return 'Zu wenige verschiedene Zeichen.';
  return null;
}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---------- einfache Begrenzung (pro Funktions-Instanz) ---------- */
const hits = new Map();
function limited(key, max, windowMs) { const now = Date.now(); let h = hits.get(key); if (!h || h.reset < now) { h = { n: 0, reset: now + windowMs }; hits.set(key, h); } h.n++; return h.n > max; }

/* ---------- Einrichtung & Benutzer ---------- */
async function createUser(email, password, name) {
  await q(sb().from('allowed_signups').upsert({ email }, { onConflict: 'email', ignoreDuplicates: true }));
  const { data, error } = await sb().auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
  if (error) throw err(400, /already|registered|exists/i.test(error.message) ? 'Diese E-Mail ist schon registriert.' : error.message);
  return data.user;
}
route('GET', '/api/config', () => ({ ok: true, supabaseUrl: ENV.SUPABASE_URL, anonKey: ENV.SUPABASE_ANON_KEY }), { public: true });
route('GET', '/api/auth/status', async (b, p, qs, ctx) => {
  const members = await cnt(sb().from('members').select('user_id', { count: 'exact', head: true }));
  return { ok: true, setupNeeded: members === 0, authed: !!ctx.user, mfaNeeded: !!ctx.mfaNeeded, member: !!ctx.ws };
}, { public: true });
route('POST', '/api/setup', async (b, p, qs, ctx) => {
  if (limited('setup:' + ctx.ip, 8, 15 * 60e3)) throw err(429, 'Zu viele Versuche. Bitte später erneut.');
  if (!ENV.SETUP_TOKEN || !safeEq(String(b.token || '').trim(), ENV.SETUP_TOKEN)) { await C.audit(null, ctx, 'setup_failed', 'falscher Einrichtungs-Code'); throw err(403, 'Einrichtungs-Code falsch.'); }
  if (await cnt(sb().from('members').select('user_id', { count: 'exact', head: true }))) throw err(409, 'Die Einrichtung ist bereits abgeschlossen.');
  const email = String(b.email || '').trim().toLowerCase();
  if (!EMAIL.test(email)) throw err(400, 'Bitte eine gültige E-Mail-Adresse eingeben.');
  const prob = passwordProblem(b.password, email); if (prob) throw err(400, prob);
  const company = String(b.company || 'Astravagand').trim().slice(0, 80) || 'Astravagand';
  const user = await createUser(email, b.password, String(b.name || '').trim().slice(0, 80));
  const ws = await q(sb().from('workspaces').insert({ name: company, settings: C.defaultSettings(company) }).select('id').single());
  await q(sb().from('members').insert({ ws_id: ws.id, user_id: user.id, role: 'owner' }));
  await q(sb().from('profiles').upsert({ user_id: user.id, name: String(b.name || '').trim().slice(0, 80), current_ws: ws.id }));
  await q(sb().from('templates').insert(SEED_TEMPLATES(ws.id)));
  await C.audit(ws.id, { ...ctx, user: { email } }, 'setup', 'Inhaber angelegt');
  return { ok: true };
}, { public: true });

/* ---------- Zustand ---------- */
route('GET', '/api/state', async (b, p, qs, ctx) => {
  const { ws, st } = await C.wsSettings(ctx.ws);
  const tz = st.timezone;
  const [accountsRaw, campaignsRaw, templates, memberships, agg] = await Promise.all([
    q(sb().from('accounts').select('id,email,name,provider,auth_type,status,error,imap_error,warmup,warmup_start,max_per_day,dns,last_imap_at,imap_host,created_at,signature').eq('ws_id', ctx.ws).order('created_at')),
    q(sb().from('campaigns').select('*').eq('ws_id', ctx.ws).order('created_at')),
    q(sb().from('templates').select('id,type,name,subject,body,steps').eq('ws_id', ctx.ws).order('created_at')),
    q(sb().from('members').select('role, workspaces(id,name)').eq('user_id', ctx.user.id)),
    q(sb().rpc('app_state', { p_ws: ctx.ws, p_tz: tz }))
  ]);
  const accAgg = Object.fromEntries((agg.accounts || []).map(x => [x.id, x]));
  const accounts = accountsRaw.map(a => {
    const x = accAgg[a.id] || {}, day = C.accDay(a);
    return { id: a.id, email: a.email, name: a.name, provider: a.auth_type === 'gworkspace' ? 'gworkspace' : a.provider, authType: a.auth_type, status: a.status, error: a.error, imapError: a.imap_error, warmup: a.warmup, maxPerDay: a.max_per_day, dns: a.dns, lastImapAt: a.last_imap_at,
      day, limit: a.status === 'ok' ? C.accLimit(a) : 0, limitTomorrow: a.warmup ? Math.min(a.max_per_day, C.warmLimit(day + 1)) : a.max_per_day,
      sentToday: x.sentToday || 0, totalSent: x.totalSent || 0, bounce: Number(x.bounce || 0), signature: a.signature || '' };
  });
  const campaigns = campaignsRaw.map(c => {
    const s = (agg.campaigns || {})[c.id] || {};
    return { id: c.id, name: c.name, status: c.status, steps: c.steps, schedule: c.schedule, lists: c.lists, accounts: c.accounts, dailyNew: c.daily_new, stopCompany: c.stop_company, createdAt: c.created_at,
      stats: { total: s.total || 0, contacted: s.contacted || 0, replies: s.replies || 0, positive: s.positive || 0, bounces: s.bounces || 0, pending: s.pending || 0, sentToday: s.sentToday || 0,
        steps: (s.steps || []).map((x, i) => ({ name: i === 0 ? 'Mail 1' : 'Follow-up ' + i, sent: x.sent, replies: x.replies })) } };
  });
  const k = agg.kpi || {};
  const onb = st.onb || {};
  const checklist = [!!onb.lesson, accounts.length > 0, accounts.some(a => a.dns && a.dns.spf && a.dns.dkim && a.dns.dmarc), !!onb.lesson,
    (agg.leadsCount || 0) > 0, campaigns.length > 0, !!onb.testmail, campaigns.some(c => c.status === 'active' || c.status === 'done')];
  const AIm = require('./ai');
  return { ok: true, ai: { configured: AIm.configured(), offer: AIm.offerOf(st), defaultOffer: AIm.DEFAULT_OFFER }, now: nowIso(), workspace: { id: ws.id, name: ws.name }, workspaces: memberships.map(m => ({ id: m.workspaces.id, name: m.workspaces.name, role: m.role })),
    role: ctx.role, settings: st, accounts, campaigns, lists: agg.lists || [], leadsCount: agg.leadsCount || 0, templates, blocklist: agg.blocklist || [],
    inboxUnread: agg.inboxUnread || 0, inboxCounts: agg.inboxCounts || {}, chart: agg.chart || [],
    kpi: { sentToday: accounts.reduce((s, a) => s + a.sentToday, 0), capacity: accounts.reduce((s, a) => s + a.limit, 0), replyRate7: k.sends7 ? k.replies7 / k.sends7 * 100 : 0,
      replies7: k.replies7 || 0, positive7: k.positive7 || 0, positivePrev: k.positivePrev || 0, bounceRate: k.firstSends ? k.bounced / k.firstSends * 100 : 0, totalSent: k.totalSent || 0 },
    checklist, imap: true, awake: true, cloud: true };
});

/* ---------- Workspaces & Einstellungen ---------- */
route('POST', '/api/workspaces', async (b, p, qs, ctx) => {
  if (ctx.role !== 'owner') throw err(403, 'Nur der Inhaber kann Workspaces anlegen.');
  const name = String(b.name || 'Neuer Kunde').trim().slice(0, 80) || 'Neuer Kunde';
  const w = await q(sb().from('workspaces').insert({ name, settings: C.defaultSettings(name) }).select('id').single());
  await q(sb().from('members').insert({ ws_id: w.id, user_id: ctx.user.id, role: 'owner' }));
  await q(sb().from('templates').insert(SEED_TEMPLATES(w.id)));
  await q(sb().from('profiles').upsert({ user_id: ctx.user.id, current_ws: w.id }));
  await C.audit(w.id, ctx, 'workspace_created', name);
  return { ok: true };
});
route('POST', '/api/workspaces/switch', async (b, p, qs, ctx) => {
  const m = await q(sb().from('members').select('ws_id').eq('user_id', ctx.user.id).eq('ws_id', id(b.id)).maybeSingle());
  if (!m) throw err(403, 'Kein Zugriff auf diesen Workspace.');
  await q(sb().from('profiles').upsert({ user_id: ctx.user.id, current_ws: m.ws_id })); return { ok: true };
});
route('PATCH', '/api/settings', async (b, p, qs, ctx) => {
  const { ws, st } = await C.wsSettings(ctx.ws);
  for (const k of ['company', 'timezone', 'testTo', 'footer']) if (b[k] !== undefined) st[k] = String(b[k]).slice(0, 2000);
  if (b.aiOffer !== undefined) st.ai = { ...(st.ai || {}), offer: String(b.aiOffer).trim().slice(0, 3000) };
  if (b.timezone && !['Europe/Vienna', 'Europe/Berlin', 'Europe/Zurich', 'Europe/Belgrade'].includes(st.timezone)) st.timezone = 'Europe/Vienna';
  if (b.onb && typeof b.onb === 'object') st.onb = { ...st.onb, ...Object.fromEntries(Object.entries(b.onb).filter(([k]) => ['welcomed', 'lesson', 'testmail'].includes(k)).map(([k, v]) => [k, !!v])) };
  const patch = { settings: st };
  if (b.company && String(b.company).trim()) patch.name = String(b.company).trim().slice(0, 80);
  await q(sb().from('workspaces').update(patch).eq('id', ws.id));
  if (Array.isArray(b.blocklist)) {
    await q(sb().from('blocklist').delete().eq('ws_id', ctx.ws));
    const vals = [...new Set(b.blocklist.map(v => String(v).toLowerCase().trim()).filter(Boolean))].slice(0, 20000);
    for (let i = 0; i < vals.length; i += 500) await q(sb().from('blocklist').insert(vals.slice(i, i + 500).map(value => ({ ws_id: ctx.ws, value, reason: 'manuell' }))));
  }
  return { ok: true };
});

/* ---------- Konten ---------- */
const PROVIDERS = { google: { smtpHost: 'smtp.gmail.com', smtpPort: 465, imapHost: 'imap.gmail.com', imapPort: 993 }, microsoft: { smtpHost: 'smtp.office365.com', smtpPort: 587, imapHost: 'outlook.office365.com', imapPort: 993 } };
route('POST', '/api/accounts', async (b, p, qs, ctx) => {
  if (limited('acc:' + ctx.user.id, 20, 10 * 60e3)) throw err(429, 'Zu viele Versuche – bitte kurz warten.');
  const prov = PROVIDERS[b.provider] || {};
  const cfg = { email: String(b.email || '').trim().toLowerCase(), password: String(b.password || '').replace(/\s+/g, ''), smtpHost: String(b.smtpHost || prov.smtpHost || '').trim(), smtpPort: Number(b.smtpPort) || prov.smtpPort || 465,
    imapHost: String(b.imapHost || prov.imapHost || '').trim(), imapPort: Number(b.imapPort) || prov.imapPort || 993 };
  if (!EMAIL.test(cfg.email) || !cfg.password) return { ok: false, error: 'E-Mail-Adresse und App-Passwort eingeben.' };
  const PRIV = /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1|\[?f[cd])/i;
  if (!cfg.smtpHost || (!ENV.ALLOW_PRIVATE_SMTP && (PRIV.test(cfg.smtpHost) || PRIV.test(cfg.imapHost)))) return { ok: false, error: 'Ungültiger Mailserver.' };
  try { await C.verifySmtp(cfg); } catch (e) { return { ok: false, error: 'SMTP: ' + C.friendly(e) }; }
  let imapError = null;
  if (cfg.imapHost) { try { await C.verifyImap(cfg); } catch (e) { imapError = C.friendly(e); } } else imapError = 'Kein IMAP-Server angegeben';
  if (b.testOnly) return { ok: true, imapError };
  const row = { ws_id: ctx.ws, email: cfg.email, name: String(b.name || '').trim().slice(0, 80), provider: b.provider || 'other', smtp_host: cfg.smtpHost, smtp_port: cfg.smtpPort,
    imap_host: cfg.imapHost || null, imap_port: cfg.imapPort, pass_enc: enc(cfg.password), status: 'ok', error: null, imap_error: imapError };
  const existing = await q(sb().from('accounts').select('id').eq('ws_id', ctx.ws).eq('email', cfg.email).maybeSingle());
  const a = existing ? (await q(sb().from('accounts').update(row).eq('id', existing.id).select('id').single())) : (await q(sb().from('accounts').insert(row).select('id').single()));
  try { const d = await C.checkDns(cfg.email); if (d) await q(sb().from('accounts').update({ dns: d }).eq('id', a.id)); } catch (e) {}
  await C.audit(ctx.ws, ctx, existing ? 'account_updated' : 'account_added', cfg.email);
  return { ok: true, id: a.id, imapError };
});
route('PATCH', '/api/accounts/:id', async (b, p, qs, ctx) => {
  const a = await own('accounts', p.id, ctx.ws); const patch = {};
  if (b.name !== undefined) patch.name = String(b.name).slice(0, 80);
  if (b.maxPerDay !== undefined) patch.max_per_day = Math.max(1, Math.min(200, Number(b.maxPerDay) || 40));
  if (b.warmup !== undefined) patch.warmup = !!b.warmup;
  if (b.paused !== undefined) { if (b.paused) patch.status = 'paused'; else if (a.status === 'paused') { patch.status = 'ok'; patch.error = null; } }
  await q(sb().from('accounts').update(patch).eq('id', a.id)); return { ok: true };
});
route('DELETE', '/api/accounts/:id', async (b, p, qs, ctx) => {
  const a = await own('accounts', p.id, ctx.ws, 'id,email');
  const camps = await q(sb().from('campaigns').select('id,accounts').eq('ws_id', ctx.ws).contains('accounts', [a.id]));
  for (const c of camps) await q(sb().from('campaigns').update({ accounts: c.accounts.filter(x => x !== a.id) }).eq('id', c.id));
  await q(sb().from('accounts').delete().eq('id', a.id));
  await C.audit(ctx.ws, ctx, 'account_removed', a.email); return { ok: true };
});
route('POST', '/api/accounts/:id/test', async (b, p, qs, ctx) => {
  const a = await own('accounts', p.id, ctx.ws);
  try { await C.verifyAccount(a); if (a.status === 'error') await q(sb().from('accounts').update({ status: 'ok', error: null }).eq('id', a.id)); }
  catch (e) { const m = C.friendly(e); await q(sb().from('accounts').update({ status: 'error', error: m }).eq('id', a.id)); return { ok: false, error: m }; }
  await C.pollAccount({ ...a, status: 'ok' }, Date.now() + 25000).catch(() => {});
  const fresh = await q(sb().from('accounts').select('imap_error').eq('id', a.id).single());
  return { ok: true, imapError: fresh.imap_error };
});
route('POST', '/api/accounts/:id/dns', async (b, p, qs, ctx) => {
  const a = await own('accounts', p.id, ctx.ws, 'id,email');
  const d = await C.checkDns(a.email); if (!d) return { ok: false, error: 'DNS-Prüfung gerade nicht möglich.' };
  await q(sb().from('accounts').update({ dns: d }).eq('id', a.id)); return { ok: true, dns: d };
});
route('POST', '/api/test-send', async (b, p, qs, ctx) => {
  if (limited('test:' + ctx.user.id, 20, 60 * 60e3)) throw err(429, 'Zu viele Testmails – bitte später erneut.');
  const a = await own('accounts', b.accountId, ctx.ws);
  const to = String(b.to || '').trim();
  if (!EMAIL.test(to)) return { ok: false, error: 'Empfänger-Adresse ungültig.' };
  const { ws, st } = await C.wsSettings(ctx.ws);
  try {
    const info = await C.sendMail(a, { from: a.name ? { name: a.name, address: a.email } : a.email, to, subject: String(b.subject || '[TEST]').slice(0, 300), ...C.compose(a, st, String(b.text || '').slice(0, 20000)) });
    st.testTo = to; st.onb = { ...st.onb, testmail: true };
    await q(sb().from('workspaces').update({ settings: st }).eq('id', ws.id));
    await q(sb().from('sends').insert({ ws_id: ctx.ws, account_id: a.id, test: true, message_id: info.messageId }));
    return { ok: true, messageId: info.messageId };
  } catch (e) { return { ok: false, error: C.friendly(e) }; }
});

/* ---------- Google Workspace Admin-Verbindung ---------- */
route('GET', '/api/gworkspace', async (b, p, qs, ctx) => {
  if (ctx.role !== 'owner') throw err(403, 'Nur der Inhaber.');
  return { ok: true, ...C.GWS.info(), mfa: ctx.aal === 'aal2' };
});
route('POST', '/api/gworkspace/accounts', async (b, p, qs, ctx) => {
  if (ctx.role !== 'owner') throw err(403, 'Nur der Inhaber kann Postfächer per Admin-Verbindung hinzufügen.');
  if (ctx.aal !== 'aal2') throw err(403, 'Aus Sicherheitsgründen nur mit eingeschalteter Zwei-Faktor-Anmeldung möglich.');
  if (!C.GWS.info().configured) return { ok: false, error: 'Admin-Verbindung ist noch nicht eingerichtet.' };
  if (limited('gws:' + ctx.user.id, 30, 10 * 60e3)) throw err(429, 'Zu viele Versuche – bitte kurz warten.');
  const emails = [...new Set((Array.isArray(b.emails) ? b.emails : []).map(x => String(x).trim().toLowerCase()).filter(Boolean))].slice(0, 25);
  const results = [];
  for (const email of emails) {
    if (!EMAIL.test(email)) { results.push({ email, ok: false, error: 'Ungültige Adresse' }); continue; }
    if (!C.GWS.allowedEmail(email)) { results.push({ email, ok: false, error: 'Domain nicht freigegeben' }); continue; }
    try { await C.GWS.verify(email); } catch (e) { results.push({ email, ok: false, error: e.message }); continue; }
    const row = { ws_id: ctx.ws, email, name: String((b.names || {})[email] || b.name || '').trim().slice(0, 80), provider: 'gworkspace', auth_type: 'gworkspace', smtp_host: 'gmail-api', smtp_port: 443, imap_host: 'gmail-api', imap_port: 443, pass_enc: null, status: 'ok', error: null, imap_error: null };
    const existing = await q(sb().from('accounts').select('id').eq('ws_id', ctx.ws).eq('email', email).maybeSingle());
    const a = existing ? await q(sb().from('accounts').update(row).eq('id', existing.id).select('id').single()) : await q(sb().from('accounts').insert(row).select('id').single());
    try { const d = await C.checkDns(email); if (d) await q(sb().from('accounts').update({ dns: d }).eq('id', a.id)); } catch (e) {}
    await C.audit(ctx.ws, ctx, 'account_added', email + ' (Admin-Verbindung)');
    results.push({ email, ok: true, id: a.id });
  }
  return { ok: true, results };
});

/* ---------- Listen & Leads ---------- */
async function importRows(ctx, listId, rows, sourceLabel) {
  const existing = new Set();
  for (let from = 0; ; from += 1000) { const r = await q(sb().from('leads').select('email').eq('list_id', listId).range(from, from + 999)); r.forEach(x => existing.add(x.email)); if (r.length < 1000) break; }
  const blocked = new Set((await q(sb().from('blocklist').select('value').eq('ws_id', ctx.ws).limit(50000))).map(x => x.value));
  const res = { imported: 0, duplicates: 0, invalid: 0, blocked: 0, missing: 0, role: 0 };
  const fresh = [];
  const s = (v, n = 200) => String(v || '').trim().slice(0, n);
  for (const r of rows) {
    const email = s(r.email, 254).toLowerCase();
    if (!email) { res.missing++; continue; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { res.invalid++; continue; }
    if (existing.has(email)) { res.duplicates++; continue; }
    if (blocked.has(email) || blocked.has('@' + C.domainOf(email))) { res.blocked++; continue; }
    existing.add(email);
    fresh.push({ ws_id: ctx.ws, list_id: listId, email, first: s(r.first), last: s(r.last), company: s(r.company), city: s(r.city), industry: s(r.industry), phone: s(r.phone, 60), website: s(r.website, 500) || null, source: s(r.source, 200) || sourceLabel });
  }
  const domains = [...new Set(fresh.map(l => C.domainOf(l.email)))], ok = {};
  for (let i = 0; i < domains.length; i += 20) { const part = domains.slice(i, i + 20); const rr = await Promise.all(part.map(C.mxOk)); part.forEach((d, j) => ok[d] = rr[j]); }
  const good = [];
  for (const l of fresh) { if (!ok[C.domainOf(l.email)]) { res.invalid++; continue; } l.email_check = C.ROLE.test(l.email) ? 'role' : 'valid'; if (l.email_check === 'role') res.role++; good.push(l); }
  for (let i = 0; i < good.length; i += 500) await q(sb().from('leads').upsert(good.slice(i, i + 500), { onConflict: 'list_id,email', ignoreDuplicates: true }));
  res.imported = good.length; res.importedEmails = good.map(l => l.email);
  const camps = await q(sb().from('campaigns').select('*').eq('ws_id', ctx.ws).contains('lists', [listId]).neq('status', 'draft'));
  for (const c of camps) await C.ensureEnroll(c);
  return res;
}
async function targetList(ctx, b) {
  let listId = b.listId;
  if (!listId || listId === 'new') listId = (await q(sb().from('lists').insert({ ws_id: ctx.ws, name: String(b.listName || 'Neue Liste').trim().slice(0, 80) || 'Neue Liste' }).select('id').single())).id;
  else await own('lists', listId, ctx.ws, 'id');
  return listId;
}
route('POST', '/api/import', async (b, p, qs, ctx) => {
  const listId = await targetList(ctx, b);
  const rows = Array.isArray(b.rows) ? b.rows.slice(0, 20000) : [];
  const res = await importRows(ctx, listId, rows, `Import „${String(b.fileName || 'CSV').slice(0, 120)}“`);
  delete res.importedEmails;
  return { ok: true, listId, ...res };
});

/* ---------- Lead-Finder ---------- */
const F = require('./finder'); F.setDb(sb);
const jobView = j => ({ id: j.id, source: j.source, category: j.category, keyword: j.keyword, location: j.location, radius: j.radius_km, max: j.max_results, label: j.label, status: j.status, total: j.total, withEmail: j.with_email, withPhone: j.with_phone, withWebsite: j.with_website, crawled: j.crawled, error: j.error, attempts: j.attempts, nextTry: j.next_try_at, createdAt: j.created_at, center: j.center });
const resView = r => ({ id: r.id, jobId: r.job_id, name: r.name, category: r.category, street: r.street, postcode: r.postcode, city: r.city, country: r.country, lat: r.lat, lon: r.lon, distance: r.distance_km, phone: r.phone, website: r.website, email: r.email, emails: r.emails || [], contact: r.contact_first ? { first: r.contact_first, last: r.contact_last, role: r.contact_role } : null, socials: r.socials || {}, opening: r.opening, rating: r.rating, reviews: r.reviews, crawl: r.crawl_status, crawlError: r.crawl_error, imported: !!r.imported_at, importedList: r.imported_list, createdAt: r.created_at });
function finderQuery(ctx, qs, cols) {
  let qb = sb().from('finder_results').select(cols, { count: 'exact' }).eq('ws_id', ctx.ws);
  if (qs.job && qs.job !== 'all') qb = qb.eq('job_id', id(qs.job));
  const has = String(qs.has || '').split(',').filter(Boolean);
  if (has.includes('email')) qb = qb.not('email', 'is', null);
  if (has.includes('phone')) qb = qb.neq('phone', '');
  if (has.includes('website')) qb = qb.neq('website', '');
  if (has.includes('contact')) qb = qb.not('contact_first', 'is', null);
  if (qs.imported === 'no') qb = qb.is('imported_at', null);
  if (qs.imported === 'yes') qb = qb.not('imported_at', 'is', null);
  if (qs.city) qb = qb.eq('city', String(qs.city).slice(0, 100));
  if (qs.category) qb = qb.eq('category', String(qs.category).slice(0, 100));
  const term = String(qs.q || '').replace(/[%,()*\\]/g, ' ').trim().slice(0, 60);
  if (term) qb = qb.or(['name', 'email', 'city', 'street', 'website', 'contact_last'].map(c => `${c}.ilike.%${term}%`).join(','));
  return qb;
}
route('GET', '/api/finder', async (b, p, qs, ctx) => {
  const jobs = await q(sb().from('finder_jobs').select('*').eq('ws_id', ctx.ws).order('created_at', { ascending: false }).limit(100));
  return { ok: true, jobs: jobs.map(jobView), categories: F.CATS.map(c => ({ key: c.key, label: c.label, group: c.group })), sources: F.sources() };
});
route('POST', '/api/finder/search', async (b, p, qs, ctx) => {
  if (limited('finder:' + ctx.ws, 20, 3600e3)) throw err(429, 'Maximal 20 Suchen pro Stunde – bitte etwas warten.');
  const cat = F.catByKey(b.category), keyword = F.cleanKw(b.keyword), location = String(b.location || '').trim().slice(0, 100);
  if (!cat && !keyword) throw err(400, 'Bitte eine Branche wählen oder einen Suchbegriff eingeben.');
  if (location.length < 2) throw err(400, 'Bitte einen Ort eingeben.');
  const src = F.sources(); const source = b.source === 'osm' || !src.google ? 'osm' : 'google';
  const radius = Math.max(1, Math.min(100, Math.round(Number(b.radius) || 15))), max = Math.max(10, Math.min(500, Math.round(Number(b.max) || 100)));
  const label = `${keyword || cat.label} · ${location} · ${radius} km`;
  const job = await q(sb().from('finder_jobs').insert({ ws_id: ctx.ws, created_by: ctx.user.id, source, category: cat ? cat.key : null, keyword: keyword || null, location, radius_km: radius, max_results: max, label }).select('*').single());
  await C.audit(ctx.ws, ctx, 'finder_search', label);
  const r = await F.process(Date.now() + 40000, ctx.ws, job.id).catch(e => ({ error: e.message }));
  const fresh = await q(sb().from('finder_jobs').select('*').eq('id', job.id).single());
  return { ok: true, job: jobView(fresh), step: r };
});
route('POST', '/api/finder/jobs/:jid/step', async (b, p, qs, ctx) => {
  const j = await own('finder_jobs', id(p.jid), ctx.ws);
  if (['queued', 'crawling'].includes(j.status)) await F.process(Date.now() + 22000, ctx.ws, j.id);
  return { ok: true, job: jobView(await q(sb().from('finder_jobs').select('*').eq('id', j.id).single())) };
});
route('POST', '/api/finder/jobs/:jid/retry', async (b, p, qs, ctx) => {
  const j = await own('finder_jobs', id(p.jid), ctx.ws);
  if (j.status === 'error' || j.status === 'queued') await q(sb().from('finder_jobs').update({ status: 'queued', attempts: 0, error: null, next_try_at: new Date().toISOString() }).eq('id', j.id));
  return { ok: true };
});
route('DELETE', '/api/finder/jobs/:jid', async (b, p, qs, ctx) => {
  const j = await own('finder_jobs', id(p.jid), ctx.ws, 'id,label');
  await q(sb().from('finder_jobs').delete().eq('id', j.id));
  return { ok: true };
});
const RES_COLS = 'id,job_id,name,category,street,postcode,city,country,lat,lon,distance_km,phone,website,email,emails,contact_first,contact_last,contact_role,socials,opening,rating,reviews,crawl_status,crawl_error,imported_at,imported_list,created_at';
route('GET', '/api/finder/results', async (b, p, qs, ctx) => {
  const limit = Math.min(500, Math.max(1, Number(qs.limit) || 100)), offset = Math.max(0, Number(qs.offset) || 0);
  const sortCols = { name: ['name', true], distance: ['distance_km', true], city: ['city', true], newest: ['created_at', false], rating: ['reviews', false] };
  const [col, asc] = sortCols[qs.sort] || sortCols.distance;
  const { data, error, count } = await finderQuery(ctx, qs, RES_COLS).order(col, { ascending: asc, nullsFirst: false }).range(offset, offset + limit - 1);
  if (error) { const e = new Error(error.message); e.db = true; throw e; }
  let facets = { cities: [], categories: [] };
  if (!offset) {
    let fq = sb().from('finder_results').select('city,category').eq('ws_id', ctx.ws).limit(5000);
    if (qs.job && qs.job !== 'all') fq = fq.eq('job_id', id(qs.job));
    const all = await q(fq); const cnt = k => { const m = {}; all.forEach(r => { if (r[k]) m[r[k]] = (m[r[k]] || 0) + 1; }); return Object.entries(m).sort((a, c) => c[1] - a[1]).slice(0, 40).map(([v, n]) => ({ v, n })); };
    facets = { cities: cnt('city'), categories: cnt('category') };
  }
  return { ok: true, rows: (data || []).map(resView), total: count || 0, facets };
});
route('GET', '/api/finder/results/:rid', async (b, p, qs, ctx) => {
  const r = await own('finder_results', id(p.rid), ctx.ws, RES_COLS + ',ws_id');
  let list = null; if (r.imported_list) list = await q(sb().from('lists').select('id,name').eq('id', r.imported_list).maybeSingle());
  return { ok: true, result: { ...resView(r), list } };
});
const idList = v => (Array.isArray(v) ? v : []).slice(0, 2000).map(x => id(x));
route('POST', '/api/finder/results/recrawl', async (b, p, qs, ctx) => {
  const ids = idList(b.ids); if (!ids.length) return { ok: true, n: 0 };
  await q(sb().from('finder_results').update({ crawl_status: 'pending', crawl_error: null }).eq('ws_id', ctx.ws).in('id', ids).neq('website', ''));
  const jobs = await q(sb().from('finder_results').select('job_id').eq('ws_id', ctx.ws).in('id', ids));
  for (const j of new Set(jobs.map(x => x.job_id))) await q(sb().from('finder_jobs').update({ status: 'crawling' }).eq('id', j).eq('ws_id', ctx.ws).in('status', ['done', 'crawling']));
  return { ok: true, n: ids.length };
});
route('POST', '/api/finder/results/delete', async (b, p, qs, ctx) => {
  const ids = idList(b.ids); if (!ids.length) return { ok: true };
  const jobs = await q(sb().from('finder_results').select('job_id').eq('ws_id', ctx.ws).in('id', ids));
  await q(sb().from('finder_results').delete().eq('ws_id', ctx.ws).in('id', ids));
  for (const j of new Set(jobs.map(x => x.job_id))) await F.updateCounts(j);
  return { ok: true };
});
route('POST', '/api/finder/import', async (b, p, qs, ctx) => {
  let rows;
  if (Array.isArray(b.ids) && b.ids.length) rows = await q(sb().from('finder_results').select(RES_COLS).eq('ws_id', ctx.ws).in('id', idList(b.ids)));
  else { const { data, error } = await finderQuery(ctx, b.filter || {}, RES_COLS).limit(5000); if (error) throw err(500, error.message); rows = data; }
  const withMail = rows.filter(r => r.email);
  if (!withMail.length) return { ok: false, error: 'Keiner der ausgewählten Firmen hat eine E-Mail-Adresse.' };
  const listId = await targetList(ctx, b);
  const res = await importRows(ctx, listId, withMail.map(r => ({ email: r.email, first: r.contact_first, last: r.contact_last, company: r.name, city: r.city, industry: r.category, phone: r.phone, website: r.website })), 'Lead-Finder');
  const okSet = new Set(res.importedEmails); delete res.importedEmails;
  const done = withMail.filter(r => okSet.has(r.email)).map(r => r.id);
  for (let i = 0; i < done.length; i += 200) await q(sb().from('finder_results').update({ imported_at: new Date().toISOString(), imported_list: listId }).in('id', done.slice(i, i + 200)));
  let campaign = null;
  if (b.campaign && res.imported + res.duplicates > 0) {
    // passende Branchen-Vorlage über die Suche ermitteln, aus der die meisten Firmen stammen
    const cnt = {}; withMail.forEach(r => { cnt[r.job_id] = (cnt[r.job_id] || 0) + 1; });
    const jobId = Object.keys(cnt).sort((a, c) => cnt[c] - cnt[a])[0];
    const job = jobId ? await q(sb().from('finder_jobs').select('category,label').eq('id', jobId).eq('ws_id', ctx.ws).maybeSingle()) : null;
    const t = TPL.forCategory(job && job.category);
    const list = await q(sb().from('lists').select('name').eq('id', listId).single());
    const c = await createCampaign(ctx, list.name, TPL.steps(t), [listId]);
    campaign = { id: c.id, template: t.name };
    await C.audit(ctx.ws, ctx, 'campaign_created', list.name + ' (Lead-Finder, Vorlage ' + t.name + ')');
  }
  return { ok: true, listId, campaign, noEmail: rows.length - withMail.length, ...res };
});
route('GET', '/api/finder/export', async (b, p, qs, ctx) => {
  const { data, error } = await finderQuery(ctx, qs, RES_COLS).order('distance_km', { ascending: true }).limit(5000);
  if (error) throw err(500, error.message);
  const lines = [['Firma', 'Branche', 'Ansprechpartner', 'Funktion', 'Telefon', 'E-Mail', 'Weitere E-Mails', 'Website', 'Straße', 'PLZ', 'Ort', 'Land', 'Entfernung km', 'Bewertung', 'Bewertungen', 'Facebook', 'Instagram', 'LinkedIn'].join(';')];
  for (const r of data) lines.push([r.name, r.category, [r.contact_first, r.contact_last].filter(Boolean).join(' '), r.contact_role, r.phone, r.email, (r.emails || []).slice(1).join(', '), r.website, r.street, r.postcode, r.city, r.country, r.distance_km, r.rating, r.reviews, (r.socials || {}).facebook, (r.socials || {}).instagram, (r.socials || {}).linkedin].map(csvCell).join(';'));
  return { __csv: '\ufeff' + lines.join('\r\n'), filename: 'lead-finder.csv' };
});

route('GET', '/api/leads', async (b, p, qs, ctx) => {
  const r = await q(sb().rpc('leads_page', { p_ws: ctx.ws, p_list: qs.list && qs.list !== 'all' ? id(qs.list) : null, p_q: String(qs.q || '').slice(0, 100), p_status: qs.status || 'all', p_limit: Math.min(1000, Number(qs.limit) || 300) }));
  return { ok: true, total: r.total, leads: r.leads };
});
route('GET', '/api/leads/:id', async (b, p, qs, ctx) => {
  const l = await own('leads', p.id, ctx.ws);
  const list = await q(sb().from('lists').select('name').eq('id', l.list_id).maybeSingle());
  const en = await q(sb().from('enrollments').select('*, campaigns(name,steps), accounts(email)').eq('lead_id', l.id).order('created_at'));
  return { ok: true, lead: { id: l.id, email: l.email, first: l.first, last: l.last, company: l.company, city: l.city, phone: l.phone, website: l.website, icebreaker: l.icebreaker || '', iceStatus: l.ice_status || null, source: l.source, createdAt: l.created_at, list: list && list.name, blocked: await C.isBlocked(l.email, ctx.ws) },
    enroll: en.map(e => ({ id: e.id, status: e.status, step: e.step, nextAt: e.next_at, history: e.history, campaign: e.campaigns && e.campaigns.name, account: e.accounts && e.accounts.email, steps: ((e.campaigns && e.campaigns.steps) || []).map(s => s.name) })) };
});
route('DELETE', '/api/leads/:id', async (b, p, qs, ctx) => { const l = await own('leads', p.id, ctx.ws, 'id'); await q(sb().from('leads').delete().eq('id', l.id)); return { ok: true }; });
async function stopLead(leadId, text) {
  const ens = await q(sb().from('enrollments').select('*').eq('lead_id', leadId).in('status', ['pending', 'active']));
  for (const e of ens) await C.updEnroll(e, { status: 'stopped', next_at: null, history: [...(e.history || []), { type: 'stopped', at: nowIso(), text }] });
}
route('POST', '/api/leads/:id/block', async (b, p, qs, ctx) => { const l = await own('leads', p.id, ctx.ws, 'id,email'); await C.addBlock(l.email, ctx.ws, 'manuell'); await stopLead(l.id, 'Manuell gesperrt'); return { ok: true }; });
route('POST', '/api/leads/:id/stop', async (b, p, qs, ctx) => { const l = await own('leads', p.id, ctx.ws, 'id'); await stopLead(l.id, 'Sequenz manuell gestoppt'); return { ok: true }; });
route('PATCH', '/api/lists/:id', async (b, p, qs, ctx) => { const l = await own('lists', p.id, ctx.ws, 'id'); if (b.name) await q(sb().from('lists').update({ name: String(b.name).trim().slice(0, 80) }).eq('id', l.id)); return { ok: true }; });
route('DELETE', '/api/lists/:id', async (b, p, qs, ctx) => {
  const l = await own('lists', p.id, ctx.ws, 'id');
  const active = await cnt(sb().from('campaigns').select('id', { count: 'exact', head: true }).eq('ws_id', ctx.ws).eq('status', 'active').contains('lists', [l.id]));
  if (active) return { ok: false, error: 'Liste wird in einer aktiven Kampagne verwendet.' };
  const camps = await q(sb().from('campaigns').select('id,lists').eq('ws_id', ctx.ws).contains('lists', [l.id]));
  for (const c of camps) await q(sb().from('campaigns').update({ lists: c.lists.filter(x => x !== l.id) }).eq('id', c.id));
  await q(sb().from('lists').delete().eq('id', l.id)); return { ok: true };
});

/* ---------- Kampagnen ---------- */
async function createCampaign(ctx, name, steps, lists) {
  const okLists = lists.length ? (await q(sb().from('lists').select('id').eq('ws_id', ctx.ws).in('id', lists))).map(x => x.id) : [];
  const accs = (await q(sb().from('accounts').select('id').eq('ws_id', ctx.ws).eq('status', 'ok'))).map(x => x.id);
  return q(sb().from('campaigns').insert({ ws_id: ctx.ws, name: String(name || 'Neue Kampagne').trim().slice(0, 100) || 'Neue Kampagne', lists: okLists, accounts: accs, steps, daily_new: 50, stop_company: true,
    schedule: { days: [1, 1, 1, 1, 1, 0, 0], from: '08:00', to: '16:30', timezone: '', minGap: 4, maxGap: 11 } }).select('id').single());
}
route('POST', '/api/campaigns', async (b, p, qs, ctx) => {
  let steps = DEFAULT_STEPS();
  if (b.templateId) { const t = await own('templates', b.templateId, ctx.ws); if (t.type === 'seq' && Array.isArray(t.steps)) steps = t.steps; }
  const lists = Array.isArray(b.lists) ? b.lists.filter(x => UUID.test(x)) : [];
  const c = await createCampaign(ctx, b.name, steps, lists);
  return { ok: true, id: c.id };
});
route('POST', '/api/templates/industry', async (b, p, qs, ctx) => {
  const have = new Set((await q(sb().from('templates').select('name').eq('ws_id', ctx.ws))).map(t => t.name));
  const add = TPL.all(ctx.ws).filter(t => !have.has(t.name));
  if (add.length) await q(sb().from('templates').insert(add));
  return { ok: true, added: add.length };
});
route('PATCH', '/api/campaigns/:id', async (b, p, qs, ctx) => {
  const c = await own('campaigns', p.id, ctx.ws); const patch = {};
  if (b.name !== undefined) patch.name = String(b.name).trim().slice(0, 100) || c.name;
  if (Array.isArray(b.steps) && b.steps.length && b.steps.length <= 8) patch.steps = b.steps.map((s, i) => ({ name: i === 0 ? 'Mail 1' : 'Follow-up ' + i, wait: i === 0 ? 0 : Math.max(1, Math.min(60, Number(s.wait) || 3)), thread: i === 0 ? false : !!s.thread, subject: String(s.subject || '').slice(0, 300), body: String(s.body || '').slice(0, 20000) }));
  if (Array.isArray(b.accounts)) { const ids = b.accounts.filter(x => UUID.test(x)); patch.accounts = ids.length ? (await q(sb().from('accounts').select('id').eq('ws_id', ctx.ws).in('id', ids))).map(x => x.id) : []; }
  if (Array.isArray(b.lists)) { const ids = b.lists.filter(x => UUID.test(x)); patch.lists = ids.length ? (await q(sb().from('lists').select('id').eq('ws_id', ctx.ws).in('id', ids))).map(x => x.id) : []; }
  if (b.schedule && typeof b.schedule === 'object') {
    const s = { ...(c.schedule || {}) }, n = b.schedule;
    if (Array.isArray(n.days) && n.days.length === 7) s.days = n.days.map(x => x ? 1 : 0);
    const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (HM.test(n.from || '')) s.from = n.from; if (HM.test(n.to || '')) s.to = n.to;
    if (n.allDay !== undefined) s.allDay = !!n.allDay;
    if (n.timezone !== undefined) s.timezone = ['', 'Europe/Vienna', 'Europe/Berlin', 'Europe/Zurich', 'Europe/Belgrade'].includes(n.timezone) ? n.timezone : '';
    if (n.minGap !== undefined) s.minGap = Math.max(0, Math.min(120, Number(n.minGap) || 0));
    if (n.maxGap !== undefined) s.maxGap = Math.max(0, Math.min(240, Number(n.maxGap) || 0));
    patch.schedule = s;
  }
  if (b.dailyNew !== undefined) patch.daily_new = Math.max(1, Math.min(1000, Number(b.dailyNew) || 50));
  if (b.stopCompany !== undefined) patch.stop_company = !!b.stopCompany;
  const upd = await q(sb().from('campaigns').update(patch).eq('id', c.id).select('*').single());
  if (patch.lists && upd.status !== 'draft') await C.ensureEnroll(upd);
  return { ok: true };
});
route('DELETE', '/api/campaigns/:id', async (b, p, qs, ctx) => { const c = await own('campaigns', p.id, ctx.ws, 'id,name'); await q(sb().from('campaigns').delete().eq('id', c.id)); await C.audit(ctx.ws, ctx, 'campaign_deleted', c.name); return { ok: true }; });
async function startCheck(c, ws) {
  const out = []; const { st } = await C.wsSettings(ws);
  const accs = c.accounts.length ? await q(sb().from('accounts').select('*').in('id', c.accounts)) : [];
  if (!accs.length) out.push({ level: 'error', text: 'Keine Absender-Konten ausgewählt' });
  else if (accs.some(a => a.status !== 'ok')) out.push({ level: 'error', text: 'Ein Absender-Konto ist getrennt oder pausiert: ' + accs.filter(a => a.status !== 'ok').map(a => a.email).join(', ') });
  else out.push({ level: 'ok', text: `${accs.length} Absender-Konten verbunden` });
  if (accs.some(a => a.imap_error)) out.push({ level: 'warn', text: 'Bei einem Konto klappt IMAP nicht – Antworten werden dort nicht erkannt' });
  const leadCount = c.lists.length ? await cnt(sb().from('leads').select('id', { count: 'exact', head: true }).in('list_id', c.lists)) : 0;
  if (!leadCount) out.push({ level: 'error', text: 'Keine Lead-Liste mit Kontakten ausgewählt' }); else out.push({ level: 'ok', text: `${leadCount} Leads in ${c.lists.length} Liste(n)` });
  if (!c.steps.length || !String(c.steps[0].subject || '').trim()) out.push({ level: 'error', text: 'Mail 1 braucht einen Betreff' });
  if (c.steps.some(s => !String(s.body || '').trim())) out.push({ level: 'error', text: 'Ein Schritt hat keinen Text' });
  if (c.steps.some(s => /\[Dein Angebot/.test(s.body))) out.push({ level: 'error', text: 'Platzhalter „[Dein Angebot …]“ noch nicht ersetzt' });
  const spam = C.SPAM.filter(w => c.steps.some(s => (s.subject + ' ' + s.body).toLowerCase().includes(w)));
  out.push(spam.length ? { level: 'warn', text: 'Spam-Wörter im Text: ' + spam.join(', ') } : { level: 'ok', text: 'Keine Spam-Wörter' });
  if (!String(st.footer || '').trim()) out.push({ level: 'error', text: 'Fußzeile mit Abmelde-Hinweis fehlt (Einstellungen)' }); else out.push({ level: 'ok', text: 'Fußzeile mit Abmelde-Hinweis vorhanden' });
  if (leadCount && c.steps.some(s => /\{(Vorname|Anrede)\}/.test(s.body))) { const nf = await cnt(sb().from('leads').select('id', { count: 'exact', head: true }).in('list_id', c.lists).eq('first', '')); if (nf) out.push({ level: 'ok', text: `${nf} Leads ohne Ansprechpartner – sie bekommen „Sehr geehrte Damen und Herren“` }); }
  const sc = c.schedule || {};
  if (!(sc.days || []).some(Boolean)) out.push({ level: 'error', text: 'Kein Versandtag gewählt (Tab Zeitplan)' });
  else out.push({ level: 'ok', text: 'Zeitplan: ' + C.schedText(sc) });
  const cap = accs.filter(a => a.status === 'ok').reduce((s, a) => s + C.accLimit(a), 0);
  out.push({ level: 'ok', text: `Limits passen zur Warm-up-Phase (heute max. ${cap} Mails über alle Konten)` });
  return out;
}
/* ---------------- KI (OpenAI) ---------------- */
const AI = require('./ai');
const aiLimit = ctx => { if (limited('ai:' + ctx.ws, 40, 60e3)) throw err(429, 'Zu viele KI-Anfragen – bitte kurz warten.'); };
route('GET', '/api/ai', async (b, p, qs, ctx) => {
  const since = new Date(); since.setUTCDate(1); since.setUTCHours(0, 0, 0, 0);
  const rows = await q(sb().from('ai_usage').select('kind,tokens_in,tokens_out').eq('ws_id', ctx.ws).gte('at', since.toISOString()).limit(20000));
  const u = rows.reduce((s, r) => { s.calls++; s.tin += r.tokens_in; s.tout += r.tokens_out; s.by[r.kind] = (s.by[r.kind] || 0) + 1; return s; }, { calls: 0, tin: 0, tout: 0, by: {} });
  return { ok: true, ...AI.info(), usage: { calls: u.calls, tokensIn: u.tin, tokensOut: u.tout, byKind: u.by, costUsd: Math.round((u.tin * 0.75 + u.tout * 4.5) / 1e6 * 100) / 100 } };
});
route('POST', '/api/ai/sequence', async (b, p, qs, ctx) => { aiLimit(ctx); const { st } = await C.wsSettings(ctx.ws); return { ok: true, steps: await AI.sequence(ctx.ws, st, b) }; });
route('POST', '/api/ai/rewrite', async (b, p, qs, ctx) => { aiLimit(ctx); if (!String(b.body || '').trim()) throw err(400, 'Kein Text zum Umschreiben.'); const { st } = await C.wsSettings(ctx.ws); return { ok: true, ...(await AI.rewrite(ctx.ws, st, b)) }; });
route('POST', '/api/ai/reply', async (b, p, qs, ctx) => {
  aiLimit(ctx);
  const m = await own('inbox', b.id, ctx.ws);
  const { st } = await C.wsSettings(ctx.ws);
  const e = m.enroll_id ? await q(sb().from('enrollments').select('history').eq('id', m.enroll_id).maybeSingle()) : null;
  const last = e && Array.isArray(e.history) ? [...e.history].reverse().find(h => h.type === 'sent' || h.type === 'manual') : null;
  const a = m.account_id ? await q(sb().from('accounts').select('name').eq('id', m.account_id).maybeSingle()) : null;
  const text = await AI.reply(ctx.ws, st, { from: m.from_name || m.from_addr, company: m.company, subject: m.subject, text: C.stripQuote(m.text), history: last ? last.text : '', senderName: (a && a.name) || '' });
  return { ok: true, text };
});
// KI-Einstiege (persönlicher erster Satz aus der Website)
async function iceScope(ctx, b) {
  if (b.listId && UUID.test(b.listId)) return { lists: [(await own('lists', b.listId, ctx.ws, 'id')).id] };
  if (b.campaignId && UUID.test(b.campaignId)) { const c = await own('campaigns', b.campaignId, ctx.ws, 'id,lists'); return { lists: c.lists || [] }; }
  return { lists: null };
}
const scoped = (qy, sc) => sc.lists ? qy.in('list_id', sc.lists.length ? sc.lists : ['00000000-0000-0000-0000-000000000000']) : qy;
async function iceStatus(ctx, sc) {
  const base = () => scoped(sb().from('leads').select('id', { count: 'exact', head: true }).eq('ws_id', ctx.ws), sc);
  const [total, web, done, queued, working, skipped, error] = await Promise.all([cnt(base()), cnt(base().neq('website', '').not('website', 'is', null)), cnt(base().eq('ice_status', 'done')), cnt(base().eq('ice_status', 'queued')), cnt(base().eq('ice_status', 'working')), cnt(base().eq('ice_status', 'skipped')), cnt(base().eq('ice_status', 'error'))]);
  return { total, withWebsite: web, done, queued: queued + working, skipped, error, configured: AI.configured() };
}
route('GET', '/api/ai/icebreakers', async (b, p, qs, ctx) => ({ ok: true, ...(await iceStatus(ctx, await iceScope(ctx, qs))) }));
route('POST', '/api/ai/icebreakers', async (b, p, qs, ctx) => {
  if (!AI.configured()) throw err(503, 'KI ist noch nicht eingerichtet: OPENAI_KEY fehlt in Vercel.');
  if (limited('ice:' + ctx.ws, 10, 60e3)) throw err(429, 'Bitte kurz warten.');
  const sc = await iceScope(ctx, b);
  let qy = scoped(sb().from('leads').update({ ice_status: 'queued', ice_at: nowIso() }).eq('ws_id', ctx.ws).neq('website', '').not('website', 'is', null), sc);
  qy = b.redo ? qy.not('ice_status', 'in', '("queued","working")') : qy.or('ice_status.is.null,ice_status.eq.error');
  const rows = await q(qy.select('id'));
  return { ok: true, queued: rows.length, ...(await iceStatus(ctx, sc)) };
});
route('POST', '/api/ai/icebreakers/step', async (b, p, qs, ctx) => {
  const sc = await iceScope(ctx, b);
  let lastErr = '';
  await AI.processIcebreakers(Date.now() + 45000, ctx.ws).catch(e => { if (e instanceof AI.AiError) lastErr = e.message; else throw e; });
  return { ok: true, error: lastErr || undefined, ...(await iceStatus(ctx, sc)) };
});
route('POST', '/api/leads/:id/icebreaker', async (b, p, qs, ctx) => {
  const l = await own('leads', p.id, ctx.ws, 'id,company,city,industry,website');
  if (b.text !== undefined) { const t = String(b.text).replace(/\s+/g, ' ').trim().slice(0, 400); await q(sb().from('leads').update({ icebreaker: t || null, ice_status: t ? 'done' : null, ice_at: nowIso() }).eq('id', l.id)); return { ok: true, text: t }; }
  aiLimit(ctx);
  const { st } = await C.wsSettings(ctx.ws);
  const r = await AI.icebreaker(ctx.ws, st, l);
  await q(sb().from('leads').update({ icebreaker: r.text || null, ice_status: r.text ? 'done' : 'skipped', ice_at: nowIso() }).eq('id', l.id));
  return { ok: true, text: r.text, reason: r.reason };
});

/* ---------------- Signatur ---------------- */
route('POST', '/api/signature', async (b, p, qs, ctx) => {
  const html = C.cleanSig(b.html);
  if (b.accountId) { const a = await own('accounts', b.accountId, ctx.ws, 'id'); await q(sb().from('accounts').update({ signature: html || null }).eq('id', a.id)); return { ok: true, html }; }
  const { ws, st } = await C.wsSettings(ctx.ws); st.signature = { html };
  await q(sb().from('workspaces').update({ settings: st }).eq('id', ws.id));
  return { ok: true, html };
});
route('POST', '/api/signature/import', async (b, p, qs, ctx) => {
  const a = await own('accounts', b.accountId, ctx.ws, 'id,email,auth_type');
  if (a.auth_type !== 'gworkspace') return { ok: false, error: 'Import geht nur bei Konten mit Google-Admin-Verbindung. Sonst die Signatur einfach hineinkopieren.' };
  try { const raw = await C.GWS.getSignature(a.email); const html = C.cleanSig(raw); return html ? { ok: true, html } : { ok: false, error: `In Gmail ist bei ${a.email} keine Signatur hinterlegt.` }; }
  catch (e) { return { ok: false, error: C.friendly(e) }; }
});
route('POST', '/api/signature/push', async (b, p, qs, ctx) => {
  if (ctx.role !== 'owner') throw err(403, 'Nur der Inhaber kann das.');
  if (limited('sigpush:' + ctx.ws, 5, 60 * 60e3)) throw err(429, 'Bitte später erneut versuchen.');
  const { st } = await C.wsSettings(ctx.ws);
  const accs = await q(sb().from('accounts').select('id,email,name,signature,auth_type').eq('ws_id', ctx.ws).eq('auth_type', 'gworkspace'));
  const out = [];
  for (const a of accs) {
    const html = C.sigFor(a, st); if (!html) { out.push({ email: a.email, ok: false, error: 'Keine Signatur' }); continue; }
    try { await C.GWS.setSignature(a.email, html); out.push({ email: a.email, ok: true }); }
    catch (e) { if (e.message === 'SCOPE_MISSING') return { ok: false, scopeMissing: true, scope: e.scope, clientId: C.GWS.info().clientId }; out.push({ email: a.email, ok: false, error: C.friendly(e) }); }
  }
  await C.audit(ctx.ws, ctx, 'signature_pushed', out.filter(x => x.ok).map(x => x.email).join(', '));
  return { ok: true, results: out };
});

/* ---------------- Live-Versand (Übersicht) ---------------- */
route('GET', '/api/live', async (b, p, qs, ctx) => {
  const { st } = await C.wsSettings(ctx.ws); const tz = st.timezone || 'Europe/Vienna';
  const now = Date.now(), dayStart = C.startOfLocalDay(tz), tomorrow = new Date(dayStart).getTime() + 864e5;
  const [accs, camps, recent, today] = await Promise.all([
    q(sb().from('accounts').select('id,email,name,status,warmup,warmup_start,max_per_day,next_send_at').eq('ws_id', ctx.ws)),
    q(sb().from('campaigns').select('id,name,status,steps,schedule,accounts,daily_new').eq('ws_id', ctx.ws).in('status', ['active', 'paused'])),
    q(sb().from('sends').select('id,account_id,campaign_id,lead_id,enroll_id,step,at,test').eq('ws_id', ctx.ws).order('at', { ascending: false }).limit(25)),
    q(sb().from('sends').select('account_id,campaign_id,step,at').eq('ws_id', ctx.ws).eq('test', false).gte('at', dayStart).order('at').limit(5000))
  ]);
  const accById = new Map(accs.map(a => [a.id, a])), campById = new Map(camps.map(c => [c.id, c]));
  const sentBy = {}, newBy = {};
  for (const s of today) { sentBy[s.account_id] = (sentBy[s.account_id] || 0) + 1; if (s.step === 0) newBy[s.campaign_id] = (newBy[s.campaign_id] || 0) + 1; }
  const active = camps.filter(c => c.status === 'active');
  // offene Arbeit je aktiver Kampagne
  const due = {}, queue = {}, followups = { count: 0, next: null };
  await Promise.all(active.map(async c => {
    const [d, qu] = await Promise.all([
      q(sb().from('enrollments').select('id,lead_id,account_id,step,next_at').eq('campaign_id', c.id).eq('status', 'active').order('next_at').limit(500)),
      q(sb().from('enrollments').select('id,lead_id').eq('campaign_id', c.id).eq('status', 'pending').is('account_id', null).order('created_at').limit(Math.max(4, c.accounts.length * 2)))
    ]);
    due[c.id] = d; queue[c.id] = qu;
    for (const e of d) if (e.next_at && +new Date(e.next_at) > now) { followups.count++; if (!followups.next || e.next_at < followups.next) followups.next = e.next_at; }
  }));
  const pendingTotal = Object.fromEntries(await Promise.all(camps.map(async c => [c.id, await cnt(sb().from('enrollments').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('status', 'pending'))])));
  // Hochrechnung: wann sendet welches Konto als Nächstes was?
  const plans = [];
  const accIds = [...new Set(active.flatMap(c => c.accounts))];
  for (const id of accIds) {
    const a = accById.get(id); if (!a) continue;
    if (a.status !== 'ok') { plans.push({ account: a.email, state: 'off' }); continue; }
    const limit = C.accLimit(a), sent = sentBy[a.id] || 0, limitHit = sent >= limit;
    const gapUntil = a.next_send_at ? +new Date(a.next_send_at) : 0;
    const base = Math.max(now, gapUntil, limitHit ? tomorrow : 0);
    let best = null;
    for (const c of active.filter(c => c.accounts.includes(a.id))) {
      const sch = c.schedule || {}, t = C.nextWindow(sch, tz, base); if (t == null) continue;
      const mine = (due[c.id] || []).filter(e => e.account_id === a.id);
      const dueNow = mine.find(e => +new Date(e.next_at) <= t);
      let item = null;
      if (dueNow) item = { t, enr: dueNow };
      else if ((queue[c.id] || []).length) item = { t, fresh: true };
      else if (mine.length) { const t2 = C.nextWindow(sch, tz, Math.max(base, +new Date(mine[0].next_at))); if (t2 != null) item = { t: t2, enr: mine[0] }; }
      if (item && (!best || item.t < best.t)) best = { ...item, c, inWin: t === Math.ceil(base / 6e4) * 6e4 };
    }
    if (!best) { plans.push({ account: a.email, state: 'idle', sent, limit }); continue; }
    plans.push({ account: a.email, sent, limit, limitHit, gap: gapUntil > now, ...best });
  }
  // neue Leads in Zeit-Reihenfolge verteilen (Tageslimit „neue Leads pro Kampagne“ beachten)
  plans.sort((x, y) => (x.t || Infinity) - (y.t || Infinity));
  const left = Object.fromEntries(active.map(c => [c.id, Math.max(0, c.daily_new - (newBy[c.id] || 0))])), qi = {};
  for (const pl of plans) {
    if (!pl.fresh) continue;
    const c = pl.c, sch = c.schedule || {};
    if (pl.t < tomorrow) { if (left[c.id] > 0) left[c.id]--; else { pl.t = C.nextWindow(sch, tz, Math.max(pl.t, tomorrow)); pl.newLimit = true; } }
    const i = qi[c.id] = (qi[c.id] || 0); qi[c.id]++;
    pl.lead_id = (queue[c.id][i] || {}).lead_id || null;
  }
  plans.sort((x, y) => (x.t || Infinity) - (y.t || Infinity));
  // Leads nachladen
  const leadIds = [...new Set([...recent.map(s => s.lead_id), ...plans.map(p => p.lead_id || (p.enr && p.enr.lead_id))].filter(Boolean))];
  const leads = leadIds.length ? await q(sb().from('leads').select('id,first,last,company,email').in('id', leadIds)) : [];
  const leadById = new Map(leads.map(l => [l.id, l]));
  const enrIds = recent.map(s => s.enroll_id).filter(Boolean);
  const enrs = enrIds.length ? await q(sb().from('enrollments').select('id,status').in('id', enrIds)) : [];
  const enrStatus = new Map(enrs.map(e => [e.id, e.status]));
  const leadOut = l => l ? { id: l.id, company: l.company || '', name: [l.first, l.last].filter(Boolean).join(' '), email: l.email } : null;
  const stepName = i => i === 0 ? 'Mail 1' : 'Follow-up ' + i;
  const sent = recent.map(s => {
    const c = campById.get(s.campaign_id), l = leadById.get(s.lead_id), a = accById.get(s.account_id);
    let subject = '';
    if (c && l && c.steps && c.steps[s.step]) { const first = c.steps[0], step = c.steps[s.step]; subject = s.step > 0 && step.thread ? 'Re: ' + C.render(first.subject, l, a || {}) : C.render(step.subject || first.subject, l, a || {}); }
    return { id: s.id, at: s.at, test: !!s.test, account: a ? a.email : '', step: s.step == null ? null : stepName(s.step), campaign: c ? { id: c.id, name: c.name } : null, subject: subject.slice(0, 160), lead: leadOut(l), status: enrStatus.get(s.enroll_id) || null };
  });
  const next = plans.map(pl => {
    const lid = pl.lead_id || (pl.enr && pl.enr.lead_id);
    const why = pl.state ? pl.state : pl.limitHit ? 'limit' : pl.newLimit ? 'newlimit' : pl.t > now + 90e3 && !pl.inWin ? 'window' : pl.gap ? 'gap' : pl.enr && +new Date(pl.enr.next_at) > now ? 'followup' : 'now';
    return { account: pl.account, at: pl.t ? new Date(pl.t).toISOString() : null, why, sent: pl.sent, limit: pl.limit, campaign: pl.c ? { id: pl.c.id, name: pl.c.name } : null,
      step: pl.c ? stepName(pl.enr ? pl.enr.step : 0) : null, lead: leadOut(leadById.get(lid)) };
  });
  // Versandfenster von heute (für das Heute-Band in der Übersicht)
  const { wd } = C.localParts(now, tz), windows = [];
  for (const c of active) {
    const sc = c.schedule || {}, d = sc.days || [], f = sc.from || '08:00', t = sc.to || '17:00';
    if (sc.allDay || f === t) { if (d[wd]) windows.push({ from: '00:00', to: '24:00', name: c.name }); continue; }
    if (f < t) { if (d[wd]) windows.push({ from: f, to: t, name: c.name }); continue; }
    if (d[wd]) windows.push({ from: f, to: '24:00', name: c.name });
    if (d[(wd + 6) % 7]) windows.push({ from: '00:00', to: t, name: c.name });
  }
  const dayInfo = { start: dayStart, times: today.slice(-1500).map(s => s.at), windows };
  return { ok: true, now: new Date(now).toISOString(), sentToday: today.length, day: dayInfo, sent, next, followups,
    active: active.map(c => ({ id: c.id, name: c.name, pending: pendingTotal[c.id] || 0, schedule: C.schedText(c.schedule || {}) })),
    paused: camps.filter(c => c.status === 'paused').map(c => ({ id: c.id, name: c.name, pending: pendingTotal[c.id] || 0 })) };
});
route('GET', '/api/campaigns/:id/check', async (b, p, qs, ctx) => ({ ok: true, checks: await startCheck(await own('campaigns', p.id, ctx.ws), ctx.ws) }));
route('POST', '/api/campaigns/:id/start', async (b, p, qs, ctx) => {
  const c = await own('campaigns', p.id, ctx.ws);
  const checks = await startCheck(c, ctx.ws);
  if (checks.some(x => x.level === 'error')) return { ok: false, checks, error: 'Bitte zuerst die roten Punkte beheben.' };
  await q(sb().from('campaigns').update({ status: 'active', started_at: c.started_at || nowIso() }).eq('id', c.id));
  await C.ensureEnroll(c); await C.audit(ctx.ws, ctx, 'campaign_started', c.name);
  return { ok: true, checks };
});
route('POST', '/api/campaigns/:id/pause', async (b, p, qs, ctx) => { const c = await own('campaigns', p.id, ctx.ws, 'id'); await q(sb().from('campaigns').update({ status: 'paused' }).eq('id', c.id)); return { ok: true }; });
route('GET', '/api/campaigns/:id/leads', async (b, p, qs, ctx) => {
  const c = await own('campaigns', p.id, ctx.ws);
  const total = await cnt(sb().from('enrollments').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id));
  const leadCols = 'id,email,first,last,company,city,phone,industry,icebreaker,ice_status,website';
  if (c.status === 'draft' || !total) {
    const lt = c.lists.length ? await cnt(sb().from('leads').select('id', { count: 'exact', head: true }).in('list_id', c.lists)) : 0;
    const leads = c.lists.length ? await q(sb().from('leads').select(leadCols).in('list_id', c.lists).order('created_at').limit(300)) : [];
    return { ok: true, preview: true, rows: leads.map(l => ({ lead: l, status: 'pending', step: 0 })), total: lt };
  }
  const en = await q(sb().from('enrollments').select(`id,status,step,next_at,replied_step, leads(${leadCols}), accounts(email)`).eq('campaign_id', c.id).order('created_at').limit(500));
  return { ok: true, total, rows: en.map(e => ({ id: e.id, lead: e.leads || { email: '?' }, status: e.status, step: e.step, nextAt: e.next_at, repliedStep: e.replied_step, account: e.accounts && e.accounts.email })) };
});

/* ---------- Export ---------- */
function csvCell(v) { v = String(v ?? '').replace(/\r?\n+/g, ' ').trim(); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return /[";]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
const STATUS_DE = { pending: 'Wartet auf Mail 1', active: 'In Sequenz', done: 'Keine Antwort nach allen Follow-ups', replied: 'Geantwortet', bounced: 'Bounce', unsub: 'Abgemeldet', stopped: 'Gestoppt', error: 'Fehler', new: 'Neu' };
const CAT_DE = { interested: 'Interessiert', later: 'Später melden', no: 'Kein Interesse', open: 'Offen', ooo: 'Abwesend' };
route('GET', '/api/export', async (b, p, qs, ctx) => {
  const { st } = await C.wsSettings(ctx.ws);
  const fmtD = s => s ? new Intl.DateTimeFormat('de-AT', { timeZone: st.timezone, day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(s)) : '';
  const rows = [];
  const lastReplies = async leadIds => {
    const m = {}; for (let i = 0; i < leadIds.length; i += 300) { const r = await q(sb().from('inbox').select('lead_id,cat,text,at').in('lead_id', leadIds.slice(i, i + 300)).in('type', ['reply', 'unsub']).order('at', { ascending: false })); for (const x of r) if (!m[x.lead_id]) m[x.lead_id] = x; } return m;
  };
  const listNames = Object.fromEntries((await q(sb().from('lists').select('id,name').eq('ws_id', ctx.ws))).map(l => [l.id, l.name]));
  const blocked = new Set((await q(sb().from('blocklist').select('value').eq('ws_id', ctx.ws).limit(50000))).map(x => x.value));
  if (qs.campaign) {
    const c = await own('campaigns', qs.campaign, ctx.ws);
    const en = await q(sb().from('enrollments').select('status,history,lead_id, leads(*)').eq('campaign_id', c.id).limit(20000));
    const rep = await lastReplies(en.map(e => e.lead_id));
    for (const e of en) {
      const l = e.leads; if (!l) continue; const r = rep[l.id];
      if (qs.filter === 'call') { const callable = e.status === 'done' || (e.status === 'replied' && r && ['interested', 'later', 'open'].includes(r.cat)); if (!callable || blocked.has(l.email) || blocked.has('@' + C.domainOf(l.email))) continue; }
      const sent = (e.history || []).filter(h => h.type === 'sent');
      rows.push({ l, status: e.status, cat: r ? r.cat : '', reply: r ? r.text : '', last: sent.length ? sent[sent.length - 1].at : '', steps: sent.length, campaign: c.name });
    }
    if (qs.filter === 'call') rows.sort((a, b) => (a.cat === 'interested' ? 0 : a.cat ? 1 : 2) - (b.cat === 'interested' ? 0 : b.cat ? 1 : 2));
  } else {
    const r = await q(sb().rpc('leads_page', { p_ws: ctx.ws, p_list: qs.list && qs.list !== 'all' ? id(qs.list) : null, p_q: '', p_status: qs.status || 'all', p_limit: 20000 }));
    const rep = await lastReplies(r.leads.map(l => l.id));
    for (const l of r.leads) { const x = rep[l.id]; rows.push({ l: { ...l, list_id: l.listId }, status: l.status, cat: x ? x.cat : '', reply: x ? x.text : '', last: '', steps: '', campaign: '' }); }
  }
  const head = ['Vorname', 'Nachname', 'Firma', 'Telefon', 'E-Mail', 'Stadt', 'Branche', 'Liste', 'Kampagne', 'Status', 'Antwort', 'Antworttext', 'Mails gesendet', 'Letzte Mail', 'Notiz Anruf'];
  const lines = [head.join(';')];
  for (const r of rows) { const l = r.l; lines.push([l.first, l.last, l.company, l.phone, l.email, l.city, l.industry, listNames[l.list_id] || '', r.campaign, STATUS_DE[r.status] || r.status, CAT_DE[r.cat] || '', String(r.reply || '').slice(0, 300), r.steps, fmtD(r.last), ''].map(csvCell).join(';')); }
  return { __csv: '\uFEFF' + lines.join('\r\n'), filename: (qs.filter === 'call' ? 'Anrufliste' : 'Leads') + '-' + new Date().toISOString().slice(0, 10) + '.csv' };
});

/* ---------- Vorlagen ---------- */
route('POST', '/api/templates', async (b, p, qs, ctx) => {
  const t = await q(sb().from('templates').insert({ ws_id: ctx.ws, type: b.type === 'seq' ? 'seq' : 'mail', name: String(b.name || 'Vorlage').trim().slice(0, 100) || 'Vorlage', subject: String(b.subject || '').slice(0, 300), body: String(b.body || '').slice(0, 20000), steps: Array.isArray(b.steps) ? b.steps.slice(0, 8) : null }).select('id').single());
  return { ok: true, id: t.id };
});
route('DELETE', '/api/templates/:id', async (b, p, qs, ctx) => { const t = await own('templates', p.id, ctx.ws, 'id'); await q(sb().from('templates').delete().eq('id', t.id)); return { ok: true }; });

/* ---------- Posteingang ---------- */
const inboxView = m => ({ id: m.id, from: m.from_addr, fromName: m.from_name, company: m.company, subject: m.subject, text: m.text, at: m.at, cat: m.cat, type: m.type, step: m.step, read: m.read, campaign: m.campaign, account: m.account, leadId: m.lead_id, answered: m.answered });
route('GET', '/api/inbox', async (b, p, qs, ctx) => {
  let qb = sb().from('inbox').select('*').eq('ws_id', ctx.ws).order('at', { ascending: false }).limit(300);
  if (qs.cat && qs.cat !== 'all') qb = qb.eq('cat', qs.cat); else qb = qb.neq('cat', 'ooo');
  return { ok: true, items: (await q(qb)).map(inboxView) };
});
route('POST', '/api/inbox/check', async (b, p, qs, ctx) => { if (limited('chk:' + ctx.ws, 6, 60e3)) throw err(429, 'Bitte kurz warten.'); await C.pollDue(Date.now() + 40000, ctx.ws); return { ok: true }; });
route('PATCH', '/api/inbox/:id', async (b, p, qs, ctx) => {
  const m = await own('inbox', p.id, ctx.ws, 'id'); const patch = {};
  if (['interested', 'later', 'no', 'open'].includes(b.cat)) patch.cat = b.cat;
  if (b.read !== undefined) patch.read = !!b.read;
  await q(sb().from('inbox').update(patch).eq('id', m.id)); return { ok: true };
});
route('POST', '/api/inbox/:id/reply', async (b, p, qs, ctx) => {
  const m = await own('inbox', p.id, ctx.ws);
  const a = m.account_id ? await q(sb().from('accounts').select('*').eq('id', m.account_id).maybeSingle()) : null;
  if (!a) return { ok: false, error: 'Absender-Konto existiert nicht mehr.' };
  const text = String(b.text || '').trim(); if (!text) return { ok: false, error: 'Text fehlt.' };
  const e = m.enroll_id ? await q(sb().from('enrollments').select('*').eq('id', m.enroll_id).maybeSingle()) : null;
  const { st } = await C.wsSettings(ctx.ws);
  const mail = { from: a.name ? { name: a.name, address: a.email } : a.email, to: m.from_addr, subject: /^re:/i.test(m.subject || '') ? m.subject : 'Re: ' + (m.subject || ''), ...C.compose(a, st, text.slice(0, 20000), { footer: false }) };
  if (m.message_id) { mail.inReplyTo = m.message_id; mail.references = [...((e && e.refs) || []), m.message_id].join(' '); }
  try {
    await C.sendMail(a, mail);
    await q(sb().from('inbox').update({ answered: nowIso(), read: true }).eq('id', m.id));
    if (e) await C.updEnroll(e, { history: [...(e.history || []), { type: 'manual', at: nowIso(), text: text.slice(0, 5000), account: a.email }] });
    return { ok: true };
  } catch (x) { return { ok: false, error: C.friendly(x) }; }
});

/* ---------- Sicherheit & Benutzer ---------- */
route('GET', '/api/auth/security', async (b, p, qs, ctx) => {
  const mem = await q(sb().from('members').select('user_id,role,created_at').eq('ws_id', ctx.ws));
  const users = [];
  for (const m of mem) { const { data } = await sb().auth.admin.getUserById(m.user_id); const u = data && data.user; if (u) users.push({ id: u.id, email: u.email, name: (u.user_metadata || {}).name || '', role: m.role, totp: (u.factors || []).some(f => f.status === 'verified'), lastLogin: u.last_sign_in_at }); }
  const audit = await q(sb().from('audit').select('at,user_email,ip,event,detail').eq('ws_id', ctx.ws).order('at', { ascending: false }).limit(80));
  return { ok: true, me: { id: ctx.user.id, email: ctx.user.email, name: (ctx.user.user_metadata || {}).name || '', role: ctx.role, totp: ctx.mfaEnabled }, users, audit: audit.map(a => ({ at: a.at, user: a.user_email, ip: a.ip, event: a.event, detail: a.detail })) };
});
route('POST', '/api/auth/users', async (b, p, qs, ctx) => {
  if (ctx.role !== 'owner') throw err(403, 'Nur der Inhaber kann Benutzer anlegen.');
  const email = String(b.email || '').trim().toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, error: 'Ungültige E-Mail-Adresse.' };
  const prob = passwordProblem(b.password, email); if (prob) return { ok: false, error: 'Start-Passwort: ' + prob };
  const u = await createUser(email, b.password, String(b.name || '').slice(0, 80));
  await q(sb().from('members').insert({ ws_id: ctx.ws, user_id: u.id, role: 'member' }));
  await q(sb().from('profiles').upsert({ user_id: u.id, name: String(b.name || '').slice(0, 80), current_ws: ctx.ws }));
  await C.audit(ctx.ws, ctx, 'user_added', email); return { ok: true };
});
route('DELETE', '/api/auth/users/:id', async (b, p, qs, ctx) => {
  if (ctx.role !== 'owner') throw err(403, 'Nur der Inhaber kann Benutzer entfernen.');
  const uid = id(p.id); if (uid === ctx.user.id) return { ok: false, error: 'Du kannst dich nicht selbst entfernen.' };
  const m = await q(sb().from('members').select('user_id').eq('ws_id', ctx.ws).eq('user_id', uid).maybeSingle()); if (!m) throw err(404, 'Nicht gefunden');
  await q(sb().from('members').delete().eq('ws_id', ctx.ws).eq('user_id', uid));
  const rest = await cnt(sb().from('members').select('user_id', { count: 'exact', head: true }).eq('user_id', uid));
  const { data } = await sb().auth.admin.getUserById(uid);
  if (!rest) { await sb().auth.admin.deleteUser(uid); if (data && data.user) await q(sb().from('allowed_signups').delete().eq('email', data.user.email)); }
  await C.audit(ctx.ws, ctx, 'user_removed', data && data.user ? data.user.email : uid); return { ok: true };
});
route('POST', '/api/auth/event', async (b, p, qs, ctx) => {
  const ev = String(b.event || ''); if (!['login', 'logout', '2fa_enabled', '2fa_disabled', 'password_changed', 'signout_all'].includes(ev)) throw err(400, 'Unbekannt');
  await C.audit(ctx.ws, ctx, ev, String(b.detail || '').slice(0, 200)); return { ok: true };
});

module.exports = { routes, passwordProblem, limited };
