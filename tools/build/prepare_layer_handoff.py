"""Write a concrete art contract; never manufacture replacement scene art."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[2]
(ROOT/'src/data').mkdir(exist_ok=True)
refs=[]
assets=[]
scene_defs=[
 ('xiaoxiang-courtyard','潇湘馆庭院',1671,941,'assets/scenes/xiaoxiang/references/xiaoxiang-courtyard-wide.png'),
 ('xiaoxiang-indoor','潇湘馆内室',1672,941,'assets/scenes/xiaoxiang/references/xiaoxiang-indoor-wide.png'),
 ('yihong-courtyard','怡红院庭院',1672,1545,'assets/scenes/yihong/references/yihong-courtyard.png'),
 ('yihong-indoor','怡红院内室',1672,941,'assets/scenes/yihong/references/yihong-indoor.png'),
 ('hengwu-courtyard','蘅芜苑庭院',1672,1545,'assets/scenes/hengwu/references/hengwu-courtyard.png'),
 ('hengwu-indoor','蘅芜苑内室',1672,941,'assets/scenes/hengwu/references/hengwu-indoor.png'),
 ('gate-main-road','正门与主路（现有关闭区域，仅整改素材，不开放园路）',960,1580,'assets/scenes/xiaoxiang/references/xiaoxiang-moon-wall-source.png')]

def add(scene,id,label,layer,size=None,existing=None):
    assets.append(dict(id=f'{scene}/{id}',label=label,file=existing or f'assets/layered/{scene}/{id}.png',layer=layer,scenes=[scene],size=size,reviewed=False,origin='bottom-center',requireTransparency=layer!='ground'))

for scene,name,w,h,ref in scene_defs:
    refs.append(dict(scene=scene,name=name,file=ref,mapSize=[w,h]))
    add(scene,'ground','纯地面／道路／草地／室内地板，无任何家具和直立物件','ground',[w,h])
    add(scene,'flat-decoration','地毯／落花／小草／平铺花草（独立透明地贴）','ground',[w,h])
    if scene.endswith('indoor'):
        for id,label,layer in [
            ('wall-north','北墙与窗（完整直立精灵）','occluder'),
            ('wall-west','西墙','occluder'),('wall-east','东墙','occluder'),
            ('wall-south-left','入口左侧墙','occluder'),('wall-south-right','入口右侧墙','occluder'),
            ('door-left','左门扇','occluder'),('door-right','右门扇','occluder'),
            ('bed','原床榻（含床柱纱帐，不带木地板或地毯）','occluder'),
            ('desk','书案（含案上文房，不带地毯）','y'),('study-chair','书椅','y'),
            ('tea-table','茶桌（含茶具，不带地毯和凳子）','y'),
            ('tea-stools','各只茶凳，分别导出，附坐面位置','y'),
            ('shelf','书架／高柜','occluder'),('screen','屏风整体','occluder'),
            ('planters','盆栽／花瓶／水仙，按独立物件导出','y'),
            ('lamps','各盏宫灯，按独立物件导出','y'),('scroll','挂轴','occluder')]:
            add(scene,id,label,layer)
        if scene=='xiaoxiang-indoor':
            add(scene,'qin-table','琴桌含古琴','y')
            add(scene,'qin-chair','琴凳','y')
    else:
        if scene!='gate-main-road':
            add(scene,'main-house','正房整体，含自带墙脚草，不带可行走地面','occluder',existing={'xiaoxiang-courtyard':'assets/scenes/xiaoxiang/references/xiaoxiang-house.png','yihong-courtyard':'assets/scenes/yihong/references/yihong-house.png','hengwu-courtyard':'assets/scenes/hengwu/references/hengwu-house.png'}[scene])
            add(scene,'wings','两侧厢房，各自独立整栋透明图','occluder')
            add(scene,'stone-table','石桌含茶具，不带石板地面','y')
        for id,label,layer in [
            ('wall-gate','横墙与门洞完整直立件，洞内透明不带路面；保留墙脚自带草','occluder'),
            ('wall-side','左右延续墙，分别完整透明精灵','occluder'),
            ('trees','竹丛／桃树／柳树等，每株含原有脚下草整体导出，勿拆树冠','occluder'),
            ('flowerbeds','花坛整体，每个独立透明件','y'),
            ('stone-lamps','石灯，各自独立透明件','y'),
            ('stools-benches','石凳／长凳，各个独立透明件','y'),
            ('rocks','山石，保留附着植被；高于人物归遮挡层','occluder')]:
            add(scene,id,label,layer)
        if scene=='xiaoxiang-courtyard':
            add(scene,'pond','池面、水光、贴地岸沿','ground')
            add(scene,'well','井栏／辘轳整体，不带可行走地面','y')

contract=dict(version=1,sceneIntegrationComplete=False,scope='全部现有场景及未来新场景，园路仍按原阶段关闭',
 layers=['ground','y','occluder'],origin='bottom-center',requiredAssets=assets,legacyReferences=refs,
 rules=['先验证 Alpha、再分类、再摆放。分类不明不接入。','地面不参加 Y 排序，人物脚不能被地贴覆盖。','直立精灵以基座底部排序；完整树和完整墙不得拆成树冠／树干排序。','视觉遮挡与小型脚底碰撞分别配置。','不透明成图只作参考，不再作为可排序物件、遮挡裁片或可发布地面。','同一类有多个物件时，每个独立文件与 placement；本清单是交付族，不可把数只凳子拼成一个精灵。'])
(ROOT/'src/data/scene-art-contract.json').write_text(json.dumps(contract,ensure_ascii=False,indent=2),encoding='utf-8')
lines=['# 透明分层美术重交清单','',
'适用：六处现有庭院／内室、现有正门与主路，以及以后所有新场景。当前园路仍关闭，本次不扩园。', '',
'## 必须先明确的现状','',
'现有六张场景成图均为 RGB，无 Alpha；其中地面与家具、花草、墙体已经烘焙在一起。不能靠转换成 RGBA、补一条透明边、在程序里裁一个多边形，冒充透明分层素材。当前发布 HTML 是旧版，不符合此新标准；新构建被阻止，不会覆盖为半成品。','',
'完整构图继续作为对位参考，请严格保留已确认布局、色调、床榻与家具设计，不重新设计或重新摆房间。', '',
'## 交付规范','',
'- PNG RGBA 或无损 WebP，保留真实 Alpha；边缘不带白边／黑边，不画棋盘格，不带标签和说明框。',
'- 地面单独交：只含地板、草地和道路，不含床、桌、凳、树、墙等直立物件；场景范围外透明。地面内部的实色地板可以不透光。',
'- 地贴单独交：地毯、落花、矮草、贴地小花。只画在地面层，不做人物遮挡。',
'- 每个直立物件单独交完整透明精灵，保持原画像素尺寸，禁止拉伸；自带墙脚草、树下草可留在同一精灵，不拆成树冠或屋顶拼层。可行走的道路／房间地板必须从物件中去掉。',
'- 同类多个物件必须逐个导出，例如每只凳子都单独文件；也可用无重叠透明图集，同时给出每帧矩形。不要把整间家具或两栋厢房合成一个精灵。',
'- 每件附 placement.json：id、layer、x、baseY、image、原图裁切框、基座矩形、坐面坐标（座具）。x/baseY 使用当前场景世界坐标，原点是实际物件基座底部中央，不能用图片中心。',
'- 独立物件尺寸按参考图中原始像素包围框导出，不统一缩成小图；地面与地贴画布尺寸见各场景。透明留白若保留，另标实际基座锚点。',
'- 不确定归层或视觉高度的物件先确认，不能先以装饰名义贴入。','',
'## 可先复用但仍须人工确认的素材','',
'三人的透明人物图、已有透明正房图可以先检查复用。Alpha 合格不代表比例、分层及附带地面已合格，不能跳过人工检查。旧 RGB 图鉴不再在运行时去底或裁成遮挡层。','',
'## 各场景清单','']
for scene,name,w,h,ref in scene_defs:
    lines.extend([f'### {name}', '',f'- 参考图：`{ref}`',f'- 当前世界范围：{w}×{h}。怡红院／蘅芜苑庭院的参考原图仅 941px 高，当前引擎已有正房与地面排布；须按当前画面位置交付，不能把 941px 成图直接拉高到 1545px。',''])
    for a in assets:
        if scene in a['scenes']:lines.append(f'- `{a["id"].split("/")[-1]}`：{a["label"]}；层 `{a["layer"]}`。')
    lines.append('')
lines.extend(['## 推荐先交一个小模块','',
'先交「潇湘馆内室」：纯地面、地毯地贴、蓝白床、书案、书椅、茶桌、每张凳、琴桌／琴凳、屏风、书架和房间墙／门。Codex 完成 Alpha 检查、归层与逐物件浏览器验证后，再以同一格式交其他场景。','',
'## 验收状态','',
'素材审计和统一排序接口已建立；所有场景的实际接线及逐处行走验收尚未通过，需要上述透明分层素材。没有素材时不生成新场景美术、不把 RGB 成图继续裁片压人物。',''])
(ROOT/'docs/art-requests/scene-layer-art-request.md').write_text('\n'.join(lines),encoding='utf-8')
print('已写入分层合同及交接清单：%d 个交付族，%d 处场景'%(len(assets),len(scene_defs)))
