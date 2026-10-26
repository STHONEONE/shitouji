from pathlib import Path
import base64,json
from audit_scene_assets import audit, image_info
root=Path(__file__).resolve().parents[2]
# Convert and publish one reviewed module at a time. The global audit still
# records unconverted scenes; it must not prevent testing the changed room.
audit()
layer_scene=json.loads((root/'assets/scenes/xiaoxiang/indoor/scene.json').read_text(encoding='utf-8'))
for key,asset in layer_scene['assets'].items():
    info=image_info(root/asset['file'])
    if not info['hasAlpha'] or not info['hasTransparency']:
        raise SystemExit('内室素材缺少真实透明通道：'+key)
files=json.loads((root/'src/data/asset-files.json').read_text(encoding='utf-8'))
files.update({key:asset['file'] for key,asset in layer_scene['assets'].items()})
npc_art=json.loads((root/'assets/characters/npcs/art.json').read_text(encoding='utf-8'))
npc_content=json.loads((root/'src/data/npc-content.json').read_text(encoding='utf-8'))
for key,asset in npc_art.items():
    info=image_info(root/asset['file'])
    if not info['hasAlpha'] or not info['hasTransparency'] or not asset['lossless']:
        raise SystemExit('人物素材不符合透明无损要求：'+key)
    files['npc-'+key]=asset['file']
data={k:('data:image/webp;base64,' if Path(v).suffix=='.webp' else 'data:image/png;base64,')+base64.b64encode((root/v).read_bytes()).decode('ascii') for k,v in files.items()}
template=(root/'src'/'xiaoxiang.template.html').read_text(encoding='utf-8')
parts=[root/'src'/'rendering'/'scene-layers.js',root/'src'/'xiaoxiang.js',root/'src'/'interior-extension.js',*sorted((root/'src'/'features').glob('*.js'))]
js='const XIAO_LAYER_SCENE='+json.dumps(layer_scene,separators=(',',':'))+';\nconst NPC_ART='+json.dumps(npc_art,separators=(',',':'))+';\nconst NPC_CONTENT='+json.dumps(npc_content,separators=(',',':'))+';\n'+'\n'.join(p.read_text(encoding='utf-8') for p in parts)
out=root/'outputs'/'潇湘馆-庭院与内室-模块03.html'
out.write_text(template.replace('__ASSET_DATA__',json.dumps(data,separators=(',',':'))).replace('__GAME_CODE__',js).replace('<title>潇湘馆 · 林黛玉</title>','<title>潇湘馆 · 庭院与内室</title>'),encoding='utf-8')
print('Updated existing HTML:',out)
