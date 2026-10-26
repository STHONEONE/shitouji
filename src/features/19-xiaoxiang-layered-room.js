// The room uses independent Alpha sprites. No full painting or foreground
// polygon replay is used here. Other residences keep their existing renderer.
const xiaoLayerScene=XIAO_LAYER_SCENE;
function xiaoLayerAssets(){
 const result={};for(const[key,meta]of Object.entries(xiaoLayerScene.assets))result[key]={...meta,image:images[key]};return result;
}
drawOriginalIndoorWorld=function(){
 const assets=xiaoLayerAssets();
 SceneLayers.render(ctx,xiaoLayerScene,assets,[{id:'daiyu',x:state.x,baseY:state.pose?.depth??state.y,
  width:110,height:150,draw:drawHero},...sceneActorLayers().map(n=>({...n,baseY:n.y,width:110,height:110}))],{x:0,y:0,w:1672,h:941});
 const night=journey.clock.slot>=9||journey.clock.slot<3;
 if(night){
  ctx.fillStyle='rgba(20,32,63,.16)';ctx.fillRect(0,0,1672,941);
  for(const[x,y]of [[584,601],[1546,294]]){const g=ctx.createRadialGradient(x,y,1,x,y,55);g.addColorStop(0,'#ffd07b45');g.addColorStop(1,'#ffd07b00');ctx.fillStyle=g;ctx.fillRect(x-55,y-55,110,110);}
 }
};
// Block the bed's floor footprint, not the height of its canopy. The lie-down
// pose alone moves onto the mattress; normal walking cannot enter it.
xiaoWide.indoor.solids=xiaoWide.indoor.solids.filter(r=>!(r[0]===184));
xiaoWide.indoor.solids.push([184,265,332,104]);
xiaoWide.indoor.floors=[[75,246,1520,457],[729,691,214,199]];
// Small base pieces follow the screen's diagonal feet, leaving its tall panels
// as visual occlusion only.
xiaoWide.indoor.solids=xiaoWide.indoor.solids.filter(r=>![[1342,485],[1418,517],[1481,544]].some(([x,y])=>r[0]===x&&r[1]===y));
xiaoWide.indoor.solids.push([1340,436,43,16],[1393,476,44,16],[1447,516,46,16],[1503,555,74,20]);
xiaoWide.indoor.rects.screen=[1340,436,237,139];
xiaoWide.indoor.rects.bed=[184,301,332,68];
xiaoWide.indoor.bed={x:350,y:341,depth:369.1};
// These are ground items and wall-mounted detail on the north wall, both
// reachable with the existing ring interaction and original text.
xiaoWide.indoor.rects.scroll=[1376,252,66,17];
// Only the seats' visual anchors change; walking/collision stays in world units.
xiaoWide.indoor.seats[0].drawY=574;
xiaoWide.indoor.seats[1].drawY=576;
xiaoWide.indoor.seats[2].drawY=646;
xiaoWide.indoor.study.drawY=461;
