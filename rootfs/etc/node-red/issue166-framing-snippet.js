// ISSUE #166 DEV166.5 — PASSIVE FRAMER BYTE ACCOUNTING.
// Called after original buffer storage, on EVERY invocation (also no-frame cases).
// Counts bytes genuinely abandoned by framing, not physically missing packets.
// No modification to parsing, output frames, pending buffers or MQTT.
try {
    const framingKey166 = "issue166_framing_passive";
    const framingNow166 = Date.now();
    let p166 = flow.get(framingKey166);
    if (!p166 || p166.schema !== 1 || !p166.poll_by_slave) {
        p166 = {
            schema: 1,
            since: framingNow166,
            input_calls: 0,
            input_bytes: 0,
            emitted_bytes: 0,
            jk_frames: 0,
            modbus_polls: 0,
            poll_by_slave: {},
            discarded_bytes: 0,
            discard_calls: 0,
            short_header_candidates: 0,
            buffer_trims: 0,
            trim_bytes: 0,
            accounting_errors: 0,
            buffer_retained: 0,
            buffer_retained_max: 0,
            last_events: [],
            last_report_ts: 0
        };
    }
    p166.input_calls++;
    p166.input_bytes += incoming.length;
    const emittedBytes166 = frames.reduce((sum166, f166) =>
        sum166 + (f166 && f166.payload && f166.payload.length || 0), 0);
    p166.emitted_bytes += emittedBytes166;
    for (const f166 of frames) {
        if (!f166) continue;
        if (f166.topic === "broadcast/jkbms_reply") p166.jk_frames++;
        if (f166.topic === "broadcast/modbus_poll") {
            p166.modbus_polls++;
            const addr166 = f166.slave;
            if (Number.isInteger(addr166) && addr166 >= 0 && addr166 <= 15) {
                const key166 = String(addr166);
                p166.poll_by_slave[key166] = (p166.poll_by_slave[key166] || 0) + 1;
            }
        }
    }
    // Byte conservation: bytes present after the concat =
    // emitted frame bytes + retained tail + bytes skipped/truncated.
    // This DOES NOT detect a complete frame never received by the transport.
    const consumedWithoutEmission166 =
        issue166BufferStartBytes - emittedBytes166 - buf.length;
    if (consumedWithoutEmission166 >= 0) {
        p166.discarded_bytes += consumedWithoutEmission166;
        if (consumedWithoutEmission166 > 0) p166.discard_calls++;
    } else {
        p166.accounting_errors++;
    }
    p166.short_header_candidates += issue166ShortHeaders;
    p166.buffer_trims += issue166Trims;
    p166.trim_bytes += issue166TrimmedBytes;
    p166.buffer_retained = buf.length;
    p166.buffer_retained_max = Math.max(p166.buffer_retained_max, buf.length);
    if (consumedWithoutEmission166 > 0 || issue166ShortHeaders || issue166Trims ||
        consumedWithoutEmission166 < 0) {
        if (p166.last_events.length >= 8) p166.last_events.shift();
        p166.last_events.push({
            ts: framingNow166,
            discarded_bytes: consumedWithoutEmission166,
            short_headers: issue166ShortHeaders,
            trims: issue166Trims,
            trim_bytes: issue166TrimmedBytes,
            buffer_retained: buf.length
        });
    }
    flow.set(framingKey166, p166);
    if (p166.jk_frames > 0 && (!p166.last_report_ts ||
        framingNow166 - p166.last_report_ts >= 60000)) {
        node.warn("ISSUE166_FRAMING_PASSIVE " + JSON.stringify({
            input_calls: p166.input_calls,
            input_bytes: p166.input_bytes,
            emitted_bytes: p166.emitted_bytes,
            jk_frames: p166.jk_frames,
            modbus_polls: p166.modbus_polls,
            poll_by_slave: p166.poll_by_slave,
            discarded_bytes: p166.discarded_bytes,
            discard_calls: p166.discard_calls,
            short_header_candidates: p166.short_header_candidates,
            buffer_trims: p166.buffer_trims,
            trim_bytes: p166.trim_bytes,
            accounting_errors: p166.accounting_errors,
            buffer_retained: p166.buffer_retained,
            buffer_retained_max: p166.buffer_retained_max,
            last_events: p166.last_events.slice(-3)
        }));
        p166.last_report_ts = framingNow166;
        flow.set(framingKey166, p166);
    }
} catch (e166) {
    node.warn("ISSUE166_FRAMING_PASSIVE observer error: " + String(e166));
}
