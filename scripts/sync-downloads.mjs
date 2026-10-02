import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const size = bytes => {
  const megabytes = Number(bytes || 0) / 1024 / 1024;
  return megabytes >= 1 ? `${megabytes.toFixed(1)} MB` : `${Math.round(Number(bytes || 0) / 1024)} KB`;
};

export function renderDownloads(manifest) {
  return manifest.items.filter(item => item && item.current !== false && !['deprecated', 'superseded', 'withdrawn'].includes(String(item.lifecycle || item.status || '').toLowerCase())).map(item => {
    if (!/^\/download\/[A-Za-z0-9_.-]+\.pdf$/.test(item.file)) throw new Error('Invalid PDF link');
    const cover = item.cover ? `<div class="vf-cover"><img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.coverAlt || '')}" width="${Number(item.coverWidth) || 600}" height="${Number(item.coverHeight) || 776}" style="aspect-ratio:${Number(item.coverWidth) || 600}/${Number(item.coverHeight) || 776}" loading="lazy" decoding="async"></div>` : '';
    return `<article class="vf-download-card${item.cover ? ' has-cover' : ''}">
      ${cover}
      <div class="vf-eyebrow">${escapeHtml(item.type)} · ${escapeHtml(item.status || '')}</div>
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.description || `Canonical VeilFarers ${item.version} PDF candidate.`)}</p>
      <div class="vf-download-meta"><span>${escapeHtml(item.version)}</span><span>${escapeHtml(size(item.bytes))}</span></div>
      <a class="vf-button primary" href="${escapeHtml(item.file)}" download data-vf-download data-vf-download-title="${escapeHtml(item.title)}" data-vf-download-version="${escapeHtml(item.version)}">${escapeHtml(item.downloadLabel || 'Download PDF')}</a>
    </article>`;
  }).join('\n');
}

export function syncDownloads(page, manifest) {
  return page
    .replace(/(<strong id="canonical-release">)[^<]*(<\/strong>)/, (_, opening, closing) => `${opening}${escapeHtml(manifest.release)}${closing}`)
    .replace(/(<p class="vf-status" id="downloads-status"[^>]*>)[\s\S]*?(<\/p>)/, (_, opening, closing) => `${opening}${escapeHtml(manifest.pdfCandidateStatus || '')}${closing}`)
    .replace(/(<div class="vf-downloads" id="downloads-list">)[\s\S]*?(<\/div>\s*<\/section>)/, (_, opening, closing) => `${opening}\n${renderDownloads(manifest)}\n      ${closing}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pagePath = new URL('../public/downloads.html', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('../public/download/downloads.json', import.meta.url), 'utf8'));
  const page = readFileSync(pagePath, 'utf8');
  const updated = syncDownloads(page, manifest);
  if (process.argv.includes('--check')) {
    if (updated !== page) throw new Error('Static downloads are out of date. Run npm run sync:downloads.');
    console.log('Static downloads match the current catalogue.');
  } else {
    writeFileSync(pagePath, updated);
    console.log('Static downloads updated from the current catalogue.');
  }
}
