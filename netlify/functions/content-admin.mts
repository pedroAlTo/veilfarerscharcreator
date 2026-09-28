import type {Config,Context} from '@netlify/functions'
import {createContentConfigHandler} from './_content-handlers.mts'
const handler=createContentConfigHandler()
export default (req:Request,_ctx:Context)=>handler(req,true)
export const config:Config={path:'/api/content-admin'}
