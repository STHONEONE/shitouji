from pathlib import Path
import base64,json
root=Path(__file__).resolve().parent.parent
files={'ground':'xiaoxiang-ground.png','architecture':'xiaoxiang-architecture.png','daiyu-atlas':'daiyu-reference-four-directions.png'}
data={k:'data:image/png;base64,'+base64.b64encode((root/'assets'/v).read_bytes()).decode('ascii') for k,v in files.items()}
template=(root/'src'/'xiaoxiang.template.html').read_text(encoding='utf-8')
js=(root/'src'/'xiaoxiang.js').read_text(encoding='utf-8')
out=root/'outputs'/'潇湘馆-林黛玉-模块02.html'
out.write_text(template.replace('__ASSET_DATA__',json.dumps(data,separators=(',',':'))).replace('__GAME_CODE__',js),encoding='utf-8')
(root/'outputs'/'潇湘馆-林黛玉-人物修订版.html').write_bytes(out.read_bytes())
print(out)
print('Single HTML bytes:',out.stat().st_size)
