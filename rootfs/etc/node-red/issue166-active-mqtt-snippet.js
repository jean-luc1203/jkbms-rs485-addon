// DEV166.11 — use ONLY the BMS identity verified in the reply, not the
// mutable global poll-loop address. Untrusted, absent or conflicting identity
// MUST NOT result in MQTT retained or state topics in Active Polling.
function issue16611PublishStat(ok,reason,id) {
    let s = flow.get('issue16611_mqtt_gate');
    if (!s || s.schema !== 1) {
        s = {schema:1,since:Date.now(),by_kind:{},reasons:{},
            last_report_ts:0};
    }
    const kind = '__KIND16611__';
    if (!s.by_kind[kind]) s.by_kind[kind] =
        {accepted:0,rejected:0,by_address:{}};
    if (ok) {
        s.by_kind[kind].accepted++;
        s.by_kind[kind].by_address[String(id)] =
            (s.by_kind[kind].by_address[String(id)] || 0)+1;
    } else {
        s.by_kind[kind].rejected++;
        s.reasons[reason] = (s.reasons[reason] || 0)+1;
    }
    const now = Date.now();
    if (!ok && (!s.last_reject_warn_ts ||
        now - s.last_reject_warn_ts >= 60000)) {
        node.warn('ISSUE16611_MQTT_REJECT ' + JSON.stringify({
            kind:kind,reason:reason,rejected_total:s.by_kind[kind].rejected
        }));
        s.last_reject_warn_ts = now;
    }
    if (global.get('communication_debug') === true &&
        (!s.last_report_ts || now-s.last_report_ts>=60000)) {
        node.log('ISSUE16611_MQTT_IDENTITY ' + JSON.stringify({
            by_kind:s.by_kind,reasons:s.reasons
        }));
        s.last_report_ts = now;
    }
    flow.set('issue16611_mqtt_gate',s);
}
let slaveIdNumber;
if (global.get('bms_broadcasting') === false) {
    const reply16611 = msg._issue16611_reply_bms;
    if (!Number.isInteger(reply16611) ||
        reply16611 < 1 || reply16611 > 15) {
        issue16611PublishStat(false,'missing_or_invalid_verified_id',null);
        return null;
    }
    if (msg.bms_numero !== undefined && msg.bms_numero !== null &&
        Number(msg.bms_numero) !== reply16611) {
        issue16611PublishStat(false,'verified_id_conflict',null);
        return null;
    }
    slaveIdNumber = reply16611;
    issue16611PublishStat(true,'ok',reply16611);
} else {
    // Non-Active-Polling path is unchanged for backward compatibility.
    const legacySlave16611 = global.get('__GLOBAL16611__') || 0x01;
    slaveIdNumber = typeof legacySlave16611 === 'string'
        ? parseInt(legacySlave16611,16) : Number(legacySlave16611);
}
