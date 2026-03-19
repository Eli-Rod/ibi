export type BankSettings = {
  id: string;
  bank_name: string;
  bank_code: string;
  bank_logo: string | null;
  agency: string;
  account: string;
  pix_key: string;
  pix_key_type: 'cnpj' | 'cpf' | 'email' | 'phone';
  cnpj: string;
  cnpj_raw: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};