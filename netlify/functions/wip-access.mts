import type { Config, Context } from '@netlify/functions'
import { getUser, verifyRequestOrigin } from '@netlify/identity'
import { clearWipCookie, issueWipCookie, requireWipAccess, tokenDigest } from './_wip-access.mts'

const headers={'cache-control':'no-store','content-type':'application/json; charset=utf-8'}
const json=(body:any,status=200,extra:Record<string,string>={})=>Response.json(body,{status,headers:{...headers,...extra}})
const allowedTools=(value:any)=>Array.from(new Set((Array.isArray(value)?value:[]).filter(tool=>tool==='player'||tool==='keeper')))

export default async(req:Request,_ctx:Context)=>{
  try{
    if(req.method!=='POST')return json({error:'Method not allowed.'},405)
    verifyRequestOrigin(req)
    const user:any=await getUser()
    if(!user)return json({error:'Sign in before using a WIP invitation.'},401)
    const body:any=await req.json().catch(()=>({}))
    const action=String(body.action||'check')
    const tool=body.tool==='keeper'?'keeper':'player'
    if(action==='logout')return json({ok:true},200,{'set-cookie':clearWipCookie()})
    if(action==='check'){
      const grant=await requireWipAccess(req,user,tool)
      return json({ok:true,tool,user:{id:user.id,email:user.email||''},expiresAt:grant.exp})
    }
    if(action!=='redeem')return json({error:'Unknown action.'},400)
    const token=String(body.token||'').trim()
    if(token.length<16||token.length>256)return json({error:'Enter a valid invitation token.'},400)
    const raw=String(Netlify.env.get('VF_WIP_INVITES_JSON')||'[]')
    let invites:any[]
    try{invites=JSON.parse(raw)}catch{return json({error:'WIP invitation configuration is invalid.'},503)}
    if(!Array.isArray(invites))return json({error:'WIP invitation configuration is invalid.'},503)
    const digest=await tokenDigest(token)
    const invite=invites.find(item=>item&&String(item.hash||'').toLowerCase()===digest)
    if(!invite||invite.revoked===true)return json({error:'Invitation token not recognized or revoked.'},403)
    const email=String(user.email||'').trim().toLowerCase()
    if(!invite.email||String(invite.email).trim().toLowerCase()!==email)return json({error:'This invitation belongs to a different account.'},403)
    const tools=allowedTools(invite.tools)
    if(!tools.includes(tool))return json({error:`This invitation does not grant ${tool} access.`},403)
    const configuredExpiry=Date.parse(String(invite.expiresAt||''))
    const expiresAt=Math.min(Number.isFinite(configuredExpiry)?configuredExpiry:Date.now()+7*86400000,Date.now()+7*86400000)
    if(expiresAt<=Date.now())return json({error:'This invitation has expired.'},403)
    console.info('[wip-access]',{event:'redeemed',userId:user.id,email,tool,expiresAt})
    return json({ok:true,tool,user:{id:user.id,email},expiresAt},200,{'set-cookie':await issueWipCookie(user,tools,expiresAt,digest)})
  }catch(error:any){
    const status=Number(error?.status||error?.statusCode)||500
    return json({error:status>=500?'WIP access service failed.':(error?.message||'Access denied.'),code:error?.code||'WIP_ACCESS_FAILED'},status)
  }
}
export const config:Config={path:'/api/wip-access'}
