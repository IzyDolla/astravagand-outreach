'use strict';
// Einziger Einstiegspunkt für /api/* (Vercel Function)
const crypto = require('crypto');
const C = require('../lib/core');
const { routes, limited } = require('../lib/routes');
const { sb, q } = C;

function send(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(data));
}
async function readBody(req) {
  if (req.body !== undefined && req.body !== null) { if (typeof req.body === 'string') { try { return req.body ? JSON.parse(req.body) : {}; } catch (e) { const x = new Error('Ungültiges JSON'); x.status = 400; throw x; } } if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8') || '{}'); return req.body; }
  return new Promise((resolve, reject) => { const chunks = []; let size = 0;
    req.on('data', c => { size += c.length; if (size > 10e6) { const x = new Error('Anfrage zu groß'); x.status = 413; reject(x); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { const s = Buffer.concat(chunks).toString('utf8'); resolve(s ? JSON.parse(s) : {}); } catch (e) { const x = new Error('Ungültiges JSON'); x.status = 400; reject(x); } });
    req.on('error', reject); });
}
function b64json(s) { try { return JSON.parse(Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')); } catch (e) { return {}; } }

async function authenticate(req, ctx) {
  const h = String(req.headers.authorization || '');
  const tok = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
  if (!tok || tok.length > 4000) return;
  const { data, error } = await sb().auth.getUser(tok);          // prüft Signatur und Ablauf bei Supabase
  if (error || !data || !data.user) return;
  const claims = b64json(tok.split('.')[1]);
  const mfaEnabled = (data.user.factors || []).some(f => f.status === 'verified');
  ctx.mfaEnabled = mfaEnabled;
  if (mfaEnabled && claims.aal !== 'aal2') { ctx.mfaNeeded = true; return; }
  ctx.user = data.user; ctx.aal = claims.aal;
  const mems = await q(sb().from('members').select('ws_id,role').eq('user_id', data.user.id));
  if (!mems.length) return;
  const prof = await q(sb().from('profiles').select('current_ws').eq('user_id', data.user.id).maybeSingle());
  const m = mems.find(x => prof && x.ws_id === prof.current_ws) || mems[0];
  ctx.ws = m.ws_id; ctx.role = m.role;
}

module.exports = async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let path = url.searchParams.get('__p');
  path = path !== null ? '/api/' + path.replace(/^\/+/, '') : url.pathname;
  url.searchParams.delete('__p');
  const qs = Object.fromEntries(url.searchParams);
  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ctx = { ip, user: null, ws: null, role: null };
  try {
    // Versand-Takt (von Supabase pg_cron jede Minute aufgerufen)
    if (path === '/api/cron') {
      const secret = String(req.headers['x-cron-secret'] || '');
      if (!process.env.CRON_SECRET || !C.safeEq(secret, process.env.CRON_SECRET)) return send(res, 401, { ok: false });
      const got = await q(sb().rpc('acquire_lock', { p_name: 'tick', p_seconds: 58 }));
      if (!got) return send(res, 200, { ok: true, skipped: 'läuft bereits' });
      const deadline = Date.now() + 45000;
      try { const r = await C.tick(deadline); await C.pollDue(deadline + 8000); let f = {}; const fEnd = deadline + 11000; if (fEnd - Date.now() > 10000) f = await require('../lib/finder').process(fEnd).catch(e => ({ finderError: e.message })); let ai = {}; const aEnd = deadline + 14000; if (aEnd - Date.now() > 14000) ai = await require('../lib/ai').processIcebreakers(aEnd).catch(e => ({ aiError: e.message })); return send(res, 200, { ok: true, ...r, finder: f, ai }); }
      finally { await q(sb().rpc('release_lock', { p_name: 'tick' })).catch(() => {}); }
    }
    if (req.method !== 'GET' && req.headers['x-ao'] !== '1') return send(res, 403, { ok: false, error: 'Anfrage blockiert (Sicherheitsprüfung).' });
    if (limited('api:' + ip, 600, 60e3)) return send(res, 429, { ok: false, error: 'Zu viele Anfragen.' });
    const r = routes.find(x => x.method === req.method && x.re.test(path));
    if (!r) return send(res, 404, { ok: false, error: 'Unbekannte Anfrage' });
    await authenticate(req, ctx);
    if (!r.public) {
      if (ctx.mfaNeeded) return send(res, 401, { ok: false, error: 'Bitte 2FA-Code eingeben.', auth: true, mfa: true });
      if (!ctx.user) return send(res, 401, { ok: false, error: 'Bitte anmelden.', auth: true });
      if (!ctx.ws) return send(res, 403, { ok: false, error: 'Kein Zugriff – du bist keinem Workspace zugeordnet.' });
    }
    const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await readBody(req) : {};
    const out = await r.fn(body, path.match(r.re).groups || {}, qs, ctx);
    if (out && out.__csv !== undefined) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${out.filename}"`);
      res.setHeader('Cache-Control', 'no-store');
      return res.end(out.__csv);
    }
    return send(res, 200, out);
  } catch (e) {
    if (!e.status) console.error(path, e);
    return send(res, e.status || 500, { ok: false, error: e.status ? e.message : (e.db ? 'Datenbankfehler: ' + e.message.slice(0, 160) : C.friendly(e)) });
  }
};
