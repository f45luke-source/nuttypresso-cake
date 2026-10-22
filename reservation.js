
'use strict';
const API='https://hpexprhlyikznqaptqww.supabase.co/rest/v1/cake_reservations';
const KEY='sb_publishable_fJzGi38yo76T3kGgjBuvUg_BVb0RwGD';
const PRODUCTS={deep_basque:{price:37800,name:'딥 바스크 치즈케이크'},matcha:{price:40500,name:'말차 바스크 치즈케이크'},strawberry:{price:45000,name:'딸기 바스크 치즈케이크'}};
const form=document.getElementById('form'),product=document.getElementById('product'),qty=document.getElementById('qty'),total=document.getElementById('total'),date=document.getElementById('date'),phone=document.getElementById('phone'),statusBox=document.getElementById('status'),submit=document.getElementById('submit');
const won=value=>value.toLocaleString('ko-KR')+'원';
function tomorrowKST(){return new Date(Date.now()+9*3600000+86400000).toISOString().slice(0,10)}
function strawberrySeasonWindow(earliest){
 const year=Number(earliest.slice(0,4));
 const month=Number(earliest.slice(5,7));
 // Pickup is available only within the next November-January strawberry season.
 let first,last;
 if(month===1){first=earliest;last=year+'-01-31'}
 else if(month>=11){first=earliest;last=(year+1)+'-01-31'}
 else{first=year+'-11-01';last=(year+1)+'-01-31'}
 return{first,last};
}
function updateMinimum(){
 const earliest=tomorrowKST();
 if(product.value==='strawberry'){
  const season=strawberrySeasonWindow(earliest);
  date.min=season.first;date.max=season.last;
 }else{date.min=earliest;date.removeAttribute('max')}
}
function calc(){const n=Number(qty.value);total.textContent=Number.isInteger(n)&&n>=1&&n<=10?won(PRODUCTS[product.value].price*n):'수량을 확인해주세요'}
function showStatus(message,error=false){statusBox.hidden=false;statusBox.classList.toggle('error',error);statusBox.textContent=message}
updateMinimum();calc();product.addEventListener('change',()=>{updateMinimum();if(date.value&&(date.value<date.min||(date.max&&date.value>date.max)))date.value='';calc();previewCake(product.value,{syncForm:false})});qty.addEventListener('input',calc);date.addEventListener('focus',updateMinimum);window.addEventListener('focus',updateMinimum);date.addEventListener('input',()=>date.setCustomValidity(''));phone.addEventListener('input',()=>phone.setCustomValidity(''));document.getElementById('name').addEventListener('input',e=>e.target.setCustomValidity(''));
// The image, highlighted flavor and reservation selector always refer to the same cake.
// User-supplied whole-cake-on-box photographs, matched to each flavor.
const CAKE_PREVIEWS={
 deep_basque:{name:'딥 바스크',src:'assets/deep-basque-box-20261022.webp'},
 matcha:{name:'말차 바스크',src:'assets/matcha-basque-box-20261022.webp'},
 strawberry:{name:'딸기 바스크',src:'assets/strawberry-basque-box-20261022.webp'}
};
const mainCakeImage=document.getElementById('cake-main-image');
const cakePhotoPlaceholder=document.getElementById('cake-image-placeholder');
const placeholderName=document.getElementById('cake-placeholder-name');
function previewCake(flavor,{syncForm=true}={}){
 const selected=CAKE_PREVIEWS[flavor];
 if(!selected||!mainCakeImage)return;
 if(syncForm&&product.value!==flavor){
  product.value=flavor;updateMinimum();
  if(date.value&&(date.value<date.min||(date.max&&date.value>date.max)))date.value='';
  calc();
 }
 if(selected.src){
  if(mainCakeImage.getAttribute('src')!==selected.src)mainCakeImage.src=selected.src;
  mainCakeImage.alt='너티프레소 전용 박스 위에 놓인 '+selected.name+' 홀케이크';
  mainCakeImage.hidden=false;
  if(cakePhotoPlaceholder)cakePhotoPlaceholder.hidden=true;
 }else{
  mainCakeImage.hidden=true;
  mainCakeImage.removeAttribute('src');
  mainCakeImage.alt='';
  if(cakePhotoPlaceholder){
   cakePhotoPlaceholder.hidden=false;
   cakePhotoPlaceholder.setAttribute('aria-label',selected.name+' 홀케이크 실사 사진 준비 중');
  }
  if(placeholderName)placeholderName.textContent=selected.name;
 }
 const photoName=document.getElementById('cake-photo-name');
 if(photoName)photoName.textContent=selected.name+' · 홀케이크';
 document.querySelectorAll('.cake-row[data-preview]').forEach(row=>row.classList.toggle('is-active',row.dataset.preview===flavor));
 document.querySelectorAll('.slice-choice[data-preview]').forEach(button=>{
  const active=button.dataset.preview===flavor;
  button.classList.toggle('is-active',active);
  button.setAttribute('aria-pressed',String(active));
 });
}
document.querySelectorAll('.slice-choice[data-preview]').forEach(button=>button.addEventListener('click',()=>previewCake(button.dataset.preview)));
document.querySelectorAll('.cake-row[data-preview]').forEach(row=>row.addEventListener('click',event=>{
 if(event.target.closest('a[data-cake]'))return;
 previewCake(row.dataset.preview);
}));
document.querySelectorAll('[data-cake]').forEach(link=>link.addEventListener('click',()=>previewCake(link.dataset.cake)));
previewCake(product.value,{syncForm:false});
let sending=false;
form.addEventListener('submit',async event=>{
 event.preventDefault();if(sending)return;updateMinimum();
 const name=document.getElementById('name'),digits=phone.value.replace(/\D/g,'');
 name.setCustomValidity(name.value.trim()?'':'예약자 성함을 입력해주세요.');
 phone.setCustomValidity(digits.length>=9&&digits.length<=15?'':'연락 가능한 전화번호를 확인해주세요.');
 date.setCustomValidity(date.value>=date.min&&(!date.max||date.value<=date.max)?'':product.value==='strawberry'?'딸기 바스크는 11월부터 1월까지만 예약할 수 있습니다.':'한국 시간 기준 다음 날 이후를 선택해주세요.');
 if(!form.reportValidity())return;
 const n=Number(qty.value),choice=PRODUCTS[product.value];
 if(!choice||!Number.isInteger(n)||n<1||n>10){showStatus('케이크 종류와 수량을 확인해주세요.',true);return}
 const data={customer_name:name.value.trim(),phone:phone.value.trim(),pickup_date:date.value,pickup_time:document.getElementById('time').value,product:product.value,quantity:n,unit_price:choice.price,total_price:choice.price*n,memo:document.getElementById('memo').value.trim()||null};
 const summary=choice.name+' '+n+'개 · '+data.pickup_date+' '+data.pickup_time+' 픽업 희망';
 sending=true;submit.disabled=true;submit.textContent='예약 신청을 접수하고 있습니다…';showStatus('신청 중입니다. 페이지를 닫지 말아주세요.');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch(API,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(data),signal:controller.signal});
  if(!response.ok){showStatus('예약 신청을 접수하지 못했습니다. 입력 정보를 확인하거나 매장에 문의해주세요.',true);return}
  form.reset();qty.value=1;calc();updateMinimum();previewCake(product.value,{syncForm:false});
  showStatus('예약 신청이 접수되었습니다.\n'+summary+'\n결제 예정금액 '+won(data.total_price)+'\n매장에서 제작 가능 여부와 운영시간 내 픽업 일정을 확인한 뒤 예약을 확정해드립니다.');
 }catch(error){showStatus('접수 여부를 확인하지 못했습니다. 중복 예약을 방지하기 위해, 다시 신청하기 전 매장에 접수 여부를 확인해주세요.',true)}
 finally{clearTimeout(timer);sending=false;submit.disabled=false;submit.textContent='10% 혜택으로 예약 신청하기 ↗'}
});

const menuButton=document.querySelector('.nav-toggle'); const menu=document.querySelector('#mobile-menu'); menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menu.hidden=!open;}); menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.hidden=true;menuButton.setAttribute('aria-expanded','false')})); document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.hidden=true;menuButton.setAttribute('aria-expanded','false')}});
document.querySelectorAll('a[href="#gift-guide"]').forEach(a=>a.addEventListener('click',()=>{document.getElementById('gift-guide').open=true}));
if('IntersectionObserver' in window){const cta=document.querySelector('.mobile-cta');new IntersectionObserver(entries=>{cta.classList.toggle('away',entries[0].isIntersecting)},{threshold:0}).observe(document.getElementById('reserve'));}
