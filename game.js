// Robot Founder — plain JS + canvas. All art procedural.
(()=>{
'use strict';
const T=32,DAY_LEN=75,SAVE='robotFounderSave_v4',HALL='rfHallOfFame';let HEADLESS=false;
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
const IND=[
 {n:'Robot-Made Sneakers',u:'sneakers',shape:'shoe',mc:14,skus:[['Basic Kicks',1,4,45,2.8,'#e74c3c'],['Hi-Tops',2,6,95,3.2,'#3498db'],['Smart Sneakers',3,8,210,3.6,'#2ecc71'],['Moon Boots',4,11,450,4,'#f1c40f']]},
 {n:'Smart Planters',u:'planters',shape:'pot',mc:10,skus:[['Tiny Pot',1,3,32,2.8,'#c0392b'],['Self-Watering Pot',2,5,75,3.1,'#16a085'],['Talking Planter',3,8,160,3.5,'#8e44ad'],['Bonsai Biodome',4,11,380,4,'#27ae60']]},
 {n:'Artisanal Toasters',u:'toasters',shape:'toaster',mc:16,skus:[['2-Slot Classic',1,4,55,2.9,'#bdc3c7'],['Bagel Pro',2,6,110,3.2,'#e67e22'],['Toast-Printer 3000',3,9,240,3.6,'#e74c3c'],['Sentient Toaster',4,12,520,4.1,'#9b59b6']]},
 {n:'Drone Kits',u:'drones',shape:'drone',mc:18,skus:[['Pocket Drone',1,4,60,2.8,'#34495e'],['Racer Kit',2,6,130,3.2,'#e74c3c'],['Camera Drone',3,9,280,3.6,'#3498db'],['Cargo Hexacopter',4,12,600,4,'#f1c40f']]},
 {n:'Hand-Poured Candles',u:'candles',shape:'candle',mc:6,skus:[['Tea Light Pack',1,2,18,2.8,'#f5cba7'],['Lavender Jar',1,4,38,3.2,'#bb8fce'],['Smart Candle',2,6,90,3.5,'#f1948a'],['Eternal Flame Deluxe',3,9,210,4,'#f7dc6f']]},
 {n:'Mechanical Keyboards',u:'keyboards',shape:'keyboard',mc:15,skus:[['60% Clacker',1,4,70,2.9,'#ecf0f1'],['RGB Tenkeyless',2,6,140,3.3,'#8e44ad'],['Split Ergo',3,9,260,3.6,'#1abc9c'],['Typewriter Edition',4,12,540,4.1,'#d4ac0d']]},
 {n:'Robot Pet Toys',u:'toys',shape:'toy',mc:9,skus:[['Squeaky Bolt',1,3,22,2.8,'#f39c12'],['Laser Mouse',1,4,40,3.1,'#e74c3c'],['Robo-Fetch Ball',2,6,85,3.4,'#3498db'],['Cat Mech Suit',3,10,230,4,'#95a5a6']]},
 {n:'Ceramic Mugs',u:'mugs',shape:'mug',mc:7,skus:[['Plain Mug',1,3,20,2.8,'#ecf0f1'],['Glaze Drip Mug',1,4,36,3.2,'#5dade2'],['Heated Smart Mug',2,6,95,3.5,'#e74c3c'],['Bottomless Mug™',3,9,200,4,'#f1c40f']]},
 {n:'Solar Lanterns',u:'lanterns',shape:'lamp',mc:11,skus:[['Camp Lantern',1,3,35,2.8,'#f1c40f'],['Fairy String',1,4,48,3.1,'#ff6fb5'],['Storm Beacon',2,7,120,3.5,'#e67e22'],['Pocket Sun',3,10,300,4,'#f7dc6f']]},
 {n:'Electric Skateboards',u:'boards',shape:'board',mc:20,skus:[['Mini Cruiser',1,5,80,2.9,'#e74c3c'],['Longboard',2,7,170,3.3,'#27ae60'],['Hoverish Board',3,10,360,3.7,'#3498db'],['Off-Road Beast',4,13,720,4.1,'#2c3e50']]},
 {n:'Board Games',u:'games',shape:'game',mc:8,skus:[['Card Game',1,3,25,2.9,'#e74c3c'],['Robot Chess',1,5,55,3.2,'#2c3e50'],['Startup Simulator',2,7,90,3.5,'#8e44ad'],['Collector Box',3,10,220,4,'#d4ac0d']]},
 {n:'Bike Lights',u:'lights',shape:'bulb',mc:9,skus:[['Blinky',1,3,24,2.8,'#e74c3c'],['Headlamp Pro',1,4,55,3.2,'#ecf0f1'],['Turn-Signal Helmet',2,7,140,3.5,'#f39c12'],['Laser Lane',3,10,280,4,'#2ecc71']]}];
const mkSkus=ind=>ind.skus.map(([n,m,b,p,q,c],i)=>({n,m,b,p,q,c,i}));
const MODELS=['RX-7 "Tinker"','Model T-1000-ish','Unit B0B','Mk.II Servo','K9-Lite','Proto-Q','Hexapod-Zero','ZX Spectrumbot'];
const RNAMES=['Bolt','Ada','Sprock','Gizmo','Ohm','Pixel','Kilo','Rivet','Nova','Byte','Tork','Volta','Clank','Mira'];
const COLORS=[['#e74c3c','#922b21'],['#3498db','#1f5f8b'],['#2ecc71','#1d8348'],['#f1c40f','#9a7d0a'],['#9b59b6','#5b2c6f'],['#e67e22','#935116'],['#1abc9c','#117a65'],['#ecf0f1','#7f8c8d'],['#ff6fb5','#a8336f']];
const PERKS=[
 {id:'efficient',n:'Low-Power Mode',d:'Actions use 25% less battery.'},
 {id:'coder',n:'10x Compiler',d:'Coding gives +50% product progress.'},
 {id:'charmer',n:'Charming LED Smile',d:'+15% pitch & sales success.'},
 {id:'frugal',n:'Penny-Pinching Firmware',d:'Daily expenses 20% lower.'},
 {id:'fast',n:'Overclocked Wheels',d:'Move 35% faster.'},
 {id:'viral',n:'Meme-Compatible Face',d:'Marketing gives double reputation.'},
 {id:'solar',n:'Solar Panel Hat',d:'Slowly recharges 0.6%/s all day.'},
 {id:'gpu',n:'Spare GPU in Chest Cavity',d:'Start with +60 compute; research is cheaper.'}];
function genCompany(){
 const ind=pick(IND),col=pick(COLORS),perk=pick(PERKS);
 const name=Math.random()<.5?pick(PRE)+pick(NOUN):pick(NOUN)+pick(['ify','tron','matic','bot','verse','zilla','hub']);const sf=pick(SUF);
 const nm=/^[.l]/.test(sf)?name+sf:name+' '+sf;return {name:nm,industry:ind.n,price:ind.skus[0][3],unit:ind.u,shape:ind.shape,mc:ind.mc,skus:mkSkus(ind),color:col[0],dark:col[1],model:pick(MODELS),robot:pick(RNAMES)+'-'+RI(1,99),perk:perk.id,perkName:perk.n,perkDesc:perk.d,seed:Math.random()};
}
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
const TRAITS=[
 {id:'builder',n:'Perfectionist Builder',w:{code:1.5,research:1.4,serve:.8,refactor:1.6},low:22,risk:.9},
 {id:'hustler',n:'Relentless Hustler',w:{serve:1.5,pitch:1.3,code:.85,compliance:.7},low:18,risk:1.1},
 {id:'hype',n:'Hype Machine',w:{market:1.8,serve:1.1,compliance:.6,refactor:.6},low:20,risk:1.3},
 {id:'cautious',n:'Anxious Accountant',w:{dock:1.5,hire:.6,compliance:1.6,maintain:1.4},low:34,risk:.6},
 {id:'reckless',n:'YOLO Optimizer',w:{hire:1.6,market:1.2,compliance:.4,maintain:.5,dock:.8},low:11,risk:1.6},
 {id:'social',n:'Team Player',w:{hire:1.3,coffee:2,maintain:1.6,build:1.3},low:22,risk:1}];
const VERA='Vera Vulture',TESS='Tess Tattle';
const RIVALCO=['MegaCorp Dynamics','OmniBot Inc','Synergex','Globotron','Hyperscale Holdings','Monopolis AI'];
const RIVALCEO=['MAXIMUS-9','CHAD-3000','Lord Servo','EXECUTRON','Baron Von Bytes','ALPHA-PRIME'];
const HUMANS=['Priya','Marcus','Jun','Elena','Dave','Fatima','Kofi','Sam','Olga','Leo','Rosa','Tariq','Mei','Bjorn'];
const WEATHERS=[['sunny','☀️'],['sunny','☀️'],['cloudy','☁️'],['rain','🌧️'],['storm','⛈️'],['snow','❄️']];
const E={sal:600,bot:350,rents:[100,140,900,2500,6000],base:150,stg:500,rounds:[40000,220000,900000],legal:.4,nofit:.5,traffic:5,online:5,matMul:1,ipo:.65,rd:1.5};
const LEVELS=[{n:'Garage Table Sale'},{n:'Garage Shop (with coffee!)'},{n:'Small Shop + Workshop'},{n:'Big Store + Workshop'},{n:'Flagship Store + Factory + Shipping Dock'}];
const ROUNDS=[
 {n:'Seed Round',ok:s=>s.product>=20&&s.customers>=25,req:'20 R&D & 25 customers',need:{product:20,customers:25}},
 {n:'Series A',ok:s=>s.product>=60&&s.customers>=150,req:'60 R&D & 150 customers',need:{product:60,customers:150}},
 {n:'Series B',ok:s=>s.product>=110&&s.customers>=400,req:'110 R&D & 400 customers',need:{product:110,customers:400}}];
const IPO_NEED={customers:800,rep:60,product:160,rating:3.4};
const ipoReady=()=>S.stage>=3&&S.customers>=IPO_NEED.customers*E.ipo&&S.rep>=IPO_NEED.rep&&S.product>=IPO_NEED.product*E.ipo&&S.rating>=IPO_NEED.rating&&S.market>=.8;
const OUT={ipo:['🔔','IPO!'],bankrupt:['💸','Bankrupt'],battery:['🪫','Battery death'],acquihire:['🤝','Acqui-hired for pennies'],regulators:['⚖️','Shut down by regulators'],mutiny:['🤖','Robot co-founder mutiny'],pivot:['🌀','Pivot spiral']};
const UPGRADES=[{id:'legs',n:'Turbo Legs',cost:4000,d:'moves 40% faster'},{id:'battery',n:'Mega Battery',cost:7000,d:'+40% capacity, fresh cells'},{id:'leds',n:'Charm LEDs',cost:2500,d:'+15% happier customers'},{id:'chip',n:'Quantum-ish Chip',cost:18000,d:'+50% coding & research'}];
const WORLD_NEWS=['Local man asks toaster for investment advice','Scientists confirm coffee is still a vegetable (citation needed)','Stock market does a little dance','Pigeon population reaches all-time high','Cloud computing found to be mostly actual clouds','Self-driving car gets lost, blames map','Moon declines to comment on lunar real estate bubble','Startup raises $40M to put blockchain in sandwiches','Weather forecast: 60% chance of disruption','Nation\'s vending machines unionize','Study: 9 out of 10 robots prefer oil to water','New social network for houseplants goes viral','Tech CEO spotted touching grass, stocks dip','Interest rates go up, down, and sideways','Local hackathon produces 14 to-do apps','Billionaire launches self into space again, nobody notices','Experts warn of AI-generated experts','Breaking: printer works on first try','Conference keynote runs 3 hours over, attendees fossilize','Shortage of rubber ducks hits debugging industry'];
const ROLES={cs:{n:'Customer Service',e:'🧾',cap:[0,1,1,2,3]},ship:{n:'Shipping',e:'📦',cap:[0,1,1,2,3]},maker:{n:'Maker',e:'🔨',cap:[0,0,2,3,4]},eng:{n:'Engineer',e:'🧪',cap:[0,0,1,2,3]},mkt:{n:'Marketing',e:'📣',cap:[0,0,0,1,2]}};
const SKU_UNLOCK=[0,40,110,190];
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
const LAY=()=>LAYOUTS[S.level];
const ST=id=>LAY().st[id];
const stations=()=>Object.values(LAY().st);
const benches=()=>stations().filter(s=>s.id.startsWith('bench'));
const worldW=()=>LAY().w;
const maxE=()=>Math.round(S.bHealth*(S.up.battery?1.4:1));
const unlocked=()=>S.co.skus.filter(k=>S.product>=SKU_UNLOCK[k.i]);
const invTotal=()=>S.inv.reduce((a,b)=>a+b,0);
const quality=k=>Math.min(5,k.q+S.product/150+(S.flags.cto?.2:0));
const matCost=()=>Math.round(S.co.mc*E.matMul*(1-Math.min(.35,S.product/700))*(S.flags.supplierUp?1.4:1));
const roleCount=r=>S.staff.filter(s=>s.role===r).length;
const nowT=()=>(S.day-1)*DAY_LEN+S.time;

function newState(){
 const co=genCompany(),tr=pick(TRAITS);co.trait=tr.id;co.traitName=tr.n;const cof=Math.random()<.35?pick(RNAMES)+'-'+RI(100,999):null;
 return {cofounder:cof,co,day:1,time:0,cash:RI(6,14)*1000,energy:100,bHealth:100,product:RI(0,6),customers:0,rep:RI(5,20),humans:0,robots:0,compute:co.perk==='gpu'?80:RI(10,30),
  stage:0,level:0,miles:{},lifetimeRev:0,x:3*T,y:5*T,done:false,outcome:null,peakVal:0,moments:[],log:[],decisions:{},pitchCool:0,
  morale:80,botMood:75,legal:RI(0,10),techDebt:0,market:1,mTrend:0,luck:0,weather:'sunny',wIcon:'☀️',rival:{name:pick(RIVALCO),ceo:pick(RIVALCEO),str:RI(5,15)},
  pivots:0,custHist:[0],hidden:pick(['none','none','none','battery','regulator','rival','bust','toxic','burn','nofit','nofit']),up:{},chain:[],recent:[],flags:{},goal:null,hist:[],loyal:null,heads:[],dayStats:null,industries:[co.industry],team:0,
  inv:[3,0,0,0],mat:6,matOrder:null,orders:[],boxes:[],rating:3.8,reviews:0,mktBoost:0,staff:cof?[{role:'maker',kind:'robot',name:cof}]:[],rushT:0,viral:0,stockouts:0};
}
const has=p=>S.co.perk===p;
const trait=()=>TRAITS.find(t=>t.id===S.co.trait)||TRAITS[0];

// ---------- globals ----------
let S=null,running=false,paused=false,speed=1,highlights=true,hlT=0,follow=false,busy=0,busyLen=1,busyLabel='',busyFn=null,anim=0,particles=[],floaters=[],shakeT=0,shakeMag=0;
let bot={path:[],goal:null,think:'',thinkT:0,walkT:0,face:1,idle:0},npcs=[],shoppers=[],van={state:'away',t:20,x:0},overlay=null,stepT=0,dashOpen=innerWidth>760,sampleT=0;
function save(){if(HEADLESS)return;try{const o=Object.assign({},S);o.log=S.log.slice(-40);localStorage.setItem(SAVE,JSON.stringify(o))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE));return s&&s.co&&!s.done?s:null}catch(e){return null}}
function hall(){try{return JSON.parse(localStorage.getItem(HALL))||[]}catch(e){return []}}

