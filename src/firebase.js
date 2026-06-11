import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBxsXSjGtDTnR3p9kWG50Rv9cl-3vp6AjM",
  authDomain: "techmasters-innovations-drive.firebaseapp.com",
  projectId: "techmasters-innovations-drive",
  storageBucket: "techmasters-innovations-drive.firebasestorage.app",
  messagingSenderId: "190856617063",
  appId: "1:190856617063:web:a366f0c5f000a2ba55c8c2",
  measurementId: "G-6F46TM1TPC"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
