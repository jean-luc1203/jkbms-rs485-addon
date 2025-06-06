const config = require("/config/smartphoton/settings.js");
const fs = require("fs");
const options = JSON.parse(fs.readFileSync("/data/options.json", "utf8"));
const bcrypt = require("bcryptjs");

if ("theme" in options) {
  if (options.theme !== "default") {
    config.editorTheme.theme = options.theme;
  }
}

// Sane and required defaults for the add-on
config.debugUseColors = false;
config.flowFile = "flows.json";
config.nodesDir = "/config/smartphoton/nodes";
//config.uiHost = "127.0.0.1";
config.uiPort = 1890;
config.userDir = "/config/smartphoton/";

//Set path for HTTP_Nodes to be served from avoiding lua auth
config.httpNodeRoot = "/endpoint";

// Disable authentication, let HA handle that
config.adminAuth = null;

// Disable SSL, since the add-on handles that
config.https = null;

// Several settings
config.credentialSecret = "domosimple";
config.flowFilePretty = true;

config.contextStorage = {
         default: {
             module: 'localfilesystem',
             config: {
                 dir: '/config/smartphoton/global-variables',
                 flushInterval: '5'
               }
         }
     },

config.adminAuth = {
        type: "credentials",
        users: [{
            username: "pi",
            password: "$2a$08$uGLFsGppdWnckZpomdNQveucw.zh8bkSWDO0Gnzj4Z0asqj91KKge",
            permissions: "*"
        },
        {
            username: "invite",
            password: "$2b$08$OOETRfqq6h7596VIEXH2e.pRPX6wj/3MYCQ/Q6XJbVhgHFRSMk6L.",
            permissions: "read"
        }
      ]
    },



// Secure HTTP node
//if (options.http_node.username) {
  config.httpNodeAuth = {
    user: "pi",
    pass: "$2a$08$uGLFsGppdWnckZpomdNQveucw.zh8bkSWDO0Gnzj4Z0asqj91KKge",
  };
//}

// Secure static HTTP
//if (options.http_static.username) {
  config.httpStaticAuth = {
    user: "pi",
    pass: "$2a$08$uGLFsGppdWnckZpomdNQveucw.zh8bkSWDO0Gnzj4Z0asqj91KKge",
  };
//}

// Set debug level
if (options.log_level) {
  config.logging.console.level = options.log_level.toLowerCase();
  if (config.logging.console.level === "warning") {
    config.logging.console.level = "warn";
  }
}

module.exports = config;
