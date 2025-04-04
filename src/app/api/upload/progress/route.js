import { NextResponse } from 'next/server';

// Armazenamento temporário para o progresso de upload
// Em produção, você pode querer usar um armazenamento mais robusto como Redis
const progressStorage = new Map();

export function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uploadId = searchParams.get('id');
    
    if (!uploadId) {
      return NextResponse.json(
        { error: 'ID de upload não fornecido' },
        { status: 400 }
      );
    }
    
    const progressData = progressStorage.get(uploadId) || {
      progress: { current: 0, total: 100 },
      message: "Aguardando início do processamento",
      completed: false
    };
    
    // Garantir que os dados sejam enviados imediatamente
    return new NextResponse(JSON.stringify(progressData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar progresso:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar progresso do upload' },
      { status: 500 }
    );
  }
}

// Função auxiliar para atualizar o progresso
export function updateProgress(uploadId, current, total, message = null, completed = false) {
  if (!uploadId) return;
  
  // Garantir que os valores são números válidos
  current = parseInt(current) || 0;
  total = parseInt(total) || 100;
  
  // Calcular o percentual completo (de 0 a 100)
  const percentComplete = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  
  const progressData = {
    progress: { 
      current, 
      total,
      percent: percentComplete 
    },
    message: message || `Processando registro ${current} de ${total} (${percentComplete}%)`,
    completed
  };
  
  console.log(`Progresso atualizado [${uploadId}]: ${current}/${total} - ${percentComplete}% - ${message}`);
  
  progressStorage.set(uploadId, progressData);
  
  // Limpar dados antigos (após 10 minutos)
  if (completed) {
    setTimeout(() => {
      progressStorage.delete(uploadId);
    }, 10 * 60 * 1000);
  }
  
  return progressData;
}

// Exporta a função e o armazenamento para uso em outras partes da aplicação
export { progressStorage }; 