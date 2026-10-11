// "What he's doing now" — first screen of real mode (Live Ops). Polls the worker's public read-only feed every 15s.
(function(){const URL0='https://robot-founder-server.dominicgiordanodg.workers.dev/public/now';let timer=null;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const et=x=>x?new Date(x).toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' ET':'—';
const ICON={'Research':'🔎','Picking ideas':'💡','Designing':'🎨','Writing the listing':'✍️','Making photos':'📸','Pre-publish review':'🛡️','Publishing':'🚀','Orders':'📦','Daily digest':'📧','Audit':'🧾','Follow-ups':'📌','Budget':'💸','Guardrails':'🚧'};
const css=`#nowview{color:#e8e8e8}#nowview .nowcard{background:#14202b;border:1px solid #2b3d4f;border-radius:10px;padding:14px;margin:10px 0}
#nowview .nowhead{display:flex;gap:14px;align-items:center}#nowview .bot{font-size:42px;animation:nb 1.6s ease-in-out infinite}@keyframes nb{50%{transform:translateY(-4px)}}
#nowview .live{display:inline-block;width:10px;height:10px;border-radius:50%;background:#3c6;margin-right:6px;animation:np 1.2s infinite}#nowview .idle{background:#888;animation:none}@keyframes np{50%{opacity:.3}}
#nowview .ngrid{display:grid;grid-template-columns:2fr 1fr;gap:12px}@media(max-width:800px){#nowview .ngrid{grid-template-columns:1fr}}
#nowview .feed{max-height:430px;overflow:auto}#nowview .fe{padding:6px 0;border-bottom:1px solid #22313f}#nowview .fe small{color:#9ab}#nowview .stat{display:inline-block;margin:4px 14px 4px 0}#nowview .stat b{font-size:22px;display:block}
#nowview .w{padding:6px 0;border-bottom:1px solid #22313f;font-size:14px}#nowview .tabs button{margin-right:6px}`;
function draw(el,d){const n=d.now||{},run=!!n.running,F=d.feed||[],S=d.stats||{},A=(d.waiting||{}).approvals||[],B=(d.waiting||{}).browser||[];
 el.innerHTML=`<div class="nowcard nowhead"><div class="bot">🤖</div><div><div><span class="live ${run?'':'idle'}"></span><b>${run?'Working now':'Idle'}</b> — <b>${esc(n.task||(F[0]&&F[0].task)||'Waiting for the next hourly run')}</b> <small>${et(n.at||(F[0]&&F[0].t))}</small></div>
  <div style="margin-top:4px;font-size:16px">${esc(n.step||(F[0]&&F[0].msg)||'No activity logged yet.')}</div><small>Updates every 15 s · hourly runs at :07 · drafts only — nothing publishes without Dom.</small></div></div>
 <div class="nowcard">${[['Drafted today',S.drafted_today],['Rejected by my checks',S.rejected_today],['Published today',S.published_today],['Waiting on Dom',A.length+B.length]].map(([k,v])=>`<span class="stat"><b>${v??0}</b>${k}</span>`).join('')}<span class="stat"><b style="font-size:15px">${et(S.last_run)}</b>Last run</span></div>
 <div class="ngrid"><div class="nowcard"><h3>🧠 Thought process & recent actions</h3><div class="feed">${F.map(e=>`<div class="fe">${ICON[e.task]||'•'} <b>${esc(e.task)}</b> <small>${et(e.t)}</small><br>${esc(e.msg)}</div>`).join('')||'<i>No entries yet — the next hourly run will fill this in.</i>'}</div></div>
 <div class="nowcard"><h3>⏳ Waiting on Dom</h3><b>Approvals (${A.length})</b>${A.map(a=>`<div class="w">✅ ${esc(a.title)}<br><small>${et(a.at)}${a.task?' · '+esc(a.task):''}</small></div>`).join('')||'<div class="w"><i>none</i></div>'}
  <b style="display:block;margin-top:10px">Browser tasks (${B.length})</b>${B.map(r=>`<div class="w">🖱️ ${esc(r.title)}<br><small>${esc(r.todo)}</small></div>`).join('')||'<div class="w"><i>none</i></div>'}</div></div>`}
async function tick(el){try{const d=await (await fetch(URL0,{cache:'no-store'})).json();draw(el,d)}catch(e){el.innerHTML=`<div class="nowcard">🟡 Worker feed unreachable (${esc(e.message)}). Retrying…</div>`}}
function mount(el){if(!document.getElementById('nowcss')){const s=document.createElement('style');s.id='nowcss';s.textContent=css;document.head.appendChild(s)}clearInterval(timer);tick(el);timer=setInterval(()=>{if(document.body.contains(el)&&el.offsetParent!==null)tick(el)},15000)}
window.NOWVIEW={mount}})();
