import React, { useState, useRef, ChangeEvent } from 'react';
import { FaUpload, FaInfoCircle } from 'react-icons/fa';
import * as XLSX from 'xlsx';

// Interface para os dados da planilha
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
  [key: string]: any; // Para permitir acesso dinâmico às propriedades
}

interface FileUploaderProps {
  onDataProcessed: (data: DadosFreteRow[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Função para converter string para número, tratando vírgula como separador decimal
  const parseNumeroDecimal = (valor: any): number => {
    if (typeof valor === 'number') return valor;
    
    if (typeof valor === 'string') {
      // Remover caracteres não numéricos, exceto vírgula e ponto
      // Substituir vírgula por ponto para o parseFloat funcionar
      const valorLimpo = valor.replace(/[^\d,.-]/g, '').replace(',', '.');
      return parseFloat(valorLimpo);
    }
    
    return 0;
  };
  
  // Função para processar e padronizar uma data
  const processarData = (dataValue: any): Date => {
    // Se já for um objeto Date
    if (dataValue instanceof Date) {
      return new Date(dataValue.getFullYear(), dataValue.getMonth(), dataValue.getDate(), 0, 0, 0, 0);
    }
    
    // Se for uma string, tentar converter para Date
    if (typeof dataValue === 'string') {
      // Tentar identificar o formato da data (DD/MM/AAAA ou AAAA-MM-DD)
      let dataParts;
      
      // Verificar se é no formato brasileiro DD/MM/AAAA
      if (dataValue.includes('/')) {
        dataParts = dataValue.split('/');
        if (dataParts.length === 3) {
          const dia = parseInt(dataParts[0], 10);
          const mes = parseInt(dataParts[1], 10) - 1; // Mês em JS é base 0
          const ano = parseInt(dataParts[2], 10);
          
          // Retornar data normalizada
          return new Date(ano, mes, dia, 0, 0, 0, 0);
        }
      }
      
      // Verificar se é no formato ISO AAAA-MM-DD
      if (dataValue.includes('-')) {
        dataParts = dataValue.split('-');
        if (dataParts.length === 3) {
          const ano = parseInt(dataParts[0], 10);
          const mes = parseInt(dataParts[1], 10) - 1; // Mês em JS é base 0
          const dia = parseInt(dataParts[2], 10);
          
          // Retornar data normalizada
          return new Date(ano, mes, dia, 0, 0, 0, 0);
        }
      }
      
      // Se não conseguiu identificar o formato, usar o construtor padrão
      const data = new Date(dataValue);
      if (!isNaN(data.getTime())) {
        return new Date(data.getFullYear(), data.getMonth(), data.getDate(), 0, 0, 0, 0);
      }
    }
    
    // Se não conseguiu processar ou o valor é inválido, retornar data atual
    console.warn(`Não foi possível processar a data: ${dataValue}`);
    return new Date();
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Verificar se é um arquivo Excel
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        throw new Error('O arquivo deve ser do tipo Excel (.xlsx ou .xls)');
      }
      
      setFileName(file.name);
      
      // Ler o arquivo como array buffer
      const buffer = await file.arrayBuffer();
      
      // Configurar opções para garantir que as datas sejam processadas corretamente
      const workbook = XLSX.read(buffer, { 
        type: 'buffer',
        cellDates: true, // Isso garante que as células de data sejam interpretadas como objetos Date
        dateNF: 'dd/mm/yyyy' // Formato preferido para saída
      });
      
      // Pegar a primeira planilha
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json<DadosFreteRow>(worksheet, {
        raw: false, // Não queremos valores brutos
        dateNF: 'yyyy-mm-dd', // ISO formato para compatibilidade
      });
      
      if (jsonData.length === 0) {
        throw new Error('Nenhum dado encontrado na planilha');
      }
      
      // Verificar se contém as colunas esperadas
      const requiredColumns = [
        'Data', 'Cidade Origem', 'UF Origem', 'Base Origem', 'NF', 
        'Valor da Nota', 'Volumes', 'Peso', 'Cidade Destino', 'UF Destino', 
        'Base', 'Setor', 'Frete Peso', 'Seguro', 'Total Frete'
      ];
      
      const firstRow = jsonData[0];
      const missingColumns = requiredColumns.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
        throw new Error(`Colunas obrigatórias ausentes: ${missingColumns.join(', ')}`);
      }
      
      // Lista de campos monetários
      const camposMonetarios = ['Valor da Nota', 'Frete Peso', 'Seguro', 'Total Frete'];
      // Lista de campos numéricos não monetários
      const camposNumericos = ['Volumes', 'Peso'];
      
      // Garantir que todas as datas estejam em formato string ISO e os campos monetários sejam números
      const processedData = jsonData.map((row, index) => {
        // Criar um novo objeto para as transformações
        const newRow = { ...row };
        
        // Processar o campo Data - agora usando nossa função dedicada
        try {
          const dataOriginal = row.Data;
          const dataProcessada = processarData(dataOriginal);
          
          // Log para depuração dos primeiros registros
          if (index < 5) {
            console.log(`Linha ${index+1} - Data original: ${String(dataOriginal)}, Data processada: ${dataProcessada.toISOString()}`);
          }
          
          newRow.Data = dataProcessada;
        } catch (err) {
          console.error(`Erro ao processar data na linha ${index+1}:`, err);
          // Se ocorrer erro ao processar a data, manter o valor original
        }
        
        // Processar os campos monetários
        camposMonetarios.forEach(campo => {
          if (campo in row) {
            // Garantir que o valor seja numérico, interpretando vírgula como separador decimal
            newRow[campo] = parseNumeroDecimal(row[campo]);
          }
        });
        
        // Processar outros campos numéricos (Volumes, Peso)
        camposNumericos.forEach(campo => {
          if (campo in row) {
            // Garantir que o valor seja numérico
            newRow[campo] = parseNumeroDecimal(row[campo]);
          }
        });
        
        return newRow;
      });
      
      // Log para debug
      console.log('Primeiros registros processados:', processedData.slice(0, 3));
      
      // Processar os dados e enviar para o componente pai
      onDataProcessed(processedData);
      
    } catch (err: any) {
      console.error('Erro ao processar arquivo:', err);
      setError(err.message || 'Erro ao processar o arquivo');
      setFileName(null);
    } finally {
      setIsProcessing(false);
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
    
    setIsDragging(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div 
        className={`border-dashed border-2 ${isDragging ? 'border-primary' : 'border-gray-500'} rounded-lg p-12 text-center transition-colors`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-xl">Processando arquivo...</p>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center">
            <div className="text-3xl text-green-500 mb-4">✓</div>
            <h3 className="text-xl font-semibold mb-2">Arquivo carregado com sucesso</h3>
            <p className="text-gray-400 mb-2">{fileName}</p>
            <button 
              onClick={handleButtonClick}
              className="bg-secondary hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded text-sm transition-all mt-2"
            >
              Selecionar outro arquivo
            </button>
          </div>
        ) : (
          <>
            <div className="text-5xl text-primary mb-4 flex justify-center">
              <FaUpload />
            </div>
            <h3 className="text-xl font-semibold mb-2">Arraste e solte o arquivo Excel</h3>
            <p className="text-gray-400 mb-4">ou</p>
            <button 
              onClick={handleButtonClick}
              className="bg-primary hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded text-lg transition-all"
            >
              Selecione um arquivo
            </button>
            
            <div className="mt-6 flex items-center justify-center">
              <button
                className="text-gray-400 text-sm flex items-center"
                onClick={() => setShowInfo(!showInfo)}
              >
                <FaInfoCircle className="mr-1" />
                {showInfo ? 'Ocultar formato esperado' : 'Ver formato esperado'}
              </button>
            </div>
            
            {showInfo && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg text-left text-xs">
                <p className="font-semibold mb-2">O arquivo XLSX deve conter as seguintes colunas:</p>
                <code className="block bg-gray-900 p-2 rounded text-gray-300 overflow-x-auto whitespace-nowrap">
                  Data | Cidade Origem | UF Origem | Base Origem | NF | Valor da Nota | Volumes | Peso | Cidade Destino | UF Destino | Base | Setor | Frete Peso | Seguro | Total Frete
                </code>
                <p className="mt-2 font-semibold">Importante:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>O campo 'Data' será exibido no formato brasileiro (DD/MM/YYYY)</li>
                  <li>Os campos 'Valor da Nota', 'Frete Peso', 'Seguro' e 'Total Frete' serão exibidos como valores monetários (R$)</li>
                  <li>Os valores decimais no arquivo devem usar vírgula como separador (ex: 51,17)</li>
                </ul>
              </div>
            )}
            
            <p className="text-gray-400 mt-4 text-sm">
              Formato suportado: Excel (.xlsx)
            </p>
          </>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".xlsx,.xls" 
          className="hidden" 
        />
      </div>
      
      {error && (
        <div className="mt-4 bg-red-900/50 text-red-200 p-3 rounded-lg">
          <p className="font-medium">Erro:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 