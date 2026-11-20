// Zeitfenster-Logik: normal, über Mitternacht, rund um die Uhr
const { inWindow, schedText } = require('../lib/core');
let ok = 0, bad = 0; const t = (n, c) => { if (c) ok++; else { bad++; console.log('FAIL', n); } };
const tz = 'Europe/Vienna', at = s => new Date(s).getTime();   // Zeiten in UTC; Wien = UTC+1 im November
const wd = [1, 1, 1, 1, 1, 0, 0];
// Fr 20.11.2026
t('Büro 10:00 offen', inWindow({ days: wd, from: '08:00', to: '16:30' }, tz, at('2026-11-20T09:00:00Z')));
t('Büro 16:30 zu', !inWindow({ days: wd, from: '08:00', to: '16:30' }, tz, at('2026-11-20T15:30:00Z')));
t('Büro Samstag zu', !inWindow({ days: wd, from: '08:00', to: '16:30' }, tz, at('2026-11-21T09:00:00Z')));
t('24h Fr 03:00 offen', inWindow({ days: wd, allDay: true, from: '08:00', to: '16:30' }, tz, at('2026-11-20T02:00:00Z')));
t('24h Sa zu', !inWindow({ days: wd, allDay: true }, tz, at('2026-11-21T12:00:00Z')));
t('24h täglich So offen', inWindow({ days: [1, 1, 1, 1, 1, 1, 1], allDay: true }, tz, at('2026-11-22T23:30:00Z')));
t('from==to = 24h', inWindow({ days: wd, from: '00:00', to: '00:00' }, tz, at('2026-11-20T22:30:00Z')));
const night = { days: wd, from: '22:00', to: '06:00' };
t('Nacht Fr 23:00 offen', inWindow(night, tz, at('2026-11-20T22:00:00Z')));
t('Nacht Sa 02:00 offen (gehört zu Fr)', inWindow(night, tz, at('2026-11-21T01:00:00Z')));
t('Nacht Mo 02:00 zu (So nicht gewählt)', !inWindow(night, tz, at('2026-11-23T01:00:00Z')));
t('Nacht Fr 12:00 zu', !inWindow(night, tz, at('2026-11-20T11:00:00Z')));
t('Text Büro', schedText({ days: wd, from: '08:00', to: '16:30' }) === 'Mo–Fr, 08:00–16:30 Uhr');
t('Text 24h', schedText({ days: [1, 1, 1, 1, 1, 1, 1], allDay: true }) === 'täglich, rund um die Uhr');
console.log(`schedule: ${ok} ok, ${bad} fehlgeschlagen`); process.exit(bad ? 1 : 0);
