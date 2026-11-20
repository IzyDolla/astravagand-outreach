'use strict';
// Minimaler In-Memory-Ersatz für supabase-js (nur für lokale Tests)
const crypto = require('crypto');
const REL = { workspaces: 'ws_id', leads: 'lead_id', campaigns: 'campaign_id', accounts: 'account_id', lists: 'list_id' };
const UNIQUE = { members: ['ws_id', 'user_id'], accounts: ['ws_id', 'email'], leads: ['list_id', 'email'], enrollments: ['campaign_id', 'lead_id'], blocklist: ['ws_id', 'value'], processed: ['message_id'], finder_results: ['job_id', 'ext_id'], allowed_signups: ['email'], profiles: ['user_id'], locks: ['name'] };
const PK = { members: null, profiles: 'user_id', processed: 'message_id', allowed_signups: 'email', locks: 'name' };
const DEFAULTS = {
  workspaces: { settings: {} }, accounts: { status: 'ok', warmup: true, max_per_day: 40, imap_last_uid: 0, smtp_port: 465, imap_port: 993 },
  leads: { first: '', last: '', company: '', city: '', industry: '', phone: '', custom: {}, email_check: 'unchecked' },
  campaigns: { status: 'draft', steps: [], schedule: {}, lists: [], accounts: [], daily_new: 50, stop_company: true },
  enrollments: { step: 0, status: 'pending', history: [], errors: 0, refs: [], account_id: null, next_at: null }, sends: { test: false },
  inbox: { read: false }, finder_jobs: { status: 'queued', attempts: 0, total: 0, with_email: 0, with_phone: 0, with_website: 0, crawled: 0, error: null, center: null, claimed_at: null }, finder_results: { crawl_status: 'pending', emails: [], socials: {}, email: null, contact_first: null, imported_at: null, imported_list: null, claimed_at: null, phone: '', website: '' }, templates: { subject: '', body: '' }, members: { role: 'member' }
};
function makeDb() { return { workspaces: [], members: [], profiles: [], accounts: [], lists: [], leads: [], campaigns: [], enrollments: [], sends: [], inbox: [], blocklist: [], templates: [], processed: [], audit: [], allowed_signups: [], locks: [], finder_jobs: [], finder_results: [] }; }
let clock = 0; const ts = () => new Date(Date.now() + (clock++)).toISOString();

