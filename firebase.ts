import { initializeApp, getApps } from 'firebase/app'
import { getFirestore }           from 'firebase/firestore'
import { getAuth }                from 'firebase/auth'
import { CONFIG }                 from './config'

const app  = getApps().length ? getApps()[0]! : initializeApp(CONFIG.FIREBASE)
export const db   = getFirestore(app)
export const auth = getAuth(app)
