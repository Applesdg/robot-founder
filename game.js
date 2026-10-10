// Robot Founder — plain JS + canvas. All art procedural.
(()=>{
'use strict';
const W=640,H=384,T=32,DAY_LEN=75,SAVE='robotFounderSave_v1';
const cv=document.getElementById('c'),cx=cv.getContext('2d');cx.imageSmoothingEnabled=false;
const $=id=>document.getElementById(id);
const R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
const fmt=n=>{const s=n<0?'-':'';n=Math.abs(n);return s+'$'+(n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e4?(n/1e3).toFixed(1)+'k':Math.round(n).toLocaleString())};

// ---------- Audio ----------
let actx=null,muted=localStorage.getItem('rfMute')==='1';
function beep(f=440,d=.08,type='square',v=.06,slide=0,delay=0){if(muted)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const t=actx.currentTime+delay,o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
const SFX={
 ok:()=>{beep(660,.06);beep(990,.08,'square',.05,0,.06)},
 bad:()=>{beep(220,.18,'sawtooth',.05,-120)},
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
 {n:'Drone Delivery',p:28,u:'deliveries'},{n:'AI Bakery',p:18,u:'croissants'},{n:'Robot Dog-Walking',p:22,u:'walks'},
 {n:'Space Logistics',p:60,u:'payloads'},{n:'Autonomous Lawn Care',p:24,u:'lawns'},{n:'Sentient Spreadsheets',p:40,u:'cells'},
 {n:'Smart Sock Matching',p:15,u:'pairs'},{n:'Vending Machine Therapy',p:20,u:'sessions'},{n:'Underwater Data Centers',p:55,u:'racks'},
 {n:'Pizza-by-Catapult',p:19,u:'pizzas'},{n:'Robot Barbershop',p:26,u:'haircuts'},{n:'Cloud Weather (actual clouds)',p:35,u:'clouds'}];
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
 const name=Math.random()<.5?pick(PRE)+pick(NOUN)+' '+pick(SUF):pick(NOUN)+pick(['ify','tron','matic','bot','verse','zilla','hub'])+' '+pick(SUF);
 return {name,industry:ind.n,price:ind.p,unit:ind.u,color:col[0],dark:col[1],model:pick(MODELS),robot:pick(RNAMES)+'-'+RI(1,99),perk:perk.id,perkName:perk.n,perkDesc:perk.d,seed:Math.random()};
}
function newState(){
 const co=genCompany();
 return {co,day:1,time:0,cash:RI(6,16)*1000,energy:100,product:RI(0,8),customers:0,rep:RI(5,20),team:0,humans:0,robots:0,compute:co.perk==='gpu'?80:RI(10,30),
   stage:0,level:0,miles:{},lifetimeRev:0,x:5*T,y:6*T,dayStats:null,events:0,done:false,lastIncome:0,valuation:0};
}
const has=p=>S.co.perk===p;

// ---------- World ----------
// stations: tile coords; minLevel
const STATIONS=[
 {id:'desk',x:3,y:3,lvl:0,label:'Code the product'},
 {id:'board',x:6,y:2,lvl:0,label:'Marketing (whiteboard)'},
 {id:'dock',x:1,y:9,lvl:0,label:'Recharge at dock'},
 {id:'door',x:5,y:10.5,lvl:0,label:'Street: sell / pitch'},
 {id:'coffee',x:8,y:3,lvl:1,label:'Coffee machine'},
 {id:'rack',x:14,y:2,lvl:2,label:'Server rack: research'},
 {id:'hire',x:15,y:8,lvl:2,label:'Hiring area'},
 {id:'bell',x:17,y:5,lvl:3,label:'IPO bell'}];
const roomR=()=>S.level>=2?18:9; // last walkable col

// ---------- State / save ----------
let S=null,running=false,paused=false,modalOpen=false,busy=0,busyLabel='',keys={},touchDir={},eventQueued=false,midEventAt=0,particles=[],floaters=[],anim=0,walkT=0,face=1,lastStep=0;
function save(){try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE));return s&&s.co?s:null}catch(e){return null}}

// ---------- UI helpers ----------
function toast(t){const d=document.createElement('div');d.textContent=t;$('toast').appendChild(d);setTimeout(()=>d.remove(),3000)}
function float(t,c='#ffd76a'){floaters.push({t,c,x:S.x+T/2,y:S.y,l:1.4})}
function modal(html,choices,onClose){
 modalOpen=true;$('modal').classList.remove('hidden');
 $('mbox').innerHTML=html+'<div class="ch"></div>';
 const ch=$('mbox').querySelector('.ch');
 choices.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c.t;if(c.dis)b.disabled=true;b.dataset.i=i;b.onclick=()=>{SFX.click();closeModal();c.f&&c.f()};ch.appendChild(b)});
 const first=ch.querySelector('button:not([disabled])');first&&first.focus();
}
function closeModal(){modalOpen=false;$('modal').classList.add('hidden')}

