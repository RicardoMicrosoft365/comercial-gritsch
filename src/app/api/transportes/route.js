import { NextResponse } from 'next/server';
import database from '../../../services/db';

export async function GET() {
  try {
    // Conectar ao banco de dados
    await database.connect();
    
    // Buscar todos os registros
    const transportes = await database.getAllTransportes();
    
    // Fechar a conexão com o banco de dados
    await database.close();
    
    return NextResponse.json({
      success: true,
      count: transportes.length,
      data: transportes
    });
  } catch (error) {
    console.error('Erro ao buscar transportes:', error);
    
    // Garantir que a conexão com o banco seja fechada em caso de erro
    try {
      await database.close();
    } catch (e) {
      console.error('Erro ao fechar conexão:', e);
    }
    
    return NextResponse.json(
      { success: false, message: `Erro ao buscar transportes: ${error.message}` },
      { status: 500 }
    );
  }
} 