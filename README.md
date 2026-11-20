# Astravagand Outreach

E-Mail-Kaltakquise mit Follow-ups, Warm-up, mehreren Konten, Antworterkennung und Anrufliste.

**Architektur**
- `public/` – Oberfläche (statisch, von Vercel ausgeliefert)
- `api/index.js` + `lib/` – Server-Logik als Vercel Function
- Supabase – Datenbank (Postgres, RLS: kein direkter Zugriff von außen), Login (Supabase Auth inkl. 2FA)
- Supabase `pg_cron` ruft jede Minute `/api/cron` auf → Versand + Postfach-Abruf

**Umgebungsvariablen (Vercel)**

| Name | Inhalt |
| --- | --- |
| `SUPABASE_URL` | Projekt-URL |
| `SUPABASE_ANON_KEY` | öffentlicher Schlüssel (für den Login im Browser) |
| `SUPABASE_SERVICE_KEY` | geheimer Schlüssel (nur Server) |
| `ENCRYPTION_KEY` | 64 Hex-Zeichen, verschlüsselt die App-Passwörter |
| `CRON_SECRET` | schützt `/api/cron` |
| `SETUP_TOKEN` | Code für die Ersteinrichtung |

**Tests lokal:** `npm i --no-save smtp-server && node test/e2e.js`
