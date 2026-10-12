(function(root){
'use strict';
const E=root.DndEngine;
function choices(c){return [...c.skills.map((s,i)=>({id:'skill:'+i,name:s.name,group:'Навыки'})),...E.labels.map((name,i)=>({id:'ability:'+i,name,group:'Характеристики'})),...(c.edition==='3.5'?['Стойкость','Рефлексы','Воля']:E.labels).map((name,i)=>({id:'save:'+i,name,group:'Спасброски'})),{id:'attack:staff',name:'Атака посохом',group:'Атаки'},{id:'attack:spell',name:'Атака заклинанием',group:'Атаки'},{id:'initiative',name:'Инициатива',group:'Другие'}]}
function targets(c){return [{id:'all',name:'Все проверки'},{id:'skill:*',name:'Все навыки'},{id:'ability:*',name:'Все характеристики'},{id:'save:*',name:'Все спасброски'},{id:'attack:*',name:'Все атаки'},...choices(c)]}
function applies(target,id){return target==='all'||target===id||target===id.split(':')[0]+':*'}
function calculate(c,id,situation=0){const source=[],add=(label,value)=>source.push({label,value:Number(value)||0});const [kind,key]=id.split(':');const i=Number(key),old=c.edition==='3.5';let name=choices(c).find(x=>x.id===id)?.name;if(!name)throw new Error('Неизвестная проверка');
 if(kind==='skill'){const s=c.skills[i];add(E.labels[s.stat],E.modifier(c.stats[s.stat]));if(old)add('Ранги',s.rank);else if(s.trained)add(s.expertise?'Компетентность':'Бонус мастерства',c.proficiency*(s.expertise?2:1))}
 else if(kind==='ability')add(E.labels[i],E.modifier(c.stats[i]));
 else if(kind==='save'){if(old){add(E.labels[[2,1,4][i]],E.modifier(c.stats[[2,1,4][i]]));add('Базовый спасбросок',c.oldSaves[i])}else{add(E.labels[i],E.modifier(c.stats[i]));if(c.saveTraining[i])add('Бонус мастерства',c.proficiency)}}
 else if(kind==='attack'&&key==='staff'){add('Сила',E.modifier(c.stats[0]));add(old?'Базовый бонус атаки':'Бонус мастерства',old?c.baseAttack:c.proficiency)}
 else if(kind==='attack'&&key==='spell'){if(old){add('Ловкость',E.modifier(c.stats[1]));add('Базовый бонус атаки',c.baseAttack)}else{const ability=Number.isInteger(c.spellAbility)?c.spellAbility:3;add(E.labels[ability],E.modifier(c.stats[ability]));add('Бонус мастерства',c.proficiency);add('Поправка персонажа',c.spellAttackAdjustment??c.spellAttack-(E.modifier(c.stats[ability])+c.proficiency))}}
 else if(kind==='initiative'){add('Ловкость',E.modifier(c.stats[1]));add('Поправка персонажа',c.initiativeAdjustment??c.initiative-E.modifier(c.stats[1]))}
 for(const item of c.items)if(item.location==='Надето'&&item.qty>0)for(const b of item.bonuses||[])if(applies(b.target,id))add(item.name,b.value);
 for(const effect of c.effects||[])if(effect.active&&applies(effect.target,id))add(effect.name,effect.value);
 const manual=E.integer(situation,-99,99);if(manual)add('Ситуативная поправка',manual);
 const bonus=source.reduce((sum,x)=>sum+x.value,0);return {id,name,source,bonus,formula:'1d20'+(bonus>=0?'+':'')+bonus};
}
root.DndChecks={choices,targets,applies,calculate};if(typeof module!=='undefined')module.exports=root.DndChecks;
})(typeof window!=='undefined'?window:globalThis);
