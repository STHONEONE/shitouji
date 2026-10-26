from pathlib import Path
from PIL import Image
import numpy as np
from scipy.ndimage import label,find_objects
import json
out=Path(__file__).resolve().parents[2]/'assets/characters/npcs';actors={}
for id in ['baoyu','baochai','xiren','xiangyun','tanchun','xichun','xifeng','miaoyu','jiamu','wangfuren']:
 p=out/'textures'/(id+'-walk.png' if id in ['baoyu','baochai'] else id+'.webp');im=Image.open(p);a=np.array(im.getchannel('A'));assert a.min()==0
 frames={}
 for row,direction in enumerate(['down','up','left','right']):
  frames[direction]=[]
  for col in range(3):
   if id in ['baoyu','baochai']:
    cw=im.width//3;ch=im.height//4;box=[col*cw,row*ch,(col+1)*cw,(row+1)*ch]
   else:
    xs=[620,840,1045,1265];ys=[0,282,550,811,1086];box=[xs[col],ys[row],xs[col+1],ys[row+1]]
   x,y,r,b=box;mask=a[y:b,x:r]>100;labels,n=label(mask);sizes=np.bincount(labels.ravel());sizes[0]=0;idx=sizes.argmax();sl=find_objects(labels==idx)[0];yy,xx=sl
   frames[direction].append([x+xx.start,y+yy.start,xx.stop-xx.start,yy.stop-yy.start])
 if id=='baoyu':frames['left'][2]=frames['left'][0]
 if id=='baochai':frames['left'][2],frames['right'][2]=frames['right'][2],frames['left'][2]
 actors[id]={'file':p.as_posix(),'height':80 if id=='jiamu' else 84,'frames':frames,'hasAlpha':True,'lossless':p.suffix=='.png' or b'VP8L' in p.read_bytes()}
 print(id,im.size,'lossless',actors[id]['lossless'])
(out/'art.json').write_text(json.dumps(actors,ensure_ascii=False,indent=2),encoding='utf-8')
