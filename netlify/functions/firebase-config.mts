import type { Config, Context } from '@netlify/functions'

// Serves the Firebase Web configuration at runtime so the apiKey is never
// committed to the repository or embedded in the published static files.
// The apiKey is read from the FIREBASE_API_KEY environment variable, which is
// configured in the Netlify UI (Project configuration -> Environment variables).
// The remaining values are public Firebase project identifiers (not secrets)
// and can be overridden with environment variables if the project ever changes.
export default async (_req: Request, _context: Context) => {
  const apiKey = process.env.FIREBASE_API_KEY

  if (!apiKey) {
    return Response.json(
      {
        error:
          'Firebase no está configurado. Define la variable de entorno FIREBASE_API_KEY en Netlify.',
      },
      { status: 500 },
    )
  }

  return Response.json(
    {
      apiKey,
      authDomain:
        process.env.FIREBASE_AUTH_DOMAIN || 'voidlight-character-sheets.firebaseapp.com',
      projectId: process.env.FIREBASE_PROJECT_ID || 'voidlight-character-sheets',
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        'voidlight-character-sheets.firebasestorage.app',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '639672297658',
      appId:
        process.env.FIREBASE_APP_ID || '1:639672297658:web:974ddf6ad725cc176e7a83',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-L1Z048Y3L2',
    },
    {
      // Config rarely changes; allow short-lived caching by the browser/CDN.
      headers: { 'Cache-Control': 'public, max-age=300' },
    },
  )
}

export const config: Config = {
  path: '/api/firebase-config',
}
