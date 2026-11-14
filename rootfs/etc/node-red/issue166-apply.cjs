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
// Preserve the original Legacy 1891 dashboard URL for single-addon live testing.
// Fail closed if the expected baseline URL is absent.
const urlNode = byId.get('a91bfb41bf5699ef');
if (!urlNode || !urlNode.func.includes(':1891/endpoint/dashboard/')) {
    throw new Error('Could not locate original Legacy dashboard URL');
}
const staged = targetPath + '.issue166.tmp';
fs.writeFileSync(staged, JSON.stringify(nodes, null, 2), 'utf8');
fs.renameSync(staged, targetPath);
console.log('Issue #166 test patch applied: eight functions + passive integrity / sequencing / framing observers, Legacy dashboard port 1891');
