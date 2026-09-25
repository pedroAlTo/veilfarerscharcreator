import type {Config,Context} from '@netlify/functions'
import {getUser,verifyRequestOrigin} from '@netlify/identity'
import {getDoc,putDoc,responseHeaders} from './_firebase-admin.mts'
import {requirePortalAdmin} from './_role-access.mts'
import {defaultCtaConfig,normalizeCtaConfig} from './_cta-config.mts'

const path='portalConfig/ctaSchedule'
const json=(body:any,status=200)=>Response.json(body,{status,headers:responseHeaders})

export default async(req:Request,_ctx:Context)=>{
  try{
    if(req.method==='GET'){
      let stored:any=null
      try{stored=await getDoc(path)}catch(error){console.warn('[cta-config] Using bundled defaults.',error)}
      const config=normalizeCtaConfig(stored?.data||defaultCtaConfig)
      return json({...config,serverNow:new Date().toISOString()})
    }
    if(req.method!=='POST')return json({error:'Method not allowed.'},405)
    verifyRequestOrigin(req)
    const user:any=await getUser()
    requirePortalAdmin(user)
    const body:any=await req.json().catch(()=>({}))
    const config=normalizeCtaConfig(body)
    await putDoc(path,{...config,updatedAt:new Date().toISOString(),updatedBy:user.id})
    console.info('[cta-config]',{event:'updated',administrator:user.id})
    return json({...config,serverNow:new Date().toISOString()})
  }catch(error:any){
    const status=Number(error?.status||error?.statusCode)||500
    console.error('[cta-config]',{status,code:error?.code||'CTA_CONFIG_FAILED',message:error?.message||String(error)})
    return json({error:status>=500?'CTA scheduling service failed.':(error?.message||'Request rejected.'),code:error?.code||'CTA_CONFIG_FAILED'},status)
  }
}

export const config:Config={path:'/api/cta-config'}
