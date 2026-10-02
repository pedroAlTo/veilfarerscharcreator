(() => {
  'use strict';

  const measurementId = 'G-4Q3M1DEGDM';
  const storageKey = 'veilfarers.analytics-consent.v1';
  const spanish = (document.documentElement.lang || '').toLowerCase().startsWith('es');
  const copy = spanish ? {
    title: 'Privacidad y cookies',
    message: 'Google Analytics sólo usará cookies analíticas si das permiso. Si las rechazas, puede enviar una señal de visita limitada y sin cookies. Puedes cambiar tu decisión cuando quieras.',
    accept: 'Aceptar analítica',
    reject: 'Rechazar analítica',
    details: 'Información de privacidad',
    settings: 'Configurar cookies',
    label: 'Aviso de cookies y analítica'
  } : {
    title: 'Privacy and cookies',
    message: 'Google Analytics uses analytics cookies only with your permission. If you reject them, it may still send a limited, cookieless page-view signal. You can change your choice at any time.',
    accept: 'Accept analytics',
    reject: 'Reject analytics',
    details: 'Privacy details',
    settings: 'Cookie settings',
    label: 'Cookie and analytics notice'
  };

  let choice = readChoice();
  let tagInitialized = false;
  let tagLoading = false;
  function readChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || 'null');
      return value?.version === 1 && typeof value.analytics === 'boolean' ? value : null;
    } catch {
      return null;
    }
  }

  function storeChoice(analytics) {
    choice = { version: 1, analytics, updatedAt: new Date().toISOString() };
    try { localStorage.setItem(storageKey, JSON.stringify(choice)); } catch { /* The current choice still applies for this page. */ }
  }

  function gtag() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };
    return window.gtag;
  }

  function updateConsent(analytics) {
    const send = gtag();
    send('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }

  function loadGoogleTag() {
    if (tagInitialized || tagLoading) return;
    tagLoading = true;
    const send = gtag();
    send('consent', 'default', {
      analytics_storage: choice?.analytics ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    send('js', new Date());
    send('config', measurementId, {
      send_page_view: true,
      page_location: location.origin + location.pathname,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 15552000,
      cookie_update: false
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    script.onload = () => { tagInitialized = true; tagLoading = false; };
    script.onerror = () => { tagLoading = false; };
    document.head.append(script);
  }

  function removeAnalyticsCookies() {
    const names = document.cookie.split(';').map(item => item.trim().split('=')[0]).filter(name => /^_(?:ga(?:_|$)|gid$|gat$|gac_)/.test(name));
    const domains = ['', location.hostname, '.' + location.hostname.replace(/^www\./, '')];
    for (const name of names) {
      for (const domain of new Set(domains)) {
        document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '') + '; SameSite=Lax; Secure';
      }
    }
  }

  const banner = document.createElement('section');
  banner.className = 'vf-analytics-consent';
  banner.dataset.analyticsBanner = '';
  banner.setAttribute('aria-label', copy.label);
  banner.hidden = true;
  banner.innerHTML = '<div class="vf-analytics-consent__copy"><strong>' + copy.title + '</strong><p></p><a href="/legal.html#storage"></a></div><div class="vf-analytics-consent__actions"><button type="button" data-analytics-choice="accept"></button><button type="button" data-analytics-choice="reject"></button></div>';
  banner.querySelector('p').textContent = copy.message;
  banner.querySelector('a').textContent = copy.details;
  banner.querySelector('[data-analytics-choice="accept"]').textContent = copy.accept;
  banner.querySelector('[data-analytics-choice="reject"]').textContent = copy.reject;

  const settings = document.createElement('button');
  settings.className = 'vf-analytics-settings';
  settings.type = 'button';
  settings.dataset.analyticsSettings = '';
  settings.setAttribute('aria-label', copy.settings);
  settings.title = copy.settings;
  settings.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.2a8.8 8.8 0 1 0 8.8 8.8c0-.6-.1-1.2-.2-1.8a2.5 2.5 0 0 1-3.2-3.2A8.8 8.8 0 0 0 12 3.2Z"/><circle cx="8.1" cy="9" r="1"/><circle cx="11.3" cy="6.8" r=".9"/><circle cx="7.6" cy="13.2" r=".9"/><circle cx="12.1" cy="15.6" r="1"/><circle cx="15.2" cy="11.2" r=".8"/></svg>';
  settings.hidden = true;

  document.body.append(banner, settings);
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/analytics-consent.css?v=20261002-2';
  document.head.append(style);

  function showSettings() {
    banner.hidden = false;
    settings.hidden = true;
    banner.querySelector('[data-analytics-choice="' + (choice?.analytics ? 'accept' : 'reject') + '"]')?.focus({ preventScroll: true });
  }

  function save(analytics) {
    storeChoice(analytics);
    banner.hidden = true;
    settings.hidden = false;
    updateConsent(analytics);
    if (analytics) {
      loadGoogleTag();
    } else {
      removeAnalyticsCookies();
    }
    settings.focus({ preventScroll: true });
    window.dispatchEvent(new CustomEvent('vf:analytics-consent', { detail: { analytics } }));
  }

  banner.addEventListener('click', event => {
    const button = event.target.closest('[data-analytics-choice]');
    if (button) save(button.dataset.analyticsChoice === 'accept');
  });
  settings.addEventListener('click', showSettings);
  document.querySelectorAll('.vf-analytics-inline-settings').forEach(button => button.addEventListener('click', showSettings));

  window.vfTrackEvent = (name, parameters = {}) => {
    if (!choice?.analytics || typeof window.gtag !== 'function') return false;
    window.gtag('event', name, parameters);
    return true;
  };
  const bookPdfFiles = new Set([
    '/download/VeilFarers_Corebook_12.06.pdf',
    '/download/VeilFarers_Keepers_Companion_12.06.pdf',
    '/download/VeilFarers_Hearts_in_the_Void_12.06.pdf',
    '/download/VeilFarers_Rust_and_Steel_12.06.pdf',
    '/download/VeilFarers_Alien_Species_12.06.pdf',
    '/download/VeilFarers_First_Crossing_1.1.pdf'
  ]);
  document.addEventListener('click', event => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith('/download/') || !/\.pdf$/i.test(url.pathname)) return;
    const file = url.pathname;
    const group = link.dataset.vfDownloadGroup || (bookPdfFiles.has(file) ? 'books' : 'accessories');
    const title = link.dataset.vfDownloadTitle || decodeURIComponent(file.split('/').pop()).replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ');
    const version = link.dataset.vfDownloadVersion || '';
    const parameters = { title, version, file, download_group: group, source: location.pathname };
    window.vfTrackEvent('download_pdf', parameters);
    window.vfTrackEvent(group === 'books' ? 'book_download' : 'accessory_download', parameters);
  });
  window.VeilFarersAnalytics = Object.freeze({
    open: showSettings,
    get consent() { return choice ? { analytics: choice.analytics } : null; }
  });

  loadGoogleTag();
  if (choice) {
    settings.hidden = false;
  } else {
    banner.hidden = false;
  }
})();
