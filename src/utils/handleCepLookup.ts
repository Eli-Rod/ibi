export type CepLookupResult = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
} | null;

export async function lookupCep(cep: string): Promise<CepLookupResult> {
  try {
    const cleanCep = (cep || '')?.replace(/\D/g, '');
    if (cleanCep.length !== 8) return null;

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (!data || data.erro) return null;

    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      localidade: data.localidade || '',
      uf: data.uf || '',
    };
  } catch (error) {
    console.log('Erro ao buscar CEP (util):', error);
    return null;
  }
}
