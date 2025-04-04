const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o banco de dados
const DB_PATH = path.join(process.cwd(), 'database', 'transportes.db');
console.log(`🗃️ Caminho do banco de dados: ${DB_PATH}`);

/**
 * Classe para gerenciar operações no banco de dados
 */
class Database {
  constructor() {
    this.db = null;
    console.log('🏗️ Instância do serviço de banco de dados criada');
  }

  /**
   * Conecta ao banco de dados
   */
  connect() {
    return new Promise((resolve, reject) => {
      console.log('🔄 Tentando conectar ao banco de dados...');
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('❌ Erro ao conectar ao banco de dados:', err.message);
          reject(err);
        } else {
          console.log('✅ Conexão com o banco de dados estabelecida');
          resolve(this.db);
        }
      });
    });
  }

  /**
   * Fecha a conexão com o banco de dados
   */
  close() {
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
  insertTransporte(data) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔄 Iniciando inserção de registro de transporte...');
        
        if (!this.db) {
          console.log('ℹ️ Banco de dados não está conectado, conectando...');
          await this.connect();
        }

        // Validar campos obrigatórios
        const camposObrigatorios = [
          'data',
          'cidade_origem',
          'uf_origem',
          'base_origem',
          'nf'
        ];

        // Verificar se todos os campos obrigatórios estão presentes
        const camposAusentes = camposObrigatorios.filter(campo => data[campo] === undefined);
        if (camposAusentes.length > 0) {
          const erro = `Campos obrigatórios não encontrados: ${camposAusentes.join(', ')}`;
          console.error(`❌ ${erro}`);
          throw new Error(erro);
        }

        console.log('✅ Validação de campos obrigatórios concluída');

        const sql = `
          INSERT INTO transportes (
            data, cidade_origem, uf_origem, base_origem, nf, valor_da_nota, 
            volumes, peso_real, peso_cubado, cidade_destino, uf_destino, 
            base, setor, frete_peso, seguro, total_frete
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        console.log('📝 SQL para inserção:', sql);
        console.log('📊 Valores para inserção:', [
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
        ]);

        this.db.run(sql, [
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
        ], function(err) {
          if (err) {
            console.error('❌ Erro ao inserir transporte:', err.message);
            if (err.message.includes('SQLITE_CONSTRAINT')) {
              console.error('⚠️ Possível erro de restrição no banco de dados. Verifique valores duplicados ou campos obrigatórios.');
            }
            reject(err);
          } else {
            console.log(`✅ Registro inserido com sucesso! ID: ${this.lastID}`);
            resolve(this.lastID);
          }
        });
      } catch (err) {
        console.error('❌ Erro durante o processo de inserção:', err.message);
        console.error(err.stack);
        reject(err);
      }
    });
  }

  /**
   * Obtém todos os registros de transporte
   * @returns {Promise<Array>} Lista de transportes
   */
  getAllTransportes() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔄 Buscando todos os registros de transporte...');
        
        if (!this.db) {
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
  searchTransportes(filters = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔄 Buscando transportes com filtros:', JSON.stringify(filters, null, 2));
        
        if (!this.db) {
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
        console.error('❌ Erro durante busca de transportes com filtros:', err.message);
        reject(err);
      }
    });
  }
  
  /**
   * Executa uma consulta para verificar a estrutura do banco de dados
   * Útil para depuração
   */
  verificarEstrutura() {
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
}

// Exporta uma instância do banco de dados
const database = new Database();
module.exports = database; 