// ---------- Actions ----------
function costE(e){return has('efficient')?e*.75:e}
function spendEnergy(e){S.energy-=costE(e);if(S.energy<=0){S.energy=0;gameOver('battery')}}
function doBusy(sec,label,fn){busy=sec;busyLabel=label;busyFn=fn}
let busyFn=null;
function chance(p){return Math.random()<Math.min(.95,p*(has('charmer')?1.15:1))}
function interact(st){
 if(busy||modalOpen)return;
 const id=st.id;
 if(id==='desk'){
  if(S.energy<6)return low();
  doBusy(1.6,'Coding...',()=>{spendEnergy(8);const g=Math.round((R(2,4)+S.humans*.5)*(has('coder')?1.5:1)*10)/10;S.product+=g;float('+'+g+' product','#7dd3ff');SFX.ok();S.dayStats.coded++;checkMiles()});
 }else if(id==='dock'){
  doBusy(2.5,'Charging...',()=>{S.energy=100;float('Battery 100%','#7dff8a')});SFX.charge();
 }else if(id==='board'){
  const c=300+S.stage*700;
  modal(`<h2>Marketing Whiteboard</h2><p>Draw a growth chart going up and to the right. Then spend money to make it true.</p>`,[
   {t:`Ad campaign (${fmt(c)}, -6 battery)`,dis:S.cash<c,f:()=>doBusy(1.4,'Marketing...',()=>{S.cash-=c;spendEnergy(6);const r=Math.round(R(2,5)*(has('viral')?2:1));S.rep=Math.min(100,S.rep+r);const nc=S.product>=10?RI(0,2+S.stage*3):0;S.customers+=nc;float(`+${r} rep${nc?' +'+nc+' cust':''}`);SFX.ok();checkMiles()})},
   {t:'Brainstorm for free (-4 battery, +1 rep)',f:()=>doBusy(1,'Brainstorming...',()=>{spendEnergy(4);S.rep=Math.min(100,S.rep+1);float('+1 rep');SFX.ok()})},
   {t:'Walk away'}]);
 }else if(id==='coffee'){
  modal(`<h2>Coffee Machine</h2><p>You can't drink coffee. You are a robot. But the team can.</p>`,[
   {t:`Brew for the team ($${20*(S.humans+1)}): humans code a burst`,dis:S.humans<1||S.cash<20*(S.humans+1),f:()=>{S.cash-=20*(S.humans+1);const g=S.humans*2;S.product+=g;float('+'+g+' product (caffeine)','#7dd3ff');SFX.ok()}},
   {t:'Pour espresso on your heatsink (+8 battery?!)',f:()=>{S.energy=Math.min(100,S.energy+8);float('+8 battery somehow','#7dff8a');SFX.ok()}},
   {t:'Walk away'}]);
 }else if(id==='rack'){
  const rc=has('gpu')?7:10;
  modal(`<h2>Server Rack</h2><p>Compute: <b>${Math.floor(S.compute)}</b>. Fans spinning at 'jet engine'.</p>`,[
   {t:`Train a model (-${rc} compute, -8 battery): big product boost`,dis:S.compute<rc,f:()=>doBusy(2,'Training...',()=>{S.compute-=rc;spendEnergy(8);const g=Math.round(R(5,9)*10)/10;S.product+=g;S.rep=Math.min(100,S.rep+1);float('+'+g+' product, +1 rep','#7dd3ff');SFX.ok();checkMiles()})},
   {t:'Buy 25 compute ($1,500)',dis:S.cash<1500,f:()=>{S.cash-=1500;S.compute+=25;float('+25 compute','#c39bff');SFX.coin()}},
   {t:'Walk away'}]);
 }else if(id==='hire'){
  const hc=800,rc=3000;
  modal(`<h2>Hiring Area</h2><p>Team: ${S.humans} humans, ${S.robots} robots. Humans boost coding & cost salary. Robots auto-sell each day and eat compute.</p>`,[
   {t:`Hire a human (${fmt(hc)} bonus, $250/day)`,dis:S.cash<hc,f:()=>{S.cash-=hc;S.humans++;S.team++;float('Welcome, human!','#ffd76a');SFX.mile();checkMiles()}},
   {t:`Build a robot (${fmt(rc)}, 3 compute/day)`,dis:S.cash<rc,f:()=>{S.cash-=rc;S.robots++;S.team++;float('Beep boop, new colleague','#ffd76a');SFX.mile();checkMiles()}},
   {t:'Walk away'}]);
 }else if(id==='door'){
  const rounds=[{n:'Seed Round',amt:250000,need:()=>S.product>=25&&S.customers>=3,req:'25 product & 3 customers'},
                {n:'Series A',amt:3000000,need:()=>S.customers>=40&&S.product>=60,req:'40 customers & 60 product'},
                {n:'IPO',amt:0,need:()=>S.customers>=200&&S.rep>=60&&S.product>=120,req:'200 customers, 60 rep, 120 product (then ring the bell)'}];
  const r=rounds[Math.min(S.stage,2)];
  modal(`<h2>The Street</h2><p>Sunlight. Pigeons. Venture capitalists in vests.</p><p style="opacity:.8">Next: <b>${r.n}</b> — needs ${r.req}.</p>`,[
   {t:'Sell door-to-door (-6 battery)',dis:S.product<5,f:()=>doBusy(1.8,'Selling...',()=>{spendEnergy(6);sell()})},
   {t:S.stage<2?`Pitch investors: ${r.n} (-12 battery)`:'IPO: go ring the bell inside!',dis:S.stage>=2,f:()=>doBusy(2.2,'Pitching...',()=>{spendEnergy(12);pitch(r)})},
   {t:'Walk away'}]);
 }else if(id==='bell'){
  const ok=S.customers>=200&&S.rep>=60&&S.product>=120;
  modal(`<h2>The IPO Bell</h2><p>${ok?'The market is ready. Your shareholders are ready. Your servos are ready.':'Not yet. Needs 200 customers, 60 reputation and 120 product.'}</p>`,[
   {t:'RING IT',dis:!ok,f:()=>win()},{t:'Walk away'}]);
 }
}
function low(){toast('Battery too low! Go to the charging dock.');SFX.bad()}
function sell(){
 const p=Math.min(.9,.25+S.product/120+S.rep/200);
 if(chance(p)){const n=RI(1,2+Math.floor(S.product/25)+S.stage*2);S.customers+=n;S.dayStats.newCust+=n;float(`+${n} customer${n>1?'s':''}!`,'#7dff8a');SFX.coin()}
 else{float('"No thanks, robot."','#ff7d7d');SFX.bad()}
 checkMiles();
}
function pitch(r){
 if(!r.need()){float('"Come back with traction."','#ff7d7d');S.rep=Math.max(0,S.rep-1);SFX.bad();return}
 if(chance(.45+S.rep/150)){S.cash+=r.amt;S.stage++;S.dayStats.raised+=r.amt;SFX.mile();
  if(S.stage===1){S.level=Math.max(S.level,2);milestone('seed','Seed round closed! '+fmt(r.amt)+' in the bank. The garage wall comes down — new server rack & hiring area!')}
  if(S.stage===2){S.level=3;milestone('seriesA','Series A! '+fmt(r.amt)+'. Real office: carpet, plants, and an IPO bell.')}
 }else{float('"We\'ll pass... for now."','#ff7d7d');SFX.bad()}
}
function milestone(k,txt){if(S.miles[k])return;S.miles[k]=S.day;SFX.mile();for(let i=0;i<40;i++)particles.push({x:S.x+16,y:S.y+10,vx:R(-90,90),vy:R(-160,-40),l:R(.8,1.6),c:pick(['#ffd76a','#ff6fb5','#7dd3ff','#7dff8a'])});
 setTimeout(()=>{if(!S.done)modal(`<h2>🏆 Milestone!</h2><p>${txt}</p>`,[{t:'Onward!'}])},(busy?0:50))}
