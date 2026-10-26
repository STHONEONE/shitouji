/* Shared scene contract: ground first, then sprites and hero in base-Y order.
 * No scenery-image clips, blanket foreground overlays, or runtime keying.
 * This module is staged until every required scene has compliant artwork. */
(function(root){
 'use strict';
 const layers=new Set(['ground','y','occluder']);
 function assertItem(item,assets){
  if(!item||!layers.has(item.layer))throw Error('物件必须明确分类：ground / y / occluder');
  if(!item.id||!item.asset||!assets[item.asset])throw Error('物件缺少可用素材：'+item?.id);
  const asset=assets[item.asset];
  if(asset.usage==='reference'||asset.validation!=='approved')throw Error('参考图或未验收素材禁止绘制：'+item.id);
  if(!asset.hasAlpha)throw Error('素材缺少 Alpha：'+item.id);
  if(item.layer!=='ground'&&!asset.hasTransparency)throw Error('直立物件缺少真实透明背景：'+item.id);
  if(![item.x,item.baseY].every(Number.isFinite))throw Error('必须设置脚底／基座坐标：'+item.id);
  if(item.origin!==undefined&&item.origin!=='bottom-center')throw Error('物件锚点只能为底部中央：'+item.id);
  if(item.layer==='ground'&&item.collision)throw Error('地贴不可用高度产生碰撞：'+item.id);
  if(![item.width,item.height].every(n=>Number.isFinite(n)&&n>0))throw Error('缺少物件视觉尺寸：'+item.id);
 }
 function ordered(items,hero){
  // One upright object remains one sprite, including its supplied grass/base.
  // A canopy or arch is never pinned above the hero irrespective of base Y.
  const ground=items.filter(i=>i.layer==='ground');
  const upright=items.filter(i=>i.layer!=='ground');
  const extras=hero?(Array.isArray(hero)?hero:[hero]):[];
  const actors=[...upright,...extras.map((a,i)=>({...a,id:a.id||'actor-'+i,layer:'y'}))];
  actors.sort((a,b)=>a.baseY-b.baseY||(a.order??0)-(b.order??0)||a.id.localeCompare(b.id));
  return [...ground,...actors];
 }
 function visible(item,view){
  const w=item.width,h=item.height;
  return item.x+w/2>=view.x&&item.x-w/2<=view.x+view.w&&item.baseY>=view.y&&item.baseY-h<=view.y+view.h;
 }
 function paint(ctx,item,assets){
  if(item.draw){item.draw(ctx);return;}
  const a=assets[item.asset],im=a.image,frame=item.frame||[0,0,im.width,im.height];
  ctx.drawImage(im,...frame,Math.round(item.x-item.width/2),Math.round(item.baseY-item.height),item.width,item.height);
 }
 function render(ctx,scene,assets,hero,view){
  scene.items.forEach(i=>assertItem(i,assets));
  ctx.save();ctx.imageSmoothingEnabled=false;
  for(const item of ordered(scene.items,hero))if(visible(item,view))paint(ctx,item,assets);
  ctx.restore();
 }
 function blocksFoot(item,x,y,halfW=6,halfH=3){
  const b=item.collision;if(!b)return false;
  // Local base rectangle is independent of artwork height and draw order.
  const bx=item.x+b.x,by=item.baseY+b.y;
  return x+halfW>bx&&x-halfW<bx+b.w&&y+halfH>by&&y-halfH<by+b.h;
 }
 const api=Object.freeze({assertItem,ordered,visible,render,blocksFoot});
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.SceneLayers=api;
})(typeof globalThis!=='undefined'?globalThis:this);
