"""Read-only project inventory; writes review documents only in this directory."""
from pathlib import Path
from collections import defaultdict, Counter
import ast, base64, csv, hashlib, io, json, re, zipfile

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
ENTRY = 'outputs/潇湘馆-庭院与内室-模块03.html'
STAMP = '2026-10-26'
FILES = sorted(p for p in ROOT.rglob('*') if p.is_file() and OUT not in p.parents)
DIRS = sorted(p for p in ROOT.rglob('*') if p.is_dir() and p != OUT and OUT not in p.parents and p != OUT.parent)
rel = lambda p: p.relative_to(ROOT).as_posix()
sha = lambda data: hashlib.sha256(data).hexdigest()
hashes = {rel(p): sha(p.read_bytes()) for p in FILES}
sizes = {rel(p): p.stat().st_size for p in FILES}
html = (ROOT / ENTRY).read_text(encoding='utf-8')
decoder = json.JSONDecoder()
def constant(name):
    m = re.search(r'\bconst\s+' + name + r'\s*=\s*', html)
    if not m: raise ValueError('Missing published constant: ' + name)
    return decoder.raw_decode(html, m.end())[0]
embedded = constant('ASSET_DATA')
embedded_hashes = {k: sha(base64.b64decode(v.split(',', 1)[1])) for k, v in embedded.items()}

# Parse literal build inputs without importing or executing the mutating builder.
build_text = (ROOT/'work/build-spring.py').read_text(encoding='utf-8-sig')
tree = ast.parse(build_text)
build_assets = {}
for node in tree.body:
    if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'files' for t in node.targets):
        build_assets.update(ast.literal_eval(node.value))
    if isinstance(node, ast.If):
        for child in node.body:
            if isinstance(child, ast.Assign) and isinstance(child.targets[0], ast.Subscript):
                build_assets['spring-objects'] = ast.literal_eval(child.value)
    if isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
        call = node.value
        if isinstance(call.func, ast.Attribute) and isinstance(call.func.value, ast.Name) and call.func.value.id == 'files' and call.func.attr == 'update':
            arg = call.args[0]
            if isinstance(arg, ast.Dict): build_assets.update(ast.literal_eval(arg))
            elif isinstance(arg, ast.DictComp) and isinstance(arg.generators[0].iter, ast.List):
                for name in ast.literal_eval(arg.generators[0].iter): build_assets[name] = name + '.png'
build_assets = {k: 'assets/' + v for k, v in build_assets.items()}
room_path = 'assets/xiaoxiang-indoor-repaired/scene.json'
art_path = 'assets/npcs/art.json'
content_path = 'src/data/npc-content.json'
room = json.loads((ROOT/room_path).read_text(encoding='utf-8-sig'))
art = json.loads((ROOT/art_path).read_text(encoding='utf-8-sig'))
build_assets.update({k:v['file'] for k,v in room['assets'].items()})
build_assets.update({'npc-'+k:v['file'] for k,v in art.items()})
asset_keys = defaultdict(list)
for key, path in build_assets.items(): asset_keys[path].append(key)
checks = {key: hashes.get(path) == embedded_hashes.get(key) for key,path in build_assets.items()}
source_paths = ['src/rendering/scene-layers.js','src/xiaoxiang.js','src/interior-extension.js'] + sorted(rel(p) for p in (ROOT/'src/features').glob('*.js'))
source_checks = {path:(ROOT/path).read_text(encoding='utf-8-sig') in html for path in source_paths}
data_checks = {path:constant(name)==json.loads((ROOT/path).read_text(encoding='utf-8-sig')) for path,name in [(room_path,'XIAO_LAYER_SCENE'),(art_path,'NPC_ART'),(content_path,'NPC_CONTENT')]}
active = set(asset_keys) | set(source_paths) | set(data_checks) | {ENTRY,'src/xiaoxiang.template.html','work/build-spring.py','work/audit_scene_assets.py','src/data/scene-art-contract.json'}
same_hash = defaultdict(list)
for path,digest in hashes.items(): same_hash[digest].append(path)

# References are evidence, not a liveness decision. Legacy scripts and provenance
# documents may name a file that is no longer used by the published game.
texts = {}
for p in FILES:
    if p.suffix.lower() in {'.md','.txt','.json','.py','.js','.cjs','.html'} and sizes[rel(p)] < 4_000_000:
        texts[rel(p)] = p.read_text(encoding='utf-8-sig',errors='replace').replace('\\\\','/').replace('\\','/')
def references(path):
    name = Path(path).name
    result=[]
    for other,text in texts.items():
        if other == path: continue
        relative_local = None
        try: relative_local = str((ROOT/path).relative_to((ROOT/other).parent)).replace('\\','/')
        except ValueError: pass
        if path in text or (relative_local and relative_local in text): result.append(other)
        elif name != 'README.md' and len(name)>12 and name in text: result.append(other+'（仅文件名匹配）')
    return result

