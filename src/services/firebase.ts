// src/services/firebase.ts
import { getApps, initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  getDocs, getFirestore,
  limit,
  onSnapshot,
  orderBy, query,
  QueryDocumentSnapshot,
  startAfter,
  Timestamp,
  where
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import type { Aviso, Evento } from '../types/content';

const {
  EXPO_PUBLIC_FIREBASE_APIKEY: apiKey,
  EXPO_PUBLIC_FIREBASE_AUTHDOMAIN: authDomain,
  EXPO_PUBLIC_FIREBASE_PROJECTID: projectId,
  EXPO_PUBLIC_FIREBASE_STORAGEBUCKET: storageBucket,
  EXPO_PUBLIC_FIREBASE_MESSAGINGSENDERID: messagingSenderId,
  EXPO_PUBLIC_FIREBASE_APPID: appId
} = process.env;

export const firebaseConfig = {
  apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId,
};

// Evita re‑inicializar no fast refresh
const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

/* ---------- Utils ---------- */
function tsToISO(v: any): string | undefined {
  if (!v) return undefined;
  if (typeof v === 'string') return v;
  // Firestore Timestamp -> ISO
  if (v instanceof Timestamp) return v.toDate().toISOString();
  // {seconds,nanoseconds} -> Timestamp
  if (typeof v === 'object' && 'seconds' in v) {
    return new Timestamp(v.seconds, v.nanoseconds ?? 0).toDate().toISOString();
  }
  return String(v);
}

function mapAviso(docSnap: QueryDocumentSnapshot): Aviso {
  const d = docSnap.data() as any;
  return {
    id: docSnap.id,
    titulo: d.titulo ?? '',
    descricao: d.descricao ?? '',
    imagemUrl: d.imagemUrl ?? '',
    validade: tsToISO(d.validade),
    criadoEm: tsToISO(d.criadoEm),
  };
}

function mapEvento(docSnap: QueryDocumentSnapshot): Evento {
  const d = docSnap.data() as any;
  return {
    id: docSnap.id,
    titulo: d.titulo ?? '',
    descricao: d.descricao ?? '',
    imagemUrl: d.imagemUrl ?? '',
    local: d.local ?? '',
    data: tsToISO(d.data),
    criadoEm: tsToISO(d.criadoEm),
  };
}

/* ---------- Avisos ---------- */

// Leitura simples (sem paginação)
export async function getAvisos(): Promise<Aviso[]> {
  const ref = collection(db, 'avisos');
  const q = query(ref, orderBy('criadoEm', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(mapAviso);
}

// Paginação (cursor)
export async function getAvisosPage(opts?: { pageSize?: number; cursorId?: string }) {
  const size = opts?.pageSize ?? 10;
  const ref = collection(db, 'avisos');
  const base = query(ref, orderBy('criadoEm', 'desc'));
  let q = query(base, limit(size));

  if (opts?.cursorId) {
    const last = await getDoc(doc(db, 'avisos', opts.cursorId));
    if (last.exists()) q = query(base, startAfter(last), limit(size));
  }

  const snap = await getDocs(q);
  const items = snap.docs.map(mapAviso);
  const lastId = items.length ? items[items.length - 1].id : undefined;
  return { items, cursorId: lastId };
}

// Tempo real (listener)
export function observeAvisos(cb: (items: Aviso[]) => void) {
  const ref = collection(db, 'avisos');
  const q = query(ref, orderBy('criadoEm', 'desc'));
  const unsub = onSnapshot(q, (snap) => {
    cb(snap.docs.map(mapAviso));
  });
  return unsub; // chamar unsub() para parar
}

/* ---------- Eventos ---------- */

// Leitura simples (sem paginação)
export async function getEventos(): Promise<Evento[]> {
  const ref = collection(db, 'eventos');
  const q = query(ref, orderBy('data', 'asc')); // eventos futuros primeiro
  const snap = await getDocs(q);
  return snap.docs.map(mapEvento);
}

// Eventos futuros (filtra por data >= hoje)
export async function getProximosEventos(): Promise<Evento[]> {
  const hojeISO = new Date();
  hojeISO.setHours(0, 0, 0, 0);
  const ref = collection(db, 'eventos');
  // Se 'data' estiver salva como string ISO, podemos usar where('data','>=',hojeISOString)
  const q = query(
    ref,
    where('data', '>=', hojeISO.toISOString()),
    orderBy('data', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapEvento);
}

// Paginação (cursor)
export async function getEventosPage(opts?: { pageSize?: number; cursorId?: string }) {
  const size = opts?.pageSize ?? 10;
  const ref = collection(db, 'eventos');
  const base = query(ref, orderBy('data', 'asc'));
  let q = query(base, limit(size));

  if (opts?.cursorId) {
    const last = await getDoc(doc(db, 'eventos', opts.cursorId));
    if (last.exists()) q = query(base, startAfter(last), limit(size));
  }

  const snap = await getDocs(q);
  const items = snap.docs.map(mapEvento);
  const lastId = items.length ? items[items.length - 1].id : undefined;
  return { items, cursorId: lastId };
}

// Tempo real (listener)
export function observeEventos(cb: (items: Evento[]) => void) {
  const ref = collection(db, 'eventos');
  const q = query(ref, orderBy('data', 'asc'));
  const unsub = onSnapshot(q, (snap) => {
    cb(snap.docs.map(mapEvento));
  });
  return unsub;
}