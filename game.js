// Robot Founder — plain JS + canvas. All art procedural.
(()=>{
'use strict';
const T=32,DAY_LEN=60,SAVE='robotFounderSave_v5',HALL='rfHallOfFame';let HEADLESS=false;
const cv=document.getElementById('c'),cx=cv.getContext('2d');
const $=id=>document.getElementById(id);
const R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
const fmt=n=>{const s=n<0?'-':'';n=Math.abs(n);return s+'$'+(n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e4?(n/1e3).toFixed(1)+'k':Math.round(n).toLocaleString())};

// ---------- Audio ----------
let actx=null,muted=localStorage.getItem('rfMute')==='1';
function beep(f=440,d=.08,type='square',v=.06,slide=0,delay=0){if(muted||HEADLESS)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const t=actx.currentTime+delay,o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
const SFX={
 ok:()=>{beep(660,.06);beep(990,.08,'square',.05,0,.06)},
 bad:()=>{beep(220,.18,'sawtooth',.05,-120)},
 kaching:()=>{beep(1568,.05,'square',.06);beep(2093,.18,'square',.05,0,.06);beep(2637,.12,'triangle',.04,0,.12)},
 coin:()=>{beep(988,.05);beep(1319,.12,'square',.05,0,.05)},
 step:()=>beep(120,.02,'triangle',.03),
 charge:()=>beep(300,.5,'sine',.05,600),
 event:()=>{[523,659,784,1046].forEach((f,i)=>beep(f,.08,'square',.05,0,i*.07))},
 mile:()=>{[523,659,784,1046,784,1046].forEach((f,i)=>beep(f,.1,'square',.06,0,i*.09))},
 lose:()=>{[400,300,200,100].forEach((f,i)=>beep(f,.2,'sawtooth',.06,0,i*.18))},
 click:()=>beep(800,.03,'square',.04)
};

// ---------- Company generator ----------
const PRE=['Hyper','Quantum','Rusty','Bolt','Neon','Sprocket','Giga','Tiny','Cosmic','Turbo','Pixel','Chrome','Fuzzy','Mega','Lazy','Atomic','Velvet','Sneaky'];
const SUF=['Labs','Works','ly','Dynamics','Systems','Corp','Collective','& Sons (all robots)','.ai','Industries','Foundry','Co.','Ventures','Unlimited'];
const NOUN=['Toaster','Waffle','Gizmo','Otter','Cog','Llama','Pancake','Widget','Banana','Rocket','Pigeon','Noodle','Sock','Cactus'];
const MODELS=['RX-7 "Tinker"','Model T-1000-ish','Unit B0B','Mk.II Servo','K9-Lite','Proto-Q','Hexapod-Zero','ZX Spectrumbot'];
const RNAMES=['Bolt','Ada','Sprock','Gizmo','Ohm','Pixel','Kilo','Rivet','Nova','Byte','Tork','Volta','Clank','Mira'];
const COLORS=[['#e74c3c','#922b21'],['#3498db','#1f5f8b'],['#2ecc71','#1d8348'],['#f1c40f','#9a7d0a'],['#9b59b6','#5b2c6f'],['#e67e22','#935116'],['#1abc9c','#117a65'],['#ecf0f1','#7f8c8d'],['#ff6fb5','#a8336f']];
// ---------- Music ----------
const Music={timer:null,step:0,next:0,mood:'good',
 start(){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();actx.resume&&actx.resume()}catch(e){}if(!this.timer)this.timer=setInterval(()=>this.tick(),60)},
 tone(m,d,type,v,t){const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.value=440*Math.pow(2,(m-69)/12);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+d+.02)},
 tick(){if(muted||HEADLESS||!actx||!running||paused)return;const bpm={good:112,boom:128,bad:96,crisis:140}[this.mood],spb=60/bpm/2,now=actx.currentTime;if(this.next<now)this.next=now+.05;
  while(this.next<now+.25){const s=this.step,t=this.next,M=this.mood;
   const prog={good:[48,45,41,43],boom:[50,47,43,45],bad:[45,41,40,43],crisis:[45,46,45,44]}[M],root=prog[Math.floor(s/8)%4];
   const ch={good:[0,4,7,12,7,4,0,7],boom:[0,4,7,11,12,11,7,4],bad:[0,3,7,10,7,3,0,3],crisis:[0,3,6,9,6,3,0,6]}[M];
   this.tone(root+24+ch[s%8],.12,'square',.010,t);
   if(s%2===0)this.tone(root,.25,'triangle',.035,t);
   if(s%4===2)this.tone(96,.03,'square',.004,t);
   if(M==='good'&&s%16===12)this.tone(root+36,.3,'sine',.012,t);
   this.step=(s+1)%32;this.next+=spb}}};

// ---------- Data ----------
const EC=window.ECON;
const TRAITS=[
 {id:'builder',n:'Perfectionist Builder',buf:3,ads:.7,hire:.9,loan:.8,design:2.5,insure:1},
 {id:'hustler',n:'Relentless Hustler',buf:2,ads:1.3,hire:1.1,loan:1.1,design:1,insure:1},
 {id:'hype',n:'Hype Machine',buf:1.5,ads:1.8,hire:1.1,loan:1.2,design:.8,insure:.8},
 {id:'cautious',n:'Anxious Accountant',buf:4,ads:.6,hire:.7,loan:.6,design:1.5,insure:1},
 {id:'reckless',n:'YOLO Optimizer',buf:1,ads:1.5,hire:1.5,loan:1.6,design:.7,insure:.6},
 {id:'social',n:'Team Player',buf:2.5,ads:1,hire:1.3,loan:1,design:1.2,insure:1}];
const PERKS=[
 {id:'efficient',n:'Low-Power Mode',d:'Works 12h/day instead of 10.'},
 {id:'coder',n:'10x Design Engine',d:'R&D progresses 50% faster.'},
 {id:'charmer',n:'Charming LED Smile',d:'+10% in-store conversion.'},
 {id:'frugal',n:'Haggling Firmware',d:'Negotiates materials 8% cheaper.'},
 {id:'fast',n:'Overclocked Grippers',d:'Packs orders 30% faster.'},
 {id:'viral',n:'Meme-Compatible Face',d:'+50% organic social traffic.'},
 {id:'solar',n:'Solar Panel Hat',d:'Utility bills 30% lower.'},
 {id:'gpu',n:'Product-Photo GPU',d:'+10% online conversion (better photos).'}];
const VERA='Vera Vulture',TESS='Tess Tattle',PAPER='Space Coast Gazette';
const RIVALCO=['MegaMart Online','Temu-ish Bargains','KnockoffKing Ltd','Amazonian Basics','CloneCraft Co'];
const RIVALCEO=['MAXIMUS-9','CHAD-3000','Lord Servo','EXECUTRON','Baron Von Bytes'];
const HUMANS=['Priya','Marcus','Jun','Elena','Dave','Fatima','Kofi','Sam','Olga','Leo','Rosa','Tariq','Mei','Bjorn','Ana','Malik'];
const ROLES={retail:{n:'Retail associate',e:'🧾',wc:'retail',days:6},ship:{n:'Shipping',e:'📦',wc:'mfg',days:5},maker:{n:'Maker',e:'🔨',wc:'mfg',days:5},cs:{n:'Customer service',e:'☎️',wc:'clerical',days:5},eng:{n:'Product engineer',e:'🧪',wc:'clerical',days:5},mkt:{n:'Marketing',e:'📣',wc:'clerical',days:5}};
const ROLE_CAP={retail:[0,2,3,5],ship:[1,1,2,4],maker:[1,2,4,8],cs:[0,1,1,3],eng:[0,0,1,2],mkt:[0,0,1,2]};
const STAGE_LAYOUT=[0,2,3,4];
const OUT={ipo:['🔔','IPO (legendary!)'],acquired:['🤝','Acquired'],survived:['🏁','Still trading after 3 years'],chapter:['📖','Chapter complete']};
const TIER_ICON={sale:'🎉',profit:'✅',ramen:'🍜',k10:'💵',k100:'💯',m1:'🏆',acq:'🤝',ipo:'🔔'};
const UPGRADES=[{id:'legs',n:'Turbo Legs',cost:2500,d:'moves faster between stations'},{id:'battery',n:'Mega Battery',cost:3500,d:'+2h work per day'},{id:'chip',n:'Design Co-processor',cost:6000,d:'+30% R&D'}];
const WORLD_NEWS=['USPS says packages are "mostly round-ish"','Florida man opens shop selling other shops','Space Coast launch delays traffic on US-1 again','Local pelican reportedly unionizing','Mortgage rates do a little dance','Indian River Lagoon looking extra sparkly today','Analysts: "handmade" still the hottest word in retail','Shoppers rediscover the concept of "stores"'];
const LINE_COL=['#e74c3c','#3498db','#2ecc71','#f1c40f'];
function genCompany(){
 const li=FORCE_LINE!=null?FORCE_LINE:RI(0,EC.lines.length-1),ln=EC.lines[li],col=pick(COLORS),perk=pick(PERKS);
 const name=Math.random()<.5?pick(PRE)+pick(NOUN):pick(NOUN)+pick(['ify','tron','matic','bot','verse','zilla','hub']);const sf=pick(SUF);
 const nm=/^[.l]/.test(sf)?name+sf:name+' '+sf;
 return {name:FORCE_LINE!=null&&ln.mode==='pod'?pick(['Benji & Co. Portraits','Space Coast Pet Prints','Benji Paws Studio']):nm,mode:ln.mode||'make',unlockRD:ln.unlockRD||null,line:li,industry:ln.n,unit:ln.u,shape:ln.shape,risk:ln.risk,skus:mkSkus(ln),color:col[0],dark:col[1],model:pick(MODELS),robot:pick(RNAMES)+'-'+RI(1,99),perk:perk.id,perkName:perk.n,perkDesc:perk.d};
}
let FORCE_LINE=null,SAL_PICK='auto',AI_LEVEL='base',COF_ON=false,WI=null;
const salMode=()=>(S&&S.salMode)||(EC.founderSalaryOn?'full':'off');
function founderH(){const m=salMode(),F=EC.founder;if(m==='ai')return EC.ai.hours;if(m==='side')return (S.salHours||F.side.hoursWk)/7;if(m==='full')return F.full.hoursWk/7*(has('efficient')?1.2:1);return has('efficient')?12:EC.founderHours}
const POD=()=>!!(S&&S.co&&S.co.mode==='pod');const unlockRD=()=>(S&&S.co&&S.co.unlockRD)||EC.skuUnlockRD;
const mkSkus=ln=>ln.skus.map(([n,m,b,p,w,q],i)=>{const k={n,m,b,p,p0:p,w,q,i,c:LINE_COL[i]};if(ln.kinds)k.kind=ln.kinds[i];if(ln.variants&&ln.variants[i]){k.v=ln.variants[i].map(([vn,vp,base,ship,wt])=>({n:vn,p:vp,base,ship,wt}));k.p=k.p0=Math.round(k.v.reduce((a,v)=>a+v.p*v.wt,0))}return k});
// ---------- layouts ----------
const LCFG=[{ws:7,ss:5,dk:0,b:1,d:1,th:1},{ws:7,ss:5,dk:0,b:1,d:1,th:1},{ws:9,ss:8,dk:0,b:2,d:2,th:1},{ws:10,ss:10,dk:0,b:3,d:3,th:2},{ws:10,ss:11,dk:6,b:4,d:4,th:2,m:2}];
const LAYOUTS=LCFG.map((c,L)=>{
 const w=c.ws+c.ss+c.dk+2,s0=c.ws+1,s1=s0+c.ss-1,d0=s1+1,st={},solid={};
 const add=(id,x,y,sx,sy,o={})=>{st[id]=Object.assign({id,x,y,sx,sy},o);if(!o.walk)solid[Math.round(y)*40+x]=1};
 add('dock',1,9,1,9,{walk:1});add('desk',2,3,2,4);add('board',4,2,4,3);if(L>=1)add('coffee',6,2,6,3);
 if(L>=2){add('rack',8,2,8,3);add('hire',8,9,8,8)}
 for(let i=0;i<c.b;i++)add('bench'+i,2+i*2,6,2+i*2,7,{type:'bench'});
 if(c.m)for(let i=0;i<c.m;i++)add('machine'+i,4+i*2,9,4+i*2,8,{type:'machine'});
 add('shelf',c.ws,4,c.ws,5);
 if(c.dk){add('pack',d0+1,4,d0+1,5);add('pack1',d0+3,4,d0+3,5,{type:'pack'});add('mat',d0+2,11,d0+2,10,{walk:1});}
 else{add('pack',L>=2?6:4,9,L>=2?6:4,8);add('mat',2,11,2,10,{walk:1})}
 add('door',s0+1,11,s0+1,10,{walk:1});
 for(let i=0;i<c.d;i++)add('disp'+i,s0+1+i*2,4,s0+1+i*2,5,{type:'disp'});
 add('till',s1-1,7,s1,7);if(c.th>1)solid[8*40+s1-1]=1;
 if(L>=3)add('bell',s1,3,s1-1,3);
 const q=[[s1-2,7],[s1-2,8],[s1-2,9]];for(let x=s1-3;x>=s0;x--)q.push([x,9]);
 const cashiers=[[s1,7]];if(c.th>1)cashiers.push([s1,8]);if(L>=4)cashiers.push([s1,6]);
 const deco=[];if(L>=2){deco.push([s1,10]);solid[10*40+s1]=1}
 return {L,w,s0,s1,d0,dk:c.dk,st,solid,queue:q.filter(([x,y])=>!solid[y*40+x]).slice(0,9),cashiers,deco,vanX:c.dk?d0+1:1,cfg:c};
});
const LAY=()=>LAYOUTS[STAGE_LAYOUT[S.stage]];
const ST=id=>LAY().st[id];
const stations=()=>Object.values(LAY().st);
const benches=()=>stations().filter(s=>s.id.startsWith('bench'));
// ---------- pathfinding ----------
function blocked(tx,ty){
 const Ly=LAY();if(ty<2||ty>10||tx<1||tx>Ly.w-2)return true;return !!Ly.solid[ty*40+tx]}
function bfs(fx,fy,gx,gy){
 const key=(x,y)=>y*32+x,prev=new Map([[key(fx,fy),null]]),q=[[fx,fy]];let qi=0;
 while(qi<q.length){const [x,y]=q[qi++];if(x===gx&&y===gy){const p=[];let k=key(x,y);while(k!=null){p.unshift([k%32,Math.floor(k/32)]);k=prev.get(k)}return p.slice(1)}
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(!prev.has(k)&&!blocked(nx,ny)){prev.set(k,key(x,y));q.push([nx,ny])}}}
 return null}
function walk(ent,dt,sp){
 if(!ent.path)ent.path=[];if(!ent.path.length)return true;const [tx,ty]=ent.path[0],gx=tx*T,gy=ty*T,dx=gx-ent.x,dy=gy-ent.y,d=Math.hypot(dx,dy),st=sp*dt;
 if(d<=st){ent.x=gx;ent.y=gy;ent.path.shift()}else{ent.x+=dx/d*st;ent.y+=dy/d*st;if(Math.abs(dx)>1)ent.face=dx>0?1:-1}
 ent.walkT=(ent.walkT||0)+dt;return !ent.path.length}
const tileOf=e=>[Math.round(e.x/T),Math.round(e.y/T)];// ---------- state & calendar ----------
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function nextMonday(){const t=new Date();t.setHours(12,0,0,0);t.setDate(t.getDate()+((8-t.getDay())%7||7));return t.toISOString().slice(0,10)}
const dateOf=(d=S.day)=>{const t=new Date(S.date0+'T12:00:00');t.setDate(t.getDate()+d);return t};
const ymd=t=>t.toISOString().slice(0,10);
const dstr=(d=S.day)=>{const t=dateOf(d);return `${DOW[t.getDay()]} ${MON[t.getMonth()]} ${t.getDate()}, ${t.getFullYear()}`};
const mkey=t=>t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0');
const mname=k=>{const [y,m]=k.split('-');return MON[+m-1]+' '+y};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pois=l=>{if(l<=0)return 0;if(l>40)return Math.max(0,Math.round(l+Math.sqrt(l)*gauss()));let L=Math.exp(-l),k=0,p=1;do{k++;p*=Math.random()}while(p>L);return k-1};
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const binom=(n,p)=>{if(n>60)return clamp(Math.round(n*p+Math.sqrt(n*p*(1-p))*gauss()),0,n);let k=0;for(let i=0;i<n;i++)if(Math.random()<p)k++;return k};
const r2=n=>Math.round(n*100)/100;
function newMonth(k){return {k,rev:{etsy:0,shopify:0,store:0,wholesale:0},shipInc:0,orders:{etsy:0,shopify:0,store:0,wholesale:0},units:{etsy:0,shopify:0,store:0,wholesale:0},traffic:{etsy:0,shopify:0,store:0},
 refunds:0,cogs:0,pack:0,labels:0,fees:{etsy:0,shopify:0,store:0},subs:0,wages:0,burden:0,rent:0,util:0,ins:0,lic:0,ads:0,interest:0,other:0,scrap:0,
 taxCol:0,taxRem:0,matBuy:0,capex:0,loanIn:0,loanOut:0,ffIn:0,eqIn:0,incomeTax:0,cash0:S?S.cash:0,cash1:0,stockouts:0,walkouts:0,late:0,returns:0,cbs:0,produced:0,defects:0,days:0,cogsBy:{etsy:0,shopify:0,store:0,wholesale:0},labelsBy:{etsy:0,shopify:0},packBy:{etsy:0,shopify:0}}}
function newState(){
 const co=genCompany(),tr=pick(TRAITS);co.trait=tr.id;co.traitName=tr.n;
 const F=EC.funding;
 const s={co,date0:nextMonday(),day:0,time:0,cash:Math.round(R(...F.savings)/500)*500,stage:0,
  ch:{etsy:{open:0},shopify:{open:-1,plan:0},store:{open:-1}},
  inv:{s:[0,0,0,0],o:[0,0,0,0]},kits:[0,0,0,0],po:[],backlog:[],rd:0,rating:0,reviews:0,emails:0,customers:0,rep:3,
  staff:[],use:{s:[.3,0,0,0],o:[.6,0,0,0]},ads:{etsy:0,shopify:0},
  mods:{mat:EC.funding?1:1,leadAdd:0,etsyAlgo:1,etsyAlgoT:0,apps:0,press:0,viral:0,viralT:0,knock:1,knockT:0,star:0,closed:0,wageAdd:0,pick:0,label:1,ins:1,rentEsc:1,breakT:0,editors:0,neg:0,sublet:0},
  cc:{limit:Math.round(R(...F.ccLimit)/1000)*1000,bal:0},loans:[],ff:false,mca:null,equity:0,seedDone:false,
  months:[],daily:[],tiers:{},moments:[],log:[],heads:[],flags:{},chain:[],decisions:{},taxDue:0,taxLate:0,
  ytdWages:{},ytdYear:0,lastPrice:{},up:{},energy:100,x:3*32,y:5*32,firstHire:null,rival:{name:pick(RIVALCO),ceo:pick(RIVALCEO)},
  strat:[],robotSav:Math.round(R(...EC.strategy.robotSavings)/1000)*1000,crisis:null,comebacks:0,runId:Date.now().toString(36)+Math.random().toString(36).slice(2,6),
  done:false,outcome:null,peakTTM:0,peakCash:0,insured:true,lifetime:{rev:0,orders:0,units:0}};
 S=s;s.mo=newMonth(mkey(dateOf(0)));s.mo.cash0=s.cash;
 s.mo.lic+=EC.licenses.llc+EC.licenses.btrYr;s.cash-=EC.licenses.llc+EC.licenses.btrYr; // LLC formation + Brevard BTR
 s.salMode=WI?WI.salMode:(SAL_PICK==='auto'?'ai':SAL_PICK);s.aiLevel=WI&&WI.aiLevel?WI.aiLevel:AI_LEVEL;s.overH=WI&&WI.oversight!=null?WI.oversight:EC.ai.oversightHrs;s.humanQC=WI&&WI.humanQC!=null?WI.humanQC:true;s.salHours=WI&&WI.hours?WI.hours:EC.founder.side.hoursWk;s.salRate=WI&&WI.rate?WI.rate:EC.founder.side.rate;
 if(COF_ON&&!WI){const t2=pick(TRAITS.filter(x=>x.id!==s.co.trait));s.cof={trait:t2.id,name:pick(RNAMES)+'-'+RI(1,99),traitName:t2.n,color:pick(COLORS),wins:0,debates:0}}
 if(WI){s.co.skus.forEach(k=>{const m=WI.price[k.i];if(m)k.p=Math.max(1,Math.round(k.p0*m))});if(WI.mix>=.5)s.ch.shopify.open=0}
 brainInit();return s;
}
const has=p=>S.co.perk===p;
const trait=()=>TRAITS.find(t=>t.id===S.co.trait)||TRAITS[0];
const unlocked=()=>S.co.skus.filter(k=>S.rd>=unlockRD()[k.i]&&!k.off);
const roleCount=r=>S.staff.filter(s=>s.role===r).length;
const invS=()=>S.inv.s.reduce((a,b)=>a+b,0),invO=()=>S.inv.o.reduce((a,b)=>a+b,0),invTotal=()=>invS()+invO();
const stageInfo=(st=S.stage)=>EC.stages[st];
// ---------- unit economics ----------
function minWage(t=dateOf()){const d=ymd(t);let w=EC.minWage[0].w;EC.minWage.forEach(m=>{if(d>=m.from)w=m.w});return w}
function hourly(role){const W=EC.wages[role];const base=W.salary?W.salary/2080:W.hr;return Math.max(base,minWage())+(W.salary?0:S.mods.wageAdd)}
function burdenRate(role){const p=EC.payroll;return p.fica+p.wcomp[ROLES[role].wc]/100}
function podCost(k){const P=EC.pod,d=S.flags.premium?1-P.premiumDisc:1;return (k.v?k.v.reduce((a,v)=>a+(v.base*d+v.ship)*v.wt,0):0)+(k.kind==='custom'||k.kind==='podCustom'?k.m*(1+P.revisionRate*P.revisionAI/Math.max(.01,k.m)):0)}
function matCost(k){if(POD())return podCost(k);return k.m*S.mods.mat*(1-(S.mods.neg||0))*(has('frugal')?.92:1)*(1-Math.min(.12,S.rd/2500))}
function labelCost(w){const g=EC.shipGA,ks=Object.keys(g).filter(x=>!isNaN(x)).map(Number).sort((a,b)=>a-b);const key=ks.find(x=>x>=w)||ks[ks.length-1];return g[key]*S.mods.label}
function packCost(w){const p=EC.packaging;return w<=1?p.small:w<=4?p.medium:p.large}
function buildMin(k){return k.b*(1-Math.min(.3,S.rd/1500))*(S.flags.machine?.6:1)*(S.flags.batch?1-EC.strategy.batchSave:1)}
function quality(k){return clamp(k.q+S.rd/400+(S.flags.qc?.1:0),1,5)}
function defectRate(){return Math.max(EC.defectFloor,EC.defectBase-S.rd*.00018-(S.flags.qc?.01:0))}
function etsyOffsitePct(){return S.flags.etsy10k?EC.etsy.offsitePctBig:EC.etsy.offsitePct}
function unitEcon(k,ch){// per-unit contribution for a single-item order on a channel
 const p=k.p,mat=matCost(k),lr=POD()?'cs':'maker',lab=buildMin(k)/60*hourly(lr)*(1+burdenRate(lr))*(POD()&&(k.kind==='custom'||k.kind==='podCustom')?1+EC.pod.revisionRate*EC.pod.revisionMin/Math.max(1,k.b):1),w=k.w;
 let fee=0,label=0,pack=0,shipChg=0;const tax=EC.salesTax.rate;
 if((ch==='etsy'||ch==='shopify')&&!POD()){label=labelCost(w);pack=packCost(w);shipChg=p>=EC.freeShipOver?0:label}
 if(ch==='etsy'){const E=EC.etsy;fee=E.listingFee+E.txnPct*(p+shipChg)+E.payPct*(p+shipChg)*(1+tax)+E.payFixed+E.offsiteShare*Math.min(E.offsiteCap,etsyOffsitePct()*(p+shipChg))}
 else if(ch==='shopify'){const P=EC.shopify.plans[S.ch.shopify.plan||0];fee=P.pct*(p+shipChg)*(1+tax*EC.salesTax.shopifyInStateShare)+P.fixed}
 else if(ch==='store'){fee=(EC.pos.pct*p*(1+tax)+EC.pos.fixed)*.85}
 else if(ch==='wholesale'){return {p:p*.5,mat,lab,pack:0,label:0,shipChg:0,fee:0,net:p*.5-mat-lab,m:(p*.5-mat-lab)/(p*.5)}}
 const ret=(POD()?(k.kind==='digital'||k.kind==='pod'?EC.pod.refundDigital:EC.pod.refundCustom*(salMode()==='ai'&&S.humanQC?1-EC.ai.humanQC.refundCut:1)):ch==='store'?EC.returns.store:EC.returns.online)*p;
 const net=p+shipChg-mat-lab-pack-label-fee-ret;
 return {p,mat:r2(mat),lab:r2(lab),pack:r2(pack),label:r2(label),shipChg:r2(shipChg),fee:r2(fee),ret:r2(ret),net:r2(net),m:net/p};
}
// ---------- daily economics ----------
const usage=k=>S.use.s[k]+S.use.o[k];
const leadDays=()=>RI(...EC.leadDays)+S.mods.leadAdd;
function targets(k){const F=S.fd,z=EC.brain?EC.brain.z:1.65,us=F?Math.max(S.use.s[k]*.6,F.s[k]):S.use.s[k],uo=F?Math.max(S.use.o[k]*.6,F.o[k]):S.use.o[k],ssd=F?z*F.sd[k]*Math.SQRT2:0;const st=S.ch.store.open>=0?Math.max(2,Math.ceil(F?us*6+ssd*.4:us*8)):0;const on=Math.max(2,Math.ceil(F?uo*6+ssd*.6:uo*8))+(S.flags.whole&&S.flags.whole.k===k&&!S.flags.whole.shipped?S.flags.whole.n:0);return {s:st,o:on}}
function storeOpenToday(t){if(POD())return S.ch.store.open>=0&&S.flags.booth===S.day;return S.stage>=1&&S.ch.store.open>=0&&t.getDay()!==0&&S.mods.closed<=0}
function priceF(){const u=unlocked();const avg=u.reduce((a,k)=>a+(k.p0||k.p),0)/Math.max(1,u.length),rel=u.reduce((a,k)=>a+k.p/((k.p0||k.p)*(S.cpi||1)),0)/Math.max(1,u.length);
 return clamp(Math.pow(45/avg,EC.priceExp),.3,1.4)*clamp(Math.pow(rel,-EC.elasticity),.4,1.5)}
function qualF(){const r=S.reviews?S.rating:4.3;return clamp(.4+(r-3)*.45,.35,1.35)}
function etsyViews(t){const E=EC.etsy,u=unlocked().length,listings=u*3;const sales30=S.daily.slice(-30).reduce((a,d)=>a+d.oe,0);
 let v=E.newShopViewsPerDay*(.5+listings*E.viewsPerListing)*Math.pow(1+S.reviews/E.reviewBoost,E.reviewExp)*Math.pow(1+sales30/40,E.salesExp)*S.mods.etsyAlgo*(S.mods.editors>0?1.5:1);
 v+=(S.audience||0)*EC.socialSessions/2;v*=EC.season[t.getMonth()]*(S.mods.viralT>0?S.mods.viral:1);return Math.min(E.maxViews,v)+S.ads.etsy/.45}
function shopSessions(t){const P=EC.shopify;S.emails*=1-P.emailChurn;let org=(P.organicBase+S.emails*P.emailRate+S.rep*.6)*(has('viral')?1.5:1)+(S.mods.press>0?40:0)+roleCount('mkt')*45;
 org+=(S.audience||0)*EC.socialSessions;org*=EC.season[t.getMonth()]*(S.mods.viralT>0?S.mods.viral:1);return org+S.ads.shopify/P.cpc}
