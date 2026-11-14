#!/usr/bin/env node
'use strict';
// ISSUE #166: apply the minimal validated Node-RED function changes at addon
// startup, leaving the 4.1.12 reference flows.json unchanged in Git.
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

const [sourcePath, targetPath] = process.argv.slice(2);
if (!sourcePath || !targetPath || path.resolve(sourcePath) === path.resolve(targetPath)) {
    throw new Error('Usage: issue166-apply.cjs SOURCE_FLOWS TARGET_FLOWS (paths must differ)');
}
const expectedSha256 = 'b8cc75b3503a6ac089188d1526a2547441893621d33c7a1fbffedba963b5e8d6';
const original = fs.readFileSync(sourcePath);
const actualSha256 = crypto.createHash('sha256').update(original).digest('hex');
if (actualSha256 !== expectedSha256) {
    throw new Error('Refusing to patch a flows.json other than the verified Legacy 4.1.12 baseline: ' + actualSha256);
}
const nodes = JSON.parse(original.toString('utf8'));
const patches = JSON.parse(fs.readFileSync(path.join(__dirname, 'issue166-functions.json'), 'utf8'));
if (!Array.isArray(nodes) || nodes.length !== 590 || Object.keys(patches).length !== 8) {
    throw new Error('Unexpected source flow structure or incomplete patch set');
}
const byId = new Map(nodes.map(n => [n.id, n]));
for (const [id, func] of Object.entries(patches)) {
    const n = byId.get(id);
    if (!n || n.type !== 'function' || typeof func !== 'string') {
        throw new Error('Missing function node or invalid patch for ' + id);
    }
    n.func = func;
}
// Instrument the existing Broadcast Framer without changing its routing.
const framer166 = byId.get('3328d11cbeec411c');
const framerAnchor166 = 'if (frames.length > 0) {\n    let s = flow.get("diag_serial_stats")';
const integritySnippet166 = fs.readFileSync(path.join(__dirname, 'issue166-integrity-snippet.js'), 'utf8');
if (!framer166 || framer166.type !== 'function' ||
    framer166.func.split(framerAnchor166).length !== 2 ||
    !framer166.func.includes('function modbusCRC(buffer, start, length)') ||
    !integritySnippet166.includes('ISSUE166_INTEGRITY_PASSIVE')) {
    throw new Error('Issue166 passive integrity instrumentation: Framer baseline mismatch');
}
framer166.func = framer166.func.replace(
    framerAnchor166,
    'if (frames.length > 0) {\n' + integritySnippet166 + '\n    let s = flow.get("diag_serial_stats")'
);
// DEV166.5: account for byte discards WITHOUT changing the parser decisions.
function injectFramer166(anchor, replacement, label) {
    if (framer166.func.split(anchor).length !== 2) {
        throw new Error('Issue166 Framer instrumentation anchor changed: ' + label);
    }
    framer166.func = framer166.func.replace(anchor, replacement);
}
injectFramer166(
    'buf = Buffer.concat([buf, incoming]);',
    'buf = Buffer.concat([buf, incoming]);\n' +
    'const issue166BufferStartBytes = buf.length;\n' +
    'let issue166ShortHeaders = 0;\n' +
    'let issue166Trims = 0;\n' +
    'let issue166TrimmedBytes = 0;',
    'incoming buffer'
);
injectFramer166(
    '            // faux header ou fragment trop court\n            i += 1;',
    '            // faux header ou fragment trop court\n' +
    '            issue166ShortHeaders++;\n            i += 1;',
    'short candidate'
);
injectFramer166(
    'if (buf.length > MAX_BUFFER) {\n    node.warn(',
    'if (buf.length > MAX_BUFFER) {\n' +
    '    issue166Trims++;\n' +
    '    issue166TrimmedBytes += buf.length - 4096;\n    node.warn(',
    'buffer trimming'
);
const framingSnippet166 = fs.readFileSync(
    path.join(__dirname, 'issue166-framing-snippet.js'), 'utf8'
);
const sequenceSnippet166 = fs.readFileSync(
    path.join(__dirname, 'issue166-sequence-snippet.js'), 'utf8'
);
if (!framingSnippet166.includes('ISSUE166_FRAMING_PASSIVE') ||
    !sequenceSnippet166.includes('ISSUE166_SEQUENCE_PASSIVE')) {
    throw new Error('Issue166 passive diagnostics snippets missing or malformed');
}
injectFramer166(
    'flow.set("rs485_buffer", Buffer.from(buf));',
    'flow.set("rs485_buffer", Buffer.from(buf));\n' + framingSnippet166,
    'post-parse accounting'
);
injectFramer166(
    '    let s = flow.get("diag_serial_stats")',
    sequenceSnippet166 + '\n    let s = flow.get("diag_serial_stats")',
    'sequence/address observer'
);
// DEV166.6: register-specific request counts, from validated Framer output only.
const pollSnippet166 = fs.readFileSync(
    path.join(__dirname, 'issue166-poll-snippet.js'), 'utf8'
);
if (!pollSnippet166.includes('ISSUE166_POLL_PASSIVE')) {
    throw new Error('Issue166 poll diagnostics snippet missing or invalid');
}
injectFramer166(
    '    let s = flow.get("diag_serial_stats")',
    pollSnippet166 + '\n    let s = flow.get("diag_serial_stats")',
    'per-address Modbus poll register counter'
);

