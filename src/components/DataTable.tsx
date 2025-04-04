import React, { useState, useCallback, useMemo, memo } from 'react';

// Importar a interface do FileUploader para reutilizar
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

interface DataTableProps {
  data: DadosFreteRow[];
  maxRows?: number;
}

// Componente para célula da tabela memoizada
const TableCell = memo(({ value, className }: { value: string, className: string }) => {
  return <td className={className}>{value}</td>;
});
TableCell.displayName = 'TableCell';

// Componente principal memoizado
const DataTable: React.FC<DataTableProps> = ({ data, maxRows = 10 }) => {
  // Estado para controlar a ordenação
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  // Verificar se existem dados antes de tentar processar
  const tableData = useMemo(() => {
    return data && data.length > 0 ? data : [];
  }, [data]);
  
  // Obter as colunas do primeiro item (se houver)
  const columns = useMemo(() => {
    return tableData.length > 0 ? Object.keys(tableData[0]) : [];
  }, [tableData]);
  
  // Se não houver dados, exibir mensagem
  if (tableData.length === 0) {
    return <div className="text-center text-gray-400 py-8">Nenhum dado disponível</div>;
  }
  
  // Função para configurar a ordenação
  const requestSort = useCallback((key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  }, [sortConfig]);
  
  // Função para comparar valores para ordenação
  const compareValues = useCallback((a: any, b: any, column: string): number => {
    // Tratamento especial para datas
    if (column === 'Data') {
      const dateA = a instanceof Date ? a : new Date(String(a));
      const dateB = b instanceof Date ? b : new Date(String(b));
      
      // Verificar se as datas são válidas
      const validA = !isNaN(dateA.getTime());
      const validB = !isNaN(dateB.getTime());
      
      // Se ambas são inválidas, considerar iguais
      if (!validA && !validB) return 0;
      // Se apenas A é inválida, B vem primeiro
      if (!validA) return 1;
      // Se apenas B é inválida, A vem primeiro
      if (!validB) return -1;
      
      // Comparar datas válidas
      return dateA.getTime() - dateB.getTime();
    }
    
    // Comparação numérica para valores numéricos
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    
    // Converter para string para comparação padrão
    const strA = String(a).toLowerCase();
    const strB = String(b).toLowerCase();
    
    if (strA < strB) return -1;
    if (strA > strB) return 1;
    return 0;
  }, []);
  
  // Ordenar os dados
  const sortedData = useMemo(() => {
    if (!sortConfig || !tableData.length) return tableData.slice(0, maxRows);
    
    const sortableData = [...tableData];
    sortableData.sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      
      const comparison = compareValues(valueA, valueB, sortConfig.key);
      
      return sortConfig.direction === 'ascending' ? comparison : -comparison;
    });
    
    return sortableData.slice(0, maxRows);
  }, [tableData, sortConfig, maxRows, compareValues]);
  
  // Obter o ícone de ordenação para o cabeçalho
  const getSortIcon = useCallback((key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ml-1 text-gray-500">⇅</span>;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <span className="ml-1 text-blue-400">↑</span> 
      : <span className="ml-1 text-blue-400">↓</span>;
  }, [sortConfig]);
  
  // Lista de campos monetários
  const camposMonetarios = useMemo(() => ['Valor da Nota', 'Frete Peso', 'Seguro', 'Total Frete'], []);
  // Lista de outros campos numéricos
  const camposNumericos = useMemo(() => ['Volumes', 'Peso'], []);
  
  // Função para exibir valores numéricos com 2 casas decimais
  const formatValorDecimal = useCallback((valor: number): string => {
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);
  
  // Formatar valores numéricos
  const formatValue = useCallback((value: any, column: string) => {
    // Se valor for undefined ou null, retornar string vazia
    if (value === undefined || value === null) return '';
    
    // Formatação específica para o campo Data
    if (column === 'Data') {
      // Se for um objeto Date direto
      if (value instanceof Date) {
        const day = value.getDate().toString().padStart(2, '0');
        const month = (value.getMonth() + 1).toString().padStart(2, '0');
        const year = value.getFullYear();
        return `${day}/${month}/${year}`;
      }
      
      // Se for string, tenta converter para data
      if (typeof value === 'string') {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          }
        } catch (error) {
          // Silenciar erro
        }
      }
      
      // Se não conseguiu converter, retorna o valor original como string
      return String(value);
    }
    
    // Formatação para valores numéricos
    if (typeof value === 'number') {
      // Verifica se é um campo monetário
      if (camposMonetarios.includes(column)) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      }
      // Outros campos numéricos com casas decimais
      if (camposNumericos.includes(column)) {
        return formatValorDecimal(value);
      }
      // Outros números
      return value.toLocaleString('pt-BR');
    }
    // Valores não numéricos - garantir que é uma string
    return String(value);
  }, [camposMonetarios, camposNumericos, formatValorDecimal]);

  // Memoizar as células para melhorar o desempenho
  const renderCells = useCallback((row: DadosFreteRow, rowIndex: number) => {
    return columns.map((column, colIndex) => {
      const formattedValue = formatValue(row[column], column);
      const className = `px-6 py-4 whitespace-nowrap text-sm ${camposMonetarios.includes(column) ? 'text-green-400' : 'text-gray-300'}`;
      return (
        <TableCell 
          key={`${rowIndex}-${colIndex}`}
          value={formattedValue}
          className={className}
        />
      );
    });
  }, [columns, formatValue, camposMonetarios]);

  return (
    <div className="overflow-x-auto scrollbar-custom">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                scope="col" 
                className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700 ${camposMonetarios.includes(column) ? 'text-green-300' : ''}`}
                onClick={() => requestSort(column)}
              >
                <div className="flex items-center">
                  {column}
                  {getSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}>
              {renderCells(row, rowIndex)}
            </tr>
          ))}
        </tbody>
      </table>
      
      {tableData.length > maxRows && (
        <div className="text-gray-400 text-sm mt-4 text-center">
          Exibindo {maxRows} de {tableData.length} registros
        </div>
      )}
    </div>
  );
};

export default memo(DataTable); 