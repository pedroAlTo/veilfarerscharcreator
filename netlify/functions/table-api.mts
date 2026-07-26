import type { Config, Context } from '@netlify/functions'
import { getUser, verifyRequestOrigin } from '@netlify/identity'
import {
  deleteDoc, getDoc, googleAccessToken, inviteToken, listDocs, makePassword,
  patchDoc, putDoc, queryDocsAt, responseHeaders, safeTableId, tokenHash,
} from './_firebase-admin.mts'
import { SERVER_LOCK_MARKER, tablePasswordGate } from './_table-security.mts'
import { sessionCharactersFor } from './_table-visibility.mts'
import { requireAnyToolAccess } from './_role-access.mts'

const appId = 'default-app-id'
const base = `artifacts/${appId}/public/data`
const sessions = `${base}/sessions`
const directory = `${base}/tableDirectory`
const invites = `${base}/tableInvites`
const secrets = `${base}/tableSecrets`
const now = () => Date.now()
const cleanString=(value:any,max=500)=>String(value||'').slice(0,max)
const sessionPatchKeys=new Set(['characters','fearTokens','spotlight','keeperNotes','sessionName'])
const profile = (user: any, role = 'member') => ({
  email: user.email || '',
  name: user.userMetadata?.full_name || user.email || 'VeilFarer',
  role,
  joinedAt: now(),
})
const safeDirectory = (data: any, id: string) => ({
  id,
  name: data.name || id,
  locked: !!data.locked,
  members: Number(data.memberCount || 0),
  ownerName: data.ownerName || '',
  updatedAt: data.updatedAt || 0,
})
export const tablePlayerIds=(data:any)=>new Set((Array.isArray(data?.characters)?data.characters:[])
  .filter((item:any)=>item&&item.entityType!=='drone')
  .flatMap((item:any)=>[item.memberUid,item.ownerUid,item.id,item.characterId,item.syncId].map((value:any)=>cleanString(value,160)).filter(Boolean)))
const handoutPath=(sessionPath:string,noteId:string)=>`${sessionPath}/handouts/${encodeURIComponent(cleanString(noteId,120))}`
const cleanCells=(value:any,maxCells=40)=>Array.isArray(value)
  ? value.slice(0,maxCells).map((cell:any)=>cleanString(cell,1000))
  : []
/** Firestore rejects an array whose direct elements are arrays. Store table rows
 * as maps ({ cells: [...] }) and convert them back for the browser response. */
