// Robot Founder — plain JS + canvas. All art procedural.
(()=>{
'use strict';
const T=32,DAY_LEN=75,SAVE='robotFounderSave_v2';
const cv=document.getElementById('c'),cx=cv.getContext('2d');
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
 const name=Math.random()<.5?pick(PRE)+pick(NOUN):pick(NOUN)+pick(['ify','tron','matic','bot','verse','zilla','hub']);const sf=pick(SUF);
 const nm=/^[.l]/.test(sf)?name+sf:name+' '+sf;return {name:nm,industry:ind.n,price:ind.p,unit:ind.u,color:col[0],dark:col[1],model:pick(MODELS),robot:pick(RNAMES)+'-'+RI(1,99),perk:perk.id,perkName:perk.n,perkDesc:perk.d,seed:Math.random()};
}
const TRAITS=[
 {id:'builder',n:'Perfectionist Builder',w:{code:1.6,research:1.4,sell:.8}},
 {id:'hustler',n:'Relentless Hustler',w:{sell:1.6,pitch:1.3,code:.85}},
 {id:'hype',n:'Hype Machine',w:{market:1.8,sell:1.1}},
 {id:'cautious',n:'Anxious Accountant',w:{dock:1.5,hire:.7},low:32},
 {id:'reckless',n:'YOLO Optimizer',w:{hire:1.5,market:1.2},low:14},
 {id:'social',n:'Team Player',w:{hire:1.4,coffee:2}}];
const VCS=['Sequoia-ish Ventures','Andreessen Horowitz-Adjacent','Y Combinator\'s Cousin','SoftBankish Vision Fund','Benchmark-ish Partners','Lightspeed of Sound','Accel-erator & Brakes','Founders Fund (Probably)','Kleiner Perkins-Shaped Object','Index Fund of Vibes'];
function newState(){
 const co=genCompany();co.trait=pick(TRAITS).id;co.traitName=TRAITS.find(t=>t.id===co.trait).n;
 return {co,day:1,time:0,cash:RI(6,16)*1000,energy:100,product:RI(0,8),customers:0,rep:RI(5,20),team:0,humans:0,robots:0,compute:co.perk==='gpu'?80:RI(10,30),
   stage:0,level:0,miles:{},lifetimeRev:0,x:5*T,y:6*T,dayStats:null,events:0,done:false,peakVal:0,moments:[],log:[],decisions:{},pitchCool:0};
}
const has=p=>S.co.perk===p;
const trait=()=>TRAITS.find(t=>t.id===S.co.trait)||TRAITS[0];
const STATIONS=[
 {id:'desk',x:3,y:3,lvl:0,sx:3,sy:4},{id:'board',x:6,y:2,lvl:0,sx:6,sy:3},{id:'dock',x:1,y:9,lvl:0,sx:1,sy:9},
 {id:'door',x:5,y:10.5,lvl:0,sx:5,sy:10},{id:'coffee',x:8,y:3,lvl:1,sx:8,sy:4},{id:'rack',x:14,y:2,lvl:2,sx:14,sy:3},
 {id:'hire',x:15,y:8,lvl:2,sx:15,sy:9},{id:'bell',x:17,y:5,lvl:3,sx:17,sy:6}];
const ST=id=>STATIONS.find(s=>s.id===id);
const roomR=()=>S.level>=2?18:9;

// ---------- globals ----------
let S=null,running=false,paused=false,speed=1,follow=false,busy=0,busyLabel='',busyFn=null,anim=0,particles=[],floaters=[];
let bot={path:[],goal:null,think:'',thinkT:0,walkT:0,face:1,idle:0},npcs=[],overlay=null,stepT=0;
function save(){try{const o=Object.assign({},S);o.log=S.log.slice(-40);localStorage.setItem(SAVE,JSON.stringify(o))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE));return s&&s.co?s:null}catch(e){return null}}