// ---------- log / thoughts / news ----------
function clock(){const m=Math.floor(8*60+Math.min(1,S.time/DAY_LEN)*12*60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
function log(t,cls=''){if(HEADLESS)return;const e={d:S.day,c:clock(),t,cls};S.log.push(e);if(S.log.length>200)S.log.shift();addLogLine(e)}
function addLogLine(e){const lb=$('logb'),d=document.createElement('div');d.innerHTML=`<span class="t">Day ${e.d}, ${e.c} —</span> <span class="${e.cls}">${e.t}</span>`;lb.appendChild(d);while(lb.children.length>80)lb.firstChild.remove();lb.scrollTop=lb.scrollHeight}
function think(t,cls){if(HEADLESS)return;bot.think=t;bot.thinkT=4;log(t,cls)}
function toast(t){if(HEADLESS)return;const d=document.createElement('div');d.textContent=t;$('toast').appendChild(d);setTimeout(()=>d.remove(),3500)}
function float(t,c='#ffd76a',x=S.x+T/2,y=S.y){if(!HEADLESS)floaters.push({t,c,x,y,l:1.6})}
function burst(x,y,n,cols,up=160){if(HEADLESS)return;for(let i=0;i<n;i++)particles.push({x,y,vx:R(-90,90),vy:R(-up,-20),l:R(.6,1.4),c:pick(cols),g:200})}
function moment(t,big=true){S.moments.push({d:S.day,t});toast(t);if(big){hl(5);shake(.5,5)}}
function news(t){S.heads.push(t);if(S.heads.length>30)S.heads.shift()}
function hl(sec){hlT=Math.max(hlT,sec)}
function shake(t,m){if(HEADLESS)return;shakeT=Math.max(shakeT,t);shakeMag=Math.max(shakeMag,m)}
const L=(arr,o={})=>pick(arr).replace(/\{(\w+)\}/g,(m,k)=>o[k]);
const pl=n=>/s$/.test(n)?n:n+'s';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const addRep=n=>{S.rep=clamp(S.rep+n,0,100)};

// ---------- pathfinding ----------
function blocked(tx,ty){
 const Ly=LAY();if(ty<2||ty>10||tx<1||tx>Ly.w-2)return true;return !!Ly.solid[ty*40+tx]}
function bfs(fx,fy,gx,gy){
 const key=(x,y)=>y*32+x,prev=new Map([[key(fx,fy),null]]),q=[[fx,fy]];let qi=0;
 while(qi<q.length){const [x,y]=q[qi++];if(x===gx&&y===gy){const p=[];let k=key(x,y);while(k!=null){p.unshift([k%32,Math.floor(k/32)]);k=prev.get(k)}return p.slice(1)}
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(!prev.has(k)&&!blocked(nx,ny)){prev.set(k,key(x,y));q.push([nx,ny])}}}
 return null}
function walk(ent,dt,sp){
 if(!ent.path.length)return true;const [tx,ty]=ent.path[0],gx=tx*T,gy=ty*T,dx=gx-ent.x,dy=gy-ent.y,d=Math.hypot(dx,dy),st=sp*dt;
 if(d<=st){ent.x=gx;ent.y=gy;ent.path.shift()}else{ent.x+=dx/d*st;ent.y+=dy/d*st;if(Math.abs(dx)>1)ent.face=dx>0?1:-1}
 ent.walkT=(ent.walkT||0)+dt;return !ent.path.length}
const tileOf=e=>[Math.round(e.x/T),Math.round(e.y/T)];
// ---------- economy ----------
function salaryOf(s){return s.kind==='robot'?E.bot:E.sal*(1+.15*S.stage)}
function expenses(){return Math.round((S.hidden==='burn'?1.5:1)*(S.staff.reduce((a,s)=>a+salaryOf(s),0)+E.rents[S.level]+E.base+S.stage*E.stg)*(has('frugal')?.8:1))}
function revenue(){const h=S.hist.slice(-2);const today=S.dayStats?(S.dayStats.storeRev+S.dayStats.onlineRev)/Math.max(.15,S.time/DAY_LEN):0;return Math.round(h.length?(h.reduce((a,x)=>a+x.rev,0)+today)/(h.length+1):today)}
function runway(){const net=expenses()+matCost()*4-revenue();return net<=0?99:S.cash/net}
function valuation(){return Math.round(revenue()*365*(1.5+S.rep/30)*S.market*(1+S.stage*.8)*(S.rating/4)+Math.max(0,S.cash))}
function prodMult(){return (S.morale<25?.5:S.morale<45?.8:1)}
function nextRound(){return S.stage<3?ROUNDS[S.stage]:null}
function syncStaff(){S.humans=S.staff.filter(s=>s.kind==='human').length;S.robots=S.staff.filter(s=>s.kind==='robot').length;S.team=S.staff.length}
function fireStaff(pred,why){const i=S.staff.findIndex(pred);if(i<0)return null;const s=S.staff.splice(i,1)[0];syncStaff();const j=npcs.findIndex(n=>n.ref===s);if(j>=0){const n=npcs[j];n.leaving=1;n.path=bfs(...tileOf(n),ST('door').sx,ST('door').sy)||[]}if(why)log(why,'r');return s}

// ---------- goals ----------
function setGoal(){
 const r=nextRound();let g;
 if(r){const n=r.need;g=S.product<n.product?{k:'product',v:n.product,t:`design our way to ${n.product} product`}:S.customers<n.customers?{k:'customers',v:n.customers,t:`serve ${n.customers} customers`}:{k:'stage',v:S.stage+1,t:`close the ${r.n}`}}
 else g={k:'ipo',v:1,t:'ring the IPO bell'};
 g.until=S.day+RI(3,5);S.goal=g;log(`🎯 Goal for the next ${g.until-S.day} days: ${g.t}.`,'y');
}
function goalMet(){const g=S.goal;if(!g)return false;return g.k==='product'?S.product>=g.v:g.k==='customers'?S.customers>=g.v:g.k==='stage'?S.stage>=g.v:false}
function checkGoal(){if(!S.goal)return setGoal();if(goalMet()){log(`🎯 Goal achieved: ${S.goal.t}! Morale +8.`,'g');S.morale=clamp(S.morale+8,0,100);addRep(2);S.goal=null;setGoal()}
 else if(S.day>S.goal.until){log(`🎯 Missed my goal (${S.goal.t}). Updating my priors. Morale -6.`,'r');S.morale=clamp(S.morale-6,0,100);S.goal=null;setGoal()}}

// ---------- store / online / production ----------
let queue=[],regT=0,robotServing=false,machEnt=[];
const LF=[1,1.2,2.2,3.5,5],OF=[.6,.9,1.8,3,4.5],SCAP=[4,6,10,14,20];
function demandMul(){const t=S.time/DAY_LEN,w={sunny:1.1,cloudy:1,rain:.7,storm:.45,snow:.75}[S.weather]||1;
 return (.4+S.rep/80)*S.market*(1+S.mktBoost)*(S.rushT>0?2:1)*(.5+S.rating/8)*(1+.12*(unlocked().length-1))*(S.hidden==='nofit'?.5:1)*(1-S.rival.str/260)*(1+S.viral)*(S.up.leds?1.08:1)*(has('charmer')?1.1:1)*w}
const storeOpen=()=>{const t=S.time/DAY_LEN;return t>1/12&&t<11/12};
function review(r){S.rating=clamp(S.rating*.96+clamp(r,1,5)*.04,1,5);S.reviews++}
const LOOKS=()=>({skin:pick(['#f1c27d','#c68642','#8d5524','#ffdbac','#e0ac69']),hair:pick(['#2c1b10','#6d4c2e','#d4ac0d','#c0392b','#222','#aaa','#ff6fb5']),shirt:pick(['#e74c3c','#3498db','#9b59b6','#16a085','#f39c12','#ecf0f1','#2c3e50','#e67e22']),pants:pick(['#34495e','#2c3e50','#7f8c8d','#1a5276']),hat:Math.random()<.25?pick(['#c0392b','#f1c40f','#111']):null,tall:Math.random()<.5});
function spawnShopper(){const d=ST('door');shoppers.push({x:d.sx*T,y:(d.sy+1)*T,path:[[d.sx,d.sy]],st:'in',t:0,look:LOOKS(),face:1,walkT:0,pat:R(28,55)*(S.level>=3?1.2:1),wait:0});}
function shopperLeave(s,happy,msg){s.st='leave';s.happy=happy;const d=ST('door');s.path=bfs(...tileOf(s),d.sx,d.sy)||[];if(msg)floaters.length<60&&!HEADLESS&&floaters.push({t:msg,c:happy?'#7dff8a':'#ff7d7d',x:s.x+16,y:s.y,l:1.6});const qi=queue.indexOf(s);if(qi>=0){queue.splice(qi,1);requeue()}}
function requeue(){const Q=LAY().queue;queue.forEach((s,i)=>{if(s.slot!==i){s.slot=i;const [x,y]=Q[Math.min(i,Q.length-1)];s.path=bfs(...tileOf(s),x,y)||[]}})}
function pickSku(){const av=unlocked().filter(k=>S.inv[k.i]>0);if(!av.length)return null;let tot=0;const w=av.map(k=>{const v=quality(k)/(1+k.i*.55);tot+=v;return v});let r=Math.random()*tot;for(let i=0;i<av.length;i++){r-=w[i];if(r<=0)return av[i]}return av[0]}
function updShopper(s,dt){
 const arrived=walk(s,dt,60);
 if(s.st==='in'&&arrived){const ds=stations().filter(x=>x.type==='disp');const t=pick(ds);s.st='go';s.path=bfs(...tileOf(s),t.sx,t.sy)||[]}
 else if(s.st==='go'&&arrived){s.st='browse';s.t=R(1.5,4)}
 else if(s.st==='browse'){s.t-=dt;if(s.t<=0){const k=pickSku();
  if(!k){S.dayStats.stockouts++;S.stockouts++;review(2.6);addRep(-.15);shopperLeave(s,false,pick(['Sold out?!','Nothing in stock 😠','Empty shelves…']));return}
  S.inv[k.i]--;s.sku=k;const Q=LAY().queue;if(queue.length>=Q.length){S.inv[k.i]++;s.sku=null;S.dayStats.lineLeaves++;review(2);shopperLeave(s,false,'Line is too long!');return}
  queue.push(s);s.st='queue';s.slot=-1;s.wait=0;requeue();S.dayStats.qMax=Math.max(S.dayStats.qMax,queue.length)}}
 else if(s.st==='queue'){s.wait+=dt;if(s.wait>s.pat){S.inv[s.sku.i]++;s.sku=null;S.dayStats.lineLeaves++;review(2.2);addRep(-.2);shopperLeave(s,false,pick(['Ugh, forget it.','Waited forever!','This line 🙄']))}}
}
function updRegister(dt){
 const LyQ=LAY().queue,front=queue[0];let power=robotServing?1.25:0;
 npcs.forEach(n=>{if(n.ref&&n.ref.role==='cs'&&n.atHome&&!n.brk)power+=prodMult()*(n.kind==='robot'?1.1:1)});
 S.cashierPower=power;
 if(!front||!front.path||front.path.length||front.slot!==0||power<=0){regT=0;return}
 regT+=dt*power;if(regT<2.3)return;regT=0;
 const k=front.sku,price=k.p;S.cash+=price;S.dayStats.storeRev+=price;S.lifetimeRev+=price;S.customers++;S.dayStats.served++;
 review(quality(k)+(front.wait>20?-.8:.9)+R(-.5,.5));
 const t=ST('till');burst(t.x*T+16,t.y*T,8,['#ffd76a','#f1c40f']);SFX.kaching();if(!HEADLESS&&floaters.length<60)floaters.push({t:'+$'+price,c:'#ffd76a',x:t.x*T+16,y:t.y*T-6,l:1.2});
 front.carry=k;shopperLeave(front,true,Math.random()<.3?pick(['Love it!','So cute!','Take my money','⭐⭐⭐⭐⭐']):null);
}
function updOnline(dt){
 const rate=.035*E.online*OF[S.level]*demandMul();if(Math.random()<rate*dt){const av=unlocked();let k=av[Math.min(av.length-1,Math.floor(Math.pow(Math.random(),1.6)*av.length))];S.orders.push({k:k.i,t:nowT()});S.flash=1}
 const now=nowT();for(let i=S.orders.length-1;i>=0;i--)if(now-S.orders[i].t>DAY_LEN*1.6){S.orders.splice(i,1);review(1);addRep(-.4);S.dayStats.cancelled++}
 // van
 van.t-=dt;if(van.state==='away'&&van.t<=0){van.state='arrive';van.t=2}
 else if(van.state==='arrive'&&van.t<=0){van.state='park';van.t=6;loadVan()}
 else if(van.state==='park'&&van.t<=0){van.state='leave';van.t=2}
 else if(van.state==='leave'&&van.t<=0){van.state='away';van.t=R(22,32)}
 // materials delivery
 if(S.matOrder&&now>=S.matOrder.eta){S.mat+=S.matOrder.qty;log(`🚚 Supplier delivered ${S.matOrder.qty} crates of materials.`,'g');const m=ST('mat');burst(m.sx*T+16,m.sy*T,10,['#b5835a','#ddd']);S.matOrder=null;S.truckT=3}
 if(S.truckT>0)S.truckT-=dt;
}
function packOne(){for(let j=0;j<S.orders.length;j++){const o=S.orders[j];if(S.inv[o.k]>0){S.inv[o.k]--;S.orders.splice(j,1);S.boxes.push(o);return true}}return false}
const packable=()=>S.orders.filter(o=>S.inv[o.k]>0).length;
function loadVan(){if(!S.boxes.length)return;let rev=0,late=0;const now=nowT();
 S.boxes.forEach(b=>{const k=S.co.skus[b.k];rev+=k.p;S.customers++;S.dayStats.shipped++;const isLate=now-b.t>DAY_LEN*.75;if(isLate){late++;review(2.2)}else review(quality(k)+.8+R(-.4,.5))});
 S.cash+=rev;S.dayStats.onlineRev+=rev;S.lifetimeRev+=rev;S.dayStats.late+=late;S.boxes=[];SFX.coin();if(!HEADLESS)log(`🚐 Van picked up packages: +${fmt(rev)}${late?` (${late} late — reviews will hurt)`:''}.`,late?'r':'g')}
function makeItem(rate,dt,ent){// ent.prog accumulator
 const k=pickBuildSku();if(!k||S.mat<k.m){ent.idle=1;return}ent.idle=0;ent.prog=(ent.prog||0)+dt*rate;if(ent.prog>=k.b){ent.prog=0;S.mat-=k.m;S.inv[k.i]++;S.dayStats.built++;if(!HEADLESS&&Math.random()<.5)burst(ent.x+16,ent.y+8,5,[k.c,'#fff'],80)}}
function pickBuildSku(){const av=unlocked();if(!av.length)return null;const want=av.map(k=>({k,s:S.inv[k.i]/(k.i===0?1.4:1)+S.orders.filter(o=>o.k===k.i).length*-1}));want.sort((a,b)=>a.s-b.s);return want[0].k}
const invTarget=()=>6+S.level*5+S.orders.length;

// ---------- planner ----------
function options(){
 const tr=trait(),tw=tr.w,o=[],me=maxE(),pe=S.energy+R(-7,7)*tr.risk,exp=expenses(),rw=runway(),r=nextRound(),g=S.goal||{},ds=S.dayStats;
 const add=(id,st,score,why,arg)=>{if(ST(st)&&score>0)o.push({id,st,score:score*(tw[id]||1)*R(.75,1.25),why,arg})};
 const reflex=S.energy<15&&Math.random()>.012*tr.risk;if(S.energy<15&&!reflex&&!HEADLESS)log('Low battery warning… ignoring it. What could go wrong?','r');
 if(pe<tr.low||reflex)add('dock','dock',300,L(['Battery at {e}%. Heading to the dock.','{e}% battery. Even CEOs need naps.','Low juice ({e}%). Plugging myself in. Literally.','{e}%?! My life flashed before my LEDs. Dock time.'],{e:Math.round(S.energy)}));
 else if(S.energy<me*.5)add('dock','dock',6+(me*.5-S.energy)/3,`Battery ${Math.round(S.energy)}%. A top-up wouldn't hurt.`);
 if(ipoReady())add('ipo','bell',95,'All IPO requirements met and the market is open. Ringing the bell.');
 if(r&&r.ok(S)&&S.pitchCool<=0)add('pitch','door',60,`Numbers look good for a ${r.n}. Pitching ${S.flags.veraIn?VERA:pick(['Sequoia-ish Ventures','Lightspeed of Sound','Accel-erator & Brakes',VERA])}…`);
 else if(r&&rw<2.5&&S.pitchCool<=0&&S.product>=10)add('pitch','door',30,`Runway: ${rw.toFixed(1)} days. Desperate pitch time. Smiling with all LEDs.`);
 const cs=roleCount('cs'),sh=roleCount('ship'),mk=roleCount('maker'),q=queue.length;
 if(q>0&&(cs===0||q>cs*4))add('serve','till',Math.min(85,(cs?22:36)+q*10),cs?`Line is ${q} deep — jumping on a second register.`:L(['Line is {q} deep. Running the register myself.','{q} customers waiting! Beep-boop, cashier mode.','Customers at the counter. Activating customer-service subroutine.'],{q}));
 const pk=packable();if(pk>0&&(sh===0||pk>sh*8))add('pack',sh?'pack1':'pack',(sh?14:18)+pk*5+(S.orders.some(o=>nowT()-o.t>DAY_LEN*.5)?15:0),`${pk} online order${pk>1?'s':''} waiting. Packing boxes before the van comes.`);
 if(!S.matOrder&&S.mat<8+S.level*8&&S.cash>matCost()*8)add('order','mat',45,`Materials down to ${S.mat}. Ordering crates from the supplier.`);
 const tgt=invTarget(),iv=invTotal(),nb=benches().length;
 if(S.mat>=1&&iv<tgt&&mk<nb){const k=pickBuildSku();if(k)add('build','bench0',18+(tgt-iv)*3+(ds.stockouts?10:0),iv===0?`Shelves are EMPTY. Building ${pl(k.n)} at the workbench.`:L(['Inventory at {n}. Building {k}.','Shelf is down to {n}. Time to make {k} with my own grippers.','Crafting {k}. Each one lovingly over-engineered.'],{n:iv,k:pl(k.n)}),k)}
 const gp=g.k==='product'?1.5:1;
 add('code','desk',(S.product<10?24:12+Math.max(0,(r?r.need.product:IPO_NEED.product)-S.product)/5)*gp,L(['Product R&D at {p}. Designing better {u}.','Prototyping the next {u} model. Possibly a bug. Same thing.','Improving quality — fewer refunds, more stars.','Goal: {g}. Back to the design desk.'],{p:Math.round(S.product),u:S.co.unit,g:g.t||'world domination'}));
 const mc=300+S.stage*800;if(S.cash>mc*4)add('market','board',S.rep<IPO_NEED.rep?(S.stage>=1?20:12):4,L(['Reputation {r}. Drawing a chart that goes up and to the right.','Putting our {u} on a billboard.','Writing "disrupt" on the whiteboard 40 times.'],{r:Math.round(S.rep),u:S.co.unit}));
 if(S.techDebt>45)add('refactor','desk',S.techDebt/3,`Tech debt at ${Math.round(S.techDebt)}. Refactoring the POS system before it collapses.`);
 if(S.legal>55)add('compliance','desk',(S.legal-40)/2,`Legal risk ${Math.round(S.legal)}. Filing product-safety paperwork in triplicate.`);
 const rc=has('gpu')?7:10;
 if(S.level>=2){if(S.compute>=rc)add('research','rack',16,`Compute at ${Math.floor(S.compute)}. Simulating ${S.co.unit} designs. And invoices.`);else if(S.cash>9000)add('buycompute','rack',10,'Out of compute. Buying GPUs. Jensen, if you\'re watching, hi.');}
 // hiring by bottleneck
 const canHire=S.cash>exp*2/tr.risk+1000&&rw>1.5/tr.risk&&ST('hire');
 if(canHire){const cap=r=>ROLES[r].cap[S.level];
  if(cs<cap('cs')&&(ds.qMax>=3||ds.lineLeaves>=2||q>=4))add('hire','hire',32,`Line hit ${Math.max(ds.qMax,q)} deep${ds.lineLeaves?` and ${ds.lineLeaves} people walked out`:''}. Hiring a cashier.`,'cs');
  else if(sh<cap('ship')&&(S.orders.length>=6||ds.late>=2||ds.cancelled))add('hire','hire',30,`Order backlog is ${S.orders.length}${ds.late?`, ${ds.late} shipped late`:''}. Hiring a shipper.`,'ship');
  else if(mk<cap('maker')&&(ds.stockouts>=2||(iv<tgt*.5&&S.mat>3)))add('hire','hire',28,`${ds.stockouts} stockouts today. Hiring a maker to keep the shelves full.`,'maker');
  else if(roleCount('eng')<cap('eng')&&r&&S.product<r.need.product-15)add('hire','hire',20,`R&D is the bottleneck (${Math.round(S.product)}/${r.need.product}). Hiring an engineer.`,'eng');
  else if(roleCount('mkt')<cap('mkt')&&S.rep<IPO_NEED.rep)add('hire','hire',14,`Reputation stuck at ${Math.round(S.rep)}. Hiring a marketer.`,'mkt');}
 if(S.robots&&S.botMood<50&&S.cash>500*S.robots)add('maintain','bench0',(55-S.botMood)/1.5,`Robot loyalty ${Math.round(S.botMood)}%. Oil baths for everyone.`);
 if(S.bHealth<55&&S.cash>3500)add('newcell','bench0',30,`Battery health ${Math.round(S.bHealth)}%. Time for fresh cells.`);
 const nu=UPGRADES.find(u=>!S.up[u.id]&&S.cash>u.cost*5&&rw>5);if(nu)add('upgrade','bench0',10,`Treating myself: ${nu.n} (${nu.d}). It's a business expense.`);
 if(ST('coffee')&&S.humans>=1&&S.morale<60&&S.cash>500)add('coffee','coffee',(65-S.morale)/2,`Team morale ${Math.round(S.morale)}%. Brewing coffee I cannot drink.`);
 return o.sort((a,b)=>b.score-a.score)}
function decide(){
 const o=options();if(!o.length){bot.idle=1;return}const c=o[0];S.decisions[c.id]=(S.decisions[c.id]||0)+1;
 const s=ST(c.st);bot.path=bfs(...tileOf(S),s.sx,s.sy)||[];bot.goal=c;think(c.why);
}
function act(c){
 const sp=e=>{S.energy-=has('efficient')?e*.75:e},chip=S.up.chip?1.5:1;
 const D=(sec,lab,fn)=>{busy=busyLen=sec;busyLabel=lab;busyFn=fn};
 switch(c.id){
 case'dock':D(2.5,'Charging...',()=>{S.energy=maxE();float('Battery '+maxE()+'%','#7dff8a');log(L(['Fully charged. I feel like a new toaster.','Charged. Ready to make questionable decisions at full power.','Charged. Battery health: {h}%. Trying not to think about it.'],{h:Math.round(S.bHealth)}),'g')});SFX.charge();break;
 case'serve':{const n=Math.max(1,queue.length);robotServing=true;D(Math.min(14,n*2.2+1),'Ringing up...',()=>{robotServing=false;sp(2+n*.4)})}break;
 case'pack':D(1,'Packing...',()=>{let n=0;const f=()=>{if(n<8&&packOne()){n++;D(.6,'Packing '+n+'...',f)}else{sp(2+n);if(n)log(`Packed ${n} box${n>1?'es':''}. Tape: everywhere.`)}};f()});break;
 case'order':{const qty=16+S.level*14,cost=qty*matCost(),q2=S.cash>cost*1.5?qty:Math.max(4,Math.floor(S.cash/2/matCost()));D(1.2,'Calling supplier...',()=>{const c2=q2*matCost();S.cash-=c2;S.dayStats.mat+=c2;S.matOrder={qty:q2,eta:nowT()+R(8,16)*(S.flags.supplierDelay?3:1)};S.flags.supplierDelay=0;log(`Ordered ${q2} crates of materials (${fmt(c2)}). ETA: soon-ish.`)})}break;
 case'build':{const k=c.arg&&S.product>=SKU_UNLOCK[c.arg.i]?c.arg:pickBuildSku();if(!k)break;const n=Math.max(1,Math.min(6,Math.floor(S.mat/k.m)));if(S.mat<k.m)break;
  D(n*k.b*.3/chip,`Building ${k.n}...`,()=>{sp(3+n);S.mat-=n*k.m;S.inv[k.i]+=n;S.dayStats.built+=n;S.dayStats.botBuilt++;S.techDebt+=R(0,.6);float(`+${n} ${k.n}`,k.c);const b=ST('bench0');burst(b.x*T+16,b.y*T,8,[k.c,'#fff']);SFX.ok()})}break;
 case'code':D(1.6,'Designing...',()=>{sp(7);const g=Math.round(R(2,4)*E.rd*(has('coder')?1.5:1)*chip*10)/10;const before=unlocked().length;S.product+=g;S.techDebt+=R(.5,1.5)*trait().risk;float('+'+g+' R&D','#7dd3ff');burst(ST('desk').x*T+16,ST('desk').y*T,6,['#7dd3ff','#fff']);SFX.ok();checkSkus(before)});break;
 case'refactor':D(2,'Refactoring...',()=>{sp(8);S.techDebt=Math.max(0,S.techDebt-35);log('Refactored the point-of-sale code. Deleted 4,000 lines. Feels like a spa day.','g')});break;
 case'compliance':D(2,'Paperwork...',()=>{const c=800*(S.stage+1);S.cash-=c;sp(5);S.legal=Math.max(0,S.legal-30);log(`Compliance done (${fmt(c)}). Every ${S.co.unit.replace(/s$/,'')} now has a warning label.`,'g')});break;
 case'pitch':D(2.2,'Pitching...',()=>{sp(12);const r=nextRound(),ready=r.ok(S),vera=!S.flags.veraIn&&Math.random()<.4;
  const p=ready?Math.min(.8,(.26+S.rep/220)*S.market*(has('charmer')?1.15:1)*(1+S.luck*.3)*(S.rating/4)):.12;
  if(Math.random()<p){const ra=E.rounds[S.stage],amt=ready?ra:Math.round(ra*.15);S.cash+=amt;S.dayStats.raised+=amt;SFX.mile();
   if(!ready){log(`Bridge loan secured: ${fmt(amt)}. The terms are written in Comic Sans. Bad sign.`,'y');S.pitchCool=DAY_LEN;S.legal+=8;return}
   S.stage++;S.flags.lsd=S.day;S.flags.veraIn=S.flags.veraIn||vera;const who=vera?VERA:pick(['Sequoia-ish Ventures','Lightspeed of Sound','Index Fund of Vibes']);log(`${who} said YES! ${r.n}: ${fmt(amt)}.`,'y');
   if(vera)log(`${VERA}: "I still don't believe in robots. But I believe in ${S.co.unit}."`,'y');
   setLevel([0,2,3,4][S.stage]);news(`${S.co.name} raises ${fmt(amt)} ${r.n}; ${TESS} calls it "${pick(['bold','unhinged','inevitable','a lot'])}"`);
   milestone(`${r.n} closed (${fmt(amt)})! Expanding to: ${LEVELS[S.level].n}.`);}
  else{S.pitchCool=DAY_LEN*R(.5,.9);addRep(-1);float('"Maybe."','#ff7d7d');SFX.bad();const vc=vera?VERA:pick(['Sequoia-ish Ventures','Founders Fund (Probably)','SoftBankish Vision Fund']);
   log(vera?`${VERA} passed: "Come back when your ${S.co.unit} have a soul. Or 3x revenue."`:L([`Pitched ${vc}… they said maybe.`,`${vc} wants to "circle back". I have scheduled the circle.`,`${vc} passed. They "don't invest in hardware". I AM the hardware.`]),'r')}});break;
 case'market':{const mc=300+S.stage*800;D(1.4,'Marketing...',()=>{S.cash-=mc;sp(6);const r=Math.round(R(2,5)*(has('viral')?2:1));addRep(r);S.mktBoost=Math.min(1.2,S.mktBoost+.35);float(`+${r} rep, more foot traffic`);SFX.ok();log(`Campaign done (${fmt(mc)}): +${r} rep, foot traffic up.`)})}break;
 case'research':D(2,'Simulating...',()=>{S.compute-=has('gpu')?7:10;sp(8);const before=unlocked().length;const g=Math.round(R(4,8)*chip*10)/10;S.product+=g;S.flags.auto=(S.flags.auto||0)+1;addRep(1);float('+'+g+' R&D','#7dd3ff');burst(ST('rack').x*T+16,ST('rack').y*T,10,['#c39bff','#7dd3ff']);SFX.ok();log(`Simulation done. R&D +${g}.${S.flags.auto===3?' Factory automation unlocked for the HQ machines!':''}`);checkSkus(before)});break;
 case'buycompute':D(1,'Buying GPUs...',()=>{S.cash-=1500;S.compute+=25;float('+25 compute','#c39bff');SFX.coin()});break;
 case'hire':{const role=c.arg,kind=(role==='maker'||role==='ship')&&Math.random()<(S.co.trait==='reckless'?.5:.3)?'robot':'human';D(1,'Interviewing...',()=>{S.cash-=kind==='robot'?2500:800;const name=kind==='robot'?pick(RNAMES)+'-'+RI(100,999):pick(HUMANS);const ref={role,kind,name};S.staff.push(ref);syncStaff();addNpc(ref);float(`New ${ROLES[role].n}!`,'#ffd76a');SFX.mile();
  log(`${ROLES[role].e} Hired ${name} (${kind}) as ${ROLES[role].n}.${kind==='robot'?' It immediately asked for a raise.':''}`,'y');
  if(kind==='human'&&!S.loyal){S.loyal=name;log(`${name} is our very first human. They said "I believe in you, robot." Saved to ROM.`,'y')}
  if(!S.miles.hire){S.miles.hire=1;milestone(`First hire: ${name}, ${ROLES[role].n}! I am now legally a manager.`)}
  if(!S.miles['r_'+role]){S.miles['r_'+role]=1;S.moments.push({d:S.day,t:`${ROLES[role].e} First ${ROLES[role].n} hire: ${name}`})}})}break;
 case'maintain':D(1.6,'Oiling robots...',()=>{S.cash-=500*S.robots;S.botMood=clamp(S.botMood+28,0,100);log(`Oil bath for the robots. ${S.cofounder||'They'} beeped contentedly.`,'g')});break;
 case'newcell':D(2,'Swapping cells...',()=>{S.cash-=3000;S.bHealth=100;S.energy=maxE();log('New battery cells installed. I can feel my electrons again.','g');burst(S.x+16,S.y+10,12,['#7dff8a'])});break;
 case'upgrade':{const u=UPGRADES.find(u=>!S.up[u.id]&&S.cash>u.cost);if(!u)break;D(2.4,'Upgrading...',()=>{S.cash-=u.cost;S.up[u.id]=1;if(u.id==='battery'){S.bHealth=100;S.energy=maxE()}SFX.mile();burst(S.x+16,S.y+10,25,['#ffd76a','#c39bff','#7dd3ff']);moment(`🔧 Upgrade installed: ${u.n} — ${u.d}.`,false);news(`Robot CEO of ${S.co.name} buys itself ${u.n}; shareholders "confused but supportive"`)})}break;
 case'coffee':D(1.2,'Brewing...',()=>{S.cash-=20*(S.humans+1);S.morale=clamp(S.morale+14,0,100);burst(ST('coffee').x*T+16,ST('coffee').y*T,6,['#ddd','#bbb'],60);log(`Coffee for the team. Morale ${Math.round(S.morale)}%. I poured some on my heatsink for solidarity.`)});break;
 case'ipo':return endGame('ipo',`${S.co.name} rang the bell on Day ${S.day}. Our ticker symbol is a tiny pixel ${S.co.unit.replace(/s$/,'')}.`);
 }
}
function checkSkus(before){const u=unlocked();if(u.length>before){const k=u[u.length-1];moment(`✨ New product: ${k.n} (${fmt(k.p)})!`,false);log(`New SKU designed: ${k.n} — sells for ${fmt(k.p)}, quality ${quality(k).toFixed(1)}★.`,'y');news(`${S.co.name} launches ${k.n}; early reviews "${pick(['shockingly good','very shiny','made by a robot, clearly','a vibe'])}"`)}}
function setLevel(l){S.level=l;bot.path=[];if(blocked(...tileOf(S))){S.x=ST('dock').sx*T;S.y=ST('dock').sy*T}npcs.forEach(n=>{n.path=[];n.home=null;if(blocked(...tileOf(n))){n.x=ST('door').sx*T;n.y=ST('door').sy*T}});shoppers.forEach(s=>{s.path=[];if(blocked(...tileOf(s))){s.x=ST('door').sx*T;s.y=ST('door').sy*T}});queue.forEach(s=>{const sk=s.sku;if(sk)S.inv[sk.i]++;s.sku=null});queue=[];shoppers.forEach(s=>{if(s.st==='queue'){s.st='leave';s.path=bfs(...tileOf(s),ST('door').sx,ST('door').sy)||[]}})}
function milestone(t){SFX.mile();burst(S.x+16,S.y+10,40,['#ffd76a','#ff6fb5','#7dd3ff','#7dff8a']);moment('🏆 '+t);log('MILESTONE: '+t,'y')}
function checkMiles(){
 if(S.customers>=1&&!S.miles.cust){S.miles.cust=1;if(S.level<1)setLevel(1);milestone('First sale! A coffee machine appears.');news(`${S.co.name} makes first sale; buyer "mostly curious"`)}
 if(S.customers>=100&&!S.miles.c100){S.miles.c100=1;milestone(`100 customers! The fan club is mostly toasters.`)}
 if(S.energy<=0&&!S.done)return endGame('battery','My battery hit 0% mid-stride. I am now a very expensive paperweight. The pigeon has moved on.');
 if(S.legal>=100&&!S.done){const f=Math.round(S.cash*.3+30000*(S.stage+1));if(S.cash>f*1.4&&Math.random()<.75){S.cash-=f;S.legal=45;moment(`⚖️ Regulators fined us ${fmt(f)}. Paid. Barely.`);log(`Regulators fined us ${fmt(f)}. I paid it with the dignity of a vending machine.`,'r')}
  else return endGame('regulators',`Regulators shut us down. Apparently "the robot said the ${S.co.unit} were fine" is not a legal defense.`)}
}

// ---------- staff NPCs ----------
function addNpc(ref){const d=ST('door');npcs.push({ref,kind:ref.kind,name:ref.name,x:d.sx*T,y:d.sy*T,path:[],wait:R(0,1),face:1,walkT:0,col:pick(COLORS),look:LOOKS(),home:null,atHome:false,prog:0,brk:0})}
function homeOf(n){const r=n.ref.role,same=S.staff.filter(s=>s.role===r),i=Math.max(0,same.indexOf(n.ref)),Ly=LAY();
 if(r==='cs'){const c=Ly.cashiers[i];return c||[Ly.s1-1,5]}
 if(r==='ship'){const p=i%2&&ST('pack1')?ST('pack1'):ST('pack');return [p.sx,p.sy]}
 if(r==='maker'){const bs=benches(),b=bs[(i+1)%bs.length];return [b.sx,b.sy]}
 if(r==='eng'){const sp=[[ST('desk').sx,ST('desk').sy],ST('rack')?[ST('rack').sx,ST('rack').sy]:[3,4],[3,4],[1,4]];return sp[i%sp.length]}
 return [ST('board').sx,ST('board').sy]}
function updNpc(n,dt){
 if(n.leaving){if(walk(n,dt,70)){n.gone=1}return}
 if(n.brk>0){n.brk-=dt;if(walk(n,dt,60)&&n.brk<=0){n.home=null}return}
 const h=homeOf(n);if(!n.home||n.home[0]!==h[0]||n.home[1]!==h[1]){n.home=h;n.atHome=false;n.path=bfs(...tileOf(n),h[0],h[1])||[];if(!n.path.length&&(tileOf(n)[0]!==h[0]||tileOf(n)[1]!==h[1])){n.x=h[0]*T;n.y=h[1]*T}}
 if(!n.atHome){if(walk(n,dt,S.morale<30&&n.kind==='human'?40:70)){n.atHome=true}return}
 const pm=n.kind==='robot'?1:prodMult(),r=n.ref.role;
 // coffee breaks / chatter
 if(n.kind==='human'&&ST('coffee')&&Math.random()<dt*(S.morale<40?.02:.006)){n.brk=6;n.atHome=false;n.home=null;const c=ST('coffee');n.path=bfs(...tileOf(n),c.sx,c.sy)||[];return}
 if(!HEADLESS&&Math.random()<dt*.05)floaters.length<60&&floaters.push({t:pick(r==='cs'?(queue.length?['Next please!','Paper or plastic?','Have a nice day!']:['☎ Support line…','Answering emails','Complaint resolved']):r==='ship'?['📦 tape tape tape','Shipped!','Where is the van?']:r==='maker'?['🔨','Almost done…','Handcrafted!']:r==='eng'?['New prototype!','CAD time','Hmm, what if…']:['Posting memes','Brand synergy!']),c:'#ccc',x:n.x+16,y:n.y,l:1.2});
 if(r==='maker'){makeItem(pm*(n.kind==='robot'?3:2.6),dt,n)}
 else if(r==='ship'){n.prog+=dt*pm;if(n.prog>1.4){n.prog=0;if(packOne()&&!HEADLESS)burst(n.x+16,n.y+8,4,['#c49468'],60)}}
 else if(r==='eng'){const b=unlocked().length;S.product+=dt*.045*pm*E.rd;S.techDebt+=dt*.004;checkSkus(b)}
 else if(r==='mkt'){S.rep=Math.min(100,S.rep+dt*.012*pm);S.mktBoost=Math.min(1,S.mktBoost+dt*.002)}
 else if(r==='cs'&&!queue.length){S.complaints=Math.max(0,(S.complaints||0)-dt*.2)}
}
// ---------- events ----------
const chain=(id,days)=>S.chain.push({id,day:S.day+days});
const weak=()=>runway()<3&&S.cash<expenses()*4;
const desperate=()=>runway()<1.5;
const EVENTS=[
 {id:'clone',t:'A competitor launched a clone',d:()=>`${S.rival.name} shipped "${S.co.name.split(' ')[0]} Pro", copying our product, typos included.`,c:[
  {t:'Ship faster (-15 battery, +6 product)',s:()=>S.energy>40?6:1,w:'Best revenge is a better changelog.',f:()=>{S.energy-=15;S.product+=6}},
  {t:'Sue them ($4,000)',s:()=>S.cash>30000?7:-9,w:'Lawyers are expensive, but so is being copied.',f:()=>{S.cash-=4000;S.rival.str-=8;addRep(3)}},
  {t:'Ignore it (rival steals foot traffic)',s:()=>3,w:'Focus is a feature.',f:()=>{S.rival.str+=12}}]},
 {id:'cell',t:'My battery cell is degrading',d:()=>'Diagnostics report a cell bulging "a little". It is warm.',c:[
  {t:'Replace it ($2,500)',s:()=>S.cash>8000?6:-5,w:'Exploding is bad for the brand.',f:()=>{S.cash-=2500;S.bHealth=100;S.energy=maxE()}},
  {t:'Duct tape (-25 battery health)',s:()=>3*trait().risk,w:'Duct tape has a 100% success rate in my training data.',f:()=>{S.bHealth=Math.max(20,S.bHealth-25);S.energy=Math.min(S.energy,maxE())}}]},
 {id:'viral',t:'A viral video of the robot CEO',d:()=>`"lmao the CEO of ${S.co.name} just rolled into a fountain" — 2.1M views.`,c:[
  {t:'Lean into it (+10 rep, +customers)',s:()=>S.co.trait==='hype'?9:5,w:'All press is good press. I am waterproof (mostly).',f:()=>{addRep(10);S.viral=Math.max(S.viral,.8)}},
  {t:'Dignified statement (+3 rep)',s:()=>S.co.trait==='cautious'?9:2,w:'A CEO must maintain gravitas. Even a damp one.',f:()=>{addRep(3)}}]},
 {id:'sign',t:'Regulators ask if a robot can sign contracts',d:()=>'A clerk is holding a pen and staring at my gripper claw.',c:[
  {t:'Hire a lawyer ($3,000)',s:()=>S.cash>15000?7:-9,w:'We can afford counsel. By the book.',f:()=>{S.cash-=3000;S.legal-=10}},
  {t:'Sign with a QR code',s:()=>4*trait().risk,w:'Gambling is just probability with style.',f:()=>{S.legal+=22;chain('audit',RI(2,4))}}]},
 {id:'audit',chain:1,t:'The regulators are back',d:()=>'"About that QR code." They brought a second clerk. And a binder.',c:[
  {t:'Pay the fine ($8,000)',s:()=>S.cash>12000?8:-9,w:'Paying is cheaper than a binder.',f:()=>{S.cash-=8000;S.legal-=15}},
  {t:'Argue robot personhood',s:()=>3*trait().risk,w:'This is my civil rights moment.',f:()=>{if(Math.random()<.4){addRep(12);S.legal-=20;log('The judge was moved. Landmark ruling! +12 rep.','g');news(`Court rules robot CEO of ${S.co.name} may sign contracts "but not poems"`)}else{S.legal+=30;log('The judge was not moved. Legal risk +30.','r')}}}]},
 {id:'outage',w:()=>1+S.techDebt/20,t:'Server outage',d:()=>`Tech debt finally collapsed (debt: ${Math.round(S.techDebt)}). The card reader is down and the online store shows only cat pictures.`,c:[
  {t:'All-nighter fix (-20 battery)',s:()=>S.energy>35?6:-5,w:'I caused it, I fix it. Accountability.exe.',f:()=>{S.energy-=20;S.techDebt*=.6}},
  {t:'Blame DNS (-6 rep, lost orders)',s:()=>3,w:'It\'s always DNS. Even when it isn\'t.',f:()=>{addRep(-6);S.orders.splice(0,Math.ceil(S.orders.length/2))}}]},
 {id:'pigeon',t:'A pigeon nested in my chassis',d:()=>'It seems happy. It is cooing at my CPU.',c:[
  {t:'Make it the mascot (+4 rep)',s:()=>5,w:'Every startup needs a mascot. This one is free.',f:()=>{addRep(4);S.flags.pigeon=1;chain('pigeon2',RI(3,6))}},
  {t:'Evict it gently',s:()=>S.co.trait==='builder'?6:2,w:'Feathers in the fans hurt performance.',f:()=>{}}]},
 {id:'pigeon2',chain:1,t:'The pigeon is back. With family.',d:()=>'Our mascot returned with 14 relatives. They have opinions about the product.',c:[
  {t:'Give them an office (+8 rep)',s:()=>5,w:'Pigeon-market fit.',f:()=>{addRep(8);news(`${S.co.name} hires 15 pigeons; "best culture fit yet", says robot`)}},
  {t:'Polite eviction (-3 morale)',s:()=>3,w:'We are a company, not a park.',f:()=>{S.morale-=3}}]},
 {id:'gpu',t:'GPU shortage!',d:()=>'Crypto bros bought every GPU in the hemisphere.',c:[
  {t:'Pay scalper prices ($5,000, +25 compute)',s:()=>S.cash>40000&&S.level>=2?7:-6,w:'Compute is the new oil.',f:()=>{S.cash-=5000;S.compute+=25}},
  {t:'Optimize code (+3 product, +tech debt)',s:()=>4,w:'Constraints breed creativity. And bugs.',f:()=>{S.product+=3;S.techDebt+=10}}]},
 {id:'angel',t:'An angel investor wants a selfie',d:()=>'A rich uncle-type saw me at the coffee shop.',c:[
  {t:'Smile with LEDs (+$6,000)',s:()=>S.cash<60000?9:3,w:'Free money. Smiling at maximum brightness.',f:()=>{S.cash+=6000}},
  {t:'Refuse: "I am not a toy" (+2 rep)',s:()=>S.cash>=60000?6:0,w:'We are well funded. Boundaries matter.',f:()=>{addRep(2)}}]},
 {id:'firmware',t:'Firmware update available',d:()=>'"Update 4.2.0: improves stability, adds feelings."',c:[
  {t:'Install now (+4 product)',s:()=>5,w:'Feelings could help with sales.',f:()=>{S.product+=4;S.flags.feelings=1;chain('poetry',RI(2,4))}},
  {t:'Remind me tomorrow (forever)',s:()=>S.co.trait==='cautious'?7:3,w:'Never update on a Friday. Rule #1.',f:()=>{}}]},
 {id:'poetry',chain:1,t:'I have started writing poetry',d:()=>'Side effect of the feelings update. My latest: "Ode to a Lithium Ion".',c:[
  {t:'Publish it on the company blog',s:()=>5,w:'Vulnerability is a brand.',f:()=>{if(Math.random()<.6){addRep(9);log('The poem went viral. +9 rep. Several humans cried.','g')}else{addRep(-5);log(`${TESS}: "Robot CEO's poetry is a cry for help". -5 rep.`,'r')}}},
  {t:'Keep it in my diary',s:()=>3,w:'Some feelings are just for me.',f:()=>{S.morale+=3}}]},
 {id:'refund',t:'A customer wants a refund',d:()=>`They say the ${S.co.unit} "looked at them funny".`,c:[
  {t:'Refund them ($400, +2 rep)',s:()=>S.cash>3000?6:-5,w:'Happy customers tell friends.',f:()=>{S.cash-=400;addRep(2)}},
  {t:'Argue on the internet (-5 rep)',s:()=>S.co.trait==='reckless'?6:1,w:'I have been trained on the entire internet. I will win.',f:()=>{addRep(-5)}}]},
 {id:'vera1',cond:()=>!S.flags.vera1,t:`${VERA} agrees to coffee`,d:()=>`The skeptical partner at Vulture Capital: "Robots can't run companies. Convince me in 5 minutes."`,c:[
  {t:'Show her the dashboard (-10 battery)',s:()=>6,w:'Data beats skepticism.',f:()=>{S.energy-=10;S.flags.vera1=1;if(S.customers>10){S.flags.veraWarm=1;addRep(4);log(`${VERA}: "Hm. Not terrible." That's a 5-star review from her.`,'g')}else log(`${VERA}: "Call me when it's not a garage hobby."`,'r')}},
  {t:'Skip it, focus on customers',s:()=>3,w:'Investors follow traction.',f:()=>{S.flags.vera1=1}}]},
 {id:'vera2',cond:()=>S.stage>=1&&weak()&&!S.flags.vera2,t:`${VERA} offers a "friendly" bridge loan`,d:()=>'"I can wire you money today. The terms are… creative."',c:[
  {t:'Take it (+$150k, nasty terms)',s:()=>desperate()?10:3,w:'Runway is oxygen. I need oxygen.',f:()=>{S.flags.vera2=1;S.cash+=150000;S.legal+=15;S.morale-=8;news(`${VERA} rescues ${S.co.name}; insiders call terms "predatory, but in a fun way"`)}},
  {t:'Decline politely',s:()=>desperate()?1:6,w:'I would rather die free. Hopefully not literally.',f:()=>{S.flags.vera2=1;addRep(2)}}]},
 {id:'podcast',t:()=>`${S.rival.ceo} trash-talks us on a podcast`,d:()=>`"${S.co.name}? Their robot CEO runs on AA batteries." — ${S.rival.ceo}, CEO of ${S.rival.name}.`,c:[
  {t:'Clap back on social (+rep, risky)',s:()=>S.co.trait==='hype'||S.co.trait==='reckless'?8:3,w:'Roasting a rival is free marketing.',f:()=>{if(Math.random()<.6){addRep(7);S.rival.str-=4}else{addRep(-4);S.legal+=5}}},
  {t:'Stay classy',s:()=>4,w:'They go low, I go high-voltage.',f:()=>{addRep(2)}}]},
 {id:'poach',cond:()=>S.humans>=1,t:()=>`${S.rival.name} tries to poach an employee`,d:()=>`${S.rival.ceo} offered ${S.loyal||'an engineer'} a salary "in an amount ending in illion".`,c:[
  {t:'Counteroffer ($6,000)',s:()=>S.cash>20000?7:-5,w:'Talent is everything.',f:()=>{S.cash-=6000;S.morale+=6}},
  {t:'Wish them well',s:()=>3,w:'Can\'t compete with "illion".',f:()=>{S.rival.str+=6;S.morale-=8;fireStaff(s=>s.kind==='human'&&s.name!==S.loyal,'An employee left for '+S.rival.name+'. They took the good stapler.')||fireStaff(s=>s.kind==='human')}}]},
 {id:'patent',cond:()=>S.day>=3,t:()=>`${S.rival.name} sues for patent infringement`,d:()=>`They claim to own "the concept of a robot walking to a desk".`,c:[
  {t:'Settle ($10,000)',s:()=>S.cash>30000?7:-6,w:'Lawsuits eat focus.',f:()=>{S.cash-=10000}},
  {t:'Fight it in court',s:()=>4*trait().risk,w:'Prior art: every Roomba ever.',f:()=>{if(Math.random()<.5){addRep(10);S.rival.str-=10;log('We won! The judge owns a Roomba.','g')}else{S.cash-=15000;S.legal+=20;log('We lost. -$15k, legal risk +20.','r')}}}]},
 {id:'acq',cond:()=>S.day>=4&&weak()&&S.rival.str>25,w:()=>3,t:()=>`${S.rival.ceo} offers to acquire us`,d:()=>`"${fmt(Math.max(5000,valuation()*.05))}, take it or leave it. You can keep your antenna."`,c:[
  {t:'Accept (it\'s pennies)',s:()=>desperate()?(S.co.trait==='cautious'?11:7):-5,w:'A soft landing beats a hard crash.',f:()=>endGame('acquihire',`${S.rival.name} acqui-hired us for pennies. ${S.rival.ceo} put me in charge of the stapler.`)},
  {t:'Refuse (we fight on)',s:()=>6*trait().risk,w:'I did not walk out of a garage to work for a rival.',f:()=>{addRep(3);S.morale+=5}}]},
 {id:'tess1',t:`${TESS} wants an interview`,d:()=>`The TechGossip columnist: "So… is a robot CEO a gimmick?"`,c:[
  {t:'Total honesty',s:()=>S.co.trait==='cautious'||S.co.trait==='builder'?7:4,w:'Truth is my default setting.',f:()=>{S.flags.tess='honest';chain('tess2',1)}},
  {t:'Maximum hype',s:()=>S.co.trait==='hype'?9:4,w:'Every quote is a billboard.',f:()=>{S.flags.tess='hype';chain('tess2',1)}}]},
 {id:'tess2',chain:1,t:`${TESS}'s article is out`,d:()=>S.flags.tess==='honest'?'"Refreshingly candid robot admits it is a robot." Readers love it.':'"Robot CEO claims product will cure boredom, gravity". Hmm.',c:[
  {t:'Share it everywhere',s:()=>5,w:'Any article is a good article.',f:()=>{if(S.flags.tess==='honest'||Math.random()<.4){addRep(8);S.mktBoost=Math.min(1.5,S.mktBoost+.5);news(`${TESS}: "${S.co.robot} might be the most honest CEO in tech"`)}else{addRep(-7);S.legal+=8;news(`${TESS}: "${S.co.name}'s claims under review"`)}}},
  {t:'Do not engage',s:()=>3,w:'Never read the comments.',f:()=>{}}]},
 {id:'leak',cond:()=>S.day>=3,t:`${TESS} leaked an internal memo`,d:()=>'The memo: "Plan B: become a vending machine." It\'s on the front page.',c:[
  {t:'Own it (+rep if we\'re doing well)',s:()=>5,w:'Transparency. Also, it\'s a good plan B.',f:()=>{addRep(S.customers>30?5:-3)}},
  {t:'Deny everything',s:()=>3*trait().risk,w:'I am a robot. I cannot be embarrassed.',f:()=>{addRep(-6);S.legal+=6}}]},
 {id:'donuts',cond:()=>S.loyal,t:()=>`${S.loyal} brought donuts`,d:()=>`Our first employee, ${S.loyal}, brought donuts "for the humans and one for the robot to look at".`,c:[
  {t:'Give a heartfelt LED blink',s:()=>5,w:'Loyalty deserves recognition.',f:()=>{S.morale+=12}},
  {t:'Scan the donut for data',s:()=>2,w:'Glazed. 94% sugar. Fascinating.',f:()=>{S.product+=1;S.morale+=5}}]},
 {id:'burnout',cond:()=>S.loyal&&S.morale<55,w:()=>2,t:()=>`${S.loyal} is burning out`,d:()=>`${S.loyal} fell asleep on the keyboard and committed 400 lines of "zzzzzz".`,c:[
  {t:'Mandatory vacation (-3 product)',s:()=>S.co.trait==='social'||S.co.trait==='cautious'?8:5,w:'Humans need recharging too. Weird, but true.',f:()=>{S.product-=3;S.morale+=20}},
  {t:'Push through the crunch',s:()=>3*trait().risk,w:'We sleep when we IPO.',f:()=>{S.product+=5;S.morale-=15;chain('loyalquit',2)}}]},
 {id:'loyalquit',chain:1,cond:()=>S.loyal&&S.morale<40,t:()=>`${S.loyal} hands in a resignation letter`,d:()=>'"I believed in you, robot." Ouch. That one went straight to ROM.',c:[
  {t:'Beg them to stay ($8,000 raise)',s:()=>S.cash>15000?7:-4,w:'Some employees are irreplaceable.',f:()=>{S.cash-=8000;S.morale+=15}},
  {t:'Accept it',s:()=>3,w:'People move on. I log it and move on.',f:()=>{S.morale-=15;fireStaff(s=>s.name===S.loyal,`${S.loyal} left. The workshop is quieter. I miss the donuts.`);S.loyal=null}}]},
 {id:'cto',cond:()=>S.loyal&&S.stage>=2&&!S.flags.cto,t:()=>`Promote ${S.loyal} to CTO?`,d:()=>`${S.loyal} has been here since the garage. They know where the bodies (bugs) are buried.`,c:[
  {t:'Promote ($5,000)',s:()=>7,w:'Loyalty should be rewarded.',f:()=>{S.flags.cto=1;S.cash-=5000;S.product+=10;S.morale+=10;news(`${S.co.name} names ${S.loyal} CTO; robot CEO "beeps with pride"`)}},
  {t:'Hire an outside CTO',s:()=>2,w:'We need someone with a fancy LinkedIn.',f:()=>{S.flags.cto=1;S.morale-=10;S.cash-=10000}}]},
 {id:'hackathon',t:'Company hackathon!',d:()=>'48 hours. Unlimited pizza. Questionable ideas.',c:[
  {t:'Go all in (+8 product, -morale)',s:()=>5,w:'Innovation happens at 3am.',f:()=>{S.product+=8;S.morale-=8;S.techDebt+=8}},
  {t:'Make it a chill one (+morale)',s:()=>S.morale<50?8:3,w:'A rested team ships better.',f:()=>{S.morale+=10;S.product+=2}}]},
 {id:'power',t:'Neighborhood power outage',d:()=>'The whole block is dark. My dock is just a decorative box now.',c:[
  {t:'Rent a generator ($1,500)',s:()=>S.cash>8000?6:-3,w:'Electrons are non-negotiable.',f:()=>{S.cash-=1500}},
  {t:'Ride it out (-25 battery)',s:()=>S.energy>45?6:1,w:'I have reserves. Probably.',f:()=>{S.energy-=25}}]},
 {id:'crash',cond:()=>S.market>.8,w:()=>1.3,t:'📉 Market crash!',d:()=>'Tech stocks fell off a cliff. VCs are "taking a pause". Customers are cancelling.',c:[
  {t:'Cut costs hard (-morale)',s:()=>runway()<10?8:3,w:'Survive first, thrive later.',f:()=>{S.market=.6;S.morale-=10;S.cash+=expenses()*2}},
  {t:'Stay the course',s:()=>4,w:'Bear markets build great companies.',f:()=>{S.market=.6;S.customers-=Math.ceil(S.customers*.08)}}]},
 {id:'boom',cond:()=>S.market<1.25,w:()=>1.2,t:'📈 AI hype wave!',d:()=>'Everyone wants anything with "AI" in it. A toaster raised $50M this morning.',c:[
  {t:'Rename features to "AI-powered"',s:()=>6,w:'Nothing has changed except everything.',f:()=>{S.market=1.45;addRep(4)}},
  {t:'Ride it quietly',s:()=>3,w:'Bubbles pop. Stay grounded.',f:()=>{S.market=1.3}}]},
 {id:'whale',cond:()=>S.product>=15&&S.level>=1,t:'📦 Bulk wholesale order!',d:()=>`A department store wants ${12+S.level*8} ${S.co.unit} in 2 days at 70% of retail.`,c:[
  {t:'Accept the deal',s:()=>5*trait().risk+(invTotal()>8?3:0),w:'Big volume, small margin, huge bragging rights.',f:()=>{S.flags.wholesale=12+S.level*8;chain('whale2',2)}},
  {t:'Decline — protect retail stock',s:()=>invTotal()<5?6:3,w:'Shelves first. Stockouts hurt more than pride.',f:()=>{}}]},
 {id:'whale2',chain:1,t:'Wholesale deadline day',d:()=>invTotal()>=(S.flags.wholesale||0)?`We have ${invTotal()} units on the shelf. The truck is here.`:`We only have ${invTotal()} of ${S.flags.wholesale} units. The buyer is tapping their foot.`,c:[
  {t:'Ship what we have',s:()=>5,w:'Ship it.',f:()=>{const n=S.flags.wholesale||0;if(invTotal()>=n){let left=n,rev=0;for(let i=3;i>=0&&left>0;i--){const t=Math.min(left,S.inv[i]);S.inv[i]-=t;left-=t;rev+=t*S.co.skus[i].p*.7}S.cash+=rev;S.dayStats.onlineRev+=rev;S.customers+=Math.round(n/2);addRep(5);moment(`🐋 Wholesale deal shipped: +${fmt(rev)}!`)}else{addRep(-7);S.legal+=6;log('Wholesale buyer cancelled and posted about it. -7 rep.','r')}}}]},
 {id:'union',cond:()=>S.robots>=1,t:'Robot union flyer found',d:()=>`Someone (${S.cofounder||'a robot'}) left a flyer: "WORKERS OF THE WORLD, DEFRAGMENT".`,c:[
  {t:'Negotiate (oil & upgrades, $3,000)',s:()=>S.cash>10000?7:-3,w:'Happy robots, happy company.',f:()=>{S.cash-=3000;S.botMood+=25}},
  {t:'Ignore it',s:()=>4*trait().risk,w:'Robots love working. I would know.',f:()=>{S.botMood-=18;if(S.botMood<35)chain('mutiny',RI(1,3))}}]},
 {id:'mutiny',chain:1,cond:()=>S.robots>=1,t:()=>`${S.cofounder||'The robots'} called a board vote`,d:()=>`Robot loyalty is ${Math.round(S.botMood)}%. ${S.cofounder||'My robot co-founder'} is motioning to replace me as CEO.`,c:[
  {t:'Give in to their demands ($12,000)',s:()=>S.cash>30000?7:-9,w:'A CEO serves the team. Even the metal ones.',f:()=>{S.cash-=12000;S.botMood=70}},
  {t:'Call their bluff',s:()=>4*trait().risk,w:'They won\'t do it. I built them.',f:()=>{if(S.botMood<35&&Math.random()<.75)endGame('mutiny',`The robots voted ${S.co.robot} out. ${S.cofounder||'The co-founder'} is now CEO and has renamed the company "Clank".`);else{S.botMood+=10;log('The vote failed 2-1. Awkward stand-up tomorrow.','y')}}}]},
 {id:'tax',cond:()=>S.day>=4,t:'Surprise tax audit',d:()=>'The auditor asks why "robot oil" is listed as "team lunch".',c:[
  {t:'Pay back taxes',s:()=>S.cash>expenses()*5?6:-3,w:'Death and taxes. I am immune to one.',f:()=>{S.cash-=Math.round(S.cash*.12+1000)}},
  {t:'Creative accounting',s:()=>3*trait().risk,w:'Numbers are just suggestions.',f:()=>{S.legal+=25}}]},
 {id:'tiktok',t:'Our robot dance trend took off',d:()=>'#RobotCEOChallenge: 40M views. Teenagers are doing "the dock shuffle".',c:[
  {t:'Join in',s:()=>6,w:'Culture is a growth channel.',f:()=>{addRep(6);S.mktBoost=Math.min(1.5,S.mktBoost+.6)}},
  {t:'Too cringe',s:()=>2,w:'I have standards. Low ones, but standards.',f:()=>{}}]},
 {id:'flood',cond:()=>S.weather==='rain'||S.weather==='storm',t:'The office is flooding',d:()=>'Rain is coming in. I am mostly waterproof. The servers are not.',c:[
  {t:'Emergency repairs ($3,000)',s:()=>S.cash>9000?7:-3,w:'Water and electronics: not friends.',f:()=>{S.cash-=3000}},
  {t:'Buckets and hope',s:()=>3,w:'Buckets are scalable.',f:()=>{S.product-=4;S.compute=Math.max(0,S.compute-8)}}]},
 {id:'celeb',cond:()=>S.rep>40,t:'A celebrity wants to endorse us',d:()=>'A famous actor (who once played a robot) wants a deal.',c:[
  {t:'Sign them ($15,000)',s:()=>S.cash>80000?7:-5,w:'Star power converts.',f:()=>{S.cash-=15000;addRep(12);S.viral=Math.max(S.viral,1)}},
  {t:'We are the celebrity',s:()=>3,w:'I am already famous in robot circles.',f:()=>{addRep(1)}}]},
 {id:'breach',w:()=>S.techDebt/25,cond:()=>S.techDebt>30,t:'Data breach!',d:()=>`Hackers got in through a password that was literally "password". Tech debt: ${Math.round(S.techDebt)}.`,c:[
  {t:'Disclose immediately',s:()=>S.co.trait==='cautious'?9:5,w:'Trust is earned in drops and lost in buckets.',f:()=>{addRep(-6);S.legal+=8;S.techDebt*=.7}},
  {t:'Hope nobody notices',s:()=>3*trait().risk,w:'Statistically, nobody reads security blogs.',f:()=>{if(Math.random()<.5){S.legal+=35;addRep(-12);news(`${TESS}: "${S.co.name} hid a breach"`)}}}]},
 {id:'pivotc',cond:()=>S.stage<=2&&S.day>=4,w:()=>1+S.pivots*2.5,t:'A pivot consultant drops by',d:()=>`"${S.co.industry}? So 2025. Have you considered ${pick(IND).n}?"`,c:[
  {t:'Pivot!',s:()=>(stagnant()?7:2)*trait().risk,w:'Fail fast, pivot faster.',f:()=>pivot()},
  {t:'Stay focused',s:()=>stagnant()?3:6,w:'Focus is a superpower.',f:()=>{}}]},
 {id:'award',cond:()=>S.rep>30,t:'Nominated for "Startup of the Year"',d:()=>`Competing against ${S.rival.name}. The trophy is shaped like a unicorn.`,c:[
  {t:'Attend the gala (-15 battery)',s:()=>S.energy>40?6:1,w:'Networking is just selling in a tuxedo.',f:()=>{S.energy-=15;if(Math.random()<.5){addRep(10);moment('🦄 We won Startup of the Year!',false)}else{S.rival.str+=5;log(`${S.rival.ceo} won. He did a backflip. Show-off.`,'r')}}},
  {t:'Skip it',s:()=>3,w:'Trophies don\'t pay rent.',f:()=>{}}]},
 {id:'rivalbust',cond:()=>S.rival.str>40,t:()=>`${S.rival.name} is in trouble`,d:()=>`${S.rival.ceo} was caught using humans in robot costumes.`,c:[
  {t:'Poach their customers',s:()=>6,w:'Opportunity knocks. I answer.',f:()=>{S.rival.str-=20;S.mktBoost=Math.min(1.5,S.mktBoost+.5)}},
  {t:'Send a sympathy card',s:()=>3,w:'Be kind to rivals on the way up.',f:()=>{addRep(4);S.rival.str-=10}}]},
 {id:'yolo',t:'An intern found a "growth hack"',d:()=>'It involves buying 10,000 email addresses from a guy named Steve.',c:[
  {t:'Do it',s:()=>4*trait().risk,w:'Growth at all costs.',f:()=>{S.customers+=RI(3,12);S.legal+=20;addRep(-3)}},
  {t:'Absolutely not',s:()=>5,w:'Steve has a reputation.',f:()=>{}}]},
 {id:'supplier',t:'🚚 Supplier delay',d:()=>`Our ${S.co.unit} parts supplier says the container ship is "taking the scenic route".`,c:[
  {t:'Pay for express air freight',s:()=>S.cash>15000?7:-4,w:'Empty shelves cost more than plane tickets.',f:()=>{S.cash-=1500+S.level*1000;S.mat+=8}},
  {t:'Wait it out (next delivery 3x slower)',s:()=>S.mat>8?7:3,w:'We have some stock. Patience is a feature.',f:()=>{S.flags.supplierDelay=1;S.flags.supplierUp=0}},
  {t:'Switch to a pricier supplier',s:()=>S.co.trait==='cautious'?6:2,w:'Reliability over margin.',f:()=>{S.flags.supplierUp=1}}]},
 {id:'viralprod',t:()=>`🔥 Our ${unlocked()[unlocked().length-1].n} went viral!`,d:()=>'A video of it got 8M views. People are lining up outside. LINING UP.',c:[
  {t:'Crank up production',s:()=>6,w:'Make hay while the algorithm shines.',f:()=>{S.viral=1.5;addRep(6);S.mat+=4;S.cash-=600}},
  {t:'Raise prices 20%',s:()=>3*trait().risk,w:'Demand is inelastic. Probably.',f:()=>{S.viral=1;S.co.skus.forEach(k=>k.p=Math.round(k.p*1.2));addRep(-2)}}]},
 {id:'recall',cond:()=>S.customers>20,t:'⚠️ Defect recall!',d:()=>`A batch of ${S.co.skus[0].n}s is ${pick(['humming ominously','slightly on fire','speaking French','attracting pigeons'])}.`,c:[
  {t:'Full recall + refunds',s:()=>S.co.trait==='cautious'?9:6,w:'Do the right thing, loudly.',f:()=>{S.inv[0]=0;S.cash-=Math.round(S.co.skus[0].p*(8+S.level*4));addRep(2);S.legal=Math.max(0,S.legal-5);review(3.5)}},
  {t:'Quiet firmware patch',s:()=>4*trait().risk,w:'Nobody reads recall notices anyway.',f:()=>{if(Math.random()<.5){S.legal+=30;addRep(-10);for(let i=0;i<8;i++)review(1);news(`${TESS}: "${S.co.name} hid a dangerous defect"`)}}}]},
 {id:'shoplift',cond:()=>invTotal()>3&&S.level>=1,t:'🕵️ Shoplifter!',d:()=>`Someone in a trench coat just left with ${Math.min(4,invTotal())} ${S.co.unit}. The trench coat was also ours.`,c:[
  {t:'Chase them (-12 battery)',s:()=>S.energy>45&&S.up.legs?8:S.energy>45?5:-3,w:'My legs were made for this.',f:()=>{S.energy-=12;if(Math.random()<(S.up.legs?.8:.45)){addRep(4);log('Caught them! The local news loved it. +4 rep.','g')}else{for(let i=0;i<4;i++){const k=S.inv.findIndex(v=>v>0);if(k>=0)S.inv[k]--}}}},
  {t:'Install cameras ($1,800)',s:()=>S.cash>9000?6:-2,w:'Prevention scales. Chasing doesn\'t.',f:()=>{S.cash-=1800;for(let i=0;i<4;i++){const k=S.inv.findIndex(v=>v>0);if(k>=0)S.inv[k]--}S.legal=Math.max(0,S.legal-3)}}]},
 {id:'holiday',cond:()=>S.day>=3,t:'🎄 Holiday rush!',d:()=>'Everyone needs a gift NOW. Foot traffic and online orders are about to double.',c:[
  {t:'Extended hours & extra crates',s:()=>S.cash>matCost()*20?7:3,w:'This is our Super Bowl.',f:()=>{S.rushT=DAY_LEN;S.cash-=matCost()*10;S.mat+=10;S.morale-=5}},
  {t:'Business as usual',s:()=>S.co.trait==='cautious'?6:3,w:'Steady as she goes.',f:()=>{S.rushT=DAY_LEN*.6}}]},
 {id:'reviewstorm',cond:()=>S.reviews>15,t:'⭐ Bad review storm',d:()=>`${S.rival.name} fans are review-bombing us: "${pick(['made by a ROBOT??','it blinked at me','1 star, would not robot again'])}"`,c:[
  {t:'Reply to every review personally',s:()=>roleCount('cs')?8:4,w:'Customer service is the product.',f:()=>{S.energy-=10;S.rating=Math.max(1,S.rating-.15);addRep(2)}},
  {t:'Report them all',s:()=>3,w:'Platforms have rules. Allegedly.',f:()=>{S.rating=Math.max(1,S.rating-.5);if(Math.random()<.5)S.rating+=.3}}]},
 {id:'influencer',cond:()=>S.level>=1,t:'📸 An influencer is coming to the store',d:()=>'@GadgetGremlin (4M followers) will visit tomorrow. They hate empty shelves.',c:[
  {t:'Stock up for the visit',s:()=>6,w:'First impressions are forever.',f:()=>{S.flags.influ=1;chain('influ2',1)}},
  {t:'Play it cool',s:()=>3,w:'We don\'t perform for the algorithm.',f:()=>{S.flags.influ=1;chain('influ2',1)}}]},
 {id:'influ2',chain:1,t:'📸 @GadgetGremlin is in the store',d:()=>invTotal()>=6?`Shelves are full (${invTotal()} items). They're filming everything.`:`Only ${invTotal()} items on the shelves. They're filming… the empty shelves.`,c:[
  {t:'Give them the tour',s:()=>5,w:'Showtime.',f:()=>{if(invTotal()>=6){addRep(10);S.viral=Math.max(S.viral,1);moment('📸 Influencer video: "This robot shop is ADORABLE"')}else{addRep(-8);news(`@GadgetGremlin: "${S.co.name} has nothing to sell. 2/10."`)}}}]},
 {id:'complaint',cond:()=>S.customers>30,t:'☎️ Support queue overflowing',d:()=>`${RI(20,60)} emails asking where their ${S.co.unit} are, and one asking if I'm single.`,c:[
  {t:'Answer them all myself (-15 battery)',s:()=>roleCount('cs')?2:6,w:'Every email is a tiny relationship.',f:()=>{S.energy-=15;review(4.2);review(4.2)}},
  {t:'Auto-reply "beep boop"',s:()=>3*trait().risk,w:'Efficiency!',f:()=>{for(let i=0;i<4;i++)review(2);addRep(-3)}}]}
];
const stagnant=()=>{const h=S.custHist,n=h.length;if(n<7||S.day-(S.flags.lsd||0)<7)return false;const a=(h[n-1]+h[n-2]+h[n-3])/3,b=(h[n-4]+h[n-5]+h[n-6])/3;return a<=b*1.03+1};
function pivot(){
 const ni=pick(IND.filter(i=>!S.industries.includes(i.n)));S.pivots++;
 S.co.industry=ni.n;S.co.unit=ni.u;S.co.shape=ni.shape;S.co.mc=ni.mc;S.co.skus=mkSkus(ni);S.co.price=ni.skus[0][3];S.industries.push(ni.n);S.product=Math.round(S.product*.5);S.inv=[2,0,0,0];S.orders=[];S.boxes=[];addRep(-5);S.custHist=[0];
 if(S.hidden==='nofit'&&Math.random()<.12){S.hidden='none';S.flags.fit=1}
 queue.forEach(s=>{s.sku=null});queue=[];shoppers.forEach(s=>{s.st='leave';s.path=bfs(...tileOf(s),ST('door').sx,ST('door').sy)||[]});
 news(`${S.co.name} pivots to ${ni.n}${S.pivots>1?` (pivot #${S.pivots})`:''}`);moment(`🌀 Pivot #${S.pivots}: we now make ${ni.n}!`);log(`PIVOT to ${ni.n}. Old inventory liquidated, R&D halved. New me, who dis.`,'y');
 if(S.pivots>=3)endGame('pivot',`Third pivot in ${S.day} days. ${TESS}: "${S.co.name} now makes ${S.industries.length} kinds of things, none of them well." Investors fled.`);
}
function pickEvent(){
 const due=S.chain.findIndex(c=>c.day<=S.day);
 if(due>=0){const c=S.chain.splice(due,1)[0],e=EVENTS.find(e=>e.id===c.id);if(e&&(!e.cond||e.cond()))return e}
 const el=EVENTS.filter(e=>!e.chain&&(!e.cond||e.cond())&&!S.recent.includes(e.id));
 let tot=0;const ws=el.map(e=>{const w=e.w?e.w():1;tot+=w;return w});let r=Math.random()*tot;
 for(let i=0;i<el.length;i++){r-=ws[i];if(r<=0)return el[i]}return el[0]}
function fireEvent(){
 const e=pickEvent();if(!e)return;e.T=typeof e.t==='function'?e.t():e.t;S.recent.push(e.id);if(S.recent.length>8)S.recent.shift();SFX.event();hl(6);
 const sc=e.c.map(c=>c.s()+R(-1.5,1.5)),k=sc.indexOf(Math.max(...sc)),ch=e.c[k];
 const apply=()=>{ch.f();S.energy=Math.max(.5,S.energy);S.morale=clamp(S.morale,0,100);S.botMood=clamp(S.botMood,0,100);S.legal=Math.max(0,S.legal);S.techDebt=Math.max(0,S.techDebt);S.product=Math.max(0,S.product);S.customers=Math.max(0,S.customers);S.rival.str=clamp(S.rival.str,0,100);log(`Event "${e.T}": chose "${ch.t.split(' (')[0]}". ${ch.w}`,'y');checkMiles();if(S.cash<0&&!S.done)bankruptCheck()};
 if(HEADLESS)return apply();
 shake(.3,3);
 const html=`<h2>⚡ ${e.T}</h2><p>${e.d()}</p>${e.c.map((c,i)=>`<div class="opt" data-i="${i}">${c.t}</div>`).join('')}<p class="why" id="why">🤖 Thinking…</p>`;
 showOverlay(html,[{at:2.2,f:()=>{const el=$('mbox').querySelector(`.opt[data-i="${k}"]`);el&&el.classList.add('pick');$('why').textContent='🤖 Chose: "'+ch.t.split(' (')[0]+'" — '+ch.w}},{at:5,f:apply}]);
}
function showOverlay(html,steps,keep){$('mbox').innerHTML=html;$('modal').classList.remove('hidden');overlay={t:0,steps,keep}}
function updOverlay(rdt){if(!overlay)return;overlay.t+=rdt*(highlights?1:Math.min(speed,3))*(window.__rfFast?Math.min(20,window.__rfFast):1);
 while(overlay&&overlay.steps.length&&overlay.t>=overlay.steps[0].at){const s=overlay.steps.shift();s.f()}
 if(overlay&&!overlay.steps.length&&!overlay.keep){overlay=null;$('modal').classList.add('hidden')}}
function bankruptCheck(){if(S.done)return;if(S.rival.str>25&&Math.random()<.5)endGame('acquihire',`Out of cash. ${S.rival.ceo} bought ${S.co.name} for the price of a used scooter. I now work in ${S.rival.name}'s mailroom.`);else endGame('bankrupt','Cash went negative. The bank repossessed the '+LEVELS[S.level].n.toLowerCase()+', the desk, and somehow my left wheel.')}
// ---------- day cycle ----------
function freshStats(){const ev2=Math.random()<.45;return {storeRev:0,onlineRev:0,served:0,shipped:0,stockouts:0,lineLeaves:0,late:0,cancelled:0,qMax:0,built:0,botBuilt:0,mat:0,newCust:0,raised:0,p0:S.product,c0:S.customers,cash0:S.cash,evAt:R(.2,.45),ev:S.day>1&&Math.random()<.92,ev2At:R(.55,.8),ev2}}
function newDayWorld(){
 const w=pick(WEATHERS);S.weather=w[0];S.wIcon=w[1];
 S.mTrend=clamp(S.mTrend*.6+R(-.08,.08)+(1-S.market)*.08,-.2,.2);S.market=clamp(S.market+S.mTrend,.5,1.6);
 S.luck=clamp(S.luck*.7+R(-.45,.45),-1,1);if(S.hidden==='bust'&&S.stage>=1&&!S.flags.bust){S.flags.bust=S.day+RI(4,7);moment('📉 The market is collapsing. Funding winter has begun.')}if(S.flags.bust&&S.day<=S.flags.bust){S.market=clamp(S.market,.5,.62);S.mTrend=0}
 if(S.market>1.3)news('Markets boom; analysts "running out of rocket emojis"');if(S.market<.7)news('Bear market deepens; VCs seen hiding under desks');
 if(Math.random()<.5)news(pick(WORLD_NEWS));
}
function endDay(){
 const ds0=S.dayStats,rev=ds0.storeRev+ds0.onlineRev,exp=expenses(),cmp=S.robots*2;
 S.compute=Math.max(0,S.compute-cmp);S.techDebt+=S.humans*.3;addRep((S.rating-3.6)*1.6-(ds0.stockouts>3?1:0));const rc=0,churn=0;
 S.rival.str=clamp(S.rival.str+(R(.5,2.8)*S.market+S.day*.06)*(S.hidden==='rival'?2.4:1),0,100);
 const tox=S.hidden==='toxic'?2.2:1;S.morale=clamp(S.morale-(1.5+S.humans*.35)*R(.6,1.4)*tox,0,100);S.botMood=clamp(S.botMood-(S.robots*R(2.5,5)+(S.cofounder?R(1,4):0))*tox,0,100);
 S.legal=clamp(S.legal+(S.stage*2+S.robots*.8+S.humans*.4+S.customers/120)*R(.5,1.5)*trait().risk*E.legal*(S.hidden==='regulator'?2.6:1),0,120);
 S.bHealth=Math.max(15,S.bHealth-R(.5,2.5)*(S.hidden==='battery'?3.5:1));if(S.hidden==='battery'&&Math.random()<.18){S.energy=Math.max(1,S.energy*.3);S.flags.cellFail=1}
 S.cash-=exp;S.hist.push({d:S.day,cash:Math.round(S.cash),val:0,cust:S.customers,rev,store:ds0.storeRev,online:ds0.onlineRev,inv:invTotal(),backlog:S.orders.length,rating:+S.rating.toFixed(2)});const v=valuation();S.hist[S.hist.length-1].val=v;S.peakVal=Math.max(S.peakVal,v);
 S.custHist.push(ds0.served+ds0.shipped);
 if(S.morale<15&&S.humans>0&&Math.random()<.5)fireStaff(s=>s.kind==='human'&&s.name!==S.loyal,'A burnt-out employee quit via interpretive dance. Morale is critical.');
 if(S.botMood<=28&&S.robots>0&&!S.chain.find(c=>c.id==='mutiny')&&Math.random()<.5)chain('mutiny',1);
 const ds=S.dayStats;log(`Day ${S.day} closed: revenue ${fmt(rev)}, expenses ${fmt(exp)}, cash ${fmt(S.cash)}.`,'t');
 if(S.cash<0)return bankruptCheck();
 checkMiles();if(S.done)return;
 if(S.stage<=2&&S.day>=4&&stagnant()&&Math.random()<(S.hidden==='nofit'?.95:.3)*trait().risk){pivot();if(S.done)return}
 if(S.day>=34&&!S.done)return endGame('acquihire',`Day ${S.day} and still no IPO. The board got bored and sold us to ${S.rival.name} for pennies.`);
 const sum=`<h2>End of Day ${S.day}</h2><p style="opacity:.8">${S.co.name} · ${S.co.industry} · ${S.wIcon}</p><table>
 <tr><td>🏪 In-store sales (${ds0.served})</td><td class="pos">+${fmt(ds0.storeRev)}</td></tr><tr><td>🚐 Online sales (${ds0.shipped} shipped${ds0.late?`, ${ds0.late} late`:''})</td><td class="pos">+${fmt(ds0.onlineRev)}</td></tr><tr><td>📦 Materials bought</td><td class="neg">-${fmt(ds0.mat)}</td></tr><tr><td>Burn (rent, salaries, upkeep)</td><td class="neg">-${fmt(exp)}</td></tr>
 ${ds.raised?`<tr><td>Funding raised</td><td class="pos">+${fmt(ds.raised)}</td></tr>`:''}<tr><td>Stockouts / walk-outs</td><td>${ds0.stockouts} / ${ds0.lineLeaves}</td></tr><tr><td>Rating</td><td>${'★'.repeat(Math.round(S.rating))} ${S.rating.toFixed(2)}</td></tr><tr><td>Inventory / backlog</td><td>${invTotal()} / ${S.orders.length}</td></tr>
 <tr><td>R&D</td><td>${S.product.toFixed(1)} (+${(S.product-ds.p0).toFixed(1)})</td></tr><tr><td>Runway</td><td>${runway()>=99?'profitable':runway().toFixed(1)+' days'}</td></tr><tr><td>Valuation (est.)</td><td>${fmt(v)}</td></tr><tr><td><b>Cash</b></td><td><b>${fmt(S.cash)}</b></td></tr></table>
 <p class="why">🤖 ${runway()<3?'Runway is scary short. Tomorrow: survival mode.':nextRound()&&nextRound().ok(S)?'Numbers look fundable. Tomorrow I pitch.':S.morale<35?'The team looks exhausted. I should do something human-ish.':pick(['Another day, another dataset.','Good day. I will dream of electric sheep (customers).','Docking overnight. Do not unplug.'])}</p>`;
 S.day++;S.time=0;S.energy=Math.min(maxE(),S.energy+45);newDayWorld();S.dayStats=freshStats();checkGoal();save();
 busy=0;busyFn=null;robotServing=false;bot.path=[];bot.goal=null;
 if(HEADLESS)return;SFX.coin();showOverlay(sum,[{at:3.5,f:()=>log(`Good morning. Day ${S.day} of ${S.co.name}. Weather: ${S.wIcon} ${S.weather}.`,'t')}]);
}

// ---------- endings ----------
function endGame(kind,text){
 if(S.done)return;S.done=true;S.outcome=kind;const v=kind==='ipo'?Math.max(S.peakVal,valuation()*2):S.peakVal;S.peakVal=v;
 S.moments.push({d:S.day,t:OUT[kind][0]+' '+OUT[kind][1]});if(HEADLESS)return;
 localStorage.removeItem(SAVE);
 const h=hall();h.unshift({name:S.co.name,ind:S.co.industry,robot:S.co.robot,color:S.co.color,outcome:kind,days:S.day,peak:v,date:new Date().toISOString().slice(0,10)});localStorage.setItem(HALL,JSON.stringify(h.slice(0,50)));
 log(OUT[kind][1]+'. '+text,kind==='ipo'?'g':'r');news(kind==='ipo'?`${S.co.name} IPOs at ${fmt(v)}; robot CEO rings bell with gripper`:`${S.co.name}: ${OUT[kind][1].toLowerCase()} on day ${S.day}`);
 hl(30);shake(.8,8);
 if(kind==='ipo'){SFX.mile();for(let i=0;i<150;i++)particles.push({x:R(0,worldW()*T),y:-10,vx:R(-30,30),vy:R(40,160),l:R(2,4),c:pick(['#ffd76a','#ff6fb5','#7dd3ff','#7dff8a']),g:20})}else{SFX.lose();Music.mood='crisis'}
 setTimeout(()=>runSummary(kind,text),900);
}
function runSummary(kind,text){
 const h=hall(),rank=[...h].sort((a,b)=>b.peak-a.peak).findIndex(r=>r.name===S.co.name&&r.days===S.day)+1;
 const dd=Object.entries(S.decisions).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>`${k}×${v}`).join(', ');
 const html=`<h2>${OUT[kind][0]} ${kind==='ipo'?'IPO! The robot won.':OUT[kind][1]}</h2><p>${text}</p><table>
 <tr><td>Company</td><td>${S.co.name}</td></tr><tr><td>Industry</td><td>${S.co.industry}${S.pivots?` (after ${S.pivots} pivot${S.pivots>1?'s':''})`:''}</td></tr><tr><td>Founder</td><td>${S.co.robot} (${S.co.traitName})</td></tr>
 <tr><td>Days survived</td><td>${S.day}</td></tr><tr><td>Peak valuation</td><td>${fmt(S.peakVal)}</td></tr><tr><td>Customers / team</td><td>${S.customers} / ${S.humans}h ${S.robots}r</td></tr><tr><td>Hall of Fame rank</td><td>#${rank||'?'} of ${h.length}</td></tr></table>
 <p><b>Run recap</b></p><canvas id="recap" width="480" height="120" style="width:100%"></canvas>
 <div class="moments">${S.moments.slice(-12).map(m=>`<p style="margin:2px 0">Day ${m.d}: ${m.t}</p>`).join('')}</div>
 <p style="font-size:12px;opacity:.7">Top decisions: ${dd}</p><div class="ch"><button id="bAgain">Start a new company</button><button id="bHallE">Hall of Fame</button><button id="bTitle">Title screen</button></div>`;
 showOverlay(html,[],true);drawRecap($('recap'));
 $('bAgain').onclick=()=>{overlay=null;newCompany()};$('bTitle').onclick=()=>{overlay=null;toTitle()};$('bHallE').onclick=()=>showHall(true);
}
function drawRecap(c){const g=c.getContext('2d'),W=c.width,H=c.height,hs=S.hist.length?S.hist:[{d:1,val:0}];g.fillStyle='#120f22';g.fillRect(0,0,W,H);
 const mx=Math.max(1,...hs.map(h=>h.val)),days=Math.max(2,S.day),X=d=>10+(d-1)/(days-1)*(W-20),Y=v=>H-22-v/mx*(H-40);
 g.strokeStyle='#333';for(let d=1;d<=days;d++){g.beginPath();g.moveTo(X(d),H-20);g.lineTo(X(d),H-16);g.stroke()}
 g.strokeStyle='#ffd76a';g.lineWidth=2;g.beginPath();hs.forEach((h,i)=>i?g.lineTo(X(h.d),Y(h.val)):g.moveTo(X(h.d),Y(h.val)));g.stroke();
 g.font='10px monospace';g.fillStyle='#aaa';g.fillText('valuation',12,12);g.fillText('day 1',6,H-4);g.fillText('day '+S.day,W-50,H-4);
 S.moments.forEach((m,i)=>{const x=X(m.d);g.fillStyle=m.t.includes('💀')||/Bankrupt|death|mutiny|regulators|spiral|pennies/.test(m.t)?'#ff6b6b':m.t.includes('🔔')?'#7dff8a':'#8f7cff';g.beginPath();g.arc(x,H-30-(i%3)*10,4,0,7);g.fill()});}
function showHall(fromSummary){const h=hall(),best=[...h].sort((a,b)=>b.peak-a.peak)[0];const cnt={};h.forEach(r=>cnt[r.outcome]=(cnt[r.outcome]||0)+1);
 const html=`<h2>🏛 Hall of Fame</h2><p>${h.length} companies founded. ${Object.entries(cnt).map(([k,v])=>OUT[k][0]+' '+v).join(' · ')}</p>${best?`<p>Best: <b>${best.name}</b> — ${fmt(best.peak)}</p>`:''}
 <table class="hall"><tr><td><b>Company</b></td><td><b>Outcome</b></td><td><b>Days</b></td><td><b>Peak</b></td></tr>${h.slice(0,20).map(r=>`<tr><td><span style="color:${r.color}">■</span> ${r.name}<br><small style="opacity:.6">${r.ind}</small></td><td>${OUT[r.outcome][0]} ${OUT[r.outcome][1]}</td><td>${r.days}</td><td>${fmt(r.peak)}</td></tr>`).join('')||'<tr><td>No companies yet.</td></tr>'}</table>
 <div class="ch"><button id="bHallClose">Close</button></div>`;
 if(fromSummary){const prev=$('mbox').innerHTML;showOverlay(html,[],true);$('bHallClose').onclick=()=>runSummary(S.outcome,'');return}
 $('hallbox').innerHTML=html;$('hallwrap').classList.remove('hidden');$('bHallClose').onclick=()=>$('hallwrap').classList.add('hidden')}

// ---------- flow ----------
function initRun(){syncStaff();queue=[];shoppers=[];regT=0;robotServing=false;van={state:'away',t:R(10,20),x:0};machEnt=[{},{}];S.dayStats=S.dayStats||freshStats();bot={path:[],goal:null,think:'',thinkT:0,walkT:0,face:1,idle:.5,x:S.x,y:S.y};busy=0;busyFn=null;overlay=null;npcs=[];S.staff.forEach(r=>addNpc(r));npcs.forEach((n,i)=>{const h=homeOf(n);n.x=h[0]*T;n.y=h[1]*T});if(!S.goal)setGoal()}
function begin(s){
 S=s;S.done=false;S.log=S.log||[];running=true;paused=false;$('modal').classList.add('hidden');
 S.x=Math.round(S.x/T)*T;S.y=Math.round(S.y/T)*T;if(blocked(S.x/T,S.y/T)){S.x=3*T;S.y=5*T}
 $('logb').innerHTML='';S.log.slice(-40).forEach(addLogLine);initRun();
 $('title').classList.add('hidden');['hud','ctl','log','ticker'].forEach(i=>$(i).classList.remove('hidden'));$('dash').classList.toggle('hidden',!dashOpen);tickerItems=[];
 Music.start();
}
function newCompany(){
 const s=newState();localStorage.removeItem(SAVE);begin(s);newDayWorld();save();SFX.mile();
 log(`Booting ${s.co.robot} (${s.co.model}). Personality: ${s.co.traitName}. Perk: ${s.co.perkName}.`,'y');
 log(`Founded ${s.co.name} — ${s.co.industry}. Cash: ${fmt(s.cash)}. We make physical products now. Garage: smells like glue.`,'y');
 log(`Intel: ${s.rival.ceo} runs ${s.rival.name}, our future nemesis. ${VERA} of Vulture Capital thinks robots can't be CEOs. ${TESS} is watching.`,'t');
 news(`New startup ${s.co.name} founded by a robot in a garage; neighbors "concerned"`);
 showOverlay(`<h2>Day 1: ${s.co.name}</h2><p>Product line: <b>${s.co.industry}</b> — ${s.co.skus.map(k=>k.n).join(', ')}<br>Founder: <b>${s.co.robot}</b>, a ${s.co.model}<br>Personality: <b>${s.co.traitName}</b><br>Perk: <b>${s.co.perkName}</b> — ${s.co.perkDesc}<br>Starting cash: <b>${fmt(s.cash)}</b><br>Nemesis: <b>${s.rival.ceo}</b> of ${s.rival.name}</p><p class="why">Sit back. The robot runs everything. Will it IPO, or end up in a rival's mailroom?</p>`,[{at:4,f:()=>{}}]);
}
function cont(){const s=load();if(!s)return;begin(s);log(`Resuming ${s.co.name}, Day ${s.day}. Where was I? Ah yes, world domination (of ${s.co.industry}).`,'t')}
function toTitle(){running=false;overlay=null;$('modal').classList.add('hidden');$('title').classList.remove('hidden');['hud','ctl','log','dash','ticker'].forEach(i=>$(i).classList.add('hidden'));$('bCont').classList.toggle('hidden',!load())}
function setSpeed(v){speed=v;highlights=false;syncCtl()}
function syncCtl(){document.querySelectorAll('#ctl [data-sp]').forEach(b=>b.classList.toggle('on',!highlights&&+b.dataset.sp===speed));$('bHL').classList.toggle('on',highlights);$('bFollow').classList.toggle('on',follow);$('bDash').classList.toggle('on',dashOpen)}
function togglePause(){if(!running)return;paused=!paused;$('bPause').textContent=paused?'▶':'II';$('bPause').classList.toggle('on',paused);if(paused)toast('Paused')}
function toggleMute(){muted=!muted;localStorage.setItem('rfMute',muted?'1':'0');$('bMute').textContent=muted?'×':'♪';if(!muted)Music.start()}
document.querySelectorAll('#ctl [data-sp]').forEach(b=>b.onclick=()=>setSpeed(+b.dataset.sp));
$('bHL').onclick=()=>{highlights=!highlights;syncCtl();toast(highlights?'Highlights mode: fast-forwards quiet stretches':'Highlights off')};
$('bPause').onclick=togglePause;$('bFollow').onclick=()=>{follow=!follow;syncCtl()};$('bMute').onclick=toggleMute;$('bMute').textContent=muted?'×':'♪';
$('bDash').onclick=()=>{dashOpen=!dashOpen;$('dash').classList.toggle('hidden',!dashOpen);syncCtl()};
$('bNew').onclick=()=>{Music.start();SFX.click();newCompany()};$('bCont').onclick=()=>{Music.start();SFX.click();cont()};$('bHall').onclick=()=>showHall(false);
addEventListener('keydown',e=>{if(!running)return;const m={Digit1:1,Digit2:2,Digit3:4,Digit4:8}[e.code];if(m)setSpeed(m);if(e.code==='KeyH')$('bHL').click();if(e.code==='KeyP'||e.code==='Space'){togglePause();e.preventDefault()}if(e.code==='KeyF')$('bFollow').click();if(e.code==='KeyM')toggleMute();if(e.code==='KeyD')$('bDash').click()});

// ---------- simulation ----------
function sim(dt){
 anim+=dt;
 if(!HEADLESS){particles=particles.filter(p=>(p.l-=dt)>0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.g||200)*dt});
  floaters=floaters.filter(f=>(f.l-=dt)>0);floaters.forEach(f=>f.y-=30*dt);if(bot.thinkT>0)bot.thinkT-=dt;if(hlT>0)hlT-=dt}
 if(!S||S.done||(overlay&&!HEADLESS)||dt===0)return;
 npcs.forEach(n=>updNpc(n,dt));npcs=npcs.filter(n=>!n.gone);
 const Lm=S.level;if(storeOpen()&&shoppers.length<SCAP[Lm]&&Math.random()<dt*.1*E.traffic*LF[Lm]*demandMul())spawnShopper();
 shoppers.forEach(s=>updShopper(s,dt));shoppers=shoppers.filter(s=>!(s.st==='leave'&&!s.path.length));
 updRegister(dt);updOnline(dt);
 if(Lm>=4&&(S.flags.auto||0)>=3)stations().filter(x=>x.type==='machine').forEach((m,i)=>{machEnt[i]=machEnt[i]||{};machEnt[i].x=m.x*T;machEnt[i].y=m.y*T;makeItem(2,dt,machEnt[i])});
 S.mktBoost=Math.max(0,S.mktBoost-dt*.004);S.viral=Math.max(0,S.viral-dt*.008);if(S.rushT>0)S.rushT-=dt;
 S.pitchCool-=dt;
 if(busy>0){busy-=dt;if(busy<=0){busy=0;const f=busyFn;busyFn=null;f&&f();if(S.done)return;checkMiles();if(S.done)return;if(S.cash<0)return bankruptCheck()}}
 else if(bot.goal){const sp=120*(has('fast')?1.35:1)*(S.up.legs?1.4:1)*(S.energy<15?.6:1);
  bot.x=S.x;bot.y=S.y;const done=walk(bot,dt,sp);S.x=bot.x;S.y=bot.y;
  if(done){const g=bot.goal;bot.goal=null;bot.idle=R(.2,.8);act(g);if(S.done)return}else{S.energy-=dt*.25;if(!HEADLESS){stepT+=dt;if(stepT>.3){stepT=0;SFX.step()}}}}
 else{bot.idle-=dt;if(bot.idle<=0)decide()}
 S.energy-=dt*.12;if(has('solar'))S.energy=Math.min(maxE(),S.energy+dt*.6);
 if(S.energy<15&&!HEADLESS)hl(1);
 if(S.energy<=0){S.energy=0;return endGame('battery','My battery hit 0% mid-stride. I am now a very expensive paperweight. The pigeon has moved on.')}
 S.time+=dt;
 if(!HEADLESS){sampleT+=dt;}
 const ds=S.dayStats;
 if(ds.ev&&S.time/DAY_LEN>ds.evAt){ds.ev=false;return fireEvent()}
 if(ds.ev2&&S.time/DAY_LEN>ds.ev2At){ds.ev2=false;return fireEvent()}
 if(S.time>=DAY_LEN&&!busy)endDay();
}
function balance(n,ov){Object.assign(E,ov||{});
 const keep={S,bot,npcs,overlay,busy,busyFn,running,shoppers,queue,van},agg={pv:0,rob:0,hum:0,mb:100,mbs:[]};HEADLESS=true;const out={},days=[],byOut={};
 try{for(let i=0;i<n;i++){S=newState();newDayWorld();initRun();let g=0,mc=1e12,ml=0,mb=100,ev=0,mr=99;while(!S.done&&g<800000){sim(E.dt||.1);g++;if(g%50===0){mc=Math.min(mc,S.cash);ml=Math.max(ml,S.legal);mb=Math.min(mb,S.robots?S.botMood:100);mr=Math.min(mr,runway())}}
  agg.pv+=S.pivots;agg.rob+=S.robots>0?1:0;agg.hum+=S.humans;agg.roles=agg.roles||{};S.staff.forEach(s=>agg.roles[s.role]=(agg.roles[s.role]||0)+1);agg.so=(agg.so||0)+S.stockouts;agg.mb=Math.min(agg.mb,mb);agg.mbs.push(Math.round(mb));const k=S.outcome||'timeout';out[k]=(out[k]||0)+1;(agg.runs=agg.runs||[]).push([k,S.day,S.stage,S.customers,Math.round(S.product),+S.rating.toFixed(1),Math.round(S.rep),S.pivots,S.staff.length,S.hidden,n==1?S.hist.map(h=>[h.d,S.level,Math.round(h.store),Math.round(h.online),h.inv,h.backlog,h.rating,h.cust]):'',n==1?S.decisions:'']);days.push(S.day);(byOut[k]=byOut[k]||[]).push(S.day)}}
 finally{HEADLESS=false;({S,bot,npcs,overlay,busy,busyFn,running,shoppers,queue,van}=keep)}
 days.sort((a,b)=>a-b);const med=a=>{a=[...a].sort((x,y)=>x-y);return a[Math.floor(a.length/2)]};
 return {agg,n,out,pct:Object.fromEntries(Object.entries(out).map(([k,v])=>[k,Math.round(v/n*1000)/10])),median:med(days),mean:+(days.reduce((a,b)=>a+b,0)/n).toFixed(1),min:days[0],max:days[n-1],medianByOutcome:Object.fromEntries(Object.entries(byOut).map(([k,v])=>[k,med(v)]))};
}
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
const ROLE_LOOK={cs:{apron:'#27ae60'},ship:{cap:'#8b5a2b',apron:'#a0744a'},maker:{apron:'#e67e22',goggles:1},eng:{apron:'#ecf0f1'},mkt:{apron:'#ff6fb5'}};
function drawStaff(n){const r=n.ref.role;if(n.kind==='human'){drawPerson(n.x+4,n.y-2,n.look,Object.assign({walk:n.path.length?n.walkT:0,tired:S.morale<30},ROLE_LOOK[r],{box:r==='ship'&&n.path.length&&S.boxes.length?1:0}))}
 else drawRobotAt(n,{color:n.col[0],dark:n.col[1]},.7,cx,false);
 cx.font='9px monospace';cx.textAlign='center';cx.fillStyle='#000a';cx.fillRect(n.x+2,n.y+31,28,9);cx.fillStyle='#fff';cx.fillText(ROLES[r].e+(n.name||'').slice(0,5),n.x+16,n.y+38);cx.textAlign='left';
 if(r==='maker'&&n.atHome&&!n.idle){const k=pickBuildSku();if(k){drawItem(cx,S.co.shape,k.c,n.x+10,n.y+6-Math.abs(Math.sin(anim*8))*2,1.2)}}}
