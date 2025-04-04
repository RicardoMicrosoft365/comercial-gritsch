// Script de depuração para o banco de dados SQLite
const database = require('./src/services/db');

async function debugDb() {
  console.log('=== INICIANDO DEPURAÇÃO DO BANCO DE DADOS ===');
  
  try {
    // Conectar ao banco de dados
    await database.connect();
    
    // Verificar a estrutura do banco de dados
    console.log('\n=== VERIFICANDO ESTRUTURA DO BANCO DE DADOS ===');
    const estrutura = await database.verificarEstrutura();
    
    if (!estrutura.tabelaExiste) {
      console.error('❌ A tabela transportes não existe! Verifique se o banco foi inicializado corretamente.');
      process.exit(1);
    }
    
    // Contar registros na tabela
    console.log('\n=== CONTANDO REGISTROS EXISTENTES ===');
    const registros = await database.getAllTransportes();
    console.log(`Total de registros existentes: ${registros.length}`);
    
    // Tentar inserir um registro de teste
    console.log('\n=== INSERINDO REGISTRO DE TESTE ===');
    const registroTeste = {
      data: '2023-01-01',
      cidade_origem: 'TESTE_ORIGEM',
      uf_origem: 'TS',
      base_origem: 'BASE_TESTE',
      nf: 'NF_TESTE' + Date.now(), // Garante um ID único
      valor_da_nota: 100.50,
      volumes: 2,
      peso_real: 50.5,
      peso_cubado: 60.0,
      cidade_destino: 'TESTE_DESTINO',
      uf_destino: 'TD',
      base: 'BASE_DESTINO',
      setor: 'SETOR_TESTE',
      frete_peso: 25.75,
      seguro: 10.0,
      total_frete: 35.75
    };
    
    console.log('Dados para inserção de teste:');
    console.log(JSON.stringify(registroTeste, null, 2));
    
    console.time('Inserção');
    const idInserido = await database.insertTransporte(registroTeste);
    console.timeEnd('Inserção');
    console.log(`✅ Registro de teste inserido com ID: ${idInserido}`);
    
    // Verificar o último registro inserido
    const registrosAposInsercao = await database.getAllTransportes();
    console.log(`Total de registros após inserção: ${registrosAposInsercao.length}`);
    
    console.log('\n=== DEPURAÇÃO CONCLUÍDA COM SUCESSO ===');
  } catch (error) {
    console.error('❌ ERRO DURANTE DEPURAÇÃO:', error);
  } finally {
    // Fechar a conexão
    await database.close();
  }
}

// Executar função de depuração
debugDb(); 