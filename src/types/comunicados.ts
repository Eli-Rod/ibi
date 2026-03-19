export type Comunicado = {
  id: string;
  titulo: string;
  corpo: string | null;
  publicar_em: string;        // Data que começa a aparecer
  data_evento: string | null;  // Data do evento (opcional)
  data_expiracao: string | null; // Data que para de aparecer
  criado_por: string | null;
  fixado: boolean;             // Fixado no topo (antigo)
  destaque: boolean;           // Novo: aparece em destaque
  tipo: 'comunicado' | 'evento' | 'noticia' | 'aviso'; // Tipo de conteúdo
  criado_em: string;
  imagem_url: string | null;
};

export type ComunicadoComAutor = Comunicado & {
  autor_nome?: string;
  autor_avatar?: string | null;
};