function pickSku(){const u=unlocked();const w=u.map(k=>1/(1+k.i*.7)*Math.pow(clamp(k.p/((k.p0||k.p)*(S.cpi||1)),.5,2),-EC.elasticity)*(S.feature===k.i?1+EC.brain.featureBoost:1));let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<u.length;i++){r-=w[i];if(r<=0)return u[i].i}return u[0].i}
function econDay(){
 const t=dateOf(),dow=t.getDay(),mon=t.getMonth(),sea=EC.season[mon];
 const D={d:S.day,date:dstr(),dow,mon,store:{open:false,visitors:0,sales:[],stockout:0,walk:0},online:[],shipped:0,late:0,cancel:0,produced:[0,0,0,0],scrap:0,tickets:0,unans:0,rd:0,hours:{},robot:{store:0,pack:0,cs:0,make:0,design:0,admin:0},
  rev:0,cogs:0,fees:0,labor:0,arrived:[],returns:0,cbs:0,rain:Math.random()<EC.rainDays[mon]/30};
 const tr=trait(),qf=qualF(),pf=priceF();
 // staff hours today
 let H={retail:0,ship:0,maker:0,cs:0,eng:0,mkt:0},labor=0,burden=0;const yr=t.getFullYear();if(S.ytdYear!==yr){S.ytdYear=yr;S.ytdWages={}}
 S.staff.forEach(s=>{const R0=ROLES[s.role];const works=R0.days===6?dow!==0:(dow>0&&dow<6);if(!works||s.leaveT>0)return;
  const eff=s.morale<30?.6:s.morale<50?.85:1,h=s.role==='retail'&&S.sched?S.sched.retail:EC.hoursPerDay;H[s.role]+=h*eff;
  const pay=h*hourly(s.role);labor+=pay;const P=EC.payroll,ytd=S.ytdWages[s.name]||0;
  let b=pay*burdenRate(s.role)+Math.max(0,Math.min(pay,P.futaBase-ytd))*(P.futa+P.suta);burden+=b;S.ytdWages[s.name]=ytd+pay;
  s.morale=clamp(s.morale-(s.role==='retail'&&D.store.visitors>120?.25:.06)+(S.flags.perks?.05:0),0,100)});
 D.hours=H;const sm=salMode();let robotH=founderH()+(sm==='side'?0:(S.up.battery?2:0)+(S.flags.longH?EC.strategy.longHours:0));if(sm==='side'&&storeOpenToday(t))robotH+=EC.founder.boothHours;const AIM=sm==='ai';let phys=AIM?EC.ai.physDayH+(!POD()&&S.rd>=EC.ai.nightRD?EC.ai.nightBatchH:0):1e9;
 {const fp=AIM?((S.overH||0)/7+(storeOpenToday(t)?EC.founder.boothHours:0))*(S.salRate||EC.founder.side.rate):sm==='side'?robotH*(S.salRate||EC.founder.side.rate):sm==='full'?EC.founder.full.salary/365:0;if(fp){S.mo.wages+=fp;S.mo.founderPay=(S.mo.founderPay||0)+fp;S.cash-=fp;D.founderPay=fp}}if(S.mods.breakT>0)robotH-=2;if(S.flags.gig){robotH-=EC.strategy.gigHours;const g=EC.strategy.gigRate*EC.strategy.gigHours*(dow>0&&dow<6?1:0);S.cash+=g;S.mo.eqIn+=g;S.lifetime.gig=(S.lifetime.gig||0)+g}
 // ---- store ----
 if(storeOpenToday(t)){D.store.open=true;
  const dowF=[0,.8,.85,.9,1,1.15,1.45][dow],wf=D.rain?.8:1;
  const vis=pois((WI?WI.traffic:1)*(POD()?EC.pod.booth.visitors:EC.store.footfall[S.stage])*(.45+S.rep/90)*sea*dowF*wf*(S.mods.press>0?1.25:1));D.store.visitors=vis;
  let cover=H.retail;if(cover<7){const need=Math.min(8-cover,robotH,AIM&&POD()?(cover=Math.max(cover,EC.founder.boothHours),0):phys);if(!(AIM&&POD()))phys-=need;D.robot.store=need;robotH-=need;cover+=need}
  const cap=cover*10;// ~10 checkouts/hour per staffed hour (est)
  const conv=(POD()?EC.pod.booth.conv:EC.store.conv)*qf*pf*(has('charmer')?1.1:1);let buyers=binom(vis,clamp(conv,0,.6));
  if(buyers>cap){D.store.walk+=buyers-cap;buyers=Math.floor(cap)}
  for(let i=0;i<buyers;i++){const n=Math.random()<.2?2:1;let k=pickSku();if(!POD()&&S.inv.s[k]<n){const alt=unlocked().find(x=>S.inv.s[x.i]>=n);if(alt&&Math.random()<.5)k=alt.i;else{D.store.stockout++;continue}}
   if(!POD())S.inv.s[k]-=n;D.store.sales.push({k,n,t:R(.05,.95)})}
 }
 // ---- online demand ----
 const ord=[];
 if(S.ch.etsy.open>=0){const v=etsyViews(t);S.mo.traffic.etsy+=v;const c=(WI?WI.traffic:1)*(AIM?1+EC.ai.replyLift:1)*EC.etsy.conv*qf*pf*S.mods.knock*(has('gpu')?1.1:1)*(S.mods.star?1.1:1);const n=pois(v*c);for(let i=0;i<n;i++)ord.push({ch:'etsy',k:pickSku(),day:S.day,t:R(0,1)});D.ev=v}
 if(S.ch.shopify.open>=0){const v=shopSessions(t);S.mo.traffic.shopify+=v;const c=(WI?WI.traffic:1)*(AIM?1+EC.ai.replyLift:1)*EC.shopify.conv*qf*pf*S.mods.knock*(has('gpu')?1.1:1);const n=pois(v*c);for(let i=0;i<n;i++)ord.push({ch:'shopify',k:pickSku(),day:S.day,t:R(0,1)});D.sv=v}
 if(D.store.open)S.mo.traffic.store+=D.store.visitors;
 D.online=ord;S.backlog.push(...ord);
 // ---- packing / shipping ----
 const podMin=POD()&&S.backlog.length?S.backlog.reduce((a,o)=>a+buildMin(S.co.skus[o.k]),0)/S.backlog.length:0;const packMin=POD()?Math.max(.5,podMin):EC.packMin*(has('fast')?.7:1);let packCap=Math.floor((POD()?H.cs*.6+H.ship:H.ship)*60/packMin);
 const needPack=S.backlog.filter(o=>POD()||S.inv.o[o.k]>0).length;
 if(needPack>packCap){const h=Math.min(robotH,POD()?1e9:phys,(needPack-packCap)*packMin/60);if(!POD())phys-=h;D.robot.pack=h;robotH-=h;packCap+=Math.floor(h*60/packMin)}
 const keep=[];for(const o of S.backlog){if(packCap>0&&(POD()||S.inv.o[o.k]>0)){if(!POD())S.inv.o[o.k]--;packCap--;D.shipped++;shipOrder(o,D);if(S.day-o.day>3){D.late++}}else if(S.day-o.day>10){D.cancel++;refundCancel(o)}else keep.push(o)}
 S.backlog=keep;
 // ---- customer service ----
 D.tickets=Math.round((ord.length+D.store.sales.length*.2)*EC.supportTicketRate+D.late*.5+R(0,.6));let csCap=H.cs*60/EC.ticketMin;
 if(D.tickets>csCap){const h=Math.min(robotH,AIM?24:1.5,(D.tickets-csCap)*EC.ticketMin/60);D.robot.cs=h;robotH-=h;csCap+=h*60/EC.ticketMin}
 D.unans=Math.max(0,Math.round(D.tickets-csCap));
 if(AIM){const L=EC.ai.levels[S.aiLevel||'base'],c=L.base/30.4+D.online.length*L.perOrder+D.tickets*L.perMsg;S.mo.aiOp=(S.mo.aiOp||0)+c;S.cash-=c;D.aiOp=c;
  if(S.humanQC&&POD()){const nC=D.online.filter(o=>{const k=S.co.skus[o.k];return k.kind==='custom'||k.kind==='podCustom'}).length,q=nC*EC.ai.humanQC.minPerOrder/60*(S.salRate||EC.founder.side.rate);if(q){S.mo.wages+=q;S.mo.founderPay=(S.mo.founderPay||0)+q;S.cash-=q}}}
 // ---- admin (books, listings, reorders) ----
 const adm=Math.min(robotH,(salMode()==='side'?.1:.5)+S.staff.length*.1);D.robot.admin=adm;robotH-=adm;
 // ---- design minimum (trait) ----
 const dmin=Math.min(robotH,tr.design*(S.day<5?0:1));robotH-=dmin;
 // ---- production ----
 let makerMin=H.maker*60;const u=unlocked();let robotMade=0;
 const want=u.map(k=>{const T0=targets(k.i);return {k,need:Math.max(0,T0.s-S.inv.s[k.i])+Math.max(0,T0.o-S.inv.o[k.i]+S.backlog.filter(o=>o.k===k.i).length)}}).filter(w=>w.need>0&&!POD()).sort((a,b)=>{const pa=S.mixPM?S.mixPM.indexOf(a.k.i):0,pb=S.mixPM?S.mixPM.indexOf(b.k.i):0;return b.need/Math.max(.1,usage(b.k.i))*(1-pb*.1)-a.need/Math.max(.1,usage(a.k.i))*(1-pa*.1)});
 const dr=defectRate();
 for(const w of want){let n=0;const bm=buildMin(w.k);while(n<w.need&&S.kits[w.k.i]>0){if(makerMin>=bm)makerMin-=bm;else if(robotH*60>=bm&&phys*60>=bm){robotH-=bm/60;phys-=bm/60;robotMade+=bm/60}else break;S.kits[w.k.i]--;n++;
   if(Math.random()<dr){if(Math.random()<EC.qcCatch){D.scrap++;S.mo.scrap+=matCost(w.k);continue}else S.flags.escaped=(S.flags.escaped||0)+1}
   D.produced[w.k.i]++;const T0=targets(w.k.i);if(S.inv.s[w.k.i]<T0.s&&S.ch.store.open>=0)S.inv.s[w.k.i]++;else S.inv.o[w.k.i]++}}
 D.robot.make=robotMade;
 // ---- R&D ----
 const soc=robotH*.45;D.robot.social=soc;robotH-=soc;S.audience=(S.audience||0)*.995+(AIM?Math.min(soc,EC.ai.socialCapH):soc)*EC.socialPerHour*(has('viral')?1.5:1);// content marketing hours → followers (est)
 const rdH=H.eng+dmin+robotH;D.robot.design=dmin+robotH;if(AIM)D.robot.design=Math.min(D.robot.design,EC.ai.designCapH);robotH=0;
 const rd0=S.rd;S.rd+=(H.eng*.5+(dmin+D.robot.design-dmin)*.12*(POD()?3:1))*(has('coder')?1.5:1)*(S.up.chip?1.3:1);D.rd=S.rd-rd0;
 // ---- store revenue ----
 let rv=0,fees=0,cogs=0;for(const s of D.store.sales){const k=S.co.skus[s.k],p=k.p*s.n;rv+=p;const tax=p*EC.salesTax.rate;S.taxDue+=tax;S.mo.taxCol+=tax;const f=Math.random()<.85?EC.pos.pct*(p+tax)+EC.pos.fixed:0;fees+=f;cogs+=matCost(k)*s.n;S.mo.units.store+=s.n;S.mo.orders.store++;S.customers+=Math.random()<.7?1:0;if(Math.random()<.25)S.emails++}
 S.mo.rev.store+=rv;S.mo.fees.store+=fees;S.mo.cogs+=cogs;S.mo.cogsBy.store+=cogs;D.rev+=rv;
 if(D.store.open){const ret=binom(D.store.sales.length,EC.returns.store);if(ret){const ref=ret*S.co.skus[D.store.sales[0].k].p;S.mo.refunds+=ref;S.cash-=ref;D.returns+=ret}}
 S.cash+=rv-fees;
 // ---- supplier deliveries ----
 S.po=S.po.filter(p=>{if(p.eta<=S.day){S.kits[p.k]+=p.q;D.arrived.push(p);return false}return true});
 // ---- payroll ----
 S.mo.wages+=labor;S.mo.burden+=burden;S.cash-=labor+burden;D.labor=labor+burden;
 // ---- ads ----
 const adSpend=S.ads.etsy+S.ads.shopify;S.mo.ads+=adSpend;S.cash-=adSpend;
 // ---- MCA remittance ----
 if(S.mca){const pay=Math.min(S.mca.bal,D.rev*.15+5);S.mca.bal-=pay;S.cash-=pay;S.mo.loanOut+=pay*.77;S.mo.interest+=pay*.23;if(S.mca.bal<=1)S.mca=null}
 // ---- reviews & rating ----
 const revs=binom(D.shipped+D.store.sales.length,S.flags.revReq?EC.brain.reviewReqRate:EC.brain.reviewRate);// ~12% of orders leave a review (est)
 for(let i=0;i<revs;i++){const u2=unlocked();const k=pick(u2);let r=quality(k)+R(-.6,.5)-(D.late?.6*D.late/Math.max(1,D.shipped):0)-(D.unans?.4:0)-(D.store.walk>3?.2:0);if(r<3&&S.flags.revReq&&Math.random()<EC.brain.replyFix)r+=1.5;review(r)}
 if(D.unans>3)S.rep=clamp(S.rep-.1,0,100);
 S.rep=clamp(S.rep+(D.store.sales.length*.015+D.shipped*.01)*(1-S.rep/100)+(S.mods.press>0?.15:0)+roleCount('mkt')*.05-(S.rep>40?.02:0),0,100);
 // ---- usage EMA ----
 const sold=[0,0,0,0],soldO=[0,0,0,0];D.store.sales.forEach(s=>sold[s.k]+=s.n);ord.forEach(o=>soldO[o.k]++);
 for(let k=0;k<4;k++){if(S.ch.store.open>=0&&D.store.open)S.use.s[k]=S.use.s[k]*.9+sold[k]*.1;S.use.o[k]=S.use.o[k]*.93+soldO[k]*.07}
 brainDay(sold,ord,D);
 // ---- decay mods ----
 const M=S.mods;['press','viralT','knockT','etsyAlgoT','closed','breakT','editors'].forEach(x=>{if(M[x]>0)M[x]--});if(M.knockT<=0)M.knock=1;if(M.etsyAlgoT<=0)M.etsyAlgo=1;
 S.staff.forEach(s=>{if(s.leaveT>0){s.leaveT--}});
 // ---- record ----
 D.stockouts=D.store.stockout+S.backlog.filter(o=>S.inv.o[o.k]<=0).length*0;S.mo.stockouts+=D.store.stockout;S.mo.walkouts+=D.store.walk;S.mo.late+=D.late;S.mo.produced+=D.produced.reduce((a,b)=>a+b,0);S.mo.defects+=D.scrap;S.mo.days++;
 S.daily.push({d:S.day,cash:Math.round(S.cash),rev:Math.round(D.rev),oe:ord.filter(o=>o.ch==='etsy').length,os:ord.filter(o=>o.ch==='shopify').length,ss:D.store.sales.length,inv:invTotal(),bl:S.backlog.length,rt:S.rating});if(S.daily.length>400)S.daily.shift();
 S.lifetime.rev+=D.rev;S.peakCash=Math.max(S.peakCash,S.cash);
 return D;
}
function review(r){r=clamp(r,1,5);S.rating=S.reviews?S.rating*.97+r*.03:r;S.reviews++}
function shipOrder(o,D){const k=S.co.skus[o.k],p=k.p,w=k.w,pd=POD(),lab=pd?0:labelCost(w),pk=pd?0:packCost(w),chg=pd||p>=EC.freeShipOver?0:lab,tax=pd&&(k.kind==='digital'||k.kind==='custom')?0:EC.salesTax.rate;let fee=0;
 if(pd){S.lifetime.podOut=(S.lifetime.podOut||0)+(k.v?1:0);S.lifetime.digital=(S.lifetime.digital||0)+(k.v?0:1);if(k.v&&Math.random()<EC.pod.partnerDefect){S.lifetime.reprints=(S.lifetime.reprints||0)+1;D.late++}}
 if(o.ch==='etsy'){const E=EC.etsy;fee=E.listingFee+E.txnPct*(p+chg)+E.payPct*(p+chg)*(1+tax)+E.payFixed+(Math.random()<E.offsiteShare?Math.min(E.offsiteCap,etsyOffsitePct()*(p+chg)):0)}
 else{const P=EC.shopify.plans[S.ch.shopify.plan||0];const inState=Math.random()<EC.salesTax.shopifyInStateShare;const tx=inState?p*tax:0;if(tx){S.taxDue+=tx;S.mo.taxCol+=tx}fee=P.pct*(p+chg+tx)+P.fixed;S.emails+=Math.random()<.6?1:0}
 const M=S.mo;M.rev[o.ch]+=p;M.shipInc+=chg;M.orders[o.ch]++;M.units[o.ch]++;M.fees[o.ch]+=fee;M.labels+=lab;M.pack+=pk;M.cogs+=matCost(k);M.cogsBy[o.ch]+=matCost(k);M.labelsBy[o.ch]+=lab-chg;M.packBy[o.ch]+=pk;
 S.cash+=p+chg-fee-lab-pk;D.rev+=p;S.customers++;S.lifetime.orders++;if(!S.tiers.sale){S.tiers.sale=S.day;moment('🎉 First sale! ('+o.ch+')');milestone('First sale')}
 if(S.flags.bundle&&Math.random()<EC.brain.attach){const ks=unlocked().filter(x=>x.i!==o.k&&(pd||S.inv.o[x.i]>0)).sort((a,b)=>a.p-b.p)[0];if(ks){const p2=ks.p*(1-EC.brain.bundleDisc),f2=o.ch==='etsy'?(EC.etsy.txnPct+EC.etsy.payPct)*p2:EC.shopify.plans[S.ch.shopify.plan||0].pct*p2;if(!pd)S.inv.o[ks.i]--;M.rev[o.ch]+=p2;M.units[o.ch]++;M.cogs+=matCost(ks);M.cogsBy[o.ch]+=matCost(ks);M.fees[o.ch]+=f2;S.cash+=p2-f2;D.rev+=p2;S.lifetime.bundles=(S.lifetime.bundles||0)+1}}
 // returns & chargebacks (resolved immediately, simplified)
 const esc=S.flags.escaped>0?(S.flags.escaped--,.5):0;
 if(Math.random()<(pd?(k.kind==='digital'||k.kind==='pod'?EC.pod.refundDigital:EC.pod.refundCustom*(salMode()==='ai'&&S.humanQC?1-EC.ai.humanQC.refundCut:1)):EC.returns.online)+esc){M.refunds+=p;M.returns++;S.cash-=p;D.returns++;if(esc)review(1.5)}
 if(Math.random()<EC.chargeback.rate){M.refunds+=p;M.other+=EC.chargeback.fee;M.cbs++;S.cash-=p+EC.chargeback.fee;D.cbs++}
}
function refundCancel(o){review(1.2);S.mo.late++}
// ---------- monthly close ----------
function monthCosts(){// fixed monthly costs charged on the 1st
 const st=stageInfo(),M=S.mo;let rent=0,util=0;
 if(S.stage>0){rent=(st.retailSf*(EC.retailRentSfYr+EC.nnnSfYr)+st.flexSf*(EC.flexRentSfYr+EC.nnnSfYr)*(1-(S.mods.sublet?EC.strategy.subletShare:0)))/12*S.mods.rentEsc;util=st.retailSf*EC.utilRetailSfMo+st.flexSf*EC.utilFlexSfMo}else util=EC.homeUtilMo;
 if(has('solar'))util*=.7;
 const ins=S.insured?(EC.insurance.glMo+EC.insurance.plMo[S.co.risk])*S.mods.ins*(1+S.stage*.5):0;
 let subs=0;if(S.ch.shopify.open>=0)subs+=EC.shopify.plans[S.ch.shopify.plan].mo+EC.shopify.appsMo+S.mods.apps;if(S.flags.qc)subs+=0;if(POD()){subs+=EC.pod.aiSubMo+(S.flags.premium?EC.pod.premiumMo:0)}
 M.rent+=rent;M.util+=util;M.ins+=ins;M.subs+=subs;S.cash-=rent+util+ins+subs;
 // loans
 S.loans.forEach(l=>{if(l.bal<=0)return;const int=l.bal*l.apr/12,pr=(S.deferTo||0)>S.day?0:Math.min(l.bal,l.pay-int);l.bal-=pr;M.interest+=int;M.loanOut+=pr;S.cash-=int+pr});S.loans=S.loans.filter(l=>l.bal>1);
 if(S.cc.bal>0){const int=S.cc.bal*EC.funding.ccApr/12;M.interest+=int;S.cash-=int}
 // Florida LLC annual report each May (after first year)
 if(dateOf().getMonth()===4&&S.day>120){M.lic+=EC.licenses.annualReport;S.cash-=EC.licenses.annualReport}
 if(dateOf().getMonth()===9&&S.day>200){M.lic+=EC.licenses.btrYr;S.cash-=EC.licenses.btrYr}
}
function pnl(m){const rev=m.rev.etsy+m.rev.shopify+m.rev.store+m.rev.wholesale;const net_rev=rev-m.refunds;const shipNet=m.labels-m.shipInc;
 const cogs=m.cogs+m.pack+shipNet+m.scrap;const gm=net_rev-cogs;const fees=m.fees.etsy+m.fees.shopify+m.fees.store+m.subs;const labor=m.wages+m.burden;
 const opex=fees+labor+m.rent+m.util+m.ins+m.lic+m.ads+m.other+(m.aiOp||0);const ebit=gm-opex;const net=ebit-m.interest;return {rev,net_rev,cogs,gm,gmPct:net_rev?gm/net_rev:0,fees,labor,opex,ebit,net,shipNet}}
function closeMonth(){const m=S.mo;const P=pnl(m);
 // income tax set-aside: 25% of positive YTD net not yet reserved (simplified; paid as estimates)
 const yr=m.k.slice(0,4),ytd=S.months.filter(x=>x.k.startsWith(yr));const ytdNet=ytd.reduce((a,x)=>a+x.P.net,0)+P.net,ytdTax=ytd.reduce((a,x)=>a+x.incomeTax,0);
 const tax=Math.max(0,ytdNet*EC.incomeTax.setAside-ytdTax);m.incomeTax=tax;S.cash-=tax;P.afterTax=P.net-tax;
 // sales tax remitted by the 20th (we remit at month close)
 const owe=S.taxDue;if(S.cash>owe||S.cash+S.cc.limit-S.cc.bal>owe){m.taxRem=owe;S.cash-=owe;S.taxDue=0}else{S.taxLate+=owe;m.taxRem=0;log(`⚠️ Couldn't remit ${fmt(owe)} sales tax on time. That's the state's money, not ours — very bad.`,'r')}
 m.cash1=S.cash;m.P=P;m.ccBal=S.cc.bal;m.debt=debt();m.staff=S.staff.length;m.inv=Math.round(invValue());m.rating=S.rating;S.months.push(m);
 const t=dateOf();S.mo=newMonth(mkey(t));S.mo.cash0=S.cash;monthCosts();
 tiersCheck(m);return m}
const ttm=()=>S.months.slice(-12);
const ttmRev=()=>ttm().reduce((a,m)=>a+m.P.rev,0);
const ttmNet=()=>ttm().reduce((a,m)=>a+m.P.net,0);
const debt=()=>S.cc.bal+S.loans.reduce((a,l)=>a+l.bal,0)+(S.mca?S.mca.bal:0);
const invValue=()=>S.co.skus.reduce((a,k)=>a+(S.inv.s[k.i]+S.inv.o[k.i]+S.kits[k.i])*matCost(k),0);
function monthlyFixed(){const st=stageInfo();let f=0;if(S.stage>0)f+=(st.retailSf*(EC.retailRentSfYr+EC.nnnSfYr)+st.flexSf*(EC.flexRentSfYr+EC.nnnSfYr)*(1-(S.mods.sublet?EC.strategy.subletShare:0)))/12*S.mods.rentEsc+st.retailSf*EC.utilRetailSfMo+st.flexSf*EC.utilFlexSfMo;else f+=EC.homeUtilMo;
 f+=EC.insurance.glMo+EC.insurance.plMo[S.co.risk];if(S.ch.shopify.open>=0)f+=EC.shopify.plans[S.ch.shopify.plan].mo+EC.shopify.appsMo+S.mods.apps;
 f+=S.staff.reduce((a,s)=>a+hourly(s.role)*(1+burdenRate(s.role)+.02)*EC.hoursPerDay*(ROLES[s.role].days===6?26:21.7),0);
 f+=S.loans.reduce((a,l)=>a+l.pay,0);return f}
function breakEven(){// monthly revenue needed: fixed / contribution margin %
 const ms=S.months.slice(-3);if(!ms.length)return null;const rev=ms.reduce((a,m)=>a+m.P.net_rev,0);if(rev<=0)return null;
 const varC=ms.reduce((a,m)=>a+m.P.cogs+m.fees.etsy+m.fees.shopify+m.fees.store,0);const cm=1-varC/rev;if(cm<=0)return null;return monthlyFixed()/cm}
function tiersCheck(m){const t=S.tiers,P=m.P,rv=ttmRev();
 const hit=(id,txt)=>{if(t[id])return;t[id]=S.day;moment(TIER_ICON[id]+' '+txt);milestone(txt)};
 if(P.net>0)hit('profit',`First profitable month (${mname(m.k)}: ${fmt(P.net)} net)`);
 if(P.net>=2500)hit('ramen',`Ramen profitable — ${fmt(P.net)} net in ${mname(m.k)}`);
 if(P.rev>=10000)hit('k10',`$10k revenue month (${fmt(P.rev)})`);
 if(rv>=100000)hit('k100',`$100k trailing-12-month revenue`);
 if(rv>=1e6)hit('m1',`$1M trailing-12-month revenue!`);
 if(rv>=S.peakTTM)S.peakTTM=rv;
 if(rv>=1e6)S.flags.etsy10k=1;if(S.months.slice(-12).reduce((a,x)=>a+x.rev.etsy,0)>=10000)S.flags.etsy10k=1;
}
// ---------- planner (the robot's brain) ----------
const dec=k=>{S.decisions[k]=(S.decisions[k]||0)+1};
function liquidity(){return S.cash+(S.cc.limit-S.cc.bal)}
function burnMo(){const ms=S.months.slice(-2);const avg=ms.length?ms.reduce((a,m)=>a+m.P.net,0)/ms.length:-monthlyFixed();return avg}
function runwayMo(){const b=burnMo();return b>=0?99:liquidity()/(-b)}
function spend(amt,why){// pay from cash, draw on credit card if needed
 S.cash-=amt;if(S.cash<0){const draw=Math.min(-S.cash+200,S.cc.limit-S.cc.bal);if(draw>0){S.cc.bal+=draw;S.cash+=draw;if(!S.flags.ccUsed){S.flags.ccUsed=1;think(`Cash dipped below zero. Swiping the business credit card (${(EC.funding.ccApr*100).toFixed(1)}% APR). Ouch.`,'r')}}}}
function payCard(){if(S.cc.bal>0){const spare=S.cash-Math.max(3000,monthlyFixed()*1.2);if(spare>100){const p=Math.min(spare,S.cc.bal);S.cc.bal-=p;S.cash-=p}}}
function planner(D0){
 const t=dateOf(),tr=trait(),u=unlocked();
 // 1) reorder materials using reorder point = usage × (lead time + safety days)
 for(const k of (POD()?[]:u)){const use=Math.max(.15,usage(k.i)),inbound=S.po.filter(p=>p.k===k.i).reduce((a,p)=>a+p.q,0),avgLead=(EC.leadDays[0]+EC.leadDays[1])/2+S.mods.leadAdd;
  const F=S.fd,fu=F?Math.max(use*.5,F.s[k.i]+F.o[k.i],.15):use,ss=F?EC.brain.z*Math.max(.3,F.sd[k.i])*Math.sqrt(avgLead):use*4;const rop=Math.ceil(fu*avgLead+ss+S.backlog.filter(o=>o.k===k.i).length);const pos=S.kits[k.i]+inbound;
  if(pos<rop){let q=Math.max(8,Math.ceil(fu*30));const c=matCost(k);let terms=false;if(q*c>liquidity()*.4)q=Math.max(3,Math.floor(liquidity()*.4/c));if(liquidity()<q*c||q<3){if(!S.crisis||S.lifetime.orders<40||(S.ap||[]).reduce((x,y)=>x+y.amt,0)>monthlyFixed()*2+5000)continue;q=Math.max(3,Math.ceil(use*14));terms=true}
   const L=leadDays();S.po.push({k:k.i,q,eta:S.day+L,cost:q*c});S.mo.matBuy+=q*c;if(terms){(S.ap=S.ap||[]).push({due:S.day+30,amt:q*c});if(!S.flags.termsT||S.day-S.flags.termsT>60){S.flags.termsT=S.day;smove('terms',`Cash is tight, so ${k.n} kits go on net-30 supplier terms (${fmt(Math.round(q*c))}) to keep production running.`)}}else spend(q*c);dec('reorder');
   if(Math.random()<.35||S.day<3)think(L>9?`${k.n} kits: ${pos} on hand+inbound vs reorder point ${rop}. Ordering ${q} (${fmt(q*c)}); supplier says ${L} days. Safety stock it is.`:`Reorder point hit for ${k.n} (${pos} ≤ ${rop}). Ordering ${q} kits for ${fmt(q*c)}, ETA ${L} days.`)}}
 // 2) weekly review on Mondays
 if(S.ap&&S.ap.length){S.ap=S.ap.filter(x=>{if(x.due<=S.day){spend(x.amt);return false}return true})}
 if(t.getDay()===1&&S.day>0){weekly();strategy();brainWeek()}
 if(S.promo&&S.day>=S.promo.end){S.co.skus.forEach((k,i)=>k.p=S.promo.p[i]);S.promo=null;think('Black Friday weekend is over. Prices back to normal.','t')}
 // 3) cash crunch → financing or layoffs or closure
 if(S.cash<0||liquidity()<1500)crunch();
 payCard();
}
function avgDaily(f,n=14){const a=S.daily.slice(-n);return a.length?a.reduce((s,d)=>s+f(d),0)/a.length:0}
function lastDays(n){return S.dh.slice(-n)}
function weekly(){const tr=trait(),H=lastDays(14);if(!H.length)return;
 const avg=f=>H.reduce((a,d)=>a+f(d),0)/H.length;
 const rStore=avg(d=>d.robot.store),rPack=avg(d=>d.robot.pack),rMake=avg(d=>d.robot.make),rCS=avg(d=>d.robot.cs),bl=avg(d=>d.bl),unans=avg(d=>d.unans),walk=avg(d=>d.walk),so=avg(d=>d.so),rdes=avg(d=>d.robot.design);
 const runway=runwayMo(),mf=monthlyFixed(),gm=S.months.length?S.months[S.months.length-1].P.gm:0;
 // channels: open Shopify once Etsy proves demand (or cash is comfortable)
 if(S.ch.shopify.open<0&&((S.day>=(S.flags.shopifyEarly?21:35)&&S.mo.orders.etsy+(S.months.length?S.months[S.months.length-1].orders.etsy:0)>=12)||(S.cash>12000&&S.day>20))){S.ch.shopify.open=S.day;dec('open shopify');moment('🛍️ Opened Shopify store (Basic, $39/mo)');milestone('Shopify store live');think(`Etsy proved people want ${S.co.unit}. Opening our own Shopify site: $${EC.shopify.plans[0].mo}/mo + ~$${EC.shopify.appsMo}/mo in apps, 2.9%+30¢ per order, but no 6.5% marketplace cut and we own the customer list.`,'g');news(`${S.co.name} launches its own web store`)}
 if(S.ch.shopify.open>=0&&S.ch.shopify.plan===0&&S.mo.rev.shopify>30000){S.ch.shopify.plan=1;think('Shopify sales over $33k/mo — Grow plan\'s lower card rate now pays for itself.','g');dec('shopify grow')}
 // ads: spend only where marginal ROAS > 1 (contribution per click vs cost per click)
 const ue=u=>unitEcon(u,'shopify');const u0=unlocked();const avgNet=u0.reduce((a,k)=>a+ue(k).net,0)/u0.length;
 const ltv=1.4;// repeat purchase multiplier (est)
 const perClick=EC.shopify.conv*qualF()*priceF()*avgNet*ltv;
 if(S.ch.shopify.open>=0){const want=perClick>EC.shopify.cpc*1.1&&runway>tr.buf?clamp(S.ads.shopify+5*tr.ads,0,Math.min(400,liquidity()/40)):Math.max(0,S.ads.shopify-10);
  if(Math.abs(want-S.ads.shopify)>2){think(want>S.ads.shopify?`Each ad click earns ~${fmt(perClick)} vs ${fmt(EC.shopify.cpc)} CPC. Raising Shopify ads to ${fmt(want)}/day.`:`Paid clicks return ${fmt(perClick)} each but cost ${fmt(EC.shopify.cpc)}. Cutting ads to ${fmt(want)}/day.`,'t');dec('ads')}S.ads.shopify=Math.round(want)}
 const etsyNet=u0.reduce((a,k)=>a+unitEcon(k,'etsy').net,0)/u0.length,perE=EC.etsy.conv*qualF()*priceF()*etsyNet;
 S.ads.etsy=perE>.45*1.2&&runway>tr.buf?Math.round(clamp(2*tr.ads+S.months.length,1,25)):0;
 // stage moves: store when online gross margin covers a chunk of the new rent, cash+loan covers buildout + 4 months
 const next=POD()?null:EC.stages[S.stage+1];
 if(next&&S.day-(S.flags.stageDay||0)>90){const nf=(next.retailSf*(EC.retailRentSfYr+EC.nnnSfYr)+next.flexSf*(EC.flexRentSfYr+EC.nnnSfYr))/12+next.retailSf*EC.utilRetailSfMo+next.flexSf*EC.utilFlexSfMo;
  const recent=S.months.slice(-3),gm3=recent.length===3?recent.reduce((a,m)=>a+m.P.gm,0)/3:0,net3=recent.length===3?recent.reduce((a,m)=>a+m.P.net,0)/3:-1;
  const need=next.buildout+nf*4;const reqGM=[1,1.2,1.5][S.stage]*nf*(1/ tr.hire)*(S.flags.storeGate||1);
  if(gm3>reqGM&&net3>0&&(S.cash>need||(S.cash+loanCapacity()>need&&tr.loan>.7))&&leaseGo(next,nf)){if(S.cash<need&&!getLoan(need-S.cash+5000,'expansion'))return;
   S.cash-=next.buildout;S.mo.capex+=next.buildout;S.stage++;S.flags.stageDay=S.day;if(S.stage===1){S.ch.store.open=S.day}
   dec('expand');moment(`🏬 Moved into: ${next.n} (${next.retailSf+next.flexSf} sq ft, ~${fmt(nf)}/mo)`);milestone(next.n);setLevel(S.stage);
   think(`Gross margin is ${fmt(gm3)}/mo — enough to carry ${fmt(nf)}/mo of rent+utilities. Signing the lease. Buildout: ${fmt(next.buildout)}.`,'g');news(`${S.co.name} opens ${next.n.toLowerCase()} in Melbourne`);S.flags.visualNext=1}}
 // hiring by bottleneck (robot has ~10h/day; hire when a role eats its time for weeks)
 const can=role=>roleCount(role)<ROLE_CAP[role][S.stage];
 const cost=role=>hourly(role)*(1+burdenRate(role)+.03)*EC.hoursPerDay*(ROLES[role].days===6?26:21.7);
 const afford=role=>!S.flags.freeze&&(EC.brain.noGates||EC.brain.noCf||!S.cf13||!S.cf13.length||Math.min(...S.cf13)>cost(role))&&runway>tr.buf+1&&(burnMo()>-cost(role)*.1||S.cash>cost(role)*8)&&S.cash>cost(role)*1.5;
 const cands=[];
 if(S.ch.store.open>=0&&rStore>5)cands.push(['retail',rStore*1.2,`I've spent ${rStore.toFixed(1)}h/day behind the counter. Hiring a retail associate at ${fmt(hourly('retail'))}/hr so I can build.`]);
 if(walk>3)cands.push(['retail',walk,`${walk.toFixed(1)} shoppers/day walk out of the checkout line. Another retail associate.`]);
 if(rPack>2.5||bl>Math.max(6,avgDaily(d=>d.oe+d.os)*3))cands.push(['ship',rPack+bl/4,`Packing eats ${rPack.toFixed(1)}h/day and ${Math.round(bl)} orders are waiting. Hiring shipping help.`]);
 if(rMake>3||so>2)cands.push(['maker',rMake+so,`Production is ${rMake.toFixed(1)}h/day of my time and we still stock out ${so.toFixed(1)}×/day. Hiring a maker at ${fmt(hourly('maker'))}/hr.`]);
 if(unans>2||rCS>1.2)cands.push(['cs',unans+rCS,`${unans.toFixed(1)} support tickets/day go unanswered. Reviews are suffering. Hiring customer service.`]);
 if(S.stage>=2&&ttmRev()>300000&&can('eng'))cands.push(['eng',4,`TTM revenue ${fmt(ttmRev())}. A product engineer (${fmt(EC.wages.eng.salary)}/yr) can cut build time and defects.`]);
 if(S.stage>=2&&ttmRev()>400000&&can('mkt'))cands.push(['mkt',2.5,'Hiring marketing to grow owned traffic (email, social) instead of renting clicks.']);
 cands.sort((a,b)=>b[1]-a[1]);
 for(const [role,sc,why] of cands){if(!can(role)||S.day-(S.flags['laid'+role]||-999)<75)continue;if(!afford(role)){if(!S.flags['nohire'+role]||S.day-S.flags['nohire'+role]>40){S.flags['nohire'+role]=S.day;think(`I need a ${ROLES[role].n.toLowerCase()} (${why.split('.')[0].toLowerCase()}), but at ${fmt(cost(role))}/mo fully loaded we can't afford it yet. Working longer instead.`,'t')}continue}
  if(!hireGo(role,cost(role)))continue;hire(role,why);break}
 // layoffs if runway collapses
 if(runway<1.2&&S.staff.length&&burnMo()<0&&S.day-S.staff[S.staff.length-1].hired>45){const s=S.staff[S.staff.length-1];S.flags['laid'+s.role]=S.day;fireStaff(s,`Runway is ${runway.toFixed(1)} months. Laying off ${s.name} (${ROLES[s.role].n}). Worst part of the job.`)}
 // robot upgrades when rich
 for(const up of UPGRADES)if(!S.up[up.id]&&!S.flags['sold'+up.id]&&S.cash>up.cost*8&&runway>6){S.up[up.id]=1;spend(up.cost);S.mo.capex+=up.cost;moment(`🔧 Upgrade: ${up.n}`,false);think(`Treating myself: ${up.n} (${fmt(up.cost)}) — ${up.d}.`,'g');break}
 // morale: social trait / profitable → small perks
 if(S.staff.length>=3&&!S.flags.perks&&burnMo()>2000){S.flags.perks=1;think('Profitable enough for team perks: free coffee and a real break room. Morale matters.','g')}
 if(S.staff.length&&avg(d=>d.mor)<35&&S.cash>5000){S.staff.forEach(s=>s.morale=clamp(s.morale+20,0,100));spend(150*S.staff.length);S.mo.other+=150*S.staff.length;think('Team looks burnt out. Pizza Friday and a half-day off. Cheaper than turnover.','t');dec('morale')}
}
// ================= BRAIN: forecasting · experiments · memory · planning · smarter ops =================
const B_=()=>EC.brain,CHS=['etsy','shopify','store'];
const fmtPct=n=>(n>=0?'+':'')+Math.round(n)+'%';
let SIMMEM=null;const MEMKEY='robotFounderMemory_v1';
function memLoad(){if(HEADLESS)return SIMMEM||(SIMMEM=[]);try{return JSON.parse(localStorage.getItem(MEMKEY))||[]}catch(e){return []}}
function memSave(m){m=m.slice(-60);if(HEADLESS){SIMMEM=m;return}try{localStorage.setItem(MEMKEY,JSON.stringify(m))}catch(e){}}
function learn(key,text,val){S.kb=S.kb||[];const L={key,text,val,co:S.co.name,line:S.co.line,d:S.day};const i=S.kb.findIndex(x=>x.key===key);if(i>=0){if(S.kb[i].text===text)return;S.kb[i]=L}else S.kb.push(L);
 const m=memLoad().filter(x=>!(x.key===key&&x.co===S.co.name));m.push(L);memSave(m);think('📚 Lesson learned: '+text,'g')}
function recall(key){const m=memLoad().filter(x=>x.key===key&&x.co!==(S&&S.co.name));return m.length?m[m.length-1]:null}
function recallAvg(key){const m=memLoad().filter(x=>x.key===key&&x.co!==(S&&S.co.name)).slice(-5);return m.length?m.reduce((a,x)=>a+x.val,0)/m.length:null}
function aov(){const ms=S.months.slice(-2);const r=ms.reduce((a,m)=>a+m.rev.etsy+m.rev.shopify+m.rev.store,0),o=ms.reduce((a,m)=>a+m.orders.etsy+m.orders.shopify+m.orders.store,0);if(o>5)return r/o;const u=unlocked();return u.reduce((a,k)=>a+k.p,0)/Math.max(1,u.length)}
function cmRatio(){const ms=S.months.slice(-2);const nr=ms.reduce((a,m)=>a+m.P.net_rev,0);if(nr<500)return .45;const v=ms.reduce((a,m)=>a+m.P.gm-(m.fees.etsy+m.fees.shopify+m.fees.store),0);return clamp(v/nr,.05,.85)}
const newWacc=()=>({u:{etsy:[0,0,0,0],shopify:[0,0,0,0],store:[0,0,0,0]},rev:0,days:0});
function brainInit(light){Object.assign(S,{fc:{},wh:[],wacc:newWacc(),fcLog:[],exps:[],expDone:[],kb:[],okr:null,okrHist:[],scen:null,scenHist:[],hod:[0,0,0,0,0,0,0,0],sched:{retail:8},adPin:{},inherit:[]});if(light)return;
 const inh=S.inherit;
 S.co.skus.forEach(k=>{const r=recall('price:'+S.co.line+':'+k.i);if(r&&r.val>.8&&r.val<1.4){k.p=Math.round(k.p0*r.val);inh.push(`Lesson from ${r.co}: ${k.n} sells best around ${fmtPct((r.val-1)*100)} vs launch price → starting at $${k.p}.`)}});
 [['etsyAdsAOV',v=>S.flags.etsyAdsMinAOV=v],['shopifyEarly',v=>S.flags.shopifyEarly=v],['storeGate',()=>S.flags.storeGate=recallAvg('storeGate')],['hireEarly',()=>S.flags.hireStrict=recallAvg('hireEarly')],['topTactic',()=>0],['emailWorks',()=>0]].forEach(([k,f])=>{const r=recall(k);if(r){f(r.val);inh.push(`Lesson from ${r.co}: ${r.text}`)}})}
function brainDay(sold,ord,D){if(!S.wacc)brainInit(true);const W=S.wacc;sold.forEach((n,k)=>W.u.store[k]+=n);ord.forEach(o=>W.u[o.ch][o.k]++);W.rev+=D.rev;W.days++;
 if(D.store.open)D.store.sales.forEach(s=>{S.hod[Math.min(7,Math.floor(s.t*8))]+=s.n});
 const sea=EC.season[dateOf().getMonth()];
 for(const e of S.exps){const A=e.d[e.arm];if(!A)continue;A.days++;A.season+=sea;
  if(e.type==='price'){const n=sold[e.k]+ord.filter(o=>o.k===e.k).length;A.u+=n;A.c+=sold.reduce((a,q,k)=>a+q*unitEcon(S.co.skus[k],'store').net,0)+ord.reduce((a,o)=>a+unitEcon(S.co.skus[o.k],o.ch).net,0)}
  else{const o=ord.filter(x=>x.ch===e.ch);A.u+=o.length;A.c+=o.reduce((a,x)=>a+unitEcon(S.co.skus[x.k],e.ch).net,0)-S.ads[e.ch]}}
 emailDay()}
function fcU(c,k,h){const f=S.fc[c]&&S.fc[c][k];if(!f)return 0;let tr=0,p=1;for(let i=1;i<=h;i++){p*=B_().phi;tr+=p}return Math.max(0,f.L+tr*f.T)*EC.season[dateOf(S.day+h*7).getMonth()]}
function fcWeekly(n){const out=[];for(let h=1;h<=n;h++){let u=0,rev=0;CHS.forEach(c=>{if(S.ch[c].open<0)return;for(let k=0;k<4;k++){const x=fcU(c,k,h);u+=x;rev+=x*S.co.skus[k].p}});out.push({h,u,rev})}return out}
function fcConf(){const L=(S.fcLog||[]).filter(x=>x.a!=null&&x.a>50).slice(-8);if(L.length<3)return null;const mape=L.reduce((a,x)=>a+Math.abs(x.f-x.a)/x.a,0)/L.length;return clamp(1-mape,0,1)}
function cashForecast(){const cm=cmRatio(),wk=monthlyFixed()*12/52+(S.ads.etsy+S.ads.shopify)*7;let c=S.cash;const ap=S.ap||[];return (S.fcRev||[]).map((x,i)=>{c+=x.rev*cm-wk-ap.filter(a=>a.due>S.day+i*7&&a.due<=S.day+(i+1)*7).reduce((s,a)=>s+a.amt,0);return Math.round(c)})}
function brainWeek(){const X=B_(),W=S.wacc;if(!W||!W.days){S.wacc=newWacc();return}
 if(S.inherit&&S.inherit.length&&!S.flags.inhLogged){S.flags.inhLogged=1;S.inherit.slice(0,4).forEach(t=>think('📚 '+t,'g'))}
 const sea=EC.season[dateOf(S.day-3).getMonth()],tot=CHS.reduce((a,c)=>a+W.u[c].reduce((x,y)=>x+y,0),0),scale=7/W.days;
 const last=S.fcLog[S.fcLog.length-1];if(last&&last.a==null){last.a=W.rev*scale;last.au=tot*scale}
 S.wh.push({d:S.day,rev:Math.round(W.rev*scale),u:Math.round(tot*scale)});if(S.wh.length>60)S.wh.shift();
 CHS.forEach(c=>{S.fc[c]=S.fc[c]||[];for(let k=0;k<4;k++){const y=W.u[c][k]*scale/sea;const f=S.fc[c][k];if(!f){if(y>0||S.ch[c].open>=0)S.fc[c][k]={L:y,T:0,v:Math.max(.5,y*y*.3)};continue}
  const pred=f.L+X.phi*f.T,err=y-pred;f.L=Math.max(0,pred+X.alpha*err);f.T=X.phi*f.T+X.beta*X.alpha*err;f.v=f.v*.85+.15*err*err}});
 S.fcRev=fcWeekly(13);S.fcLog.push({d:S.day,f:Math.round(S.fcRev[0].rev),a:null});if(S.fcLog.length>60)S.fcLog.shift();S.cf13=cashForecast();
 S.fd={s:[0,0,0,0],o:[0,0,0,0],sd:[0,0,0,0]};for(let k=0;k<4;k++){S.fd.s[k]=(fcU('store',k,1)+fcU('store',k,2))/14;S.fd.o[k]=(fcU('etsy',k,1)+fcU('etsy',k,2)+fcU('shopify',k,1)+fcU('shopify',k,2))/14;S.fd.sd[k]=Math.sqrt(CHS.reduce((a,c)=>a+(S.fc[c]&&S.fc[c][k]?S.fc[c][k].v:0),0)/7)}
 S.wacc=newWacc();
 for(const ch of ['etsy','shopify']){const p=S.adPin[ch];if(p&&p.until>S.day&&!S.exps.some(e=>e.type==='ads'&&e.ch===ch)&&!S.crisis)S.ads[ch]=p.v}
 if(WI&&WI.ads!=null&&!S.crisis){const d=WI.ads/30;S.ads.etsy=S.ch.etsy.open>=0?d*(1-WI.mix):0;S.ads.shopify=S.ch.shopify.open>=0?d*WI.mix:0}
 experiments();loanTiming();opsWeek();okrs();lessonsWeek();nextDecision()}
