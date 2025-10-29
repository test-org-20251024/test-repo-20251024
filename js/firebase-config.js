/ ====================================
// Firebase Configuration
// ====================================

// Firebase SDK をインポート
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyBlopfunGgbBntqQsZySh1_OpzOlnZPwMs",
  authDomain: "crine-free.firebaseapp.com",
  projectId: "crine-free",
  storageBucket: "crine-free.firebasestorage.app",
  messagingSenderId: "510517596927",
  appId: "1:510517596927:web:315c890ed41a92625c72ca"
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firebase Authenticationを初期化
const auth = getAuth(app);

// Cloud Firestoreを初期化
const db = getFirestore(app);

// エクスポート
export { app, auth, db };

console.log('Firebase initialized successfully');
