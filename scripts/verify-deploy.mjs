#!/usr/bin/env node
// VeilFarers Portal — pre-merge deploy verification.
//
// Run from the repository root:   node scripts/verify-deploy.mjs
//
// Checks that caused real problems in the v59.81 package:
//   1. Nested duplicate copies of the site inside netlify/ or public/rules-data/
//   2. Internal documentation sitting inside the published directory
//   3. Referenced asset paths that do not resolve, including case-only mismatches
//   4. Release version drift across _headers, netlify.toml and deploy-version.json
//   5. Credential-shaped strings committed to the tree
//
// Exit code 1 if any ERROR is reported. WARN never fails the run.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, relative, dirname, basename, extname } from 'node:path'

const ROOT = process.cwd()
const PUBLIC = join(ROOT, 'public')
const errors = []
const warnings = []
const err = (area, message) => errors.push({ area, message })
const warn = (area, message) => warnings.push({ area, message })

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

// ---------------------------------------------------------------- 1. duplicates
const SITE_MARKERS = ['index.html', 'app.js', 'portal.js', 'creator.html', 'charsheet.html']
for (const dir of [join(ROOT, 'netlify'), join(PUBLIC, 'rules-data'), join(PUBLIC, 'assets')]) {
  if (!existsSync(dir)) continue
  const found = SITE_MARKERS.filter(m => existsSync(join(dir, m)))
  if (found.length) {
    err('duplicates', `${relative(ROOT, dir)}/ contains a nested copy of the site (${found.join(', ')}). Remove it.`)
  }
}
if (existsSync(join(ROOT, 'netlify'))) {
  const stray = readdirSync(join(ROOT, 'netlify')).filter(e => e !== 'functions')
  if (stray.length) err('duplicates', `netlify/ must contain only functions/. Found: ${stray.slice(0, 8).join(', ')}`)
}

// ------------------------------------------------------- 2. internal docs in publish
const INTERNAL = /^(portal_handover|github_deploy_summary|validation|security_|start_here|legal_launch_checklist|netlify_secret_scan|product_review|firestore_v)/i
const PUBLISHABLE_DOCS = new Set(['third_party_notices.md', 'readme.md'])
for (const file of walk(PUBLIC)) {
  const name = basename(file)
  const ext = extname(name).toLowerCase()
  if (PUBLISHABLE_DOCS.has(name.toLowerCase())) continue
  if (INTERNAL.test(name)) err('leak', `Internal document published: public/${relative(PUBLIC, file)}`)
  else if (ext === '.docx') err('leak', `Working document published: public/${relative(PUBLIC, file)}`)
  else if (/_v59\.\d+\.(png|jpg)$/i.test(name)) warn('leak', `QA screenshot published: public/${relative(PUBLIC, file)}`)
}

// -------------------------------------------------------------- 3. asset references
const CODE_EXT = new Set(['.html', '.js', '.jsx', '.mjs', '.mts', '.css', '.json'])
const REF = /["'`(]\s*(\/?(?:assets|img|data|download|rules-data|adventures)\/[A-Za-z0-9_\-./%]+)/g
const HISTORIC = /11\.1-RC3/ // superseded download entries kept in changelog.json
const refs = new Map()
for (const file of walk(PUBLIC)) {
  if (!CODE_EXT.has(extname(file).toLowerCase())) continue
  if (file.includes('/assets/3d-dice/') || file.endsWith('.min.js')) continue
  const text = readFileSync(file, 'utf8')
  for (const match of text.matchAll(REF)) {
    const ref = match[1].replace(/^\//, '')
    if (ref.endsWith('/')) continue
    if (!refs.has(ref)) refs.set(ref, relative(ROOT, file))
  }
}
for (const [ref, from] of [...refs].sort()) {
  const target = join(PUBLIC, ref)
  if (existsSync(target)) continue
  if (HISTORIC.test(ref)) continue
  const dir = join(PUBLIC, dirname(ref))
  const want = basename(ref).toLowerCase()
  const onDisk = existsSync(dir) ? readdirSync(dir).find(e => e.toLowerCase() === want) : null
  if (onDisk) {
    err('case', `${ref} referenced by ${from}, but disk has ${join(dirname(ref), onDisk)}. Netlify URLs are case-sensitive.`)
  } else {
    err('missing', `${ref} referenced by ${from} does not exist under public/.`)
  }
}

// ------------------------------------------------------------- 4. version coherence
const versions = new Map()
const grab = (label, path, regex) => {
  const full = join(ROOT, path)
  if (!existsSync(full)) return warn('version', `${path} not found.`)
  const found = readFileSync(full, 'utf8').match(regex)
  if (found) versions.set(label, found[1])
  else warn('version', `No release marker found in ${path}.`)
}
grab('_headers', 'public/_headers', /X-VeilFarers-Release:\s*(v[\d.]+)/)
grab('netlify.toml', 'netlify.toml', /X-VeilFarers-Release\s*=\s*"(v[\d.]+)"/)
grab('deploy-version.json', 'public/data/deploy-version.json', /"version":\s*"(v[\d.]+)"/)
grab('package.json', 'package.json', /"version":\s*"([\d.]+)"/)
const normalised = new Set([...versions].map(([, v]) => v.replace(/^v/, '').replace(/\.0$/, '')))
if (normalised.size > 1) {
  err('version', `Release drift: ${[...versions].map(([k, v]) => `${k}=${v}`).join(', ')}`)
}

// -------------------------------------------------------------------- 5. secrets
const SECRETS = [
  [/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/, 'private key block'],
  [/AIza[0-9A-Za-z_-]{35}/, 'Google API key literal'],
  [/"type"\s*:\s*"service_account"/, 'service account JSON'],
  [/\bsk-[A-Za-z0-9]{20,}/, 'API secret token'],
]
const SKIP_DIRS = ['node_modules', '.git', 'docs', 'public/assets/3d-dice']
for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file)
  if (SKIP_DIRS.some(d => rel.startsWith(d))) continue
  if (!/\.(js|jsx|mjs|mts|ts|html|json|toml|rules|env|txt|md)$/i.test(file)) continue
  let text
  try { text = readFileSync(file, 'utf8') } catch { continue }
  for (const [pattern, label] of SECRETS) {
    if (pattern.test(text)) err('secret', `${label} found in ${rel}. It must live in a Netlify environment variable.`)
  }
}

// ---------------------------------------------------------------------- report
const line = (kind, { area, message }) => `${kind}  [${area}] ${message}`
console.log(`VeilFarers deploy verification — ${refs.size} asset references checked\n`)
for (const w of warnings) console.log(line('WARN ', w))
for (const e of errors) console.log(line('ERROR', e))
if (!errors.length && !warnings.length) console.log('All checks passed.')
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`)
process.exit(errors.length ? 1 : 0)
