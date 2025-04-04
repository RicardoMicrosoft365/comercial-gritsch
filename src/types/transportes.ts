export interface Transporte {
  id?: number;
  data: string;
  cidade_origem: string;
  uf_origem: string;
  base_origem: string;
  nf: string;
  valor_da_nota: number;
  volumes: number;
  peso_real: number;
  peso_cubado: number;
  cidade_destino: string;
  uf_destino: string;
  base: string;
  setor: string;
  frete_peso: number;
  seguro: number;
  total_frete: number;
} 