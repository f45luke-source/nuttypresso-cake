'use strict';
const params=new URLSearchParams(location.search);
if(['venue','bulk','gifts','popup','group','cake'].includes(params.get('service'))){location.replace('inquiry.html'+location.search+'#contact');}
const toggle=document.querySelector('.nav-toggle'),menu=document.querySelector('#mobile-nav');
function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','메뉴 열기');}
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});window.addEventListener('resize',()=>{if(innerWidth>820)closeMenu()});document.querySelector('#year').textContent=new Date().getFullYear();
