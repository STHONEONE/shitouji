// Restore the secondary furnishings shown in the approved room overview.
// Every restored object has a small base footprint and a ring interaction.
for(const item of xiaoLayerScene.items.filter(i=>i.restored)){
 const n=item.hotspot;
 if(item.baseBodies)xiaoWide.indoor.solids.push(...item.baseBodies);
 else if(item.baseBody)xiaoWide.indoor.solids.push(item.baseBody);
 if(!n)continue;
 xiaoWide.indoor.rects[n.key]=n.rect;
 if(!roomLandmarks.some(p=>p.key===n.key))roomLandmarks.push({key:n.key,label:n.label,text:n.text});
}
// The old freestanding vase is now restored on its original wooden pedestal.
xiaoWide.indoor.solids=xiaoWide.indoor.solids.filter(r=>![[540,330],[1548,670]].some(([x,y])=>r[0]===x&&r[1]===y));
