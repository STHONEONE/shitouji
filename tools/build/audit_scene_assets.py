"""Validate source assets before a new playable HTML can be published.

Opaque reference paintings remain available for the art handoff only.
Never invent transparent pixels or cut scenery rectangles to pass validation.
"""
from pathlib import Path
import json
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
CONTRACT=ROOT/'src/data/scene-art-contract.json'
REPORT=ROOT/'reports/art/scene-art-audit.json'

def image_info(path):
    with Image.open(path) as im:
        alpha=im.getchannel('A') if 'A' in im.getbands() else (im.convert('RGBA').getchannel('A') if 'transparency' in im.info else None)
        extrema=alpha.getextrema() if alpha is not None else None
        return dict(mode=im.mode,size=list(im.size),hasAlpha=alpha is not None,hasTransparency=bool(extrema and extrema[0]<255),alphaRange=extrema)

def audit(write=True):
    contract=json.loads(CONTRACT.read_text(encoding='utf-8'))
    inventory=[]
    for path in sorted((ROOT/'assets').rglob('*.png')):
        info=image_info(path)
        inventory.append(dict(file=str(path.relative_to(ROOT)).replace('\\','/'),**info))
    known={r['file']:r for r in inventory}
    failures=[]
    accepted=[]
    for asset in contract['requiredAssets']:
        path=ROOT/asset['file']
        if not path.is_file():
            failures.append(dict(id=asset['id'],file=asset['file'],reason='missing',scenes=asset['scenes']))
            continue
        info=known.get(asset['file']) or image_info(path)
        reason=None
        if not info['hasAlpha']:reason='no_alpha'
        elif asset['layer']!='ground' and not info['hasTransparency']:reason='opaque_background'
        elif not asset.get('reviewed'):reason='awaiting_visual_review'
        if reason:failures.append(dict(id=asset['id'],file=asset['file'],reason=reason,scenes=asset['scenes']))
        else:accepted.append(asset['id'])
    # Six shipped scene paintings fail the new contract even though the old
    # published HTML can still be opened. Do not silently grandfather them in.
    legacy=[]
    for ref in contract['legacyReferences']:
        info=known.get(ref['file'])
        legacy.append({**ref,**(info or {}),'usage':'reference_only','reason':'整图烘焙了地面与直立物件，不能作为排序精灵或遮挡裁片'})
    result=dict(version=1,status='blocked' if failures else 'ready',approved=accepted,failures=failures,legacyReferences=legacy,inventory=inventory,
                playableReleaseVerified=False,notes=['Alpha 检查通过不等于美术合格；需人工确认无底色、无烘焙地面。','新增构建先校验，失败时不覆盖现有 HTML；旧 HTML 不算新规则验收通过。'])
    if write:REPORT.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    return result

def require_ready():
    report=audit()
    if report['status']!='ready':
        raise SystemExit('构建已阻止：透明分层素材尚未齐备，共 %d 项待补／待验收。见 reports/art/scene-art-audit.json；旧 HTML 保留但不符合新验收。'%len(report['failures']))
    # Artwork delivery alone is insufficient: each placement must be reviewed
    # and wired to the shared renderer, followed by actual browser acceptance.
    contract=json.loads(CONTRACT.read_text(encoding='utf-8'))
    if not contract.get('sceneIntegrationComplete'):
        raise SystemExit('构建已阻止：素材已检查，场景分层接线与浏览器验收尚未完成。')

if __name__=='__main__':
    result=audit()
    print('透明检查：%s；待处理 %d 项；现有素材 %d 张'%(result['status'],len(result['failures']),len(result['inventory'])))
