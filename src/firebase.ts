import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { Analytics } from "firebase/analytics"; 
import type { Firestore } from "firebase/firestore"; 
import type { FirebaseStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: "AIzaSyBjyXn1Hq8HzTTIQ9gHcqQOSSNfk9kuq6I",
  authDomain: "xiangdian-5feee.firebaseapp.com",
  databaseURL: "https://xiangdian-5feee-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "xiangdian-5feee",
  storageBucket: "xiangdian-5feee.firebasestorage.app",
  messagingSenderId: "464813968743",
  appId: "1:464813968743:web:2d95e56afc62970b13b3c2",
  measurementId: "G-TPSJ2BCQ1D"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化 Analytics（如果需要）
let analytics: Analytics | undefined;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// 初始化 Firestore
const db: Firestore = getFirestore(app);

// 初始化 Cloud Storage
const storage: FirebaseStorage = getStorage(app);

export { app, analytics, db, storage };