// DEV166.6: audit the decoder's EXISTING pairing decisions without changing them.
const decoder166 = byId.get('86a0f48a516a10b6');
const pairingSnippet166 = fs.readFileSync(
    path.join(__dirname, 'issue166-pairing-snippet.js'), 'utf8'
);
if (!decoder166 || decoder166.type !== 'function' ||
    !pairingSnippet166.includes('ISSUE166_PAIRING_PASSIVE')) {
    throw new Error('Issue166 pairing diagnostics prerequisites missing');
}
function injectDecoder166(anchor, replacement, label) {
    if (decoder166.func.split(anchor).length !== 2) {
        throw new Error('Issue166 decoder diagnostic anchor changed: ' + label);
    }
    decoder166.func = decoder166.func.replace(anchor, replacement);
}
injectDecoder166(
    'let outputFrames = [];',
    'let outputFrames = [];\n' + pairingSnippet166,
    'passive pairing helper'
);
injectDecoder166(
    '        // On mémorise la data, en attente de la setup suivante',
    '        issue166AuditPairing("data", frame, pendingData, null);\n' +
    '        // On mémorise la data, en attente de la setup suivante',
    'before pendingData overwrite'
);
injectDecoder166(
    '        refreshDetectedBms(normalizedId);',
    '        issue166AuditPairing("setup", frame, pendingData, bmsNumber);\n' +
    '        refreshDetectedBms(normalizedId);',
    'before pendingData/setup pairing'
);
// DEV166.7: assign reliable per-frame DATA identities from the Modbus trailer.
// No whole-frame strict checksum/CRC gate is introduced in this version.
const directRoutingSnippet166 = fs.readFileSync(
    path.join(__dirname, 'issue166-direct-routing-snippet.js'), 'utf8'
);
if (!directRoutingSnippet166.includes('ISSUE1667_ROUTING') ||
    !directRoutingSnippet166.includes('function issue1667DataAddress(')) {
    throw new Error('Issue166 direct DATA routing snippet missing or invalid');
}
injectDecoder166(
    'let outputFrames = [];',
    'let outputFrames = [];\n' + directRoutingSnippet166,
    'direct DATA address resolver and counters'
);
// The pre-existing global pendingData may survive an add-on update. Never
// reassign pre-DEV166.7 stale bytes to a different BMS after this upgrade.
injectDecoder166(
    '// Le Framer met son objet dans msg.payload',
    'if (pendingData && (!Number.isFinite(pendingData._issue1667_fallback_ts) ||\n' +
    '    Date.now() - pendingData._issue1667_fallback_ts > 12000 ||\n' +
    '    Date.now() < pendingData._issue1667_fallback_ts)) {\n' +
    '    issue1667RouteEvent("stale_pending_cleared", null, null);\n' +
    '    pendingData = null;\n' +
    '    context.set(pendingDataKey, null);\n' +
    '}\n\n// Le Framer met son objet dans msg.payload',
    'stale pending compatibility'
);
injectDecoder166(
    '        issue166AuditPairing("data", frame, pendingData, null);',
    '        const directId1667 = issue1667DataAddress(frame);\n' +
    '        if (directId1667 !== null) {\n' +
    '            if (pendingData) {\n' +
    '                issue1667RouteEvent("pending_cleared_on_direct", directId1667, null);\n' +
    '                pendingData = null;\n' +
    '                context.set(pendingDataKey, null);\n' +
    '            }\n' +
    '            refreshDetectedBms(normalizeBmsIdentifier(directId1667));\n' +
    '            issue1667RouteEvent("direct_data", directId1667, null);\n' +
    '            return {\n' +
    '                payload: Buffer.from(frame),\n' +
    '                bms_adresse: framed.slave !== undefined ? framed.slave : "master",\n' +
    '                bms_type: "data",\n' +
    '                bms_numero: directId1667,\n' +
    '                _frameSource: "JK-BMS",\n' +
    '                _frameLength: frame.length,\n' +
    '                _hex: framed.hex || frame.toString("hex")\n' +
    '            };\n' +
    '        }\n' +
    '        issue1667RouteEvent("legacy_fallback_data", null, {length: frame.length});\n' +
    '        issue166AuditPairing("data", frame, pendingData, null);',
    'DATA route before single pending legacy fallback'
);
injectDecoder166(
    '            _frameSource: "JK-BMS",\n            _frameLength: frame.length,\n            _hex: framed.hex || frame.toString("hex")\n        };\n\n        context.set(pendingDataKey, pendingData);',
    '            _frameSource: "JK-BMS",\n            _frameLength: frame.length,\n            _hex: framed.hex || frame.toString("hex"),\n' +
    '            _issue1667_fallback_ts: Date.now()\n        };\n\n        context.set(pendingDataKey, pendingData);',
    'bounded legacy fallback pending lifetime'
);
injectDecoder166(
    '        issue166AuditPairing("setup", frame, pendingData, bmsNumber);',
    '        issue1667RouteEvent("setup", bmsNumber, null);\n' +
    '        if (pendingData) {\n' +
    '            issue1667RouteEvent("legacy_fallback_pair", bmsNumber, null);\n' +
    '            issue166AuditPairing("setup", frame, pendingData, bmsNumber);\n' +
    '        }',
    'SETUP emission and fallback-only pairing audit'
);
injectDecoder166(
    '        if (pendingData) {\n            pendingData.bms_numero = bmsNumber;',
    '        if (pendingData) {\n' +
    '            // DEV166.7 internal fallback metadata must not enter downstream.\n' +
    '            delete pendingData._issue1667_fallback_ts;\n' +
    '            pendingData.bms_numero = bmsNumber;',
    'remove internal timestamp from published Legacy fallback DATA'
);

