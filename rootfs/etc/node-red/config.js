console.log("✅ config.js is being loaded");

const config = require("/config/smartphoton_jkbms/settings.js");

const fs = require("fs");
const options = JSON.parse(fs.readFileSync("/data/options.json", "utf8"));
const bcrypt = require("bcryptjs");

if ("theme" in options && options.theme !== "default") {
  config.editorTheme.theme = options.theme;
}

config.debugUseColors = false;
config.flowFile = "flows.json";
config.nodesDir = "/config/smartphoton_jkbms/nodes";
config.uiPort = 1891;
config.userDir = "/config/smartphoton_jkbms/";
config.httpNodeRoot = "/endpoint";

console.log("✅ Node-RED is using userDir =", config.userDir);
console.log("✅ Node-RED is using uiPort =", config.uiPort);

config.credentialSecret = "domosimple";
config.flowFilePretty = true;

config.contextStorage = {
  default: {
    module: 'localfilesystem',
    config: {
      dir: '/config/smartphoton_jkbms/global-variables',
      flushInterval: '5'
    }
  }
};

config.adminAuth = {
  type: "credentials",
  users: [
    {
      username: "pi",
      password: "$2a$08$uGLFsGppdWnckZpomdNQveucw.zh8bkSWDO0Gnzj4Z0asqj91KKge",
      permissions: "*"
    }
  ]
};

config.httpNodeAuth = {
  user: "pi",
  pass: "$2a$08$uGLFsGppdWnckZpomdNQveucw.zh8bkSWDO0Gnzj4Z0asqj91KKge"
};

config.httpStaticAuth = {
  user: "pi",
  pass: "$2a$08$uGLFsGppdWnckZpomdNQveucw.zh8bkSWDO0Gnzj4Z0asqj91KKge"
};

if (options.log_level) {
  config.logging.console.level = options.log_level.toLowerCase();
  if (config.logging.console.level === "warning") {
    config.logging.console.level = "warn";
  }
}

module.exports = config;
