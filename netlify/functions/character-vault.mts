import type { Config, Context } from '@netlify/functions'
import { getUser, verifyRequestOrigin } from '@netlify/identity'
import { getDoc, googleAccessToken, putDoc, queryDocs, responseHeaders } from './_firebase-admin.mts'

const collection='characters'
const json=(body:any,status=200)=>Response.json(body,{status,headers:responseHeaders})
const validId=(value:any)=>/^VF-\d{6,}$/.test(String(value||'').trim().toUpperCase())
const cleanRecord=(input:any,user:any,existing:any)=>{
  const characterId=String(input?.characterId||'').trim().toUpperCase()
  const status=input?.status==='trashed'?'trashed':'active'
  return {
    ...(input&&typeof input==='object'?input:{}),
    schema:'veilfarers.character/2',
    characterId,
    ownerId:user.id,
    ownerEmail:user.email||'',
    status,
    createdAt:existing?.createdAt||input?.createdAt||new Date().toISOString(),
    updatedAt:new Date().toISOString(),
    completedAt:input?.completedAt||existing?.completedAt||null,
    deletedAt:status==='trashed'?(input?.deletedAt||new Date().toISOString()):null,
    characterData:input?.characterData&&typeof input.characterData==='object'?input.characterData:{},
  }
}

export default async(req:Request,_ctx:Context)=>{
  try{
    if(req.method!=='POST')return json({error:'Method not allowed'},405)
    verifyRequestOrigin(req)
    const user:any=await getUser()
    if(!user)return json({error:'Sign in to use Character Vault.'},401)
    const body:any=await req.json().catch(()=>({}))
    const action=String(body.action||'')
    const access=await googleAccessToken()

    if(action==='list'){
      const docs=await queryDocs(collection,'ownerId',user.id,access,200)
      const records=docs.map(item=>item.data)
      return json({records,user:{id:user.id,email:user.email||''}})
    }

    const characterId=String(body.characterId||body.record?.characterId||'').trim().toUpperCase()
    if(!validId(characterId))return json({error:'A valid VF-###### Character ID is required.'},400)
    const path=`${collection}/${characterId}`
    const current=await getDoc(path,access)

    if(action==='get'){
      if(!current)return json({record:null})
      if(current.data?.ownerId!==user.id)return json({error:'This character belongs to another account.'},403)
      return json({record:current.data})
    }

    if(action==='upsert'){
      if(current&&current.data?.ownerId&&current.data.ownerId!==user.id)return json({error:'This character belongs to another account.'},403)
      const record=cleanRecord({...body.record,characterId},user,current?.data)
      await putDoc(path,record,access)
      return json({record})
    }

    return json({error:'Unknown Character Vault action.'},400)
  }catch(error:any){
    console.error(error)
    const status=Number(error?.status||error?.statusCode)||500
    return json({error:status===500?'Character Vault service failed.':(error?.message||'Request rejected.')},status)
  }
}

export const config:Config={path:'/api/character-vault'}
