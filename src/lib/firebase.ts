import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBwWsSux0u9tJt66BSYExzGKi-GlEqcXys',
  authDomain: 'controle-servicos-881f6.firebaseapp.com',
  projectId: 'controle-servicos-881f6',
  storageBucket: 'controle-servicos-881f6.firebasestorage.app',
  messagingSenderId: '432701414240',
  appId: '1:432701414240:web:477959d746cb8082e05c05',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
