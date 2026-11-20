'use strict';
// KI-Funktionen über die OpenAI-API.
// Der Schlüssel liegt NUR als Vercel-Umgebungsvariable (OPENAI_KEY oder OPENAI_API_KEY, Typ „Sensitive“).
// Er wird nie gespeichert, nie geloggt und von keiner Schnittstelle zurückgegeben.
const C = require('./core');

const key = () => process.env.OPENAI_KEY || process.env.OPENAI_API_KEY || '';
const MODELS = () => [...new Set([process.env.OPENAI_MODEL, 'gpt-5.4-mini', 'gpt-5-mini', 'gpt-4.1-mini', 'gpt-4o-mini'].filter(Boolean))];
let picked = null;                       // zuletzt funktionierendes Modell (pro Instanz)
const configured = () => !!key();
const info = () => ({ configured: configured(), model: picked || MODELS()[0] });

const DEFAULT_OFFER = 'Astravagand (astravagand.com) baut für kleine und mittlere Unternehmen in Österreich und Deutschland moderne Websites und digitale Assistenten (KI-Agents). Die Assistenten nehmen Anrufe und Anfragen rund um die Uhr an, beantworten häufige Fragen, nehmen Termine und Anliegen auf und übergeben alles gesammelt an den Betrieb.';
const offerOf = st => String((st.ai && st.ai.offer) || '').trim() || DEFAULT_OFFER;

class AiError extends Error { constructor(m, status = 400) { super(m); this.status = status; this.expose = true; } }
function friendly(status, j) {
  const code = (j && j.error && (j.error.code || j.error.type)) || '', msg = (j && j.error && j.error.message) || '';
  if (status === 401) return 'Der OpenAI-Schlüssel ist ungültig. Bitte in Vercel prüfen (OPENAI_KEY).';
  if (status === 429 && /insufficient_quota|billing/i.test(code + msg)) return 'Das OpenAI-Guthaben ist aufgebraucht. Bitte unter platform.openai.com → Billing aufladen.';
  if (status === 429) return 'OpenAI ist gerade ausgelastet. Bitte in ein paar Sekunden erneut versuchen.';
  if (status >= 500) return 'OpenAI ist gerade nicht erreichbar. Bitte gleich nochmal versuchen.';
  return 'KI-Fehler: ' + String(msg || status).slice(0, 160);
}
const modelMissing = (status, j) => status === 404 || /model_not_found|does not exist|not have access to model|unsupported model/i.test(JSON.stringify((j && j.error) || {}));

async function chat(ws, kind, { system, user, json = false, max = 900, timeout = 50000 }) {
  if (!configured()) throw new AiError('KI ist noch nicht eingerichtet: OPENAI_KEY fehlt in Vercel.', 503);
  const list = picked ? [picked, ...MODELS().filter(m => m !== picked)] : MODELS();
  let lastErr = null;
  for (const model of list) {
    const reasoning = /^(gpt-5|o\d)/.test(model);
    const body = { model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], max_completion_tokens: reasoning ? max + 1500 : max };
    if (reasoning) body.reasoning_effort = 'low'; else body.temperature = 0.7;
    if (json) body.response_format = { type: 'json_object' };
    let r, j;
    try {
      r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + key(), 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(timeout) });
      j = await r.json().catch(() => ({}));
    } catch (e) { throw new AiError(/timeout|abort/i.test(String(e && e.name) + e.message) ? 'Die KI hat zu lange gebraucht. Bitte nochmal versuchen.' : 'OpenAI ist nicht erreichbar.', 504); }
    if (!r.ok) { if (modelMissing(r.status, j)) { lastErr = j; continue; } throw new AiError(friendly(r.status, j), r.status === 401 ? 503 : 502); }
    picked = model;
    const text = (((j.choices || [])[0] || {}).message || {}).content || '';
    const u = j.usage || {};
    if (ws) C.q(C.sb().from('ai_usage').insert({ ws_id: ws, kind, model, tokens_in: u.prompt_tokens || 0, tokens_out: u.completion_tokens || 0 })).catch(() => {});
    if (!json) return text.trim();
    try { return JSON.parse(text); } catch (e) { throw new AiError('Die KI-Antwort war unvollständig. Bitte nochmal versuchen.', 502); }
  }
  throw new AiError('Kein passendes OpenAI-Modell verfügbar' + (lastErr && lastErr.error ? ': ' + String(lastErr.error.message).slice(0, 120) : '.'), 502);
}

const STYLE = `Regeln für Kaltakquise-Mails im DACH-Raum:
- Deutsch, Sie-Form, höflich und natürlich, wie von einem Menschen geschrieben – kein Marketing-Sprech, keine Floskeln wie „Ich hoffe, es geht Ihnen gut“.
- Mail 1 unter 110 Wörtern, Follow-ups unter 70 Wörtern. Kurze Absätze.
- Genau eine einfache Frage am Ende (z. B. ob es grundsätzlich interessant ist). Kein Link, kein Anhang, keine Preise, keine erfundenen Zahlen oder Referenzen.
- Keine Spam-Wörter (kostenlos, gratis, garantiert, 100 %, dringend, !!!).
- Platzhalter exakt so verwenden: {Anrede} als erste Zeile mit Komma („{Anrede},“), {Firma} für den Firmennamen, {Absender} als Name unter der Mail. Keine anderen Platzhalter erfinden.
- Keine Grußformel-Signatur mit Telefonnummer o. Ä. – nur „Viele Grüße“ und darunter {Absender}.`;

