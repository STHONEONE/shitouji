"""Validate organized paths, published image bytes, and source preservation."""
from pathlib import Path
import base64,hashlib,json,re,zipfile
ROOT=Path(__file__).resolve().parents[2]
e=json.loads((ROOT/'docs/project-audit/reference-evidence.json').read_text(encoding='utf-8'))
execution=json.loads((ROOT/'docs/project-audit/execution-map.json').read_text(encoding='utf-8'))
mapping=execution['mapping'];backup=Path(execution['backup'])
missing=[old for old,new in mapping.items() if not (ROOT/new).is_file()]
registry=json.loads((ROOT/'src/data/asset-files.json').read_text(encoding='utf-8'))
html=(ROOT/e['entry']).read_text(encoding='utf-8');decoder=json.JSONDecoder()
def const(name):return decoder.raw_decode(html,re.search(r'const\s+'+name+r'\s*=\s*',html).end())[0]
assets=const('ASSET_DATA')
bad_images=[]
for row in e['rows']:
    for key in row['embedded_keys']:
        disk=(ROOT/registry[key]).read_bytes()
        image=base64.b64decode(assets[key].split(',',1)[1])
        if hashlib.sha256(disk).hexdigest()!=row['sha256'] or disk!=image:bad_images.append(key)
source_changed=[old for old in e['source_checks'] if (ROOT/mapping[old]).read_text(encoding='utf-8')!=(backup/old).read_text(encoding='utf-8-sig')]
data_files={'XIAO_LAYER_SCENE':'assets/scenes/xiaoxiang/indoor/scene.json','NPC_ART':'assets/characters/npcs/art.json','NPC_CONTENT':'src/data/npc-content.json'}
bad_data=[k for k,v in data_files.items() if const(k)!=json.loads((ROOT/v).read_text(encoding='utf-8'))]
broken=[]
for p in ROOT.rglob('*.md'):
    if '.git' in p.parts or '_archive' in p.parts or '.validation' in p.parts or p.parent==ROOT/'docs/project-audit':continue
    for match in re.finditer(r'!?\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\)',p.read_text(encoding='utf-8-sig')):
        value=match.group(1) or match.group(2)
        if value.startswith(('#','http:','https:','codex:','data:','skill:')):continue
        value=value.split('#')[0]
        if re.search(r':\d+$',value):value=re.sub(r':\d+$','',value)
        target=Path(value) if Path(value).is_absolute() else p.parent/value
        if not target.exists():broken.append({'file':p.relative_to(ROOT).as_posix(),'target':value})
packages=[]
for package in ['character-poses-20261025','frame-review-20261025']:
    folder=ROOT/'exports'/package
    with zipfile.ZipFile(ROOT/'exports'/(package+'.zip')) as z:
        entries=[i for i in z.infolist() if not i.is_dir()]
        ok=all((folder/i.filename).is_file() and (folder/i.filename).read_bytes()==z.read(i) for i in entries)
        packages.append({'name':package,'files':len(entries),'matches':ok})
manifest=json.loads((ROOT/'exports/character-poses-20261025/characters.json').read_text(encoding='utf-8'))
for person in manifest['people']:
    for frame in person['frames']:
        for key in ['file','sourceFile']:
            if not (ROOT/'exports/character-poses-20261025'/frame[key]).exists():missing.append(frame[key])
result={'passed':not(missing or bad_images or source_changed or bad_data or broken) and all(p['matches'] for p in packages),'original_file_count':len(mapping),'all_original_files_preserved':not missing,'archived':execution['archived'],'image_keys_unchanged':len(assets),'missing':missing,'bad_images':bad_images,'changed_game_sources':source_changed,'bad_published_data':bad_data,'broken_markdown_links':broken,'packages':packages}
(ROOT/'reports/qa/organization-integrity.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False))
if not result['passed']:raise SystemExit(1)