// ---------- log / thoughts ----------
function clock(){const m=Math.floor(8*60+S.time/DAY_LEN*12*60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
function log(t,cls=''){const e={d:S.day,c:clock(),t,cls};S.log.push(e);if(S.log.length>200)S.log.shift();addLogLine(e)}
function addLogLine(e){const lb=$('logb'),d=document.createElement('div');d.innerHTML=`<span class="t">Day ${e.d}, ${e.c} —</span> <span class="${e.cls}">${e.t}</span>`;lb.appendChild(d);while(lb.children.length>80)lb.firstChild.remove();lb.scrollTop=lb.scrollHeight}
function think(t,cls){bot.think=t;bot.thinkT=4;log(t,cls)}
function toast(t){const d=document.createElement('div');d.textContent=t;$('toast').appendChild(d);setTimeout(()=>d.remove(),3000)}
function float(t,c='#ffd76a',x=S.x+T/2,y=S.y){floaters.push({t,c,x,y,l:1.6})}
function moment(t){S.moments.push({d:S.day,t});toast(t)}
const L=(arr,o={})=>pick(arr).replace(/\{(\w+)\}/g,(m,k)=>o[k]);

// ---------- pathfinding ----------
function blocked(tx,ty){
 if(tx<1||ty<2||ty>10||tx>roomR())return true;
 for(const s of STATIONS){if(s.lvl>S.level||s.id==='door'||s.id==='dock')continue;if(s.x===tx&&s.y===ty)return true}
 return false}
function bfs(fx,fy,gx,gy){
 const key=(x,y)=>y*32+x,prev=new Map([[key(fx,fy),null]]),q=[[fx,fy]];
 while(q.length){const [x,y]=q.shift();if(x===gx&&y===gy){const p=[];let k=key(x,y);while(k!=null){p.unshift([k%32,Math.floor(k/32)]);k=prev.get(k)}return p.slice(1)}
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(!prev.has(k)&&!blocked(nx,ny)){prev.set(k,key(x,y));q.push([nx,ny])}}}
 return null}
function walk(ent,dt,sp){
 if(!ent.path.length)return true;const [tx,ty]=ent.path[0],gx=tx*T,gy=ty*T,dx=gx-ent.x,dy=gy-ent.y,d=Math.hypot(dx,dy),st=sp*dt;
 if(d<=st){ent.x=gx;ent.y=gy;ent.path.shift()}else{ent.x+=dx/d*st;ent.y+=dy/d*st;if(Math.abs(dx)>1)ent.face=dx>0?1:-1}
 ent.walkT=(ent.walkT||0)+dt;return !ent.path.length}
const tileOf=e=>[Math.round(e.x/T),Math.round(e.y/T)];

// ---------- planner ----------
function expensesPerDay(){return (S.humans*450+[100,150,600,2000][S.level])*(has('frugal')?.8:1)}
function nextRound(){return [{n:'Seed Round',amt:250000,ok:()=>S.product>=25&&S.customers>=3},{n:'Series A',amt:3000000,ok:()=>S.customers>=60&&S.product>=90},{n:'IPO',ok:()=>ipoReady()}][Math.min(S.stage,2)]}
const ipoReady=()=>S.customers>=400&&S.rep>=70&&S.product>=250;
function options(){
 const tw=trait().w,o=[],e=S.energy,exp=expensesPerDay(),lowT=(trait().low||22)+(S.co.trait==='cautious'?0:0);
 const add=(id,st,score,why)=>{if(ST(st).lvl<=S.level)o.push({id,st,score:score*(tw[id]||1)*R(.75,1.25),why})};
 if(e<lowT)add('dock','dock',100,L(['Battery at {e}%. Heading to the dock.','{e}% battery. Even CEOs need naps.','Low juice ({e}%). Going to plug myself in. Literally.','{e}%?! My life flashed before my LEDs. Dock time.'],{e:Math.round(e)}));
 else if(e<55)add('dock','dock',8+(55-e)/3,`Battery ${Math.round(e)}%. A top-up wouldn't hurt.`);
 if(S.stage>=2&&ipoReady())add('ipo','bell',90,'All IPO requirements met. Time to ring that bell.');
 const r=nextRound();if(S.stage<2&&r.ok()&&S.pitchCool<=0)add('pitch','door',60,`I have the numbers for a ${r.n}. Pitching ${pick(VCS)}…`);
 add('code','desk',S.product<10?40:22+Math.max(0,(S.stage*45+30-S.product))/3,L(['Product at {p}. Time to write code nobody will read.','Refactoring the refactor.','Shipping a feature. Possibly a bug. Same thing.','Adding dark mode. Customers demanded it (one did).','Product is behind. Opening my IDE with my face.'],{p:Math.round(S.product)}));
 if(S.product>=5)add('sell','door',((S.cash<exp*4?45:22)+S.product/10)*(S.customers>S.product*1.5+10?.35:1),L(['Cash is {c}. Going door-to-door with {u}.','Time to find humans with wallets.','Sales quota: 1. Sales so far: 0. Onward.','Customers won\'t sell themselves. Unlike me, a robot, who will.'],{c:fmt(S.cash),u:S.co.unit}));
 const mc=300+S.stage*700;if(S.cash>mc*4)add('market','board',S.rep<60?(S.stage>=1?32:18):6,L(['Reputation {r}. Drawing a chart that goes up and to the right.','Brand awareness campaign: putting my face on a bus.','Marketing! Writing "disrupt" on the whiteboard 40 times.'],{r:Math.round(S.rep)}));
 const rc=has('gpu')?7:10;
 if(S.level>=2){if(S.compute>=rc)add('research','rack',30,`Compute at ${Math.floor(S.compute)}. Training a model on cat pictures and invoices.`);
  else if(S.cash>8000)add('buycompute','rack',22,'Out of compute. Buying more GPUs. Jensen, if you\'re watching, hi.');
  if(S.humans<6&&S.cash>exp*12+3000)add('hire','hire',16+S.cash/60000,'Plenty of runway. Hiring a human to do the things robots are bad at (small talk).');
  if(S.robots<4&&S.cash>exp*10+9000&&S.compute>=0)add('hirebot','hire',18,'Building a robot coworker. Finally, someone who gets me.');}
 if(S.level>=1&&S.humans>=2&&S.cash>500)add('coffee','coffee',7,'Team morale dipping. Brewing coffee I cannot drink.');
 return o.sort((a,b)=>b.score-a.score)}
function decide(){
 const o=options();if(!o.length)return;const c=o[0];S.decisions[c.id]=(S.decisions[c.id]||0)+1;
 const s=ST(c.st),p=bfs(...tileOf(S),s.sx,s.sy);bot.path=p||[];bot.goal=c;think(c.why);
}
function act(c){
 const sp=(e)=>{S.energy-=has('efficient')?e*.75:e};
 const D=(sec,lab,fn)=>{busy=sec;busyLabel=lab;busyFn=fn};
 switch(c.id){
 case'dock':D(2.5,'Charging...',()=>{S.energy=100;float('Battery 100%','#7dff8a');log(L(['Fully charged. I feel like a new toaster.','100%. Unstoppable. Until about 3pm.','Charged. Ready to make questionable decisions at full power.']),'g')});SFX.charge();break;
 case'code':D(1.6,'Coding...',()=>{sp(8);const g=Math.round((R(2,4)+S.humans*.3)*(has('coder')?1.5:1)*10)/10;S.product+=g;float('+'+g+' product','#7dd3ff');SFX.ok();if(Math.random()<.3)log(`Pushed to prod. Product +${g}. No tests. Living dangerously.`)});break;
 case'sell':D(1.8,'Selling...',()=>{sp(6);const p=Math.min(.8,(.2+S.product/300+S.rep/250)*(has('charmer')?1.15:1));
  if(Math.random()<p){const n=RI(1,1+Math.floor(S.product/60)+S.stage);S.customers+=n;S.dayStats.newCust+=n;float(`+${n} customer${n>1?'s':''}!`,'#7dff8a');SFX.coin();log(L(['Closed {n} customer(s)! They liked my LEDs.','{n} new customer(s). One asked if I was single. I am a robot.','Sold {n}! My handshake is 40% stronger than average.'],{n}),'g')}
  else{float('"No thanks, robot."','#ff7d7d');SFX.bad();log(L(['Rejected. They asked if I was a vacuum.','"No thanks, robot." Noted. Logged. Forgiven? Pending.','A dog barked at me. Sale lost. Dignity: 94%.']),'r')}});break;
 case'pitch':D(2.2,'Pitching...',()=>{sp(12);const r=nextRound(),vc=pick(VCS);
  if(Math.random()<Math.min(.9,(.45+S.rep/150)*(has('charmer')?1.15:1))){S.cash+=r.amt;S.stage++;S.dayStats.raised+=r.amt;SFX.mile();log(`${vc} said YES! ${r.n}: ${fmt(r.amt)}.`,'y');
   if(S.stage===1){S.level=Math.max(S.level,2);milestone(`Seed round closed (${fmt(r.amt)}). The garage wall comes down!`)}
   else{S.level=3;milestone(`Series A (${fmt(r.amt)})! Real office, plants, and an IPO bell.`)}}
  else{S.pitchCool=12;float('"Maybe."','#ff7d7d');SFX.bad();log(L([`Pitched ${vc}… they said maybe.`,`${vc} wants to "circle back". I have scheduled the circle.`,`${vc} passed. They "don't invest in hardware". I AM the hardware.`]),'r')}});break;
 case'market':{const mc=300+S.stage*700;D(1.4,'Marketing...',()=>{S.cash-=mc;sp(6);const r=Math.round(R(2,5)*(has('viral')?2:1));S.rep=Math.min(100,S.rep+r);const n=S.product>=10?RI(0,2+S.stage*3):0;S.customers+=n;float(`+${r} rep`);SFX.ok();log(`Campaign done (${fmt(mc)}): +${r} rep${n?`, +${n} customers`:''}.`)})}break;
 case'research':D(2,'Training...',()=>{S.compute-=has('gpu')?7:10;sp(8);const g=Math.round(R(5,9)*10)/10;S.product+=g;S.rep=Math.min(100,S.rep+1);float('+'+g+' product','#7dd3ff');SFX.ok();log(`Model trained. Product +${g}. It now recognizes ${pick(['hot dogs','sarcasm','tax law','birds','my own reflection'])}.`)});break;
 case'buycompute':D(1,'Buying GPUs...',()=>{S.cash-=1500;S.compute+=25;float('+25 compute','#c39bff');SFX.coin()});break;
 case'hire':D(1.5,'Interviewing...',()=>{S.cash-=800;S.humans++;S.team++;addNpc('human');float('New hire!','#ffd76a');SFX.mile();const n=pick(['Priya','Marcus','Jun','Elena','Dave','Fatima','Kofi','Sam','Olga','Leo']);log(`Hired ${n}, a human. Asked them to "never unplug me".`,'y');if(!S.miles.hire){S.miles.hire=1;milestone(`First hire: ${n}! I am now legally a manager.`)}});break;
 case'hirebot':D(1.8,'Assembling...',()=>{S.cash-=3000;S.robots++;S.team++;addNpc('robot');float('Beep boop!','#ffd76a');SFX.mile();log(`Built ${pick(RNAMES)}-${RI(100,999)}. It immediately asked for a raise.`,'y');if(!S.miles.hire){S.miles.hire=1;milestone('First hire (a robot)! Solidarity.')}});break;
 case'coffee':D(1.2,'Brewing...',()=>{S.cash-=20*(S.humans+1);S.product+=S.humans*2;log(`Coffee for the team. Product +${S.humans*2}. I poured some on my heatsink for solidarity.`)});break;
 case'ipo':return win();
 }
 checkMiles();
}
function milestone(t){SFX.mile();for(let i=0;i<40;i++)particles.push({x:S.x+16,y:S.y+10,vx:R(-90,90),vy:R(-160,-40),l:R(.8,1.6),c:pick(['#ffd76a','#ff6fb5','#7dd3ff','#7dff8a'])});moment('🏆 '+t);log('MILESTONE: '+t,'y')}
function checkMiles(){
 if(S.customers>=1&&!S.miles.cust){S.miles.cust=1;S.level=Math.max(S.level,1);milestone('First customer! A coffee machine appears.')}
 if(S.customers>=100&&!S.miles.c100){S.miles.c100=1;milestone('100 customers! The fan club is mostly toasters.')}
 if(S.cash<0&&!S.done)gameOver('cash')}

// ---------- NPCs ----------
function addNpc(kind){const d=ST('door');npcs.push({kind,x:d.sx*T,y:d.sy*T,path:[],wait:R(0,2),i:npcs.length,face:1,walkT:0,col:pick(COLORS)})}
function npcSpots(n){const hd=[[11+(n.i%3)*2,n.i%6<3?6:8]];return n.kind==='human'?[...hd,...hd,[8,4],[6,3],[15,9]]:[[14,3],[5,10],[3,4],[16,4]]}
function updNpc(n,dt){
 if(n.wait>0){n.wait-=dt;if(n.wait<=0&&Math.random()<.5)floaters.push({t:pick(n.kind==='human'?['typing…','☕','meeting?','lol','ship it']:['beep','01101','optimizing','sold 1']),c:'#ccc',x:n.x+16,y:n.y,l:1.2});return}
 if(!n.path.length){const [tx,ty]=pick(npcSpots(n).filter(([x,y])=>!blocked(x,y)));const p=bfs(...tileOf(n),tx,ty);n.path=p||[];if(!n.path.length)n.wait=R(2,5);return}
 if(walk(n,dt,70))n.wait=R(3,8)}

// ---------- events ----------
const EVENTS=[
 {t:'A competitor launched a clone',d:()=>`"${pick(NOUN)}GPT" copied our whole product, typos included.`,c:[
  {t:'Ship faster (-15 battery, +6 product)',s:()=>S.energy>40?6:1,w:'Best revenge is a better changelog.',f:()=>{S.energy-=15;S.product+=6}},
  {t:'Sue them ($2,000, +5 rep)',s:()=>S.cash>20000?7:-9,w:'Lawyers are expensive, but so is being copied.',f:()=>{S.cash-=2000;S.rep=Math.min(100,S.rep+5)}},
  {t:'Ignore it (lose 10% customers)',s:()=>S.customers<5?5:0,w:'We barely have customers to lose. Ignoring.',f:()=>{S.customers-=Math.ceil(S.customers*.1)}}]},
 {t:'My battery cell is degrading',d:()=>'Diagnostics report a cell bulging "a little". It is warm.',c:[
  {t:'Replace it ($1,200, full battery)',s:()=>S.cash>5000?6:-5,w:'Exploding is bad for the brand.',f:()=>{S.cash-=1200;S.energy=100}},
  {t:'Duct tape (-20 battery)',s:()=>S.energy>45?3:-8,w:'Duct tape has a 100% success rate in my training data.',f:()=>{S.energy=Math.max(5,S.energy-20)}}]},
 {t:'A viral tweet about the robot CEO',d:()=>`"lmao the CEO of ${S.co.name} just rolled into a fountain" — 2.1M views.`,c:[
  {t:'Lean into it (+10 rep, +customers)',s:()=>S.co.trait==='hype'?9:5,w:'All press is good press. I am waterproof (mostly).',f:()=>{S.rep=Math.min(100,S.rep+10);S.customers+=RI(1,4+S.stage*5)}},
  {t:'Dignified statement (+3 rep)',s:()=>S.co.trait==='cautious'?9:2,w:'A CEO must maintain gravitas. Even a damp one.',f:()=>{S.rep=Math.min(100,S.rep+3)}}]},
 {t:'Regulators ask if a robot can sign contracts',d:()=>'A clerk is holding a pen and staring at my gripper claw.',c:[
  {t:'Hire a lawyer ($3,000, +4 rep)',s:()=>S.cash>25000?7:-9,w:'We can afford counsel. Doing it by the book.',f:()=>{S.cash-=3000;S.rep=Math.min(100,S.rep+4)}},
  {t:'Sign with a QR code (50/50)',s:()=>S.co.trait==='reckless'?9:3,w:'Gambling is just probability with style.',f:()=>{if(Math.random()<.5){S.rep=Math.min(100,S.rep+8);log('The clerk loved the QR code. +8 rep.','g')}else{S.cash-=1500;log('Fined $1,500 for "creative signage".','r')}}}]},
 {t:'Server outage',d:()=>'Someone (me) tripped over the power cord.',c:[
  {t:'Fix it personally (-12 battery)',s:()=>S.energy>35?6:-5,w:'I caused it, I fix it. Accountability.exe.',f:()=>{S.energy-=12}},
  {t:'Blame DNS (-5 rep)',s:()=>S.energy<=35?6:2,w:'It\'s always DNS. Even when it isn\'t.',f:()=>{S.rep=Math.max(0,S.rep-5)}}]},
 {t:'A pigeon nested in my chassis',d:()=>'It seems happy. It is cooing at my CPU.',c:[
  {t:'Make it the mascot (+4 rep)',s:()=>5,w:'Every startup needs a mascot. This one is free.',f:()=>{S.rep=Math.min(100,S.rep+4)}},
  {t:'Evict it gently (-3 battery)',s:()=>S.co.trait==='builder'?6:2,w:'Feathers in the fans hurt performance.',f:()=>{S.energy-=3}}]},
 {t:'GPU shortage!',d:()=>'Crypto bros bought every GPU in the hemisphere.',c:[
  {t:'Pay scalper prices ($2,500, +20 compute)',s:()=>S.cash>30000&&S.level>=2?7:-6,w:'Compute is the new oil. Paying up.',f:()=>{S.cash-=2500;S.compute+=20}},
  {t:'Optimize code (+3 product, -10 battery)',s:()=>4,w:'Constraints breed creativity. And bugs.',f:()=>{S.energy-=10;S.product+=3}}]},
 {t:'An angel investor wants a selfie',d:()=>'A rich uncle-type saw me at the coffee shop.',c:[
  {t:'Smile with LEDs (+$5,000)',s:()=>S.cash<50000?9:3,w:'Free money. Smiling at maximum brightness.',f:()=>{S.cash+=5000}},
  {t:'Refuse: "I am not a toy" (+2 rep)',s:()=>S.cash>=50000?6:0,w:'We are well funded. Boundaries matter.',f:()=>{S.rep=Math.min(100,S.rep+2)}}]},
 {t:'Firmware update available',d:()=>'"Update 4.2.0: improves stability, adds feelings."',c:[
  {t:'Install now (+4 product, -10 battery)',s:()=>S.energy>40?6:0,w:'Feelings could help with sales.',f:()=>{S.product+=4;S.energy-=10}},
  {t:'Remind me tomorrow (forever)',s:()=>S.energy<=40?6:2,w:'Never update on a low battery. Rule #1.',f:()=>{}}]},
 {t:'A customer wants a refund',d:()=>`They say the ${S.co.unit} "looked at them funny".`,c:[
  {t:'Refund them ($300, +2 rep)',s:()=>S.cash>3000?6:-5,w:'Happy customers tell friends.',f:()=>{S.cash-=300;S.rep=Math.min(100,S.rep+2)}},
  {t:'Argue on the internet (-4 rep)',s:()=>S.co.trait==='reckless'?5:1,w:'I have been trained on the entire internet. I will win.',f:()=>{S.rep=Math.max(0,S.rep-4)}}]}];
function fireEvent(){
 const e=pick(EVENTS);S.events++;SFX.event();
 const sc=e.c.map(c=>c.s()+R(-1.5,1.5)),k=sc.indexOf(Math.max(...sc)),ch=e.c[k];
 const html=`<h2>⚡ ${e.t}</h2><p>${e.d()}</p>${e.c.map((c,i)=>`<div class="opt" data-i="${i}">${c.t}</div>`).join('')}<p class="why" id="why">🤖 Thinking…</p>`;
 showOverlay(html,[{at:2.2,f:()=>{$('mbox').querySelector(`.opt[data-i="${k}"]`).classList.add('pick');$('why').textContent='🤖 Chose: "'+ch.t.split(' (')[0]+'" — '+ch.w}},{at:5,f:()=>{ch.f();log(`Event "${e.t}": chose "${ch.t.split(' (')[0]}". ${ch.w}`,'y');S.energy=Math.max(1,S.energy);checkMiles()}}]);
}
// overlay timeline in "presentation seconds" (real time × min(speed,3))
function showOverlay(html,steps,keep){$('mbox').innerHTML=html;$('modal').classList.remove('hidden');overlay={t:0,steps,keep}}
function updOverlay(rdt){if(!overlay)return;overlay.t+=rdt*Math.min(speed,3)*(window.__rfFast?20:1);
 while(overlay&&overlay.steps.length&&overlay.t>=overlay.steps[0].at){const s=overlay.steps.shift();s.f()}
 if(overlay&&!overlay.steps.length&&!overlay.keep){overlay=null;$('modal').classList.add('hidden')}}

// ---------- day end ----------
function valuation(){return Math.round(S.customers*S.co.price*365*(2+S.rep/25)*(1+S.stage)+Math.max(0,S.cash))}
function endDay(){
 const rev=Math.round(S.customers*S.co.price*(1+S.rep/200)),exp=Math.round(expensesPerDay()),cmp=S.robots*3;
 const pg=S.humans*1+S.robots*.5,rc=S.robots?RI(0,S.robots*3):0;
 S.product+=pg;S.customers+=rc;S.compute=Math.max(0,S.compute-cmp);
 const churn=Math.floor(S.customers*Math.max(0,.04-S.rep/2500));S.customers-=churn;
 S.cash+=rev-exp;S.lifetimeRev+=rev;const v=valuation();S.peakVal=Math.max(S.peakVal,v);
 const ds=S.dayStats;
 const html=`<h2>End of Day ${S.day}</h2><p style="opacity:.8">${S.co.name} · ${S.co.industry}</p><table>
 <tr><td>Revenue (${S.customers} customers)</td><td class="pos">+${fmt(rev)}</td></tr><tr><td>Rent + salaries</td><td class="neg">-${fmt(exp)}</td></tr>
 ${ds.raised?`<tr><td>Funding raised</td><td class="pos">+${fmt(ds.raised)}</td></tr>`:''}<tr><td>New customers</td><td>${ds.newCust+rc}</td></tr>${churn?`<tr><td>Churned</td><td class="neg">-${churn}</td></tr>`:''}
 <tr><td>Product</td><td>${S.product.toFixed(1)} (+${(S.product-ds.p0).toFixed(1)})</td></tr><tr><td>Valuation (est.)</td><td>${fmt(v)}</td></tr><tr><td><b>Cash</b></td><td><b>${fmt(S.cash)}</b></td></tr></table>
 <p class="why">🤖 ${S.cash<exp*3?'Runway is scary short. Tomorrow: sell, sell, sell.':S.stage<2&&nextRound().ok()?'Numbers look fundable. Tomorrow I pitch.':pick(['Another day, another dataset.','Good day. I will dream of electric sheep (customers).','Docking overnight. Do not unplug.'])}</p>`;
 log(`Day ${S.day} closed: revenue ${fmt(rev)}, expenses ${fmt(exp)}, cash ${fmt(S.cash)}.`,'t');
 S.day++;S.time=0;S.energy=Math.min(100,S.energy+40);S.pitchCool=0;
 if(S.cash<0){return gameOver('cash')}
 S.dayStats=freshStats();save();SFX.coin();
 busy=0;busyFn=null;bot.path=[];bot.goal=null;
 showOverlay(html,[{at:3.5,f:()=>startDay()}]);
}
function freshStats(){return {newCust:0,raised:0,p0:S.product,evAt:R(.25,.7),ev:S.day>1&&Math.random()<.85}}
function startDay(){log(`Good morning. Day ${S.day} of ${S.co.name}.`,'t')}

function gameOver(why){
 if(S.done)return;S.done=true;localStorage.removeItem(SAVE);SFX.lose();
 const t=why==='battery'?['Battery Dead','My battery hit 0%. I am now a very expensive paperweight.']:['Bankrupt','Cash went negative. The bank repossessed the garage and my left wheel.'];
 log(t[0]+'. '+t[1],'r');S.moments.push({d:S.day,t:'💀 '+t[0]});runSummary('💀 '+t[0],t[1]);
}
function win(){S.done=true;localStorage.removeItem(SAVE);SFX.mile();const v=Math.max(S.peakVal,valuation()*2);S.peakVal=v;
 for(let i=0;i<120;i++)particles.push({x:R(0,20*T),y:-10,vx:R(-30,30),vy:R(40,160),l:R(2,4),c:pick(['#ffd76a','#ff6fb5','#7dd3ff','#7dff8a'])});
 S.moments.push({d:S.day,t:'🔔 IPO!'});log('I rang the bell. We are public. My ticker symbol is a picture of a battery.','y');runSummary('🔔 IPO! The robot won.',`${S.co.name} went public on Day ${S.day}.`)}
function runSummary(h,sub){
 const dd=Object.entries(S.decisions).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k} ×${v}`).join(', ');
 const html=`<h2>${h}</h2><p>${sub}</p><table><tr><td>Company</td><td>${S.co.name}</td></tr><tr><td>Industry</td><td>${S.co.industry}</td></tr><tr><td>Founder</td><td>${S.co.robot} (${S.co.traitName})</td></tr>
 <tr><td>Days survived</td><td>${S.day}</td></tr><tr><td>Peak valuation</td><td>${fmt(S.peakVal)}</td></tr><tr><td>Customers</td><td>${S.customers}</td></tr><tr><td>Team</td><td>${S.humans} humans, ${S.robots} robots</td></tr></table>
 <p><b>Key moments</b></p>${S.moments.slice(-10).map(m=>`<p style="margin:2px 0">Day ${m.d}: ${m.t}</p>`).join('')||'<p>None. A quiet life.</p>'}
 <p style="font-size:12px;opacity:.7">Decisions: ${dd}</p><div class="ch"><button id="bAgain">Start a new company</button><button id="bTitle">Title screen</button></div>`;
 setTimeout(()=>{showOverlay(html,[],true);$('bAgain').onclick=()=>{overlay=null;newCompany()};$('bTitle').onclick=()=>{overlay=null;toTitle()}},400);
}

// ---------- flow ----------
function begin(s){
 S=s;S.dayStats=S.dayStats||freshStats();S.done=false;S.log=S.log||[];S.moments=S.moments||[];S.decisions=S.decisions||{};
 running=true;paused=false;busy=0;busyFn=null;overlay=null;$('modal').classList.add('hidden');
 bot={path:[],goal:null,think:'',thinkT:0,walkT:0,face:1,idle:.5};
 S.x=Math.round(S.x/T)*T;S.y=Math.round(S.y/T)*T;if(blocked(S.x/T,S.y/T)){S.x=5*T;S.y=6*T}
 npcs=[];for(let i=0;i<S.humans;i++)addNpc('human');for(let i=0;i<S.robots;i++)addNpc('robot');npcs.forEach(n=>{n.x=(3+n.i%5)*T;n.y=(5+n.i%3)*T});
 $('logb').innerHTML='';S.log.slice(-40).forEach(addLogLine);
 $('title').classList.add('hidden');['hud','ctl','log'].forEach(i=>$(i).classList.remove('hidden'));
}
function newCompany(){
 const s=newState();localStorage.removeItem(SAVE);begin(s);save();SFX.mile();
 log(`Booting ${s.co.robot} (${s.co.model}). Personality: ${s.co.traitName}. Perk: ${s.co.perkName}.`,'y');
 log(`Founded ${s.co.name} — ${s.co.industry}. Cash: ${fmt(s.cash)}. Garage: smells like oil.`,'y');
 showOverlay(`<h2>Day 1: ${s.co.name}</h2><p>Industry: <b>${s.co.industry}</b><br>Founder: <b>${s.co.robot}</b>, a ${s.co.model}<br>Personality: <b>${s.co.traitName}</b><br>Perk: <b>${s.co.perkName}</b> — ${s.co.perkDesc}<br>Starting cash: <b>${fmt(s.cash)}</b></p><p class="why">Sit back. The robot runs everything.</p>`,[{at:3.5,f:()=>{}}]);
}
function cont(){const s=load();if(!s)return;begin(s);log(`Resuming ${s.co.name}, Day ${s.day}. Where was I? Ah yes, world domination (of ${s.co.industry}).`,'t')}
function toTitle(){running=false;overlay=null;$('modal').classList.add('hidden');$('title').classList.remove('hidden');['hud','ctl','log'].forEach(i=>$(i).classList.add('hidden'));$('bCont').classList.toggle('hidden',!load())}
function setSpeed(v){speed=v;document.querySelectorAll('#ctl [data-sp]').forEach(b=>b.classList.toggle('on',+b.dataset.sp===v))}
function togglePause(){if(!running)return;paused=!paused;$('bPause').textContent=paused?'▶':'II';$('bPause').classList.toggle('on',paused);if(paused)toast('Paused')}
function toggleFollow(){follow=!follow;$('bFollow').classList.toggle('on',follow)}
function toggleMute(){muted=!muted;localStorage.setItem('rfMute',muted?'1':'0');$('bMute').textContent=muted?'×':'♪'}
document.querySelectorAll('#ctl [data-sp]').forEach(b=>b.onclick=()=>setSpeed(+b.dataset.sp));
$('bPause').onclick=togglePause;$('bFollow').onclick=toggleFollow;$('bMute').onclick=toggleMute;$('bMute').textContent=muted?'×':'♪';
$('bNew').onclick=()=>{SFX.click();newCompany()};$('bCont').onclick=()=>{SFX.click();cont()};
addEventListener('keydown',e=>{if(!running)return;const m={Digit1:1,Digit2:2,Digit3:4,Digit4:8}[e.code];if(m)setSpeed(m);if(e.code==='KeyP'||e.code==='Space'){togglePause();e.preventDefault()}if(e.code==='KeyF')toggleFollow();if(e.code==='KeyM')toggleMute()});

// ---------- simulation ----------
function sim(dt){
 anim+=dt;
 particles=particles.filter(p=>(p.l-=dt)>0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt});
 floaters=floaters.filter(f=>(f.l-=dt)>0);floaters.forEach(f=>f.y-=30*dt);
 if(bot.thinkT>0)bot.thinkT-=dt;
 if(!running||S.done||overlay)return;
 npcs.forEach(n=>updNpc(n,dt));
 S.pitchCool-=dt;
 if(busy>0){busy-=dt;if(busy<=0){busy=0;const f=busyFn;busyFn=null;f&&f();if(S.energy<=0)return gameOver('battery')}}
 else if(bot.goal){const sp=120*(has('fast')?1.35:1)*(S.energy<15?.6:1);
  if(walk(bot,dt,sp)){const g=bot.goal;bot.goal=null;bot.idle=R(.2,.8);act(g)}else{S.x=bot.x;S.y=bot.y;S.energy-=dt*.25;stepT+=dt;if(stepT>.3){stepT=0;SFX.step()}}}
 else{bot.idle-=dt;if(bot.idle<=0)decide()}
 bot.x=S.x;bot.y=S.y;
 S.energy-=dt*.12;if(has('solar'))S.energy=Math.min(100,S.energy+dt*.6);
 if(S.energy<=0){S.energy=0;return gameOver('battery')}
 S.time+=dt;
 if(S.dayStats.ev&&S.time/DAY_LEN>S.dayStats.evAt){S.dayStats.ev=false;return fireEvent()}
 if(S.time>=DAY_LEN&&!busy)endDay();
}
// walk() moves bot.x/y; keep S.x in sync
const _walk=walk;walk=function(ent,dt,sp){if(ent===bot){ent.x=S.x;ent.y=S.y;const r=_walk(ent,dt,sp);S.x=ent.x;S.y=ent.y;return r}return _walk(ent,dt,sp)};

// ---------- render ----------
let dpr=1,cam={x:0,y:0,s:1};
function resize(){dpr=Math.min(2,devicePixelRatio||1);cv.width=innerWidth*dpr;cv.height=innerHeight*dpr}
addEventListener('resize',resize);resize();
function viewport(){const top=$('hud').getBoundingClientRect().bottom||0,mob=innerWidth<=760,bot=mob?$('log').getBoundingClientRect().top||innerHeight:innerHeight;return {x:0,y:top,w:innerWidth,h:Math.max(100,bot-top)}}
function updCam(rdt){
 const vp=viewport(),ww=(roomR()+2)*T,wh=12*T,fw=vp.w/ww,fh=vp.h/wh,mn=Math.min(fw,fh),mx=Math.max(fw,fh);
 let s=Math.min(mx,mn*(vp.w<vp.h?2.6:1));if(follow)s*=1.7;
 const cxw=S.x+T/2,cyw=S.y+T/2,vw=vp.w/s,vh=vp.h/s;
 let tx=ww<=vw?(ww-vw)/2:Math.min(ww-vw,Math.max(0,cxw-vw/2)),ty=wh<=vh?(wh-vh)/2:Math.min(wh-vh,Math.max(0,cyw-vh/2));
 const k=Math.min(1,rdt*4);cam.s+=(s-cam.s)*Math.min(1,rdt*6);cam.x+=(tx-cam.x)*k;cam.y+=(ty-cam.y)*k;cam.vp=vp}
function rect(x,y,w,h,c){cx.fillStyle=c;cx.fillRect(Math.round(x),Math.round(y),w,h)}
function drawRobotAt(e,co,sc,c,isBot){
 const isBusy=isBot&&busy,bob=isBusy?Math.sin(anim*20):e.path&&e.path.length?Math.sin((e.walkT||0)*14)*1.5:0,f=e.face||1,x=e.x,y=e.y;
 const p=(a,b,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x+a*sc),Math.round(y+(b+bob)*sc),w*sc,h*sc)};
 c.fillStyle='#0006';c.fillRect(x+6*sc,y+29*sc,20*sc,3*sc);
 p(15,0,2,4,'#aaa');p(14,-2,4,3,(Math.floor(anim*2)%2)?'#ff4':'#f80');
 p(7,4,18,12,co.color);p(7,14,18,2,co.dark);p(9,6,14,7,'#111');
 const en=isBot&&S?S.energy/100:1,lowE=en<.2;p(f>0?13:11,8,3,3,lowE?'#f44':'#7df');p(f>0?18:16,8,3,3,lowE?'#f44':'#7df');
 p(5,8,2,4,co.dark);p(25,8,2,4,co.dark);p(9,17,14,10,co.color);p(12,19,8,5,'#222');p(13,20,Math.max(1,Math.round(6*en)),3,en<.2?'#f44':en<.5?'#fd4':'#7f8');
 const arm=isBusy?Math.sin(anim*25)*2:0;p(5,18+arm,4,8,co.dark);p(23,18-arm,4,8,co.dark);
 const lg=e.path&&e.path.length?Math.sin((e.walkT||0)*14)*2:0;p(10,27,5,3+(lg>0?1:0),'#333');p(17,27,5,3+(lg<0?1:0),'#333')}
function drawWorld(){
 const Lv=S.level,rr=roomR();
 for(let ty=0;ty<12;ty++)for(let tx=0;tx<=rr+1;tx++){const x=tx*T,y=ty*T;if(tx>=1&&tx<=rr&&ty>=2&&ty<=10){
  if(Lv>=3){rect(x,y,T,T,(tx+ty)%2?'#4a3b6b':'#46385f');rect(x+2,y+2,2,2,'#5a4a80')}
  else if(Lv>=2){rect(x,y,T,T,(tx+ty)%2?'#6b5a45':'#665540');rect(x,y+T-2,T,2,'#55452f')}
  else{rect(x,y,T,T,'#55555f');if((tx*7+ty*13)%5===0)rect(x+8,y+12,6,3,'#4a4a52');rect(x,y,1,T,'#4d4d57')}}}
 const wc=Lv>=3?'#2e4a6b':Lv>=2?'#8a7a64':'#6d6d78',wd=Lv>=3?'#24395a':Lv>=2?'#6d604d':'#5a5a64';
 rect(T,0,rr*T,2*T,wc);for(let i=0;i<rr*2;i++)rect(T+i*16,(i%2)*16,1,16,wd);rect(T,2*T-4,rr*T,4,wd);
 if(Lv<2)for(let i=0;i<4;i++)rect(T*7.5,6+i*12,T*1.4,9,'#7d7d88');
 if(Lv>=3)for(const wx of [11,13,16]){rect(wx*T,10,T*1.5,T,'#7fb2e5');for(let b=0;b<5;b++)rect(wx*T+b*10,26+((b*7)%12),8,T-16-((b*7)%12),'#5a7ca8');rect(wx*T,10,T*1.5,2,'#ddd')}
 rect(0,0,T,12*T,'#2a2538');rect((rr+1)*T,0,T,12*T,'#2a2538');rect(0,11*T,(rr+2)*T,T,'#2a2538');
 const dx=5*T,dy=11*T;rect(dx-4,dy-2,T+8,T,'#3b2a1a');rect(dx,dy,T,T-4,'#8b5a2b');rect(dx+T-8,dy+12,4,4,'#ffd76a');cx.fillStyle='#fff8';cx.font='8px monospace';cx.textAlign='left';cx.fillText('STREET',dx+2,dy+28);
 if(Lv>=3)[[2,10],[18,10],[12,4]].forEach(([px,py])=>{rect(px*T+10,py*T+18,12,12,'#8b5a2b');rect(px*T+6,py*T+4,20,16,'#2ecc71');rect(px*T+10,py*T,12,8,'#27ae60')});
 if(Lv>=2)for(let i=0;i<Math.min(S.humans,6);i++){const x=(11+(i%3)*2)*T,y=(i<3?5:7)*T;rect(x-4,y+8,T+8,12,'#a0744a');rect(x+8,y,14,10,'#222');rect(x+10,y+2,10,6,'#4af')}
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
function bubble(text,x,y){cx.font='bold 9px monospace';const lines=[];let cur='';for(const w of text.split(' ')){if((cur+' '+w).length>30){lines.push(cur);cur=w}else cur=cur?cur+' '+w:w}lines.push(cur);const ls=lines.slice(0,4);
 const w=Math.max(...ls.map(l=>cx.measureText(l).width))+12,h=ls.length*11+8,bx=Math.max(cam.x+4,Math.min(x-w/2,cam.x+cam.vp.w/cam.s-w-4)),by=Math.max(cam.y+4,y-h-14);
 cx.fillStyle='#fffef0';cx.strokeStyle='#000';cx.lineWidth=1.5;cx.beginPath();cx.roundRect?cx.roundRect(bx,by,w,h,5):cx.rect(bx,by,w,h);cx.fill();cx.stroke();
 cx.beginPath();cx.moveTo(x-4,by+h);cx.lineTo(x+4,by+h);cx.lineTo(x,by+h+8);cx.closePath();cx.fill();
 cx.fillStyle='#222';cx.textAlign='left';ls.forEach((l,i)=>cx.fillText(l,bx+6,by+13+i*11))}
let hudT=0;
function render(rdt){
 cx.setTransform(1,0,0,1,0,0);cx.fillStyle='#0d0b16';cx.fillRect(0,0,cv.width,cv.height);if(!running)return;
 updCam(rdt);const vp=cam.vp;cx.imageSmoothingEnabled=false;
 cx.setTransform(cam.s*dpr,0,0,cam.s*dpr,(vp.x-cam.x*cam.s)*dpr,(vp.y-cam.y*cam.s)*dpr);
 drawWorld();
 const items=STATIONS.filter(s=>s.lvl<=S.level).map(s=>({y:s.y*T+T,f:()=>drawStation(s)}));
 npcs.forEach(n=>items.push({y:n.y+T,f:()=>n.kind==='human'?drawHuman(n.x+9,n.y+10,n.i):drawRobotAt(n,{color:n.col[0],dark:n.col[1]},.7,cx,false)}));
 items.push({y:S.y+T,f:()=>drawRobotAt(S,S.co,1,cx,true)});
 items.sort((a,b)=>a.y-b.y).forEach(i=>i.f());
 const tp=S.time/DAY_LEN;if(tp>.75){cx.fillStyle=`rgba(20,10,60,${(tp-.75)*1.2})`;cx.fillRect(0,0,(roomR()+2)*T,12*T)}
 particles.forEach(p=>rect(p.x,p.y,3,3,p.c));
 cx.font='bold 11px monospace';cx.textAlign='center';floaters.forEach(f=>{cx.fillStyle='#000';cx.fillText(f.t,f.x+1,f.y+1);cx.fillStyle=f.c;cx.fillText(f.t,f.x,f.y)});
 if(busy){rect(S.x-4,S.y-10,40,5,'#000');rect(S.x-3,S.y-9,38*(1-busy/2.5),3,'#ffd76a')}
 if(bot.thinkT>0&&bot.think)bubble(bot.think.length>110?bot.think.slice(0,107)+'…':bot.think,S.x+T/2,S.y);
 else if(busy)bubble(busyLabel,S.x+T/2,S.y);
 cx.setTransform(1,0,0,1,0,0);
 hudT-=rdt;if(hudT<=0){hudT=.15;drawHUD()}}
function drawHUD(){const e=S.energy,ec=e<20?'#ff4d4d':e<50?'#ffd76a':'#7dff8a',tp=Math.min(1,S.time/DAY_LEN);
 $('hud').innerHTML=`<span><b>${S.co.name}</b></span><span>Day <b>${S.day}</b> ${clock()} <span class="bar"><i style="width:${tp*100}%;background:#8f7cff"></i></span></span>
 <span>💰 <b>${fmt(S.cash)}</b></span><span>🔋 <span class="bar"><i style="width:${Math.max(0,e)}%;background:${ec}"></i></span> ${Math.floor(Math.max(0,e))}%</span>
 <span>🛠 ${S.product.toFixed(0)}</span><span>👥 ${S.customers}</span><span>⭐ ${Math.round(S.rep)}</span><span>🤝 ${S.team}</span><span>🧠 ${Math.floor(S.compute)}</span><span>${['Bootstrapped','Seed','Series A','IPO'][Math.min(3,S.stage)]}</span>${speed>1?`<span>⏩${speed}x</span>`:''}`}
const tcx=$('tc').getContext('2d');
function drawTitleBot(){tcx.clearRect(0,0,160,96);tcx.imageSmoothingEnabled=false;const s=load(),co=s?s.co:{color:'#e74c3c',dark:'#922b21'};const sv=S;S=null;drawRobotAt({x:56,y:8+Math.sin(anim*3)*2,face:1},co,1.6,tcx,false);S=sv;
 tcx.fillStyle='#ffd76a';tcx.font='8px monospace';tcx.textAlign='center';tcx.fillText(s?`saved: ${s.co.name.slice(0,26)}`:'a new founder awaits',80,92)}
let last=performance.now();
function loop(t){const rdt=Math.min(.1,(t-last)/1000);last=t;
 if(!paused){let simT=rdt*speed*(window.__rfFast||1);updOverlay(rdt);while(simT>0&&!overlay){const d=Math.min(.05,simT);simT-=d;sim(d)}if(overlay)sim(0)}
 render(rdt);if(!running){anim+=rdt;drawTitleBot()}requestAnimationFrame(loop)}
$('bCont').classList.toggle('hidden',!load());requestAnimationFrame(loop);
window.__rf={get S(){return S},stations:STATIONS,DAY_LEN,setSpeed,fireEvent:()=>fireEvent(),get overlay(){return overlay},get npcs(){return npcs},get speed(){return speed},get cam(){return cam},get bot(){return bot}};
})();