names = {
'美术素材包':'art-source','01-第一批标杆图':'reference-batch-01','02-第二批标杆图':'reference-batch-02','03-角色单卡':'character-cards','04-早期设计参考':'early-concepts','05-潇湘馆室内':'xiaoxiang-indoor-reference','06-月洞门外':'south-path-reference','潇湘馆内室_透明素材_第一批':'xiaoxiang-indoor-delivery-01',
'林黛玉':'daiyu','薛宝钗':'baochai','贾宝玉':'baoyu','三人角色动作素材':'character-poses-20261025','潇湘馆-比例调整素材包':'frame-review-20261025','原始分层素材':'source-layers','其他住所对照':'other-residences','潇湘馆内室_第二批_墙体地面与原版床_待对位':'xiaoxiang-indoor-delivery-02',
'素材说明.txt':'asset-notes.txt','README.txt':'readme.txt','原始动作图.png':'action-source.png','人物动作预览.html':'pose-preview.html','使用说明.md':'usage.md','制作提示词.json':'generation-prompts.json','先看这里.md':'readme.md','当前室内布局坐标.json':'indoor-layout-legacy.json',
'01_庭院_当前合成图_960x650.png':'courtyard-composite-legacy-960x650.png','02_室内_当前合成图_960x600.png':'indoor-composite-legacy-960x600.png','03_人物大小参考_不需要修改.png':'character-scale-reference.png','蘅芜苑室内_1672x941.png':'hengwu-indoor-reference-1672x941.png','怡红院室内_1672x941.png':'yihong-indoor-reference-1672x941.png',
'补充物件图集.png':'spring-objects.png','潇湘馆正房.png':'xiaoxiang-house.png','当前墙体与月洞门.png':'moon-wall-source.png','庭院地面.png':'courtyard-ground.png','室内空房底图.png':'indoor-shell.png','室内家具图集_含原蓝白纱帐床.png':'furniture-atlas-blue-canopy-bed.png',
'本轮修补记录.md':'repair-notes.md','Codex接入反馈.md':'integration-feedback.md','Codex验收记录.json':'acceptance-record.json','Codex检查.json':'asset-check.json','Codex对位反馈.md':'alignment-feedback.md','验收结论.md':'review-result.md',
'场景透明与分层检查.json':'scene-art-audit.json','人物入驻-实现与原著出处.md':'npc-implementation-and-sources.md','人物入驻-素材检查与补图要求.md':'npc-art-review.md','人物入驻-收尾验收.md':'npc-closeout.md','美术交接-春日互动素材需求.md':'spring-interaction-art-request.md','美术交接-蘅芜苑简素内室.md':'hengwu-indoor-art-request-legacy.md','美术交接-其他场景补图要求.md':'remaining-scenes-art-request.md','美术交接-全场景透明分层.md':'scene-layer-art-request.md',
'林黛玉-四向透明图.png':'daiyu-four-directions-export.png','潇湘馆-标题与存档-实测.png':'xiaoxiang-title-save.png','潇湘馆-房门互动.png':'xiaoxiang-door.png','潇湘馆-恢复室内陈设-实测.png':'xiaoxiang-restored-furnishings.png','潇湘馆-诗笺阅读-实测.png':'xiaoxiang-poem-reader.png','潇湘馆-实测.png':'xiaoxiang-courtyard-legacy.png','潇湘馆-室内布置-实测.png':'xiaoxiang-furnishings-legacy.png','潇湘馆-书案互动-实测.png':'xiaoxiang-desk.png','潇湘馆-透明分层内室-实测.png':'xiaoxiang-layered-indoor.png','潇湘馆-心语互动-实测.png':'xiaoxiang-reflections.png','潇湘馆-葬花互动-实测.png':'xiaoxiang-flower-burial.png',
'NPC-潇湘馆访客.png':'npc-xiaoxiang-visitors.png','NPC-原著话题互动.png':'npc-topic-dialogue.png','NPC-hengwu-入驻.png':'npc-hengwu-residents.png','NPC-yihong-入驻.png':'npc-yihong-residents.png',
'01-地形贴图集.png':'01-terrain-atlas.png','02-建筑贴图集.png':'02-building-atlas.png','03-室内家具集.jpg':'03-furniture-reference.jpg','04-四角色精灵集.jpg':'04-character-reference.jpg','05-UI套件.jpg':'05-ui-reference.jpg','06-潇湘馆庭院场景.jpg':'06-xiaoxiang-courtyard-reference.jpg','07-潇湘馆室内场景.jpg':'07-xiaoxiang-indoor-reference.jpg',
'01-地形集.png':'01-terrain-atlas.png','02-植物景物集.png':'02-plants-reference.png','03-UI套件.jpg':'03-ui-reference.jpg','04-物品特效集.jpg':'04-items-effects-reference.jpg','05-八人角色roster.jpg':'05-character-roster.jpg',
'01-探春.png':'01-tanchun-card.png','02-妙玉.png':'02-miaoyu-card.png','03-王熙凤.png':'03-xifeng-card.png','04-史湘云.png':'04-xiangyun-card.png','05-林黛玉.png':'05-daiyu-card.png','06-薛宝钗.png':'06-baochai-card.png','07-贾宝玉.png':'07-baoyu-card.png','08-惜春.png':'08-xichun-card.png',
'01-像素标牌图.png':'01-pixel-sign-reference.png','02-水系环湖图.png':'02-lake-map-reference.png','03-开发板一.png':'03-development-board.png','04-开发板二.png':'04-development-board.png',
'01_潇湘馆室内素材_地面与结构.png':'01-floor-and-structure.png','02_潇湘馆寝具素材图鉴.png':'02-bedding-reference.png','03_潇湘馆书案文房素材图集.png':'03-desk-and-stationery.png','04_潇湘馆古风书架卷轴素材图.png':'04-shelves-and-scrolls.png','05_潇湘馆茶具与会客素材图.png':'05-tea-and-seating.png','06_潇湘馆雅致陈设素材图.png':'06-decor-reference.png','07_潇湘馆灯具与装饰素材图.png':'07-lamps-and-decor.png','08_潇湘馆可交互室内素材图谱.png':'08-interactive-items.png','09_潇湘馆室内总览图.png':'09-indoor-overview.png',
'沁芳溪水岸像素素材表.png':'qinfang-stream-reference.png','像素风庭院地形瓦片集.png':'courtyard-terrain-atlas.png','像素花园植物图鉴图纸.png':'garden-plants-reference.png','中式园林像素资产图鉴.png':'garden-props-reference.png','中式园林月洞门像素素材图.png':'moon-gate-reference.png',
'shitouji-sheji-fangan.pdf':'original-game-design.pdf'
}
tokens={'floor':'地面','rug':'地毯','bed':'床榻','desk':'书案','chair':'椅','stool':'凳','tea':'茶桌/茶具','qin':'古琴','screen':'屏风','shelf':'书柜','lamp':'灯','door':'门扇','wall':'墙体','planter':'盆栽','ground':'地面','house':'建筑','terrain':'地形','plant':'植物','decor':'陈设','baoyu':'宝玉','baochai':'宝钗','daiyu':'黛玉','xiren':'袭人','xifeng':'熙凤','xichun':'惜春','xiangyun':'湘云','tanchun':'探春','miaoyu':'妙玉','jiamu':'贾母','wangfuren':'王夫人'}
feature_names={1:'存档基础、题页和公共UI',2:'黛玉三层话题',3:'原著诗笺阅读',4:'葬花时间事件与四种经历',5:'抚琴/写诗/品茶等活动及Web Audio琴声',6:'花瓣和图鉴收集',7:'循环春日日期/时辰',8:'场景物件互动',9:'自动保存与UI接线',10:'坐卧/起身和靠近家具交互',11:'南向园路保留实现（当前关闭）',12:'月洞门墙体实现（园路仍关闭）',13:'三处住所及场景配置',14:'三档缩放和视口',15:'住所切换及宽屏庭院',16:'住所内室座位与床榻',17:'浏览器画幅适配',18:'潇湘馆宽屏图与坐标（室内渲染已由19覆盖）',19:'潇湘馆透明内室排序与基座',20:'补回10处次要陈设/调查',21:'10位NPC作息/移动/话题/小事/补读/存档'}
def purpose(path):
    name=Path(path).name
    if path==ENTRY: return '当前发布游戏；图片/脚本/配置内嵌的单文件入口'
    if path in source_paths:
        label=feature_names.get(int(name[:2])) if path.startswith('src/features/') else {'src/xiaoxiang.js':'基础场景、人物与循环','src/interior-extension.js':'原室内系统接口','src/rendering/scene-layers.js':'统一地面/基座遮挡排序'}.get(path,Path(path).stem)
        return '当前游戏源码：'+label
    exact={room_path:'当前潇湘馆内室素材/摆放/基座/交互配置',art_path:'当前10人精灵帧与源图配置',content_path:'当前10人话题/20段小事及原著出处','src/data/scene-art-contract.json':'构建审计使用的全局美术契约（部分路径已过时）','src/xiaoxiang.template.html':'当前HTML界面/样式/资源占位模板','work/build-spring.py':'当前发布构建器；运行会覆盖当前入口','work/audit_scene_assets.py':'当前构建导入的Alpha检查和全局审计工具','AGENTS.md':'项目约定与授权，自动识别的固定文件名','README.md':'项目说明及历史开发阶段','HANDOFF.md':'当前进度、有效素材与交接记录'}
    exact['assets/7a9ccf645231fa69b05830cc23c4edb5.png']='用户明确批准的蘅芜苑简素内室原始交图；与hengwu-indoor.png字节相同，保留母图身份'
    exact['assets/baoyu-actions-v1.png']='宝玉动作母图；当前行走补帧和三人素材导出包的来源'
    exact['assets/baochai-actions-v1.png']='宝钗动作母图；当前行走补帧和三人素材导出包的来源'
    if path in exact: return exact[path]
    if path in asset_keys:
        labels=[v for k,v in tokens.items() if k in name.lower()]
        return '当前打包图像：'+('/'.join(dict.fromkeys(labels)) or ', '.join(asset_keys[path]))
    if name.endswith('.pyc'): return 'Python可重建的解释器缓存'
    if path.startswith('work/'):
        if name.endswith('-mobile.png'):return '早期手机布局测试截图（当前仅电脑浏览器）'
        if name.startswith('qa-'):return '浏览器验收脚本；'+('本次人物收尾复用' if name in ['qa-npcs.cjs','qa-npc-motion.cjs','qa-npc-room-regression.cjs'] else '历史模块检查，未证明仍适合现版本')
        if name.endswith('.json'):return '验收结果/交接快照：'+name
        if name=='build-interior.py':return '历史模块03构建器，缺旧architecture素材，且会覆盖当前入口'
        if name=='build-xiaoxiang.py':return '历史模块02构建器，缺旧architecture素材，生成两个旧HTML'
        if name=='build-characters.py':return '三人动作素材导出包的制作工具'
        if name=='restore-room-decor.py':return '从现有图集恢复10处次要陈设的配置制作工具'
        if name=='prepare-layer-handoff.py':return '美术清单/契约生成工具，正文含旧阶段状态，保留待核对'
        return '人物内容或美术数据的准备/溯源工具：'+name
    if path.startswith('outputs/三人角色动作素材'):
        return '独立交付的三人动作素材包：'+name+'；供预览/导出，非当前游戏输入'
    if path.startswith('outputs/潇湘馆-比例调整素材包'):
        return '旧画幅调整交付包：'+name+'；包含960尺度历史布局，不作当前布局依据'
    if path.startswith('outputs/playwright/'):return '2026-10-26人物收尾的桌面浏览器回归截图'
    if name.endswith('.html'):return '历史游戏或独立预览HTML；不是当前入口'
    if name.endswith('.zip'):return '用户交付/导出素材压缩包，目录内容见ZIP盘点；是否继续保留待确认'
    if name.endswith('.pdf'):return '最初设计方案；后续已多次调整，保留文献溯源'
    if '/incoming-transparent-20261026/' in path:return '第二批墙地/原床交付或审核记录；后续修补版本已另行接入'
    if '/incoming-transparent-20261025/xiaoxiang-courtyard/' in path:return '庭院透明分割草稿/审核；本场景尚未正式转换，不可当废弃物清理'
    if '/incoming-transparent-20261025/xiaoxiang-indoor-draft/' in path:return '内室首轮透明草稿/配置；部分同包单件仍在用，剩余保留溯源'
    if '/xiaoxiang-indoor-repaired/' in path:
        return '内室修补'+('旧草稿，已有后继正式版' if '-draft' in name else '验收/版本溯源资料：'+name)
    if '/npcs/' in path:return 'NPC来源/透明检查/使用说明：'+name
    if path.startswith('美术素材包/') or path.startswith('%'):
        return '美术原件/参考图：'+name+'；不因未打包而认定废弃'
    if path.startswith('outputs/') and name.endswith('.png'):return '截图/导出参考：'+name+'；旧图可能仍是验收或母图依据'
    if name.endswith('.md'):return '交接/美术需求或验收说明：'+name
    if name.endswith('.json'):return '场景审计或数据记录：'+name
    if path.startswith('assets/'):
        return '未作为独立文件打包的原画/导出图：'+name+'；可能供母图或工具复用'
    return '用途需人工确认：'+name

