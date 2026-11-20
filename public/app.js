
/* ================= Icons ================= */
const I={
 home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 send:'<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.7.8 2.8 2.6 3 5.2"/>',
 inbox:'<path d="M3 13h5l2 3h4l2-3h5"/><path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 file:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
 radar:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/><path d="M11 8v6M8 11h6"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
 moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
 bell:'<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="M18 6 6 18M6 6l12 12"/>', check:'<path d="m5 12 5 5L20 7"/>',
 alert:'<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>', bolt:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
 pause:'<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>', play:'<path d="M6 4l14 8-14 8z"/>',
 back:'<path d="M15 18l-6-6 6-6"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
 sparkle:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
 reply:'<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v6"/>',
 flame:'<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6.5-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4.3 3 7 7 7z"/>',
 shield:'<path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
 rotate:'<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>',
 book:'<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20v3H6.5"/>',
 eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
 phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
 edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
 key:'<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3M15 8l2 2"/>',
 refresh:'<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>'
};
const ic=(n,s)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${s||1.8}" stroke-linecap="round" stroke-linejoin="round">${I[n]||''}</svg>`;
const ics=(n,px=15,s)=>ic(n,s).replace('<svg',`<svg style="width:${px}px;height:${px}px;flex:none"`);
const logo=(s=30)=>`<svg width="${s}" height="${s}" viewBox="0 0 40 40"><defs><linearGradient id="lg${s}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c4dff"/><stop offset=".55" stop-color="#c084fc"/><stop offset="1" stop-color="#fdba8c"/></linearGradient></defs><rect width="40" height="40" rx="10" fill="#0b0b10"/><path d="M20 5c1.3 7.3 4.7 10.7 15 15-10.3 4.3-13.7 7.7-15 15-1.3-7.3-4.7-10.7-15-15 10.3-4.3 13.7-7.7 15-15z" fill="url(#lg${s})"/><path d="M20 12c.6 3.6 2.3 5.3 8 8-5.7 2.7-7.4 4.4-8 8-.6-3.6-2.3-5.3-8-8 5.7-2.7 7.4-4.4 8-8z" fill="#fff" opacity=".35"/></svg>`;

/* ================= Helpers ================= */
const store={get(k,d){try{const v=localStorage.getItem('ao_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('ao_'+k,JSON.stringify(v))}catch(e){}}};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=(n,d=1)=>Number(n||0).toFixed(d).replace('.',',');
const fmt=n=>Number(n||0).toLocaleString('de-AT');
const dt=s=>{if(!s)return'';const d=new Date(s);return d.toLocaleDateString('de-AT',{day:'2-digit',month:'2-digit'})+' · '+d.toLocaleTimeString('de-AT',{hour:'2-digit',minute:'2-digit'})};
const dday=s=>s?new Date(s).toLocaleDateString('de-AT',{weekday:'short',day:'2-digit',month:'2-digit'}):'';
const when=s=>{if(!s)return'';const d=new Date(s),n=new Date();if(d.toDateString()===n.toDateString())return d.toLocaleTimeString('de-AT',{hour:'2-digit',minute:'2-digit'});const y=new Date(n-864e5);if(d.toDateString()===y.toDateString())return'Gestern';return d.toLocaleDateString('de-AT',{day:'2-digit',month:'2-digit'})};
const hue=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))%360;return h};
const av=(name,size=42)=>`<div class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size/3)}px;background:linear-gradient(135deg,hsl(${hue(name)} 70% 55%),hsl(${(hue(name)+40)%360} 75% 65%))">${esc(String(name||'?').split(/[\s@.]+/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase())}</div>`;
const fullName=l=>[l.first,l.last].filter(Boolean).join(' ');
function toast(msg,kind='good'){const t=document.createElement('div');t.className='toast';t.innerHTML=`<span class="dot ${kind}"></span><span>${msg}</span>`;$('#toasts').appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s'},3200);setTimeout(()=>t.remove(),3600)}
const warmLimit=d=>d<=7?Math.round(5+d*0.7):d<=14?Math.round(10+(d-7)*1.4):d<=21?Math.round(20+(d-14)*1.4):40;
const SPAM=['kostenlos','gratis','garantiert','100%','100 %','jetzt kaufen','gewinn','dringend','!!!','risikofrei','billig','sofort zugreifen'];
const VARS=['Vorname','Nachname','Firma','Stadt','Branche','Absender'];
const debounce=(fn,ms)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}};
const spinner='<span class="spin" style="border-color:var(--border2);border-top-color:var(--violet2)"></span>';

/* ================= API ================= */
let OFFLINE=false;
let SBC=null;
async function token(){if(!SBC)return null;try{const {data}=await SBC.auth.getSession();return data&&data.session?data.session.access_token:null}catch(e){return null}}
async function api(method,path,body){
 try{const h={'X-AO':'1'};if(body)h['Content-Type']='application/json';const t=await token();if(t)h.Authorization='Bearer '+t;
  const r=await fetch(path,{method,headers:h,body:body?JSON.stringify(body):undefined,credentials:'omit'});const j=await r.json().catch(()=>({ok:false,error:'Unerwartete Antwort vom Server ('+r.status+')'}));if(OFFLINE){OFFLINE=false;renderTop()}
  if(r.status===401&&j.auth&&!AUTH_OPEN){C=null;showAuth(j.mfa?'totp':'login',j.mfa?'':'Bitte melde dich an.')}return j}
 catch(e){OFFLINE=true;renderTop();return{ok:false,error:'Keine Verbindung zum Server.'}}
}
const get=p=>api('GET',p),post=(p,b)=>api('POST',p,b||{}),patch=(p,b)=>api('PATCH',p,b||{}),del=p=>api('DELETE',p);

/* ================= State ================= */
let C=null;
const S={view:'overview',camp:null,campTab:'sequence',step:0,edit:null,editId:null,prevLeads:[],prevIdx:0,inboxCat:'all',inboxSel:null,inbox:[],leadList:'all',leadQ:'',leadStatus:'all',leads:null,leadsTotal:0,settingsTab:'workspace',campRows:null};
async function load(){const j=await get('/api/state');if(j&&j.ok){C=j;return true}return false}
const accById=id=>C.accounts.find(a=>a.id===id);
const camp=()=>C.campaigns.find(c=>c.id===S.camp);
const okAccounts=()=>C.accounts.filter(a=>a.status==='ok');
const SAMPLE={first:'Martin',last:'Huber',company:'Musterfirma GmbH',city:'Linz',industry:'Reinigung',email:'m.huber@musterfirma.at'};

/* ================= Sidebar & Top ================= */
const NAV=[['overview','home','Übersicht'],['campaigns','send','Kampagnen'],['leads','users','Leads'],['inbox','inbox','Posteingang'],['accounts','mail','E-Mail-Konten'],['templates','file','Vorlagen'],['finder','radar','Lead-Finder'],['settings','gear','Einstellungen']];
function renderSide(){
 if(!C)return;
 const bad=C.accounts.some(a=>a.status!=='ok');
 $('#side').innerHTML=`<div class="brand">${logo(32)}<div><b>Astravagand</b><small>Outreach</small></div></div>
 <div class="ws" data-act="wsMenu"><div class="av">${esc((C.workspace.name||'A')[0].toUpperCase())}</div><div><strong>${esc(C.workspace.name)}</strong><span>${C.workspaces.length>1?C.workspaces.length+' Workspaces':'Workspace'}</span></div><span class="faint">⌄</span></div>
 <div class="nav-label">Menü</div>
 ${NAV.map(([v,i,l])=>`<button class="nav ${S.view===v?'active':''}" data-act="go" data-view="${v}" data-tour="nav-${v}">${ic(i)}${l}${v==='inbox'&&C.inboxUnread?`<span class="count">${C.inboxUnread}</span>`:''}${v==='finder'?'<span class="soon">V2</span>':''}${v==='accounts'&&bad?'<span class="dot bad" style="margin-left:auto"></span>':''}</button>`).join('')}
 <div class="side-foot"><div class="helpcard" data-tour="help"><strong>Neu hier?</strong><p>Die Tour zeigt dir in 2 Minuten alles Wichtige.</p><button class="btn sm" data-act="tour">${ic('play')}Tour starten</button></div>
 <button class="nav" data-act="lesson">${ic('flame')}Warum Warm-up?</button><button class="nav" data-act="help">${ic('book')}Hilfe-Center</button></div>`;
}
function renderTop(){
 if(OFFLINE){$('#modePill').innerHTML='<span class="dot bad"></span>Keine Verbindung';$('#modePill').title='Internetverbindung prüfen';return}
 if(!C)return;
 const active=C.campaigns.filter(c=>c.status==='active').length;
 $('#modePill').innerHTML=active?`<span class="dot good"></span>${active} Kampagne${active>1?'n':''} aktiv`:'<span class="dot"></span>Kein Versand aktiv';
 $('#modePill').title='Läuft in der Cloud – auch wenn dein Computer aus ist';
 $('#capPill').innerHTML=`${ics('send',13,2)}<span>${C.kpi.sentToday} / ${C.kpi.capacity} heute</span>`;
}

/* ================= Overview ================= */
const V={};
V.overview=()=>{
 const h=new Date().getHours(),greet=h<11?'Guten Morgen':h<18?'Hallo':'Guten Abend';
 const k=C.kpi,ck=C.checklist,done=ck.filter(Boolean).length,nextIdx=ck.findIndex(x=>!x);
 const items=[['Ziel festlegen','Kapazitäts-Rechner','lesson'],['Konten verbinden',C.accounts.length?C.accounts.length+' verknüpft':'App-Passwort','accounts'],['Domain prüfen','SPF, DKIM, DMARC','accounts'],['Warm-up verstehen','Kurze Lektion','lesson'],['Leads importieren','CSV-Datei','leads'],['Sequenz erstellen','Mail + Follow-ups','camp'],['Testmail senden','An dich selbst','testmail'],['Kampagne starten','Mit Sicherheitscheck','start']];
 const active=C.campaigns.filter(c=>c.status==='active');
 const alerts=[];
 C.accounts.forEach(a=>{if(a.status==='error')alerts.push(['bad','alert',`${a.email} ist getrennt`,a.error||'Verbindung prüfen','Beheben','accounts']);else if(a.status==='paused')alerts.push(['warn','pause',`${a.email} ist pausiert`,a.error||'Manuell pausiert','Ansehen','accounts']);
  if(a.imapError&&a.status==='ok')alerts.push(['warn','inbox',`Antworten bei ${a.email} werden nicht erkannt`,'IMAP: '+a.imapError,'Ansehen','accounts']);
  if(a.dns&&!(a.dns.spf&&a.dns.dkim&&a.dns.dmarc))alerts.push(['warn','shield',`${['spf','dkim','dmarc'].filter(x=>!a.dns[x]).map(x=>x.toUpperCase()).join(', ')} fehlt bei ${a.email.split('@')[1]}`,'Ohne diese Einträge landen mehr Mails im Spam','Anleitung','accounts'])});
 C.campaigns.filter(c=>c.status==='paused').forEach(c=>alerts.push(['warn','pause',`„${c.name}“ ist pausiert`,'Es wird nichts verschickt','Öffnen','camp:'+c.id]));
 const uniq=[...new Map(alerts.map(a=>[a[2],a])).values()];
 return `<div class="wrap"><div class="page-head"><div><h1>${greet}${C.accounts[0]?.name?', '+esc(C.accounts[0].name.split(' ')[0]):''}</h1><p>${new Date().toLocaleDateString('de-AT',{weekday:'long',day:'numeric',month:'long'})} · ${active.length} Kampagne${active.length===1?'':'n'} aktiv · ${okAccounts().length} Konten bereit</p></div>
 <div class="row gap"><button class="btn ghost" data-act="lesson">${ic('flame')}Warum so wenige Mails?</button><button class="btn primary" data-act="newCampaign">${ic('plus',2.2)}Neue Kampagne</button></div></div>
 ${done<8?`<div class="card onb" data-tour="checklist"><div class="onb-top"><div><h3>Einrichtung abschließen</h3><p class="muted" style="font-size:13px">Noch ${8-done} Schritte bis zur ersten Kampagne. Jeder Schritt bringt dich direkt an die richtige Stelle.</p></div><div class="row gap"><span style="font-weight:700">${done} von 8</span><div class="onb-bar"><i style="width:${done/8*100}%"></i></div></div></div>
 <div class="steps">${items.map((it,i)=>`<div class="step ${ck[i]?'done':i===nextIdx?'next':''}" data-act="onbStep" data-to="${it[2]}"><div class="ck">${ck[i]?ics('check',12,3):i+1}</div><div><strong>${it[0]}</strong><span>${it[1]}</span></div></div>`).join('')}</div></div>`:''}
 <div class="grid g4 mt" data-tour="kpis">
  ${kpi('Gesendet heute',`${k.sentToday}<small> / ${k.capacity}</small>`,k.capacity?`${Math.round(k.sentToday/k.capacity*100)} % der Tageskapazität`:'Noch kein Konto bereit','',C.chart.map(d=>d.sent),true)}
  ${kpi('Antwortrate (7 Tage)',`${num(k.replyRate7)}<small> %</small>`,`${k.replies7} Antworten auf Erstmails`,'',C.chart.map(d=>d.rep))}
  ${kpi('Positive Antworten',`${k.positive7}`,k.positive7>=k.positivePrev?`▲ ${k.positive7-k.positivePrev} ggü. Vorwoche`:`▼ ${k.positivePrev-k.positive7} ggü. Vorwoche`,k.positive7>=k.positivePrev?'up':'down',C.chart.map(d=>d.rep))}
  ${kpi('Bounce-Rate',`${num(k.bounceRate)}<small> %</small>`,k.bounceRate>3?'Zu hoch – Liste prüfen':'Gut – Grenze liegt bei 3 %',k.bounceRate>3?'down':'up',C.chart.map(d=>d.sent))}
 </div>
 <div class="grid g-main mt">
  <div class="card"><div class="card-h"><h3>Versand & Antworten · letzte 30 Tage</h3><div class="chart-legend"><span><i style="background:var(--violet)"></i>Gesendet</span><span><i style="background:var(--peach)"></i>Antworten</span></div></div><div class="card-b">${k.totalSent?chart(C.chart):`<div class="empty" style="padding:60px 20px">${ics('send',28)}<p style="margin-top:10px">Noch nichts verschickt. Sobald deine erste Kampagne läuft, siehst du hier den Verlauf.</p></div>`}</div></div>
  <div class="card" data-tour="capacity"><div class="card-h"><h3>Kapazität heute</h3><button class="btn sm ghost" data-act="go" data-view="accounts">Konten</button></div><div class="card-b">
  ${C.accounts.length?`<div class="row" style="justify-content:space-between;align-items:baseline"><span style="font-size:28px;font-weight:700;letter-spacing:-.02em">${k.sentToday}<span class="muted" style="font-size:15px"> / ${k.capacity}</span></span><span class="badge b-violet">${Math.max(0,k.capacity-k.sentToday)} übrig</span></div>
   <div class="prog" style="height:8px;margin:10px 0 18px"><i style="width:${k.capacity?Math.min(100,k.sentToday/k.capacity*100):0}%"></i></div>
   ${C.accounts.map(a=>`<div style="margin-bottom:12px"><div class="row" style="justify-content:space-between;font-size:12.5px;margin-bottom:5px;gap:8px"><span class="row gap-s" style="min-width:0"><span class="dot ${a.status!=='ok'?'bad':a.warmup&&a.day<28?'warn':'good'}"></span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(a.email)}</span></span><span class="muted" style="flex:none">${a.status!=='ok'?(a.status==='paused'?'Pausiert':'Fehler'):a.sentToday+' / '+a.limit}</span></div><div class="prog ${a.status!=='ok'?'bad':''}"><i style="width:${a.limit?Math.min(100,a.sentToday/a.limit*100):100}%"></i></div></div>`).join('')}
   ${C.accounts.some(a=>a.warmup&&a.day<28)?`<div class="callout" style="margin-top:14px">${ic('info')}<div>${C.accounts.filter(a=>a.warmup&&a.day<28).length} Konto/Konten noch im Warm-up. Danach schaffst du ca. <b>${okAccounts().reduce((s,a)=>s+a.maxPerDay,0)} Mails</b> pro Tag.</div></div>`:''}`
  :`<div class="empty">${ics('mail',26)}<p style="margin:10px 0 14px">Noch kein E-Mail-Konto verbunden.</p><button class="btn primary sm" data-act="connect">${ic('plus',2)}Konto verbinden</button></div>`}
  </div></div></div>
 <div class="grid g2 mt">
  <div class="card"><div class="card-h"><h3>Braucht deine Aufmerksamkeit</h3>${uniq.length?`<span class="badge b-warn">${uniq.length}</span>`:''}</div><div class="card-b">${uniq.length?uniq.slice(0,6).map(a=>alertRow(...a)).join(''):`<div class="alert"><div class="ic" style="background:rgba(52,211,153,.12);color:var(--good)">${ic('check')}</div><div><strong>Alles läuft rund</strong><span>Keine Fehler bei Konten oder Kampagnen.</span></div></div>`}</div></div>
  <div class="card"><div class="card-h"><h3>Aktive Kampagnen</h3><button class="btn sm ghost" data-act="go" data-view="campaigns">Alle</button></div><div class="card-b" style="padding-top:8px">
  ${active.length?active.map(c=>{const s=c.stats;return `<div class="alert" style="cursor:pointer" data-act="openCamp" data-id="${c.id}"><div class="ic" style="background:var(--vsoft);color:var(--violet2)">${ic('send')}</div><div style="flex:1;min-width:0"><strong>${esc(c.name)}</strong><span>${s.contacted} von ${s.total} kontaktiert · ${s.replies} Antworten · ${s.positive} positiv</span><div class="prog" style="margin-top:8px"><i style="width:${s.total?s.contacted/s.total*100:0}%"></i></div></div><span class="badge b-good" style="margin-left:12px">${num(s.contacted?s.replies/s.contacted*100:0)} %</span></div>`}).join(''):`<div class="empty" style="padding:24px">Keine aktive Kampagne.<div style="margin-top:12px"><button class="btn sm" data-act="newCampaign">${ic('plus',2)}Kampagne erstellen</button></div></div>`}
  </div></div></div></div>`;
};
function kpi(l,v,d,cls,series,hero){const show=series.filter(x=>x>0).length>=3;series=series.length?series:[0,0];const max=Math.max(...series,1),min=Math.min(...series);const pts=series.map((y,i)=>`${(i/(series.length-1)*80).toFixed(1)},${(28-(y-min)/((max-min)||1)*24).toFixed(1)}`).join(' ');
 return `<div class="card kpi ${hero?'hero':''}"><div class="lbl">${l}</div><div class="val">${v}</div><div class="delta ${cls}">${d}</div>${show?'':'<!--'}<svg class="spark" viewBox="0 0 80 30"><polyline points="${pts}" fill="none" stroke="${hero?'var(--peach)':'var(--violet2)'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/></svg>${show?'':'-->'}</div>`}
