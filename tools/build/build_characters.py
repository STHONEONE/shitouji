"""Package existing Daiyu sprites and newly authorized Baoyu/Baochai poses."""
from pathlib import Path
import base64
import json
import shutil
import zipfile
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'exports/character-poses-20261025'
OUT.mkdir(parents=True, exist_ok=True)
ASSETS = ROOT / 'assets'
POSES = ['stand-down', 'stand-up', 'stand-right', 'stand-left', 'sit-front', 'sit-back', 'sit-east', 'sit-west', 'sit-study', 'sit-low', 'lie', 'stand-smile']
LABELS = ['正面站姿', '背面站姿', '向右站姿', '向左站姿', '正面坐姿', '背面坐姿', '向右坐姿', '向左坐姿', '书案坐姿', '低凳坐姿', '躺姿', '微笑站姿']
people = []

def component_crops(im):
    a = np.array(im)
    labels, count = ndimage.label(a[:, :, 3] > 40)
    boxes = ndimage.find_objects(labels)
    large = [(i, b) for i, b in enumerate(boxes, 1) if b is not None and np.count_nonzero(labels[b] == i) > 1000]
    result = []
    for i, b in large:
        y, x = b
        crop = a[y, x].copy()
        crop[:, :, 3][labels[b] != i] = 0
        result.append(((x.start, y.start, x.stop, y.stop), Image.fromarray(crop)))
    return result

