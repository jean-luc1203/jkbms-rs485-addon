// ISSUE #166 DEV166.6 — PASSIVE MODBUS POLL REGISTER COUNTS.
// Invoked after Framer extraction; only already validated, emitted Modbus polls.
// Never changes frame data, routing, buffers, polling, or decoder state.
try {
    const key166 = "issue166_poll_register_passive";
    const now166 = Date.now();
    let p166 = flow.get(key166);
    if (!p166 || p166.schema !== 1 || !p166.by_address) {
        p166 = {
            schema: 1, since: now166, last_report_ts: 0,
            total: 0, setup_161e: 0, data_1620: 0, other: 0,
            by_address: {}, last_polls: []
        };
    }
    for (const x166 of frames) {
        if (!x166 || x166.topic !== "broadcast/modbus_poll") continue;
        const addr166 = x166.slave;
        const reg166 = x166.reg;
        const t166 = reg166 === 0x161E ? "setup_161e" :
            reg166 === 0x1620 ? "data_1620" : "other";
        p166.total++;
        p166[t166]++;
        if (Number.isInteger(addr166) && addr166 >= 0 && addr166 <= 15) {
            const addrKey166 = String(addr166);
            let a166 = p166.by_address[addrKey166];
            if (!a166) {
                a166 = { total: 0, setup_161e: 0, data_1620: 0, other: 0 };
                p166.by_address[addrKey166] = a166;
            }
            a166.total++;
            a166[t166]++;
        }
        p166.last_polls.push({
            ts: now166, address: addr166, reg: "0x" + reg166.toString(16)
        });
        if (p166.last_polls.length > 8) p166.last_polls.shift();
    }
    flow.set(key166, p166);
    if (p166.total > 0 &&
        (!p166.last_report_ts || now166 - p166.last_report_ts >= 60000)) {
        node.warn("ISSUE166_POLL_PASSIVE " + JSON.stringify({
            total: p166.total,
            setup_161e: p166.setup_161e,
            data_1620: p166.data_1620,
            other: p166.other,
            by_address: p166.by_address,
            last_polls: p166.last_polls.slice(-3)
        }));
        p166.last_report_ts = now166;
        flow.set(key166, p166);
    }
} catch (e166) {
    node.warn("ISSUE166_POLL_PASSIVE observer error: " + String(e166));
}