function checkMiles(){
 if(S.customers>=1&&!S.miles.cust){S.level=Math.max(S.level,1);milestone('cust','First customer! Someone actually pays you. A coffee machine appears (for morale).')}
 else if(S.team>=1&&!S.miles.hire)milestone('hire','First hire! You are now legally a "manager".');
 else if(S.customers>=100&&!S.miles.c100)milestone('c100','100 customers! You have a fan club. It is mostly toasters.');
}

// ---------- Events ----------
const EVENTS=[
 {t:'A competitor launched a clone',d:()=>`"${pick(NOUN)}GPT" copied your whole product, typos included.`,c:[
  {t:'Ship faster (-15 battery, +6 product)',f:()=>{spendEnergy(15);S.product+=6}},
  {t:'Sue them ($2,000, +5 rep)',dis:()=>S.cash<2000,f:()=>{S.cash-=2000;S.rep=Math.min(100,S.rep+5)}},
  {t:'Ignore it (lose some customers)',f:()=>{S.customers=Math.max(0,S.customers-Math.ceil(S.customers*.1))}}]},
 {t:'Your battery cell is degrading',d:()=>'Your internal diagnostics report a cell bulging "a little". It is warm.',c:[
  {t:'Replace it ($1,200, full battery)',dis:()=>S.cash<1200,f:()=>{S.cash-=1200;S.energy=100}},
  {t:'Duct tape (-20 battery)',f:()=>{S.energy=Math.max(1,S.energy-20)}}]},
 {t:'A viral tweet about your robot CEO',d:()=>`"lmao the CEO of ${S.co.name} just rolled into a fountain" — 2.1M views.`,c:[
  {t:'Lean into it (+10 rep, +customers)',f:()=>{S.rep=Math.min(100,S.rep+10);S.customers+=RI(1,4+S.stage*5)}},
  {t:'Issue a dignified statement (+3 rep)',f:()=>{S.rep=Math.min(100,S.rep+3)}}]},
 {t:'Regulators ask if a robot can sign contracts',d:()=>'A clerk is holding a pen and staring at your gripper claw.',c:[
  {t:'Hire a lawyer ($3,000)',dis:()=>S.cash<3000,f:()=>{S.cash-=3000;S.rep=Math.min(100,S.rep+4)}},
  {t:'Sign with a QR code (50/50)',f:()=>{if(Math.random()<.5){S.rep=Math.min(100,S.rep+8);toast('The clerk is impressed!')}else{S.cash-=1500;toast('Fined $1,500 for "creative signage".')}}}]},
 {t:'Server outage',d:()=>'Someone (you) tripped over the power cord. Everything is down.',c:[
  {t:'Fix it personally (-12 battery)',f:()=>{spendEnergy(12)}},
  {t:'Blame DNS (-5 rep)',f:()=>{S.rep=Math.max(0,S.rep-5)}}]},
 {t:'A pigeon has nested in your chassis',d:()=>'It seems happy. It is cooing at your CPU.',c:[
  {t:'Make it the mascot (+4 rep)',f:()=>{S.rep=Math.min(100,S.rep+4)}},
  {t:'Evict it gently (-3 battery)',f:()=>{spendEnergy(3)}}]},
 {t:'GPU shortage!',d:()=>'Crypto bros bought every GPU in the hemisphere.',c:[
  {t:'Pay scalper prices ($2,500, +20 compute)',dis:()=>S.cash<2500,f:()=>{S.cash-=2500;S.compute+=20}},
  {t:'Optimize code instead (+3 product, -10 battery)',f:()=>{spendEnergy(10);S.product+=3}}]},
 {t:'An angel investor wants a selfie',d:()=>'A rich uncle-type saw you at the coffee shop.',c:[
  {t:'Smile with LEDs (+$5,000)',f:()=>{S.cash+=5000}},
  {t:'Refuse: "I am not a toy" (+2 rep)',f:()=>{S.rep=Math.min(100,S.rep+2)}}]},
 {t:'Firmware update available',d:()=>'"Update 4.2.0: improves stability, adds feelings."',c:[
  {t:'Install now (+product, -battery)',f:()=>{S.product+=4;spendEnergy(10)}},
  {t:'Remind me tomorrow (forever)',f:()=>{}}]},
 {t:'A customer wants a refund',d:()=>`They say the ${S.co.unit} "looked at them funny".`,c:[
  {t:'Refund them ($300, +2 rep)',dis:()=>S.cash<300,f:()=>{S.cash-=300;S.rep=Math.min(100,S.rep+2)}},
  {t:'Argue on the internet (-4 rep)',f:()=>{S.rep=Math.max(0,S.rep-4)}}]},
];
function fireEvent(){
 const e=pick(EVENTS);S.events++;SFX.event();
 modal(`<h2>⚡ ${e.t}</h2><p>${e.d()}</p>`,e.c.map(c=>({t:c.t,dis:c.dis&&c.dis(),f:()=>{c.f();checkMiles();if(S.cash<0&&!S.done)gameOver('cash')}})));
}

