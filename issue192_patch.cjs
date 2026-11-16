const fs = require('fs');
const path = '/etc/node-red/flows.json';
const flows = JSON.parse(fs.readFileSync(path, 'utf8'));
const node = flows.find(n => n.id === 'c90f119270193bd9');
if (!node || typeof node.func !== 'string') throw new Error('Premium generator not found');
const replaceOnce = (from, to, label) => {
  if (node.func.split(from).length !== 2) throw new Error(label + ': expected exactly one match');
  node.func = node.func.replace(from, to);
};
replaceOnce(\`const bmsSlotsForHtml = [];
if (bmsBroadcastingEnabled) {
    bmsSlotsForHtml.push("master");
    for (let s = 2; s <= bmsTotalCountForHtml; s++) bmsSlotsForHtml.push(s);
} else {
    for (let s = 1; s <= bmsTotalCountForHtml; s++) bmsSlotsForHtml.push(s);
}\`, \`// Issue #192: use actual recent SETUP observations, never invented addresses.
const bmsSlotsForHtml = [];
if (bmsBroadcastingEnabled) {
    const seen = global.get("premium.dashboard_bms_seen");
    const now = Date.now();
    const maxAgeMs = 120000;
    if (seen && typeof seen === "object" && !Array.isArray(seen)) {
        const isFresh = ts => Number.isFinite(Number(ts)) && Number(ts) <= now && now - Number(ts) <= maxAgeMs;
        if (isFresh(seen.master)) bmsSlotsForHtml.push("master");
        const slaves = Object.entries(seen)
            .filter(([id, ts]) => /^(?:[1-9]|1[0-5])$/.test(id) && isFresh(ts))
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, Math.max(0, bmsTotalCountForHtml - (bmsSlotsForHtml.includes("master") ? 1 : 0)))
            .map(([id]) => Number(id))
            .sort((a, b) => a - b);
        bmsSlotsForHtml.push(...slaves);
    }
} else {
    for (let s = 1; s <= bmsTotalCountForHtml; s++) bmsSlotsForHtml.push(s);
}\`, 'server slots');
replaceOnce(\`  if(configuredMaster){
    BMS_BROADCASTING = true;
    return configured.sort((a,b)=>bmsSortKey(a)-bmsSortKey(b));
  }\`, \`  if(BMS_BROADCASTING_FROM_CONFIG){
    // Server-generated slots are authoritative, including [] before discovery.
    BMS_BROADCASTING = true;
    return configured.sort((a,b)=>bmsSortKey(a)-bmsSortKey(b));
  }\`, 'client slots');
fs.writeFileSync(path, JSON.stringify(flows, null, 2) + '\n');
console.log('Issue #192 patch applied to', node.id);
