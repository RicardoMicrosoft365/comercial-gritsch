import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, LinearProgress, Typography, Paper, Alert } from '@mui/material';
import UploadIcon from '@mui/icons-material/CloudUpload';
import CircularProgress from '@mui/material/CircularProgress';

interface FileUploadAnalyticsProps {
  onUploadSuccess?: (message: string) => void;
  onUploadError?: (error: string) => void;
}

const FileUploadAnalytics: React.FC<FileUploadAnalyticsProps> = ({
  onUploadSuccess,
  onUploadError
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [uploadResponse, setUploadResponse] = useState<any>(null);
  const [uploadId, setUploadId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para controlar o progresso do upload
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    message: string;
    percent?: number;
    completed?: boolean;
  } | null>(null);
  
  // Referência para o intervalo de verificação do progresso
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Função para limpar o intervalo quando necessário
  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Limpar o intervalo quando o componente é desmontado
  useEffect(() => {
    return () => {
      clearProgressInterval();
    };
  }, []);

  // Função para verificar o progresso do upload
  const checkUploadProgress = async () => {
    if (!uploadId) return;

    try {
      // Adicionar timestamp para evitar cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/upload/progress?id=${uploadId}&t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error('Falha ao obter progresso');
      }
      
      const progressData = await response.json();
      
      if (progressData) {
        // Ajustar para o formato de resposta da API
        setProgress({
          current: progressData.progress?.current || 0,
          total: progressData.progress?.total || 100,
          message: progressData.message || 'Processando...',
          percent: progressData.progress?.percent || Math.round((progressData.progress?.current / Math.max(1, progressData.progress?.total)) * 100),
          completed: progressData.completed || false
        });
        
        // Se o upload estiver completo, parar de verificar o progresso
        if (progressData.completed) {
          clearProgressInterval();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar progresso:', error);
      // Não interromper a verificação em caso de erro temporário
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setMessage('');
      setUploadStatus('idle');
      setUploadResponse(null);
      setProgress(null);
      clearProgressInterval();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Por favor, selecione um arquivo para enviar.');
      return;
    }

    try {
      setUploadStatus('loading');
      setMessage('Enviando arquivo...');
      
      // Gerar um ID único para este upload
      const newUploadId = `upload_${Date.now()}`;
      setUploadId(newUploadId);
      
      // Criar o FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('uploadId', newUploadId);

      // Iniciar verificação de progresso
      clearProgressInterval(); // Limpar qualquer intervalo existente
      setProgress({
        current: 0,
        total: 100,
        message: 'Iniciando upload...',
        percent: 0,
        completed: false
      });
      
      progressIntervalRef.current = setInterval(checkUploadProgress, 1000);

      // Enviar o arquivo
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      // Parar de verificar o progresso
      clearProgressInterval();

      if (response.ok) {
        setUploadStatus('success');
        setUploadResponse(result);
        setMessage(result.message || 'Upload realizado com sucesso!');
        setProgress({
          current: 100,
          total: 100,
          message: 'Concluído com sucesso!',
          percent: 100,
          completed: true
        });
      } else {
        setUploadStatus('error');
        setMessage(result.message || 'Erro ao processar o arquivo.');
        setProgress({
          current: 0,
          total: 100,
          message: 'Erro no processamento',
          percent: 0,
          completed: true
        });
        console.error('Erro no upload:', result);
      }
    } catch (error) {
      setUploadStatus('error');
      setMessage('Erro ao enviar o arquivo. Por favor, tente novamente.');
      setProgress({
        current: 0,
        total: 100,
        message: 'Erro no upload',
        percent: 0,
        completed: true
      });
      console.error('Erro durante upload:', error);
      clearProgressInterval();
    }
  };

  const renderProgressBar = () => {
    if (!progress) return null;

    // Calcular o progresso em porcentagem
    const progressPercent = progress.percent !== undefined 
      ? progress.percent 
      : Math.round((progress.current / Math.max(1, progress.total)) * 100);

    return (
      <Box sx={{ width: '100%', mb: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={progressPercent} 
              color={progress.completed ? 'success' : 'primary'} 
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {`${progressPercent}%`}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" align="center">
          {progress.message}
        </Typography>
        
        {progress.current > 0 && progress.total > 0 && (
          <Typography variant="body2" color="text.secondary" align="center">
            {`${progress.current} de ${progress.total} registros processados`}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Importar dados de transportes
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Faça upload de arquivos Excel (.xlsx) ou CSV contendo os dados de transportes.
      </Typography>

      <Box sx={{ mb: 2 }}>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadStatus === 'loading'}
          sx={{ mr: 2 }}
        >
          Selecionar arquivo
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!selectedFile || uploadStatus === 'loading'}
        >
          {uploadStatus === 'loading' ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              Enviando...
            </>
          ) : 'Enviar arquivo'}
        </Button>
      </Box>

      {selectedFile && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Arquivo selecionado: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
        </Typography>
      )}

      {renderProgressBar()}

      {message && (
        <Alert severity={uploadStatus === 'success' ? 'success' : uploadStatus === 'error' ? 'error' : 'info'} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}

      {uploadResponse && uploadResponse.success && uploadResponse.camposUtilizados && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Campos mapeados com sucesso:
          </Typography>
          <ul>
            {uploadResponse.camposUtilizados.map((campo: any, index: number) => (
              <li key={index}>
                <Typography variant="body2">
                  <strong>{campo.banco}</strong>: {campo.planilha}
                </Typography>
              </li>
            ))}
          </ul>
          
          {uploadResponse.erros && uploadResponse.erros.length > 0 && (
            <>
              <Typography variant="subtitle2" color="error" gutterBottom sx={{ mt: 2 }}>
                Erros encontrados:
              </Typography>
              <ul>
                {uploadResponse.erros.slice(0, 5).map((erro: any, index: number) => (
                  <li key={index}>
                    <Typography variant="body2" color="error">
                      Linha {erro.linha}: {erro.erro}
                    </Typography>
                  </li>
                ))}
                {uploadResponse.erros.length > 5 && (
                  <Typography variant="body2">
                    ...e mais {uploadResponse.erros.length - 5} erros.
                  </Typography>
                )}
              </ul>
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default FileUploadAnalytics; 