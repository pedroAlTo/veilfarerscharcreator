import type {Config,Context} from '@netlify/functions'
import {createArticleHandler} from './_article-publication.mts'
const handler=createArticleHandler()
export default (req:Request,_ctx:Context)=>handler(req)
export const config:Config={
  path:[
    '/behind-the-veil/overkill.html','/behind-the-veil/overkill','/behind-the-veil/overkill/',
    '/behind-the-veil/drones.html','/behind-the-veil/drones','/behind-the-veil/drones/',
    '/behind-the-veil/drones-es.html','/behind-the-veil/drones-es','/behind-the-veil/drones-es/',
    '/behind-the-veil/space-combat.html','/behind-the-veil/space-combat','/behind-the-veil/space-combat/',
    '/behind-the-veil/space-combat-es.html','/behind-the-veil/space-combat-es','/behind-the-veil/space-combat-es/'
  ],
  preferStatic:false
}
