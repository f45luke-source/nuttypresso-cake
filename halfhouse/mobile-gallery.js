(() => {
  'use strict';
  document.querySelectorAll('[data-space-rail]').forEach((rail) => {
    const tiles = [...rail.querySelectorAll('.space-gallery-tile')];
    const controls = rail.nextElementSibling;
    const prev = controls.querySelector('[data-space-prev]');
    const next = controls.querySelector('[data-space-next]');
    const count = controls.querySelector('[data-space-count]');
    if (!tiles.length || !prev || !next || !count) return;
    const positions = () => {
      const left = rail.getBoundingClientRect().left;
      return tiles.map(tile => tile.getBoundingClientRect().left - left + rail.scrollLeft);
    };
    const nearest = () => positions().reduce((best, value, i, values) => Math.abs(value - rail.scrollLeft) < Math.abs(values[best] - rail.scrollLeft) ? i : best, 0);
    const update = () => {
      const start = nearest();
      const bounds = rail.getBoundingClientRect();
      const visible = tiles.map((tile, i) => ({i, r:tile.getBoundingClientRect()})).filter(({r}) => Math.min(r.right, bounds.right) - Math.max(r.left, bounds.left) >= r.width * .65);
      const end = visible.length ? visible[visible.length - 1].i : start;
      count.textContent = `${start + 1}${end > start ? '–' + (end + 1) : ''} / ${tiles.length}`;
      prev.disabled = rail.scrollLeft <= 2;
      next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
    };
    const go = (index) => {
      index = Math.max(0, Math.min(tiles.length - 1, index));
      rail.scrollTo({left:positions()[index], behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    };
    prev.addEventListener('click', () => go(nearest() - 1));
    next.addEventListener('click', () => go(nearest() + 1));
    rail.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const focused = tiles.indexOf(document.activeElement);
      const current = focused >= 0 ? focused : nearest();
      const target = Math.max(0, Math.min(tiles.length - 1, event.key === 'Home' ? 0 : event.key === 'End' ? tiles.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1)));
      if (focused >= 0) tiles[target].focus({preventScroll:true});
      go(target);
    });
    let frame;
    rail.addEventListener('scroll', () => {cancelAnimationFrame(frame);frame=requestAnimationFrame(update);}, {passive:true});
    new ResizeObserver(update).observe(rail);
    update();
  });
})();
