import type { Config, Context } from '@netlify/functions'

// Firebase Web configuration identifies the public web app; it is not an
// authorization credential. Data access must be enforced with Firebase
// Authentication, Firestore Security Rules, App Check and project quotas.
export default async (_req: Request, _context: Context) => {
  const apiKey = process.env.FIREBASE_API_KEY
  const headers = {
    'Cache-Control': 'no-store, max-age=0',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  }

  if (!apiKey) {
    return Response.json(
      { error: 'Firebase no está configurado. Define FIREBASE_API_KEY en Netlify.' },
      { status: 503, headers },
    )
  }

  return Response.json(
    {
      apiKey,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'voidlight-character-sheets.firebaseapp.com',
      projectId: process.env.FIREBASE_PROJECT_ID || 'voidlight-character-sheets',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'voidlight-character-sheets.firebasestorage.app',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '639672297658',
      appId: process.env.FIREBASE_APP_ID || '1:639672297658:web:974ddf6ad725cc176e7a83',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-L1Z048Y3L2',
      publicTableDirectory: process.env.FIREBASE_PUBLIC_TABLE_DIRECTORY !== 'false',
    },
    { headers },
  )
}

export const config: Config = { path: '/api/firebase-config' }