// ---------- Day end ----------
function endDay(){
 const rev=Math.round(S.customers*S.co.price*(1+S.rep/200));
 const sal=S.humans*250,rent=[100,150,600,2000][S.level],cmp=S.robots*3;
 let exp=Math.round((sal+rent)*(has('frugal')?.8:1));
 // team passive work
 const pg=S.humans*1.5+S.robots*.5,rc=S.robots?RI(0,S.robots*2):0;
 S.product+=pg;S.customers+=rc;S.compute=Math.max(0,S.compute-cmp);
 const churn=Math.floor(S.customers*Math.max(0,.04-S.rep/2500));S.customers-=churn;
 S.cash+=rev-exp;S.lifetimeRev+=rev;S.lastIncome=rev-exp;
 const ds=S.dayStats;
 const html=`<h2>End of Day ${S.day}</h2><p style="opacity:.8">${S.co.name} · ${S.co.industry}</p><table>
 <tr><td>Revenue (${S.customers} customers × ${fmt(S.co.price)})</td><td class="pos">+${fmt(rev)}</td></tr>
 <tr><td>Rent${S.humans?' + salaries':''}</td><td class="neg">-${fmt(exp)}</td></tr>
 ${ds.raised?`<tr><td>Funding raised</td><td class="pos">+${fmt(ds.raised)}</td></tr>`:''}
 <tr><td>New customers today</td><td>${ds.newCust+rc}</td></tr>
 ${churn?`<tr><td>Churned</td><td class="neg">-${churn}</td></tr>`:''}
 <tr><td>Product progress</td><td>${S.product.toFixed(1)} (+${(S.product-ds.p0).toFixed(1)})</td></tr>
 ${cmp?`<tr><td>Robot compute upkeep</td><td class="neg">-${cmp}</td></tr>`:''}
 <tr><td><b>Cash</b></td><td><b>${fmt(S.cash)}</b></td></tr></table>
 <p style="opacity:.7;font-size:13px">Overnight your robot docks automatically (battery +40%). Game saved.</p>`;
 S.day++;S.time=0;S.energy=Math.min(100,S.energy+40);
 if(S.cash<0){save();return gameOver('cash')}
 S.dayStats=freshStats();save();
 SFX.coin();
 modal(html,[{t:`Start Day ${S.day} ▶`,f:()=>startDay()}]);
}
function freshStats(){return {coded:0,newCust:0,raised:0,p0:S.product}}
function startDay(){midEventAt=R(.35,.7);eventQueued=S.day>1&&Math.random()<.85;if(S.day>1&&Math.random()<.6){fireEvent()}}