function drawHumanOld(){}
function drawStation(s){
 const x=s.x*T,y=s.y*T,t=anim,Lv=S.level,ty=s.type||s.id;
 switch(ty){
 case'desk':rect(x-8,y+10,T+16,14,'#a0744a');rect(x-8,y+24,4,8,'#6d4c2e');rect(x+T+4,y+24,4,8,'#6d4c2e');rect(x+4,y-6,24,16,'#222');rect(x+6,y-4,20,12,busyLabel==='Designing...'&&busy?'#7dff8a':'#3a7bd5');
  drawItem(cx,S.co.shape,'#cfe',x+11,y-3,1);rect(x+12,y+10,8,2,'#111');break;
 case'board':rect(x-6,y-10,T+12,T,'#eee');rect(x-6,y-10,T+12,2,'#999');rect(x-6,y+T-12,T+12,3,'#999');
  cx.strokeStyle='#e74c3c';cx.lineWidth=2;cx.beginPath();cx.moveTo(x,y+12);cx.lineTo(x+10,y+6);cx.lineTo(x+18,y+9);cx.lineTo(x+30,y-4);cx.stroke();rect(x+2,y-6,10,2,'#3498db');break;
 case'dock':{const g=.5+.5*Math.sin(t*4);rect(x,y+8,T,T-8,'#333');rect(x+4,y+12,T-8,T-16,'#1a1a1a');cx.fillStyle=`rgba(125,255,138,${.4+g*.5})`;cx.fillRect(x+6,y+14,T-12,4);cx.fillRect(x+14,y+20,4,8);rect(x+8,y,16,8,'#555');rect(x+12,y+2,8,3,'#7dff8a')}break;
 case'coffee':rect(x+4,y+4,24,26,'#444');rect(x+6,y+6,20,8,'#222');rect(x+8,y+8,4,3,'#e74c3c');rect(x+12,y+18,8,8,'#fff');rect(x+13,y+19,6,3,'#6d4c2e');if(Math.sin(t*2)>0)rect(x+14,y+12-((t*10)%6),2,3,'#ccc8');break;
 case'rack':rect(x,y-14,T,T+14,'#1b1b22');for(let i=0;i<5;i++){rect(x+3,y-11+i*8,T-6,6,'#2c2c38');rect(x+5,y-9+i*8,2,2,(Math.floor(t*8+i*3)%3)?'#7dff8a':'#155');rect(x+9,y-9+i*8,2,2,(Math.floor(t*5+i)%2)?'#ffd76a':'#530')}break;
 case'hire':rect(x-6,y+10,T+12,12,'#c0392b');rect(x-2,y-10,T+4,18,'#fff');cx.fillStyle='#c0392b';cx.font='bold 9px monospace';cx.fillText('HIRING',x-1,y+2);rect(x-4,y+22,6,10,'#555');rect(x+T-2,y+22,6,10,'#555');break;
 case'bench':{rect(x-4,y+8,T+8,14,'#7a5a3a');rect(x-4,y+8,T+8,3,'#9a7550');rect(x-4,y+22,4,10,'#5a4028');rect(x+T,y+22,4,10,'#5a4028');rect(x-2,y+2,6,6,'#999');rect(x+24,y+3,8,4,'#f1c40f');rect(x+26,y+1,2,3,'#555');
  if(s.id==='bench0'&&busy&&/Build/.test(busyLabel)){const k=bot.goal?null:null;const kk=pickBuildSku();if(kk){drawItem(cx,S.co.shape,kk.c,x+10,y,1.3);if(Math.random()<.3&&!HEADLESS)particles.push({x:x+16,y:y+4,vx:R(-40,40),vy:R(-60,-20),l:.4,c:'#ffd76a',g:200})}}}break;
 case'machine':{const on=(S.flags.auto||0)>=3;rect(x-2,y-6,T+4,T+4,'#4a5568');rect(x+2,y-2,T-4,10,on?'#2d3748':'#222');rect(x+4,y,6,4,on&&Math.floor(t*6)%2?'#7dff8a':'#333');
  rect(x-2,y+20,T+4,6,'#222');for(let i=0;i<5;i++)rect(x-2+((i*8+t*(on?30:0))%(T+4)),y+21,3,4,'#666');if(on)drawItem(cx,S.co.shape,unlocked()[0].c,x+4+((t*20)%20),y+12,.9);cx.fillStyle='#fff8';cx.font='7px monospace';cx.fillText(on?'AUTO':'OFFLINE',x,y+34)}break;
 case'shelf':{rect(x-6,y-14,T+12,T+16,'#5a4028');for(let r=0;r<3;r++)rect(x-4,y-12+r*10,T+8,9,'#3a2a1a');
  let n=0;const tot=invTotal();for(let k=0;k<4;k++)for(let j=0;j<S.inv[k]&&n<18;j++,n++){const r=Math.floor(n/6),c=n%6;drawItem(cx,S.co.shape,S.co.skus[k].c,x-3+c*6,y-11+r*10,.6)}
  cx.font='bold 8px monospace';cx.fillStyle=tot?'#ffd76a':'#ff6b6b';cx.textAlign='center';cx.fillText(tot?'STOCK '+tot:'EMPTY!',x+16,y+12);cx.textAlign='left'}break;
 case'disp':{const u=unlocked(),i=+s.id.slice(4);if(Lv<=1){rect(x-10,y+6,T+20,14,'#d35400');rect(x-10,y+6,T+20,3,'#e67e22');rect(x-8,y+20,3,10,'#555');rect(x+T+5,y+20,3,10,'#555')}
  else{rect(x-10,y-6,T+20,T+2,Lv>=4?'#ecf0f1':Lv===3?'#bdc3c7':'#8b5a2b');rect(x-8,y+2,T+16,2,'#0003');rect(x-8,y+14,T+16,2,'#0003')}
  const ks=u.filter((k,j)=>j%Math.max(1,LAY().cfg.d)===i%Math.max(1,LAY().cfg.d)||u.length<=1);let c=0;
  ks.forEach(k=>{for(let j=0;j<Math.min(4,S.inv[k.i]);j++,c++)drawItem(cx,S.co.shape,k.c,x-8+(c%5)*10,y+(Lv<=1?-1:-4)+Math.floor(c/5)*12,.9)});
  if(!c){cx.fillStyle='#ff6b6b';cx.font='bold 8px monospace';cx.fillText('SOLD OUT',x-6,y+6)}
  if(ks[0]){cx.fillStyle='#fff';cx.font='7px monospace';cx.fillText('$'+ks[0].p,x+T-2,y+24)}}break;
 case'pack':{rect(x-8,y+6,T+16,16,'#b08a5a');rect(x-8,y+6,T+16,3,'#c9a36e');rect(x-6,y+22,3,10,'#555');rect(x+T+3,y+22,3,10,'#555');rect(x+2,y+2,12,8,'#c49468');rect(x+2,y+5,12,1,'#8b6a3a');
  if(s.id==='pack'){rect(x+16,y-12,18,14,'#111');const fl=S.flash>0;rect(x+17,y-11,16,12,fl?'#2ecc71':'#1a3a5a');cx.font='bold 7px monospace';cx.fillStyle='#fff';cx.fillText('WEB',x+18,y-5);cx.fillText(String(S.orders.length),x+18,y+1)}
  const bx=S.boxes.length;for(let i=0;i<Math.min(8,bx);i++)rect(x+T+10+(i%2)*10,y+18-Math.floor(i/2)*7,9,7,i%2?'#c49468':'#b5835a')}break;
 case'till':{if(Lv<=1){rect(x-6,y+6,T+12,14,'#d35400');rect(x+4,y,22,10,'#2c3e50');rect(x+8,y+2,8,4,'#7dff8a')}
  else{const h=LAY().cfg.th>1?T*2:T;rect(x-2,y-2,T+4,h,'#6d4c2e');rect(x-2,y-2,T+4,4,'#8b5a2b');rect(x+4,y-10,22,12,'#2c3e50');rect(x+7,y-8,10,4,'#7dff8a');rect(x+20,y-8,4,8,'#bdc3c7');if(h>T){rect(x+4,y+T-8,22,12,'#2c3e50');rect(x+7,y+T-6,10,4,'#7dff8a')}}
  const q=queue.length;if(q>2){cx.fillStyle=q>5?'#ff6b6b':'#ffd76a';cx.font='bold 9px monospace';cx.fillText('LINE '+q,x-2,y-14)}}break;
 case'bell':rect(x+4,y+22,24,10,'#6d4c2e');rect(x+14,y,4,24,'#bbb');rect(x+6,y-6+Math.sin(t*3)*1,20,14,'#ffd76a');rect(x+14,y+8,4,4,'#9a7d0a');break;
 }}
