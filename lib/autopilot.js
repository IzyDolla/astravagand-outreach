'use strict';
// Automodus: Branche + Orte vorgeben – der Rest läuft von selbst.
// Ablauf je Durchlauf: Kampagne sicherstellen → fertige Suchen übernehmen (ohne Dubletten) →
// bei zu wenig Vorrat die nächste Suche starten → Bremsen prüfen → Protokoll.
// Versand, Firmencheck und Personalisierung laufen über die bestehenden Warteschlangen im Cron.
const C = require('./core');
const F = require('./finder');
const TPL = require('./templates');
const { sb, q, cnt, nowIso } = C;

const DEF = { goal: 300, dailyNew: 20, bufferDays: 3, personalize: true, reviewFirst: 10, maxPerSearch: 100, autoExpand: true, accounts: [], templateId: null,
  schedule: { days: [1, 1, 1, 1, 1, 0, 0], from: '08:00', to: '16:30', timezone: '', minGap: 4, maxGap: 11 } };
const settingsOf = ap => { const s = ap.settings || {}; return { ...DEF, ...s, schedule: { ...DEF.schedule, ...(s.schedule || {}) } }; };
const FREEMAIL = /@(gmail|googlemail|gmx|web|outlook|hotmail|yahoo|icloud|aon|chello|live|me|t-online|a1|kabsi|liwest)\./i;
let importRows = null;
const setImporter = fn => { importRows = fn; };

const EPOCH = '1970-01-01T00:00:00.000Z';
function log(ap, text, kind = 'info') { ap.log = [{ at: nowIso(), text, kind }, ...(Array.isArray(ap.log) ? ap.log : [])].slice(0, 80); }

async function stepsFor(ap, set) {
  if (set.templateId) {
    const t = await q(sb().from('templates').select('steps,type').eq('id', set.templateId).eq('ws_id', ap.ws_id).maybeSingle()).catch(() => null);
    if (t && t.type === 'seq' && Array.isArray(t.steps) && t.steps.length) return t.steps;
  }
  return TPL.steps(TPL.forCategory(ap.category));
}
async function okAccounts(ap, set) {
  const all = (await q(sb().from('accounts').select('id').eq('ws_id', ap.ws_id).eq('status', 'ok'))).map(x => x.id);
  const pick = (set.accounts || []).filter(id => all.includes(id));
  return pick.length ? pick : all;
}

// Liste + Kampagne anlegen (einmalig)
async function setup(ap) {
  const set = settingsOf(ap);
  if (!ap.list_id) {
    const l = await q(sb().from('lists').insert({ ws_id: ap.ws_id, name: 'Automodus · ' + ap.name }).select('id').single());
    ap.list_id = l.id;
  }
  let c = ap.campaign_id ? await q(sb().from('campaigns').select('*').eq('id', ap.campaign_id).maybeSingle()) : null;
  if (!c) {
    const accounts = await okAccounts(ap, set);
    c = await q(sb().from('campaigns').insert({ ws_id: ap.ws_id, name: 'Automodus · ' + ap.name, status: ap.status === 'active' ? 'active' : 'paused', steps: await stepsFor(ap, set),
      schedule: set.schedule, lists: [ap.list_id], accounts, daily_new: set.dailyNew, stop_company: true, personalize: !!set.personalize, review_first: Math.max(0, set.reviewFirst | 0),
      autopilot_id: ap.id, started_at: ap.status === 'active' ? nowIso() : null }).select('*').single());
    ap.campaign_id = c.id;
    log(ap, 'Kampagne „' + c.name + '“ angelegt');
  }
  return c;
}

// Einstellungen des Automodus auf die Kampagne übertragen
async function syncCampaign(ap) {
  if (!ap.campaign_id) return;
  const set = settingsOf(ap);
  await q(sb().from('campaigns').update({ daily_new: set.dailyNew, schedule: set.schedule, personalize: !!set.personalize, review_first: Math.max(0, set.reviewFirst | 0), accounts: await okAccounts(ap, set),
    status: ap.status === 'active' ? 'active' : 'paused' }).eq('id', ap.campaign_id));
  if (ap.status === 'active') await q(sb().from('campaigns').update({ started_at: nowIso() }).eq('id', ap.campaign_id).is('started_at', null));
  if (ap.status === 'active') { const c = await q(sb().from('campaigns').select('*').eq('id', ap.campaign_id).maybeSingle()); if (c) await C.ensureEnroll(c); }
}