function gameOver(why){
 if(S.done)return;S.done=true;localStorage.removeItem(SAVE);SFX.lose();
 const t=why==='battery'?['Battery Dead','Your battery hit 0%. You are now a very expensive paperweight. The pigeon has moved on.']:['Bankrupt','Cash went negative. The bank repossessed the garage, the desk, and somehow your left wheel.'];
 setTimeout(()=>modal(`<h2>💀 ${t[0]}</h2><p>${t[1]}</p><p>${S.co.name} survived <b>${S.day}</b> days with ${S.customers} customers.</p>`,[{t:'Back to title',f:toTitle}]),100);
}
function win(){
 S.done=true;localStorage.removeItem(SAVE);SFX.mile();
 const val=Math.round(S.lifetimeRev*40+S.customers*50000+S.cash);
 for(let i=0;i<120;i++)particles.push({x:R(0,W),y:-10,vx:R(-30,30),vy:R(40,160),l:R(2,4),c:pick(['#ffd76a','#ff6fb5','#7dd3ff','#7dff8a'])});
 modal(`<h2>🔔 IPO! You win!</h2><p>${S.co.name} rings the bell on Day ${S.day}. Market cap: <b>${fmt(val)}</b>.</p><p>${S.co.robot} is the first robot CEO on the exchange. Your stock ticker is just a picture of a battery.</p>`,[{t:'Back to title',f:toTitle}]);
}

// ---------- Flow ----------
function begin(state){
 S=state;S.dayStats=S.dayStats||freshStats();S.done=false;running=true;paused=false;busy=0;
 $('title').classList.add('hidden');['hud','topbtns'].forEach(i=>$(i).classList.remove('hidden'));
 updateTouchVis();
}
function newCompany(){
 const s=newState();localStorage.removeItem(SAVE);begin(s);save();
 SFX.mile();
 modal(`<h2>Day 1: ${s.co.name}</h2><p>Industry: <b>${s.co.industry}</b><br>Founder: <b>${s.co.robot}</b>, a ${s.co.model}<br>Perk: <b>${s.co.perkName}</b> — ${s.co.perkDesc}<br>Starting cash: <b>${fmt(s.cash)}</b></p>
 <p>Walk to stations and press <b>E</b>. Code at the desk, sell & pitch through the door, and <b>recharge at the dock</b> before your battery dies. Win by IPO.</p>`,[{t:'Boot up ▶',f:()=>{}}]);
}
function cont(){const s=load();if(!s)return;begin(s);toast(`Welcome back to ${s.co.name} — Day ${s.day}`);startDay()}
function toTitle(){running=false;closeModal();$('title').classList.remove('hidden');['hud','topbtns','prompt','touch'].forEach(i=>$(i).classList.add('hidden'));$('bCont').classList.toggle('hidden',!load());drawTitleBot()}
function togglePause(){if(!running||S.done)return;if(paused){paused=false;closeModal();return}
 if(modalOpen)return;paused=true;
 modal(`<h2>Paused</h2><p>${S.co.name} · Day ${S.day}<br>${S.co.robot} (${S.co.model}) · Perk: ${S.co.perkName}</p>`,[
  {t:'Resume',f:()=>{paused=false}},{t:muted?'Unmute sound':'Mute sound',f:()=>{toggleMute();paused=false}},
  {t:'Save & quit to title',f:()=>{paused=false;save();toTitle()}}]);}
function toggleMute(){muted=!muted;localStorage.setItem('rfMute',muted?'1':'0');$('bMute').textContent=muted?'×':'♪'}

// ---------- Input ----------
const KM={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
addEventListener('keydown',e=>{
 if(KM[e.code]){keys[KM[e.code]]=1;e.preventDefault()}
 if(e.code==='KeyE'||e.code==='Space'||e.code==='Enter'){if(modalOpen){if(e.code!=='Enter'&&e.code!=='Space'){const b=$('mbox').querySelector('button:not([disabled])');b&&b.click()}return}tryInteract();e.preventDefault()}
 if(e.code==='KeyP'||e.code==='Escape')togglePause();
 if(e.code==='KeyM')toggleMute();
});
addEventListener('keyup',e=>{if(KM[e.code])keys[KM[e.code]]=0});
addEventListener('blur',()=>{keys={}});
document.querySelectorAll('#dpad button').forEach(b=>{const d=b.dataset.d;
 const on=e=>{e.preventDefault();touchDir[d]=1},off=e=>{e.preventDefault();touchDir[d]=0};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off)});
$('act').addEventListener('pointerdown',e=>{e.preventDefault();tryInteract()});
$('bNew').onclick=()=>{SFX.click();if(load()&&!confirmNew())return;newCompany()};
function confirmNew(){return true} // spec: New Company overwrites the old save
$('bCont').onclick=()=>{SFX.click();cont()};
$('bPause').onclick=togglePause;$('bMute').onclick=toggleMute;$('bMute').textContent=muted?'×':'♪';
const isTouch=()=>matchMedia('(pointer:coarse)').matches||'ontouchstart' in window||innerWidth<800;
function updateTouchVis(){$('touch').classList.toggle('hidden',!(running&&isTouch()))}
addEventListener('resize',updateTouchVis);