// DEV166.8: strict body checksum and ACK CRC gate, BEFORE the Broadcast
// decoder can queue/publish any data. Modbus polls and Active Polling untouched.
const strictGateSnippet166 = fs.readFileSync(
    path.join(__dirname, 'issue166-strict-gate-snippet.js'), 'utf8'
);
if (!strictGateSnippet166.includes('ISSUE1668_INTEGRITY_GATE') ||
    !strictGateSnippet166.includes('function issue1668CheckReply(')) {
    throw new Error('Issue166 strict gate snippet missing or invalid');
}
injectDecoder166(
    'let outputFrames = [];',
    'let outputFrames = [];\n' + strictGateSnippet166,
    'strict Broadcast integrity helpers'
);
injectDecoder166(
    'if (framed.topic === "broadcast/jkbms_reply") {',
    'if (framed.topic === "broadcast/jkbms_reply") {\n' +
    '    const result1668 = issue1668CheckReply(frame);\n' +
    '    issue1668GateRecord(result1668);\n' +
    '    if (!result1668.ok) {\n' +
    '        // A rejected frame must not leave an older DATA to be falsely\n' +
    '        // paired with a later SETUP. No MQTT payload is emitted.\n' +
    '        if (pendingData) {\n' +
    '            pendingData = null;\n' +
    '            context.set(pendingDataKey, null);\n' +
    '        }\n' +
    '        return null;\n' +
    '    }',
    'strict gate before any Broadcast DATA or SETUP processing'
);
// DEV166.9: Active Polling AUDIT ONLY. No modification of legacy validators
// or MQTT publications; route decisions remain the 4.1.12 baseline.
const activeSnippet1669 = fs.readFileSync(
    path.join(__dirname, 'issue166-active-passive-snippet.js'), 'utf8'
);
const alarmSnippet1669 = fs.readFileSync(
    path.join(__dirname, 'issue166-active-alarm-snippet.js'), 'utf8'
);
if (!activeSnippet1669.includes('ISSUE1669_ACTIVE_PASSIVE') ||
    !alarmSnippet1669.includes('ISSUE1669_ALARM_PASSIVE')) {
    throw new Error('Issue166.9 active polling passive snippets missing');
}
for (const [id1669, kind1669, anchor1669] of [
    ['cd6a9e296046d78e', 'static', 'if (checkHeader(msg.payload)) {'],
    ['9856865237a421b7', 'setup', 'if (checkHeader(msg.payload)) {'],
    ['b02adbe3a64e64f2', 'data', 'if (checkBuffer(msg.payload)) {']
]) {
    const n1669 = byId.get(id1669);
    if (!n1669 || n1669.type !== 'function' ||
        n1669.func.split(anchor1669).length !== 2) {
        throw new Error('Issue166.9 validator anchor mismatch: ' + id1669);
    }
    const snippet1669 = activeSnippet1669.replace(
        '__KIND1669__', kind1669
    );
    n1669.func = n1669.func.replace(
        anchor1669, snippet1669 + '\n' + anchor1669
    );
}
const alarmDecoder1669 = byId.get('f9ee21cf4d13a9f4');
const alarmAnchor1669 = 'if (msg.topic !== "Trame-Alarmes-BMS") {';
if (!alarmDecoder1669 || alarmDecoder1669.type !== 'function' ||
    alarmDecoder1669.func.split(alarmAnchor1669).length !== 2) {
    throw new Error('Issue166.9 alarm decoder anchor mismatch');
}
alarmDecoder1669.func = alarmDecoder1669.func.replace(
    alarmAnchor1669, alarmSnippet1669 + '\n' + alarmAnchor1669
);
// DEV166.10: queue Active Polling TCP requests instead of silently
// discarding alarm requests that collide with a DATA request.
// Move gateway TX diagnostics after this rate limit so queued/dropped requests
// are NOT counted as dispatched prematurely. Keep serial diagnostics unchanged.
const tcpRate16610 = byId.get('2e3b52cb867e1b1a');
const upstreamTxDiag16610 = byId.get('54c0f2403ae8bc7c');
const tcpRouter16610 = byId.get('a9d54c61db2740f0');
const txDiagId16610 = 'f16610d1a9b36cc0';
if (!tcpRate16610 || tcpRate16610.type !== 'delay' ||
    tcpRate16610.pauseType !== 'rate' ||
    tcpRate16610.rate !== '1' ||
    tcpRate16610.nbRateUnits !== '1' ||
    tcpRate16610.rateUnits !== 'second' ||
    tcpRate16610.drop !== true ||
    JSON.stringify(tcpRate16610.wires) !==
      JSON.stringify([['a9d54c61db2740f0']]) ||
    !upstreamTxDiag16610 ||
    upstreamTxDiag16610.type !== 'function' ||
    !tcpRouter16610 || tcpRouter16610.type !== 'function' ||
    byId.has(txDiagId16610)) {
    throw new Error('Issue166.10 gateway rate-limit baseline mismatch');
}
const diagGate16610 =
    'if (global.get("bms_broadcasting") === true) {';
