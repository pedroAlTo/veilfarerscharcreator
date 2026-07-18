import { createHash, createSign, randomBytes, pbkdf2Sync, timingSafeEqual } from 'node:crypto'

export const responseHeaders={
  'Cache-Control':'no-store, max-age=0',
  'Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer'
}
const b64=(v:string|Buffer)=>Buffer.from(v).toString('base64url')
export function serviceAccount(){const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw new Error('Firebase Admin is not configured');return JSON.parse(raw)}
export function projectId(sa=serviceAccount()){return process.env.FIREBASE_PROJECT_ID||sa.project_id}
export async function googleAccessToken(sa=serviceAccount()){
 const n=Math.floor(Date.now()/1000)
 const unsigned=`${b64(JSON.stringify({alg:'RS256',typ:'JWT'}))}.${b64(JSON.stringify({iss:sa.client_email,scope:'https://www.googleapis.com/auth/datastore',aud:'https://oauth2.googleapis.com/token',iat:n,exp:n+3600}))}`
 const signer=createSign('RSA-SHA256');signer.update(unsigned);signer.end()
 const assertion=`${unsigned}.${signer.sign(sa.private_key).toString('base64url')}`
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})})
 if(!r.ok)throw new Error(`Google token exchange failed (${r.status})`)
 return (await r.json()).access_token as string
}
export function firebaseCustomToken(uid:string,claims:Record<string,unknown>={}){
 const sa=serviceAccount(),n=Math.floor(Date.now()/1000)
 const header=b64(JSON.stringify({alg:'RS256',typ:'JWT'}))
 const payload=b64(JSON.stringify({iss:sa.client_email,sub:sa.client_email,aud:'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',iat:n,exp:n+3600,uid,claims}))
 const unsigned=`${header}.${payload}`,signer=createSign('RSA-SHA256');signer.update(unsigned);signer.end()
 return `${unsigned}.${signer.sign(sa.private_key).toString('base64url')}`
}
export const docBase=(project=projectId())=>`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents`
export function encode(v:any):any{
 if(v===null||v===undefined)return {nullValue:null}
 if(typeof v==='string')return {stringValue:v}
 if(typeof v==='boolean')return {booleanValue:v}
 if(typeof v==='number')return Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v}
 if(v instanceof Date)return {timestampValue:v.toISOString()}
 if(Array.isArray(v))return {arrayValue:{values:v.map(encode)}}
 if(typeof v==='object')return {mapValue:{fields:Object.fromEntries(Object.entries(v).filter(([,x])=>x!==undefined).map(([k,x])=>[k,encode(x)]))}}
 return {stringValue:String(v)}
}
export function decode(v:any):any{
 if(!v)return null
 if('nullValue'in v)return null;if('stringValue'in v)return v.stringValue;if('booleanValue'in v)return v.booleanValue
 if('integerValue'in v)return Number(v.integerValue);if('doubleValue'in v)return Number(v.doubleValue);if('timestampValue'in v)return v.timestampValue
 if('arrayValue'in v)return (v.arrayValue.values||[]).map(decode)
 if('mapValue'in v)return Object.fromEntries(Object.entries(v.mapValue.fields||{}).map(([k,x])=>[k,decode(x)]))
 return null
}
export async function getDoc(path:string,access?:string){const token=access||await googleAccessToken();const r=await fetch(`${docBase()}/${path}`,{headers:{authorization:`Bearer ${token}`}});if(r.status===404)return null;if(!r.ok)throw new Error(`Firestore read failed (${r.status})`);const raw:any=await r.json();return {data:Object.fromEntries(Object.entries(raw.fields||{}).map(([k,v])=>[k,decode(v)])),updateTime:raw.updateTime}}
export async function putDoc(path:string,data:any,access?:string){const token=access||await googleAccessToken();const fields=Object.fromEntries(Object.entries(data||{}).filter(([,v])=>v!==undefined).map(([k,v])=>[k,encode(v)]));const r=await fetch(`${docBase()}/${path}`,{method:'PATCH',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify({fields})});if(!r.ok)throw new Error(`Firestore write failed (${r.status}): ${await r.text()}`);return r.json()}

export async function patchDoc(path:string,data:any,access?:string){
 const token=access||await googleAccessToken();const entries=Object.entries(data||{}).filter(([,v])=>v!==undefined),fields=Object.fromEntries(entries.map(([k,v])=>[k,encode(v)]));
 const mask=entries.map(([k])=>`updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
 const r=await fetch(`${docBase()}/${path}${mask?`?${mask}`:''}`,{method:'PATCH',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify({fields})});
 if(!r.ok)throw new Error(`Firestore patch failed (${r.status}): ${await r.text()}`);return r.json()
}
export async function deleteDoc(path:string,access?:string){const token=access||await googleAccessToken();const r=await fetch(`${docBase()}/${path}`,{method:'DELETE',headers:{authorization:`Bearer ${token}`}});if(!r.ok&&r.status!==404)throw new Error(`Firestore delete failed (${r.status})`)}
export async function listDocs(path:string,access?:string){const token=access||await googleAccessToken();const r=await fetch(`${docBase()}/${path}?pageSize=200`,{headers:{authorization:`Bearer ${token}`}});if(!r.ok)throw new Error(`Firestore list failed (${r.status})`);const raw:any=await r.json();return (raw.documents||[]).map((doc:any)=>({id:decodeURIComponent(String(doc.name).split('/').pop()),data:Object.fromEntries(Object.entries(doc.fields||{}).map(([k,v])=>[k,decode(v)]))}))}
export async function queryDocs(collectionId:string,fieldPath:string,value:any,access?:string,limit=200){const token=access||await googleAccessToken();const r=await fetch(`${docBase()}:runQuery`,{method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:JSON.stringify({structuredQuery:{from:[{collectionId}],where:{fieldFilter:{field:{fieldPath},op:'EQUAL',value:encode(value)}},limit}})});if(!r.ok)throw new Error(`Firestore query failed (${r.status})`);const raw:any[]=await r.json();return raw.filter(item=>item.document).map(item=>{const doc=item.document;return {id:decodeURIComponent(String(doc.name).split('/').pop()),data:Object.fromEntries(Object.entries(doc.fields||{}).map(([k,v])=>[k,decode(v)]))}})}
export function safeTableId(v:any){return String(v||'').trim().replace(/[\\/\?#%]/g,'-').replace(/\s+/g,' ').slice(0,80)}
export function makePassword(password:string){const salt=randomBytes(16).toString('base64'),iterations=150000,hash=pbkdf2Sync(password,salt,iterations,32,'sha256').toString('base64');return {algorithm:'PBKDF2-SHA256',iterations,salt,hash}}
export function verifyPassword(password:string,record:any){if(!record?.hash)return true;try{const candidate=pbkdf2Sync(password||'',record.salt,Number(record.iterations)||150000,32,'sha256'),expected=Buffer.from(record.hash,'base64');return candidate.length===expected.length&&timingSafeEqual(candidate,expected)}catch{return false}}
export const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex')
export const inviteToken=()=>randomBytes(18).toString('base64url')
