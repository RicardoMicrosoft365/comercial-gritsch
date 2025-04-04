'use client';

import { useState } from 'react';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                         selectedFile.type === 'application/vnd.ms-excel' ||
                         selectedFile.name.endsWith('.xlsx') || 
                         selectedFile.name.endsWith('.xls') || 
                         selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setError(null);
      setErrorDetails(null);
    } else {
      setFile(null);
      setError('Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV válido.');
      setErrorDetails(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Por favor, selecione um arquivo para upload.');
      return;
    }

    try {
      setIsUploading(true);
      setMessage('Processando arquivo...');
      setError(null);
      setErrorDetails(null);
      setSuccess(false);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage(result.message);
        setFile(null);
        // Resetar o campo de upload
        e.target.reset();
      } else {
        setError(result.message || 'Ocorreu um erro ao fazer upload do arquivo.');
        
        // Capturar detalhes do erro
        if (result.camposObrigatoriosAusentes) {
          setErrorDetails({
            tipo: 'camposAusentes',
            camposObrigatoriosAusentes: result.camposObrigatoriosAusentes,
            cabecalhosEncontrados: result.cabecalhosEncontrados || [],
            camposCompativeis: result.camposCompativeis || {}
          });
        } else if (result.erros && result.erros.length > 0) {
          setErrorDetails({
            tipo: 'errosProcessamento',
            erros: result.erros
          });
        }
      }
    } catch (err) {
      setError(`Erro ao enviar arquivo: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const renderErrorDetails = () => {
    if (!errorDetails) return null;

    if (errorDetails.tipo === 'camposAusentes') {
      return (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-md font-medium text-red-800 mb-2">Campos obrigatórios ausentes</h3>
          
          <div className="mb-3">
            <h4 className="text-sm font-medium text-red-700">Cabeçalhos encontrados no seu arquivo:</h4>
            <div className="mt-1 bg-white p-2 rounded border border-red-200 text-xs text-gray-600 max-h-24 overflow-y-auto">
              {errorDetails.cabecalhosEncontrados.length > 0 
                ? errorDetails.cabecalhosEncontrados.map((cabecalho, idx) => (
                    <span key={idx} className="inline-block bg-gray-100 rounded px-2 py-1 m-1">{cabecalho}</span>
                  ))
                : <span className="text-red-500">Nenhum cabeçalho válido encontrado</span>
              }
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-red-700">Campos necessários que estão faltando:</h4>
            <ul className="mt-1 list-disc pl-5 space-y-2">
              {errorDetails.camposObrigatoriosAusentes.map((campo, idx) => (
                <li key={idx} className="text-sm">
                  <strong className="font-medium">{campo.campoBanco}</strong>
                  <div className="text-xs mt-1">
                    Variações aceitas: 
                    <div className="mt-1 bg-white p-2 rounded border border-red-200 text-xs text-gray-600 max-h-16 overflow-y-auto">
                      {campo.variacoesPossiveis && campo.variacoesPossiveis.map((variacao, i) => (
                        <span key={i} className="inline-block bg-gray-100 rounded px-2 py-1 m-1">{variacao}</span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="text-sm text-red-700">
              Adicione estes campos em seu arquivo Excel ou selecione um arquivo com os campos necessários.
            </p>
          </div>
        </div>
      );
    }
    
    if (errorDetails.tipo === 'errosProcessamento') {
      return (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-md font-medium text-red-800 mb-2">Erros no processamento dos dados</h3>
          <p className="text-sm text-red-700 mb-2">
            O arquivo foi recebido, mas ocorreram erros ao processar algumas linhas:
          </p>
          
          <div className="bg-white p-2 rounded border border-red-200 text-xs text-gray-600 max-h-60 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Linha</th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500">Erro</th>
                </tr>
              </thead>
              <tbody>
                {errorDetails.erros.map((erro, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900">{erro.linha}</td>
                    <td className="px-2 py-1 text-xs text-red-600">{erro.erro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className="text-sm text-red-700 mt-3">
            Corrija os erros e tente novamente.
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Upload de Dados de Transporte</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Selecione o arquivo Excel ou CSV com os dados de transporte
          </label>
          
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Clique para selecionar</span> ou arraste o arquivo aqui
                </p>
                <p className="text-xs text-gray-500">XLSX, XLS ou CSV</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />
            </label>
          </div>
          
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Arquivo selecionado: <span className="font-medium">{file.name}</span>
            </p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={!file || isUploading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${!file || isUploading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
          >
            {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
          </button>
        </div>
      </form>

      {error && !errorDetails && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {errorDetails && renderErrorDetails()}

      {success && message && (
        <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900">Formato Esperado do Arquivo</h3>
        <p className="mt-2 text-sm text-gray-600">
          O arquivo Excel deve conter colunas para os campos necessários. O sistema reconhece diversos nomes de colunas.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          <strong>Campos obrigatórios:</strong> Data, Cidade Origem, UF Origem, Base Origem, NF
        </p>
        <div className="mt-3 bg-gray-100 p-4 rounded-md overflow-x-auto">
          <code className="text-xs text-gray-800">
            <strong>Exemplos de cabeçalhos aceitos:</strong> Data, DATA, Data Emissão, Cidade Origem, CIDADE ORIGEM, Origem, CID ORIGEM, ...
          </code>
        </div>
        
        <p className="mt-4 text-sm text-gray-600">
          Para mais detalhes, veja a tabela completa de variações aceitas abaixo.
        </p>
      </div>
    </div>
  );
} 