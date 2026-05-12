import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const app = getApps()[0] ?? initializeApp(config.public.firebase as object)

  const db = getFirestore(app)
  const auth = getAuth(app)

  return {
    provide: { db, auth },
  }
})
