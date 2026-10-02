(function(){
  'use strict';
  const list = document.querySelector('#downloads-list');
  const release = document.querySelector('#canonical-release');
  const status = document.querySelector('#downloads-status');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  list.addEventListener('click', event => {
    const link = event.target.closest('a[data-vf-download]');
    if (!link || !list.contains(link) || typeof window.vfTrackEvent !== 'function') return;
    window.vfTrackEvent('download_pdf', {
      title: link.dataset.vfDownloadTitle,
      version: link.dataset.vfDownloadVersion,
      file: new URL(link.href, window.location.href).pathname
    });
  });
  const size = bytes => {
    const mb = Number(bytes || 0) / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(Number(bytes||0)/1024)} KB`;
  };
  fetch('/download/downloads.json',{cache:'no-cache'}).then(response=>{
    if(!response.ok)throw new Error(`Manifest ${response.status}`);
    return response.json();
  }).then(manifest=>{
    if(!manifest || !Array.isArray(manifest.items))throw new Error('Invalid download catalogue');
    const currentItems = manifest.items.filter(item => item && item.current !== false && !['deprecated','superseded','withdrawn'].includes(String(item.lifecycle || item.status || '').toLowerCase()));
    if(!currentItems.length)throw new Error('Empty download catalogue');
    if(currentItems.some(item => typeof item.file !== 'string' || !/^\/download\/[A-Za-z0-9_.-]+\.pdf$/.test(item.file)))throw new Error('Invalid PDF link');
    release.textContent = manifest.release || release.textContent;
    status.textContent = manifest.pdfCandidateStatus || '';
    const cover = item => item && item.cover
      ? `<div class="vf-cover"><img src="${esc(item.cover)}" alt="${esc(item.coverAlt || '')}" width="${Number(item.coverWidth) || 600}" height="${Number(item.coverHeight) || 776}" style="aspect-ratio:${Number(item.coverWidth) || 600}/${Number(item.coverHeight) || 776}" loading="lazy" decoding="async"></div>`
      : '';
    list.innerHTML = currentItems.map(item=>`<article class="vf-download-card${item.cover ? ' has-cover' : ''}">
      ${cover(item)}
      <div class="vf-eyebrow">${esc(item.type)} · ${esc(item.status || '')}</div>
      <h2>${esc(item.title)}</h2>
      <p>${esc(item.description || `Canonical VeilFarers ${item.version} PDF candidate.`)}</p>
      <div class="vf-download-meta"><span>${esc(item.version)}</span><span>${esc(size(item.bytes))}</span></div>
      <a class="vf-button primary" href="${esc(item.file)}" download data-vf-download data-vf-download-title="${esc(item.title)}" data-vf-download-version="${esc(item.version)}">${esc(item.downloadLabel || 'Download PDF')}</a>
    </article>`).join('');
  }).catch(()=>{
    status.textContent = 'The latest catalogue could not be checked. The published PDFs below are still available; reload to try again.';
  });
})();
