// Wall replacement only. No scene, time, collection or save schema changes.
// The supplied front view is horizontal, its path is vertical. One uniform
// scale is used for every wall layer; no rotation or independent axis stretch.
const moonWall={scale:5/8,x:480-834*5/8,y:180,depth:568,roadX:410,roadW:140,ready:false,layers:{},
 bodies:[{x:0,y:548,w:426,h:20},{x:534,y:548,w:426,h:20}]};
function moonCanvas(){const c=document.createElement('canvas');c.width=1672;c.height=941;return c;}
function moonRoadMask(g){
 g.beginPath();g.rect(690,0,290,280);
 // The inside of the arch, inset from its stone lining.
 g.moveTo(749,616);g.lineTo(921,616);
 g.bezierCurveTo(951,587,959,557,959,523);g.bezierCurveTo(958,466,902,430,834,430);
 g.bezierCurveTo(766,430,723,468,723,523);g.bezierCurveTo(723,561,731,589,749,616);g.closePath();
 g.rect(719,616,232,325);g.fill();
}
function moonLayer(source,rect){
 const c=moonCanvas(),g=c.getContext('2d');g.drawImage(source,0,0);g.globalCompositeOperation='destination-in';g.fillRect(...rect);return c;
}
const moonPrepare=prepareHeroSprites;
prepareHeroSprites=function(){
 moonPrepare();
 const full=sheetSprite('moon-wall',[0,0,1672,941],1672,941,true),g=full.getContext('2d');
 // Remove the baked road from the foreground. It is drawn as one continuous
 // ground surface instead, so it can never cover the walking character.
 g.globalCompositeOperation='destination-out';moonRoadMask(g);g.globalCompositeOperation='source-over';
 moonWall.layers.roof=moonLayer(full,[0,0,1672,440]);
 moonWall.layers.body=moonLayer(full,[0,440,1672,132]);
 moonWall.layers.base=moonLayer(full,[0,572,1672,44]);
 moonWall.layers.edge=moonLayer(full,[0,616,1672,325]);
 // Side linings use the same coordinates as the body and base, never a
 // separately scaled or pasted-on arch. Isolate their draw layer.
 const cavity=moonCanvas(),cg=cavity.getContext('2d');cg.drawImage(full,0,0);cg.globalCompositeOperation='destination-in';cg.fillRect(690,440,290,176);
 moonWall.layers.cavity=cavity;
 for(const layer of ['body','base'])moonWall.layers[layer].getContext('2d').clearRect(690,440,290,176);
 moonWall.path=sheetSprite('moon-wall',[722,650,224,112],140,70,false);
 moonWall.ready=true;
};
function drawMoonRoad(){
 if(!moonWall.ready)return;
 // The 140px lane is identical inside/outside the opening. Whole tile crops
 // use the same 5/8 scale as the gate, including both mossy road edges.
 for(let y=310;y<1510;y+=70){if(y+70<southWorld.cameraY||y>southWorld.cameraY+(southWorld.viewHeight||H))continue;
  const h=Math.min(70,1510-y);ctx.drawImage(moonWall.path,0,0,140,h,moonWall.roadX,y,140,h);
 }
}
function drawMoonFootShadow(){
 if(!moonWall.ready||southWorld.cameraY>620)return;
 // Two short shadows follow the base. There is no opaque bar across the road.
 for(const [x,w]of [[0,426],[534,426]]){
  const gradient=ctx.createLinearGradient(0,554,0,586);gradient.addColorStop(0,'rgba(30,40,30,.30)');gradient.addColorStop(1,'rgba(30,40,30,0)');ctx.fillStyle=gradient;ctx.fillRect(x,554,w,32);
 }
}
function drawMoonWall(){
 if(!moonWall.ready)return;
 for(const key of ['body','base','cavity','roof','edge'])ctx.drawImage(moonWall.layers[key],moonWall.x,moonWall.y,1672*moonWall.scale,941*moonWall.scale);
}
const moonValid=validFoot;
validFoot=function(x,y){
 if(state.scene!=='courtyard')return moonValid(x,y);
 const overlaps=moonWall.bodies.some(r=>x+6>r.x&&x-6<r.x+r.w&&y+3>r.y&&y-3<r.y+r.h);
 if(overlaps)return false;
 // Approaches are actual free ground. The only solid pieces are the shallow
 // wall bases and the original courtyard furniture/plant footprints.
 const approach=x>=22&&x<=938&&y>=412&&y<=626;
 if(!approach)return moonValid(x,y);
 if(solid.some(r=>x+6>r.x&&x-6<r.x+r.w&&y+3>r.y&&y-3<r.y+r.h))return false;
 return !springProps.filter(p=>p.scene==='courtyard'&&p.body).some(p=>{const[dx,dy,w,h]=p.body;return x+6>p.x+dx&&x-6<p.x+dx+w&&y+3>p.y+dy&&y-3<p.y+dy+h;});
};
const moonReach=interactionRects;
interactionRects=function(n){return state.scene==='courtyard'&&n.key==='gate'?[{x:422,y:518,w:116,h:50}]:moonReach(n);};
