import type { Firestore } from 'firebase/firestore'
import type { Auth } from 'firebase/auth'

export function useFirebase() {
  const { $db, $auth } = useNuxtApp()
  return { db: $db as Firestore, auth: $auth as Auth }
}
