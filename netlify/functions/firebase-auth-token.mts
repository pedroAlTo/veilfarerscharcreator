import type { Config, Context } from '@netlify/functions'
import { getUser } from '@netlify/identity'
import { firebaseCustomToken, responseHeaders } from './_firebase-admin.mts'
export default async(_req:Request,_ctx:Context)=>{
 try{const user=await getUser();if(!user)return Response.json({error:'Sign in to VeilFarers first.'},{status:401,headers:responseHeaders});const displayName=(user.userMetadata as any)?.full_name||user.email||'VeilFarer';return Response.json({customToken:firebaseCustomToken(user.id,{email:user.email||'',name:displayName}),user:{id:user.id,email:user.email||'',name:displayName}},{headers:responseHeaders})}catch(error:any){const status=Number(error?.status||error?.statusCode)||500,code=String(error?.code||'FIREBASE_SESSION_FAILED');console.error('[firebase-auth-token]',{status,code,message:error?.message||String(error),stack:error?.stack});const configurationFailure=code.startsWith('FIREBASE_ADMIN_')||code==='FIREBASE_PROJECT_ID_MISSING';return Response.json({error:configurationFailure?`${error.message} Configure FIREBASE_SERVICE_ACCOUNT_JSON as a Functions-only Netlify environment variable.`:'Could not create the Firebase session.',code},{status,headers:responseHeaders})}
}
export const config:Config={path:'/api/firebase-auth-token'}
