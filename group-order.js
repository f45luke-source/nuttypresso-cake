(() => {
  'use strict';
  const API = 'https://hpexprhlyikznqaptqww.supabase.co/rest/v1/group_order_inquiries';
  // Publishable key only. Public callers can insert enquiries, never read them.
  const KEY = 'sb_publishable_fJzGi38yo76T3kGgjBuvUg_BVb0RwGD';
  const $ = id => document.getElementById(id);
  const form = $('group-form');
  if (!form) return;
  const date = $('group-date'), method = $('group-method'), address = $('group-address');
  const deliveryConsent = $('group-delivery-consent'), submit = $('group-submit'), status = $('group-status');
  let sending = false, pending = null;
  const minimumDate = () => new Date(Date.now() + (9 + 24) * 3600000).toISOString().slice(0, 10);
  const updateMinimum = () => { date.min = minimumDate(); };
  function deliveryFields() {
    const delivery = method.value === 'delivery';
    $('group-delivery-fields').hidden = !delivery;
    address.disabled = !delivery; address.required = delivery;
    deliveryConsent.disabled = !delivery; deliveryConsent.required = delivery;
    address.setCustomValidity('');
    if (!delivery) { address.value = ''; deliveryConsent.checked = false; }
  }
  function show(message, error = false, focus = false) {
    status.hidden = false; status.classList.toggle('error', error); status.textContent = message;
    if (focus) status.focus({preventScroll: false});
  }
  function uuid() {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
    if (!globalThis.crypto?.getRandomValues) throw new Error('Secure random unavailable');
    const bytes = new Uint8Array(16); crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
    const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
  }
  updateMinimum(); deliveryFields();
  date.addEventListener('focus', updateMinimum); window.addEventListener('focus', updateMinimum);
  method.addEventListener('change', deliveryFields);
  form.querySelectorAll('input, textarea, select').forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (sending) return;
    updateMinimum();
    if ($('group-website').value) { show('입력 내용을 확인한 후 다시 문의해주세요.', true, true); return; }
    const name = $('group-name'), phone = $('group-phone'), drinks = $('group-drinks'), quantity = $('group-quantity');
    const digits = phone.value.replace(/\D/g, '');
    name.setCustomValidity(name.value.trim() ? '' : '담당자 성함을 입력해주세요.');
    phone.setCustomValidity(/^\d{9,15}$/.test(digits) ? '' : '연락 가능한 전화번호를 확인해주세요.');
    date.setCustomValidity(date.value >= date.min ? '' : '한국 시간 기준 다음 날 이후를 선택해주세요.');
    drinks.setCustomValidity(drinks.value.trim() ? '' : '음료 종류와 수량 또는 메뉴 상담 요청을 남겨주세요.');
    const isDelivery = method.value === 'delivery', count = Number(quantity.value);
    address.setCustomValidity(!isDelivery || address.value.trim().length >= 5 ? '' : '건물명과 층수를 포함한 배달 주소를 확인해주세요.');
    quantity.setCustomValidity(Number.isInteger(count) && count >= 1 && count <= 10000 ? '' : '음료 수량을 정수로 입력해주세요.');
    if (!form.reportValidity()) return;
    const data = {
      customer_name: name.value.trim(), phone: digits, company: $('group-company').value.trim() || null,
      requested_date: date.value, requested_time: $('group-time').value, fulfillment_method: method.value,
      drink_quantity: count, drink_details: drinks.value.trim(), dessert_details: $('group-desserts').value.trim() || null,
      delivery_address: isDelivery ? address.value.trim() : null, delivery_terms_accepted: isDelivery && deliveryConsent.checked,
      memo: $('group-memo').value.trim() || null, privacy_consent: $('group-consent').checked
    };
    const fingerprint = JSON.stringify(data);
    try { if (!pending || pending.fingerprint !== fingerprint) pending = {id: uuid(), fingerprint}; }
    catch { show('이 브라우저에서 안전한 접수를 준비하지 못했습니다. 최신 브라우저로 다시 이용해주세요.', true, true); return; }
    const requestId = pending.id;
    sending = true; submit.disabled = true; form.setAttribute('aria-busy', 'true');
    submit.textContent = '그룹오더 문의를 접수하고 있습니다…'; show('접수 중입니다. 페이지를 닫지 말아주세요.');
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(API, {
        method: 'POST', headers: {apikey: KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal'},
        body: JSON.stringify({id: requestId, ...data}), signal: controller.signal
      });
      let duplicate = false;
      if (response.status === 409) {
        const error = await response.json().catch(() => ({}));
        duplicate = error.code === '23505';
      }
      if (!response.ok && !duplicate) {
        const uncertain = response.status >= 500;
        show(uncertain
          ? '접수 여부를 확인하지 못했습니다. 중복 접수를 막기 위해 다시 문의하기 전 매장에 접수 여부를 확인해주세요.\n확인용 번호: ' + requestId.slice(0,8).toUpperCase()
          : '문의가 접수되지 않았습니다. 입력 내용을 확인한 후 다시 시도하거나 매장에 문의해주세요.', true, true);
        return;
      }
      const summary = `${data.requested_date} ${data.requested_time} · 음료 ${count}잔 · ${isDelivery ? '매장 인근 배달 희망' : '매장 픽업 희망'}`;
      form.reset(); updateMinimum(); deliveryFields(); pending = null;
      show((duplicate ? '동일한 그룹오더 문의가 이미 접수되어 있습니다.' : '그룹오더 문의가 접수되었습니다.') + '\n' + summary + '\n확인용 번호: ' + requestId.slice(0,8).toUpperCase() + '\n매장에서 메뉴·금액·수령 가능 시간을 확인한 뒤 연락드립니다. 아직 예약·배달이 확정되거나 결제가 완료된 상태는 아닙니다.', false, true);
    } catch {
      show('접수 여부를 확인하지 못했습니다. 중복 접수를 막기 위해 다시 문의하기 전 매장에 접수 여부를 확인해주세요.\n확인용 번호: ' + requestId.slice(0,8).toUpperCase(), true, true);
    } finally {
      clearTimeout(timer); sending = false; submit.disabled = false; form.removeAttribute('aria-busy');
      submit.textContent = '그룹오더 예약 문의하기 ↗';
    }
  });
  const menuButton = document.querySelector('.nav-toggle'), menu = $('mobile-menu');
  if (menuButton && menu) {
    const close = () => { menu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); };
    menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); menu.hidden = !open; });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  }
  if ('IntersectionObserver' in window) {
    const cta = document.querySelector('.mobile-cta');
    if (cta) new IntersectionObserver(entries => cta.classList.toggle('away', entries[0].isIntersecting), {threshold: 0}).observe($('group-inquiry'));
  }
})();