// ---- loan timing from the 13-week cash forecast ----
function loanTiming(){const cf=S.cf13||[];if(!cf.length)return;const mn=Math.min(...cf),wk=cf.indexOf(mn)+1,buf=monthlyFixed()*.5;
 if(mn<buf&&wk>=3&&S.day-(S.flags.loanTry||-999)>45&&(S.conf=fcConf())!==0){S.flags.loanTry=S.day;const ok=getLOC()||getLoan(Math.max(8000,buf-mn+monthlyFixed()),'forecast gap');
  smove('loan',`13-week forecast: cash bottoms at ${fmt(mn)} in week ${wk}. ${ok?'Lined up financing now — lenders take weeks.':'Applied for financing early; cutting discretionary spend meanwhile.'}`)}}
// ---- experiments: alternating-week A/B tests ----
function experiments(){const X=B_(),t=dateOf(),hol=(t.getMonth()===10&&t.getDate()>=8)||t.getMonth()===11,tr=trait();
 for(const e of S.exps.slice()){if(S.crisis&&e.type==='ads'){S.exps=S.exps.filter(x=>x!==e);continue}e.wk++;if(e.wk>=e.len){finishExp(e);continue}e.arm=e.wk%2?'B':'A';applyArm(e)}
 if(S.crisis||hol||S.promo||S.exps.length>=3||S.months.length<2||EC.brain.noTests||WI)return;
 const u=unlocked();if(!S.exps.some(e=>e.type==='price')){const mc=mainCh();const cand=u.filter(k=>S.day-(k.tested||-999)>90&&!k.md&&usage(k.i)>.25).sort((a,b)=>usage(b.i)-usage(a.i))[0];
  if(cand){const step=X.testPct*(tr.id==='reckless'?1.5:tr.id==='cautious'?.6:1),dir=cand.lastWin==='down'?-1:1;let pB=Math.min(Math.round(cand.p0*(S.cpi||1)*X.testCap),Math.max(Math.round(cand.p0*(S.cpi||1)*.75),Math.round(cand.p*(1+dir*step))));
   if(Math.abs(pB-cand.p)>=1){const e={id:'p'+S.day,type:'price',k:cand.i,ch:mc,A:cand.p,B:pB,wk:0,len:X.testWeeks,arm:'A',d:{A:{u:0,c:0,days:0,season:0},B:{u:0,c:0,days:0,season:0}}};cand.test=e.id;S.exps.push(e);applyArm(e);think(`🧪 Price test on ${cand.n}: $${e.A} vs $${e.B}, alternating weeks for ${e.len} weeks.`,'t')}}}
 for(const ch of ['shopify','etsy']){if(S.ch[ch].open<0||S.exps.some(e=>e.type==='ads'&&e.ch===ch)||S.day-(S.flags['adT'+ch]||-999)<84||runwayMo()<3)continue;
  const base=Math.round(S.ads[ch]),Bv=base>0?Math.round(base*1.5+2):(ch==='etsy'?5:10);if(ch==='etsy'&&S.flags.etsyAdsMinAOV&&aov()<S.flags.etsyAdsMinAOV&&base===0)continue;if(liquidity()<Bv*60)continue;
  S.flags['adT'+ch]=S.day;const e={id:'a'+ch+S.day,type:'ads',ch,A:base,B:Bv,wk:0,len:X.testWeeks,arm:'A',d:{A:{u:0,c:0,days:0,season:0},B:{u:0,c:0,days:0,season:0}}};S.exps.push(e);applyArm(e);think(`🧪 Ad budget test on ${ch==='etsy'?'Etsy':'Shopify'}: ${fmt(base)}/day vs ${fmt(Bv)}/day.`,'t');break}}
function applyArm(e){const v=e[e.arm];if(e.type==='price')S.co.skus[e.k].p=v;else S.ads[e.ch]=v}
function finishExp(e){S.exps=S.exps.filter(x=>x!==e);const per=(x,f)=>x.days?f(x)/x.days/(x.season/x.days):0;
 const cA=per(e.d.A,x=>x.c),cB=per(e.d.B,x=>x.c),uA=per(e.d.A,x=>x.u),uB=per(e.d.B,x=>x.u),nU=e.d.A.u+e.d.B.u;
 const clear=Math.abs(cB-cA)>.08*Math.max(Math.abs(cA),Math.abs(cB),5)&&(e.type==='ads'||nU>=12);const win=clear&&cB>cA?'B':'A',lose=win==='A'?'B':'A';
 const uw=win==='A'?uA:uB,ul=win==='A'?uB:uA,du=ul?(uw-ul)/ul*100:0,dd=(win==='A'?cA-cB:cB-cA);
 const r={type:e.type,ch:e.ch,k:e.k,A:e.A,B:e.B,win,clear,du,dd,cA,cB,uA,uB,end:S.day,start:S.day-e.len*7};S.expDone.push(r);if(S.expDone.length>40)S.expDone.shift();
 if(e.type==='price'){const k=S.co.skus[e.k],wp=e[win],lp=e[lose];k.tested=S.day;k.test=null;k.p=wp;k.lastWin=clear?(wp>lp?'up':'down'):(k.lastWin==='up'?'down':'up');
  if(clear&&uA>0&&uB>0){const el=Math.log(uB/uA)/Math.log(e.B/e.A);if(isFinite(el)){k.el=k.el==null?el:k.el*.6+el*.4;k.eln=(k.eln||0)+1}}
  const mw=(k.p=wp,unitEcon(k,e.ch).net),ml=(k.p=lp,unitEcon(k,e.ch).net);k.p=wp;const dm=ml?(mw-ml)/Math.abs(ml)*100:0,nm=S.co.unit.replace(/s$/,'');
  r.msg=clear?`Price test: $${Math.min(e.A,e.B)} vs $${Math.max(e.A,e.B)} ${nm} (${k.n}). $${wp} won: ${fmtPct(dm)} margin, ${fmtPct(du)} units (${dd>=0?'+':''}${fmt(Math.round(dd*7))}/wk contribution).`:`Price test: $${Math.min(e.A,e.B)} vs $${Math.max(e.A,e.B)} ${nm} (${k.n}). No clear winner (${nU} units) — keeping $${wp}.`;
  smove('test',r.msg+(clear&&k.el!=null?` Elasticity estimate ≈ ${k.el.toFixed(1)}.`:''),clear);
  if(clear)learn('price:'+S.co.line+':'+k.i,`${k.n} sells best near $${wp} (${fmtPct((wp/(k.p0*(S.cpi||1))-1)*100)} vs launch).`,wp/(k.p0*(S.cpi||1)))}
 else{const v=e[win];S.adPin[e.ch]={v,until:S.day+84};S.ads[e.ch]=v;const nm=e.ch==='etsy'?'Etsy':'Shopify';
  r.msg=clear?`Ad test (${nm}): ${fmt(e.A)}/day vs ${fmt(e.B)}/day. ${fmt(v)}/day won: ${dd>=0?'+':''}${fmt(Math.round(dd*7))}/wk contribution after ad spend, ${fmtPct(du)} orders.`:`Ad test (${nm}): ${fmt(e.A)} vs ${fmt(e.B)}/day — no clear difference; keeping ${fmt(v)}/day.`;smove('test',r.msg,clear);
  const hi=e.A>e.B?'A':'B';if(e.ch==='etsy'&&clear){const av=Math.round(aov());if(win!==hi)learn('etsyAdsAOV',`Etsy ads lose money under ~$${av+5} AOV.`,Math.max(av+5,(recall('etsyAdsAOV')||{}).val||0));else learn('etsyAdsAOV',`Etsy ads paid off at a $${av} AOV.`,Math.min(av-5,(recall('etsyAdsAOV')||{}).val||av-5))}}}
// ---- smarter ops: mix, scheduling, email, bundles, reviews, aging ----
function podWeek(){if(!POD())return;const P=EC.pod,L=S.months[S.months.length-1],t=dateOf();
 if(WI&&WI.premium!=null)S.flags.premium=WI.premium;else if(!S.flags.premium&&L){const save=L.cogs*.6*P.premiumDisc;if(save>P.premiumMo*1.2){S.flags.premium=1;smove('negotiate',`Printify Premium: ~${fmt(Math.round(save))}/mo saved on base costs vs the ${fmt(P.premiumMo)}/mo fee. Subscribing.`,true)}}
 const mo=t.getMonth();if(S.lifetime.orders>=15&&!P.boothOffMonths.includes(mo)&&(WI&&WI.boothWeeks!=null?WI.boothWeeks>0&&S.day-(S.flags.boothLast||-999)>=WI.boothWeeks*7&&S.ch.etsy.open>=0:liquidity()>P.booth.fee*6&&S.day-(S.flags.boothLast||-99)>=14&&runwayMo()>2)){S.flags.booth=S.day+5;S.flags.boothLast=S.day;S.cash-=P.booth.fee;S.mo.other+=P.booth.fee;if(S.ch.store.open<0)S.ch.store.open=S.day;S.lifetime.booths=(S.lifetime.booths||0)+1;smove('booth',`Booked a pop-up booth at ${pick(['the Eau Gallie Arts District market','Cocoa Village Saturday market','Melbourne Main Street market','a Satellite Beach pet adoption fair'])} this Saturday (${fmt(P.booth.fee)}). Sample portraits on the table, orders taken on a tablet.`)}}
function opsWeek(){podWeek();const X=B_(),u=unlocked(),mc=mainCh();if(!u.length)return;
 const sc=u.map(k=>{const e=unitEcon(k,mc),dem=S.fd?S.fd.s[k.i]+S.fd.o[k.i]:usage(k.i);return {k,e,dem,s:e.net*Math.max(.05,dem),pm:e.net/Math.max(1,buildMin(k))}}).sort((a,b)=>b.s-a.s);
 S.mix=sc.map(x=>x.k.i);S.mixPM=sc.slice().sort((a,b)=>b.pm-a.pm).map(x=>x.k.i);const top=sc[0];
 const cur=sc.find(x=>x.k.i===S.feature);if(top&&S.feature!==top.k.i&&top.e.net>0&&(!cur||top.s>cur.s*1.2)){S.feature=top.k.i;smove('mix',`Product mix: featuring ${top.k.n} — ${fmt(top.e.net)}/unit × ${(top.dem*7).toFixed(1)}/wk forecast is our best margin × demand. Build queue prioritises contribution per build-minute.`)}
 // labor scheduling by hour-of-day traffic
 if(roleCount('retail')){const h=S.hod,tot=h.reduce((a,b)=>a+b,0),sd=S.fd?S.fd.s.reduce((a,b)=>a+b,0):0;let pk=0;h.forEach((v,i)=>{if(v>h[pk])pk=i});const want=sd<X.fullShiftUnits?6:8;
  if(tot>20&&want!==S.sched.retail){S.sched.retail=want;S.sched.peak=pk;smove('schedule',want<8?`Store forecast is ${(sd*7).toFixed(0)} sales/wk with a ${10+pk}:00–${12+pk}:00 peak. Scheduling retail ${Math.max(10,9+pk)}:00–${Math.max(10,9+pk)+6}:00 around it; I cover open/close.`:`Forecast store traffic needs full coverage: retail back to 8h shifts.`)}}
 // email campaigns once Shopify has a list
 if(S.ch.shopify.open>=0&&S.emails>=50&&!S.flags.emailOn){S.flags.emailOn=1;smove('email',`Starting weekly Shopify Messaging campaigns to ${Math.round(S.emails)} subscribers (first 10k sends/mo free; benchmark 0.16% placed-order rate).`)}
 if(u.length>=2&&(S.ch.shopify.open>=0||S.ch.etsy.open>=0)&&!S.flags.bundle&&S.lifetime.orders>40){S.flags.bundle=1;smove('bundle',`Added a "complete the set" bundle and checkout upsell: cheapest add-on at ${Math.round(X.bundleDisc*100)}% off (~${Math.round(X.attach*100)}% attach, est).`)}
 if(!S.flags.revReq&&S.lifetime.orders>20){S.flags.revReq=1;smove('reviews','Reviews management on: follow-up emails asking for a review, and I reply to every ≤3★ review with a fix or replacement.')}
 // inventory aging & markdowns
 for(const k of S.co.skus){if(k.test)continue;const inv=S.inv.s[k.i]+S.inv.o[k.i],d=Math.max(.05,S.fd?S.fd.s[k.i]+S.fd.o[k.i]:usage(k.i)),cov=inv/d;
  if(!WI&&!k.md&&cov>X.markdownDays&&inv>=6&&!k.off){k.md=k.p;k.p=Math.max(1,Math.round(k.p*(1-X.markdownPct)));smove('markdown',`Inventory aging: ${k.n} has ${Math.round(cov)} days of cover. ${Math.round(X.markdownPct*100)}% markdown to $${k.p} until it's under ${X.restoreDays} days.`)}
  else if(k.md&&cov<X.restoreDays){k.p=k.md;k.md=null;think(`${k.n} stock is back to ${Math.round(cov)} days of cover. Markdown ended.`,'t')}}
 S.clv=Math.round(aov()*cmRatio()*X.ordersPerCustomer)}
function emailDay(){if(!S.flags.emailOn||S.ch.shopify.open<0)return;const t=dateOf(),dw=t.getDay(),q4=t.getMonth()>=10;if(!(dw===2||(q4&&dw===5)))return;const X=B_(),n=Math.round(S.emails);
 const mk=S.mo.k;if(S.emailMo!==mk){S.emailMo=mk;S.emailSent=0}S.emailSent+=n;const over=Math.max(0,Math.min(n,S.emailSent-X.emailFree));const cost=over*X.emailPer1k/1000;if(cost){S.mo.subs+=cost;S.cash-=cost}
 const o=binom(n,X.emailOrderRate*qualF()*priceF());for(let i=0;i<o;i++)S.backlog.push({ch:'shopify',k:pickSku(),day:S.day,t:R(0,1),em:1});S.lifetime.emailOrders=(S.lifetime.emailOrders||0)+o;S.lifetime.campaigns=(S.lifetime.campaigns||0)+1}
// ---- OKRs ----
const qkey=t=>t.getFullYear()+' Q'+(Math.floor(t.getMonth()/3)+1);
function qMonths(q){const [y,qq]=q.split(' Q');return [...S.months,S.mo].filter(m=>m.k.slice(0,4)===y&&Math.floor((+m.k.slice(5)-1)/3)+1===+qq)}
function qSum(q){const ms=qMonths(q);return ms.reduce((a,m)=>{const P=m.P||pnl(m);a.rev+=P.rev;a.net+=P.net;a.gm+=P.gm;a.nr+=P.net_rev;return a},{rev:0,net:0,gm:0,nr:0})}
function okrProgress(){const o=S.okr;if(!o)return;const s=qSum(o.q);o.krs.forEach(k=>{k.p=k.id==='rev'?s.rev/k.t:k.id==='rating'?(S.reviews?S.rating:0)/k.t:k.id==='tests'?(S.expDone.length-o.base.tests)/k.t:k.id==='net'?(s.net>0?1:Math.max(0,1+s.net/Math.max(1,s.rev))*.5):k.id==='margin'?(s.nr?s.gm/s.nr:0)/k.t:k.id==='runway'?Math.min(99,runwayMo())/k.t:k.id==='netm'?(s.rev?s.net/s.rev:0)/k.t:k.id==='email'?S.emails/k.t:0;k.p=clamp(k.p,0,1)})}
function okrs(){const q=qkey(dateOf());if(S.okr&&S.okr.q===q){okrProgress();return}
 if(S.okr){okrProgress();const sc=S.okr.krs.reduce((a,k)=>a+k.p,0)/S.okr.krs.length;S.okr.score=sc;S.okrHist.push(S.okr);if(S.okrHist.length>16)S.okrHist.shift();smove('okr',`${S.okr.q} OKRs ("${S.okr.O}") scored ${sc.toFixed(1)}: ${S.okr.krs.map(k=>`${k.n} ${Math.round(k.p*100)}%`).join(' · ')}.`)}
 const fq=(S.fcRev||[]).reduce((a,x)=>a+x.rev,0),rv=Math.max(1000,Math.round(fq*1.1/100)*100),tm=EC.strategy.targetMargin;let O,krs;
 if(ttmRev()<30000){O='Prove demand';krs=[{id:'rev',n:`Revenue ≥ ${fmt(rv)}`,t:rv},{id:'rating',n:'Rating ≥ 4.5★',t:4.5},{id:'tests',n:'Finish 2 experiments',t:2}]}
 else if(ttmNet()<0||runwayMo()<4){O='Get profitable';krs=[{id:'net',n:'Positive quarterly net',t:1},{id:'margin',n:`Gross margin ≥ ${Math.round((tm+.3)*100)}%`,t:tm+.3},{id:'runway',n:'Runway ≥ 4 months',t:4}]}
 else{const em=Math.round(S.emails*1.2+50);O='Scale profitably';krs=[{id:'rev',n:`Revenue ≥ ${fmt(rv)}`,t:rv},{id:'netm',n:'Net margin ≥ 8%',t:.08},{id:'email',n:`Email list ≥ ${em}`,t:em}]}
 S.okr={q,O,krs,start:S.day,base:{tests:S.expDone.length}};okrProgress();think(`🎯 ${q} objective: ${O}. KRs: ${krs.map(k=>k.n).join('; ')}.`,'g')}
// ---- strategic plan, scenarios, next decision ----
function stratPlan(){if(POD()){const U=unlockRD();return [{n:'Etsy shop: printables + digital pet portraits',done:S.ch.etsy.open>=0,gate:'day 1'},{n:'Pet portrait prints via Printify',done:S.rd>=U[2],gate:`design R&D ${Math.round(S.rd)}/${U[2]} (mockups + sample order)`},{n:'Shopify site (free Digital Downloads app)',done:S.ch.shopify.open>=0,gate:'12+ Etsy orders/mo or $12k cash'},{n:'Email campaigns',done:!!S.flags.emailOn,gate:'Shopify + 50 subscribers'},{n:'Printify Premium',done:!!S.flags.premium,gate:'base-cost savings > $30/mo'},{n:'Pop-up market booths',done:S.ch.store.open>=0,gate:'15+ orders, Oct–May'},{n:'First hire: customer service / design QA',done:!!S.firstHire,gate:'2-week bottleneck + scenario GO'},{n:'Space Coast design line',done:S.rd>=U[3],gate:`design R&D ${Math.round(S.rd)}/${U[3]}`}]}const st=[{n:'Etsy shop',done:S.ch.etsy.open>=0,gate:'day 1'},{n:'Shopify site',done:S.ch.shopify.open>=0,gate:S.flags.shopifyEarly?'lesson: open early (day 21)':'12+ Etsy orders/mo or $12k cash'},
  {n:'Email campaigns',done:!!S.flags.emailOn,gate:'Shopify + 50 subscribers'},{n:'First hire',done:!!S.firstHire,gate:'2-week bottleneck + scenario GO'}];
 EC.stages.slice(1).forEach((s,i)=>st.push({n:s.n,done:S.stage>=i+1,gate:'3-mo gross margin covers new rent + scenario GO'}));return st}
function nextDecision(){const s=stratPlan().find(x=>!x.done);const sc=S.scen&&S.day-S.scen.d<60?` · last scenario: ${S.scen.label} → ${S.scen.go?'GO':'NO-GO'}`:'';S.nextBig=s?`${s.n} (gate: ${s.gate})${sc}`:`Grow the flagship${sc}`}
function scenario(kind,label,addMo,capex,upRev){const tr=trait(),cm=cmRatio(),fixed=monthlyFixed();const base12=S.fcRev&&S.fcRev.length?S.fcRev.reduce((a,x)=>a+x.rev,0)*4:ttmRev();
 const mk=(f,up)=>{let cash=S.cash-capex,mn=cash;for(let m=0;m<12;m++){cash+=(base12/12*f+up*Math.min(1,(m+1)/4))*cm-fixed-addMo;mn=Math.min(mn,cash)}return {net:Math.round(cash-(S.cash-capex)),min:Math.round(mn)}};
 const r={kind,label,addMo:Math.round(addMo),capex,up:Math.round(upRev),best:mk(1.2,upRev*1.3),base:mk(1,upRev),worst:mk(.8,upRev*.5),d:S.day};
 const cushion=tr.id==='cautious'?-S.cc.limit*.5:tr.id==='reckless'?-(loanCapacity()+S.cc.limit):-(loanCapacity()*.6+S.cc.limit*.5);r.cushion=Math.round(cushion);
 r.go=r.base.net>0&&r.worst.min>cushion;if(S.cof)r.go=debate(r);r.why=r.go?`GO — base case ${fmt(r.base.net)} over 12 months; worst-case cash low ${fmt(r.worst.min)} stays above our ${fmt(r.cushion)} limit.`:`NO-GO — ${r.base.net<=0?`base case loses ${fmt(-r.base.net)} over 12 months`:`worst case drops cash to ${fmt(r.worst.min)} (limit ${fmt(r.cushion)})`}. Revisit in 30 days.`;
 S.scen=r;S.scenHist.push(r);if(S.scenHist.length>12)S.scenHist.shift();smove('scenario',`Scenario before we ${label}: best ${fmt(r.best.net)} · base ${fmt(r.base.net)} · worst ${fmt(r.worst.net)}. ${r.why}`,r.go);return r}
function storeUplift(next){const st=S.stage,f=EC.store.footfall,add=(f[st+1]||0)-(st>=1?f[st]:0);return Math.max(0,add*(.45+S.rep/90)*EC.store.conv*qualF()*priceF()*aov()*26)}
function leaseGo(next,nf){if(!S.wacc||EC.brain.noGates||EC.brain.noLease)return true;if(S.day-(S.flags.scenL||-999)<30)return false;S.flags.scenL=S.day;return scenario('lease',`sign the ${next.n.toLowerCase()} lease`,nf,next.buildout,storeUplift(next)).go}
function hireGo(role,cost){if(!S.wacc||EC.brain.noGates||EC.brain.noHire)return true;if(S.day-(S.flags['scenH'+role]||-999)<30)return false;S.flags['scenH'+role]=S.day;const H=lastDays(14),lost=H.length?H.reduce((a,d)=>a+d.walk+d.so,0)/H.length*aov()*26:0;
 const strict=S.flags.hireStrict||1;return scenario('hire',`hire a ${ROLES[role].n.toLowerCase()} (${fmt(Math.round(cost))}/mo)`,cost*strict,200,lost+cost*1.05/cmRatio()).go}
// ---- lessons ----
function lessonsWeek(){const u=unlocked();
 if(S.months.length>=4&&S.ch.shopify.open>=0&&u.length){const avgM=c=>u.reduce((a,k)=>a+unitEcon(k,c).m,0)/u.length,me=avgM('etsy'),ms=avgM('shopify');if(ms-me>.08)learn('shopifyEarly',`Open Shopify early — it keeps ${Math.round(ms*100)}% per sale vs Etsy's ${Math.round(me*100)}%.`,1)}
 if(S.ch.store.open>=0&&S.day-S.ch.store.open>=180&&!S.flags.storeLesson){S.flags.storeLesson=1;const ms=S.months.slice(-3);const st=ms.reduce((a,m)=>a+m.rev.store-m.cogsBy.store-m.fees.store,0)/3,rent=ms.reduce((a,m)=>a+m.rent+m.util,0)/3;
  if(st>=rent)learn('storeGate',`A storefront paid its own rent within 6 months (${fmt(Math.round(st))}/mo store contribution vs ${fmt(Math.round(rent))} rent).`,.9);else learn('storeGate',`Store opened too early: in-store contribution covered ${Math.round(st/Math.max(1,rent)*100)}% of rent after 6 months — wait for more margin.`,1.25)}
 if(S.lifetime.campaigns>=8&&!S.flags.emailLesson){S.flags.emailLesson=1;learn('emailWorks',S.lifetime.emailOrders>=3?`Weekly email campaigns brought ${S.lifetime.emailOrders} orders from ${S.lifetime.campaigns} sends — build the list from day one.`:`Email campaigns barely moved sales (${S.lifetime.emailOrders} orders from ${S.lifetime.campaigns} sends) — grow the list before counting on email.`,S.lifetime.emailOrders)}
 if(S.months.length&&S.months.length%6===0&&S.flags.ttM!==S.months.length){S.flags.ttM=S.months.length;const r=stratReport().find(x=>x.k>=2&&x.d>0);if(r)learn('topTactic',`${r.n} paid off: ${fmt(Math.round(r.d))}/mo on average.`,r.d);hireLessonPos()}}
function hireLessonPos(){const v=S.staff.filter(x=>S.day-x.hired>300);if(v.length&&ttmNet()>0)learn('hireEarly',`Hiring paid off: ${v.length} staff with 10+ months tenure and a profitable trailing year.`,.9)}
function hireLesson(s){if(S.day-s.hired<120)learn('hireEarly',`Hired a ${ROLES[s.role].n.toLowerCase()} too early (let go after ${S.day-s.hired} days). Require more forecast headroom.`,1.3)}
// ================= What-if lab (separate from the watched run) =================
function whatIf(cfg){const sv=S,svH=HEADLESS,svV=vday,svF=FORCE_LINE,svM=SIMMEM,keep={r:EC.retailRentSfYr,f:EC.flexRentSfYr};const n=cfg.seeds||EC.lab.seeds,months=36;
 EC.retailRentSfYr=keep.r*(cfg.rent||1);EC.flexRentSfYr=keep.f*(cfg.rent||1);FORCE_LINE=cfg.line;WI={aiLevel:cfg.aiLevel||'base',oversight:cfg.oversight,humanQC:cfg.humanQC,price:cfg.price||[],ads:cfg.ads,mix:cfg.mix==null?.3:cfg.mix,premium:cfg.premium,hours:cfg.hours,rate:cfg.rate,salMode:cfg.salMode||'off',traffic:EC.lab.traffic[cfg.traffic||'base']||1,boothWeeks:cfg.boothWeeks};
 const runs=[];try{for(let i=0;i<n;i++){SIMMEM=[];const s=runHeadless(months*30.5|0);runs.push(s.months.map(m=>({rev:m.P.rev,net:m.P.net,fp:m.founderPay||0,ai:m.aiOp||0})))}}
 finally{WI=null;FORCE_LINE=svF;SIMMEM=svM;EC.retailRentSfYr=keep.r;EC.flexRentSfYr=keep.f;S=sv;HEADLESS=svH;vday=svV}
 const q=(a,p)=>{const b=a.slice().sort((x,y)=>x-y);return b[Math.min(b.length-1,Math.floor(p*(b.length-1)+.5))]};const out={cfg,n,m:[]};
 for(let i=0;i<months;i++){const r=runs.filter(x=>x[i]).map(x=>x[i]);if(!r.length)break;const rv=r.map(x=>x.rev),nt=r.map(x=>x.net);out.m.push({i,rev:q(rv,.5),rev25:q(rv,.25),rev75:q(rv,.75),net:q(nt,.5),net25:q(nt,.25),net75:q(nt,.75),fp:q(r.map(x=>x.fp),.5),ai:q(r.map(x=>x.ai),.5)})}
 const be=out.m.findIndex((x,i)=>x.net>0&&out.m.slice(i,i+3).every(y=>y.net>0));out.breakEven=be<0?null:be+1;
 const cum=runs.map(x=>{let c=0;const k=x.findIndex(m=>(c+=m.net)>=0&&c>0);return k<0?null:k+1}).filter(x=>x!=null);out.payback=cum.length>=n/2?q(cum,.5):null;
 out.years=[0,1,2].map(y=>{const yr=runs.map(x=>x.slice(y*12,y*12+12)).filter(x=>x.length===12);const rv=yr.map(x=>x.reduce((a,m)=>a+m.rev,0)),nt=yr.map(x=>x.reduce((a,m)=>a+m.net,0));return rv.length?{rev:[q(rv,.25),q(rv,.5),q(rv,.75)],net:[q(nt,.25),q(nt,.5),q(nt,.75)]}:null});
 return out}
let LAB={cfg:null,res:null};
function labDefaults(li){const ln=EC.lines[li],pod=ln.mode==='pod';return {line:li,price:[1,1,1,1],ads:60,mix:.3,premium:pod?null:null,hours:EC.founder.side.hoursWk,rate:EC.founder.side.rate,salMode:'ai',aiLevel:'base',oversight:EC.ai.oversightHrs,humanQC:true,traffic:'base',boothWeeks:pod?null:null,rent:1,seeds:EC.lab.seeds}}
function openLab(){if(!LAB.cfg)LAB.cfg=labDefaults(S&&S.co?S.co.line:EC.lines.findIndex(l=>l.mode==='pod'));$('labwrap').classList.remove('hidden');renderLab()}
function renderLab(){const c=LAB.cfg,ln=EC.lines[c.line],pod=ln.mode==='pod',sk=ln.skus.map((x,i)=>{const v=ln.variants&&ln.variants[i];return {n:x[0],p:v?Math.round(v.reduce((a,w)=>a+w[1]*w[4],0)):x[3]}});
 const sl=(id,lab,min,max,step,val,fmtv)=>`<label class="lr"><span>${lab}</span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><b id="${id}v">${fmtv(val)}</b></label>`;
 $('labbox').innerHTML=`<h2>🧪 What-if lab <small>— separate from the run you're watching</small></h2>
 <div class="labgrid"><div>
 <label class="lr"><span>Business</span><select id="lLine">${EC.lines.map((l,i)=>`<option value="${i}" ${i===c.line?'selected':''}>${l.mode==='pod'?'🐶 ':''}${l.n}</option>`).join('')}</select></label>
 <label class="lr"><span>Traffic</span><select id="lTr">${[['conservative','Conservative (crowded Etsy niche)'],['low','Low'],['base','Base'],['high','High']].map(([v,t])=>`<option value="${v}" ${c.traffic===v?'selected':''}>${t} ×${EC.lab.traffic[v]}</option>`).join('')}</select></label>
 <label class="lr"><span>Founder pay</span><select id="lSal">${[['ai','🤖 AI 24/7 (you oversee)'],['off','OFF (robot works free)'],['side','Side hustle'],['full','Full-time salary']].map(([v,t])=>`<option value="${v}" ${c.salMode===v?'selected':''}>${t}</option>`).join('')}</select></label>
 ${sl('lOv','Oversight h/week (AI 24/7)',0,15,.5,c.oversight,v=>v+' h')}<label class="lr"><span>AI cost level</span><select id="lAi">${['lean','base','heavy'].map(v=>`<option value="${v}" ${c.aiLevel===v?'selected':''}>${v} — $${EC.ai.levels[v].base}/mo + $${EC.ai.levels[v].perOrder}/order</option>`).join('')}</select></label>
 ${sl('lHrs','Hours/week (side hustle)',2,30,1,c.hours,v=>v+' h')}${sl('lRate','Your hourly rate',0,60,1,c.rate,v=>'$'+v)}
 ${sl('lAds','Ad spend / month',0,1500,10,c.ads,v=>'$'+v)}${sl('lMix','Etsy ↔ Shopify mix',0,100,5,Math.round(c.mix*100),v=>(100-v)+'% Etsy / '+v+'% Shopify')}
 </div><div>
 ${sk.map((k,i)=>sl('lP'+i,k.n,50,150,5,Math.round(c.price[i]*100),v=>'$'+Math.round(k.p*v/100)+' ('+v+'%)')).join('')}
 ${pod?`<label class="lr"><span>Printify Premium</span><select id="lPrem"><option value="auto" ${c.premium==null?'selected':''}>Robot decides</option><option value="1" ${c.premium===true?'selected':''}>On</option><option value="0" ${c.premium===false?'selected':''}>Off</option></select></label>
 <label class="lr"><span>Booth frequency</span><select id="lBooth">${[['auto','Robot decides'],['0','Never'],['4','Every 4 weeks'],['2','Every 2 weeks'],['1','Weekly']].map(([v,t])=>`<option value="${v}" ${String(c.boothWeeks==null?'auto':c.boothWeeks)===v?'selected':''}>${t}</option>`).join('')}</select></label>`:sl('lRent','Rent (vs Brevard avg)',50,150,5,Math.round(c.rent*100),v=>v+'%')}
 <div class="presets"><button id="lCons" class="mini">🧊 Conservative preset</button><button id="lReset" class="mini">↺ Defaults</button></div>
 </div></div>
 <div class="labbar"><button id="lRun">▶ Run 3-year projection (${c.seeds} seeds)</button><button id="lCsv" class="mini" ${LAB.res?'':'disabled'}>⬇ CSV</button><button id="lClose" class="mini">✕ Close</button></div>
 <div id="labres">${LAB.res?labResHtml(LAB.res):'<p class="why">Pick assumptions and press Run. Results are medians with the middle-half range (25th–75th percentile) across seeds.</p>'}</div>`;
 const num=id=>+$(id).value,bind=(id,f)=>{const e=$(id);if(e)e.oninput=e.onchange=()=>{f(e.value);const v=$(id+'v');if(v)renderLabVals()}};
 bind('lLine',v=>{LAB.cfg=labDefaults(+v);LAB.res=null;renderLab()});bind('lTr',v=>c.traffic=v);bind('lSal',v=>c.salMode=v);bind('lHrs',v=>c.hours=+v);bind('lOv',v=>c.oversight=+v);bind('lAi',v=>c.aiLevel=v);bind('lRate',v=>c.rate=+v);bind('lAds',v=>c.ads=+v);bind('lMix',v=>c.mix=v/100);
 sk.forEach((k,i)=>bind('lP'+i,v=>c.price[i]=v/100));bind('lPrem',v=>c.premium=v==='auto'?null:v==='1');bind('lBooth',v=>c.boothWeeks=v==='auto'?null:+v);bind('lRent',v=>c.rent=v/100);
 $('lCons').onclick=()=>{c.traffic='conservative';if(pod){c.premium=null}c.ads=Math.min(c.ads,30);renderLab()};$('lReset').onclick=()=>{LAB.cfg=labDefaults(c.line);renderLab()};
 $('lClose').onclick=()=>$('labwrap').classList.add('hidden');$('lCsv').onclick=()=>LAB.res&&download('whatif-'+EC.lines[c.line].n.replace(/\W+/g,'-')+'.csv',labCsv(LAB.res),'text/csv');
 $('lRun').onclick=()=>{$('labres').innerHTML='<p class="why">Running '+c.seeds+' companies × 3 years…</p>';setTimeout(()=>{LAB.res=whatIf(JSON.parse(JSON.stringify(c)));renderLab()},30)};
 function renderLabVals(){const vals={lOv:v=>v+' h',lHrs:v=>v+' h',lRate:v=>'$'+v,lAds:v=>'$'+v,lMix:v=>(100-v)+'% Etsy / '+v+'% Shopify',lRent:v=>v+'%'};Object.keys(vals).forEach(id=>{if($(id))$(id+'v').textContent=vals[id]($(id).value)});sk.forEach((k,i)=>{const v=$('lP'+i).value;$('lP'+i+'v').textContent='$'+Math.round(k.p*v/100)+' ('+v+'%)'})}
 if(LAB.res)drawLabChart(LAB.res)}
function labResHtml(r){const m=r.m,at=i=>m[i-1]?`${fmt(Math.round(m[i-1].net))} <small>(${fmt(Math.round(m[i-1].net25))} to ${fmt(Math.round(m[i-1].net75))})</small>`:'—',rg=a=>a?`${fmt(Math.round(a[1]))} <small>(${fmt(Math.round(a[0]))} to ${fmt(Math.round(a[2]))})</small>`:'—';
 return `<canvas id="labc" width="860" height="220" style="width:100%"></canvas>
 <table class="pnl"><tr class="b"><td>Median monthly profit</td><td>Month 6</td><td>Month 12</td><td>Month 24</td><td>Month 36</td></tr><tr><td>${r.cfg.salMode!=='off'?'after founder pay':'founder unpaid'}</td><td>${at(6)}</td><td>${at(12)}</td><td>${at(24)}</td><td>${at(36)}</td></tr>${r.cfg.salMode!=='off'?`<tr><td>before founder pay</td>${[6,12,24,36].map(i=>`<td>${m[i-1]?fmt(Math.round(m[i-1].net+m[i-1].fp)):'—'}</td>`).join('')}</tr><tr><td>founder pay (median)</td>${[6,12,24,36].map(i=>`<td>${m[i-1]?fmt(Math.round(m[i-1].fp)):'—'}</td>`).join('')}</tr>${r.cfg.salMode==='ai'?`<tr><td>AI operator cost (median)</td>${[6,12,24,36].map(i=>`<td>${m[i-1]?fmt(Math.round(m[i-1].ai)):'—'}</td>`).join('')}</tr>`:''}<tr style="display:none"><td></td>${[6,12,24,36].map(i=>`<td>${m[i-1]?fmt(Math.round(m[i-1].fp)):'—'}</td>`).join('')}</tr>`:''}</table>
 <table class="pnl"><tr class="b"><td>Year</td><td>Revenue (median, middle half)</td><td>Profit (median, middle half)</td></tr>${r.years.map((y,i)=>y?`<tr><td>Year ${i+1}</td><td>${rg(y.rev)}</td><td>${rg(y.net)}</td></tr>`:'').join('')}</table>
 <p><b>Break-even month:</b> ${r.breakEven?'month '+r.breakEven+' (median monthly profit turns positive and stays positive 3+ months)':'not within 3 years at the median'} · <b>Cumulative payback:</b> ${r.payback?'month '+r.payback:'not within 3 years at the median'}</p>
 <p class="why">${r.n} simulated companies, ${EC.lines[r.cfg.line].n}, traffic ×${EC.lab.traffic[r.cfg.traffic]}. Ranges are the 25th–75th percentile. Uses the same cited economics as the game; the robot still makes all other decisions.</p>`}
