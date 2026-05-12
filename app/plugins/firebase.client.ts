import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyA5INhuvkDhpaRC9-iPw6Ukc1XLqVu0LWA',
  authDomain: 'habitify-pwa-3399c.firebaseapp.com',
  projectId: 'habitify-pwa-3399c',
  storageBucket: 'habitify-pwa-3399c.firebasestorage.app',
  messagingSenderId: '993186156958',
  appId: '1:993186156958:web:a7015bddd46f705f21468f',
}

export default defineNuxtPlugin(() => {
  const app = getApps()[0] ?? initializeApp(firebaseConfig)
  const db = getFirestore(app)
  const auth = getAuth(app)

  return {
    provide: { db, auth },
  }
})
