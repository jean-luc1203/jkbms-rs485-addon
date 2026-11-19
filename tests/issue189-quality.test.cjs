'use strict';
const {test}=require('node:test'); const assert=require('node:assert/strict');
const flows=require('../rootfs/etc/node-red/flows.json'); const nodes=new Map(flows.map(n=>[n.id,n]));
const store=(init={})=>{const m=new Map(Object.entries(init));return {get:k=>m.get(k),set:(k,v)=>m.set(k,v)};};
function runner(id,g={},f={}){const global=store(g),flow=store(f),context=store();const fn=new Function('msg','Buffer','node','flow','global','context',nodes.get(id).func);return {flow,global,call:msg=>fn(msg,Buffer,{warn(){},log(){},debug(){},error(){},status(){}},flow,global,context)};}
const good=(n=16,v=3.3)=>Object.fromEntries(Array.from({length:n},(_,i)=>[`Cell_${i+1}_volt_V`,v]));
for(const mode of ['active','broadcast']){const active=mode==='active',id=active?'1890000000000001':'1890000000000002';const msg=p=>({payload:p,bms_numero:1,_issue16611_reply_bms:1});
test(mode+' telemetry gate preserves low/high nonzero measurements and rejects malformed snapshots',()=>{const r=runner(id,{jk_cell_count:16},{jk_cell_count_BMS_1:16,issue189_active_count_1:16});for(const v of [0.001,1.5,3.3,4.5,6])assert.equal(r.call(msg(good(16,v)))[0].payload.Cell_1_volt_V,v);const quality=r.flow.get('issue189_telemetry_quality_1');const ts=quality.last_good_ts;for(const v of [0,36.066,NaN,Infinity,null,undefined,'3.3',-1]){let p=good();p.Cell_3_volt_V=v;assert.equal(r.call(msg(p))[0],null);}assert.equal(r.flow.get('issue189_telemetry_quality_1').last_good_ts,ts);assert.equal(r.call(msg(good()))[0].payload.Cell_1_volt_V,3.3);});
test(mode+' supports configured 8S and independent master count',()=>{const r=runner(id,{jk_cell_count:8},{jk_cell_count_BMS_1:8,jk_cell_count_BMS_master:12,issue189_active_count_1:8});assert(r.call(msg(good(8)))[0]);if(!active){assert(r.call({bms_numero:0,payload:good(12)})[0]);assert.equal(r.call({bms_numero:0,payload:good(8)})[0],null);}});
}
test('wire topology gates every decoded telemetry consumer, rejection only advances active polling',()=>{const a=nodes.get('1890000000000001'),b=nodes.get('1890000000000002');assert.deepEqual(nodes.get('c437bd1d4debf783').wires,[[a.id]]);assert.deepEqual(nodes.get('e1e32d6c66126190').wires,[[b.id]]);assert.deepEqual(a.wires[1],['b709b5103e57078c']);assert.deepEqual(b.wires[1],[]);assert(a.wires[0].includes('f4a706b396b5a017'));assert(b.wires[0].includes('4d1b9f8913f7f7f8'));});
test('all JK header split positions retain prefix and resynchronize',()=>{const header=Buffer.from([85,170,235,144]);const frame=Buffer.alloc(308);header.copy(frame);frame[4]=2;for(let i=1;i<4;i++){const r=runner('3328d11cbeec411c');assert.equal(r.call({payload:Buffer.concat([Buffer.from([255,254]),frame.subarray(0,i)])}),null);const out=r.call({payload:Buffer.concat([frame.subarray(i),header])});assert.deepEqual(out[0][0].payload.payload,frame);assert.equal(r.flow.get('issue166_framing_passive').accounting_errors,0);}});
test('active per-address count isolates mixed 8S and 16S and snapshots count',()=>{const r=runner('1890000000000001',{jk_cell_count:8},{issue189_active_count_1:8,issue189_active_count_2:16});const m=(id,p)=>({payload:p,_issue16611_reply_bms:id});assert.equal(r.call(m(1,good(8)))[0]._issue189_cell_count,8);assert.equal(r.call(m(2,good(8)))[0],null);assert.equal(r.call(m(2,good(16)))[0]._issue189_cell_count,16);assert.equal(r.call(m(134,good(16)))[0],null);});
for(const active of [true,false])test('invalid explicit SETUP count quarantines telemetry until valid setup: '+active,()=>{const setup=runner(active?'67344bf7dbc7f7ce':'6629834b4a8e1525');const key=active?'issue189_active_count_1':'jk_cell_count_BMS_1';const m=count=>({payload:{cell_count_N:count},_issue16611_reply_bms:1,bms_numero:1});assert.equal(setup.call(m(32)),null);assert.equal(setup.flow.get(key),null);const gate=runner(active?'1890000000000001':'1890000000000002',{}, {[key]:null});assert.equal(gate.call({...m(16),payload:good()})[0],null);assert.equal(setup.call(m(8)).cell_count_N,8);gate.flow.set(key,setup.flow.get(key));assert.equal(gate.call({...m(8),payload:good(8)})[0]._issue189_cell_count,8);});
test('unknown count uses explicit conservative 16S fallback, not another BMS global count',()=>{const r=runner('1890000000000001',{jk_cell_count:8});assert.equal(r.call({payload:good(8),_issue16611_reply_bms:1})[0],null);assert.equal(r.call({payload:good(16),_issue16611_reply_bms:1})[0]._issue189_cell_count,16);});
test('broadcast raw alarm path remains separate from telemetry gate',()=>{const raw=nodes.get('e2fa0b4f9870102a');assert(raw.wires.flat().includes('74eab2ca3f15f736'));assert(raw.wires.flat().includes('e1e32d6c66126190'));});

