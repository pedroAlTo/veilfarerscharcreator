import type { Config, Context } from '@netlify/functions'
import { getUser } from '@netlify/identity'
import { firebaseCustomToken, responseHeaders } from './_firebase-admin.mts'
export default async(_req:Request,_ctx:Context)=>{
 try{const user=await getUser();if(!user)return Response.json({error:'Sign in to VeilFarers first.'},{status:401,headers:responseHeaders});const displayName=(user.userMetadata as any)?.full_name||user.email||'VeilFarer';return Response.json({customToken:firebaseCustomToken(user.id,{email:user.email||'',name:displayName}),user:{id:user.id,email:user.email||'',name:displayName}},{headers:responseHeaders})}catch(e){console.error(e);return Response.json({error:'Could not create the Firebase session.'},{status:500,headers:responseHeaders})}
}
export const config:Config={path:'/api/firebase-auth-token'}
