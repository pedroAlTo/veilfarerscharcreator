import type { Config, Context } from '@netlify/functions'
import { getUser, verifyRequestOrigin } from '@netlify/identity'
import { encode, googleAccessToken, projectId, responseHeaders, serviceAccount } from './_firebase-admin.mts'
export default async(req:Request,_ctx:Context)=>{
 if(req.method!=='POST')return Response.json({error:'Method not allowed'},{status:405,headers:responseHeaders})
 try{
  verifyRequestOrigin(req);const user=await getUser();if(!user)return Response.json({error:'Sign in before allocating a permanent character ID.'},{status:401,headers:responseHeaders})
  const sa=serviceAccount(),project=projectId(sa),access=await googleAccessToken(sa),base=`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`,counter=`${base}/systemCounters/characters`
  for(let a=0;a<6;a++){
   const g=await fetch(counter,{headers:{authorization:`Bearer ${access}`}}),exists=g.ok,doc=exists?await g.json():null;if(!exists&&g.status!==404)throw Error('Counter read failed')
   const next=Math.max(1,Number(doc?.fields?.next?.integerValue||1)),id=`VF-${String(next).padStart(6,'0')}`,stamp=new Date().toISOString()
   const characterFields:any={characterId:id,schema:'veilfarers.character/2',ownerId:user.id,ownerEmail:user.email||'',createdAt:new Date(stamp),updatedAt:new Date(stamp),status:'allocated'}
   const writes=[
    {update:{name:`projects/${project}/databases/(default)/documents/systemCounters/characters`,fields:{next:{integerValue:String(next+1)},updatedAt:{timestampValue:stamp}}},currentDocument:exists?{updateTime:doc.updateTime}:{exists:false}},
    {update:{name:`projects/${project}/databases/(default)/documents/characters/${id}`,fields:Object.fromEntries(Object.entries(characterFields).map(([k,v])=>[k,encode(v)]))},currentDocument:{exists:false}}
   ]
   const c=await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:commit`,{method:'POST',headers:{authorization:`Bearer ${access}`,'content-type':'application/json'},body:JSON.stringify({writes})})
   if(c.ok)return Response.json({characterId:id},{headers:responseHeaders});if(![409,412].includes(c.status))throw Error(`Commit failed (${c.status})`)
  }
  throw Error('Allocation contention')
 }catch(error:any){const status=Number(error?.status||error?.statusCode)||500,code=String(error?.code||'CHARACTER_ID_ALLOCATION_FAILED');console.error('[allocate-character-id]',{status,code,message:error?.message||String(error),stack:error?.stack});const configurationFailure=code.startsWith('FIREBASE_ADMIN_')||code==='FIREBASE_PROJECT_ID_MISSING';return Response.json({error:configurationFailure?`${error.message} Configure FIREBASE_SERVICE_ACCOUNT_JSON as a Functions-only Netlify environment variable.`:(status>=500?'Could not allocate character ID':(error?.message||'Request rejected.')),code},{status,headers:responseHeaders})}
}
export const config:Config={path:'/api/allocate-character-id'}
