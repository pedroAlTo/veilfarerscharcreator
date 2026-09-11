import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {lampLevel,fadingLevel} from '../public/station-lights.mjs';
const manifest=JSON.parse(readFileSync(new URL('../public/download/downloads.json',import.meta.url)));
test('12.06 books and 1.1 starter PDFs match their manifest checksums',()=>{
 assert.equal(manifest.release,'12.06');
 const ids=['corebook','keepers-companion','rust-and-steel','alien-species','hearts-in-the-void','first-crossing','first-crossing-table-kit','first-crossing-color-maps'];
 for(const id of ids){
  const item=manifest.items.find(x=>x.id===id);assert.ok(item);
  assert.equal(item.version,id.startsWith('first-crossing')?'1.1':'12.06');
  const data=readFileSync(new URL('../public'+item.file,import.meta.url));
  assert.equal(data.subarray(0,5).toString(),'%PDF-');
  assert.equal(data.length,item.bytes);assert.equal(createHash('sha256').update(data).digest('hex'),item.sha256);
 }
 assert.ok(manifest.items.every(item=>item.file.endsWith('.pdf')));
});
test('station starts unevenly and settles; reduced motion remains steady',()=>{
 assert.equal(lampLevel(0,6),0);
 assert.ok(lampLevel(.3,0)>lampLevel(.5,0));
 assert.ok(lampLevel(1,0)>lampLevel(1.2,0));
 for(let seed=0;seed<20;seed++)for(let t=0;t<60;t+=.07){
  const level=lampLevel(t,seed);assert.ok(level>=0&&level<=1);assert.equal(lampLevel(t,seed,true),1);
 }
});
test('previous sector fades from its actual level and reaches darkness',()=>{
 for(const initial of [0,.12,.5,1]){
  assert.equal(fadingLevel(initial,0),initial);
  let previous=initial;
  for(let t=0;t<2;t+=.02){const value=fadingLevel(initial,t);assert.ok(value<=previous);previous=value;}
  assert.equal(fadingLevel(initial,1.1),0);
 }
});