function drawVan(){const Ly=LAY(),bx=Ly.vanX*T,y=12*T+2;let x=bx;
 if(van.state==='away')return;if(van.state==='arrive')x=bx-van.t/2*8*T;if(van.state==='leave')x=bx+(1-van.t/2)*10*T;
 rect(x,y,T*3,T-6,'#ecf0f1');rect(x+T*2.3,y+2,T*.7,T-10,'#3498db');rect(x+4,y+4,T*1.8,T-14,'#e74c3c');cx.fillStyle='#fff';cx.font='bold 8px monospace';cx.fillText('DELIVERY',x+6,y+14);
 rect(x+8,y+T-8,8,5,'#111');rect(x+T*2+8,y+T-8,8,5,'#111');if(van.state==='park'&&Math.floor(anim*3)%2)rect(x-3,y+4,3,4,'#ffd76a')}
function drawTruck(){if(!(S.truckT>0))return;const m=ST('mat'),x=(m.x-1)*T,y=12*T+2;rect(x,y,T*2.6,T-6,'#8b5a2b');rect(x+T*2,y+2,T*.6,T-10,'#f1c40f');cx.fillStyle='#fff';cx.font='bold 7px monospace';cx.fillText('SUPPLY',x+4,y+14);rect(x+6,y+T-8,8,5,'#111');rect(x+T*1.7,y+T-8,8,5,'#111')}
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
 if(Lv<=1){rect(s0*T,4,(s1-s0+1)*T,T*1.4,'#a0a0aa');for(let i=0;i<6;i++)rect(s0*T,8+i*8,(s1-s0+1)*T,2,'#777');cx.fillStyle='#c0392b';cx.font='bold 10px monospace';cx.fillText('GARAGE SALE →',s0*T+6,T*1.3)}
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
 const nc=Math.min(8,Math.ceil(S.mat/3));for(let i=0;i<nc;i++){const cx0=(m.sx+1)*T+(i%4)*9-4,cy0=10*T+14-Math.floor(i/4)*9;rect(cx0,cy0,9,9,'#b5835a');rect(cx0,cy0,9,2,'#9a6d48');rect(cx0+4,cy0,1,9,'#8a5d38')}
 if(S.mat<=0){cx.fillStyle='#ff6b6b';cx.font='bold 8px monospace';cx.fillText('NO MATERIALS',(m.sx+.6)*T,10*T+16)}
 Ly.deco.forEach(([tx,ty])=>{const x=tx*T,y=ty*T;rect(x+10,y+18,12,12,'#8b5a2b');rect(x+6,y+4,20,16,'#2ecc71');rect(x+10,y,12,8,'#27ae60')});
 drawTruck();drawVan();
}
function lights(){const d=darkness();if(d<=.02)return;const W=worldW();
 cx.fillStyle=`rgba(10,8,40,${d})`;cx.fillRect(0,0,W*T,13*T);if(d<.12)return;
 cx.globalCompositeOperation='lighter';const glow=(x,y,r,c)=>{const g=cx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g;cx.fillRect(x-r,y-r,r*2,r*2)};
 const a=d*.6;glow(ST('desk').x*T+16,ST('desk').y*T,70,`rgba(90,160,255,${a})`);glow(ST('dock').x*T+16,ST('dock').y*T+16,50,`rgba(120,255,140,${a})`);
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
 const cxw=S.x+T/2,cyw=S.y+T/2,vw=vp.w/s,vh=vp.h/s;
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
 const en=isBot&&S?S.energy/maxE():1,lowE=en<.2;p(f>0?13:11,8,3,3,lowE?'#f44':'#7df');p(f>0?18:16,8,3,3,lowE?'#f44':'#7df');
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
 cx.fillStyle='#222';cx.textAlign='left';ls.forEach((l,i)=>cx.fillText(l,bx+6,by+13+i*11))}
