// ISSUE166 DEV166.11 — strict per-response Active Polling identity.
// Injected directly before each original JK validator or alarm decoder.
// No global polling address is used to assign a response identity.
//
// JK-BMS READ/SETUP/STATIC replies: exactly 308 bytes; body checksum is
// JK sum8 bytes 0..298 vs byte299, and Modbus ACK CRC16 bytes 300..305
// vs 306..307. The ACK's address and register are separately checked.
// FC03 alarms: 9-byte response, CRC16 bytes 0..6 vs 7..8.
function issue16611Crc16(buf, first, end) {
    let crc = 0xFFFF;
    for (let i = first; i < end; i++) {
        crc ^= buf[i];
        for (let j = 0; j < 8; j++) {
            crc = (crc & 1) ? ((crc >>> 1) ^ 0xA001) : (crc >>> 1);
        }
    }
    return crc & 0xFFFF;
}
function issue16611Identity(buffer, kind, requestedId) {
    function reject(reason) { return {ok:false, reason:reason, address:null}; }
    if (!Buffer.isBuffer(buffer)) return reject('not_buffer');
    let address;
    if (kind === 'alarm') {
        if (buffer.length !== 9) return reject('alarm_length');
        if (buffer[1] !== 0x03 || buffer[2] !== 0x04)
            return reject('alarm_fc03_shape');
        if (issue16611Crc16(buffer, 0, 7) !== buffer.readUInt16LE(7))
            return reject('alarm_crc16');
        address = buffer[0];
    } else {
        if (buffer.length !== 308) return reject('jk_length');
        const type = kind === 'static' ? 0x03 :
            kind === 'setup' ? 0x01 : 0x02;
        if (buffer[0] !== 0x55 || buffer[1] !== 0xAA ||
            buffer[2] !== 0xEB || buffer[3] !== 0x90 ||
            buffer[4] !== type) return reject('jk_header_type');
        let sum = 0;
        for (let i = 0; i < 299; i++) sum = (sum + buffer[i]) & 255;
        if (sum !== buffer[299]) return reject('jk_checksum');
        const reg = kind === 'static' ? 0x1C :
            kind === 'setup' ? 0x1E : 0x20;
        if (buffer[301] !== 0x10 || buffer[302] !== 0x16 ||
            buffer[303] !== reg || buffer[304] !== 0 ||
            buffer[305] !== 1) return reject('ack_shape_register');
        if (issue16611Crc16(buffer, 300, 306) !==
            buffer.readUInt16LE(306)) return reject('ack_crc16');
        address = buffer[300];
        if (kind === 'setup' && buffer.readUInt32LE(270) !== address)
            return reject('setup_id_vs_ack');
    }
    if (!Number.isInteger(address) || address < 1 || address > 15)
        return reject('address_range');
    // A response can arrive after the polling loop has advanced. Compare
    // to the explicit request identity when Node-RED preserved it, NOT
    // to global slaveAddress-TrameN (which is mutable).
    if (requestedId !== undefined && requestedId !== null &&
        String(requestedId).trim() !== '') {
        const request = Number(requestedId);
        if (!Number.isInteger(request) || request < 1 || request > 15)
            return reject('request_id_invalid');
        if (request !== address) return reject('request_reply_mismatch');
    }
    return {ok:true, reason:'ok', address:address};
}
function issue16611GateStats(kind, verdict) {
    const key = 'issue16611_active_gate';
    let state = flow.get(key);
    if (!state || state.schema !== 1) {
        state = {schema:1,since:Date.now(),seen:0,accepted:0,
            rejected:0,by_kind:{},reasons:{},by_address:{},
            recent_rejections:[],last_report_ts:0};
    }
    state.seen++;
    if (!state.by_kind[kind]) {
        state.by_kind[kind] = {seen:0,accepted:0,rejected:0};
    }
    state.by_kind[kind].seen++;
    if (verdict.ok) {
        state.accepted++;
        state.by_kind[kind].accepted++;
        state.by_address[String(verdict.address)] =
            (state.by_address[String(verdict.address)] || 0) + 1;
    } else {
        state.rejected++;
        state.by_kind[kind].rejected++;
        state.reasons[verdict.reason] =
            (state.reasons[verdict.reason] || 0) + 1;
        state.recent_rejections.push({
            ts:Date.now(),kind:kind,reason:verdict.reason
        });
        if (state.recent_rejections.length > 8)
            state.recent_rejections.shift();
        const rejectNow166 = Date.now();
        if (!state.last_reject_warn_ts ||
            rejectNow166 - state.last_reject_warn_ts >= 60000) {
            node.warn('ISSUE16611_REJECT ' + JSON.stringify({
                kind:kind, reason:verdict.reason, rejected_total:state.rejected
            }));
            state.last_reject_warn_ts = rejectNow166;
        }
    }
    const now = Date.now();
    if (global.get('communication_debug') === true &&
        (!state.last_report_ts || now-state.last_report_ts>=60000)) {
        node.log('ISSUE16611_ACTIVE_GATE ' + JSON.stringify({
            seen:state.seen,accepted:state.accepted,
            rejected:state.rejected,by_kind:state.by_kind,
            reasons:state.reasons,by_address:state.by_address,
            recent_rejections:state.recent_rejections.slice(-4)
        }));
        state.last_report_ts = now;
    }
    flow.set(key,state);
}
if (global.get('bms_broadcasting') === false &&
    ('__KIND16611__' !== 'alarm' ||
     msg.topic === 'Trame-Alarmes-BMS')) {
    const kind16611 = '__KIND16611__';
    const verdict16611 = issue16611Identity(
        msg.payload,kind16611,msg.diag_slave_id
    );
    issue16611GateStats(kind16611,verdict16611);
    if (!verdict16611.ok) return null;
    // Explicitly attach the verified identity to the SAME msg which is
    // forwarded through the buffer-parser. Publishers may only use this ID.
    msg._issue16611_reply_bms = verdict16611.address;
    msg.bms_numero = verdict16611.address;
}
