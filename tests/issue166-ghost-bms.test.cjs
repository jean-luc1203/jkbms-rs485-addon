// Regression suite for ISSUE #166, requires no external Node-RED dependencies.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const file = process.env.ISSUE166_FLOWS || path.join(__dirname, '..', 'rootfs/etc/node-red/flows.json');
const flows = JSON.parse(fs.readFileSync(file, 'utf8'));
const byId = new Map(flows.map(n => [n.id, n]));
const ids = {
  decoder: '86a0f48a516a10b6', extract: '74eab2ca3f15f736',
  alarms: '7d0985c839cd5ee2', data: '39f7fd7720e246a1',
  setup: '2321fa6d9d473fda', filter2: 'cd93ba9fcfb28703',
  filter3: '4d1b9f8913f7f7f8', pollAlarm: '44588e9ab8f432c4'
};
function store() {
  const data = new Map();
  return { get(k) { return data.get(k); }, set(k,v) {data.set(k,v);}, keys() {return [...data.keys()]} };
}
function runner(id) {
  const source = byId.get(id);
  assert(source && source.func);
  const fn = new Function('msg','Buffer','node','flow','context','global',source.func);
  const flow = store(), context = store(), global = store();
  const node = { warn() {}, error() {}, debug() {} };
  return { call(m) {return fn(m,Buffer,node,flow,context,global)}, flow, context, global };
}
function frame(type, id, size=308) {
  const b=Buffer.alloc(size);
  b.set([0x55,0xaa,0xeb,0x90,type]);
  if(type===1 && size>273) b.writeUInt32LE(id>>>0,270);
  return { payload: {topic:'broadcast/jkbms_reply',payload:b,slave:2} };
}
test('BMS addresses master, 1, 2, 15 are preserved',()=>{
  for(const id of [0,1,2,15]){
    const r=runner(ids.decoder),out=r.call(frame(1,id));
    assert.equal(out.bms_numero,id);
    assert.equal(r.flow.get('diag_serial_stats').detected_bms_list,id===0?'master':String(id));
  }
});
test('one valid DATA frame is paired with next valid SETUP',()=>{
  const r=runner(ids.decoder);
  assert.equal(r.call(frame(2,0)),null);
  const out=r.call(frame(1,2));
  assert.deepEqual(out[0].map(m=>m.bms_numero),[2,2]);
});
test('phantom BMS uint32 IDs never reach the DATA or SETUP branches',()=>{
  for(const id of [16,513,1280,327680,370147559,4294967295]){
    const r=runner(ids.decoder);
    r.call(frame(2,0));
    assert.equal(r.call(frame(1,id)),null);
    assert.equal(r.flow.get('diag_serial_stats'),undefined);
    assert.equal(r.context.get('jkbms_pending_data'),null);
  }
});
test('short DATA/SETUP frames are rejected before buffer parsers',()=>{
  const r=runner(ids.decoder);
  for(const n of [6,169,273,281]) assert.equal(r.call(frame(2,0,n)),null);
  for(const n of [6,169,273,280,283]) assert.equal(r.call(frame(1,0,n)),null);
  assert.equal(r.call(frame(1,0,284)).bms_type,'setup');
});
test('alarm extraction and alarm publishing reject all invalid identifiers',()=>{
  for(const id of [-488,16,327680,null,undefined,NaN,1.5,'2xyz','']){
    const e=runner(ids.extract),p=runner(ids.alarms);
    assert.equal(e.call({bms_numero:id,payload:Buffer.alloc(308)}),null);
    assert.deepEqual(p.call({bms_numero:id,payload:{error_code:0,errors:[]}}),[null,null]);
    assert.equal(p.flow.keys().length,0);
  }
});
test('valid alarm identifier 2 publishes exactly four config and four state topics',()=>{
  const p=runner(ids.alarms),out=p.call({bms_numero:2,payload:{error_code:0,errors:[]}});
  assert.equal(out[0].length,8);
  assert(out[0].every(x=>x.topic.toLowerCase().includes('bms_2')));
});
test('invalid identifiers cannot create DATA/Heating/SETUP MQTT entities',()=>{
  for(const id of [-488,16,327680,undefined,null,'','2abc']){
    for(const key of ['data','setup']){
      const r=runner(ids[key]);
      assert.equal(r.call({bms_numero:id,payload:{}}),null);
      assert.equal(r.flow.keys().length,0);
      assert.equal(r.global.keys().length,0);
    }
  }
});
test('both existing BMS validation filters reject strings with trailing junk',()=>{
  for(const key of ['filter2','filter3']){
    const r=runner(ids[key]);
    for(const id of ['14junk','1.5','0x04','16','']) assert.equal(r.call({bms_numero:id,payload:{}}),null);
    assert.equal(r.call({bms_numero:'2',payload:{}}).bms_numero,2);
  }
});
test('legacy active polling alarm publisher guards BMS IDs > 15',()=>{
  const r=runner(ids.pollAlarm);
  for(const id of [-488,16,327680,1.5]) assert.equal(r.call({alarms:{bms_id:id}}),null);
  assert.equal(r.flow.keys().length,0);
});
test('isolated add-on startup applies the patch as one shell command',()=>{
  const script = fs.readFileSync(path.join(__dirname, '..', 'rootfs/etc/s6-overlay/s6-rc.d/init-nodered/run'), 'utf8');
  const patchCall = 'node /etc/node-red/issue166-apply.cjs /etc/node-red/flows.json /config/smartphoton_jkbms_fix166/flows.json || bashio::exit.nok "Issue166 test flow patch failed"';
  assert(script.includes(patchCall), 'startup must call the patcher before launching Node-RED');
  assert(!script.includes('flows.json ' + String.fromCharCode(92, 92)), 'startup must not use an accidental doubled shell backslash');
});