// Fertige Suchen in die Liste übernehmen – ohne Firmen, die im Workspace schon vorkommen
async function importReady(ap) {
  const jobs = await q(sb().from('finder_jobs').select('id,status,label,total,with_email').eq('autopilot_id', ap.id));
  if (!jobs.length) return 0;
  // Ergebnisse auch aus laufenden Suchen übernehmen, sobald sie gecrawlt und geprüft sind
  const rows = await q(sb().from('finder_results').select('id,job_id,name,category,city,phone,website,email,contact_first,contact_last,contact_role,insights,icebreaker,ai_status,ai_at,crawl_status')
    .in('job_id', jobs.map(j => j.id)).is('imported_at', null).not('email', 'is', null).in('crawl_status', ['done', 'skipped', 'error']).limit(400));
  const stale = t => !t || Date.now() - new Date(t).getTime() > 60 * 60e3;
  const ready = rows.filter(r => !(r.ai_status === 'queued' || r.ai_status === 'working') || stale(r.ai_at));
  if (!ready.length) return 0;
  // Dubletten im ganzen Workspace: gleiche Adresse oder (bei Firmen-Domains) gleiche Domain
  const emails = new Set(), domains = new Set();
  for (let from = 0; ; from += 1000) {
    const ls = await q(sb().from('leads').select('email').eq('ws_id', ap.ws_id).range(from, from + 999));
    ls.forEach(l => { const e = String(l.email || '').toLowerCase(); emails.add(e); if (!FREEMAIL.test(e)) domains.add(e.split('@')[1]); });
    if (ls.length < 1000) break;
  }
  const fresh = [], dup = [];
  for (const r of ready) {
    const e = String(r.email).toLowerCase(), d = e.split('@')[1];
    if (emails.has(e) || (!FREEMAIL.test(e) && domains.has(d))) { dup.push(r.id); continue; }
    emails.add(e); if (!FREEMAIL.test(e)) domains.add(d);
    fresh.push(r);
  }
  let res = { imported: 0, importedEmails: [] };
  if (fresh.length) {
    if (!importRows) throw new Error('Import nicht verfügbar');
    res = await importRows({ ws: ap.ws_id }, ap.list_id, fresh.map(r => ({ email: r.email, first: r.contact_first, last: r.contact_last, salutation: salOf(r), company: r.name, city: r.city, industry: r.category, phone: r.phone, website: r.website,
      insights: r.insights, icebreaker: r.icebreaker, iceQueue: !r.insights })), 'Automodus');
  }
  const ok = new Set(res.importedEmails || []);
  const now = nowIso();
  const impIds = fresh.filter(r => ok.has(String(r.email).toLowerCase())).map(r => r.id), skipIds = [...dup, ...fresh.filter(r => !ok.has(String(r.email).toLowerCase())).map(r => r.id)];
  for (let i = 0; i < impIds.length; i += 200) await q(sb().from('finder_results').update({ imported_at: now, imported_list: ap.list_id }).in('id', impIds.slice(i, i + 200)));
  for (let i = 0; i < skipIds.length; i += 200) await q(sb().from('finder_results').update({ imported_at: now }).in('id', skipIds.slice(i, i + 200)));
  if (impIds.length || skipIds.length) log(ap, `${impIds.length} neue Firmen übernommen` + (skipIds.length ? `, ${skipIds.length} übersprungen (schon vorhanden, gesperrt oder Adresse ungültig)` : ''), impIds.length ? 'good' : 'info');
  return impIds.length;
}
const salOf = r => { const i = r.insights; const tp = i && i.target >= 0 && i.people ? i.people[i.target] : null; return tp && tp.anrede && String(tp.last || '').toLowerCase() === String(r.contact_last || '').toLowerCase() ? tp.anrede : null; };