function drawLabChart(r){const c=$('labc');if(!c)return;const g=c.getContext('2d'),W=c.width,H=c.height,m=r.m;g.clearRect(0,0,W,H);g.fillStyle='#0d0b16';g.fillRect(0,0,W,H);
 const mx=Math.max(1,...m.map(x=>x.rev75)),mn=Math.min(0,...m.map(x=>x.net25)),X=i=>40+i*(W-50)/Math.max(1,m.length-1),Y=v=>H-20-(v-mn)/(mx-mn)*(H-40);
 const band=(a,b,col)=>{g.fillStyle=col;g.beginPath();m.forEach((x,i)=>i?g.lineTo(X(i),Y(x[a])):g.moveTo(X(i),Y(x[a])));for(let i=m.length-1;i>=0;i--)g.lineTo(X(i),Y(m[i][b]));g.fill()};
 band('rev25','rev75','#7dd3ff33');band('net25','net75','#7dff8a33');
 const line=(k,col)=>{g.strokeStyle=col;g.lineWidth=2;g.beginPath();m.forEach((x,i)=>i?g.lineTo(X(i),Y(x[k])):g.moveTo(X(i),Y(x[k])));g.stroke()};line('rev','#7dd3ff');line('net','#7dff8a');
 g.strokeStyle='#ffffff40';g.lineWidth=1;g.beginPath();g.moveTo(40,Y(0));g.lineTo(W-10,Y(0));g.stroke();g.fillStyle='#ddd';g.font='11px monospace';g.fillText('median monthly revenue',50,14);g.fillStyle='#7dff8a';g.fillText('median monthly profit',240,14);g.fillStyle='#aaa';g.fillText(fmt(Math.round(mx)),2,24);g.fillText('$0',2,Y(0)+4);
 [12,24,36].forEach(k=>{if(m[k-1]){g.fillStyle='#888';g.fillText('m'+k,X(k-1)-10,H-4)}});if(r.breakEven){g.strokeStyle='#ffd76a';g.setLineDash([4,3]);g.beginPath();g.moveTo(X(r.breakEven-1),20);g.lineTo(X(r.breakEven-1),H-20);g.stroke();g.setLineDash([]);g.fillStyle='#ffd76a';g.fillText('break-even',X(r.breakEven-1)+3,30)}}
function labCsv(r){const c=r.cfg,L=[['What-if lab',EC.lines[c.line].n],['traffic',c.traffic],['founder pay',c.salMode],['ai level',c.aiLevel],['oversight h/wk',c.oversight],['hours/week',c.hours],['hourly rate',c.rate],['ads/month',c.ads],['shopify mix',c.mix],['price multipliers',c.price.join('|')],['premium',c.premium==null?'auto':c.premium],['booth weeks',c.boothWeeks==null?'auto':c.boothWeeks],['rent',c.rent],['seeds',r.n],['break-even month',r.breakEven||''],['payback month',r.payback||''],[],['month','rev_p25','rev_median','rev_p75','profit_p25','profit_median','profit_p75','founder_pay_median','ai_cost_median']];
 r.m.forEach(x=>L.push([x.i+1,...[x.rev25,x.rev,x.rev75,x.net25,x.net,x.net75,x.fp,x.ai].map(v=>Math.round(v))]));return L.map(a=>a.join(',')).join('\n')}
