'use strict';
(() => {
  const API = 'https://hpexprhlyikznqaptqww.supabase.co/functions/v1/halfhouse-inquiry';
  const KEY = 'sb_publishable_fJzGi38yo76T3kGgjBuvUg_BVb0RwGD';
  const types = ['venue', 'bulk', 'gifts', 'popup', 'group', 'cake'];
  const hints = {
    venue: '행사의 성격과 대략적인 인원, 희망 시간을 알려주세요. 미정이어도 상담할 수 있어요.',
    bulk: '필요한 메뉴와 수량을 알려주세요. 정해진 예산에 맞춰 구성을 상담할 수 있어요.',
    gifts: '누구에게 전하는 선물인가요? 제품 구성과 포장 방향을 함께 상담합니다.',
    popup: '브랜드와 프로젝트의 방향을 알려주세요. 공간 또는 제품 협업을 제안할 수 있어요.',
    group: '매장 내 단체 이용 문의입니다. 공간을 전용으로 사용하려면 대관을 선택해주세요.',
    cake: '홀케이크 종류·수량·픽업 희망일을 남겨주세요. 10% 할인은 진행 예정이며, 적용 여부와 최종 가격은 상담 시 안내합니다.'
  };
  const form = document.querySelector('#inquiry-form');
  const fields = document.querySelector('#form-fields');
  const errorBox = document.querySelector('#form-error');
  const successBox = document.querySelector('#success');
  const submit = document.querySelector('#submit-button');
  const dateInput = form.elements.requested_date;
  const quantityInput = form.elements.quantity;
  let sending = false, pending = null;
  const params = new URLSearchParams(location.search);
  const attribution = { landing_path: location.pathname.slice(0, 200) };
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => { if (params.has(key)) attribution[key] = params.get(key).slice(0, 200); });
  try { if (document.referrer) attribution.referrer_host = new URL(document.referrer).hostname; } catch (_) {}
  // Local event interface only. No ad pixels or analytics IDs are silently installed.
  window.dataLayer = window.dataLayer || [];
  function event(name, service) { window.dataLayer.push({ event: name, inquiry_type: service }); }
  const kstToday = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  dateInput.min = kstToday();
  dateInput.addEventListener('focus', () => { dateInput.min = kstToday(); });
  document.querySelector('#year').textContent = String(new Date().getFullYear());
  if (kstToday() >= '2026-12-01') document.querySelector('#upcoming').hidden = true;
  function selectType(type, scroll = false) {
    if (!types.includes(type) || sending) return;
    form.querySelector('input[name="service"][value="' + type + '"]').checked = true;
    document.querySelector('#service-hint').textContent = hints[type];
    document.querySelectorAll('[data-fields]').forEach(group => {
      const active = group.dataset.fields.split(' ').includes(type);
      group.hidden = !active;
      group.querySelectorAll('input,select,textarea').forEach(input => {
        input.disabled = !active;
        input.required = active && input.hasAttribute('data-cake-required');
      });
    });
    dateInput.required = type === 'cake'; quantityInput.required = type === 'cake';
    document.querySelector('#date-label').textContent = type === 'cake' ? '픽업 희망 날짜 *' : '희망 날짜';
    document.querySelector('#date-help').textContent = type === 'cake' ? '준비 가능 여부는 상담 후 확정됩니다.' : '미정이면 비워두셔도 됩니다.';
    document.querySelector('#quantity-label').textContent = ['venue', 'group', 'popup'].includes(type) ? '예상 인원' : type === 'cake' ? '케이크 수량 *' : '예상 수량';
    if (type === 'cake' && !quantityInput.value) quantityInput.value = '1';
    if (scroll) event('inquiry_cta_click', type);
  }
  fields.disabled = false;
  selectType(types.includes(params.get('service')) ? params.get('service') : 'bulk');
  form.querySelectorAll('input[name="service"]').forEach(input => input.addEventListener('change', () => selectType(input.value)));
  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    if (successBox.hidden === false && !sending) resetForm(false);
    selectType(link.dataset.service, true);
  }));
  const toggle = document.querySelector('.nav-toggle'); const mobileNav = document.querySelector('#mobile-nav');
  function closeMenu() { mobileNav.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', '메뉴 열기'); }
  toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기'); mobileNav.hidden = !open; });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (innerWidth > 820) closeMenu(); });
  function getPayload() {
    const fd = new FormData(form); const service = String(fd.get('service')); const get = key => String(fd.get(key) || '').trim();
    const phone = get('phone').replace(/[\s().-]/g, '');
    if (!/^\+?[0-9]{9,15}$/.test(phone)) throw new Error('연락 가능한 전화번호를 확인해주세요.');
    if (get('contact_name').length < 2) throw new Error('성함을 두 글자 이상 입력해주세요.');
    const details = {};
    ['occasion', 'time', 'fulfilment', 'product', 'packaging', 'space', 'need_food'].forEach(key => { if (fd.has(key)) details[key] = get(key); });
    return { service, contact_name: get('contact_name'), phone, email: get('email'), company: get('company'), requested_date: get('requested_date'), quantity: get('quantity') ? Number(get('quantity')) : null, budget: get('budget'), message: get('message'), details, attribution, consent: fd.get('consent') === 'on', website: get('website') };
  }
  function showError(message) { errorBox.textContent = message; errorBox.hidden = false; errorBox.scrollIntoView({ block: 'nearest' }); }
  form.addEventListener('submit', async e => {
    e.preventDefault(); if (sending) return;
    errorBox.hidden = true; dateInput.min = kstToday(); if (!form.reportValidity()) return;
    let payload;
    try { payload = getPayload(); const fingerprint = JSON.stringify(payload); if (!pending || pending.fingerprint !== fingerprint) pending = { fingerprint, token: crypto.randomUUID() }; payload.request_token = pending.token; }
    catch (error) { showError(error.message || '입력 내용을 확인해주세요.'); return; }
    sending = true; fields.disabled = true; submit.disabled = true; submit.firstElementChild.textContent = '접수 중…';
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 22000);
    try {
      const response = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: KEY }, body: JSON.stringify(payload), signal: controller.signal });
      let data; try { data = await response.json(); } catch (_) { throw new Error('접수 확인이 지연되고 있습니다. 다시 제출해주세요.'); }
      if (!response.ok || data.ok !== true || !/^HH-\d{6}-[A-F0-9]{10}$/.test(String(data.receipt))) { if (response.status === 409) pending = null; throw new Error(data.error || '접수 확인이 지연되고 있습니다. 다시 제출해주세요.'); }
      document.querySelector('#receipt-number').textContent = data.receipt; event('generate_lead', payload.service);
      form.hidden = true; successBox.hidden = false; pending = null; successBox.focus({ preventScroll: true }); successBox.scrollIntoView({ block: 'center' });
    } catch (error) {
      showError(error.name === 'AbortError' ? '접수 결과를 확인하지 못했습니다. 다시 제출하면 같은 요청 번호로 확인해 중복 접수를 방지합니다. 급한 문의는 매장으로 연락해주세요.' : error.message || '네트워크 연결을 확인하고 다시 제출해주세요.');
    } finally { clearTimeout(timeout); sending = false; fields.disabled = false; submit.disabled = false; submit.firstElementChild.textContent = '문의 접수하기'; }
  });
  function resetForm(scroll = true) { form.reset(); pending = null; errorBox.hidden = true; successBox.hidden = true; form.hidden = false; selectType('bulk'); if (scroll) form.scrollIntoView({ block: 'start' }); }
  document.querySelector('#new-inquiry').addEventListener('click', () => resetForm());
})();
