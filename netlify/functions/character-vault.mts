import type { Config, Context } from '@netlify/functions'
import { getUser, verifyRequestOrigin } from '@netlify/identity'
import { getDoc, googleAccessToken, putDoc, queryDocs, responseHeaders } from './_firebase-admin.mts'

const collection='characters'
const profiles='characterVaultProfiles'
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
      const profilePath=`${profiles}/${user.id}`
      const profileDoc=await getDoc(profilePath,access)
      const activeIds=records.filter((record:any)=>record?.status!=='trashed').map((record:any)=>String(record?.characterId||'').toUpperCase())
      let activeCharacterId=String(profileDoc?.data?.activeCharacterId||'').toUpperCase()
      if(!activeIds.includes(activeCharacterId)){
        activeCharacterId=activeIds[0]||''
        await putDoc(profilePath,{ownerId:user.id,activeCharacterId,updatedAt:new Date().toISOString()},access)
      }
      return json({records,activeCharacterId,user:{id:user.id,email:user.email||''}})
    }

    if(action==='setActive'){
      const characterId=String(body.characterId||'').trim().toUpperCase()
      if(characterId){
        if(!validId(characterId))return json({error:'A valid VF-###### Character ID is required.'},400)
        const record=await getDoc(`${collection}/${characterId}`,access)
        if(!record||record.data?.ownerId!==user.id||record.data?.status==='trashed')return json({error:'Select an active character from your own Vault.'},404)
      }
      await putDoc(`${profiles}/${user.id}`,{ownerId:user.id,activeCharacterId:characterId,updatedAt:new Date().toISOString()},access)
      return json({ok:true,activeCharacterId:characterId})
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
      const profilePath=`${profiles}/${user.id}`
      const profileDoc=await getDoc(profilePath,access)
      let activeCharacterId=String(profileDoc?.data?.activeCharacterId||'').toUpperCase()
      if(record.status!=='trashed'&&!activeCharacterId){
        activeCharacterId=characterId
        await putDoc(profilePath,{ownerId:user.id,activeCharacterId,updatedAt:new Date().toISOString()},access)
      }else if(record.status==='trashed'&&activeCharacterId===characterId){
        const docs=await queryDocs(collection,'ownerId',user.id,access,200)
        const fallback=docs.map(item=>item.data).find((item:any)=>item?.status!=='trashed'&&String(item?.characterId||'').toUpperCase()!==characterId)
        activeCharacterId=String(fallback?.characterId||'').toUpperCase()
        await putDoc(profilePath,{ownerId:user.id,activeCharacterId,updatedAt:new Date().toISOString()},access)
      }
      return json({record,activeCharacterId})
    }

    return json({error:'Unknown Character Vault action.'},400)
  }catch(error:any){
    console.error(error)
    const status=Number(error?.status||error?.statusCode)||500
    return json({error:status===500?'Character Vault service failed.':(error?.message||'Request rejected.')},status)
  }
}

export const config:Config={path:'/api/character-vault'}
