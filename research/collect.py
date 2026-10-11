#!/usr/bin/env python3
"""Robot Founder market research job (prep mode). ToS-compliant only:
 - Wikimedia Pageviews REST API (documented public API; requires a descriptive User-Agent) for real interest signals.
 - Hand-curated public sources in curated.json (links + dates).
 - robots.txt honored for any HTML page fetch (none needed today).
No logins, no scraping of marketplaces, no invented sales numbers. Output: research/market.json"""
import json,urllib.request,urllib.robotparser,datetime,os,statistics,time
UA='RobotFounderResearchBot/1.0 (https://github.com/Applesdg/robot-founder; research job)'
HERE=os.path.dirname(os.path.abspath(__file__))
def get(url):
    req=urllib.request.Request(url,headers={'User-Agent':UA});return json.load(urllib.request.urlopen(req,timeout=30))
def allowed(url):
    from urllib.parse import urlparse;p=urlparse(url);r=urllib.robotparser.RobotFileParser(f'{p.scheme}://{p.netloc}/robots.txt')
    try:r.read();return r.can_fetch(UA,url)
    except Exception:return False
today=datetime.date.today();end=today.replace(day=1)-datetime.timedelta(days=1);start=datetime.date(end.year-2,end.month,1)
def views(article):
    u=f'https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/{article}/monthly/{start:%Y%m%d}00/{end:%Y%m%d}00'
    try:items=get(u)['items']
    except Exception as e:return None
    time.sleep(0.2);return {'article':article,'url':'https://en.wikipedia.org/wiki/'+article,'api':u,'monthly':[[i['timestamp'][:6],i['views']] for i in items]}
BREEDS=['French_Bulldog','Labrador_Retriever','Golden_Retriever','German_Shepherd','Dachshund','Poodle','Beagle','Rottweiler','German_Shorthaired_Pointer','Bulldog','Cane_Corso','Cavalier_King_Charles_Spaniel','Yorkshire_Terrier','Australian_Shepherd','Pembroke_Welsh_Corgi','Siberian_Husky','Pug','Border_Collie','Chihuahua','Shih_Tzu','Maine_Coon','Ragdoll_cat','British_Shorthair','Siamese_cat','Bengal_cat']
SEASON=['Christmas_ornament','Halloween','Valentine%27s_Day','Mother%27s_Day','Pet_memorial','Portrait_painting','Print_on_demand']
def summarize(v):
    m=v['monthly'];last12=[x[1] for x in m[-12:]];prev12=[x[1] for x in m[-24:-12]]
    avg=statistics.mean(last12) if last12 else 0;yoy=(sum(last12)/sum(prev12)-1) if prev12 and sum(prev12) else None
    peak=max(m[-12:],key=lambda x:x[1])[0] if m else None
    return {**v,'avg_monthly_12m':round(avg),'yoy':None if yoy is None else round(yoy,3),'peak_month':peak}
out={'generated':datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),'window':[str(start),str(end)],'method':'Wikipedia pageviews = real public interest proxy (NOT sales). Curated sources = third-party/official claims with links.',
     'breeds':[],'seasonal':[],'curated':json.load(open(os.path.join(HERE,'curated.json')))}
for b in BREEDS:
    v=views(b)
    if v:out['breeds'].append(summarize(v))
for s in SEASON:
    v=views(s)
    if v:out['seasonal'].append(summarize(v))
AKC={'French_Bulldog':1,'Labrador_Retriever':2,'Golden_Retriever':3,'German_Shepherd':4,'Dachshund':5,'Poodle':6,'Beagle':7,'Rottweiler':8,'German_Shorthaired_Pointer':9,'Bulldog':10,'Cane_Corso':11,'Cavalier_King_Charles_Spaniel':12,'Yorkshire_Terrier':13,'Australian_Shepherd':14,'Pembroke_Welsh_Corgi':16,'Pomeranian':19,'Shih_Tzu':21,'Chihuahua':24,'Border_Collie':26,'Siberian_Husky':30,'Pug':38}
mx=max(b['avg_monthly_12m'] for b in out['breeds'])
for b in out['breeds']:
    r=AKC.get(b['article']);b['akc_rank_2025']=r
    # owners matter more than curiosity: weight AKC ownership rank (cats: neutral 1/sqrt(8)); interest normalized. Score is OUR heuristic, labeled.
    b['score']=round((b['avg_monthly_12m']/mx)**.5*(1/(r or 8))**.5,3)