test('live single-addon port 1891 is consistent without changing the Legacy flow URL',()=>{
  const root = path.join(__dirname, '..');
  const configYaml = fs.readFileSync(path.join(root, 'config.yaml'),'utf8');
  const configJs = fs.readFileSync(path.join(root, 'rootfs/etc/node-red/config.js'),'utf8');
  const dockerfile = fs.readFileSync(path.join(root, 'Dockerfile'),'utf8');
  const patcher = fs.readFileSync(path.join(root, 'rootfs/etc/node-red/issue166-apply.cjs'),'utf8');
  assert(configYaml.includes('"1891/tcp": 1891'), 'addon port mapping must be 1891');
  assert(configJs.includes('config.uiPort = 1891;'), 'Node-RED listener must use 1891');
  assert(dockerfile.includes('127.0.0.1:1891'), 'health check must use 1891');
  assert(!patcher.includes("':1892/endpoint/dashboard/'"), 'patcher must not redirect the dashboard to 1892');
  const urlNode = byId.get('a91bfb41bf5699ef');
  assert(urlNode && urlNode.func.includes(':1891/endpoint/dashboard/'), 'generated dashboard must retain original port');
});

function integrityFrame166(type=1, length=308) {
  const b = Buffer.alloc(length);
  b.set([0x55, 0xAA, 0xEB, 0x90, type]);
  if (length >= 300) {
    b[299] = b.subarray(0, 299).reduce((sum, v) => (sum + v) & 0xFF, 0);
  }
  if (length === 308) {
    // Independent known reference CRCs: CRC16/MODBUS(00 10 16 1E 00 01)=0x5664,
    // and CRC16/MODBUS(00 10 16 20 00 01)=0x9A05.
    b.set(type === 1
      ? [0x00, 0x10, 0x16, 0x1E, 0x00, 0x01, 0x64, 0x56]
      : [0x00, 0x10, 0x16, 0x20, 0x00, 0x01, 0x05, 0x9A], 300);
  }
  return b;
}
function flushIntegrityFrames166(r, framesToSend, firstChunk=0) {
  const payload = Buffer.concat([...framesToSend, Buffer.from([0x55, 0xAA, 0xEB, 0x90, 0x02])]);
  if (firstChunk > 0) {
    assert.equal(r.call({payload:payload.subarray(0, firstChunk)}), null);
    return r.call({payload:payload.subarray(firstChunk)});
  }
  return r.call({payload});
}
test('passive JK checksum and ACK CRC: correct SETUP/DATA remain unchanged',()=>{
  const r = runner('3328d11cbeec411c');
  const setup = integrityFrame166(1), data = integrityFrame166(2);
  const out = flushIntegrityFrames166(r, [setup,data], 120);
  assert.deepEqual(out[0].map(x=>x.payload.payload), [setup,data]);
  const d = r.flow.get('issue166_integrity_passive');
  assert.equal(d.frames,2);
  assert.deepEqual(d.types,{data:1,setup:1,other:0});
  assert.equal(d.lengths['308'],2);
  assert.deepEqual(d.checksum,{ok:2,bad:0,unavailable:0});
  assert.deepEqual(d.ack_crc,{ok:2,bad:0,unavailable:0});
  assert.equal(d.ack_shape_bad,0);
  assert.equal(d.samples.length,0);
});
test('passive observer reports corrupted JK body without rejecting or changing frame',()=>{
  const r=runner('3328d11cbeec411c');
  const b=integrityFrame166(2);
  b[80]^=0x04; // after checksum was set; deliberately corrupt content
  const out=flushIntegrityFrames166(r,[b]);
  assert.deepEqual(out[0][0].payload.payload,b);
  const d=r.flow.get('issue166_integrity_passive');
  assert.equal(d.checksum.bad,1);
  assert.equal(d.ack_crc.ok,1);
  assert.equal(d.samples[0].kind,'jk_checksum');
});
test('passive observer reports bad ACK CRC without rejecting or changing frame',()=>{
  const r=runner('3328d11cbeec411c');
  const b=integrityFrame166(1); b[307]^=0x01;
  const out=flushIntegrityFrames166(r,[b]);
  assert.deepEqual(out[0][0].payload.payload,b);
  const d=r.flow.get('issue166_integrity_passive');
  assert.equal(d.checksum.ok,1);
  assert.equal(d.ack_crc.bad,1);
  assert.equal(d.samples[0].kind,'ack_crc');
});
test('passive observer classifies short framed candidates as untestable, not rejected',()=>{
  const r=runner('3328d11cbeec411c');
  const b=integrityFrame166(2,290);
  const out=flushIntegrityFrames166(r,[b]);
  assert.deepEqual(out[0][0].payload.payload,b);
  const d=r.flow.get('issue166_integrity_passive');
  assert.equal(d.frames,1);
  assert.equal(d.checksum.unavailable,1);
  assert.equal(d.ack_crc.unavailable,1);
  assert.equal(d.lengths['290'],1);
});
test('no legacy flow route or filter changed by passive observer',()=>{
  const framer = byId.get('3328d11cbeec411c');
  assert(framer.func.includes('ISSUE166_INTEGRITY_PASSIVE'));
  assert.deepEqual(framer.wires,[['11433c3013581838','a6586b831a80a15b']]);
  assert.equal(framer.outputs,1);
  assert(!framer.func.includes('return null; // integrity rejection'));
});
