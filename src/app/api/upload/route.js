import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import database from '../../../services/db';
import dePara from '../../../utils/mapeamentoCampos';
import { updateProgress } from './progress/route';

// Funções para formatação de dados
const formatadores = {
  // Formatar data para ISO padrão
  data: (valor) => {
    if (!valor) return '';
    
    // Se já for um objeto Date
    if (valor instanceof Date) {
      return valor.toISOString().split('T')[0];
    }
    
    // Se for string, tentar converter
    if (typeof valor === 'string') {
      // Formato DD/MM/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
        const [dia, mes, ano] = valor.split('/');
        return `${ano}-${mes}-${dia}`;
      }
      
      // Formato MM/DD/YYYY (Excel americano)
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(valor)) {
        const date = new Date(valor);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    // Tentar converter qualquer outro formato
    try {
      const date = new Date(valor);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Erro silencioso
    }
    
    return String(valor);
  },
  
  // Formatar texto para maiúsculas sem acentos
  texto: (valor) => {
    if (!valor) return '';
    return String(valor)
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  },
  
  // Formatar número com 2 casas decimais e vírgula como separador
  numero: (valor) => {
    if (valor === null || valor === undefined) return 0;
    
    let numero;
    if (typeof valor === 'string') {
      // Remover caracteres não numéricos exceto . e ,
      const valorLimpo = valor.replace(/[^\d.,]/g, '').replace(',', '.');
      numero = parseFloat(valorLimpo);
    } else {
      numero = parseFloat(valor);
    }
    
    if (isNaN(numero)) return 0;
    
    // Verificar se o número é inteiro
    if (Number.isInteger(numero)) {
      return numero.toString();
    }
    
    // Formatar com 2 casas decimais e substituir ponto por vírgula
    return Number(numero.toFixed(2)).toString().replace('.', ',');
  },
  
  // Formatar inteiro
  inteiro: (valor) => {
    if (valor === null || valor === undefined) return 0;
    
    let numero;
    if (typeof valor === 'string') {
      // Remover caracteres não numéricos
      const valorLimpo = valor.replace(/\D/g, '');
      numero = parseInt(valorLimpo);
    } else {
      numero = parseInt(valor);
    }
    
    return isNaN(numero) ? 0 : numero;
  }
};

