const compatibilityBadge = document.createElement('a');
compatibilityBadge.className = 'vf-compatible-badge';
compatibilityBadge.href = '/legal.html';
compatibilityBadge.setAttribute('aria-label', 'Daggerheart compatible community content');
compatibilityBadge.innerHTML = '<img src="/assets/legal/daggerheart-compatible-white-full-color.png" alt="Daggerheart compatible">';
document.body.append(compatibilityBadge);

const bookThemes = {
  '/books/corebook.html': 'core',
  '/books/keepers-companion.html': 'keeper',
  '/books/rust-and-steel.html': 'rust',
  '/books/hearts-in-the-void.html': 'hearts'
};
document.body.dataset.bookTheme = bookThemes[location.pathname] || 'core';
const atmosphereScript = document.createElement('script');
atmosphereScript.src = '/book-background.js';
document.head.append(atmosphereScript);

const nav = document.querySelector('[data-book-nav]');
const toggle = document.querySelector('[data-book-menu]');
if (nav && toggle) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}
