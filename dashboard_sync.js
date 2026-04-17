#!/usr/bin/env node
"use strict";

const fs = require("fs");

const action = process.argv[2] || "upsert";
const filePath = process.argv[3] || "/config/dashboards/smart_jkbms.json";

const token = process.env.SUPERVISOR_TOKEN;
const wsUrl = "ws://supervisor/core/websocket";

if (!token) {
  console.error(JSON.stringify({ ok: false, error: "Supervisor token missing" }));
  process.exit(1);
}

if (typeof WebSocket === "undefined") {
  console.error(JSON.stringify({ ok: false, error: "Global WebSocket not available" }));
  process.exit(1);
}

let input = null;

if (action !== "delete") {
  if (!fs.existsSync(filePath)) {
    console.error(JSON.stringify({ ok: false, error: `Dashboard file not found: ${filePath}` }));
    process.exit(1);
  }

  try {
    input = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    console.error(JSON.stringify({ ok: false, error: `Invalid dashboard JSON in file: ${filePath}` }));
    process.exit(1);
  }
}

const dashboardMeta = input?.dashboard_meta || {};
const dashboardConfig = input?.config || {};
const urlPath = dashboardMeta.url_path || "smart-jkbms";
const title = dashboardMeta.title || "Smart JK-BMS";
const icon = dashboardMeta.icon || "mdi:battery";
const showInSidebar = dashboardMeta.show_in_sidebar !== false;
const requireAdmin = !!dashboardMeta.require_admin;

const ws = new WebSocket(wsUrl);
let nextId = 1;
const pending = new Map();
let finished = false;

function finishOk(extra = {}) {
  if (finished) return;
  finished = true;
  console.log(JSON.stringify({
    ok: true,
    action,
    dashboard: urlPath,
    ...extra
  }));
  try { ws.close(); } catch (_) {}
  process.exit(0);
}

function finishErr(error) {
  if (finished) return;
  finished = true;
  console.error(JSON.stringify({
    ok: false,
    action,
    error: String(error || "Unknown error")
  }));
  try { ws.close(); } catch (_) {}
  process.exit(1);
}

function call(type, payload = {}) {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, type, ...payload }));
  });
}

async function createOrUpdateDashboard() {
  let createdDashboard = false;

  try {
    await call("lovelace/dashboards/create", {
      url_path: urlPath,
      title,
      icon,
      show_in_sidebar: showInSidebar,
      require_admin: requireAdmin,
      mode: "storage"
    });
    createdDashboard = true;
  } catch (err) {
    const msg = String(err?.message || err || "").toLowerCase();
    if (
      !msg.includes("exists") &&
      !msg.includes("already") &&
      !msg.includes("configured")
    ) {
      throw err;
    }
  }

  await call("lovelace/config/save", {
    url_path: urlPath,
    config: dashboardConfig
  });

  return {
    created_dashboard: createdDashboard,
    saved: true,
    file: filePath
  };
}

async function deleteDashboard() {
  try {
    await call("lovelace/config/delete", {
      url_path: urlPath
    });

    return { deleted: true };
  } catch (err) {
    const msg = String(err?.message || err || "").toLowerCase();

    if (
      msg.includes("not found") ||
      msg.includes("unknown") ||
      msg.includes("does not exist") ||
      msg.includes("no config") ||
      msg.includes("not configured")
    ) {
      return {
        deleted: false,
        already_missing: true
      };
    }

    throw err;
  }
}

ws.onerror = (event) => {
  finishErr(event?.message || "WebSocket error");
};

ws.onmessage = async (event) => {
  let msg;
  try {
    msg = JSON.parse(event.data.toString());
  } catch (e) {
    finishErr("Invalid websocket message");
    return;
  }

  if (msg.type === "auth_required") {
    ws.send(JSON.stringify({
      type: "auth",
      access_token: token
    }));
    return;
  }

  if (msg.type === "auth_invalid") {
    finishErr("Authentication failed");
    return;
  }

  if (msg.type === "auth_ok") {
    try {
      let result;

      if (action === "delete") {
        result = await deleteDashboard();
      } else {
        result = await createOrUpdateDashboard();
      }

      finishOk(result);
    } catch (err) {
      finishErr(err?.message || err);
    }
    return;
  }

  if (Object.prototype.hasOwnProperty.call(msg, "id")) {
    const waiter = pending.get(msg.id);
    if (!waiter) return;

    pending.delete(msg.id);

    if (msg.success === false) {
      waiter.reject(new Error(msg.error?.message || "Home Assistant error"));
    } else {
      waiter.resolve(msg.result);
    }
  }
};