function download(name,text,type){const b=new Blob([text],{type}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
// ================= weekly news recap card =================
function showRecap(){if(HEADLESS||window.__rfFast)return;const w=S.daily.slice(-7);if(w.length<3)return;const rev=w.reduce((a,d)=>a+d.rev,0),o=w.reduce((a,d)=>a+d.oe+d.os+d.ss,0);
 const hi=[...S.strat.filter(x=>x.d>S.day-8&&!['okr','mix'].includes(x.type)).map(x=>'🧠 '+x.why),...(S.moments||[]).filter(x=>x.d>S.day-8).map(x=>'⭐ '+x.t)].filter(x=>x.length>3).slice(-3);
 const el=$('recap');el.innerHTML=`<div class="rh">📰 WEEK IN REVIEW · ${dstr(S.day-7).slice(4)}</div><div class="rb"><canvas id="recc" width="120" height="50"></canvas><div><b>${fmt(rev)}</b> revenue · ${o} orders<br>cash ${fmt(Math.round(S.cash))} · ★${S.reviews?S.rating.toFixed(2):'—'}</div></div><ul>${(hi.length?hi:['Quiet week: shipping orders and making content.']).map(t=>`<li>${t.length>110?t.slice(0,108)+'…':t}</li>`).join('')}</ul>`;
 const g=$('recc').getContext('2d'),mx=Math.max(1,...w.map(d=>d.rev));w.forEach((d,i)=>{const h=d.rev/mx*40;g.fillStyle=i===w.length-1?'#ffd76a':'#7dd3ff';g.fillRect(4+i*16,46-h,12,h)});
 el.classList.remove('hidden');el.classList.add('show');clearTimeout(showRecap.t);showRecap.t=setTimeout(()=>el.classList.add('hidden'),7000)}
// ================= co-founder debates =================
const cushionFor=id=>id==='cautious'?-S.cc.limit*.5:id==='reckless'?-(loanCapacity()+S.cc.limit):-(loanCapacity()*.6+S.cc.limit*.5);
function debate(r){const c=S.cof;if(!c)return r.go;const A=trait(),B=TRAITS.find(t=>t.id===c.trait)||TRAITS[0],ca=cushionFor(A.id),cb=cushionFor(B.id);
 const goA=r.base.net>0&&r.worst.min>ca,goB=r.base.net>0&&r.worst.min>cb;c.debates++;
 const goArg=`base case ${fmt(r.base.net)} over 12 months${r.best.net>r.base.net?`, upside ${fmt(r.best.net)}`:''}`,noArg=r.base.net<=0?`base case loses ${fmt(-r.base.net)}`:`worst case drops cash to ${fmt(r.worst.min)}`;
 if(goA===goB){S.cofSay={t:`Agreed: ${goA?'GO':'NO-GO'} on ${r.label}.`,until:Date.now()+5000};log(`🤝 ${S.co.robot} and ${c.name} agree: ${goA?'GO':'NO-GO'} on ${r.label}.`,'t');return goA}
 const goScore=Math.max(0,r.base.net)/12/Math.max(500,monthlyFixed())+(r.best.net-r.base.net)/24/Math.max(500,monthlyFixed())+(r.worst.min>0?1:0),noScore=Math.max(0,-r.worst.min)/Math.max(1000,S.cash+loanCapacity())*2+Math.max(0,-r.base.net)/12/Math.max(500,monthlyFixed())+(runwayMo()<4?.5:0);
 const win=goScore>=noScore,meGo=goA,iWin=win===meGo,cofLine=`${c.name} (${c.traitName}): "${goB?'GO':'NO-GO'} — ${goB?goArg:noArg}."`,myLine=`${S.co.robot} (${S.co.traitName}): "${goA?'GO':'NO-GO'} — ${goA?goArg:noArg}."`;
 if(!iWin)c.wins++;S.cofSay={t:(goB?'GO! ':'NO-GO. ')+(goB?goArg:noArg),until:Date.now()+6000};think((goA?'GO. ':'NO-GO. ')+(goA?goArg:noArg),'t');
 smove('debate',`Debate on ${r.label}: ${myLine} vs ${cofLine} Vote split; stronger argument (${win?'upside':'risk'} score ${(win?goScore:noScore).toFixed(2)} vs ${(win?noScore:goScore).toFixed(2)}) wins → ${win?'GO':'NO-GO'} (${iWin?S.co.robot:c.name}'s call).`,win);return win}
function drawCof(){if(!S.cof)return;const d=ST('board')||ST('desk');if(!d)return;const e={x:(d.x+1.2)*T,y:(d.y+.6)*T,face:-1};drawRobotAt(e,{color:S.cof.color[0],dark:S.cof.color[1]},.85,cx,false);cx.fillStyle='#fff';cx.font='7px monospace';cx.fillText(S.cof.name,e.x-4,e.y-4);
 if(S.cofSay&&S.cofSay.until>Date.now()){const t=S.cofSay.t,ls=[];let cur='';t.split(' ').forEach(w=>{if((cur+' '+w).length>28){ls.push(cur);cur=w}else cur=(cur?cur+' ':'')+w});if(cur)ls.push(cur);cx.font='9px monospace';const w=Math.max(...ls.map(l=>cx.measureText(l).width))+10,h=ls.length*11+6,bx=e.x+20,by=e.y-h-6;cx.fillStyle='#fff5d6';cx.fillRect(bx,by,w,h);cx.strokeStyle='#8f7cff';cx.strokeRect(bx,by,w,h);cx.fillStyle='#222';ls.forEach((l,i)=>cx.fillText(l,bx+5,by+12+i*11))}}
// ================= photo mode =================
function photo(){const W=cv.width,H=cv.height,pad=Math.round(70*dpr),o=document.createElement('canvas');o.width=W;o.height=H+pad;const g=o.getContext('2d');g.drawImage(cv,0,0);g.fillStyle='#120f22';g.fillRect(0,H,W,pad);
 const L=S.months[S.months.length-1],f=Math.round(14*dpr);g.fillStyle='#ffd76a';g.font=`bold ${f}px monospace`;g.fillText(`${S.co.name} · ${S.co.industry}`,12*dpr,H+20*dpr);g.fillStyle='#ddd';g.font=`${Math.round(12*dpr)}px monospace`;
 g.fillText(`${dstr()} · cash ${fmt(Math.round(S.cash))} · TTM revenue ${fmt(Math.round(ttmRev()))} · last month net ${L?fmt(Math.round(L.P.net)):'—'} · ★${S.reviews?S.rating.toFixed(2):'—'} (${S.reviews})`,12*dpr,H+40*dpr);
 g.fillText(`${EC.tiers.filter(t=>S.tiers[t.id]).map(t=>TIER_ICON[t.id]).join(' ')}  ${S.co.robot} (${S.co.traitName})${S.cof?' & '+S.cof.name:''} · Robot Founder`,12*dpr,H+60*dpr);
 const a=document.createElement('a');a.href=o.toDataURL('image/png');a.download=`robot-founder-${S.co.name.replace(/\W+/g,'-')}-${ymd(dateOf())}.png`;document.body.appendChild(a);a.click();a.remove();toast('📸 Saved a snapshot PNG')}
// ---------- strategy engine: weekly review of unit economics + runway, legitimate tactics only ----------
function smove(type,why,big){S.strat.push({d:S.day,type,why,net0:S.months.length?S.months[S.months.length-1].P.net:0,m:S.months.length});if(S.strat.length>500)S.strat.shift();dec('strat '+type);if(S.crisis)S.crisis.moves.push(STRAT_N[type]||type);think('🧠 '+why,big?'g':(type==='rescue'?'r':'y'));if(big)moment('🧠 '+why.split('. ').slice(-1)[0].slice(0,90),false)}
const STRAT_N={price:'price raise',drop:'dropping a loser SKU',focus:'doubling down on a winner',channel:'shifting to higher-margin channels',negotiate:'supplier volume discount',batch:'batch production',freeze:'hiring freeze',loan:'financing',promo:'Q4 promotion',wholesale:'wholesale/B2B',custom:'custom orders',pivot:'product pivot',hours:'longer hours',clear:'clearance sale',sublet:'subleasing space',downsize:'downsizing',equip:'selling equipment',savings:'robot savings injection',gig:'freelance contract work',layoff:'layoffs',comeback:'comeback',insure:'keeping insurance',debate:'co-founder debates',booth:'pop-up market booths',test:'A/B experiments',okr:'OKR review',scenario:'scenario planning',mix:'product-mix optimisation',schedule:'labor scheduling',email:'email campaigns',bundle:'bundles & upsells',reviews:'reviews management',markdown:'aging-stock markdowns',terms:'net-30 supplier terms',restructure:'loan modification',ads:'cutting ads'};
const rwTxt=()=>{const r=runwayMo();return r>=99?'Cash-flow positive':r<2?`Runway ${Math.max(0,Math.round(r*4.3))} weeks`:`Runway ${r.toFixed(1)} months`};
function openCh(){return ['etsy','shopify','store'].filter(c=>S.ch[c].open>=0)}
function mainCh(){const L=S.months[S.months.length-1],o=openCh();return L?o.slice().sort((a,b)=>L.rev[b]-L.rev[a])[0]:'etsy'}
function bestMargin(k){return Math.max(...openCh().map(c=>unitEcon(k,c).m))}
function strategy(){const X=EC.strategy,rw=runwayMo(),u=unlocked(),mc=mainCh(),L=S.months[S.months.length-1];if(!u.length)return;
 // 1) pricing: lift low-margin SKUs toward target margin (capped vs inflation-adjusted launch price)
 for(const k of (WI?[]:u)){if(k.test||k.md||S.day-(k.pd||-999)<X.priceCooldown||S.day-(k.tested||-999)<120)continue;const e=unitEcon(k,mc),cap=Math.round(k.p0*(S.cpi||1)*X.priceCap);
  if(e.m<X.targetMargin&&k.p<cap){const np=Math.min(cap,Math.max(k.p+1,Math.round(k.p*(1+X.priceStep)))),d=np-k.p;if(d<1)continue;k.pd=S.day;const old=k.p;k.p=np;
   let extra='';if(rw<4&&S.ads.etsy>0){S.ads.etsy=0;S.flags.etsyAdsOff=S.day;extra=' and pausing Etsy ads'}
   smove('price',`${rwTxt()}. ${k.n} only keeps ${Math.round(e.m*100)}% on ${mc} at $${old}. Raising the ${S.co.unit.replace(/s$/,'')} price $${d} (to $${np})${extra}.`);break}}
 // 2) drop losers, double down on winners
 if(u.length>=3&&S.months.length>=4){const sc=u.map(k=>({k,m:bestMargin(k)})).sort((a,b)=>a.m-b.m),lo=sc[0],hi=sc[sc.length-1];
  if(lo.m<X.dropMargin&&lo.k.p>=Math.round(lo.k.p0*(S.cpi||1)*X.priceCap)-1){lo.k.off=1;S.flags.focus=hi.k.i;smove('drop',`${lo.k.n} loses money even at $${lo.k.p} (${Math.round(lo.m*100)}% margin). Discontinuing it and doubling down on ${hi.k.n} (${Math.round(hi.m*100)}%).`,true)}}
 // 3) channel mix: push spend toward the highest-margin channel
 if(S.ch.shopify.open>=0&&S.day-(S.flags.chShift||-999)>90){const avgM=c=>u.reduce((a,k)=>a+unitEcon(k,c).m,0)/u.length,me=avgM('etsy'),ms=avgM('shopify');
  if(ms-me>.08&&(S.ads.etsy>0||!S.flags.chShift)){S.flags.chShift=S.day;S.flags.etsyAdsOff=S.day;const was=S.ads.etsy;S.ads.etsy=0;S.ads.shopify=Math.round(S.ads.shopify+was);S.emails+=20;
   smove('channel',`Shopify keeps ${Math.round(ms*100)}% per sale vs Etsy's ${Math.round(me*100)}%. Pausing Etsy ads, moving that budget to Shopify and adding a "shop direct" card to every Etsy package.`)}}
 if(S.flags.etsyAdsOff&&rw<6)S.ads.etsy=0;
 // 4) supplier negotiation with volume (annual materials spend)
 const spend12=S.months.slice(-12).reduce((a,m)=>a+m.matBuy,0);let tier=0;EC.volDisc.forEach(([v,d])=>{if(spend12>=v)tier=d});
 if(tier>(S.mods.neg||0)){S.mods.neg=tier;smove('negotiate',`We bought ${fmt(Math.round(spend12))} of materials in 12 months. Negotiated a ${Math.round(tier*100)}% volume discount with the supplier.`,true)}
 if(!S.insured){S.insured=true;smove('insure','Reinstating product liability coverage. One uninsured claim costs more than years of premiums.')}
 // profit review: losing money for a quarter → trim payroll, then space
 const q3=S.months.slice(-3),q6=S.months.slice(-6);
 if(q3.length===3&&q3.every(m=>m.P.net<0)&&S.day-(S.flags.trimD||-999)>45){const gm=q3.reduce((a,m)=>a+m.P.gm,0)/3,lab=q3.reduce((a,m)=>a+m.P.labor,0)/3;
  if(S.staff.length&&lab>gm*.45){S.flags.trimD=S.day;const s=S.staff.slice().sort((a,b)=>b.hired-a.hired)[0];S.flags['laid'+s.role]=S.day;fireStaff(s,`Three losing months; payroll is ${Math.round(lab/Math.max(1,gm)*100)}% of gross margin. Letting ${s.name} (${ROLES[s.role].n}) go with two weeks' pay and covering it myself.`);S.cash-=hourly(s.role)*80;S.mo.wages+=hourly(s.role)*80;smove('layoff',`Trimmed payroll: ${ROLES[s.role].n} role.`)}
  else if(q6.length===6&&q6.every(m=>m.P.net<0)&&S.stage>=1){S.flags.trimD=S.day;if(S.stage>=2&&!S.mods.sublet){S.mods.sublet=1;smove('sublet',`Six losing months. Subleasing half the workshop to recover ~${Math.round(X.subletShare*100)}% of flex rent.`,true)}
   else if(S.day-(S.flags.stageDay||0)>180){const from=EC.stages[S.stage].n;S.stage--;S.flags.stageDay=S.day;S.mods.sublet=0;if(S.stage===0)S.ch.store.open=-1;setLevel(S.stage);smove('downsize',`Six losing months: rent outruns margin. Moving from the ${from.toLowerCase()} to ${EC.stages[S.stage].n.toLowerCase()} at lease end.`,true)}}}
 if(S.flags.gig&&S.cash>monthlyFixed()*3&&runwayMo()>4){S.flags.gig=0;think('Cash is healthy again. Ending the freelance contracts; all my hours go back to the shop.','g')}
 // 5) batch production once there is a workshop
 if(S.stage>=1&&!S.flags.batch){S.flags.batch=1;smove('batch',`Switching to batch production runs (one setup per batch): ~${Math.round(X.batchSave*100)}% less build time per unit.`)}
 // 6) hiring freeze / long hours when runway is short
 if(rw<X.freezeRunway&&!S.flags.freeze){S.flags.freeze=1;S.flags.longH=1;smove('freeze',`${rwTxt()}. Freezing hiring and working ${EC.founderHours+X.longHours}h days myself.`)}
 else if(rw>6&&S.flags.freeze){S.flags.freeze=0;S.flags.longH=0;think(`${rwTxt()}. Lifting the hiring freeze.`,'g')}
 // 7) financing before it's an emergency
 if(rw<X.loanRunway&&S.day-(S.flags.loanTry||-999)>45){S.flags.loanTry=S.day;if(getLOC()||getLoan(Math.max(8000,monthlyFixed()*3),'working capital'))smove('loan',`${rwTxt()}. Lined up financing before we need it.`)}
 // 8) Q4 promotion: Black Friday week
 const t=dateOf();if(t.getMonth()===10&&t.getDate()>=22&&t.getDate()<=28&&!S.promo&&!S.flags['bf'+t.getFullYear()]){S.flags['bf'+t.getFullYear()]=1;S.promo={end:S.day+X.promoDays,p:S.co.skus.map(k=>k.p)};
  u.forEach(k=>{if(bestMargin(k)>X.targetMargin+X.promoPct)k.p=Math.round(k.p*(1-X.promoPct))});smove('promo',`Black Friday: ${Math.round(X.promoPct*100)}% off SKUs that still clear ${Math.round(X.targetMargin*100)}% margin after the discount, for ${X.promoDays} days. Email blast to ${Math.round(S.emails)} subscribers.`)}
 // 9) wholesale / B2B pitch
 const wk=u.slice().sort((a,b)=>unitEcon(b,'wholesale').m-unitEcon(a,'wholesale').m)[0];
 if(wk&&!POD()&&!S.flags.whole&&S.lifetime.orders>30&&unitEcon(wk,'wholesale').m>.2&&S.day-(S.flags.wpitch||-999)>(rw<6?40:90)){S.flags.wpitch=S.day;if(Math.random()<.5){const q=RI(2,6)*10;S.flags.whole={k:wk.i,n:q,p:wk.p*.5*q};S.po.push({k:wk.i,q,eta:S.day+leadDays(),cost:q*matCost(wk)});S.mo.matBuy+=q*matCost(wk);spend(q*matCost(wk));chain('wholeShip',21);chain('wholePay',51);
   smove('wholesale',`${rwTxt()}. Pitched local boutiques: ${q} × ${wk.n} wholesale at 50% of retail (${Math.round(unitEcon(wk,'wholesale').m*100)}% margin), net-30.`,true)}else think(`Pitched ${wk.n} wholesale to a ${pick(['Cocoa Village','Eau Gallie','Vero Beach','Cocoa Beach'])} boutique. "Maybe next season."`,'t')}
 // 10) custom / commissioned orders when the robot has spare hours
 const H=lastDays(14),spare=H.length?H.reduce((a,d)=>a+(d.robot.design||0)+(d.robot.social||0),0)/H.length:0;
 if(spare>3&&S.reviews>=10&&Math.random()<(rw<6?.3:.12)){const k=u[u.length-1],rv=Math.round(k.p*X.customMult),mat=matCost(k)*X.customMatMult,tx=rv*EC.salesTax.rate;S.cash+=rv+tx-mat;S.taxDue+=tx;S.mo.taxCol+=tx;S.mo.rev.wholesale+=rv;S.mo.orders.wholesale++;S.mo.units.wholesale++;S.mo.cogs+=mat;S.mo.cogsBy.wholesale+=mat;S.lifetime.custom=(S.lifetime.custom||0)+rv;
  smove('custom',`Took a custom commission: one-off ${k.n.toLowerCase()} for ${fmt(rv)} (${X.customMult}× list), about ${X.customHours}h of my spare design time.`)}
 // 11) clearance: surplus or discontinued stock → cash
 if(rw<4||u.length<S.co.skus.filter(k=>S.rd>=unlockRD()[k.i]).length)clearance(rw<4?'cash':'discontinued');
 else if(S.co.skus.some(k=>S.inv.s[k.i]+S.inv.o[k.i]>usage(k.i)*X.surplusDays+(S.flags.whole&&S.flags.whole.k===k.i?S.flags.whole.n:0)+6))clearance('surplus',X.surplusDays*.6);
 // 12) pivot the product line if nothing can reach a viable margin
 if(S.months.length>=9&&S.day-(S.flags.pivotD||-999)>365&&ttmNet()<0){const best=Math.max(...u.map(k=>bestMargin(k)));const capped=u.every(k=>k.p>=Math.round(k.p0*(S.cpi||1)*X.priceCap)-1||bestMargin(k)>=X.targetMargin);
  if(best<X.pivotMargin&&capped)pivot(best)}
}
function clearance(why,days){const X=EC.strategy;days=days||X.clearDays;let n=0,rv=0,cogs=0;S.co.skus.forEach(k=>{const live=!k.off&&S.rd>=unlockRD()[k.i];const keep=live?Math.ceil(usage(k.i)*days)+(S.flags.whole&&S.flags.whole.k===k.i?S.flags.whole.n:0):0;
  ['o','s'].forEach(a=>{const ex=S.inv[a][k.i]-(a==='o'?keep*.6:keep*.4);if(ex>=3){const q=Math.floor(ex);S.inv[a][k.i]-=q;n+=q;rv+=q*k.p*X.clearPct;cogs+=q*matCost(k)}})});
 if(n<3)return 0;S.cash+=rv;S.mo.rev.wholesale+=rv;S.mo.orders.wholesale++;S.mo.units.wholesale+=n;S.mo.cogs+=cogs;S.mo.cogsBy.wholesale+=cogs;
 smove('clear',`${why==='cash'?rwTxt()+'. ':why==='surplus'?'Stock is piling up after price changes. ':''}Selling ${n} surplus units to an off-price reseller at ${Math.round(X.clearPct*100)}% of retail: ${fmt(Math.round(rv))} cash today.`);return rv}
function pivot(best){if(POD())return;const cur=S.co.line;const score=li=>{const ln=EC.lines[li];return ln.skus.slice(0,2).reduce((a,[n,m,b,p,w])=>a+(p*.82-m-b/60*hourly('maker')*1.1-(p<EC.freeShipOver?0:labelCost(w)))/p,0)/2};
 const opts=EC.lines.map((l,i)=>i).filter(i=>i!==cur&&!EC.lines[i].mode).sort((a,b)=>score(b)-score(a));const li=opts[RI(0,2)],ln=EC.lines[li];
 clearance('pivot');S.co.skus.forEach(k=>{S.inv.s[k.i]=0;S.inv.o[k.i]=0;S.kits[k.i]=0});S.po=[];S.backlog.forEach(o=>{const v=S.co.skus[o.k]?S.co.skus[o.k].p:0;S.cash-=v;S.mo.refunds+=v});S.backlog=[];
 const was=S.co.industry;S.co.line=li;S.co.industry=ln.n;S.co.unit=ln.u;S.co.shape=ln.shape;S.co.risk=ln.risk;S.co.skus=mkSkus(ln);S.use={s:[.3,0,0,0],o:[.6,0,0,0]};S.flags.pivotD=S.day;S.lifetime.pivots=(S.lifetime.pivots||0)+1;
 smove('pivot',`Best ${was.toLowerCase()} margin is ${Math.round(best*100)}% even after price increases, and the last year lost money. Pivoting to ${ln.n.toLowerCase()} (same shop, channels and customers).`,true);news(`${S.co.name} pivots from ${was.toLowerCase()} to ${ln.n.toLowerCase()}`)}
function getLOC(){if(S.loans.some(l=>l.k==='loc')||S.months.length<EC.loc.minMonths)return false;const lim=Math.round(Math.min(EC.loc.max,Math.max(EC.loc.min,ttmRev()*EC.loc.ttmPct))/1000)*1000;
 if(ttmRev()<20000||Math.random()>.55*trait().loan){think(`Applied for a bank line of credit. "${pick(['Come back after 12 months in business.','Revenue is a little thin for us.'])}"`,'r');return false}
 const apr=R(...EC.loc.apr);S.loans.push({k:'loc',n:'Business line of credit',bal:lim,apr,pay:lim*apr/12+lim/24});S.cash+=lim;S.mo.loanIn+=lim;moment(`🏦 Line of credit: ${fmt(lim)} at ${(apr*100).toFixed(2)}%`);think(`Bank line of credit approved: drew ${fmt(lim)} at ${(apr*100).toFixed(2)}% APR.`,'g');return true}
// last-resort rescue ladder (replaces closing): every step is a real, legal move
function rescue(){const X=EC.strategy;if(!S.crisis)S.crisis={d:S.day,low:S.cash,moves:[]};S.crisis.low=Math.min(S.crisis.low,S.cash);
 const need=()=>-S.cash+Math.max(2000,monthlyFixed()*.5);
 if(S.ads.etsy+S.ads.shopify>0){S.ads.etsy=0;S.ads.shopify=0;S.flags.etsyAdsOff=S.day;smove('ads','Cash is negative. All paid ads off today.');}
 if(!S.flags.freeze){S.flags.freeze=1;S.flags.longH=1;smove('freeze',`Hiring freeze and ${EC.founderHours+X.longHours}h days for me.`)}
 if(clearance('cash')&&S.cash>=0)return;
 if(S.staff.length>1){const s=S.staff[S.staff.length-1];S.flags['laid'+s.role]=S.day;fireStaff(s,`Out of cash and credit. Laying off ${s.name} (${ROLES[s.role].n}) with two weeks' pay. I'll cover the role.`);const sev=hourly(s.role)*80;S.cash-=sev;S.mo.wages+=sev;dec('layoff');if(S.crisis)S.crisis.moves.push('layoffs');return}
 if(S.stage>=2&&!S.mods.sublet){S.mods.sublet=1;smove('sublet',`Subleasing half the workshop to a ${pick(['woodworker','print shop','bike mechanic','surf-shaper'])}: recovers ~${Math.round(X.subletShare*100)}% of the flex rent.`,true);if(S.cash>=0)return}
 const ups=UPGRADES.filter(u=>S.up[u.id]);if(ups.length||S.flags.machine){let got=0,names=[];ups.forEach(u=>{S.up[u.id]=0;S.flags['sold'+u.id]=1;got+=u.cost*X.equipResale;names.push(u.n)});if(S.flags.machine){S.flags.machine=0;got+=4000*X.equipResale;names.push('production machine')}
  S.cash+=got;S.mo.other-=0;smove('equip',`Sold ${names.join(', ')} on the used market for ${fmt(Math.round(got))}.`);if(S.cash>=0)return}
 if(S.robotSav>0){const a=Math.min(S.robotSav,Math.ceil(need()/500)*500);S.robotSav-=a;S.cash+=a;S.mo.eqIn+=a;smove('savings',`Founder cash injection: ${fmt(a)} from the robot's personal savings (${fmt(S.robotSav)} left).`,true);return}
 if(S.loans.length&&S.day-(S.flags.deferD||-999)>365){S.flags.deferD=S.day;S.deferTo=S.day+X.deferDays;smove('restructure',`Called our lenders and got ${Math.round(X.deferDays/30)} months of interest-only payments (loan modification) to rebuild cash.`,true);return}
 if(S.stage>=1&&S.day-(S.flags.stageDay||0)>60){const from=EC.stages[S.stage].n;S.stage--;S.flags.stageDay=S.day;S.mods.sublet=0;if(S.stage===0){S.ch.store.open=-1}setLevel(S.stage);smove('downsize',`Downsizing: let the ${from.toLowerCase()} lease go at renewal and moved to ${EC.stages[S.stage].n.toLowerCase()}. Online channels keep running.`,true);if(S.staff.length){const s=S.staff[S.staff.length-1];fireStaff(s,`Downsizing means ${s.name}'s role goes too.`)}return}
 if(!S.flags.gig){S.flags.gig=1;smove('gig',`Taking freelance CAD and repair contracts ${X.gigHours}h/day at ${fmt(X.gigRate)}/hr to fund the shop. Not glamorous. Necessary.`,true)}
}
// ---------- hall of fame / chapters ----------
function upsertHall(){if(HEADLESS||!S)return;const h=hall().filter(r=>r.id!==S.runId);h.unshift({id:S.runId,name:S.co.name,ind:S.co.industry,robot:S.co.robot,color:S.co.color,months:S.months.length,peak:Math.round(S.peakTTM),best:Math.round(Math.max(0,...S.months.map(m=>m.P.rev))),tiers:EC.tiers.filter(x=>S.tiers[x.id]).map(x=>x.id),offer:S.flags.offer||0,comebacks:S.comebacks,moves:S.strat.length,date:new Date().toISOString().slice(0,10)});
 h.sort((a,b)=>(b.peak||0)-(a.peak||0));localStorage.setItem(HALL,JSON.stringify(h.slice(0,50)))}
function chapter(){const n=S.months.length/36;S.chapter=n;moment(`📖 Chapter ${n} complete: ${n*3} years in business`);if(HEADLESS)return;setTimeout(()=>runSummary('chapter',`Chapter ${n}: ${n*3} years of ${S.co.name}. The robot keeps going.`),600)}
function hire(role,why){if(POD()&&['maker','ship','retail','eng'].includes(role)){if(role==='retail')return;role='cs'}const nm=pick(HUMANS.filter(n=>!S.staff.some(s=>s.name===n)))||'Alex';
 const s={role,name:nm,morale:85,hired:S.day,look:LOOKS()};S.staff.push(s);S.mo.other+=200;S.cash-=200;// recruiting/onboarding (est)
 dec('hire '+role);think(why,'g');if(!S.firstHire){S.firstHire=nm;moment(`🤝 First hire: ${nm} (${ROLES[role].n})`);milestone('First hire')}else moment(`${ROLES[role].e} Hired ${nm} — ${ROLES[role].n}`,false);if(!HEADLESS)addNpc(s)}
function fireStaff(s,why){hireLesson(s);S.staff=S.staff.filter(x=>x!==s);think(why,'r');dec('layoff');S.staff.forEach(x=>x.morale=clamp(x.morale-12,0,100));if(!HEADLESS){const i=npcs.findIndex(n=>n.ref===s);if(i>=0)npcs.splice(i,1)}}
function loanCapacity(){let c=0;const mo=S.months.length,rv=S.months.slice(-3).reduce((a,m)=>a+m.P.rev,0)/3;
 if(mo>=6&&rv>2500&&!S.loans.some(l=>l.k==='micro'))c+=EC.funding.micro.max;if(mo>=12&&ttmRev()>200000&&!S.loans.some(l=>l.k==='7a'))c+=Math.min(EC.funding.sba7a.max,ttmRev()*.4);return c}
function amort(P,apr,yrs){const r=apr/12,n=yrs*12;return P*r/(1-Math.pow(1+r,-n))}
function getLoan(amt,why){const mo=S.months.length,rv3=S.months.slice(-3).reduce((a,m)=>a+m.P.rev,0)/3,net3=S.months.slice(-3).reduce((a,m)=>a+m.P.net,0)/3;
 // SBA 7(a): 1+ years, real revenue, positive-ish cash flow
 if(mo>=12&&ttmRev()>200000&&!S.loans.some(l=>l.k==='7a')){const ok=net3>-2000&&S.rating>=4&&Math.random()<.6*trait().loan;const A=Math.round(Math.min(EC.funding.sba7a.max,Math.max(amt,ttmRev()*.25))/1000)*1000;
  if(ok){const apr=R(...EC.funding.sba7a.apr);S.loans.push({k:'7a',n:'SBA 7(a)',bal:A,apr,pay:amort(A,apr,EC.funding.sba7a.years)});S.cash+=A;S.mo.loanIn+=A;moment(`🏦 SBA 7(a) loan approved: ${fmt(A)} at ${(apr*100).toFixed(2)}%`);think(`SBA 7(a) approved for ${why}: ${fmt(A)} at ${(apr*100).toFixed(2)}%, ${EC.funding.sba7a.years}-year term.`,'g');return true}
  think(`Bank declined our SBA 7(a) application. "${pick(['Come back with two years of tax returns.','Your debt service coverage is thin.','We need more collateral.'])}"`,'r')}
 if(mo>=6&&rv3>2500&&!S.loans.some(l=>l.k==='micro')){const ok=S.rating>=3.8&&Math.random()<.65*trait().loan;const A=Math.round(Math.min(EC.funding.micro.max,Math.max(amt,8000))/1000)*1000;
  if(ok){const apr=R(...EC.funding.micro.apr);S.loans.push({k:'micro',n:'SBA Microloan',bal:A,apr,pay:amort(A,apr,EC.funding.micro.years)});S.cash+=A;S.mo.loanIn+=A;moment(`🏦 SBA microloan: ${fmt(A)} at ${(apr*100).toFixed(1)}%`);think(`Microloan approved (${why}): ${fmt(A)} at ${(apr*100).toFixed(1)}% over ${EC.funding.micro.years} years. ${VERA} at the lender said "I'll believe it when I see the bank statements." She saw them.`,'g');return true}
  think(`Microloan lender passed. ${VERA}: "A robot with ${S.months.length} months of history? Pass."`,'r')}
 return false}
function crunch(){const tr=trait();
 if(S.cash<0){spend(0)}
 if(S.cash<0&&!S.crisis){S.crisis={d:S.day,low:S.cash,moves:[]};moment(`⚠️ Cash crisis: ${fmt(Math.round(S.cash))}. ${S.co.robot} goes into survival mode.`);S.flags.visualNext=1}
 if(S.cash>=0&&liquidity()>1500)return;
 if(!S.ff&&S.day>20){S.ff=true;if(Math.random()<.7){const A=Math.round(R(...EC.funding.ff)/1000)*1000;S.cash+=A;S.mo.ffIn+=A;S.loans.push({k:'ff',n:'Friends & family note',bal:A,apr:0,pay:A/36});moment(`👪 Friends & family loan: ${fmt(A)} (0%, 3 years)`);think(`Called the robot's "family" (a toaster and two Roombas). They lent ${fmt(A)} at 0%. Must not lose this.`,'y');dec('friends & family');return}
  think('Asked friends & family for a loan. They said they "need to think about it" (no).','r')}
 if(getLoan(Math.max(5000,monthlyFixed()*3),'working capital')){smove('loan',`${rwTxt()}. Cash went negative; working-capital loan approved.`);return}
 if(S.cash<0&&getLOC()){smove('loan','Drew on a new bank line of credit to cover payables.');return}
 if(!S.mca&&!S.flags.mcaNo&&S.months.length>=3&&S.months.slice(-1)[0].P.rev>3000){const A=Math.round(S.months.slice(-1)[0].P.rev*1.2/1000)*1000;if(trait().loan>1||Math.random()<.4){S.mca={bal:A*1.3};S.cash+=A;S.mo.loanIn+=A;moment(`🦅 Took a merchant cash advance from ${VERA}: ${fmt(A)} for ${fmt(A*1.3)}`);think(`${VERA}'s "merchant cash advance": ${fmt(A)} now, repay ${fmt(A*1.3)} as 15% of daily sales. Effective APR is horrifying. We're desperate.`,'r');dec('MCA');return}S.flags.mcaNo=1}
 if(S.cash<0&&S.cc.bal>=S.cc.limit-1)rescue();}
function monthlyDecisions(m){const P=m.P,tr=trait();
 // acquisition offers once there is real, transferable profit (SDE ≈ net profit + interest; robot founder is unpaid)
 const sde=ttmNet()+ttm().reduce((a,x)=>a+x.interest,0),onShare=ttm().reduce((a,x)=>a+x.rev.shopify+x.rev.store,0)/Math.max(1,ttmRev());
 if(S.months.length>=18&&sde>50000&&Math.random()<.04){const M=onShare>.5?EC.exit.shopifyMult:EC.exit.etsyMult;const mult=R(...M),offer=Math.round(sde*mult/1000)*1000;
  const accept=false;
  moment(`💼 Acquisition offer: ${fmt(offer)} (${mult.toFixed(1)}× SDE)`,true);
  think(`A buyer offers ${fmt(offer)} — ${mult.toFixed(1)}× our ${fmt(Math.round(sde))} SDE. Framing it on the wall. Not selling: we're still growing.`,'g');
  if(!S.tiers.acq){S.tiers.acq=S.day;milestone('Acquisition offer')}S.flags.offer=Math.max(S.flags.offer||0,offer);}
 if(ttmRev()>=EC.tiers.find(x=>x.id==='ipo').v&&!S.tiers.ipo&&Math.random()<.05){S.tiers.ipo=S.day;moment('🔔 IPO! '+S.co.name+' rings the bell');milestone('IPO — legendary');think(`TTM revenue ${fmt(ttmRev())}. Against all odds a maker brand rings the bell. Legendary. And we keep building.`,'g')}
 // comeback arcs
 if(S.crisis&&P.net>0&&S.cash>monthlyFixed()){S.comebacks++;const dd=S.day-S.crisis.d;moment(`🔥 Comeback! ${S.co.name} is back in the black after ${Math.round(dd/30.4)} tough month${dd>45?'s':''}`);milestone('Comeback');think(`From ${fmt(Math.round(S.crisis.low))} cash to a ${fmt(Math.round(P.net))} profit month. What worked: ${S.crisis.moves.slice(-3).join(', ')||'grinding'}.`,'g');smove('comeback',`Comeback complete: ${mname(m.k)} net ${fmt(Math.round(P.net))}.`,true);S.crisis=null;if(S.flags.gig&&runwayMo()>3){S.flags.gig=0;think('Dropping the freelance contract work; the shop needs all my hours again.','g')}}
 upsertHall();
 if(S.months.length%36===0&&S.months.length)chapter();
 // seed round (rare): only for fast-growing, Shopify-heavy brands
 if(!S.seedDone&&S.months.length>=6&&onShare>.5&&ttmRev()>300000&&Math.random()<.08){S.seedDone=true;const A=EC.funding.seed.amt;S.cash+=A;S.mo.eqIn+=A;S.equity=A/EC.funding.seed.post;moment(`💰 Pre-seed SAFE: ${fmt(A)} at ${fmt(EC.funding.seed.post)} cap`);think(`An angel actually wrote a check: ${fmt(A)} SAFE at a ${fmt(EC.funding.seed.post)} cap. Rare for a product shop. Don't waste it.`,'g')}
 if(P.net<0&&S.months.length>=3&&S.months.slice(-3).every(x=>x.P.net<0))think(`Third straight loss month (${fmt(P.net)}). Break-even needs ~${breakEven()?fmt(breakEven()):'?'}/mo in revenue; we did ${fmt(P.rev)}.`,'r');
}
// ---------- events (realistic, auto-resolved by the robot) ----------
const chain=(id,days)=>S.chain.push({id,day:S.day+days});
const lowCash=()=>runwayMo()<3;
const mo=()=>dateOf().getMonth();
const someone=()=>S.staff.length?pick(S.staff):null;
const EVENTS=[
 {id:'hike',w:()=>S.day-(S.flags.hikeD||-999)>150?1:0,t:()=>(S.flags.hikeD=S.day,`Supplier email: "Due to tariffs and resin costs, prices on ${S.co.unit} materials rise ${S.f1=RI(8,20)}% next order."`),ch:[
  {l:'Accept and pass half of it on in prices',s:()=>1.25,f:()=>{S.mods.mat=Math.min(1.45,S.mods.mat*(1+S.f1/100));S.co.skus.forEach(k=>k.p=Math.round(k.p*(1+S.f1/200)));return `Materials +${S.f1}%; retail prices +${(S.f1/2).toFixed(0)}% to protect margin.`}},
  {l:'Absorb it',s:()=>.8,f:()=>{S.mods.mat=Math.min(1.45,S.mods.mat*(1+S.f1/100));return `Materials now +${S.f1}%. Margins thinner.`}},
  {l:'Switch to a cheaper supplier (+5 days lead time)',s:()=>1.1+(trait().id==='cautious'?-.4:0),f:()=>{S.mods.mat=Math.min(1.45,S.mods.mat*(1+S.f1/200));S.mods.leadAdd=Math.min(8,S.mods.leadAdd+4);return 'New supplier: half the hike, but slower. Raising safety stock.'}},
  {l:'Pre-buy 60 days at the old price',s:()=>S.cash>3000?1.2:0,f:()=>{let c=0;unlocked().forEach(k=>{const q=Math.ceil(usage(k.i)*60);c+=q*matCost(k);S.po.push({k:k.i,q,eta:S.day+6,cost:q*matCost(k)})});S.mo.matBuy+=c;spend(c);S.mods.mat=Math.min(1.45,S.mods.mat*(1+S.f1/100));return `Pre-bought ${fmt(c)} of materials. Cash tied up in inventory, but cheaper.`}}]},
 {id:'delay',w:()=>S.po.length?1.2:0,t:()=>'Supplier: "Container stuck at the Port of Savannah. Your order slips 7–10 days."',ch:[
  {l:'Wait it out',s:()=>1,f:()=>{S.po.forEach(p=>p.eta+=RI(7,10));return 'Orders delayed. Expect stockouts if safety stock is thin.'}},
  {l:'Pay $300 for air freight on the next PO',s:()=>S.cash>2000?1.3:0,f:()=>{if(S.po[0])S.po[0].eta+=1;S.po.slice(1).forEach(p=>p.eta+=8);spend(300);S.mo.other+=300;return 'Air freight: first order nearly on time; the rest late.'}}]},
 {id:'algo',w:()=>S.ch.etsy.open>=0&&S.day>40?1:0,big:1,t:()=>`Etsy search algorithm update. Sellers forums are on fire. Our views just moved ${S.f1=Math.random()<.65?'down ~35%':'UP ~30%'}.`,ch:[
  {l:'Ride it out, refresh listing photos & tags',s:()=>1,f:()=>{S.mods.etsyAlgo=S.f1.startsWith('d')?.65:1.3;S.mods.etsyAlgoT=RI(21,45);return S.f1.startsWith('d')?'Lesson: never rely on one platform.':'Free traffic! Riding the wave.'}},
  {l:'Push Shopify + email harder to diversify',s:()=>S.ch.shopify.open>=0&&S.f1.startsWith('d')?1.4:0,f:()=>{S.mods.etsyAlgo=.65;S.mods.etsyAlgoT=RI(21,45);S.ads.shopify+=10;S.emails+=40;return 'Shifting traffic to our own site.'}}]},
 {id:'apps',w:()=>S.ch.shopify.open>=0?.8:0,t:()=>`Two Shopify apps raised prices (reviews widget and shipping labels): +$${S.f1=RI(20,45)}/mo.`,ch:[
  {l:'Pay it',s:()=>1,f:()=>{S.mods.apps+=S.f1;return `Shopify app bill now ~$${EC.shopify.appsMo+S.mods.apps}/mo.`}},
  {l:'Cancel the reviews app (lose some conversion)',s:()=>trait().id==='cautious'?1.4:.9,f:()=>{S.mods.apps+=S.f1/3;review(4);return 'Cut an app. Slightly uglier product pages.'}}]},
 {id:'audit',w:()=>S.months.length>4?(S.taxLate>0?3:.5):0,big:1,t:()=>'📬 Florida Department of Revenue: sales and use tax audit notice for the last 3 years of returns.',ch:[
  {l:'Hire a CPA ($1,200)',s:()=>1.2,f:()=>{spend(1200);S.mo.other+=1200;const pen=S.taxLate*.15;spend(S.taxLate+pen);S.mo.other+=pen;const was=S.taxLate;S.taxLate=0;return was?`Paid ${fmt(was)} overdue tax + ${fmt(pen)} penalties/interest. Ugh.`:'Books were clean. The auditor almost smiled.'}},
  {l:'Handle it myself',s:()=>S.taxLate?.4:1,f:()=>{const pen=S.taxLate*.25;spend(S.taxLate+pen+100);S.mo.other+=pen+100;const was=S.taxLate;S.taxLate=0;return was?`Paid ${fmt(was)} + ${fmt(pen)} penalties. Should've hired the CPA.`:'Spent 30 hours with an auditor. Passed.'}}]},
 {id:'liab',w:()=>S.lifetime.orders>200?({low:.3,med:.6,high:1.1}[S.co.risk]):0,big:1,t:()=>`⚖️ Product liability claim: a customer says a ${pick(unlocked()).n} ${S.co.risk==='high'?'caused an injury':'damaged their property'}. Demand letter: ${fmt(S.f1=RI(8,60)*1000)}.`,ch:[
  {l:'Tender to insurance (pay deductible)',s:()=>S.insured?2:0,f:()=>{spend(1000);S.mo.other+=1000;S.mods.ins*=1.2;return 'Insurer handled it. $1,000 deductible, premium +20% at renewal. This is why we insure.'}},
  {l:'Settle out of pocket',s:()=>S.insured?0:1,f:()=>{const c=S.f1*.5;spend(c);S.mo.other+=c;return `Settled for ${fmt(c)}. No insurance. Painful.`}},
  {l:'Fight it in court',s:()=>S.insured?0:.8,f:()=>{spend(5000);S.mo.other+=5000;if(Math.random()<.5)return 'Won. Lawyer bill: $5,000.';spend(S.f1);S.mo.other+=S.f1;return `Lost. ${fmt(S.f1+5000)} total.`}}]},
 {id:'press',w:()=>S.lifetime.orders>40?.8:0,big:1,t:()=>`📰 ${TESS} from the ${PAPER} wants to feature "the robot who runs a ${S.co.unit} business."`,ch:[
  {l:'Do the interview',s:()=>2,f:()=>{S.mods.press=10;S.rep=clamp(S.rep+12,0,100);S.emails+=60;news(`${PAPER}: "${S.co.robot} the robot is building the Space Coast's quirkiest ${S.co.unit} brand"`);chain('pressFollow',RI(20,40));return 'Front of the business section! Traffic up for ~10 days.'}}]},
 {id:'pressFollow',chain:1,w:()=>0,t:()=>`${TESS} again: "Follow-up piece — is the robot paying its humans fairly?"`,ch:[
  {l:'Open the books on wages',s:()=>S.staff.length?1.5:1,f:()=>{S.rep=clamp(S.rep+5,0,100);return `We pay ${fmt(S.staff.length?hourly(S.staff[0].role):minWage())}/hr+. Story: "Robot pays above minimum wage." Nice.`}},
  {l:'Decline to comment',s:()=>.5,f:()=>{S.rep=clamp(S.rep-6,0,100);return '"Declined to comment" reads badly. Rep down.'}}]},
 {id:'badrev',w:()=>S.reviews>20?.8:0,t:()=>`A wave of 1-star reviews: ${pick(['"arrived crushed"','"smaller than expected"','"robot made it, gross"','"took 3 weeks"'])}. Suspiciously similar wording — maybe ${S.rival.name}.`,ch:[
  {l:'Reply politely & offer replacements',s:()=>1.4,f:()=>{const c=RI(2,6)*30;spend(c);S.mo.other+=c;review(3);return `Sent replacements (${fmt(c)}). Platform removed some fakes.`}},
  {l:'Report to the platform and ignore',s:()=>.8,f:()=>{for(let i=0;i<5;i++)review(1.5);return 'Rating took a hit.'}}]},
 {id:'knock',w:()=>S.lifetime.orders>150?.9:0,big:1,t:()=>`${S.rival.ceo} of ${S.rival.name} is selling a knockoff of our ${pick(unlocked()).n} on Amazon for 40% less.`,ch:[
  {l:'File IP complaints (free, slow)',s:()=>1,f:()=>{S.mods.knock=.85;S.mods.knockT=60;chain('knockResult',RI(14,30));return 'Filed. Online conversion −15% meanwhile.'}},
  {l:'Differentiate: improve quality (R&D push)',s:()=>trait().id==='builder'?1.6:1,f:()=>{S.rd+=15;S.mods.knock=.92;S.mods.knockT=45;return 'Doubled down on craftsmanship. Knockoffs can\'t copy reviews.'}},
  {l:'Cut prices 10%',s:()=>trait().id==='hustler'?1.2:.6,f:()=>{S.co.skus.forEach(k=>k.p=Math.round(k.p*.9));return 'Prices −10%. Volume holds, margins shrink.'}}]},
 {id:'knockResult',chain:1,w:()=>0,t:()=>'Update on the knockoff complaint…',ch:[{l:'Check',s:()=>1,f:()=>{if(Math.random()<.5){S.mods.knock=1;S.mods.knockT=0;return 'Amazon pulled the knockoff listings. Justice!'}return 'Complaint rejected ("insufficient evidence"). Clone stays up.'}}]},
 {id:'wholesale',w:()=>S.lifetime.orders>60?1:0,t:()=>`A boutique in ${pick(['Cocoa Village','Vero Beach','Winter Park','St. Augustine'])} wants ${S.f1=RI(3,10)*10} units wholesale at 50% of retail, net-30.`,ch:[
  {l:'Accept (keystone pricing)',s:()=>unitEcon(unlocked()[0],'wholesale').m>.25?1.3:.3,f:()=>{const k=unlocked()[0],q=S.f1;S.flags.whole={k:k.i,n:q,p:k.p*.5*q};S.po.push({k:k.i,q,eta:S.day+leadDays(),cost:q*matCost(k)});S.mo.matBuy+=q*matCost(k);spend(q*matCost(k));chain('wholeShip',21);return `Accepted: ${q} × ${k.n} for ${fmt(k.p*.5*q)}, ships in 3 weeks.`}},
  {l:'Decline — margins too thin',s:()=>1,f:()=>'Declined. Wholesale at 50% only works if materials are <25% of retail.'}]},
 {id:'wholeShip',chain:1,w:()=>0,t:()=>'Wholesale order ship date.',ch:[{l:'Ship what we have',s:()=>1,f:()=>{const w=S.flags.whole;if(!w)return 'Nothing to ship.';const k=S.co.skus[w.k];const n=Math.min(w.n,S.inv.o[w.k]+S.inv.s[w.k]);let left=n;const a=Math.min(left,S.inv.o[w.k]);S.inv.o[w.k]-=a;left-=a;S.inv.s[w.k]-=left;w.p=k.p*.5*n;w.n=n;S.mo.cogs+=matCost(k)*n;S.mo.cogsBy.wholesale+=matCost(k)*n;S.mo.units.wholesale+=n;chain('wholePay',30);return `Shipped ${n} units on net-30.`}}]},
 {id:'wholePay',chain:1,w:()=>0,t:()=>'Wholesale invoice due…',ch:[{l:'Collect',s:()=>1,f:()=>{const w=S.flags.whole;if(!w)return 'Nothing due.';if(Math.random()<.8){S.cash+=w.p;S.mo.rev.wholesale+=w.p;S.mo.orders.wholesale++;S.flags.whole=null;return `Boutique paid ${fmt(w.p)}. They want to reorder!`}chain('wholePay',30);return 'They\'re "processing it". Net-30 becomes net-60.'}}]},
 {id:'fair',w:()=>[2,3,9,10,11].includes(mo())&&invTotal()>15?1:0,t:()=>`Invitation: ${pick(['Melbourne Art Festival','Eau Gallie Arts District market','Cocoa Village craft fair','Space Coast Holiday Market'])} booth, $${S.f1=RI(150,400)}.`,ch:[
  {l:'Book the booth',s:()=>1.3,f:()=>{spend(S.f1);S.mo.other+=S.f1;let sold=0,rev=0;const n=RI(15,50);for(let i=0;i<n;i++){const k=pickSku();const src=S.inv.o[k]>0?'o':S.inv.s[k]>0?'s':null;if(!src)continue;S.inv[src][k]--;sold++;rev+=S.co.skus[k].p;S.mo.cogs+=matCost(S.co.skus[k]);S.mo.cogsBy.store+=matCost(S.co.skus[k])}const tax=rev*EC.salesTax.rate;S.taxDue+=tax;S.mo.taxCol+=tax;S.cash+=rev*.97;S.mo.fees.store+=rev*.03;S.mo.rev.store+=rev;S.mo.orders.store+=sold;S.mo.units.store+=sold;S.rep=clamp(S.rep+5,0,100);S.emails+=sold;return `Sold ${sold} at the fair: ${fmt(rev)}. Collected ${sold} emails.`}},
  {l:'Skip',s:()=>.7,f:()=>'Skipped. Saved a sunburn.'}]},
 {id:'hurricane',w:()=>EC.hurricaneMonths.includes(mo())?.9:0,big:1,t:()=>`🌀 Tropical storm ${pick(['Delia','Marco','Fiona','Isaac','Teddy','Wanda'])} headed for the Space Coast. ${S.stage?'Store must close 2–4 days.':'USPS pickups suspended.'}`,ch:[
  {l:'Shutters, sandbags & generator ($400)',s:()=>1.4,f:()=>{spend(400);S.mo.other+=400;S.mods.closed=RI(2,4);S.backlog.forEach(o=>o.day+=2);return 'Prepared. Closed a few days, no damage.'}},
  {l:'Risk it',s:()=>trait().id==='reckless'?1.5:.5,f:()=>{S.mods.closed=RI(2,4);if(Math.random()<.3){const c=RI(3,10)*1000;spend(c);S.mo.other+=c;unlocked().forEach(k=>{S.inv.s[k.i]=Math.floor(S.inv.s[k.i]*.6)});return `Water got in. ${fmt(c)} damage and ruined stock.`}return 'Got lucky this time.'}}]},
 {id:'shoplift',w:()=>S.stage>=1&&invS()>8?.8:0,t:()=>'Inventory count is off — looks like shoplifting.',ch:[
  {l:'Install a $250 camera',s:()=>1.2,f:()=>{const n=RI(2,6);for(let i=0;i<n;i++){const k=pickSku();if(S.inv.s[k]>0)S.inv.s[k]--}spend(250);S.mo.other+=250;S.flags.cam=1;return `Lost ${n} items (shrink). Camera installed.`}},
  {l:'Write it off',s:()=>.8,f:()=>{const n=RI(2,6);for(let i=0;i<n;i++){const k=pickSku();if(S.inv.s[k]>0)S.inv.s[k]--}return `${n} items written off as shrink.`}}]},
 {id:'viral',w:()=>S.lifetime.orders>20?.35:0,big:1,t:()=>`📈 A TikTok of ${S.co.robot} ${pick(['packing orders','painting a '+S.co.unit.replace(/s$/,''),'arguing with a seagull'])} hit ${RI(1,6)}M views.`,ch:[
  {l:'Overtime: build like crazy',s:()=>1.3,f:()=>{S.mods.viral=R(2,3.5);S.mods.viralT=RI(7,14);S.staff.forEach(s=>s.morale=clamp(s.morale-10,0,100));S.flags.visualNext=1;return 'Demand 2–3× for a week or two. Hope we have stock!'}},
  {l:'Raise prices 10% during the spike',s:()=>trait().id==='hustler'?1.4:.8,f:()=>{S.mods.viral=R(1.8,3);S.mods.viralT=RI(7,14);S.co.skus.forEach(k=>k.p=Math.round(k.p*1.1));chain('viralEnd',S.mods.viralT);return 'Prices +10% while it lasts. Fewer, richer orders.'}}]},
 {id:'quit',w:()=>S.staff.length?.6:0,t:()=>{S.f2=pick(S.staff);return `${S.f2.name} (${ROLES[S.f2.role].n}) got an offer at ${pick(['Publix','the Space Center','L3Harris','a Melbourne brewery'])} for $2/hr more.`},ch:[
  {l:'Counter: +$1.50/hr for everyone',s:()=>S.f2.name===S.firstHire?1.6:.9,f:()=>{S.mods.wageAdd+=1.5;S.staff.forEach(s=>s.morale=clamp(s.morale+12,0,100));return `${S.f2.name} stays. Team morale up, payroll up.`}},
  {l:'Wish them well',s:()=>1,f:()=>{fireStaff(S.f2,`${S.f2.name} left for the better offer. Rehiring later.`);return 'Two weeks notice served.'}}]},
 {id:'loyal',w:()=>S.firstHire&&S.staff.some(s=>s.name===S.firstHire)&&S.day-(S.flags.loyalD||0)>200?.5:0,t:()=>`${S.firstHire}, our first hire, wants a title: "Shop Manager". And a raise.`,ch:[
  {l:'Promote (+$3/hr)',s:()=>1.5,f:()=>{S.flags.loyalD=S.day;const s=S.staff.find(s=>s.name===S.firstHire);s.morale=100;S.mods.wageAdd+=.4;S.rep+=1;return `${S.firstHire} is Shop Manager now. Already reorganized the stockroom.`}},
  {l:'Not yet',s:()=>.6,f:()=>{S.flags.loyalD=S.day;const s=S.staff.find(s=>s.name===S.firstHire);s.morale-=25;return `${S.firstHire} looks crushed.`}}]},
 {id:'break',w:()=>S.lifetime.units>100||S.mo.produced>50?.7:0,t:()=>`The ${pick(['kiln','3D printer','sewing machine','laser cutter','pour pot','soldering station'])} died.`,ch:[
  {l:'Repair now ($'+'400–1,500)',s:()=>S.cash>2000?1.3:.2,f:()=>{const c=RI(4,15)*100;spend(c);S.mo.other+=c;return `Fixed for ${fmt(c)}.`}},
  {l:'Limp along 5 days',s:()=>1,f:()=>{S.mods.breakT=5;return 'Production slowed for 5 days.'}}]},
 {id:'fraud',w:()=>S.lifetime.orders>100?.4:0,t:()=>`Three chargebacks this week from the same card BIN. Fraud ring.`,ch:[
  {l:'Add a fraud-filter app ($10/mo)',s:()=>1.2,f:()=>{const c=3*(unlocked()[0].p+EC.chargeback.fee);spend(c);S.mo.refunds+=c;S.mods.apps+=10;return `Lost ${fmt(c)}. Fraud filter on.`}},
  {l:'Eat it',s:()=>.8,f:()=>{const c=3*(unlocked()[0].p+EC.chargeback.fee);spend(c);S.mo.refunds+=c;return `Lost ${fmt(c)} to chargebacks.`}}]},
 {id:'bulk',w:()=>S.lifetime.units>80&&S.cash>4000?.6:0,t:()=>'Supplier: "15% off if you commit to a 90-day order."',ch:[
  {l:'Commit',s:()=>runwayMo()>4?1.3:.3,f:()=>{let c=0;unlocked().forEach(k=>{const q=Math.ceil(usage(k.i)*90);c+=q*matCost(k)*.85;S.po.push({k:k.i,q,eta:S.day+leadDays(),cost:q*matCost(k)*.85})});S.mo.matBuy+=c;spend(c);return `Bought ${fmt(c)} of materials at 15% off. Cash now sitting on shelves.`}},
  {l:'Pass — cash is king',s:()=>1,f:()=>'Kept the cash.'}]},
 {id:'mca',w:()=>S.months.length>2&&lowCash()&&!S.mca?.7:0,t:()=>`${VERA} (Vulture Capital Funding): "Need cash fast? $${S.f1=Math.round(Math.max(5,S.months.slice(-1)[0].P.rev/1000))}k today, you repay 1.35× from 15% of daily sales. No credit check!"`,ch:[
  {l:'Take the advance',s:()=>trait().loan>1.2&&S.cash<1000?1.2:.3,f:()=>{const A=S.f1*1000;S.mca={bal:A*1.35};S.cash+=A;S.mo.loanIn+=A;return `Took ${fmt(A)}. Owe ${fmt(A*1.35)}. ${VERA} smiles like a shark.`}},
  {l:'Decline',s:()=>1,f:()=>`Declined. ${VERA}: "You'll be back."`}]},
 {id:'lowball',w:()=>S.months.length>8&&ttmRev()>50000?.3:0,t:()=>`${S.rival.ceo} offers to buy ${S.co.name} for ${fmt(S.f1=Math.round(ttmRev()*.3/1000)*1000)}. "Generous," he says.`,ch:[
  {l:'Decline',s:()=>1.5,f:()=>'Declined. We\'re not for sale at 0.3× revenue.'},{l:'Counter at 3× SDE',s:()=>.2,f:()=>`${S.rival.ceo} laughed and hung up.`}]},
 {id:'viralEnd',chain:1,w:()=>0,t:()=>'The viral spike is fading.',ch:[{l:'Return prices to normal',s:()=>1,f:()=>{S.co.skus.forEach(k=>k.p=Math.round(k.p/1.1));return 'Prices back to normal.'}}]},
 {id:'star',w:()=>S.ch.etsy.open>=0&&S.rating>=4.8&&S.reviews>30&&!S.mods.star?1:0,t:()=>'⭐ Etsy Star Seller badge earned (fast shipping, 4.8+ rating, quick replies).',ch:[{l:'Celebrate',s:()=>1,f:()=>{S.mods.star=1;return 'Badge on every listing. Conversion up a bit.'}}]},
 {id:'editors',w:()=>S.ch.etsy.open>=0&&S.rating>=4.6&&S.reviews>50?.3:0,big:1,t:()=>`Etsy editors featured our ${pick(unlocked()).n} in a gift guide!`,ch:[{l:'Stock up',s:()=>1,f:()=>{S.mods.editors=14;return 'Etsy views +50% for two weeks.'}}]},
 {id:'outage',w:()=>S.stage>=1&&[5,6,7,8].includes(mo())?.6:0,t:()=>'Afternoon thunderstorm knocked out power on our block.',ch:[{l:'Close early, run online orders on laptop battery',s:()=>1,f:()=>{S.mods.closed=1;return 'Store closed today. Online kept going.'}}]},
 {id:'award',w:()=>S.stage>=1&&S.rating>4.5?.4:0,t:()=>'Downtown Melbourne Main Street names us "Best New Shop".',ch:[{l:'Hang the plaque',s:()=>1,f:()=>{S.rep=clamp(S.rep+8,0,100);return 'Foot traffic bump.'}}]},
 {id:'reader',w:()=>S.stage>=1?.4:0,t:()=>'The card reader is down (POS outage).',ch:[{l:'Use Tap-to-Pay on a phone',s:()=>1.4,f:()=>'Phone tap-to-pay saved the day.'},{l:'Cash only today',s:()=>.6,f:()=>{S.mods.closed=1;return 'Most shoppers walked. Effectively closed.'}}]},
 {id:'insure',w:()=>S.day>300&&!S.flags.insQ?.4:0,t:()=>`Insurance renewal: premium up ${S.f1=RI(6,18)}%.`,ch:[
  {l:'Renew',s:()=>1.5,f:()=>{S.flags.insQ=1;S.mods.ins*=1+S.f1/100;return 'Renewed. Boring but essential.'}},
  {l:'Drop product liability to save money',s:()=>0,f:()=>{S.flags.insQ=1;S.insured=false;return 'Dropped coverage. Risky — one claim could end us.'}}]},
];
const POD_SKIP=['hike','delay','wholesale','bulk','shoplift','fair'];
function pickEvent(){if(S.done)return null;const due=S.chain.findIndex(c=>c.day<=S.day);if(due>=0){const c=S.chain.splice(due,1)[0];return EVENTS.find(e=>e.id===c.id)}
 if(Math.random()>.075)return null;const pool=EVENTS.filter(e=>!e.chain&&!(POD()&&POD_SKIP.includes(e.id))&&e.w()>0&&!(S.flags['ev_'+e.id]>S.day-25));if(!pool.length)return null;
 let r=Math.random()*pool.reduce((a,e)=>a+e.w(),0);for(const e of pool){r-=e.w();if(r<=0)return e}return pool[0]}
function resolveEvent(e){S.flags['ev_'+e.id]=S.day;const text=e.t();const opts=e.ch.map(c=>({c,s:Math.max(0,c.s())*R(.8,1.2)}));const best=opts.filter(o=>o.s>0).sort((a,b)=>b.s-a.s)[0]||opts[0];
 const res=best.c.f();dec('event');log(`📣 ${text}`,'y');log(`🤖 Chose: ${best.c.l} → ${res}`,'t');if(e.big)S.moments.push({d:S.day,t:'📣 '+text.slice(0,70)});news(text.replace(/<[^>]+>/g,'').slice(0,90));
 return {text,opts:opts.map(o=>o.c.l),pick:best.c.l,res,big:e.big}}
// scheduled real-world calendar changes
function scheduled(){const t=dateOf(),d=ymd(t),md=d.slice(5);
 if(md==='01-01'&&S.day>30){S.cpi=(S.cpi||1)*1.03;S.co.skus.forEach(k=>k.p=Math.round(k.p*1.03));log('🏷️ New year price review: +3% across the line to keep up with inflation (est).','t')}
 if(md==='01-01'||md==='07-12'){S.mods.label*=1.04;log('📮 USPS rate change today (they adjust in January and July). Labels ~+4% (est).','t')}
 EC.minWage.forEach(m=>{if(m.from===d){log(`⚖️ Florida minimum wage is now ${fmt(m.w)}/hr.`,'y');news(`Florida minimum wage rises to $${m.w}/hr`)}});
 if(md==='11-01')log('🎄 Q4 starts. Historically Nov–Dec are ~19% of US retail sales (NRF) — more for gift shops. Building inventory ahead.','y');
 if(md==='06-01')log('🌀 Atlantic hurricane season starts (Jun 1–Nov 30).','t');
 if(S.stage>0&&S.flags.stageDay&&(S.day-S.flags.stageDay)%365===364){S.mods.rentEsc*=1.03;log('🏢 Lease anniversary: rent +3% (typical escalator, est).','t')}}
// ---------- visual playback of a day (cosmetic; economics already computed by econDay) ----------
let vday=null,V={s:[0,0,0,0],o:[0,0,0,0],kits:0,orders:0,boxes:0,flash:0,truckT:0,cash:0},queue=[],regT=0,thinkQ=[];
const LOOKS=()=>({skin:pick(['#f1c27d','#c68642','#8d5524','#ffdbac','#e0ac69']),hair:pick(['#2c1b10','#6d4c2e','#d4ac0d','#c0392b','#222','#aaa','#ff6fb5']),shirt:pick(['#e74c3c','#3498db','#9b59b6','#16a085','#f39c12','#ecf0f1','#2c3e50','#e67e22']),pants:pick(['#34495e','#2c3e50','#7f8c8d','#1a5276']),hat:Math.random()<.25?pick(['#c0392b','#f1c40f','#111']):null,tall:Math.random()<.5});
const CHC={etsy:'#f1641e',shopify:'#95bf47',store:'#7dd3ff',wholesale:'#c39bff'};
function startVisualDay(D,er,snap){
 S.time=0;vday={D,er,snap,shop:[],ord:[],bx:0,picked:0,vans:[.55,.92],truck:D.arrived.length?.3:-1,tasks:[],ti:-1,tt:0};
 S.weather=D.rain?(EC.hurricaneMonths.includes(D.mon)&&Math.random()<.2?'storm':'rain'):(Math.random()<.3?'cloudy':'sunny');S.wIcon={sunny:'☀️',cloudy:'⛅',rain:'🌧️',storm:'⛈️'}[S.weather];
 // shoppers
 if(D.store.open){const vis=D.store.visitors,n=Math.min(vis,24),sc=vis/Math.max(1,n);const sales=[...D.store.sales];
  const nb=Math.round(sales.length/sc),ns=Math.round(D.store.stockout/sc),nw=Math.round(D.store.walk/sc);
  for(let i=0;i<n;i++){const kind=i<nb?'buy':i<nb+ns?'so':i<nb+ns+nw?'walk':'look';vday.shop.push({at:R(.04,.86),kind,k:kind==='buy'?(sales[Math.floor(i*sc)]||sales[0]||{k:0}).k:null,done:0})}
  vday.shop.sort((a,b)=>a.at-b.at)}
 vday.ord=D.online.map(o=>({at:o.t*.9,ch:o.ch,k:o.k,done:0})).sort((a,b)=>a.at-b.at);
 // robot task plan
 const L=LAY(),r=D.robot,AI=salMode()==='ai',tot=Object.values(r).reduce((a,b)=>a+b,0)||1,dl=DAY_LEN*(AI?.6:.86);const cs=L.cashiers[0];
 const st=id=>{const s=ST(id);return s?[s.sx,s.sy]:[3,4]};
 const tk=[];const add=(id,h,spot,label)=>{if(h>.05)tk.push({id,d:h/tot*dl,spot,label})};
 const pd=POD();add('admin',r.admin,st('board'),'Doing the books…');add('make',r.make,st('bench0'),'Building '+S.co.unit+'…');add('pack',r.pack,st(pd?'desk':'pack'),pd?'Approving AI portraits ✅ → sending to print partner':'Packing orders…');add('cs',r.cs,st('desk'),pd?'Answering customer messages 💬 (photo requests, revisions)':'Answering support tickets…');add('design',r.design,st('desk'),pd?'Designing at the screen 🎨 (new printables & styles)':'Designing / R&D…');add('social',r.social||0,st('board'),'Filming content for socials 📱');
 if(r.store>.05){const h=r.store/tot*dl;tk.splice(1,0,{id:'store',d:h*.55,spot:cs,label:'Working the register'});tk.push({id:'store',d:h*.45,spot:cs,label:'Working the register'})}
 tk.splice(Math.floor(tk.length/2),0,{id:'dock',d:DAY_LEN*.05,spot:st('dock'),label:'Recharging…'});if(AI){tk.push({id:'dock',d:DAY_LEN*.02,spot:st('dock'),label:'Hot-swapping battery 🔋 (30 sec)'});tk.push({id:'cs',d:DAY_LEN*.08,spot:st('desk'),label:pd?'🌙 Night shift: replying to messages in minutes':'🌙 Night shift: answering tickets & writing SEO'});tk.push({id:'design',d:DAY_LEN*.08,spot:st('desk'),label:pd?'🌙 Night shift: generating portrait proofs':'🌙 Night shift: listings, books & experiments'});tk.push({id:'admin',d:99,spot:st('board'),label:'🌙 Night shift: monitoring orders & experiments (plugged in)'});vday.nightLog={done:0,txt:`🌙 Night shift (${S.aiLevel} AI): answered ${D.tickets} message${D.tickets===1?'':'s'} within minutes, ${pd?'checked '+D.online.length+' order'+(D.online.length===1?'':'s')+' & proofs':'updated listings & books'}, filed ${D.reprints||0} reprint claim${(D.reprints||0)===1?'':'s'}. AI cost today ${fmt(Math.round((D.aiOp||0)*100)/100)}.`}}else tk.push({id:'dock',d:99,spot:st('dock'),label:'Recharging overnight'});
 vday.tasks=tk;queue=[];shoppers=[];
 if(er)showEvent(er);
}
function nextTask(){const v=vday;v.ti++;const t=v.tasks[v.ti];if(!t)return;v.tt=t.d;bot.task=t;S.path=bfs(...tileOf(S),t.spot[0],t.spot[1])||[];bot.at=false}
function updVisual(dt){const v=vday;if(!v)return;const p=S.time/DAY_LEN;
 const snap=v.snap,lerp=(a,b)=>Math.round(a+(b-a)*Math.min(1,p*1.05));
 for(let k=0;k<4;k++){V.s[k]=Math.max(0,lerp(snap.s[k],S.inv.s[k]));V.o[k]=Math.max(0,lerp(snap.o[k],S.inv.o[k]))}
 V.kits=lerp(snap.kits,S.kits.reduce((a,b)=>a+b,0));V.cash=snap.cash+(S.cash-snap.cash)*Math.min(1,p);
 // robot tasks
 if(!bot.task||(bot.at&&(v.tt-=dt)<=0&&bot.task.id!=='dock')||(bot.task.id==='dock'&&bot.at&&v.tt<=0)){nextTask()}
 else if(bot.task&&bot.task.id==='dock'&&bot.at){v.tt-=dt;S.energy=Math.min(100,S.energy+dt*25)}
 if(bot.task&&!bot.at){if(walk(S,dt,S.up.legs?115:80)){bot.at=true}}
 else if(bot.task){S.energy=Math.max(5,S.energy-dt*.9);busy=1;busyLabel=bot.task.label;if(bot.task.id==='make'&&Math.random()<dt*2)burst(S.x+16,S.y+8,2,['#ffd76a','#fff'],60)}
 robotServing=bot.task&&bot.task.id==='store'&&bot.at;
 // thoughts
 bot.thinkT-=dt;if(bot.thinkT<=0&&thinkQ.length){const t=thinkQ.shift();bot.think=t;bot.thinkT=Math.max(3.5,Math.min(7,t.length/18))}
 // shoppers
 for(const s of v.shop){if(!s.done&&p>=s.at){s.done=1;spawnShopper(s)}}
 shoppers.forEach(s=>updShopper(s,dt));shoppers=shoppers.filter(s=>!(s.st==='leave'&&!s.path.length));
 updRegister(dt);
 // online orders
 for(const o of v.ord){if(!o.done&&p>=o.at){o.done=1;if(POD())podFlow.push({t:0,c:S.co.skus[o.k].c,dig:!S.co.skus[o.k].v});V.orders++;V.flash=.6;const pk=ST('pack');if(floaters.length<60)floaters.push({t:(o.ch==='etsy'?'Etsy':'Shopify')+' order: '+S.co.skus[o.k].n,c:CHC[o.ch],x:pk.x*T+20,y:pk.y*T-14,l:1.8});SFX.coin()}}
 if(V.flash>0)V.flash-=dt;
 const shippedSoFar=Math.round(v.D.shipped*Math.min(1,p/.9));if(shippedSoFar>v.bx){V.boxes+=shippedSoFar-v.bx;V.orders=Math.max(0,V.orders-(shippedSoFar-v.bx));v.bx=shippedSoFar}
 // van & truck
 if(v.vans.length&&p>=v.vans[0]-.06&&van.state==='away'&&!POD()){van.state='arrive';van.t=2}
 if(van.state!=='away'){van.t-=dt;if(van.state==='arrive'&&van.t<=0){van.state='park';van.t=4;if(V.boxes){log(`🚐 USPS pickup: ${V.boxes} package${V.boxes>1?'s':''} (Ground Advantage).`,'g');SFX.coin()}V.boxes=0}else if(van.state==='park'&&van.t<=0){van.state='leave';van.t=2}else if(van.state==='leave'&&van.t<=0){van.state='away';v.vans.shift()}}
 if(v.truck>=0&&p>=v.truck){v.truck=-1;V.truckT=3.5;const a=v.D.arrived;log(`🚚 Supplier delivery: ${a.map(x=>x.q+'× '+S.co.skus[x.k].n+' kits').join(', ')}.`,'g');const m=ST('mat');burst(m.sx*T+16,m.sy*T,10,['#b5835a','#ddd'])}
 if(V.truckT>0)V.truckT-=dt;
 npcs.forEach(n=>updNpc(n,dt));
}
function spawnShopper(spec){const d=ST('door');shoppers.push({x:d.sx*T,y:(d.sy+1)*T,path:[[d.sx,d.sy]],st:'in',t:0,look:LOOKS(),face:1,walkT:0,pat:spec.kind==='walk'?R(8,12):99,wait:0,spec})}
function shopperLeave(s,happy,msg){s.st='leave';s.happy=happy;const d=ST('door');s.path=bfs(...tileOf(s),d.sx,d.sy)||[];if(msg&&floaters.length<60)floaters.push({t:msg,c:happy?'#7dff8a':'#ff7d7d',x:s.x+16,y:s.y,l:1.6});const qi=queue.indexOf(s);if(qi>=0){queue.splice(qi,1);requeue()}}
function requeue(){const Q=LAY().queue;queue.forEach((s,i)=>{if(s.slot!==i){s.slot=i;const [x,y]=Q[Math.min(i,Q.length-1)];s.path=bfs(...tileOf(s),x,y)||[]}})}
function updShopper(s,dt){const arrived=walk(s,dt,60),k=s.spec.kind;
 if(s.st==='in'&&arrived){const ds=stations().filter(x=>x.type==='disp');const t=pick(ds);s.st='go';s.path=bfs(...tileOf(s),t.sx,t.sy)||[]}
 else if(s.st==='go'&&arrived){s.st='browse';s.t=R(1.5,4)}
 else if(s.st==='browse'){s.t-=dt;if(s.t<=0){
  if(k==='so')return shopperLeave(s,false,pick(['Sold out?!','Out of stock 😠','Empty shelves…']));
  if(k==='look')return shopperLeave(s,true,Math.random()<.3?pick(['Just looking','Cute shop!','Maybe next time']):null);
  s.sku=S.co.skus[s.spec.k||0];const Q=LAY().queue;if(queue.length>=Q.length)return shopperLeave(s,false,'Line is too long!');queue.push(s);s.st='queue';s.slot=-1;s.wait=0;requeue()}}
 else if(s.st==='queue'){s.wait+=dt;if(s.wait>s.pat){s.sku=null;shopperLeave(s,false,pick(['Ugh, forget it.','Waited forever!','This line 🙄']))}}}
function updRegister(dt){const front=queue[0];let power=robotServing?1.2:0;npcs.forEach(n=>{if(n.ref.role==='retail'&&n.atHome&&!n.brk)power+=1});
 if(!front||front.path.length||front.slot!==0||power<=0){regT=0;return}regT+=dt*power;if(regT<2.2)return;regT=0;
 const k=front.sku||S.co.skus[0];const t=ST('till');burst(t.x*T+16,t.y*T,8,['#ffd76a','#f1c40f']);SFX.kaching();if(floaters.length<60)floaters.push({t:'+$'+k.p,c:'#ffd76a',x:t.x*T+16,y:t.y*T-6,l:1.2});
 front.carry=k;front.sku=null;shopperLeave(front,true,Math.random()<.3?pick(['Love it!','So cute!','Take my money','⭐⭐⭐⭐⭐']):null)}
// ---------- staff NPCs (cosmetic) ----------
function addNpc(ref){const d=ST('door');npcs.push({ref,kind:'human',name:ref.name,x:d.sx*T,y:d.sy*T,path:[],face:1,walkT:0,look:ref.look||LOOKS(),home:null,atHome:false,brk:0})}
function homeOf(n){const r=n.ref.role,same=S.staff.filter(s=>s.role===r),i=Math.max(0,same.indexOf(n.ref)),Ly=LAY();
 if(r==='retail'){const c=Ly.cashiers[i];return c||[Ly.s0+1+i,7]}
 if(r==='ship'){const p=i%2&&ST('pack1')?ST('pack1'):ST('pack');return [p.sx,p.sy+(i>1?1:0)]}
 if(r==='maker'){const bs=benches(),b=bs[(i+(bs.length>1?1:0))%bs.length];return [b.sx+(i>=bs.length?1:0),b.sy]}
 if(r==='cs'){const d=ST('desk');return [d.sx+1+i,d.sy]}
 if(r==='eng'){const sp=[ST('rack')?[ST('rack').sx,ST('rack').sy]:[3,4],[ST('desk').sx,ST('desk').sy+1]];return sp[i%sp.length]}
 return [ST('board').sx+i,ST('board').sy]}
function updNpc(n,dt){if(n.brk>0){n.brk-=dt;if(walk(n,dt,60)&&n.brk<=0)n.home=null;return}
 const h=homeOf(n);if(!n.home||n.home[0]!==h[0]||n.home[1]!==h[1]){n.home=h;n.atHome=false;n.path=bfs(...tileOf(n),h[0],h[1])||[];if(!n.path.length){n.x=h[0]*T;n.y=h[1]*T}}
 if(!n.atHome){if(walk(n,dt,n.ref.morale<30?40:70))n.atHome=true;return}
 if(ST('coffee')&&Math.random()<dt*(n.ref.morale<40?.02:.005)){n.brk=6;n.atHome=false;n.home=null;const c=ST('coffee');n.path=bfs(...tileOf(n),c.sx,c.sy)||[];return}
 const r=n.ref.role;if(Math.random()<dt*.05&&floaters.length<60)floaters.push({t:pick(r==='retail'?(queue.length?['Next please!','Bag or no bag?','Have a nice day!']:['Restocking…','Facing shelves','Welcome in!']):r==='cs'?['☎ Support line…','Answering emails','Refund processed']:r==='ship'?['📦 tape tape tape','Label printed','Where is USPS?']:r==='maker'?['🔨','Almost done…','Handcrafted!']:r==='eng'?['New prototype!','CAD time','Cut 2 min off build']:['Posting reels','Email blast sent']),c:'#ccc',x:n.x+16,y:n.y,l:1.2});
 if(r==='maker'&&Math.random()<dt*.6)burst(n.x+16,n.y+8,2,[S.co.skus[0].c,'#fff'],60);if(r==='ship'&&Math.random()<dt*.4)burst(n.x+16,n.y+8,2,['#c49468'],50)}
// ---------- log / thoughts / news ----------
function clock(){const m=Math.floor(9*60+Math.min(1,S.time/DAY_LEN)*10*60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
function log(t,cls=''){if(HEADLESS)return;const e={d:S.day,ds:dstr().slice(4,10),c:clock(),t,cls};S.log.push(e);if(S.log.length>300)S.log.shift();addLogLine(e)}
function addLogLine(e){const lb=$('logb');if(!lb)return;const d=document.createElement('div');d.innerHTML=`<i>${e.ds||('D'+e.d)} ${e.c}</i> <span class="${e.cls}">${e.t}</span>`;lb.appendChild(d);while(lb.children.length>60)lb.removeChild(lb.firstChild);lb.scrollTop=lb.scrollHeight}
function think(t,cls){if(HEADLESS)return;log(t,cls);if(thinkQ.length<6)thinkQ.push(t)}
function toast(t){if(HEADLESS)return;const d=document.createElement('div');d.textContent=t;$('toast').appendChild(d);setTimeout(()=>d.remove(),3500)}
function burst(x,y,n,cols,up=160){if(HEADLESS||!running)return;for(let i=0;i<n;i++)particles.push({x,y,vx:R(-up/2,up/2),vy:R(-up,-up/4),l:R(.5,1.1),c:pick(cols),g:300});if(particles.length>400)particles.splice(0,particles.length-400)}
function moment(t,big=true){S.moments.push({d:S.day,t});if(HEADLESS)return;toast(t);if(big){S.flags.visualNext=1;shake(.3,3)}}
function news(t){S.heads.push(t);if(S.heads.length>30)S.heads.shift()}
function shake(t,m){if(HEADLESS)return;shakeT=Math.max(shakeT,t);shakeMag=Math.max(shakeMag,m)}
function milestone(t){if(HEADLESS)return;SFX.mile();burst(S.x+16,S.y+10,40,['#ffd76a','#ff6fb5','#7dd3ff','#7dff8a'],220);log('🏆 '+t,'g')}
function setLevel(st){S.level=STAGE_LAYOUT[st];if(HEADLESS)return;bot.path=[];bot.task=null;const d=ST('dock');S.x=d.sx*T;S.y=d.sy*T;npcs.forEach(n=>{n.home=null;const h=homeOf(n);n.x=h[0]*T;n.y=h[1]*T});resize()}
let shakeT=0,shakeMag=0;
// ---------- stepping ----------
function snapshot(){return {cash:S.cash,s:[...S.inv.s],o:[...S.inv.o],kits:S.kits.reduce((a,b)=>a+b,0),bl:S.backlog.length}}
function stepDay(){if(S.done)return null;scheduled();planner();if(S.done)return null;
 const ev=pickEvent();const er=ev?resolveEvent(ev):null;if(S.done)return {er};
 const D=econDay();const mor=S.staff.length?S.staff.reduce((a,s)=>a+s.morale,0)/S.staff.length:80;S.morale=mor;
 S.dh.push({robot:D.robot,bl:S.backlog.length,unans:D.unans,walk:D.store.walk,so:D.store.stockout,mor});if(S.dh.length>30)S.dh.shift();
 S.day++;
 if(mkey(dateOf())!==S.mo.k){const m=closeMonth();D.closedMonth=m;monthlyDecisions(m)}
 return {D,er};
}
const tierName=()=>{const t=EC.tiers.filter(x=>S.tiers[x.id]);return t.length?'Best result: '+t[t.length-1].n:'Never had a profitable month'};
const bestTier=()=>{const t=EC.tiers.filter(x=>S.tiers[x.id]);return t.length?t[t.length-1].id:'none'};
// ---------- overlays ----------
let overlay=null;
function showOverlay(html,dur,keep){$('mbox').innerHTML=html;$('modal').classList.remove('hidden');overlay={t:0,dur:dur||4,keep}}
function updOverlay(rdt){if(!overlay||overlay.keep)return;overlay.t+=rdt*(window.__rfFast?Math.min(20,window.__rfFast):1);if(overlay.t>=overlay.dur){overlay=null;$('modal').classList.add('hidden')}}
function showEvent(er){showOverlay(`<h2>📣 ${dstr()}</h2><p>${er.text}</p><div class="ch">${er.opts.map(o=>`<button class="${o===er.pick?'pick':''}" disabled>${o===er.pick?'🤖 ▶ ':''}${o}</button>`).join('')}</div><p class="why">${er.res}</p>`,highlights?5:3.5)}
function pnlTable(ms,cur){const cols=ms.map(m=>({k:mname(m.k),m,P:m.P||pnl(m)}));const row=(l,f,b)=>`<tr${b?' class="b"':''}><td>${l}</td>${cols.map(c=>`<td>${f(c)}</td>`).join('')}</tr>`;const f0=n=>fmt(Math.round(n));
 return `<table class="pnl"><tr class="b"><td></td>${cols.map(c=>`<td>${c.k}${c.m===cur?'*':''}</td>`).join('')}</tr>
 ${row('Etsy revenue',c=>f0(c.m.rev.etsy))}${row('Shopify revenue',c=>f0(c.m.rev.shopify))}${row('In-store revenue',c=>f0(c.m.rev.store))}${c0(cols)?row('Wholesale',c=>f0(c.m.rev.wholesale)):''}
 ${row('Refunds & chargebacks',c=>f0(-c.m.refunds))}${row('Net revenue',c=>f0(c.P.net_rev),1)}
 ${row('Materials (COGS)',c=>f0(-c.m.cogs-c.m.scrap))}${row('Packaging',c=>f0(-c.m.pack))}${row('Shipping labels (net)',c=>f0(-c.P.shipNet))}${row('Gross margin',c=>`${f0(c.P.gm)} <small>${Math.round(c.P.gmPct*100)}%</small>`,1)}
 ${row('Channel & card fees',c=>f0(-(c.m.fees.etsy+c.m.fees.shopify+c.m.fees.store)))}${row('Shopify plan + apps',c=>f0(-c.m.subs))}${row('Wages',c=>f0(-c.m.wages))}${row('Payroll tax + WC',c=>f0(-c.m.burden))}
 ${row('Rent (NNN)',c=>f0(-c.m.rent))}${row('Utilities',c=>f0(-c.m.util))}${row('Insurance',c=>f0(-c.m.ins))}${row('Licenses & fees',c=>f0(-c.m.lic))}${row('Advertising',c=>f0(-c.m.ads))}${row('🤖 AI operator (24/7 agent)',c=>f0(-(c.m.aiOp||0)))}${row('👤 Founder pay (incl. above in labor)',c=>f0(-(c.m.founderPay||0)))}${row('Other / events',c=>f0(-c.m.other))}
 ${row('Interest',c=>f0(-c.m.interest))}${row('Net income',c=>`<span style="color:${c.P.net>=0?'#7dff8a':'#ff7d7d'}">${f0(c.P.net)}</span>`,1)}${row('Income tax set-aside',c=>f0(-(c.m.incomeTax||0)))}
 ${row('Sales tax collected → remitted',c=>`${f0(c.m.taxCol)} → ${f0(c.m.taxRem)}`)}${row('Inventory purchased',c=>f0(-c.m.matBuy))}${row('Loans in / principal out',c=>`${f0(c.m.loanIn+c.m.ffIn+c.m.eqIn)} / ${f0(-c.m.loanOut)}`)}${row('Cash end of month',c=>f0(c.m.cash1||S.cash),1)}</table>`}
const c0=cols=>cols.some(c=>c.m.rev.wholesale>0);
function showMonth(m){const P=m.P;showOverlay(`<h2>📒 Monthly P&L — ${mname(m.k)}</h2>${pnlTable([m])}<p class="why">${P.net>=0?'✅ Profitable month.':'🔻 Loss month.'} Break-even ≈ ${breakEven()?fmt(Math.round(breakEven()))+'/mo revenue':'n/a'} · Debt ${fmt(Math.round(debt()))} · Staff ${S.staff.length}</p>`,highlights?5:4)}
function weekToast(){const w=S.daily.slice(-7);const rev=w.reduce((a,d)=>a+d.rev,0),o=w.reduce((a,d)=>a+d.oe+d.os+d.ss,0);toast(`📅 Week of ${dstr(S.day-7).slice(4)}: ${fmt(rev)} revenue · ${o} orders · cash ${fmt(S.cash)}`)}
// ---------- endings ----------
function endGame(kind,text){if(S.done)return;S.done=true;S.outcome=kind;S.endText=text;S.tierBest=bestTier();S.moments.push({d:S.day,t:OUT[kind][0]+' '+OUT[kind][1]});if(HEADLESS)return;
 localStorage.removeItem(SAVE);const h=hall();h.unshift({name:S.co.name,ind:S.co.industry,robot:S.co.robot,color:S.co.color,outcome:kind,tier:S.tierBest,days:S.day,peak:Math.round(S.peakTTM),offer:S.flags.offer||0,date:new Date().toISOString().slice(0,10)});localStorage.setItem(HALL,JSON.stringify(h.slice(0,50)));
 log(OUT[kind][1]+'. '+text,['acquired','ipo','survived'].includes(kind)?'g':'r');news(`${S.co.name}: ${OUT[kind][1].toLowerCase()} — ${dstr()}`);shake(.8,8);
 if(['acquired','ipo'].includes(kind)){SFX.mile();for(let i=0;i<150;i++)particles.push({x:R(0,worldW()*T),y:-10,vx:R(-30,30),vy:R(40,160),l:R(2,4),c:pick(['#ffd76a','#ff6fb5','#7dd3ff','#7dff8a']),g:20})}else if(kind!=='survived'){SFX.lose();Music.mood='crisis'}
 vday=null;setTimeout(()=>runSummary(kind,text),900)}
function runSummary(kind,text){const mo=S.months.length;const tot=S.months.reduce((a,m)=>{a.rev+=m.P.rev;a.net+=m.P.net;return a},{rev:0,net:0});
 const miles=EC.tiers.filter(x=>S.tiers[x.id]);
 const html=`<h2>📖 ${text.split(':')[0]}</h2><p>${text.split(':').slice(1).join(':')||text}</p><table>
 <tr><td>Company</td><td>${S.co.name}</td></tr><tr><td>Product line</td><td>${S.co.industry}${S.lifetime.pivots?` (pivoted ${S.lifetime.pivots}×)`:''}</td></tr><tr><td>Founder</td><td>${S.co.robot} (${S.co.traitName})</td></tr>
 <tr><td>Trading</td><td>${dstr(0).slice(4)} → ${dstr().slice(4)} (${mo} months)</td></tr><tr><td>Lifetime revenue</td><td>${fmt(Math.round(tot.rev))}</td></tr><tr><td>Peak trailing-12-mo revenue</td><td>${fmt(Math.round(S.peakTTM))}</td></tr>
 <tr><td>Best month</td><td>${fmt(Math.round(Math.max(0,...S.months.map(m=>m.P.rev))))}</td></tr><tr><td>Strategy moves / comebacks</td><td>${S.strat.length} / ${S.comebacks}</td></tr>
 <tr><td>Milestones</td><td>${miles.map(x=>TIER_ICON[x.id]+' '+x.n.split(' (')[0]).join('<br>')||'—'}</td></tr></table>
 <p><b>Recap</b> (monthly revenue & net)</p><canvas id="recap" width="480" height="120" style="width:100%"></canvas>
 <div class="moments">${S.moments.slice(-10).map(m=>`<p style="margin:2px 0">${dstr(m.d).slice(4)}: ${m.t}</p>`).join('')}</div>
 <div class="ch"><button id="bKeep">▶ Keep going</button><button id="bExpE">⬇ Export business plan</button><button id="bHallE">Hall of Fame</button><button id="bAgain">Start a new company</button></div>`;
 showOverlay(html,0,true);drawRecap($('recap'));$('bExpE').onclick=()=>exportPlan();$('bKeep').onclick=()=>{overlay=null;$('modal').classList.add('hidden')};
 $('bAgain').onclick=()=>{overlay=null;newCompany()};$('bHallE').onclick=()=>showHall(true)}
function drawRecap(c){const g=c.getContext('2d'),W=c.width,H=c.height,ms=S.months;g.fillStyle='#120f22';g.fillRect(0,0,W,H);if(!ms.length)return;
 const mx=Math.max(1,...ms.map(m=>m.P.rev)),mn=Math.min(0,...ms.map(m=>m.P.net)),bw=(W-20)/ms.length,Y=v=>H-20-(v-mn)/(mx-mn)*(H-36);
 ms.forEach((m,i)=>{const x=10+i*bw;g.fillStyle='#8f7cff';g.fillRect(x,Y(m.P.rev),Math.max(1,bw-2),Y(0)-Y(m.P.rev));g.fillStyle=m.P.net>=0?'#7dff8a':'#ff6b6b';const y0=Y(0),y1=Y(m.P.net);g.fillRect(x+bw*.3,Math.min(y0,y1),Math.max(1,bw*.4),Math.abs(y1-y0)||1)});
 g.strokeStyle='#555';g.beginPath();g.moveTo(10,Y(0));g.lineTo(W-10,Y(0));g.stroke();g.font='10px monospace';g.fillStyle='#aaa';g.fillText('revenue',12,12);g.fillStyle='#7dff8a';g.fillText('net',70,12);g.fillStyle='#aaa';g.fillText(mname(ms[0].k),6,H-4);g.fillText(mname(ms[ms.length-1].k),W-64,H-4)}
function showHall(fromSummary){if(S&&!HEADLESS&&S.months)upsertHall();const h=hall().filter(r=>r.id);
 const html=`<h2>🏛 Hall of Fame</h2><p>${h.length} compan${h.length===1?'y':'ies'} founded · ranked by peak trailing-12-month revenue</p>
 <table class="hall"><tr><td><b>Company</b></td><td><b>Milestones</b></td><td><b>Months</b></td><td><b>Peak TTM rev</b></td></tr>${h.slice(0,20).map((r,i)=>`<tr><td>${['🥇','🥈','🥉'][i]||''}<span style="color:${r.color}">■</span> ${r.name}<br><small style="opacity:.6">${r.ind}</small></td><td>${(r.tiers||[]).map(t=>TIER_ICON[t]).join(' ')||'🌱'}<br><small>${r.comebacks?'🔥'.repeat(Math.min(3,r.comebacks))+' comeback'+(r.comebacks>1?'s':''):''}${r.offer?' · offer '+fmt(r.offer):''}</small></td><td>${r.months}</td><td>${fmt(r.peak||0)}<br><small>best month ${fmt(r.best||0)}</small></td></tr>`).join('')||'<tr><td>No companies yet.</td></tr>'}</table>
 <p class="why">${EC.tiers.map(t=>TIER_ICON[t.id]+' '+t.n.split(' (')[0]).join(' · ')} · 🔥 comeback</p>
 <div class="ch"><button id="bHallClose">Close</button></div>`;
 if(fromSummary){showOverlay(html,0,true);$('bHallClose').onclick=()=>{overlay=null;$('modal').classList.add('hidden')};return}
 $('hallbox').innerHTML=html;$('hallwrap').classList.remove('hidden');$('bHallClose').onclick=()=>$('hallwrap').classList.add('hidden')}
// ---------- books (P&L, channels, unit economics, export) ----------
let booksTab='pnl';
function openBooks(tab){booksTab=tab||booksTab;$('bookswrap').classList.remove('hidden');renderBooks()}
function renderBooks(){if(!S)return;const tabs=[['pnl','📒 Monthly P&L'],['ch','🛍 Channels'],['unit','🧮 Unit economics'],['cash','💵 Cash & break-even'],['strat','🧠 Strategy'],['fc','📈 Forecast'],['tests','🧪 Experiments'],['plan','🎯 Plan & OKRs'],['lessons','📚 Lessons'],['miles','🏆 Milestones'],['exp','⬇ Export']];
 let body='';const ms=[...S.months.slice(-5),S.mo];
 if(booksTab==='pnl')body=`<p class="why">Last ${ms.length} months (* = month to date). All amounts USD.</p><div class="scroll">${pnlTable(ms,S.mo)}</div>`;
 else if(booksTab==='ch'){const m=S.mo,L=S.months[S.months.length-1]||m;const chs=[['etsy','Etsy shop'],['shopify','Shopify site'],['store','In-store POS']];
  body=`<table class="pnl"><tr class="b"><td>${mname(L.k)}</td>${chs.map(c=>`<td style="color:${CHC[c[0]]}">${c[1]}</td>`).join('')}</tr>
  <tr><td>Status</td>${chs.map(c=>`<td>${S.ch[c[0]].open>=0?'open since '+dstr(S.ch[c[0]].open).slice(4,10):'not open'}</td>`).join('')}</tr>
  <tr><td>Traffic (views/sessions/visitors)</td>${chs.map(c=>`<td>${Math.round(L.traffic[c[0]])}</td>`).join('')}</tr>
  <tr><td>Orders</td>${chs.map(c=>`<td>${L.orders[c[0]]}</td>`).join('')}</tr>
  <tr><td>Conversion</td>${chs.map(c=>`<td>${L.traffic[c[0]]?(L.orders[c[0]]/L.traffic[c[0]]*100).toFixed(2)+'%':'—'}</td>`).join('')}</tr>
  <tr><td>Revenue</td>${chs.map(c=>`<td>${fmt(Math.round(L.rev[c[0]]))}</td>`).join('')}</tr>
  <tr><td>Materials</td>${chs.map(c=>`<td>${fmt(-Math.round(L.cogsBy[c[0]]))}</td>`).join('')}</tr>
  <tr><td>Fees (marketplace/card)</td>${chs.map(c=>`<td>${fmt(-Math.round(L.fees[c[0]]))}</td>`).join('')}</tr>
  <tr><td>Shipping (net) + packaging</td>${chs.map(c=>`<td>${c[0]==='store'?'—':fmt(-Math.round((L.labelsBy[c[0]]||0)+(L.packBy[c[0]]||0)))}</td>`).join('')}</tr>
  <tr><td>Channel fixed (plan/apps/rent)</td><td>${fmt(0)}</td><td>${fmt(-Math.round(L.subs))}</td><td>${fmt(-Math.round(L.rent+L.util))}</td></tr>
  <tr><td>Ads</td><td>${fmt(-Math.round(S.ads.etsy*L.days))}</td><td>${fmt(-Math.round(S.ads.shopify*L.days))}</td><td>—</td></tr>
  <tr class="b"><td>Channel contribution</td>${chs.map(c=>{const v=L.rev[c[0]]-L.cogsBy[c[0]]-L.fees[c[0]]-(c[0]==='store'?L.rent+L.util:(L.labelsBy[c[0]]||0)+(L.packBy[c[0]]||0)+(c[0]==='shopify'?L.subs:0))-(c[0]==='etsy'?S.ads.etsy*L.days:c[0]==='shopify'?S.ads.shopify*L.days:0);return `<td style="color:${v>=0?'#7dff8a':'#ff7d7d'}">${fmt(Math.round(v))}</td>`}).join('')}</tr></table>
  <p class="why">Etsy: $0.20 listing + 6.5% transaction + 3% + $0.25 processing (+15%/12% Offsite Ads on ~8% of orders). Shopify Basic $39/mo + ~$42/mo apps, 2.9% + 30¢. Square in-person 2.6% + 15¢. Labor & shared costs are not allocated to channels.</p>`}
 else if(booksTab==='unit'){body=(POD()?podTable():'')+`<table class="pnl"><tr class="b"><td>SKU</td><td>Ch</td><td>Price</td><td>Mat.</td><td>Labor</td><td>Pack</td><td>Label−chg</td><td>Fees</td><td>Returns</td><td>Contribution</td></tr>${S.co.skus.map(k=>['etsy','shopify','store'].map(ch=>{const u=unitEcon(k,ch);return `<tr style="opacity:${unlocked().includes(k)?1:.45}"><td>${ch==='etsy'?`<span style="color:${k.c}">■</span> ${k.n}${unlocked().includes(k)?'':' 🔒'}<br><small>${k.w} lb · ${Math.round(buildMin(k))} min</small>`:''}</td><td style="color:${CHC[ch]}">${ch}</td><td>$${u.p}</td><td>${u.mat}</td><td>${u.lab}</td><td>${u.pack}</td><td>${r2(u.label-u.shipChg)}</td><td>${u.fee}</td><td>${u.ret}</td><td style="color:${u.net>=0?'#7dff8a':'#ff7d7d'}">$${u.net} <small>${Math.round(u.m*100)}%</small></td></tr>`}).join('')).join('')}</table>
  <p class="why">Labor = build minutes × maker wage ${fmt(hourly('maker'))}/hr incl. payroll tax/WC (robot labor is free in-game, but a real business pays someone). Labels: USPS Ground Advantage commercial, zone 5; orders ≥ $${EC.freeShipOver} ship free.</p>`}
 else if(booksTab==='fc'){const c13=S.cf13||[],fu=S.fcRev||[],cf=fcConf();body=`<p class="why">Holt damped-trend smoothing on de-seasonalised weekly units per SKU × channel, times the seasonal index. Confidence = 1 − MAPE of the last 8 one-week-ahead forecasts: <b>${cf==null?'still learning':Math.round(cf*100)+'%'}</b>.</p><canvas id="fcbig" width="760" height="170" style="width:100%"></canvas>
  <table class="pnl"><tr class="b"><td>Week</td>${fu.map(x=>`<td>+${x.h}</td>`).join('')}</tr><tr><td>Units</td>${fu.map(x=>`<td>${Math.round(x.u)}</td>`).join('')}</tr><tr><td>Revenue</td>${fu.map(x=>`<td>${fmt(Math.round(x.rev))}</td>`).join('')}</tr><tr class="b"><td>Cash</td>${c13.map(v=>`<td style="color:${v<0?'#ff7d7d':'#7dff8a'}">${fmt(v)}</td>`).join('')}</tr></table>
  <p class="why">Used for: production targets & dynamic safety stock (z=${EC.brain.z}), reorder points, hiring (13-week cash must stay above the hire's monthly cost) and loan timing.</p>`}
 else if(booksTab==='tests'){const run=S.exps||[],done=(S.expDone||[]).slice().reverse();body=`<p class="why">Alternating-week A/B tests, season-adjusted. Winner = higher contribution per day (after ad spend for ad tests); adopted automatically. No new tests during Q4 or a cash crisis.</p>
  <table class="pnl"><tr class="b"><td>Running</td><td>A</td><td>B</td><td>Week</td></tr>${run.map(e=>`<tr><td>${e.type==='price'?'Price · '+S.co.skus[e.k].n:'Ads · '+e.ch}</td><td>${e.type==='price'?'$'+e.A:fmt(e.A)+'/d'}</td><td>${e.type==='price'?'$'+e.B:fmt(e.B)+'/d'}</td><td>${e.wk+1}/${e.len}</td></tr>`).join('')||'<tr><td>none</td></tr>'}</table>
  <div class="scroll">${done.map(r=>`<p class="mini"><b>${dstr(r.end).slice(4)}</b> · ${r.msg}</p>`).join('')||'<p class="mini">No finished tests yet.</p>'}</div>
  <table class="pnl"><tr class="b"><td>SKU</td><td>Price</td><td>Launch (infl.-adj.)</td><td>Learned elasticity</td><td>Tests</td></tr>${unlocked().map(k=>`<tr><td>${k.n}${S.feature===k.i?' ⭐':''}${k.md?' 🏷️':''}</td><td>$${k.p}</td><td>$${Math.round(k.p0*(S.cpi||1))}</td><td>${k.el!=null?k.el.toFixed(2):'—'}</td><td>${k.eln||0}</td></tr>`).join('')}</table>`}
 else if(booksTab==='plan'){const o=S.okr,sc=S.scen;body=`<h3>🎯 OKRs ${o?o.q:''}: ${o?o.O:'—'}</h3><table class="pnl">${o?o.krs.map(k=>`<tr><td>${k.n}</td><td>${Math.round(k.p*100)}%</td></tr>`).join(''):''}${(S.okrHist||[]).slice(-4).reverse().map(h=>`<tr><td><small>${h.q} · ${h.O}</small></td><td><small>score ${h.score.toFixed(1)}</small></td></tr>`).join('')}</table>
  <h3>🗺 Strategic plan</h3><table class="pnl">${stratPlan().map(x=>`<tr><td>${x.done?'✅':'⬜'} ${x.n}</td><td><small>${x.done?'done':x.gate}</small></td></tr>`).join('')}</table>
  <h3>🔮 Latest scenario${sc?': '+sc.label:''}</h3>${sc?`<table class="pnl"><tr class="b"><td>12 months</td><td>Best</td><td>Base</td><td>Worst</td></tr><tr><td>Change in cash</td><td>${fmt(sc.best.net)}</td><td>${fmt(sc.base.net)}</td><td>${fmt(sc.worst.net)}</td></tr><tr><td>Lowest cash</td><td>${fmt(sc.best.min)}</td><td>${fmt(sc.base.min)}</td><td>${fmt(sc.worst.min)}</td></tr><tr><td>Assumptions</td><td colspan="3"><small>revenue ×1.2 / ×1.0 / ×0.8 of forecast; new fixed ${fmt(sc.addMo)}/mo; capex ${fmt(sc.capex)}; uplift ${fmt(sc.up)}/mo ramping over 4 months</small></td></tr></table><p><b>${sc.go?'✅':'⛔'} ${sc.why}</b></p>`:'<p>No big commitment evaluated yet.</p>'}
  <p class="why">Next big decision: ${S.nextBig||'—'}</p>`}
 else if(booksTab==='lessons'){const mem=memLoad().filter(x=>x.co!==S.co.name).slice(-12).reverse();body=`<h3>📚 This company's knowledge base</h3><div class="scroll">${(S.kb||[]).slice().reverse().map(l=>`<p class="mini">${l.text} <small>(${dstr(l.d).slice(4)})</small></p>`).join('')||'<p class="mini">Nothing learned yet.</p>'}</div>
  <h3>🧬 Inherited from earlier companies</h3><div class="scroll">${(S.inherit||[]).map(t=>`<p class="mini">✔ applied · ${t}</p>`).join('')}${mem.map(l=>`<p class="mini">Lesson from ${l.co}: ${l.text}</p>`).join('')||'<p class="mini">First company — no memory yet.</p>'}</div>
  <p class="why">Customer lifetime value ≈ ${fmt(S.clv||0)} (AOV ${fmt(Math.round(aov()))} × contribution ${Math.round(cmRatio()*100)}% × ${EC.brain.ordersPerCustomer} orders). Email campaigns: ${S.lifetime.campaigns||0} sends → ${S.lifetime.emailOrders||0} orders. Bundles sold: ${S.lifetime.bundles||0}.</p>`}
 else if(booksTab==='strat'){const rep=stratReport();body=`<p class="why">Every Monday the robot reviews unit economics and cash runway, then acts. ${rwTxt()}. Moves so far: ${S.strat.length}.</p>
  <table class="pnl"><tr class="b"><td>Tactic</td><td>Times</td><td>Avg Δ monthly net, 2 mo later</td></tr>${rep.map(r=>`<tr><td>${r.n}</td><td>${r.c}</td><td style="color:${r.d>=0?'#7dff8a':'#ff7d7d'}">${r.k?fmt(Math.round(r.d)):'—'}</td></tr>`).join('')||'<tr><td>No moves yet</td></tr>'}</table>
  <div class="scroll">${S.strat.slice(-40).reverse().map(x=>`<p class="mini"><b>${dstr(x.d).slice(4)}</b> · ${STRAT_N[x.type]||x.type}: ${x.why}</p>`).join('')}</div>`}
 else if(booksTab==='miles'){body=`<table class="pnl">${EC.tiers.map(t=>`<tr><td>${S.tiers[t.id]?TIER_ICON[t.id]:'🔒'} ${t.n}</td><td>${S.tiers[t.id]!=null?dstr(S.tiers[t.id]).slice(4):'—'}</td></tr>`).join('')}<tr><td>🔥 Comebacks</td><td>${S.comebacks}</td></tr><tr><td>Peak trailing-12-month revenue</td><td>${fmt(Math.round(S.peakTTM))}</td></tr><tr><td>Best month</td><td>${fmt(Math.round(Math.max(0,...S.months.map(m=>m.P.rev))))}</td></tr>${S.flags.offer?`<tr><td>Best acquisition offer (declined)</td><td>${fmt(S.flags.offer)}</td></tr>`:''}</table>`}
 else if(booksTab==='cash'){const be=breakEven(),mf=monthlyFixed();body=`<table class="pnl"><tr><td>Cash</td><td>${fmt(Math.round(S.cash))}</td></tr><tr><td>Credit card balance / limit</td><td>${fmt(Math.round(S.cc.bal))} / ${fmt(S.cc.limit)} @ ${(EC.funding.ccApr*100).toFixed(1)}%</td></tr>${S.loans.map(l=>`<tr><td>${l.n}</td><td>${fmt(Math.round(l.bal))} @ ${(l.apr*100).toFixed(1)}% · ${fmt(Math.round(l.pay))}/mo</td></tr>`).join('')}${S.mca?`<tr><td>Merchant cash advance</td><td>${fmt(Math.round(S.mca.bal))} owed</td></tr>`:''}
  <tr><td>Inventory at cost (finished + kits)</td><td>${fmt(Math.round(invValue()))}</td></tr><tr><td>Sales tax owed to FL DOR</td><td>${fmt(Math.round(S.taxDue+S.taxLate))}</td></tr><tr><td>Monthly fixed costs (rent, utilities, insurance, subs, payroll, loan pmts)</td><td>${fmt(Math.round(mf))}</td></tr>
  <tr class="b"><td>Break-even revenue</td><td>${be?fmt(Math.round(be))+'/mo':'need 1 month of data'}</td></tr><tr><td>Last month revenue</td><td>${S.months.length?fmt(Math.round(S.months[S.months.length-1].P.rev)):'—'}</td></tr><tr><td>Trailing-12-month revenue / net</td><td>${fmt(Math.round(ttmRev()))} / ${fmt(Math.round(ttmNet()))}</td></tr><tr><td>Runway</td><td>${runwayMo()>=99?'cash-flow positive':runwayMo().toFixed(1)+' months'}</td></tr></table>`}
 else body=`<p>Download this run's numbers: monthly P&L, channel results and SKU unit economics as CSV, plus a plain-language business plan (Markdown) you can edit into a real one.</p><div class="ch"><button id="bExpCsv">⬇ Download CSV (P&L + unit economics)</button><button id="bExpMd">⬇ Download business plan (.md)</button></div><p class="why">Every assumption is listed with sources in ASSUMPTIONS.md and economics.js in the repo.</p><pre id="mdprev">${planMarkdown().slice(0,1400).replace(/</g,'&lt;')}…</pre>`;
 $('booksbox').innerHTML=`<div class="tabs">${tabs.map(t=>`<button data-t="${t[0]}" class="${t[0]===booksTab?'on':''}">${t[1]}</button>`).join('')}<button id="bBooksX">✕</button></div><h2>${S.co.name} — ${dstr()}</h2>${body}`;
 document.querySelectorAll('#booksbox [data-t]').forEach(b=>b.onclick=()=>{booksTab=b.dataset.t;renderBooks()});$('bBooksX').onclick=()=>$('bookswrap').classList.add('hidden');
 if($('fcbig'))drawFc($('fcbig').getContext('2d'),0,0,760,170,true);
 if($('bExpCsv')){$('bExpCsv').onclick=()=>download(slug()+'-numbers.csv',planCsv(),'text/csv');$('bExpMd').onclick=()=>download(slug()+'-business-plan.md',planMarkdown(),'text/markdown')}}
const slug=()=>S.co.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);window.__rfLastExport={name,len:text.length}}
function exportPlan(){download(slug()+'-numbers.csv',planCsv(),'text/csv');setTimeout(()=>download(slug()+'-business-plan.md',planMarkdown(),'text/markdown'),300)}
function planCsv(){const ms=[...S.months,S.mo];const q=v=>typeof v==='number'?Math.round(v*100)/100:'"'+String(v).replace(/"/g,'""')+'"';
 const rows=[['section','month','etsy_rev','shopify_rev','store_rev','wholesale_rev','refunds','net_rev','materials','packaging','shipping_net','gross_margin','channel_fees','shopify_subs','wages','payroll_tax_wc','rent','utilities','insurance','licenses','ads','other','interest','net_income','income_tax_setaside','sales_tax_collected','sales_tax_remitted','inventory_purchased','loans_in','principal_out','cash_end','orders_etsy','orders_shopify','orders_store','traffic_etsy','traffic_shopify','traffic_store']];
 ms.forEach(m=>{const P=pnl(m);rows.push(['pnl',m.k+(m===S.mo?' (MTD)':''),m.rev.etsy,m.rev.shopify,m.rev.store,m.rev.wholesale,m.refunds,P.net_rev,m.cogs+m.scrap,m.pack,P.shipNet,P.gm,m.fees.etsy+m.fees.shopify+m.fees.store,m.subs,m.wages,m.burden,m.rent,m.util,m.ins,m.lic,m.ads,m.other,m.interest,P.net,m.incomeTax||0,m.taxCol,m.taxRem,m.matBuy,m.loanIn+m.ffIn+m.eqIn,m.loanOut,m.cash1||S.cash,m.orders.etsy,m.orders.shopify,m.orders.store,Math.round(m.traffic.etsy),Math.round(m.traffic.shopify),m.traffic.store])});
 rows.push([]);rows.push(['unit_economics','sku','channel','price','materials','labor','packaging','label_minus_shipping_charged','fees','returns_allowance','contribution','margin_pct']);
 S.co.skus.forEach(k=>['etsy','shopify','store','wholesale'].forEach(ch=>{const u=unitEcon(k,ch);rows.push(['unit_economics',k.n,ch,u.p,u.mat,u.lab,u.pack,r2((u.label||0)-(u.shipChg||0)),u.fee,u.ret||0,u.net,Math.round(u.m*1000)/10])}));
 return rows.map(r=>r.map(q).join(',')).join('\n')}
function stratReport(){const g={};S.strat.forEach(x=>{if(['comeback','okr','scenario','mix','schedule'].includes(x.type))return;const r=g[x.type]=g[x.type]||{n:STRAT_N[x.type]||x.type,c:0,d:0,k:0};r.c++;const a=S.months[x.m+1];if(a&&x.m>0){r.d+=a.P.net-x.net0;r.k++}});
 return Object.values(g).map(r=>({...r,d:r.k?r.d/r.k:0})).sort((a,b)=>b.d-a.d)}
function planMarkdown(){const ms=S.months,L=ms[ms.length-1],tr=ttmRev(),be=breakEven(),u=unlocked();const best=u.map(k=>({k,e:unitEcon(k,'shopify')})).sort((a,b)=>b.e.net-a.e.net)[0];
 const f=n=>fmt(Math.round(n));const ch=['etsy','shopify','store'].filter(c=>S.ch[c].open>=0);
 return `# ${S.co.name} — Business Plan (draft)

_Generated by Robot Founder on ${new Date().toISOString().slice(0,10)} from a simulated run (${dstr(0)} → ${dstr()}). Numbers are a starting point, not advice. Sources: ASSUMPTIONS.md._

## 1. Concept
${S.co.name} makes **${S.co.industry.toLowerCase()}** in Melbourne, Florida (Brevard County), sold through ${ch.map(c=>({etsy:'an Etsy shop',shopify:'a Shopify web store',store:'a retail storefront'})[c]).join(', ')}.

## 2. Products & unit economics (per single-item order)
| SKU | Price | Materials | Build time | Etsy contribution | Shopify contribution | In-store contribution |
|---|---|---|---|---|---|---|
${S.co.skus.map(k=>`| ${k.n} | $${k.p} | $${r2(matCost(k))} | ${Math.round(buildMin(k))} min | $${unitEcon(k,'etsy').net} | $${unitEcon(k,'shopify').net} | $${unitEcon(k,'store').net} |`).join('\n')}

Best-margin product today: **${best?best.k.n:'—'}**. Contribution includes materials, paid maker labor at ${f(hourly('maker'))}/hr + payroll taxes, packaging, USPS Ground Advantage labels (orders ≥ $${EC.freeShipOver} ship free), channel fees and a returns allowance.

## 3. Sales channels
- **Etsy**: $0.20/listing, 6.5% transaction fee, 3% + $0.25 payment processing, Offsite Ads 15% (12% after $10k/yr) on attributed orders. New shops typically see ~10–30 views/day; Etsy conversion is typically 1–3%.
- **Shopify**: Basic plan $39/mo (monthly billing), ~$42/mo in apps, 2.9% + 30¢ card processing; typical store conversion ≈1.4%. Paid ads at ~$1.16 CPC only pay off for higher-priced SKUs.
- **Retail store**: Square 2.6% + 15¢ per card tap; small boutiques see ~50–150 visitors/day and convert 15–30%.

## 4. Operations
Make-to-stock with reorder points (daily usage × (lead time + 4 safety days)), 30-day material orders, separate store vs online stock allocations, ~${(defectRate()*100).toFixed(1)}% defect rate with QC, returns ~${EC.returns.online*100}% online / ${EC.returns.store*100}% in store.

## 5. Team & labor (Palm Bay–Melbourne–Titusville wages)
Florida minimum wage is $15.00/hr from Sep 30, 2026. Staff at end of run: ${S.staff.length?S.staff.map(s=>`${s.name} (${ROLES[s.role].n}, ${f(hourly(s.role))}/hr)`).join(', '):'none — the founder did everything'}. Employer costs: FICA 7.65%, FUTA 0.6% and FL reemployment tax 2.7% on the first $7,000/employee, workers' comp ($1.18/$100 retail).

## 6. Location & fixed costs
Stage reached: **${stageInfo().n}**. Brevard retail rent ≈ $20.34/sf/yr + ~$5.50 NNN (est), flex/industrial ≈ $13.65/sf/yr. Current monthly fixed costs ≈ **${f(monthlyFixed())}**.
Licenses: Florida LLC $125, annual report $138.75, Brevard business tax receipt $37/yr. Sales tax 7% (6% FL + 1% Brevard surtax) collected on in-store and in-state web sales; Etsy collects and remits its own.

## 7. Financials
${ms.length?`| Month | Revenue | Gross margin | Net income | Cash |
|---|---|---|---|---|
${ms.slice(-12).map(m=>`| ${mname(m.k)} | ${f(m.P.rev)} | ${f(m.P.gm)} (${Math.round(m.P.gmPct*100)}%) | ${f(m.P.net)} | ${f(m.cash1)} |`).join('\n')}`:'_No full month yet._'}

- Trailing-12-month revenue: **${f(tr)}**; net income: **${f(ttmNet())}**
- Break-even revenue: **${be?f(be)+'/month':'n/a'}**
- Debt: ${f(debt())} (${S.loans.map(l=>l.n).join(', ')||'none'}${S.cc.bal>0?', credit card':''})

## 8. Funding plan
Start with personal savings; a business credit card (~21–24% APR) only as a bridge. Friends & family notes, then an **SBA Microloan** (up to $50k, ~8–13%) after ~6 months of sales, and an **SBA 7(a)** loan (prime + up to 3–6.5%) once there are 1–2 years of financials. Equity investors rarely fund craft brands; acquirers typically pay ~2.2× SDE for small online businesses (1–2.5× if Etsy-dependent).

## 9. Strategies that worked
The robot reviewed unit economics and runway every week. Tactics ranked by average change in monthly net income two months after the move (simulated, directional only):

| Tactic | Times used | Avg Δ monthly net |
|---|---|---|
${stratReport().map(r=>`| ${r.n} | ${r.c} | ${r.k?f(r.d):'n/a'} |`).join('\n')||'| none yet | | |'}

${stratReport().filter(r=>r.k&&r.d>0).slice(0,3).map(r=>`- **${r.n}** paid off (${f(r.d)}/mo on average).`).join('\n')||'- Not enough history yet to rank tactics.'}
${S.comebacks?`- Survived ${S.comebacks} cash crisis${S.comebacks>1?'es':''} with: ${[...new Set(S.strat.filter(x=>['clear','sublet','equip','savings','gig','downsize','loan','freeze'].includes(x.type)).map(x=>STRAT_N[x.type]))].join(', ')}.`:''}

Recent moves:
${S.strat.slice(-8).map(x=>`- ${dstr(x.d).slice(4)}: ${x.why}`).join('\n')||'- none'}

## 10. Forecast, OKRs & lessons
- 13-week revenue forecast: **${f((S.fcRev||[]).reduce((a,x)=>a+x.rev,0))}** (forecast confidence ${fcConf()==null?'n/a':Math.round(fcConf()*100)+'%'}); 13-week cash low ${S.cf13&&S.cf13.length?f(Math.min(...S.cf13)):'n/a'}.
- Current objective: ${S.okr?`**${S.okr.O}** (${S.okr.q}) — ${S.okr.krs.map(k=>`${k.n}: ${Math.round(k.p*100)}%`).join('; ')}`:'n/a'}
- Experiments: ${(S.expDone||[]).slice(-5).map(r=>'\n  - '+r.msg).join('')||'none yet'}
- Lessons: ${(S.kb||[]).slice(-6).map(l=>'\n  - '+l.text).join('')||'none yet'}

## 11. Milestones hit
${EC.tiers.filter(x=>S.tiers[x.id]).map(x=>`- ${TIER_ICON[x.id]} ${x.n} (${dstr(S.tiers[x.id]).slice(4)})`).join('\n')||'- none yet'}

## 12. Key risks
Platform dependence (Etsy algorithm changes), supplier price hikes & lead times, product liability (${S.co.risk} risk category — insure it), hurricane season (Jun–Nov), Q4 seasonality (Nov–Dec ≈19%+ of retail sales), and the fact that a real founder must be paid: the in-game robot works ${EC.founderHours}h/day for free.
`}
// ---------- flow ----------
let S=null,running=false,paused=false,speed=1,highlights=true,follow=false,busy=0,busyLabel='',robotServing=false,dashOpen=innerWidth>900,ffAcc=0;
let bot={path:[],think:'',thinkT:0,walkT:0,face:1},npcs=[],shoppers=[],particles=[],floaters=[],van={state:'away',t:0},anim=0;
function save(){if(HEADLESS||!S)return;try{const o=Object.assign({},S);o.log=S.log.slice(-60);localStorage.setItem(SAVE,JSON.stringify(o))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE));return s&&s.co&&!s.done?s:null}catch(e){return null}}
function hall(){try{return JSON.parse(localStorage.getItem(HALL))||[]}catch(e){return []}}
const worldW=()=>LAY().w;
function initRun(){queue=[];shoppers=[];npcs=[];vday=null;van={state:'away',t:0};bot={path:[],think:'',thinkT:0,walkT:0,face:1};thinkQ=[];busy=0;overlay=null;S.level=STAGE_LAYOUT[S.stage];S.path=[];
 S.staff.forEach(r=>addNpc(r));npcs.forEach(n=>{const h=homeOf(n);n.x=h[0]*T;n.y=h[1]*T});const d=ST('dock');S.x=d.sx*T;S.y=d.sy*T;const sn=snapshot();V.s=[...sn.s];V.o=[...sn.o];V.kits=sn.kits;V.cash=S.cash;V.orders=S.backlog.length;V.boxes=0}
function begin(s){S=s;S.done=false;S.log=S.log||[];S.dh=S.dh||[];running=true;paused=false;$('modal').classList.add('hidden');$('logb').innerHTML='';S.log.slice(-40).forEach(addLogLine);initRun();
 $('title').classList.add('hidden');['hud','ctl','log','ticker'].forEach(i=>$(i).classList.remove('hidden'));$('dash').classList.toggle('hidden',!dashOpen);tickerItems=[];resize();Music.start()}
function newCompany(){if(S&&S.co&&S.months&&S.months.length)upsertHall();const s=newState();s.dh=[];localStorage.removeItem(SAVE);begin(s);S.flags.visualNext=1;
 log(`Booting ${s.co.robot} (${s.co.model}). Personality: ${s.co.traitName}. Perk: ${s.co.perkName}.`,'y');if(s.co.mode==='pod')log(`Business model: Digital + Print-on-Demand. No inventory, no makers: printables and AI pet portraits sell as files; prints ship from Printify. First sample: Benji 🐶.`,'y');
 log(`Filed ${s.co.name} LLC with Sunbiz ($125) and got a Brevard business tax receipt ($37). Savings: ${fmt(s.cash+162)}. Credit card limit: ${fmt(s.cc.limit)}.`,'y');
 log(`Plan: list ${s.co.unit} on Etsy first (cheapest way to find buyers), add Shopify once it sells, open a shop only when margins can carry Melbourne rent.`,'t');
 news(`New Melbourne maker ${s.co.name} opens Etsy shop from a garage; founder is a robot`);
 const k=s.co.skus[0],u=unitEcon(k,'etsy');
 showOverlay(`<h2>${dstr()}: ${s.co.name}</h2><p>Product line: <b>${s.co.industry}</b><br>${s.co.skus.map(k=>`${k.n} $${k.p}`).join(' · ')}<br>Founder: <b>${s.co.robot}</b> (${s.co.traitName}) · Perk: <b>${s.co.perkName}</b><br>Savings: <b>${fmt(s.cash)}</b> · Location: home garage, Melbourne FL</p><p class="why">First SKU on Etsy: $${k.p} price − $${u.mat} materials − $${u.lab} labor − $${r2(u.pack+u.label-u.shipChg)} ship/pack − $${u.fee} fees = <b>$${u.net}</b> contribution. Sit back — the robot runs everything.</p>`,6)}
function cont(){const s=load();if(!s)return;begin(s);log(`Resuming ${s.co.name} on ${dstr()}.`,'t')}
function toTitle(){running=false;overlay=null;$('modal').classList.add('hidden');$('title').classList.remove('hidden');['hud','ctl','log','dash','ticker'].forEach(i=>$(i).classList.add('hidden'));$('bCont').classList.toggle('hidden',!load())}
function setSpeed(v){speed=v;highlights=false;syncCtl()}
function syncCtl(){document.querySelectorAll('#ctl [data-sp]').forEach(b=>b.classList.toggle('on',!highlights&&+b.dataset.sp===speed));$('bHL').classList.toggle('on',highlights);$('bFollow').classList.toggle('on',follow);$('bDash').classList.toggle('on',dashOpen)}
function togglePause(){if(!running)return;paused=!paused;$('bPause').textContent=paused?'▶':'II';$('bPause').classList.toggle('on',paused);if(paused)toast('Paused')}
function toggleMute(){muted=!muted;localStorage.setItem('rfMute',muted?'1':'0');$('bMute').textContent=muted?'×':'♪';if(!muted)Music.start()}
document.querySelectorAll('#ctl [data-sp]').forEach(b=>b.onclick=()=>setSpeed(+b.dataset.sp));
$('bHL').onclick=()=>{highlights=!highlights;syncCtl();toast(highlights?'Highlights: quiet days fly by, big moments play out':'Highlights off — every day plays out')};
$('bPause').onclick=togglePause;$('bFollow').onclick=()=>{follow=!follow;syncCtl()};$('bMute').onclick=toggleMute;$('bMute').textContent=muted?'×':'♪';
$('bDash').onclick=()=>{dashOpen=!dashOpen;$('dash').classList.toggle('hidden',!dashOpen);syncCtl()};$('bBooks').onclick=()=>openBooks();
$('bNew').onclick=()=>{Music.start();SFX.click();FORCE_LINE=null;newCompany()};if($('salSel'))$('salSel').onchange=e=>SAL_PICK=e.target.value;if($('aiSel'))$('aiSel').onchange=e=>AI_LEVEL=e.target.value;if($('cofChk'))$('cofChk').onchange=e=>COF_ON=e.target.checked;if($('bLabT'))$('bLabT').onclick=()=>openLab();if($('bLab'))$('bLab').onclick=()=>openLab();if($('bPhoto'))$('bPhoto').onclick=()=>S&&photo();
if($('bSal'))$('bSal').onclick=()=>{if(!S)return;const order=['ai','off','side','full'];S.salMode=order[(order.indexOf(salMode())+1)%4];toast('💼 Founder pay: '+({off:'OFF (robot works free)',side:`Side hustle (${S.salHours} h/wk at $${S.salRate}/hr)`,full:'Full-time salary ($41.6k/yr)',ai:`AI 24/7 (${S.aiLevel} AI cost, you oversee ${S.overH} h/wk)`})[S.salMode]);log('💼 Founder pay set to '+S.salMode+'. Robot work hours now '+founderH().toFixed(1)+' h/day.','y')};if($('bDom'))$('bDom').onclick=()=>{Music.start();SFX.click();FORCE_LINE=EC.lines.findIndex(l=>l.mode==='pod');newCompany();FORCE_LINE=null};$('bCont').onclick=()=>{Music.start();SFX.click();cont()};$('bHall').onclick=()=>showHall(false);
addEventListener('keydown',e=>{if(!running)return;const m={Digit1:1,Digit2:2,Digit3:4,Digit4:8}[e.code];if(m)setSpeed(m);if(e.code==='KeyH')$('bHL').click();if(e.code==='KeyP'||e.code==='Space'){togglePause();e.preventDefault()}if(e.code==='KeyF')$('bFollow').click();if(e.code==='KeyM')toggleMute();if(e.code==='KeyD')$('bDash').click();if(e.code==='KeyB')openBooks()});
// ---------- simulation driver ----------
function wantVisual(r){if(!highlights)return true;const f=S.flags.visualNext;S.flags.visualNext=0;return f||S.day<=2||(r.er&&r.er.big)||S.day%30===12}
function advance(rdt){// called each frame
 const fast=window.__rfFast||1;
 if(vday){const sp=(highlights?3:speed)*fast;let left=rdt*sp;while(left>0&&vday){const dt=Math.min(.05,left);left-=dt;S.time+=dt;updVisual(dt);if(S.time>=DAY_LEN){finishVisual();break}}return}
 if(overlay&&!overlay.keep)return;// let monthly/event cards be read
 // fast-forward days: highlights ~8 days/sec; manual speeds go straight to visual days
 ffAcc+=rdt*(highlights?8:999)*fast;let n=0;
 while(ffAcc>=1&&n<60&&!S.done){ffAcc-=1;n++;const snap=snapshot();const r=stepDay();if(!r)break;
  if(r.D&&dateOf(S.day-1).getDay()===0){if(highlights)weekToast();showRecap()}
  if(r.D&&r.D.closedMonth){save();if(!S.done){showMonth(r.D.closedMonth)}}
  if(S.done)break;
  if(wantVisual(r)&&r.D){startVisualDay(r.D,r.er,snap);ffAcc=0;break}
  else{V.s=[...S.inv.s];V.o=[...S.inv.o];V.kits=S.kits.reduce((a,b)=>a+b,0);V.cash=S.cash;V.orders=S.backlog.length;S.time=DAY_LEN*.5;if(r.er&&highlights)toast('📣 '+r.er.text.replace(/<[^>]+>/g,'').slice(0,80))}
  if(r.D&&r.D.closedMonth)break}
}
function finishVisual(){vday=null;bot.task=null;busy=0;shoppers=[];queue=[];V.orders=S.backlog.length;save()}
// ---------- headless balance ----------
function runHeadless(maxDays=3*365){HEADLESS=true;S=newState();S.dh=[];let guard=0,neg=0,streak=0,low=0;while(!S.done&&guard++<maxDays){stepDay();if(S.cash<0){neg++;streak++;low=Math.min(low,S.cash)}else streak=0;S.maxNeg=Math.max(S.maxNeg||0,streak)}S.negDays=neg;S.lowCash=low;return S}
// dev tool only (not shown in UI): __rf.balance(n)
function balance(n=200,ov,days,mem){const keep=JSON.stringify(EC.lines);if(ov)ov(EC);SIMMEM=[];const out=[];for(let i=0;i<n;i++){if(mem==='fresh')SIMMEM=[];const s=runHeadless(days);const ms=s.months;
  out.push({tiers:Object.keys(s.tiers),ttm:Math.round(s.peakTTM),best:Math.round(Math.max(0,...ms.map(m=>m.P.rev))),rev:Math.round(ms.reduce((a,m)=>a+m.P.rev,0)),net:Math.round(ms.reduce((a,m)=>a+m.P.net,0)),lastTTMnet:Math.round(ttmNet()),stage:s.stage,staff:s.staff.length,line:s.co.industry,
   gm:ms.length?Math.round(ms.reduce((a,m)=>a+m.P.gm,0)/Math.max(1,ms.reduce((a,m)=>a+m.P.net_rev,0))*100):0,moves:s.strat.reduce((a,x)=>(a[x.type]=(a[x.type]||0)+1,a),{}),comebacks:s.comebacks,crisisOpen:!!s.crisis,cash:Math.round(s.cash),debt:Math.round(debt()),negDays:s.negDays,maxNeg:s.maxNeg,low:Math.round(s.lowCash),
   gig:!!s.flags.gig,gigRev:Math.round(s.lifetime.gig||0),sav:s.robotSav,pivots:s.lifetime.pivots||0,mode:s.co.mode,podOut:s.lifetime.podOut||0,digital:s.lifetime.digital||0,booths:s.lifetime.booths||0,premium:!!s.flags.premium,reprints:s.lifetime.reprints||0,revBy:(()=>{const m=s.months.slice(-12);return {etsy:m.reduce((a,x)=>a+x.rev.etsy,0),shopify:m.reduce((a,x)=>a+x.rev.shopify,0),store:m.reduce((a,x)=>a+x.rev.store,0)}})(),tests:(s.expDone||[]).length,conf:(()=>{const sv=S;S=s;const c=fcConf();S=sv;return c})(),kb:(s.kb||[]).length,inh:(s.inherit||[]).length,emailOrders:s.lifetime.emailOrders||0,bundles:s.lifetime.bundles||0,okr:(s.okrHist||[]).length?s.okrHist.reduce((a,o)=>a+o.score,0)/s.okrHist.length:0,scen:(s.scenHist||[]).length,ue:Math.round(unitEcon(s.co.skus.find(k=>!k.off)||s.co.skus[0],'etsy').m*100),ueS:Math.round(unitEcon(s.co.skus.find(k=>!k.off)||s.co.skus[0],'shopify').m*100)})}
 EC.lines=JSON.parse(keep);HEADLESS=false;S=null;return out}
// ---------- sprites ----------
function drawItem(g,shape,col,x,y,s=1){const p=(a,b,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x+a*s),Math.round(y+b*s),Math.max(1,w*s),Math.max(1,h*s))};
 switch(shape){
 case'shoe':p(0,6,10,2,'#222');p(1,3,6,3,col);p(6,4,4,2,col);p(2,3,3,1,'#fff');break;
 case'pot':p(1,4,8,5,col);p(0,3,10,2,col);p(4,0,2,3,'#2ecc71');p(2,0,2,2,'#27ae60');p(6,1,2,2,'#27ae60');break;
 case'toaster':p(0,3,10,6,col);p(2,4,2,1,'#222');p(6,4,2,1,'#222');p(2,1,2,3,'#e0a96d');p(6,1,2,3,'#e0a96d');p(9,6,1,2,'#333');break;
 case'drone':p(3,4,4,3,col);p(0,2,3,1,'#999');p(7,2,3,1,'#999');p(0,7,3,1,'#999');p(7,7,3,1,'#999');p(4,5,2,1,'#7df');break;
 case'candle':p(2,3,6,7,col);p(4,1,2,2,(Math.floor(anim*8)%2)?'#ffd76a':'#ff9f43');p(4,3,2,1,'#333');break;
 case'keyboard':p(0,3,10,5,col);for(let i=0;i<4;i++){p(1+i*2,4,1,1,'#555');p(1+i*2,6,1,1,'#555')}break;
 case'toy':p(2,2,6,6,col);p(3,3,2,2,'#fff');p(1,7,8,2,'#555');break;
 case'mug':p(1,2,6,7,col);p(7,4,2,3,col);p(2,3,4,1,'#6d4c2e');break;
 case'lamp':p(3,0,4,1,'#333');p(2,1,6,7,'#333');p(3,2,4,5,col);p(2,8,6,1,'#333');break;
 case'board':p(0,3,10,3,col);p(1,6,2,2,'#222');p(7,6,2,2,'#222');break;
 case'game':p(0,1,10,8,col);p(0,1,10,2,'#ecf0f1');p(3,4,4,3,'#ffd76a');break;
 default:p(2,2,6,6,col);p(4,0,2,2,'#ecf0f1');}}
