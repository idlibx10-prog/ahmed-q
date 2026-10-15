/* خطة حفظ يومية للأربعون النبوية — تحفظ محليًا على الجهاز */
(function(){
 'use strict';
 const $=id=>document.getElementById(id);
 const keys={goal:'unsNawawiPlanGoal',state:'unsNawawiPlanState'};
 const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
 const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch(_){return f}};
 let goal=Math.max(1,Math.min(5,Number(read(keys.goal,2))||2));
 let state=read(keys.state,{day:today(),count:0,lastDay:'',streak:0});
 if(state.day!==today()){state.day=today();state.count=0;}
 const save=()=>{try{localStorage.setItem(keys.goal,JSON.stringify(goal));localStorage.setItem(keys.state,JSON.stringify(state));}catch(_){}}
 function render(){if(!$('nawawi-daily-goal'))return; $('nawawi-daily-goal').value=String(goal); const count=Math.min(state.count,goal); $('nawawi-plan-count').textContent=count+' / '+goal; $('nawawi-plan-bar').style.width=(count/goal*100)+'%'; $('nawawi-plan-streak').textContent=String(state.streak||0); $('nawawi-plan-message').textContent=count>=goal?'ما شاء الله! أنجزت هدف اليوم، تقبّل الله منك.':'باقي لك '+(goal-count)+' '+((goal-count)===1?'حديث لإكمال':'أحاديث لإكمال')+' هدف اليوم. خذ وقتك وراجع بإتقان.'; $('nawawi-plan-done').disabled=count>=goal; }
 document.addEventListener('DOMContentLoaded',function(){
  if(!$('nawawi-daily-goal'))return;
  $('nawawi-daily-goal').addEventListener('change',e=>{goal=Math.max(1,Math.min(5,Number(e.target.value)||2));save();render()});
  $('nawawi-plan-done').addEventListener('click',()=>{if(state.count>=goal)return;state.count++;if(state.count>=goal){const y=new Date();y.setDate(y.getDate()-1);const yesterday=y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');if(state.lastDay===yesterday)state.streak=(state.streak||0)+1;else if(state.lastDay!==today())state.streak=1;state.lastDay=today();}save();render()});
  $('nawawi-plan-reset').addEventListener('click',()=>{state.count=0;save();render()});render();
 });
})();