def target(path):
    if path in {ENTRY,'AGENTS.md','README.md','HANDOFF.md'}:return path
    if path=='shitouji-sheji-fangan.pdf':return 'docs/reference/original-game-design.pdf'
    if path.startswith('src/'):return path
    if path.startswith('work/'):
        name=Path(path).name
        if name.endswith('.cjs'):return 'tools/qa/'+name
        if name.endswith('.py'):return 'tools/build/'+name.replace('-','_')
        if name.endswith('.json'):return 'reports/qa/'+name.replace('_','-')
        return 'reports/screenshots/legacy/'+name
    if path.startswith('assets/xiaoxiang-indoor-repaired/'):
        name=names.get(Path(path).name,Path(path).name)
        if name=='scene.json':return 'assets/scenes/xiaoxiang/indoor/scene.json'
        if name.endswith('.png'):
            # Versions stay in provenance; active filenames express function.
            name=re.sub(r'-v\d+(?=\.)','',name)
            return 'assets/scenes/xiaoxiang/indoor/textures/'+name
        return 'docs/art-provenance/xiaoxiang-indoor/'+name
    if path.startswith('美术素材包/潇湘馆内室_透明素材_第一批/') and path in asset_keys:
        return 'assets/scenes/xiaoxiang/indoor/textures/'+Path(path).name
    if path.startswith('assets/incoming-transparent-20261025/xiaoxiang-indoor-draft/') and path in asset_keys:
        n='tea-chair-north.png' if Path(path).name=='study-chair.png' else Path(path).name
        return 'assets/scenes/xiaoxiang/indoor/textures/'+n
    if path.startswith('assets/npcs/'):
        if path==art_path:return 'assets/characters/npcs/art.json'
        if '/source/' in path and Path(path).suffix in {'.webp','.png'}:return 'assets/characters/npcs/textures/'+Path(path).name
        return 'docs/art-provenance/npcs/'+Path(path).name
    if path.startswith('assets/incoming-transparent-'):
        parts=path.split('/');date=parts[1].split('-')[-1]
        return '/'.join(['art-source','deliveries',date]+[names.get(x,x.replace('_','-')) for x in parts[2:]])
    if path.startswith('assets/'):
        n=Path(path).name
        if n=='7a9ccf645231fa69b05830cc23c4edb5.png':return 'art-source/scenes/hengwu/indoor-approved-source.png'
        if n.startswith('daiyu-'):return 'assets/characters/daiyu/'+n
        if n.startswith(('baoyu-','baochai-')):return 'art-source/characters/'+n
        for home in ['xiaoxiang','hengwu','yihong']:
            if n.startswith(home+'-'):return 'assets/scenes/'+home+'/references/'+n
        if n.startswith('outer-'):return 'assets/scenes/south-path/'+n
        if n.startswith('interior-'):return 'assets/scenes/xiaoxiang/legacy/'+n
        if n=='spring-objects.png':return 'assets/scenes/shared/'+n
        return 'art-source/unidentified/'+n
    if path.startswith('美术素材包/'):
        return '/'.join(names.get(x,x.replace('_','-')) for x in path.split('/'))
    if path.startswith('outputs/三人角色动作素材/') or path.startswith('outputs/潇湘馆-比例调整素材包/'):
        return '/'.join(['exports']+[names.get(x,x.replace('_','-')) for x in path.split('/')[1:]])
    if path=='outputs/三人角色动作素材.zip':return 'exports/character-poses-20261025.zip'
    if path=='outputs/潇湘馆-比例调整素材包.zip':return 'exports/frame-review-20261025.zip'
    if path.startswith('outputs/playwright/'):return path.replace('outputs/playwright/','reports/screenshots/')
    if path.startswith('outputs/'):
        n=names.get(Path(path).name,Path(path).name)
        if n.endswith('.md'):return 'docs/'+('art-requests/' if n.endswith('request.md') or 'art-request-' in n else 'implementation/')+n
        if n.endswith('.json'):return 'reports/art/'+n
        if n.endswith('.png'):return 'reports/screenshots/'+n
        if n.endswith('.html'):return 'art-source/legacy-demos/'+('xiaoxiang-player-module02.html' if '模块02' in n else 'xiaoxiang-player-revision.html')
    if path.startswith('石头记_'):return 'art-source/legacy-demos/grand-view-garden-stage02-building-orientation.html'
    return 'art-source/unidentified/'+names.get(Path(path).name,Path(path).name)

