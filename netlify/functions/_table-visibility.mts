/**
 * Server-side visibility rules for live session data.
 *
 * Keeper-only fields must be decided on the server, never hidden on the client:
 * anything sent to a player is readable in the network payload regardless of how
 * the UI chooses to render it. For a non-owner reading a session we therefore
 * drop, before serialisation:
 *   - hidden adversaries (entityType 'hidden', or hidden:true and not a player
 *     character): omitted entirely, so an unrevealed entity leaves no trace in
 *     the payload. Revealing it (clearing hidden) makes it appear on next sync.
 *   - the per-entity keeperNotes field on every entity that remains visible.
 *
 * A player character — one carrying a member's or owner's uid — is never treated
 * as a hidden adversary even if flagged, so a player never loses their own sheet.
 * The owner receives the unmodified list.
 */

export const isPlayerEntity = (entity: any) =>
  !!(entity && (entity.memberUid || entity.ownerUid || entity.characterId || entity.syncId))

export const isHiddenAdversary = (entity: any) =>
  !!(entity && (entity.entityType === 'hidden' || entity.hidden === true) && !isPlayerEntity(entity))

export const stripKeeperFields = (entity: any) => {
  if (!entity || typeof entity !== 'object') return entity
  const { keeperNotes, ...rest } = entity
  return rest
}

export const sessionCharactersFor = (characters: any[], isOwner: boolean) => {
  if (isOwner) return characters
  return characters.filter((entity: any) => !isHiddenAdversary(entity)).map(stripKeeperFields)
}