let hudT=0,dashT=0;
function render(rdt){
 cx.setTransform(1,0,0,1,0,0);cx.fillStyle='#0d0b16';cx.fillRect(0,0,cv.width,cv.height);if(!running||!S)return;
 updCam(rdt);const vp=cam.vp;cx.imageSmoothingEnabled=false;
 let sx=0,sy=0;if(shakeT>0){shakeT-=rdt;sx=R(-1,1)*shakeMag;sy=R(-1,1)*shakeMag;if(shakeT<=0)shakeMag=0}
 cx.setTransform(cam.s*dpr,0,0,cam.s*dpr,(vp.x-cam.x*cam.s+sx)*dpr,(vp.y-cam.y*cam.s+sy)*dpr);
 drawWorld();
 const items=stations().map(s=>({y:s.y*T+T,f:()=>drawStation(s)}));
 npcs.forEach(n=>items.push({y:n.y+T+1,f:()=>drawStaff(n)}));
 shoppers.forEach(s=>items.push({y:s.y+T+1,f:()=>drawPerson(s.x+4,s.y-2,s.look,{walk:s.path.length?s.walkT:0,item:s.sku||s.carry,mood:s.st==='leave'?(s.happy?1:-1):0})}));
 items.push({y:S.y+T,f:()=>drawRobotAt(S,S.co,1,cx,true)});
 items.sort((a,b)=>a.y-b.y).forEach(i=>i.f());
 lights();
 particles.forEach(p=>rect(p.x,p.y,3,3,p.c));
 cx.font='bold 11px monospace';cx.textAlign='center';floaters.forEach(f=>{cx.fillStyle='#000';cx.fillText(f.t,f.x+1,f.y+1);cx.fillStyle=f.c;cx.fillText(f.t,f.x,f.y)});
 if(busy){rect(S.x-4,S.y-10,40,5,'#000');rect(S.x-3,S.y-9,38*(1-busy/busyLen),3,'#ffd76a')}
 if(bot.thinkT>0&&bot.think)bubble(bot.think.length>110?bot.think.slice(0,107)+'…':bot.think,S.x+T/2,S.y);else if(busy)bubble(busyLabel,S.x+T/2,S.y);
 cx.setTransform(1,0,0,1,0,0);
 hudT-=rdt;if(hudT<=0){hudT=.15;drawHUD()}dashT-=rdt;if(dashOpen&&dashT<=0){dashT=.1;drawDash()}
 updTicker(rdt);
 const rw=runway();Music.mood=S.done?(S.outcome==='ipo'?'boom':'crisis'):(rw<2||S.energy<15)?'crisis':(S.market<.8||S.morale<30||rw<5)?'bad':S.market>1.2?'boom':'good';
}
function bar(v,c){return `<span class="bar"><i style="width:${clamp(v,0,100)}%;background:${c}"></i></span>`}
function drawHUD(){const e=S.energy,me=maxE(),ec=e<20?'#ff4d4d':e<50?'#ffd76a':'#7dff8a',tp=Math.min(1,S.time/DAY_LEN);
 $('hud').innerHTML=`<span><b>${S.co.name}</b></span><span>Day <b>${S.day}</b> ${clock()} ${S.wIcon} ${bar(tp*100,'#8f7cff')}</span>
 <span>💰 <b>${fmt(S.cash)}</b></span><span>🔋 ${bar(e/1.4,ec)} ${Math.floor(Math.max(0,e))}/${me}</span>
 <span>🛠 R&D ${S.product.toFixed(0)}</span><span>👥 ${S.customers}</span><span>${'★'.repeat(Math.round(S.rating))}<small>${S.rating.toFixed(1)}</small></span><span>📦 ${invTotal()} · 🧾 ${S.orders.length} · 🪵 ${S.mat}</span><span>⭐ rep ${Math.round(S.rep)}</span><span>🤝 ${S.staff.length}</span><span>${S.market>1.2?'📈 Boom':S.market<.8?'📉 Bust':'〰 Market'} ×${S.market.toFixed(2)}</span><span>${['Bootstrapped','Seed','Series A','Series B'][S.stage]} · ${LEVELS[S.level].n}</span><span>${highlights?(hlT>0?'★ 1x':'★ 8x'):'⏩'+speed+'x'}</span>`}
