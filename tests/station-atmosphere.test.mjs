import test from 'node:test';
import assert from 'node:assert/strict';
import {stationWindows} from '../public/station-windows.mjs';
import {engineeringSpark,starGlint} from '../public/station-starfield.mjs';

test('Residential includes independently traced panes on all three physical modules',()=>{
 const centers=stationWindows.residential.map(points=>{
  const corners=points.split(' ').map(p=>p.split(',').map(Number));
  return corners.reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4],[0,0]);
 });
 const modules=[([x,y])=>x<390&&y<715,([x,y])=>x<230&&y>775,([x,y])=>x>300&&y>730];
 for(const contains of modules)assert.ok(centers.filter(contains).length>=5,'Each residential pod has several individually controlled panes');
 assert.ok(centers.every(p=>modules.filter(contains=>contains(p)).length===1),'Every residential pane belongs to one pod');
});

test('The engineering discharge is brief, rare and absent at initial selection',()=>{
 let lit=0,run=0,longest=0,bursts=0;
 for(let i=0;i<201000;i++){
  const seconds=i/1000,value=engineeringSpark(seconds);
  assert.ok(value>=0&&value<=1);
  if(seconds<40)assert.equal(value,0);
  if(value>0){lit++;if(!run)bursts++;run++;longest=Math.max(longest,run);}else run=0;
 }
 assert.equal(bursts,3);
 assert.ok(lit/201000<.003,'Blue light occupies less than 0.3% of viewing time');
 assert.ok(longest<=190,'Each discharge ends within 190 milliseconds');
});

test('Star glints brighten individually and return to their normal light',()=>{
 assert.equal(starGlint(0,5,40),0);
 assert.ok(starGlint(.675,0,40)>.99);
 assert.equal(starGlint(2,0,40),0);
 assert.equal(starGlint(.675,8,40),0,'A different star does not flash in unison');
 for(let t=0;t<120;t+=.05)assert.ok(starGlint(t,13,43)>=0&&starGlint(t,13,43)<=1);
});
