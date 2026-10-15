(function(){
  const select=document.getElementById('taj-dhikr-select');
  const targetSelect=document.getElementById('taj-target');
  const countEl=document.getElementById('taj-count');
  const targetLabel=document.getElementById('taj-target-label');
  const ring=document.querySelector('.taj-ring');
  const status=document.getElementById('taj-status');
  const countBtn=document.getElementById('taj-count-btn');
  const resetBtn=document.getElementById('taj-reset');
  if(!select||!targetSelect||!countEl||!ring||!countBtn)return;
  let count=0;
  const key=()=>`uns-ahmad-taj-dhikr:${select.value}`;
  function load(){try{count=Number(localStorage.getItem(key())||0)||0}catch(e){count=0}render();}
  function render(){const target=Number(targetSelect.value)||33;countEl.textContent=count;targetLabel.textContent=target;ring.style.setProperty('--taj-progress',`${Math.min(100,count/target*100)}%`);if(count>=target){status.textContent='أحسنت، أتممت هدف هذه الجولة. تقبّل الله ذكرك.';status.classList.add('is-complete')}else{status.textContent='ابدأ على مهل، ولكل تسبيحة أجرها بإذن الله.';status.classList.remove('is-complete')}}
  countBtn.addEventListener('click',()=>{count++;try{localStorage.setItem(key(),String(count))}catch(e){}render();if('vibrate'in navigator)navigator.vibrate(12)});
  resetBtn.addEventListener('click',()=>{count=0;try{localStorage.setItem(key(),'0')}catch(e){}render()});
  select.addEventListener('change',load);targetSelect.addEventListener('change',render);load();
})();