test('canonical flow is the only runtime protocol implementation: no external issue patchers',()=>{
  const fs=require('node:fs'),path=require('node:path');
  const root=path.join(__dirname,'..');
  const dir=path.join(root,'rootfs/etc/node-red');
  assert.deepEqual(fs.readdirSync(dir).filter(n=>/^(issue\d|.*snippet)/i.test(n)),[]);
  for(const file of ['Dockerfile','standalone/Dockerfile','standalone/entrypoint.sh','rootfs/etc/s6-overlay/s6-rc.d/init-nodered/run']){
    const source=fs.readFileSync(path.join(root,file),'utf8');
    assert.doesNotMatch(source,/issue\d+[^\s]*\.(?:cjs|js|json)|\b[^\s]*snippet[^\s]*\.js\b/i,file);
  }
  assert.equal(nodes.size,flows.length,'duplicate node IDs');
  for(const n of flows){if(n.type==='function')assert.doesNotThrow(()=>new Function('msg',n.func),n.id);for(const id of (n.wires||[]).flat())assert(nodes.has(id),`${n.id} -> ${id}`);}
});
for(const [mode,id,identity] of [['active','1890000000000001',{_issue16611_reply_bms:1}],['broadcast','1890000000000002',{bms_numero:1}]])test(mode+' rejected measurements do not refresh last valid acquisition or alter another BMS quality',()=>{
 const r=runner(id);const key='issue189_telemetry_quality_1';const other='issue189_telemetry_quality_2';
 r.flow.set(key,{accepted:1,rejected:0,last_good_ts:123});r.flow.set(other,{accepted:2,rejected:0,last_good_ts:456});
 assert.equal(r.call({...identity,payload:good(16,36.066)})[0],null);
 assert.equal(r.flow.get(key).last_good_ts,123);assert.equal(r.flow.get(key).rejected,1);
 assert.deepEqual(r.flow.get(other),{accepted:2,rejected:0,last_good_ts:456});
 assert(r.call({...identity,payload:good()})[0]);assert(r.flow.get(key).last_good_ts>123);assert.equal(r.flow.get(key).reason,null);
});