export async function POST(req) {
  try {
    console.log('📤 Iniciando processamento de upload...');
    
    // Capturar informações da requisição
    const formData = await req.formData();
    const file = formData.get('file');
    const uploadId = formData.get('uploadId') || `upload_${Date.now()}`;

    if (!file) {
      console.error('❌ Nenhum arquivo enviado');
      return NextResponse.json(
        { success: false, message: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    console.log(`📋 Arquivo recebido: ${file.name}, tamanho: ${(file.size / 1024).toFixed(2)}KB`);
    updateProgress(uploadId, 0, 100, "Inicializando banco de dados...");
    
    // Conectar e inicializar o banco de dados
    await database.initialize();
    updateProgress(uploadId, 5, 100, "Lendo arquivo...");

    // Obter o conteúdo do arquivo como buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Processar o arquivo com xlsx
    let workbook;
    try {
      // Usar opções adicionais para melhorar a compatibilidade no Windows
      const options = { 
        type: 'buffer',
        cellDates: true,
        cellNF: false,
        cellText: false
      };
      
      // Em vez de ler do arquivo, usar diretamente o buffer que já temos
      workbook = XLSX.read(buffer, options);
      updateProgress(uploadId, 10, 100, "Extraindo dados da planilha...");
    } catch (readError) {
      console.error('❌ Erro ao ler arquivo Excel:', readError);
      updateProgress(uploadId, 0, 100, "Erro ao ler arquivo Excel", true);
      return NextResponse.json(
        { success: false, message: `Erro ao ler arquivo Excel: ${readError.message}` },
        { status: 500 }
      );
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Obter dados com headers originais
    const dadosOriginais = XLSX.utils.sheet_to_json(worksheet);
    
    if (!dadosOriginais || dadosOriginais.length === 0) {
      console.error('❌ Arquivo vazio ou sem dados válidos');
      updateProgress(uploadId, 0, 100, "Arquivo vazio ou sem dados válidos", true);
      return NextResponse.json(
        { success: false, message: 'Arquivo vazio ou sem dados válidos' },
        { status: 400 }
      );
    }

    console.log(`✅ Dados extraídos com sucesso. Total de registros: ${dadosOriginais.length}`);
    updateProgress(uploadId, 15, 100, "Validando dados...");
    
    // Mostrar cabeçalhos encontrados
    const cabecalhosEncontrados = Object.keys(dadosOriginais[0]);

    // Criar um mapeamento inverso (valor -> chaves) para verificar campos compatíveis
    const camposBancoParaPlanilha = {};
    Object.entries(dePara).forEach(([campoPlanilha, campoBanco]) => {
      if (!camposBancoParaPlanilha[campoBanco]) {
        camposBancoParaPlanilha[campoBanco] = [];
      }
      camposBancoParaPlanilha[campoBanco].push(campoPlanilha);
    });

    // Verificar campos compatíveis encontrados
    const camposCompativeis = {};
    cabecalhosEncontrados.forEach(cabecalho => {
      const campoBanco = dePara[cabecalho];
      if (campoBanco) {
        camposCompativeis[campoBanco] = cabecalho;
      }
    });

    updateProgress(uploadId, 20, 100, "Verificando campos obrigatórios...");

    // Verificar campos obrigatórios do banco de dados
    const camposObrigatoriosBanco = ['data', 'cidade_origem', 'uf_origem', 'base_origem', 'nf'];
    const camposObrigatoriosAusentes = [];

    camposObrigatoriosBanco.forEach(campoObrigatorio => {
      if (!camposCompativeis[campoObrigatorio]) {
        // Determinar quais variações do campo obrigatório estão faltando
        const variacoesPossiveis = camposBancoParaPlanilha[campoObrigatorio];
        camposObrigatoriosAusentes.push({
          campoBanco: campoObrigatorio,
          variacoesPossiveis
        });
      }
    });
    
    if (camposObrigatoriosAusentes.length > 0) {
      console.error('❌ Campos obrigatórios ausentes:', JSON.stringify(camposObrigatoriosAusentes, null, 2));
      updateProgress(uploadId, 0, 100, "Campos obrigatórios ausentes no arquivo", true);
      return NextResponse.json({
        success: false,
        message: `Colunas obrigatórias ausentes em seu arquivo`,
        camposObrigatoriosAusentes,
        cabecalhosEncontrados,
        camposCompativeis
      }, { status: 400 });
    }

    // Contar linhas inseridas
    let linhasInseridas = 0;
    const erros = [];
    const totalRegistros = dadosOriginais.length;

    updateProgress(uploadId, 25, 100, `Iniciando inserção de ${totalRegistros} registros...`);

    // Processar todos os registros antes da inserção
    const registrosProcessados = [];

    for (let i = 0; i < dadosOriginais.length; i++) {
      const linha = dadosOriginais[i];
      try {
        const dadosProcessados = {};
        
        // Atualizar progresso periodicamente (a cada 5% do total)
        const progressStep = Math.max(1, Math.floor(totalRegistros / 20));
        if (i % progressStep === 0 || i === dadosOriginais.length - 1) {
          const percentComplete = 25 + Math.floor((i / totalRegistros) * 30);
          updateProgress(
            uploadId, 
            i + 1, 
            totalRegistros, 
            `Processando registro ${i + 1} de ${totalRegistros}`,
            false,
            percentComplete
          );
        }
        
        // Para cada cabeçalho no arquivo, verificar se tem um mapeamento no dePara
        for (const cabecalho of cabecalhosEncontrados) {
          const campoBanco = dePara[cabecalho];
          if (campoBanco && linha[cabecalho] !== undefined) {
            // Obter o valor e aplicar formatação conforme o tipo de campo
            let valor = linha[cabecalho];
            
            // Aplicar formatação conforme o tipo de campo
            if (campoBanco === "data") {
              valor = formatadores.data(valor);
            } else if (["cidade_origem", "uf_origem", "base_origem", "cidade_destino", "uf_destino", "base", "setor", "nf"].includes(campoBanco)) {
              valor = formatadores.texto(valor);
            } else if (campoBanco === "volumes") {
              valor = formatadores.inteiro(valor);
            } else if (["valor_da_nota", "peso_real", "peso_cubado", "frete_peso", "seguro", "total_frete"].includes(campoBanco)) {
              valor = formatadores.numero(valor);
            }
            
            dadosProcessados[campoBanco] = valor;
          }
        }

        // Verificar se todos os campos obrigatórios estão presentes
        const camposObrigatoriosAusentesLinha = camposObrigatoriosBanco.filter(
          campo => dadosProcessados[campo] === undefined || dadosProcessados[campo] === ''
        );

        if (camposObrigatoriosAusentesLinha.length > 0) {
          throw new Error(`Campos obrigatórios ausentes nesta linha: ${camposObrigatoriosAusentesLinha.join(', ')}`);
        }
        
        // Adicionar à lista de registros processados
        registrosProcessados.push(dadosProcessados);
      } catch (error) {
        console.error(`❌ Erro ao processar linha ${i+1}:`, error.message);
        
        erros.push({ 
          linha: i + 1, 
          erro: error.message,
          dados: linha
        });
      }
    }

    // Inserir todos os registros em um único lote usando transações
    updateProgress(uploadId, 60, 100, `Inserindo ${registrosProcessados.length} registros no banco de dados...`);
    console.log(`📊 Inserindo ${registrosProcessados.length} registros em lote`);
    
    try {
      // Usar o novo método de inserção em lote
      linhasInseridas = await database.insertTransportesEmLote(registrosProcessados);
      
      console.log(`✅ ${linhasInseridas} registros inseridos com sucesso no lote`);
    } catch (error) {
      console.error('❌ Erro na inserção em lote:', error.message);
      // Tentar inserir individualmente como fallback
      console.log('⚠️ Tentando inserção individual como fallback...');
      
      linhasInseridas = 0;
      for (const registro of registrosProcessados) {
        try {
          await database.insertTransporte(registro);
          linhasInseridas++;
        } catch (err) {
          console.error('Erro ao inserir registro individual:', err.message);
        }
      }
    }

    console.log(`🏁 Processamento concluído. Registros inseridos: ${linhasInseridas}, erros: ${erros.length}`);
    updateProgress(
      uploadId, 
      totalRegistros, 
      totalRegistros, 
      `Concluído: ${linhasInseridas} inseridos, ${erros.length} erros`,
      true,
      100
    );

    // Fechar a conexão com o banco de dados
    await database.close();
    
    return NextResponse.json({
      success: true,
      message: `${linhasInseridas} registros inseridos com sucesso.`,
      linhasInseridas,
      erros: erros.length > 0 ? erros : null,
      camposUtilizados: Object.entries(camposCompativeis).map(([campoBanco, campoPlanilha]) => ({ 
        banco: campoBanco, 
        planilha: campoPlanilha 
      })),
      cabecalhosEncontrados
    });
  } catch (error) {
    console.error('❌ Erro crítico ao processar upload:', error);
    
    // Garantir que a conexão com o banco seja fechada em caso de erro
    try {
      await database.close();
    } catch (e) {
      console.error('❌ Erro ao fechar conexão:', e);
    }
    
    return NextResponse.json(
      { success: false, message: `Erro ao processar arquivo: ${error.message}` },
      { status: 500 }
    );
  }
} 