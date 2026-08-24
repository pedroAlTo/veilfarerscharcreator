/*
 * release-version.js — single source of truth for the displayed book version.
 *
 * Reads /download/downloads.json once and injects the release into the page, so
 * the version never has to be hand-edited in HTML again. Declarative usage:
 *
 *   <span data-vf-release>…</span>
 *       -> textContent becomes the release (e.g. "12.03")
 *
 *   <p data-vf-release="The current editorial line is {release}: …">fallback</p>
 *       -> {release} and {line} are substituted in the template
 *
 *   <input data-vf-release-input="{release} Editorial · v59.81">
 *       -> value gets the template with {release}/{line} substituted
 *
 * {release} = manifest.release (short, e.g. "12.03")
 * {line}    = manifest.releaseLine || manifest.release (descriptive)
 *
 * If the manifest can't be loaded, existing HTML text/values are left untouched.
 */
(function () {
  'use strict';
  var promise = null;

  function load() {
    if (promise) return promise;
    promise = fetch('/download/downloads.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('downloads manifest ' + r.status); return r.json(); })
      .catch(function () { return null; });
    return promise;
  }

  function fill(tmpl, release, line) {
    if (!tmpl) return release;
    return tmpl.replace(/\{release\}/g, release).replace(/\{line\}/g, line);
  }

  function apply(manifest) {
    if (!manifest) return;
    var release = manifest.release || '';
    var line = manifest.releaseLine || release;
    if (!release) return;
    document.querySelectorAll('[data-vf-release]').forEach(function (el) {
      el.textContent = fill(el.getAttribute('data-vf-release'), release, line);
    });
    document.querySelectorAll('[data-vf-release-input]').forEach(function (el) {
      el.value = fill(el.getAttribute('data-vf-release-input') || '{release}', release, line);
    });
  }

  function run() { load().then(apply); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  window.VFReleaseVersion = { load: load, apply: apply };
})();
