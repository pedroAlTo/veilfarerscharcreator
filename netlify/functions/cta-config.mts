import type {Config,Context} from '@netlify/functions'
import {createContentConfigHandler} from './_content-handlers.mts'
const handler=createContentConfigHandler()
export default (req:Request,_ctx:Context)=>handler(req)
export const config:Config={path:'/api/cta-config'}
