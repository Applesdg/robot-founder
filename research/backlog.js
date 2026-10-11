// Node: build research/backlog.json from research/market.json (run by the daily Action).
const fs=require('fs'),path=require('path');global.ECON=null;const {generate}=require('../ideaengine.js');
const m=JSON.parse(fs.readFileSync(path.join(__dirname,'market.json')));const r=generate(m,{target:Number(process.env.TARGET||1200),dailyCap:Number(process.env.DAILY_CAP||8)});
fs.writeFileSync(path.join(__dirname,'backlog.json'),JSON.stringify(r));console.log(JSON.stringify(r.counts),r.backlog.slice(0,5).map(x=>x.title+' '+x.score));
