// Robot Founder — continuous idea engine (prep mode, no money). Runs in the browser AND in Node (GitHub Action → research/backlog.json).
// Expands subjects × styles × products × occasions × niches, scores on research/market.json signals, applies guardrails.
(function(root){
const STYLES=[['watercolor',1.0],['christmas illustrated',1.0],['renaissance royal',1.05],['minimalist line art',.9],['pop art',.85],['vintage travel poster',.8],['cartoon caricature',.85],['oil painting',.95],['pastel kawaii',.8],['boho floral',.85],['stained glass',.75],
 // risky styles exist on purpose so guardrails visibly reject them (buyers search for these; using them risks IP takedowns)
 ['Disney princess style',1.2],['Marvel superhero',1.1],['Pixar 3D',1.1],['Studio Ghibli style',1.1],['Star Wars Jedi',1],['Harry Potter house',1],['Pokemon trainer',1],['AKC champion badge',.9]];
const PRODUCTS=[['Mug 11oz',24],['Poster 18x24',39],['Canvas 12x16',69],['Canvas 16x20',89],['Fleece blanket 50x60',69],['Digital portrait',29]];
const OCC=[['everyday','',1],['Christmas','christmas',null],['birthday','birthday',1],['memorial','memorial',1],["Mother's Day",'mothers day',null],["Father's Day",'fathers day',.8],["Valentine's",'valentine',null],['gotcha day','adoption',.7],['new puppy','new puppy',.6]];
const NICHES=[['single pet','',1],['couple + pet','couple',.8],['family + pet','family',.75],['two pets','two',.85],['pet + owner portrait','owner',.8]];
const HORSES=[['Quarter_Horse',.22],['Arabian_horse',.2],['Thoroughbred',.2],['Friesian_horse',.15]];
const EXOTIC=[['Budgerigar',.1],['Holland_Lop',.08],['Bearded_dragon',.08]];
const TM=['disney','marvel','pixar','ghibli','star wars','jedi','harry potter','pokemon','snoopy','peanuts','garfield','scooby','paw patrol','bluey','hello kitty','nfl','nba','mlb','akc','westminster','kennel club','crufts','barbie','lego','minions','grinch','yoda','nike','coca'];
const SEAS={christmas:12,valentine:2,'mothers day':5,'fathers day':6};
const E=root.ECON;
function margin(prod,price){if(!E)return .45;const v=(E.lines.find(l=>l.mode==='pod').variants[2]).find(x=>x[0]===prod),f=E.etsy,fee=f.listingFee+(f.txnPct+f.payPct)*price+f.payFixed,c=v?v[2]+v[3]:0;return (price-fee-c-E.pod.aiPerPortrait)/price}
const MARG={'Mug 11oz':.47,'Poster 18x24':.59,'Canvas 12x16':.59,'Canvas 16x20':.62,'Fleece blanket 50x60':.56,'Digital portrait':.86};
function seasonal(occKey,month,mk){// real Wikipedia seasonal peak months from market.json when available; months-ahead window 1–3 = boost
 const peak=SEAS[occKey];if(!peak)return 1;const ahead=(peak-month+12)%12;return ahead>=1&&ahead<=3?1.6:ahead===0?1.2:.55}
function norm(t){return t.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>2&&!['and','the','for','gift','portrait','custom','pet'].includes(w))}
function jac(a,b){const A=new Set(a),B=new Set(b);let i=0;A.forEach(x=>B.has(x)&&i++);return i/(A.size+B.size-i)}
const MODS=[['gold leaf accent','gold leaf pet portrait'],['birth flower wreath','birth flower pet portrait'],['zodiac constellation','zodiac pet portrait'],['neon sign','neon pet art'],['botanical vintage','vintage botanical pet'],['tarot card','pet tarot card'],['astronaut','astronaut pet portrait'],['chef / baker','pet chef portrait'],['mid-century modern','mid century pet art'],['papercut','paper cut pet art'],['ukiyo-e woodblock','woodblock pet print'],['cozy cabin','cozy pet portrait'],['beach coastal (Space Coast)','beach dog portrait'],['rocket launch (Space Coast)','space coast dog'],['retro 70s sunset','retro dog art'],['map of hometown','hometown map pet']];
const XN=['single pet','pet + owner portrait','two pets','family + pet'];
function rng(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>((h=Math.imul(h^(h>>>15),2246822507)>>>0)%1e6)/1e6}
function propose(today,prev){// keep past experiments (cumulative), add 2 new seeded by date; retire after 21 days without data
 const R=rng(today),ex=prev.map(e=>({...e,status:(Date.parse(today)-Date.parse(e.started))/864e5>21?'retired (no data — Etsy not connected)':e.status}));
 const used=new Set(ex.map(e=>e.label));const base=['watercolor','minimalist line art','oil painting','pastel kawaii'];
 for(let k=ex.some(e=>e.started===today)?2:0,tries=0;k<2&&tries<50;tries++){const m=MODS[Math.floor(R()*MODS.length)],b=base[Math.floor(R()*base.length)],label=b+' + '+m[0];if(used.has(label))continue;used.add(label);
  ex.push({id:'exp'+today.replace(/-/g,'')+k,label,kw:m[1],niche:XN[Math.floor(R()*XN.length)],started:today,status:'testing — waiting for real views/sales',metric:'favorites per 100 views vs. house style (needs Etsy)'});k++}
 return ex.filter(e=>!e.status.startsWith('retired')||(Date.parse(today)-Date.parse(e.started))/864e5<60)}

// ================= wide net: general gift ideas from research/taxonomy.json (data-driven; grow the JSON) =================
function generateGeneral(tax,market,o){const TMX=[...new Set([...TM,...(tax.trademark_blocklist||[])])],R=rng('g'+o.today),hsh=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
 const fee=p=>.2+.095*p+.25,mg=(p,c)=>(p-fee(p)-c)/p;const mon=o.month,season=m=>!m?1:(()=>{const a=(m-mon+12)%12;return a>=1&&a<=2?1.7:a===0?1.25:a===3?1.1:.5})();
 const auto=((market.trends&&market.trends.auto_added)||[]).map(n=>({n:n.toLowerCase(),w:1.15,auto:true}));
 const AUD=[...Object.entries(tax.audiences).flatMap(([k,v])=>v.map(a=>({...a,k}))),...auto.map(a=>({...a,k:'hobby'}))];
 const LOC=[...tax.locations.states.map(n=>({n,k:'state'})),...tax.locations.cities.map(n=>({n,k:'city'})),...tax.locations.beaches.map(n=>({n,k:'beach'}))];
 const POD=tax.products.pod.filter(p=>p.cat!=='pet'),DIG=tax.products.digital,occ=tax.occasions,tones=tax.tones,aes=tax.aesthetics;
 const kindW={profession:.9,hobby:1,role:1.05,state:.75,city:.8,beach:.85};
 const theo=(AUD.length*occ.length+LOC.length*occ.length)*tones.length*aes.length*(POD.length+DIG.length);
 const st={candidates:0,rejected:{}},acc=[],rej=[],byK={};const bump=(r,t)=>{const k=r.split(':')[0];st.rejected[k]=(st.rejected[k]||0)+1;if(rej.length<300&&(/trademark/.test(r)||R()<.01))rej.push({title:t,reason:r})};
 const cap=s=>s.replace(/(^|[\s\/-])([a-z])/g,(m,a,b)=>a+b.toUpperCase());
 const push=(c)=>{st.candidates++;const low=c.title.toLowerCase(),tm=TMX.find(t=>new RegExp('(^|[^a-z])'+t.replace(/[.*+?^${}()|[\]\\']/g,'\\$&')+'([^a-z]|$)').test(low));
  if(tm)return bump('trademark/copyright: "'+tm+'"',c.title);if(c.score<o.minScore)return bump('below quality threshold',c.title);
  const K=c.subject+'|'+c.product,L=byK[K]||(byK[K]=[]),nt=norm(c.title);if(L.length>=2||L.some(x=>jac(x,nt)>=.7))return bump('near-duplicate of a higher-scored idea',c.title);L.push(nt);acc.push(c)};
 const cands=[];
 for(const a of AUD){const h=hsh(a.n);// per audience: best 4 occasions now (season-weighted) + birthday/just because; products & styles rotate daily (exploration)
  const os=occ.map(x=>({x,s:x.w*season(x.month)})).sort((p,q)=>q.s-p.s).slice(0,3).map(z=>z.x).concat(occ.filter(x=>x.n==='birthday'||x.n==='just because'));
  for(const oc of os)for(let j=0;j<3;j++){const isDig=j===2,pr=isDig?DIG.filter(d=>d.fit==='any'||(d.fit==='event'&&oc.type==='event')||(d.fit==='wedding'&&/wedding|bridal|bride|groom|maid|best man/.test(oc.n+a.n))||(d.fit==='teacher'&&/teacher/.test(a.n))||(d.fit==='career'&&a.k==='profession'))[(h+j+Math.floor(R()*7))%5]:POD[(h+j*17+Math.floor(R()*POD.length))%POD.length];if(!pr)continue;
   const tone=tones[(h+j+Math.floor(R()*tones.length))%tones.length],ae=aes[(h*3+j+Math.floor(R()*aes.length))%aes.length];const price=pr.price,m=mg(price,pr.cost||0);
   const title=cap(`${tone==='funny'||tone==='sarcastic'||tone==='pun'?cap(tone)+' ':''}${a.n} ${oc.n==='just because'?'':oc.n+' '}${pr.n} — ${ae} ${tone==='personalized name'?'personalized ':''}gift for ${a.k==='role'?'a '+a.n:a.k==='profession'?a.n+'s':a.n+' lovers'}`).replace(/\s+/g,' ').slice(0,140);
   cands.push({id:'g'+h.toString(36)+oc.n.length+j,title,category:a.k,subject:a.n,kind:'general',style:ae,tone,product:pr.n,price,occasion:oc.n,niche:a.k+(a.auto?' (auto-added from trends)':''),score:+(a.w*kindW[a.k]*oc.w*season(oc.month)*(m/.6)*.55).toFixed(3),est_margin:+m.toFixed(2),keyword:`${a.n} ${oc.n==='just because'?'gift':oc.n} ${pr.n.toLowerCase().split(' ')[0]}`.toLowerCase(),ai_disclosure:true,digital:isDig,channels:['etsy','shopify'],auto:!!a.auto})}}
 for(const l of LOC){const h=hsh(l.n);for(let j=0;j<3;j++){const pr=POD[(h+j*11+Math.floor(R()*POD.length))%POD.length],ae=aes[(h+j+Math.floor(R()*aes.length))%aes.length],oc=occ.find(x=>x.n===(l.k==='beach'?'summer vacation':j===1?'housewarming':'just because'));
  const m=mg(pr.price,pr.cost);cands.push({id:'l'+h.toString(36)+j,title:cap(`${ae} ${l.n} ${pr.n} — ${l.k==='beach'?'beach vacation souvenir':l.k==='state'?'home state pride':'hometown'} gift`).slice(0,140),category:'location',subject:l.n,kind:'general',style:ae,product:pr.n,price:pr.price,occasion:oc.n,niche:l.k,score:+(kindW[l.k]*oc.w*season(oc.month)*(m/.6)*.55).toFixed(3),est_margin:+m.toFixed(2),keyword:`${l.n} ${l.k==='beach'?'beach':''} ${pr.n.split(' ')[0]}`.toLowerCase().replace(/\s+/g,' '),ai_disclosure:true,digital:false,channels:['etsy','shopify']})}}
 cands.sort((a,b)=>b.score-a.score).forEach(push);
 return {acc,rej,stats:{theoretical_combinations:theo,candidates:st.candidates,rejected_by:st.rejected,passed:acc.length,taxonomy:{occasions:occ.length,professions:tax.audiences.profession.length,hobbies:tax.audiences.hobby.length,roles:tax.audiences.role.length,auto_added_niches:auto.length,tones:tones.length,aesthetics:aes.length,locations:LOC.length,pod_products:tax.products.pod.length,digital_products:DIG.length,trademark_terms:TMX.length}}}}
function generate(market,opt={}){const o={explore:opt.explore??.1,digitalShare:opt.digitalShare??.4,house:opt.house||'renaissance royal',today:opt.today||new Date().toISOString().slice(0,10),target:opt.target||1200,dailyCap:opt.dailyCap||8,minScore:opt.minScore||.18,month:opt.month||(new Date().getMonth()+1),styles:opt.styles||STYLES.length,seedExtra:opt.extra||0};
 const subj=market.breeds.map(b=>[b.article,b.score,b.akc_rank_2025?'dog':'cat']).concat(HORSES.map(h=>[h[0],h[1],'horse']),EXOTIC.map(x=>[x[0],x[1],'pet']));
 const st={generated:0,rejected:{},accepted:0},acc=[],rej=[],seen=new Set();
 const byKey={},cand=[];const bump=(r,t,tm)=>{const k=r.split(':')[0];st.rejected[k]=(st.rejected[k]||0)+1;if(rej.length<400&&(tm||rej.length<150||Math.random()<.01))rej.push({title:t,reason:r})};
 for(const [s,ss,kind] of subj)for(const [sty,sw] of STYLES.slice(0,o.styles))for(const [prod,price] of PRODUCTS)for(const [occ,ok,ow] of OCC)for(const [nic,nk,nw] of NICHES){
  if(kind==='horse'&&/Mug|Digital/.test(prod)&&nk==='two')continue;st.generated++;
  const name=s.replace(/_cat$|_horse$/,'').replace(/_/g,' ');const pn=prod.replace(/ \d.*$/,'').replace('Fleece blanket','Blanket').replace('Digital portrait','Digital Download');
  const title=`${occ==='everyday'?'':occ+' '}${name} ${nk==='couple'?'& Couple ':nk==='family'?'Family ':nk==='two'?'Two-Pet ':nk==='owner'?'& Owner ':''}${sty.replace(/\b\w/g,c=>c.toUpperCase())} ${pn} — Custom ${kind==='horse'?'Horse':kind==='cat'?'Cat':kind==='dog'?'Dog':'Pet'} Portrait from Photo`.replace(/\s+/g,' ').trim();
  const reason=[];const low=title.toLowerCase();const tm=TM.find(t=>low.includes(t));if(tm)reason.push('trademark/copyright: "'+tm+'"');
  const m=MARG[prod]||margin(prod,price);
  const score=+(ss**.7*sw*(sty===o.house?1.15:1)*(ow??seasonal(ok,o.month))*nw*(m/.6)).toFixed(3); // ESTIMATE heuristic on real signals
  if(!reason.length&&score<o.minScore)reason.push('below quality threshold');
  const idea={id:'i'+st.generated,title:title.slice(0,140),subject:name,kind,style:sty,product:prod,price,occasion:occ,niche:nic,score,est_margin:+m.toFixed(2),keyword:`${name.toLowerCase()} ${ok||'gift'} ${pn.toLowerCase()}`.replace(/\s+/g,' '),ai_disclosure:true,channels:['etsy','shopify'],_k:name+'|'+pn+'|'+occ};
  if(!idea.ai_disclosure)reason.push('missing AI disclosure');
  if(reason.length){bump(reason[0],idea.title,!!tm);continue}cand.push(idea)}
 // dedupe best-first: ≤3 ideas per subject+product+occasion and title Jaccard <0.8 (Etsy flags/penalizes duplicate listings)
 cand.sort((a,b)=>b.score-a.score);for(const idea of cand){const L=byKey[idea._k]||(byKey[idea._k]=[]),nt=norm(idea.title);
  if(L.length>=3||L.some(x=>jac(x,nt)>=.8)){bump('near-duplicate of a higher-scored idea',idea.title,false);continue}L.push(nt);delete idea._k;acc.push(idea)}
 acc.sort((a,b)=>b.score-a.score);st.accepted=acc.length;
 // ---- self-evolving styles: seeded by date → new experiment variants every day (exploration budget) ----
 const exps=propose(o.today,opt.prevExperiments||[]),pool=[];
 for(const ex of exps.filter(e=>e.status!=='retired'))for(const [s,ss,kind] of subj.slice(0,8))for(const [prod,price] of PRODUCTS){if((ex.id.charCodeAt(3)+s.length+prod.length)%3)continue;
  const name=s.replace(/_cat$|_horse$/,'').replace(/_/g,' '),pn=prod.replace(/ \d.*$/,'').replace('Fleece blanket','Blanket').replace('Digital portrait','Digital Download');
  const title=`${name} ${ex.label} ${pn} — Custom ${kind==='cat'?'Cat':kind==='horse'?'Horse':'Dog'} Portrait from Photo`.replace(/\b\w/g,c=>c.toUpperCase()).slice(0,140);if(TM.some(t=>title.toLowerCase().includes(t)))continue;
  pool.push({id:'x'+ex.id+'_'+pool.length,title,subject:name,kind,style:ex.label,product:prod,price,occasion:'everyday',niche:ex.niche||'single pet',score:+(ss**.7*.9*(MARG[prod]/.6)).toFixed(3),est_margin:MARG[prod],keyword:`${name.toLowerCase()} ${ex.kw}`,ai_disclosure:true,channels:['etsy','shopify'],experiment:ex.id})}
 let G=null;if(opt.taxonomy){G=generateGeneral(opt.taxonomy,market,o);for(const k in G.stats.rejected_by)st.rejected[k]=(st.rejected[k]||0)+G.stats.rejected_by[k];st.generated+=G.stats.candidates;rej.push(...G.rej.slice(0,150));acc.push(...G.acc);acc.sort((a,b)=>b.score-a.score);st.accepted=acc.length}
 // ---- daily batches with product mix + exploration slots, rotating subjects ----
 const isD=x=>x.digital||/Digital/.test(x.product),rot=(arr,f=x=>x.subject)=>{const b={};arr.forEach(x=>(b[f(x)]=b[f(x)]||[]).push(x));const r=[];for(let i=0;r.length<arr.length;i++)for(const k in b)if(b[k][i])r.push(b[k][i]);return r};
 const isPet=x=>x.kind!=='general',petShare=opt.petShare??.3,gen=acc.filter(x=>!isPet(x)),pet=acc.filter(isPet);
 const mixQ=list=>{const b={};rot(list).forEach(x=>(b[x.product]=b[x.product]||[]).push(x));const ks=Object.keys(b);ks.forEach((k,j)=>b[k]=b[k].slice(j%Math.max(1,b[k].length)).concat(b[k].slice(0,j%Math.max(1,b[k].length))));const r=[];for(let i=0;ks.some(k=>b[k][i]);i++)ks.forEach(k=>b[k][i]&&r.push(b[k][i]));return r};
 const petQ=mixQ(pet),dq=rot(gen.filter(isD)),pq=mixQ(gen.filter(x=>!isD(x))),xq=rot(pool),kept=[],start=new Date(o.today+'T12:00:00Z');
 const nX=Math.max(o.explore>0?1:0,Math.round(o.dailyCap*o.explore)),nP=Math.round(o.dailyCap*petShare),nD=Math.round((o.dailyCap-nX-nP)*o.digitalShare);
 for(let day=0;kept.length<o.target&&(dq.length||pq.length||xq.length||petQ.length);day++){const date=new Date(start.getTime()+day*864e5).toISOString().slice(0,10),batch=[];
  for(let i=0;i<nX&&xq.length;i++)batch.push(xq.shift());for(let i=0;i<nP&&petQ.length;i++)batch.push(petQ.shift());for(let i=0;i<nD&&dq.length;i++)batch.push(dq.shift());
  while(batch.length<o.dailyCap&&(pq.length||dq.length||petQ.length))batch.push((pq.length?pq:dq.length?dq:petQ).shift());
  batch.forEach(x=>{x.stage=day===0?'ready':'queued';x.publish_on=date;kept.push(x)})}
 kept.length=Math.min(kept.length,o.target);
 return {generated_at:new Date().toISOString(),config:o,counts:{generated:st.generated,rejected:Object.values(st.rejected).reduce((a,b)=>a+b,0),rejected_by:st.rejected,passed:st.accepted,backlog:kept.length,ready:kept.filter(x=>x.stage==='ready').length,queued:kept.filter(x=>x.stage==='queued').length,days_to_publish:Math.ceil(kept.length/o.dailyCap)},
  guardrails:{trademark_blocklist:TM,near_duplicate:'≤3 ideas per subject+product+occasion and title Jaccard <0.8',ai_disclosure:'required on every listing (Etsy policy, Jan 2026)',daily_publish_cap:o.dailyCap,pacing_note:'Etsy publishes no hard daily cap, but bursts of near-identical new listings from a new shop risk review/suspension; robot drips listings (configurable cap, ESTIMATE).',min_score:o.minScore},
  channels:[{n:'Etsy',status:'pending connection',role:'primary'},{n:'Shopify',status:'pending connection',role:'mirror every Etsy listing'},{n:'Amazon Handmade',status:'later — needs Handmade application + approval',role:'top 50 sellers after 90 days'},{n:'eBay',status:'later — needs eBay developer key',role:'test canvases/blankets'}],
  note:'Scores are ESTIMATES: sqrt-ish of real breed interest score (Wikipedia + AKC) × style weight (assumption) × occasion seasonality (Wikipedia peaks + RankHero estimate) × niche weight (assumption) × est. margin (economics.js). No sales data.',
  backlog:kept,rejected_samples:rej,experiments:exps,wide:G?G.stats:null,categories:G?Object.entries(acc.reduce((m,x)=>(m[x.category||'pet portrait']=(m[x.category||'pet portrait']||0)+1,m),{})):null,mix:{pet:opt.petShare??.3,digital:o.digitalShare,physical:+(1-o.digitalShare).toFixed(2),explore:o.explore,house:o.house}}}
const api={generate,generateGeneral,STYLES,TM};if(typeof module!=='undefined')module.exports=api;else root.IDEAS=api;
})(typeof window!=='undefined'?window:globalThis);
