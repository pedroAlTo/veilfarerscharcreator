import type { UserDeletedEvent, UserLoginEvent, UserSignupEvent } from '@netlify/functions'
import { purgeUserData } from './_user-data.mts'

function withMemberRole<T extends UserSignupEvent | UserLoginEvent>(event:T){
  const currentRoles=event.user.appMetadata?.roles
  const roles=Array.from(new Set([...(Array.isArray(currentRoles)?currentRoles:[]),'member']))
  return {
    user:{
      ...event.user,
      appMetadata:{
        ...(event.user.appMetadata||{}),
        roles,
      },
    },
  }
}

export default {
  userSignup(event:UserSignupEvent){
    return withMemberRole(event)
  },
  userLogin(event:UserLoginEvent){
    return withMemberRole(event)
  },
  async userDeleted(event:UserDeletedEvent){
    try{
      await purgeUserData(event.user.id,event.user.email)
    }catch(error:any){
      console.error('[identity-user-deleted]',{
        userId:event.user.id,
        code:error?.code||'IDENTITY_DELETE_PURGE_FAILED',
        message:error?.message||String(error),
      })
    }
    return undefined
  },
}
