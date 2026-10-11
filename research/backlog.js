// Node: build research/backlog.json from research/market.json (run by the daily Action).
const fs=require('fs'),path=require('path');global.ECON=null;const {generate}=require('../ideaengine.js');
const m=JSON.parse(fs.readFileSync(path.join(__dirname,'market.json')));let prev=[];try{prev=JSON.parse(fs.readFileSync(path.join(__dirname,'backlog.json'))).experiments||[]}catch(e){}
const r=generate(m,{prevExperiments:prev,digitalShare:Number(process.env.DIGITAL_SHARE||.4),explore:Number(process.env.EXPLORE||.1),target:Number(process.env.TARGET||1200),dailyCap:Number(process.env.DAILY_CAP||8)});
fs.writeFileSync(path.join(__dirname,'backlog.json'),JSON.stringify(r));console.log(JSON.stringify(r.counts),r.experiments.length,r.backlog.filter(x=>x.stage==='ready').map(x=>x.product+' | '+x.title.slice(0,60)));
