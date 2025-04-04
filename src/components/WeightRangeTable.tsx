import React, { useMemo, useState } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

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

interface WeightRangeTableProps {
  data: DadosFreteRow[];
  onWeightRangeClick?: (range: WeightRangeData) => void;
  selectedRange?: string;
}

interface WeightRangeData {
  label: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
  accumulated: number;
}

// Tipo para configuração de ordenação
type SortConfig = {
  key: keyof WeightRangeData;
  direction: 'ascending' | 'descending';
} | null;

const WeightRangeTable: React.FC<WeightRangeTableProps> = ({ 
  data, 
  onWeightRangeClick,
  selectedRange 
}) => {
  // Estado para controlar a ordenação
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'percentage', 
    direction: 'descending' 
  });

  // Definição das faixas de peso
  const faixas = [
    { min: 0, max: 10, label: 'Até 10 Kg' },
    { min: 10, max: 20, label: 'Até 20 Kg' },
    { min: 20, max: 30, label: 'Até 30 Kg' },
    { min: 30, max: 40, label: 'Até 40 Kg' },
    { min: 40, max: 50, label: 'Até 50 Kg' },
    { min: 50, max: 70, label: 'Até 70 Kg' },
    { min: 70, max: 100, label: 'Até 100 Kg' },
    { min: 100, max: 200, label: 'Até 200 Kg' },
    { min: 200, max: 300, label: 'Até 300 Kg' },
    { min: 300, max: 400, label: 'Até 400 Kg' },
    { min: 400, max: 500, label: 'Até 500 Kg' },
    { min: 500, max: 1000, label: 'Até 1.000 Kg' },
    { min: 1000, max: 2000, label: 'Até 2.000 Kg' },
    { min: 2000, max: 5000, label: 'Até 5.000 Kg' },
    { min: 5000, max: 10000, label: 'Até 10.000 Kg' },
    { min: 10000, max: 15000, label: 'Até 15.000 Kg' },
    { min: 15000, max: 20000, label: 'Até 20.000 Kg' },
    { min: 20000, max: Infinity, label: 'Maior que 20.000 Kg' }
  ];

  // Função para trocar o tipo de ordenação
  const requestSort = (key: keyof WeightRangeData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  // Processar os dados para cada faixa de peso
  const tableData = useMemo(() => {
    // Se não houver dados, retornar array vazio
    if (!data || data.length === 0) return [];

    // Contar envios por faixa de peso
    const contagem: {[key: string]: number} = {};
    faixas.forEach(faixa => {
      contagem[faixa.label] = 0;
    });

    // Contar as NFs por faixa de peso
    data.forEach(row => {
      const peso = typeof row.Peso === 'number' ? row.Peso : parseFloat(String(row.Peso));
      
      if (!isNaN(peso)) {
        const faixa = faixas.find(f => peso > f.min && peso <= f.max);
        if (faixa) {
          contagem[faixa.label]++;
        }
      }
    });

    // Calcular total
    const total = Object.values(contagem).reduce((sum, count) => sum + count, 0);
    
    // Calcular percentuais e acumulado
    let acumulado = 0;
    const resultado: WeightRangeData[] = faixas.map(faixa => {
      const count = contagem[faixa.label];
      const percentage = total > 0 ? (count / total) * 100 : 0;
      acumulado += percentage;
      
      return {
        ...faixa,
        count,
        percentage,
        accumulated: acumulado
      };
    });

    return resultado;
  }, [data]);
  
  // Ordenar os dados
  const sortedTableData = useMemo(() => {
    if (!tableData.length) return [];
    
    // Filtrar linhas com contagem zero
    const filteredData = tableData.filter(item => item.count > 0);
    
    const sortableData = [...filteredData];
    
    if (sortConfig) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // Recalcular o acumulado com base na ordem atual
    let acumulado = 0;
    return sortableData.map(item => {
      acumulado += item.percentage;
      return {
        ...item,
        accumulated: acumulado
      };
    });
    
  }, [tableData, sortConfig]);

  // Total de envios
  const totalEnvios = useMemo(() => {
    return tableData.reduce((sum, item) => sum + item.count, 0);
  }, [tableData]);

  // Função para obter ícone de ordenação
  const getSortIcon = (key: keyof WeightRangeData) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort className="ml-1 text-gray-500" />;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <FaSortUp className="ml-1 text-blue-400" /> 
      : <FaSortDown className="ml-1 text-blue-400" />;
  };

  // Função para manipular cliques nas linhas
  const handleRowClick = (item: WeightRangeData) => {
    if (onWeightRangeClick) {
      onWeightRangeClick(item);
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-custom mt-6">
      <h3 className="text-xl font-semibold text-gray-300 mb-4">Faixa de Peso</h3>
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
              onClick={() => requestSort('label')}
            >
              <div className="flex items-center">
                Faixa de Peso
                {getSortIcon('label')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
              onClick={() => requestSort('count')}
            >
              <div className="flex items-center">
                Qtde Envio
                {getSortIcon('count')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
              onClick={() => requestSort('percentage')}
            >
              <div className="flex items-center">
                Percentual
                {getSortIcon('percentage')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600"
              onClick={() => requestSort('accumulated')}
            >
              <div className="flex items-center">
                Acumulado
                {getSortIcon('accumulated')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {sortedTableData.map((item, index) => {
            const isSelected = selectedRange === item.label;
            return (
              <tr 
                key={index} 
                className={`
                  ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'} 
                  ${isSelected ? 'bg-blue-900' : ''} 
                  hover:bg-gray-700 cursor-pointer transition-colors duration-150
                `}
                onClick={() => handleRowClick(item)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {item.label}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {item.count.toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {item.percentage.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {item.accumulated.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                </td>
              </tr>
            );
          })}
          <tr className="bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
              Total
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
              {totalEnvios.toLocaleString('pt-BR')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
              100,00%
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
              -
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default WeightRangeTable; 