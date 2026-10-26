"""Apply the approved 2026-10-26 inventory after verifying the external backup."""
from pathlib import Path
import hashlib,json,os,re,shutil,zipfile

ROOT=Path(__file__).resolve().parents[2]
BACKUP=Path('D:/AIcoding/red-dream-backups/snapshot-20261026-121354/red-dream')
EVIDENCE=ROOT/'docs/project-audit/reference-evidence.json'
e=json.loads(EVIDENCE.read_text(encoding='utf-8'))
ENTRY=e['entry']
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def inside(p):
    p=p.resolve()
    if not p.is_relative_to(ROOT) or p==ROOT:raise ValueError('Outside project: '+str(p))
    return p
if not BACKUP.is_dir():raise SystemExit('Verified external backup missing')
mapping={r['path']:r['proposed'] for r in e['rows']}
extra_legacy=['qa-activities.cjs','qa-events.cjs','qa-interior.cjs','qa-spring.cjs','qa-spring-final.cjs','qa-xiaoxiang.cjs']
for name in extra_legacy:mapping['work/'+name]='_archive/20261026/work/'+name
mapping['美术素材包/BDE698A6E585AEE7ACBAE6B9_A2E4939CE9A2B8E59F89E58A_BEE5B9BD%8D.zip']='art-source/deliveries/xiaoxiang-indoor-delivery-02-original.zip'
uuid_files=sorted(p for p in mapping if re.search(r'/[0-9a-f]{8}-[0-9a-f-]+\.png$',p))
for i,p in enumerate(uuid_files,1):mapping[p]=f'art-source/character-cards/character-reference-{i:02d}-{Path(p).stem[:8]}.png'
# Preserve unique prose from the encoded duplicate directory as source provenance.
for old in mapping:
    if old.startswith('%') and old.endswith('素材说明.txt'):mapping[old]='art-source/xiaoxiang-indoor-reference/duplicate-delivery-notes.txt'
if len({p.casefold() for p in mapping.values()})!=len(mapping):raise SystemExit('Destination collision')
for row in e['rows']:
    old=row['path'];src=inside(ROOT/old);dst=inside(ROOT/mapping[old])
    if digest(src)!=row['sha256'] or digest(BACKUP/old)!=row['sha256']:raise SystemExit('Source/backup changed: '+old)
    if dst!=src and dst.exists():raise SystemExit('Destination already exists: '+str(dst))
texts={}
for old,new in mapping.items():
    p=ROOT/old
    if p.suffix.lower() in {'.md','.txt','.json','.py','.js','.cjs','.html'} and old!=ENTRY and not new.startswith('_archive/'):
        texts[old]=p.read_text(encoding='utf-8-sig',errors='strict')
for old,new in mapping.items():
    if old==new:continue
    src=inside(ROOT/old);dst=inside(ROOT/new);dst.parent.mkdir(parents=True,exist_ok=True)
    shutil.move(str(src),str(dst))

# Replace complete source-root paths in a single pass (no cascading replacements).
keys=sorted(mapping,key=len,reverse=True)
root_pattern=re.compile('|'.join(re.escape(k) for k in keys))
def local_value(value,old,new):
    # JSON package paths relative to the manifest, not the project root.
    if value in mapping:return mapping[value]
    try:
        candidate=(ROOT/old).parent/value
        candidate=candidate.resolve()
        if candidate.is_relative_to(ROOT):
            oldrel=candidate.relative_to(ROOT).as_posix()
            if oldrel in mapping:return os.path.relpath(ROOT/mapping[oldrel],(ROOT/new).parent).replace('\\','/')
    except (OSError,ValueError):pass
    return value
def json_paths(value,old,new):
    if isinstance(value,dict):return {k:json_paths(v,old,new) for k,v in value.items()}
    if isinstance(value,list):return [json_paths(v,old,new) for v in value]
    if isinstance(value,str):return local_value(value,old,new)
    return value
