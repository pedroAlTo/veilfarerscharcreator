const cleanRole=(value:any)=>String(value||'').trim().toLowerCase()

export const userRoles=(user:any)=>{
  const sources=[
    ...(Array.isArray(user?.roles)?user.roles:[]),
    ...(Array.isArray(user?.appMetadata?.roles)?user.appMetadata.roles:[]),
    ...(Array.isArray(user?.app_metadata?.roles)?user.app_metadata.roles:[]),
  ]
  return new Set(sources.map(cleanRole).filter(Boolean))
}

export const hasToolRole=(user:any,tool:'player'|'keeper')=>{
  const roles=userRoles(user)
  return roles.has('admin')||roles.has(tool)
}

export const requireToolAccess=(user:any,tool:'player'|'keeper')=>{
  if(!user)throw Object.assign(new Error('Sign in with an authorized VeilFarers account.'),{status:401,code:'IDENTITY_REQUIRED'})
  if(!hasToolRole(user,tool))throw Object.assign(new Error(`This account does not have ${tool} access.`),{status:403,code:'TOOL_ROLE_REQUIRED'})
  return {tool,roles:[...userRoles(user)]}
}

export const requireAnyToolAccess=(user:any)=>{
  if(!user)throw Object.assign(new Error('Sign in with an authorized VeilFarers account.'),{status:401,code:'IDENTITY_REQUIRED'})
  const roles=userRoles(user)
  if(!roles.has('admin')&&!roles.has('player')&&!roles.has('keeper')){
    throw Object.assign(new Error('This account is not authorized for the protected tools.'),{status:403,code:'TOOL_ROLE_REQUIRED'})
  }
  return {roles:[...roles]}
}

export const requirePortalAdmin=(user:any)=>{
  if(!user)throw Object.assign(new Error('Sign in with the VeilFarers administrator account.'),{status:401,code:'IDENTITY_REQUIRED'})
  if(!userRoles(user).has('admin'))throw Object.assign(new Error('Administrator role required.'),{status:403,code:'ADMIN_ROLE_REQUIRED'})
  const configuredEmail=String(process.env.VF_ADMIN_EMAIL||'').trim().toLowerCase()
  if(!configuredEmail)throw Object.assign(new Error('VF_ADMIN_EMAIL is not configured.'),{status:503,code:'ADMIN_EMAIL_NOT_CONFIGURED'})
  const email=String(user.email||'').trim().toLowerCase()
  if(email!==configuredEmail)throw Object.assign(new Error('This administrator role is not assigned to the configured portal owner.'),{status:403,code:'ADMIN_EMAIL_MISMATCH'})
  return {email,roles:[...userRoles(user)]}
}

// Publishing permissions are the Identity admin role. Managing accounts keeps
// the separate configured-owner restriction in requirePortalAdmin above.
export const requireContentAdmin=(user:any)=>{
  if(!user)throw Object.assign(new Error('Sign in with a VeilFarers administrator account.'),{status:401,code:'IDENTITY_REQUIRED'})
  if(!userRoles(user).has('admin'))throw Object.assign(new Error('Administrator role required.'),{status:403,code:'ADMIN_ROLE_REQUIRED'})
  return {roles:[...userRoles(user)]}
}
