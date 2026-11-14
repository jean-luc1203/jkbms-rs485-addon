// ISSUE #166 DEV166.7 — DIRECT BMS ADDRESS FOR STANDARD 308-BYTE DATA FRAMES.
// Reuse the CRC of the *trailing Modbus ACK* ONLY to establish who sent DATA.
// DO NOT activate strict whole-frame CRC/checksum rejection in this release.
// Unknown/variant formats continue through the existing Legacy fallback.
function issue1667DataAddress(b166) {
    if (!Buffer.isBuffer(b166) || b166.length !== 308 ||
        b166[0] !== 0x55 || b166[1] !== 0xAA ||
        b166[2] !== 0xEB || b166[3] !== 0x90 || b166[4] !== 2)
        return null;
    if (b166[301] !== 0x10 || b166[302] !== 0x16 ||
        b166[303] !== 0x20 || b166[304] !== 0 ||
        b166[305] !== 1 || b166[300] > 15) return null;
    let crc166 = 0xFFFF;
    for (let j166 = 300; j166 < 306; j166++) {
        crc166 ^= b166[j166];
        for (let bit166 = 0; bit166 < 8; bit166++) {
            crc166 = (crc166 & 1) ?
                ((crc166 >>> 1) ^ 0xA001) : (crc166 >>> 1);
        }
    }
    if ((crc166 & 0xFFFF) !== (b166[306] | (b166[307] << 8)))
        return null;
    return b166[300];
}

// Bounded, passive-style routing statistics; DOES NOT gate real decoder work.
function issue1667RouteEvent(event166, addr166, extra166) {
    try {
        const key166 = "issue1667_routing";
        const now166 = Date.now();
        let d166 = flow.get(key166);
        if (!d166 || d166.schema !== 1 || !d166.by_address) {
            d166 = {
                schema: 1, since: now166, last_report_ts: 0,
                direct_data: 0, legacy_fallback_data: 0,
                setup: 0, legacy_fallback_pair: 0,
                pending_cleared_on_direct: 0,
                stale_pending_cleared: 0,
                by_address: {}, recent_events: []
            };
        }
        if (Object.prototype.hasOwnProperty.call(d166, event166)) d166[event166]++;
        if (Number.isInteger(addr166) && addr166 >= 0 && addr166 <= 15) {
            const a166 = String(addr166);
            if (!d166.by_address[a166]) {
                d166.by_address[a166] = {
                    direct_data: 0, setup: 0, legacy_fallback_pair: 0
                };
            }
            if (Object.prototype.hasOwnProperty.call(d166.by_address[a166], event166))
                d166.by_address[a166][event166]++;
        }
        if (event166 !== "direct_data" && event166 !== "setup") {
            d166.recent_events.push({ts: now166, event: event166,
                address: addr166, detail: extra166 || null});
            if (d166.recent_events.length > 8) d166.recent_events.shift();
        }
        flow.set(key166, d166);
        if (!d166.last_report_ts || now166 - d166.last_report_ts >= 60000) {
            node.warn("ISSUE1667_ROUTING " + JSON.stringify({
                direct_data: d166.direct_data,
                legacy_fallback_data: d166.legacy_fallback_data,
                setup: d166.setup,
                legacy_fallback_pair: d166.legacy_fallback_pair,
                pending_cleared_on_direct: d166.pending_cleared_on_direct,
                stale_pending_cleared: d166.stale_pending_cleared,
                by_address: d166.by_address,
                recent_events: d166.recent_events.slice(-3)
            }));
            d166.last_report_ts = now166;
            flow.set(key166, d166);
        }
    } catch (error166) {
        node.warn("ISSUE1667_ROUTING observer error: " + String(error166));
    }
}
