const compatibilityBadge = document.createElement('a');
compatibilityBadge.className = 'vf-compatible-badge';
compatibilityBadge.href = '/legal.html';
compatibilityBadge.setAttribute('aria-label', 'Daggerheart compatible community content');
compatibilityBadge.innerHTML = '<img src="/assets/legal/daggerheart-compatible-white-full-color.png" alt="Daggerheart compatible">';
document.body.append(compatibilityBadge);

const bookThemes = {
  corebook: 'core',
  'keepers-companion': 'keeper',
  'rust-and-steel': 'rust',
  'hearts-in-the-void': 'hearts',
  'alien-archives': 'alien'
};
const routeName = decodeURIComponent(location.pathname)
  .replace(/\/+$/, '')
  .split('/')
  .pop()
  .replace(/\.html$/i, '');
const bookTheme = document.body.dataset.bookTheme || bookThemes[routeName] || '';
if (bookTheme) {
  document.body.dataset.bookTheme = bookTheme;
  const atmosphereScript = document.createElement('script');
  atmosphereScript.src = '/book-background.js';
  document.head.append(atmosphereScript);
}

