// Integration smoke test: execute the REAL Legacy init-nodered script against
// an isolated fake /config tree. No Docker, HAOS, user files, MQTT or BMS needed.
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');

const root=path.join(__dirname,'..');
const initPath=path.join(root,'rootfs/etc/s6-overlay/s6-rc.d/init-nodered/run');
const patchedPath=path.join(root,'rootfs/etc/node-red/issue166-apply.cjs');
const originalPath=path.join(root,'rootfs/etc/node-red/flows.json');
const addonConfig=fs.readFileSync(path.join(root,'config.yaml'),'utf8');
const version=addonConfig.match(/^version:\s*(\S+)$/m)?.[1];
const bootSource=fs.readFileSync(initPath,'utf8');

function boot(dir) {
  const configRoot=path.join(dir,'config');
  const userDir=path.join(configRoot,'smartphoton_jkbms');
  const packaged=path.join(dir,'etc/node-red');
  let script=bootSource.replace(/^#![^\n]*\n/,'');
  script=script.replace(/\/config\/smartphoton_jkbms(?=[\/'"\s])/g,userDir);
  script=script.replace(/\/etc\/node-red(?=[\/'"\s])/g,packaged);
  script=script.replace(/\bcd \/config \|\|/g,`cd "${configRoot}" ||`);
  // The patcher's JS dependencies are beside its real repo source file.
  // The packaged baseline is still copied to the temp "image" folder.
  script=script.replace(
    `node ${path.join(packaged,'issue166-apply.cjs')}`,
    `node "${patchedPath}"`
  );
  const bootstrap=`set -e
bashio::fs.directory_exists() { test -d "$1"; }
bashio::fs.file_exists() { test -f "$1"; }
bashio::addon.version() { printf '%s\\n' "${version}"; }
bashio::log.info() { :; }
bashio::log.warning() { :; }
bashio::exit.nok() { echo "Startup error: $*" >&2; exit 1; }
`;
  const run=spawnSync('bash',['-e','-c',bootstrap+script],{
    encoding:'utf8',cwd:root,timeout:30000
  });
  assert.equal(run.status,0,`Legacy boot failed: ${run.stderr}\n${run.stdout}`);
  return {userDir,stdout:run.stdout};
}
function makeImage() {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'legacy413-migration-'));
  const packageDir=path.join(dir,'etc/node-red');
  fs.mkdirSync(packageDir,{recursive:true});
  fs.copyFileSync(originalPath,path.join(packageDir,'flows.json'));
  fs.writeFileSync(path.join(packageDir,'settings.js'),'// factory defaults\n');
  fs.mkdirSync(path.join(dir,'config'),{recursive:true});
  return dir;
}
function inspectPatchedFlow(file) {
  const nodes=JSON.parse(fs.readFileSync(file,'utf8'));
  const byId=new Map(nodes.map(n=>[n.id,n]));
  assert(nodes.length>=560); // fork: Premium nodes removed
  assert(byId.get('86a0f48a516a10b6').func.includes('issue1668CheckReply'));
  assert(byId.get('0827976bdeec2605').func.includes("action: 'close'"));
  assert(byId.get('b02adbe3a64e64f2').func.includes('issue16611Identity'));
}
test('RC production startup upgrades existing Legacy 4.1.12 in-place without losing settings/credentials',()=>{
  const dir=makeImage();
  try {
    const userDir=path.join(dir,'config/smartphoton_jkbms');
    fs.mkdirSync(path.join(userDir,'nodes'),{recursive:true});
    fs.writeFileSync(path.join(userDir,'version'),'4.1.12\n');
    fs.writeFileSync(path.join(userDir,'flows.json'),'[{"id":"user-flow-replaced-by-legacy"}]');
    fs.writeFileSync(path.join(userDir,'settings.js'),'// user settings unchanged\n');
    fs.writeFileSync(path.join(userDir,'flows_cred.json'),'{"sensitive":"test-sentinel"}');
    fs.writeFileSync(path.join(userDir,'nodes/local-marker'),'node installed');
    fs.writeFileSync(path.join(userDir,'.config.runtime.json'),'{"saved":true}');
    const one=boot(dir);
    inspectPatchedFlow(path.join(userDir,'flows.json'));
    assert.equal(fs.readFileSync(path.join(userDir,'settings.js'),'utf8'),'// user settings unchanged\n');
    assert.equal(fs.readFileSync(path.join(userDir,'flows_cred.json'),'utf8'),'{"sensitive":"test-sentinel"}');
    assert.equal(fs.readFileSync(path.join(userDir,'nodes/local-marker'),'utf8'),'node installed');
    assert.equal(fs.readFileSync(path.join(userDir,'.config.runtime.json'),'utf8'),'{"saved":true}');
    assert(fs.existsSync(path.join(userDir,'flows.backup')));
    const two=boot(dir);
    inspectPatchedFlow(path.join(userDir,'flows.json'));
    assert.equal(fs.readFileSync(path.join(userDir,'flows_cred.json'),'utf8'),'{"sensitive":"test-sentinel"}');
    assert.equal(fs.readFileSync(path.join(userDir,'settings.js'),'utf8'),'// user settings unchanged\n');
    // Original Legacy startup already rewrites flows.json on each boot;
    // do not mistake the leftover version marker for a failed migration.
    assert.equal(fs.readFileSync(path.join(userDir,'version'),'utf8'),'4.1.12\n');
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('RC production startup handles a fresh install with production namespace',()=>{
  const dir=makeImage();
  try {
    const {userDir,stdout}=boot(dir);
    inspectPatchedFlow(path.join(userDir,'flows.json'));
    assert(fs.existsSync(path.join(userDir,'settings.js')));
    assert(fs.existsSync(path.join(userDir,'version')));
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
