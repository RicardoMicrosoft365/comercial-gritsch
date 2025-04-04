import React from 'react';

interface DadosFreteRow {
  Data: string | Date;
  'Cidade Origem': string;
  'UF Origem': string;
  'Base Origem': string;
  NF: string | number;
  'Valor da Nota': number;
  Volumes: number;
  Peso: number;
  'Cidade Destino': string;
  'UF Destino': string;
  Base: string;
  Setor: string;
  'Frete Peso': number;
  Seguro: number;
  'Total Frete': number;
  [key: string]: any;
}

interface DataSummaryProps {
  data: DadosFreteRow[];
}

const DataSummary: React.FC<DataSummaryProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Função auxiliar para formatar data
  const formatDate = (dateValue: string | Date): string => {
    if (!dateValue) return '';
    
    // Se já for string, tenta converter para data
    const date = dateValue instanceof Date ? dateValue : new Date(String(dateValue));
    
    if (!isNaN(date.getTime())) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    
    // Se não for uma data válida, retorna a string original
    return String(dateValue);
  };

  // Cálculo das estatísticas
  const totalRegistros = data.length;
  
  // Soma de valores numéricos importantes
  const totalValorNotas = data.reduce((sum, row) => {
    const valor = typeof row['Valor da Nota'] === 'number' ? row['Valor da Nota'] : 0;
    return sum + valor;
  }, 0);
  
  const totalVolumes = data.reduce((sum, row) => {
    const valor = typeof row['Volumes'] === 'number' ? row['Volumes'] : 0;
    return sum + valor;
  }, 0);
  
  const totalPeso = data.reduce((sum, row) => {
    const valor = typeof row['Peso'] === 'number' ? row['Peso'] : 0;
    return sum + valor;
  }, 0);
  
  const totalFrete = data.reduce((sum, row) => {
    const valor = typeof row['Total Frete'] === 'number' ? row['Total Frete'] : 0;
    return sum + valor;
  }, 0);
  
  const totalSeguro = data.reduce((sum, row) => {
    const valor = typeof row['Seguro'] === 'number' ? row['Seguro'] : 0;
    return sum + valor;
  }, 0);
  
  const totalFretePeso = data.reduce((sum, row) => {
    const valor = typeof row['Frete Peso'] === 'number' ? row['Frete Peso'] : 0;
    return sum + valor;
  }, 0);
  
  // Contagem de UFs únicas
  const ufsOrigem = Array.from(new Set(data.map(row => row['UF Origem'])));
  const ufsDestino = Array.from(new Set(data.map(row => row['UF Destino'])));
  
  // Contagem de cidades únicas
  const cidadesOrigem = Array.from(new Set(data.map(row => row['Cidade Origem'])));
  const cidadesDestino = Array.from(new Set(data.map(row => row['Cidade Destino'])));

  // Identificar o intervalo de datas - garantir que tratamos corretamente objetos Date e strings
  const processDates = () => {
    try {
      const datas = data.map(row => {
        if (row.Data instanceof Date) return row.Data;
        if (typeof row.Data === 'string') return new Date(row.Data);
        return null;
      }).filter(date => date && !isNaN(date.getTime())) as Date[];
      
      if (datas.length === 0) return { dataInicial: null, dataFinal: null };
      
      const timestamps = datas.map(d => d.getTime());
      const dataInicial = new Date(Math.min(...timestamps));
      const dataFinal = new Date(Math.max(...timestamps));
      
      return { dataInicial, dataFinal };
    } catch (error) {
      console.error("Erro ao processar datas:", error);
      return { dataInicial: null, dataFinal: null };
    }
  };
  
  const { dataInicial, dataFinal } = processDates();
  
  // Formatação de valores numéricos
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="text-sm font-medium text-gray-400 mb-1">Total de Registros</h3>
        <p className="text-2xl font-bold">{totalRegistros}</p>
      </div>

      {dataInicial && dataFinal && (
        <div className="bg-gray-800 rounded-lg p-4 shadow">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Período</h3>
          <p className="text-xl font-bold">
            {formatDate(dataInicial)} a {formatDate(dataFinal)}
          </p>
        </div>
      )}
      
      <div className="bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="text-sm font-medium text-gray-400 mb-1">Valor Total das Notas</h3>
        <p className="text-2xl font-bold text-green-500">{formatCurrency(totalValorNotas)}</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="text-sm font-medium text-gray-400 mb-1">Volumes Totais</h3>
        <p className="text-2xl font-bold">{formatNumber(totalVolumes)}</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="text-sm font-medium text-gray-400 mb-1">Peso Total (kg)</h3>
        <p className="text-2xl font-bold">{formatNumber(totalPeso)}</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="text-sm font-medium text-gray-400 mb-1">Total de Frete</h3>
        <p className="text-2xl font-bold text-green-500">{formatCurrency(totalFrete)}</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="text-sm font-medium text-gray-400 mb-1">Total de Frete Peso</h3>
        <p className="text-2xl font-bold text-green-500">{formatCurrency(totalFretePeso)}</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="text-sm font-medium text-gray-400 mb-1">Total de Seguro</h3>
        <p className="text-2xl font-bold text-green-500">{formatCurrency(totalSeguro)}</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="text-sm font-medium text-gray-400 mb-1">UFs de Origem</h3>
        <p className="text-2xl font-bold">{ufsOrigem.length}</p>
        <p className="text-xs text-gray-500 mt-1">{ufsOrigem.join(', ')}</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="text-sm font-medium text-gray-400 mb-1">UFs de Destino</h3>
        <p className="text-2xl font-bold">{ufsDestino.length}</p>
        <p className="text-xs text-gray-500 mt-1">{ufsDestino.join(', ')}</p>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 shadow">
        <h3 className="text-sm font-medium text-gray-400 mb-1">Total de Cidades</h3>
        <p className="text-2xl font-bold">{cidadesOrigem.length + cidadesDestino.length}</p>
        <p className="text-xs text-gray-500 mt-1">
          {cidadesOrigem.length} origens, {cidadesDestino.length} destinos
        </p>
      </div>
    </div>
  );
};

export default DataSummary; 