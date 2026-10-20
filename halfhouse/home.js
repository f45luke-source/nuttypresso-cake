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
  const menuData={panini:['치즈','가지토마토','불고기','치킨','연어'].map(n=>[n+' 파니니','수제 사워도우 파니니 · '+n]),baguette:['초코','피스타치오','밤'].map(n=>[n+' 바게트','하프하우스 바게트 · '+n]),campagne:[['초코 깜빠뉴','초코 사워도우'],['팥과 모찌 깜빠뉴','팥과 모찌의 조합']],salt:[['소금빵','기본 소금빵'],['초코 소금빵','초코 소금빵']],cake:[['바스크 치즈케이크','기본 바스크 치즈케이크'],['말차 바스크 치즈케이크','말차 바스크 치즈케이크'],['블루베리 치즈 스콘 케이크','블루베리와 치즈의 조합']]};
  let menuCat='panini',menuIdx=0;const menuPhotos=['assets/photos/space-39.webp','assets/bakery.webp','assets/photos/archive-017.webp'];const renderMenu=()=>{const arr=menuData[menuCat],item=arr[menuIdx];document.querySelector('#hh-menu-title').textContent=item[0];document.querySelector('#hh-menu-desc').textContent=item[1];document.querySelector('#hh-menu-count').textContent=(menuIdx+1)+' / '+arr.length;document.querySelector('#hh-menu-img').src=menuPhotos[menuIdx%menuPhotos.length];};document.querySelectorAll('[data-menu-cat]').forEach(b=>b.addEventListener('click',()=>{menuCat=b.dataset.menuCat;menuIdx=0;document.querySelectorAll('[data-menu-cat]').forEach(x=>x.classList.toggle('active',x===b));renderMenu()}));document.querySelector('#hh-menu-prev').addEventListener('click',()=>{menuIdx=(menuIdx-1+menuData[menuCat].length)%menuData[menuCat].length;renderMenu()});document.querySelector('#hh-menu-next').addEventListener('click',()=>{menuIdx=(menuIdx+1)%menuData[menuCat].length;renderMenu()});
  const events=[['toss-conversation.webp','찾아가는 토스플레이스','실제 기업 간담회 현장'],['toss-meeting.webp','토스플레이스 현장','기업 행사 진행 모습'],['toss-detail.webp','토스플레이스 디테일','실제 행사 현장 기록'],['f45-gathering.webp','F45 강남 커뮤니티','하프하우스에서 함께한 모임'],['f45-community.webp','F45 강남 모임','실제 커뮤니티 현장']];let eventIdx=0;const renderEvent=()=>{let x=events[eventIdx];document.querySelector('#hh-event-img').src='assets/photos/'+x[0];document.querySelector('#hh-event-img').alt=x[1]+' 실제 행사 사진';document.querySelector('#hh-event-title').textContent=x[1];document.querySelector('#hh-event-desc').textContent=x[2];document.querySelector('#hh-event-count').textContent=(eventIdx+1)+' / '+events.length};document.querySelector('#hh-event-prev').addEventListener('click',()=>{eventIdx=(eventIdx+events.length-1)%events.length;renderEvent()});document.querySelector('#hh-event-next').addEventListener('click',()=>{eventIdx=(eventIdx+1)%events.length;renderEvent()});document.querySelectorAll('[data-review-cat]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-review-cat]').forEach(x=>x.classList.toggle('active',x===b));document.querySelector('#hh-review-title').textContent=b.dataset.reviewCat+' 후기'}));
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
