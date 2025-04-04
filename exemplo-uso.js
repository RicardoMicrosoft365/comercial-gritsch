// Exemplo de uso do banco de dados SQLite
const database = require('./src/services/db');

// Dados de exemplo para inserção
const exemploTransporte = {
  data: '2023-04-04',
  cidade_origem: 'São Paulo',
  uf_origem: 'SP',
  base_origem: 'Base SP',
  nf: '12345',
  valor_da_nota: 1500.50,
  volumes: 3,
  peso_real: 120.5,
  peso_cubado: 150.0,
  cidade_destino: 'Rio de Janeiro',
  uf_destino: 'RJ',
  base: 'Base RJ',
  setor: 'A',
  frete_peso: 180.25,
  seguro: 30.00,
  total_frete: 210.25
};

// Função assíncrona para demonstrar o uso do banco de dados
async function demonstrarUso() {
  try {
    // Conectar ao banco de dados
    await database.connect();
    console.log('Conectado ao banco de dados SQLite.');

    // Inserir um registro de exemplo
    console.log('Inserindo registro de exemplo...');
    const id = await database.insertTransporte(exemploTransporte);
    console.log(`Registro inserido com ID: ${id}`);

    // Buscar todos os registros
    console.log('\nBuscando todos os registros:');
    const transportes = await database.getAllTransportes();
    console.log(`Total de registros: ${transportes.length}`);
    
    // Exibir o primeiro registro encontrado
    if (transportes.length > 0) {
      console.log('\nPrimeiro registro:');
      console.log(transportes[0]);
    }

    // Buscar com filtro
    console.log('\nBuscando transportes de São Paulo:');
    const transportesFiltrados = await database.searchTransportes({
      cidade_origem: 'São Paulo'
    });
    console.log(`Registros encontrados: ${transportesFiltrados.length}`);

    // Fechar a conexão com o banco de dados
    await database.close();
    console.log('\nConexão com o banco de dados fechada.');

  } catch (error) {
    console.error('Erro:', error);
  }
}

// Executar a demonstração
console.log('=== EXEMPLO DE USO DO BANCO DE DADOS SQLite ===');
demonstrarUso(); 