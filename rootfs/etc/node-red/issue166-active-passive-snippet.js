// Issue #166 DEV166.9 — PASSIVE ACTIVE-POLLING validation; NO REJECTION.
// Injected into existing "Vérifie Trame 1/2/3" Function nodes, before the
// original acceptance predicate. This observer records anomalies only.
try {
    const kind1669 = "__KIND1669__"; // patched to static / setup / data
    const current1669 = Date.now();
    const diagKey1669 = "issue1669_active_passive";
    let state1669 = flow.get(diagKey1669);
    if (!state1669 || state1669.schema !== 1 || !state1669.by_type) {
        state1669 = {
            schema: 1, since: current1669, last_report_ts: 0,
            seen: 0, by_type: {}, last_anomalies: []
        };
    }
    if (!state1669.by_type[kind1669]) {
        state1669.by_type[kind1669] = {
            seen: 0, length_308: 0, length_300: 0,
            other_length: 0, short_for_parser: 0,
            header_bad: 0, type_bad: 0,
            jk_checksum_ok: 0, jk_checksum_bad: 0,
            jk_checksum_unavailable: 0,
            ack_crc_ok: 0, ack_crc_bad: 0, ack_crc_unavailable: 0,
            ack_shape_bad: 0, ack_register_bad: 0,
            ack_address_range: 0, setup_id_mismatch: 0,
            address_vs_global_mismatch: 0,
            address_vs_diag_mismatch: 0,
            by_ack_address: {}
        };
    }
    const t1669 = state1669.by_type[kind1669];
    t1669.seen++;
    state1669.seen++;
    const b1669 = Buffer.isBuffer(msg.payload) ? msg.payload : null;
    const len1669 = b1669 ? b1669.length : 0;
    let reason1669 = null;
    function flag1669(what1669) {
        if (!reason1669) reason1669 = what1669;
    }
    if (!b1669 || len1669 < 5 ||
        b1669[0] !== 0x55 || b1669[1] !== 0xAA ||
        b1669[2] !== 0xEB || b1669[3] !== 0x90) {
        t1669.header_bad++;
        flag1669("header");
    }
    if (kind1669 === "setup" && b1669 && len1669 >= 5 && b1669[4] !== 1 ||
        kind1669 === "data" && b1669 && len1669 >= 5 && b1669[4] !== 2) {
        t1669.type_bad++;
        flag1669("type");
    }
    if (len1669 === 308) t1669.length_308++;
    else if (len1669 === 300) t1669.length_300++;
    else {
        t1669.other_length++;
        flag1669("length");
    }
    const minParserBytes1669 = kind1669 === "static" ? 262 :
        kind1669 === "setup" ? 284 : 283;
    if (len1669 < minParserBytes1669) {
        t1669.short_for_parser++;
        flag1669("short_for_parser");
    }
    if (b1669 && len1669 >= 300) {
        let sum1669 = 0;
        for (let i1669 = 0; i1669 < 299; i1669++) {
            sum1669 = (sum1669 + b1669[i1669]) & 255;
        }
        if (sum1669 === b1669[299]) t1669.jk_checksum_ok++;
        else {
            t1669.jk_checksum_bad++;
            flag1669("jk_checksum");
        }
    } else t1669.jk_checksum_unavailable++;
    if (b1669 && len1669 === 308) {
        const expectedReg1669 = kind1669 === "static" ? 0x1C :
            kind1669 === "setup" ? 0x1E : 0x20;
        const shape1669 = b1669[301] === 0x10 &&
            b1669[302] === 0x16 &&
            b1669[304] === 0x00 && b1669[305] === 0x01;
        if (!shape1669) {
            t1669.ack_shape_bad++;
            flag1669("ack_shape");
        }
        if (b1669[303] !== expectedReg1669) {
            t1669.ack_register_bad++;
            flag1669("ack_register");
        }
        let crc1669 = 0xFFFF;
        for (let i1669 = 300; i1669 < 306; i1669++) {
            crc1669 ^= b1669[i1669];
            for (let j1669 = 0; j1669 < 8; j1669++) {
                crc1669 = crc1669 & 1 ?
                    (crc1669 >>> 1) ^ 0xA001 : crc1669 >>> 1;
            }
        }
        const crcGood1669 = (crc1669 & 0xFFFF) ===
            (b1669[306] | (b1669[307] << 8));
        if (crcGood1669) t1669.ack_crc_ok++;
        else {
            t1669.ack_crc_bad++;
            flag1669("ack_crc");
        }
        const addr1669 = b1669[300];
        if (addr1669 < 1 || addr1669 > 15) {
            t1669.ack_address_range++;
            flag1669("ack_address_range");
        }
        if (crcGood1669 && shape1669 &&
            b1669[303] === expectedReg1669 &&
            addr1669 >= 1 && addr1669 <= 15) {
            const key1669 = String(addr1669);
            t1669.by_ack_address[key1669] =
                (t1669.by_ack_address[key1669] || 0) + 1;
            const globKey1669 = kind1669 === "static" ? "slaveAddress-Trame1" :
                kind1669 === "setup" ? "slaveAddress-Trame2" : "slaveAddress-Trame3";
            const globalAddress1669 = Number(global.get(globKey1669) || 1);
            if (globalAddress1669 !== addr1669) {
                t1669.address_vs_global_mismatch++;
                flag1669("ack_vs_global");
            }
            const diagAddress1669 = Number(msg.diag_slave_id);
            if (Number.isInteger(diagAddress1669) &&
                diagAddress1669 >= 1 &&
                diagAddress1669 !== addr1669) {
                t1669.address_vs_diag_mismatch++;
                flag1669("ack_vs_diag");
            }
            if (kind1669 === "setup") {
                const declared1669 = b1669.readUInt32LE(270);
                if (declared1669 !== addr1669) {
                    t1669.setup_id_mismatch++;
                    flag1669("setup_vs_ack");
                }
            }
        }
    } else t1669.ack_crc_unavailable++;
    if (reason1669) {
        state1669.last_anomalies.push({
            ts:current1669,kind:kind1669,reason:reason1669,len:len1669
        });
        if (state1669.last_anomalies.length > 8)
            state1669.last_anomalies.shift();
    }
    flow.set(diagKey1669,state1669);
    if (!state1669.last_report_ts ||
        current1669 - state1669.last_report_ts >= 60000) {
        node.warn("ISSUE1669_ACTIVE_PASSIVE " + JSON.stringify({
            seen:state1669.seen,by_type:state1669.by_type,
            last_anomalies:state1669.last_anomalies.slice(-3)
        }));
        state1669.last_report_ts = current1669;
        flow.set(diagKey1669,state1669);
    }
} catch (e1669) {
    node.warn("ISSUE1669_ACTIVE_PASSIVE observer error: " + String(e1669));
}
