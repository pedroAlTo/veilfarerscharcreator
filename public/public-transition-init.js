(() => {
  'use strict';

  try {
    const hasArrival = sessionStorage.getItem('vf-ftl-arrival') === '1';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (hasArrival && !reducedMotion) document.documentElement.classList.add('vf-ftl-arriving');
  } catch (_) {
    // The page remains visible when storage is unavailable.
  }
})();