if (upstreamTxDiag16610.func.split(diagGate16610).length !== 2 ||
    !upstreamTxDiag16610.func.includes(
        's.polls_by_frame_30s[frameType]')) {
    throw new Error('Issue166.10 TX diagnostics anchor mismatch');
}
// Only the gateway is rerouted: the serial path stays in its original node.
const gatewayTxDiagFunc16610 = upstreamTxDiag16610.func;
upstreamTxDiag16610.func = upstreamTxDiag16610.func.replace(
    diagGate16610,
    'if (global.get("bms_broadcasting") === true || ' +
        'global.get("use_gateway") === true) {'
);
// Node-RED delay in rate-limit mode: drop=false queues excess messages.
// A live frame every ~3s plus an alarm request every ~5s is comfortably
// below the 1 msg/s limiter observed on the two-BMS test installation.
tcpRate16610.drop = false;
tcpRate16610.name = 'TCP queue 1 msg/s - DATA + alarmes';
tcpRate16610.wires = [[txDiagId16610]];
const tcpTxDiagNode16610 = {
    id: txDiagId16610,
    type: 'function',
    z: tcpRate16610.z,
    g: tcpRate16610.g,
    name: 'DEV166.10 Diag TX après limiteur',
    func: gatewayTxDiagFunc16610,
    outputs: 1,
    timeout: 0,
    noerr: 0,
    initialize: '',
    finalize: '',
    libs: [],
    x: 705,
    y: 440,
    wires: [['a9d54c61db2740f0']]
};
tcpRouter16610.x = 955;
nodes.push(tcpTxDiagNode16610);
byId.set(txDiagId16610, tcpTxDiagNode16610);
// DEV166.11: reject malformed Active Polling responses BEFORE parser;
// carry authenticated Modbus reply address through the original msg.
const strictActive16611 = fs.readFileSync(
    path.join(__dirname, 'issue166-active-strict-snippet.js'), 'utf8'
);
const mqttActive16611 = fs.readFileSync(
    path.join(__dirname, 'issue166-active-mqtt-snippet.js'), 'utf8'
);
if (!strictActive16611.includes('ISSUE16611_ACTIVE_GATE') ||
    !strictActive16611.includes('function issue16611Identity(') ||
    !mqttActive16611.includes('ISSUE16611_MQTT_IDENTITY') ||
    !mqttActive16611.includes('missing_or_invalid_verified_id')) {
    throw new Error('Issue166.11 strict identity code missing');
}
for (const [id16611,kind16611,anchor16611] of [
    ['cd6a9e296046d78e','static','if (checkHeader(msg.payload)) {'],
    ['9856865237a421b7','setup','if (checkHeader(msg.payload)) {'],
    ['b02adbe3a64e64f2','data','if (checkBuffer(msg.payload)) {']
]) {
    const n16611 = byId.get(id16611);
    if (!n16611 || n16611.type !== 'function' ||
        n16611.func.split(anchor16611).length !== 2) {
        throw new Error('Issue166.11 validator anchor mismatch: '+id16611);
    }
    n16611.func = n16611.func.replace(
        anchor16611,
        strictActive16611.replaceAll('__KIND16611__',kind16611) +
        '\n' + anchor16611
    );
}
const alarmAnchor16611 = 'if (msg.topic !== "Trame-Alarmes-BMS") {';
if (alarmDecoder1669.func.split(alarmAnchor16611).length !== 2)
    throw new Error('Issue166.11 alarm decode anchor mismatch');
