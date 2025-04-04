// Script para inicializar o banco de dados
const { execSync } = require('child_process');

try {
  console.log('Inicializando o banco de dados...');
  execSync('npx ts-node src/scripts/initDb.ts', { stdio: 'inherit' });
  console.log('Banco de dados inicializado com sucesso!');
} catch (error) {
  console.error('Erro ao inicializar o banco de dados:', error);
  process.exit(1);
} 