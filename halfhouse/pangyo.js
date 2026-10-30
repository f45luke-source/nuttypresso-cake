(() => {
  'use strict';
  const track = document.querySelector('.popup-menu-track');
  const slides = [...track.querySelectorAll('.popup-menu-slide')];
  const tabs = [...document.querySelectorAll('[data-menu-index]')];
  const back = document.getElementById('menu-back'), forward = document.getElementById('menu-forward');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  function sync(){
    const left=track.scrollLeft;
    current=slides.reduce((best,slide,i)=>Math.abs(slide.offsetLeft-slides[0].offsetLeft-left)<Math.abs(slides[best].offsetLeft-slides[0].offsetLeft-left)?i:best,0);
    tabs.forEach((t,i)=>t.setAttribute('aria-current',String(i===current)));
    document.getElementById('menu-position').textContent=`${String(current+1).padStart(2,'0')} / 03`;
    back.disabled=current===0;forward.disabled=current===slides.length-1;
  }
  function show(n){const i=Math.max(0,Math.min(slides.length-1,n));track.scrollTo({left:slides[i].offsetLeft-slides[0].offsetLeft,behavior:reduced.matches?'instant':'smooth'});}
  tabs.forEach((tab,i)=>tab.addEventListener('click',e=>{e.preventDefault();show(i);}));
  back.addEventListener('click',()=>show(current-1));forward.addEventListener('click',()=>show(current+1));
  track.addEventListener('scroll',sync,{passive:true});
  track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1));}});
  window.addEventListener('resize',()=>{show(current);});sync();
  const today=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
  if(today>'2026-11-26')document.getElementById('popup-status').textContent='이 팝업은 종료되었습니다. 강남 하프하우스에서 다시 만나요.';
})();