alarmDecoder1669.func = alarmDecoder1669.func.replace(
    alarmAnchor16611,
    strictActive16611.replaceAll('__KIND16611__','alarm') +
    '\n' + alarmAnchor16611
);
// All three Active Polling MQTT publishers use mutable global loop addresses
// in 4.1.12. Replace only the initial address selection, not their MQTT
// discovery/state payload builders.
for (const [id16611,kind16611,globalKey16611] of [
    ['653aafd0b7ddd759','data','slaveAddress-Trame3'],
    ['48f37794d0d7b8bf','setup','slaveAddress-Trame2'],
    ['4941e347ccb9499c','static','slaveAddress-Trame1']
]) {
    const n16611 = byId.get(id16611);
    if (!n16611 || n16611.type !== 'function' ||
        !n16611.func.slice(0,450).includes(
            'global.get("' + globalKey16611 + '")') ||
        n16611.func.slice(0,550).split(
            'const slaveIdNumber = ').length !== 2) {
        throw new Error('Issue166.11 publisher anchor mismatch: '+id16611);
    }
    const prefix16611 =
        n16611.func.match(/^[\s\S]{0,550}?const slaveIdNumber = [^\n]+;\n/);
    if (!prefix16611 ||
        !prefix16611[0].includes('global.get("' + globalKey16611 + '")')) {
        throw new Error('Issue166.11 publisher header mismatch: '+id16611);
    }
    n16611.func = mqttActive16611
        .replaceAll('__KIND16611__',kind16611)
        .replaceAll('__GLOBAL16611__',globalKey16611) +
        '\n' + n16611.func.slice(prefix16611[0].length);
}
// DEV166.12: isolate the legacy tcp-client2 watchdog to the
// Broadcasting-over-gateway transport. The separate Active Polling
// request A/B transport already has its own watchdog and must not cause
// a stale broadcast-client timer to intervene after a link interruption.
//
// Verified node-red-contrib-tcp-client2 actions are 'close' and 'connect',
// never 'disconnect'. Preserve the existing 2-second reconnect delay.
const broadcastWatchdog16612 = byId.get('0827976bdeec2605');
const broadcastTcp16612 = byId.get('ca2e41c5da775228');
const broadcastDelay16612 = byId.get('ab2c8f93200ca93a');
const broadcastReconnect16612 = byId.get('32876ca350d40cd8');
const activeWatchdog16612 = byId.get('eb8a2ce9ac5b36bd');
const baselineTimeout16612 = 'const TIMEOUT_MS = 120000; // 2 min sans données → reconnexion';
const baselineAction16612 = "action: 'disconnect',";
const baselineWarn16612 = "node.warn('Watchdog: no data since ' + Math.round(elapsed/1000) + 's → reconnexion forcée');";
if (!broadcastWatchdog16612 ||
    broadcastWatchdog16612.type !== 'function' ||
    broadcastWatchdog16612.func.split(baselineTimeout16612).length !== 2 ||
    broadcastWatchdog16612.func.split(baselineAction16612).length !== 2 ||
    broadcastWatchdog16612.func.split(baselineWarn16612).length !== 2 ||
    JSON.stringify(broadcastWatchdog16612.wires) !==
      JSON.stringify([['ca2e41c5da775228'],['ab2c8f93200ca93a']]) ||
    !broadcastTcp16612 ||
    broadcastTcp16612.type !== 'tcp-client' ||
    broadcastTcp16612.actionType !== 'msg' ||
    broadcastTcp16612.action !== 'action' ||
    !broadcastDelay16612 ||
    broadcastDelay16612.type !== 'delay' ||
    broadcastDelay16612.pauseType !== 'delay' ||
    broadcastDelay16612.timeout !== '2' ||
    broadcastDelay16612.timeoutUnits !== 'seconds' ||
    JSON.stringify(broadcastDelay16612.wires) !==
      JSON.stringify([['32876ca350d40cd8']]) ||
    !broadcastReconnect16612 ||
    broadcastReconnect16612.type !== 'function' ||
    !broadcastReconnect16612.func.includes("action: 'connect'") ||
    !activeWatchdog16612 ||
    activeWatchdog16612.type !== 'function' ||
    !activeWatchdog16612.func.includes("lastDataTs_master")) {
    throw new Error('Issue166.12 watchdog baseline topology or tcp-client2 mismatch');
}
broadcastWatchdog16612.func = broadcastWatchdog16612.func
    .replace(baselineTimeout16612,
        "// DEV166.12: this tcp-client2 watchdog is for gateway Broadcasting ONLY.\n" +
        "if (global.get('bms_broadcasting') !== true ||\n" +
        "    global.get('use_gateway') !== true) return null;\n\n" +
        baselineTimeout16612)
    .replace(baselineAction16612,"action: 'close',")
    .replace(baselineWarn16612,
        "node.warn('ISSUE16612_TCP_WATCHDOG broadcast gateway: no data since ' +" +
        " Math.round(elapsed/1000) + 's; close then reconnect');");
broadcastWatchdog16612.name =
    'DEV166.12 Watchdog Broadcast TCP only';
// Preserve the original Legacy 1891 dashboard URL for single-addon live testing.
// Fail closed if the expected baseline URL is absent.
const urlNode = byId.get('a91bfb41bf5699ef');
if (!urlNode || !urlNode.func.includes(':1891/endpoint/dashboard/')) {
    throw new Error('Could not locate original Legacy dashboard URL');
}
const staged = targetPath + '.issue166.tmp';
fs.writeFileSync(staged, JSON.stringify(nodes, null, 2), 'utf8');
fs.renameSync(staged, targetPath);
console.log('Issue #166 test patch applied: eight functions + strict Broadcast/Active identity + TCP queue + isolated Broadcast watchdog, Legacy dashboard port 1891');
