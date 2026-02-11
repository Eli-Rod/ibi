// src/types/content.ts
export type Aviso = {
  id: string;
  titulo: string;
  descricao?: string;
  imagemUrl?: string;
  validade?: string;           // ISO yyyy-mm-dd (ou Timestamp no Firestore)
  criadoEm?: string;           // ISO (ou Timestamp -> converter)
};

export type Evento = {
  id: string;
  titulo: string;
  descricao?: string;
  imagemUrl?: string;
  local?: string;
  data?: string;               // ISO yyyy-mm-dd (ou Timestamp -> converter)
  criadoEm?: string;           // ISO (ou Timestamp -> converter)
};