archive_rules={
'outputs/潇湘馆-林黛玉-模块02.html':'旧模块02演示，被当前模块21入口替代；与另一旧HTML字节一致',
'outputs/潇湘馆-林黛玉-人物修订版.html':'旧人物修订演示，被当前模块21入口替代；与旧模块02字节一致',
'work/build-xiaoxiang.py':'仅服务旧模块02；当前不导入，引用已不存在的xiaoxiang-architecture.png',
'work/build-interior.py':'仅服务旧室内阶段；当前不导入，缺旧素材且会覆盖当前正式入口',
}
draft_successors={
'decor-atlas-v1-draft.png':'decor-atlas-v2.png','floor-v1-draft.png':'floor-v2.png',
'wall-south-left-v1-draft.png':'wall-south-left-v2.png','wall-south-right-v1-draft.png':'wall-south-right-v1.png'}
rows=[]
for p in FILES:
    path=rel(p);refs=references(path);others=[q for q in same_hash[hashes[path]] if q!=path]
    reason=archive_rules.get(path,'')
    if path.startswith('%'):
        canon=[q for q in others if q.startswith('美术素材包/05-潇湘馆室内/')]
        if canon: reason='URL编码重复目录；SHA256与保留的原件完全一致：'+canon[0]
    if '/__pycache__/' in path:reason='可重建Python缓存；非当前HTML资源/构建源输入'
    if path.startswith('work/') and p.name.endswith('-mobile.png'):reason='早期手机测试残留；当前电脑浏览器范围已明确'
    if path.startswith('assets/xiaoxiang-indoor-repaired/') and p.name in draft_successors:
        successor='assets/xiaoxiang-indoor-repaired/'+draft_successors[p.name]
        if successor in asset_keys:reason='旧修补草稿，已被当前实际打包的'+successor+'取代'
    # Source provenance and exports are deliberately conservative even when byte-identical.
    if path in active and reason:raise ValueError('Active file was incorrectly proposed for archive: '+path)
    if path==ENTRY:published='当前发布入口'
    elif path in asset_keys:published='是：图片已内嵌；SHA256逐项一致' if all(checks[k] for k in asset_keys[path]) else '构建引用；与发布HTML不一致，需核对'
    elif path in source_paths:published='是：源码正文内嵌' if source_checks[path] else '构建引用；正文不同需核对'
    elif path in data_checks:published='是：JSON配置内嵌且内容一致' if data_checks[path] else '构建引用；配置不同需核对'
    elif path=='src/xiaoxiang.template.html':published='间接：当前HTML界面模板（不是运行时外部文件）'
    elif path in active:published='间接：构建/审计依赖，运行HTML不外部读取'
    else:published='否：非当前发布输入/外部请求'
    if reason:decision='建议归档';proposed='_archive/20261026/'+path
    elif path in active or path in {'AGENTS.md','README.md','HANDOFF.md'}:decision='保留';proposed=target(path)
    else:decision='拿不准，保留待定';proposed=target(path)
    rows.append(dict(path=path,bytes=sizes[path],sha256=hashes[path],purpose=purpose(path),published=published,embedded_keys=asset_keys.get(path,[]),references=refs,duplicates=others,decision=decision,reason=reason or ('当前游戏/构建/约定必需' if decision=='保留' else '未证明是废弃、重复或测试残留；用途见说明'),proposed=proposed))