function spark2(g,x,y,w,h,a,b,ca,cb,label,val){g.fillStyle='#ffffff10';g.fillRect(x,y,w,h);g.fillStyle='#aaa';g.font='10px monospace';g.fillText(label,x+3,y+11);g.textAlign='right';g.fillStyle='#fff';g.fillText(val,x+w-3,y+11);g.textAlign='left';
 if(a.length<2)return;const mx=Math.max(1,...a,...b),X=i=>x+3+i/(a.length-1)*(w-6),Y=v=>y+h-4-v/mx*(h-18);
 [[a,ca],[b,cb]].forEach(([d,c])=>{g.strokeStyle=c;g.lineWidth=1.5;g.beginPath();d.forEach((v,i)=>i?g.lineTo(X(i),Y(v)):g.moveTo(X(i),Y(v)));g.stroke()})}
function spark(g,x,y,w,h,data,col,label,val){g.fillStyle='#ffffff10';g.fillRect(x,y,w,h);g.fillStyle='#aaa';g.font='10px monospace';g.fillText(label,x+3,y+11);g.fillStyle=col;g.textAlign='right';g.fillText(val,x+w-3,y+11);g.textAlign='left';
 if(data.length<2)return;const mn=Math.min(0,...data),mx=Math.max(1,...data),X=i=>x+3+i/(data.length-1)*(w-6),Y=v=>y+h-4-(v-mn)/(mx-mn)*(h-18);
 const n=data.length,prog=Math.min(1,(anim*2)%1e9);g.strokeStyle=col;g.lineWidth=1.5;g.beginPath();data.forEach((v,i)=>i?g.lineTo(X(i),Y(v)):g.moveTo(X(i),Y(v)));g.stroke();
 const lx=X(n-1),ly=Y(data[n-1]);g.fillStyle=col;g.beginPath();g.arc(lx,ly,2.5+Math.sin(anim*6),0,7);g.fill();
 if(mn<0){g.strokeStyle='#ff6b6b55';g.beginPath();g.moveTo(x,Y(0));g.lineTo(x+w,Y(0));g.stroke()}}
