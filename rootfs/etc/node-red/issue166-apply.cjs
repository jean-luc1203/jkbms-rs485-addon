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
// Preserve the original Legacy 1891 dashboard URL for single-addon live testing.
// Fail closed if the expected baseline URL is absent.
const urlNode = byId.get('a91bfb41bf5699ef');
if (!urlNode || !urlNode.func.includes(':1891/endpoint/dashboard/')) {
    throw new Error('Could not locate original Legacy dashboard URL');
}
const staged = targetPath + '.issue166.tmp';
fs.writeFileSync(staged, JSON.stringify(nodes, null, 2), 'utf8');
fs.renameSync(staged, targetPath);
console.log('Issue #166 test patch applied: eight functions + passive integrity observer, Legacy dashboard port 1891');
