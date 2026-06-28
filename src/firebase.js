import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBlUuSX2oeUq7eTR4Lr5ALOuhVULjLuI_0",
  authDomain: "gichat-1ac38.firebaseapp.com",
  projectId: "gichat-1ac38",
  storageBucket: "gichat-1ac38.firebasestorage.app",
  messagingSenderId: "872411516393",
  appId: "1:872411516393:web:9804a9b5d5cbeed4b78f78"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app