export const normalizeNoteTable=(raw:any)=>{
  if(!raw||typeof raw!=='object')return null
  const headers=cleanCells(raw.headers)
  const rows=(Array.isArray(raw.rows)?raw.rows:[]).slice(0,100).map((row:any)=>{
    const cells=cleanCells(Array.isArray(row)?row:row?.cells)
    return cells.length?{cells}:null
  }).filter(Boolean)
  return rows.length?{headers:headers.length?headers:null,rows}:null
}
export const noteTableForClient=(raw:any)=>{
  if(!raw||typeof raw!=='object')return null
  const headers=cleanCells(raw.headers)
  const rows=(Array.isArray(raw.rows)?raw.rows:[]).slice(0,100).map((row:any)=>cleanCells(Array.isArray(row)?row:row?.cells)).filter((row:any[])=>row.length)
  return rows.length?{headers:headers.length?headers:null,rows}:null
}
const handoutForClient=(raw:any)=>raw&&typeof raw==='object'?{...raw,table:noteTableForClient(raw.table)}:raw
const userTargetIds=(data:any,user:any)=>{
  const ids=new Set<string>([cleanString(user?.id,160)].filter(Boolean))
  const characters=Array.isArray(data?.characters)?data.characters:[]
  characters.filter((item:any)=>item&&item.entityType!=='drone'&&(item.memberUid===user?.id||item.ownerUid===user?.id)).forEach((item:any)=>{
    ;[item.memberUid,item.ownerUid,item.id,item.characterId,item.syncId].map((value:any)=>cleanString(value,160)).filter(Boolean).forEach((value:string)=>ids.add(value))
  })
  return ids
}
export const canReceiveHandout=(note:any,data:any,user:any,isOwner:boolean)=>{
  if(isOwner)return true
  const target=note?.target==='all'||note?.targets==='all'?'all':cleanString(note?.target||(Array.isArray(note?.targets)?note.targets[0]:''),160)
  return target==='all'||userTargetIds(data,user).has(target)
}
export const normalizeHandout=(raw:any,tableId:string,user:any,data:any)=>{
  const target=raw?.target==='all'||raw?.targets==='all'?'all':cleanString(raw?.target||raw?.targetId||(Array.isArray(raw?.targets)?raw.targets[0]:''),160)
  if(target!=='all'&&!tablePlayerIds(data).has(target))throw Object.assign(new Error('Choose one player currently connected to this table, or All players.'),{status:400})
  return {
    id:cleanString(raw?.id||`note-${now()}-${Math.random().toString(36).slice(2,8)}`,120),
    tableId,
    title:cleanString(raw?.title,160), subtitle:cleanString(raw?.subtitle,240), body:cleanString(raw?.body,20000),
    table:normalizeNoteTable(raw?.table), target, targets:target==='all'?'all':[target],
    volatile:!!raw?.volatile, expires:Math.max(0,Math.min(3600000,Number(raw?.expires)||0)),
    sentAt:Number(raw?.sentAt)||now(), senderUid:user.id, from:'Keeper',
  }
}
const json = (body: any, status = 200) => Response.json(body, { status, headers: responseHeaders })

