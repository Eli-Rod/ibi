import { initializeApp } from 'firebase/app';
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const {
  EXPO_PUBLIC_FIREBASE_APIKEY: apiKey,
  EXPO_PUBLIC_FIREBASE_AUTHDOMAIN: authDomain,
  EXPO_PUBLIC_FIREBASE_PROJECTID: projectId,
  EXPO_PUBLIC_FIREBASE_STORAGEBUCKET: storageBucket,
  EXPO_PUBLIC_FIREBASE_MESSAGINGSENDERID: messagingSenderId,
  EXPO_PUBLIC_FIREBASE_APPID: appId
} = process.env;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

export async function getAvisos() {
  const ref = collection(db, 'avisos');
  const q = query(ref, orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}