# Unknown UUID/encoded ZIP file names are intentionally left for identity confirmation.
for row in rows:
    if row['decision']=='建议归档':continue
    if Path(row['path']).suffix=='.zip' and ('BAE6' in row['path'] or 'BDE698' in row['path']):
        row['proposed']='art-source/deliveries/'+('npc-sprites-20261026.zip' if Path(row['path']).name.startswith('BAE6') else 'indoor-art-delivery-unidentified.zip')

proposed_groups=defaultdict(list)
for row in rows:proposed_groups[row['proposed'].casefold()].append(row['path'])
collisions={k:v for k,v in proposed_groups.items() if len(v)>1}
if collisions:raise ValueError('Proposed destination collisions: '+json.dumps(collisions,ensure_ascii=False))
invalid=[r['proposed'] for r in rows if r['decision']!='建议归档' and r['path'] not in {ENTRY,'AGENTS.md','README.md','HANDOFF.md'} and not re.fullmatch(r'[A-Za-z0-9_./-]+',r['proposed'])]

zip_records=[]
for p in FILES:
    if p.suffix!='.zip':continue
    try:
        with zipfile.ZipFile(p) as z:
            items=[i for i in z.infolist() if not i.is_dir()]
            matching=sum(sha(z.read(i)) in same_hash for i in items)
            zip_records.append(dict(path=rel(p),files=len(items),matching_unpacked_files=matching,total_uncompressed=sum(i.file_size for i in items)))
    except zipfile.BadZipFile:zip_records.append(dict(path=rel(p),error='无法解析ZIP，保留待用户确认'))

def md(value):return str(value).replace('|','\\|').replace('\n',' ')
def write(name,text):(OUT/name).write_text(text,encoding='utf-8')
def table(headers,values):return '\n'.join(['|'+'|'.join(headers)+'|','|'+'|'.join(['---']*len(headers))+'|']+['|'+'|'.join(md(v) for v in line)+'|' for line in values])
def bullet_paths(paths):return '<br>'.join('`'+x+'`' for x in paths) or '无'