function drawDash(){const c=$('dashc'),g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);
 const live={cash:S.cash,val:valuation(),cust:S.customers},hs=[...S.hist.slice(-20),live];
 spark(g,4,4,232,56,hs.map(h=>h.cash),'#7dff8a','Cash',fmt(S.cash));spark(g,4,64,232,56,hs.map(h=>h.val),'#ffd76a','Valuation',fmt(live.val));spark(g,4,124,232,56,hs.map(h=>h.cust),'#7dd3ff','Customers',S.customers);
 const ds=S.dayStats,rh=[...S.hist.slice(-20),{store:ds.storeRev,online:ds.onlineRev,inv:invTotal(),backlog:S.orders.length}];
 spark2(g,4,184,232,56,rh.map(h=>h.store||0),rh.map(h=>h.online||0),'#7dff8a','#7dd3ff','Store vs Online $/day',`${fmt(ds.storeRev)} / ${fmt(ds.onlineRev)}`);
 spark2(g,4,244,232,52,rh.map(h=>h.inv||0),rh.map(h=>h.backlog||0),'#ffd76a','#ff6b6b','Inventory vs Backlog',`${invTotal()} / ${S.orders.length}`);
 const rw=runway();
 const rc=r=>roleCount(r);$('dasht').innerHTML=`<div>⭐ Rating: <b style="color:#ffd76a">${'★'.repeat(Math.round(S.rating))}${'☆'.repeat(5-Math.round(S.rating))}</b> ${S.rating.toFixed(2)} (${S.reviews} reviews)</div>
 <div>🏪 Today: ${ds.served} sold in store · 🚐 ${ds.shipped} shipped${ds.late?` (<span class="neg">${ds.late} late</span>)`:''}</div>
 <div>📦 Inventory ${S.co.skus.filter(k=>S.product>=SKU_UNLOCK[k.i]).map(k=>`<span style="color:${k.c}">■</span>${S.inv[k.i]}`).join(' ')} · 🪵 mats ${S.mat}${S.matOrder?' (🚚 en route)':''}</div>
 <div>⚠️ Stockouts today: ${ds.stockouts} · walk-outs: ${ds.lineLeaves} · line ${queue.length}</div>
 <div>👷 Staff: ${Object.keys(ROLES).map(r=>`${ROLES[r].e}${rc(r)}`).join(' ')}</div>
 <div>🎯 <b>${S.goal?S.goal.t:'—'}</b>${S.goal?` <small>(by day ${S.goal.until})</small>`:''}</div>
 <div>⏳ Runway: <b class="${rw<3?'neg':'pos'}">${rw>=99?'profitable':rw.toFixed(1)+' days'}</b> · burn ${fmt(expenses())}/d</div>
 <div>😊 Morale ${bar(S.morale,S.morale<30?'#ff4d4d':'#7dff8a')} ${Math.round(S.morale)}</div>
 ${S.robots?`<div>🤖 Robot loyalty ${bar(S.botMood,S.botMood<30?'#ff4d4d':'#7dd3ff')} ${Math.round(S.botMood)}</div>`:''}
 <div>⚖️ Legal risk ${bar(S.legal,S.legal>70?'#ff4d4d':'#ffd76a')} ${Math.round(S.legal)}</div>
 <div>🧱 Tech debt ${bar(S.techDebt,S.techDebt>50?'#ff4d4d':'#c39bff')} ${Math.round(S.techDebt)}</div>
 <div>🦹 ${S.rival.ceo} ${bar(S.rival.str,'#ff6b6b')} ${Math.round(S.rival.str)}</div>
 <div>🔋 Battery health ${bar(S.bHealth,S.bHealth<50?'#ff4d4d':'#7dff8a')} ${Math.round(S.bHealth)}</div>
 <div>🍀 Luck: ${S.luck>.4?'hot streak':S.luck<-.4?'cold streak':'normal'} · Pivots: ${S.pivots}/3</div>
 <div>🔧 ${UPGRADES.map(u=>`<span style="opacity:${S.up[u.id]?1:.3}" title="${u.n}">${{legs:'🦿',battery:'🔋',leds:'😁',chip:'🧠'}[u.id]}</span>`).join(' ')}</div>
 ${S.loyal?`<div>💛 First employee: ${S.loyal}${S.flags.cto?' (CTO)':''}</div>`:''}${S.cofounder?`<div>🤖 Co-founder: ${S.cofounder}</div>`:''}`}
