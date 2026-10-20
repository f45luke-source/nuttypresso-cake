'use strict';
(() => {
  const params=new URLSearchParams(location.search);
  if(['venue','bulk','gifts','popup','group','cake'].includes(params.get('service'))){location.replace('inquiry.html'+location.search+'#contact');return;}
  const toggle=document.querySelector('.nav-toggle'),menu=document.querySelector('#mobile-nav');
  const closeMenu=()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','메뉴 열기');};
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
  window.addEventListener('resize',()=>{if(innerWidth>900)closeMenu();});
  document.querySelector('#year').textContent=String(new Date().getFullYear());
  const today=new Date(Date.now()+9*3600000).toISOString().slice(0,10);
  if(today>'2026-11-30') {
    document.querySelector('[data-season="november"]').hidden=true;
    document.querySelectorAll('[data-nov-link]').forEach(a=>a.hidden=true);
  } else {
    document.querySelector('[data-stamp-state]').textContent=today>='2026-11-01'?'11월 스탬프 이벤트':'11월 1일 시작';
    document.querySelector('[data-popup-state]').textContent=today>'2026-11-26'?'팝업 종료':today>='2026-11-06'?'판교 팝업 진행 중':'COMING SOON';
    if(today>'2026-11-26') document.querySelector('.mochi-note').hidden=true;
  }
  const popupRibbon=document.querySelector('[data-popup-banner]');
  if(popupRibbon && today>'2026-11-26') popupRibbon.hidden=true;
  const dialog=document.querySelector('#photo-viewer'),image=document.querySelector('#viewer-image'),caption=document.querySelector('#viewer-caption'),count=document.querySelector('#viewer-count');
  const tiles=[...document.querySelectorAll('[data-photo]')];
  let index=0,origin=null;
  function show(n) {
    index=(n+tiles.length)%tiles.length;
    image.src=tiles[index].dataset.photo;image.alt=tiles[index].dataset.caption;
    caption.textContent=tiles[index].dataset.caption;count.textContent=`${index+1} / ${tiles.length}`;
  }
  function closeViewer(){dialog.close();}
  tiles.forEach((tile,n)=>tile.addEventListener('click',()=>{
    if(typeof dialog.showModal!=='function'){window.open(tile.dataset.photo,'_blank','noopener');return;}
    origin=tile;show(n);dialog.showModal();document.body.classList.add('viewer-open');
  }));
  dialog.querySelector('.viewer-close').addEventListener('click',closeViewer);
  dialog.addEventListener('close',()=>{document.body.classList.remove('viewer-open');if(origin)origin.focus({preventScroll:true});});
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeViewer();});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(index+1);}if(e.key==='ArrowLeft'){e.preventDefault();show(index-1);}});
  document.querySelector('#viewer-next').addEventListener('click',()=>show(index+1));
  document.querySelector('#viewer-prev').addEventListener('click',()=>show(index-1));
})();
