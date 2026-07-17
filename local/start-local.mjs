#!/usr/bin/env node
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const ENV_FILE = join(HERE, '.env.local');
const args = new Set(process.argv.slice(2));

function parseEnv(text) {
  const output = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index < 1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    output[key] = value;
  }
  return output;
}

let fileEnv = {};
if (existsSync(ENV_FILE)) {
  try { fileEnv = parseEnv(await readFile(ENV_FILE, 'utf8')); }
  catch (error) { console.error('Could not read local/.env.local:', error.message); }
}
const env = { ...fileEnv, ...process.env };
const portArg = [...args].find(value => value.startsWith('--port='));
const port = Number(portArg ? portArg.split('=')[1] : env.VF_LOCAL_PORT || 8888);
const host = args.has('--lan') ? '0.0.0.0' : '127.0.0.1';

const mime = new Map([
  ['.html','text/html; charset=utf-8'], ['.js','text/javascript; charset=utf-8'], ['.mjs','text/javascript; charset=utf-8'],
  ['.css','text/css; charset=utf-8'], ['.json','application/json; charset=utf-8'], ['.wasm','application/wasm'],
  ['.png','image/png'], ['.jpg','image/jpeg'], ['.jpeg','image/jpeg'], ['.webp','image/webp'], ['.svg','image/svg+xml'],
  ['.pdf','application/pdf'], ['.txt','text/plain; charset=utf-8'], ['.md','text/markdown; charset=utf-8'],
  ['.woff','font/woff'], ['.woff2','font/woff2'], ['.ttf','font/ttf'], ['.mp3','audio/mpeg'], ['.wav','audio/wav']
]);

function firebaseConfig() {
  if (!env.FIREBASE_API_KEY) return null;
  return {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN || 'voidlight-character-sheets.firebaseapp.com',
    projectId: env.FIREBASE_PROJECT_ID || 'voidlight-character-sheets',
    storageBucket: env.FIREBASE_STORAGE_BUCKET || 'voidlight-character-sheets.firebasestorage.app',
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || '639672297658',
    appId: env.FIREBASE_APP_ID || '1:639672297658:web:974ddf6ad725cc176e7a83',
    measurementId: env.FIREBASE_MEASUREMENT_ID || 'G-L1Z048Y3L2'
  };
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Content-Length':Buffer.byteLength(body)});
  res.end(body);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  let relative = normalize(decoded).replace(/^([/\\])+/, '');
  if (!relative || relative.endsWith(sep)) relative += 'index.html';
  const parts = relative.split(/[\\/]+/);
  if (parts.some(part => part === '..' || part.startsWith('.'))) return null;
  const target = resolve(ROOT, relative);
  return target.startsWith(ROOT + sep) || target === ROOT ? target : null;
}

async function serveFile(req, res, target) {
  let info;
  try { info = await stat(target); }
  catch { sendJson(res, 404, {error:'Not found'}); return; }
  if (info.isDirectory()) return serveFile(req, res, join(target, 'index.html'));
  const type = mime.get(extname(target).toLowerCase()) || 'application/octet-stream';
  const headers = {'Content-Type':type,'Accept-Ranges':'bytes','Cache-Control':'no-store'};
  const range = req.headers.range;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1;
      if (start <= end && start < info.size) {
        res.writeHead(206, {...headers,'Content-Range':`bytes ${start}-${end}/${info.size}`,'Content-Length':end-start+1});
        if (req.method === 'HEAD') return res.end();
        createReadStream(target,{start,end}).pipe(res); return;
      }
    }
    res.writeHead(416, {'Content-Range':`bytes */${info.size}`}); res.end(); return;
  }
  res.writeHead(200, {...headers,'Content-Length':info.size});
  if (req.method === 'HEAD') return res.end();
  createReadStream(target).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (!['GET','HEAD'].includes(req.method || 'GET')) return sendJson(res, 405, {error:'Method not allowed'});
    if (url.pathname === '/api/firebase-config') {
      const config = firebaseConfig();
      if (!config) return sendJson(res, 503, {error:'Local Firebase is not configured. Copy local/.env.local.example to local/.env.local and set FIREBASE_API_KEY.'});
      return sendJson(res, 200, config);
    }
    if (url.pathname === '/api/local-status') return sendJson(res, 200, {local:true,firebaseConfigured:!!firebaseConfig(),host,port});
    if (url.pathname === '/local-runtime.js') {
      const body = `(function(){const h=String(location.hostname||'').toLowerCase();const privateHost=h==='localhost'||h==='127.0.0.1'||h==='::1'||h.startsWith('10.')||h.startsWith('192.168.')||/^172\\.(1[6-9]|2\\d|3[01])\\./.test(h);window.VF_LOCAL_TEST=true;window.VF_IS_LOCAL_TEST=privateHost;window.VF_LOCAL_SERVER=${JSON.stringify({host,port})};})();\n`;
      res.writeHead(200, {'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store','Content-Length':Buffer.byteLength(body)});
      return res.end(body);
    }
    const target = safePath(url.pathname);
    if (!target) return sendJson(res, 403, {error:'Forbidden'});
    await serveFile(req, res, target);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, {error:'Local server error',detail:error.message});
  }
});

server.listen(port, host, () => {
  console.log('\nVeilFarers local test server');
  console.log('-----------------------------');
  console.log(`Local: http://localhost:${port}`);
  if (host === '0.0.0.0') {
    for (const entries of Object.values(os.networkInterfaces())) {
      for (const entry of entries || []) if (entry.family === 'IPv4' && !entry.internal) console.log(`LAN:   http://${entry.address}:${port}`);
    }
  }
  console.log(`Firebase runtime config: ${firebaseConfig() ? 'configured' : 'NOT configured'}`);
  if (!firebaseConfig()) console.log('Copy local/.env.local.example to local/.env.local and add FIREBASE_API_KEY to test shared tables.');
  console.log('Press Ctrl+C to stop.\n');
});