function nearStation(){
 let best=null,bd=1e9;const px=S.x+T/2,py=S.y+T/2;
 for(const s of STATIONS){if(s.lvl>S.level)continue;const d=Math.hypot(s.x*T+T/2-px,s.y*T+T/2-py);if(d<bd){bd=d;best=s}}
 return bd<52?best:null;
}
function tryInteract(){if(!running||paused||modalOpen||S.done)return;const s=nearStation();if(s)interact(s)}

// ---------- Update ----------
function solidAt(x,y){
 const tx=Math.floor(x/T),ty=Math.floor(y/T);
 if(tx<1||ty<2||ty>10||tx>roomR())return true;
 for(const s of STATIONS){if(s.lvl>S.level||s.id==='door'||s.id==='dock')continue;if(x>=s.x*T&&x<s.x*T+T&&y>=s.y*T&&y<s.y*T+T)return true}
 return false;
}
function canMove(x,y){const m=6;return !solidAt(x+m,y+14)&&!solidAt(x+T-m,y+14)&&!solidAt(x+m,y+T-2)&&!solidAt(x+T-m,y+T-2)}
function update(dt){
 anim+=dt;
 particles=particles.filter(p=>(p.l-=dt)>0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt});
 floaters=floaters.filter(f=>(f.l-=dt)>0);floaters.forEach(f=>f.y-=30*dt);
 if(!running||paused||modalOpen||S.done)return;
 if(busy>0){busy-=dt;if(busy<=0){busy=0;const f=busyFn;busyFn=null;f&&f()}return}
 const d={up:keys.up||touchDir.up,down:keys.down||touchDir.down,left:keys.left||touchDir.left,right:keys.right||touchDir.right};
 let vx=(d.right?1:0)-(d.left?1:0),vy=(d.down?1:0)-(d.up?1:0);
 if(vx||vy){const l=Math.hypot(vx,vy),sp=120*(has('fast')?1.35:1)*(S.energy<15?.6:1);vx=vx/l*sp*dt;vy=vy/l*sp*dt;
  if(canMove(S.x+vx,S.y))S.x+=vx;if(canMove(S.x,S.y+vy))S.y+=vy;if(vx)face=vx>0?1:-1;walkT+=dt;S.energy-=dt*.25;
  if(anim-lastStep>.25){lastStep=anim;SFX.step()}}
 S.energy-=dt*.12;if(has('solar'))S.energy=Math.min(100,S.energy+dt*.6);
 if(S.energy<=0){S.energy=0;return gameOver('battery')}
 S.time+=dt;
 if(eventQueued&&S.time/DAY_LEN>midEventAt){eventQueued=false;fireEvent();return}
 if(S.time>=DAY_LEN){endDay()}
}

// ---------- Render ----------
function rect(x,y,w,h,c){cx.fillStyle=c;cx.fillRect(Math.round(x),Math.round(y),w,h)}
function drawFloor(){
 const L=S.level,rr=roomR();
 rect(0,0,W,H,'#0d0b16');
 for(let ty=0;ty<12;ty++)for(let tx=0;tx<20;tx++){
  const x=tx*T,y=ty*T,inRoom=tx>=1&&tx<=rr&&ty>=2&&ty<=10;
  if(inRoom){
   if(L>=3){rect(x,y,T,T,(tx+ty)%2?'#4a3b6b':'#46385f');rect(x+2,y+2,2,2,'#5a4a80')}
   else if(L>=2){rect(x,y,T,T,(tx+ty)%2?'#6b5a45':'#665540');rect(x,y+T-2,T,2,'#55452f')}
   else{rect(x,y,T,T,'#55555f');if((tx*7+ty*13)%5===0)rect(x+8,y+12,6,3,'#4a4a52');rect(x,y,1,T,'#4d4d57')}
  }}
 // back wall
 const wc=L>=3?'#2e4a6b':L>=2?'#8a7a64':'#6d6d78',wd=L>=3?'#24395a':L>=2?'#6d604d':'#5a5a64';
 rect(T,0,(rr)*T,2*T,wc);for(let i=0;i<rr*2;i++)rect(T+i*16,(i%2)*16,1,16,wd);rect(T,2*T-4,rr*T,4,wd);
 if(L<2){ // garage door stripes
  for(let i=0;i<4;i++)rect(T*7.5,6+i*12,T*1.4,9,'#7d7d88');}
 if(L>=3){ // windows w/ skyline
  for(const wx of [11,13,16]){rect(wx*T,10,T*1.5,T,'#7fb2e5');for(let b=0;b<5;b++)rect(wx*T+b*10,26+((b*7)%12),8,T-16-((b*7)%12),'#5a7ca8');rect(wx*T,10,T*1.5,2,'#ddd');}}
 // side walls
 rect(0,0,T,H,'#2a2538');rect((rr+1)*T,0,W,H,'#2a2538');rect(0,11*T,W,T,'#2a2538');
 if(L<2){rect(10*T,2*T,6,9*T,'#3a3450');}
 // door to street
 const dx=5*T,dy=11*T;rect(dx-4,dy-2,T+8,T,'#3b2a1a');rect(dx,dy,T,T-4,'#8b5a2b');rect(dx+T-8,dy+12,4,4,'#ffd76a');
 cx.fillStyle='#fff8';cx.font='8px monospace';cx.fillText('STREET',dx+2,dy+28);
 if(L>=3){[[2,10],[18,10],[12,6]].forEach(([px,py])=>{rect(px*T+10,py*T+18,12,12,'#8b5a2b');rect(px*T+6,py*T+4,20,16,'#2ecc71');rect(px*T+10,py*T,12,8,'#27ae60')})}
 // extra desks for humans
 for(let i=0;i<Math.min(S.humans,6);i++){const x=(11+(i%3)*2)*T,y=(i<3?5:7)*T+(L>=3?0:0);if(S.level<2)break;rect(x,y+8,T*1.5,12,'#a0744a');rect(x+8,y,14,10,'#222');rect(x+10,y+2,10,6,'#4af');drawHuman(x+10,y+18,i)}
}
function drawHuman(x,y,i){const sk=['#f1c27d','#c68642','#8d5524','#ffdbac'][i%4],sh=['#e74c3c','#3498db','#9b59b6','#16a085'][i%4];const b=Math.sin(anim*6+i)*1;
 rect(x+3,y+b,8,7,sk);rect(x+3,y+b,8,2,'#3b2a1a');rect(x+1,y+7,12,9,sh);rect(x+3,y+16,3,4,'#333');rect(x+8,y+16,3,4,'#333')}
