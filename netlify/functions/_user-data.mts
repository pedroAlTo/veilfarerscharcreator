import {
  deleteDoc, getDoc, googleAccessToken, listDocs, patchDoc, putDoc, queryDocs, queryDocsAt,
} from './_firebase-admin.mts'

const appId='default-app-id'
const base=`artifacts/${appId}/public/data`
const sessions=`${base}/sessions`
const directory=`${base}/tableDirectory`
const invites=`${base}/tableInvites`
const secrets=`${base}/tableSecrets`
const cleanEmail=(value:any)=>String(value||'').trim().toLowerCase()
const withoutUserCharacters=(characters:any,userId:string)=>Array.isArray(characters)
  ? characters.filter((item:any)=>item&&item.memberUid!==userId&&item.ownerUid!==userId)
  : []

const deleteTable=async(tableId:string,access:string)=>{
  const path=`${sessions}/${encodeURIComponent(tableId)}`
  const handouts=await listDocs(`${path}/handouts`,access)
  const linkedInvites=await queryDocsAt(base,'tableInvites','tableId',tableId,access,1000)
  await Promise.all(handouts.map((item:any)=>deleteDoc(`${path}/handouts/${encodeURIComponent(item.id)}`,access)))
  await Promise.all(linkedInvites.map((item:any)=>deleteDoc(`${invites}/${item.id}`,access)))
  await Promise.all([
    deleteDoc(`${secrets}/${encodeURIComponent(tableId)}`,access),
    deleteDoc(`${directory}/${encodeURIComponent(tableId)}`,access),
    deleteDoc(path,access),
  ])
  return {handouts:handouts.length,invites:linkedInvites.length}
}

export type UserPurgeReport={
  characters:number
  profiles:number
  tablesDeleted:number
  tablesTransferred:number
  membershipsRemoved:number
  invitationsDeleted:number
  handoutsDeleted:number
}

export async function purgeUserData(userId:string,emailValue?:string):Promise<UserPurgeReport>{
  if(!userId)throw Object.assign(new Error('A user ID is required for deletion.'),{status:400,code:'USER_ID_REQUIRED'})
  const access=await googleAccessToken()
  const email=cleanEmail(emailValue)
  const report:UserPurgeReport={
    characters:0,profiles:0,tablesDeleted:0,tablesTransferred:0,
    membershipsRemoved:0,invitationsDeleted:0,handoutsDeleted:0,
  }

  const characters=await queryDocs('characters','ownerId',userId,access,1000)
  await Promise.all(characters.map((item:any)=>deleteDoc(`characters/${item.id}`,access)))
  report.characters=characters.length
  await deleteDoc(`characterVaultProfiles/${encodeURIComponent(userId)}`,access)
  report.profiles=1

  const sessionDocs=await listDocs(sessions,access)
  for(const item of sessionDocs){
    const tableId=item.id
    const data:any=item.data||{}
    const memberIds=(Array.isArray(data.memberIds)?data.memberIds:[]).filter((id:any)=>String(id)!==userId)
    const profiles={...(data.memberProfiles&&typeof data.memberProfiles==='object'?data.memberProfiles:{})}
    const wasMember=(Array.isArray(data.memberIds)?data.memberIds:[]).includes(userId)||!!profiles[userId]
    delete profiles[userId]

    if(data.ownerUid===userId){
      const nextOwnerId=String(memberIds[0]||'')
      if(!nextOwnerId){
        const deleted=await deleteTable(tableId,access)
        report.tablesDeleted+=1
        report.handoutsDeleted+=deleted.handouts
        report.invitationsDeleted+=deleted.invites
        continue
      }
      const nextOwner={...(profiles[nextOwnerId]||{}),role:'owner'}
      profiles[nextOwnerId]=nextOwner
      const ownerEmail=String(nextOwner.email||'')
      const ownerName=String(nextOwner.name||ownerEmail||'Transferred owner')
      const directoryPath=`${directory}/${encodeURIComponent(tableId)}`
      const directoryData=(await getDoc(directoryPath,access))?.data||{}
      await patchDoc(`${sessions}/${encodeURIComponent(tableId)}`,{
        ownerUid:nextOwnerId,
        ownerEmail,
        memberIds,
        memberProfiles:profiles,
        characters:withoutUserCharacters(data.characters,userId),
        updatedAt:Date.now(),
        lastActive:Date.now(),
      },access)
      await putDoc(directoryPath,{
        ...directoryData,
        name:data.name||directoryData.name||tableId,
        locked:!!directoryData.locked,
        memberCount:memberIds.length,
        ownerName,
        updatedAt:Date.now(),
      },access)
      report.tablesTransferred+=1
      continue
    }

    if(wasMember){
      const directoryPath=`${directory}/${encodeURIComponent(tableId)}`
      const directoryData=(await getDoc(directoryPath,access))?.data||{}
      await patchDoc(`${sessions}/${encodeURIComponent(tableId)}`,{
        memberIds,
        memberProfiles:profiles,
        characters:withoutUserCharacters(data.characters,userId),
        updatedAt:Date.now(),
        lastActive:Date.now(),
      },access)
      const ownerProfile=profiles[data.ownerUid]||{}
      await putDoc(directoryPath,{
        ...directoryData,
        name:data.name||directoryData.name||tableId,
        locked:!!directoryData.locked,
        memberCount:memberIds.length,
        ownerName:ownerProfile.name||data.ownerEmail||'',
        updatedAt:Date.now(),
      },access)
      report.membershipsRemoved+=1
    }
  }

  const createdInvites=await queryDocsAt(base,'tableInvites','createdBy',userId,access,1000)
  const emailInvites=email?await queryDocsAt(base,'tableInvites','invitedEmail',email,access,1000):[]
  const inviteIds=new Set([...createdInvites,...emailInvites].map((item:any)=>item.id))
  await Promise.all([...inviteIds].map(id=>deleteDoc(`${invites}/${id}`,access)))
  report.invitationsDeleted+=inviteIds.size

  console.info('[privacy-delete]',{event:'completed',userId,report})
  return report
}
