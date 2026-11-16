'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'../rootfs/etc/node-red/flows.json');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'issue192-'));
const target=path.join(dir,'flows.json');
try {
  fs.copyFileSync(base,target);
  const patchSource=fs.readFileSync(path.resolve(__dirname,'../issue192_patch.cjs'),'utf8');
  const patchTemp=path.join(dir,'issue192_patch.cjs');
  const patched=patchSource.replace("const path = '/etc/node-red/flows.json';", 'const path = '+JSON.stringify(target)+';');
  assert.notEqual(patched,patchSource,'patch path override missing');
  fs.writeFileSync(patchTemp,patched);
  cp.execFileSync(process.execPath,[patchTemp]);
  const flows=JSON.parse(fs.readFileSync(target,'utf8'));
  const source=flows.find(n=>n.id==='c90f119270193bd9').func;
  function render(count,ids,{master=true,stale=[],missing=false}={}){
    const now=Date.now(),seen={};
    if(master)seen.master=now;
    ids.forEach(id=>seen[id]=now);
    stale.forEach(id=>seen[id]=now-300000);
    const data={'premium.active':true,'premium.dashboard_mode':'both','nb_jkbms':count,'bms_broadcasting':true};
    if(!missing)data['premium.dashboard_bms_seen']=seen;
    const result=vm.runInNewContext('(function(){'+source+'\n})()',{
      global:{get:key=>data[key]},flow:{get:()=>null},msg:{payload:{}},node:{status:()=>{}},Date,console
    },{timeout:9000});
    const html=result.payload;
    assert(html.includes('function getBmsIds()'));
    const match=html.match(/const BMS_SLOTS_FROM_CONFIG\s*=\s*(\[[^;]*\]);/);
    assert(match,'server BMS slots not injected');
    const slots=JSON.parse(match[1]);
    const func=html.match(/function getBmsIds\(\)\{[\s\S]*?\}function mppt/);
    assert(func,'runtime getBmsIds missing');
    const code=func[0].slice(0,-'function mppt'.length);
    const actual=vm.runInNewContext(code+'\ngetBmsIds()',{
      BMS_SLOTS_FROM_CONFIG:slots,BMS_BROADCASTING_FROM_CONFIG:true,BMS_BROADCASTING:true,
      STATES:{'sensor.bms_2_soc':{state:'50'},'sensor.bms_4_soc':{state:'50'}},
      bmsSortKey:x=>x==='master'?0:Number(x),detectBroadcastingMode:()=>true
    },{timeout:3000});
    return {server:slots,client:Array.from(actual)};
  }
  const scenarios=[];
  for(const id of [1,2,3,4])scenarios.push(['master+'+id,2,[id],{},['master',id]]);
  scenarios.push(['four consecutive',4,[1,2,3],{},['master',1,2,3]]);
  scenarios.push(['four sparse',4,[1,3,5],{},['master',1,3,5]]);
  scenarios.push(['four sparse high',4,[4,7,12],{},['master',4,7,12]]);
  scenarios.push(['stale old address',2,[3],{stale:[2]},['master',3]]);
  scenarios.push(['partial discovery',4,[1,3],{},['master',1,3]]);
  scenarios.push(['master absent',4,[1,2,3],{master:false},[1,2,3]]);
  scenarios.push(['no discovery',4,[],{master:false,missing:true},[]]);
  scenarios.push(['all stale',4,[],{master:false,stale:[1,2,3]},[]]);
  scenarios.push(['configured count cap',3,[1,2,3],{},['master',1,2]]);
  scenarios.push(['secondary disconnected',2,[],{stale:[2]},['master']]);
  scenarios.push(['secondary returns',2,[2],{},['master',2]]);
  scenarios.push(['address changed and old retained',2,[4],{stale:[2]},['master',4]]);
  scenarios.push(['stale master with live slave',2,[4],{master:false,stale:['master']},[4]]);
  let count=0;
  for(const [name,total,ids,opts,expected] of scenarios){
    const result=render(total,ids,opts);
    assert.deepEqual(result.server,expected,name+' server');
    assert.deepEqual(result.client,expected,name+' browser');
    count+=2;console.log('PASS',name);
  }
  console.log('PASS',count,'server+browser assertions');
} finally {fs.rmSync(dir,{recursive:true,force:true});}
