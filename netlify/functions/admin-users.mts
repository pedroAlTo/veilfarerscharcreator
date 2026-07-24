import type { Config, Context } from '@netlify/functions'
import { admin, getUser, verifyRequestOrigin } from '@netlify/identity'
import { requirePortalAdmin, userRoles } from './_role-access.mts'
import { purgeUserData } from './_user-data.mts'
import { responseHeaders } from './_firebase-admin.mts'

const json=(body:any,status=200)=>Response.json(body,{status,headers:responseHeaders})
const cleanEmail=(value:any)=>String(value||'').trim().toLowerCase()
const validEmail=(value:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const assignableRoles=(value:any)=>Array.from(new Set((Array.isArray(value)?value:[])
  .map((role:any)=>String(role||'').trim().toLowerCase())
  .filter((role:string)=>role==='player'||role==='keeper')))
const safeUser=(user:any)=>({
  id:user.id,
  email:user.email||'',
  roles:[...userRoles(user)],
  invitedAt:user.invitedAt||null,
  confirmedAt:user.confirmedAt||null,
  createdAt:user.createdAt||null,
  lastSignInAt:user.lastSignInAt||null,
})
const identityOperator=()=>{
  const context=(globalThis as any).netlifyIdentityContext
  if(!context?.url||!context?.token)throw Object.assign(new Error('Netlify Identity operator context is unavailable.'),{status:503,code:'IDENTITY_OPERATOR_UNAVAILABLE'})
  return {url:String(context.url).replace(/\/$/,''),token:String(context.token)}
}

export default async(req:Request,_ctx:Context)=>{
  try{
    if(req.method!=='POST')return json({error:'Method not allowed.'},405)
    verifyRequestOrigin(req)
    const current:any=await getUser()
    requirePortalAdmin(current)
    const body:any=await req.json().catch(()=>({}))
    const action=String(body.action||'list')

    if(action==='list'){
      const users=await admin.listUsers({page:1,perPage:1000})
      return json({users:users.map(safeUser).sort((a,b)=>a.email.localeCompare(b.email))})
    }

    if(action==='invite'){
      const email=cleanEmail(body.email)
      const roles=assignableRoles(body.roles)
      if(!validEmail(email))return json({error:'Enter a valid email address.'},400)
      if(!roles.length)return json({error:'Select Player Tool, Keeper Tool, or both.'},400)
      const operator=identityOperator()
      const response=await fetch(`${operator.url}/invite`,{
        method:'POST',
        headers:{authorization:`Bearer ${operator.token}`,'content-type':'application/json'},
        body:JSON.stringify({email}),
      })
      const invited:any=await response.json().catch(()=>({}))
      if(!response.ok)throw Object.assign(new Error(invited.msg||invited.error||`Invitation failed (${response.status}).`),{status:response.status})
      const appMetadata={...(invited.app_metadata||{}),roles:['member',...roles]}
      const updated=await admin.updateUser(invited.id,{app_metadata:appMetadata})
      console.info('[admin-users]',{event:'invited',administrator:current.id,userId:updated.id,roles})
      return json({ok:true,user:safeUser(updated)})
    }

    const userId=String(body.userId||'')
    if(!userId)return json({error:'A user ID is required.'},400)
    if(userId===current.id)return json({error:'The active administrator account cannot be changed here.'},403)
    const target:any=await admin.getUser(userId)
    if(userRoles(target).has('admin'))return json({error:'Administrator accounts can only be managed directly in Netlify.'},403)

    if(action==='updateRoles'){
      const roles=assignableRoles(body.roles)
      const appMetadata={...(target.appMetadata||{}),roles:['member',...roles]}
      const updated=await admin.updateUser(userId,{app_metadata:appMetadata})
      console.info('[admin-users]',{event:'roles-updated',administrator:current.id,userId,roles})
      return json({ok:true,user:safeUser(updated)})
    }

    if(action==='deleteUser'){
      if(String(body.confirmEmail||'').trim().toLowerCase()!==cleanEmail(target.email)){
        return json({error:'Type the exact user email to confirm deletion.'},400)
      }
      const report=await purgeUserData(target.id,target.email)
      await admin.deleteUser(target.id)
      console.info('[admin-users]',{event:'user-deleted',administrator:current.id,userId,report})
      return json({ok:true,deletedUserId:userId,report})
    }

    return json({error:'Unknown administrator action.'},400)
  }catch(error:any){
    const status=Number(error?.status||error?.statusCode)||500
    console.error('[admin-users]',{status,code:error?.code||'ADMIN_USERS_FAILED',message:error?.message||String(error)})
    return json({error:status>=500?'Administrator user service failed.':(error?.message||'Request rejected.'),code:error?.code||'ADMIN_USERS_FAILED'},status)
  }
}

export const config:Config={path:'/api/admin-users'}
