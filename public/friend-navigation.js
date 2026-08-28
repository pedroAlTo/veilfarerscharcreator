(() => {
  'use strict';
  if (window.__vfFriendNavigationLoaded) return;
  window.__vfFriendNavigationLoaded = true;

  if (!document.querySelector('link[data-vf-friend-nav-style]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/friend-navigation.css?v=20260829-2';
    stylesheet.dataset.vfFriendNavStyle = '';
    document.head.appendChild(stylesheet);
  }

  const links = [
    ['/creator.html', 'Character Creator'],
    ['/creator.html#cards', 'Card Library'],
    ['/creator.html#level-up', 'Level Up'],
    ['/charsheet.html', 'Charsheet'],
    ['/player-tool.html', 'Player Tool'],
    ['/keeper-tool.html', 'Keeper Tool'],
    ['/armory.html', 'Armory'],
    ['/items.html', 'Item Inventory'],
    ['/encyclopedia.html', 'Stellar Encyclopedia']
  ];

  function rolesFrom(user) {
    const values = [
      ...(Array.isArray(user?.roles) ? user.roles : []),
      ...(Array.isArray(user?.appMetadata?.roles) ? user.appMetadata.roles : []),
      ...(Array.isArray(user?.app_metadata?.roles) ? user.app_metadata.roles : [])
    ];
    return new Set(values.map((role) => String(role || '').trim().toLowerCase()).filter(Boolean));
  }

  function createNavigation() {
    const existing = document.querySelector('[data-vf-friend-navigation]');
    if (existing) return existing;
    const anchor = document.querySelector('[data-site-header], [data-book-nav], .vf-portal-nav');
    if (!anchor) return null;
    const navigation = document.createElement('nav');
    navigation.className = 'vf-friend-nav';
    if (anchor.matches('.vf-portal-nav')) navigation.classList.add('is-portal-nav');
    else if (anchor.matches('[data-book-nav]')) navigation.classList.add('is-book-nav');
    else navigation.classList.add('is-home-nav');
    navigation.dataset.vfFriendNavigation = '';
    navigation.setAttribute('aria-label', 'Friend tools');
    navigation.hidden = true;
    navigation.innerHTML = links.map(([href, label]) => `<a href="${href}">${label}</a>`).join('');
    anchor.insertAdjacentElement('afterend', navigation);
    const current = location.pathname;
    navigation.querySelectorAll('a').forEach((link) => {
      const url = new URL(link.href, location.origin);
      const modeMatches = url.pathname === '/creator.html' && current === '/creator.html' && url.hash === location.hash;
      if ((url.pathname === current && url.pathname !== '/creator.html') || modeMatches) link.classList.add('active');
    });
    return navigation;
  }

  const navigation = createNavigation();
  if (!navigation) return;
  window.dispatchEvent(new CustomEvent('vf:friend-navigation-ready', { detail: { navigation } }));

  function applyRoles(roles) {
    const friend = roles.has('friend');
    navigation.hidden = !friend;
    navigation.setAttribute('aria-hidden', String(!friend));
    document.documentElement.dataset.vfFriendNav = String(friend);
  }

  function bindIdentity(identity) {
    if (!identity || identity.__vfFriendNavigationBound) return;
    identity.__vfFriendNavigationBound = true;
    identity.on?.('init', (user) => applyRoles(rolesFrom(user)));
    identity.on?.('login', (user) => applyRoles(rolesFrom(user)));
    identity.on?.('logout', () => applyRoles(new Set()));
    applyRoles(rolesFrom(identity.currentUser?.()));
    try { identity.init?.(); } catch (_) {}
  }

  window.addEventListener('vf:identity', (event) => {
    applyRoles(new Set((event?.detail?.roles || []).map((role) => String(role).toLowerCase())));
  });

  if (window.netlifyIdentity) bindIdentity(window.netlifyIdentity);
  else {
    const script = document.createElement('script');
    script.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
    script.async = true;
    script.onload = () => bindIdentity(window.netlifyIdentity);
    script.onerror = () => applyRoles(new Set());
    document.head.appendChild(script);
  }
})();