function drawPerson(x,y,look,o={}){const b=o.walk?Math.abs(Math.sin(o.walk*12))*1.5:Math.sin(anim*3+x)*.4,h=look.tall?0:2;
 rect(x+5,y+29,14,3,'#0005');rect(x+7,y+21,4,8,look.pants);rect(x+13,y+21,4,8,look.pants);
 rect(x+5,y+10+h-b,14,12-h,o.apron?o.apron:look.shirt);if(o.apron)rect(x+5,y+10+h-b,14,3,look.shirt);
 rect(x+7,y+2+h-b,10,9,look.skin);rect(x+7,y+1+h-b,10,3,look.hair);if(look.hat)rect(x+6,y-1+h-b,12,3,look.hat);if(o.cap)rect(x+6,y-1+h-b,12,3,o.cap);
 rect(x+9,y+6+h-b,2,2,'#111');rect(x+13,y+6+h-b,2,2,'#111');if(o.goggles)rect(x+8,y+5+h-b,8,3,'#7dd3ff');
 if(o.mood===-1)rect(x+10,y+9+h-b,4,1,'#600');if(o.mood===1)rect(x+10,y+9+h-b,4,1,'#c33');
 rect(x+3,y+12+h-b,2,7,look.skin);rect(x+19,y+12+h-b,2,7,look.skin);
 if(o.item)drawItem(cx,S.co.shape,o.item.c,x+16,y+14+h-b,1);if(o.box)rect(x+15,y+13+h-b,9,8,'#c49468');
 if(o.tired)rect(x+18,y+2,2,3,'#7dd3ff')}
