// src/config/menu.ts
// Tipagem dos nomes de ícone **direto** do glyphmap do Ionicons (usado pelo @expo/vector-icons)
import IoniconsGlyphs from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json';

export type IconName = keyof typeof IoniconsGlyphs;

export type RouteName =
  | 'Home'
  | 'Igreja'
  | 'Ministérios'
  | 'Notícias'
  | 'Mensagens'
  | 'Ao Vivo'
  | 'Contribuições'
  | 'Devocionais'
  | 'Orações'
  | 'Kids'
  | 'Playlist de Louvor'
  | 'Eventos';

export type MenuItem = {
  id: string;
  label: string;
  icon: IconName;            // agora o TS garante que o nome existe no Ionicons
  route?: RouteName;         // rota interna (React Navigation)
  params?: Record<string, any>;
  externalUrl?: string;      // link externo (ex.: YouTube do canal)
  openInApp?: boolean;       // se for externalUrl: true -> WebView, false -> app externo (futuro)
};

export const MENU_ITEMS: readonly MenuItem[] = [
  // Atenção: 'church-outline' NÃO existe no Ionicons => usando 'home-outline' como alternativa
  { id: 'igreja',        label: 'Igreja',                icon: 'home-outline',           route: 'Igreja' },
  { id: 'ministerios',   label: 'Ministérios',           icon: 'people-outline',         route: 'Ministérios' },
  { id: 'noticias',      label: 'Notícias',              icon: 'newspaper-outline',      route: 'Notícias' },
  { id: 'mensagens',     label: 'Mensagens',             icon: 'videocam-outline',       route: 'Mensagens' },
  { id: 'aovivo',        label: 'Ao Vivo',               icon: 'radio-outline',          route: 'Ao Vivo' },
  { id: 'contribuicoes', label: 'Contribuições',         icon: 'card-outline',           route: 'Contribuições' },
  { id: 'devocionais',   label: 'Devocionais',           icon: 'book-outline',           route: 'Devocionais' },

  // 'hands-outline' NÃO existe no Ionicons => sugeri 'heart-outline' (ou 'hand-left-outline')
  { id: 'oracoes',       label: 'Orações',               icon: 'heart-outline',          route: 'Orações' },

  // 'balloon-outline' NÃO existe no Ionicons => sugeri 'happy-outline'
  { id: 'kids',          label: 'Kids',                  icon: 'happy-outline',          route: 'Kids' },

  { id: 'louvor',        label: 'Playlist de Louvor',    icon: 'musical-notes-outline',  route: 'Playlist de Louvor' },
  { id: 'eventos',       label: 'Eventos',               icon: 'calendar-outline',       route: 'Eventos' },
] as const;