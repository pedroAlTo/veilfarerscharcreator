import type { UserLoginEvent, UserSignupEvent } from '@netlify/functions'

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
}
