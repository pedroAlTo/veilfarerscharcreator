const COOKIE='vf_wip_access'
const encoder=new TextEncoder()
const b64url=(value:Uint8Array|string)=>{
  const bytes=typeof value==='string'?encoder.encode(value):value
  return Buffer.from(bytes).toString('base64url')
}
const unb64url=(value:string)=>Buffer.from(value,'base64url').toString('utf8')
const safeEqual=(a:string,b:string)=>{
  if(a.length!==b.length)return false
  let result=0
  for(let i=0;i<a.length;i++)result|=a.charCodeAt(i)^b.charCodeAt(i)
  return result===0
}
const secret=()=>{
  const value=String(Netlify.env.get('VF_WIP_ACCESS_SECRET')||'')
  if(value.length<32)throw Object.assign(new Error('VF_WIP_ACCESS_SECRET must contain at least 32 characters.'),{status:503})
  return value
}
const hmac=async(value:string)=>{
  const key=await crypto.subtle.importKey('raw',encoder.encode(secret()),{name:'HMAC',hash:'SHA-256'},false,['sign'])
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(value))))
}
export const tokenDigest=async(value:string)=>{
  const bytes=await crypto.subtle.digest('SHA-256',encoder.encode(String(value||'').trim()))
  return Buffer.from(bytes).toString('hex')
}
const cookieValue=(req:Request)=>{
  const cookies=req.headers.get('cookie')||''
  return cookies.split(';').map(value=>value.trim()).find(value=>value.startsWith(`${COOKIE}=`))?.slice(COOKIE.length+1)||''
}
export const issueWipCookie=async(user:any,tools:string[],expiresAt:number,inviteHash:string)=>{
  const payload=b64url(JSON.stringify({sub:user.id,email:user.email||'',tools,exp:expiresAt,jti:inviteHash}))
  const signature=await hmac(payload)
  const maxAge=Math.max(0,Math.floor((expiresAt-Date.now())/1000))
  return `${COOKIE}=${payload}.${signature}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`
}
export const clearWipCookie=()=>`${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`
export const requireWipAccess=async(req:Request,user:any,tool:'player'|'keeper')=>{
  const raw=cookieValue(req)
  const [payload,signature]=raw.split('.')
  if(!payload||!signature||!safeEqual(signature,await hmac(payload)))throw Object.assign(new Error('A valid WIP invitation is required.'),{status:403,code:'WIP_ACCESS_REQUIRED'})
  let grant:any
  try{grant=JSON.parse(unb64url(payload))}catch{throw Object.assign(new Error('Invalid WIP access grant.'),{status:403,code:'WIP_ACCESS_INVALID'})}
  let invites:any[]=[]
  try{invites=JSON.parse(String(Netlify.env.get('VF_WIP_INVITES_JSON')||'[]'))}catch{ }
  const invite=Array.isArray(invites)?invites.find(item=>item&&String(item.hash||'').toLowerCase()===String(grant.jti||'').toLowerCase()):null
  const inviteExpiry=Date.parse(String(invite?.expiresAt||''))
  const email=String(user?.email||'').trim().toLowerCase()
  if(grant.sub!==user?.id||Number(grant.exp)<=Date.now()||!Array.isArray(grant.tools)||!grant.tools.includes(tool)||
    !invite||invite.revoked===true||String(invite.email||'').trim().toLowerCase()!==email||
    (Number.isFinite(inviteExpiry)&&inviteExpiry<=Date.now())){
    throw Object.assign(new Error('This WIP access grant is expired or belongs to another account.'),{status:403,code:'WIP_ACCESS_DENIED'})
  }
  return grant
}
export const requireAnyWipAccess=async(req:Request,user:any)=>{
  try{return await requireWipAccess(req,user,'player')}catch(playerError:any){
    try{return await requireWipAccess(req,user,'keeper')}catch{throw playerError}
  }
}
