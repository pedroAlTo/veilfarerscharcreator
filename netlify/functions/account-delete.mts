import type { Config, Context } from '@netlify/functions'
import { admin, getUser, verifyRequestOrigin } from '@netlify/identity'
import { purgeUserData } from './_user-data.mts'
import { responseHeaders } from './_firebase-admin.mts'
import { userRoles } from './_role-access.mts'

const json=(body:any,status=200)=>Response.json(body,{status,headers:responseHeaders})

export default async(req:Request,_ctx:Context)=>{
  try{
    if(req.method!=='POST')return json({error:'Method not allowed.'},405)
    verifyRequestOrigin(req)
    const user:any=await getUser()
    if(!user)return json({error:'Sign in before deleting your account.'},401)
    const body:any=await req.json().catch(()=>({}))
    const expected=String(user.email||'').trim().toLowerCase()
    if(String(body.confirmEmail||'').trim().toLowerCase()!==expected||body.confirmation!=='DELETE MY DATA'){
      return json({error:'Type your exact account email and DELETE MY DATA to confirm.'},400)
    }
    if(userRoles(user).has('admin'))return json({error:'The administrator account must be deleted directly from Netlify after ownership transfer.'},403)
    const report=await purgeUserData(user.id,user.email)
    await admin.deleteUser(user.id)
    return json({ok:true,report})
  }catch(error:any){
    const status=Number(error?.status||error?.statusCode)||500
    console.error('[account-delete]',{status,code:error?.code||'ACCOUNT_DELETE_FAILED',message:error?.message||String(error)})
    return json({error:status>=500?'Account deletion could not be completed. No partial success is reported.':(error?.message||'Request rejected.'),code:error?.code||'ACCOUNT_DELETE_FAILED'},status)
  }
}

export const config:Config={path:'/api/account-delete'}
