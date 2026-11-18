// Regression tests for the fork decoder fixes (JK02_32S frame layout).
// Uses the real node-red-contrib-buffer-parser implementation with the
// parser specifications stored in flows.json.
//
// Run: BUFFER_PARSER_PATH=/path/to/node-red-contrib-buffer-parser node --test tests/
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const flowsFile = path.join(__dirname, '..', 'rootfs/etc/node-red/flows.json');
const flows = JSON.parse(fs.readFileSync(flowsFile, 'utf8'));
const byId = new Map(flows.map(n => [n.id, n]));

function findBufferParser() {
  const candidates = [process.env.BUFFER_PARSER_PATH, 'node-red-contrib-buffer-parser']
    .filter(Boolean);
  for (const c of candidates) {
    try { return require(path.join(require.resolve(c + '/package.json', { paths: [process.cwd(), __dirname] }), '..', 'buffer-parser.js')); }
    catch (e) { /* try next */ }
  }
  return null;
}
const bufferParserModule = findBufferParser();
const skip = bufferParserModule ? false : 'node-red-contrib-buffer-parser not installed';

// Minimal Node-RED runtime mock, enough for the buffer-parser node.
function parseWith(parserId, buffer) {
  const spec = byId.get(parserId);
  let Ctor;
  const RED = {
    nodes: {
      registerType(_name, ctor) { Ctor = ctor; },
      createNode(node) {
        node.handlers = {};
        node.on = (ev, fn) => { node.handlers[ev] = fn; };
        node.status = () => {}; node.warn = () => {}; node.error = (e) => { throw new Error(String(e)); };
      },
    },
    util: {
      getMessageProperty: (msg, p) => p.split('.').reduce((o, k) => (o == null ? o : o[k]), msg),
      setMessageProperty: (msg, p, v) => { msg[p] = v; },
      evaluateNodeProperty: (value, type, node, msg, cb) => {
        const v = type === 'msg' ? RED.util.getMessageProperty(msg, value) : value;
        if (cb) cb(null, v); else return v;
      },
      cloneMessage: (m) => ({ ...m }),
    },
  };
  bufferParserModule(RED);
  const node = new Ctor({ ...spec });
  let out;
  node.send = (m) => { out = m; };
  node.handlers.input({ payload: buffer });
  assert(out && out.payload, 'buffer-parser produced no output');
  return out;
}

function store() {
  const data = new Map();
  return { get: k => data.get(k), set: (k, v) => data.set(k, v) };
}
function runFunction(id, msg, ctx = {}) {
  const src = byId.get(id);
  assert(src && src.func, 'function node ' + id);
  const fn = new Function('msg', 'Buffer', 'node', 'flow', 'context', 'global', src.func);
  const warnings = [], errors = [];
  const node = { warn: m => warnings.push(String(m)), log() {}, debug() {}, error: m => errors.push(String(m)), status() {} };
  const flow = ctx.flow || store(), global = ctx.global || store();
  const result = fn(msg, Buffer, node, flow, store(), global);
  return { result, warnings, errors, flow, global };
}

function liveFrame() {
  const b = Buffer.alloc(300);
  b.set([0x55, 0xaa, 0xeb, 0x90, 0x02, 0x01]);
  for (let i = 0; i < 16; i++) b.writeUInt16LE(3300 + i, 6 + i * 2);
  b.writeUInt32LE(0, 146);
  b.writeUInt32LE(53000, 150);          // 53.000 V
  b.writeUInt32LE(662500, 154);         // unsigned power
  b.writeInt32LE(-12500, 158);          // -12.5 A
  b.writeInt16LE(10, 170);
  b[172] = 2;                           // discharging balancer
  b[173] = 55;
  b[198] = 1; b[199] = 1;
  b[200] = 1;                           // precharging
  b[201] = 1;                           // balancing (new indicator)
  [5, 6, 7, 8, 9, 10].forEach((v, i) => b.writeUInt16LE(v, 202 + i * 2));
  b[214] = 0x07;
  b.writeUInt16LE(30, 218);
  b.writeUInt16LE(5300, 234);
  b[245] = 1;
  b.writeInt16LE(215, 254);
  b.writeInt16LE(223, 256);
  b.writeInt16LE(231, 258);
  b.writeUInt32LE(62, 266);
  b.writeUInt32LE(3600, 270);
  b[274] = 1;
  b[275] = 0;
  return b;
}

