// Script para testar a performance da inserção em massa
const database = require('./src/services/db');

async function perfTest() {
  console.log('=== INICIANDO TESTE DE PERFORMANCE ===');
  
  try {
    // Conectar ao banco de dados
    await database.connect();
    
    // Quantidade de registros para teste
    const NUM_REGISTROS = 1000;
    console.log(`Preparando para inserir ${NUM_REGISTROS} registros...`);
    
    // Criar registros de teste
    const registros = [];
    for (let i = 0; i < NUM_REGISTROS; i++) {
      registros.push({
        data: '2023-01-01',
        cidade_origem: `ORIGEM_${i % 10}`,
        uf_origem: `U${i % 27}`,
        base_origem: `BASE_${i % 5}`,
        nf: `NF_PERF_${Date.now()}_${i}`,
        valor_da_nota: 100 + (i % 100),
        volumes: i % 20,
        peso_real: 50 + (i % 100),
        peso_cubado: 60 + (i % 50),
        cidade_destino: `DESTINO_${i % 15}`,
        uf_destino: `D${i % 27}`,
        base: `BASE_DEST_${i % 8}`,
        setor: `SETOR_${i % 6}`,
        frete_peso: 20 + (i % 30),
        seguro: 5 + (i % 15),
        total_frete: 30 + (i % 50)
      });
    }
    
    // TESTE 1: Inserção individual (método original)
    console.log('\n=== TESTE 1: INSERÇÃO INDIVIDUAL ===');
    console.log(`Inserindo ${NUM_REGISTROS} registros individualmente...`);
    
    const startTime1 = process.hrtime();
    
    // Inserir registros individualmente (apenas uma amostra menor para comparação)
    const AMOSTRA_INDIVIDUAL = 100; // Limitar a 100 registros para não demorar muito
    let inseridosIndividual = 0;
    
    for (let i = 0; i < AMOSTRA_INDIVIDUAL; i++) {
      try {
        await database.insertTransporte(registros[i]);
        inseridosIndividual++;
        
        // Mostrar progresso a cada 10 registros
        if (inseridosIndividual % 10 === 0) {
          console.log(`${inseridosIndividual} registros inseridos individualmente...`);
        }
      } catch (err) {
        console.error(`Erro ao inserir registro ${inseridosIndividual}:`, err.message);
      }
    }
    
    // Calcular tempo e extrapolação
    const endTime1 = process.hrtime(startTime1);
    const segundos1 = endTime1[0] + (endTime1[1] / 1e9);
    const taxaIndividual = inseridosIndividual / segundos1;
    const tempoEstimadoTotal = NUM_REGISTROS / taxaIndividual;
    
    console.log(`\nResultado inserção individual (amostra de ${AMOSTRA_INDIVIDUAL}):`);
    console.log(`Tempo para ${inseridosIndividual} registros: ${segundos1.toFixed(2)} segundos`);
    console.log(`Taxa: ${taxaIndividual.toFixed(2)} registros/segundo`);
    console.log(`Tempo estimado para ${NUM_REGISTROS} registros: ${tempoEstimadoTotal.toFixed(2)} segundos`);
    
    // TESTE 2: Inserção em lote (novo método)
    console.log('\n=== TESTE 2: INSERÇÃO EM LOTE ===');
    console.log(`Inserindo ${NUM_REGISTROS} registros em lote...`);
    
    const startTime2 = process.hrtime();
    
    // Inserir todos os registros em lote
    const inseridosLote = await database.insertTransportesEmLote(registros);
    
    // Calcular tempo
    const endTime2 = process.hrtime(startTime2);
    const segundos2 = endTime2[0] + (endTime2[1] / 1e9);
    
    console.log(`\nResultado inserção em lote:`);
    console.log(`Total de registros inseridos: ${inseridosLote} / ${NUM_REGISTROS}`);
    console.log(`Tempo total: ${segundos2.toFixed(2)} segundos`);
    console.log(`Taxa: ${(inseridosLote / segundos2).toFixed(2)} registros/segundo`);
    
    // Comparação
    console.log('\n=== COMPARAÇÃO DE PERFORMANCE ===');
    const ganhoPerformance = (tempoEstimadoTotal / segundos2).toFixed(2);
    console.log(`Ganho de performance: ~${ganhoPerformance}x mais rápido usando inserção em lote`);
    
  } catch (error) {
    console.error('❌ ERRO DURANTE TESTE DE PERFORMANCE:', error);
  } finally {
    // Fechar a conexão
    await database.close();
  }
}

// Executar o teste de performance
perfTest(); 