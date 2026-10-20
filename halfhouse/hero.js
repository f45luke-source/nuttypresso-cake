(() => {
  'use strict';
  const tour = document.querySelector('.hero-tour');
  if (!tour) return;
  const slides = [
    {src:'assets/space.webp',thumb:'assets/space.webp',name:'2층',caption:'2층 — 조금 더 머물고 싶은 자리',alt:'큰 창과 나무 좌석이 있는 하프하우스 2층'},
    {src:'assets/photos/hero-33.webp',thumb:'assets/photos/hero-33-640.webp',name:'야외',caption:'야외 — 햇살 아래 커피 한 잔',alt:'하프하우스 야외 테이블과 열린 매장 전면'},
    {src:'assets/photos/hero-31.webp',thumb:'assets/photos/hero-31-640.webp',name:'외관',caption:'외관 — 오늘의 여유가 시작되는 곳',alt:'하프하우스 유리 입구와 베이커리가 보이는 외관'},
    {src:'assets/photos/space-35.webp',thumb:'assets/photos/space-35-640.webp',name:'1층',caption:'1층 — 빵과 커피를 고르는 즐거움',alt:'하프하우스 1층의 베이커리 진열과 창가 좌석'}
  ];
  const main = document.getElementById('hero-main-img');
  const pause = document.getElementById('hero-pause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, playing = !reduced.matches, timer, visible = true, hovering = false, request = 0;
  const tabs = [...tour.querySelectorAll('[data-hero-index]')];
  const previews = [...tour.querySelectorAll('[data-hero-preview]')];
  function syncTimer(){
    clearInterval(timer);
    pause.textContent = playing ? 'Ⅱ' : '▷';
    pause.setAttribute('aria-label',playing ? '사진 자동 재생 정지' : '사진 자동 재생 시작');
    if(playing && visible && !hovering && !document.hidden && !tour.contains(document.activeElement)) timer=setInterval(()=>show(index+1),6500);
  }
  function stop(){playing=false;syncTimer();}
  function show(next,manual=false){
    if(manual) stop();
    const target=(next+slides.length)%slides.length, s=slides[target], token=++request;
    const img=new Image();
    img.onload=()=>{
      if(token!==request)return;
      index=target;main.src=s.src;main.alt=s.alt;
      document.getElementById('hero-main-caption').textContent=s.caption;
      document.getElementById('hero-count').textContent=`0${index+1} / 04`;
      tabs.forEach((t,i)=>t.setAttribute('aria-pressed',String(i===index)));
      previews.forEach((b,i)=>{const n=(index+i+1)%slides.length,p=slides[n];b.dataset.target=n;b.setAttribute('aria-label',p.name+' 사진 보기');b.querySelector('img').src=p.thumb;b.querySelector('img').alt=p.alt;b.querySelector('span').textContent=p.caption;});
      if(manual)document.getElementById('hero-announcement').textContent=s.caption;
    };
    img.onerror=stop;img.src=s.src;
  }
  tabs.forEach((b,i)=>b.addEventListener('click',()=>show(i,true)));
  previews.forEach((b,i)=>{b.dataset.target=i+1;b.addEventListener('click',()=>show(Number(b.dataset.target),true));});
  document.getElementById('hero-prev').addEventListener('click',()=>show(index-1,true));
  document.getElementById('hero-next').addEventListener('click',()=>show(index+1,true));
  pause.addEventListener('click',()=>{playing=!playing;syncTimer();});
  tour.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1),true);}});
  tour.addEventListener('mouseenter',()=>{hovering=true;syncTimer();});tour.addEventListener('mouseleave',()=>{hovering=false;syncTimer();});
  tour.addEventListener('focusin',syncTimer);tour.addEventListener('focusout',()=>setTimeout(syncTimer,0));
  document.addEventListener('visibilitychange',syncTimer);
  reduced.addEventListener('change',()=>{if(reduced.matches)stop();});
  if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;syncTimer();}).observe(tour);
  syncTimer();
})();
