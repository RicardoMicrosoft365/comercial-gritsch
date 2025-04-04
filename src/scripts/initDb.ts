const { initializeDatabase } = require('../services/database');

async function init() {
  console.log('Inicializando banco de dados...');
  try {
    const db = await initializeDatabase();
    console.log('Banco de dados inicializado com sucesso!');
    console.log(`Tabela 'transportes' criada para armazenar os seguintes dados:`);
    console.log('- data');
    console.log('- cidade_origem');
    console.log('- uf_origem');
    console.log('- base-origem');
    console.log('- nf');
    console.log('- valor_da_nota');
    console.log('- volumes');
    console.log('- peso_real');
    console.log('- peso_cubado');
    console.log('- cidade_destino');
    console.log('- uf_destino');
    console.log('- base');
    console.log('- setor');
    console.log('- frete_peso');
    console.log('- seguro');
    console.log('- total_frete');
    
    await db.close();
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
  }
}

init(); 