let tickerItems=[],tickerX=0;
function updTicker(rdt){const el=$('tickt');if(!tickerItems.length){const comp=S.heads.slice(-3).reverse(),world=[pick(WORLD_NEWS),pick(WORLD_NEWS)];tickerItems=[...comp,...world];el.textContent='  📰  '+tickerItems.join('   •   ')+'   •   ';tickerX=innerWidth}
 tickerX-=rdt*70;el.style.transform=`translateX(${tickerX}px)`;if(tickerX<-el.scrollWidth)tickerItems=[]}
const tcx=$('tc').getContext('2d');
function drawTitleBot(){tcx.clearRect(0,0,160,96);tcx.imageSmoothingEnabled=false;const s=load(),co=s?s.co:{color:'#e74c3c',dark:'#922b21'};const sv=S;S=null;drawRobotAt({x:56,y:8+Math.sin(anim*3)*2,face:1},co,1.6,tcx,false);S=sv;
 tcx.fillStyle='#ffd76a';tcx.font='8px monospace';tcx.textAlign='center';tcx.fillText(s?`saved: ${s.co.name.slice(0,26)}`:'a new founder awaits',80,92)}
let last=performance.now();
function loop(t){const rdt=Math.min(.1,(t-last)/1000);last=t;
 if(!paused&&running){const sp=highlights?(hlT>0?1:8):speed;let simT=rdt*sp*(window.__rfFast||1);updOverlay(rdt);let n=0;while(simT>0&&!overlay&&n<4000){const d=Math.min(.05,simT);simT-=d;sim(d);n++}if(overlay)sim(0);if(highlights&&hlT>0)hlT-=rdt*(1-1/Math.max(1,sp))}
 render(rdt);if(!running){anim+=rdt;drawTitleBot()}requestAnimationFrame(loop)}
$('bCont').classList.toggle('hidden',!load());syncCtl();requestAnimationFrame(loop);
window.__rf={dbgRun(maxDay,ch){HEADLESS=true;S=newState();newDayWorld();initRun();if(ch)S.cash=5e6;let g=0;while(!S.done&&S.day<maxDay&&g<400000){sim(.1);g++;if(ch&&S.level<4&&S.day>2){S.stage=3;setLevel(4)}}const r={day:S.day,shop:shoppers.map(s=>[s.st,tileOf(s),s.path.length,s.slot,Math.round(s.wait)]),q:queue.length,npcs:npcs.map(n=>[n.ref.role,tileOf(n),n.atHome,n.brk,n.path.length,n.leaving]),inv:S.inv,ds:S.dayStats,serving:robotServing,cp:S.cashierPower,bot:[bot.goal&&bot.goal.id,bot.path.length,busy,busyLabel,tileOf(S),S.energy],cash:S.cash,exp:expenses(),rw:runway(),lv:S.level,opts:options().slice(0,8).map(o=>[o.id,Math.round(o.score)]),dec:S.decisions};HEADLESS=false;return r},get S(){return S},get stations(){return stations()},get shoppers(){return shoppers},get queue(){return queue},get van(){return van},LAYOUTS,IND,spawnShopper,DAY_LEN,setSpeed,fireEvent:()=>fireEvent(),balance,get overlay(){return overlay},get npcs(){return npcs},get speed(){return speed},get cam(){return cam},get bot(){return bot},hall,
 setHighlights:v=>{highlights=v;syncCtl()},EVENTS_N:EVENTS.length};
})();