// Ortsliste mit dem Stand der Suchen abgleichen
async function refreshLocations(ap) {
  const locs = Array.isArray(ap.locations) ? ap.locations : [];
  const ids = locs.map(l => l.job_id).filter(Boolean);
  if (!ids.length) return;
  const jobs = await q(sb().from('finder_jobs').select('id,status,total,with_email,error,attempts,source,cursor').in('id', ids));
  const byId = new Map(jobs.map(j => [j.id, j]));
  for (const l of locs) {
    const j = l.job_id && byId.get(l.job_id);
    if (!j) { if (l.state === 'running') l.state = 'todo'; continue; }
    l.found = j.total; l.withEmail = j.with_email;
    if (j.status === 'done' && l.state !== 'done') {
      l.state = 'done';
      // Alte Google-Suche mit nur einer Abfrage (max. 60 Treffer): Ort ist vermutlich größer → später gründlich nachsuchen
      if (j.source === 'google' && !j.cursor && j.total >= 50 && !l.deep) l.capped = true;
      log(ap, `Suche „${l.name}“ fertig: ${j.total} neue Firmen, ${j.with_email} mit E-Mail`);
    }
    else if (j.status === 'error' && l.state !== 'error') { l.state = 'error'; l.error = j.error; log(ap, `Suche „${l.name}“ fehlgeschlagen: ${j.error || 'unbekannt'}`, 'bad'); }
  }
}

async function nextSearch(ap, want) {
  const set = settingsOf(ap), locs = ap.locations;
  let l = locs.find(x => x.state === 'todo' || !x.state);
  if (!l) { l = locs.find(x => x.state === 'done' && x.capped && !x.deep); if (l) { l.deep = true; log(ap, `„${l.name}“ hat mehr als 60 Treffer – wird jetzt gründlich in Teilgebieten durchsucht`); } }
  if (!l) {
    const round = (ap.state && ap.state.round) || 0;
    if (set.autoExpand && round < 1 && ap.radius_km < 50) {
      ap.radius_km = Math.min(50, ap.radius_km * 2);
      ap.state = { ...(ap.state || {}), round: round + 1 };
      locs.forEach(x => { if (x.state === 'done') { x.state = 'todo'; x.job_id = null; } });
      log(ap, `Alle Orte abgesucht – Umkreis auf ${ap.radius_km} km erweitert`);
      l = locs.find(x => x.state === 'todo');
    }
    if (!l) { if (!(ap.state && ap.state.needMore)) { ap.state = { ...(ap.state || {}), needMore: true }; log(ap, 'Keine neuen Firmen mehr in den Orten – füge weitere Orte hinzu, damit es weitergeht', 'warn'); } return null; }
  }
  const cat = F.catByKey(ap.category), kw = ap.keyword || null, src = F.sources();
  const source = ap.source === 'osm' || !src.google ? 'osm' : 'google';
  const label = `${kw || (cat ? cat.label : 'Suche')} · ${l.name} · ${ap.radius_km} km`;
  const job = await q(sb().from('finder_jobs').insert({ ws_id: ap.ws_id, source, category: cat ? cat.key : null, keyword: kw, location: l.name, radius_km: ap.radius_km, max_results: Math.max(60, Math.min(2000, Math.ceil((want || 60) / 0.7))), label, autopilot_id: ap.id }).select('id').single());
  Object.assign(l, { state: 'running', job_id: job.id, at: nowIso(), radius: ap.radius_km });
  ap.state = { ...(ap.state || {}), needMore: false };
  log(ap, `Suche gestartet: ${label}`);
  return job.id;
}

// Bremsen: zu viele Bounces oder Abmeldungen → Automodus pausieren
async function brakes(ap, c) {
  const sent = await cnt(sb().from('sends').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('test', false).eq('step', 0));
  if (sent < 25) return null;
  const [bounced, unsub] = await Promise.all([
    cnt(sb().from('enrollments').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('status', 'bounced')),
    cnt(sb().from('enrollments').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('status', 'unsub'))]);
  if (bounced / sent > 0.05) return `Bounce-Rate ${(bounced / sent * 100).toFixed(1)} % – Liste oder Zustellung prüfen`;
  if (sent >= 40 && unsub / sent > 0.06) return `Abmelderate ${(unsub / sent * 100).toFixed(1)} % – Texte oder Zielgruppe prüfen`;
  return null;
}