// Real decoder regression: synthetic frames with deliberately isolated register bits.
// The test dependency is mandatory (CI installs the pinned buffer-parser 3.2.2).
const parserModule = process.env.BUFFER_PARSER_PATH || 'node-red-contrib-buffer-parser/buffer-parser.js';
let Parser;
require(parserModule.startsWith('/') ? require('node:path').join(parserModule, 'buffer-parser.js') : parserModule)({
  nodes: {
    registerType(name, ctor){if(name==='buffer-parser') Parser=ctor;},
    createNode(n){n.handlers={};n.errors=[];n.messages=[];n.on=(e,fn)=>n.handlers[e]=fn;n.status=()=>{};n.error=e=>n.errors.push(String(e));n.send=m=>n.messages.push(m);}
  },
  util: {evaluateNodeProperty(v,t,n,m,cb){cb(null,t==='msg'?String(v).split('.').reduce((o,k)=>o?.[k],m):t==='ui'?{}:v);}}
});
assert.equal(typeof Parser,'function');
function actualParse(id, message){
  const parser=new Parser(structuredClone(nodes.get(id)));
  parser.handlers.input(message);
  assert.deepEqual(parser.errors,[]);
  assert.equal(parser.messages.length,1);
  return parser.messages[0];
}
const setupBits={display_always_on_switch_B:0x0010,smart_sleep_switch_B:0x0040,disable_pcl_module_switch_B:0x0080,timed_stored_data_switch_B:0x0100,Charging_Floating_Mode_B:0x0200};
for(const parserId of ['e6750cbf7737dd71','e0beba39da568e23'])test('real SETUP parser maps 0x1114 independent bits: '+parserId,()=>{
  const fields=Object.keys(setupBits).filter(k=>nodes.get(parserId).items.some(i=>i.name===k));
  assert(fields.length>=4);
  for(const word of [0,0xffff,0x0359,0x405a,...Array.from({length:16},(_,i)=>1<<i)]) {
    const b=Buffer.alloc(308);b.set([0x55,0xaa,0xeb,0x90,1]);b.writeUInt16LE(word,282);
    const p=actualParse(parserId,{payload:b}).payload;
    for(const key of fields)assert.equal(p[key],Boolean(word&setupBits[key]),`${key}, 0x${word.toString(16)}`);
    if(parserId==='e6750cbf7737dd71')assert.equal(p['0x1114'],word);
  }
});
for(const [mode,parserId,gateId] of [['active','c437bd1d4debf783','1890000000000001'],['broadcast','e1e32d6c66126190','1890000000000002']])test('real LIVE parser and quality gate publish binary balance activity: '+mode,()=>{
  for(const raw of [0,1,2,255]){
    const b=Buffer.alloc(308);b.set([0x55,0xaa,0xeb,0x90,2]);
    for(let i=0;i<16;i++)b.writeUInt16LE(3300+i,6+2*i);
    b[172]=raw;b[200]=1;
    const parsed=actualParse(parserId,{payload:b,_issue16611_reply_bms:1,bms_numero:1});
    const out=runner(gateId).call(parsed)[0];assert(out);
    assert.equal(out.payload.Balance_Action_B,raw===0?0:1);
    assert.equal(out.payload.Switch_Balance_B,1,'legacy key unchanged');
  }
});
test('0x1114 cached word is keyed by verified SETUP identity, not mutable polling counter',()=>{
  const r=runner('97ba2dfa27f6b50c',{'slaveAddress-Trame2':2,'0x1114':[[0x1234,2]]});
  // A valid BMS 1 response arrived after the polling counter advanced to BMS 2.
  const out=r.call({_issue16611_reply_bms:1,payload:{'0x1114':0x0259}});
  assert.equal(out.payload.bms,1);assert.equal(out.payload.value,0x0259);
  assert.deepEqual(r.global.get('0x1114'),[[0x1234,2],[0x0259,1]]);
  // Unverified and malformed data must not pollute the shared register cache.
  for(const bad of [{payload:{'0x1114':0}},{_issue16611_reply_bms:1,payload:{'0x1114':NaN}},{_issue16611_reply_bms:134,payload:{'0x1114':0}}]){
    assert(r.call(bad),'normal SETUP loop must keep progressing');
    assert.deepEqual(r.global.get('0x1114'),[[0x1234,2],[0x0259,1]]);
  }
});