function drawStation(s){
 const x=s.x*T,y=s.y*T,t=anim;
 switch(s.id){
 case'desk':rect(x-8,y+10,T+16,14,'#a0744a');rect(x-8,y+24,4,8,'#6d4c2e');rect(x+T+4,y+24,4,8,'#6d4c2e');rect(x+4,y-6,24,16,'#222');rect(x+6,y-4,20,12,busyLabel==='Coding...'&&busy?'#7dff8a':'#3a7bd5');
  for(let i=0;i<3;i++)rect(x+8,y-2+i*3,6+((i*5+Math.floor(t*3))%10),1,'#cfe');rect(x+12,y+10,8,2,'#111');break;
 case'board':rect(x-6,y-10,T+12,T,'#eee');rect(x-6,y-10,T+12,2,'#999');rect(x-6,y+T-12,T+12,3,'#999');
  cx.strokeStyle='#e74c3c';cx.lineWidth=2;cx.beginPath();cx.moveTo(x,y+12);cx.lineTo(x+10,y+6);cx.lineTo(x+18,y+9);cx.lineTo(x+30,y-4);cx.stroke();rect(x+2,y-6,10,2,'#3498db');break;
 case'dock':{const g=.5+.5*Math.sin(t*4);rect(x,y+8,T,T-8,'#333');rect(x+4,y+12,T-8,T-16,'#1a1a1a');cx.fillStyle=`rgba(125,255,138,${.4+g*.5})`;cx.fillRect(x+6,y+14,T-12,4);cx.fillRect(x+14,y+20,4,8);rect(x+8,y,16,8,'#555');rect(x+12,y+2,8,3,'#7dff8a')}break;
 case'door':break;
 case'coffee':rect(x+4,y+4,24,26,'#444');rect(x+6,y+6,20,8,'#222');rect(x+8,y+8,4,3,'#e74c3c');rect(x+12,y+18,8,8,'#fff');rect(x+13,y+19,6,3,'#6d4c2e');
  if(Math.sin(t*2)>0){rect(x+14,y+12-((t*10)%6),2,3,'#ccc8')}break;
 case'rack':rect(x,y-14,T,T+14,'#1b1b22');for(let i=0;i<5;i++){rect(x+3,y-11+i*8,T-6,6,'#2c2c38');rect(x+5,y-9+i*8,2,2,(Math.floor(t*8+i*3)%3)?'#7dff8a':'#155');rect(x+9,y-9+i*8,2,2,(Math.floor(t*5+i)%2)?'#ffd76a':'#530')}break;
 case'hire':rect(x-6,y+10,T+12,12,'#c0392b');rect(x-2,y-10,T+4,18,'#fff');cx.fillStyle='#c0392b';cx.font='bold 9px monospace';cx.fillText('HIRING',x-1,y+2);
  rect(x-4,y+22,6,10,'#555');rect(x+T-2,y+22,6,10,'#555');break;
 case'bell':rect(x+4,y+22,24,10,'#6d4c2e');rect(x+14,y,4,24,'#bbb');rect(x+6,y-6+Math.sin(t*3)*1,20,14,'#ffd76a');rect(x+14,y+8,4,4,'#9a7d0a');break;
 }}
