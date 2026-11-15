// Issue #166 DEV166.9 — PASSIVE Active Polling alarm response audit.
// The existing alarm decoder and its return value are not changed.
try {
    if (msg.topic === "Trame-Alarmes-BMS") {
        const now1669 = Date.now();
        const key1669 = "issue1669_alarm_passive";
        let a1669 = flow.get(key1669);
        if (!a1669 || a1669.schema !== 1) {
            a1669 = {
                schema:1,since:now1669,last_report_ts:0,
                seen:0,valid_format:0,bad_length:0,bad_function:0,
                bad_byte_count:0,bad_crc:0,bad_address:0,
                address_vs_request_mismatch:0,
                by_address:{},last_anomalies:[]
            };
        }
        a1669.seen++;
        const b1669 = Buffer.isBuffer(msg.payload) ? msg.payload : null;
        const len1669 = b1669 ? b1669.length : 0;
        const bad1669 = [];
        // FC03 register 0x12A0, two registers returned as 4 bytes:
        // [slave, 0x03, 0x04, alarm(4 bytes), CRC16 LE].
        if (len1669 !== 9) {
            a1669.bad_length++;bad1669.push("length");
        }
        if (!b1669 || b1669[1] !== 0x03) {
            a1669.bad_function++;bad1669.push("function");
        }
        if (!b1669 || b1669[2] !== 0x04) {
            a1669.bad_byte_count++;bad1669.push("byte_count");
        }
        const addr1669 = b1669 && len1669 > 0 ? b1669[0] : null;
        if (!Number.isInteger(addr1669) || addr1669 < 1 || addr1669 > 15) {
            a1669.bad_address++;bad1669.push("address");
        }
        if (b1669 && len1669 === 9) {
            let crc1669 = 0xFFFF;
            for (let i1669 = 0; i1669 < 7; i1669++) {
                crc1669 ^= b1669[i1669];
                for (let j1669 = 0; j1669 < 8; j1669++) {
                    crc1669 = crc1669 & 1 ?
                        (crc1669 >>> 1) ^ 0xA001 : crc1669 >>> 1;
                }
            }
            if ((crc1669 & 0xFFFF) !== (b1669[7] | (b1669[8] << 8))) {
                a1669.bad_crc++;bad1669.push("crc");
            }
        }
        const request1669 = Number(msg.diag_slave_id);
        if (Number.isInteger(request1669) && request1669 >= 1 &&
            Number.isInteger(addr1669) && addr1669 !== request1669) {
            a1669.address_vs_request_mismatch++;
            bad1669.push("request_mismatch");
        }
        if (!bad1669.length) {
            a1669.valid_format++;
            const keyAddr1669 = String(addr1669);
            a1669.by_address[keyAddr1669] =
                (a1669.by_address[keyAddr1669] || 0) + 1;
        } else {
            a1669.last_anomalies.push({
                ts:now1669,len:len1669,address:addr1669,
                reasons:bad1669.slice(0,5)
            });
            if (a1669.last_anomalies.length > 8)
                a1669.last_anomalies.shift();
        }
        flow.set(key1669,a1669);
        if (global.get('communication_debug') === true &&
            (!a1669.last_report_ts || now1669 - a1669.last_report_ts >= 60000)) {
            node.log("ISSUE1669_ALARM_PASSIVE " + JSON.stringify({
                seen:a1669.seen,valid_format:a1669.valid_format,
                bad_length:a1669.bad_length,bad_function:a1669.bad_function,
                bad_byte_count:a1669.bad_byte_count,bad_crc:a1669.bad_crc,
                bad_address:a1669.bad_address,
                address_vs_request_mismatch:a1669.address_vs_request_mismatch,
                by_address:a1669.by_address,
                last_anomalies:a1669.last_anomalies.slice(-3)
            }));
            a1669.last_report_ts = now1669;
            flow.set(key1669,a1669);
        }
    }
} catch (e1669) {
    node.warn("ISSUE1669_ALARM_PASSIVE observer error: " + String(e1669));
}
