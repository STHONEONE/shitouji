from pathlib import Path
from PIL import Image
import json
root=Path.cwd();p=root/'assets/scenes/xiaoxiang/indoor';mfile=p/'scene.json';m=json.loads(mfile.read_text(encoding='utf-8'))
im=Image.open(p/'textures/decor-atlas.png');a=im.getchannel('A');assert a.getextrema()[0]==0
key='xiao-layer-restored-decor';m['assets'][key]={'file':'assets/scenes/xiaoxiang/indoor/textures/decor-atlas.png','hasAlpha':True,'hasTransparency':True,'validation':'approved','size':list(im.size)}
# Inspect Alpha in independent search regions; do not alter or resample source art.
regions={'cabinet':(0,0,384,512),'console':(384,150,880,512),'flowers':(884,0,1184,512),'bed-step':(1184,150,1536,512),'bonsai':(0,512,410,1024),'bamboo':(410,512,780,1024),'chest':(1065,512,1536,1024)}
frames={}
for id,box in regions.items():
 b=a.crop(box).point(lambda v:255 if v>=128 else 0).getbbox();assert b,id
 frames[id]=[box[0]+b[0],box[1]+b[1],b[2]-b[0],b[3]-b[1]]
# Replace stand-ins, keeping the original core furniture and pose locations.
m['items']=[i for i in m['items'] if not i.get('restored') and i['id'] not in ['bedside-planter','vase']]
def add(id,kind,x,y,w,body,label,text,keyname=None,layer='y'):
 f=frames[kind];k=keyname or id
 m['items'].append(dict(id=id,asset=key,layer=layer,x=x,baseY=y,width=w,height=round(w*f[3]/f[2],3),frame=f,restored=True,baseBody=body,hotspot={'key':k,'rect':body,'label':label,'text':text}))
add('bedside-cabinet','cabinet',570,380,88,[542,353,56,27],'看看床边矮柜','矮柜守在纱帐旁，常翻的书叠在手边。瓶里的花枝疏疏，醒来时便能看见。')
add('north-console','console',645,315,120,[600,297,90,18],'看看供几与香炉','窄几上放着收好的卷轴，小香炉留着一点清气。书不必急着读完，香也只静静地燃着。')
add('flower-stand','flowers',135,526,62,[117,512,36,14],'看看花几','青花瓶安在小几上，几枝浅红映着窗光。它们不说话，这一角却显得有人照料。')
add('bed-step','bed-step',145,393,48,[130,379,30,14],'看看床边小凳','小凳垫着素色绣面，安安稳稳留在床边。夜里起身，脚下也有一处妥帖。')
add('bonsai-entry-left','bonsai',660,696,80,[635,679,50,17],'看看入口盆景','浅盆里一株小树，枝叶疏密自有分寸。进门时看一眼，外头的纷扰便轻了些。')
add('bonsai-entry-right','bonsai',1265,694,76,[1242,678,46,16],'看看陈设角盆景','山石与青苔收在小小一盆里。枝梢向着光，屋里便也留住了一点庭院的意思。')
add('vase','bamboo',1535,652,82,[1512,632,46,20],'看看竹枝插瓶','青花瓶和木几重新安在屏风旁，竹枝斜斜伸开。风声在窗外，清意却像留在了室内。','vase')
add('scroll-chest','chest',1318,314,104,[1280,292,76,22],'看看卷轴书匣','匣上书册与卷轴收得整齐，系带还松松留着。今日想读哪一卷，随手展开便是。')
# Reuse the supplied folding screen as a distinct smaller entry arrangement.
s=next(i for i in m['items'] if i['id']=='screen');f=s['frame'];w=142
m['items'].append(dict(id='screen-entry',asset=s['asset'],layer='occluder',x=1390,baseY=702,width=w,height=round(w*f[3]/f[2],3),frame=f,restored=True,baseBody=[1366,677,48,19],hotspot={'key':'screen-entry','rect':[1319,626,142,76],'label':'看看入口屏风','text':'入口这一扇屏风稍稍折起，隔住穿堂的风，却不挡来往的路。花影与竹影，仍可从两边望见。'}))
entry_screen=next(i for i in m['items'] if i['id']=='screen-entry')
entry_screen.pop('baseBody',None)
entry_screen['baseBodies']=[[1320,621,25,14],[1355,644,24,14],[1387,667,24,14],[1420,690,35,12]]
lamp=next(i for i in m['items'] if i['id']=='lamp-entry')
m['items'].append({**lamp,'id':'lamp-entry-right','x':1200,'baseY':703,'width':43,'height':round(43*152/48,3),'restored':True,'baseBody':[1189,682,22,21],'hotspot':{'key':'lamp-entry-right','rect':[1189,682,22,21],'label':'看看入口宫灯','text':'陈设角留着一盏宫灯，暖光隔着屏风透过来。夜里回房，也认得这条熟悉的路。'}})
m['review']['restoration']='Restore secondary furnishings from room overview 09 and original catalogues 02/06; individual Alpha sprites and footprint interactions.'
mfile.write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'docs/art-provenance/xiaoxiang-indoor/restored-decor-frames.json').write_text(json.dumps(frames,indent=2),encoding='utf-8')
print('恢复',sum(bool(i.get('restored')) for i in m['items']),'处陈设；当前',len(m['items']),'个绘制项')
