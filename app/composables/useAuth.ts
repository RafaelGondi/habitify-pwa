import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

interface AuthUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

let listenerInitialized = false

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const authReady = useState('auth-ready', () => false)

  if (import.meta.client && !listenerInitialized) {
    listenerInitialized = true
    const { auth } = useFirebase()

    onAuthStateChanged(auth, async (u) => {
      if (u) {
        user.value = { uid: u.uid, displayName: u.displayName, email: u.email, photoURL: u.photoURL }
        const { loadUserData } = useStorage()
        await loadUserData(u.uid)
      }
      else {
        user.value = null
      }
      authReady.value = true
    })
  }

  async function loginWithGoogle() {
    const { auth } = useFirebase()
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  async function logout() {
    const { auth } = useFirebase()
    await signOut(auth)
    navigateTo('/login')
  }

  return { user, authReady, loginWithGoogle, logout }
}
