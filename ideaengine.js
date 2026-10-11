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
 // ---- daily batches with product mix + exploration slots, rotating subjects ----
 const isD=x=>/Digital/.test(x.product),rot=(arr,f=x=>x.subject)=>{const b={};arr.forEach(x=>(b[f(x)]=b[f(x)]||[]).push(x));const r=[];for(let i=0;r.length<arr.length;i++)for(const k in b)if(b[k][i])r.push(b[k][i]);return r};
 const dq=rot(acc.filter(isD)),pq=(()=>{const b={};rot(acc.filter(x=>!isD(x))).forEach(x=>(b[x.product]=b[x.product]||[]).push(x));const ks=Object.keys(b);ks.forEach((k,j)=>b[k]=b[k].slice(j).concat(b[k].slice(0,j)));const r=[];for(let i=0;ks.some(k=>b[k][i]);i++)ks.forEach(k=>b[k][i]&&r.push(b[k][i]));return r})(),xq=rot(pool),kept=[],start=new Date(o.today+'T12:00:00Z');
 const nX=Math.max(o.explore>0?1:0,Math.round(o.dailyCap*o.explore)),nD=Math.round((o.dailyCap-nX)*o.digitalShare);
 for(let day=0;kept.length<o.target&&(dq.length||pq.length||xq.length);day++){const date=new Date(start.getTime()+day*864e5).toISOString().slice(0,10),batch=[];
  for(let i=0;i<nX&&xq.length;i++)batch.push(xq.shift());for(let i=0;i<nD&&dq.length;i++)batch.push(dq.shift());while(batch.length<o.dailyCap&&(pq.length||dq.length))batch.push((pq.length?pq:dq).shift());
  batch.forEach(x=>{x.stage=day===0?'ready':'queued';x.publish_on=date;kept.push(x)})}
 kept.length=Math.min(kept.length,o.target);
 return {generated_at:new Date().toISOString(),config:o,counts:{generated:st.generated,rejected:Object.values(st.rejected).reduce((a,b)=>a+b,0),rejected_by:st.rejected,passed:st.accepted,backlog:kept.length,ready:kept.filter(x=>x.stage==='ready').length,queued:kept.filter(x=>x.stage==='queued').length,days_to_publish:Math.ceil(kept.length/o.dailyCap)},
  guardrails:{trademark_blocklist:TM,near_duplicate:'≤3 ideas per subject+product+occasion and title Jaccard <0.8',ai_disclosure:'required on every listing (Etsy policy, Jan 2026)',daily_publish_cap:o.dailyCap,pacing_note:'Etsy publishes no hard daily cap, but bursts of near-identical new listings from a new shop risk review/suspension; robot drips listings (configurable cap, ESTIMATE).',min_score:o.minScore},
  channels:[{n:'Etsy',status:'pending connection',role:'primary'},{n:'Shopify',status:'pending connection',role:'mirror every Etsy listing'},{n:'Amazon Handmade',status:'later — needs Handmade application + approval',role:'top 50 sellers after 90 days'},{n:'eBay',status:'later — needs eBay developer key',role:'test canvases/blankets'}],
  note:'Scores are ESTIMATES: sqrt-ish of real breed interest score (Wikipedia + AKC) × style weight (assumption) × occasion seasonality (Wikipedia peaks + RankHero estimate) × niche weight (assumption) × est. margin (economics.js). No sales data.',
  backlog:kept,rejected_samples:rej,experiments:exps,mix:{digital:o.digitalShare,physical:+(1-o.digitalShare).toFixed(2),explore:o.explore,house:o.house}}}
const api={generate,STYLES,TM};if(typeof module!=='undefined')module.exports=api;else root.IDEAS=api;
})(typeof window!=='undefined'?window:globalThis);