async function runOne(ap) {
  ap.locations = Array.isArray(ap.locations) ? ap.locations : [];
  ap.state = ap.state || {};
  // Kampagne vorhanden? (Wurde sie gelöscht oder von Hand pausiert, pausiert auch der Automodus)
  if (ap.campaign_id) {
    const c0 = await q(sb().from('campaigns').select('id,status').eq('id', ap.campaign_id).maybeSingle());
    if (!c0) { ap.campaign_id = null; ap.status = 'paused'; log(ap, 'Die Kampagne wurde gelöscht – Automodus pausiert. Beim Fortsetzen wird eine neue angelegt.', 'warn'); return; }
    if (c0.status === 'paused' && ap.status === 'active') { ap.status = 'paused'; log(ap, 'Kampagne wurde pausiert – Automodus ebenfalls pausiert', 'warn'); return; }
  }
  const c = await setup(ap);
  if (c.status === 'done' || c.status === 'draft') await q(sb().from('campaigns').update({ status: 'active' }).eq('id', c.id).in('status', ['done', 'draft']));
  const reason = await brakes(ap, c);
  if (reason) { ap.status = 'paused'; await q(sb().from('campaigns').update({ status: 'paused' }).eq('id', c.id)); log(ap, 'Automatisch pausiert: ' + reason, 'bad'); return; }
  const accs = c.accounts.length ? await cnt(sb().from('accounts').select('id', { count: 'exact', head: true }).in('id', c.accounts).eq('status', 'ok')) : 0;
  if (!accs) { if (!ap.state.noAccounts) log(ap, 'Kein verbundenes Absender-Konto – es wird nichts verschickt', 'bad'); ap.state.noAccounts = true; } else ap.state.noAccounts = false;
  await refreshLocations(ap);
  const n = await importReady(ap);
  if (n) await C.ensureEnroll(c);
  // Vorrat: so viele Leads, wie in den nächsten Tagen verschickt werden können
  const set = settingsOf(ap);
  const jobs = await q(sb().from('finder_jobs').select('id,status').eq('autopilot_id', ap.id));
  const running = jobs.some(j => ['queued', 'searching', 'crawling'].includes(j.status));
  const pending = await cnt(sb().from('enrollments').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('status', 'pending'));
  const pipeline = jobs.length ? await cnt(sb().from('finder_results').select('id', { count: 'exact', head: true }).in('job_id', jobs.map(j => j.id)).is('imported_at', null).not('email', 'is', null)) : 0;
  // Ziel: so viele Firmen (mit E-Mail) insgesamt in die Kampagne holen, wie eingestellt – Ort für Ort
  const have = ap.list_id ? await cnt(sb().from('leads').select('id', { count: 'exact', head: true }).eq('list_id', ap.list_id)) : 0;
  ap.state.buffer = { pending, pipeline, have, goal: set.goal };
  const missing = set.goal - have - pipeline;
  if (missing > 0) { ap.state.goalReached = false; if (!running) await nextSearch(ap, missing); }
  else if (have >= set.goal && !ap.state.goalReached) { ap.state.goalReached = true; log(ap, `Ziel erreicht: ${have} Firmen in der Kampagne – es wird nur noch verschickt. Für mehr das Ziel erhöhen.`, 'good'); }
}

// Alle fälligen Automodi abarbeiten (Cron) bzw. einen bestimmten sofort (Button / Seite offen)
// Sperre (lock_until) verhindert, dass Cron und offene Seite denselben Automodus gleichzeitig bearbeiten
async function run(deadline, onlyId, minGap = 0) {
  let qy = sb().from('autopilots').select('*').eq('status', 'active').order('next_run_at').limit(20);
  if (onlyId) qy = sb().from('autopilots').select('*').eq('id', onlyId).limit(1);
  else qy = qy.lte('next_run_at', nowIso());
  const aps = await q(qy);
  let n = 0;
  for (const ap of aps) {
    if (Date.now() > deadline) break;
    if (ap.status !== 'active') continue;
    if (minGap && ap.updated_at && Date.now() - new Date(ap.updated_at).getTime() < minGap) continue;
    const claim = await q(sb().from('autopilots').update({ lock_until: new Date(Date.now() + 90e3).toISOString() }).eq('id', ap.id).lt('lock_until', nowIso()).select('id'));
    if (!claim.length) continue;
    try { await runOne(ap); }
    catch (e) { log(ap, 'Fehler im Automodus: ' + String(e.message || e).slice(0, 200), 'bad'); }
    // Status nur übernehmen, wenn er nicht inzwischen von Hand geändert wurde (Pause während des Laufs)
    const cur = await q(sb().from('autopilots').select('status').eq('id', ap.id).maybeSingle());
    if (!cur) continue;
    const status = cur.status === 'active' ? ap.status : cur.status;
    await q(sb().from('autopilots').update({ status, campaign_id: ap.campaign_id, list_id: ap.list_id, locations: ap.locations, radius_km: ap.radius_km, state: ap.state, log: ap.log,
      next_run_at: new Date(Date.now() + 3 * 60e3).toISOString(), lock_until: EPOCH, updated_at: nowIso() }).eq('id', ap.id));
    n++;
  }
  return { autopilots: n };
}