test('active dashboard LIVE uses verified BMS identity and acquisition cell count',()=>{
  const r=runner('5b3a149fadaaeeaf',{'slaveAddress-Trame3':2});
  const p={...good(8),...Object.fromEntries(Array.from({length:8},(_,i)=>[`Cell_${9+i}_volt_V`,0]))};
  const out=r.call({_issue16611_reply_bms:1,bms_numero:1,_issue189_cell_count:8,payload:p});
  assert.equal(out.payload.bmsAddress,1);assert.equal(out.payload.cellCount,8);assert.equal(out.payload.cellules.count,8);assert.equal(out.payload.cellules.minVoltage,3.3);
  assert.equal(r.call({payload:p,_issue189_cell_count:8}),null);
  assert.equal(r.call({_issue16611_reply_bms:1,bms_numero:2,_issue189_cell_count:8,payload:p}),null);
  assert.equal(r.call({_issue16611_reply_bms:134,_issue189_cell_count:8,payload:p}),null);
});
test('active dashboard STATIC uses verified BMS identity instead of polling counter',()=>{
  const r=runner('bf829c99eeb5a2c4',{'slaveAddress-Trame1':2});
  assert.equal(r.call({_issue16611_reply_bms:1,bms_numero:1,payload:{Uptime_S:3600}}).payload.bmsAddress,1);
  assert.equal(r.call({payload:{Uptime_S:3600}}),null);
  assert.equal(r.call({_issue16611_reply_bms:1,bms_numero:2,payload:{Uptime_S:3600}}),null);
});
test('active dashboard SETUP rejects conflicting or absent verified identity',()=>{
  const r=runner('f5a2072c35bc736d');
  assert.equal(r.call({_issue16611_reply_bms:1,bms_numero:1,payload:{Device_address_N:1}}).bmsAddress,'1');
  assert.equal(r.call({_issue16611_reply_bms:1,bms_numero:1,payload:{Device_address_N:2}}),null);
  assert.equal(r.call({payload:{Device_address_N:1}}),null);
});

// Synthetic equivalents of the issue #189 reproduction cases, no user telemetry in CI.
function crc16(bytes){let crc=0xffff;for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=crc&1?(crc>>>1)^0xa001:crc>>>1;}return crc;}
function liveWire(address, cells=16){const b=Buffer.alloc(308);b.set([85,170,235,144,2]);for(let i=0;i<cells;i++)b.writeUInt16LE(3300+i,6+2*i);b.writeUInt16LE(Math.round((3.3*cells)*100),234);b[172]=2;b.set([address,16,22,32,0,1],300);b.writeUInt16LE(crc16(b.subarray(300,306)),306);return fixSum(b);}
function fixSum(b){b[299]=b.subarray(0,299).reduce((s,v)=>(s+v)&255,0);return b;}
function firstMessage(x){return Array.isArray(x)?Array.isArray(x[0])?x[0][0]:x[0]:x;}
const cellStates=out=>out.filter(m=>/\/Cell_\d+_volt$/.test(m.topic));
for(const [mode,addr] of [['active',2],['broadcast',0],['broadcast',2]])test('issue189 wire-to-MQTT real parser: '+mode+' BMS '+addr,()=>{
  const active=mode==='active';
  const base=addr===0?'BMS_master':'BMS_'+addr;
  const g={bms_broadcasting:!active,nb_jkbms:2,communication_debug:false,'slaveAddress-Trame3':1};
  const validator=runner(active?'b02adbe3a64e64f2':'86a0f48a516a10b6',g);
  const gate=runner(active?'1890000000000001':'1890000000000002',g);
  const publisher=runner(active?'653aafd0b7ddd759':'39f7fd7720e246a1',g);
  const filter=runner('4d1b9f8913f7f7f8',g);
  function run(b){
    const raw=active?{payload:b,topic:'Trame-3-dynamiques',diag_slave_id:addr}:{payload:{topic:'broadcast/jkbms_reply',payload:b,slave:1,hex:b.toString('hex')}};
    const accepted=firstMessage(validator.call(raw));if(!accepted)return [];
    const parsed=actualParse(active?'c437bd1d4debf783':'e1e32d6c66126190',accepted);
    let safe=gate.call(parsed)[0];if(!safe)return [];
    if(!active)safe=filter.call(safe);if(!safe)return [];
    return publisher.call(safe)?.[0]||[];
  }
  const valid=run(liveWire(addr));assert.equal(cellStates(valid).length,16);assert(cellStates(valid).every(m=>m.topic.startsWith(base+'/')));
  assert(valid.some(m=>m.topic===base+'/Balance_Action'&&Number(m.payload)===1));
  const crcBad=liveWire(addr);crcBad[307]^=1;assert.equal(run(crcBad).length,0);
  const sumBad=liveWire(addr);sumBad.writeUInt16LE(36066,6);assert.equal(run(sumBad).length,0);
  assert.equal(run(fixSum(sumBad)).length,0,'checksum collision must not cause a 36V cell publish');
  assert.equal(run(liveWire(addr,15)).length,0,'partial acquisition must not replace clean state');
  assert.equal(cellStates(run(liveWire(addr))).length,16,'recovery after rejection');
});