for old,text in texts.items():
    new=mapping[old];p=ROOT/new
    if p.suffix=='.json':
        obj=json.loads(text);obj=json_paths(obj,old,new)
        text=json.dumps(obj,ensure_ascii=False,indent=2)
    else:
        # Convert real local Markdown links to relative links from their new parent.
        if p.suffix in {'.md','.txt'}:
            for original,dest in mapping.items():
                absolute='D:/AIcoding/red dream/'+original
                relative=os.path.relpath(ROOT/dest,p.parent).replace('\\','/')
                text=text.replace('(<'+absolute+'>)','(<'+relative+'>)').replace(']('+absolute+')','](<'+relative+'>)')
        text=root_pattern.sub(lambda m:mapping[m.group(0)],text)
    # Roots of Python tools move down from work to tools/build.
    if p.suffix=='.py':
        text=text.replace('Path(__file__).resolve().parent.parent','Path(__file__).resolve().parents[2]')
        # Existing asset-tools often reference a literal filename under ASSETS.
        for source,dest in mapping.items():
            if source.startswith('assets/') and '/' not in source[len('assets/'):]:
                filename=source.split('/')[-1]
                pattern=r"\bASSETS\s*/\s*(['\"])"+re.escape(filename)+r"\1"
                text=re.sub(pattern,lambda m:'ROOT / '+repr(dest),text)
    p.write_text(text,encoding='utf-8')

# Make active metadata/tool outputs follow their new grouping.
def edit(path,fn):
    p=ROOT/path;p.write_text(fn(p.read_text(encoding='utf-8')),encoding='utf-8')
edit('tools/build/audit_scene_assets.py',lambda s:s.replace("(ROOT/'assets').glob('*.png')","(ROOT/'assets').rglob('*.png')"))
edit('tools/build/prepare_npc_art.py',lambda s:s.replace("out=Path('assets/npcs')","out=Path(__file__).resolve().parents[2]/'assets/characters/npcs'").replace("out/'source'","out/'textures'"))
edit('tools/build/restore_room_decor.py',lambda s:s.replace("p=root/'assets/xiaoxiang-indoor-repaired'","p=root/'assets/scenes/xiaoxiang/indoor'").replace("p/'decor-atlas-v2.png'","p/'textures/decor-atlas.png'").replace("p/'restored-decor-frames.json'","root/'docs/art-provenance/xiaoxiang-indoor/restored-decor-frames.json'"))
# The restore helper stores an asset file string separately from its Path opening.
edit('tools/build/build_characters.py',lambda s:s.replace("dest = OUT / name","dest = OUT / key").replace("file=f'{name}/","file=f'{key}/").replace("sourceFile=f'{name}/","sourceFile=f'{key}/").replace("source=ASSETS/f'{key}-actions-v1.png'","source=ROOT/'art-source/characters'/f'{key}-actions-v1.png'").replace("OUT/name/'原始动作图.png'","OUT/key/'action-source.png'").replace("OUT/'人物动作预览.html'","OUT/'pose-preview.html'"))

# Active scripts receive portable ROOT/Playwright/Chrome discovery in the next step.
# Immutable original ZIPs remain byte-identical. Rebuild only derived export ZIPs.
for name in ['character-poses-20261025','frame-review-20261025']:
    folder=ROOT/'exports'/name
    with zipfile.ZipFile(ROOT/'exports'/(name+'.zip'),'w',zipfile.ZIP_DEFLATED) as z:
        for file in sorted(folder.rglob('*')):
            if file.is_file():z.write(file,file.relative_to(folder).as_posix())

# Remove only empty directories whose resolved paths remain inside the project.
for folder in sorted([p for p in ROOT.rglob('*') if p.is_dir()],key=lambda p:len(p.parts),reverse=True):
    if folder==ROOT or '.git' in folder.parts:continue
    if not any(folder.iterdir()):inside(folder).rmdir()
result={'date':'2026-10-26','backup':str(BACKUP),'entry_preserved':ENTRY,'original_files':len(mapping),'archived':sum(v.startswith('_archive/') for v in mapping.values()),'renamed_or_moved':sum(k!=v and not v.startswith('_archive/') for k,v in mapping.items()),'mapping':mapping,'decisions':['保留原始交付ZIP、母图、独立导出包及历史验收证据并分类','额外归档6个依赖旧布局/旧入口或断言无NPC的历史验收脚本','原始ZIP保持原始字节，派生导出包按新路径重打包','保留原HTML入口与项目根目录以兼容存档/应用目录']}
(ROOT/'docs/project-audit/execution-map.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k!='mapping'},ensure_ascii=False))