function setupFrame() {
  const b = Buffer.alloc(300);
  b.set([0x55, 0xaa, 0xeb, 0x90, 0x01, 0x01]);
  b.writeInt32LE(16, 114);
  b[274] = 3;
  // 0x1114 low byte: heating(0) + RS485 port(3) + display(4) + smart sleep(6)
  b[282] = 0b0101_1001;
  // 0x1114 high byte: timed stored data(8) + charging float mode(9)
  b[283] = 0b0000_0011;
  b.writeInt8(-5, 284);
  b.writeInt8(5, 285);
  b[286] = 24;
  b.writeInt8(-10, 296);
  b.writeInt8(-5, 297);
  return b;
}

for (const [parserId, deriveId] of [['c437bd1d4debf783', 'a1fe0000decd0001'], ['e1e32d6c66126190', 'a1fe0000decd0002']]) {
  test(`live frame ${parserId}: balancer, precharge, new values`, { skip }, () => {
    const parsed = parseWith(parserId, liveFrame());
    assert.deepEqual(byId.get(parserId).wires, [[deriveId]], 'parser feeds the derive node');
    const { result } = runFunction(deriveId, parsed);
    const p = result.payload;
    assert.equal(p.Balance_Action_B, 1, 'balancing active must turn the binary sensor on');
    assert.equal(p.Balancer_status_N, 2);
    assert.equal(p.Balancer_status_text_S, 'Discharging balancer');
    assert.equal(p.Precharging_B, 1);
    assert.equal(p.Balancing_B, 1);
    assert.equal(p.Switch_Balance_B, undefined, 'misnamed key is gone');
    assert.equal(p.Cell_Type, undefined);
    assert.equal(p.Charger_plugged_B, 1);
    assert.equal(p.PCL_module_state_B, 1);
    assert.equal(p.Temp_sensor_5_T, 21.5);
    assert.equal(p.Sonde_4_temp_T, 22.3);
    assert.equal(p.Sonde_3_temp_T, 23.1);
    assert.equal(p.Discharge_OCP_release_timer_D, 5);
    assert.equal(p.Overvoltage_release_timer_D, 10);
    assert.equal(p.Emergency_countdown_D, 30);
    assert.equal(p.Smart_sleep_countdown_D, 3600);
    assert.equal(p.Detail_log_count_N, 62);
    assert.equal(p.Battery_type_text_S, 'LFP');
    assert.equal(p.Battery_power_W, -662.5, 'signed power from mV voltage and current');
    assert.equal(p.Tension_Totale_volt_V, 53);
    assert.equal(p.balancer_status_raw, undefined, 'helpers are not published');
    assert.equal(p.battery_voltage_mv_raw, undefined);
  });
}

test('live publisher creates duration sensors and removes the old Switch_Balance entity', { skip }, () => {
  const parsed = parseWith('e1e32d6c66126190', liveFrame());
  const derived = runFunction('a1fe0000decd0002', parsed).result;
  derived.bms_numero = 2;
  const { result } = runFunction('39f7fd7720e246a1', derived);
  const msgs = result[0];
  const cfg = msgs.find(m => m.topic === 'homeassistant/sensor/bms_2_bms_Emergency_countdown/config');
  assert(cfg, 'duration sensor discovered');
  const c = JSON.parse(cfg.payload);
  assert.equal(c.device_class, 'duration');
  assert.equal(c.unit_of_measurement, 's');
  assert(msgs.some(m => m.topic === 'homeassistant/binary_sensor/bms_2_bms_Switch_Balance/config' && m.payload === ''));
  assert(msgs.some(m => m.topic === 'BMS_2/Balance_Action' && m.payload === 1));
  assert(msgs.some(m => m.topic === 'homeassistant/binary_sensor/bms_2_bms_Precharging/config'));
});

