// Firebase — Google Sign-In + Firestore (para sa roles: admin / user).
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC-iT8VGsxFv36vXqcJ0H3JocRY3UtpvW4',
  authDomain: 'canteen-app-f49eb.firebaseapp.com',
  projectId: 'canteen-app-f49eb',
  storageBucket: 'canteen-app-f49eb.firebasestorage.app',
  messagingSenderId: '617318254071',
  appId: '1:617318254071:web:385bca0204b8fe7e3f1af2',
  measurementId: 'G-0VS5044M2J'
};

const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { signInWithPopup };

// Kunin ang role ng user mula sa Firestore (collection: "users").
// 1) Hanapin muna by UID (doc id = uid)
// 2) Kapag wala, hanapin by email (kung manual mong ginawa ang document)
// 3) Kapag wala pa rin, gumawa ng bagong document na role = "user"
// Laging naka-trim + lowercase, kaya okay lang kahit may sobrang space (hal. "admin ").
export async function getOrCreateUserRole(user) {
  const email = (user.email || '').toLowerCase();

  // 1) by UID
  const byUid = await getDoc(doc(db, 'users', user.uid));
  if (byUid.exists()) {
    return String(byUid.data().role || 'user').trim().toLowerCase();
  }

  // 2) by email
  const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return String(snap.docs[0].data().role || 'user').trim().toLowerCase();
  }

  // 3) bagong user -> "user" palagi (admin ay sa Firebase Console lang itinatakda)
  await setDoc(doc(db, 'users', user.uid), {
    email,
    displayName: user.displayName || '',
    role: 'user',
    createdAt: serverTimestamp()
  });
  return 'user';
}