// Kennzahlen für die Oberfläche
async function stats(ap) {
  const out = { found: 0, withEmail: 0, checking: 0, checked: 0, imported: 0, pending: 0, preparing: 0, written: 0, unwritten: 0, ready: 0, review: 0, active: 0, done: 0, replied: 0, positive: 0, bounced: 0, unsub: 0, sentToday: 0, sentTotal: 0, followups: 0 };
  const set = settingsOf(ap), persOn = !!set.personalize && C.aiReady();
  const jobs = await q(sb().from('finder_jobs').select('id,total,with_email').eq('autopilot_id', ap.id));
  jobs.forEach(j => { out.found += j.total || 0; out.withEmail += j.with_email || 0; });
  if (jobs.length) {
    out.checking = await cnt(sb().from('finder_results').select('id', { count: 'exact', head: true }).in('job_id', jobs.map(j => j.id)).in('ai_status', ['queued', 'working']));
    out.checked = await cnt(sb().from('finder_results').select('id', { count: 'exact', head: true }).in('job_id', jobs.map(j => j.id)).eq('ai_status', 'done'));
  }
  if (ap.list_id) out.imported = await cnt(sb().from('leads').select('id', { count: 'exact', head: true }).eq('list_id', ap.list_id));
  if (ap.campaign_id) {
    const en = await q(sb().from('enrollments').select('status,pers_status,review,step').eq('campaign_id', ap.campaign_id).limit(20000));
    for (const e of en) {
      if (e.status === 'pending') {
        out.pending++;
        const open = e.pers_status === 'queued' || e.pers_status === 'working';
        if (e.pers_status === 'done') out.written++;
        if (e.review === 'pending') out.review++;
        else if (open) out.preparing++;
        else if (persOn && !e.pers_status) out.unwritten++;
        else out.ready++;
      }
      else if (e.status === 'active') { out.active++; if (e.step > 0) out.followups++; }
      else if (e.status === 'replied') out.replied++;
      else if (e.status === 'bounced') out.bounced++;
      else if (e.status === 'unsub') out.unsub++;
      else if (e.status === 'done') out.done++;
    }
    const { st } = await C.wsSettings(ap.ws_id);
    out.sentTotal = await cnt(sb().from('sends').select('id', { count: 'exact', head: true }).eq('campaign_id', ap.campaign_id).eq('test', false));
    out.sentToday = await cnt(sb().from('sends').select('id', { count: 'exact', head: true }).eq('campaign_id', ap.campaign_id).eq('test', false).gte('at', C.startOfLocalDay(st.timezone || 'Europe/Vienna')));
    out.positive = await cnt(sb().from('inbox').select('id', { count: 'exact', head: true }).eq('campaign_id', ap.campaign_id).eq('cat', 'interested'));
  }
  out.live = await live(ap, out, jobs).catch(e => ({ headline: null, phases: {}, error: e.message }));
  return out;
}

