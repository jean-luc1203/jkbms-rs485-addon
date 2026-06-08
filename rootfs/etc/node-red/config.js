"use strict";
console.log("✅ config.js is being loaded");

const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const config = require("/config/smartphoton_jkbms/settings.js");
const options = JSON.parse(fs.readFileSync("/data/options.json", "utf8"));

const CRED_SECRET_FILE = "/data/credential-secret";
const BCRYPT_COST = 10;

// credentialSecret: generate once, persist forever (0600).
// flows.json is rewritten from the template on every restart and MQTT creds
// are read from add-on options at runtime, so there are no surviving
// encrypted credentials from the old shared secret to migrate.
let credentialSecret = null;
try {
  credentialSecret = fs.readFileSync(CRED_SECRET_FILE, "utf8").trim() || null;
} catch (_) { /* will generate */ }
if (!credentialSecret) {
  credentialSecret = crypto.randomBytes(32).toString("hex");
  const tmp = CRED_SECRET_FILE + ".tmp";
  fs.writeFileSync(tmp, credentialSecret, { mode: 0o600 });
  fs.renameSync(tmp, CRED_SECRET_FILE);
}

if ("theme" in options && options.theme !== "default") {
  config.editorTheme.theme = options.theme;
}

config.debugUseColors = false;
config.flowFile = "flows.json";
config.nodesDir = "/config/smartphoton_jkbms/nodes";
config.uiPort = 1891;
config.userDir = "/config/smartphoton_jkbms/";
config.httpNodeRoot = "/endpoint";
config.flowFilePretty = true;
config.credentialSecret = credentialSecret;

console.log("✅ Node-RED is using userDir =", config.userDir);
console.log("✅ Node-RED is using uiPort =", config.uiPort);

config.contextStorage = {
  default: {
    module: "localfilesystem",
    config: {
      dir: "/config/smartphoton_jkbms/global-variables",
      flushInterval: "5"
    }
  }
};

const authUser = (options.auth_username || "").trim();
const authPass = (options.auth_password || "").trim();
if (authUser && authPass) {
  const hash = bcrypt.hashSync(authPass, BCRYPT_COST);
  config.adminAuth = {
    type: "credentials",
    users: [{ username: authUser, password: hash, permissions: "*" }]
  };
  config.httpNodeAuth = { user: authUser, pass: hash };
  config.httpStaticAuth = { user: authUser, pass: hash };
  console.log("✅ Node-RED authentication enabled for editor and HTTP endpoints");
} else {
  const bar = "=".repeat(72);
  console.warn(bar);
  console.warn("⚠️  Node-RED editor and HTTP endpoints (port 1891) are UNPROTECTED.");
  console.warn("⚠️  Set 'auth_username' and 'auth_password' in the add-on");
  console.warn("⚠️  configuration to enable authentication.");
  console.warn(bar);
}

if (options.log_level) {
  config.logging.console.level = options.log_level.toLowerCase();
  if (config.logging.console.level === "warning") {
    config.logging.console.level = "warn";
  }
}

module.exports = config;
