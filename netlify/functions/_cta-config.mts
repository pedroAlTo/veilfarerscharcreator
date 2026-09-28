export const CTA_IDS=['pricing','behind','books','crossing','release','beta','minis'] as const
export const ARTICLE_IDS=['overkill','drones'] as const
export type CtaId=(typeof CTA_IDS)[number]
export type ArticleId=(typeof ARTICLE_IDS)[number]
export type CtaSettings={enabled:boolean;startsAt:string|null;endsAt:string|null;priority:number}
export type ContentConfig={version:2;notices:Record<CtaId,CtaSettings>;articles:Record<ArticleId,CtaSettings>}

const pricingDeadline='2026-10-07T21:59:59.000Z'
export const defaultCtaConfig=Object.freeze({
  version:2 as const,
  notices:{
    pricing:{enabled:true,startsAt:null,endsAt:pricingDeadline,priority:1},
    behind:{enabled:true,startsAt:null,endsAt:null,priority:2},
    books:{enabled:true,startsAt:null,endsAt:null,priority:3},
    crossing:{enabled:true,startsAt:null,endsAt:null,priority:4},
    release:{enabled:true,startsAt:null,endsAt:null,priority:5},
    beta:{enabled:true,startsAt:null,endsAt:null,priority:6},
    minis:{enabled:true,startsAt:null,endsAt:null,priority:7},
  } satisfies Record<CtaId,CtaSettings>,
  articles:{
    overkill:{enabled:true,startsAt:null,endsAt:null,priority:2},
    drones:{enabled:true,startsAt:null,endsAt:null,priority:1},
  } satisfies Record<ArticleId,CtaSettings>
})

export const contentError=(message:string,code:string,status=400)=>Object.assign(new Error(message),{status,code})
const record=(value:any):value is Record<string,any>=>!!value&&typeof value==='object'&&!Array.isArray(value)
const cleanDate=(value:any)=>{
  if(value===null||value===undefined||value==='')return null
  const time=Date.parse(String(value))
  if(!Number.isFinite(time))throw contentError('Publication dates must be valid ISO dates.','INVALID_CTA_DATE')
  return new Date(time).toISOString()
}
const dateRange=(id:string,item:CtaSettings)=>{
  if(item.startsAt&&item.endsAt&&Date.parse(item.endsAt)<=Date.parse(item.startsAt)){
    throw contentError(`${id}: end time must be later than start time.`,'INVALID_CTA_RANGE')
  }
  return item
}

// Upgrade existing v1 documents without changing saved campaign settings.
export function normalizeCtaConfig(value:any):ContentConfig{
  const normalizeGroup=(ids:readonly string[],source:any,defaults:any)=>Object.fromEntries(ids.map(id=>{
    const fallback=defaults[id],item=record(source?.[id])?source[id]:{}
    return [id,dateRange(id,{
      enabled:typeof item.enabled==='boolean'?item.enabled:fallback.enabled,
      startsAt:cleanDate(Object.hasOwn(item,'startsAt')?item.startsAt:fallback.startsAt),
      endsAt:cleanDate(Object.hasOwn(item,'endsAt')?item.endsAt:fallback.endsAt),
      priority:Math.max(1,Math.min(99,Math.round(Number(item.priority)||fallback.priority)))
    })]
  }))
  return {
    version:2,
    notices:normalizeGroup(CTA_IDS,value?.notices,defaultCtaConfig.notices) as Record<CtaId,CtaSettings>,
    articles:normalizeGroup(ARTICLE_IDS,value?.articles,defaultCtaConfig.articles) as Record<ArticleId,CtaSettings>
  }
}

function strictDate(value:any,id:string,field:string){
  if(value===null)return null
  if(typeof value!=='string')throw contentError(`${id}: ${field} must be an ISO date or null.`,'INVALID_CTA_DATE')
  const match=value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/)
  if(!match)throw contentError(`${id}: ${field} needs a date, time and time zone.`,'INVALID_CTA_DATE')
  const [,year,month,day,hour,minute,second='0',,zone]=match
  const calendar=new Date(0);calendar.setUTCFullYear(+year,+month-1,+day);calendar.setUTCHours(0,0,0,0)
  const validCalendar=calendar.getUTCFullYear()===+year&&calendar.getUTCMonth()===+month-1&&calendar.getUTCDate()===+day
  const validZone=zone==='Z'||(+zone.slice(1,3)<=23&&+zone.slice(4,6)<=59)
  if(!validCalendar||+hour>23||+minute>59||+second>59||!validZone||!Number.isFinite(Date.parse(value))){
    throw contentError(`${id}: ${field} is not a valid date.`,'INVALID_CTA_DATE')
  }
  return new Date(value).toISOString()
}

// Patches preserve every field the administrator did not explicitly edit.
export function mergeCtaConfig(current:any,patch:any):ContentConfig{
  if(!record(patch))throw contentError('Expected a publication settings object.','INVALID_CTA_CONFIG')
  const allowed=new Set(['version','notices','articles','updatedAt'])
  for(const key of Object.keys(patch))if(!allowed.has(key))throw contentError(`Unknown settings field: ${key}.`,'UNKNOWN_CTA_FIELD')
  if(Object.hasOwn(patch,'version')&&patch.version!==1&&patch.version!==2)throw contentError('Unsupported publication settings version.','INVALID_CTA_CONFIG')
  if(Object.hasOwn(patch,'updatedAt')&&patch.updatedAt!==null)strictDate(patch.updatedAt,'settings','updatedAt')
  if(!Object.hasOwn(patch,'notices')&&!Object.hasOwn(patch,'articles'))throw contentError('No publication settings supplied.','INVALID_CTA_CONFIG')
  const result=normalizeCtaConfig(current)
  for(const [group,ids] of [['notices',CTA_IDS],['articles',ARTICLE_IDS]] as const){
    if(!Object.hasOwn(patch,group))continue
    if(!record(patch[group]))throw contentError(`${group} must be an object.`,'INVALID_CTA_CONFIG')
    for(const [id,item] of Object.entries(patch[group])){
      if(!(ids as readonly string[]).includes(id))throw contentError(`Unknown ${group} item: ${id}.`,'UNKNOWN_CTA_ID')
      if(!record(item))throw contentError(`${id}: settings must be an object.`,'INVALID_CTA_CONFIG')
      const next={...(result[group] as Record<string,CtaSettings>)[id]}
      for(const [field,value] of Object.entries(item)){
        if(field==='enabled'){
          if(typeof value!=='boolean')throw contentError(`${id}: enabled must be true or false.`,'INVALID_CTA_SETTING')
          next.enabled=value
        }else if(field==='startsAt'||field==='endsAt')next[field]=strictDate(value,id,field)
        else if(field==='priority'){
          if(typeof value!=='number'||!Number.isInteger(value)||value<1||value>99)throw contentError(`${id}: priority must be a whole number from 1 to 99.`,'INVALID_CTA_PRIORITY')
          next.priority=value
        }else throw contentError(`${id}: unknown setting ${field}.`,'UNKNOWN_CTA_FIELD')
      }
      ;(result[group] as Record<string,CtaSettings>)[id]=dateRange(id,next)
    }
  }
  return result
}

export function ctaIsLive(settings:CtaSettings,now=Date.now()){
  if(!settings?.enabled)return false
  const starts=settings.startsAt?Date.parse(settings.startsAt):null
  const ends=settings.endsAt?Date.parse(settings.endsAt):null
  if((starts!==null&&!Number.isFinite(starts))||(ends!==null&&!Number.isFinite(ends)))return false
  return (starts===null||now>=starts)&&(ends===null||now<ends)
}
