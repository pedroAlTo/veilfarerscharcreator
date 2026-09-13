import test from 'node:test';
import assert from 'node:assert/strict';
import {rebootFrame} from '../public/archive-reboot.mjs';

test('intrusion progresses through shutdown, BIOS and masked login before returning',()=>{
 const boundaries=[[0,'warning'],[2800,'shutdown'],[3650,'off'],[4100,'bios'],[7500,'login'],[10900,'restore'],[11650,'ready']];
 for(const [time,stage] of boundaries)assert.equal(rebootFrame(time).stage,stage);
 assert.equal(rebootFrame(11649).stage,'restore');
 assert.equal(rebootFrame(50000).stage,'ready');
});

test('reduced motion keeps every narrative phase and shortens the sequence',()=>{
 const boundaries=[[0,'warning'],[1500,'shutdown'],[1750,'off'],[1900,'bios'],[3800,'login'],[6000,'restore'],[6350,'ready']];
 for(const [time,stage] of boundaries)assert.equal(rebootFrame(time,true).stage,stage);
 for(const reduced of [false,true])for(let time=-50;time<12000;time+=17){const frame=rebootFrame(time,reduced);assert(frame.progress>=0&&frame.progress<=1);}
});
