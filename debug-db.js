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
    
    if (registros.length > 0) {
      console.log('\n=== EXEMPLO DE REGISTRO EXISTENTE ===');
      console.log(JSON.stringify(registros[0], null, 2));
    }
    
    // Tentar inserir um registro de teste
    console.log('\n=== INSERINDO REGISTRO DE TESTE ===');
    const registroTeste = {
      data: '2023-01-01',
      cidade_origem: 'TESTE_ORIGEM',
      uf_origem: 'TS',
      base_origem: 'BASE_TESTE',
      nf: 'NF_TESTE' + Date.now(), // Garante que cada execução cria uma NF única
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
    
    const idInserido = await database.insertTransporte(registroTeste);
    console.log(`✅ Registro de teste inserido com ID: ${idInserido}`);
    
    // Verificar se a inserção funcionou
    console.log('\n=== VERIFICANDO INSERÇÃO ===');
    const registrosAposInsercao = await database.getAllTransportes();
    console.log(`Total de registros após inserção: ${registrosAposInsercao.length}`);
    
    // Verificar o último registro inserido
    const ultimoRegistro = registrosAposInsercao.find(r => r.id === idInserido);
    if (ultimoRegistro) {
      console.log('Registro inserido recuperado:');
      console.log(JSON.stringify(ultimoRegistro, null, 2));
    } else {
      console.error('❌ Não foi possível encontrar o registro recém-inserido!');
    }
    
    console.log('\n=== DEPURAÇÃO CONCLUÍDA COM SUCESSO ===');
  } catch (error) {
    console.error('❌ ERRO DURANTE DEPURAÇÃO:', error);
    console.error(error.stack);
  } finally {
    // Fechar a conexão
    await database.close();
  }
}

// Executar a depuração
debugDb(); 