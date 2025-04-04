const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Ensure database directory exists
const DB_DIR = path.join(process.cwd(), 'database');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'transportes.db');

// Create and initialize the database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao criar o banco de dados:', err.message);
    process.exit(1);
  }
  
  console.log('Banco de dados SQLite conectado.');
  
  // Create table
  db.run(`
    CREATE TABLE IF NOT EXISTS transportes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT,
      cidade_origem TEXT,
      uf_origem TEXT,
      base_origem TEXT,
      nf TEXT,
      valor_da_nota REAL,
      volumes INTEGER,
      peso_real REAL,
      peso_cubado REAL,
      cidade_destino TEXT,
      uf_destino TEXT,
      base TEXT,
      setor TEXT,
      frete_peso REAL,
      seguro REAL,
      total_frete REAL
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela:', err.message);
      process.exit(1);
    }
    
    console.log('Banco de dados inicializado com sucesso!');
    console.log('Tabela "transportes" criada com os seguintes campos:');
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
    
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Erro ao fechar banco de dados:', err.message);
      }
      console.log('Conexão com o banco de dados fechada.');
    });
  });
}); 