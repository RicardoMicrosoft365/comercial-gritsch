import FileUpload from '../../components/FileUpload';

export const metadata = {
  title: 'Upload de Arquivos - Sistema de Transporte',
  description: 'Faça upload de arquivos para inserir dados no sistema',
};

export default function UploadPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Upload de Dados de Transporte</h1>
      <FileUpload />
      
      <div className="mt-12 max-w-4xl mx-auto bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Instruções de Upload</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>Apenas arquivos Excel (.xlsx, .xls) ou CSV são suportados.</li>
          <li><strong>NOVIDADE:</strong> O sistema agora reconhece automaticamente diversas variações de nomes de colunas (como maiúsculas/minúsculas, abreviações, etc.)</li>
          <li>As colunas obrigatórias são relacionadas a: Data, Cidade Origem, UF Origem, Base Origem e NF.</li>
          <li>Campos numéricos são automaticamente limpos e convertidos (formatos como "1.500,50" e "1500.50" são aceitos).</li>
          <li>Datas podem estar em diversos formatos, mas recomendamos YYYY-MM-DD (ex: 2023-04-04).</li>
        </ul>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Estrutura do Arquivo</h3>
          <p className="text-sm text-gray-700 mb-3">
            O arquivo Excel ou CSV deve conter colunas que correspondam aos seguintes campos:
          </p>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border-b text-left">Campo</th>
                  <th className="py-2 px-4 border-b text-left">Exemplos de nomes aceitos</th>
                  <th className="py-2 px-4 border-b text-left">Tipo de Dado</th>
                  <th className="py-2 px-4 border-b text-left">Obrigatório</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">Data</td>
                  <td className="py-2 px-4 border-b text-sm">Data, DATA, data, Data Emissão, Dt Emissão, DT</td>
                  <td className="py-2 px-4 border-b">Data</td>
                  <td className="py-2 px-4 border-b text-green-600">Sim</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">Cidade Origem</td>
                  <td className="py-2 px-4 border-b text-sm">Cidade Origem, CIDADE ORIGEM, Origem, Cidade Orig, CID ORIGEM</td>
                  <td className="py-2 px-4 border-b">Texto</td>
                  <td className="py-2 px-4 border-b text-green-600">Sim</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">UF Origem</td>
                  <td className="py-2 px-4 border-b text-sm">UF Origem, UF ORIGEM, Estado Origem, UF Orig, UF</td>
                  <td className="py-2 px-4 border-b">Texto</td>
                  <td className="py-2 px-4 border-b text-green-600">Sim</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">Base Origem</td>
                  <td className="py-2 px-4 border-b text-sm">Base Origem, BASE ORIGEM, Base Orig, Filial Origem</td>
                  <td className="py-2 px-4 border-b">Texto</td>
                  <td className="py-2 px-4 border-b text-green-600">Sim</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">NF</td>
                  <td className="py-2 px-4 border-b text-sm">NF, Nota Fiscal, NOTA FISCAL, Nota, Num NF, NRO NF</td>
                  <td className="py-2 px-4 border-b">Texto</td>
                  <td className="py-2 px-4 border-b text-green-600">Sim</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">Valor da Nota</td>
                  <td className="py-2 px-4 border-b text-sm">Valor da Nota, VALOR DA NOTA, Valor NF, Vlr Nota</td>
                  <td className="py-2 px-4 border-b">Número</td>
                  <td className="py-2 px-4 border-b text-gray-500">Não</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">Volumes</td>
                  <td className="py-2 px-4 border-b text-sm">Volumes, VOLUMES, Vol, Qtde Volumes</td>
                  <td className="py-2 px-4 border-b">Número inteiro</td>
                  <td className="py-2 px-4 border-b text-gray-500">Não</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">Peso Real</td>
                  <td className="py-2 px-4 border-b text-sm">Peso Real, PESO REAL, Peso R, Peso Bruto</td>
                  <td className="py-2 px-4 border-b">Número</td>
                  <td className="py-2 px-4 border-b text-gray-500">Não</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">Peso Cubado</td>
                  <td className="py-2 px-4 border-b text-sm">Peso, PESO, Peso Cubado, Cubagem</td>
                  <td className="py-2 px-4 border-b">Número</td>
                  <td className="py-2 px-4 border-b text-gray-500">Não</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">Cidade Destino</td>
                  <td className="py-2 px-4 border-b text-sm">Cidade Destino, CIDADE DESTINO, Destino, CID DESTINO</td>
                  <td className="py-2 px-4 border-b">Texto</td>
                  <td className="py-2 px-4 border-b text-gray-500">Não</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">UF Destino</td>
                  <td className="py-2 px-4 border-b text-sm">UF Destino, UF DESTINO, Estado Destino, UF Dest</td>
                  <td className="py-2 px-4 border-b">Texto</td>
                  <td className="py-2 px-4 border-b text-gray-500">Não</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">Base</td>
                  <td className="py-2 px-4 border-b text-sm">Base, BASE, Base Destino, Filial</td>
                  <td className="py-2 px-4 border-b">Texto</td>
                  <td className="py-2 px-4 border-b text-gray-500">Não</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">Setor</td>
                  <td className="py-2 px-4 border-b text-sm">Setor, SETOR, Área, Area</td>
                  <td className="py-2 px-4 border-b">Texto</td>
                  <td className="py-2 px-4 border-b text-gray-500">Não</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">Frete Peso</td>
                  <td className="py-2 px-4 border-b text-sm">Frete Peso, FRETE PESO, Frete, Vlr Frete</td>
                  <td className="py-2 px-4 border-b">Número</td>
                  <td className="py-2 px-4 border-b text-gray-500">Não</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">Seguro</td>
                  <td className="py-2 px-4 border-b text-sm">Seguro, SEGURO, Valor Seguro, Vlr Seguro</td>
                  <td className="py-2 px-4 border-b">Número</td>
                  <td className="py-2 px-4 border-b text-gray-500">Não</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b font-medium">Total Frete</td>
                  <td className="py-2 px-4 border-b text-sm">Total Frete, TOTAL FRETE, Total, Vlr Total</td>
                  <td className="py-2 px-4 border-b">Número</td>
                  <td className="py-2 px-4 border-b text-gray-500">Não</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="mt-4 text-sm text-gray-700">
            <strong>ATENÇÃO:</strong> O sistema agora suporta diversas variações de nomes de colunas. Veja alguns dos formatos aceitos acima. Para uma lista completa, consulte a documentação.
          </p>
          
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <h4 className="font-semibold text-yellow-800">Em caso de erro no upload</h4>
            <ul className="list-disc pl-5 mt-2 text-sm text-yellow-800">
              <li>Verifique se todas as colunas obrigatórias estão presentes no arquivo</li>
              <li>Confirme se os nomes das colunas estão em um dos formatos aceitos</li>
              <li>Certifique-se de que a planilha não contém dados corrompidos</li>
              <li>Tente um arquivo mais simples primeiro para testar o sistema</li>
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  );
} 