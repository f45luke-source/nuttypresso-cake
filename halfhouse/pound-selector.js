(() => {
  'use strict';
  document.querySelectorAll('[data-pound-selector]').forEach((selector) => {
    const card = selector.closest('.gift-card');
    const photo = card?.querySelector('.catalog-photo');
    const image = photo?.querySelector('img');
    const buttons = [...selector.querySelectorAll('button[data-flavor]')];
    const status = card?.querySelector('[data-pound-status]');
    if (!photo || !image || !buttons.length) return;
    function select(button) {
      if (button.disabled || !button.dataset.src) return;
      const name = `${button.dataset.flavor} 파운드케이크 홀사이즈`;
      image.srcset = button.dataset.srcset || '';
      image.src = button.dataset.src;
      image.alt = `하프하우스 ${name}`;
      if (button.dataset.width) image.width = Number(button.dataset.width);
      if (button.dataset.height) image.height = Number(button.dataset.height);
      photo.dataset.photo = button.dataset.full || button.dataset.src;
      photo.dataset.caption = name;
      photo.setAttribute('aria-label', `${name} 사진 크게 보기`);
      buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      if (status) status.textContent = `${button.dataset.flavor} 사진을 보고 있어요.`;
    }
    buttons.forEach((button) => {
      button.addEventListener('click', () => select(button));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        const enabled = buttons.filter((item) => !item.disabled && item.dataset.src);
        if (!enabled.length) return;
        event.preventDefault();
        const index = enabled.indexOf(button);
        const target = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + enabled.length) % enabled.length;
        enabled[target].focus();
        select(enabled[target]);
      });
    });
  });
})();
