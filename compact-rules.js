(function(root){
'use strict';
const clean=v=>String(v||'').replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/[ \t]*\n[ \t]*/g,'\n').trim();
const titleCaseFix=s=>String(s||'').replace(/\s+/g,' ').trim();
function compactSentence(value){
 let s=clean(value).replace(/^[-◆•]\s*/,'').replace(/^(Effect|Benefit|Description|Mechanics):\s*/i,'');
 const replacements=[
  [/\bOnce per (scene|session|rest),?\s*/gi,(_,x)=>`1/${x} · `],
  [/\bmark (\d+) Stress to\s*/gi,'$1 Stress: '],[/\bmark 1 Stress\b/gi,'1 Stress'],
  [/\bspend (\d+) (Hope|Effort) to\s*/gi,'$1 $2: '],[/\bspend 1 (Hope|Effort)\b/gi,'1 $1'],
  [/\bDarkvision out to (Melee|Very Close|Close|Far|Very Far) range\b/gi,'Darkvision ($1)'],
  [/\bDetect living creatures behind thin barriers within (Melee|Very Close|Close|Far|Very Far) range\s*\(Thermal\)/gi,'Thermal life detection through thin barriers ($1)'],
  [/\bDetect living creatures behind thin barriers within (Melee|Very Close|Close|Far|Very Far) range\b/gi,'Detect life through thin barriers ($1)'],
  [/\bto any point (?:within )?(Melee|Very Close|Close|Far|Very Far)(?: range)? that you can see\b/gi,'to visible point ($1)'],
  [/\bout to (Melee|Very Close|Close|Far|Very Far) range\b/gi,'($1)'],
  [/\bwithin (Melee|Very Close|Close|Far|Very Far) range\b/gi,'($1)'],
  [/\bmove instantly to\b/gi,'teleport to'],
  [/\bthat you can see\b/gi,'visible'],
  [/\bignoring difficult terrain and obstacles shorter than your height\b/gi,'ignore difficult terrain/low obstacles'],
  [/\bUpon arriving,? you gain Advantage on your next\s*/gi,'Then Advantage: next '],
  [/\bYou gain Advantage on your next\s*/gi,'Advantage: next '],
  [/\bAdvantage on your next\s*/gi,'Advantage: next '],
  [/\bAdvantage on all (Agility|Strength|Finesse|Instinct|Presence|Knowledge) rolls to balance, climb, or move silently\b/gi,'Advantage: $1 (balance/climb/silent movement)'],
  [/\bAdvantage on all ([^.]+?) rolls to\s*/gi,'Advantage: $1 to '],
  [/\bDisadvantage on checks relying on\s*/gi,'Disadvantage: '],
  [/\bScale vertical surfaces without rolling out of combat or time (?:pressure|preassure)\s*\((?:minimum rugosity|minimun rugosity)\)/gi,'Climb rough vertical surfaces; no roll outside pressure'],
  [/\bwithout rolling out of combat or time pressure\b/gi,'no roll outside pressure'],
  [/\bout of combat or time pressure\b/gi,'outside pressure'],
  [/\bWhen there(?:'|’)?s a secret,? choose:?\s*/gi,'Secret: '],
  [/\bWhen theres a secret choose\s*/gi,'Secret: '],
  [/\b(?:to )?resist or yield on your own terms\b/gi,'resist or yield'],
  [/\bIf you yield and successfully uncover a secret,? gain\s*/gi,'Yield + uncover: +'],
  [/\bgain 1 Hope\/effort\b/gi,'+1 Hope/Effort'],
  [/\bgain 1 Hope or Effort\b/gi,'+1 Hope/Effort'],
  [/\byou gain\s+/gi,'gain '],[/\byou can\s+/gi,'can '],
  [/\bminimum rugosity\b/gi,'rough surface'],[/\bminimun rugosity\b/gi,'rough surface'],[/\btime preassure\b/gi,'time pressure'],
  [/\bfor the duration of the scene\b/gi,'for scene'],[/\buntil the end of the scene\b/gi,'until scene ends'],
  [/\buntil your next rest\b/gi,'until next rest'],[/\buntil the start of your next turn\b/gi,'until next turn'],
  [/\bmake a ([A-Z][A-Za-z]+) roll\b/g,'roll $1'],[/\bmake an? ([A-Z][A-Za-z]+) roll\b/g,'roll $1']
 ];
 replacements.forEach(([a,b])=>{s=s.replace(a,b);});
 s=s.replace(/\bHope\/effort\b/gi,'Hope/Effort')
    .replace(/\bAgility or Finesse roll\b/gi,'Agility/Finesse roll')
    .replace(/\s*([;:,])\s*/g,'$1 ')
    .replace(/\s+([.)])/g,'$1')
    .replace(/\(\s+/g,'(')
    .replace(/\s{2,}/g,' ')
    .replace(/\+\+/g,'+')
    .trim();
 if(s.length>230){const cut=s.slice(0,227);const p=Math.max(cut.lastIndexOf(';'),cut.lastIndexOf('.'),cut.lastIndexOf(','),cut.lastIndexOf(' '));s=(p>110?cut.slice(0,p):cut)+'…';}
 return s;
}
function entryFromChunk(chunk,fallback){
 const c=clean(chunk);if(!c)return null;
 let m=c.match(/^([^:\n]{2,80}):\s*([\s\S]+)$/);
 if(m)return {title:titleCaseFix(m[1]),body:m[2].trim()};
 m=c.match(/^(.+?\s·\s.+?)\s·\s((?:Once|When|Mark|Spend|Gain|You|Effect|Trigger|Passive|Action|Reaction)\b[\s\S]*)$/i);
 if(m)return {title:titleCaseFix(m[1]),body:m[2].trim()};
 return {title:fallback||'Feature',body:c};
}
function splitEntries(text,fallback){
 const source=clean(text);if(!source)return [];
 const entries=[];
 source.split(/\n{2,}/).filter(Boolean).forEach(paragraph=>{
   const inline=paragraph.replace(/\n+/g,' ').split(/(?<=[.!?])\s+(?=[A-Z][A-Za-z0-9'’()\- ]{2,70}:\s)/g).filter(Boolean);
   inline.forEach(chunk=>{
     const e=entryFromChunk(chunk,fallback);
     if(e)entries.push(e);
   });
 });
 return entries;
}
function compactBundle(text,fallback){
 return splitEntries(text,fallback).map(entry=>{
   const sentences=entry.body.split(/(?<=[.!?])\s+/).filter(Boolean).map(compactSentence).filter(Boolean);
   const body=sentences.slice(0,4).map(x=>x.replace(/[.!?]+$/,'')).join('; ').replace(/;\s*;/g,';') + (sentences.length ? '.' : '');
   return `${entry.title} — ${body}`;
 }).join('\n');
}
function bullets(text,fallback){
 return splitEntries(text,fallback).map(entry=>({title:entry.title,text:compactSentence(entry.body)}));
}
root.VFCompactRules=Object.freeze({compactSentence,compactBundle,bullets,splitEntries});
})(typeof window!=='undefined'?window:this);
