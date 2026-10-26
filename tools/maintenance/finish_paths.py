"""Finish tool and package references after the approved file-only moves."""
from pathlib import Path
import json,re,os,zipfile
ROOT=Path(__file__).resolve().parents[2]
def edit(path,fn):
    p=ROOT/path;p.write_text(fn(p.read_text(encoding='utf-8')),encoding='utf-8')
for p in (ROOT/'tools/qa').glob('qa-*.cjs'):
    s=p.read_text(encoding='utf-8')
    s=re.sub(r"const\s*\{chromium\}=require\('[^']+/playwright'\)","const {chromium,launchOptions,projectRoot,gameUrl,outputPath}=require('./runtime.cjs')",s)
    s=s.replace("const root='D:/AIcoding/red dream/';","const root=projectRoot.replaceAll('\\\\','/')+'/';")
    s=s.replace("'file:///D:/AIcoding/red%20dream/outputs/潇湘馆-庭院与内室-模块03.html'","gameUrl")
    s=s.replace("pathToFileURL('D:/AIcoding/red dream/outputs/潇湘馆-庭院与内室-模块03.html').href","gameUrl")
    s=re.sub(r"'D:/AIcoding/red dream/([^']+)'",lambda m:"outputPath("+repr(m.group(1))+')',s)
    s=s.replace("executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',","...launchOptions,")
    p.write_text(s,encoding='utf-8')
edit('tools/build/build_characters.py',lambda s:s.replace("ROOT / 'outputs' / '三人角色动作素材'","ROOT / 'exports/character-poses-20261025'").replace("ROOT/'outputs'/'三人角色动作素材.zip'","ROOT/'exports/character-poses-20261025.zip'"))
edit('tools/build/prepare_npc_art.py',lambda s:s.replace("out=Path('assets/npcs')","out=Path(__file__).resolve().parents[2]/'assets/characters/npcs'"))
edit('tools/build/prepare_layer_handoff.py',lambda s:s.replace("ROOT/'outputs'/'美术交接-全场景透明分层.md'","ROOT/'docs/art-requests/scene-layer-art-request.md'"))
# Update split path expressions that a literal full-path replacement cannot see.
edit('tools/build/build_characters.py',lambda s:s.replace("OUT/'制作提示词.json'","OUT/'generation-prompts.json'").replace("OUT/'使用说明.md'","OUT/'usage.md'").replace("OUT.parent/'三人角色动作素材.zip'","OUT.parent/'character-poses-20261025.zip'"))
for package in ['character-poses-20261025','frame-review-20261025']:
    folder=ROOT/'exports'/package
    with zipfile.ZipFile(ROOT/'exports'/(package+'.zip'),'w',zipfile.ZIP_DEFLATED) as archive:
        for file in sorted(folder.rglob('*')):
            if file.is_file():archive.write(file,file.relative_to(folder).as_posix())
print('Portable QA and derived export package paths updated.')
