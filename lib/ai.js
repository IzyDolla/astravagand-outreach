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

// ---------------- KI-Firmencheck (nach dem Vorbild des Live-Coachs) ----------------
const htmlToText = h => String(h || '').replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ').replace(/<br\s*\/?>|<\/(p|div|h\d|li|section|tr|td)>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
// Website laden: Startseite + Impressum/Kontakt/Über uns (gleiche Domain, robots.txt beachtet)
async function loadSite(website) {
  const F = require('./finder');
  const url = F.normUrl ? F.normUrl(website) : website;
  if (!url) return null;
  let home;
  try { home = await F.safeFetch(url, { timeout: 6000 }); }
  catch (e) { if (/^https:/.test(url)) home = await F.safeFetch(url.replace(/^https:/, 'http:'), { timeout: 5000 }).catch(() => null); }
  if (!home || !home.text) return null;
  let sub = [];
  try {
    const links = (F.contactLinks ? F.contactLinks(home.text, home.url) : []).slice(0, 3), ok = [];
    for (const l of links) { try { if (!F.robotsAllows || await F.robotsAllows(new URL(l))) ok.push(l); } catch (e) {} }
    sub = (await Promise.all(ok.map(l => F.safeFetch(l, { timeout: 5000 }).catch(() => null)))).filter(Boolean);
  } catch (e) {}
  return { home, sub };
}
// Feste Website-Signale (ohne KI) – daraus leitet die KI die Ansatzpunkte ab
function signals(home, sub) {
  const h = String(home.text || ''), lo = h.toLowerCase(), all = (h + ' ' + sub.map(p => p.text).join(' ')).toLowerCase();
  const year = new Date().getFullYear(), out = [];
  const add = (k, label, tone) => out.push({ k, label, tone });   // tone: good | gap | info
  const cy = [...all.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(20[0-3]\d|199\d)/g)].map(m => +m[1]).filter(y => y <= year);
  if (cy.length) { const y = Math.max(...cy); if (y <= year - 3) add('alt', `Website-Copyright zuletzt ${y}`, 'gap'); }
  if (!/<meta[^>]+name=["']viewport/i.test(h)) add('mobil', 'Nicht fürs Handy optimiert (kein Viewport)', 'gap');
  if (/^http:/.test(home.url || '')) add('https', 'Website ohne HTTPS', 'gap');
  const booking = /calendly\.com|etermin\.net|shore\.com|doctolib|treatwell|timify|simplybook|booksy|planity|terminland|samedi\.de|appointmed|termin-buchen|online-termin|onlinetermin|book-online|jameda|studiobookr|salonkee/;
  if (booking.test(all)) add('termin', 'Online-Terminbuchung vorhanden', 'good'); else add('termin', 'Keine Online-Terminbuchung erkennbar', 'gap');
  const chat = /tawk\.to|intercom|userlike|smartsupp|tidio|crisp\.chat|livechatinc|zendesk|hs-scripts|chatbot|moinai|botpress|voiceflow/;
  if (chat.test(lo)) add('chat', 'Chat/Chatbot auf der Website', 'good'); else add('chat', 'Kein Chat oder Chatbot', 'gap');
  if (/wa\.me\/|api\.whatsapp\.com|whatsapp/.test(lo)) add('whatsapp', 'WhatsApp-Kontakt vorhanden', 'info');
  if (/<form[\s\S]{0,3000}?<textarea/i.test(h) || sub.some(p => /<form[\s\S]{0,3000}?<textarea/i.test(p.text))) add('formular', 'Kontaktformular vorhanden', 'info'); else add('formular', 'Kein Kontaktformular – nur Telefon/Mail', 'gap');
  if (/karriere|jobs|stellenangebot|wir suchen|offene stellen|lehrling|azubi/.test(all)) add('jobs', 'Sucht Mitarbeiter (Jobs/Karriere)', 'info');
  if (/öffnungszeiten|oeffnungszeiten|geöffnet|mo\.?\s*[-–]\s*fr/.test(all)) add('zeiten', 'Feste Öffnungszeiten angegeben', 'info');
  if (/notdienst|24\/7|rund um die uhr|24 stunden/.test(all)) add('notdienst', 'Notdienst / rund um die Uhr erreichbar', 'info');
  const cms = /wix\.com|wixstatic/.test(lo) ? 'Wix' : /jimdo/.test(lo) ? 'Jimdo' : /wp-content|wordpress/.test(lo) ? 'WordPress' : /squarespace/.test(lo) ? 'Squarespace' : /webflow/.test(lo) ? 'Webflow' : /typo3/.test(lo) ? 'TYPO3' : '';
  if (cms) add('cms', 'Baukasten/CMS: ' + cms, 'info');
  if (/provenexpert|trustpilot|google-bewertung|kundenbewertungen|sterne/.test(lo)) add('bewertungen', 'Bewertungen auf der Website', 'info');
  if (/barrierefreiheit/.test(all)) add('bfsg', 'Erklärung zur Barrierefreiheit vorhanden', 'good');
  return out;
}
async function analyze(ws, st, lead) {
  const site = lead.website ? await loadSite(lead.website).catch(() => null) : null;
  if (!site) return { text: '', reason: lead.website ? 'Website nicht lesbar' : 'Keine Website', insights: null };
  const sig = signals(site.home, site.sub);
  const title = (site.home.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  const desc = (site.home.text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1] || '';
  const homeTxt = [title && 'Titel: ' + htmlToText(title), desc && 'Beschreibung: ' + desc, htmlToText(site.home.text)].filter(Boolean).join('\n').slice(0, 4500);
  const subTxt = site.sub.map(p => `--- Seite ${p.url} ---\n` + htmlToText(p.text).slice(0, 3500)).join('\n').slice(0, 7000);
  if (homeTxt.length < 120 && subTxt.length < 120) return { text: '', reason: 'Website nicht lesbar', insights: null };
  const ask = (extra = '') => chat(ws, 'icebreaker', { json: true, max: 900, timeout: 22000,
    system: `Du bereitest Kaltakquise vor. Du liest die Website einer Firma (Startseite, Impressum, Kontakt, Über uns) und lieferst, was ein Verkäufer braucht.
Unser Angebot (Kontext): ${offerOf(st).slice(0, 600)}

1) PERSONEN: Geschäftsführung bzw. Inhaber laut Impressum („Geschäftsführer“, „Inhaber“, „vertreten durch“, „Vorstand“). Nur Namen, die wörtlich im Text stehen – nichts erfinden. Aufsichtsrat NIE aufnehmen, auch nicht den Aufsichtsratsvorsitzenden. Prokuristen nur als rolle "Prokurist". Anrede (Herr/Frau) nur, wenn eindeutig, sonst "". Titel wie Dr. oder Mag. weglassen.
ZIEL = Index der wichtigsten Person: zuerst Inhaber bzw. (Vorsitzender der) Geschäftsführung, sonst die erste Person der Geschäftsführung. Keine Person: -1.
2) KURZPROFIL: 1–2 Sätze, was die Firma macht und für wen, sachlich.
3) FAKTEN: bis zu 4 kurze, belegte Fakten, max. 6 Wörter je Fakt (z. B. "seit 1987", "12 Mitarbeiter", "3 Standorte", "Bosch Car Service"). KEINE Adressen, Öffnungszeiten, Telefonnummern. Nichts schätzen.
4) ANSATZPUNKTE: 2–3 konkrete Ansatzpunkte, wo unser Angebot (Website, digitaler Assistent/KI-Agent für Anrufe, Anfragen, Termine) dieser Firma Zeit spart oder Anfragen bringt. Stütze dich auf die Signale und den Inhalt. Je Ansatzpunkt: titel (max. 6 Wörter) und warum (1 Satz). Wertschätzend formuliert, nicht als Mangel.
5) EINSTIEG: erster Satz der Mail nach der Anrede. Deutsch, Sie-Form, genau EIN vollständiger Satz mit Subjekt und Verb, 12–28 Wörter, beginnt groß, endet mit Punkt, konkretes Detail von der Website, kein Lob-Kitsch, keine Frage, keine Kritik, nichts erfinden, Firmennamen ohne GmbH/OG/e.U. Variiere den Anfang (nicht immer „Auf Ihrer Website …“). Der Satz muss etwas Besonderes der Firma aufgreifen (Spezialisierung, Marke, Geschichte, Leistung, Auszeichnung) – NIEMALS Adresse, Straße, Öffnungszeiten, Telefonnummer oder Rechtsform. Nichts Konkretes: "".${extra}
Antworte als JSON: {"personen":[{"anrede":"Herr","vorname":"…","nachname":"…","rolle":"Geschäftsführer"}],"ziel":0,"kurzprofil":"…","fakten":["…"],"ansatzpunkte":[{"titel":"…","warum":"…"}],"einstieg":"…"}`,
    user: `Firma: ${lead.company || ''}${lead.city ? ' (' + lead.city + ')' : ''}\nBranche: ${lead.industry || ''}\n\nSignale aus dem Website-Check:\n${sig.map(x => '- ' + x.label).join('\n')}\n\nSTARTSEITE:\n${homeTxt}\n\n${subTxt}` });
  const okSentence = t => /^[A-ZÄÖÜ]/.test(t) && /[.!]$/.test(t) && t.split(' ').length >= 8 && t.split(' ').length <= 40 && !/öffnungszeit|stra(ß|ss)e\b|str\.\s*\d|\d{1,2}[:.]\d{2}\s*uhr|telefon/i.test(t) && !/\b[1-9]\d{3}\s+[A-ZÄÖÜ][a-zäöü]+/.test(t);
  const clean = v => String(v || '').replace(/\s+/g, ' ').trim();
  let j = await ask(); let t = clean(j.einstieg).slice(0, 300);
  if (t && !okSentence(t)) { j = await ask('\nWICHTIG: Der letzte EINSTIEG war unbrauchbar (kein vollständiger Satz oder Adresse/Öffnungszeiten). Schreibe einen vollständigen Satz über eine Besonderheit der Firma.'); t = clean(j.einstieg).slice(0, 300); if (!okSentence(t)) t = ''; }
  const corpus = (htmlToText(site.home.text) + ' ' + site.sub.map(p => htmlToText(p.text)).join(' ')).toLowerCase();
  const people = (Array.isArray(j.personen) ? j.personen : []).slice(0, 6).map(p => ({ anrede: /^(Herr|Frau)$/.test(p.anrede) ? p.anrede : '', first: clean(p.vorname).slice(0, 60), last: clean(p.nachname).slice(0, 80), role: clean(p.rolle).slice(0, 80) }))
    .filter(p => p.last && corpus.includes(p.last.toLowerCase()) && !/aufsichtsrat/i.test(p.role));   // nur Namen, die wirklich auf der Website stehen
  const zi = Number.isInteger(j.ziel) && people[j.ziel] ? j.ziel : people.length ? 0 : -1;
  const insights = { people, target: zi, profile: clean(j.kurzprofil).slice(0, 400), facts: (Array.isArray(j.fakten) ? j.fakten : []).map(clean).filter(f => f && f.split(' ').length <= 8 && !/öffnungszeit|stra(ß|ss)e|\d{1,2}[:.]\d{2}|telefon|mo[.-]/i.test(f)).slice(0, 4),
    angles: (Array.isArray(j.ansatzpunkte) ? j.ansatzpunkte : []).map(a => ({ title: clean(a.titel).slice(0, 80), why: clean(a.warum).slice(0, 240) })).filter(a => a.title).slice(0, 3),
    signals: sig, pages: [site.home.url, ...site.sub.map(p => p.url)].slice(0, 4), at: new Date().toISOString() };
  return { text: t, reason: t ? '' : 'Nichts Konkretes auf der Website', insights };
}
const icebreaker = analyze;
// Ergebnis speichern; Ansprechpartner nur eintragen, wenn beim Lead noch keiner steht
async function saveAnalysis(lead, r) {
  const patch = { icebreaker: r.text || null, ice_status: r.text || r.insights ? 'done' : 'skipped', ice_at: new Date().toISOString(), insights: r.insights || null };
  const tp = r.insights && r.insights.target >= 0 ? r.insights.people[r.insights.target] : null;
  if (tp && !String(lead.first || '').trim() && !String(lead.last || '').trim() && tp.first) { patch.first = tp.first; patch.last = tp.last; if (tp.anrede) patch.salutation = tp.anrede; }
  else if (tp && tp.anrede && !lead.salutation && String(lead.last || '').trim().toLowerCase() === String(tp.last || '').toLowerCase()) patch.salutation = tp.anrede;
  await C.q(C.sb().from('leads').update(patch).eq('id', lead.id));
  return patch;
}
async function siteText(website) { const s = await loadSite(website); return s ? htmlToText(s.home.text).slice(0, 5000) : ''; }

// Warteschlange: KI-Einstiege werden im Cron und beim Polling abgearbeitet
async function processIcebreakers(deadline, wsOnly, reserve = 40000) {
  if (!configured()) return { done: 0 };
  const sb = C.sb(); let done = 0; const stCache = new Map();
  while (Date.now() < deadline - reserve) {
    let qy = sb.from('leads').select('id,ws_id,company,city,industry,website,first,last,salutation').eq('ice_status', 'queued').order('ice_at').limit(4);
    if (wsOnly) qy = qy.eq('ws_id', wsOnly);
    const batch = await C.q(qy);
    if (!batch.length) break;
    const claimed = [];
    for (const l of batch) { const r = await C.q(sb.from('leads').update({ ice_status: 'working', ice_at: new Date().toISOString() }).eq('id', l.id).eq('ice_status', 'queued').select('id')); if (r.length) claimed.push(l); }
    await Promise.all(claimed.map(async l => {
      if (!stCache.has(l.ws_id)) stCache.set(l.ws_id, (await C.wsSettings(l.ws_id)).st);
      try {
        const r = await analyze(l.ws_id, stCache.get(l.ws_id), l);
        await saveAnalysis(l, r);
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

// ---------------- KI-Personalisierung pro Lead (Vorlage = Gerüst, Firmencheck = Inhalt) ----------------
const ALLOWED_VARS = new Set(['Anrede', 'Absender', 'Firma', 'Vorname', 'Nachname', 'Stadt']);
const DEFICIT = /\b(fehlt|fehlen|fehlende[nrs]?|veraltet|nicht mehr zeitgemäß|altmodisch|in die jahre gekommen|mangel|mängel|schlecht|schwach|unprofessionell|nicht (fürs|für das|für) handy)\b/i;
const wordsOf = t => String(t || '').replace(/\{\w+\}/g, 'x').trim().split(/\s+/).filter(Boolean).length;
function checkPersonal(tpl, out, ctx) {
  const errs = [];
  if (!Array.isArray(out) || out.length !== tpl.length) return ['Anzahl der Schritte stimmt nicht'];
  out.forEach((p, i) => {
    const t = tpl[i], body = String(p.body || '').trim(), n = i === 0 ? 'Mail 1' : 'Follow-up ' + i;
    if (!body) { errs.push(n + ': leer'); return; }
    if (/^\s*\{Anrede\}/.test(t.body || '') && !/^\{Anrede\},/.test(body)) errs.push(n + ': muss mit "{Anrede}," beginnen');
    if (/\{Absender\}/.test(t.body || '') && !/\{Absender\}\s*$/.test(body)) errs.push(n + ': muss mit {Absender} enden');
    const bad = [...body.matchAll(/\{(\w+)\}/g)].map(m => m[1]).filter(k => !ALLOWED_VARS.has(k));
    if (bad.length) errs.push(n + ': unbekannte Platzhalter ' + bad.join(', '));
    if (/https?:\/\/|www\./i.test(body) && !/https?:\/\/|www\./i.test(t.body || '')) errs.push(n + ': keine Links');
    const lim = Math.max(i === 0 ? 170 : 110, Math.round(wordsOf(t.body) * 1.6));
    if (wordsOf(body) > lim) errs.push(`${n}: zu lang (${wordsOf(body)} Wörter, max. ${lim})`);
    if (DEFICIT.test(body)) errs.push(n + ': klingt nach Kritik an der Firma (Wörter wie „fehlt“, „veraltet“)');
    const spam = C.SPAM.filter(w => (body + ' ' + (p.subject || '')).toLowerCase().includes(w));
    if (spam.length) errs.push(n + ': Spam-Wörter ' + spam.join(', '));
    if (i === 0 && !String(p.subject || '').trim()) errs.push('Mail 1: Betreff fehlt');
    if (i === 0 && !/\?/.test(body)) errs.push('Mail 1: braucht mindestens eine Frage an die Firma');
    // Mail 1 muss wirklich auf die Firma zugeschnitten sein, nicht die Vorlage mit einem Satz davor
    if (i === 0 && ctx) {
      const sents = sentencesOf(t.body).filter(x => x.length > 35);
      const kept = sents.filter(x => normTxt(body).includes(normTxt(x))).length;
      if (sents.length >= 2 && kept / sents.length > 0.5) errs.push(`Mail 1: ${kept} von ${sents.length} Sätzen sind wörtlich aus der Vorlage – den Pitch auf diese Firma zuschneiden statt nur einen Satz davorzusetzen`);
      const firm = tokensOf(ctx), tplTok = tokensOf(t.body), hit = [...tokensOf(body)].filter(w => firm.has(w) && !tplTok.has(w));
      if (firm.size >= 8 && hit.length < 3) errs.push('Mail 1: zu wenig Bezug zu dem, was diese Firma macht (Leistungen, Kunden, Schwerpunkt)');
    }
    if (/^(ihre|auf ihrer) (website|webseite|homepage)\b/i.test(firstPara(body))) errs.push(n + ': nicht mit einer Beschreibung der Website anfangen, sondern mit ihrem Geschäft');
  });
  return errs;
}
const normTxt = x => String(x).toLowerCase().replace(/\{\w+\}/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const sentencesOf = x => String(x).replace(/\{\w+\},?/g, ' ').split(/(?<=[.!?])\s+|\n+/).map(y => y.trim()).filter(Boolean);
const STOP = new Set('aber alle allem auch dass diese dieser dieses durch eine einem einen einer eines etwas für haben hier ihnen ihre ihrem ihren ihrer immer jetzt kann können mehr mit nach noch oder ohne sich sind sowie über unter viele vom von wenn werden wird wurde zum zur zwischen damit dabei denn dann sehr gerne direkt rund gmbh berlin wien'.split(' '));
const tokensOf = x => new Set(normTxt(x).split(' ').filter(w => w.length >= 6 && !STOP.has(w)));
const firstPara = b => (String(b).split(/\n\s*\n/)[1] || '').trim();
// Absätze nach dem ersten beginnen groß (Vorlagen beginnen nach der Anrede klein, z. B. „im Handwerk …“)
// Erster Absatz darf klein beginnen (Briefform) – aber „Sie/Ihr…“ und Firmennamen bleiben groß
function fixCase(body, company) {
  const ps = String(body).split(/\n\s*\n/), up = x => x[0].toUpperCase() + x.slice(1);
  const co = String(company || '').trim();
  return ps.map((x, i) => {
    if (i >= 2 && /^[a-zäöü]/.test(x)) return up(x);
    if (i === 1 && /^[a-zäöü]/.test(x)) {
      if (/^(sie|ihr|ihre|ihrem|ihren|ihrer|ihres|ihnen)\b/.test(x)) return up(x);
      // längster Anfang des Firmennamens, der klein geschrieben übernommen wurde → Originalschreibweise
      const w = co.split(/\s+/).filter(Boolean); let pre = '';
      for (let k = w.length; k >= 1 && !pre; k--) { const c = w.slice(0, k).join(' '); if (x.toLowerCase().startsWith(c.toLowerCase()) && /^([\s,.:;–-]|$)/.test(x.slice(c.length))) pre = c; }
      if (pre && /^[A-ZÄÖÜ0-9]/.test(pre)) return pre + x.slice(pre.length);
    }
    return x;
  }).join('\n\n');
}
async function personalize(ws, st, { steps, lead, insights, icebreaker }) {
  const ins = insights || {};
  const tp = ins.target >= 0 && ins.people ? ins.people[ins.target] : null;
  const obs = (ins.signals || []).filter(x => x.tone !== 'good').map(x => x.label), has = (ins.signals || []).filter(x => x.tone === 'good').map(x => x.label);
  const company = [`Firma: ${lead.company || ''}${lead.city ? ' (' + lead.city + ')' : ''}`, lead.industry && 'Branche: ' + lead.industry,
    ins.profile && 'Kurzprofil: ' + ins.profile, (ins.facts || []).length && 'Fakten: ' + ins.facts.join('; '),
    (ins.angles || []).length && 'Wo unser Angebot bei ihnen ansetzen kann:\n' + ins.angles.map(a => `- ${a.title}: ${a.why}`).join('\n'),
    obs.length && 'Beobachtungen auf ihrer Website (nur als neutrale Frage aufgreifen, nie als Mangel): ' + obs.join('; '),
    has.length && 'Haben sie schon (nicht als Neuheit anbieten): ' + has.join('; '),
    tp && `Ansprechpartner: ${[tp.anrede, tp.first, tp.last].filter(Boolean).join(' ')}${tp.role ? ' (' + tp.role + ')' : ''}`,
    icebreaker && 'Notiz aus dem Firmencheck: ' + icebreaker].filter(Boolean).join('\n');
  const tplTxt = steps.map((t, i) => `### ${i === 0 ? 'Mail 1' : 'Follow-up ' + i}${i > 0 && t.thread ? ' (im selben Verlauf, kein eigener Betreff)' : ''}\n${i === 0 || !t.thread ? 'Betreff: ' + (t.subject || '') + '\n' : ''}${t.body.replace(/\{Einstieg\}\n*/g, '')}`).join('\n\n');
  const ask = extra => chat(ws, 'personalize', { json: true, max: 2200, timeout: 30000,
    system: `Du schreibst eine Kaltakquise-Sequenz für EINE bestimmte Firma. Die Vorlage gibt Idee, Angebot, Tonfall und Ablauf vor – aber die Mails werden auf diese Firma zugeschnitten: Wo liegt ihr Schwerpunkt, wer sind ihre Kunden, in welcher konkreten Situation hilft ihnen unser Angebot? Dort setzt du an.

So baust du Mail 1 auf:
1. "{Anrede}," (eigene Zeile).
2. Ein Satz zu ihrem Geschäft – konkret, was sie machen und für wen (aus dem Kurzprofil). Nicht "Ihre Website zeigt …", kein Lob, keine Floskel.
3. Die Situation, die bei genau diesem Schwerpunkt typisch ist und zu unserem Angebot passt (aus den Ansatzpunkten) – als offene Frage, wie sie das heute lösen. Beobachtungen von der Website neutral benennen und fragen, z. B. "Bei Ihnen laufen Anfragen über Telefon und E-Mail – wie machen Sie das, wenn Sie gerade beim Kunden sind?" oder "Haben Sie sich schon Gedanken gemacht, wie …?". Nie als Kritik ("fehlt", "kein …", "veraltet", "nicht mehr zeitgemäß").
4. Unser Angebot in 1–2 Sätzen, so formuliert, dass es genau diese Situation löst (nur, was im Angebot steht – nichts dazuerfinden).
5. Eine kurze, leichte Frage am Ende (wie in der Vorlage).
6. Grußformel und "{Absender}" wie in der Vorlage.

Follow-ups: greifen kurz die erste Mail auf und bringen einen ANDEREN Ansatzpunkt oder eine neue Frage zu dieser Firma; das letzte Follow-up bleibt kurz und freundlich wie in der Vorlage.

Regeln:
- Deutsch, Sie-Form, wie von einem Menschen geschrieben, der sich die Firma angesehen hat. Keine Werbesprache, keine Ausrufezeichen.
- Nach "{Anrede}," beginnt der erste Absatz klein (deutsche Briefform) – außer "Sie"/"Ihr…" und Namen, die immer groß bleiben. Alle weiteren Absätze beginnen groß.
- Erlaubte Platzhalter nur {Anrede}, {Absender}, {Firma}, {Vorname}, {Nachname}, {Stadt}. Jede Mail beginnt mit "{Anrede}," und endet mit "{Absender}".
- Nichts erfinden: keine Zahlen, Preise, Kunden oder Fakten, die nicht im Firmencheck stehen.
- Keine Links. Mail 1 höchstens 150 Wörter, Follow-ups höchstens 90.
- Follow-ups im selben Verlauf haben keinen eigenen Betreff (subject leer).
- Betreff von Mail 1: 2–6 Wörter, sachlich, auf ihr Thema bezogen (z. B. "Anfragen zur Ladeinfrastruktur").

Beispiel (andere Branche) – SCHLECHT: "{Anrede},\\n\\nIhre Website stellt Ihre Fliesenarbeiten klar in den Mittelpunkt.\\n\\nim Handwerk klingelt das Telefon …" (ein Satz Ist-Zustand, dann Standard-Pitch).
GUT: "{Anrede},\\n\\nSie verlegen in Graz vor allem Großformat-Fliesen für Bäder und Neubauten von Bauträgern.\\n\\nGerade bei Badsanierungen fragen viele Privatkunden zuerst nach Preisrahmen und Terminen. Bei Ihnen läuft das über Telefon und E-Mail – wie halten Sie das am Laufen, wenn Sie selbst auf der Baustelle sind?\\n\\nWir bauen für Betriebe wie {Firma} einen digitalen Assistenten, der solche Anfragen rund um die Uhr annimmt, die wichtigsten Eckdaten abfragt und Ihnen alles gesammelt schickt.\\n\\nWäre das für Sie interessant?\\n\\nBeste Grüße\\n{Absender}"${extra || ''}
Antworte als JSON: {"steps":[{"subject":"…","body":"…"},{"subject":"","body":"…"}]} – genau ${steps.length} Schritte in derselben Reihenfolge.`,
    user: `Unser Angebot:\n${offerOf(st).slice(0, 900)}\n\nFIRMENCHECK:\n${company}\n\nVORLAGE (Idee und Ablauf):\n${tplTxt}` });
  const norm = j => (Array.isArray(j && j.steps) ? j.steps : []).slice(0, steps.length).map((p, i) => ({ subject: i === 0 || !steps[i].thread ? String(p.subject || '').replace(/\s+/g, ' ').trim().slice(0, 160) : '', body: fixCase(String(p.body || '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, 6000), lead.company) }));
  const ctx = [ins.profile, (ins.facts || []).join(' '), (ins.angles || []).map(a => a.title + ' ' + a.why).join(' '), lead.industry].filter(Boolean).join(' ');
  let out = norm(await ask()), errs = checkPersonal(steps, out, ctx);
  if (errs.length) { out = norm(await ask('\n\nDein letzter Entwurf hatte diese Fehler – vermeide sie unbedingt:\n- ' + errs.join('\n- '))); errs = checkPersonal(steps, out, ctx); }
  if (errs.length) { const e = new AiError('Personalisierung verworfen: ' + errs.slice(0, 3).join('; '), 422); e.soft = true; throw e; }
  return out;
}
// Warteschlange: Enrollments mit pers_status 'queued' personalisieren (wartet, bis der Firmencheck des Leads fertig ist)
async function processPersonalize(deadline, wsOnly, reserve = 40000) {
  if (!configured()) return { done: 0 };
  const sb = C.sb(); let done = 0; const stCache = new Map(), campCache = new Map();
  // Vorrat anlegen: je aktiver Kampagne mit Personalisierung die nächsten Leads einreihen
  const camps = await C.q(sb.from('campaigns').select('id,ws_id,daily_new').eq('status', 'active').eq('personalize', true));
  for (const c of camps) {
    if (wsOnly && c.ws_id !== wsOnly) continue;
    const open = await C.cnt(sb.from('enrollments').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('status', 'pending').in('pers_status', ['queued', 'working', 'done']));
    const want = Math.min(60, Math.max(10, c.daily_new)) - open;
    if (want > 0) {
      const ids = (await C.q(sb.from('enrollments').select('id').eq('campaign_id', c.id).eq('status', 'pending').is('pers_status', null).order('created_at').limit(want))).map(x => x.id);
      if (ids.length) await C.q(sb.from('enrollments').update({ pers_status: 'queued', pers_at: new Date().toISOString() }).in('id', ids).is('pers_status', null));
    }
  }
  while (Date.now() < deadline - reserve) {
    let qy = sb.from('enrollments').select('id,ws_id,campaign_id,lead_id,status').eq('pers_status', 'queued').lte('pers_at', new Date().toISOString()).order('pers_at').limit(4);
    if (wsOnly) qy = qy.eq('ws_id', wsOnly);
    const batch = await C.q(qy);
    if (!batch.length) break;
    const claimed = [];
    for (const e of batch) { const g = await C.q(sb.from('enrollments').update({ pers_status: 'working', pers_at: new Date().toISOString() }).eq('id', e.id).eq('pers_status', 'queued').select('id')); if (g.length) claimed.push(e); }
    const results = [];
    await Promise.all(claimed.map(async e => {
      const later = mins => C.q(sb.from('enrollments').update({ pers_status: 'queued', pers_at: new Date(Date.now() + mins * 60e3).toISOString() }).eq('id', e.id));
      try {
        if (e.status !== 'pending') { await C.q(sb.from('enrollments').update({ pers_status: 'skipped' }).eq('id', e.id)); return; }
        if (!campCache.has(e.campaign_id)) campCache.set(e.campaign_id, await C.q(sb.from('campaigns').select('id,steps,review_first,personalize').eq('id', e.campaign_id).maybeSingle()));
        const c = campCache.get(e.campaign_id);
        const lead = await C.q(sb.from('leads').select('id,company,city,industry,website,first,last,salutation,insights,icebreaker,ice_status,ice_at').eq('id', e.lead_id).maybeSingle());
        if (!c || !lead) { await C.q(sb.from('enrollments').update({ pers_status: 'skipped' }).eq('id', e.id)); return; }
        // Firmencheck noch nicht da? Erst anstoßen bzw. abwarten (max. 3 Stunden)
        if (!lead.insights && lead.website && lead.ice_status !== 'done' && lead.ice_status !== 'skipped') {
          if (!lead.ice_status || lead.ice_status === 'error') await C.q(sb.from('leads').update({ ice_status: 'queued', ice_at: new Date().toISOString() }).eq('id', lead.id));
          if (Date.now() - new Date(lead.ice_at || Date.now()).getTime() < 3 * 3600e3) { await later(2); return; }
        }
        if (!lead.insights) { await C.q(sb.from('enrollments').update({ pers_status: 'skipped', pers_at: new Date().toISOString() }).eq('id', e.id)); return; }   // ohne Firmencheck bleibt es bei der Vorlage
        if (!stCache.has(e.ws_id)) stCache.set(e.ws_id, (await C.wsSettings(e.ws_id)).st);
        const out = await personalize(e.ws_id, stCache.get(e.ws_id), { steps: c.steps, lead, insights: lead.insights, icebreaker: lead.icebreaker });
        results.push({ e, c, out });
      } catch (err) {
        const fatal = err instanceof AiError && /Schlüssel|Guthaben|eingerichtet/.test(err.message);
        if (fatal) { await later(10); throw err; }
        await C.q(sb.from('enrollments').update({ pers_status: 'error', pers_at: new Date().toISOString(), personal: { error: String(err.message || err).slice(0, 300) } }).eq('id', e.id));   // Vorlage wird verwendet
      }
    }));
    // Freigabe nacheinander entscheiden, damit genau die ersten X Mails warten
    for (const { e, c, out } of results) {
      let review = null;
      if (c.review_first > 0) {
        const used = await C.cnt(sb.from('enrollments').select('id', { count: 'exact', head: true }).eq('campaign_id', c.id).in('review', ['pending', 'ok']));
        if (used < c.review_first) review = 'pending';
      }
      await C.q(sb.from('enrollments').update({ personal: { steps: out, at: new Date().toISOString() }, pers_status: 'done', pers_at: new Date().toISOString(), review }).eq('id', e.id).eq('status', 'pending'));
      done++;
    }
  }
  await C.q(sb.from('enrollments').update({ pers_status: 'queued' }).eq('pers_status', 'working').lt('pers_at', new Date(Date.now() - 10 * 60e3).toISOString())).catch(() => {});
  return { done };
}
// Firmencheck direkt im Lead-Finder (vor der Übernahme in die Leadliste)
async function processFinder(deadline, wsOnly, reserve = 40000) {
  if (!configured()) return { done: 0 };
  const sb = C.sb(); let done = 0; const stCache = new Map();
  while (Date.now() < deadline - reserve) {
    let fq = sb.from('finder_results').select('id,ws_id,name,city,category,website,contact_first,contact_last,contact_role').eq('ai_status', 'queued').order('ai_at').limit(5);
    if (wsOnly) fq = fq.eq('ws_id', wsOnly);
    const batch = await C.q(fq);
    if (!batch.length) break;
    const claimed = [];
    for (const r of batch) { const g = await C.q(sb.from('finder_results').update({ ai_status: 'working', ai_at: new Date().toISOString() }).eq('id', r.id).eq('ai_status', 'queued').select('id')); if (g.length) claimed.push(r); }
    await Promise.all(claimed.map(async r => {
      if (!stCache.has(r.ws_id)) stCache.set(r.ws_id, (await C.wsSettings(r.ws_id)).st);
      try {
        const res = await analyze(r.ws_id, stCache.get(r.ws_id), { company: r.name, city: r.city, industry: r.category, website: r.website });
        const patch = { insights: res.insights || null, icebreaker: res.text || null, ai_status: res.insights ? 'done' : 'skipped', ai_at: new Date().toISOString() };
        const tp = res.insights && res.insights.target >= 0 ? res.insights.people[res.insights.target] : null;
        if (tp && tp.first && !r.contact_last) Object.assign(patch, { contact_first: tp.first, contact_last: tp.last, contact_role: tp.role || 'Geschäftsführung' });
        await C.q(sb.from('finder_results').update(patch).eq('id', r.id));
      } catch (e) {
        const fatal = e instanceof AiError && /Schlüssel|Guthaben|eingerichtet/.test(e.message);
        await C.q(sb.from('finder_results').update({ ai_status: fatal ? 'queued' : 'error', ai_at: new Date(Date.now() + (fatal ? 10 * 60e3 : 0)).toISOString() }).eq('id', r.id));
        if (fatal) throw e;
      }
      done++;
    }));
  }
  await C.q(sb.from('finder_results').update({ ai_status: 'queued' }).eq('ai_status', 'working').lt('ai_at', new Date(Date.now() - 5 * 60e3).toISOString())).catch(() => {});
  return { done };
}
module.exports = { fixCase, personalize, checkPersonal, processPersonalize, processFinder, configured, info, chat, sequence, rewrite, reply, icebreaker, analyze, saveAnalysis, signals, loadSite, processIcebreakers, siteText, htmlToText, offerOf, DEFAULT_OFFER, MODES, AiError };
