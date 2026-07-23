import type { Config, Context } from '@netlify/functions'
import { getUser, verifyRequestOrigin } from '@netlify/identity'
import { requireToolAccess } from './_role-access.mts'
import { responseHeaders } from './_firebase-admin.mts'

const json=(body:any,status=200)=>Response.json(body,{status,headers:responseHeaders})

export default async(req:Request,_ctx:Context)=>{
  try{
    if(req.method!=='POST')return json({error:'Method not allowed.'},405)
    verifyRequestOrigin(req)
    const user:any=await getUser()
    const body:any=await req.json().catch(()=>({}))
    const tool=body.tool==='keeper'?'keeper':'player'
    const grant=requireToolAccess(user,tool)
    return json({ok:true,tool,user:{id:user.id,email:user.email||''},roles:grant.roles})
  }catch(error:any){
    const status=Number(error?.status||error?.statusCode)||500
    return json({error:status>=500?'Protected access service failed.':(error?.message||'Access denied.'),code:error?.code||'TOOL_ACCESS_FAILED'},status)
  }
}

export const config:Config={path:'/api/tool-access'}
