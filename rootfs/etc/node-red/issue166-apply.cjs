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
// Preserve the original Legacy 1891 dashboard URL for single-addon live testing.
// Fail closed if the expected baseline URL is absent.
const urlNode = byId.get('a91bfb41bf5699ef');
if (!urlNode || !urlNode.func.includes(':1891/endpoint/dashboard/')) {
    throw new Error('Could not locate original Legacy dashboard URL');
}
const staged = targetPath + '.issue166.tmp';
fs.writeFileSync(staged, JSON.stringify(nodes, null, 2), 'utf8');
fs.renameSync(staged, targetPath);
console.log('Issue #166 test patch applied: eight functions + direct DATA routing + strict Broadcast integrity gate + passive diagnostics, Legacy dashboard port 1891');
