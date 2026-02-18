export type Aviso = {
  id: string;
  titulo: string;
  corpo?: string;
  imagem_url?: string;
  publicar_em?: string;
  fixado: boolean;
  criado_em?: string;
  criado_por?: string;
};

export type Evento = {
  id: string;
  titulo: string;
  descricao?: string;
  imagem_url?: string;
  inicio_em: string;
  fim_em?: string;
  local?: string;
  publico: boolean;
  criado_em?: string;
  criado_por?: string;
};

export type Kid = {
  id: string;
  responsavel_id: string;
  nome_completo: string;
  aniversario?: string;
  observacoes?: string;
  foto_url?: string;
  criado_em?: string;
};

export type KidSessao = {
  id: string;
  evento_id?: string;
  nome: string;
  inicio_em: string;
  fim_em?: string;
  criado_em?: string;
};

export type KidCheckin = {
  id: string;
  kid_id: string;
  sessao_id: string;
  checkin_por: string;
  checkin_em?: string;
  aprovado_por?: string;
  aprovado_em?: string;
  checkout_em?: string;
  checkout_por?: string;
  status: 'pendente' | 'aprovado' | 'finalizado';
  criado_em?: string;
};