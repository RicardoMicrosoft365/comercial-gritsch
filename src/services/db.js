// Verificar se estamos no lado do servidor
let sqlite3;
let path;
let fs;

// Carregar módulos apenas se estivermos no lado do servidor (Node.js)
if (typeof window === 'undefined') {
  // Estamos no servidor
  sqlite3 = require('sqlite3').verbose();
  path = require('path');
  fs = require('fs');
} else {
  console.warn('Tentativa de carregar módulos do servidor no cliente. Este módulo deve ser usado apenas no servidor.');
}

// Caminho para o banco de dados
let DB_PATH;
let DB_DIR;

// Inicializar caminhos apenas no servidor
if (typeof window === 'undefined') {
  DB_PATH = path.join(process.cwd(), 'database', 'transportes.db');
  // Garantir que o diretório database existe
  DB_DIR = path.join(process.cwd(), 'database');
  if (!fs.existsSync(DB_DIR)) {
    console.log(`🔨 Criando diretório do banco de dados: ${DB_DIR}`);
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  console.log(`🗃️ Caminho do banco de dados: ${DB_PATH}`);
}

/**
 * Classe para gerenciar operações no banco de dados
 */
class Database {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    console.log('🏗️ Instância do serviço de banco de dados criada');
  }

  /**
   * Verifica se o ambiente é o servidor
   * @private
   */
  _verificarAmbiente() {
    if (typeof window !== 'undefined') {
      throw new Error('Operações de banco de dados devem ser executadas apenas no servidor.');
    }
  }

  /**
   * Inicializa o banco de dados e cria a tabela se necessário
   */
  async initialize() {
    this._verificarAmbiente();
    
    if (this.isInitialized) return;

    try {
      console.log('🔄 Iniciando banco de dados...');
      await this.connect();

      // Criar tabela se não existir
      await new Promise((resolve, reject) => {
        this.db.run(`
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
            console.error('❌ Erro ao criar tabela:', err.message);
            reject(err);
          } else {
            console.log('✅ Tabela verificada/criada com sucesso');
            this.isInitialized = true;
            resolve();
          }
        });
      });
    } catch (err) {
      console.error('❌ Erro ao inicializar banco de dados:', err.message);
      throw err;
    }
  }

  /**
   * Conecta ao banco de dados
   */
  connect() {
    this._verificarAmbiente();
    
    return new Promise((resolve, reject) => {
      console.log('🔄 Tentando conectar ao banco de dados...');

      try {
        this.db = new sqlite3.Database(DB_PATH, (err) => {
          if (err) {
            console.error('❌ Erro ao conectar ao banco de dados:', err.message);
            reject(err);
          } else {
            console.log('✅ Conexão com o banco de dados estabelecida');
            resolve(this.db);
          }
        });
      } catch (err) {
        console.error('❌ Exceção ao conectar ao banco de dados:', err.message);
        reject(err);
      }
    });
  }

  /**
   * Fecha a conexão com o banco de dados
   */
  close() {
    this._verificarAmbiente();
    
    return new Promise((resolve, reject) => {
      if (this.db) {
        console.log('🔄 Fechando conexão com o banco de dados...');
        this.db.close((err) => {
          if (err) {
            console.error('❌ Erro ao fechar banco de dados:', err.message);
            reject(err);
          } else {
            console.log('✅ Conexão com o banco de dados fechada com sucesso');
            this.db = null;
            resolve();
          }
        });
      } else {
        console.log('ℹ️ Não há conexão aberta para fechar');
        resolve();
      }
    });
  }

  /**
   * Insere um registro de transporte no banco de dados
   * @param {Object} data Dados do transporte
   * @returns {Promise<number>} ID do registro inserido
   */
  async insertTransporte(data) {
    return new Promise(async (resolve, reject) => {
      try {
        // Garantir que o banco de dados esteja conectado
        if (!this.db) {
          await this.connect();
        }

        // Validar campos obrigatórios básicos
        const camposObrigatorios = [
          'data',
          'cidade_origem',
          'uf_origem',
          'base_origem',
          'nf'
        ];

        // Verificação rápida de campos obrigatórios
        const camposAusentes = camposObrigatorios.filter(campo => !data[campo]);
        if (camposAusentes.length > 0) {
          throw new Error(`Campos obrigatórios não encontrados: ${camposAusentes.join(', ')}`);
        }

        const sql = `
          INSERT INTO transportes (
            data, cidade_origem, uf_origem, base_origem, nf, valor_da_nota, 
            volumes, peso_real, peso_cubado, cidade_destino, uf_destino, 
            base, setor, frete_peso, seguro, total_frete
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Garantir valores padrão para campos não obrigatórios
        const valores = [
          data.data || '',
          data.cidade_origem || '',
          data.uf_origem || '',
          data.base_origem || '', 
          data.nf || '',
          data.valor_da_nota || 0,
          data.volumes || 0,
          data.peso_real || 0,
          data.peso_cubado || 0,
          data.cidade_destino || '',
          data.uf_destino || '',
          data.base || '',
          data.setor || '',
          data.frete_peso || 0,
          data.seguro || 0,
          data.total_frete || 0
        ];

        this.db.run(sql, valores, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Obtém todos os registros de transporte
   * @returns {Promise<Array>} Lista de transportes
   */
  async getAllTransportes() {
    this._verificarAmbiente();
    
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔄 Buscando todos os registros de transporte...');
        
        // Garantir que o banco de dados esteja inicializado
        if (!this.isInitialized) {
          console.log('ℹ️ Banco de dados não está inicializado, inicializando...');
          await this.initialize();
        } else if (!this.db) {
          console.log('ℹ️ Banco de dados não está conectado, conectando...');
          await this.connect();
        }

        this.db.all('SELECT * FROM transportes', [], (err, rows) => {
          if (err) {
            console.error('❌ Erro ao buscar transportes:', err.message);
            reject(err);
          } else {
            console.log(`✅ ${rows.length} registros encontrados`);
            resolve(rows);
          }
        });
      } catch (err) {
        console.error('❌ Erro durante busca de transportes:', err.message);
        reject(err);
      }
    });
  }

  /**
   * Busca transportes por filtros
   * @param {Object} filters Filtros para busca
   * @returns {Promise<Array>} Lista de transportes filtrados
   */
  async searchTransportes(filters = {}) {
    this._verificarAmbiente();
    
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔄 Buscando transportes com filtros:', JSON.stringify(filters, null, 2));
        
        // Garantir que o banco de dados esteja inicializado
        if (!this.isInitialized) {
          console.log('ℹ️ Banco de dados não está inicializado, inicializando...');
          await this.initialize();
        } else if (!this.db) {
          console.log('ℹ️ Banco de dados não está conectado, conectando...');
          await this.connect();
        }

        let whereClause = '';
        const params = [];

        // Construir cláusula WHERE baseada nos filtros
        const conditions = [];
        
        if (filters.data) {
          conditions.push('data = ?');
          params.push(filters.data);
        }
        
        if (filters.cidade_origem) {
          conditions.push('cidade_origem LIKE ?');
          params.push(`%${filters.cidade_origem}%`);
        }
        
        if (filters.uf_origem) {
          conditions.push('uf_origem = ?');
          params.push(filters.uf_origem);
        }
        
        if (filters.cidade_destino) {
          conditions.push('cidade_destino LIKE ?');
          params.push(`%${filters.cidade_destino}%`);
        }
        
        if (filters.uf_destino) {
          conditions.push('uf_destino = ?');
          params.push(filters.uf_destino);
        }
        
        if (filters.nf) {
          conditions.push('nf LIKE ?');
          params.push(`%${filters.nf}%`);
        }

        // Adicionar cláusula WHERE se houver condições
        if (conditions.length > 0) {
          whereClause = ' WHERE ' + conditions.join(' AND ');
        }

        const sql = 'SELECT * FROM transportes' + whereClause;
        console.log('📝 SQL gerado para busca:', sql);
        console.log('📊 Parâmetros:', params);

        this.db.all(sql, params, (err, rows) => {
          if (err) {
            console.error('❌ Erro ao buscar transportes:', err.message);
            reject(err);
          } else {
            console.log(`✅ ${rows.length} registros encontrados com os filtros aplicados`);
            resolve(rows);
          }
        });
      } catch (err) {
        console.error('❌ Erro durante busca filtrada de transportes:', err.message);
        reject(err);
      }
    });
  }

  /**
   * Verifica a estrutura do banco de dados
   * @returns {Promise<Object>} Informações sobre o banco de dados
   */
  verificarEstrutura() {
    this._verificarAmbiente();
    
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔍 Verificando estrutura do banco de dados...');
        
        if (!this.db) {
          await this.connect();
        }
        
        // Verifica se a tabela transportes existe
        this.db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='transportes'", [], (err, row) => {
          if (err) {
            console.error('❌ Erro ao verificar tabela:', err.message);
            reject(err);
            return;
          }
          
          if (!row) {
            console.error('❌ Tabela transportes não existe!');
            resolve({ tabelaExiste: false });
            return;
          }
          
          console.log('✅ Tabela transportes existe');
          
          // Verifica a estrutura da tabela
          this.db.all("PRAGMA table_info(transportes)", [], (err, columns) => {
            if (err) {
              console.error('❌ Erro ao verificar colunas:', err.message);
              reject(err);
              return;
            }
            
            console.log('📊 Estrutura da tabela transportes:');
            columns.forEach(col => {
              console.log(`- ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
            });
            
            resolve({
              tabelaExiste: true,
              colunas: columns
            });
          });
        });
      } catch (err) {
        console.error('❌ Erro ao verificar estrutura:', err.message);
        reject(err);
      }
    });
  }

  /**
   * Insere múltiplos registros de transporte em um único lote usando transações
   * @param {Array<Object>} registros Array de registros a serem inseridos
   * @returns {Promise<number>} Número de registros inseridos com sucesso
   */
  async insertTransportesEmLote(registros) {
    return new Promise(async (resolve, reject) => {
      try {
        // Garantir que o banco de dados esteja conectado
        if (!this.db) {
          await this.connect();
        }

        // Iniciar transação
        await new Promise((resolve, reject) => {
          this.db.run('BEGIN TRANSACTION', (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        const sql = `
          INSERT INTO transportes (
            data, cidade_origem, uf_origem, base_origem, nf, valor_da_nota, 
            volumes, peso_real, peso_cubado, cidade_destino, uf_destino, 
            base, setor, frete_peso, seguro, total_frete
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Preparar statement
        const stmt = this.db.prepare(sql);
        let inseridos = 0;

        // Inserir cada registro
        for (const data of registros) {
          try {
            // Verificação básica de campos obrigatórios
            if (!data.data || !data.cidade_origem || !data.uf_origem || !data.base_origem || !data.nf) {
              continue; // Pular registro inválido
            }
            
            // Valores para inserção
            const valores = [
              data.data || '',
              data.cidade_origem || '',
              data.uf_origem || '',
              data.base_origem || '', 
              data.nf || '',
              data.valor_da_nota || 0,
              data.volumes || 0,
              data.peso_real || 0,
              data.peso_cubado || 0,
              data.cidade_destino || '',
              data.uf_destino || '',
              data.base || '',
              data.setor || '',
              data.frete_peso || 0,
              data.seguro || 0,
              data.total_frete || 0
            ];

            // Executar statement preparado
            await new Promise((resolve, reject) => {
              stmt.run(valores, function(err) {
                if (err) reject(err);
                else {
                  inseridos++;
                  resolve();
                }
              });
            });
          } catch (err) {
            // Continuar mesmo com erro em um registro específico
            console.error(`Erro ao inserir registro no lote: ${err.message}`);
          }
        }

        // Finalizar statement
        await new Promise((resolve, reject) => {
          stmt.finalize((err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Commit da transação
        await new Promise((resolve, reject) => {
          this.db.run('COMMIT', (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        resolve(inseridos);
      } catch (err) {
        // Em caso de erro, fazer rollback
        try {
          await new Promise((resolve) => {
            this.db.run('ROLLBACK', () => resolve());
          });
        } catch (rollbackErr) {
          console.error('Erro ao fazer rollback:', rollbackErr);
        }
        
        reject(err);
      }
    });
  }
}

// Instância única do banco de dados
const database = new Database();

// Inicializar o banco de dados logo quando o módulo é carregado
(async () => {
  try {
    await database.initialize();
  } catch (err) {
    console.error('❌ Erro ao inicializar banco de dados:', err);
  }
})();

module.exports = database; 