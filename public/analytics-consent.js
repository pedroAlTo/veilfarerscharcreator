(() => {
  'use strict';

  const measurementId = 'G-4Q3M1DEGDM';
  const storageKey = 'veilfarers.analytics-consent.v1';
  const spanish = (document.documentElement.lang || '').toLowerCase().startsWith('es');
  const copy = spanish ? {
    title: 'Privacidad y cookies',
    message: 'Con tu permiso, Google Analytics usará cookies de análisis para medir visitas y descargas de PDF. Es opcional; puedes rechazarlo y seguir usando el sitio.',
    accept: 'Aceptar analítica',
    reject: 'Rechazar analítica',
    details: 'Información de privacidad',
    settings: 'Configurar cookies',
    label: 'Aviso de cookies y analítica'
  } : {
    title: 'Privacy and cookies',
    message: 'With your permission, Google Analytics uses analytics cookies to measure visits and PDF downloads. This is optional; you can reject it and keep using the site.',
    accept: 'Accept analytics',
    reject: 'Reject analytics',
    details: 'Privacy details',
    settings: 'Cookie settings',
    label: 'Cookie and analytics notice'
  };

  let choice = readChoice();
  let tagInitialized = false;
  let tagLoading = false;
  const disableKey = 'ga-disable-' + measurementId;
  window[disableKey] = !choice?.analytics;

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
    window[disableKey] = false;
    const send = gtag();
    send('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    send('consent', 'update', {
      analytics_storage: 'granted',
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
  settings.textContent = copy.settings;
  settings.hidden = true;

  document.body.append(banner, settings);
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = '/analytics-consent.css?v=20261002-1';
  document.head.append(style);

  function showSettings() {
    banner.hidden = false;
    settings.hidden = true;
    banner.querySelector('[data-analytics-choice="' + (choice?.analytics ? 'accept' : 'reject') + '"]')?.focus({ preventScroll: true });
  }

  function save(analytics) {
    const wasGranted = choice?.analytics === true;
    storeChoice(analytics);
    banner.hidden = true;
    settings.hidden = false;
    if (analytics) {
      window[disableKey] = false;
      if ((tagInitialized || tagLoading) && !wasGranted) updateConsent(true);
      loadGoogleTag();
      if (tagInitialized && !wasGranted) window.gtag('event', 'page_view', { page_location: location.origin + location.pathname });
    } else {
      window[disableKey] = true;
      if (tagInitialized || tagLoading) updateConsent(false);
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
    if (!choice?.analytics || window[disableKey] || typeof window.gtag !== 'function') return false;
    window.gtag('event', name, parameters);
    return true;
  };
  window.VeilFarersAnalytics = Object.freeze({
    open: showSettings,
    get consent() { return choice ? { analytics: choice.analytics } : null; }
  });

  if (choice?.analytics) {
    settings.hidden = false;
    loadGoogleTag();
  } else if (choice) {
    settings.hidden = false;
  } else {
    banner.hidden = false;
  }
})();
