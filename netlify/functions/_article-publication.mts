import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {readContentDocument} from './_content-store.mts'
import {normalizeCtaConfig,ctaIsLive,type ArticleId} from './_cta-config.mts'

const variants:Record<string,{article:ArticleId;file:string;lang:'en'|'es'}>={
  overkill:{article:'overkill',file:'overkill.html',lang:'en'},
  drones:{article:'drones',file:'drones.html',lang:'en'},
  'drones-es':{article:'drones',file:'drones-es.html',lang:'es'},
  'space-combat':{article:'space-combat',file:'space-combat.html',lang:'en'},
  'space-combat-es':{article:'space-combat',file:'space-combat-es.html',lang:'es'}
}
export function articleForPath(path:string){
  const match=path.match(/^\/behind-the-veil\/(overkill|drones|drones-es|space-combat|space-combat-es)(?:\.html|\/)?$/)
  return match?variants[match[1]]:null
}
const htmlHeaders={
  'Content-Type':'text/html; charset=utf-8',
  'Cache-Control':'no-store, max-age=0',
  'CDN-Cache-Control':'no-store',
  'Netlify-CDN-Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff',
  'X-VeilFarers-Release':'v59.83',
  'X-VeilFarers-CSP-Profile':'wasm-3d-dice-v2',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Content-Security-Policy':"default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://docs.google.com; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob: https://cdn.jsdelivr.net https://www.gstatic.com https://identity.netlify.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob: https://www.google-analytics.com https://*.google-analytics.com https://*.googletagmanager.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://www.gstatic.com https://identity.netlify.com https://api.netlify.com https://*.netlify.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.google.com; frame-src 'self' https://identity.netlify.com https://app.netlify.com https://docs.google.com; worker-src 'self' blob:; media-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests"
}
const production={
  read:readContentDocument,
  readHtml:(file:string)=>readFile(join(process.cwd(),'public','behind-the-veil',file),'utf8'),
  now:()=>Date.now()
}
export function createArticleHandler(overrides:Partial<typeof production>={}){
  const services={...production,...overrides}
  return async(req:Request)=>{
    const target=articleForPath(new URL(req.url).pathname)
    const spanish=target?.lang==='es'
    const unavailable=(status:number)=>{
      const text=status===503?(spanish?'El artículo no está disponible temporalmente. Vuelve a intentarlo más tarde.':'This article is temporarily unavailable. Please try again later.'):(spanish?'Este artículo no está disponible.':'This article is not available.')
      const body=`<!doctype html><html lang="${spanish?'es':'en'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>Behind the Veil</title><main><h1>Behind the Veil</h1><p>${text}</p><a href="/behind-the-veil/">${spanish?'Volver a los artículos':'Back to articles'}</a></main></html>`
      return new Response(req.method==='HEAD'?null:body,{status,headers:{...htmlHeaders,'X-Robots-Tag':'noindex',...(status===503?{'Retry-After':'60'}:{})}})
    }
    if(req.method!=='GET'&&req.method!=='HEAD')return new Response(null,{status:405,headers:{...htmlHeaders,Allow:'GET, HEAD'}})
    if(!target)return unavailable(404)
    try{
      const stored=await services.read()
      const settings=normalizeCtaConfig(stored?.data).articles[target.article]
      if(!ctaIsLive(settings,services.now()))return unavailable(404)
      const html=await services.readHtml(target.file)
      return new Response(req.method==='HEAD'?null:html,{status:200,headers:htmlHeaders})
    }catch(error:any){
      console.error('[article-publication]',{article:target.article,message:error?.message||String(error)})
      return unavailable(503)
    }
  }
}
