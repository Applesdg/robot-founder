// Robot Founder — Live Ops simulation (watch-only). Mock connectors mirror Etsy Open API v3, Shopify Admin API (REST 2025-xx), Printify API v1 shapes.
// ARCHITECTURE: robot logic talks ONLY to the Adapter interface below. Mock adapters generate data locally; Live adapters call the
// robot-founder-server backend (keys + OAuth + approval enforcement live there). No secrets ever live in this static site or localStorage.
(function(){
const EC=window.ECON,$=id=>document.getElementById(id),R=Math.random,pick=a=>a[Math.floor(R()*a.length)],m2=x=>Math.round(x*100)/100,usd=x=>(x<0?'-$':'$')+Math.abs(x).toFixed(2);
const line=EC.lines.find(l=>l.mode==='pod'),VAR=line.variants[2],DIG=line.skus[1],PACK=line.skus[0];
// ---------------- Adapter interface ----------------
// Each connector implements: status(), call(method,path,body) -> Promise<json>. Mode is 'mock' or 'live'.
const BACKEND=localStorage.getItem('rf_backend_url')||''; // URL only — never a key
class MockAdapter{constructor(name,limit){this.name=name;this.mode='mock';this.limit=limit;this.used=0;this.calls=[];this.down=0;}
 status(){return this.down>0?'outage':'ok'}
 async call(method,path,body){LO.apiCalls++;this.used++;this.calls.unshift(`${clk()} ${method} ${path}`);this.calls.length=Math.min(this.calls.length,8);
  if(this.down>0){const e=new Error('503 Service Unavailable');e.code=503;throw e}
  if(this.used>this.limit.n){const e=new Error('429 Too Many Requests');e.code=429;throw e}return {ok:true,body}}}
class LiveAdapter{constructor(name){this.name=name;this.mode='live';this.calls=[];this.used=0;this.limit={n:0,per:'server'};this.down=0}
 status(){return BACKEND?'live (via backend)':'not configured'}
 async call(method,path,body){if(!BACKEND)throw new Error('backend not configured');const r=await fetch(BACKEND+'/api/'+this.name+path,{method,credentials:'include',headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined});if(r.status===202)return {pendingApproval:true,...(await r.json())};return r.json()}}
const CONN={etsy:{label:'Etsy Open API v3',limit:{n:150,per:'10k/day · 150 QPS window shown per sim-minute'},a:null},
 shopify:{label:'Shopify Admin API',limit:{n:40,per:'leaky bucket 40 req, 2/s refill'},a:null},
 printify:{label:'Printify API v1',limit:{n:600,per:'600 req/min (orders 200/30min)'},a:null}};
for(const k in CONN)CONN[k].a=new MockAdapter(k,CONN[k].limit); // DEFAULT: mock. Live only when backend says a connector is linked.
async function probeBackend(){if(!BACKEND)return;try{const s=await (await fetch(BACKEND+'/api/status',{credentials:'include'})).json();for(const k in CONN)if(s[k]&&s[k].linked&&LO.allowLive)CONN[k].a=new LiveAdapter(k)}catch(e){}}
// ---------------- state ----------------
const LO=window.LIVEOPS={catalog:null,brain:[],phase:'research',launchT:1e12,traffic:0,on:false,t:0,apiCalls:0,orders:[],feed:[],queue:[],digest:[],listings:[],cash:500,pending:{etsy:0,shopify:0},reserveEtsy:0,payouts:[],stats:{rev:0,fees:0,cogs:0,ai:0,refunds:0,orders:0,flags:0},allowLive:false,speed:30,day:{rev:0,orders:0,issues:[]},timer:null};
LO.catalog=LO.listings;
const clk=(t=LO.t)=>{const d=Math.floor(t/1440),h=Math.floor(t%1440/60),mi=Math.floor(t%60);return `D${d+1} ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d%7]} ${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}`};
const dow=t=>Math.floor(t/1440)%7,hr=t=>t%1440/60;
let oid=4100000000,rid=3200000000,lid=1700000000;
function feed(src,type,payload,cls=''){LO.feed.unshift({t:clk(),src,type,payload,cls});LO.feed.length=Math.min(LO.feed.length,80)}
// Dom's phone availability: full-time job weekdays 8:30–17:30 → checks phone at lunch/breaks; evenings fast; asleep 23–7.
function domDelay(t){const h=hr(t),we=dow(t)>=5;if(h>=23||h<7)return (31-h)%24*60+R()*40;if(!we&&h>=8.5&&h<17.5){return h<12?(12.25-h)*60+R()*30:(R()<.4?R()*90:(17.75-h)*60+R()*30)}return 5+R()*35}
function ask(kind,text,amount,onYes,onNo){const due=LO.t+domDelay(LO.t);LO.queue.push({id:'apr_'+(LO.queue.length+1),kind,text,amount,asked:LO.t,due,onYes,onNo,state:'waiting'});feed('robot','approval.requested',{kind,text,amount:amount&&usd(amount)},'y')}
// ---------------- listings & Etsy search model ----------------
function mkListing(title,price,kind,tags){const L={listing_id:++lid,title,price:{amount:Math.round(price*100),divisor:100,currency_code:'USD'},state:'draft',tags,kind,views:0,favorers:0,sales:0,quality:.5+R()*.4,age:0,variant:'A',expPrice:null};LO.listings.push(L);return L}
function etsyRank(L){// Etsy search: relevance (title/tags) × listing quality score (CTR/conv, reviews) × recency boost for new listings; ~20 views/day new shop
 const rec=L.age<10?1.6:1,rv=1+Math.sqrt(LO.stats.orders)/8;return L.quality*rec*rv*(L.flagged?0:1)}
// ---------------- robot workflow per order ----------------
const STAGES=['receipt.created','paid','photo_intake','ai_generating','proof_sent','approved','printify.order_created','in_production','shipped','delivered'];
function newOrder(){const ch=R()<.75||!LO.shopifyLive?'etsy':'shopify';const _r=0;const r=R();let item,price,cost=0,ship=0,pod=false;
 if(r<.35){item=PACK[0];price=PACK[3]}else if(r<.6){item=DIG[0];price=DIG[3];cost=EC.pod.aiPerPortrait}else{const v=pick(VAR);item='Pet Portrait — '+v[0];price=v[1];cost=v[2]+EC.pod.aiPerPortrait;ship=v[3];pod=true}
 const live=LO.catalog.filter(c=>c.status==='live');if(!live.length)return;const w=live.map(c=>c.quality*(c.promo?1.4:1));let x=R()*w.reduce((a,b)=>a+b,0),P=live[0];for(let i=0;i<live.length;i++){x-=w[i];if(x<=0){P=live[i];break}}
 item=P.title;price=m2(P.price*(P.promo?.8:1));cost=P.cost;ship=P.ship;pod=P.kind==='pod';P.sales++;const custom=P.kind!=='digital';
 const o={id:ch==='etsy'?++rid:'#'+(1001+LO.orders.length),ch,item,price,cost,ship,pod,custom,stage:0,next:LO.t+2,born:LO.t,log:[],photoBad:custom&&R()<.12,misprint:pod&&R()<EC.pod.partnerDefect,late:pod&&R()<.06,revision:custom&&R()<EC.pod.revisionRate};
 const fee=ch==='etsy'?price*(EC.etsy.txnPct+EC.etsy.payPct)+EC.etsy.payFixed+EC.etsy.listingFee+(R()<EC.etsy.offsiteShare?Math.min(price*EC.etsy.offsitePct,EC.etsy.offsiteCap):0):price*EC.shopify.plans[0].pct+EC.shopify.plans[0].fixed;
 o.fee=m2(fee);o.custName=pick(['Kayla','Mike','Priya','Sam','Jordan','Linda','Chris','Ana']);LO.orders.unshift(o);LO.orders.length=Math.min(LO.orders.length,60);
 const payload=ch==='etsy'?{receipt_id:o.id,shop_id:'BenjiPortraitsCo',status:'Paid',is_paid:true,grandtotal:{amount:Math.round(price*100),divisor:100,currency_code:'USD'},transactions:[{title:item,quantity:1}]}:{id:o.id,financial_status:'paid',fulfillment_status:null,total_price:price.toFixed(2),line_items:[{title:item,quantity:1}]};
 feed(ch,ch==='etsy'?'receipt (poll /v3/application/shops/{shop_id}/receipts)':'webhook orders/paid',payload,'g');
 CONN[ch].a.call('GET',ch==='etsy'?`/v3/application/shops/{shop_id}/receipts/${o.id}`:`/admin/api/2025-07/orders/${String(o.id).slice(1)}.json`).catch(()=>{});
 LO.stats.orders++;LO.stats.rev+=price;LO.stats.fees+=o.fee;LO.day.rev+=price;LO.day.orders++;LO.pending[ch]+=price-o.fee;LO.stats.ai+=.1;}
async function step(o){const ch=o.ch;try{
 switch(o.stage){
 case 0: if(!o.custom){feed(ch,'digital download delivered',{receipt_id:o.id,file:'planner-pack.zip'},'g');o.stage=10;return}
  await CONN[ch].a.call('POST',ch==='etsy'?`/v3/application/shops/{shop_id}/conversations (shop message)`:'/admin/api/2025-07/customers/send_invite (email)',{text:'Hi! Please reply with a clear, well-lit photo of your pet 🐶'});
  o.stage=2;o.next=LO.t+60+R()*600;feed('robot','photo.requested',{order:o.id,to:o.custName});break;
 case 2: if(o.photoBad){o.photoBad=false;feed('robot','photo.rejected (blurry, 380px)',{order:o.id,action:'asked for a new photo with tips'},'r');LO.day.issues.push('blurry photo on '+o.id);o.next=LO.t+120+R()*480;break}
  o.stage=3;o.next=LO.t+3;feed('robot','photo.accepted',{order:o.id,res:'3024x4032',face_detect:'ok'});break;
 case 3: o.stage=4;o.next=LO.t+4;LO.stats.ai+=EC.pod.aiPerPortrait;feed('robot','ai.portrait_generated',{order:o.id,generations:4,cost:usd(EC.pod.aiPerPortrait)});break;
 case 4: await CONN[ch].a.call('POST','/…/conversations',{text:'Here is your proof! Reply YES to approve or tell me what to change.'});o.stage=5;o.next=LO.t+120+R()*900;feed('robot','proof.sent',{order:o.id});break;
 case 5: if(o.revision){o.revision=false;o.stage=4;o.next=LO.t+20;LO.stats.ai+=EC.pod.revisionAI;feed(ch,'customer: "can you make the ears less pointy?"',{order:o.id,action:'revision round'},'y');break}
  feed(ch,'customer approved proof',{order:o.id},'g');if(!o.pod){o.stage=9;o.next=LO.t+2;feed('robot','digital portrait delivered',{order:o.id});break}o.stage=6;o.next=LO.t+2;break;
 case 6: // spending money: Printify charges the card — under auto-spend cap per order is pre-approved by Dom's standing rule ($40)
  if(o.cost>40&&!o.ok){o.stage=-1;ask('spend',`Pay Printify ${usd(o.cost+o.ship)} for ${o.item} (${o.id})`,o.cost+o.ship,()=>{o.ok=1;o.stage=6;o.next=LO.t},()=>{o.stage=10;refund(o,o.price,'Dom declined production')});break}
  await CONN.printify.a.call('POST','/v1/shops/{shop_id}/orders.json',{external_id:String(o.id),line_items:[{product_id:'pf_'+o.id,variant_id:pick([12345,12346,17887]),quantity:1}],shipping_method:1,send_shipping_notification:false,address_to:{first_name:o.custName,country:'US'}});
  await CONN.printify.a.call('POST',`/v1/shops/{shop_id}/orders/{order_id}/send_to_production.json`);
  LO.cash-=o.cost-EC.pod.aiPerPortrait+o.ship;LO.stats.cogs+=o.cost-EC.pod.aiPerPortrait+o.ship;o.stage=7;o.next=LO.t+1440*(EC.pod.fulfillDays[0]+R()*(EC.pod.fulfillDays[1]-EC.pod.fulfillDays[0]));
  feed('printify','webhook order:sent-to-production',{type:'order:sent-to-production',resource:{id:'pfy_'+o.id,data:{status:'in-production',cost:Math.round((o.cost+o.ship)*100)}}});break;
 case 7: if(o.late){o.late=false;o.next=LO.t+1440*2;feed('printify','production delayed (+2 days)',{order:o.id,action:'robot messaged customer proactively with new ETA'},'r');LO.day.issues.push('late production '+o.id);break}
  const trk='9400'+Math.floor(R()*1e12);o.trk=trk;feed('printify','webhook order:shipment:created',{type:'order:shipment:created',resource:{data:{carrier:{code:'usps',tracking_number:trk}}}});
  await CONN[ch].a.call('POST',ch==='etsy'?`/v3/application/shops/{shop_id}/receipts/${o.id}/tracking`:`/admin/api/2025-07/fulfillments.json`,{tracking_code:trk,carrier_name:'usps'});
  feed('robot','tracking.sent_to_customer',{order:o.id,trk});o.stage=8;o.next=LO.t+1440*(3+R()*3);break;
 case 8: feed('printify','webhook order:shipment:delivered',{order:o.id},'g');o.stage=9;o.next=LO.t+60;break;
 case 9: o.stage=10;if(o.misprint){feed(ch,'customer: "the print arrived smudged"',{order:o.id},'r');LO.day.issues.push('misprint '+o.id);
   await CONN.printify.a.call('POST','/v1/shops/{shop_id}/orders.json (reprint — free under partner policy)',{});feed('robot','reprint.requested (Printify covers misprint)',{order:o.id});break}
  if(R()<.45){const s=R()<.9?5:R()<.6?4:2;feed(ch,'review received',{order:o.id,rating:s,review:s>=4?'Looks just like Benji\'s cousin!':'Colors off'},s>=4?'g':'r');if(s<3)ask('refund',`Partial refund ${usd(o.price*.5)} for low review on ${o.id}?`,o.price*.5,()=>refund(o,o.price*.5,'goodwill'),()=>{})}
  if(R()<.004){feed(ch,'chargeback opened',{order:o.id,reason:'item_not_received'},'r');LO.day.issues.push('chargeback '+o.id);feed('robot','dispute.evidence_submitted',{order:o.id,evidence:'USPS delivered scan '+o.trk})}
  if(o.custom&&R()<EC.pod.refundCustom){if(o.price>25)ask('refund',`Customer requests refund ${usd(o.price)} on ${o.id}`,o.price,()=>refund(o,o.price,'customer request'),()=>feed('robot','refund declined — offered reprint',{order:o.id}));else refund(o,o.price,'auto (under $25 threshold)')}
 }}catch(e){o.next=LO.t+(e.code===429?5:30);feed('robot',`retry: ${e.message}`,{connector:ch,order:o.id,backoff:e.code===429?'5 min':'30 min (exponential)'},'r')}}
function refund(o,amt,why){LO.stats.refunds+=amt;LO.pending[o.ch]-=amt;CONN[o.ch].a.call('POST',o.ch==='etsy'?'(Etsy: refunds via Shop Manager — no API; robot drafts, Dom taps)':'/admin/api/2025-07/orders/{id}/refunds.json',{amount:amt}).catch(()=>{});feed('robot','refund.issued',{order:o.id,amount:usd(amt),why},'y')}
// ---------------- daily robot routines ----------------
function daily(){const d=Math.floor(LO.t/1440);proactive(d);
 // listing SEO / price experiments
 LO.listings.forEach(L=>{L.age++;if(L.state!=='active')return;const v=Math.round(EC.etsy.newShopViewsPerDay/Math.max(1,LO.listings.length)*etsyRank(L)*(.6+R()*.8)*3);L.views+=v;L.favorers+=Math.round(v*.04)});
 if(false){const v=pick(VAR);ask('go-live',`Publish new listing "Custom ${pick(['Dog','Cat','Pet'])} Portrait ${v[0]} — Personalized Gift" at $${v[1]} (+$0.20 Etsy fee)`,EC.etsy.listingFee,()=>{const L=mkListing(`Custom Pet Portrait ${v[0]}`,v[1],'pod',['custom pet portrait','dog portrait','pet memorial']);L.state='active';CONN.etsy.a.call('POST','/v3/application/shops/{shop_id}/listings',{quantity:999,title:L.title,price:v[1],who_made:'i_did',when_made:'made_to_order',taxonomy_id:1027,type:'physical'}).catch(()=>{});LO.cash-=EC.etsy.listingFee;feed('etsy','listing.created → active',{listing_id:L.listing_id},'g')},()=>{})}
 if(d%7===5){const L=LO.listings.filter(l=>l.state==='active').sort((a,b)=>b.views-a.views)[0];if(L){const nt=L.title.replace('Custom','Personalized');think('SEO A/B test on '+L.title.split('|')[0],'top-viewed listing; testing title wording over 14 days, keep winner by views/day');feed('robot','seo.experiment',{listing_id:L.listing_id,test:'title A/B',A:L.title,B:nt,metric:'views/day over 14 days'},'y');CONN.etsy.a.call('PATCH',`/v3/application/shops/{shop_id}/listings/${L.listing_id}`,{title:nt}).catch(()=>{});L.quality=Math.min(1,L.quality+(R()-.4)*.1)}}
 if(R()<.02){const L=pick(LO.listings.filter(l=>l.status==='live'));if(L&&!L.flagged){L.flagged=1;L.state='inactive';L.status='flagged';LO.stats.flags++;feed('etsy','listing flagged (possible IP: "Disney-style")',{listing_id:L.listing_id,state:'inactive'},'r');LO.day.issues.push('listing flag');ask('go-live',`Re-list ${L.listing_id} with "Disney" wording removed`,0,()=>{L.flagged=0;L.state='active';L.status='live';feed('robot','listing.appealed & re-listed',{listing_id:L.listing_id},'g')},()=>{})}}
 if(R()<.04){const k=pick(Object.keys(CONN));CONN[k].a.down=60+Math.floor(R()*180);feed(k,'API OUTAGE (5xx)',{connector:k,robot:'queueing calls, exponential backoff, no duplicate orders (idempotency key = receipt id)'},'r');LO.day.issues.push(k+' outage')}
 // payouts: Etsy deposits daily (new shops: funds available after ~3-day reserve); Shopify Payments ~2 business days
 const e=LO.pending.etsy;LO.pending.etsy=0;if(e>0)LO.payouts.push({src:'Etsy',amt:e,when:LO.t+1440*3});const s=LO.pending.shopify;LO.pending.shopify=0;if(s)LO.payouts.push({src:'Shopify',amt:s,when:LO.t+1440*(dow(LO.t)>=4?4:2)});
 LO.payouts=LO.payouts.filter(p=>{if(p.when<=LO.t){LO.cash+=p.amt;feed(p.src.toLowerCase(),'payout.paid',{amount:usd(p.amt)},'g');return false}return true});
 LO.cash-=(EC.ai.levels.base.base)/30;
 const waiting=LO.queue.filter(q=>q.state==='waiting').length;
 LO.digest.unshift({d:clk(),txt:`📱 Daily digest — ${LO.day.orders} orders, ${usd(LO.day.rev)} sales. Cash ${usd(LO.cash)}, ${usd(LO.payouts.reduce((a,p)=>a+p.amt,0))} in transit. ${waiting} approvals waiting. ${LO.day.issues.length?'Handled: '+LO.day.issues.join(', '):'No issues.'}`});LO.day={rev:0,orders:0,issues:[]};}
// ---------------- proactive catalog brain ----------------
const START=new Date(2026,9,10);const realDate=(t=LO.t)=>new Date(START.getTime()+Math.floor(t/1440)*864e5);
function think(what,why){LO.brain.unshift({t:clk(),what,why});LO.brain.length=Math.min(LO.brain.length,40);feed('robot','brain: '+what,{why},'y')}
const KW=[['custom pet portrait',9800,'high'],['dog portrait from photo',6100,'high'],['pet memorial gift',5400,'med'],['cat portrait custom',4200,'med'],['dog mom gift',7300,'high'],['pet wall art printable',2100,'low'],['dog birthday printable',1300,'low'],['pet christmas ornament',8800,'high'],['halloween dog costume portrait',1900,'med'],['benji dog clipart',300,'low']];
const SEASONS=[[9,31,'Halloween','🎃','#e67e22'],[10,27,'Black Friday','🏷','#222'],[11,25,'Christmas','🎄','#c0392b'],[1,14,"Valentine's",'💘','#e84393'],[4,10,"Mother's Day",'💐','#fd79a8'],[3,11,'National Pet Day','🐾','#00b894']];
function thumb(shape,bg,emoji){const sh={poster:'<rect x="14" y="6" width="36" height="48" fill="#fff" stroke="#333"/>',canvas:'<rect x="10" y="10" width="44" height="40" fill="#fff" stroke="#6b4f2a" stroke-width="3"/>',mug:'<rect x="14" y="16" width="30" height="34" rx="3" fill="#fff" stroke="#333"/><path d="M44 24h6v14h-6" fill="none" stroke="#333" stroke-width="3"/>',blanket:'<path d="M8 14h48v30l-6 8H8z" fill="#fff" stroke="#333"/>',file:'<rect x="16" y="8" width="32" height="44" fill="#fff" stroke="#333"/><text x="32" y="58" font-size="7" text-anchor="middle" fill="#ccc">PNG</text>'}[shape];
 return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${bg}"/>${sh}<circle cx="32" cy="30" r="9" fill="#c8a165"/><ellipse cx="24" cy="24" rx="4" ry="7" fill="#7a5230"/><ellipse cx="40" cy="24" rx="4" ry="7" fill="#7a5230"/><circle cx="29" cy="29" r="1.5"/><circle cx="35" cy="29" r="1.5"/><circle cx="32" cy="33" r="2"/><text x="52" y="14" font-size="10">${emoji||''}</text></svg>`)}
function mkProduct(spec){const P={id:'prod_'+(LO.catalog.length+1),listing_id:++lid,title:spec.title,tags:spec.tags,desc:spec.desc,kind:spec.kind,price:spec.price,priceObj:null,cost:spec.cost||0,ship:spec.ship||0,variants:spec.variants||[],img:thumb(spec.shape,spec.bg||'#2b2350',spec.emoji),status:'draft',state:'draft',views:0,favorers:0,sales:0,quality:.45+R()*.45,age:0,season:spec.season||null,born:LO.t};
 P.priceObj={amount:Math.round(P.price*100),divisor:100,currency_code:'USD'};Object.defineProperty(P,'price_',{get:()=>P.priceObj});LO.catalog.push(P);
 if(P.kind==='pod')CONN.printify.a.call('POST','/v1/shops/{shop_id}/products.json',{title:P.title,description:P.desc,blueprint_id:{poster:282,canvas:937,mug:478,blanket:522}[spec.shape]||282,print_provider_id:99,variants:P.variants.map(v=>({id:v.id,price:Math.round(v.price*100),is_enabled:true})),print_areas:[{variant_ids:P.variants.map(v=>v.id),placeholders:[{position:'front',images:[{id:'img_'+P.id,x:.5,y:.5,scale:1,angle:0}]}]}]}).catch(()=>{});
 feed('robot','product.draft_created',{id:P.id,title:P.title,price:usd(P.price),variants:P.variants.length||1});return P}
function podSpec(v,extra={}){const [n,price,cost,ship]=v;const shape=/Poster/.test(n)?'poster':/Canvas/.test(n)?'canvas':/Mug/.test(n)?'mug':'blanket';
 // per-variant pricing from economics.js; robot sets price so margin after Etsy fees ≥ 35%
 return {kind:'pod',shape,price,cost:cost+EC.pod.aiPerPortrait,ship,variants:[{id:10000+Math.floor(R()*9000),title:n,price}],...extra}}
function seoFor(base,kw){return {title:`${base} | ${kw[0].replace(/\b\w/g,c=>c.toUpperCase())} | Personalized Gift for Dog Mom, Pet Lover`.slice(0,140),tags:[kw[0],'custom pet portrait','dog portrait','pet lover gift','personalized gift','dog mom gift','pet memorial','pet art','dog art','cat portrait','gift for her','pet wall art','benji'].slice(0,13),desc:`Turn your pet's photo into art. Upload a clear photo after checkout; you'll get a digital proof within 24h to approve before we print. Ships in ${EC.pod.fulfillDays[0]}–${EC.pod.fulfillDays[1]+5} days.`}}
function submitBatch(items,why){items.forEach(P=>{P.status='pending approval';P.state='draft'});const fee=items.length*EC.etsy.listingFee;think(`Batch of ${items.length} listings sent to Dom for approval`,why);
 // Live mode: backend returns 202 pendingApproval for golive routes; mock mirrors that via ask()
 ask('go-live',`Publish ${items.length} listings: ${items.map(p=>p.title.split('|')[0].trim()).join('; ').slice(0,160)} (Etsy fees ${usd(fee)})`,fee,()=>publish(items),()=>{items.forEach(P=>{P.status='draft'});think('Dom declined batch','will revise titles/prices and resubmit next week')})}
async function publish(items){for(const P of items){try{
  if(P.kind==='pod')await CONN.printify.a.call('POST',`/v1/shops/{shop_id}/products/${P.id}/publish.json`,{title:true,description:true,images:true,variants:true,tags:true});
  else await CONN.etsy.a.call('POST','/v3/application/shops/{shop_id}/listings',{quantity:999,title:P.title,description:P.desc,price:P.price,who_made:'i_did',when_made:'made_to_order',taxonomy_id:2078,type:'download',tags:P.tags});
  if(LO.shopifyLive)await CONN.shopify.a.call('POST','/admin/api/2025-07/products.json',{product:{title:P.title,body_html:P.desc,status:'active',variants:(P.variants.length?P.variants:[{price:P.price}]).map(v=>({price:String(v.price)}))}});
  P.status='live';P.state='active';P.liveT=LO.t;LO.cash-=EC.etsy.listingFee;feed('etsy','listing state → active',{listing_id:P.listing_id,title:P.title.slice(0,40)},'g')}catch(e){P.status='draft';feed('robot','publish failed, retry later',{id:P.id,err:e.message},'r')}}
 if(LO.phase!=='live'&&LO.catalog.some(p=>p.status==='live')){LO.phase='live';LO.launchT=LO.t;think('🚀 Shop is LIVE — traffic starts now','Etsy indexes new listings within hours; new shops get ~'+EC.etsy.newShopViewsPerDay+' views/day, growing with listings, sales and reviews')}}
function prelaunch(){const t=LO.t;if(LO.phase==='research'&&t>=9*60){LO.phase='design';
  think('Keyword research done',KW.map(k=>`${k[0]} (~${k[1]}/mo, competition ${k[2]})`).join('; ')+'. Picking high-demand, gift-intent terms; skipping "benji dog clipart" (low volume, IP risk).');
  think('Niche: custom pet portraits + Benji-themed printables','POD custom portraits carry best $ margin per economics.js; digital packs have ~zero COGS and seed reviews cheaply.')}
 if(LO.phase==='design'&&t>=13*60){LO.phase='drafting';const drafts=[];
  drafts.push(mkProduct({kind:'digital',shape:'file',bg:'#355',price:DIG[3],cost:EC.pod.aiPerPortrait,...seoFor('Custom Pet Portrait Digital File',KW[1])}));
  drafts.push(mkProduct({kind:'digital',shape:'file',bg:'#553',emoji:'🐶',price:PACK[3],cost:0,...seoFor('Benji Dog Printable Planner & Wall-Art Pack',KW[5]),kind:'digital'}));
  VAR.slice(0,4).forEach((v,i)=>drafts.push(mkProduct(podSpec(v,seoFor('Custom Pet Portrait '+v[0],KW[[0,4,2,3][i]])))));
  const ss=upcoming(60)[0];if(ss)drafts.push(mkProduct(podSpec(VAR[3],{...seoFor(`${ss[2]} Pet Portrait Mug`,KW[7]),bg:ss[4],emoji:ss[3],season:ss[0]+':'+ss[2]})));
  think(`Designed ${drafts.length} products + mockups, created Printify drafts`,'Prices from economics.js variants (poster $39, canvas $69/$89, mug $24); margin after Etsy 9.5%+$0.45 fees and Printify cost checked ≥35%.');
  LO.phase='approval';submitBatch(drafts,'Etsy rewards shops with ≥10 listings; launch with a starter catalog rather than one item.')}}
function upcoming(days){const now=realDate();return SEASONS.map(s=>{let d=new Date(now.getFullYear(),s[0],s[1]);if(d<now)d=new Date(now.getFullYear()+1,s[0],s[1]);return [...s,(d-now)/864e5]}).filter(s=>s[5]<=days&&s[5]>=14).sort((a,b)=>a[5]-b[5])}
function proactive(d){if(LO.phase!=='live')return;const live=LO.catalog.filter(p=>p.status==='live');
 if(d%7===1){const v=pick(VAR),k=pick(KW.filter(k=>k[2]!=='low'));const P=mkProduct(podSpec(v,seoFor('Custom Pet Portrait '+v[0],k)));think('Weekly new product: '+v[0],`Targeting "${k[0]}" (~${k[1]} searches/mo); catalog of ${live.length} live — more listings = more search entry points.`);submitBatch([P],'weekly drop')}
 const ss=upcoming(56).find(s=>!LO.catalog.some(p=>p.season===s[0]+':'+s[2]));if(ss&&d%3===0){const P=mkProduct(podSpec(pick(VAR),{...seoFor(`${ss[2]} Pet Portrait`,KW[7]),bg:ss[4],emoji:ss[3],season:ss[0]+':'+ss[2]}));think(`Seasonal drop for ${ss[2]} (${Math.round(ss[5])} days out)`,'Etsy buyers shop holidays 4–8 weeks ahead and new listings need ~2 weeks to rank; POD production + shipping takes up to 10 days.');submitBatch([P],'seasonal')}
 live.forEach(P=>{const age=(LO.t-P.liveT)/1440;
  if(age>45&&P.sales===0&&P.views<60&&!P.season){P.status='retired';P.state='inactive';CONN.etsy.a.call('PUT',`/v3/application/shops/{shop_id}/listings/${P.listing_id}`,{state:'inactive'}).catch(()=>{});think('Retired '+P.title.split('|')[0],`${Math.round(age)} days live, ${P.views} views, 0 sales — frees attention; Etsy renewal fee ($0.20/4 mo) not worth it.`)}
  else if(age>20&&P.views>80&&P.sales/P.views<.01&&!P.refreshed){P.refreshed=1;P.quality=Math.min(1,P.quality+.15);CONN.etsy.a.call('POST',`/v3/application/shops/{shop_id}/listings/${P.listing_id}/images`,{rank:1}).catch(()=>{});think('Refreshed photos on '+P.title.split('|')[0],`${P.views} views but ${(P.sales/P.views*100).toFixed(1)}% conversion (< Etsy ~${(EC.etsy.conv*100).toFixed(1)}%): new lifestyle mockup as main image.`)}
  if(P.season&&realDate()>new Date(realDate().getFullYear(),...P.season.split(':')[0].split(',').map(Number),SEASONS.find(s=>s[2]===P.season.split(':')[1])[1]+1)&&P.status==='live'){P.status='retired';P.state='inactive';think('Retired seasonal '+P.season.split(':')[1],'holiday passed; will re-list next year')}});
 if(d%14===10&&live.length>=4){const slow=live.filter(p=>!p.promo).sort((a,b)=>a.sales-b.sales)[0];ask('go-live',`Run 20% off sale on "${slow.title.split('|')[0]}" for 7 days`,0,()=>{slow.promo=d+7;think('Promotion started: 20% off '+slow.title.split('|')[0],'slowest seller; sale badge lifts CTR in Etsy search; margin still positive after fees')},()=>{})}
 live.forEach(p=>{if(p.promo&&d>=p.promo)p.promo=0})}

// ---------------- tick ----------------
function tick(){for(let i=0;i<LO.speed;i++){LO.t++;for(const k in CONN){const a=CONN[k].a;if(a.down>0)a.down--;if(LO.t%1===0)a.used=Math.max(0,a.used-2)}
  const h=hr(LO.t),liveQ=LO.catalog.filter(c=>c.status==='live').reduce((a,c)=>a+c.quality,0),rate=(h>8&&h<23?1:.3)*Math.min(5,liveQ*.3)*Math.min(1,(LO.t-LO.launchT)/(10*1440)+.15)/1440;LO.traffic=liveQ?Math.round(EC.etsy.newShopViewsPerDay*Math.min(5,liveQ*.3)):0;if(liveQ&&R()<rate)newOrder();prelaunch();
  for(const o of LO.orders)if(o.stage>=0&&o.stage<10&&o.next<=LO.t){o.next=LO.t+999999;step(o)}
  for(const q of LO.queue)if(q.state==='waiting'&&q.due<=LO.t){const yes=q.kind!=='refund'||R()<.8;q.state=yes?'approved':'declined';q.took=Math.round(q.due-q.asked);feed('dom',`approval ${q.state} on phone after ${fmtM(q.took)}`,{id:q.id,kind:q.kind},yes?'g':'y');(yes?q.onYes:q.onNo)()}
  if(LO.t%1440===1200)daily();if(LO.t%1440===30*1440)LO.shopifyLive=true;if(LO.t===14*1440){ask('spend','Turn on Shopify Basic ($39/mo) as 2nd channel',39,()=>{LO.shopifyLive=true;LO.cash-=39},()=>{})}}
 render()}
const fmtM=m=>m<60?Math.round(m)+'m':(m/60).toFixed(1)+'h';
// ---------------- UI ----------------
const READY=[['Etsy','Etsy seller account (shop "BenjiPortraitsCo"), bank + ID verified','Etsy developer app → keystring (client_id) + shared secret','OAuth2 PKCE scopes: listings_r listings_w transactions_r transactions_w shops_r email_r','Redirect URI → backend /oauth/etsy/callback'],
 ['Shopify','Shopify store (Basic $39/mo) with Shopify Payments','Custom app in Dev Dashboard → client_id + secret','Scopes: read_orders write_orders read_products write_products write_fulfillments read_customers','Webhooks: orders/paid, refunds/create, disputes/create → backend /webhooks/shopify (HMAC verified)'],
 ['Printify','Printify account linked to Etsy/Shopify shops (or API-only "custom" shop)','Personal Access Token (Connections → API) — stored ONLY in backend secret','Webhooks: order:sent-to-production, order:shipment:created, order:shipment:delivered','Card/balance on file (Printify charges at production)'],
 ['AI + infra','Image model API key (e.g. OpenAI gpt-image-1) — backend secret','LLM API key for robot brain — backend secret','Cloudflare account (Workers + KV/D1) for robot-founder-server','Dom\'s phone: push/email for approval links (passkey/one-time code)']];
function css(){if($('lostyle'))return;const s=document.createElement('style');s.id='lostyle';s.textContent=`#lowrap{position:fixed;inset:0;background:#0d0b16f2;z-index:30;overflow:auto;padding:8px;font-size:12px;user-select:text}
#lowrap h2{color:#ffd76a;margin:2px 0 6px;font-size:18px}#lowrap h3{color:#8f7cff;margin:0 0 4px;font-size:13px}.logrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:8px}
.lop{background:#1d1833;border:2px solid #4a3f6b;border-radius:6px;padding:6px;max-height:300px;overflow:auto}.lop .g{color:#7dff8a}.lop .r{color:#ff8a8a}.lop .y{color:#ffd76a}.lop code{color:#9ab;font-size:10px;word-break:break-all}
.pill{display:inline-block;padding:0 6px;border-radius:8px;background:#264;margin-left:4px}.pill.mock{background:#446}.pill.bad{background:#822}.lobar button{font-size:12px;padding:3px 8px}.stg{display:inline-block;width:9px;height:9px;margin-right:1px;background:#333}.stg.d{background:#7dff8a}`;document.head.appendChild(s)}
function render(){if(!LO.on)return;const ops=Object.entries(CONN).map(([k,c])=>{const a=c.a,st=a.status();return `<div><b>${c.label}</b><span class="pill ${a.mode==='mock'?'mock':''}">${a.mode.toUpperCase()}</span><span class="pill ${st==='ok'||st.startsWith('live')?'':'bad'}">${st}</span><br>rate: ${a.used}/${a.limit.n} <small>(${a.limit.per})</small><br>${a.calls.slice(0,4).map(x=>`<code>${x}</code>`).join('<br>')}</div>`}).join('<hr>');
 const ord=LO.orders.slice(0,12).map(o=>`<div>${o.ch==='etsy'?'🟠':'🟢'} ${o.id} ${o.item.slice(0,28)} ${usd(o.price)} ${STAGES.map((s,i)=>`<i class="stg ${o.stage>i?'d':''}" title="${s}"></i>`).join('')} ${o.stage>=10?'✅':o.stage<0?'⏳ approval':STAGES[o.stage]||''}</div>`).join('');
 const q=LO.queue.slice(-10).reverse().map(x=>`<div class="${x.state==='waiting'?'y':x.state==='approved'?'g':'r'}">${x.kind.toUpperCase()} · ${x.text} — ${x.state==='waiting'?'⏳ Dom at work, ETA '+fmtM(x.due-LO.t):x.state+' in '+fmtM(x.took)}</div>`).join('')||'<i>none yet</i>';
 const S=LO.stats,net=S.rev-S.fees-S.cogs-S.ai-S.refunds;
 $('lobody').innerHTML=`<div class="logrid">
 <div class="lop"><h3>📡 Webhook / event feed</h3>${LO.feed.slice(0,30).map(f=>`<div class="${f.cls}">[${f.t}] <b>${f.src}</b> ${f.type} <code>${JSON.stringify(f.payload)}</code></div>`).join('')}</div>
 <div class="lop"><h3>🖥 Operations console</h3>${ops}<hr>Total API calls: ${LO.apiCalls}</div>
 <div class="lop"><h3>📦 Orders — robot workflow</h3><small>intake → photo → AI art → proof → approval → Printify → ship → tracking → delivered</small>${ord||'<i>waiting for first order…</i>'}</div>
 <div class="lop"><h3>✅ Dom's approval queue (phone)</h3><small>Needs Dom: anything going live, spend >$40/order or new subscriptions, refunds >$25. Dom works 8:30–5:30 weekdays → replies at lunch / evening.</small>${q}</div>
 <div class="lop" style="grid-column:span 2"><h3>🗂 Catalog — ${LO.phase==='live'?'LIVE':'PRE-LAUNCH: '+LO.phase} · traffic ${LO.traffic} views/day</h3>${LO.catalog.length?`<table style="width:100%;font-size:11px">${LO.catalog.slice().reverse().map(P=>`<tr><td><img src="${P.img}" width="34" height="34" style="vertical-align:middle;border-radius:3px"></td><td>${P.title.split('|')[0]}${P.promo?' <b class="y">-20%</b>':''}<br><small style="color:#888">${P.tags.slice(0,4).join(', ')}</small></td><td>$${P.price}</td><td class="${P.status==='live'?'g':P.status==='retired'||P.status==='flagged'?'r':'y'}">${P.status}</td><td>${P.views} views</td><td>${P.sales} sold</td></tr>`).join('')}</table>`:'<i>Empty shop. Robot is researching…</i>'}<small>Orders only come from live listings; traffic scales with catalog size × listing quality.</small></div>
 <div class="lop"><h3>🧠 Brain — why the robot did it</h3>${LO.brain.map(b=>`<div><span class="y">[${b.t}] ${b.what}</span><br><small>${b.why}</small></div>`).join('')||'<i>booting…</i>'}</div>

 <div class="lop"><h3>💵 Cash & payouts</h3>Cash on hand: <b>${usd(LO.cash)}</b><br>Sales ${usd(S.rev)} · fees ${usd(S.fees)} · Printify ${usd(S.cogs)} · AI ${usd(S.ai)} · refunds ${usd(S.refunds)} → <b class="${net>=0?'g':'r'}">${usd(net)}</b><br>Pending: Etsy ${usd(LO.pending.etsy)} · Shopify ${usd(LO.pending.shopify)}<br>${LO.payouts.map(p=>`<div>⏳ ${p.src} ${usd(p.amt)} lands in ${fmtM(p.when-LO.t)}</div>`).join('')}<small>Etsy: daily deposit, new-shop funds held ~3 days. Shopify Payments: ~2 business days. Printify charges card at production. Fees: Etsy 6.5% + 3%+$0.25 + $0.20/listing (+15% offsite ads on some); Shopify 2.9%+$0.30.</small></div>
 <div class="lop"><h3>📱 Daily digest (8 PM to Dom)</h3>${LO.digest.slice(0,6).map(d=>`<div>[${d.d}] ${d.txt}</div>`).join('')||'<i>first digest at 8 PM</i>'}</div>
 <div class="lop"><h3>🔌 Connections</h3>${Object.entries(CONN).map(([k,c])=>`<div>${c.label}: <span class="pill ${c.a.mode==='mock'?'mock':''}">${c.a.mode}</span></div>`).join('')}<small>Default MOCK. Live mode needs the robot-founder-server backend (holds keys, runs OAuth, enforces approvals). This page never stores secrets — only the backend URL.</small><br><label>Backend URL <input id="loUrl" value="${BACKEND}" placeholder="https://robot-founder-server.example.workers.dev" style="width:220px"></label><button id="loSave" class="mini">save</button></div>
 <div class="lop"><h3>🚀 Go-live readiness</h3>${READY.map(r=>`<div><b>${r[0]}</b><ul style="margin:2px 0 4px 16px;padding:0">${r.slice(1).map(x=>`<li>☐ ${x}</li>`).join('')}</ul></div>`).join('')}<small>See GO-LIVE.md in the repo.</small></div></div>`;
 $('loclock').textContent=clk();const u=$('loSave');if(u)u.onclick=()=>{localStorage.setItem('rf_backend_url',$('loUrl').value.trim());alert('Saved backend URL (no keys stored). Reload to probe.')}}
function open(){css();if(!$('lowrap')){const w=document.createElement('div');w.id='lowrap';w.innerHTML=`<h2>🛰 Live Ops simulation <small style="color:#aaa">— watch-only · Benji Portraits Co · <span id="loclock"></span></small></h2><div class="lobar">${[10,30,120,600].map(s=>`<button data-s="${s}">${s} min/tick</button>`).join('')} <button id="loClose">✕ Close</button></div><div id="lobody"></div>`;document.body.appendChild(w);
  w.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>LO.speed=+b.dataset.s);$('loClose').onclick=close;
LO.t=8*60;feed('robot','boot',{mode:'mock',connectors:Object.keys(CONN),shop:'empty'});think('Day 1: empty shop, zero traffic','Plan: research niches → design → Printify drafts → SEO → batch approval → publish. No orders until listings are live.');probeBackend()}
 $('lowrap').classList.remove('hidden');LO.on=true;clearInterval(LO.timer);LO.timer=setInterval(tick,400);render()}
function close(){LO.on=false;clearInterval(LO.timer);$('lowrap').classList.add('hidden')}
LO.open=open;LO.close=close;LO.tick=tick;LO.CONN=CONN;
addEventListener('DOMContentLoaded',()=>{for(const [id,par] of [['bLiveT','title'],['bLive','ctl']]){const b=document.createElement('button');b.id=id;b.textContent=par==='title'?'🛰 Live Ops sim':'🛰';b.title='Live Ops simulation (watch-only)';b.onclick=open;const p=$(par);par==='title'?p.insertBefore(b,$('bHall')):p.appendChild(b)}});
})();