new_files=['README.md','inventory.md','files.csv','rename-plan.md','archive-plan.md','needs-review.md','file-tree.txt','reference-evidence.json','build_inventory.py']
total=sum(sizes.values());archive=[r for r in rows if r['decision']=='建议归档'];review=[r for r in rows if r['decision']=='拿不准，保留待定'];renames=[r for r in rows if r['decision']!='建议归档' and r['proposed']!=r['path']]
folder_rows=[]
folder_plan=[]
def folder_info(dp):
    if dp.startswith('%'):return '早期室内8图重复交付目录（8张图同SHA，说明文本不同）','8图归档，说明文本待定；不整目录移动'
    if dp.startswith('src'):return '当前源码/玩法模块/内容数据/公共渲染器，按子目录分工','保留 '+dp
    if dp.startswith('assets/xiaoxiang-indoor-repaired'):return '当前透明内室纹理及配置、修补溯源混放','拆分到assets/scenes/xiaoxiang/indoor/与docs/art-provenance/'
    if dp.startswith('assets/npcs'):return 'NPC帧配置、在用精灵与来源检查数据','拆分到assets/characters/npcs/与docs/art-provenance/npcs/'
    if dp.startswith('assets/incoming-transparent-20261025/xiaoxiang-indoor-draft'):return '内室首轮交图，7份源文件当前在用，其他仍作草稿溯源','在用单件移assets/scenes/xiaoxiang/indoor/textures/；原稿待定'
    if dp.startswith('assets/incoming-transparent'):return '原始透明交付、审核与部分未完成的草稿素材','非在用文件拟art-source/deliveries/；默认待定保留'
    if dp=='assets':return '场景/角色原图与在用素材、原交付包的混合根目录','在用按scenes/characters归类，原交付按art-source归类'
    if dp.startswith('outputs/playwright'):return '人物收尾的浏览器截图证据','拟reports/screenshots/npc-closeout/'
    if dp.startswith('outputs/三人角色动作素材'):return '独立三人动作导出/预览包，不是当前游戏运行输入','拟exports/character-poses-20261025/；整体用途待确认'
    if dp.startswith('outputs/潇湘馆-比例调整素材包'):return '旧960布局的画幅/比例调整导出和母图对照包','拟exports/frame-review-20261025/；整体用途待确认'
    if dp=='outputs':return '正式入口、历史HTML、导出包、截图与说明混放','正式入口保持；其余分别拟exports/reports/docs或_archive'
    if dp.endswith('__pycache__'):return 'Python解释器自动缓存','拟_archive/20261026/'+dp
    if dp=='work':return '当前/旧构建工具、素材准备脚本、验收脚本及结果混放','按tools/build、tools/qa、reports分拆，旧构建器归档'
    if dp=='美术素材包':return '原始交付、设计参考，另含8份当前被引用的透明素材','在用单件单独移assets；原件拟art-source/'
    if dp.startswith('美术素材包/潇湘馆内室_透明素材_第一批'):return '内室透明家具首批交付，8份文件当前在用','在用单件移assets/scenes/xiaoxiang/indoor/textures/；其余待定'
    return '美术参考/母图/原件分组，'+dp.split('/')[-1],'/'.join(names.get(x,x) for x in dp.split('/'))+'（待确认）'
for d in DIRS:
    dp=rel(d);children=[r for r in rows if r['path'].startswith(dp+'/')]
    count=sum(r['path'] in active for r in children)
    use,destination=folder_info(dp)
    folder_rows.append((dp,use,len(children),f'{count}个当前发布/构建输入'))
    folder_plan.append((dp,use,destination))
write('inventory.md','# 全量盘点\n\n基准快照：2026-10-26，生成报告前的'+str(len(FILES))+'个文件、'+str(len(DIRS))+'个子文件夹，'+str(total)+'字节（'+f'{total/1024/1024:.2f}'+'MiB）。隐藏文件/缓存也已列出；未跟随压缩包解压。新增审计报告另列在文末。\n\n“否”只表示不是当前发布输入，不能单凭此判为可清理。图片通过当前构建映射和发布HTML内嵌字节双向核对；旧图即使仅用于已关闭代码，只要仍打包就保留。详细路径引用和重复SHA见files.csv及reference-evidence.json。\n\n## 全部目录\n\n'+table(['目录','下属文件数','当前使用情况','处理原则'],folder_rows)+'\n\n## 全部文件\n\n'+table(['原路径','用途','当前HTML引用情况','建议'],[(r['path'],r['purpose'],r['published'],r['decision']) for r in rows])+'\n\n## ZIP内容核对（只读）\n\n'+table(['ZIP','内部文件','能在磁盘找到同SHA的项','说明'],[(z['path'],z.get('files','未知'),z.get('matching_unpacked_files','未知'),'不是清理许可：原始交付或导出用途仍需确认') for z in zip_records])+'\n\n## 本次新增的盘点文件\n\n以下仅为本次审批资料，均非游戏输入，需保留：\n\n'+ '\n'.join('- `docs/project-audit/'+n+'`' for n in new_files)+'\n\n新增目录为`docs/`、`docs/project-audit/`。报告自身不递归统计。\n')
write('file-tree.txt','D:/AIcoding/red dream/\n'+'\n'.join('  '*len(p.relative_to(ROOT).parts)+p.name+('/' if p.is_dir() else '') for p in sorted(list(FILES)+DIRS))+'\n\n[新增审计目录]\ndocs/\n  project-audit/\n'+ '\n'.join('    '+n for n in new_files)+'\n')
with (OUT/'files.csv').open('w',encoding='utf-8-sig',newline='') as f:
    cols=['path','purpose','published','decision','reason','proposed','bytes','sha256','embedded_keys','references','duplicates'];writer=csv.DictWriter(f,fieldnames=cols);writer.writeheader()
    for row in rows:writer.writerow({k:json.dumps(row[k],ensure_ascii=False) if isinstance(row[k],list) else row[k] for k in cols})
