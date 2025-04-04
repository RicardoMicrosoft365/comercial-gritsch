import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join } from 'path';
import fs from 'fs';

// Interface para os dados de transporte
export interface Transporte {
  id?: number;
  data: string;
  cidade_origem: string;
  uf_origem: string;
  base_origem: string;
  nf: string;
  valor_da_nota: number;
  volumes: number;
  peso_real: number;
  peso_cubado: number;
  cidade_destino: string;
  uf_destino: string;
  base: string;
  setor: string;
  frete_peso: number;
  seguro: number;
  total_frete: number;
}

// Ensure database directory exists
const DB_DIR = join(process.cwd(), 'database');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = join(DB_DIR, 'transportes.db');

// Initialize database
export async function initializeDatabase() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Create table if it doesn't exist
  await db.exec(`
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
  `);

  return db;
}

// Get database connection
export async function getDatabase() {
  return await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
}

// Insert data into the transportes table
export async function insertTransporte(data: Transporte) {
  const db = await getDatabase();
  
  const result = await db.run(
    `INSERT INTO transportes (
      data, cidade_origem, uf_origem, base_origem, nf, valor_da_nota, 
      volumes, peso_real, peso_cubado, cidade_destino, uf_destino, 
      base, setor, frete_peso, seguro, total_frete
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.data,
      data.cidade_origem,
      data.uf_origem,
      data.base_origem,
      data.nf,
      data.valor_da_nota,
      data.volumes,
      data.peso_real,
      data.peso_cubado,
      data.cidade_destino,
      data.uf_destino,
      data.base,
      data.setor,
      data.frete_peso,
      data.seguro,
      data.total_frete
    ]
  );
  
  return result.lastID;
}

// Get all transportes
export async function getAllTransportes(): Promise<Transporte[]> {
  const db = await getDatabase();
  return await db.all<Transporte[]>('SELECT * FROM transportes');
} 