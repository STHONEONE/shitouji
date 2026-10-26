const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {pathToFileURL}=require('node:url');
let playwright;
const candidates=[process.env.PLAYWRIGHT_MODULE,'playwright',path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')].filter(Boolean);
for(const name of candidates){try{playwright=require(name);break;}catch{}}
if(!playwright)throw Error('Install Playwright or set PLAYWRIGHT_MODULE to its module path.');
const projectRoot=path.resolve(process.env.GAME_PROJECT_ROOT||path.join(__dirname,'../..'));
const gameFile=path.join(projectRoot,'outputs/潇湘馆-庭院与内室-模块03.html');
const chrome=[process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium'].find(p=>p&&fs.existsSync(p));
const launchOptions=chrome?{executablePath:chrome}:{};
function outputPath(relative){const p=path.join(process.env.QA_ARTIFACT_ROOT||projectRoot,relative);fs.mkdirSync(path.extname(p)?path.dirname(p):p,{recursive:true});return p;}
module.exports={chromium:playwright.chromium,launchOptions,projectRoot,gameFile,gameUrl:pathToFileURL(gameFile).href,outputPath};