// Qualification release: allow only the original wire-level reading requests.
// Even manually injected or retained settings commands cannot cross these guards.
const wireReadIds=['596f27e50df4eb08','9c671d2c812b84ba','5c7dad46b6d9a54f','dc88867ae97dfe2c'];
const guardIds=['1890000000000003','1890000000000004','1890000000000005'];
const mkFrame=(arr)=>{const b=Buffer.from(arr);const c=crc16(b);return Buffer.concat([b,Buffer.from([c&255,c>>>8])]);};
for(const id of guardIds)test(`RC2 read-only wire guard permits original polls and rejects all configuration writes: ${id}`,()=>{
  const r=runner(id,{bms_broadcasting:false,Authorize_Modify_Settings:true});
  for(let addr=1;addr<=15;addr++){
    for(const pollId of wireReadIds){
      const p=runner(pollId,{'slaveAddress-Trame1':addr,'slaveAddress-Trame2':addr,'slaveAddress-Trame3':addr,'slaveAddress-Trame4':addr,nb_jkbms:15}).call({});
      assert.equal(p.payload[0],addr);assert.equal(r.call(p),p);
      const bad={...p,payload:Buffer.from(p.payload)};bad.payload[bad.payload.length-1]^=1;assert.equal(r.call(bad),null);
    }
    for(const reg of [0x1000,0x1114,0x1070,0x1074,0x14e4,0x14f0,0x161a,0x1622]){
      const p=mkFrame([addr,0x10,reg>>>8,reg&255,0,1,2,0x24,0x19]);assert.equal(r.call({payload:p}),null);
    }
    // Same nominal read triggers, invalid value, count or byte count.
    for(const reg of [0x161c,0x161e,0x1620]){
      assert.equal(r.call({payload:mkFrame([addr,0x10,reg>>>8,reg&255,0,1,2,0,1])}),null);
      assert.equal(r.call({payload:mkFrame([addr,0x10,reg>>>8,reg&255,0,2,2,0,0])}),null);
    }
    assert.equal(r.call({payload:mkFrame([addr,6,0x11,0x14,0,0x10])}),null);
  }
  for(const addr of [0,16,134,255])assert.equal(r.call({payload:mkFrame([addr,3,0x12,0xa0,0,2])}),null);
  for(const p of [null,undefined,{},'write',Buffer.alloc(0),Buffer.alloc(9)])assert.equal(r.call({payload:p}),null);
  r.global.set('bms_broadcasting',true);assert.equal(r.call({payload:mkFrame([1,3,0x12,0xa0,0,2])}),null);
  r.global.set('bms_broadcasting',undefined);assert.equal(r.call({payload:mkFrame([1,3,0x12,0xa0,0,2])}),null);
});
test('RC2 test build has no alternative active transport input bypass',()=>{
  const parents=id=>flows.filter(n=>(n.wires||[]).flat().includes(id)).map(n=>n.id).sort();
  assert.deepEqual(parents('957e248860cc2a81'),[guardIds[0]]);assert.deepEqual(parents('b90f87fb8568461a'),[guardIds[1]]);assert.deepEqual(parents('3e5a55e0cf2a0f5d'),[guardIds[2]]);
  assert.deepEqual(parents(guardIds[0]),['d962fa23cd75d256']);assert.deepEqual(parents(guardIds[1]),['a9d54c61db2740f0']);assert.deepEqual(parents(guardIds[2]),['a9d54c61db2740f0']);
  assert.deepEqual(parents('ca2e41c5da775228'),['1890000000000006']);
  assert.deepEqual(flows.filter(n=>['serial out','tcp out','serial request','tcp request','tcp-client'].includes(n.type)).map(n=>n.id).sort(),['3e5a55e0cf2a0f5d','957e248860cc2a81','b90f87fb8568461a','ca2e41c5da775228']);
});
test('RC2 test build rejects every settings command before optimistic state or DRY pending mutation',()=>{
  for(const id of ['97bd9f6150f08dc4','d120412a30000002']){
    const r=runner(id,{Authorize_Modify_Settings:true,bms_broadcasting:false});
    for(const control of ['display_always_on_switch','charging_floating_mode','smart_sleep_switch','disable_pcl_module_switch','timed_stored_data_switch','charging_switch','max_charge_current','dry1_trigger_code','dry2_trigger_value'])for(const retain of [true,false]){
      assert.equal(r.call({topic:`BMS_1/control/${control}/set`,payload:'True',retain}),null);
    }
    assert.equal(r.global.get('slaveAddress-setup'),undefined);assert.equal(r.global.get('dry_alpha6_pending_BMS_1_dry1_trigger_code'),undefined);
  }
  for(const id of ['049878c497f62e87','4261c063eac34854']){
    const r=runner(id,{Authorize_Modify_Settings:true});const out=r.call({topic:'BMS_GLOBAL/authorize_modify_settings/set',payload:'true',retain:true});
    assert.equal(r.global.get('Authorize_Modify_Settings'),false);assert.equal(String(out.payload),'false');assert.equal(out.topic,'BMS_GLOBAL/authorize_modify_settings/state');
  }
});
test('passive gateway can connect/close, never send data even if payload supplied',()=>{
  const r=runner('1890000000000006');for(const action of ['connect','close'])assert.deepEqual(r.call({action,host:'192.0.2.1',port:5032,payload:Buffer.alloc(11)}),{action,host:'192.0.2.1',port:5032});
  for(const action of ['write','send','data','',undefined])assert.equal(r.call({action,payload:Buffer.alloc(11)}),null);
});
test('quality keys are bounded by valid BMS identities',()=>{
  for(const [gate,identity] of [['1890000000000001','_issue16611_reply_bms'],['1890000000000002','bms_numero']]){
    const r=runner(gate);for(const value of [undefined,NaN,-1,16,134,'1']){assert.equal(r.call({[identity]:value,payload:good()})[0],null);assert.equal(r.flow.get('issue189_telemetry_quality_'+String(value)),undefined);}
  }
});
for(const [active,id,gate] of [[true,'7f01d6303fc91b5f','1890000000000001'],[false,'1391ce34b1a57bfa','1890000000000002']])test('health reports accepted telemetry age separately from raw communication: '+active,()=>{
  const now=Date.now();const r=runner(id,{bms_broadcasting:!active,nb_jkbms:2},{issue189_telemetry_quality_1:{accepted:4,rejected:0,last_good_ts:now-1000},issue189_telemetry_quality_2:{accepted:1,rejected:2,last_good_ts:now-2000000,last_reject_ts:now-1000,reason:'cell_outside_technical_range_1'},issue189_telemetry_quality_134:{accepted:1,last_good_ts:now}});
  const result=r.call({payload:{}});const p=result.payload;
  assert.equal(p.rc2_test_read_only,true);assert.equal(p.telemetry_quality_by_bms.BMS_1.state,'fresh');assert.equal(p.telemetry_quality_by_bms.BMS_2.state,'stale');assert.equal(p.telemetry_quality_by_bms.BMS_134,undefined);
  r.flow.set('issue189_telemetry_quality_1',{accepted:4,rejected:1,last_good_ts:now-2000,last_reject_ts:now-500,reason:'bad_cell'});
  assert.equal(r.call({}).payload.telemetry_quality_by_bms.BMS_1.state,'rejected');
  // Real function-node initialize code runs with fresh contexts on deployment.
  new Function('flow',nodes.get(gate).initialize)(r.flow);
  const after=r.call({}).payload.telemetry_quality_by_bms;
  if(active)assert.equal(after.BMS_1.state,'unknown');else assert.equal(after.BMS_1,undefined);
});
test('RC2 initialize clears fragmented and unpaired bytes, not configuration or alarm data',()=>{
  const f=store({rs485_buffer:[85,170],last_modbus_slave_broadcast:2,bms_alarm_state_1:{has_alarm:true}}),c=store({jkbms_pending_data:{payload:[85,170]}});
  new Function('flow',nodes.get('3328d11cbeec411c').initialize)(f);
  new Function('context',nodes.get('86a0f48a516a10b6').initialize)(c);
  assert.equal(f.get('rs485_buffer'),null);assert.equal(f.get('last_modbus_slave_broadcast'),null);assert.equal(c.get('jkbms_pending_data'),null);assert.deepEqual(f.get('bms_alarm_state_1'),{has_alarm:true});
});
