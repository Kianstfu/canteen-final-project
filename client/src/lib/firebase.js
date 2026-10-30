// Firebase — Google Sign-In lang ang gamit (walang Firestore).
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC-iT8VGsxFv36vXqcJ0H3JocRY3UtpvW4',
  authDomain: 'canteen-app-f49eb.firebaseapp.com',
  projectId: 'canteen-app-f49eb',
  storageBucket: 'canteen-app-f49eb.firebasestorage.app',
  messagingSenderId: '617318254071',
  appId: '1:617318254071:web:385bca0204b8fe7e3f1af2',
  measurementId: 'G-0VS5044M2J'
};

// ISANG Gmail lang ang admin. Kahit sinong ibang Google account = guest/customer.
export const ADMIN_EMAIL = 'delosreyeskenzedrick2@gmail.com';

const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { signInWithPopup };
