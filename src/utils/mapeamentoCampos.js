/**
 * Mapeamento dos campos que vêm da planilha para os campos do banco de dados
 * Chave: Nome da coluna na planilha
 * Valor: Nome do campo no banco de dados
 */
const dePara = {
  // Data
  "Data": "data",
  "DATA": "data",
  "data": "data",
  "Data Emissão": "data",
  "DATA EMISSÃO": "data",
  "Dt Emissão": "data",
  "DT": "data",
  
  // Cidade Origem
  "Cidade Origem": "cidade_origem",
  "CIDADE ORIGEM": "cidade_origem",
  "cidade origem": "cidade_origem",
  "Origem": "cidade_origem",
  "ORIGEM": "cidade_origem",
  "Cidade Orig": "cidade_origem",
  "CID ORIGEM": "cidade_origem",
  
  // UF Origem
  "UF Origem": "uf_origem",
  "UF ORIGEM": "uf_origem",
  "uf origem": "uf_origem",
  "Estado Origem": "uf_origem",
  "ESTADO ORIGEM": "uf_origem",
  "UF Orig": "uf_origem",
  "UF": "uf_origem",
  
  // Base Origem
  "Base Origem": "base_origem",
  "BASE ORIGEM": "base_origem",
  "base origem": "base_origem",
  "Base Orig": "base_origem",
  "Filial Origem": "base_origem",
  "FILIAL ORIGEM": "base_origem",
  
  // NF
  "NF": "nf",
  "Nota Fiscal": "nf",
  "NOTA FISCAL": "nf",
  "Nota": "nf",
  "NOTA": "nf",
  "Num NF": "nf",
  "NRO NF": "nf",
  
  // Valor da Nota
  "Valor da Nota": "valor_da_nota",
  "VALOR DA NOTA": "valor_da_nota",
  "Valor NF": "valor_da_nota",
  "VALOR NF": "valor_da_nota",
  "Vlr Nota": "valor_da_nota",
  "Valor": "valor_da_nota",
  
  // Volumes
  "Volumes": "volumes",
  "VOLUMES": "volumes",
  "volumes": "volumes",
  "Vol": "volumes",
  "VOL": "volumes",
  "Qtde Volumes": "volumes",
  "QTDE VOLUMES": "volumes",
  
  // Peso Real
  "Peso Real": "peso_real",
  "PESO REAL": "peso_real",
  "peso real": "peso_real",
  "Peso R": "peso_real",
  "PESO R": "peso_real",
  "Peso Bruto": "peso_real",
  "PESO BRUTO": "peso_real",
  
  // Peso Cubado
  "Peso": "peso_cubado",
  "PESO": "peso_cubado",
  "Peso Cubado": "peso_cubado",
  "PESO CUBADO": "peso_cubado",
  "peso cubado": "peso_cubado",
  "Cubagem": "peso_cubado",
  "CUBAGEM": "peso_cubado",
  
  // Cidade Destino
  "Cidade Destino": "cidade_destino",
  "CIDADE DESTINO": "cidade_destino",
  "cidade destino": "cidade_destino",
  "Destino": "cidade_destino",
  "DESTINO": "cidade_destino",
  "Cidade Dest": "cidade_destino",
  "CID DESTINO": "cidade_destino",
  
  // UF Destino
  "UF Destino": "uf_destino",
  "UF DESTINO": "uf_destino",
  "uf destino": "uf_destino",
  "Estado Destino": "uf_destino",
  "ESTADO DESTINO": "uf_destino",
  "UF Dest": "uf_destino",
  
  // Base
  "Base": "base",
  "BASE": "base",
  "base": "base",
  "Base Destino": "base",
  "BASE DESTINO": "base",
  "Filial": "base",
  "FILIAL": "base",
  
  // Setor
  "Setor": "setor",
  "SETOR": "setor",
  "setor": "setor",
  "Área": "setor",
  "ÁREA": "setor",
  "Area": "setor",
  "AREA": "setor",
  
  // Frete Peso
  "Frete Peso": "frete_peso",
  "FRETE PESO": "frete_peso",
  "frete peso": "frete_peso",
  "Frete": "frete_peso",
  "FRETE": "frete_peso",
  "Vlr Frete": "frete_peso",
  
  // Seguro
  "Seguro": "seguro",
  "SEGURO": "seguro",
  "seguro": "seguro",
  "Valor Seguro": "seguro",
  "VALOR SEGURO": "seguro",
  "Vlr Seguro": "seguro",
  
  // Total Frete
  "Total Frete": "total_frete",
  "TOTAL FRETE": "total_frete",
  "total frete": "total_frete",
  "Total": "total_frete",
  "TOTAL": "total_frete",
  "Vlr Total": "total_frete",
  "Total do Frete": "total_frete"
};

export default dePara; 