const ROLE_LOOK={retail:{apron:'#27ae60'},cs:{apron:'#3498db',cap:'#3498db'},ship:{cap:'#8b5a2b',apron:'#a0744a'},maker:{apron:'#e67e22',goggles:1},eng:{apron:'#ecf0f1'},mkt:{apron:'#ff6fb5'}};
function drawStaff(n){const r=n.ref.role;if(n.kind==='human'){drawPerson(n.x+4,n.y-2,n.look,Object.assign({walk:n.path.length?n.walkT:0,tired:S.morale<30},ROLE_LOOK[r],{box:r==='ship'&&n.path.length&&V.boxes?1:0}))}
 else drawRobotAt(n,{color:n.col[0],dark:n.col[1]},.7,cx,false);
 cx.font='9px monospace';cx.textAlign='center';cx.fillStyle='#000a';cx.fillRect(n.x+2,n.y+31,28,9);cx.fillStyle='#fff';cx.fillText(ROLES[r].e+(n.name||'').slice(0,5),n.x+16,n.y+38);cx.textAlign='left';
 if(r==='maker'&&n.atHome){const k=unlocked()[(Math.floor(anim/4)+n.name.length)%unlocked().length];if(k){drawItem(cx,S.co.shape,k.c,n.x+10,n.y+6-Math.abs(Math.sin(anim*8))*2,1.2)}}}
function drawHumanOld(){}
function drawStation(s){
 const x=s.x*T,y=s.y*T,t=anim,Lv=S.level,ty=s.type||s.id;
 switch(ty){
 case'desk':rect(x-8,y+10,T+16,14,'#a0744a');rect(x-8,y+24,4,8,'#6d4c2e');rect(x+T+4,y+24,4,8,'#6d4c2e');rect(x+4,y-6,24,16,'#222');rect(x+6,y-4,20,12,/Design|R&D/.test(busyLabel)&&busy?'#7dff8a':'#3a7bd5');
  drawItem(cx,S.co.shape,'#cfe',x+11,y-3,1);rect(x+12,y+10,8,2,'#111');break;
 case'board':rect(x-6,y-10,T+12,T,'#eee');rect(x-6,y-10,T+12,2,'#999');rect(x-6,y+T-12,T+12,3,'#999');
  cx.strokeStyle='#e74c3c';cx.lineWidth=2;cx.beginPath();cx.moveTo(x,y+12);cx.lineTo(x+10,y+6);cx.lineTo(x+18,y+9);cx.lineTo(x+30,y-4);cx.stroke();rect(x+2,y-6,10,2,'#3498db');break;
 case'dock':{const g=.5+.5*Math.sin(t*4);rect(x,y+8,T,T-8,'#333');rect(x+4,y+12,T-8,T-16,'#1a1a1a');cx.fillStyle=`rgba(125,255,138,${.4+g*.5})`;cx.fillRect(x+6,y+14,T-12,4);cx.fillRect(x+14,y+20,4,8);rect(x+8,y,16,8,'#555');rect(x+12,y+2,8,3,'#7dff8a')}break;
 case'coffee':rect(x+4,y+4,24,26,'#444');rect(x+6,y+6,20,8,'#222');rect(x+8,y+8,4,3,'#e74c3c');rect(x+12,y+18,8,8,'#fff');rect(x+13,y+19,6,3,'#6d4c2e');if(Math.sin(t*2)>0)rect(x+14,y+12-((t*10)%6),2,3,'#ccc8');break;
 case'rack':rect(x,y-14,T,T+14,'#1b1b22');for(let i=0;i<5;i++){rect(x+3,y-11+i*8,T-6,6,'#2c2c38');rect(x+5,y-9+i*8,2,2,(Math.floor(t*8+i*3)%3)?'#7dff8a':'#155');rect(x+9,y-9+i*8,2,2,(Math.floor(t*5+i)%2)?'#ffd76a':'#530')}break;
 case'hire':rect(x-6,y+10,T+12,12,'#c0392b');rect(x-2,y-10,T+4,18,'#fff');cx.fillStyle='#c0392b';cx.font='bold 9px monospace';cx.fillText('HIRING',x-1,y+2);rect(x-4,y+22,6,10,'#555');rect(x+T-2,y+22,6,10,'#555');break;
 case'bench':{rect(x-4,y+8,T+8,14,'#7a5a3a');rect(x-4,y+8,T+8,3,'#9a7550');rect(x-4,y+22,4,10,'#5a4028');rect(x+T,y+22,4,10,'#5a4028');rect(x-2,y+2,6,6,'#999');rect(x+24,y+3,8,4,'#f1c40f');rect(x+26,y+1,2,3,'#555');
  if(s.id==='bench0'&&busy&&/Build/.test(busyLabel)&&bot.at){const kk=unlocked()[Math.floor(anim/3)%unlocked().length];if(kk){drawItem(cx,S.co.shape,kk.c,x+10,y,1.3);if(Math.random()<.3&&!HEADLESS)particles.push({x:x+16,y:y+4,vx:R(-40,40),vy:R(-60,-20),l:.4,c:'#ffd76a',g:200})}}}break;
 case'machine':{const on=S.stage>=3;rect(x-2,y-6,T+4,T+4,'#4a5568');rect(x+2,y-2,T-4,10,on?'#2d3748':'#222');rect(x+4,y,6,4,on&&Math.floor(t*6)%2?'#7dff8a':'#333');
  rect(x-2,y+20,T+4,6,'#222');for(let i=0;i<5;i++)rect(x-2+((i*8+t*(on?30:0))%(T+4)),y+21,3,4,'#666');if(on)drawItem(cx,S.co.shape,unlocked()[0].c,x+4+((t*20)%20),y+12,.9);cx.fillStyle='#fff8';cx.font='7px monospace';cx.fillText(on?'AUTO':'OFFLINE',x,y+34)}break;
 case'shelf':{rect(x-6,y-14,T+12,T+16,'#5a4028');for(let r=0;r<3;r++)rect(x-4,y-12+r*10,T+8,9,'#3a2a1a');
  let n=0;const tot=V.o.reduce((a,b)=>a+b,0);for(let k=0;k<4;k++)for(let j=0;j<V.o[k]&&n<18;j++,n++){const r=Math.floor(n/6),c=n%6;drawItem(cx,S.co.shape,S.co.skus[k].c,x-3+c*6,y-11+r*10,.6)}
  cx.font='bold 8px monospace';cx.fillStyle=POD()?'#7dd3ff':tot?'#ffd76a':'#ff6b6b';cx.textAlign='center';cx.fillText(POD()?'PRINT ON DEMAND':tot?'WEB STOCK '+tot:'EMPTY!',x+16,y+12);cx.textAlign='left'}break;
 case'disp':{const u=unlocked(),i=+s.id.slice(4);if(Lv<=1){rect(x-10,y+6,T+20,14,'#d35400');rect(x-10,y+6,T+20,3,'#e67e22');rect(x-8,y+20,3,10,'#555');rect(x+T+5,y+20,3,10,'#555')}
  else{rect(x-10,y-6,T+20,T+2,Lv>=4?'#ecf0f1':Lv===3?'#bdc3c7':'#8b5a2b');rect(x-8,y+2,T+16,2,'#0003');rect(x-8,y+14,T+16,2,'#0003')}
  const ks=u.filter((k,j)=>j%Math.max(1,LAY().cfg.d)===i%Math.max(1,LAY().cfg.d)||u.length<=1);let c=0;
  ks.forEach(k=>{for(let j=0;j<Math.min(4,S.stage?V.s[k.i]:Math.min(2,V.o[k.i]));j++,c++)drawItem(cx,S.co.shape,k.c,x-8+(c%5)*10,y+(Lv<=1?-1:-4)+Math.floor(c/5)*12,.9)});
  if(!c){cx.fillStyle=POD()?'#7dd3ff':'#ff6b6b';cx.font='bold 8px monospace';cx.fillText(POD()?'SAMPLES':'SOLD OUT',x-6,y+6)}
  if(ks[0]){cx.fillStyle='#fff';cx.font='7px monospace';cx.fillText('$'+ks[0].p,x+T-2,y+24)}}break;
 case'pack':{rect(x-8,y+6,T+16,16,'#b08a5a');rect(x-8,y+6,T+16,3,'#c9a36e');rect(x-6,y+22,3,10,'#555');rect(x+T+3,y+22,3,10,'#555');rect(x+2,y+2,12,8,'#c49468');rect(x+2,y+5,12,1,'#8b6a3a');
  if(s.id==='pack'){rect(x+16,y-12,18,14,'#111');const fl=V.flash>0;rect(x+17,y-11,16,12,fl?'#2ecc71':'#1a3a5a');cx.font='bold 7px monospace';cx.fillStyle='#fff';cx.fillText('WEB',x+18,y-5);cx.fillText(String(V.orders),x+18,y+1)}
  const bx=V.boxes;for(let i=0;i<Math.min(8,bx);i++)rect(x+T+10+(i%2)*10,y+18-Math.floor(i/2)*7,9,7,i%2?'#c49468':'#b5835a')}break;
 case'till':{if(Lv<=1){rect(x-6,y+6,T+12,14,'#d35400');rect(x+4,y,22,10,'#2c3e50');rect(x+8,y+2,8,4,'#7dff8a')}
  else{const h=LAY().cfg.th>1?T*2:T;rect(x-2,y-2,T+4,h,'#6d4c2e');rect(x-2,y-2,T+4,4,'#8b5a2b');rect(x+4,y-10,22,12,'#2c3e50');rect(x+7,y-8,10,4,'#7dff8a');rect(x+20,y-8,4,8,'#bdc3c7');if(h>T){rect(x+4,y+T-8,22,12,'#2c3e50');rect(x+7,y+T-6,10,4,'#7dff8a')}}
  const q=queue.length;if(q>2){cx.fillStyle=q>5?'#ff6b6b':'#ffd76a';cx.font='bold 9px monospace';cx.fillText('LINE '+q,x-2,y-14)}}break;
 case'bell':rect(x+4,y+22,24,10,'#6d4c2e');rect(x+14,y,4,24,'#bbb');rect(x+6,y-6+Math.sin(t*3)*1,20,14,'#ffd76a');rect(x+14,y+8,4,4,'#9a7d0a');break;
 }}
let podFlow=[];
function drawPartner(){const Ly=LAY(),x=(Ly.vanX+6)*T,y=12*T+2;rect(x-T*.4,y-4,T*3.6,T-2,'#2d2250');rect(x-T*.4+2,y-2,T*3.6-4,T-6,'#6c5ce7');cx.fillStyle='#fff';cx.font='bold 8px monospace';cx.fillText('POD PARTNER',x,y+10);cx.font='7px monospace';cx.fillText(S.flags.premium?'Printify Premium':'Printify',x,y+20);
 const d=ST('desk')||{x:2,y:3},sx=d.x*T+T/2,sy=d.y*T;podFlow.forEach(f=>{f.t+=.012;const tx=f.dig?sx+40:x+T*1.4,ty=f.dig?-10:y,px=sx+(tx-sx)*f.t,py=sy+(ty-sy)*f.t-Math.sin(f.t*Math.PI)*36;cx.fillStyle=f.c;cx.fillRect(px-4,py-3,8,6);cx.fillStyle='#fff';cx.font='7px monospace';if(f.t<.15)cx.fillText(f.dig?'⬇ file':'🖼',px-6,py-6)});podFlow=podFlow.filter(f=>f.t<1).slice(-40)}
function drawVan(){if(POD())return drawPartner();const Ly=LAY(),bx=Ly.vanX*T,y=12*T+2;let x=bx;
 if(van.state==='away')return;if(van.state==='arrive')x=bx-van.t/2*8*T;if(van.state==='leave')x=bx+(1-van.t/2)*10*T;
 rect(x,y,T*3,T-6,'#ecf0f1');rect(x+T*2.3,y+2,T*.7,T-10,'#3498db');rect(x+4,y+4,T*1.8,T-14,'#e74c3c');cx.fillStyle='#fff';cx.font='bold 8px monospace';cx.fillText('DELIVERY',x+6,y+14);
 rect(x+8,y+T-8,8,5,'#111');rect(x+T*2+8,y+T-8,8,5,'#111');if(van.state==='park'&&Math.floor(anim*3)%2)rect(x-3,y+4,3,4,'#ffd76a')}
