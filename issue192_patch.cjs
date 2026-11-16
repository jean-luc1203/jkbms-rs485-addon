const fs = require('fs');
const path = '/etc/node-red/flows.json';
const flows = JSON.parse(fs.readFileSync(path, 'utf8'));
const node = flows.find(n => n.id === 'c90f119270193bd9');
if (!node || typeof node.func !== 'string') throw new Error('Premium generator not found');
const replaceOnce = (from, to, label) => {
  if (node.func.split(from).length !== 2) throw new Error(label + ': expected exactly one match');
  node.func = node.func.replace(from, to);
};
replaceOnce(`const bmsSlotsForHtml = [];
if (bmsBroadcastingEnabled) {
    bmsSlotsForHtml.push("master");
    for (let s = 2; s <= bmsTotalCountForHtml; s++) bmsSlotsForHtml.push(s);
} else {
    for (let s = 1; s <= bmsTotalCountForHtml; s++) bmsSlotsForHtml.push(s);
}`, `// Issue #192: use recently observed SETUP addresses rather than assuming 2..N.
const bmsSlotsForHtml = [];
if (bmsBroadcastingEnabled) {
    const neededSlaves = Math.max(0, bmsTotalCountForHtml - 1);
    const seen = global.get("premium.dashboard_bms_seen");
    const now = Date.now();
    const maxAgeMs = 120 * 1000;
    let detected = null;
    if (seen && typeof seen === "object" && !Array.isArray(seen) &&
        Number.isFinite(Number(seen.master)) &&
        now - Number(seen.master) <= maxAgeMs) {
        const candidates = Object.entries(seen)
            .filter(([id, ts]) => {
                const n = Number(id), t = Number(ts);
                return id !== "master" && Number.isInteger(n) && n >= 1 && n <= 15 &&
                    Number.isFinite(t) && now - t <= maxAgeMs;
            })
            .map(([id, ts]) => ({ id: Number(id), ts: Number(ts) }))
            .sort((a, b) => b.ts - a.ts);
        if (candidates.length >= neededSlaves) {
            detected = candidates.slice(0, neededSlaves)
                .sort((a, b) => a.id - b.id).map(x => x.id);
        }
    }
    bmsSlotsForHtml.push("master");
    if (detected !== null) {
        bmsSlotsForHtml.push(...detected);
    } else {
        for (let s = 2; s <= bmsTotalCountForHtml; s++) bmsSlotsForHtml.push(s);
    }
} else {
    for (let s = 1; s <= bmsTotalCountForHtml; s++) bmsSlotsForHtml.push(s);
}`, 'server slots');
replaceOnce(`  if(runtimeBroadcasting){
    const maxFromConfigured = configured.filter(x=>Number(x)>1).map(Number);
    const max = Math.max(4, numeric.size ? Math.max(...numeric) : 0, maxFromConfigured.length ? Math.max(...maxFromConfigured) : 0);
    const out = ['master'];
    for(let i=2;i<=max;i++) out.push(i);
    return out;
  }`, `  if(runtimeBroadcasting){
    // Issue #192: do not expand detected IDs into an invented 2..4 sequence.
    if(numeric.size) return ['master', ...numeric].sort((a,b)=>bmsSortKey(a)-bmsSortKey(b));
    return configured.length ? ['master', ...configured.filter(x=>String(x)!=='master')]
      .sort((a,b)=>bmsSortKey(a)-bmsSortKey(b)) : ['master'];
  }`, 'client slots');
fs.writeFileSync(path, JSON.stringify(flows, null, 2) + '\n');
console.log('Issue #192 patch applied to', node.id);
