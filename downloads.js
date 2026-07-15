(function(){
  'use strict';
  const D = window.VeilFarersData;
  const list = document.querySelector('#downloads-list');
  const release = document.querySelector('#canonical-release');
  const status = document.querySelector('#downloads-status');
  const esc = D.escapeHtml;
  const size = bytes => {
    const mb = Number(bytes || 0) / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(Number(bytes||0)/1024)} KB`;
  };
  Promise.all([
    fetch('/download/downloads.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`Manifest ${r.status}`);return r.json();}),
    D.manifest()
  ]).then(([manifest,canonical])=>{
    release.textContent = canonical.release || manifest.release;
    status.textContent = manifest.pdfCandidateStatus || '';
    list.innerHTML = (manifest.items||[]).map(item=>`<article class="vf-download-card">
      <div class="vf-eyebrow">${esc(item.type)} · ${esc(item.status || '')}</div>
      <h2>${esc(item.title)}</h2>
      <p>${esc(item.description || `Canonical VeilFarers ${item.version} PDF candidate.`)}</p>
      <div class="vf-download-meta"><span>${esc(item.version)}</span><span>${esc(size(item.bytes))}</span></div>
      <a class="vf-button primary" href="${esc(item.file)}" download>${esc(item.downloadLabel || 'Download PDF')}</a>
    </article>`).join('');
  }).catch(err=>{ list.innerHTML=`<div class="vf-error">Downloads could not be loaded: ${esc(err.message)}</div>`; });
})();
