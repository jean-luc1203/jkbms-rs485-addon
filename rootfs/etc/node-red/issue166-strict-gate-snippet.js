// ISSUE #166 — DEV166.8 STRICT BROADCAST REPLY INTEGRITY GATE.
// This gate runs ONLY in the Broadcast decoder; Active Polling is unchanged.
// Accepts the observed 308-byte JK body + 8-byte Modbus ACK profile.
// Also accepts a standalone 300-byte JK body if its checksum is correct;
// the absence of an ACK is recorded explicitly (not a successful CRC).
// Other lengths are rejected in THIS experimental build: 310-byte padded
// variants require independent validation before a general release.
// The Modbus CRC protects the ACK/address, NOT the 300-byte JK body.
function issue1668CheckReply(b166) {
    if (!Buffer.isBuffer(b166)) return {ok:false,reason:"not_buffer"};
    if (b166.length !== 308 && b166.length !== 300) {
        return {ok:false,reason:"unsupported_length",len:b166.length};
    }
    if (b166[0] !== 0x55 || b166[1] !== 0xAA ||
        b166[2] !== 0xEB || b166[3] !== 0x90) {
        return {ok:false,reason:"jk_header",len:b166.length};
    }
    const type166 = b166[4];
    if (type166 !== 1 && type166 !== 2) {
        return {ok:false,reason:"jk_type",len:b166.length};
    }
    let sum166 = 0;
    for (let j166 = 0; j166 < 299; j166++) {
        sum166 = (sum166 + b166[j166]) & 0xFF;
    }
    if (sum166 !== b166[299]) {
        return {ok:false,reason:"jk_checksum",len:b166.length,type:type166};
    }
    if (b166.length === 300) {
        // Native 300-byte JK reply: NO ACK, therefore CRC is unavailable.
        return {ok:true,profile:"jk300",type:type166,address:null};
    }
    if (b166[301] !== 0x10 || b166[302] !== 0x16 ||
        b166[304] !== 0 || b166[305] !== 1) {
        return {ok:false,reason:"ack_shape",len:308,type:type166};
    }
    if (b166[303] !== (type166 === 1 ? 0x1E : 0x20)) {
        return {ok:false,reason:"ack_register",len:308,type:type166};
    }
    if (b166[300] > 15) {
        return {ok:false,reason:"ack_address",len:308,type:type166};
    }
    let crc166 = 0xFFFF;
    for (let j166 = 300; j166 < 306; j166++) {
        crc166 ^= b166[j166];
        for (let bit166 = 0; bit166 < 8; bit166++) {
            crc166 = (crc166 & 1) ?
                ((crc166 >>> 1) ^ 0xA001) : (crc166 >>> 1);
        }
    }
    if ((crc166 & 0xFFFF) !== (b166[306] | (b166[307] << 8))) {
        return {ok:false,reason:"ack_crc",len:308,type:type166};
    }
    if (type166 === 1) {
        const setupAddress166 = b166.readUInt32LE(270);
        if (setupAddress166 > 15) {
            return {ok:false,reason:"setup_address",len:308,type:type166};
        }
        if (setupAddress166 !== b166[300]) {
            return {ok:false,reason:"setup_ack_mismatch",len:308,type:type166};
        }
    }
    return {ok:true,profile:"jk308",type:type166,address:b166[300]};
}

function issue1668GateRecord(result166) {
    try {
        const key166 = "issue1668_integrity_gate";
        const now166 = Date.now();
        let d166 = flow.get(key166);
        if (!d166 || d166.schema !== 1 || !d166.reasons) {
            d166 = {
                schema:1, since:now166, last_report_ts:0,
                seen:0, accepted_308:0, accepted_300_no_ack:0,
                rejected:0, reasons:{}, recent_rejections:[]
            };
        }
        d166.seen++;
        if (result166.ok) {
            if (result166.profile === "jk308") d166.accepted_308++;
            else if (result166.profile === "jk300") d166.accepted_300_no_ack++;
        } else {
            d166.rejected++;
            const reason166 = result166.reason || "unknown";
            d166.reasons[reason166] = (d166.reasons[reason166] || 0) + 1;
            d166.recent_rejections.push({
                ts:now166, reason:reason166,
                len:result166.len || null, type:result166.type || null
            });
            if (d166.recent_rejections.length > 8) d166.recent_rejections.shift();
        }
        flow.set(key166,d166);
        // Summary first frame, then every 60 s; no raw frames or battery data.
        if (!d166.last_report_ts || now166 - d166.last_report_ts >= 60000) {
            node.warn("ISSUE1668_INTEGRITY_GATE " + JSON.stringify({
                seen:d166.seen, accepted_308:d166.accepted_308,
                accepted_300_no_ack:d166.accepted_300_no_ack,
                rejected:d166.rejected, reasons:d166.reasons,
                recent_rejections:d166.recent_rejections.slice(-3)
            }));
            d166.last_report_ts = now166;
            flow.set(key166,d166);
        }
    } catch (e166) {
        // Diagnostics must not bypass the strict gate or modify frame routing.
        node.warn("ISSUE1668_INTEGRITY_GATE observer error: " + String(e166));
    }
}