function alertRow(k,i,t,s,b,v){const col=k==='bad'?'var(--bad)':'var(--warn)';const act=v.startsWith('camp:')?`data-act="openCamp" data-id="${v.slice(5)}"`:`data-act="go" data-view="${v}"`;return `<div class="alert"><div class="ic" style="background:${k==='bad'?'rgba(248,113,113,.12)':'rgba(251,191,36,.12)'};color:${col}">${ic(i)}</div><div style="min-width:0"><strong>${esc(t)}</strong><span>${esc(s)}</span></div><button class="btn sm" ${act}>${b}</button></div>`}
function chart(days){const W=700,H=220,pad=28;const max=Math.max(10,...days.map(d=>d.sent));const nice=Math.ceil(max/10)*10;const repMax=Math.max(4,...days.map(d=>d.rep));const bw=(W-pad)/days.length;
 const y=v=>H-20-v/nice*(H-34),yr=v=>H-20-v/repMax*(H-60);
 const bars=days.map((d,i)=>`<rect x="${pad+i*bw+3}" y="${y(d.sent)}" width="${bw-6}" height="${Math.max(0,H-20-y(d.sent))}" rx="3" fill="url(#bgc)"><title>${d.k}: ${d.sent} gesendet, ${d.rep} Antworten</title></rect>`).join('');
 const line=days.map((d,i)=>`${pad+i*bw+bw/2},${yr(d.rep)}`).join(' ');
 const grid=[0,nice/2,nice].map(v=>`<line x1="${pad}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="var(--border)"/><text x="0" y="${y(v)+4}" font-size="10" fill="var(--faint)">${v}</text>`).join('');
 const labels=[0,7,14,21,29].map(i=>`<text x="${pad+i*bw+bw/2}" y="${H-4}" font-size="10" fill="var(--faint)" text-anchor="middle">${i===29?'Heute':days[i].k.slice(8)+'.'+days[i].k.slice(5,7)+'.'}</text>`).join('');
 return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block"><defs><linearGradient id="bgc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#7c4dff" stop-opacity=".55"/></linearGradient></defs>${grid}${bars}<polyline points="${line}" fill="none" stroke="var(--peach)" stroke-width="2.2" stroke-linejoin="round"/>${labels}</svg>`}

/* ================= Campaigns ================= */
const STATUS={active:['Aktiv','b-good','good'],paused:['Pausiert','b-warn','warn'],draft:['Entwurf','b-mute',''],done:['Beendet','b-info','']};
V.campaigns=()=>{
 if(S.camp&&camp())return campDetail();
 S.camp=null;const cs=C.campaigns;
 return `<div class="wrap"><div class="page-head"><div><h1>Kampagnen</h1><p>Mail-Serien mit automatischen Follow-ups.</p></div><button class="btn primary" data-act="newCampaign">${ic('plus',2.2)}Neue Kampagne</button></div>
 ${cs.length?`<div class="grid g4" style="margin-bottom:16px">${miniStat('Aktiv',cs.filter(c=>c.status==='active').length,'good')}${miniStat('Leads in Kampagnen',fmt(cs.reduce((s,c)=>s+c.stats.total,0)))}${miniStat('Antworten gesamt',cs.reduce((s,c)=>s+c.stats.replies,0))}${miniStat('Positive Antworten',cs.reduce((s,c)=>s+c.stats.positive,0),'good')}</div>
 <div class="card"><table class="table"><thead><tr><th>Kampagne</th><th>Status</th><th>Fortschritt</th><th>Antwortrate</th><th>Positiv</th><th>Konten</th><th></th></tr></thead><tbody>
 ${cs.map(c=>{const s=c.stats;return `<tr class="click" data-act="openCamp" data-id="${c.id}"><td><div class="cell-main">${esc(c.name)}</div><div class="cell-sub">Erstellt am ${new Date(c.createdAt).toLocaleDateString('de-AT')} · ${c.steps.length} Schritte</div></td><td><span class="badge ${STATUS[c.status][1]}"><span class="dot ${STATUS[c.status][2]}"></span>${STATUS[c.status][0]}</span></td>
 <td style="min-width:170px"><div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:5px"><span>${s.contacted} / ${s.total||'–'}</span><span class="muted">${s.total?Math.round(s.contacted/s.total*100):0} %</span></div><div class="prog"><i style="width:${s.total?s.contacted/s.total*100:0}%"></i></div></td>
 <td><b>${num(s.contacted?s.replies/s.contacted*100:0)} %</b><div class="cell-sub">${s.replies} Antworten</div></td><td><span class="badge b-good">${s.positive}</span></td><td>${c.accounts.length?`<div class="row">${c.accounts.map(id=>accById(id)).filter(Boolean).slice(0,5).map(a=>`<span title="${esc(a.email)}" style="margin-right:-6px">${av(a.email,24)}</span>`).join('')}</div>`:'<span class="faint">—</span>'}</td><td class="faint">›</td></tr>`}).join('')}
 </tbody></table></div>`:`<div class="card empty" style="padding:60px 20px">${ics('send',30)}<h3 style="margin:12px 0 6px;color:var(--text)">Noch keine Kampagne</h3><p>Erstelle eine Kampagne, wähle eine Lead-Liste und schreib Mail 1 plus Follow-ups.</p><button class="btn primary mt" data-act="newCampaign">${ic('plus',2.2)}Erste Kampagne erstellen</button></div>`}</div>`;
};
function miniStat(l,v,k){return `<div class="card" style="padding:14px 18px"><div class="muted" style="font-size:12.5px">${l}</div><div style="font-size:22px;font-weight:700;margin-top:2px;${k==='good'?'color:var(--good)':''}">${v}</div></div>`}
function campDetail(){
 const c=camp();
 if(S.editId!==c.id){S.editId=c.id;S.edit=JSON.parse(JSON.stringify(c.steps));S.step=0;S.prevLeads=[];S.campRows=null;loadPrevLeads(c)}
 const tabs=[['sequence','Sequenz'],['leads','Leads'],['schedule','Zeitplan'],['senders','Absender'],['settings','Einstellungen'],['stats','Statistik']];
 const body={sequence:seqEditor,leads:campLeads,schedule:campSchedule,senders:campSenders,settings:campSettings,stats:campStats}[S.campTab](c);
 const s=c.stats;
 return `<div class="wrap"><button class="btn sm ghost" data-act="backCamps" style="margin-bottom:14px">${ic('back')}Alle Kampagnen</button>
 <div class="page-head"><div><div class="row gap"><h1>${esc(c.name)}</h1><span class="badge ${STATUS[c.status][1]}">${STATUS[c.status][0]}</span></div><p>${s.contacted} von ${s.total||C.lists.filter(l=>c.lists.includes(l.id)).reduce((a,l)=>a+l.count,0)} Leads kontaktiert · ${s.replies} Antworten · ${c.accounts.length} Absender-Konten · heute ${s.sentToday} neue</p></div>
 <div class="row gap"><span class="muted" id="saveState" style="font-size:12.5px"></span><button class="btn" data-act="testmail">${ic('send')}Testmail an mich</button>${c.status==='active'?`<button class="btn" data-act="pauseCamp">${ic('pause')}Pausieren</button>`:c.status==='done'?'':`<button class="btn primary" data-act="startCheck">${ic('play')}${c.status==='paused'?'Fortsetzen':'Kampagne starten'}</button>`}</div></div>
 <div class="tabs">${tabs.map(([k,l])=>`<button class="tab ${S.campTab===k?'active':''}" data-act="campTab" data-k="${k}">${l}</button>`).join('')}</div>${body}</div>`;
}
async function loadPrevLeads(c){const j=await get(`/api/campaigns/${c.id}/leads`);if(j.ok){S.prevLeads=j.rows.map(r=>r.lead).slice(0,50);S.campRows=j;if(S.view==='campaigns'&&S.camp===c.id){if(S.campTab==='leads')render();else refreshPreview(true)}}}
const curLead=()=>S.prevLeads[S.prevIdx]||SAMPLE;
const sender=()=>{const c=camp();const a=c&&accById(c.accounts[0]);return a||{name:C.accounts[0]?.name||'Dein Name',email:C.accounts[0]?.email||'du@firma.com'}};
function renderVars(t,lead,html=true){const map={Vorname:lead.first,Nachname:lead.last,Firma:lead.company,Stadt:lead.city,Branche:lead.industry,Absender:sender().name};
 let s=String(t||'');
 if(!html)return s.replace(/ \{(\w+)\}(?=[,.!?:;]|\s|$)/g,(m,k)=>map[k]?' '+map[k]:'').replace(/\{(\w+)\}/g,(m,k)=>map[k]||'');
 return esc(s).replace(/\{(\w+)\}/g,(m,k)=>map[k]?`<mark>${esc(map[k])}</mark>`:`<mark class="miss">{${k} leer}</mark>`)}
function seqEditor(c){
 const steps=S.edit;if(S.step>=steps.length)S.step=steps.length-1;const st=steps[S.step];
 const subj=st.thread&&S.step>0?'Re: '+steps[0].subject:st.subject;
 const locked=c.status==='active';
 return `${locked?`<div class="banner" style="border-color:rgba(251,191,36,.3)">${ic('info')}<div><b>Kampagne läuft.</b> <span class="muted">Änderungen gelten ab der nächsten Mail. Bereits gesendete Mails bleiben wie sie sind.</span></div></div>`:''}
 <div class="seq"><div class="tl" data-tour="timeline">
  ${steps.map((s,i)=>`${i>0?`<div class="tl-wait"><span>${ic('clock')}${s.wait} Werktage warten</span></div>`:''}
  <div class="tl-step ${i===S.step?'sel':''}" data-act="selStep" data-i="${i}"><div class="n"><span class="num">${i+1}</span>${i===0?'Mail 1':'Follow-up '+i}${i>0?`<span class="badge b-mute" style="margin-left:auto">Tag ${steps.slice(1,i+1).reduce((a,b)=>a+Number(b.wait),0)}</span>`:'<span class="badge b-violet" style="margin-left:auto">Start</span>'}</div><div class="sub">${esc(s.thread&&i>0?'Re: '+steps[0].subject:s.subject)||'<span class="faint">Kein Betreff</span>'}</div><div class="meta">${i>0?(s.thread?'<span class="badge b-mute">Im selben Verlauf</span>':'<span class="badge b-mute">Neue Mail</span>'):''}<span class="badge b-mute">${s.body.trim()?s.body.trim().split(/\s+/).length:0} Wörter</span>${c.stats.steps[i]?`<span class="badge b-mute">${c.stats.steps[i].sent} gesendet</span>`:''}</div></div>`).join('')}
  ${steps.length<6?`<button class="tl-add" data-act="addStep">${ic('plus',2)} Follow-up hinzufügen</button>`:''}
  <div class="tl-end">${ic('shield')}Antwort, Bounce oder Abmeldung stoppt die Sequenz sofort.</div></div>
 <div class="card" style="padding:20px">
  <div class="editor-tools"><div class="row gap"><h3 style="font-size:16px">${S.step===0?'Mail 1':'Follow-up '+S.step}</h3>${S.step>0?`<span class="muted" style="font-size:12.5px">${st.wait} Werktage nach Schritt ${S.step}, nur ohne Antwort</span>`:''}</div>
  <div class="row gap-s"><button class="btn sm" data-act="loadTpl">${ic('file')}Aus Vorlage laden</button><button class="btn sm" data-act="saveTpl">${ic('copy')}Als Vorlage speichern</button>${S.step>0?`<button class="btn sm ghost danger" data-act="delStep" title="Schritt löschen">${ic('trash')}</button>`:''}</div></div>
  ${S.step>0?`<div class="row gap" style="margin-bottom:14px;flex-wrap:wrap"><div class="toggle ${st.thread?'on':''}" data-act="toggleThread"><span class="sw"></span>Im selben Verlauf antworten (Re: …)</div><div class="row gap-s" style="margin-left:auto"><span class="muted" style="font-size:12.5px">Warten:</span><input class="input" type="number" min="1" max="60" value="${st.wait}" data-bind="wait" style="width:70px;padding:7px 10px"><span class="muted" style="font-size:12.5px">Werktage</span></div></div>`:''}
  <div class="field"><label>Betreff</label><input class="input" data-bind="subject" value="${esc(subj)}" ${st.thread&&S.step>0?'disabled style="opacity:.6"':''} placeholder="z. B. Kurze Frage zu {Firma}">${st.thread&&S.step>0?'<span class="hint">Follow-ups im selben Verlauf übernehmen den Betreff von Mail 1 – das wirkt persönlicher und bringt meist mehr Antworten.</span>':''}</div>
  <div class="field"><div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><label>Text</label><div class="chips" data-tour="vars">${VARS.map(v=>`<span class="chip" data-act="insVar" data-v="${v}">{${v}}</span>`).join('')}</div></div><textarea class="textarea" id="bodyTa" data-bind="body">${esc(st.body)}</textarea><span class="hint">Fehlt ein Wert (z. B. kein Vorname), wird die Variable samt Leerzeichen weggelassen: „Hallo {Vorname},“ wird zu „Hallo,“.</span></div>
  <div class="grid g2" style="gap:16px">
   <div><div class="row" style="justify-content:space-between;margin-bottom:8px;gap:8px"><b style="font-size:13px" class="row gap-s">${ics('eye')}Vorschau</b>${S.prevLeads.length?`<select class="select" data-bind="prevIdx" style="width:auto;max-width:200px;padding:5px 30px 5px 10px;font-size:12.5px">${S.prevLeads.map((l,i)=>`<option value="${i}" ${i===S.prevIdx?'selected':''}>${esc(l.company||l.email)}</option>`).join('')}</select>`:'<span class="faint" style="font-size:12px">Beispiel-Lead</span>'}</div><div class="preview" id="preview">${previewHtml()}</div></div>
   <div><b style="font-size:13px;display:flex;gap:6px;margin-bottom:10px">${ics('shield')}Qualitäts-Check</b><div class="checks card" style="padding:14px" id="qcheck">${qcheck()}</div></div>
  </div></div></div>`;
}
function previewHtml(){const st=S.edit[S.step];const lead=curLead();const subj=st.thread&&S.step>0?'Re: '+S.edit[0].subject:st.subject;const sd=sender();
 return `<div class="preview-h"><span>Von</span><b>${esc(sd.name)} &lt;${esc(sd.email)}&gt;</b><span>An</span><b>${esc(lead.email||'—')}</b><span>Betreff</span><b>${renderVars(subj,lead)}</b></div><div class="preview-b">${renderVars(st.body,lead)}</div><div class="preview-f" style="white-space:pre-wrap">--\n${esc(C.settings.footer)}</div>`}
function qcheck(){
 const st=S.edit[S.step],lead=curLead();const txt=(st.thread&&S.step>0?'':st.subject)+' '+st.body;const spam=SPAM.filter(w=>txt.toLowerCase().includes(w));const words=st.body.trim()?st.body.trim().split(/\s+/).length:0;const links=(st.body.match(/https?:\/\//g)||[]).length;
 const map={Vorname:lead.first,Nachname:lead.last,Firma:lead.company,Stadt:lead.city,Branche:lead.industry,Absender:sender().name};const missing=[...new Set([...txt.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).filter(k=>!map[k]))];
 const rows=[[spam.length?'no':'ok',spam.length?`Spam-Wörter: <b>${spam.join(', ')}</b>`:'Keine Spam-Wörter'],[!words?'no':words>150?'wa':'ok',!words?'Text fehlt':words>150?`${words} Wörter – kürzer ist besser (unter 120)`:`${words} Wörter – gute Länge`],
  [links>1?'wa':'ok',links>1?`${links} Links – max. 1 Link empfohlen`:links?'1 Link – ok':'Keine Links – gut für die Zustellbarkeit'],[S.step===0&&!st.subject.trim()?'no':'ok',S.step===0&&!st.subject.trim()?'Betreff fehlt':'Betreff vorhanden'],
  [/\[Dein Angebot/.test(st.body)?'no':'ok',/\[Dein Angebot/.test(st.body)?'Platzhalter [Dein Angebot …] ersetzen':'Keine offenen Platzhalter'],
  [missing.length?'wa':'ok',missing.length?`Beim gewählten Lead leer: <b>${missing.join(', ')}</b>`:'Alle Variablen befüllt'],['ok','Fußzeile mit Abmelde-Hinweis wird angehängt']];
 return rows.map(([k,t])=>`<div class="checkrow"><span class="ci ${k}">${k==='ok'?'✓':k==='no'?'!':'–'}</span><span>${t}</span></div>`).join('')}
function refreshPreview(full){const p=$('#preview');if(p)p.innerHTML=previewHtml();const q=$('#qcheck');if(q)q.innerHTML=qcheck();if(full&&S.campTab==='sequence'&&!document.activeElement?.matches('input,textarea'))render()}
const saveSteps=debounce(async()=>{const c=camp();if(!c)return;const el=$('#saveState');if(el)el.textContent='Speichert …';const j=await patch(`/api/campaigns/${c.id}`,{steps:S.edit});if(j.ok){c.steps=JSON.parse(JSON.stringify(S.edit));const e=$('#saveState');if(e)e.innerHTML=`<span style="color:var(--good)">✓ Gespeichert</span>`}else toast(j.error,'bad')},700);
function progressLabel(r,steps){
 switch(r.status){case'pending':return['Wartet auf Mail 1','b-mute'];case'active':return[`${steps[r.step-1]||'Mail'} gesendet`,r.step>1?'b-violet':'b-info'];case'done':return['Sequenz beendet – keine Antwort','b-mute'];
 case'replied':return[`Geantwortet nach ${steps[r.repliedStep]||'Mail 1'}`,'b-good'];case'bounced':return['Bounce','b-bad'];case'unsub':return['Abgemeldet','b-bad'];case'stopped':return['Gestoppt','b-warn'];case'error':return['Fehler','b-bad'];default:return[r.status,'b-mute']}}
function campLeads(c){
 const steps=c.steps.map((s,i)=>i===0?'Mail 1':'Follow-up '+i);const R=S.campRows;
 const listChips=`<div class="card" style="padding:14px 16px;margin-bottom:14px"><div class="row gap" style="flex-wrap:wrap"><b style="font-size:13px">Lead-Listen in dieser Kampagne:</b>${C.lists.length?C.lists.map(l=>`<span class="daychip ${c.lists.includes(l.id)?'on':''}" style="width:auto;padding:0 12px" data-act="toggleList" data-id="${l.id}">${esc(l.name)} · ${l.count}</span>`).join(''):`<span class="muted">Noch keine Listen.</span>`}<button class="btn sm" style="margin-left:auto" data-act="import">${ic('upload',2)}Leads importieren</button></div></div>`;
 const callN=(R&&!R.preview)?R.rows.filter(r=>r.status==='done'||r.status==='replied').length:0;
 const callBar=(R&&!R.preview)?`<div class="card" style="padding:14px 16px;margin-bottom:14px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;background:linear-gradient(120deg,var(--vsoft),transparent 70%),var(--surface)"><div class="prov" style="background:var(--vsoft);color:var(--violet2)">${ic('phone')}</div><div style="flex:1;min-width:220px"><b style="font-size:13.5px">Anrufliste</b><div class="muted" style="font-size:12.5px">Alle ohne Antwort nach dem letzten Follow-up plus Interessierte und „Später melden“ – mit Telefonnummer, für Excel. Abgemeldete und Gesperrte sind ausgeschlossen.</div></div><button class="btn sm primary" data-act="dl" data-url="/api/export?campaign=${c.id}&filter=call">${ic('phone')}Anrufliste herunterladen</button><button class="btn sm" data-act="dl" data-url="/api/export?campaign=${c.id}">${ic('file')}Alle als CSV</button></div>`:'';
 if(!R)return listChips+`<div class="card empty">${spinner} Lade Leads …</div>`;
 const counts={};(R.rows||[]).forEach(r=>{const[l]=progressLabel(r,steps);counts[l]=(counts[l]||0)+1});
 return `${listChips}${callBar}${R.preview?`<div class="callout" style="margin-bottom:14px">${ic('info')}<div>Vorschau: ${R.total} Leads aus den gewählten Listen. Der Fortschritt erscheint, sobald die Kampagne gestartet ist.</div></div>`:`<div class="row gap" style="margin-bottom:14px;flex-wrap:wrap">${Object.entries(counts).map(([l,n])=>`<span class="badge b-mute">${l} · ${n}</span>`).join('')}</div>`}
 <div class="card">${R.rows.length?`<table class="table"><thead><tr><th>Lead</th><th>Firma</th><th>Fortschritt</th><th>Nächster Schritt</th><th>Absender</th></tr></thead><tbody>
 ${R.rows.map(r=>{const l=r.lead;const[lab,cls]=progressLabel(r,steps);return `<tr class="click" data-act="openLead" data-id="${l.id}"><td><div class="row gap">${av(fullName(l)||l.company||l.email,32)}<div><div class="cell-main">${esc(fullName(l)||'—')}</div><div class="cell-sub">${esc(l.email)}</div></div></div></td><td>${esc(l.company||'—')}<div class="cell-sub">${esc(l.city||'')}</div></td>
 <td><span class="badge ${cls}">${lab}</span></td><td class="muted" style="font-size:12.5px">${r.status==='active'&&r.nextAt?`${steps[r.step]} am ${dday(r.nextAt)}`:r.status==='pending'?'Mail 1 – nächster Versandtag':'—'}</td><td class="muted" style="font-size:12.5px">${esc(r.account||'—')}</td></tr>`}).join('')}</tbody></table>${R.total>R.rows.length?`<div class="muted" style="padding:12px 16px;font-size:12.5px">${R.rows.length} von ${R.total} angezeigt</div>`:''}`:`<div class="empty">Keine Leads in den gewählten Listen.</div>`}</div>`;
}
function campSchedule(c){
 const sc=c.schedule,dn=['Mo','Di','Mi','Do','Fr','Sa','So'];const accs=c.accounts.map(accById).filter(a=>a&&a.status==='ok');const cap=accs.reduce((s,a)=>s+a.limit,0);
 const pending=c.stats.total?c.stats.pending:C.lists.filter(l=>c.lists.includes(l.id)).reduce((s,l)=>s+l.count,0);const perDay=Math.min(c.dailyNew,cap||0);const days=perDay?Math.ceil(pending/perDay):0;
 return `<div class="grid g2"><div class="card" style="padding:20px"><h3 style="font-size:15px;margin-bottom:14px">Wann wird gesendet?</h3>
 <div class="field"><label>Versandtage</label><div class="row gap-s">${dn.map((d,i)=>`<span class="daychip ${sc.days[i]?'on':''}" data-act="day" data-i="${i}">${d}</span>`).join('')}</div></div>
 <div class="grid g2" style="gap:12px"><div class="field"><label>Von</label><input class="input" type="time" value="${sc.from}" data-sched="from"></div><div class="field"><label>Bis</label><input class="input" type="time" value="${sc.to}" data-sched="to"></div></div>
 <div class="field"><label>Zeitzone der Empfänger</label><select class="select" data-sched="timezone">${['','Europe/Vienna','Europe/Berlin','Europe/Zurich','Europe/Belgrade'].map(z=>`<option value="${z}" ${sc.timezone===z?'selected':''}>${z||'Wie in Einstellungen ('+C.settings.timezone+')'}</option>`).join('')}</select></div>
 <div class="field"><label>Abstand zwischen zwei Mails pro Konto</label><div class="row gap"><input class="input" type="number" min="0" value="${sc.minGap}" data-sched="minGap" style="width:80px"><span class="muted">bis</span><input class="input" type="number" min="0" value="${sc.maxGap}" data-sched="maxGap" style="width:80px"><span class="muted">Minuten, zufällig</span></div><span class="hint">Zufällige Abstände wirken menschlich – Mails im Sekundentakt sind ein Spam-Signal.</span></div></div>
 <div class="card" style="padding:20px"><h3 style="font-size:15px;margin-bottom:14px">Wie viel wird gesendet?</h3>
 <div class="field"><label>Max. neue Leads pro Tag (diese Kampagne)</label><input class="input" type="number" min="1" value="${c.dailyNew}" data-campfield="dailyNew"><span class="hint">Follow-ups kommen zusätzlich dazu, zählen aber zum Tageslimit der Konten.</span></div>
 <div class="callout" style="margin-bottom:14px">${ic('flame')}<div>Die Limits pro Konto steuert das Warm-up automatisch. Heute schaffen die ${accs.length} Absender-Konten zusammen <b>${cap} Mails</b>.</div></div>
 <div class="field"><label>Geschätzte Dauer für Mail 1 an alle</label><div style="font-size:22px;font-weight:700">${pending?(days?'ca. '+days+' Versandtag'+(days>1?'e':''):'–'):'fertig'}</div><span class="hint">${pending} Leads warten noch auf Mail 1${!cap?' · keine Absender-Konten bereit':''}</span></div>
 <button class="btn sm" data-act="lesson">${ic('info')}Warum steigen die Limits langsam?</button></div></div>`;
}
function campSenders(c){
 if(!C.accounts.length)return `<div class="card empty">${ics('mail',26)}<p style="margin:10px 0 14px">Noch keine E-Mail-Konten verbunden.</p><button class="btn primary sm" data-act="connect">${ic('plus',2)}Konto verbinden</button></div>`;
 return `<div class="callout" style="margin-bottom:16px">${ic('rotate')}<div><b>Rotation:</b> Das Tool wechselt automatisch zwischen allen ausgewählten Konten. Follow-ups gehen immer vom selben Konto wie Mail 1, damit der Verlauf beim Empfänger zusammenbleibt.</div></div>
 <div class="card">${C.accounts.map(a=>{const on=c.accounts.includes(a.id);const w=warmInfo(a);return `<div class="acc" style="grid-template-columns:auto 1.6fr 1fr 1fr auto"><div class="toggle ${on?'on':''}" data-act="toggleSender" data-id="${a.id}"><span class="sw"></span></div><div class="row gap" style="min-width:0"><div class="prov">${provLetter(a)}</div><div style="min-width:0"><div class="cell-main" style="overflow:hidden;text-overflow:ellipsis">${esc(a.email)}</div><div class="cell-sub">${esc(a.name||'')}</div></div></div><div><div class="cell-sub" style="margin-bottom:5px">${w.label}</div><div class="prog ${w.cls}"><i style="width:${w.pct}%"></i></div></div><div><b>${a.limit}</b> <span class="muted">/ Tag</span></div>${a.status==='error'?'<span class="badge b-bad">Getrennt</span>':a.status==='paused'?'<span class="badge b-warn">Pausiert</span>':'<span class="badge b-good">Bereit</span>'}</div>`}).join('')}</div>`;
}
function campSettings(c){
 const row=(on,l,h,act)=>`<div style="padding:14px 0;border-bottom:1px solid var(--border)"><div class="toggle ${on?'on':''}" ${act?`data-act="${act}"`:'style="cursor:default;opacity:.75"'}><span class="sw"></span>${l}</div><div class="muted" style="font-size:12px;margin:4px 0 0 46px">${h}</div></div>`;
 return `<div class="grid g2" style="align-items:start"><div class="card" style="padding:8px 22px 14px">${row(1,'Bei Antwort stoppen','Sobald der Lead antwortet, bekommt er keine Follow-ups mehr. (Immer aktiv)')}${row(1,'Abwesenheitsnotizen erkennen','Automatische Antworten stoppen die Sequenz nicht und landen im Ordner „Abwesend“.')}${row(1,'Abmeldungen erkennen','Antwortet jemand mit „Abmelden“, wird er gestoppt und kommt auf die Sperrliste.')}${row(c.stopCompany,'Ganze Firma stoppen','Antwortet jemand von @firma.at, bekommen Kollegen derselben Firma keine Mails mehr.','toggleCompany')}${row(0,'Öffnungen tracken','Bewusst nicht eingebaut: ungenau (Apple Mail), schadet der Zustellbarkeit, im DACH-Raum einwilligungspflichtig.')}</div>
 <div class="card" style="padding:20px"><div class="field"><label>Name der Kampagne</label><input class="input" value="${esc(c.name)}" data-campfield="name"></div><div class="row gap mt"><button class="btn danger" data-act="delCamp">${ic('trash')}Kampagne löschen</button></div><p class="muted" style="font-size:12px;margin-top:10px">Löschen entfernt auch den Verlauf dieser Kampagne. Leads bleiben in ihren Listen.</p></div></div>`;
}
function campStats(c){
 const st=c.stats.steps;const max=Math.max(1,...st.map(s=>s.sent?s.replies/s.sent*100:0));
 return `<div class="grid g4" style="margin-bottom:16px">${miniStat('Kontaktiert',c.stats.contacted)}${miniStat('Antworten',c.stats.replies)}${miniStat('Positiv',c.stats.positive,'good')}${miniStat('Bounces',`${c.stats.bounces} · ${num(c.stats.contacted?c.stats.bounces/c.stats.contacted*100:0)} %`)}</div>
 <div class="card"><div class="card-h"><h3>Welcher Schritt bringt die Antworten?</h3><span class="muted" style="font-size:12.5px">Antwortrate pro Schritt</span></div><div class="card-b">
 ${st.map((s,i)=>{const r=s.sent?s.replies/s.sent*100:0;return `<div style="display:grid;grid-template-columns:120px 1fr 170px;gap:16px;align-items:center;padding:12px 0;border-bottom:1px solid var(--border)"><b>${i===0?'Mail 1':'Follow-up '+i}</b><div class="prog" style="height:12px"><i style="width:${r/max*100}%"></i></div><div class="row gap" style="justify-content:flex-end"><b style="font-size:16px">${num(r)} %</b><span class="muted" style="font-size:12px">${s.replies} von ${s.sent}</span></div></div>`}).join('')}
 ${c.stats.contacted<30?`<div class="callout" style="margin-top:16px">${ic('info')}<div>Aussagekräftig wird das ab ca. 100 gesendeten Mails pro Schritt.</div></div>`:''}</div></div>`;
}
function warmInfo(a){if(a.status==='error')return{label:'Getrennt',pct:0,cls:'bad'};if(!a.warmup)return{label:'Warm-up aus',pct:100,cls:'good'};if(a.day>=28)return{label:'Aufgewärmt',pct:100,cls:'good'};return{label:`Tag ${a.day} von 28`,pct:Math.round(a.day/28*100),cls:''}}
const provLetter=a=>a.provider==='gworkspace'?'<span style="color:#fdba8c" title="Google Workspace – Admin-Verbindung">W</span>':a.provider==='google'?'<span style="color:#60a5fa">G</span>':a.provider==='microsoft'?'<span style="color:#34d399">M</span>':ics('mail',16);

/* ================= Leads ================= */
const LSTAT={new:['Neu','b-mute'],pending:['Wartet','b-mute'],active:['In Sequenz','b-info'],done:['Sequenz beendet','b-mute'],replied:['Geantwortet','b-good'],bounced:['Bounce','b-bad'],unsub:['Abgemeldet','b-bad'],stopped:['Gestoppt','b-warn'],error:['Fehler','b-bad']};
const CAT={interested:['Interessiert','b-good'],later:['Später','b-warn'],no:['Kein Interesse','b-bad'],open:['Offen','b-info'],ooo:['Abwesend','b-mute']};
V.leads=()=>{
 const lists=[['all','Alle Leads',C.leadsCount],...C.lists.map(l=>[l.id,l.name,l.count])];
 const cur=C.lists.find(l=>l.id===S.leadList);
 return `<div class="wrap"><div class="page-head"><div><h1>Leads</h1><p>${fmt(C.leadsCount)} Kontakte in ${C.lists.length} Liste${C.lists.length===1?'':'n'} · ${C.blocklist.length} auf der Sperrliste</p></div><div class="row gap"><button class="btn" data-act="go" data-view="finder">${ic('radar')}Lead-Finder</button><button class="btn primary" data-act="import" data-tour="import">${ic('upload',2)}Leads importieren</button></div></div>
 ${C.leadsCount?`<div style="display:grid;grid-template-columns:230px 1fr;gap:16px;align-items:start">
  <div class="card" style="padding:10px">${lists.map(([k,l,n])=>`<div class="fitem ${S.leadList===k?'on':''}" data-act="leadList" data-k="${k}">${ics(k==='all'?'users':'file')}<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(l)}</span><span class="count muted">${n}</span></div>`).join('')}<div style="border-top:1px solid var(--border);margin:8px 0"></div><div class="fitem" data-act="blockTab">${ics('shield')}Sperrliste<span class="count muted">${C.blocklist.length}</span></div></div>
  <div class="card"><div class="row gap" style="padding:14px 16px;border-bottom:1px solid var(--border);flex-wrap:wrap"><div class="search" style="max-width:280px;padding:7px 11px">${ics('search')}<input id="leadQ" placeholder="Name, Firma, E-Mail …" value="${esc(S.leadQ)}"></div><div class="seg">${[['all','Alle'],['new','Neu'],['contacted','In Sequenz'],['replied','Geantwortet']].map(([k,l])=>`<button class="${S.leadStatus===k?'on':''}" data-act="leadStatus" data-k="${k}">${l}</button>`).join('')}</div><button class="btn sm ghost" data-act="dl" data-url="/api/export?list=${encodeURIComponent(S.leadList)}&status=${S.leadStatus}" title="Als CSV für Excel exportieren">${ic('file')}Export</button>${cur?`<button class="btn sm ghost" data-act="renameList" data-id="${cur.id}" title="Liste umbenennen">${ic('edit')}</button><button class="btn sm ghost danger" data-act="delList" data-id="${cur.id}" title="Liste löschen">${ic('trash')}</button>`:''}<span class="muted" style="margin-left:auto;font-size:12.5px" id="leadCount"></span></div>
  <div id="leadTable"><div class="empty">${spinner} Lade …</div></div></div></div>`
 :`<div class="card empty" style="padding:60px 20px">${ics('users',30)}<h3 style="margin:12px 0 6px;color:var(--text)">Noch keine Leads</h3><p>Importiere eine CSV-Datei mit Firmen und E-Mail-Adressen. Aus Excel: <b>Datei → Speichern unter → CSV</b>.</p><button class="btn primary mt" data-act="import">${ic('upload',2)}Leads importieren</button></div>`}</div>`;
};
async function loadLeads(){
 const j=await get(`/api/leads?list=${encodeURIComponent(S.leadList)}&q=${encodeURIComponent(S.leadQ)}&status=${S.leadStatus}`);
 const el=$('#leadTable');if(!el||!j.ok)return;
 $('#leadCount').textContent=j.total>j.leads.length?`${j.leads.length} von ${fmt(j.total)} angezeigt`:`${fmt(j.total)} Leads`;
 el.innerHTML=j.leads.length?`<table class="table"><thead><tr><th>Kontakt</th><th>Firma</th><th>Status</th><th>E-Mail-Prüfung</th><th>Antwort</th></tr></thead><tbody>
 ${j.leads.map(l=>`<tr class="click" data-act="openLead" data-id="${l.id}"><td><div class="row gap">${av(fullName(l)||l.company||l.email,30)}<div style="min-width:0"><div class="cell-main">${esc(fullName(l)||'—')}</div><div class="cell-sub">${esc(l.email)}</div></div></div></td><td>${esc(l.company||'—')}<div class="cell-sub">${esc(l.city||'')}${S.leadList==='all'&&l.list?' · '+esc(l.list):''}</div></td><td><span class="badge ${(LSTAT[l.status]||LSTAT.new)[1]}">${(LSTAT[l.status]||LSTAT.new)[0]}</span></td><td>${l.emailCheck==='invalid'?'<span class="badge b-bad">Ungültig</span>':l.emailCheck==='role'?'<span class="badge b-warn">Sammeladresse</span>':l.emailCheck==='valid'?'<span class="badge b-good">Gültig</span>':'<span class="badge b-mute">Ungeprüft</span>'}</td><td>${l.tags.length?l.tags.map(t=>`<span class="badge ${CAT[t][1]}">${CAT[t][0]}</span>`).join(' '):'<span class="faint">—</span>'}</td></tr>`).join('')}</tbody></table>`:`<div class="empty">Keine Leads für diesen Filter.</div>`;
}

/* ================= Inbox ================= */
V.inbox=()=>{
 const cats=[['all','Alle','inbox'],['interested','Interessiert','sparkle'],['open','Offen','info'],['later','Später melden','clock'],['no','Kein Interesse','x'],['ooo','Abwesend (aussortiert)','pause']];
 const cnt=C.inboxCounts;const total=cnt.interested+cnt.later+cnt.no+cnt.open;
 return `<div class="wrap" style="max-width:1400px"><div class="page-head"><div><h1>Posteingang</h1><p>Alle Antworten aus allen Konten an einem Ort. Abruf alle 2 Minuten.</p></div><div class="row gap"><span class="badge b-violet">${ics('sparkle',12)}Wird automatisch vorsortiert</span><button class="btn sm" data-act="checkMail">${ic('refresh')}Jetzt abrufen</button></div></div>
 <div class="card inbox"><div class="inbox-f">${cats.map(([k,l,i])=>`<div class="fitem ${S.inboxCat===k?'on':''}" data-act="inboxCat" data-k="${k}">${ics(i)}${l}<span class="count muted">${k==='all'?total:cnt[k]||0}</span></div>`).join('')}
 <div style="border-top:1px solid var(--border);margin:10px 0"></div><div class="muted" style="font-size:11.5px;padding:4px 10px">Abwesenheitsnotizen stoppen die Sequenz nicht. Abmeldungen kommen automatisch auf die Sperrliste.</div></div>
 <div class="inbox-l" id="inboxList"><div class="empty">${spinner}</div></div><div class="inbox-r" id="inboxRead"></div></div></div>`;
};
async function loadInbox(){const j=await get('/api/inbox?cat='+S.inboxCat);if(!j.ok)return;S.inbox=j.items;if(!S.inbox.find(m=>m.id===S.inboxSel))S.inboxSel=S.inbox[0]?.id||null;drawInbox()}
function drawInbox(){
 const l=$('#inboxList'),r=$('#inboxRead');if(!l)return;
 l.innerHTML=S.inbox.length?S.inbox.map(x=>`<div class="mitem ${x.id===S.inboxSel?'on':''} ${x.read?'':'unread'}" data-act="inboxSel" data-id="${x.id}"><div class="t"><span style="color:var(--text);font-size:13px;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.fromName||x.from)}</span><span>${when(x.at)}</span></div><div class="s">${esc(x.company||x.from)}</div><div class="p">${esc(x.text.replace(/\s+/g,' ').slice(0,140))}</div><div class="tags"><span class="badge ${CAT[x.cat][1]}">${x.type==='unsub'?'Abgemeldet':CAT[x.cat][0]}</span>${x.step?`<span class="badge b-mute">${esc(x.step)}</span>`:''}</div></div>`).join(''):`<div class="empty" style="padding:50px 20px">${ics('inbox',26)}<p style="margin-top:10px">Noch keine Antworten${S.inboxCat!=='all'?' in diesem Ordner':''}.</p></div>`;
 const m=S.inbox.find(x=>x.id===S.inboxSel);
 r.innerHTML=m?`<div style="padding:20px 24px;border-bottom:1px solid var(--border)"><div class="row gap" style="align-items:flex-start">${av(m.fromName||m.from,40)}<div style="flex:1;min-width:0"><div class="row gap" style="flex-wrap:wrap"><b style="font-size:15px">${esc(m.fromName||m.from)}</b><span class="muted" style="font-size:12.5px">&lt;${esc(m.from)}&gt;</span></div><div class="muted" style="font-size:12.5px">${esc(m.company||'')}${m.campaign?' · Kampagne „'+esc(m.campaign)+'“':''}${m.step?' · Antwort auf '+esc(m.step):''} · an ${esc(m.account)}</div></div><span class="muted" style="font-size:12px">${dt(m.at)}</span></div>
 ${m.type!=='ooo'?`<div class="row gap-s" style="margin-top:14px;flex-wrap:wrap"><span class="muted" style="font-size:12px;margin-right:4px">Kategorie:</span>${[['interested','Interessiert'],['open','Offen'],['later','Später'],['no','Kein Interesse']].map(([k,l])=>`<button class="btn sm ${m.cat===k?'':'ghost'}" data-act="setCat" data-k="${k}" style="${m.cat===k?'border-color:var(--vline);background:var(--vsoft)':''}">${l}</button>`).join('')}<button class="btn sm ghost" style="margin-left:auto" data-act="openLead" data-id="${m.leadId}">${ic('eye')}Verlauf</button></div>`:''}</div>
 <div style="padding:20px 24px;flex:1"><h3 style="font-size:15px;margin-bottom:12px">${esc(m.subject)}</h3><div style="white-space:pre-wrap;line-height:1.65">${esc(m.text)||'<span class="faint">(kein Text)</span>'}</div>${m.answered?`<div class="result ok" style="margin-top:18px">${ics('check',15,2.4)}<div>Beantwortet am ${dt(m.answered)}</div></div>`:''}</div>
 ${m.type==='reply'?`<div style="padding:16px 24px;border-top:1px solid var(--border)"><textarea class="textarea" id="replyTa" style="min-height:90px" placeholder="Antwort schreiben …"></textarea><div class="row gap" style="margin-top:10px;justify-content:space-between"><span class="muted" style="font-size:12px">Wird im selben Verlauf gesendet von ${esc(m.account)}</span><button class="btn primary sm" data-act="sendReply" id="replyBtn">${ic('reply')}Antworten</button></div></div>`:''}`:`<div class="empty" style="margin:auto">Wähle eine Nachricht.</div>`;
}

/* ================= Accounts ================= */
V.accounts=()=>{
 const ok=okAccounts();
 return `<div class="wrap"><div class="page-head"><div><h1>E-Mail-Konten</h1><p>${C.accounts.length} Konten · heute ${C.kpi.capacity} Mails möglich · nach dem Warm-up ca. ${ok.reduce((s,a)=>s+a.maxPerDay,0)}</p></div><div class="row gap"><button class="btn" data-act="lesson">${ic('flame')}So funktioniert Warm-up</button>${C.role==='owner'?`<button class="btn" data-act="gws">${ic('shield')}Google Workspace (Admin)</button>`:''}<button class="btn primary" data-act="connect" data-tour="connect">${ic('plus',2.2)}Konto verbinden</button></div></div>
 <div class="card" style="padding:20px 22px;margin-bottom:16px" data-tour="calc"><div class="row" style="justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px"><div><h3 style="font-size:15px">Kapazitäts-Rechner</h3><p class="muted" style="font-size:12.5px">Wie viele Konten brauchst du für dein Ziel?</p></div><span class="badge b-violet">Faustregel: 40 Kaltmails pro Konto und Tag</span></div>
 <div class="calc"><div><label class="muted" style="font-size:12px;font-weight:600">Mein Ziel (Mails pro Tag)</label><input class="input" id="calcIn" type="number" value="${store.get('goal',200)}" style="font-size:20px;font-weight:700;margin-top:6px"></div><div class="eq">→</div><div><div class="muted" style="font-size:12px;font-weight:600">Benötigte Konten</div><div class="big" id="calcAcc">5</div></div><div class="eq"></div><div><div class="muted" style="font-size:12px;font-weight:600">Bis zur vollen Leistung</div><div class="big">ca. 4 Wochen</div></div></div>
 <div class="muted" id="calcNote" style="font-size:12.5px;margin-top:12px"></div></div>
 ${C.accounts.length?`<div class="card"><div class="acc acc-head"><span>Konto</span><span>Warm-up</span><span>Heute</span><span class="hide-s">Bounce-Rate</span><span class="hide-s">DNS</span><span></span></div>
 ${C.accounts.map(a=>{const w=warmInfo(a);return `<div class="acc"><div class="row gap" style="min-width:0"><div class="prov">${provLetter(a)}</div><div style="min-width:0"><div class="cell-main" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(a.email)}</div><div class="cell-sub">${a.status==='error'?`<span style="color:var(--bad)">${esc(a.error)}</span>`:a.status==='paused'?`<span style="color:var(--warn)">${esc(a.error||'Pausiert')}</span>`:a.imapError?`<span style="color:var(--warn)">IMAP: ${esc(a.imapError)}</span>`:esc(a.name||'')+(a.lastImapAt?` · Antworten geprüft ${when(a.lastImapAt)}`:'')}</div></div></div>
 <div><div class="row" style="justify-content:space-between;font-size:12px;margin-bottom:5px"><span>${w.label}</span>${a.status==='ok'&&a.warmup&&a.day<28?`<span class="badge b-peach" style="padding:1px 7px">${ics('flame',11,2)}läuft</span>`:''}</div><div class="prog ${w.cls}"><i style="width:${w.pct}%"></i></div></div>
 <div>${a.status!=='ok'?'<span class="faint">—</span>':`<b>${a.sentToday}</b><span class="muted"> / ${a.limit}</span><div class="cell-sub">${a.limitTomorrow>a.limit?'Limit morgen '+a.limitTomorrow:'Max. '+a.maxPerDay+'/Tag'}</div>`}</div>
 <div class="hide-s"><b style="color:${a.bounce>3?'var(--bad)':a.bounce>2?'var(--warn)':'var(--good)'}">${num(a.bounce)} %</b><div class="cell-sub">${a.totalSent} gesendet</div></div>
 <div class="dns hide-s">${a.dns?['spf','dkim','dmarc'].map(k=>`<span class="${a.dns[k]?'ok':'no'}">${k.toUpperCase()}</span>`).join(''):`<button class="btn sm ghost" data-act="dnsCheck" data-id="${a.id}">Prüfen</button>`}</div>
 <div class="row gap-s">${a.status==='error'?`<button class="btn sm" data-act="connect" data-email="${esc(a.email)}">Neu verbinden</button>`:`<button class="btn sm ghost" data-act="accMenu" data-id="${a.id}">Verwalten</button>`}</div></div>`}).join('')}</div>`
 :`<div class="card empty" style="padding:50px 20px">${ics('mail',30)}<h3 style="margin:12px 0 6px;color:var(--text)">Noch kein Konto verbunden</h3><p>Verbinde deine erste Adresse mit E-Mail und App-Passwort.</p><button class="btn primary mt" data-act="connect">${ic('plus',2.2)}Konto verbinden</button></div>`}
 <div class="grid g3 mt">${tip('flame','Warum am Anfang wenig?','Neue Konten haben keinen Ruf bei Google. Zu viele Mails auf einmal sehen aus wie Spam. Deshalb steigt das Limit über 4 Wochen automatisch.')}${tip('rotate','Warum mehrere Konten?','Pro Konto sind dauerhaft nur 30–50 Kaltmails am Tag sicher. Mehr Menge = mehr Konten. Fällt eines aus, laufen die anderen weiter.')}${tip('globe','Warum eine Nebendomain?','Versende Kaltakquise über z. B. astravagand-mail.com statt deiner Hauptdomain. So bleibt astravagand.com sauber, falls etwas schiefgeht.')}</div></div>`;
};
function tip(i,t,p){return `<div class="card" style="padding:18px"><div class="row gap" style="margin-bottom:8px"><div class="prov" style="background:var(--vsoft);color:var(--violet2)">${ic(i)}</div><b>${t}</b></div><p class="muted" style="font-size:12.5px">${p}</p></div>`}
function calc(){const el=$('#calcIn');if(!el)return;const v=+el.value||0;store.set('goal',v);const n=Math.max(1,Math.ceil(v/40));$('#calcAcc').textContent=n;const have=okAccounts().length;$('#calcNote').innerHTML=n>have?`Du hast ${have} aktive Konten – dir fehlen noch <b style="color:var(--text)">${n-have}</b>. Tipp: 2–3 Postfächer pro Nebendomain.`:`Deine ${have} Konten reichen dafür, sobald das Warm-up abgeschlossen ist.`}

/* ================= Templates / Finder / Settings ================= */
V.templates=()=>`<div class="wrap"><div class="page-head"><div><h1>Vorlagen</h1><p>Einzelne Texte und komplette Sequenzen zum Wiederverwenden.</p></div><button class="btn primary" data-act="newTpl">${ic('plus',2.2)}Neue Vorlage</button></div>
 <div class="grid g3">${C.templates.map(t=>`<div class="card tpl" data-act="useTpl" data-id="${t.id}"><div class="row" style="justify-content:space-between"><span class="badge ${t.type==='seq'?'b-violet':'b-mute'}">${t.type==='seq'?'Sequenz · '+t.steps.length+' Schritte':'Einzelne Mail'}</span><button class="x" data-act="delTpl" data-id="${t.id}" title="Löschen">${ic('trash')}</button></div><h4>${esc(t.name)}</h4><p>${esc(t.type==='seq'?t.steps[0].subject+' – '+t.steps[0].body:t.body)}</p><div class="foot"><span>${t.type==='seq'?'Klick: neue Kampagne damit':'Im Editor über „Aus Vorlage laden“'}</span></div></div>`).join('')}
 <div class="card tpl" style="display:grid;place-items:center;border-style:dashed;min-height:170px;box-shadow:none;cursor:default"><div style="text-align:center"><div class="prov" style="margin:0 auto 10px;background:var(--vsoft);color:var(--violet2)">${ic('sparkle')}</div><b>Mit KI schreiben</b><p class="muted" style="font-size:12px;margin-top:4px">Branche + Angebot eingeben, Text erhalten</p><span class="badge b-peach" style="margin-top:8px">Version 2</span></div></div></div></div>`;
V.finder=()=>`<div class="wrap"><div class="page-head"><div><h1>Lead-Finder</h1><p>Firmen nach Branche und Ort finden und E-Mails von ihren Websites holen.</p></div></div>
 <div class="banner">${ic('sparkle')}<div><b>Vorschau – kommt in Version 2.</b> <span class="muted">So wird der Lead-Finder aussehen. Bis dahin: Leads als CSV importieren.</span></div></div>
 <div class="card" style="padding:20px;opacity:.75;pointer-events:none"><div style="display:grid;grid-template-columns:1.4fr 1fr 140px 1fr auto;gap:12px;align-items:end"><div class="field" style="margin:0"><label>Branche / Suchbegriff</label><input class="input" value="Reinigungsfirma"></div><div class="field" style="margin:0"><label>Ort</label><input class="input" value="Linz"></div><div class="field" style="margin:0"><label>Umkreis</label><select class="select"><option>15 km</option></select></div><div class="field" style="margin:0"><label>Quelle</label><select class="select"><option>Google Maps</option></select></div><button class="btn primary">${ic('search',2)}Suchen</button></div></div>
 <div class="row gap mt"><button class="btn" data-act="import">${ic('upload',2)}Stattdessen CSV importieren</button></div></div>`;
V.settings=()=>{
 const st=C.settings;
 const tabs=[['workspace','Workspace','home'],['security','Sicherheit & Login','key'],['users','Benutzer','users'],['unsub','Abmeldung & Fußzeile','shield'],['block','Sperrliste','x'],['look','Darstellung','eye'],['onb','Onboarding & Hilfe','book'],['data','Daten','file']];
 const b={
  workspace:`<h3 style="font-size:16px;margin-bottom:16px">Workspace</h3><div class="field"><label>Firmenname</label><input class="input" id="setCompany" value="${esc(C.workspace.name)}"></div><div class="field"><label>Zeitzone</label><select class="select" id="setTz">${['Europe/Vienna','Europe/Berlin','Europe/Zurich','Europe/Belgrade'].map(z=>`<option ${st.timezone===z?'selected':''}>${z}</option>`).join('')}</select><span class="hint">Bestimmt, was „heute“ für die Tageslimits bedeutet.</span></div>
  <div class="field"><label>Workspaces</label><div class="card" style="padding:12px 14px;box-shadow:none">${C.workspaces.map(w=>`<div class="row gap" style="padding:6px 0"><div class="ws" style="margin:0;flex:1;cursor:${w.id===C.workspace.id?'default':'pointer'}" ${w.id===C.workspace.id?'':`data-act="wsSwitch" data-id="${w.id}"`}><div class="av">${esc(w.name[0]||'W')}</div><div><strong>${esc(w.name)}</strong><span>${w.id===C.workspace.id?'Aktiv':'Wechseln'}</span></div></div></div>`).join('')}<button class="btn sm mt" data-act="wsNew">${ic('plus',2)}Kunden-Workspace</button><p class="muted" style="font-size:12px;margin-top:10px">Jeder Workspace hat eigene Konten, Leads, Kampagnen und Einstellungen.</p></div></div><div class="row gap mt2"><button class="btn primary" data-act="saveWs">Speichern</button></div>`,
  unsub:`<h3 style="font-size:16px;margin-bottom:16px">Abmeldung & Pflicht-Fußzeile</h3><div class="field"><label>Fußzeile unter jeder Mail</label><textarea class="textarea" id="setFooter" style="min-height:110px">${esc(st.footer)}</textarea><span class="hint">Pflicht im DACH-Raum: Firmenname, Ort und ein Hinweis, wie man sich abmeldet. Antworten mit „Abmelden“ werden automatisch erkannt.</span></div><div class="row gap mt"><button class="btn primary" data-act="saveFooter">Speichern</button></div>`,
  block:`<h3 style="font-size:16px;margin-bottom:6px">Globale Sperrliste</h3><p class="muted" style="font-size:12.5px;margin-bottom:14px">Diese Adressen und Domains werden in keiner Kampagne angeschrieben – auch nicht nach einem neuen Import. Eine Zeile pro Eintrag, ganze Firmen mit <code>@firma.at</code>.</p><textarea class="textarea" id="setBlock" style="min-height:220px;font-family:ui-monospace,monospace;font-size:12.5px">${esc(C.blocklist.join('\n'))}</textarea><span class="hint">${C.blocklist.length} Einträge · Bounces und Abmeldungen kommen automatisch dazu</span><div class="row gap mt"><button class="btn primary" data-act="saveBlock">Speichern</button></div>`,
  look:`<h3 style="font-size:16px;margin-bottom:16px">Darstellung</h3><div class="seg"><button class="${document.documentElement.dataset.theme==='dark'?'on':''}" data-act="setTheme" data-t="dark">Dunkel</button><button class="${document.documentElement.dataset.theme==='light'?'on':''}" data-act="setTheme" data-t="light">Hell</button></div>`,
  onb:`<h3 style="font-size:16px;margin-bottom:16px">Onboarding & Hilfe</h3><div class="row gap" style="flex-wrap:wrap"><button class="btn" data-act="tour">${ic('play')}Tour neu starten</button><button class="btn" data-act="welcome">${ic('sparkle')}Willkommens-Assistent</button><button class="btn" data-act="lesson">${ic('flame')}Lektion Warm-up</button><button class="btn" data-act="help">${ic('book')}Hilfe-Center</button></div>`,
  security:secSection(),users:usersSection(),
  data:`<h3 style="font-size:16px;margin-bottom:10px">Daten & Betrieb</h3><p class="muted" style="font-size:13px">Alle Daten liegen in deiner Supabase-Datenbank (Rechenzentrum Frankfurt). App-Passwörter sind zusätzlich mit einem eigenen Schlüssel verschlüsselt, der getrennt davon bei Vercel liegt. Supabase macht automatisch tägliche Backups.</p><div class="callout mt">${ic('info')}<div>Versand und Antworterkennung laufen in der Cloud jede Minute automatisch – dein Computer kann aus sein.</div></div>`
 };
 return `<div class="wrap"><div class="page-head"><div><h1>Einstellungen</h1><p>Workspace, Regeln und Darstellung.</p></div></div>
 <div style="display:grid;grid-template-columns:230px 1fr;gap:16px;align-items:start"><div class="card" style="padding:10px">${tabs.map(([k,l,i])=>`<div class="fitem ${S.settingsTab===k?'on':''}" data-act="setTab" data-k="${k}">${ics(i)}${l}</div>`).join('')}</div><div class="card" style="padding:24px;max-width:760px">${b[S.settingsTab]}</div></div></div>`;
};

/* ================= Lead panel ================= */
async function openLead(id){
 $('#panel').innerHTML=`<div class="panel-b"><div class="empty">${spinner}</div></div>`;$('#panel').classList.add('open');$('#panelBg').classList.add('open');
 const j=await get('/api/leads/'+id);if(!j.ok){$('#panel').innerHTML=`<div class="panel-b">${esc(j.error)}</div>`;return}
 const l=j.lead,name=fullName(l)||l.company||l.email;
 const items=[];
 j.enroll.forEach(e=>{
  items.push(`<div class="muted" style="font-size:11.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin:4px 0 12px">Kampagne „${esc(e.campaign||'')}“</div>`);
  if(e.status==='pending')items.push(`<div class="tl-item plan"><div class="what">Wartet auf Mail 1</div><div class="cell-sub">Geht am nächsten Versandtag raus.</div></div>`);
  e.history.forEach(h=>{
   if(h.type==='sent')items.push(`<div class="tl-item"><div class="when">${dt(h.at)} · von ${esc(h.account)}</div><div class="what">${esc(e.steps[h.step]?(h.step===0?'Mail 1':'Follow-up '+h.step):'Mail')} gesendet</div><div class="body"><b>${esc(h.subject)}</b>\n\n${esc(h.text)}</div></div>`);
   else if(h.type==='reply')items.push(`<div class="tl-item rep"><div class="when">${dt(h.at)}</div><div class="what" style="color:var(--good)">Antwort erhalten – Sequenz gestoppt</div><div class="body">${esc(h.text)}</div></div>`);
   else if(h.type==='manual')items.push(`<div class="tl-item"><div class="when">${dt(h.at)} · von ${esc(h.account)}</div><div class="what">Deine Antwort</div><div class="body">${esc(h.text)}</div></div>`);
   else if(h.type==='ooo')items.push(`<div class="tl-item"><div class="when">${dt(h.at)}</div><div class="what">Abwesenheitsnotiz – Sequenz läuft weiter</div><div class="body">${esc(h.text)}</div></div>`);
   else if(h.type==='bounce')items.push(`<div class="tl-item"><div class="when">${dt(h.at)}</div><div class="what" style="color:var(--bad)">Bounce – Adresse nicht zustellbar</div><div class="cell-sub">Automatisch auf die Sperrliste gesetzt.</div></div>`);
   else if(h.type==='unsub')items.push(`<div class="tl-item"><div class="when">${dt(h.at)}</div><div class="what" style="color:var(--bad)">Abgemeldet</div><div class="body">${esc(h.text)}</div></div>`);
   else items.push(`<div class="tl-item"><div class="when">${dt(h.at)}</div><div class="what" style="color:var(--warn)">${h.type==='error'?'Fehler':'Gestoppt'}</div><div class="cell-sub">${esc(h.text)}</div></div>`)});
  if(e.status==='active'&&e.nextAt)items.push(`<div class="tl-item plan"><div class="when">geplant</div><div class="what">${esc(e.step===0?'Mail 1':'Follow-up '+e.step)} ab ${dday(e.nextAt)}</div><div class="cell-sub">Wird nur gesendet, wenn bis dahin keine Antwort kommt.</div></div>`);
 });
 if(!j.enroll.length)items.push(`<div class="tl-item plan"><div class="what">Noch in keiner Kampagne</div><div class="cell-sub">Füge die Liste „${esc(l.list||'')}“ einer Kampagne hinzu.</div></div>`);
 const canStop=j.enroll.some(e=>e.status==='pending'||e.status==='active');
 $('#panel').innerHTML=`<div class="panel-h">${av(name,46)}<div style="flex:1;min-width:0"><b style="font-size:16px">${esc(name)}</b><div class="cell-sub">${esc(l.company||'')}${l.city?' · '+esc(l.city):''}</div>${l.blocked?'<div style="margin-top:8px"><span class="badge b-bad">Auf der Sperrliste</span></div>':''}</div><button class="x" data-act="closePanel">${ic('x')}</button></div>
 <div class="panel-b"><div class="grid g2" style="gap:10px;margin-bottom:22px;font-size:12.5px"><div><div class="faint">E-Mail</div><div style="word-break:break-all">${esc(l.email)}</div></div><div><div class="faint">Telefon</div><div>${esc(l.phone||'—')}</div></div><div><div class="faint">Liste</div><div>${esc(l.list||'—')}</div></div><div><div class="faint">Herkunft</div><div>${esc(l.source||'—')}, ${new Date(l.createdAt).toLocaleDateString('de-AT')}</div></div></div>
 <h4 style="font-size:12px;margin-bottom:14px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">Verlauf</h4><div class="tline">${items.join('')}</div>
 <div class="row gap mt" style="flex-wrap:wrap">${canStop?`<button class="btn sm" data-act="stopLead" data-id="${l.id}">${ic('pause')}Sequenz stoppen</button>`:''}${l.blocked?'':`<button class="btn sm ghost danger" data-act="blockLead" data-id="${l.id}">${ic('shield')}Sperren</button>`}<button class="btn sm ghost danger" data-act="delLead" data-id="${l.id}">${ic('trash')}Löschen</button></div></div>`;
}
function closePanel(){$('#panel').classList.remove('open');$('#panelBg').classList.remove('open')}

/* ================= Modals ================= */
function modal(html,wide){$('#modal').className='modal'+(wide?' wide':'');$('#modal').innerHTML=html;$('#modalBg').classList.add('open')}
function closeModal(){$('#modalBg').classList.remove('open')}
const modalOpen=()=>$('#modalBg').classList.contains('open');
const mh=(t,p)=>`<div class="modal-h"><div><h2>${t}</h2>${p?`<p>${p}</p>`:''}</div><button class="x" data-act="closeModal">${ic('x')}</button></div>`;
const resBox=(kind,html)=>`<div class="result ${kind}">${ics(kind==='ok'?'check':kind==='err'?'alert':'info',16,2.2)}<div>${html}</div></div>`;
let confirmFn=null;
function confirmModal(title,text,yes,fn,danger=true){confirmFn=fn;modal(`${mh(title)}<div class="modal-b"><p class="muted">${text}</p></div><div class="modal-f"><button class="btn ghost" data-act="closeModal">Abbrechen</button><button class="btn ${danger?'danger':'primary'}" data-act="confirmYes">${yes}</button></div>`)}
let promptFn=null;
function promptModal(title,label,value,fn){promptFn=fn;modal(`${mh(title)}<div class="modal-b"><div class="field"><label>${label}</label><input class="input" id="promptIn" value="${esc(value||'')}"></div></div><div class="modal-f"><button class="btn ghost" data-act="closeModal">Abbrechen</button><button class="btn primary" data-act="promptYes">Speichern</button></div>`);setTimeout(()=>$('#promptIn')?.select(),50)}

const PROV={google:{l:'Google / Workspace',smtp:'smtp.gmail.com',sp:465,imap:'imap.gmail.com',ip:993},microsoft:{l:'Microsoft 365 / Outlook',smtp:'smtp.office365.com',sp:587,imap:'outlook.office365.com',ip:993},other:{l:'Andere',smtp:'',sp:465,imap:'',ip:993}};
let connProv='google';
function connectModal(email,name){
 const p=PROV[connProv];
 modal(`${mh('E-Mail-Konto verbinden','Mit E-Mail-Adresse und App-Passwort – dauert 2 Minuten.')}<div class="modal-b">
 <div class="field"><label>Anbieter</label><div class="seg">${Object.entries(PROV).map(([k,v])=>`<button class="${connProv===k?'on':''}" data-act="prov" data-k="${k}">${v.l}</button>`).join('')}</div></div>
 <div class="grid g2" style="gap:12px"><div class="field"><label>E-Mail-Adresse</label><input class="input" id="cEmail" placeholder="izy@astravagand.com" value="${esc(email||'')}"></div><div class="field"><label>Absendername</label><input class="input" id="cName" placeholder="Izy Sinani" value="${esc(name||C.accounts[0]?.name||'')}"></div></div>
 <div class="field"><label class="row" style="justify-content:space-between">App-Passwort <a href="#" data-act="toggleHowto" style="font-weight:600">Wo finde ich das?</a></label><input class="input" id="cPass" type="password" placeholder="xxxx xxxx xxxx xxxx" autocomplete="new-password"><span class="hint">Nicht dein normales Passwort. Wird verschlüsselt auf deinem Mac gespeichert.</span></div>
 <div class="howto" id="howto" style="display:none"><b style="display:block;margin-bottom:6px">${connProv==='microsoft'?'App-Passwort bei Microsoft':'App-Passwort bei Google erstellen'}</b><ol>
 ${connProv==='microsoft'?'<li>Bei <b>account.microsoft.com</b> → <b>Sicherheit</b> anmelden.</li><li><b>Bestätigung in zwei Schritten</b> einschalten.</li><li>Unter <b>App-Kennwörter</b> ein neues erstellen und hier einfügen.</li><li>Bei Firmenkonten muss der Admin „SMTP AUTH“ erlauben.</li>':'<li>Öffne <b>myaccount.google.com</b> → <b>Sicherheit</b>.</li><li>Schalte die <b>Bestätigung in zwei Schritten</b> ein.</li><li>Öffne <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener">myaccount.google.com/apppasswords</a>, Name „Outreach“, <b>Erstellen</b>.</li><li>Kopiere das 16-stellige Passwort hierher – du siehst es nur einmal.</li><li>Option fehlt? Im <b>Admin-Konto</b> (admin.google.com) unter Sicherheit → Authentifizierung die Bestätigung in zwei Schritten erlauben.</li>'}</ol></div>
 <details ${connProv==='other'?'open':''} style="margin-bottom:6px"><summary class="muted" style="cursor:pointer;font-size:12.5px;font-weight:600">Serverdaten ${connProv!=='other'?'(automatisch ausgefüllt)':''}</summary><div class="grid g2" style="gap:12px;margin-top:12px"><div class="field"><label>SMTP-Server</label><input class="input" id="cSmtp" value="${p.smtp}"></div><div class="field"><label>Port (465 = SSL, 587 = STARTTLS)</label><input class="input" id="cSport" value="${p.sp}"></div><div class="field"><label>IMAP-Server</label><input class="input" id="cImap" value="${p.imap}"></div><div class="field"><label>Port</label><input class="input" id="cIport" value="${p.ip}"></div></div></details>
 <div id="connResult"></div></div>
 <div class="modal-f"><button class="btn ghost" data-act="closeModal">Abbrechen</button><button class="btn" data-act="connTest" id="connTestBtn">${ic('bolt')}Verbindung testen</button><button class="btn primary" data-act="connSave" id="connSaveBtn">Konto speichern</button></div>`);
}
function connPayload(){return{provider:connProv,email:$('#cEmail').value.trim(),name:$('#cName').value.trim(),password:$('#cPass').value,smtpHost:$('#cSmtp').value.trim(),smtpPort:+$('#cSport').value,imapHost:$('#cImap').value.trim(),imapPort:+$('#cIport').value}}
async function connRun(save){
 const b=connPayload(),res=$('#connResult'),btn=save?$('#connSaveBtn'):$('#connTestBtn'),old=btn.innerHTML;
 if(!b.email||!b.password){res.innerHTML=resBox('err','Bitte E-Mail-Adresse und App-Passwort eingeben.');return}
 btn.disabled=true;btn.innerHTML=spinner+(save?'Speichere …':'Teste …');res.innerHTML='';
 const j=await post('/api/accounts',{...b,testOnly:!save});btn.disabled=false;btn.innerHTML=old;
 if(!j.ok){res.innerHTML=resBox('err',`<b>Verbindung fehlgeschlagen.</b><br><span class="muted">${esc(j.error)}</span><br><span class="muted">Häufigste Ursache: normales Passwort statt App-Passwort, oder die Bestätigung in zwei Schritten ist aus.</span>`);return}
 if(!save){res.innerHTML=resBox('ok',`<b>Senden klappt.</b> ${j.imapError?`<br><span style="color:var(--warn)">Antworten abrufen (IMAP) klappt nicht: ${esc(j.imapError)}</span>`:'<br><span class="muted">Antworten abrufen (IMAP) klappt auch.</span>'}`);return}
 closeModal();await refresh();S.view='accounts';render();toast(`Konto gespeichert – Warm-up startet mit ${warmLimit(1)} Mails/Tag`);if(j.imapError)toast('IMAP: '+j.imapError,'warn');
}
function accMenu(a){
 modal(`${mh(esc(a.email),'Konto verwalten')}<div class="modal-b">
 <div class="field"><label>Absendername</label><input class="input" id="aName" value="${esc(a.name||'')}"></div>
 <div class="field"><label>Maximal pro Tag (nach dem Warm-up)</label><input class="input" type="number" id="aMax" min="1" max="200" value="${a.maxPerDay}"><span class="hint">Empfohlen: 30–50. Mehr erhöht das Sperr-Risiko.</span></div>
 <div style="padding:6px 0 14px"><div class="toggle ${a.warmup?'on':''}" data-act="toggleOnly" id="aWarm"><span class="sw"></span>Automatisches Warm-up (Limit steigt über 4 Wochen)</div></div>
 <div class="callout">${ic('info')}<div>Tag ${a.day} · heute ${a.sentToday} von ${a.limit} · insgesamt ${a.totalSent} gesendet${a.lastImapAt?` · Antworten zuletzt geprüft ${dt(a.lastImapAt)}`:''}</div></div>
 <div class="row gap mt" style="flex-wrap:wrap"><button class="btn sm" data-act="accTest" data-id="${a.id}">${ic('bolt')}Verbindung testen</button><button class="btn sm" data-act="dnsCheck" data-id="${a.id}">${ic('shield')}DNS prüfen</button><button class="btn sm" data-act="accPause" data-id="${a.id}">${a.status==='paused'?ic('play')+'Fortsetzen':ic('pause')+'Pausieren'}</button>${a.authType==='gworkspace'?'':`<button class="btn sm" data-act="connect" data-email="${esc(a.email)}">${ic('key')}App-Passwort ändern</button>`}<button class="btn sm ghost danger" data-act="accDel" data-id="${a.id}">${ic('trash')}Entfernen</button></div><div id="accRes"></div></div>
 <div class="modal-f"><button class="btn ghost" data-act="closeModal">Schließen</button><button class="btn primary" data-act="accSave" data-id="${a.id}">Speichern</button></div>`);
}
function testMailModal(){
 const c=camp();const steps=c?S.edit||c.steps:null;const st=steps?steps[S.step]||steps[0]:{subject:'Testmail von Astravagand Outreach',body:'Hallo {Vorname},\n\ndas ist eine Testmail. Wenn du sie siehst, funktioniert der Versand.\n\nBeste Grüße\n{Absender}'};
 const lead=curLead();const accs=okAccounts();
 if(!accs.length){modal(`${mh('Testmail senden')}<div class="modal-b">${resBox('info','Verbinde zuerst ein E-Mail-Konto.')}</div><div class="modal-f"><button class="btn primary" data-act="connect">Konto verbinden</button></div>`);return}
 const subj=renderVars(st.thread&&S.step>0&&steps?'Re: '+steps[0].subject:st.subject,lead,false);
 modal(`${mh('Testmail an dich senden',c?`Schritt „${S.step===0?'Mail 1':'Follow-up '+S.step}“ mit den Daten von ${esc(lead.company||lead.email)}`:'')}<div class="modal-b">
 <div class="field"><label>Senden von</label><select class="select" id="tFrom">${accs.map(a=>`<option value="${a.id}" ${c&&c.accounts[0]===a.id?'selected':''}>${esc(a.email)}</option>`).join('')}</select></div>
 <div class="field"><label>Senden an</label><input class="input" id="tTo" placeholder="deine@adresse.com" value="${esc(C.settings.testTo||'')}"></div>
 <div class="field"><label>Betreff</label><input class="input" id="tSubj" value="${esc('[TEST] '+subj)}"></div>
 <div class="field"><label>Text</label><textarea class="textarea" id="tBody" style="min-height:160px">${esc(renderVars(st.body,lead,false))}</textarea><span class="hint">Die Fußzeile wird automatisch angehängt.</span></div><div id="tRes"></div></div>
 <div class="modal-f"><button class="btn ghost" data-act="closeModal">Schließen</button><button class="btn primary" data-act="tSend" id="tSendBtn">${ic('send')}Testmail senden</button></div>`);
}
function lessonModal(){
 const weeks=[['Woche 1','5–10',22],['Woche 2','10–20',45],['Woche 3','20–30',70],['ab Woche 4','30–50',100]];const n=okAccounts().length;
 modal(`${mh('Warum am Anfang nur wenige Mails?','Die wichtigste Regel für Kaltakquise per E-Mail – in einer Minute erklärt.')}<div class="modal-b">
 <div class="callout" style="margin-bottom:18px">${ic('info')}<div>Google kennt dein neues Konto noch nicht. Wenn du sofort viele Mails an Fremde schickst, hält Google dich für einen Spammer: Mails landen im Spam oder das Konto wird gesperrt. <b>Deshalb steigern wir langsam.</b></div></div>
 <b style="font-size:13px">Kaltmails pro Tag und Konto</b><div class="ramp">${weeks.map(w=>`<div><b>${w[1]}</b><i style="height:${w[2]}%"></i></div>`).join('')}</div><div class="ramp-l">${weeks.map(w=>`<span>${w[0]}</span>`).join('')}</div>
 <div class="grid g2 mt2" style="gap:12px"><div class="card" style="padding:16px;box-shadow:none"><div class="row gap" style="margin-bottom:6px">${ics('rotate',17)}<b>Mehr Mails = mehr Konten</b></div><p class="muted" style="font-size:12.5px">Ein Konto zu überlasten kostet dich das Konto. Mehrere Konten teilen sich die Arbeit, das Tool wechselt automatisch.</p></div><div class="card" style="padding:16px;box-shadow:none"><div class="row gap" style="margin-bottom:6px">${ics('globe',17)}<b>Nebendomain nutzen</b></div><p class="muted" style="font-size:12.5px">z. B. astravagand-mail.com mit 2–3 Postfächern. Deine Hauptdomain bleibt sauber.</p></div></div>
 <div class="card mt" style="padding:16px 18px;box-shadow:none;background:var(--surface2)"><b style="font-size:13px">${n?`Mit deinen ${n} Konten`:'Dein Ziel'}</b><div class="grid g2" style="gap:12px;margin-top:10px"><div><div class="muted" style="font-size:12px">Heute möglich</div><div style="font-size:24px;font-weight:700">${C.kpi.capacity} Mails</div></div><div><div class="muted" style="font-size:12px">${n?'Nach dem Warm-up':'Für 200 Mails/Tag brauchst du'}</div><div style="font-size:24px;font-weight:700;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent">${n?okAccounts().reduce((s,a)=>s+a.maxPerDay,0)+' Mails':'5 Konten'}</div></div></div></div>
 </div><div class="modal-f"><button class="btn" data-act="go" data-view="accounts" data-close="1">Konto hinzufügen</button><button class="btn primary" data-act="lessonDone">Verstanden</button></div>`);
}
let welcomeData={company:'',goal:200};
function welcomeModal(step=0){
 const steps=[
  `<div style="text-align:center;padding:10px 0 4px">${logo(56)}<h2 style="font-size:22px;margin-top:16px;letter-spacing:-.02em">Willkommen bei Astravagand Outreach</h2><p class="muted" style="margin-top:6px">Drei kurze Fragen, dann zeigen wir dir alles Schritt für Schritt.</p></div><div class="field mt2"><label>Wie heißt deine Firma?</label><input class="input" id="wCompany" value="${esc(welcomeData.company||C.workspace.name)}"></div>`,
  `<h2 style="font-size:19px;margin-bottom:4px">Was ist dein Ziel?</h2><p class="muted" style="font-size:13px;margin-bottom:16px">Damit wir die Einrichtung passend vorschlagen.</p>${[['send','Eigene Kunden gewinnen','Ich verschicke Kaltakquise für meine Firma.'],['users','Für Kunden versenden','Ich betreue mehrere Kunden mit eigenen Workspaces.']].map((o,i)=>`<div class="card step ${i===0?'next':''}" data-act="pickGoal" style="padding:16px;margin-bottom:10px;box-shadow:none"><div class="prov" style="background:var(--vsoft);color:var(--violet2)">${ic(o[0])}</div><div><strong style="font-size:14px">${o[1]}</strong><span>${o[2]}</span></div></div>`).join('')}`,
  `<h2 style="font-size:19px;margin-bottom:4px">Wie viele Mails pro Tag?</h2><p class="muted" style="font-size:13px;margin-bottom:16px">Grobe Schätzung reicht – du kannst das jederzeit ändern.</p><div class="seg" style="width:100%;display:flex">${[50,100,200,500].map(v=>`<button class="${welcomeData.goal===v?'on':''}" data-act="pickVol" data-v="${v}" style="flex:1;padding:10px">${v}</button>`).join('')}</div><div class="callout mt2" id="wVolNote">${volNote(welcomeData.goal)}</div>`];
 modal(`<div class="modal-h" style="justify-content:flex-end"><div class="row gap-s">${[0,1,2].map(i=>`<span style="width:${i===step?22:8}px;height:8px;border-radius:8px;background:${i===step?'var(--violet)':'var(--surface3)'};transition:all .2s"></span>`).join('')}</div></div><div class="modal-b">${steps[step]}</div><div class="modal-f">${step>0?`<button class="btn ghost" data-act="welcome" data-s="${step-1}">Zurück</button>`:'<button class="btn ghost" data-act="welcomeSkip">Überspringen</button>'}${step<2?`<button class="btn primary" data-act="welcome" data-s="${step+1}">Weiter</button>`:`<button class="btn primary" data-act="welcomeDone">${ic('play')}Tour starten</button>`}</div>`);
}
const volNote=v=>`${ic('flame')}<div>Für <b>${v} Mails pro Tag</b> brauchst du ca. <b>${Math.ceil(v/40)} E-Mail-Konto${Math.ceil(v/40)>1?'en':''}</b> und etwa <b>4 Wochen Warm-up</b>. Warum? Das erklären wir dir gleich.</div>`;

/* CSV import */
let IMP=null;
const FIELDS=[['','– ignorieren –'],['email','E-Mail'],['first','Vorname'],['last','Nachname'],['fullname','Name (wird geteilt)'],['company','Firma'],['city','Stadt'],['industry','Branche'],['phone','Telefon']];
function guessField(h){h=h.toLowerCase().trim();if(/e-?mail|^mail/.test(h))return'email';if(/vorname|first/.test(h))return'first';if(/nachname|last|surname|familienname/.test(h))return'last';if(/firma|company|unternehmen|organisation|organization|business|betrieb/.test(h))return'company';if(/stadt|^ort|city|location|gemeinde/.test(h))return'city';if(/branche|industry|kategorie|category/.test(h))return'industry';if(/telefon|phone|^tel/.test(h))return'phone';if(/^name$|kontakt|ansprech|person/.test(h))return'fullname';return''}
function parseCSV(text){text=text.replace(/^﻿/,'');const first=text.split(/\r?\n/)[0]||'';const delim=[';',',','\t'].sort((a,b)=>first.split(b).length-first.split(a).length)[0];const rows=[];let row=[],cur='',q=false;
 for(let i=0;i<text.length;i++){const ch=text[i];if(q){if(ch==='"'){if(text[i+1]==='"'){cur+='"';i++}else q=false}else cur+=ch}else if(ch==='"')q=true;else if(ch===delim){row.push(cur);cur=''}else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cur);rows.push(row);row=[];cur=''}else cur+=ch}
 if(cur||row.length){row.push(cur);rows.push(row)}return rows.filter(r=>r.some(c=>c.trim()))}
function importModal(){
 IMP=null;
 modal(`${mh('Leads importieren','CSV-Datei – die Spalten werden automatisch erkannt.')}<div class="modal-b" id="impBody">
 <label class="drop" style="display:block;cursor:pointer" id="dropZone">${ic('upload')}<div><b>CSV-Datei hierher ziehen</b> oder <span style="color:var(--violet2)">auswählen</span></div><div class="muted" style="font-size:12px;margin-top:4px">.csv mit Komma oder Semikolon · Aus Excel: Datei → Speichern unter → CSV UTF-8</div><input type="file" id="impFile" accept=".csv,.txt,text/csv" style="display:none"></label>
 <div class="muted" style="font-size:12px;margin-top:12px">Pflicht ist nur eine Spalte mit der E-Mail-Adresse. Duplikate, ungültige Adressen und gesperrte Kontakte werden automatisch aussortiert.</div></div>
 <div class="modal-f" id="impFoot"><button class="btn ghost" data-act="closeModal">Abbrechen</button></div>`,true);
 const inp=$('#impFile'),dz=$('#dropZone');
 inp.addEventListener('change',()=>inp.files[0]&&readImport(inp.files[0]));
 dz.addEventListener('dragover',e=>{e.preventDefault();dz.style.borderColor='var(--violet2)'});dz.addEventListener('dragleave',()=>dz.style.borderColor='');
 dz.addEventListener('drop',e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)readImport(f)});
}
function readImport(file){
 if(/\.xlsx?$/i.test(file.name)){toast('Bitte in Excel als „CSV UTF-8“ speichern und die CSV importieren','warn');return}
 const r=new FileReader();r.onload=()=>{const rows=parseCSV(String(r.result));if(rows.length<2){toast('Datei ist leer oder hat keine Kopfzeile','bad');return}
  IMP={file:file.name,head:rows[0],rows:rows.slice(1),map:rows[0].map(guessField)};drawImport()};r.readAsText(file,'utf-8');
}
function drawImport(){
 const ex=IMP.rows[0]||[];const listName=IMP.file.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ');
 $('#impBody').innerHTML=`<div class="row gap" style="margin-bottom:12px"><span class="badge b-good">✓</span><b>${esc(IMP.file)}</b><span class="muted" style="font-size:12.5px">· ${IMP.rows.length} Zeilen</span><button class="btn sm ghost" style="margin-left:auto" data-act="import">Andere Datei</button></div>
 <div style="max-height:300px;overflow:auto" class="card"><table class="table"><thead><tr><th>Spalte in deiner Datei</th><th>Wird zu</th><th>Beispiel</th></tr></thead><tbody>
 ${IMP.head.map((h,i)=>`<tr><td><code style="font-size:12px">${esc(h)}</code></td><td><select class="select" data-impmap="${i}" style="padding:6px 30px 6px 10px;font-size:12.5px">${FIELDS.map(([k,l])=>`<option value="${k}" ${IMP.map[i]===k?'selected':''}>${l}</option>`).join('')}</select></td><td class="muted" style="font-size:12.5px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(ex[i]||'')}</td></tr>`).join('')}</tbody></table></div>
 <div class="grid g2 mt" style="gap:12px"><div class="field"><label>In Liste</label><select class="select" id="impList"><option value="new">Neue Liste …</option>${C.lists.map(l=>`<option value="${l.id}" ${S.leadList===l.id?'selected':''}>${esc(l.name)}</option>`).join('')}</select></div><div class="field" id="impNameF"><label>Name der neuen Liste</label><input class="input" id="impName" value="${esc(listName)}"></div></div><div id="impRes"></div>`;
 $('#impFoot').innerHTML=`<button class="btn ghost" data-act="closeModal">Abbrechen</button><button class="btn primary" data-act="importRun" id="impBtn">${ic('upload',2)}${IMP.rows.length} Zeilen importieren</button>`;
 $('#impList').addEventListener('change',e=>{$('#impNameF').style.display=e.target.value==='new'?'':'none'});
 if(S.leadList!=='all'&&C.lists.some(l=>l.id===S.leadList))$('#impNameF').style.display='none';
}
async function importRun(){
 if(!IMP.map.includes('email')){$('#impRes').innerHTML=resBox('err','Bitte eine Spalte als <b>E-Mail</b> zuordnen.');return}
 const rows=IMP.rows.map(r=>{const o={};IMP.map.forEach((k,i)=>{if(k)o[k]=(r[i]||'').trim()});if(o.fullname&&!o.first&&!o.last){const p=o.fullname.replace(/^(herr|frau|dr\.?|mag\.?|ing\.?|di)\s+/ig,'').split(/\s+/);o.first=p.length>1?p.slice(0,-1).join(' '):'';o.last=p.length>1?p.at(-1):p[0]}delete o.fullname;return o});
 const btn=$('#impBtn');btn.disabled=true;btn.innerHTML=spinner+'Importiere & prüfe Adressen …';
 const j=await post('/api/import',{rows,listId:$('#impList').value,listName:$('#impName').value,fileName:IMP.file});
 btn.disabled=false;btn.innerHTML=ic('upload',2)+'Importieren';
 if(!j.ok){$('#impRes').innerHTML=resBox('err',esc(j.error));return}
 await refresh(false);S.leadList=j.listId;
 $('#impBody').innerHTML=`<div class="checks"><div class="checkrow"><span class="ci ok">✓</span><b>${j.imported} Leads importiert</b></div>${j.role?`<div class="checkrow"><span class="ci wa">–</span>${j.role} davon Sammeladressen (office@, info@ …) – funktionieren, antworten aber seltener</div>`:''}${j.duplicates?`<div class="checkrow"><span class="ci wa">–</span>${j.duplicates} Duplikate übersprungen</div>`:''}${j.invalid?`<div class="checkrow"><span class="ci no">!</span>${j.invalid} ungültige Adressen aussortiert (Format oder Domain existiert nicht)</div>`:''}${j.missing?`<div class="checkrow"><span class="ci wa">–</span>${j.missing} Zeilen ohne E-Mail übersprungen</div>`:''}${j.blocked?`<div class="checkrow"><span class="ci wa">–</span>${j.blocked} stehen auf der Sperrliste</div>`:''}</div>`;
 $('#impFoot').innerHTML=`<button class="btn" data-act="closeModal" data-then="leads">Zu den Leads</button><button class="btn primary" data-act="newCampaign">${ic('send')}Kampagne mit dieser Liste</button>`;
}
function newCampaignModal(){
 const seq=C.templates.filter(t=>t.type==='seq');
 modal(`${mh('Neue Kampagne','Name, Lead-Liste und Vorlage – Texte passt du danach an.')}<div class="modal-b">
 <div class="field"><label>Name</label><input class="input" id="ncName" placeholder="z. B. Reinigungsfirmen Linz"></div>
 <div class="field"><label>Lead-Listen</label>${C.lists.length?`<div class="row gap-s" style="flex-wrap:wrap">${C.lists.map(l=>`<span class="daychip ${S.leadList===l.id?'on':''}" style="width:auto;padding:0 12px" data-act="toggleOnly" data-list="${l.id}">${esc(l.name)} · ${l.count}</span>`).join('')}</div>`:`<div class="muted" style="font-size:12.5px">Noch keine Listen – du kannst später Leads importieren.</div>`}</div>
 <div class="field"><label>Startet mit Vorlage</label><select class="select" id="ncTpl">${seq.map(t=>`<option value="${t.id}">${esc(t.name)} (${t.steps.length} Schritte)</option>`).join('')}<option value="">Standard – 3 Schritte</option></select></div></div>
 <div class="modal-f"><button class="btn ghost" data-act="closeModal">Abbrechen</button><button class="btn primary" data-act="ncCreate">Erstellen</button></div>`);
 setTimeout(()=>$('#ncName')?.focus(),50);
}
async function startCheckModal(){
 const c=camp();modal(`${mh('Bereit zum Start?','Der Sicherheitscheck schützt deine Konten.')}<div class="modal-b"><div class="empty">${spinner}</div></div>`);
 await patch(`/api/campaigns/${c.id}`,{steps:S.edit});
 const j=await get(`/api/campaigns/${c.id}/check`);const rows=j.checks||[];const blocked=rows.some(r=>r.level==='error');
 modal(`${mh('Bereit zum Start?','Der Sicherheitscheck schützt deine Konten.')}<div class="modal-b"><div class="checks">${rows.map(r=>`<div class="checkrow" style="padding:5px 0"><span class="ci ${r.level==='ok'?'ok':r.level==='warn'?'wa':'no'}">${r.level==='ok'?'✓':r.level==='warn'?'–':'!'}</span><span>${esc(r.text)}</span></div>`).join('')}</div>
 ${blocked?resBox('err','Die Kampagne kann erst starten, wenn alle roten Punkte behoben sind.'):resBox('ok',`Alles bereit. Der Versand startet im nächsten Zeitfenster (${c.schedule.from}–${c.schedule.to}) und läuft, solange das Programm-Fenster offen ist.`)}</div>
 <div class="modal-f"><button class="btn ghost" data-act="closeModal">Schließen</button>${blocked?'':`<button class="btn primary" data-act="startCamp">${ic('play')}Jetzt starten</button>`}</div>`);
}

/* ================= Tour ================= */
const TOUR=[['[data-tour="nav-overview"]','Übersicht','Hier siehst du jeden Morgen, was gestern passiert ist und was heute rausgeht.','overview'],['[data-tour="checklist"]','Deine Start-Checkliste','Arbeite die Punkte von links nach rechts ab. Jeder Klick bringt dich an die richtige Stelle.','overview'],['[data-tour="kpis"]','Die wichtigsten Zahlen','Achte vor allem auf die Antwortrate und die Bounce-Rate. Über 3 % Bounces ist ein Warnsignal.','overview'],['[data-tour="capacity"]','Kapazität & Warm-up','So viele Mails schaffen deine Konten heute. Neue Konten steigern sich jeden Tag automatisch.','overview'],['[data-tour="connect"]','Konten verbinden','Füge hier deine E-Mail-Konten mit App-Passwort hinzu. Mehr Konten = mehr Mails pro Tag.','accounts'],['[data-tour="calc"]','Kapazitäts-Rechner','Gib dein Ziel ein und sieh sofort, wie viele Konten du brauchst.','accounts'],['[data-tour="import"]','Leads importieren','Lade deine Kontakte als CSV hoch. Ungültige Adressen und Duplikate werden automatisch aussortiert.','leads'],['[data-tour="timeline"]','Deine Sequenz','Mail 1 und die Follow-ups mit Wartezeiten. Antwortet jemand, stoppt alles automatisch.','camp'],['[data-tour="vars"]','Variablen','Klick auf eine Variable, um sie einzufügen. Die Vorschau zeigt sofort, wie die Mail beim Lead aussieht.','camp'],['[data-tour="help"]','Hilfe ist immer da','Die Tour kannst du hier jederzeit neu starten. Viel Erfolg!','overview']];
let tourI=-1;
function tour(i){
 tourI=i;document.querySelectorAll('.tour-hl,.tour-tip').forEach(e=>e.remove());if(i<0||i>=TOUR.length){tourI=-1;return}
 const[sel,t,p,view]=TOUR[i];
 if(view==='camp'){if(!C.campaigns.length)return tour(i+1);if(S.view!=='campaigns'||!S.camp||S.campTab!=='sequence'){S.view='campaigns';S.camp=S.camp||C.campaigns[0].id;S.campTab='sequence';render()}}
 else if(S.view!==view){S.view=view;S.camp=null;render()}
 const el=document.querySelector(sel);if(!el)return tour(i+1);
 el.scrollIntoView({block:'center'});
 requestAnimationFrame(()=>{const r=el.getBoundingClientRect(),pad=6;const hl=document.createElement('div');hl.className='tour-hl';Object.assign(hl.style,{left:r.left-pad+'px',top:r.top-pad+'px',width:r.width+pad*2+'px',height:r.height+pad*2+'px'});document.body.appendChild(hl);
  const tip=document.createElement('div');tip.className='tour-tip';tip.innerHTML=`<div class="stp">Schritt ${i+1} von ${TOUR.length}</div><h4>${t}</h4><p>${p}</p><div class="row"><button class="btn sm ghost" data-act="tourEnd">Überspringen</button><div class="row gap-s">${i>0?`<button class="btn sm" data-act="tourGo" data-i="${i-1}">Zurück</button>`:''}<button class="btn sm primary" data-act="tourGo" data-i="${i+1}">${i===TOUR.length-1?'Fertig':'Weiter'}</button></div></div>`;
  document.body.appendChild(tip);const tw=320,th=tip.offsetHeight;let x=r.right+16,y=r.top;if(x+tw>innerWidth-16){x=Math.min(Math.max(16,r.left),innerWidth-tw-16);y=r.bottom+14;if(y+th>innerHeight-16)y=r.top-th-14}y=Math.max(16,Math.min(y,innerHeight-th-16));Object.assign(tip.style,{left:x+'px',top:y+'px'})});
}

/* ================= Render ================= */
function render(keepScroll){
 if(!C)return;const sc=$('#content').scrollTop;renderSide();renderTop();
 if(S.view!=='campaigns'||!S.camp){S.editId=null}
 $('#content').innerHTML=V[S.view]();$('#content').scrollTop=keepScroll?sc:0;
 document.querySelectorAll('[data-i]').forEach(e=>{if(e.tagName==='SPAN'&&I[e.dataset.i]&&!e.innerHTML)e.innerHTML=ic(e.dataset.i)});
 if(S.view==='accounts')calc();if(S.view==='leads'&&C.leadsCount)loadLeads();if(S.view==='inbox')loadInbox();
}
async function refresh(full=true){const ok=await load();if(ok&&full)render(true);else if(ok){renderSide();renderTop()}}
function go(v){S.view=v;if(v!=='campaigns')S.camp=null;closePanel();tour(-1);render()}
async function patchOnb(o){await patch('/api/settings',{onb:o});await refresh(false)}

/* ================= Actions ================= */
const A={
 go:d=>{if(d.close)closeModal();go(d.view)},
 theme:()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;store.set('theme',t);render(true)},
 setTheme:d=>{document.documentElement.dataset.theme=d.t;store.set('theme',d.t);render(true)},
 openCamp:d=>{closeModal();S.view='campaigns';S.camp=d.id;S.campTab='sequence';render()},
 backCamps:()=>{S.camp=null;render()},
 campTab:async d=>{S.campTab=d.k;if(d.k==='leads'){S.campRows=null;render();loadPrevLeads(camp())}else render()},
 selStep:d=>{S.step=+d.i;render(true)},
 addStep:()=>{S.edit.push({name:'',wait:4,thread:true,subject:'',body:'Hallo {Vorname},\n\n\n\nBeste Grüße\n{Absender}'});S.step=S.edit.length-1;saveSteps();render(true)},
 delStep:()=>confirmModal('Schritt löschen?',`${'Follow-up '+S.step} wird entfernt. Leads, die diesen Schritt noch nicht bekommen haben, überspringen ihn.`,'Löschen',()=>{S.edit.splice(S.step,1);S.step=Math.max(0,S.step-1);saveSteps();render(true)}),
 toggleThread:()=>{const st=S.edit[S.step];st.thread=!st.thread;if(!st.thread&&!st.subject)st.subject='Noch eine Idee für {Firma}';saveSteps();render(true)},
 insVar:d=>{const ta=$('#bodyTa');const t=`{${d.v}}`;const s=ta.selectionStart??ta.value.length;ta.value=ta.value.slice(0,s)+t+ta.value.slice(ta.selectionEnd??s);ta.focus();ta.selectionStart=ta.selectionEnd=s+t.length;S.edit[S.step].body=ta.value;refreshPreview();saveSteps()},
 loadTpl:()=>{const ts=C.templates.filter(t=>t.type==='mail');modal(`${mh('Vorlage laden','Text in diesen Schritt übernehmen')}<div class="modal-b">${ts.length?ts.map(t=>`<div class="card tpl" data-act="pickTpl" data-id="${t.id}" style="margin-bottom:10px;box-shadow:none"><h4 style="margin-top:0">${esc(t.name)}</h4><p>${esc(t.body)}</p></div>`).join(''):'<div class="empty">Noch keine Mail-Vorlagen.</div>'}</div>`)},
 pickTpl:d=>{const t=C.templates.find(x=>x.id===d.id);const st=S.edit[S.step];st.body=t.body;if(t.subject&&(!st.thread||S.step===0))st.subject=t.subject;closeModal();saveSteps();render(true);toast('Vorlage übernommen')},
 saveTpl:()=>promptModal('Als Vorlage speichern','Name der Vorlage','',async name=>{const st=S.edit[S.step];await post('/api/templates',{type:'mail',name,subject:st.thread&&S.step>0?'':st.subject,body:st.body});await refresh(false);toast('Vorlage gespeichert')}),
 useTpl:async(d,el,e)=>{if(e.target.closest('[data-act="delTpl"]'))return;const t=C.templates.find(x=>x.id===d.id);if(t.type==='seq'){const j=await post('/api/campaigns',{name:t.name,templateId:t.id,lists:[]});await refresh(false);A.openCamp({id:j.id});toast('Kampagne aus Vorlage erstellt')}else toast('Öffne eine Kampagne und nutze „Aus Vorlage laden“','warn')},
 delTpl:(d,el,e)=>{e.stopPropagation();confirmModal('Vorlage löschen?','Die Vorlage wird entfernt.','Löschen',async()=>{await del('/api/templates/'+d.id);await refresh()})},
 newTpl:()=>{modal(`${mh('Neue Vorlage')}<div class="modal-b"><div class="field"><label>Name</label><input class="input" id="ntName"></div><div class="field"><label>Betreff (optional)</label><input class="input" id="ntSubj"></div><div class="field"><label>Text</label><textarea class="textarea" id="ntBody">Hallo {Vorname},\n\n\n\nBeste Grüße\n{Absender}</textarea></div></div><div class="modal-f"><button class="btn ghost" data-act="closeModal">Abbrechen</button><button class="btn primary" data-act="ntSave">Speichern</button></div>`)},
 ntSave:async()=>{const name=$('#ntName').value.trim();if(!name)return toast('Bitte einen Namen eingeben','warn');await post('/api/templates',{type:'mail',name,subject:$('#ntSubj').value,body:$('#ntBody').value});closeModal();await refresh();toast('Vorlage gespeichert')},
 openLead:d=>openLead(d.id),closePanel,
 stopLead:async d=>{await post(`/api/leads/${d.id}/stop`);await openLead(d.id);refresh(false);toast('Sequenz gestoppt','warn')},
 blockLead:d=>confirmModal('Kontakt sperren?','Dieser Kontakt kommt auf die Sperrliste und wird nie wieder angeschrieben.','Sperren',async()=>{await post(`/api/leads/${d.id}/block`);closePanel();await refresh();toast('Gesperrt','warn')}),
 delLead:d=>confirmModal('Lead löschen?','Der Kontakt wird aus der Liste entfernt.','Löschen',async()=>{await del('/api/leads/'+d.id);closePanel();await refresh();toast('Gelöscht','warn')}),
 leadList:d=>{S.leadList=d.k;render()},leadStatus:d=>{S.leadStatus=d.k;render(true)},blockTab:()=>{S.settingsTab='block';go('settings')},
 renameList:d=>{const l=C.lists.find(x=>x.id===d.id);promptModal('Liste umbenennen','Name',l.name,async n=>{await patch('/api/lists/'+d.id,{name:n});await refresh()})},
 delList:d=>{const l=C.lists.find(x=>x.id===d.id);confirmModal('Liste löschen?',`„${esc(l.name)}“ mit ${l.count} Leads wird gelöscht.`,'Löschen',async()=>{const j=await del('/api/lists/'+d.id);if(!j.ok)return toast(j.error,'bad');S.leadList='all';await refresh()})},
 inboxCat:d=>{S.inboxCat=d.k;S.inboxSel=null;render(true)},
 inboxSel:async d=>{S.inboxSel=d.id;const m=S.inbox.find(x=>x.id===d.id);drawInbox();if(m&&!m.read){m.read=true;await patch('/api/inbox/'+d.id,{read:true});refresh(false);drawInbox()}},
 setCat:async d=>{const m=S.inbox.find(x=>x.id===S.inboxSel);m.cat=d.k;await patch('/api/inbox/'+m.id,{cat:d.k});await refresh(false);drawInbox();toast('Kategorie geändert')},
 sendReply:async()=>{const t=$('#replyTa').value.trim();if(!t)return toast('Bitte zuerst eine Antwort schreiben','warn');const b=$('#replyBtn');b.disabled=true;b.innerHTML=spinner+'Sende …';const j=await post(`/api/inbox/${S.inboxSel}/reply`,{text:t});if(j.ok){toast('Antwort gesendet');loadInbox()}else{b.disabled=false;b.innerHTML=ic('reply')+'Antworten';toast(j.error,'bad')}},
 checkMail:async(d,el)=>{el.disabled=true;el.innerHTML=spinner+'Rufe ab …';await post('/api/inbox/check');await refresh();toast('Postfächer geprüft')},
 connect:d=>{const a=C.accounts.find(x=>x.email===d.email);connProv=a?(a.provider==='microsoft'?'microsoft':a.provider==='google'?'google':'other'):'google';connectModal(d.email,a?.name)},
 prov:d=>{const e=$('#cEmail').value,n=$('#cName').value;connProv=d.k;connectModal(e,n)},
 toggleHowto:()=>{const h=$('#howto');h.style.display=h.style.display==='none'?'block':'none'},
 connTest:()=>connRun(false),connSave:()=>connRun(true),
 accMenu:d=>accMenu(accById(d.id)),
 accSave:async d=>{await patch('/api/accounts/'+d.id,{name:$('#aName').value,maxPerDay:+$('#aMax').value,warmup:$('#aWarm').classList.contains('on')});closeModal();await refresh();toast('Gespeichert')},
 accTest:async(d,el)=>{el.disabled=true;el.innerHTML=spinner+'Teste …';const j=await post(`/api/accounts/${d.id}/test`);el.disabled=false;el.innerHTML=ic('bolt')+'Verbindung testen';const r=$('#accRes');const h=j.ok?resBox('ok','Verbindung ok.'+(j.imapError?` <span style="color:var(--warn)">IMAP: ${esc(j.imapError)}</span>`:'')):resBox('err',esc(j.error));if(r)r.innerHTML=h;else toast(j.ok?'Verbindung ok':j.error,j.ok?'good':'bad');refresh()},
 dnsCheck:async(d,el)=>{el.disabled=true;const j=await post(`/api/accounts/${d.id}/dns`);el.disabled=false;const r=$('#accRes');if(j.ok){const t=['spf','dkim','dmarc'].map(k=>`${k.toUpperCase()} ${j.dns[k]?'✓':'✗'}`).join(' · ');if(r)r.innerHTML=resBox(j.dns.spf&&j.dns.dkim&&j.dns.dmarc?'ok':'info',t+(j.dns.dmarc?'':'<br><span class="muted">DMARC fehlt: TXT-Eintrag <code>_dmarc</code> mit <code>v=DMARC1; p=none; rua=mailto:deine@adresse</code> beim Domain-Anbieter anlegen.</span>'));else toast('DNS: '+t)}refresh()},
 accPause:async d=>{const a=accById(d.id);await patch('/api/accounts/'+d.id,{paused:a.status!=='paused'});closeModal();await refresh();toast(a.status==='paused'?'Konto fortgesetzt':'Konto pausiert','warn')},
 accDel:d=>confirmModal('Konto entfernen?','Das Konto wird aus allen Kampagnen entfernt. Bisherige Statistiken bleiben.','Entfernen',async()=>{await del('/api/accounts/'+d.id);await refresh();toast('Konto entfernt','warn')}),
 testmail:()=>testMailModal(),
 tSend:async()=>{const to=$('#tTo').value.trim(),res=$('#tRes'),btn=$('#tSendBtn');if(!/^\S+@\S+\.\S+$/.test(to)){res.innerHTML=resBox('err','Bitte eine gültige Empfänger-Adresse eingeben.');return}btn.disabled=true;btn.innerHTML=spinner+'Sende …';
  const j=await post('/api/test-send',{accountId:$('#tFrom').value,to,subject:$('#tSubj').value,text:$('#tBody').value});btn.disabled=false;btn.innerHTML=ic('send')+'Testmail senden';
  res.innerHTML=j.ok?resBox('ok',`<b>Gesendet!</b> Schau in dein Postfach (${esc(to)}) – auch im Spam-Ordner.`):resBox('err',`<b>Senden fehlgeschlagen.</b><br><span class="muted">${esc(j.error)}</span>`);if(j.ok)refresh(false)},
 lesson:()=>lessonModal(),lessonDone:async()=>{closeModal();await patchOnb({lesson:true});render(true)},
 help:()=>modal(`${mh('Hilfe-Center','Kurz erklärt')}<div class="modal-b">${[['App-Passwort bei Google','Google-Konto → Sicherheit → Bestätigung in zwei Schritten einschalten → myaccount.google.com/apppasswords → Passwort erstellen und im Tool einfügen.'],['SPF, DKIM, DMARC','Drei DNS-Einträge bei deinem Domain-Anbieter, die beweisen, dass du Mails für deine Domain senden darfst. Google Workspace zeigt SPF und DKIM unter Admin → Apps → Gmail → E-Mails authentifizieren. DMARC: TXT-Eintrag _dmarc mit v=DMARC1; p=none'],['Warm-up','Neue Konten starten mit 5–10 Mails pro Tag und steigern sich über 4 Wochen auf 30–50. Das Tool macht das automatisch.'],['Mehrere Konten & Nebendomains','Für mehr Volumen weitere Postfächer auf einer Nebendomain anlegen (z. B. astravagand-mail.com) und alle in der Kampagne auswählen.'],['Gute Kaltmails','Kurz (unter 120 Wörter), persönlich, eine klare Frage am Ende, max. 1 Link, keine Anhänge.'],['Rechtliches DACH','Werbe-Mails ohne Einwilligung sind in DE (§ 7 UWG) und AT (§ 174 TKG) auch B2B grundsätzlich unzulässig. Abmelde-Hinweis und Firmenangaben sind Pflicht. Kein Rechtsrat – im Zweifel Anwalt fragen.'],['Versand läuft nicht?','Der Versand läuft jede Minute automatisch in der Cloud – aber nur im Zeitfenster der Kampagne (Tab Zeitplan), nur mit verbundenen Konten und nur bis zum Tageslimit (Warm-up).']].map(([t,p])=>`<details class="card" style="padding:12px 16px;margin-bottom:8px;box-shadow:none"><summary style="cursor:pointer;font-weight:650">${t}</summary><p class="muted" style="font-size:13px;margin-top:8px">${p}</p></details>`).join('')}</div>`),
 welcome:d=>{const c=$('#wCompany');if(c)welcomeData.company=c.value;welcomeModal(+(d.s||0))},
 welcomeSkip:async()=>{closeModal();await patchOnb({welcomed:true})},
 welcomeDone:async()=>{closeModal();if(welcomeData.company&&welcomeData.company!==C.workspace.name)await patch('/api/settings',{company:welcomeData.company});store.set('goal',welcomeData.goal);await patchOnb({welcomed:true});render();setTimeout(()=>tour(0),250)},
 pickGoal:(d,el)=>{el.parentElement.querySelectorAll('.next').forEach(x=>x.classList.remove('next'));el.classList.add('next')},
 pickVol:(d,el)=>{welcomeData.goal=+d.v;el.parentElement.querySelectorAll('.on').forEach(x=>x.classList.remove('on'));el.classList.add('on');$('#wVolNote').innerHTML=volNote(welcomeData.goal)},
 tour:()=>{closeModal();tour(0)},tourGo:d=>tour(+d.i),tourEnd:()=>tour(-1),
 onbStep:d=>{const to=d.to;if(to==='lesson')return lessonModal();if(to==='testmail'){return testMailModal()}if(to==='camp'||to==='start'){if(!C.campaigns.length)return newCampaignModal();S.view='campaigns';S.camp=(C.campaigns.find(c=>c.status==='draft')||C.campaigns[0]).id;S.campTab='sequence';render();if(to==='start')startCheckModal();return}if(to==='leads'){go('leads');return importModal()}if(to==='accounts'&&!C.accounts.length){go('accounts');return connectModal()}go(to)},
 newCampaign:()=>newCampaignModal(),
 ncCreate:async()=>{const name=$('#ncName').value.trim()||'Neue Kampagne';const lists=[...document.querySelectorAll('[data-list].on')].map(e=>e.dataset.list);const j=await post('/api/campaigns',{name,lists,templateId:$('#ncTpl').value||undefined});if(!j.ok)return toast(j.error,'bad');closeModal();await refresh(false);A.openCamp({id:j.id});toast('Kampagne angelegt – jetzt Texte anpassen')},
 pauseCamp:async()=>{await post(`/api/campaigns/${S.camp}/pause`);await refresh();toast('Kampagne pausiert','warn')},
 startCheck:()=>startCheckModal(),
 startCamp:async()=>{const j=await post(`/api/campaigns/${S.camp}/start`);if(!j.ok)return toast(j.error,'bad');closeModal();await refresh();toast('Kampagne gestartet 🚀')},
 delCamp:()=>confirmModal('Kampagne löschen?','Die Kampagne und ihr Verlauf werden gelöscht. Leads bleiben erhalten.','Löschen',async()=>{await del('/api/campaigns/'+S.camp);S.camp=null;await refresh();toast('Kampagne gelöscht','warn')}),
 toggleSender:async d=>{const c=camp();const ids=c.accounts.includes(d.id)?c.accounts.filter(x=>x!==d.id):[...c.accounts,d.id];c.accounts=ids;render(true);await patch(`/api/campaigns/${c.id}`,{accounts:ids});refresh()},
 toggleList:async d=>{const c=camp();const ids=c.lists.includes(d.id)?c.lists.filter(x=>x!==d.id):[...c.lists,d.id];await patch(`/api/campaigns/${c.id}`,{lists:ids});await refresh(false);S.campRows=null;render(true);loadPrevLeads(camp())},
 toggleCompany:async()=>{const c=camp();await patch(`/api/campaigns/${c.id}`,{stopCompany:!c.stopCompany});await refresh()},
 toggleOnly:(d,el)=>el.classList.toggle('on'),
 day:async d=>{const c=camp();const days=[...c.schedule.days];days[+d.i]=days[+d.i]?0:1;await patch(`/api/campaigns/${c.id}`,{schedule:{days}});await refresh()},
 import:()=>importModal(),importRun,
 setTab:d=>{S.settingsTab=d.k;render(true)},
 saveWs:async()=>{await patch('/api/settings',{company:$('#setCompany').value,timezone:$('#setTz').value});await refresh();toast('Gespeichert')},
 saveFooter:async()=>{await patch('/api/settings',{footer:$('#setFooter').value});await refresh();toast('Fußzeile gespeichert')},
 saveBlock:async()=>{const v=$('#setBlock').value.split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean);await patch('/api/settings',{blocklist:v});await refresh();toast('Sperrliste gespeichert')},
 wsMenu:()=>{modal(`${mh('Workspaces','Jeder Kunde in seinem eigenen Bereich')}<div class="modal-b">${C.workspaces.map(w=>`<div class="ws" style="margin-bottom:8px" data-act="wsSwitch" data-id="${w.id}"><div class="av">${esc(w.name[0]||'W')}</div><div><strong>${esc(w.name)}</strong><span>${w.id===C.workspace.id?'Aktiv':'Wechseln'}</span></div>${w.id===C.workspace.id?`<span class="badge b-good">✓</span>`:''}</div>`).join('')}</div><div class="modal-f"><button class="btn" data-act="wsNew">${ic('plus',2)}Neuer Workspace</button></div>`)},
 wsSwitch:async d=>{closeModal();await post('/api/workspaces/switch',{id:d.id});S.camp=null;S.leadList='all';await refresh();go('overview');toast('Workspace gewechselt')},
 wsNew:()=>promptModal('Neuer Workspace','Name (z. B. Kundenname)','',async n=>{await post('/api/workspaces',{name:n});S.camp=null;S.leadList='all';await refresh();go('overview');toast('Workspace erstellt')}),
 confirmYes:async()=>{const f=confirmFn;closeModal();confirmFn=null;if(f)await f()},
 promptYes:async()=>{const v=$('#promptIn').value.trim();if(!v)return;const f=promptFn;closeModal();promptFn=null;if(f)await f(v)},
 closeModal:d=>{closeModal();if(d&&d.then)go(d.then)}
};
document.addEventListener('click',e=>{const el=e.target.closest('[data-act]');if(!el)return;const fn=A[el.dataset.act];if(fn){if(el.tagName==='A')e.preventDefault();fn(el.dataset,el,e)}});
$('#modalBg').addEventListener('mousedown',e=>{if(e.target.id==='modalBg')closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closePanel();tour(-1)}if(e.key==='Enter'&&e.target.id==='promptIn')A.promptYes()});
const leadSearch=debounce(()=>loadLeads(),300);
document.addEventListener('input',e=>{const t=e.target;
 if(t.id==='calcIn')return calc();if(t.id==='leadQ'){S.leadQ=t.value;return leadSearch()}
 if(t.dataset.impmap!==undefined){IMP.map[+t.dataset.impmap]=t.value;return}
 const b=t.dataset.bind;if(b&&S.edit){const st=S.edit[S.step];
  if(b==='prevIdx'){S.prevIdx=+t.value;return refreshPreview()}
  if(b==='wait'){st.wait=Math.max(1,+t.value||1);const w=document.querySelectorAll('.tl-wait span')[S.step-1];if(w)w.innerHTML=ic('clock')+st.wait+' Werktage warten';saveSteps();return}
  st[b]=t.value;refreshPreview();const sub=document.querySelectorAll('.tl-step .sub')[S.step];if(sub&&b==='subject')sub.textContent=t.value;saveSteps()}
});
document.addEventListener('change',async e=>{const t=e.target;const c=S.camp&&camp();
 if(t.dataset.sched&&c){const v=t.type==='number'?+t.value:t.value;await patch(`/api/campaigns/${c.id}`,{schedule:{[t.dataset.sched]:v}});await refresh(false);toast('Zeitplan gespeichert')}
 if(t.dataset.campfield&&c){await patch(`/api/campaigns/${c.id}`,{[t.dataset.campfield]:t.type==='number'?+t.value:t.value});await refresh();toast('Gespeichert')}
});
addEventListener('resize',()=>{if(tourI>=0)tour(tourI)});


/* ================= Login & Sicherheit (Supabase Auth) ================= */
let AUTH_OPEN=false,AUTH={},SEC=null,ME=null,PENDING_FACTOR=null;
function authShell(inner){return `<div style="position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:20px;background:radial-gradient(80% 60% at 20% 10%,rgba(139,92,246,.18),transparent 60%),radial-gradient(60% 50% at 90% 90%,rgba(253,186,140,.10),transparent 60%),var(--bg);overflow:auto"><div style="width:420px;max-width:100%"><div class="row gap" style="justify-content:center;margin-bottom:22px">${logo(40)}<div><b style="font-size:17px">Astravagand</b><div class="muted" style="font-size:12.5px;margin-top:-2px">Outreach</div></div></div><div class="card" style="padding:26px 26px 22px">${inner}</div><p class="faint" style="text-align:center;font-size:11.5px;margin-top:16px">${ics('shield',12)} Verschlüsselte Verbindung · Anmeldung über Supabase Auth</p></div></div>`}
function showAuth(mode,msg){
 AUTH_OPEN=true;closeModal();closePanel();tour(-1);let el=$('#auth');if(!el){el=document.createElement('div');el.id='auth';document.body.appendChild(el)}
 const err=msg?`<div class="result ${/abgemeldet|Bitte melde/.test(msg)?'info':'err'}" style="margin:0 0 14px">${esc(msg)}</div>`:'';
 if(mode==='setup')el.innerHTML=authShell(`<h2 style="font-size:20px;letter-spacing:-.02em">Ersteinrichtung</h2><p class="muted" style="font-size:13px;margin:4px 0 18px">Lege den Inhaber-Zugang an. Danach ist das Tool nur noch mit Login erreichbar – eine offene Registrierung gibt es nicht.</p>${err}
  <form id="authForm" data-mode="setup"><div class="field"><label>Einrichtungs-Code</label><input class="input" name="token" autocomplete="off" required><span class="hint">Den Code hast du von mir im Chat bekommen.</span></div>
  <div class="grid g2" style="gap:12px"><div class="field"><label>Firma</label><input class="input" name="company" value="Astravagand" required></div><div class="field"><label>Dein Name</label><input class="input" name="name" autocomplete="name" placeholder="Izy Sinani"></div></div>
  <div class="field"><label>E-Mail</label><input class="input" name="email" type="email" autocomplete="username" required></div>
  <div class="field"><label>Passwort</label><input class="input" name="password" type="password" autocomplete="new-password" minlength="12" maxlength="72" required id="pw1"><div class="prog" style="margin-top:6px;height:4px"><i id="pwBar" style="width:0"></i></div><span class="hint">Mindestens 12 Zeichen. Am besten ein Satz, z. B. „Mein Kaffee um 7 ist heilig!“</span></div>
  <div class="field"><label>Passwort wiederholen</label><input class="input" name="password2" type="password" autocomplete="new-password" required></div>
  <button class="btn primary" style="width:100%;justify-content:center;margin-top:6px" type="submit">Zugang anlegen</button></form>`);
 else if(mode==='totp')el.innerHTML=authShell(`<h2 style="font-size:20px;letter-spacing:-.02em">Bestätigungscode</h2><p class="muted" style="font-size:13px;margin:4px 0 18px">Gib den 6-stelligen Code aus deiner Authenticator-App ein.</p>${err}
  <form id="authForm" data-mode="totp"><div class="field"><input class="input" name="code" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" maxlength="6" required style="font-size:24px;letter-spacing:.3em;text-align:center;font-weight:700"></div>
  <button class="btn primary" style="width:100%;justify-content:center" type="submit">Bestätigen</button><button class="btn ghost" style="width:100%;justify-content:center;margin-top:8px" type="button" data-act="authBack">Zurück zum Login</button></form>`);
 else el.innerHTML=authShell(`<h2 style="font-size:20px;letter-spacing:-.02em">Anmelden</h2><p class="muted" style="font-size:13px;margin:4px 0 18px">Willkommen zurück.</p>${err}
  <form id="authForm" data-mode="login"><div class="field"><label>E-Mail</label><input class="input" name="email" type="email" autocomplete="username" required></div><div class="field"><label>Passwort</label><input class="input" name="password" type="password" autocomplete="current-password" required></div>
  <button class="btn primary" style="width:100%;justify-content:center;margin-top:6px" type="submit">Anmelden</button></form>`);
 setTimeout(()=>el.querySelector('input')?.focus(),30);
}
function hideAuth(){AUTH_OPEN=false;$('#auth')?.remove()}
function pwScore(pw){let s=0;if(pw.length>=12)s++;if(pw.length>=16)s++;if(/[a-z]/.test(pw)&&/[A-Z]/.test(pw))s++;if(/\d/.test(pw))s++;if(/[^A-Za-z0-9]/.test(pw))s++;return s}
const WEAKW=['passwort','password','123456','qwertz','qwerty','astravagand','admin','letmein','willkommen','sommer','winter'];
function pwProblem(pw,email){pw=String(pw||'');const low=pw.toLowerCase();if(pw.length<12)return'Mindestens 12 Zeichen.';if(pw.length>72)return'Maximal 72 Zeichen.';if(WEAKW.some(w=>low.includes(w)))return'Zu leicht zu erraten – bitte keine gängigen Wörter.';if(email&&low.includes(String(email).split('@')[0].toLowerCase()))return'Das Passwort darf nicht deinen E-Mail-Namen enthalten.';if(new Set(pw).size<6)return'Zu wenige verschiedene Zeichen.';return null}
document.addEventListener('input',e=>{if(e.target.id==='pw1'||e.target.id==='npw1'){const sc=pwScore(e.target.value),bar=$(e.target.id==='pw1'?'#pwBar':'#npwBar');if(bar){bar.style.width=sc*20+'%';bar.style.background=sc<3?'var(--bad)':sc<4?'var(--warn)':'var(--good)'}}});
const AUTH_ERR=m=>/Invalid login credentials/i.test(m)?'E-Mail oder Passwort falsch.':/rate limit|too many/i.test(m)?'Zu viele Versuche – bitte später erneut.':/Email not confirmed/i.test(m)?'E-Mail noch nicht bestätigt.':/Invalid TOTP|invalid.*code|expired/i.test(m)?'Code falsch oder abgelaufen.':m;
async function needsMfa(){try{const {data}=await SBC.auth.mfa.getAuthenticatorAssuranceLevel();return data&&data.nextLevel==='aal2'&&data.currentLevel!=='aal2'}catch(e){return false}}
document.addEventListener('submit',async e=>{const f=e.target;if(f.id!=='authForm')return;e.preventDefault();const d=Object.fromEntries(new FormData(f));const btn=f.querySelector('button[type=submit]');const old=btn.innerHTML;btn.disabled=true;btn.innerHTML=spinner;
 const fail=(m,mode)=>{btn.disabled=false;btn.innerHTML=old;showAuth(mode||f.dataset.mode,m)};
 try{
 if(f.dataset.mode==='setup'){
  if(d.password!==d.password2)return fail('Die Passwörter stimmen nicht überein.');const pp=pwProblem(d.password,d.email);if(pp)return fail(pp);
  const j=await post('/api/setup',{token:d.token,company:d.company,name:d.name,email:d.email,password:d.password});if(!j.ok)return fail(j.error);
  const {error}=await SBC.auth.signInWithPassword({email:d.email.trim().toLowerCase(),password:d.password});if(error)return fail(AUTH_ERR(error.message),'login');
  await post('/api/auth/event',{event:'login',detail:'Einrichtung'});
 }else if(f.dataset.mode==='totp'){
  const {data:fs}=await SBC.auth.mfa.listFactors();const fac=(fs&&fs.totp||[]).find(x=>x.status==='verified');if(!fac)return fail('Kein 2FA-Gerät gefunden.','login');
  const {error}=await SBC.auth.mfa.challengeAndVerify({factorId:fac.id,code:String(d.code).replace(/\s/g,'')});if(error)return fail(AUTH_ERR(error.message));
  await post('/api/auth/event',{event:'login',detail:'Passwort + 2FA'});
 }else{
  const {error}=await SBC.auth.signInWithPassword({email:String(d.email).trim().toLowerCase(),password:d.password});if(error)return fail(AUTH_ERR(error.message));
  if(await needsMfa())return showAuth('totp');
  await post('/api/auth/event',{event:'login',detail:'Passwort'});
 }
 }catch(x){return fail('Unerwarteter Fehler: '+x.message)}
 hideAuth();await startApp();
});
async function boot(){
 const cfg=await get('/api/config');
 if(!cfg||!cfg.ok||!cfg.supabaseUrl){$('#content').innerHTML=`<div class="wrap"><div class="card empty" style="padding:60px 20px;margin-top:40px">${logo(48)}<h2 style="margin:16px 0 8px;color:var(--text)">Noch nicht fertig eingerichtet</h2><p>${esc((cfg&&cfg.error)||'Server nicht erreichbar.')}</p></div></div>`;return}
 SBC=supabase.createClient(cfg.supabaseUrl,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,storageKey:'ao_auth'}});
 SBC.auth.onAuthStateChange(ev=>{if(ev==='SIGNED_OUT'&&!AUTH_OPEN){C=null;showAuth('login','Du wurdest abgemeldet.')}});
 const st=await get('/api/auth/status');AUTH=st||{};
 if(st&&st.setupNeeded&&!st.authed)return showAuth('setup');
 if(st&&st.mfaNeeded)return showAuth('totp');
 if(!st||!st.authed)return showAuth('login');
 if(!st.member)return showAuth('login','Dein Zugang ist keinem Workspace zugeordnet.');
 await startApp();
}
let pollTimer=null;
async function startApp(){
 const {data}=await SBC.auth.getUser();ME=data&&data.user;
 const ok=await load();if(!ok)return;
 const nm=(ME&&ME.user_metadata&&ME.user_metadata.name)||(ME&&ME.email)||'?';
 $('#meBtn').textContent=nm.split(/[\s@.]+/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase();
 render();
 if(!C.settings.onb.welcomed)setTimeout(()=>welcomeModal(0),400);
 try{const {data:fs}=await SBC.auth.mfa.listFactors();const has=(fs&&fs.totp||[]).some(x=>x.status==='verified');if(!has)setTimeout(()=>{if(!modalOpen())toast('Tipp: Schalte unter Einstellungen → Sicherheit die Zwei-Faktor-Anmeldung ein','warn')},4000)}catch(e){}
 clearInterval(pollTimer);
 pollTimer=setInterval(async()=>{if(document.hidden||AUTH_OPEN||!C)return;const busy=modalOpen()||tourI>=0||document.activeElement?.matches('input,textarea,select')||(S.view==='campaigns'&&S.camp&&S.campTab==='sequence')||$('#panel').classList.contains('open');await refresh(!busy)},20000);
}
async function loadSec(){const j=await get('/api/auth/security');if(j.ok){let fs=null;try{fs=(await SBC.auth.mfa.listFactors()).data}catch(e){}j.factors=(fs&&fs.totp||[]).filter(x=>x.status==='verified');SEC=j;if(S.view==='settings'&&['security','users'].includes(S.settingsTab))render(true)}}
const AUDIT={login:'Angemeldet',logout:'Abgemeldet',setup:'Einrichtung',setup_failed:'Einrichtung fehlgeschlagen',password_changed:'Passwort geändert','2fa_enabled':'2FA eingeschaltet','2fa_disabled':'2FA ausgeschaltet',signout_all:'Überall abgemeldet',user_added:'Benutzer angelegt',user_removed:'Benutzer entfernt',account_added:'E-Mail-Konto verbunden',account_updated:'E-Mail-Konto aktualisiert',account_removed:'E-Mail-Konto entfernt',campaign_started:'Kampagne gestartet',campaign_deleted:'Kampagne gelöscht',workspace_created:'Workspace angelegt'};
function secSection(){
 if(!SEC){loadSec();return `<div class="empty">${spinner}</div>`}
 const me=SEC.me,on=SEC.factors.length>0;
 return `<h3 style="font-size:16px;margin-bottom:4px">Sicherheit & Login</h3><p class="muted" style="font-size:12.5px;margin-bottom:18px">Angemeldet als <b style="color:var(--text)">${esc(me.email)}</b> · ${me.role==='owner'?'Inhaber':'Mitglied'}</p>
 <div class="card" style="padding:16px 18px;box-shadow:none;margin-bottom:14px"><div class="row gap" style="justify-content:space-between;flex-wrap:wrap"><div class="row gap"><div class="prov" style="background:${on?'rgba(52,211,153,.12)':'rgba(251,191,36,.12)'};color:${on?'var(--good)':'var(--warn)'}">${ic('shield')}</div><div><b>Zwei-Faktor-Anmeldung</b><div class="cell-sub">${on?'Aktiv – beim Login wird zusätzlich ein Code aus der App verlangt':'Aus – empfohlen: zusätzlich ein Code aus der Handy-App'}</div></div></div>${on?`<button class="btn sm ghost danger" data-act="twofaOff">Ausschalten</button>`:`<button class="btn sm primary" data-act="twofaOn">${ic('shield')}Einschalten</button>`}</div></div>
 <div class="card" style="padding:16px 18px;box-shadow:none;margin-bottom:14px"><div class="row gap" style="justify-content:space-between;flex-wrap:wrap"><div class="row gap"><div class="prov">${ic('key')}</div><div><b>Passwort</b><div class="cell-sub">Neues Passwort festlegen.</div></div></div><button class="btn sm" data-act="pwChange">Passwort ändern</button></div></div>
 <div class="card" style="padding:16px 18px;box-shadow:none;margin-bottom:14px"><div class="row gap" style="justify-content:space-between;flex-wrap:wrap"><div class="row gap"><div class="prov">${ic('globe')}</div><div><b>Sitzungen</b><div class="cell-sub">Meldet dich auf allen Geräten ab (auch hier).</div></div></div><button class="btn sm ghost danger" data-act="signoutAll">Überall abmelden</button></div></div>
 <b style="display:block;margin:22px 0 8px">Protokoll</b>
 <div class="card" style="box-shadow:none;max-height:320px;overflow:auto">${SEC.audit.length?SEC.audit.map(a=>`<div class="row gap" style="padding:9px 16px;border-bottom:1px solid var(--border);font-size:12.5px"><span class="dot ${/failed/.test(a.event)?'bad':/2fa|password|user|signout|removed|deleted/.test(a.event)?'warn':'good'}"></span><span style="flex:1;min-width:0"><b>${AUDIT[a.event]||esc(a.event)}</b> <span class="muted">${esc(a.user||'')}${a.detail?' · '+esc(a.detail):''}</span></span><span class="faint" style="flex:none">${esc(a.ip||'')} · ${dt(a.at)}</span></div>`).join(''):'<div class="empty">Noch keine Einträge.</div>'}</div>
 <div class="callout mt">${ic('info')}<div>Fehlversuche beim Login werden von Supabase automatisch gebremst. Handy mit 2FA verloren? Der Inhaber kann den 2FA-Faktor im Supabase-Dashboard unter Authentication → Users entfernen.</div></div>`;
}
function usersSection(){
 if(!SEC){loadSec();return `<div class="empty">${spinner}</div>`}
 return `<div class="row" style="justify-content:space-between;margin-bottom:16px"><div><h3 style="font-size:16px">Benutzer</h3><p class="muted" style="font-size:12.5px">Wer in diesem Workspace arbeiten darf. Es gibt keine offene Registrierung.</p></div>${SEC.me.role==='owner'?`<button class="btn sm primary" data-act="userAdd">${ic('plus',2)}Benutzer anlegen</button>`:''}</div>
 <div class="card" style="box-shadow:none">${SEC.users.map(u=>`<div class="row gap" style="padding:12px 16px;border-bottom:1px solid var(--border)">${av(u.name||u.email,34)}<div style="flex:1;min-width:0"><b>${esc(u.name||u.email)}</b>${u.id===SEC.me.id?' <span class="badge b-violet">Du</span>':''}<div class="cell-sub">${esc(u.email)} · ${u.role==='owner'?'Inhaber':'Mitglied'} · ${u.totp?'2FA aktiv':'ohne 2FA'}${u.lastLogin?' · zuletzt '+dt(u.lastLogin):''}</div></div>${SEC.me.role==='owner'&&u.id!==SEC.me.id?`<button class="btn sm ghost danger" data-act="userDel" data-id="${u.id}">Entfernen</button>`:''}</div>`).join('')}</div>`;
}
const copyBtn=(v,l)=>`<button class="btn sm" data-act="copyTxt" data-v="${esc(v)}">${ic('copy')}${l||'Kopieren'}</button>`;
async function gwsModal(){
 modal(`${mh('Google Workspace – Admin-Verbindung','Postfächer deiner Domain verbinden, ohne dich in jedes einzuloggen.')}<div class="modal-b"><div class="empty">${spinner}</div></div>`,true);
 const j=await get('/api/gworkspace');if(!j.ok){$('#modal .modal-b').innerHTML=resBox('err',esc(j.error));return}
 const scopes=j.scopes.join(',');
 const setup=`<ol class="muted" style="padding-left:18px;font-size:13px;line-height:1.7">
  <li><b style="color:var(--text)">Google Cloud:</b> console.cloud.google.com → neues Projekt „astravagand-outreach“ → <b style="color:var(--text)">Gmail API</b> aktivieren.</li>
  <li>IAM → <b style="color:var(--text)">Dienstkonten</b> → Dienstkonto „outreach-mailer“ erstellen (keine Rollen nötig) → Schlüssel → <b style="color:var(--text)">JSON</b> herunterladen.</li>
  <li><b style="color:var(--text)">Vercel</b> → Projekt → Settings → Environment Variables → <code>GOOGLE_SA_JSON</code> = kompletten Inhalt der JSON-Datei einfügen, <b style="color:var(--text)">Sensitive</b> an, Production → Save. Danach die JSON-Datei vom Computer <b style="color:var(--text)">löschen</b>.</li>
  <li>Mir Bescheid geben – ich starte die App neu. Dann erscheint hier die Client-ID für Schritt 5.</li>
  <li><b style="color:var(--text)">admin.google.com</b> → Sicherheit → Zugriffs- und Datenkontrolle → API-Steuerung → Domainweite Delegierung → Neu: Client-ID + Berechtigungen eintragen.</li></ol>`;
 const body=!j.configured?`<div class="callout" style="margin-bottom:14px">${ic('info')}<div>Noch nicht eingerichtet. Einmalig ca. 15 Minuten:</div></div>${setup}<div class="callout mt">${ic('shield')}<div>Der Schlüssel liegt <b>nur</b> verschlüsselt bei Vercel – nie in der Datenbank, nie im Browser. Er darf nur Mails senden und lesen, nur für ${j.domains.length?esc(j.domains.join(', ')):'deine freigegebenen Domains'}.</div></div>`
 :`<div class="result ok" style="margin:0 0 14px">${ics('check',16,2.4)}<div><b>Schlüssel ist eingerichtet.</b> Freigegebene Domains: ${esc(j.domains.join(', ')||'– keine –')}</div></div>
  <details class="card" style="padding:12px 16px;box-shadow:none;margin-bottom:14px"><summary style="cursor:pointer;font-weight:650">Daten für die Admin-Konsole (Domainweite Delegierung)</summary><div style="margin-top:10px;font-size:12.5px"><div class="faint">Client-ID</div><div class="row gap" style="margin:4px 0 10px"><code style="color:var(--text)">${esc(j.clientId)}</code>${copyBtn(j.clientId)}</div><div class="faint">OAuth-Bereiche (genau so eintragen)</div><div class="row gap" style="margin-top:4px;align-items:flex-start"><code style="color:var(--text);word-break:break-all">${esc(scopes)}</code>${copyBtn(scopes)}</div></div></details>
  ${j.mfa?'':`<div class="result err" style="margin:0 0 14px">${ics('alert',16)}<div>Aus Sicherheitsgründen geht das nur mit <b>Zwei-Faktor-Anmeldung</b>. <a href="#" data-act="goSec">Jetzt einschalten</a>, danach neu anmelden.</div></div>`}
  <div class="field"><label>Postfächer (eine Adresse pro Zeile)</label><textarea class="textarea" id="gwsEmails" style="min-height:110px;font-family:ui-monospace,monospace;font-size:13px" placeholder="vertrieb@astravagand.com&#10;office@astravagand.com"></textarea></div>
  <div class="field"><label>Absendername (optional, für alle)</label><input class="input" id="gwsName" placeholder="Izy Sinani"></div><div id="gwsRes"></div>`;
 $('#modal').innerHTML=`${mh('Google Workspace – Admin-Verbindung','Postfächer deiner Domain verbinden, ohne dich in jedes einzuloggen.')}<div class="modal-b">${body}</div><div class="modal-f"><button class="btn ghost" data-act="closeModal">Schließen</button>${j.configured?`<button class="btn primary" data-act="gwsConnect" id="gwsBtn" ${j.mfa?'':'disabled'}>${ic('shield')}Postfächer verbinden</button>`:''}</div>`;
}
Object.assign(A,{
 gws:()=>gwsModal(),
 copyTxt:async d=>{try{await navigator.clipboard.writeText(d.v);toast('Kopiert')}catch(e){toast('Kopieren nicht möglich – bitte markieren','warn')}},
 gwsConnect:async()=>{const emails=$('#gwsEmails').value.split(/[\s,;]+/).map(x=>x.trim()).filter(Boolean);if(!emails.length)return;const b=$('#gwsBtn');b.disabled=true;b.innerHTML=spinner+'Verbinde …';
  const j=await post('/api/gworkspace/accounts',{emails,name:$('#gwsName').value});b.disabled=false;b.innerHTML=ic('shield')+'Postfächer verbinden';
  if(!j.ok){$('#gwsRes').innerHTML=resBox('err',esc(j.error));return}
  $('#gwsRes').innerHTML=`<div class="checks card" style="padding:14px;box-shadow:none">${j.results.map(r=>`<div class="checkrow"><span class="ci ${r.ok?'ok':'no'}">${r.ok?'✓':'!'}</span><span><b>${esc(r.email)}</b>${r.ok?' – verbunden, Warm-up startet':' – '+esc(r.error)}</span></div>`).join('')}</div>`;
  if(j.results.some(r=>r.ok)){await refresh();toast(j.results.filter(r=>r.ok).length+' Postfach/Postfächer verbunden')}},
 dl:async(d,el)=>{const old=el.innerHTML;el.disabled=true;el.innerHTML=spinner+'Lädt …';try{const t=await token();const r=await fetch(d.url,{headers:{Authorization:'Bearer '+t}});if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||'Fehler '+r.status);const blob=await r.blob();const name=(r.headers.get('Content-Disposition')||'').match(/filename="([^"]+)"/)?.[1]||'export.csv';const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);toast('Download gestartet')}catch(e){toast(e.message,'bad')}el.disabled=false;el.innerHTML=old},
 userMenu:()=>{if(!ME)return;modal(`${mh(esc((ME.user_metadata&&ME.user_metadata.name)||'Mein Konto'),esc(ME.email))}<div class="modal-b"><div class="row gap" style="flex-wrap:wrap"><button class="btn" data-act="goSec">${ic('key')}Sicherheit & Login</button><button class="btn" data-act="theme">${ic('moon')}Hell/Dunkel</button></div></div><div class="modal-f"><button class="btn danger" data-act="logout">Abmelden</button></div>`)},
 goSec:()=>{closeModal();S.settingsTab='security';SEC=null;go('settings')},
 logout:async()=>{closeModal();await post('/api/auth/event',{event:'logout'});AUTH_OPEN=true;await SBC.auth.signOut();C=null;SEC=null;ME=null;clearInterval(pollTimer);$('#content').innerHTML='';showAuth('login','Du wurdest abgemeldet.')},
 authBack:async()=>{AUTH_OPEN=true;await SBC.auth.signOut();showAuth('login')},
 signoutAll:()=>confirmModal('Überall abmelden?','Alle Geräte werden abgemeldet – auch dieses.','Abmelden',async()=>{await post('/api/auth/event',{event:'signout_all'});AUTH_OPEN=true;await SBC.auth.signOut({scope:'global'});C=null;clearInterval(pollTimer);$('#content').innerHTML='';showAuth('login','Du wurdest überall abgemeldet.')}),
 twofaOn:async()=>{try{const {data:fs}=await SBC.auth.mfa.listFactors();for(const f of (fs&&fs.all||[]).filter(x=>x.status!=='verified'))await SBC.auth.mfa.unenroll({factorId:f.id})}catch(e){}
  const {data,error}=await SBC.auth.mfa.enroll({factorType:'totp',friendlyName:'Authenticator '+new Date().toISOString().slice(0,16)});if(error)return toast(AUTH_ERR(error.message),'bad');PENDING_FACTOR=data.id;
  modal(`${mh('Zwei-Faktor-Anmeldung einschalten','Mit Google Authenticator, Microsoft Authenticator, 1Password o. ä.')}<div class="modal-b"><ol class="muted" style="padding-left:18px;font-size:13px;margin-bottom:14px"><li>App öffnen → <b>Konto hinzufügen</b> → QR-Code scannen.</li><li>Den 6-stelligen Code aus der App unten eingeben.</li></ol>
  <div class="row gap" style="align-items:center;flex-wrap:wrap"><img src="${esc(data.totp.qr_code)}" width="180" height="180" alt="QR-Code" style="border-radius:12px;background:#fff;padding:6px"><div style="flex:1;min-width:200px"><div class="muted" style="font-size:12px">Oder Schlüssel manuell eingeben:</div><code style="display:block;font-size:13px;margin:6px 0 14px;word-break:break-all;color:var(--text)">${esc(String(data.totp.secret).replace(/(.{4})/g,'$1 ').trim())}</code><div class="field"><label>Code aus der App</label><input class="input" id="tfaCode" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" maxlength="6" style="font-size:20px;letter-spacing:.2em;font-weight:700"></div></div></div><div id="tfaRes"></div></div>
  <div class="modal-f"><button class="btn ghost" data-act="closeModal">Abbrechen</button><button class="btn primary" data-act="twofaConfirm">Bestätigen & einschalten</button></div>`)},
 twofaConfirm:async()=>{const {error}=await SBC.auth.mfa.challengeAndVerify({factorId:PENDING_FACTOR,code:$('#tfaCode').value.replace(/\s/g,'')});if(error){$('#tfaRes').innerHTML=resBox('err',esc(AUTH_ERR(error.message)));return}
  await post('/api/auth/event',{event:'2fa_enabled'});closeModal();SEC=null;render(true);toast('2FA ist aktiv ✓ – ab jetzt wird beim Login ein Code verlangt')},
 twofaOff:()=>{modal(`${mh('2FA ausschalten','Zur Sicherheit brauchst du einen aktuellen Code aus der App.')}<div class="modal-b"><div class="field"><label>Code aus der App</label><input class="input" id="offCode" inputmode="numeric" maxlength="6"></div><div id="offRes"></div></div><div class="modal-f"><button class="btn ghost" data-act="closeModal">Abbrechen</button><button class="btn danger" data-act="twofaOffGo">Ausschalten</button></div>`)},
 twofaOffGo:async()=>{const fac=SEC.factors[0];if(!fac)return closeModal();const v=await SBC.auth.mfa.challengeAndVerify({factorId:fac.id,code:$('#offCode').value.replace(/\s/g,'')});if(v.error){$('#offRes').innerHTML=resBox('err',esc(AUTH_ERR(v.error.message)));return}
  const {error}=await SBC.auth.mfa.unenroll({factorId:fac.id});if(error){$('#offRes').innerHTML=resBox('err',esc(error.message));return}await SBC.auth.refreshSession();await post('/api/auth/event',{event:'2fa_disabled'});closeModal();SEC=null;render(true);toast('2FA ausgeschaltet','warn')},
 pwChange:()=>{modal(`${mh('Passwort ändern')}<div class="modal-b"><div class="field"><label>Neues Passwort</label><input class="input" type="password" id="npw1" autocomplete="new-password" maxlength="72"><div class="prog" style="margin-top:6px;height:4px"><i id="npwBar" style="width:0"></i></div><span class="hint">Mindestens 12 Zeichen, keine gängigen Wörter.</span></div><div class="field"><label>Neues Passwort wiederholen</label><input class="input" type="password" id="npw2" autocomplete="new-password"></div><div id="pwRes"></div></div><div class="modal-f"><button class="btn ghost" data-act="closeModal">Abbrechen</button><button class="btn primary" data-act="pwSave">Speichern</button></div>`)},
 pwSave:async()=>{const p1=$('#npw1').value;if(p1!==$('#npw2').value){$('#pwRes').innerHTML=resBox('err','Die Passwörter stimmen nicht überein.');return}const pp=pwProblem(p1,ME&&ME.email);if(pp){$('#pwRes').innerHTML=resBox('err',pp);return}
  const {error}=await SBC.auth.updateUser({password:p1});if(error){$('#pwRes').innerHTML=resBox('err',esc(AUTH_ERR(error.message)));return}await post('/api/auth/event',{event:'password_changed'});closeModal();toast('Passwort geändert')},
 userAdd:()=>{modal(`${mh('Benutzer anlegen','Die Person meldet sich mit E-Mail und diesem Start-Passwort an und sollte es danach ändern.')}<div class="modal-b"><div class="field"><label>Name</label><input class="input" id="nuName"></div><div class="field"><label>E-Mail</label><input class="input" id="nuEmail" type="email"></div><div class="field"><label>Start-Passwort</label><div class="row gap"><input class="input" id="nuPw"><button class="btn sm" data-act="genPw">Erzeugen</button></div><span class="hint">Sicher übergeben – nicht per normaler Mail.</span></div><div id="nuRes"></div></div><div class="modal-f"><button class="btn ghost" data-act="closeModal">Abbrechen</button><button class="btn primary" data-act="userSave">Anlegen</button></div>`)},
 genPw:()=>{const a='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!?#%';const r=crypto.getRandomValues(new Uint32Array(18));$('#nuPw').value=[...r].map(x=>a[x%a.length]).join('')},
 userSave:async()=>{const j=await post('/api/auth/users',{name:$('#nuName').value,email:$('#nuEmail').value,password:$('#nuPw').value});if(!j.ok){$('#nuRes').innerHTML=resBox('err',esc(j.error));return}closeModal();SEC=null;render(true);toast('Benutzer angelegt')},
 userDel:d=>confirmModal('Benutzer entfernen?','Die Person verliert sofort den Zugriff auf diesen Workspace.','Entfernen',async()=>{const j=await del('/api/auth/users/'+d.id);if(!j.ok)return toast(j.error,'bad');SEC=null;render(true)})
});
const _setTab=A.setTab;A.setTab=d=>{if(['security','users'].includes(d.k))SEC=null;_setTab(d)};

/* ================= Boot ================= */
document.documentElement.dataset.theme=store.get('theme','dark');
boot();