for (const parserId of ['e6750cbf7737dd71', 'e0beba39da568e23']) {
  test(`setup frame ${parserId}: 0x1114 bits decoded at the right positions`, { skip }, () => {
    const p = parseWith(parserId, setupFrame()).payload;
    assert.equal(p.heating_switch_B, true);
    assert.equal(p.disable_temperature_sensors_B, false);
    assert.equal(p.port_rs485_mode_B, true);
    assert.equal(p.display_always_on_switch_B, true, 'single boolean, not an array');
    assert.equal(p.smart_sleep_switch_B, true);
    assert.equal(p.disable_pcl_module_switch_B, false);
    assert.equal(p.timed_stored_data_switch_B, true);
    assert.equal(p.special_charger_B, false);
    assert.equal(p.emergency_button_trigger_B, false);
    assert.equal(p.precharge_time_D, 3);
    assert.equal(p.heating_start_temperature_T, -5);
    assert.equal(p.heating_stop_temperature_T, 5);
    assert.equal(p.smart_sleep_delay_H, 24);
    assert.equal(p.discharge_undertemperature_protection_T, -10);
    assert.equal(p.Charging_Floating_Mode_B, true);
    if (parserId === 'e6750cbf7737dd71') {
      assert.equal(p['0x1114'], 0x0359);
    }
  });
}

test('read-only setup values are published as sensors without command topic', { skip }, () => {
  const p = parseWith('e0beba39da568e23', setupFrame()).payload;
  const { result } = runFunction('2321fa6d9d473fda', { payload: p, bms_numero: 1 });
  const msgs = result[0];
  const heat = msgs.find(m => m.topic.includes('/binary_sensor/') && m.topic.includes('heating_switch'));
  assert(heat, 'heating switch state as binary_sensor');
  const cfg = JSON.parse(heat.payload);
  assert.equal(cfg.command_topic, undefined);
  assert.equal(cfg.default_entity_id, 'binary_sensor.bms_1_bms_heating_switch');
  const start = msgs.find(m => m.topic.includes('/sensor/') && m.topic.includes('heating_start_temperature'));
  assert.equal(JSON.parse(start.payload).unit_of_measurement, '°C');
  // Writable switches stay switches.
  assert(msgs.some(m => m.topic.includes('/switch/') && m.topic.includes('smart_sleep_switch')));
});

for (const [name, mask] of [['Write PCL_Disable', 0x0080], ['Write smart sleep switch', 0x0040], ['Write Timed_Stored_Data', 0x0100]]) {
  test(`${name} keeps all other bits of register 0x1114`, () => {
    const node = flows.find(n => n.type === 'function' && n.name === name);
    const g = store();
    g.set('slaveAddress-setup', 2);
    g.set('0x1114', [[0x0219, 2]]);          // heating + RS485 port + display + float mode
    const on = runFunction(node.id, { payload: 'true' }, { global: g }).result.payload;
    assert.equal(on[0], 2);
    assert.equal(on.readUInt16BE(7), 0x0219 | mask);
    const off = runFunction(node.id, { payload: 'false' }, { global: g }).result.payload;
    assert.equal(off.readUInt16BE(7), 0x0219 & ~mask);
    // Unknown register value -> refuse to write.
    const g2 = store(); g2.set('slaveAddress-setup', 3);
    const refused = runFunction(node.id, { payload: 'true' }, { global: g2 });
    assert.equal(refused.result, null);
    assert.equal(refused.errors.length, 1);
  });
}

