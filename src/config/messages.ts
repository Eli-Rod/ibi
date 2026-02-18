// src/config/messages.ts
export type MessagesOpenMode = 'external-app' | 'in-app'; 
// 'external-app' = tenta abrir no app do YouTube e, se não tiver, cai na web.
// 'in-app'       = abre numa WebView dentro do app.

export const MESSAGES_CONFIG = {
  openMode: 'in-app' as MessagesOpenMode, // troque para 'external-app' se preferir
  channel: {
    // Opcional: id do canal para listar "vídeos" ou "ao vivo" depois
    id: 'UCT0uZ2_HNJETRhS4Rj_BXdA', // se tiver; por ora é só para referência futura
    urlVideos: 'https://www.youtube.com/@ibidentidade/videos', // página de vídeos
  },
  // Lista simulada para teste. Depois podemos ler de uma API/fonte.
  items: [
    { id: 'OSvwB4-nsyA', title: '04/01/2026 - Culto - Igreja Batista IDENTIDADE: Compartilhando uma visão de Deus para a IBI' },
    { id: '759HcxXvijM', title: '01/02/2026 - Culto - Igreja Batista IDENTIDADE: Você é importante para Deus' },
    { id: '_bAH25uZL2o', title: '31/12/2025 - Culto da Virada - Igreja Batista IDENTIDADE: Renove sua visão' },
    { id: 'C0DPdy98e4c', title: 'Teste | Video' },
  ],
};