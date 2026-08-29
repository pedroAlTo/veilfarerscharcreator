(() => {
  'use strict';

  const headers = [...document.querySelectorAll('[data-site-header]')];
  headers.forEach((header, index) => {
    if (header.dataset.vfNavigationReady === 'true') return;

    const toggle = header.querySelector('[data-nav-toggle], [data-book-menu], .vf-nav-toggle, .book-menu');
    const menu = header.querySelector('[data-public-nav], .vf-public-nav, .book-links');
    if (!toggle || !menu) return;

    header.dataset.vfNavigationReady = 'true';
    if (!menu.id) menu.id = `public-navigation-${index + 1}`;
    toggle.setAttribute('aria-controls', menu.id);
    toggle.setAttribute('aria-expanded', 'false');

    const syncHomeLocation = () => {
      if (!document.body.classList.contains('vf-home')) return;
      const activeHash = location.hash || '#home';
      menu.querySelectorAll('a').forEach((link) => {
        const target = new URL(link.href, location.href);
        const active = target.pathname === location.pathname && target.hash === activeHash;
        if (active) link.setAttribute('aria-current', 'location');
        else if (link.getAttribute('aria-current') === 'location') link.removeAttribute('aria-current');
      });
    };
    syncHomeLocation();
    window.addEventListener('hashchange', syncHomeLocation);

    const close = (restoreFocus = false) => {
      if (!header.classList.contains('is-open')) return;
      header.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => close(false)));
    document.addEventListener('click', (event) => {
      if (!header.contains(event.target)) close(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close(true);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1050) close(false);
    }, { passive: true });
  });
})();
