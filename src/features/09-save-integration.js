let autosaveElapsed=0;
spring.updateHooks.push(dt=>{autosaveElapsed+=dt;if(autosaveElapsed>=5){autosaveElapsed=0;if(!spring.storageError)saveProgress(true);}});
// The saved envelope already carries location, petals, journal, memories, event state and clock together.
const integrationRefresh=refreshSpringUI;
refreshSpringUI=function(){integrationRefresh();$('petal-count').textContent=journey.collections.petals.length?'花瓣已收入手札':'春日随记';};