async function sequence(ws, st, { industry, notes, steps = 3 }) {
  const n = Math.max(2, Math.min(5, Number(steps) || 3));
  const j = await chat(ws, 'sequence', { json: true, max: 1800,
    system: 'Du bist ein erfahrener B2B-Texter für Kaltakquise-E-Mails im DACH-Raum.\n' + STYLE,
    user: `Unser Angebot:\n${offerOf(st)}\n\nZielgruppe/Branche: ${String(industry || 'kleine und mittlere Unternehmen').slice(0, 200)}\n${notes ? 'Zusätzliche Hinweise: ' + String(notes).slice(0, 600) + '\n' : ''}
Schreibe eine Sequenz aus ${n} Mails: Mail 1 und ${n - 1} Follow-ups. Follow-ups laufen im selben Verlauf (kein eigener Betreff nötig), beziehen sich kurz auf die vorige Mail und bringen jeweils einen neuen Gedanken. Das letzte Follow-up ist ein freundlicher Abschluss.
Betreff von Mail 1: 2–5 Wörter, klein und unaufgeregt, gern mit {Firma}.
Antworte als JSON: {"steps":[{"subject":"…","body":"…","wait":0},{"subject":"","body":"…","wait":3},…]} – wait = Werktage Abstand zur vorigen Mail (Mail 1 = 0, dann 3, dann 5).` });
  const out = (Array.isArray(j.steps) ? j.steps : []).slice(0, n).map((s, i) => ({ name: i === 0 ? 'Mail 1' : 'Follow-up ' + i, wait: i === 0 ? 0 : Math.max(1, Math.min(14, Number(s.wait) || (i === 1 ? 3 : 5))), thread: i > 0, subject: i === 0 ? String(s.subject || '').slice(0, 200) : '', body: String(s.body || '').trim().slice(0, 5000) }));
  if (!out.length || !out[0].body) throw new AiError('Die KI hat keine Sequenz geliefert. Bitte nochmal versuchen.', 502);
  return out;
}

const MODES = { kuerzer: 'Mach den Text deutlich kürzer und klarer, ohne Inhalt zu verlieren.', persoenlicher: 'Mach den Text persönlicher und menschlicher, weniger nach Vorlage.', lockerer: 'Mach den Ton etwas lockerer, aber weiterhin in Sie-Form und professionell.', formeller: 'Mach den Ton etwas förmlicher und seriöser.', besser: 'Verbessere den Text so, dass er mehr Antworten bekommt: klarer Nutzen, konkrete Frage am Ende.', betreff: 'Schreibe nur einen besseren Betreff (2–5 Wörter), der Text bleibt unverändert.' };
async function rewrite(ws, st, { subject, body, mode, instruction, step }) {
  const how = MODES[mode] || '';
  const j = await chat(ws, 'rewrite', { json: true, max: 1000,
    system: 'Du überarbeitest Kaltakquise-E-Mails.\n' + STYLE + '\nVorhandene Platzhalter in geschweiften Klammern (z. B. {Anrede}, {Firma}, {Einstieg}, {Absender}) müssen unverändert erhalten bleiben.',
    user: `Unser Angebot (nur als Hintergrund):\n${offerOf(st)}\n\nDas ist ${Number(step) > 0 ? 'ein Follow-up' : 'Mail 1'}.\nBetreff: ${String(subject || '').slice(0, 300)}\nText:\n${String(body || '').slice(0, 6000)}\n\nAufgabe: ${how} ${instruction ? String(instruction).slice(0, 400) : ''}\nAntworte als JSON: {"subject":"…","body":"…"}` });
  return { subject: String(j.subject || subject || '').slice(0, 300), body: String(j.body || '').trim().slice(0, 20000) };
}

async function reply(ws, st, { from, company, subject, text, history, senderName }) {
  return chat(ws, 'reply', { max: 700,
    system: `Du schreibst Antworten auf E-Mail-Antworten von Interessenten, im Namen von ${senderName || 'uns'}. Deutsch, Sie-Form, kurz (unter 90 Wörtern), freundlich, konkret. Wenn der Interessent Interesse zeigt: einen nächsten Schritt vorschlagen (kurzes Telefonat, zwei Terminvorschläge in der nächsten Woche ohne konkrete Daten zu erfinden – z. B. „Dienstag oder Donnerstag Vormittag“). Bei Fragen: knapp beantworten, nur mit Informationen aus dem Angebot, nichts erfinden (keine Preise, keine Referenzen). Bei Absage: freundlich bedanken, keine weitere Nachfrage. Beginne mit einer passenden Anrede, ende mit „Viele Grüße“ und dem Namen. Gib nur den Mailtext zurück, ohne Betreff.`,
    user: `Unser Angebot:\n${offerOf(st)}\n\n${history ? 'Unsere letzte Mail an den Interessenten:\n' + String(history).slice(0, 2500) + '\n\n' : ''}Antwort des Interessenten (${[from, company].filter(Boolean).join(', ')}), Betreff „${String(subject || '').slice(0, 200)}“:\n${String(text || '').slice(0, 4000)}` });
}