function parseSelect(sel) {
  const rels = []; let cols = String(sel || '*');
  cols = cols.replace(/(\w+)(!inner)?\(([^)]*)\)/g, (m, name, inner, inside) => { rels.push({ name, inner: !!inner, cols: inside }); return ''; });
  return { rels, cols: cols.split(',').map(s => s.trim()).filter(Boolean) };
}
class Query {
  constructor(db, table) { this.db = db; this.t = table; this.filters = []; this.op = 'select'; this._order = []; }
  select(sel, opts = {}) { if (this.op === 'select') this.sel = sel; else this.retSel = sel || '*'; this.countOpt = opts.count; this.head = opts.head; return this; }
  insert(rows) { this.op = 'insert'; this.rows = Array.isArray(rows) ? rows : [rows]; return this; }
  upsert(rows, opts = {}) { this.op = 'upsert'; this.rows = Array.isArray(rows) ? rows : [rows]; this.upOpts = opts; return this; }
  update(p) { this.op = 'update'; this.patch = p; return this; }
  delete() { this.op = 'delete'; return this; }
  _f(fn) { this.filters.push(fn); return this; }
  _get(r, col) { if (col.includes('.')) { const [rel, c] = col.split('.'); const fk = REL[rel]; const o = this.db[rel].find(x => x.id === r[fk]); return o ? o[c] : undefined; } return r[col]; }
  eq(c, v) { return this._f(r => this._get(r, c) === v); }
  neq(c, v) { return this._f(r => this._get(r, c) !== v); }
  in(c, vs) { return this._f(r => vs.includes(this._get(r, c))); }
  is(c, v) { return this._f(r => (this._get(r, c) ?? null) === v); }
  not(c, op, v) { return this._f(r => !((this._get(r, c) ?? null) === v)); }
  lte(c, v) { return this._f(r => this._get(r, c) != null && this._get(r, c) <= v); }
  lt(c, v) { return this._f(r => this._get(r, c) != null && this._get(r, c) < v); }
  gte(c, v) { return this._f(r => this._get(r, c) != null && this._get(r, c) >= v); }
  gt(c, v) { return this._f(r => this._get(r, c) != null && this._get(r, c) > v); }
  ilike(c, pat) { const re = new RegExp('^' + String(pat).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*') + '$', 'i'); return this._f(r => re.test(String(this._get(r, c) ?? ''))); }
  contains(c, arr) { return this._f(r => Array.isArray(r[c]) && arr.every(v => r[c].includes(v))); }
  order(c, o = {}) { this._order.push([c, o.ascending !== false, o.nullsFirst]); return this; }
  limit(n) { this._limit = n; return this; }
  range(a, b) { this._range = [a, b]; return this; }
  or(expr) { const parts = String(expr).split(',').map(x => { const [c, op, ...v] = x.split('.'); return [c, op, v.join('.')]; }); return this._f(r => parts.some(([c, op, v]) => op === 'ilike' && new RegExp('^' + v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*') + '$', 'i').test(String(this._get(r, c) ?? '')))); }
  maybeSingle() { this._single = 'maybe'; return this; }
  single() { this._single = 'one'; return this; }
  _match(r) { return this.filters.every(f => f(r)); }
  _project(r, sel) {
    const { rels, cols } = parseSelect(sel || '*');
    const o = cols.includes('*') || !cols.length ? { ...r } : Object.fromEntries(cols.map(c => [c, r[c]]));
    for (const rel of rels) { const fk = REL[rel.name]; const x = this.db[rel.name].find(y => y.id === r[fk]); o[rel.name] = x ? this._projectPlain(x, rel.cols) : null; }
    return JSON.parse(JSON.stringify(o));
  }
  _projectPlain(r, cols) { const cs = cols.split(',').map(s => s.trim()); return cs.includes('*') ? { ...r } : Object.fromEntries(cs.map(c => [c, r[c]])); }
  _innerOk(r, sel) { const { rels } = parseSelect(sel || ''); return rels.filter(x => x.inner).every(rel => this.db[rel.name].some(y => y.id === r[REL[rel.name]])); }
  _uniqKey(r) { const u = UNIQUE[this.t]; return u ? u.map(k => r[k]).join('|') : null; }
  _fill(r) { const row = { ...(DEFAULTS[this.t] || {}), ...JSON.parse(JSON.stringify(r)) }; if (PK[this.t] === undefined && !row.id) row.id = crypto.randomUUID(); if (this.t === 'audit' && !row.id) row.id = this.db.audit.length + 1; if (!row.created_at) row.created_at = ts(); if (this.t === 'finder_jobs' && !row.next_try_at) row.next_try_at = new Date(Date.now() - 1000).toISOString(); if (['sends', 'inbox', 'blocklist', 'audit', 'processed'].includes(this.t) && !row.at) row.at = ts(); return row; }
  async _run() {
    const T = this.db[this.t]; if (!T) return { data: null, error: { message: 'unknown table ' + this.t } };
    if (this.op === 'insert' || this.op === 'upsert') {
      const out = [];
      for (const r of this.rows) {
        const row = this._fill(r); const k = this._uniqKey(row);
        const ex = k !== null ? T.find(x => this._uniqKey(x) === k) : null;
        if (ex) { if (this.op === 'insert') return { data: null, error: { message: 'duplicate key value violates unique constraint' } }; if (this.upOpts.ignoreDuplicates) continue; Object.assign(ex, r); out.push(ex); continue; }
        T.push(row); out.push(row);
      }
      return this._ret(out);
    }
    let rows = T.filter(r => this._match(r) && this._innerOk(r, this.sel));
    if (this.op === 'update') { rows.forEach(r => Object.assign(r, JSON.parse(JSON.stringify(this.patch)))); return this._ret(rows); }
    if (this.op === 'delete') { this.db[this.t] = T.filter(r => !rows.includes(r)); this._cascade(rows); return { data: null, error: null }; }
    for (const [c, asc, nf] of this._order.slice().reverse()) rows = rows.slice().sort((a, b) => { const x = a[c] ?? null, y = b[c] ?? null; if (x === y) return 0; if (x === null) return nf ? -1 : 1; if (y === null) return nf ? 1 : -1; return (x < y ? -1 : 1) * (asc ? 1 : -1); });
    const count = rows.length;
    if (this._range) rows = rows.slice(this._range[0], this._range[1] + 1);
    if (this._limit !== undefined) rows = rows.slice(0, this._limit);
    if (this.head) return { data: null, error: null, count };
    const data = rows.map(r => this._project(r, this.sel));
    if (this._single) { if (data.length > 1 || (this._single === 'one' && !data.length)) return { data: null, error: { message: 'single row expected' } }; return { data: data[0] || null, error: null, count: this.countOpt ? count : null }; }
    return { data, error: null, count: this.countOpt ? count : null };
  }
  _cascade(rows) {
    const ids = new Set(rows.map(r => r.id));
    const map = { workspaces: [['members', 'ws_id'], ['accounts', 'ws_id'], ['lists', 'ws_id'], ['leads', 'ws_id'], ['campaigns', 'ws_id'], ['templates', 'ws_id'], ['blocklist', 'ws_id']], lists: [['leads', 'list_id']], finder_jobs: [['finder_results', 'job_id']], leads: [['enrollments', 'lead_id']], campaigns: [['enrollments', 'campaign_id'], ['sends', 'campaign_id']] };
    for (const [t, fk] of map[this.t] || []) { const gone = this.db[t].filter(x => ids.has(x[fk])); this.db[t] = this.db[t].filter(x => !ids.has(x[fk])); if (gone.length) new Query(this.db, t)._cascade(gone); }
    if (this.t === 'accounts') { for (const e of this.db.enrollments) if (ids.has(e.account_id)) e.account_id = null; }
  }
  _ret(rows) {
    if (!this.retSel) return { data: null, error: null };
    const data = rows.map(r => this._project(r, this.retSel));
    if (this._single) return { data: data[0] || null, error: this._single === 'one' && !data.length ? { message: 'no rows' } : null };
    return { data, error: null };
  }
  then(res, rej) { return this._run().then(res, rej); }
}
function createFake() {
  const db = makeDb(); const users = new Map();
  const tz = (d, z) => new Intl.DateTimeFormat('en-CA', { timeZone: z, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d));
  const rpc = {
    acquire_lock: ({ p_name, p_seconds }) => { let l = db.locks.find(x => x.name === p_name); if (!l) db.locks.push(l = { name: p_name, until: new Date(0).toISOString() }); if (new Date(l.until) < new Date()) { l.until = new Date(Date.now() + p_seconds * 1000).toISOString(); return true; } return false; },
    release_lock: ({ p_name }) => { const l = db.locks.find(x => x.name === p_name); if (l) l.until = new Date(0).toISOString(); return null; },
    app_state: ({ p_ws, p_tz }) => {
      const today = tz(Date.now(), p_tz);
      const S = db.sends.filter(s => s.ws_id === p_ws && !s.test);
      const accounts = db.accounts.filter(a => a.ws_id === p_ws).map(a => { const mine = S.filter(s => s.account_id === a.id); const last = mine.slice(-100); const b = last.filter(s => (db.enrollments.find(e => e.id === s.enroll_id) || {}).status === 'bounced').length; return { id: a.id, sentToday: mine.filter(s => tz(s.at, p_tz) === today).length, totalSent: mine.length, bounce: last.length ? b * 100 / last.length : 0 }; });
      const campaigns = {};
      for (const c of db.campaigns.filter(c => c.ws_id === p_ws)) { const en = db.enrollments.filter(e => e.campaign_id === c.id);
        campaigns[c.id] = { total: en.length, contacted: en.filter(e => (e.history || []).some(h => h.type === 'sent')).length, replies: en.filter(e => e.status === 'replied').length, bounces: en.filter(e => e.status === 'bounced').length, pending: en.filter(e => e.status === 'pending').length,
          positive: db.inbox.filter(i => i.campaign_id === c.id && i.cat === 'interested').length, sentToday: S.filter(s => s.campaign_id === c.id && s.step === 0 && tz(s.at, p_tz) === today).length,
          steps: (c.steps.length ? c.steps : [0]).map((_, i) => ({ sent: S.filter(s => s.campaign_id === c.id && s.step === i).length, replies: en.filter(e => e.status === 'replied' && e.replied_step === i).length })) }; }
      const chart = []; for (let i = 29; i >= 0; i--) { const k = tz(Date.now() - i * 864e5, p_tz); chart.push({ k, sent: S.filter(s => tz(s.at, p_tz) === k).length, rep: db.inbox.filter(m => m.ws_id === p_ws && m.type === 'reply' && tz(m.at, p_tz) === k).length }); }
      const ib = db.inbox.filter(m => m.ws_id === p_ws); const wk = Date.now() - 7 * 864e5;
      return { accounts, campaigns, chart, lists: db.lists.filter(l => l.ws_id === p_ws).map(l => ({ id: l.id, name: l.name, createdAt: l.created_at, count: db.leads.filter(x => x.list_id === l.id).length })),
        leadsCount: db.leads.filter(l => l.ws_id === p_ws).length, blocklist: db.blocklist.filter(b => b.ws_id === p_ws).map(b => b.value).sort(), inboxUnread: ib.filter(m => !m.read && m.type !== 'ooo').length,
        inboxCounts: Object.fromEntries(['interested', 'later', 'no', 'open', 'ooo'].map(k => [k, ib.filter(m => m.cat === k).length])),
        kpi: { sends7: S.filter(s => s.step === 0 && new Date(s.at) > wk).length, replies7: ib.filter(m => m.type === 'reply' && new Date(m.at) > wk).length, positive7: ib.filter(m => m.cat === 'interested' && new Date(m.at) > wk).length, positivePrev: 0, bounced: db.enrollments.filter(e => e.ws_id === p_ws && e.status === 'bounced').length, firstSends: S.filter(s => s.step === 0).length, totalSent: S.length } };
    },
    leads_page: ({ p_ws, p_list, p_q, p_status, p_limit }) => {
      const pr = ['replied', 'unsub', 'bounced', 'active', 'done', 'stopped', 'error', 'pending'];
      let L = db.leads.filter(l => l.ws_id === p_ws && (!p_list || l.list_id === p_list) && (!p_q || [l.email, l.first, l.last, l.company, l.city].join(' ').toLowerCase().includes(p_q.toLowerCase())))
        .map(l => { const en = db.enrollments.filter(e => e.lead_id === l.id); const st = pr.find(s => en.some(e => e.status === s)) || 'new'; return { id: l.id, email: l.email, first: l.first, last: l.last, company: l.company, city: l.city, industry: l.industry, phone: l.phone, emailCheck: l.email_check, listId: l.list_id, list: (db.lists.find(x => x.id === l.list_id) || {}).name, status: st, tags: db.inbox.filter(i => i.lead_id === l.id && i.type === 'reply').map(i => i.cat), createdAt: l.created_at }; });
      if (p_status && p_status !== 'all') L = L.filter(l => p_status === 'contacted' ? ['active', 'done'].includes(l.status) : l.status === p_status);
      return { total: L.length, leads: L.reverse().slice(0, p_limit) };
    }
  };
  const client = {
    db, users,
    from: t => new Query(db, t),
    rpc: async (name, args) => { try { return { data: rpc[name](args), error: null }; } catch (e) { return { data: null, error: { message: e.message } }; } },
    auth: {
      getUser: async tok => { let sub = null; try { sub = JSON.parse(Buffer.from(String(tok).split('.')[1], 'base64url').toString()).sub; } catch (e) {} const u = sub && users.get(sub); return u ? { data: { user: u }, error: null } : { data: { user: null }, error: { message: 'invalid' } }; },
      admin: {
        createUser: async ({ email, password, user_metadata }) => { if (!db.allowed_signups.some(a => a.email === email)) return { data: null, error: { message: 'Registrierung ist nicht erlaubt' } }; if ([...users.values()].some(u => u.email === email)) return { data: null, error: { message: 'User already registered' } }; const u = { id: crypto.randomUUID(), email, user_metadata, factors: [], password }; users.set(u.id, u); return { data: { user: u }, error: null }; },
        getUserById: async id => ({ data: { user: users.get(id) || null }, error: null }),
        deleteUser: async id => { users.delete(id); return { error: null }; }
      }
    }
  };
  return client;
}
const fakeToken = (uid, aal = 'aal1') => 'x.' + Buffer.from(JSON.stringify({ sub: uid, aal })).toString('base64url') + '.y';
module.exports = { createFake, fakeToken };
