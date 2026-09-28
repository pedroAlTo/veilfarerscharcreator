import {verifyRequestOrigin,getUser} from '@netlify/identity'
import {responseHeaders} from './_firebase-admin.mts'
import {requireContentAdmin} from './_role-access.mts'
import {mergeCtaConfig,contentError} from './_cta-config.mts'
import {readContentDocument,writeContentDocument,contentSnapshot} from './_content-store.mts'

const json=(body:any,status=200)=>Response.json(body,{status,headers:responseHeaders})
const production={getUser,verifyRequestOrigin,read:readContentDocument,write:writeContentDocument,now:()=>Date.now()}
export function createContentConfigHandler(overrides:Partial<typeof production>={}){
  const services={...production,...overrides}
  return async(req:Request,adminOnly=false)=>{
    try{
      if(req.method!=='GET'&&req.method!=='POST')return json({error:'Method not allowed.'},405)
      if(adminOnly&&req.method!=='GET')return json({error:'Method not allowed.'},405)
      let user:any=null
      if(req.method==='POST'||adminOnly){
        if(req.method==='POST')services.verifyRequestOrigin(req)
        user=await services.getUser()
        requireContentAdmin(user)
      }
      const stored=await services.read()
      if(req.method==='GET'){
        const config=contentSnapshot(stored,services.now())
        return json(adminOnly?{authorized:true,config}:config)
      }
      const body=await req.json().catch(()=>{throw contentError('The request body must contain valid JSON.','INVALID_CTA_CONFIG')})
      const config=mergeCtaConfig(stored?.data,body)
      if(Object.hasOwn(body,'updatedAt')&&body.updatedAt!==(stored?.data?.updatedAt||null)){
        throw contentError('Settings changed in another session. Reload them before saving again.','CONTENT_CONFIG_CONFLICT',409)
      }
      const saved=await services.write(config,user.id,stored,services.now())
      return json(saved)
    }catch(error:any){
      const rawStatus=Number(error?.status||error?.statusCode)||503
      const status=rawStatus>=500?503:rawStatus
      console.error('[content-config]',{status,code:error?.code||'CONTENT_CONFIG_FAILED',message:error?.message||String(error)})
      return json({error:status>=500?'The publication service is temporarily unavailable. Saved settings have not been replaced.':(error?.message||'Request rejected.'),code:error?.code||'CONTENT_CONFIG_FAILED'},status)
    }
  }
}