export default async (req: Request, _ctx: Context) => {
  const requestId=req.headers.get('x-vf-request-id')||`table-${now().toString(36)}-${Math.random().toString(36).slice(2,8)}`
  let action=''; let tableIdForLog=''
  try {
    const user: any = await getUser()
    if (!user) return json({ error: 'You must be logged in.' }, 401)
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
    verifyRequestOrigin(req)
    requireAnyToolAccess(user)

    const body: any = await req.json().catch(() => ({}))
    action = String(body.action || '')
    const access = await googleAccessToken()

    if (action === 'list') {
      const docs = await listDocs(directory, access)
      const legacy = await listDocs(sessions, access)
      const map = new Map<string, any>(docs.map(item => [item.id, safeDirectory(item.data, item.id)]))
      legacy.forEach(item => {
        if (map.has(item.id)) return
        map.set(item.id, {
          id: item.id,
          name: item.data.name || item.id,
          locked: !!(
            item.data.passAuth?.hash ||
            item.data.passHash ||
            item.data.passwordHash ||
            item.data.tablePasswordHash ||
            item.data.password ||
            item.data.tablePassword ||
            item.data.isOpen === false
          ),
          members: Array.isArray(item.data.memberIds)
            ? item.data.memberIds.length
            : (Array.isArray(item.data.characters) ? item.data.characters.length : 0),
          ownerName: item.data.ownerEmail || 'Unclaimed',
          updatedAt: item.data.lastActive || item.data.updatedAt || 0,
        })
      })
      return json({
        tables: [...map.values()].sort((a, b) => a.name.localeCompare(b.name)),
        user: { id: user.id, email: user.email || '' },
      })
    }

    const tableId = safeTableId(body.tableId)
    tableIdForLog=tableId
    if (!tableId) return json({ error: 'Table name is required.' }, 400)

    const path = `${sessions}/${encodeURIComponent(tableId)}`
    const directoryPath = `${directory}/${encodeURIComponent(tableId)}`
    const secretPath = `${secrets}/${encodeURIComponent(tableId)}`
    const existing = await getDoc(path, access)
    const data = existing?.data || null

    if (action === 'create') {
      if (data) return json({ error: 'That table already exists. Join it with an invitation.' }, 409)
      const password = String(body.password || '')
      if (password && password.length < 4) return json({ error: 'Use at least 4 characters for the password.' }, 400)
      const owner = profile(user, 'owner')
      const record = {
        name: tableId,
        ownerUid: user.id,
        ownerEmail: user.email || '',
        memberIds: [user.id],
        memberProfiles: { [user.id]: owner },
        // Password verifiers live only in tableSecrets. passHash is a non-secret
        // compatibility marker so old clients still treat the table as locked.
        passAuth: null,
        passHash: password ? SERVER_LOCK_MARKER : null,
        isOpen: !password,
        createdAt: now(),
        updatedAt: now(),
        lastActive: now(),
        characters: [],
        rollHistory: [],
        handouts: [],
      }
      await putDoc(path, record, access)
      if (password) await putDoc(secretPath, { passAuth: makePassword(password), updatedAt: now() }, access)
      await putDoc(directoryPath, {
        name: tableId,
        locked: !!password,
        memberCount: 1,
        ownerName: owner.name,
        updatedAt: now(),
      }, access)
      return json({
        ok: true,
        table: safeDirectory({ name: tableId, locked: !!password, memberCount: 1, ownerName: owner.name, updatedAt: now() }, tableId),
        role: 'owner',
      })
    }

    if (!data) return json({ error: 'Table not found.' }, 404)

    const memberIds = Array.isArray(data.memberIds) ? data.memberIds.slice() : []
    const profiles = data.memberProfiles && typeof data.memberProfiles === 'object' ? { ...data.memberProfiles } : {}
    const isOwner = data.ownerUid === user.id
    const isMember = memberIds.includes(user.id)
    const secretDoc = await getDoc(secretPath, access)
    const secretAuth = secretDoc?.data?.passAuth || null
    const locked = tablePasswordGate(data, secretAuth, '').locked

    if (action === 'join') {
      let role = isOwner ? 'owner' : 'member'
      const claimLegacy = !data.ownerUid
      const needsAdmission = !isOwner && !isMember
      let inviteToConsume: any = null
      let inviteHash = ''

      if (needsAdmission && !claimLegacy) {
        const rawToken = String(body.invite || '').trim()
        if (!rawToken) return json({ error: 'An invitation link or passkey is required.' }, 403)
        inviteHash = tokenHash(rawToken)
        const invite = await getDoc(`${invites}/${inviteHash}`, access)
        if (!invite?.data || invite.data.tableId !== tableId || invite.data.revoked || Number(invite.data.expiresAt || 0) < now()) {
          return json({ error: 'The invitation is invalid, expired or revoked.' }, 403)
        }
        if (Number(invite.data.maxUses || 0) > 0 && Number(invite.data.uses || 0) >= Number(invite.data.maxUses)) {
          return json({ error: 'The invitation has reached its use limit.' }, 403)
        }
        if (invite.data.invitedEmail && String(invite.data.invitedEmail).toLowerCase() !== String(user.email || '').toLowerCase()) {
          return json({ error: 'This invitation belongs to another logged-in user.' }, 403)
        }
        inviteToConsume = invite.data
      }

      const suppliedPassword = String(body.password || '')
      // Closed tables require their password on every connection. Membership
      // still controls table data, but no longer bypasses the explicit lock.
      const passwordGate = tablePasswordGate(data, secretAuth, suppliedPassword)
      if (!passwordGate.allowed) return json({ error: passwordGate.error }, passwordGate.status || 403)
      const migratedPassword: any = passwordGate.migrate ? makePassword(suppliedPassword) : null

      if (migratedPassword) await putDoc(secretPath, { passAuth: migratedPassword, updatedAt: now() }, access)
      if (claimLegacy) {
        data.ownerUid = user.id
        data.ownerEmail = user.email || ''
        role = 'owner'
      }
      if (!memberIds.includes(user.id)) memberIds.push(user.id)
      profiles[user.id] = profile(user, role)
      data.updatedAt = now()
      data.lastActive = now()
      await patchDoc(path, {
        ownerUid: data.ownerUid,
        ownerEmail: data.ownerEmail,
        memberIds,
        memberProfiles: profiles,
        passAuth: migratedPassword ? null : undefined,
        passHash: migratedPassword ? SERVER_LOCK_MARKER : undefined,
        passwordHash: migratedPassword ? null : undefined,
        tablePasswordHash: migratedPassword ? null : undefined,
        password: migratedPassword ? null : undefined,
        tablePassword: migratedPassword ? null : undefined,
        isOpen: migratedPassword ? false : undefined,
        updatedAt: data.updatedAt,
        lastActive: data.lastActive,
      }, access)
      if (inviteToConsume) {
        await patchDoc(`${invites}/${inviteHash}`, {
          uses: Number(inviteToConsume.uses || 0) + 1,
          lastUsedAt: now(),
        }, access)
      }
      const effectiveLocked = passwordGate.locked || !!migratedPassword
      await putDoc(directoryPath, {
        name: data.name || tableId,
        locked: effectiveLocked,
        memberCount: memberIds.length,
        ownerName: (profiles[data.ownerUid] || {}).name || data.ownerEmail || '',
        updatedAt: now(),
      }, access)
      return json({
        ok: true,
        role,
        tableId,
        locked: effectiveLocked,
        ownerUid: data.ownerUid,
        user: { id: user.id, email: user.email || '' },
      })
    }

    if (action === 'readSession') {
      if (!isOwner && !isMember) return json({ error: 'Join the table before reading its live state.' }, 403)
      const source = data || {}
      const storedNotes=(await listDocs(`${path}/handouts`,access)).map((item:any)=>({id:item.id,...item.data}))
      const legacyNotes=Array.isArray(source.handouts)?source.handouts:[]
      const byId=new Map<string,any>()
      ;[...legacyNotes,...storedNotes].forEach((item:any)=>{if(item&&(!item.tableId||item.tableId===tableId)){const id=cleanString(item.id,120);if(id)byId.set(id,item)}})
      const visibleNotes=[...byId.values()].filter((item:any)=>canReceiveHandout(item,source,user,isOwner)).sort((a:any,b:any)=>Number(a?.sentAt||0)-Number(b?.sentAt||0)).slice(-50).map(handoutForClient)
      const allCharacters = Array.isArray(source.characters) ? source.characters : []
      const safeSession = {
        name: cleanString(source.name || tableId, 160),
        characters: sessionCharactersFor(allCharacters, isOwner),
        fearTokens: Math.max(0, Math.min(99, Number(source.fearTokens) || 0)),
        spotlight: cleanString(source.spotlight, 160),
        keeperNotes: isOwner ? cleanString(source.keeperNotes || source.notes, 100000) : '',
        sessionName: cleanString(source.sessionName, 120),
        handouts: visibleNotes,
        rollHistory: Array.isArray(source.rollHistory) ? source.rollHistory.filter((item:any) => item && (!item.tableId || item.tableId === tableId) && (!item.visibility || item.visibility === 'public')).slice(-200) : [],
        updatedAt: Number(source.updatedAt || 0),
        lastActive: Number(source.lastActive || 0),
      }
      return json({ ok: true, tableId, role: isOwner ? 'owner' : 'member', locked, session: safeSession })
    }

    if (action === 'patchSession') {
      if (!isOwner && !isMember) return json({ error: 'Join the table before changing its live state.' }, 403)
      const rawChanges = body.changes && typeof body.changes === 'object' ? body.changes : {}
      const changes: Record<string, any> = {}
      for (const [key, value] of Object.entries(rawChanges)) {
        if (!sessionPatchKeys.has(key)) continue
        if (key === 'characters') {
          if (!Array.isArray(value) || value.length > 250) return json({ error: 'The character update is not valid.' }, 400)
          changes.characters = value
        } else if (key === 'fearTokens') changes.fearTokens = Math.max(0, Math.min(99, Number(value) || 0))
        else if (key === 'spotlight') changes.spotlight = cleanString(value, 160)
        else if (key === 'keeperNotes') changes.keeperNotes = cleanString(value, 100000)
        else if (key === 'sessionName') changes.sessionName = cleanString(value, 120)
      }
      if (!Object.keys(changes).length) return json({ error: 'No supported live-table changes were supplied.' }, 400)
      changes.updatedAt = now(); changes.lastActive = now()
      await patchDoc(path, changes, access)
      return json({ ok: true, updatedAt: changes.updatedAt })
    }

    if (action === 'broadcastRoll') {
      if (!isOwner && !isMember) return json({ error: 'Join the table before broadcasting rolls.' }, 403)
      const roll = body.roll && typeof body.roll === 'object' ? body.roll : null
      if (!roll) return json({ error: 'A roll payload is required.' }, 400)
      const normalized = { ...roll, visibility:'public', tableId, senderUid:user.id, timestamp: Number(roll.timestamp) || now(), broadcastId: cleanString(roll.broadcastId || `roll-${now()}`, 120) }
      const history = Array.isArray(data.rollHistory) ? data.rollHistory.slice() : []
      const exists = history.some((item:any) => item && item.broadcastId === normalized.broadcastId)
      if (!exists) history.push(normalized)
      const trimmed = history.sort((a:any,b:any)=>Number(a?.timestamp||0)-Number(b?.timestamp||0)).slice(-200)
      await patchDoc(path, { lastRoll: normalized, rollHistory: trimmed, lastRollUpdatedAt: normalized.timestamp, updatedAt: now(), lastActive: now() }, access)
      return json({ ok: true, roll: normalized })
    }

    if (action === 'clearRollHistory') {
      if (!isOwner && !isMember) return json({ error: 'Join the table before clearing its roll history.' }, 403)
      await patchDoc(path, { rollHistory: [], lastRoll: null, lastRollUpdatedAt: null, updatedAt: now() }, access)
      return json({ ok: true })
    }

    if (action === 'sendHandout') {
      if (!isOwner) return json({ error: 'Only the table owner can send Keeper notes.' }, 403)
      const note=normalizeHandout(body.note,tableId,user,data)
      if(!note.title&&!note.body&&!note.table)return json({error:'Add a title, body, or table.'},400)
      await putDoc(handoutPath(path,note.id),note,access)
      await patchDoc(path,{updatedAt:now(),lastActive:now()},access)
      return json({ok:true,note:handoutForClient(note),count:(await listDocs(`${path}/handouts`,access)).length})
    }

    if (action === 'deleteHandout') {
      if (!isOwner) return json({ error: 'Only the table owner can remove Keeper notes.' }, 403)
      const id=cleanString(body.noteId,120)
      if(!id)return json({error:'A note ID is required.'},400)
      await deleteDoc(handoutPath(path,id),access)
      const legacy=(Array.isArray(data.handouts)?data.handouts:[]).filter((item:any)=>cleanString(item?.id,120)!==id)
      if(legacy.length!==(Array.isArray(data.handouts)?data.handouts.length:0))await patchDoc(path,{handouts:legacy,updatedAt:now(),lastActive:now()},access)
      else await patchDoc(path,{updatedAt:now(),lastActive:now()},access)
      return json({ok:true,count:(await listDocs(`${path}/handouts`,access)).length+legacy.length})
    }

    if (action === 'setHandouts') {
      if (!isOwner) return json({ error: 'Only the table owner can change Keeper notes.' }, 403)
      const raw = Array.isArray(body.handouts) ? body.handouts.slice(-50) : null
      if (!raw) return json({ error: 'A handout list is required.' }, 400)
      const existingNotes=await listDocs(`${path}/handouts`,access)
      await Promise.all(existingNotes.map((item:any)=>deleteDoc(handoutPath(path,item.id),access)))
      const handouts=raw.map((item:any)=>normalizeHandout({...item,sentAt:item?.sentAt||now()},tableId,user,data))
      await Promise.all(handouts.map((item:any)=>putDoc(handoutPath(path,item.id),item,access)))
      await patchDoc(path,{handouts:[],updatedAt:now(),lastActive:now()},access)
      return json({ ok: true, count: handouts.length })
    }

    if (!isOwner) return json({ error: 'Only the table owner can perform this action.' }, 403)

    if (action === 'deleteTable') {
      const confirmation = String(body.confirmTableId || '').trim()
      if (confirmation !== tableId) return json({ error: 'Type the exact table name to confirm permanent deletion.' }, 400)
      const handoutDocs = await listDocs(`${path}/handouts`, access)
      const inviteDocs = await queryDocsAt(base, 'tableInvites', 'tableId', tableId, access, 500)
      await Promise.all(handoutDocs.map((item:any) => deleteDoc(handoutPath(path, item.id), access)))
      await Promise.all(inviteDocs.map((item:any) => deleteDoc(`${invites}/${item.id}`, access)))
      await Promise.all([
        deleteDoc(secretPath, access),
        deleteDoc(directoryPath, access),
        deleteDoc(path, access),
      ])
      return json({
        ok: true,
        deletedTableId: tableId,
        deletedHandouts: handoutDocs.length,
        deletedInvites: inviteDocs.length,
      })
    }

    if (action === 'admin') {
      const inviteDocs = (await listDocs(invites, access)).filter(item => item.data.tableId === tableId)
      return json({
        tableId,
        locked,
        members: Object.entries(profiles).map(([uid, member]: any) => ({ uid, ...member })),
        invites: inviteDocs.map(item => ({
          id: item.id,
          label: item.data.label || 'Invite',
          invitedEmail: item.data.invitedEmail || '',
          createdAt: item.data.createdAt,
          expiresAt: item.data.expiresAt,
          uses: item.data.uses || 0,
          maxUses: item.data.maxUses || 0,
          revoked: !!item.data.revoked,
          revokedAt: item.data.revokedAt || null,
          lastUsedAt: item.data.lastUsedAt || null,
        })),
      })
    }

    if (action === 'createInvite') {
      const token = inviteToken()
      const hash = tokenHash(token)
      const days = Math.max(1, Math.min(30, Number(body.days) || 7))
      const maxUses = Math.max(1, Math.min(100, Number(body.maxUses) || 20))
      const invitedEmail = String(body.invitedEmail || '').trim().toLowerCase()
      if (invitedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invitedEmail)) {
        return json({ error: 'Enter a valid invited player email or leave it empty.' }, 400)
      }
      const expiresAt = now() + days * 86400000
      await putDoc(`${invites}/${hash}`, {
        tableId,
        label: String(body.label || 'Player invitation').slice(0, 60),
        invitedEmail,
        createdBy: user.id,
        createdAt: now(),
        expiresAt,
        maxUses: invitedEmail ? 1 : maxUses,
        uses: 0,
        revoked: false,
      }, access)
      const origin = new URL(req.url).origin
      const link = `${origin}/player-tool.html?table=${encodeURIComponent(tableId)}&invite=${encodeURIComponent(token)}`
      return json({
        ok: true,
        inviteId: hash,
        label: String(body.label || 'Player invitation').slice(0, 60),
        passkey: token,
        link,
        expiresAt,
        maxUses: invitedEmail ? 1 : maxUses,
        invitedEmail,
      })
    }

    if (action === 'updateInvite') {
      const id = String(body.inviteId || '')
      const invite = await getDoc(`${invites}/${id}`, access)
      if (!invite?.data || invite.data.tableId !== tableId) return json({ error: 'Invitation not found.' }, 404)
      const invitedEmail = String(body.invitedEmail ?? invite.data.invitedEmail ?? '').trim().toLowerCase()
      if (invitedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invitedEmail)) return json({ error: 'Enter a valid invited player email or leave it empty.' }, 400)
      const days = Math.max(1, Math.min(90, Number(body.days) || Math.ceil((Number(invite.data.expiresAt || now()) - now()) / 86400000) || 7))
      const maxUses = invitedEmail ? 1 : Math.max(1, Math.min(100, Number(body.maxUses) || Number(invite.data.maxUses) || 20))
      const patch = {
        label: cleanString(body.label ?? invite.data.label ?? 'Player invitation', 60),
        invitedEmail,
        expiresAt: now() + days * 86400000,
        maxUses,
        revoked: body.revoked === undefined ? !!invite.data.revoked : !!body.revoked,
        updatedAt: now(),
      }
      if (patch.revoked && !invite.data.revoked) (patch as any).revokedAt = now()
      else if (!patch.revoked) (patch as any).revokedAt = null
      await patchDoc(`${invites}/${id}`, patch, access)
      return json({ ok: true, invite: { id, ...invite.data, ...patch } })
    }

    if (action === 'deleteInvite') {
      const id = String(body.inviteId || '')
      const invite = await getDoc(`${invites}/${id}`, access)
      if (invite?.data && invite.data.tableId === tableId) await deleteDoc(`${invites}/${id}`, access)
      return json({ ok: true })
    }

    if (action === 'revokeInvite') {
      const id = String(body.inviteId || '')
      const invite = await getDoc(`${invites}/${id}`, access)
      if (invite?.data && invite.data.tableId === tableId) {
        await patchDoc(`${invites}/${id}`, { revoked: true, revokedAt: now() }, access)
      }
      return json({ ok: true })
    }

    if (action === 'removeMember') {
      const uid = String(body.uid || '')
      if (!uid || uid === user.id) return json({ error: 'The owner cannot remove themselves.' }, 400)
      const nextMemberIds = memberIds.filter((id: string) => id !== uid)
      delete profiles[uid]
      await patchDoc(path, { memberIds: nextMemberIds, memberProfiles: profiles, updatedAt: now() }, access)
      await putDoc(directoryPath, {
        name: data.name || tableId,
        locked,
        memberCount: nextMemberIds.length,
        ownerName: (profiles[data.ownerUid] || {}).name || data.ownerEmail || '',
        updatedAt: now(),
      }, access)
      return json({ ok: true })
    }

    if (action === 'setPassword') {
      const password = String(body.password || '')
      if (password && password.length < 4) return json({ error: 'Use at least 4 characters or leave it empty to remove the password.' }, 400)
      if (password) await putDoc(secretPath, { passAuth: makePassword(password), updatedAt: now() }, access)
      else await deleteDoc(secretPath, access)
      await patchDoc(path, {
        passAuth: null,
        passHash: password ? SERVER_LOCK_MARKER : null,
        passwordHash: null,
        tablePasswordHash: null,
        password: null,
        tablePassword: null,
        isOpen: !password,
        passwordUpdatedAt: now(),
        updatedAt: now(),
      }, access)
      const dir = (await getDoc(directoryPath, access))?.data || {}
      await putDoc(directoryPath, {
        ...dir,
        name: data.name || tableId,
        locked: !!password,
        memberCount: memberIds.length,
        ownerName: (profiles[data.ownerUid] || {}).name || data.ownerEmail || '',
        updatedAt: now(),
      }, access)
      return json({ ok: true, locked: !!password })
    }

    return json({ error: 'Unknown action.' }, 400)
  } catch (error: any) {
    const status = Number(error?.status || error?.statusCode) || 500
    const code=String(error?.code||'TABLE_SERVICE_FAILED')
    console.error('[table-api]',{requestId,action,tableId:tableIdForLog,status,code,message:error?.message||String(error),stack:error?.stack})
    const configurationFailure=code.startsWith('FIREBASE_ADMIN_')||code==='FIREBASE_PROJECT_ID_MISSING'
    const message=configurationFailure
      ? `${error.message} Configure FIREBASE_SERVICE_ACCOUNT_JSON as a Functions-only Netlify environment variable.`
      : (status>=500?`Table service failed. Reference ${requestId}.`:(error?.message||'Request rejected.'))
    return json({error:message,code,requestId},status)
  }
}

export const config: Config = { path: '/api/table-api' }