out['breeds'].sort(key=lambda x:-x['score'])
out['caveats']=['Wikipedia pageviews measure curiosity, not purchases; overall Wikipedia traffic fell in 2025-26 (all YoY negative), so compare breeds relative to each other.','Score = sqrt(normalized pageviews) x sqrt(1/AKC rank) is our heuristic, not data.','No sales numbers are claimed; keyword volumes quoted are third-party estimates with links.']
# ---- idea board: concepts derived from the signals above (prices from economics.js POD variants) ----
ECON={'Poster 18x24':39,'Canvas 12x16':69,'Canvas 16x20':89,'Mug 11oz':24,'Fleece blanket 50x60':69,'Digital portrait':29}
def nice(a):return a.replace('_',' ').replace(' cat','').replace('%27',"'")
ideas=[]
for i,b in enumerate(out['breeds'][:8]):
    n=nice(b['article']);kind='cat' if b['article'] in('Maine_Coon','Ragdoll_cat','British_Shorthair','Siamese_cat','Bengal_cat') else 'dog'
    prod=['Mug 11oz','Canvas 12x16','Fleece blanket 50x60','Poster 18x24'][i%4]
    ideas.append({'title':f"{n} {'Mom' if prod=='Mug 11oz' else ''} {'Blanket' if 'blanket' in prod else prod.split(' ')[0]} — Watercolor {n} Portrait Gift".replace('  ',' '),'product':prod,'price':ECON[prod],'price_basis':'economics.js POD variant price','keyword':f"{n.lower()} {'mom mug' if prod=='Mug 11oz' else 'gift'}",
      'why':f"{n}: ~{b['avg_monthly_12m']:,} Wikipedia views/mo (real, interest proxy; YoY {'' if b['yoy'] is None else ('+' if b['yoy']>=0 else '')+str(round(b['yoy']*100))+'%'}). Breed-specific designs scale across products (catalogpush); illustrated designs out-pull name-only items (listadum).",
      'brief':f"Watercolor illustration of a {n} {kind}, head-and-shoulders, warm pastel palette, white background, generous margin for {prod}.",
      'prompt':f"watercolor painting of a {n} {kind}, soft pastel colors, loose brush strokes, white background, centered portrait, high detail eyes, no text",
      'sources':['akc2025','catalogpush','listadum'],'breed':b['article'],'mockup':'placeholder'})
xmas=next((s for s in out['seasonal'] if s['article']=='Christmas_ornament'),None)
ideas.append({'title':'Custom Pet Portrait Christmas Ornament / Mug from Your Photo','product':'Mug 11oz','price':24,'price_basis':'economics.js (ornament not in model yet → mug)','keyword':'personalized pet portrait christmas',
  'why':'"personalized pet portrait" Etsy searches jump ~7x Oct→Dec (rankhero estimate); Christmas ornament Wikipedia interest peaks in '+(xmas['peak_month'] if xmas else 'Dec')+' (real). Must be live by early November.','brief':'Customer photo → AI portrait in festive frame with name + year.','prompt':'portrait of [PET] from photo, cozy Christmas watercolor style, red scarf, soft snow, name banner','sources':['rankhero_ppp'],'mockup':'placeholder','season':'Christmas'})
ideas.append({'title':'Royal Renaissance Pet Portrait — Digital File from Your Photo','product':'Digital portrait','price':29,'price_basis':'economics.js digital portrait','keyword':'renaissance pet portrait',
  'why':'Illustrated custom portraits over-index on Etsy (listadum); Renaissance style claimed popular (vendor blog — unverified). Zero COGS; good review seeder. Etsy requires AI disclosure.','brief':'Pet head on a royal oil-painting body, velvet cape, gold frame.','prompt':'renaissance oil painting of [PET] as a royal noble, velvet robe, ornate gold frame, dramatic lighting','sources':['listadum','pawsonnet'],'mockup':'placeholder'})
ideas.append({'title':'Pet Memorial Portrait Canvas — Rainbow Bridge Keepsake','product':'Canvas 12x16','price':69,'price_basis':'economics.js','keyword':'pet memorial gift',
  'why':'Memorial gifts are a common pet-gift search with no holiday dependency (our assumption — not yet measured; Etsy API pending). High emotional value; handle with care in copy.','brief':'Soft watercolor portrait with halo light, name and dates.','prompt':'gentle watercolor portrait of [PET], soft golden light, peaceful sky, space for name and dates','sources':[],'mockup':'placeholder'})
out['ideas']=ideas
# ---- trend signals → auto-add niches (real Wikipedia pageview growth; threshold is OUR rule) ----
tax=json.load(open(os.path.join(HERE,'taxonomy.json')));TM=tax['trademark_blocklist'];trends=[]
for a in tax['trend_candidates']:
    v=views(a)
    if not v:continue
    s_=summarize(v);name=a.replace('_',' ').split(' (')[0];blocked=next((t for t in TM if t in name.lower()),None)
    s_['niche']=name;s_['auto_add']=bool(not blocked and s_['yoy'] is not None and s_['yoy']>=0.0 and s_['avg_monthly_12m']>=500)
    s_['blocked']=blocked;s_.pop('monthly',None);trends.append(s_)
trends.sort(key=lambda x:-(x['yoy'] or -9))
out['trends']={'rule':'auto-add a niche when 12-month Wikipedia views ≥ 500/mo and YoY ≥ 0% (Wikipedia overall fell ~20% YoY, so flat = relative growth). Blocked if trademark.','items':trends,'auto_added':[t['niche'] for t in trends if t['auto_add']]}
comp=json.load(open(os.path.join(HERE,'competitors.json')));age=(today-datetime.date.fromisoformat(comp['reviewed'])).days
for b in comp['benchmarks']:b['position']='above range' if b['ours']>b['high'] else 'below range' if b['ours']<b['low'] else 'within range'
comp['age_days']=age;comp['stale']=age>60;out['competitors']=comp
json.dump(out,open(os.path.join(HERE,'market.json'),'w'),indent=1)
print('breeds',len(out['breeds']),'seasonal',len(out['seasonal']),'ideas',len(ideas))