// Was gerade passiert – pro Stufe ein Zustand (active, done, wait, warn, off, idle) mit kurzem Text
const fmtWhen = (ms, tz) => {
  const d = new Date(ms), k = x => C.dateKey(x, tz);
  const hm = d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit', timeZone: tz });
  if (k(d) === k(new Date())) return 'heute ' + hm;
  if (k(d) === k(new Date(Date.now() + 864e5))) return 'morgen ' + hm;
  return d.toLocaleDateString('de-AT', { weekday: 'short', timeZone: tz }).replace('.', '') + ' ' + hm;
};
async function live(ap, st, jobs0) {
  const P = {}, set = settingsOf(ap), active = ap.status === 'active';
  const persOn = !!set.personalize && C.aiReady();
  const jobs = jobs0.length ? await q(sb().from('finder_jobs').select('id,status,location,total,crawled,error').eq('autopilot_id', ap.id)) : [];
  const run = jobs.find(j => ['queued', 'searching', 'crawling'].includes(j.status));
  const b = (ap.state && ap.state.buffer) || {};
  // 1) Firmen suchen
  if (run) P.search = run.status === 'queued' && !run.total ? { state: 'active', text: `Suche in ${run.location} startet …` }
    : run.status !== 'crawling' && run.total ? { state: 'active', text: `Sucht in ${run.location} Teilgebiet für Teilgebiet: ${run.total} Firmen gefunden, ${run.crawled || 0} Websites gelesen`, progress: null }
    : run.status === 'searching' ? { state: 'active', text: `Sucht Firmen in ${run.location} …` }
    : { state: 'active', text: run.total ? `Sucht in ${run.location}: ${run.total} Firmen gefunden, ${run.crawled || 0} Websites gelesen` : `Liest Websites in ${run.location} …`, progress: run.total ? (run.crawled || 0) / run.total : null };
  else if (!active) P.search = { state: 'idle', text: 'Pausiert' };
  else if (ap.state && ap.state.needMore) P.search = { state: 'warn', text: 'Alle Orte abgesucht – weitere Orte hinzufügen' };
  else if (!jobs.length) P.search = { state: 'wait', text: 'Startet gleich' };
  else if (ap.state && ap.state.goalReached) P.search = { state: 'done', text: `Ziel erreicht: ${b.have || st.imported} von ${set.goal} Firmen` };
  else P.search = { state: 'wait', text: `${b.have || st.imported} von ${set.goal} Firmen – nächste Suche startet gleich` };
  // 2) Firmencheck
  if (!C.aiReady()) P.check = { state: 'off', text: 'KI nicht eingerichtet – ohne Firmencheck' };
  else if (st.checking) P.check = { state: 'active', text: `Prüft Impressum und Website: ${st.checked} fertig, ${st.checking} offen`, progress: st.checked / (st.checked + st.checking) };
  else P.check = { state: st.checked ? 'done' : 'wait', text: st.checked ? `${st.checked} Firmen geprüft` : 'Wartet auf die ersten Firmen' };
  // 3) Übernahme in die Kampagne
  const waitImp = jobs.length ? await cnt(sb().from('finder_results').select('id', { count: 'exact', head: true }).in('job_id', jobs.map(j => j.id)).is('imported_at', null).not('email', 'is', null)
    .in('crawl_status', ['done', 'skipped', 'error']).or('ai_status.is.null,ai_status.eq.done,ai_status.eq.error')) : 0;
  P.import = waitImp && active ? { state: 'active', text: `${waitImp} geprüfte Firmen werden übernommen …` }
    : { state: st.imported ? 'done' : 'wait', text: st.imported ? `${st.imported} Firmen in der Kampagne, ohne Dubletten` : 'Noch keine Firmen' };
  // 4) Persönliche Mails schreiben
  if (!set.personalize) P.write = { state: 'off', text: 'Aus – es wird die Vorlage verschickt' };
  else if (!C.aiReady()) P.write = { state: 'off', text: 'KI nicht eingerichtet – es wird die Vorlage verschickt' };
  else if (st.preparing || st.unwritten) P.write = { state: active ? 'active' : 'idle', text: `KI schreibt persönliche Mails: ${st.written} fertig, ${st.preparing + st.unwritten} offen`, progress: st.written / (st.written + st.preparing + st.unwritten) };
  else P.write = { state: st.written ? 'done' : 'wait', text: st.written ? `${st.written} persönliche Mails bereit` : 'Wartet auf Firmen' };
  // 5) Freigabe
  if (st.review) P.review = { state: 'wait', text: `${st.review} Mail${st.review > 1 ? 's' : ''} warten auf deine Freigabe`, you: true };
  else P.review = { state: set.reviewFirst && persOn ? 'done' : 'off', text: set.reviewFirst && persOn ? 'Nichts offen' : 'Keine Freigabe eingestellt' };
  // 6) Versand
  P.send = await sendState(ap, st, active);
  // Was gerade passiert (für den Balken oben)
  const order = ['search', 'check', 'import', 'write', 'send'];
  const cur = order.find(k => P[k].state === 'active');
  const busy = new Date(ap.lock_until || 0).getTime() > Date.now();
  let headline = cur ? { key: cur, ...P[cur] } : P.review.you ? { key: 'review', ...P.review } : P.send.state === 'wait' ? { key: 'send', ...P.send } : { key: 'idle', state: active ? 'done' : 'idle', text: active ? 'Alles erledigt – wartet auf den nächsten Schritt' : 'Pausiert' };
  if (!active) headline = { key: 'idle', state: 'idle', text: 'Pausiert – es wird nichts gesucht oder verschickt' };
  return { headline, phases: P, busy, at: nowIso() };
}
async function sendState(ap, st, active) {
  if (!ap.campaign_id) return { state: 'wait', text: 'Kampagne wird angelegt' };
  const c = await q(sb().from('campaigns').select('id,status,schedule,accounts,daily_new').eq('id', ap.campaign_id).maybeSingle());
  if (!c) return { state: 'warn', text: 'Kampagne fehlt' };
  if (!active || c.status !== 'active') return { state: 'idle', text: 'Pausiert' };
  const { st: ws } = await C.wsSettings(ap.ws_id), tz = ws.timezone || 'Europe/Vienna', sch = c.schedule || {};
  const accs = c.accounts && c.accounts.length ? await q(sb().from('accounts').select('id,email,status,warmup,warmup_start,created_at,max_per_day,next_send_at').in('id', c.accounts).eq('status', 'ok')) : [];
  if (!accs.length) return { state: 'warn', text: 'Kein verbundenes Absender-Konto' };
  const tomorrow = new Date(C.startOfLocalDay(tz)).getTime() + 864e5 + 3600e3;
  const due = await cnt(sb().from('enrollments').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('status', 'active').lte('next_at', nowIso()));
  if (!st.ready && !due) {
    if (st.review) return { state: 'wait', text: 'Nichts versandbereit – erst nach deiner Freigabe' };
    if (st.preparing || st.unwritten) return { state: 'wait', text: 'Wartet auf die ersten fertigen Mails' };
    const nx = await q(sb().from('enrollments').select('next_at').eq('campaign_id', c.id).eq('status', 'active').order('next_at').limit(1));
    return { state: st.sentTotal ? 'done' : 'wait', text: nx[0] ? `Nächstes Follow-up ${fmtWhen(new Date(nx[0].next_at).getTime(), sch.timezone || tz)}` : st.sentTotal ? 'Alles verschickt – wartet auf neue Firmen' : 'Noch nichts versandbereit' };
  }
  if (!C.inWindow(sch, tz)) { const n = C.nextWindow(sch, tz); return { state: 'wait', text: `Außerhalb der Versandzeit – geht ${n ? fmtWhen(n, sch.timezone || tz) : 'beim nächsten Versandtag'} los` }; }
  let room = 0, limit = 0, nextAt = Infinity;
  for (const a of accs) {
    const lim = C.accLimit(a), sent = await C.sentTodayCount(a, tz);
    limit += lim; room += Math.max(0, lim - sent);
    if (sent < lim) nextAt = Math.min(nextAt, Math.max(Date.now(), a.next_send_at ? new Date(a.next_send_at).getTime() : 0));
  }
  if (!room) { const n = C.nextWindow(sch, tz, tomorrow - 3600e3); return { state: 'wait', text: `Tageslimit der Konten erreicht (${limit} Mails im Warm-up) – weiter ${n ? fmtWhen(n, sch.timezone || tz) : 'morgen'}` }; }
  if (!due && (await C.newTodayCount(c, tz)) >= c.daily_new) { const n = C.nextWindow(sch, tz, tomorrow - 3600e3); return { state: 'wait', text: `Heute ${c.daily_new} neue Firmen erreicht – weiter ${n ? fmtWhen(n, sch.timezone || tz) : 'morgen'}` }; }
  return { state: 'active', text: `Versendet – nächste Mail ${nextAt <= Date.now() + 60e3 ? 'jetzt gleich' : 'ca. ' + fmtWhen(nextAt, tz)} · heute ${st.sentToday} verschickt, noch ${room} frei` };
}

// Änderungen von Hand warten kurz, bis ein laufender Durchgang fertig ist (sonst überschreibt er sie)
async function withLock(id, fn) {
  let got = false;
  for (let i = 0; i < 30 && !got; i++) {
    got = (await q(sb().from('autopilots').update({ lock_until: new Date(Date.now() + 60e3).toISOString() }).eq('id', id).lt('lock_until', nowIso()).select('id'))).length > 0;
    if (!got) await new Promise(r => setTimeout(r, 500));
  }
  try { return await fn(); }
  finally { if (got) await q(sb().from('autopilots').update({ lock_until: EPOCH }).eq('id', id)).catch(() => {}); }
}
module.exports = { run, runOne, stats, setup, syncCampaign, settingsOf, setImporter, withLock, DEF };