evidence=dict(date=STAMP,entry=ENTRY,entry_sha256=hashes[ENTRY],initial_files=len(FILES),initial_directories=len(DIRS),initial_bytes=total,embedded_image_keys=len(embedded),build_image_paths=len(asset_keys),image_checks=checks,unmapped_published_keys=sorted(set(embedded)-set(build_assets)),source_checks=source_checks,data_checks=data_checks,external_asset_links=re.findall(r'<(?:script|img|audio|source|link)\b[^>]*?(?:src|href)=[\"\']([^\"\']+)',html,re.I),audio_files=[rel(p) for p in FILES if p.suffix.lower() in {'.mp3','.wav','.ogg','.flac','.m4a'}],audio_implementation='src/features/05-activities.js: Web Audio合成拨弦，无独立音乐文件',duplicates=[v for v in same_hash.values() if len(v)>1],zips=zip_records,rows=rows,proposed_path_collisions=collisions,unresolved_non_ascii_targets=invalid)
write('reference-evidence.json',json.dumps(evidence,ensure_ascii=False,indent=2))
write('archive-plan.md','# 清理清单（仅建议，尚未执行）\n\n以下'+str(len(archive))+'项均不在当前游戏/构建输入集合内，且有明确旧版、重复、草稿后继或测试缓存证据。总计'+f'{sum(r["bytes"] for r in archive)/1024/1024:.2f}'+'MiB；同意后只移动到_archive，不永久删除。归档内保留原相对路径与旧名，便于恢复；引用它们的溯源文档/旧工具需同步处理。\n\n'+table(['原路径','未引用依据及清理理由','归档位置','已知文档/工具引用'],[(r['path'],r['published']+'；'+r['reason'],r['proposed'],bullet_paths(r['references'])) for r in archive])+'\n\n其他未打包素材、历史截图、交付ZIP、独立素材导出包都没有自动算作垃圾，见待定清单。\n')
write('needs-review.md','# 拿不准清单（默认全部不动）\n\n需要明确决定的几类：\n\n- U01 当前游戏入口：建议保留原路径`'+ENTRY+'`。它是项目指定入口，移动/改名可能影响file协议的浏览器存档与既有链接；若要统一为`outputs/game/index.html`，需先导出存档、验证迁移，并明确批准入口改名。\n- U02 项目根目录`red dream`含空格：建议本轮保持，避免影响Codex项目工作目录和脚本绝对路径。若要求改为`red-dream`，需单独确认，并在应用中重新关联目录。\n- U03 旧“阶段2_建筑朝向Bug修订版”根目录HTML：不是当前入口，但未证明其独有内容全部被新版替代，先保留。\n- U04 原始ZIP、早期设计参考、未通过审核的庭院稿：可能仍用于来源留档或后续施工；压缩内容SHA相同也不足以确定用户不再需要原始包。\n- U05 三人动作导出包和旧比例调整导出包：由此前明确需求产出，虽不是游戏输入，不能凭未引用就清理；是否整体归档请决定。\n- U06 UUID命名角色图片及编码ZIP：实际身份/版本不确定，暂保留原名；暂拟unidentified分类，确认身份后再取最终功能名。\n- U07 测试脚本/结果和历史验收截图：保留验收证据；移动到tools/reports仅属命名整理，默认不清理。\n- U08 手工素材来源与可重建导出：存在部分相同SHA副本，但应明确哪个副本承担母图/原始交付职责；未列入清理清单的副本全部保留。\n\n下表逐一列出未能同时证明“未使用”和“废弃/重复/残留”的'+str(len(review))+'个文件。默认处理是保留；建议新路径仅为可选命名计划，不代表已批准移动。\n\n'+table(['原路径','用途/待定原因','可选整理路径','完全相同的其他文件'],[(r['path'],r['purpose'],r['proposed'],bullet_paths(r['duplicates'])) for r in review])+'\n')
write('rename-plan.md','# 命名规范与改名清单（待确认）\n\n## 建议规范\n\n- 活跃目录/文件使用英文小写ASCII、数字和连字符；扩展名保留。Python工具遵循snake_case。标准自动识别文件`AGENTS.md`、`README.md`保留原名；HANDOFF.md暂保留兼容入口。\n- 角色用固定拼音ID：daiyu/baoyu/baochai/xiren/xiangyun/tanchun/xichun/xifeng/miaoyu/jiamu/wangfuren；住所用xiaoxiang/yihong/hengwu。\n- 正式素材归`assets/scenes/<住所>/...`、`assets/characters/<角色>/...`；当前内室所有正在使用的单件从incoming和中文素材目录集中到`assets/scenes/xiaoxiang/indoor/textures/`。已使用素材即使原目录叫draft也不能随整目录归档。\n- 原始交图和母图归`art-source/`，派生交付包归`exports/`，文档归`docs/`，构建/素材制作工具归`tools/build/`，浏览器验收脚本归`tools/qa/`，验收结果/截图归`reports/`。\n- 正式运行资源按用途命名，不携带v1/v2/新/最终等版本词；历史版本移至_archive或来源记录。原件交付批次用YYYYMMDD。feature模块01—21序号属于加载顺序，保留。\n- `_archive/YYYYMMDD/<原相对路径>`保留旧名供恢复；不把归档里的旧名当作活跃命名不规范继续改动。\n- U01入口和U02项目根目录默认保留。UUID或身份未确认的原件默认不改名，待用户命名。下面列出的待定文件只提供可选路径，默认先保留。\n\n## 目标目录示意\n\n```text\nassets/characters/\nassets/scenes/\nart-source/\ndocs/\nexports/\ntools/build/\ntools/qa/\nreports/qa/\nreports/screenshots/\noutputs/（保留现有游戏入口）\n_archive/20261026/（原路径留存）\n```\n\n## 必须同步的引用\n\n1. `work/build-spring.py`的root推导（移到tools/build后不能仍使用parent.parent）、模块import、模板/源码/素材/输出路径。\n2. 内室scene.json、NPC art.json、所有准备脚本和全局scene-art-contract.json中真实file字段；只替换已确认存在的路径，不能借整理改写美术验收状态。\n3. 文档Markdown图片和链接、JSON相对图片路径、人物动作预览HTML及导出包manifest；移动后相对路径需重新计算，不能盲目保留失效文本或换成绝对磁盘路径。\n4. QA脚本中的工作根目录、file URL、结果/截图输出位置；工具搬层级后的__dirname/parents也要调整。\n5. 当前发布HTML实际内嵌资源，不存在可简单替换的外部图片URL。更新构建源后重建同一入口，逐键核对图像SHA和场景/人物数据保持一致；保持SAVE_KEY及原入口路径。元数据中旧源路径如需更新也应随构建同步。\n6. 原始交付ZIP默认不改内部内容，避免破坏来源原件；活跃导出包若获准改名，内部manifest/preview也需重写并重新打包，再核对与散文件一致。\n\n“相对路径不变”按保留相对引用方式、保持当前入口位置理解。文件真正移动后引用字面值必然随位置更新；不能同时承诺移动路径又让原相对路径字面值完全不变。U01/U02未确认前不变更。\n\n## 逐文件改名映射\n\n共'+str(len(renames))+'项可选改名/归类。标为待定的先不执行；保留项有固定原名例外。建议归档的文件不在此重复列出，见清理清单。\n\n'+table(['原路径','建议新路径','当前决策'],[(r['path'],r['proposed'],r['decision']) for r in renames])+'\n\n未出现在本表的src/features、src基础文件及标准入口继续保留；完整逐文件目标也在files.csv。\n')
write('README.md','# 项目整理审批清单\n\n**状态：只读盘点完成，等待用户确认；尚未备份、移动、改名、归档、重建或修改游戏。**\n\n基准：'+str(len(FILES))+'个文件，'+str(len(DIRS))+'个子文件夹，'+f'{total/1024/1024:.2f}'+'MiB。新增的本目录9份审计资料不计入基准，已在全量清单中单列。\n\n- [全量文件/目录用途和游戏引用](inventory.md)；[完整目录树](file-tree.txt)；[可筛选CSV](files.csv)。\n- [命名规范与逐项改名映射](rename-plan.md)。\n- [建议清理清单](archive-plan.md)：'+str(len(archive))+'项，仅归档。\n- [拿不准清单](needs-review.md)：'+str(len(review))+'个文件默认保留，另有U01—U08类别决策。\n- [引用/哈希/重复文件证据](reference-evidence.json)。\n\n## 核对方法与发现\n\n发布HTML的'+str(len(embedded))+'个内嵌图像键，对应'+str(len(asset_keys))+'个实际磁盘源文件；全部与构建映射的文件SHA256逐项一致：'+str(all(checks.values()))+'。'+str(len(source_checks))+'份脚本正文匹配：'+str(all(source_checks.values()))+'；3份场景/人物JSON与发布常量内容匹配：'+str(all(data_checks.values()))+'。\n\n当前入口不靠外部图像/音乐文件请求运行；构建源文件仍须保留。未发现独立音乐文件，琴声由src/features/05-activities.js的Web Audio实时合成，整理后需实际点击抚琴并检查音频上下文。原著来源URL是内容出处，不是素材加载地址。\n\n同SHA不等于可直接归档：有些副本承担源图/交付包用途。HTML内嵌但已被后续函数覆盖的资源，仍保守视作当前打包依赖。关闭园路模块11/12仍在当前构建，不列废弃。\n\n未发现本地.git，无法确认已有GitHub仓库地址或推送状态。执行前默认完整复制到项目目录之外的相邻备份目录（建议D:/AIcoding/red-dream-backups/snapshot-20261026-<时间>/red-dream/，避免递归拷贝自身）。若届时可核实已配置仓库及remote，再先推现状；不自行创建新仓库或上传素材。\n\n## 你确认后的执行顺序\n\n1. 先把本次批准范围和U01/U02等选择写成固定清单；默认所有待定文件保持原位。\n2. 完整复制项目到外部备份目录，包括隐藏文件、源码、素材、旧版、导出包和验收记录；比对文件数/大小/SHA256。复制备份成功后才动原目录。备份路径若触发沙箱权限限制，届时只为该复制操作申请系统批准。\n3. 先将批准清理项移动到_archive保留原相对路径，再执行批准的逐项改名；使用映射表检查大小写冲突、目标存在和目录边界。\n4. 更新全部相关源码/构建/配置/HTML/文档/验收/导出包引用。保留发布入口及SAVE_KEY；先将整理前的测试存档导出，回读后验证日期、收集、人物和阅读记录。\n5. 重建并在桌面Chrome实际检查三处住所的庭院/内室（共6场景）行走和房门进出、图像完整加载、人物对话、坐躺、手札/存档、抚琴音频及控制台；同时核对重建图像内容未变。若失败则修正或从备份恢复，再交完成报告。\n\n当前只提交方案，以上后续执行和浏览器验收均未在本轮进行。\n')
inventory_doc=(OUT/'inventory.md').read_text(encoding='utf-8').replace('|目录|下属文件数|当前使用情况|处理原则|','|目录|用途|下属文件数|当前使用情况|')
write('inventory.md',inventory_doc)
rename_doc=(OUT/'rename-plan.md').read_text(encoding='utf-8').replace('## 逐文件改名映射','## 逐目录整理映射\n\n父目录含混合内容时按文件拆分，不直接整目录搬走。\n\n'+table(['原目录','用途','建议归类/处理'],folder_plan)+'\n\n## 逐文件改名映射')
write('rename-plan.md',rename_doc)
print(json.dumps(dict(files=len(FILES),dirs=len(DIRS),mib=round(total/1024/1024,2),images=len(embedded),asset_paths=len(asset_keys),image_checks=all(checks.values()),sources=all(source_checks.values()),data=all(data_checks.values()),archive=len(archive),archive_mib=round(sum(r['bytes'] for r in archive)/1024/1024,2),review=len(review),renames=len(renames),invalid_targets=invalid,external_links=len(evidence['external_asset_links']),reports=[str(OUT/n) for n in new_files]),ensure_ascii=False))