def save_person(key, name, frames, source):
    dest = OUT / key
    dest.mkdir(exist_ok=True)
    entries = []
    sheet = Image.new('RGBA', (128 * 4, 128 * 3))
    for index, (pose, im) in enumerate(frames.items()):
        if pose == 'lie':
            factor = min(100 / im.width, 100 / im.height)
        else:
            height = 84 if pose.startswith('stand') else (80 if pose == 'sit-study' else 68 if pose == 'sit-low' else 74)
            factor = height / im.height
        size = (max(1, round(im.width * factor)), max(1, round(im.height * factor)))
        assert size[0] <= 128 and size[1] <= 120, (pose, size)
        sprite = im.resize(size, Image.Resampling.NEAREST)
        tile = Image.new('RGBA', (128, 128))
        tile.alpha_composite(sprite, (64 - size[0] // 2, 120 - size[1]))
        tile.save(dest / f'{pose}.png')
        im.save(dest / f'{pose}-source.png')
        col, row = index % 4, index // 4
        sheet.alpha_composite(tile, (col * 128, row * 128))
        label = LABELS[POSES.index(pose)]
        entries.append(dict(id=pose, label=label, file=f'{key}/{pose}.png', sourceFile=f'{key}/{pose}-source.png', rect=[col*128,row*128,128,128], origin=[64,120], visibleSize=list(size), posture='lying' if pose=='lie' else 'seated' if pose.startswith('sit') else 'standing'))
    sheet.save(dest / 'atlas.png')
    people.append(dict(id=key, name=name, source=source, frames=entries))

# Preserve Daiyu's existing art rather than regenerating her appearance.
frames = {}
atlas = Image.open(ROOT / 'assets/characters/daiyu/daiyu-reference-four-directions.png').convert('RGBA')
cw, ch = atlas.width//2, atlas.height//2
for pose, col, row in [('stand-down',0,0),('stand-up',1,0),('stand-right',1,1),('stand-left',0,1)]:
    cell = atlas.crop((col*cw,row*ch,(col+1)*cw,(row+1)*ch))
    parts = component_crops(cell)
    frames[pose] = max(parts, key=lambda p:p[1].width*p[1].height)[1]
seats = Image.open(ROOT / 'assets/characters/daiyu/daiyu-seat-directions.png').convert('RGBA')
cw, ch = seats.width//3, seats.height//2
for i, pose in enumerate(['sit-front','sit-back','sit-east','sit-west','sit-study','sit-low']):
    col,row=i%3,i//3
    cell=seats.crop((col*cw,row*ch,(col+1)*cw,(row+1)*ch))
    frames[pose]=cell.crop(cell.getbbox())
lying = Image.open(ROOT / 'assets/characters/daiyu/daiyu-lying.png').convert('RGBA')
frames['lie'] = lying.crop(lying.getbbox())
save_person('daiyu','林黛玉',frames,'原版四向、六坐姿及躺姿，保留现有形象')

for key,name in [('baoyu','贾宝玉'),('baochai','薛宝钗')]:
    source=ROOT/'art-source/characters'/f'{key}-actions-v1.png'
    im=Image.open(source).convert('RGBA')
    parts=component_crops(im)
    assert len(parts)==12, (key,len(parts))
    frames={}
    for pose, (box, crop) in zip(POSES, sorted(parts, key=lambda p:(round(((p[0][1]+p[0][3])/2)/(im.height/3)-.5),p[0][0]))):
        frames[pose]=crop
    save_person(key,name,frames,'用户角色卡参考；imagegen 内置工具制作动作')
    shutil.copyfile(source,OUT/key/'action-source.png')

manifest=dict(version=1, tileSize=[128,128], anchor='bottom-center', interpolation='nearest', people=people, notes=['静态姿态帧，不宣称逐帧行走动画。','坐姿原点为画布定位点；实际座面与遮挡深度仍须按各凳位标定。','人物素材制作阶段，未改变主角、场景布局或加入 NPC 对话。','黛玉躺姿沿用已提供的床品合成图；宝玉宝钗为不含床的侧卧图，接床时应分别标定，不能共用偏移。'])
(OUT/'characters.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
cards=[]
for p in people:
    tiles=[]
    for f in p['frames']:
        encoded=base64.b64encode((OUT/f['file']).read_bytes()).decode()
        tiles.append(f'<figure><img alt="{p["name"]} {f["label"]}" src="data:image/png;base64,{encoded}"><figcaption>{f["label"]}</figcaption></figure>')
    cards.append(f'<section data-character="{p["id"]}"><h2>{p["name"]}</h2><div class="grid">'+''.join(tiles)+'</div></section>')
html='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>三人角色动作预览</title><style>
body{margin:24px;background:#172820;color:#eee2c7;font:16px system-ui}button,select{background:#273b32;color:inherit;border:1px solid #ad9863;padding:10px;margin-right:12px}section{margin:24px 0}.grid{display:grid;grid-template-columns:repeat(6,minmax(140px,1fr));gap:12px}figure{margin:0;padding:12px;text-align:center;border:1px solid #65715e;background:repeating-conic-gradient(#304238 0 25%,#26392f 0 50%) 0/20px 20px}img{width:128px;height:128px;image-rendering:pixelated}body.large img{width:256px;height:256px}body.large .grid{grid-template-columns:repeat(4,minmax(280px,1fr))}figcaption{padding-top:8px}p{color:#c3b695;max-width:1000px;line-height:1.7}</style>
<h1>黛玉 · 宝玉 · 宝钗</h1><p>透明角色姿态素材。站姿 84px 高，坐姿按凳位分型。黛玉沿用原图；此处仅检查人物，不修改现有游戏场景。当前是静态姿态帧，未包含逐帧行走动画。</p><label>查看角色 <select id="person"><option value="all">全部</option><option value="daiyu">林黛玉</option><option value="baoyu">贾宝玉</option><option value="baochai">薛宝钗</option></select></label><button id="size">放大 2 倍</button>'''+''.join(cards)+'''<script>document.getElementById('person').onchange=e=>document.querySelectorAll('section').forEach(s=>s.hidden=e.target.value!=='all'&&s.dataset.character!==e.target.value);document.getElementById('size').onclick=e=>{const on=document.body.classList.toggle('large');e.target.textContent=on?'恢复原尺寸':'放大 2 倍'};</script></html>'''
(OUT/'pose-preview.html').write_text(html,encoding='utf-8')
(OUT/'usage.md').write_text('# 三人角色动作素材\n\n双击「pose-preview.html」查看，支持选择角色与整数 2 倍放大。\n\n每人目录：透明单帧、原尺寸 source 单帧、512×384 统一图集。characters.json 提供 128×128 帧尺寸、原点 (64,120) 和姿态分类。林黛玉 11 帧；宝玉、宝钗各 12 帧。\n\n这些是静态动作姿态，不是逐帧行走动画。坐姿没有凳子；不同凳位仍需座面高度与遮挡标定。黛玉原躺姿含原有床品；另外两人的躺姿不含床，不能共用定位偏移。\n\n主游戏、潇湘馆原床、布局、画面比例、本地存档均未改动；本次不加入 NPC 对话或主角切换。\n',encoding='utf-8')
with zipfile.ZipFile(ROOT/'exports/character-poses-20261025.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in OUT.rglob('*'):
        if p.is_file():z.write(p,p.relative_to(OUT))
print(json.dumps({p['name']:len(p['frames']) for p in people},ensure_ascii=False))
print(OUT)
