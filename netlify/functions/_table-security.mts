import { tokenHash, verifyPassword } from './_firebase-admin.mts'

export const SERVER_LOCK_MARKER = 'SERVER_MANAGED'

export type TablePasswordGate = {
  allowed: boolean
  locked: boolean
  migrate: boolean
  source: 'open' | 'server' | 'legacy-pbkdf2' | 'legacy-hash' | 'legacy-plain' | 'missing'
  status?: number
  error?: string
}

/**
 * Classifies and verifies every historical table-password representation.
 * This helper is deliberately independent of membership: a closed table must
 * pass this gate on every join attempt, including owner/member reconnections.
 */
export function tablePasswordGate(data: any, secretAuth: any, suppliedValue: any): TablePasswordGate {
  const suppliedPassword = String(suppliedValue || '')
  const legacyAuth = !secretAuth?.hash && data?.passAuth?.hash ? data.passAuth : null
  const legacyHashValue = data?.passHash && data.passHash !== SERVER_LOCK_MARKER
    ? data.passHash
    : (data?.passwordHash || data?.tablePasswordHash || '')
  const legacyHash = !secretAuth?.hash && !legacyAuth?.hash && legacyHashValue
    ? String(legacyHashValue)
    : ''
  const legacyPlain = !secretAuth?.hash && !legacyAuth?.hash && !legacyHash && (data?.password || data?.tablePassword)
    ? String(data.password || data.tablePassword)
    : ''
  const locked = !!(
    secretAuth?.hash ||
    legacyAuth?.hash ||
    legacyHash ||
    legacyPlain ||
    data?.passHash === SERVER_LOCK_MARKER ||
    data?.isOpen === false
  )

  if (!locked) return { allowed: true, locked: false, migrate: false, source: 'open' }

  const denied = (): TablePasswordGate => ({
    allowed: false,
    locked: true,
    migrate: false,
    source: 'missing',
    status: 403,
    error: 'The table password is required and did not match.',
  })

  if (secretAuth?.hash) {
    return suppliedPassword && verifyPassword(suppliedPassword, secretAuth)
      ? { allowed: true, locked: true, migrate: false, source: 'server' }
      : denied()
  }

  if (legacyAuth?.hash) {
    return suppliedPassword && verifyPassword(suppliedPassword, legacyAuth)
      ? { allowed: true, locked: true, migrate: true, source: 'legacy-pbkdf2' }
      : denied()
  }

  if (legacyHash) {
    const candidates = [
      tokenHash(`veilfarers:${suppliedPassword}`),
      tokenHash(suppliedPassword),
      suppliedPassword,
    ]
    return suppliedPassword && candidates.includes(legacyHash)
      ? { allowed: true, locked: true, migrate: true, source: 'legacy-hash' }
      : denied()
  }

  if (legacyPlain) {
    return suppliedPassword && suppliedPassword === legacyPlain
      ? { allowed: true, locked: true, migrate: true, source: 'legacy-plain' }
      : denied()
  }

  return {
    allowed: false,
    locked: true,
    migrate: false,
    source: 'missing',
    status: 409,
    error: 'This protected table is missing its server password record. The owner must set a new password.',
  }
}