function drawRobot(x,y,co,sc=1,c=cx){
 const bob=busy?Math.sin(anim*20):Math.sin(walkT*14)*1.5,f=face;
 const p=(a,b,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x+a*sc),Math.round(y+(b+bob)*sc),w*sc,h*sc)};
 // shadow
 c.fillStyle='#0006';c.fillRect(x+6*sc,y+29*sc,20*sc,3*sc);
 p(15,0,2,4,'#aaa');p(14,-2,4,3,(Math.floor(anim*2)%2)?'#ff4':'#f80'); // antenna
 p(7,4,18,12,co.color);p(7,14,18,2,co.dark);p(9,6,14,7,'#111');
 const lowE=S&&S.energy<20;p(f>0?13:11,8,3,3,lowE?'#f44':'#7df');p(f>0?18:16,8,3,3,lowE?'#f44':'#7df');
 p(5,8,2,4,co.dark);p(25,8,2,4,co.dark);
 p(9,17,14,10,co.color);p(12,19,8,5,'#222');const e=S?S.energy/100:1;p(13,20,Math.max(1,Math.round(6*e)),3,e<.2?'#f44':e<.5?'#fd4':'#7f8');
 const arm=busy?Math.sin(anim*25)*2:0;p(5,18+arm,4,8,co.dark);p(23,18-arm,4,8,co.dark);
 const lg=Math.sin(walkT*14)*2;p(10,27,5,3+(lg>0?1:0),'#333');p(17,27,5,3+(lg<0?1:0),'#333');
}
function drawHUD(){
 const e=S.energy,ec=e<20?'#ff4d4d':e<50?'#ffd76a':'#7dff8a',tp=Math.min(1,S.time/DAY_LEN);
 $('hud').innerHTML=`<span><b>${S.co.name}</b></span><span>Day <b>${S.day}</b> <span class="bar"><i style="width:${tp*100}%;background:#8f7cff"></i></span></span>
 <span>💰 <b>${fmt(S.cash)}</b></span><span>🔋 <span class="bar"><i style="width:${e}%;background:${ec}"></i></span> ${Math.floor(e)}%</span>
 <span>🛠 ${S.product.toFixed(0)}</span><span>👥 ${S.customers}</span><span>📈 ${fmt(Math.round(S.customers*S.co.price))}/d</span><span>⭐ ${Math.round(S.rep)}</span><span>🤝 ${S.team}</span><span>🧠 ${Math.floor(S.compute)}</span><span>${['Bootstrapped','Seed','Series A','IPO'][S.stage]}</span>`;
}
let hudT=0;
function render(dt){
 if(!running){return}
 drawFloor();
 const items=STATIONS.filter(s=>s.lvl<=S.level).map(s=>({y:s.y*T+T,f:()=>drawStation(s)}));
 items.push({y:S.y+T,f:()=>drawRobot(S.x,S.y,S.co)});
 items.sort((a,b)=>a.y-b.y).forEach(i=>i.f());
 // day/night tint
 const tp=S.time/DAY_LEN;if(tp>.75){cx.fillStyle=`rgba(20,10,60,${(tp-.75)*1.2})`;cx.fillRect(0,0,W,H)}
 particles.forEach(p=>rect(p.x,p.y,3,3,p.c));
 cx.font='bold 11px monospace';cx.textAlign='center';
 floaters.forEach(f=>{cx.fillStyle='#000';cx.fillText(f.t,f.x+1,f.y+1);cx.fillStyle=f.c;cx.fillText(f.t,f.x,f.y)});
 if(busy){const w=40;rect(S.x-4,S.y-14,w,6,'#000');rect(S.x-3,S.y-13,(w-2)*(1-busy/2.5),4,'#ffd76a');cx.fillStyle='#fff';cx.fillText(busyLabel,S.x+16,S.y-18)}
 cx.textAlign='left';
 const ns=!modalOpen&&!busy&&!S.done&&nearStation();
 const pr=$('prompt');if(ns){pr.textContent=(isTouch()?'Tap E: ':'Press E: ')+ns.label;pr.classList.remove('hidden');const s=ns;cx.strokeStyle='#ffd76a';cx.lineWidth=2;cx.strokeRect(s.x*T-4+.5,s.y*T-4+.5,T+8,T+8)}else pr.classList.add('hidden');
 if(S.energy<20&&Math.floor(anim*2)%2){cx.fillStyle='#ff4d4d';cx.font='bold 14px monospace';cx.fillText('LOW BATTERY! Go to dock',W/2-95,H-8)}
 hudT-=dt;if(hudT<=0){hudT=.1;drawHUD()}
}
// title robot
const tcx=$('tc').getContext('2d');let titleCo={color:'#e74c3c',dark:'#922b21'};
function drawTitleBot(){tcx.clearRect(0,0,160,96);tcx.imageSmoothingEnabled=false;
 const s=load();titleCo=s?s.co:titleCo;const sv=S;S=null;drawRobot(56,8+Math.sin(anim*3)*2,titleCo,1.6,tcx);S=sv;
 tcx.fillStyle='#ffd76a';tcx.font='8px monospace';tcx.textAlign='center';tcx.fillText(s?`saved: ${s.co.name.slice(0,26)}`:'a new founder awaits',80,92)}
let last=performance.now();
function loop(t){const dt=Math.min(.05,(t-last)/1000);last=t;update(dt);render(dt);if(!running&&Math.floor(t/100)%2===0)drawTitleBot();requestAnimationFrame(loop)}
$('bCont').classList.toggle('hidden',!load());
requestAnimationFrame(loop);
// test/debug hook
window.__rf={get S(){return S},set S(v){S=v},endDay:()=>endDay(),fireEvent:()=>fireEvent(),near:()=>nearStation(),interact:id=>interact(STATIONS.find(s=>s.id===id)),stations:STATIONS,T,DAY_LEN,get modalOpen(){return modalOpen},get busy(){return busy}};
})();