test('entity names follow dashboard_language, entity ids do not', { skip }, () => {
  const labels = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'rootfs/etc/node-red/entity-labels.json'), 'utf8'));
  const parsed = parseWith('e1e32d6c66126190', liveFrame());
  const derived = runFunction('a1fe0000decd0002', parsed).result;
  const configs = {};
  for (const lang of ['de', 'en', 'fr']) {
    const g = store(); g.set('ui.language', lang); g.set('entity_labels', labels);
    const msgs = runFunction('39f7fd7720e246a1', { ...derived, payload: { ...derived.payload }, bms_numero: 1 }, { global: g }).result[0];
    configs[lang] = Object.fromEntries(msgs.filter(m => m.topic.endsWith('/config') && m.payload)
      .map(m => [m.topic, JSON.parse(m.payload)]));
  }
  const topic = 'homeassistant/binary_sensor/bms_1_bms_Charger_plugged/config';
  assert.equal(configs.de[topic].name, 'Ladegerät angesteckt');
  assert.equal(configs.en[topic].name, 'Charger plugged in');
  assert.equal(configs.fr[topic].name, 'Chargeur branché');
  assert.equal(configs.de['homeassistant/sensor/bms_1_bms_Cell_7_volt/config'].name, 'Zelle 7 Spannung');
  for (const t of Object.keys(configs.en)) {
    assert.equal(configs.de[t].unique_id, configs.en[t].unique_id);
    assert.equal(configs.de[t].default_entity_id, configs.en[t].default_entity_id);
  }
});

test('add-on option parsing accepts de/en/fr', () => {
  const init = byId.get('af582d4d2d8a4a69');
  for (const [opt, ui] of [['de', 'de'], ['en', 'en'], ['fr', 'fr'], ['xx', 'en']]) {
    const fn = new Function('msg', 'node', 'flow', 'context', 'global', 'env', init.func);
    const g = store(); g.set('fs', fs);
    const node = { warn() {}, log() {}, error(e) { throw new Error(String(e)); }, status() {} };
    const env = { get: () => '' };
    fn({ payload: { dashboard_language: opt, jkbms_count: 1, mqttadresse_port: 'core-mosquitto:1883' } }, node, store(), store(), g, env);
    assert.equal(g.get('ui.language'), ui);
    assert.equal(g.get('dashboard.language'), ui);
  }
});

test('Premium components are removed', () => {
  assert.equal(flows.find(n => n.type === 'tab' && /premium/i.test(n.label || '')), undefined);
  for (const id of ['c90f119270193bd9', 'fb8049485a859112', '4d1804a8717de398']) assert.equal(byId.get(id), undefined);
  const ids = new Set(flows.map(n => n.id));
  for (const n of flows) for (const out of n.wires || []) for (const t of out) assert(ids.has(t), `${n.id} wires to missing ${t}`);
  const cleanup = runFunction('d1fc91e6f90d7cbb', {}).result[0];
  assert(cleanup.every(m => m.payload === '' && m.retain === true));
});

test('optional dashboard uses the JK-BMS card for every seen BMS', () => {
  const written = {};
  const g = store();
  g.set('fs', { mkdirSync() {}, writeFileSync(file, data) { written[file] = JSON.parse(data); } });
  g.set('ui.language', 'de');
  g.set('nb_jkbms', 3); g.set('bms_broadcasting', true);
  assert.equal(runFunction('c0de0000dash0002', {}, { global: g }).result, null, 'off by default');
  g.set('create_dashboard', true);
  const out = runFunction('c0de0000dash0002', {}, { global: g }).result;
  const dash = written[out.payload];
  assert.equal(dash.dashboard_meta.url_path, 'jk-bms');
  const cards = dash.config.views[0].sections.map(s => s.cards[0]);
  assert.deepEqual(cards.map(c => c.jk_prefix), ['bms_master', 'bms_1', 'bms_2']);
  assert(cards.every(c => c.type === 'custom:bms-battery-cells-card-jkbms'));
  assert.equal(cards[0].title, 'Master-BMS');
  const exec = byId.get('c0de0000dash0003');
  assert(exec.command.includes('/config/dashboards/jk_bms_card.json'));
});
