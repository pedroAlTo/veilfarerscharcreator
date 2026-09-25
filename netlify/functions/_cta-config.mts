export const CTA_IDS=['pricing','behind','books','crossing','release','beta','minis'] as const
export type CtaId=(typeof CTA_IDS)[number]
export type CtaSettings={enabled:boolean;startsAt:string|null;endsAt:string|null;priority:number}

const pricingDeadline='2026-10-07T21:59:59.000Z'
export const defaultCtaConfig=Object.freeze({
  version:1,
  notices:{
    pricing:{enabled:true,startsAt:null,endsAt:pricingDeadline,priority:1},
    behind:{enabled:true,startsAt:null,endsAt:null,priority:2},
    books:{enabled:true,startsAt:null,endsAt:null,priority:3},
    crossing:{enabled:true,startsAt:null,endsAt:null,priority:4},
    release:{enabled:true,startsAt:null,endsAt:null,priority:5},
    beta:{enabled:true,startsAt:null,endsAt:null,priority:6},
    minis:{enabled:true,startsAt:null,endsAt:null,priority:7},
  } satisfies Record<CtaId,CtaSettings>
})

const cleanDate=(value:any)=>{
  if(value===null||value===undefined||value==='')return null
  const time=Date.parse(String(value))
  if(!Number.isFinite(time))throw Object.assign(new Error('CTA dates must be valid ISO dates.'),{status:400,code:'INVALID_CTA_DATE'})
  return new Date(time).toISOString()
}

export function normalizeCtaConfig(value:any){
  const source=value?.notices&&typeof value.notices==='object'?value.notices:{}
  const notices:any={}
  for(const id of CTA_IDS){
    const fallback=defaultCtaConfig.notices[id]
    const item=source[id]&&typeof source[id]==='object'?source[id]:{}
    const startsAt=cleanDate(Object.hasOwn(item,'startsAt')?item.startsAt:fallback.startsAt)
    const endsAt=cleanDate(Object.hasOwn(item,'endsAt')?item.endsAt:fallback.endsAt)
    if(startsAt&&endsAt&&Date.parse(endsAt)<=Date.parse(startsAt)){
      throw Object.assign(new Error(`${id}: end time must be later than start time.`),{status:400,code:'INVALID_CTA_RANGE'})
    }
    notices[id]={
      enabled:typeof item.enabled==='boolean'?item.enabled:fallback.enabled,
      startsAt,
      endsAt,
      priority:Math.max(1,Math.min(99,Math.round(Number(item.priority)||fallback.priority)))
    }
  }
  return {version:1,notices}
}

export function ctaIsLive(settings:CtaSettings,now=Date.now()){
  if(!settings?.enabled)return false
  const starts=settings.startsAt?Date.parse(settings.startsAt):NaN
  const ends=settings.endsAt?Date.parse(settings.endsAt):NaN
  return (!Number.isFinite(starts)||now>=starts)&&(!Number.isFinite(ends)||now<ends)
}
