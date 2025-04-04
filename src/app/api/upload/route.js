import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import * as XLSX from 'xlsx';
import path from 'path';
import os from 'os';
import database from '../../../services/db';
import dePara from '../../../utils/mapeamentoCampos';

export async function POST(req) {
  try {
    console.log('📤 Iniciando processamento de upload...');
    
    // Conectar ao banco de dados
    await database.connect();
    console.log('🔌 Conectado ao banco de dados');

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      console.error('❌ Nenhum arquivo enviado');
      return NextResponse.json(
        { success: false, message: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    console.log(`📋 Arquivo recebido: ${file.name}, tamanho: ${(file.size / 1024).toFixed(2)}KB`);

    // Salvar temporariamente o arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, file.name);
    await fs.writeFile(tempFilePath, buffer);
    console.log(`💾 Arquivo temporário salvo em: ${tempFilePath}`);

    // Processar o arquivo com xlsx
    console.log('📊 Processando planilha...');
    const workbook = XLSX.readFile(tempFilePath);
    const sheetName = workbook.SheetNames[0];
    console.log(`📑 Planilha encontrada: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];
    
    // Obter dados com headers originais
    const dadosOriginais = XLSX.utils.sheet_to_json(worksheet);
    
    if (!dadosOriginais || dadosOriginais.length === 0) {
      console.error('❌ Arquivo vazio ou sem dados válidos');
      return NextResponse.json(
        { success: false, message: 'Arquivo vazio ou sem dados válidos' },
        { status: 400 }
      );
    }

    console.log(`✅ Dados extraídos com sucesso. Total de registros: ${dadosOriginais.length}`);
    
    // Mostrar cabeçalhos encontrados
    const cabecalhosEncontrados = Object.keys(dadosOriginais[0]);
    console.log('📋 Cabeçalhos encontrados no arquivo:', cabecalhosEncontrados);
    console.log('🔍 Primeira linha da planilha:', JSON.stringify(dadosOriginais[0], null, 2));

    // Criar um mapeamento inverso (valor -> chaves) para verificar campos compatíveis
    const camposBancoParaPlanilha = {};
    Object.entries(dePara).forEach(([campoPlanilha, campoBanco]) => {
      if (!camposBancoParaPlanilha[campoBanco]) {
        camposBancoParaPlanilha[campoBanco] = [];
      }
      camposBancoParaPlanilha[campoBanco].push(campoPlanilha);
    });

    console.log('📊 Mapeamento de campos do banco para variações na planilha:', JSON.stringify(camposBancoParaPlanilha, null, 2));

    // Verificar campos compatíveis encontrados
    const camposCompativeis = {};
    cabecalhosEncontrados.forEach(cabecalho => {
      const campoBanco = dePara[cabecalho];
      if (campoBanco) {
        camposCompativeis[campoBanco] = cabecalho;
      }
    });

    console.log('📋 Campos compatíveis encontrados:', JSON.stringify(camposCompativeis, null, 2));

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

    console.log('🔄 Iniciando processamento dos dados para inserção...');

    // Para cada linha, transformar os campos usando o mapeamento dePara
    for (let i = 0; i < dadosOriginais.length; i++) {
      const linha = dadosOriginais[i];
      try {
        const dadosProcessados = {};
        
        // Para cada cabeçalho no arquivo, verificar se tem um mapeamento no dePara
        for (const cabecalho of cabecalhosEncontrados) {
          const campoBanco = dePara[cabecalho];
          if (campoBanco && linha[cabecalho] !== undefined) {
            // Converter o valor para o tipo correto conforme o campo
            let valor = linha[cabecalho];
            
            // Conversões específicas por tipo de campo
            if (["valor_da_nota", "peso_real", "peso_cubado", "frete_peso", "seguro", "total_frete"].includes(campoBanco)) {
              // Converter para número, aceitando diferentes formatos
              const valorOriginal = valor;
              valor = typeof valor === 'string' 
                ? parseFloat(valor.replace(/[^\d.,]/g, '').replace(',', '.')) || 0 
                : parseFloat(valor) || 0;
              
              if (isNaN(valor)) {
                console.warn(`⚠️ Conversão para número falhou: '${valorOriginal}' => 0`);
                valor = 0;
              }
            } else if (campoBanco === "volumes") {
              // Converter para inteiro
              const valorOriginal = valor;
              valor = typeof valor === 'string'
                ? parseInt(valor.replace(/\D/g, '')) || 0
                : parseInt(valor) || 0;
              
              if (isNaN(valor)) {
                console.warn(`⚠️ Conversão para inteiro falhou: '${valorOriginal}' => 0`);
                valor = 0;
              }
            }
            
            dadosProcessados[campoBanco] = valor;
          }
        }

        // Verificar se todos os campos obrigatórios estão presentes
        const camposObrigatoriosAusentesLinha = camposObrigatoriosBanco.filter(
          campo => dadosProcessados[campo] === undefined
        );

        if (camposObrigatoriosAusentesLinha.length > 0) {
          throw new Error(`Campos obrigatórios ausentes nesta linha: ${camposObrigatoriosAusentesLinha.join(', ')}`);
        }

        console.log(`📝 Dados processados para linha ${i+1}:`, JSON.stringify(dadosProcessados, null, 2));

        // Inserir no banco de dados
        const novoId = await database.insertTransporte(dadosProcessados);
        console.log(`✅ Linha ${i+1} inserida com sucesso. ID: ${novoId}`);
        linhasInseridas++;
      } catch (error) {
        console.error(`❌ Erro ao processar linha ${i+1}:`, error.message);
        console.error('Dados da linha:', JSON.stringify(linha, null, 2));
        
        erros.push({ 
          linha: i + 1, 
          erro: error.message,
          dados: linha
        });
      }
    }

    console.log(`🏁 Processamento concluído. Registros inseridos: ${linhasInseridas}, erros: ${erros.length}`);

    // Fechar a conexão com o banco de dados
    await database.close();
    console.log('🔌 Conexão com o banco de dados fechada');
    
    // Remover o arquivo temporário
    await fs.unlink(tempFilePath);
    console.log('🗑️ Arquivo temporário removido');

    return NextResponse.json({
      success: true,
      message: `${linhasInseridas} registros inseridos com sucesso.`,
      erros: erros.length > 0 ? erros : null,
      camposUtilizados: Object.entries(camposCompativeis).map(([campoBanco, campoPlanilha]) => ({ 
        banco: campoBanco, 
        planilha: campoPlanilha 
      })),
      cabecalhosEncontrados
    });
  } catch (error) {
    console.error('❌ Erro crítico ao processar upload:', error);
    console.error(error.stack);
    
    // Garantir que a conexão com o banco seja fechada em caso de erro
    try {
      await database.close();
      console.log('🔌 Conexão com o banco de dados fechada após erro');
    } catch (e) {
      console.error('❌ Erro ao fechar conexão:', e);
    }
    
    return NextResponse.json(
      { success: false, message: `Erro ao processar arquivo: ${error.message}` },
      { status: 500 }
    );
  }
} 