// Persönlicher Einstiegssatz aus der Website des Leads
const htmlToText = h => String(h || '').replace(/<(script|style|noscript|svg|nav|footer)[\s\S]*?<\/\1>/gi, ' ').replace(/<br\s*\/?>|<\/(p|div|h\d|li|section)>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
async function siteText(website) {
  const F = require('./finder');
  const url = F.normUrl ? F.normUrl(website) : website;
  if (!url) return '';
  let page;
  try { page = await F.safeFetch(url, { timeout: 7000 }); }
  catch (e) { if (/^https:/.test(url)) page = await F.safeFetch(url.replace(/^https:/, 'http:'), { timeout: 5000 }).catch(() => null); }
  if (!page || !page.text) return '';
  const title = (page.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const desc = (page.text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1] || '';
  return [title && 'Titel: ' + htmlToText(title), desc && 'Beschreibung: ' + desc, htmlToText(page.text)].filter(Boolean).join('\n').slice(0, 5000);
}
async function icebreaker(ws, st, lead) {
  const site = lead.website ? await siteText(lead.website).catch(() => '') : '';
  if (!site || site.length < 120) return { text: '', reason: lead.website ? 'Website nicht lesbar' : 'Keine Website' };
  const j = await chat(ws, 'icebreaker', { json: true, max: 300, timeout: 18000,
    system: `Du schreibst den ersten Satz einer Kaltakquise-Mail (nach der Anrede). Er zeigt, dass man sich die Website der Firma wirklich angesehen hat.
Regeln: Deutsch, Sie-Form, ein Satz, 12–28 Wörter, konkret (ein Detail, das nicht jede Firma hat: Leistung, Spezialisierung, Region, Geschichte, Besonderheit), ehrlich und unaufgeregt. Kein Lob-Kitsch („beeindruckend“, „großartig“), keine Fragen, nichts erfinden, Firmennamen natürlich kürzen (ohne GmbH/OG). Wenn die Website nichts Konkretes hergibt, gib einen leeren Text zurück.
Antworte als JSON: {"text":"…"}`,
    user: `Firma: ${lead.company || ''}${lead.city ? ' (' + lead.city + ')' : ''}\nBranche: ${lead.industry || ''}\nUnser Angebot (nur Kontext, nicht erwähnen): ${offerOf(st).slice(0, 300)}\n\nWebsite-Inhalt:\n${site}` });
  const t = String(j.text || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  return { text: t, reason: t ? '' : 'Nichts Konkretes auf der Website' };
}

// Warteschlange: KI-Einstiege werden im Cron und beim Polling abgearbeitet
async function processIcebreakers(deadline, wsOnly) {
  if (!configured()) return { done: 0 };
  const sb = C.sb(); let done = 0; const stCache = new Map();
  while (Date.now() < deadline - 31000) {
    let qy = sb.from('leads').select('id,ws_id,company,city,industry,website').eq('ice_status', 'queued').order('ice_at').limit(4);
    if (wsOnly) qy = qy.eq('ws_id', wsOnly);
    const batch = await C.q(qy);
    if (!batch.length) break;
    const claimed = [];
    for (const l of batch) { const r = await C.q(sb.from('leads').update({ ice_status: 'working', ice_at: new Date().toISOString() }).eq('id', l.id).eq('ice_status', 'queued').select('id')); if (r.length) claimed.push(l); }
    await Promise.all(claimed.map(async l => {
      if (!stCache.has(l.ws_id)) stCache.set(l.ws_id, (await C.wsSettings(l.ws_id)).st);
      try {
        const r = await icebreaker(l.ws_id, stCache.get(l.ws_id), l);
        await C.q(sb.from('leads').update({ icebreaker: r.text || null, ice_status: r.text ? 'done' : 'skipped', ice_at: new Date().toISOString() }).eq('id', l.id));
      } catch (e) {
        const fatal = e instanceof AiError && /Schlüssel|Guthaben|eingerichtet/.test(e.message);
        await C.q(sb.from('leads').update({ ice_status: fatal ? 'queued' : 'error', ice_at: new Date(Date.now() + (fatal ? 10 * 60e3 : 0)).toISOString() }).eq('id', l.id));
        if (fatal) throw e;
      }
      done++;
    }));
  }
  // hängengebliebene Aufträge (Funktion abgebrochen) wieder freigeben
  await C.q(sb.from('leads').update({ ice_status: 'queued' }).eq('ice_status', 'working').lt('ice_at', new Date(Date.now() - 5 * 60e3).toISOString())).catch(() => {});
  return { done };
}

module.exports = { configured, info, chat, sequence, rewrite, reply, icebreaker, processIcebreakers, siteText, htmlToText, offerOf, DEFAULT_OFFER, MODES, AiError };
