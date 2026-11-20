// KI-Modul (OpenAI simuliert), Signatur-HTML, {Einstieg}
process.env.OPENAI_KEY = 'sk-test';
const C = require('../lib/core'); const AI = require('../lib/ai');
let ok = 0, bad = 0; const t = (n, c) => { if (c) ok++; else { bad++; console.log('FAIL', n); } };
const calls = []; let mode = 'ok';
global.fetch = async (url, opts) => {
  const b = JSON.parse(opts.body); calls.push(b);
  if (mode === 'nomodel' && b.model === 'gpt-5.4-mini') return { ok: false, status: 404, json: async () => ({ error: { code: 'model_not_found', message: 'The model does not exist' } }) };
  if (mode === 'quota') return { ok: false, status: 429, json: async () => ({ error: { code: 'insufficient_quota', message: 'quota' } }) };
  const sys = b.messages[0].content;
  const content = /Sequenz|B2B-Texter/.test(sys) ? JSON.stringify({ steps: [{ subject: 'Frage zu {Firma}', body: '{Anrede},\n\nText.\n\nViele Grüße\n{Absender}', wait: 0 }, { body: '{Anrede},\n\nnachgehakt.', wait: 3 }, { body: '{Anrede},\n\nletzte Mail.', wait: 5 }] })
    : /überarbeitest/.test(sys) ? JSON.stringify({ subject: 'Kurz', body: '{Anrede},\n\nkürzer.' }) : 'Guten Tag Herr Huber,\n\ndanke!\n\nViele Grüße\nIsah Sinani';
  return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }], usage: { prompt_tokens: 100, completion_tokens: 50 } }) };
};
C.setClient && null;
(async () => {
  const st = { company: 'Astravagand', footer: 'Astravagand\nAbmelden: antworten' };
  const seq = await AI.sequence(null, st, { industry: 'Kfz', steps: 3 });
  t('Sequenz: 3 Schritte', seq.length === 3 && seq[0].subject === 'Frage zu {Firma}' && seq[1].thread && seq[1].wait === 3 && seq[2].wait === 5);
  t('Sequenz: Modell gpt-5.x mit reasoning_effort', calls[0].model === 'gpt-5.4-mini' && calls[0].reasoning_effort === 'low' && calls[0].temperature === undefined);
  const rw = await AI.rewrite(null, st, { subject: 'X', body: 'Langer Text', mode: 'kuerzer' });
  t('Umschreiben', rw.subject === 'Kurz' && /kürzer/.test(rw.body));
  const rep = await AI.reply(null, st, { from: 'Huber', text: 'Klingt interessant' });
  t('Antwortvorschlag', /Viele Grüße/.test(rep));
  mode = 'nomodel'; calls.length = 0;
  // neues Modul laden, damit kein Modell gemerkt ist
  delete require.cache[require.resolve('../lib/ai')]; const AI2 = require('../lib/ai');
  await AI2.rewrite(null, st, { body: 'x' });
  t('Fallback auf nächstes Modell', calls.length === 2 && calls[1].model === 'gpt-5-mini');
  mode = 'quota'; let e1 = ''; try { await AI2.rewrite(null, st, { body: 'x' }); } catch (e) { e1 = e.message; }
  t('Guthaben leer → klare Meldung', /Guthaben/.test(e1));
  delete process.env.OPENAI_KEY; let e2 = ''; try { await AI2.rewrite(null, st, { body: 'x' }); } catch (e) { e2 = e.message; }
  t('Ohne Key → klare Meldung', /OPENAI_KEY fehlt/.test(e2)); process.env.OPENAI_KEY = 'sk-test';
  // KI-Firmencheck: Impressum, Personen, Signale, Einstieg
  const F = require('../lib/finder');
  const HOME = '<html><head><title>Autohaus Test</title></head><body><p>' + 'Wir sind Ihr Partner für Oldtimer-Restaurierung und Subaru-Service in Linz seit 1987. '.repeat(4) + '</p><a href="/impressum">Impressum</a><p>© 2019 Autohaus Test</p></body></html>';
  const IMP = '<html><body><h1>Impressum</h1><p>Geschäftsführer: Karl Huber</p><p>Vorsitzender des Aufsichtsrats: Franz Maier</p></body></html>';
  F.safeFetch = async u => ({ url: String(u), text: /impressum/.test(String(u)) ? IMP : HOME }); F.robotsAllows = async () => true;
  delete require.cache[require.resolve('../lib/ai')]; const AI3 = require('../lib/ai');
  let n = 0; const answer = e => JSON.stringify({ personen: [{ anrede: 'Herr', vorname: 'Karl', nachname: 'Huber', rolle: 'Geschäftsführer' }, { anrede: 'Herr', vorname: 'Franz', nachname: 'Maier', rolle: 'Aufsichtsratsvorsitzender' }, { anrede: 'Frau', vorname: 'Erfunden', nachname: 'Nirgends', rolle: 'Geschäftsführerin' }], ziel: 0, kurzprofil: 'Werkstatt in Linz.', fakten: ['seit 1987'], ansatzpunkte: [{ titel: 'Online-Termine', warum: 'Spart Telefonate.' }], einstieg: e });
  global.fetch = async () => { n++; return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: answer(n === 1 ? 'auf Ihrer Filiale in Linz mit Reifen' : 'Seit 1987 restaurieren Sie in Linz Oldtimer und betreuen zusätzlich Subaru-Fahrzeuge im Service.') } }], usage: {} }) }; };
  const ib = await AI3.analyze(null, st, { company: 'Autohaus Test', website: 'https://autohaus-test.at' });
  t('Firmencheck: Fragment verworfen, zweiter Versuch', n === 2 && ib.text.startsWith('Seit 1987'));
  t('Firmencheck: Geschäftsführer erkannt, Aufsichtsrat + erfundene Namen raus', ib.insights.people.length === 1 && ib.insights.people[0].last === 'Huber' && ib.insights.target === 0);
  t('Firmencheck: Signale (altes Copyright, kein Handy, kein Chat)', ['alt', 'mobil', 'chat'].every(k => ib.insights.signals.some(x => x.k === k)) && ib.insights.pages.length === 2);
  t('Firmencheck: Ansatzpunkte + Profil', ib.insights.angles[0].title === 'Online-Termine' && ib.insights.profile === 'Werkstatt in Linz.');
  n = 5; global.fetch = async () => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content: answer('kein satz') } }], usage: {} }) });
  const ib2 = await AI3.analyze(null, st, { company: 'X', website: 'https://x.at' });
  t('Firmencheck: Fragment zweimal → Einstieg leer, Infos bleiben', ib2.text === '' && ib2.insights.people.length === 1);
  // {Einstieg}
  const body = '{Anrede},\n\n{Einstieg}\n\nWir bauen Websites.';
  t('Einstieg leer → Zeile entfällt', C.render(body, { first: '', company: 'X' }, {}) === 'Sehr geehrte Damen und Herren,\n\nWir bauen Websites.');
  t('Einstieg gefüllt', C.render(body, { first: 'Karl', last: 'Huber', icebreaker: 'Ihr Fokus auf Oldtimer fällt auf.' }, {}).includes('Guten Tag Karl Huber,\n\nIhr Fokus auf Oldtimer fällt auf.\n\nWir'));
  t('Einstieg gefüllt → nächster Absatz groß', C.render('{Anrede},\n\n{Einstieg}\n\nin Werkstätten ist viel los.', { icebreaker: 'Ihr Fokus auf Oldtimer fällt auf.' }, {}).includes('auf.\n\nIn Werkstätten'));
  t('Einstieg leer → nächster Absatz bleibt', C.render('{Anrede},\n\n{Einstieg}\n\nin Werkstätten ist viel los.', {}, {}) === 'Sehr geehrte Damen und Herren,\n\nin Werkstätten ist viel los.');
  // Signatur
  const dirty = '<div onclick="x()">Isah <b>Sinani</b><script>alert(1)</script><a href="javascript:alert(1)">x</a><img src="https://example.com/l.png" onerror="y()"></div>';
  const clean = C.cleanSig(dirty);
  t('Signatur bereinigt (kein Script/Handler/javascript:)', !/script|onclick|onerror|javascript:/i.test(clean) && /<b>Sinani<\/b>/.test(clean) && /img src="https:\/\/example.com\/l.png"/.test(clean));
  const m1 = C.compose({ name: 'Isah Sinani', email: 'kontakt@astravagand.com' }, st, 'Hallo\nWelt');
  t('Ohne Signatur nur Text', !m1.html && m1.text.endsWith('--\nAstravagand\nAbmelden: antworten'));
  const m2 = C.compose({ name: 'Isah Sinani', email: 'kontakt@astravagand.com' }, { ...st, signature: { html: '<b>{Name}</b><br>{E-Mail}' } }, 'Hallo <Welt>\nhttps://astravagand.com');
  t('Mit Signatur: HTML + Text', m2.html.includes('<b>Isah Sinani</b><br>kontakt@astravagand.com') && m2.html.includes('Hallo &lt;Welt&gt;<br><a href="https://astravagand.com">') && m2.text.includes('Isah Sinani\nkontakt@astravagand.com'));
  const m3 = C.compose({ name: 'F', email: 'f@a.com', signature: '<i>Eigene</i>' }, { ...st, signature: { html: '<b>Allgemein</b>' } }, 'x', { footer: false });
  t('Konto-Signatur hat Vorrang, Antwort ohne Fußzeile', m3.html.includes('<i>Eigene</i>') && !m3.html.includes('Allgemein') && !m3.text.includes('Abmelden'));
  console.log(`ai: ${ok} ok, ${bad} fehlgeschlagen`); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
