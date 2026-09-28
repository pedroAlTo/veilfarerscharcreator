import {getDoc,googleAccessToken,docBase,encode} from './_firebase-admin.mts'
import {normalizeCtaConfig,contentError,type ContentConfig} from './_cta-config.mts'

export const CONTENT_CONFIG_PATH='portalConfig/ctaSchedule'
export type StoredContent={data:any;updateTime?:string}|null
export const readContentDocument=()=>getDoc(CONTENT_CONFIG_PATH)
export function contentSnapshot(stored:StoredContent,now=Date.now()){
  return {...normalizeCtaConfig(stored?.data),updatedAt:typeof stored?.data?.updatedAt==='string'?stored.data.updatedAt:null,serverNow:new Date(now).toISOString()}
}
const production={getAccessToken:googleAccessToken,base:docBase,fetch:(...args:Parameters<typeof fetch>)=>fetch(...args)}
export function createContentWriter(overrides:Partial<typeof production>={}){
  const services={...production,...overrides}
  return async(config:ContentConfig,userId:string,stored:StoredContent,now=Date.now())=>{
    const token=await services.getAccessToken(),updatedAt=new Date(now).toISOString()
    if(stored&&!stored.updateTime)throw contentError('The publication record has no concurrency token.','CONTENT_STORE_INVALID',503)
    const precondition=new URLSearchParams(stored?{'currentDocument.updateTime':stored.updateTime!}:{'currentDocument.exists':'false'})
    const data={...config,updatedAt,updatedBy:userId}
    const fields=Object.fromEntries(Object.entries(data).map(([key,value])=>[key,encode(value)]))
    const response=await services.fetch(`${services.base()}/${CONTENT_CONFIG_PATH}?${precondition}`,{
      method:'PATCH',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify({fields})
    })
    if(!response.ok){
      const detail:any=await response.json().catch(()=>({}))
      if(response.status===409||response.status===412||['FAILED_PRECONDITION','ALREADY_EXISTS','ABORTED'].includes(detail?.error?.status)){
        throw contentError('Settings changed in another session. Reload them before saving again.','CONTENT_CONFIG_CONFLICT',409)
      }
      throw contentError('The publication settings could not be saved.','CONTENT_STORE_UNAVAILABLE',503)
    }
    return {...config,updatedAt,serverNow:new Date(now).toISOString()}
  }
}
export const writeContentDocument=createContentWriter()