function drawTruck(){if(!(V.truckT>0))return;const m=ST('mat'),x=(m.x-1)*T,y=12*T+2;rect(x,y,T*2.6,T-6,'#8b5a2b');rect(x+T*2,y+2,T*.6,T-10,'#f1c40f');cx.fillStyle='#fff';cx.font='bold 7px monospace';cx.fillText('SUPPLY',x+4,y+14);rect(x+6,y+T-8,8,5,'#111');rect(x+T*1.7,y+T-8,8,5,'#111')}
function drawWorld(){
 const Ly=LAY(),Lv=S.level,W=Ly.w,s0=Ly.s0,s1=Ly.s1;
 rect(0,0,W*T,13*T,'#2a2538');
 // street
 rect(0,11*T+T*.5,W*T,T*.5,'#9aa0a6');rect(0,12*T,W*T,T,'#3d4048');for(let i=0;i<W;i++)rect(i*T+6,12*T+T-4,14,2,'#ffd76a88');
 for(let ty=2;ty<=10;ty++)for(let tx=1;tx<=W-2;tx++){const x=tx*T,y=ty*T,ch=(tx+ty)%2,z=tx<s0?0:tx<=s1?1:2;
  if(z===0){if(Lv<=1){rect(x,y,T,T,'#5a5a64');if((tx*7+ty*13)%5===0)rect(x+8,y+12,6,3,'#4d4d56');rect(x,y,1,T,'#50505a');rect(x,y,T,1,'#50505a')}
   else if(Lv===2){rect(x,y,T,T,ch?'#9a6b42':'#94653d');rect(x,y+10,T,1,'#7d5232');rect(x,y+21,T,1,'#7d5232')}
   else if(Lv===3){rect(x,y,T,T,'#7f8c8d');rect(x,y,T,1,'#6c7a7b');rect(x,y,1,T,'#6c7a7b')}
   else{rect(x,y,T,T,'#5d6d7e');rect(x,y,T,1,'#4d5d6e');if(ty===8)rect(x,y+T-3,T,3,'#f1c40f')}}
  else if(z===1){if(Lv<=1){rect(x,y,T,T,'#8a8a8a');rect(x,y,1,T,'#7a7a7a');if(ty===10&&tx===s0+2){cx.fillStyle='#fff6';cx.font='bold 10px monospace';cx.fillText('SALE!',x-8,y+20)}}
   else if(Lv===2){rect(x,y,T,T,ch?'#c9a26b':'#c09862');rect(x,y+15,T,1,'#a88352')}
   else if(Lv===3){rect(x,y,T,T,ch?'#f4f6f7':'#d5dbdb')}
   else{rect(x,y,T,T,ch?'#fdfefe':'#f2f3f4');if((tx*3+ty)%5===0)rect(x+6,y+6,8,1,'#d7dbdd')}}
  else{rect(x,y,T,T,'#707b7c');if(ty===10){for(let i=0;i<4;i++)rect(x+i*8,y+T-6,4,6,i%2?'#111':'#f1c40f')}}}
 // back wall
 for(let tx=1;tx<=W-2;tx++){const z=tx<s0?0:tx<=s1?1:2,x=tx*T;
  const col=z===0?(Lv<=1?'#7a7a86':Lv===2?'#9c4a3c':Lv===3?'#95a5a6':'#34495e'):z===1?(Lv<=1?'#8d8d98':Lv===2?'#e8d5b7':Lv===3?'#d6eaf8':'#1f4f5a'):'#566573';
  rect(x,0,T,2*T,col);if(z===0&&Lv<=1)for(let i=0;i<5;i++)rect(x+i*6,0,2,2*T-4,'#6c6c78');rect(x,2*T-4,T,4,'#0003')}
 // garage door / storefront signage
 if(Lv<=1){rect(s0*T,4,(s1-s0+1)*T,T*1.4,'#a0a0aa');for(let i=0;i<6;i++)rect(s0*T,8+i*8,(s1-s0+1)*T,2,'#777');cx.fillStyle='#c0392b';cx.font='bold 10px monospace';cx.fillText('PHOTO STUDIO + PICKUP',s0*T+4,T*1.3)}
 else{const sx=s0*T+T*.5,sw=(s1-s0)*T;rect(sx,4,sw,22,Lv>=4?'#111':'#2c3e50');cx.fillStyle=Lv>=4?'#ffd76a':'#fff';cx.font=`bold ${Lv>=4?14:11}px monospace`;cx.textAlign='center';cx.fillText((Lv>=4?'★ ':'')+S.co.name.toUpperCase().slice(0,24)+(Lv>=4?' FLAGSHIP ★':''),sx+sw/2,20);cx.textAlign='left';
  for(let wx=s0+1;wx<s1-1;wx+=3)drawWindow(wx*T,30,T*2,T-2,true)}
 drawWindow(3*T+T*.6,8,T*1.4,T*.9,Lv>=2);
 if(Lv>=2){cx.fillStyle='#fff8';cx.font='bold 8px monospace';cx.fillText(Lv>=4?'FACTORY FLOOR':'WORKSHOP',T*1.2,T*1.85)}
 if(Ly.dk){cx.fillStyle='#ffd76a';cx.font='bold 9px monospace';cx.fillText('SHIPPING DOCK',(Ly.d0+.3)*T,T*1.3);for(let i=0;i<3;i++)rect((Ly.d0+1+i*2)*T,T*.4,T*1.2,T*.5,'#4a4a4a')}
 // zone dividers
 rect(s0*T-2,2*T,3,T*1.5,'#0004');rect(s0*T-2,8.5*T,3,T*1.5,'#0004');if(Ly.dk){rect(Ly.d0*T-2,2*T,4,T*1.6,'#566573');rect(Ly.d0*T-2,7*T,4,T*3,'#566573')}
 // side & bottom walls
 rect(0,0,T,11*T+T*.5,'#2a2538');rect((W-1)*T,0,T,11*T+T*.5,'#2a2538');rect(0,11*T,W*T,T*.5,'#2a2538');
 for(let tx=s0;tx<=s1&&Lv>=2;tx++){rect(tx*T,11*T,T,T*.5,'#aed6f1');rect(tx*T,11*T,1,T*.5,'#555')}
 // store entrance
 const d=ST('door');rect(d.x*T-4,11*T-2,T+8,T*.5+2,'#3b2a1a');rect(d.x*T,11*T,T,T*.5,Lv>=2?'#d6eaf8':'#8b5a2b');cx.fillStyle='#fff';cx.font='7px monospace';cx.fillText('SHOP',d.x*T+5,11*T+12);
 // loading door
 const m=ST('mat');rect(m.x*T-4,11*T-2,T+8,T*.5+2,'#222');for(let i=0;i<3;i++)rect(m.x*T,11*T+i*5,T,3,'#888');cx.fillStyle='#ffd76a';cx.font='6px monospace';cx.fillText('LOADING',m.x*T+1,11*T+14);
 // material crates
 const nc=Math.min(8,Math.ceil(V.kits/6));for(let i=0;i<nc;i++){const cx0=(m.sx+1)*T+(i%4)*9-4,cy0=10*T+14-Math.floor(i/4)*9;rect(cx0,cy0,9,9,'#b5835a');rect(cx0,cy0,9,2,'#9a6d48');rect(cx0+4,cy0,1,9,'#8a5d38')}
 if(V.kits<=0&&!POD()){cx.fillStyle='#ff6b6b';cx.font='bold 8px monospace';cx.fillText('NO KITS',(m.sx+.6)*T,10*T+16)}
 Ly.deco.forEach(([tx,ty])=>{const x=tx*T,y=ty*T;rect(x+10,y+18,12,12,'#8b5a2b');rect(x+6,y+4,20,16,'#2ecc71');rect(x+10,y,12,8,'#27ae60')});
 drawTruck();drawVan();
}
function lights(){const d=darkness();if(S&&salMode()==='ai'){S.energy=Math.max(S.energy,70);if(vday&&vday.nightLog&&!vday.nightLog.done&&S.time/DAY_LEN>.7){vday.nightLog.done=1;log(vday.nightLog.txt,'t')}}if(d<=.02)return;const W=worldW();
 cx.fillStyle=`rgba(10,8,40,${d})`;cx.fillRect(0,0,W*T,13*T);if(d<.12)return;
 cx.globalCompositeOperation='lighter';const glow=(x,y,r,c)=>{const g=cx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g;cx.fillRect(x-r,y-r,r*2,r*2)};
 const a=d*.6;glow(ST('desk').x*T+16,ST('desk').y*T,70,`rgba(90,160,255,${a})`);glow(ST('dock').x*T+16,ST('dock').y*T+16,50,`rgba(120,255,140,${a})`);
 if(salMode()==='ai'&&d>.15){const f=S.face||1,ex=S.x+(f>0?14:12),ey=S.y+9;glow(ex,ey,14,'rgba(120,230,255,.9)');glow(ex+5,ey,14,'rgba(120,230,255,.9)');glow(ex+2,ey,40,`rgba(80,200,255,${a})`)}
 if(ST('coffee'))glow(ST('coffee').x*T+16,ST('coffee').y*T+10,40,`rgba(255,120,80,${a*.7})`);if(ST('rack'))glow(ST('rack').x*T+16,ST('rack').y*T,60,`rgba(140,255,170,${a*.7})`);
 stations().filter(s=>s.type==='disp').forEach(s=>glow(s.x*T+16,s.y*T,55,`rgba(255,230,160,${a*.8})`));glow(ST('till').x*T+16,ST('till').y*T,50,`rgba(255,220,120,${a})`);glow(ST('pack').x*T+30,ST('pack').y*T-6,40,`rgba(90,200,255,${a})`);
 glow(S.x+16,S.y+12,40,`rgba(255,230,150,${a*.6})`);
 cx.globalCompositeOperation='source-over'}
// ---------- render ----------
let dpr=1,cam={x:0,y:0,s:1,vp:{x:0,y:0,w:1,h:1}};
function rect(x,y,w,h,c){cx.fillStyle=c;cx.fillRect(Math.round(x),Math.round(y),w,h)}
function resize(){dpr=Math.min(2,devicePixelRatio||1);cv.width=innerWidth*dpr;cv.height=innerHeight*dpr}
addEventListener('resize',resize);resize();
function viewport(){const top=$('hud').getBoundingClientRect().bottom||0,mob=innerWidth<=760,tk=$('ticker').getBoundingClientRect().height||0;
 const bot=mob?($('log').getBoundingClientRect().top||innerHeight-tk):innerHeight-tk;const right=!mob&&dashOpen?innerWidth-$('dash').getBoundingClientRect().width-8:innerWidth;
 return {x:0,y:top,w:Math.max(100,right),h:Math.max(100,bot-top)}}
function updCam(rdt){
 const vp=viewport(),ww=worldW()*T,wh=13*T,fw=vp.w/ww,fh=vp.h/wh,mn=Math.min(fw,fh),mx=Math.max(fw,fh);
 let s=Math.min(mx,mn*(vp.w<vp.h?2.6:1));if(follow)s*=1.7;
 let cxw=S.x+T/2,cyw=S.y+T/2;if(!follow&&vp.w<vp.h){const L=LAY(),pts=['desk','pack','board'].map(id=>L.st[id]).filter(Boolean).map(p=>[p.x*T,p.y*T]).concat((L.cashiers||[]).slice(0,1).map(c=>[c[0]*T,c[1]*T]),[[S.x,S.y]]);const x0=Math.min(...pts.map(p=>p[0]))-T,x1=Math.max(...pts.map(p=>p[0]))+2*T,y0=Math.min(...pts.map(p=>p[1]))-T,y1=Math.max(...pts.map(p=>p[1]))+2*T;s=Math.max(mn,Math.min(s,vp.w/(x1-x0),vp.h/(y1-y0)));cxw=(x0+x1)/2;cyw=(y0+y1)/2}
 const vw=vp.w/s,vh=vp.h/s;
 let tx=ww<=vw?(ww-vw)/2:clamp(cxw-vw/2,0,ww-vw),ty=wh<=vh?(wh-vh)/2:clamp(cyw-vh/2,0,wh-vh);
 const k=Math.min(1,rdt*4);cam.s+=(s-cam.s)*Math.min(1,rdt*6);cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k;cam.vp=vp}
// sky & light
const lerpC=(a,b,t)=>{const p=s=>[1,3,5].map(i=>parseInt(s.substr(i,2),16)),A=p(a),B=p(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
function skyColor(){const t=S.time/DAY_LEN,K=[[0,'#f3a683'],[.15,'#8fc7f0'],[.6,'#7fb8ec'],[.78,'#f08a5d'],[.9,'#3b2c6b'],[1,'#141836']];let i=0;while(i<K.length-2&&t>K[i+1][0])i++;let c=lerpC(K[i][1],K[i+1][1],clamp((t-K[i][0])/(K[i+1][0]-K[i][0]),0,1));if(S.weather==='cloudy'||S.weather==='rain'||S.weather==='snow')c=lerpC(c,'#8a8f99',.5);if(S.weather==='storm')c=lerpC(c,'#3d4250',.7);return c}
function darkness(){const t=S.time/DAY_LEN;let d=t<.08?(.08-t)*2.5:t>.68?(t-.68)*1.5:0;if(S.weather==='storm')d+=.12;if(S.weather==='rain'||S.weather==='cloudy')d+=.05;return Math.min(.6,d)}
function drawWindow(x,y,w,h,skyline){cx.save();cx.beginPath();cx.rect(x,y,w,h);cx.clip();rect(x,y,w,h,skyColor());const t=S.time/DAY_LEN;
 if(S.weather==='sunny'||S.weather==='cloudy'){const sx=x+w*t,sy=y+h*.8-Math.sin(t*Math.PI)*h*.6;cx.fillStyle=t>.85?'#eef':'#ffe27a';cx.beginPath();cx.arc(sx,sy,5,0,7);cx.fill()}
 for(let i=0;i<3;i++){const cxp=x+((anim*6+i*40+x)%(w+30))-15;rect(cxp,y+4+i*5,14,4,S.weather==='sunny'?'#ffffffb0':'#c9ccd4')}
 if(skyline)for(let b=0;b<w/9;b++){const bh=8+((b*37+x)%14);rect(x+b*9,y+h-bh,8,bh,darkness()>.25?'#2a3150':'#5a7ca8');if(darkness()>.25&&(b+x)%3===0)rect(x+b*9+3,y+h-bh+3,2,2,'#ffd76a')}
 if(S.weather==='rain'||S.weather==='storm'){cx.strokeStyle='#cfe3ff';cx.lineWidth=1;cx.beginPath();for(let i=0;i<w/4;i++){const rx=x+((i*13+anim*40)%w),ry=y+((i*29+anim*220)%h);cx.moveTo(rx,ry);cx.lineTo(rx-2,ry+6)}cx.stroke()}
 if(S.weather==='snow')for(let i=0;i<w/5;i++)rect(x+((i*17+Math.sin(anim+i)*4)%w),y+((i*23+anim*25)%h),2,2,'#fff');
 if(S.weather==='storm'&&Math.sin(anim*1.7)>.985)rect(x,y,w,h,'#ffffffcc');
 cx.restore();rect(x-1,y-1,w+2,2,'#ddd');rect(x-1,y+h-1,w+2,3,'#bbb');rect(x+w/2-1,y,2,h,'#ccc')}
function drawRobotAt(e,co,sc,c,isBot){
 const up=isBot&&S?S.up:{},isBusy=isBot&&busy,moving=e.path&&e.path.length,bob=isBusy?Math.sin(anim*20):moving?Math.sin((e.walkT||0)*14)*1.5:Math.sin(anim*2)*.5,f=e.face||1,x=e.x,y=e.y;
 const p=(a,b,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x+a*sc),Math.round(y+(b+bob)*sc),w*sc,h*sc)};
 c.fillStyle='#0006';c.fillRect(x+6*sc,y+29*sc,20*sc,3*sc);
 if(up.battery){p(f>0?3:23,15,6,11,'#2c3e50');p(f>0?4:24,17,4,2,'#7dff8a');p(f>0?4:24,20,4,2,'#7dff8a');p(f>0?4:24,23,4,2,S.energy>50?'#7dff8a':'#555')}
 p(15,0,2,4,'#aaa');p(14,-2,4,3,(Math.floor(anim*2)%2)?'#ff4':'#f80');
 if(up.chip){p(11,-1,10,3,'#8e44ad');p(13,-2,6,2,(Math.floor(anim*4)%2)?'#e8b4ff':'#c39bff')}
 p(7,4,18,12,co.color);p(7,14,18,2,co.dark);p(9,6,14,7,'#111');
 const en=isBot&&S?S.energy/100:1,lowE=en<.2;p(f>0?13:11,8,3,3,lowE?'#f44':'#7df');p(f>0?18:16,8,3,3,lowE?'#f44':'#7df');
 if(up.leds){p(12,11,8,1,'#ff6fb5');p(11,10,1,1,'#ff6fb5');p(20,10,1,1,'#ff6fb5')}
 p(5,8,2,4,co.dark);p(25,8,2,4,co.dark);p(9,17,14,10,co.color);p(12,19,8,5,'#222');p(13,20,Math.max(1,Math.round(6*clamp(en,0,1))),3,en<.2?'#f44':en<.5?'#fd4':'#7f8');
 const arm=isBusy?Math.sin(anim*25)*2:0;p(5,18+arm,4,8,co.dark);p(23,18-arm,4,8,co.dark);
 const lg=moving?Math.sin((e.walkT||0)*14)*2:0;
 if(up.legs){p(9,27,6,4,'#34495e');p(17,27,6,4,'#34495e');if(moving){p(10,31,4,2,Math.floor(anim*10)%2?'#ff9f43':'#ffd76a');p(18,31,4,2,Math.floor(anim*10)%2?'#ffd76a':'#ff9f43')}}
 else{p(10,27,5,3+(lg>0?1:0),'#333');p(17,27,5,3+(lg<0?1:0),'#333')}}
function bubble(text,x,y){cx.font='bold 9px monospace';const lines=[];let cur='';for(const w of text.split(' ')){if((cur+' '+w).length>30){lines.push(cur);cur=w}else cur=cur?cur+' '+w:w}lines.push(cur);const ls=lines.slice(0,4);
 const w=Math.max(...ls.map(l=>cx.measureText(l).width))+12,h=ls.length*11+8,bx=Math.max(cam.x+4,Math.min(x-w/2,cam.x+cam.vp.w/cam.s-w-4)),by=Math.max(cam.y+4,y-h-14);
 cx.fillStyle='#fffef0';cx.strokeStyle='#000';cx.lineWidth=1.5;cx.beginPath();cx.roundRect?cx.roundRect(bx,by,w,h,5):cx.rect(bx,by,w,h);cx.fill();cx.stroke();
 cx.beginPath();cx.moveTo(x-4,by+h);cx.lineTo(x+4,by+h);cx.lineTo(x,by+h+8);cx.closePath();cx.fill();
 cx.fillStyle='#222';cx.textAlign='left';ls.forEach((l,i)=>cx.fillText(l,bx+6,by+13+i*11))}function bar(v,c){return `<span class="bar"><i style="width:${clamp(v,0,100)}%;background:${c}"></i></span>`}
function spark2(g,x,y,w,h,a,b,ca,cb,label,val){g.fillStyle='#ffffff10';g.fillRect(x,y,w,h);g.fillStyle='#aaa';g.font='10px monospace';g.fillText(label,x+3,y+11);g.textAlign='right';g.fillStyle='#fff';g.fillText(val,x+w-3,y+11);g.textAlign='left';
 if(a.length<2)return;const mx=Math.max(1,...a,...b),X=i=>x+3+i/(a.length-1)*(w-6),Y=v=>y+h-4-v/mx*(h-18);
 [[a,ca],[b,cb]].forEach(([d,c])=>{g.strokeStyle=c;g.lineWidth=1.5;g.beginPath();d.forEach((v,i)=>i?g.lineTo(X(i),Y(v)):g.moveTo(X(i),Y(v)));g.stroke()})}
function spark(g,x,y,w,h,data,col,label,val){g.fillStyle='#ffffff10';g.fillRect(x,y,w,h);g.fillStyle='#aaa';g.font='10px monospace';g.fillText(label,x+3,y+11);g.fillStyle=col;g.textAlign='right';g.fillText(val,x+w-3,y+11);g.textAlign='left';
 if(data.length<2)return;const mn=Math.min(0,...data),mx=Math.max(1,...data),X=i=>x+3+i/(data.length-1)*(w-6),Y=v=>y+h-4-(v-mn)/(mx-mn)*(h-18);
 const n=data.length,prog=Math.min(1,(anim*2)%1e9);g.strokeStyle=col;g.lineWidth=1.5;g.beginPath();data.forEach((v,i)=>i?g.lineTo(X(i),Y(v)):g.moveTo(X(i),Y(v)));g.stroke();
 const lx=X(n-1),ly=Y(data[n-1]);g.fillStyle=col;g.beginPath();g.arc(lx,ly,2.5+Math.sin(anim*6),0,7);g.fill();
 if(mn<0){g.strokeStyle='#ff6b6b55';g.beginPath();g.moveTo(x,Y(0));g.lineTo(x+w,Y(0));g.stroke()}}
let hudT=0,dashT=0;
const maxE=()=>100;
function render(rdt){
 cx.setTransform(1,0,0,1,0,0);cx.fillStyle='#0d0b16';cx.fillRect(0,0,cv.width,cv.height);if(!running||!S)return;
 updCam(rdt);const vp=cam.vp;cx.imageSmoothingEnabled=false;
 let sx=0,sy=0;if(shakeT>0){shakeT-=rdt;sx=R(-1,1)*shakeMag;sy=R(-1,1)*shakeMag;if(shakeT<=0)shakeMag=0}
 cx.setTransform(cam.s*dpr,0,0,cam.s*dpr,(vp.x-cam.x*cam.s+sx)*dpr,(vp.y-cam.y*cam.s+sy)*dpr);
 drawWorld();
 const items=stations().map(s=>({y:s.y*T+T,f:()=>drawStation(s)}));
 npcs.forEach(n=>items.push({y:n.y+T+1,f:()=>drawStaff(n)}));
 shoppers.forEach(s=>items.push({y:s.y+T+1,f:()=>drawPerson(s.x+4,s.y-2,s.look,{walk:s.path.length?s.walkT:0,item:s.sku||s.carry,mood:s.st==='leave'?(s.happy?1:-1):0})}));
 items.push({y:S.y+T,f:()=>drawRobotAt(S,S.co,1,cx,true)});if(S.cof){const d=ST('board')||ST('desk');if(d)items.push({y:(d.y+1.6)*T,f:drawCof})}
 items.sort((a,b)=>a.y-b.y).forEach(i=>i.f());
 lights();
 particles.forEach(p=>rect(p.x,p.y,3,3,p.c));
 cx.font='bold 11px monospace';cx.textAlign='center';floaters.forEach(f=>{cx.fillStyle='#000';cx.fillText(f.t,f.x+1,f.y+1);cx.fillStyle=f.c;cx.fillText(f.t,f.x,f.y)});cx.textAlign='left';
 if(bot.thinkT>0&&bot.think)bubble(bot.think.length>120?bot.think.slice(0,117)+'…':bot.think,S.x+T/2,S.y);else if(busy&&vday)bubble(busyLabel,S.x+T/2,S.y);
 if(!vday&&!S.done){cx.setTransform(1,0,0,1,0,0);cx.fillStyle='#000a';const w=260*dpr;cx.fillRect((innerWidth*dpr-w)/2,cv.height-70*dpr,w,26*dpr);cx.fillStyle='#ffd76a';cx.font=`bold ${12*dpr}px monospace`;cx.textAlign='center';cx.fillText('⏩ '+dstr(),innerWidth*dpr/2,cv.height-52*dpr);cx.textAlign='left'}
 cx.setTransform(1,0,0,1,0,0);
 hudT-=rdt;if(hudT<=0){hudT=.15;drawHUD()}dashT-=rdt;if(dashOpen&&dashT<=0){dashT=.25;drawDash()}
 updTicker(rdt);
 const rw=runwayMo();Music.mood=S.done?(['acquired','ipo','survived'].includes(S.outcome)?'boom':'crisis'):rw<1.5?'crisis':rw<4?'bad':(S.months.length&&S.months[S.months.length-1].P.net>0)?'boom':'good';
}
function chIcons(){return [['etsy','Etsy'],['shopify','Shopify'],['store','Store']].map(([k,n])=>`<span class="chip" style="background:${S.ch[k].open>=0?CHC[k]:'#444'};opacity:${S.ch[k].open>=0?1:.5}">${n}</span>`).join('')}
function drawHUD(){const t=dateOf(),q=Math.floor(t.getMonth()/3)+1,mtd=S.mo.rev.etsy+S.mo.rev.shopify+S.mo.rev.store+S.mo.rev.wholesale;const cash=vday?V.cash:S.cash;
 $('hud').innerHTML=`<span><b>${S.co.name}</b></span><span class="cal">📅 <b>${dstr()}</b> ${vday?clock():'⏩'} ${S.wIcon||''} <small>Q${q}${t.getMonth()>=10?' 🎄':''}</small></span>
 <span>💵 <b style="color:${cash<0?'#ff6b6b':'#ffd76a'}">${fmt(Math.round(cash))}</b></span><span>📈 MTD ${fmt(Math.round(mtd))}</span>
 <span>${S.reviews?'★'+S.rating.toFixed(2)+` <small>(${S.reviews})</small>`:'★ no reviews'}</span><span>🏪 ${V.s.reduce((a,b)=>a+b,0)} · 🌐 ${V.o.reduce((a,b)=>a+b,0)} · 🧾 ${vday?V.orders:S.backlog.length}</span>
 <span>👥 ${S.staff.length}</span><span>${chIcons()}</span><span>🏠 ${stageInfo().n}</span><span>🤖 ${S.co.traitName}</span>`}
function drawFc(g,x,y,w,h,big){const wh=(S.wh||[]).slice(-26),fl=(S.fcLog||[]).slice(-27),fu=S.fcRev||[];g.fillStyle='#ffffff10';g.fillRect(x,y,w,h);
 const act=wh.map(v=>v.rev),past=fl.slice(0,-1).map(v=>v.f),n=act.length+fu.length;const mx=Math.max(1,...act,...past,...fu.map(v=>v.rev));const X=i=>x+4+i*(w-8)/Math.max(1,n-1),Y=v=>y+h-6-v/mx*(h-18);
 // past forecasts aligned to the week they predicted
 g.strokeStyle='#ffb86b';g.setLineDash([3,2]);g.beginPath();let st=0;fl.slice(0,-1).forEach((v,i)=>{const j=i+(act.length-(fl.length-1));if(j<0)return;st++?g.lineTo(X(j),Y(v.f)):g.moveTo(X(j),Y(v.f))});
 fu.forEach((v,i)=>{const j=act.length+i;st++?g.lineTo(X(j),Y(v.rev)):g.moveTo(X(j),Y(v.rev))});g.stroke();g.setLineDash([]);
 g.strokeStyle='#7dd3ff';g.lineWidth=1.5;g.beginPath();act.forEach((v,i)=>i?g.lineTo(X(i),Y(v)):g.moveTo(X(i),Y(v)));g.stroke();g.lineWidth=1;
 if(act.length){g.strokeStyle='#ffffff30';g.beginPath();g.moveTo(X(act.length-1),y+10);g.lineTo(X(act.length-1),y+h-4);g.stroke()}
 const cf=fcConf();g.font=(big?11:9)+'px monospace';g.fillStyle='#7dd3ff';g.fillText('weekly rev',x+4,y+10);g.fillStyle='#ffb86b';g.fillText('forecast',x+70,y+10);g.fillStyle='#ddd';g.fillText(cf==null?'conf —':'conf '+Math.round(cf*100)+'%',x+w-62,y+10)}
function podRows(){const P=EC.pod,d=S.flags.premium?1-P.premiumDisc:1,E=EC.etsy,rows=[];S.co.skus.forEach(k=>{const vs=k.v||[{n:k.kind==='digital'?'Digital file':'Digital portrait file',p:k.p0,base:0,ship:0,wt:1}];vs.forEach(v=>{const p=Math.round(v.p*k.p/k.p0),ai=(k.kind==='custom'||k.kind==='podCustom')?k.m+P.revisionRate*P.revisionAI:0,cost=v.base*d+v.ship,fee=E.listingFee+(E.txnPct+E.payPct)*p+E.payFixed,lab=k.b/60*hourly('cs')*(1+burdenRate('cs'))*(ai?1+P.revisionRate*P.revisionMin/k.b:1),net=p-cost-ai-fee-lab;rows.push({sku:k.n,v:v.n,p,base:v.base*d,ship:v.ship,ai,fee,lab,net,m:net/p,locked:S.rd<unlockRD()[k.i]})})});return rows}
function podTable(){return `<h3>🖨 Print-on-demand unit economics (Etsy, per order${S.flags.premium?', Printify Premium':''})</h3><table class="pnl"><tr class="b"><td>Product</td><td>Price</td><td>POD base</td><td>Ship</td><td>AI+revisions</td><td>Etsy fees</td><td>QA labor</td><td>Net</td><td>Margin</td></tr>${podRows().map(r=>`<tr style="opacity:${r.locked?.5:1}"><td>${r.v}<br><small>${r.sku}</small></td><td>$${r.p}</td><td>${fmt(r2(r.base))}</td><td>${fmt(r.ship)}</td><td>${fmt(r2(r.ai))}</td><td>${fmt(r2(r.fee))}</td><td>${fmt(r2(r.lab))}</td><td><b>${fmt(r2(r.net))}</b></td><td>${Math.round(r.m*100)}%</td></tr>`).join('')}</table><p class="why">No inventory: the partner prints and ships each order (free shipping baked into price). Etsy: $0.20 listing + 6.5% transaction + 3% + $0.25 processing. Partner reprints free on its own misprints/damage. Labor = design/QA minutes at a customer-service wage (the robot is free in-game; a real business pays someone).</p>`}
function brainHtml(){const o=S.okr,ex=(S.exps||[]).slice(0,3),cf=fcConf(),c13=S.cf13||[];const mn=c13.length?Math.min(...c13):null;
 const bar=p=>`<span class="kb"><i style="width:${Math.round(clamp(p,0,1)*100)}%"></i></span>`;
 return `<div class="brain"><b>🧠 Brain</b> <small>${S.co.traitName||''}</small>
 <div>🎯 ${o?`<b>${o.O}</b> <small>${o.q}</small>`:'Setting first OKRs…'}</div>${o?o.krs.map(k=>`<div class="kr">${bar(k.p)} ${k.n}</div>`).join(''):''}
 <div>🧪 ${ex.length?ex.map(e=>e.type==='price'?`${S.co.skus[e.k].n}: $${e.A} vs $${e.B} <small>wk ${e.wk+1}/${e.len}</small>`:`${e.ch==='etsy'?'Etsy':'Shopify'} ads ${fmt(e.A)} vs ${fmt(e.B)}/day <small>wk ${e.wk+1}/${e.len}</small>`).join('<br>'):'No test running'}</div>
 <div>📈 Forecast conf ${cf==null?'— (learning)':Math.round(cf*100)+'%'} · next 13 wk ${fmt(Math.round((S.fcRev||[]).reduce((a,x)=>a+x.rev,0)))}</div>
 <div>💵 13-wk cash low ${mn==null?'—':fmt(mn)+' (wk '+(c13.indexOf(mn)+1)+')'}</div>
 <div>⏭ ${S.nextBig||'—'}</div></div>`}
function drawDash(){const c=$('dashc'),g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);const d=S.daily.slice(-120);
 spark(g,4,4,232,60,d.map(x=>x.cash),'#ffd76a','cash (120 days)',fmt(Math.round(S.cash)));
 // monthly revenue by channel (stacked)
 const ms=[...S.months.slice(-11),S.mo];const top=72,h=96;g.fillStyle='#ffffff10';g.fillRect(4,top,232,h);const mx=Math.max(1,...ms.map(m=>m.rev.etsy+m.rev.shopify+m.rev.store+m.rev.wholesale));const bw=232/12;
 ms.forEach((m,i)=>{let y=top+h-12;[['etsy'],['shopify'],['store'],['wholesale']].forEach(([k])=>{const v=m.rev[k]/mx*(h-26);g.fillStyle=CHC[k];g.fillRect(6+i*bw,y-v,bw-3,v);y-=v});g.fillStyle='#888';g.font='7px monospace';g.fillText(MON[+m.k.slice(5)-1][0],8+i*bw,top+h-3)});
 g.fillStyle='#ddd';g.font='9px monospace';g.fillText('revenue/mo  ',8,top+10);g.fillStyle=CHC.etsy;g.fillText('Etsy',80,top+10);g.fillStyle=CHC.shopify;g.fillText('Shopify',110,top+10);g.fillStyle=CHC.store;g.fillText('Store',160,top+10);g.fillStyle='#ddd';g.fillText(fmt(Math.round(mx)),196,top+20);
 spark2(g,4,176,232,56,d.map(x=>x.inv),d.map(x=>x.bl),'#7dff8a','#ff6fb5','inventory vs backlog',`${invTotal()} / ${S.backlog.length}`);
 drawFc(g,4,240,232,56);
 const roles=Object.keys(ROLES).map(r=>[r,roleCount(r)]).filter(x=>x[1]);const be=breakEven(),L=S.months[S.months.length-1];
 $('dasht').innerHTML=brainHtml()+`<div>${chIcons()}</div>
 <div>🧮 Last month: ${L?`${fmt(Math.round(L.P.rev))} rev · <b style="color:${L.P.net>=0?'#7dff8a':'#ff7d7d'}">${fmt(Math.round(L.P.net))}</b> net · GM ${Math.round(L.P.gmPct*100)}%`:'—'}</div>
 <div>⚖️ Break-even: ${be?fmt(Math.round(be))+'/mo':'—'} · Fixed ${fmt(Math.round(monthlyFixed()))}/mo</div>
 <div>📆 TTM revenue ${fmt(Math.round(ttmRev()))} · season ×${EC.season[dateOf().getMonth()]}</div>
 <div>👥 ${roles.length?roles.map(([r,n])=>`${ROLES[r].e}${ROLES[r].n.split(' ')[0]}×${n}`).join(' '):'Robot does everything'}</div>
 <div>📦 Stock ${S.co.skus.filter(k=>unlocked().includes(k)).map(k=>`<span style="color:${k.c}">■</span>${S.inv.s[k.i]}/${S.inv.o[k.i]}`).join(' ')} <small>(store/web)</small> · kits ${S.kits.reduce((a,b)=>a+b,0)}${S.po.length?` · 🚚 ${S.po.length} PO`:''}</div>
 <div>💳 Debt ${fmt(Math.round(debt()))}${S.loans.length?' ('+S.loans.map(l=>l.n).join(', ')+')':''} · ads ${fmt(S.ads.etsy+S.ads.shopify)}/day</div>
 <div>🏁 ${EC.tiers.map(t=>`<span title="${t.n}" style="opacity:${S.tiers[t.id]?1:.25}">${TIER_ICON[t.id]}</span>`).join(' ')}</div>
 <div><button id="bBooks2" class="mini">📒 Open the books</button></div>`;$('bBooks2').onclick=()=>openBooks()}
let tickerItems=[],tickerX=0;
function updTicker(rdt){const el=$('tickt');if(!tickerItems.length){const comp=S.heads.slice(-3).reverse(),world=[pick(WORLD_NEWS),pick(WORLD_NEWS)];tickerItems=[...comp,...world];el.textContent='  📰  '+tickerItems.join('   •   ')+'   •   ';tickerX=innerWidth}
 tickerX-=rdt*70;el.style.transform=`translateX(${tickerX}px)`;if(tickerX<-el.scrollWidth)tickerItems=[]}
const tcx=$('tc').getContext('2d');
function drawTitleBot(){tcx.clearRect(0,0,160,96);tcx.imageSmoothingEnabled=false;const s=load(),co=s?s.co:{color:'#e74c3c',dark:'#922b21'};const sv=S;S=null;drawRobotAt({x:56,y:8+Math.sin(anim*3)*2,face:1},co,1.6,tcx,false);S=sv;
 tcx.fillStyle='#ffd76a';tcx.font='8px monospace';tcx.textAlign='center';tcx.fillText(s?`saved: ${s.co.name.slice(0,26)}`:'a new founder awaits',80,92)}
let last=performance.now();
function loop(t){const rdt=Math.min(.1,(t-last)/1000);last=t;anim+=rdt;
 if(running&&S){updOverlay(rdt);if(!paused&&!S.done)advance(rdt);
  const pd=rdt*(vday?(highlights?3:speed):1);particles.forEach(p=>{p.x+=p.vx*pd;p.y+=p.vy*pd;p.vy+=p.g*pd;p.l-=pd});particles=particles.filter(p=>p.l>0);floaters.forEach(f=>{f.y-=pd*18;f.l-=pd});floaters=floaters.filter(f=>f.l>0)}
 render(rdt);if(!running)drawTitleBot();requestAnimationFrame(loop)}
window.__rf={get S(){return S},get V(){return V},get vday(){return vday},get shoppers(){return shoppers},get queue(){return queue},get npcs(){return npcs},get van(){return van},EC,balance,runHeadlessDbg:()=>{const s=runHeadless();HEADLESS=false;return s},runHeadless,stepDay,unitEcon,pnl,planCsv,planMarkdown,openBooks,renderBooks,breakEven,monthlyFixed,ttmRev,get highlights(){return highlights},setHL:v=>{highlights=v;syncCtl()},newCompany,hall,LAYOUTS,
 ff:n=>{for(let i=0;i<n&&!S.done;i++)stepDay();V.s=[...S.inv.s];V.o=[...S.inv.o];V.kits=S.kits.reduce((a,b)=>a+b,0);V.cash=S.cash;V.orders=S.backlog.length;save();return S.day},
 setStage:n=>{S.stage=n;if(n>=1&&S.ch.store.open<0)S.ch.store.open=S.day;if(S.ch.shopify.open<0)S.ch.shopify.open=S.day;setLevel(n);npcs.forEach(x=>x.home=null);S.rep=Math.max(S.rep,35);S.use.s=S.use.s.map(()=>2);unlocked().forEach(k=>{S.inv.s[k.i]+=12;S.inv.o[k.i]+=6;S.kits[k.i]+=30});S.flags.visualNext=1},
 hireTest:r=>hire(r,'test hire'),memLoad,fcConf,brainWeek,whatIf,openLab,showRecap,photo,debate,setSal:m=>{S.salMode=m},setCof:v=>COF_ON=v,setSalPick:v=>SAL_PICK=v,founderH:()=>founderH(),get LAB(){return LAB},podRows,setForce:i=>FORCE_LINE=i,POD:()=>POD(),scenario,stratPlan,get SIMMEM(){return SIMMEM},get overlay(){return overlay}};
$('bCont').classList.toggle('hidden',!load());syncCtl();requestAnimationFrame(loop);
})();
