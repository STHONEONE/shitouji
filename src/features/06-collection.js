const CATEGORIES={petals:'花瓣',notes:'诗笺',poems:'诗集',scores:'琴谱',quotes:'语录'};
function openJournal(category='petals',page=0){
 if(!CATEGORIES[category])category='petals';const list=journey.collections[category],size=5,start=page*size;
 const tabs=Object.entries(CATEGORIES).map(([id,label])=>choice((id===category?'· ':'')+label,()=>openJournal(id)));
 const items=list.slice(start,start+size).map(item=>choice(item.title,()=>journalEntry(category,item)));
 if(page>0)items.push(choice('前一页',()=>openJournal(category,page-1)));if(start+size<list.length)items.push(choice('后一页',()=>openJournal(category,page+1)));
 showPanel('图鉴 · '+CATEGORIES[category],list.length?'这里安静地记着曾经停留的片刻。':'这一页暂且留白。',tabs.concat(items,choice('回到手札',openHandbook),choice('继续游园',closeDialogue)),{portrait:false,kind:'journal'});
}
function journalEntry(category,item){
 const actions=[];if(category==='notes'&&POEMS[item.id])actions.push(choice('翻读全文',()=>readPoem(item.id)));if(category==='scores')actions.push(choice('听这一段',playQin));
 actions.push(choice('回到'+CATEGORIES[category],()=>openJournal(category)),choice('继续游园',closeDialogue));
 showPanel(item.title,item.text+(item.source?'\n\n'+item.source:''),actions,{portrait:false,kind:'reader'});
}
register('journal',openJournal);
