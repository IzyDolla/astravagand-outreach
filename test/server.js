// Lokaler Testserver: echte API-Logik + Fake-Datenbank + statische Dateien
process.env.SUPABASE_URL = 'https://fake.supabase.local'; process.env.SUPABASE_ANON_KEY = 'anon';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a'.repeat(64); process.env.CRON_SECRET = 'cron-test'; process.env.SETUP_TOKEN = 'SETUP-123';
process.env.ALLOW_PRIVATE_SMTP = '1'; process.env.SUPABASE_SERVICE_KEY = 'x';
const http = require('http'), fs = require('fs'), path = require('path');
const C = require('../lib/core'); const { createFake } = require('./fake-supabase');
const fake = createFake(); C.setClient(fake);
const handler = require('../api/index');
const PUB = path.join(__dirname, '..', 'public');
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname.startsWith('/api/')) { req.url = '/api/index?__p=' + encodeURIComponent(u.pathname.slice(5)) + (u.search ? '&' + u.search.slice(1) : ''); return handler(req, res); }
  if (u.pathname === '/__login') { let b=''; req.on('data',c=>b+=c); req.on('end',()=>{ const {email,password}=JSON.parse(b); const usr=[...fake.users.values()].find(x=>x.email===email&&x.password===password); res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(usr?{ok:true,token:require('./fake-supabase').fakeToken(usr.id),user:{id:usr.id,email:usr.email,user_metadata:usr.user_metadata}}:{ok:false})); }); return; }
  if (u.pathname === '/__db') { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify(fake.db)); }
  let f = u.pathname === '/' ? '/index.html' : u.pathname;
  if (f === '/vendor/supabase.js' && process.env.FAKE_AUTH) f = '/../test/fake-auth-client.js';
  const fp = path.join(PUB, f);
  if (!fs.existsSync(fp)) { res.statusCode = 404; return res.end('nf'); }
  res.setHeader('Content-Type', fp.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8'); fs.createReadStream(fp).pipe(res);
});
server.listen(Number(process.env.PORT || 3300), () => console.log('test server up'));
module.exports = { fake, server, C };
