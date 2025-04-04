import React, { useState, useEffect } from 'react';
import { FaChartBar, FaChartLine, FaChartPie, FaTable, FaFilter, FaFileInvoice, FaBalanceScale, FaBoxes, FaMoneyBillWave, FaTruck, FaCalendarAlt, FaCalendarCheck } from 'react-icons/fa';
import HorizontalBarChart from './HorizontalBarChart';
import HeatMap from './HeatMap';

interface DadosFreteRow {
  Data: string | Date;
  'Cidade Origem': string;
  'UF Origem': string;
  'Base Origem': string;
  NF: string | number;
  'Valor da Nota': number;
  Volumes: number;
  Peso: number;
  'Cidade Destino': string;
  'UF Destino': string;
  Base: string;
  Setor: string;
  'Frete Peso': number;
  Seguro: number;
  'Total Frete': number;
  [key: string]: any;
}

interface AnalyticsPanelProps {
  data: DadosFreteRow[];
  filteredData: DadosFreteRow[];
  onFilterChange: (filteredData: DadosFreteRow[]) => void;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ 
  data, 
  filteredData,
  onFilterChange 
}) => {
  // Novo estado para controlar a exibição de nomes de cidades no mapa
  const [showCityNames, setShowCityNames] = useState<boolean>(false);

  // Função para formatar data - versão otimizada
  const formatDate = (dateString: string | Date): string => {
    if (!dateString) return '';
    
    try {
      const date = dateString instanceof Date ? dateString : new Date(String(dateString));
      if (isNaN(date.getTime())) return String(dateString);
      
      // Formato brasileiro: DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Erro ao formatar data:', dateString, error);
      return String(dateString);
    }
  };

  // Verificar se há filtro aplicado
  const hasFilter = data.length !== filteredData.length;

  // Novas funções para filtrar quando clicar nas barras do gráfico
  const [activeFilter, setActiveFilter] = useState<{type: string, value: string} | null>(null);

  // Reaplicar o filtro ativo quando os dados mudam (devido a um filtro de data)
  useEffect(() => {
    // Se não tiver filtro ativo, não precisa fazer nada
    if (!activeFilter) return;
    
    // Verificar se estamos lidando com filtro de data
    // hasFilter já verifica se data.length !== filteredData.length
    const temFiltroData = hasFilter && !activeFilter;
    
    // Verificar se o filtro ativo ainda está aplicado sobre os dados filtrados
    const estamosFiltrando = (tipo: string, valor: string): boolean => {
      switch (tipo) {
        case 'Filial':
          return filteredData.every(row => row.Base === valor);
        case 'Roteiro':
          return filteredData.every(row => row.Setor === valor);
        case 'UF':
          return filteredData.every(row => row['UF Destino'] === valor);
        case 'Cidade':
          return filteredData.every(row => row['Cidade Destino'] === valor);
        case 'Base Origem':
          return filteredData.every(row => row['Base Origem'] === valor);
        case 'UF Origem':
          return filteredData.every(row => row['UF Origem'] === valor);
        case 'Cidade Origem':
          return filteredData.every(row => row['Cidade Origem'] === valor);
        default:
          return false;
      }
    };
    
    // Se já estamos filtrando pelos mesmos critérios, não precisamos reaplicar
    if (estamosFiltrando(activeFilter.type, activeFilter.value)) return;
    
    console.log(`Reaplicando filtro: ${activeFilter.type} = ${activeFilter.value}`);
    
    // Se chegamos aqui, precisamos reaplicar o filtro sobre os dados atuais
    let novoFiltro: DadosFreteRow[] = [];
    
    // Aplicar o filtro com base no tipo
    switch (activeFilter.type) {
      case 'Filial':
        novoFiltro = filteredData.filter(row => row.Base === activeFilter.value);
        break;
      case 'Roteiro':
        novoFiltro = filteredData.filter(row => row.Setor === activeFilter.value);
        break;
      case 'UF':
        novoFiltro = filteredData.filter(row => row['UF Destino'] === activeFilter.value);
        break;
      case 'Cidade':
        novoFiltro = filteredData.filter(row => row['Cidade Destino'] === activeFilter.value);
        break;
      case 'Base Origem':
        novoFiltro = filteredData.filter(row => row['Base Origem'] === activeFilter.value);
        break;
      case 'UF Origem':
        novoFiltro = filteredData.filter(row => row['UF Origem'] === activeFilter.value);
        break;
      case 'Cidade Origem':
        novoFiltro = filteredData.filter(row => row['Cidade Origem'] === activeFilter.value);
        break;
    }
    
    // Se o filtro resultou em dados, aplicar
    // Se não resultou em dados, registrar um aviso mas não alteramos o estado atual
    if (novoFiltro.length > 0) {
      console.log(`Filtro reaplicado: ${activeFilter.type} = ${activeFilter.value}, resultando em ${novoFiltro.length} registros`);
      onFilterChange(novoFiltro);
    } else {
      console.log(`Aviso: Filtro ${activeFilter.type} = ${activeFilter.value} não retornou resultados quando reaplicado.`);
    }
  }, [data, filteredData, activeFilter, onFilterChange, hasFilter]);

  // Função para filtrar por filial quando clicado no gráfico de filiais
  const handleFilialClick = (item: {name: string, value: number}) => {
    // Se já estamos filtrando por esta filial, remover o filtro
    if (activeFilter && activeFilter.type === 'Filial' && activeFilter.value === item.name) {
      clearFilters();
      return;
    }
    
    // Atualizar o estado do filtro ativo
    setActiveFilter({ type: 'Filial', value: item.name });
    
    // Importante: Para filtros hierárquicos, sempre usamos filteredData como base
    // Isso garante que filtros adicionais se acumulem em vez de substituir outros
    const filteredByFilial = filteredData.filter(row => row.Base === item.name);
    
    // Atualizar os dados filtrados se houver resultados
    if (filteredByFilial.length > 0) {
      onFilterChange(filteredByFilial);
      console.log(`Filtro aplicado: Filial = ${item.name}, resultando em ${filteredByFilial.length} registros`);
    } else {
      console.log(`Aviso: Filtro Filial = ${item.name} não retornou resultados.`);
    }
  };

  // Função para filtrar por roteiro/setor quando clicado no gráfico de roteiros
  const handleRoteiroClick = (item: {name: string, value: number}) => {
    // Se já estamos filtrando por este roteiro, remover o filtro
    if (activeFilter && activeFilter.type === 'Roteiro' && activeFilter.value === item.name) {
      clearFilters();
      return;
    }
    
    // Atualizar o estado do filtro ativo
    setActiveFilter({ type: 'Roteiro', value: item.name });
    
    // Usar filteredData para manter a hierarquia de filtros
    const filteredByRoteiro = filteredData.filter(row => row.Setor === item.name);
    
    // Atualizar os dados filtrados se houver resultados
    if (filteredByRoteiro.length > 0) {
      onFilterChange(filteredByRoteiro);
      console.log(`Filtro aplicado: Roteiro = ${item.name}, resultando em ${filteredByRoteiro.length} registros`);
    } else {
      console.log(`Aviso: Filtro Roteiro = ${item.name} não retornou resultados.`);
    }
  };

  // Função para filtrar por UF quando clicado no gráfico de UFs
  const handleUFClick = (item: {name: string, value: number}) => {
    // Se já estamos filtrando por esta UF, remover o filtro
    if (activeFilter && activeFilter.type === 'UF' && activeFilter.value === item.name) {
      clearFilters();
      return;
    }
    
    // Atualizar o estado do filtro ativo
    setActiveFilter({ type: 'UF', value: item.name });
    
    // Usar filteredData para manter a hierarquia de filtros
    const filteredByUF = filteredData.filter(row => row['UF Destino'] === item.name);
    
    // Atualizar os dados filtrados se houver resultados
    if (filteredByUF.length > 0) {
      onFilterChange(filteredByUF);
      console.log(`Filtro aplicado: UF = ${item.name}, resultando em ${filteredByUF.length} registros`);
    } else {
      console.log(`Aviso: Filtro UF = ${item.name} não retornou resultados.`);
    }
  };

  // Função para filtrar por cidade quando clicado no gráfico de cidades
  const handleCidadeClick = (item: {name: string, value: number}) => {
    // Se já estamos filtrando por esta cidade, remover o filtro
    if (activeFilter && activeFilter.type === 'Cidade' && activeFilter.value === item.name) {
      clearFilters();
      return;
    }
    
    // Atualizar o estado do filtro ativo
    setActiveFilter({ type: 'Cidade', value: item.name });
    
    // Usar filteredData para manter a hierarquia de filtros
    const filteredByCidade = filteredData.filter(row => row['Cidade Destino'] === item.name);
    
    // Atualizar os dados filtrados se houver resultados
    if (filteredByCidade.length > 0) {
      onFilterChange(filteredByCidade);
      console.log(`Filtro aplicado: Cidade = ${item.name}, resultando em ${filteredByCidade.length} registros`);
    } else {
      console.log(`Aviso: Filtro Cidade = ${item.name} não retornou resultados.`);
    }
  };

  // Função específica para lidar com cliques no mapa
  const handleMapMarkerClick = (cidade: string) => {
    // Contar a quantidade de NFs para esta cidade
    const cidadeData = filteredData.filter(row => row['Cidade Destino'] === cidade);
    const countNFs = cidadeData.length;
    
    // Se não houver correspondência exata, tente uma busca menos rigorosa
    let match = cidade;
    if (countNFs === 0) {
      // Normalizar o nome da cidade (remover acentos, minúsculas)
      const normalizarTexto = (texto: string): string => {
        return texto
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
      };
      
      const cidadeNormalizada = normalizarTexto(cidade);
      
      // Procurar a primeira cidade que contenha o nome ou parte dele
      const possibleMatch = filteredData.find(row => {
        const rowCidade = row['Cidade Destino'] || '';
        return normalizarTexto(rowCidade).includes(cidadeNormalizada) || 
               cidadeNormalizada.includes(normalizarTexto(rowCidade));
      });
      
      if (possibleMatch) {
        match = possibleMatch['Cidade Destino'];
        console.log(`Nome exato não encontrado, usando correspondência aproximada: ${match}`);
      }
    }
    
    // Chamar o handler de cidade com o nome encontrado
    handleCidadeClick({ name: match, value: countNFs });
  };

  // Função para filtrar por base de origem quando clicado no gráfico de base origem
  const handleBaseOrigemClick = (item: {name: string, value: number}) => {
    // Se já estamos filtrando por esta base de origem, remover o filtro
    if (activeFilter && activeFilter.type === 'Base Origem' && activeFilter.value === item.name) {
      clearFilters();
      return;
    }
    
    // Atualizar o estado do filtro ativo
    setActiveFilter({ type: 'Base Origem', value: item.name });
    
    // Usar filteredData para manter a hierarquia de filtros
    const filteredByBaseOrigem = filteredData.filter(row => row['Base Origem'] === item.name);
    
    // Atualizar os dados filtrados se houver resultados
    if (filteredByBaseOrigem.length > 0) {
      onFilterChange(filteredByBaseOrigem);
      console.log(`Filtro aplicado: Base Origem = ${item.name}, resultando em ${filteredByBaseOrigem.length} registros`);
    } else {
      console.log(`Aviso: Filtro Base Origem = ${item.name} não retornou resultados.`);
    }
  };
  
  // Função para filtrar por UF de origem quando clicado no gráfico de UF origem
  const handleUFOrigemClick = (item: {name: string, value: number}) => {
    // Se já estamos filtrando por esta UF de origem, remover o filtro
    if (activeFilter && activeFilter.type === 'UF Origem' && activeFilter.value === item.name) {
      clearFilters();
      return;
    }
    
    // Atualizar o estado do filtro ativo
    setActiveFilter({ type: 'UF Origem', value: item.name });
    
    // Usar filteredData para manter a hierarquia de filtros
    const filteredByUFOrigem = filteredData.filter(row => row['UF Origem'] === item.name);
    
    // Atualizar os dados filtrados se houver resultados
    if (filteredByUFOrigem.length > 0) {
      onFilterChange(filteredByUFOrigem);
      console.log(`Filtro aplicado: UF Origem = ${item.name}, resultando em ${filteredByUFOrigem.length} registros`);
    } else {
      console.log(`Aviso: Filtro UF Origem = ${item.name} não retornou resultados.`);
    }
  };
  
  // Função para filtrar por cidade de origem quando clicado no gráfico de cidade origem
  const handleCidadeOrigemClick = (item: {name: string, value: number}) => {
    // Se já estamos filtrando por esta cidade de origem, remover o filtro
    if (activeFilter && activeFilter.type === 'Cidade Origem' && activeFilter.value === item.name) {
      clearFilters();
      return;
    }
    
    // Atualizar o estado do filtro ativo
    setActiveFilter({ type: 'Cidade Origem', value: item.name });
    
    // Usar filteredData para manter a hierarquia de filtros
    const filteredByCidadeOrigem = filteredData.filter(row => row['Cidade Origem'] === item.name);
    
    // Atualizar os dados filtrados se houver resultados
    if (filteredByCidadeOrigem.length > 0) {
      onFilterChange(filteredByCidadeOrigem);
      console.log(`Filtro aplicado: Cidade Origem = ${item.name}, resultando em ${filteredByCidadeOrigem.length} registros`);
    } else {
      console.log(`Aviso: Filtro Cidade Origem = ${item.name} não retornou resultados.`);
    }
  };

  // Função para limpar filtros de gráfico (mantendo filtro de data, se houver)
  const clearFilters = () => {
    // Remover o filtro ativo
    setActiveFilter(null);
    
    // Se tiver filtro de data aplicado, mantenha apenas ele
    if (hasFilter && filterInfo) {
      // Verificar se estamos apenas com o filtro de data, sem filtros de colunas
      if (!activeFilter) {
        // Se não temos filtro de coluna ativo, não precisamos fazer nada
        return;
      }
      
      // Precisamos recriar o filtro por data aqui
      const startDate = filterInfo.dataInicialObj;
      const endDate = filterInfo.dataFinalObj;
      
      if (startDate && endDate) {
        console.log(`Removendo filtro atual e mantendo apenas o filtro de data: ${formatDate(startDate)} - ${formatDate(endDate)}`);
        
        // Usar um método de filtragem mais eficiente com cache
        const dateCache = new Map<string, boolean>();
        
        const dateFilteredData = data.filter(row => {
          // Usar caching para evitar recálculos repetidos
          const rowDateStr = String(row.Data);
          
          if (!dateCache.has(rowDateStr)) {
            try {
              const rowDate = row.Data instanceof Date ? row.Data : new Date(rowDateStr);
              if (isNaN(rowDate.getTime())) {
                dateCache.set(rowDateStr, false);
              } else {
                // Normalizar para comparação apenas por data, ignorando horas
                rowDate.setHours(0, 0, 0, 0);
                const isInRange = rowDate >= startDate && rowDate <= endDate;
                dateCache.set(rowDateStr, isInRange);
              }
            } catch (error) {
              console.error('Erro ao processar data para filtragem:', rowDateStr, error);
              dateCache.set(rowDateStr, false);
            }
          }
          
          return dateCache.get(rowDateStr) || false;
        });
        
        onFilterChange(dateFilteredData);
        return;
      }
    }
    
    // Se não tiver filtro de data, volte aos dados originais
    console.log('Removendo todos os filtros e voltando aos dados originais');
    onFilterChange(data);
  };

  // Obter informações sobre o período do filtro
  const getFilterInfo = () => {
    if (!filteredData.length) return null;
    
    try {
      const datas = filteredData
        .map(row => row.Data instanceof Date ? row.Data : new Date(String(row.Data)))
        .filter(date => !isNaN(date.getTime()));
      
      if (!datas.length) return null;
      
      const dataInicial = new Date(Math.min(...datas.map(d => d.getTime())));
      const dataFinal = new Date(Math.max(...datas.map(d => d.getTime())));
      
      return {
        dataInicial: formatDate(dataInicial),
        dataFinal: formatDate(dataFinal),
        dataInicialObj: dataInicial,
        dataFinalObj: dataFinal
      };
    } catch (error) {
      console.error('Erro ao processar datas:', error);
      return null;
    }
  };

  const filterInfo = getFilterInfo();

  // Função para verificar se uma data é dia útil (segunda a sexta)
  const isDiaUtil = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5; // 0 = domingo, 6 = sábado
  };

  // Função para calcular o número de dias úteis entre duas datas
  const calcularDiasUteis = (dataInicial: Date, dataFinal: Date): number => {
    let diasUteis = 0;
    const currentDate = new Date(dataInicial);
    currentDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dataFinal);
    endDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      if (isDiaUtil(currentDate)) {
        diasUteis++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return diasUteis > 0 ? diasUteis : 1; // Evitar divisão por zero
  };

  // Função para obter dias únicos com envios - versão otimizada
  const calcularDiasComEnvio = (dados: DadosFreteRow[]): number => {
    if (!dados.length) return 1; // Evitar divisão por zero
    
    // Criar um conjunto de datas únicas a partir dos dados
    const datasUnicas = new Set<string>();
    
    // Cache para evitar processar a mesma data várias vezes
    const dateCache = new Map<string, string>();
    
    dados.forEach(row => {
      // Usar cache para evitar processamento redundante
      const rowDateStr = String(row.Data);
      
      if (!dateCache.has(rowDateStr)) {
        try {
          const dataObj = row.Data instanceof Date ? row.Data : new Date(rowDateStr);
          if (!isNaN(dataObj.getTime())) {
            // Formatar como YYYY-MM-DD para comparação
            const dataFormatada = dataObj.toISOString().split('T')[0];
            dateCache.set(rowDateStr, dataFormatada);
          } else {
            dateCache.set(rowDateStr, '');
          }
        } catch (error) {
          console.error('Erro ao processar data para cálculo de dias com envio:', rowDateStr, error);
          dateCache.set(rowDateStr, '');
        }
      }
      
      const dataFormatada = dateCache.get(rowDateStr);
      if (dataFormatada) {
        datasUnicas.add(dataFormatada);
      }
    });
    
    return datasUnicas.size > 0 ? datasUnicas.size : 1;
  };

  // Funções para processar dados para os gráficos
  const processarDadosPorFilial = () => {
    if (!filteredData.length) return [];
    
    // Agrupar os dados por Base
    const contadorPorBase = filteredData.reduce((acc, row) => {
      const base = row.Base || 'Não informado';
      acc[base] = (acc[base] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Converter para o formato do gráfico
    return Object.entries(contadorPorBase).map(([name, value]) => ({ name, value }));
  };
  
  const processarDadosPorRoteiro = () => {
    if (!filteredData.length) return [];
    
    // Agrupar os dados por Setor
    const contadorPorSetor = filteredData.reduce((acc, row) => {
      const setor = row.Setor || 'Não informado';
      acc[setor] = (acc[setor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Converter para o formato do gráfico
    return Object.entries(contadorPorSetor).map(([name, value]) => ({ name, value }));
  };
  
  const processarDadosPorUF = () => {
    if (!filteredData.length) return [];
    
    // Agrupar os dados por UF Destino
    const contadorPorUF = filteredData.reduce((acc, row) => {
      const uf = row['UF Destino'] || 'Não informado';
      acc[uf] = (acc[uf] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Converter para o formato do gráfico
    return Object.entries(contadorPorUF).map(([name, value]) => ({ name, value }));
  };
  
  const processarDadosPorCidade = () => {
    if (!filteredData.length) return [];
    
    // Agrupar os dados por Cidade Destino
    const contadorPorCidade = filteredData.reduce((acc, row) => {
      const cidade = row['Cidade Destino'] || 'Não informado';
      acc[cidade] = (acc[cidade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Converter para o formato do gráfico
    return Object.entries(contadorPorCidade).map(([name, value]) => ({ name, value }));
  };
  
  // Novas funções para processar dados de origem
  const processarDadosPorBaseOrigem = () => {
    if (!filteredData.length) return [];
    
    // Agrupar os dados por Base Origem
    const contadorPorBaseOrigem = filteredData.reduce((acc, row) => {
      const baseOrigem = row['Base Origem'] || 'Não informado';
      acc[baseOrigem] = (acc[baseOrigem] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Converter para o formato do gráfico
    return Object.entries(contadorPorBaseOrigem).map(([name, value]) => ({ name, value }));
  };
  
  const processarDadosPorUFOrigem = () => {
    if (!filteredData.length) return [];
    
    // Agrupar os dados por UF Origem
    const contadorPorUFOrigem = filteredData.reduce((acc, row) => {
      const ufOrigem = row['UF Origem'] || 'Não informado';
      acc[ufOrigem] = (acc[ufOrigem] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Converter para o formato do gráfico
    return Object.entries(contadorPorUFOrigem).map(([name, value]) => ({ name, value }));
  };
  
  const processarDadosPorCidadeOrigem = () => {
    if (!filteredData.length) return [];
    
    // Agrupar os dados por Cidade Origem
    const contadorPorCidadeOrigem = filteredData.reduce((acc, row) => {
      const cidadeOrigem = row['Cidade Origem'] || 'Não informado';
      acc[cidadeOrigem] = (acc[cidadeOrigem] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Converter para o formato do gráfico
    return Object.entries(contadorPorCidadeOrigem).map(([name, value]) => ({ name, value }));
  };
  
  // Preparar os dados para os gráficos
  const dadosPorFilial = processarDadosPorFilial();
  const dadosPorRoteiro = processarDadosPorRoteiro();
  const dadosPorUF = processarDadosPorUF();
  const dadosPorCidade = processarDadosPorCidade();
  
  // Dados para os novos gráficos de origem
  const dadosPorBaseOrigem = processarDadosPorBaseOrigem();
  const dadosPorUFOrigem = processarDadosPorUFOrigem();
  const dadosPorCidadeOrigem = processarDadosPorCidadeOrigem();
  
  // Cálculo dos totais para os cards
  const calcularTotais = () => {
    if (!filteredData.length) return {
      totalNotas: 0,
      totalPeso: 0,
      totalVolumes: 0,
      totalValorNotas: 0,
      totalFrete: 0,
      mediaDiaUtil: 0,
      mediaDiaEnvio: 0,
      diasUteis: 0,
      diasComEnvio: 0,
      mediaPesoDiaUtil: 0,
      mediaPesoDiaEnvio: 0,
      mediaPesoPorEnvio: 0,
      mediaVolumesDiaUtil: 0,
      mediaVolumesDiaEnvio: 0,
      mediaVolumesPorEnvio: 0,
      mediaValorNotasDiaUtil: 0,
      mediaValorNotasDiaEnvio: 0,
      mediaValorNotasPorEnvio: 0,
      mediaFreteDiaUtil: 0,
      mediaFreteDiaEnvio: 0,
      mediaFretePorEnvio: 0
    };

    // Contar o total de itens na coluna NF (sem remover duplicatas)
    const totalNotas = filteredData.length;

    // Calcular soma dos valores numéricos
    const totalPeso = filteredData.reduce((sum, row) => sum + (typeof row.Peso === 'number' ? row.Peso : 0), 0);
    const totalVolumes = filteredData.reduce((sum, row) => sum + (typeof row.Volumes === 'number' ? row.Volumes : 0), 0);
    const totalValorNotas = filteredData.reduce((sum, row) => sum + (typeof row['Valor da Nota'] === 'number' ? row['Valor da Nota'] : 0), 0);
    const totalFrete = filteredData.reduce((sum, row) => sum + (typeof row['Total Frete'] === 'number' ? row['Total Frete'] : 0), 0);

    // Dados para médias
    let diasUteis = 1; // Valor padrão
    let mediaDiaUtil = totalNotas;
    let diasComEnvio = 1; // Valor padrão
    let mediaDiaEnvio = totalNotas;
    
    // Médias para peso
    let mediaPesoDiaUtil = totalPeso;
    let mediaPesoDiaEnvio = totalPeso;
    let mediaPesoPorEnvio = totalPeso / Math.max(totalNotas, 1);
    
    // Médias para volumes
    let mediaVolumesDiaUtil = totalVolumes;
    let mediaVolumesDiaEnvio = totalVolumes;
    let mediaVolumesPorEnvio = totalVolumes / Math.max(totalNotas, 1);
    
    // Médias para valor das notas
    let mediaValorNotasDiaUtil = totalValorNotas;
    let mediaValorNotasDiaEnvio = totalValorNotas;
    let mediaValorNotasPorEnvio = totalValorNotas / Math.max(totalNotas, 1);
    
    // Médias para frete
    let mediaFreteDiaUtil = totalFrete;
    let mediaFreteDiaEnvio = totalFrete;
    let mediaFretePorEnvio = totalFrete / Math.max(totalNotas, 1);
    
    // Calcular médias apenas se tiver informações de período
    if (filterInfo && filterInfo.dataInicialObj && filterInfo.dataFinalObj) {
      diasUteis = calcularDiasUteis(filterInfo.dataInicialObj, filterInfo.dataFinalObj);
      mediaDiaUtil = totalNotas / diasUteis;
      
      diasComEnvio = calcularDiasComEnvio(filteredData);
      mediaDiaEnvio = totalNotas / diasComEnvio;
      
      // Calcular médias para cada categoria
      mediaPesoDiaUtil = totalPeso / diasUteis;
      mediaPesoDiaEnvio = totalPeso / diasComEnvio;
      
      mediaVolumesDiaUtil = totalVolumes / diasUteis;
      mediaVolumesDiaEnvio = totalVolumes / diasComEnvio;
      
      mediaValorNotasDiaUtil = totalValorNotas / diasUteis;
      mediaValorNotasDiaEnvio = totalValorNotas / diasComEnvio;
      
      mediaFreteDiaUtil = totalFrete / diasUteis;
      mediaFreteDiaEnvio = totalFrete / diasComEnvio;
    }

    return {
      totalNotas,
      totalPeso,
      totalVolumes,
      totalValorNotas,
      totalFrete,
      mediaDiaUtil,
      mediaDiaEnvio,
      diasUteis,
      diasComEnvio,
      mediaPesoDiaUtil,
      mediaPesoDiaEnvio,
      mediaPesoPorEnvio,
      mediaVolumesDiaUtil,
      mediaVolumesDiaEnvio,
      mediaVolumesPorEnvio,
      mediaValorNotasDiaUtil,
      mediaValorNotasDiaEnvio,
      mediaValorNotasPorEnvio,
      mediaFreteDiaUtil,
      mediaFreteDiaEnvio,
      mediaFretePorEnvio
    };
  };

  const totais = calcularTotais();

  // Função para formatar valores monetários
  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency', 
      currency: 'BRL'
    });
  };

  // Função para formatar números com casa decimal
  const formatarNumero = (valor: number): string => {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-gray-700">
        <h2 className="text-xl font-semibold flex items-center">
          <FaChartBar className="mr-2 text-primary" /> 
          Analytics
        </h2>
        
        <div className="flex items-center space-x-3">
          {activeFilter && (
            <div 
              className="flex items-center bg-blue-800 px-3 py-1 rounded-lg text-sm cursor-pointer hover:bg-blue-700"
              onClick={clearFilters}
            >
              <FaFilter className="mr-1 text-blue-300" />
              <span>
                Filtro: {activeFilter.type} = {activeFilter.value}
              </span>
              <span className="ml-2 text-blue-300">×</span>
            </div>
          )}
          
          {hasFilter && filterInfo && (
            <div className="flex items-center bg-blue-900 px-3 py-1 rounded-lg text-sm">
              <FaCalendarAlt className="mr-1 text-blue-300" />
              <span>
                Período: {filterInfo.dataInicial} - {filterInfo.dataFinal}
              </span>
            </div>
          )}
          
          <div className={`flex items-center px-3 py-1 rounded-lg text-sm ${filteredData.length === 0 ? 'bg-red-900 text-red-200' : 'bg-gray-800 text-gray-200'}`}>
            <span>
              {filteredData.length} de {data.length} registros
              {filteredData.length === 0 && activeFilter && (
                <span className="ml-2 text-red-300">
                  (Nenhum resultado para este filtro)
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-gray-700 rounded-lg p-6">
            <p className="text-xl mb-4">Nenhum dado encontrado para análise</p>
            
            {activeFilter && (
              <div className="mb-4">
                <p className="font-semibold text-red-300">
                  O filtro "{activeFilter.type} = {activeFilter.value}" não retornou resultados
                  {hasFilter && filterInfo && ` no período ${filterInfo.dataInicial} - ${filterInfo.dataFinal}`}.
                </p>
                <button 
                  className="mt-4 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                  onClick={clearFilters}
                >
                  Remover filtro
                </button>
              </div>
            )}
            
            {hasFilter && !activeFilter && (
              <p className="mt-2 text-sm">
                Tente ajustar ou remover o filtro de data para visualizar os dados.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Cards de Totais */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-700 pb-2">
                Indicadores Principais
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Card 1: Notas Fiscais */}
                <div className="bg-gradient-to-br from-blue-900 to-indigo-800 rounded-lg p-4 shadow-md border border-blue-700">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-blue-200">Notas Fiscais</h3>
                    <div className="bg-blue-800 p-1.5 rounded-lg">
                      <FaFileInvoice className="text-lg text-blue-300" />
                    </div>
                  </div>
                  
                  <div className="flex justify-center my-2">
                    <p className="text-3xl font-bold text-white text-center">{totais.totalNotas}</p>
                  </div>
                  
                  {/* Linha divisória */}
                  <div className="border-t border-blue-700 my-3 opacity-50"></div>
                  
                  {/* Médias */}
                  <div className="mt-2 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1 text-blue-300" />
                        <span className="text-blue-200">Média Dia Útil:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarNumero(totais.mediaDiaUtil)}
                        <span className="text-blue-300 text-xs ml-1">({totais.diasUteis} dias)</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCalendarCheck className="mr-1 text-blue-300" />
                        <span className="text-blue-200">Média Dia Enviado:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarNumero(totais.mediaDiaEnvio)}
                        <span className="text-blue-300 text-xs ml-1">({totais.diasComEnvio} dias)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Peso Total */}
                <div className="bg-gradient-to-br from-green-900 to-emerald-800 rounded-lg p-4 shadow-md border border-green-700">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-green-200">Peso Total (Kg)</h3>
                    <div className="bg-green-800 p-1.5 rounded-lg">
                      <FaBalanceScale className="text-lg text-green-300" />
                    </div>
                  </div>
                  
                  <div className="flex justify-center my-2">
                    <p className="text-3xl font-bold text-white text-center">{formatarNumero(totais.totalPeso)}</p>
                  </div>
                  
                  {/* Linha divisória */}
                  <div className="border-t border-green-700 my-3 opacity-50"></div>
                  
                  {/* Médias */}
                  <div className="mt-2 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1 text-green-300" />
                        <span className="text-green-200">Média Dia Útil:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarNumero(totais.mediaPesoDiaUtil)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCalendarCheck className="mr-1 text-green-300" />
                        <span className="text-green-200">Média Dia Enviado:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarNumero(totais.mediaPesoDiaEnvio)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaFileInvoice className="mr-1 text-green-300" />
                        <span className="text-green-200">Média por Envio:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarNumero(totais.mediaPesoPorEnvio)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Volumes */}
                <div className="bg-gradient-to-br from-amber-900 to-yellow-800 rounded-lg p-4 shadow-md border border-amber-700">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-amber-200">Volumes</h3>
                    <div className="bg-amber-800 p-1.5 rounded-lg">
                      <FaBoxes className="text-lg text-amber-300" />
                    </div>
                  </div>
                  
                  <div className="flex justify-center my-2">
                    <p className="text-3xl font-bold text-white text-center">{formatarNumero(totais.totalVolumes)}</p>
                  </div>
                  
                  {/* Linha divisória */}
                  <div className="border-t border-amber-700 my-3 opacity-50"></div>
                  
                  {/* Médias */}
                  <div className="mt-2 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1 text-amber-300" />
                        <span className="text-amber-200">Média Dia Útil:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarNumero(totais.mediaVolumesDiaUtil)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCalendarCheck className="mr-1 text-amber-300" />
                        <span className="text-amber-200">Média Dia Enviado:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarNumero(totais.mediaVolumesDiaEnvio)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaFileInvoice className="mr-1 text-amber-300" />
                        <span className="text-amber-200">Média por Envio:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarNumero(totais.mediaVolumesPorEnvio)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Valor das Notas */}
                <div className="bg-gradient-to-br from-purple-900 to-violet-800 rounded-lg p-4 shadow-md border border-purple-700">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-purple-200">Valor das Notas</h3>
                    <div className="bg-purple-800 p-1.5 rounded-lg">
                      <FaMoneyBillWave className="text-lg text-purple-300" />
                    </div>
                  </div>
                  
                  <div className="flex justify-center my-2">
                    <p className="text-3xl font-bold text-white text-center">{formatarMoeda(totais.totalValorNotas)}</p>
                  </div>
                  
                  {/* Linha divisória */}
                  <div className="border-t border-purple-700 my-3 opacity-50"></div>
                  
                  {/* Médias */}
                  <div className="mt-2 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1 text-purple-300" />
                        <span className="text-purple-200">Média Dia Útil:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarMoeda(totais.mediaValorNotasDiaUtil)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCalendarCheck className="mr-1 text-purple-300" />
                        <span className="text-purple-200">Média Dia Enviado:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarMoeda(totais.mediaValorNotasDiaEnvio)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaFileInvoice className="mr-1 text-purple-300" />
                        <span className="text-purple-200">Média por Envio:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarMoeda(totais.mediaValorNotasPorEnvio)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 5: Valor de Frete */}
                <div className="bg-gradient-to-br from-red-900 to-rose-800 rounded-lg p-4 shadow-md border border-red-700">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-semibold text-red-200">Valor de Frete</h3>
                    <div className="bg-red-800 p-1.5 rounded-lg">
                      <FaTruck className="text-lg text-red-300" />
                    </div>
                  </div>
                  
                  <div className="flex justify-center my-2">
                    <p className="text-3xl font-bold text-white text-center">{formatarMoeda(totais.totalFrete)}</p>
                  </div>
                  
                  {/* Linha divisória */}
                  <div className="border-t border-red-700 my-3 opacity-50"></div>
                  
                  {/* Médias */}
                  <div className="mt-2 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1 text-red-300" />
                        <span className="text-red-200">Média Dia Útil:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarMoeda(totais.mediaFreteDiaUtil)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaCalendarCheck className="mr-1 text-red-300" />
                        <span className="text-red-200">Média Dia Enviado:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarMoeda(totais.mediaFreteDiaEnvio)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaFileInvoice className="mr-1 text-red-300" />
                        <span className="text-red-200">Média por Envio:</span>
                      </div>
                      <span className="text-white font-semibold">
                        {formatarMoeda(totais.mediaFretePorEnvio)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos de análise */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-700 pb-2">
                Análise de Distribuição
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gráfico 1: Qtde de Notas por Filial */}
                <HorizontalBarChart 
                  data={dadosPorFilial} 
                  title="Qtde de Notas por Filial"
                  xAxisLabel="Quantidade de NFs"
                  yAxisLabel="Filial" 
                  barColor="#a11727"
                  backgroundColor="#dbdad9"
                  maxHeight={400}
                  onBarClick={handleFilialClick}
                  selectedBar={activeFilter?.type === 'Filial' ? activeFilter.value : undefined}
                />
                
                {/* Gráfico 2: Qtde de Notas por Roteiro */}
                <HorizontalBarChart 
                  data={dadosPorRoteiro} 
                  title="Qtde de Notas por Roteiro"
                  xAxisLabel="Quantidade de NFs"
                  yAxisLabel="Setor" 
                  barColor="#a11727"
                  backgroundColor="#dbdad9"
                  maxHeight={400}
                  onBarClick={handleRoteiroClick}
                  selectedBar={activeFilter?.type === 'Roteiro' ? activeFilter.value : undefined}
                />
                
                {/* Gráfico 3: Qtde de Notas por UF */}
                <HorizontalBarChart 
                  data={dadosPorUF} 
                  title="Qtde de Notas por UF"
                  xAxisLabel="Quantidade de NFs"
                  yAxisLabel="UF" 
                  barColor="#a11727"
                  backgroundColor="#dbdad9"
                  maxHeight={400}
                  onBarClick={handleUFClick}
                  selectedBar={activeFilter?.type === 'UF' ? activeFilter.value : undefined}
                />
                
                {/* Gráfico 4: Qtde de Notas por Cidade */}
                <HorizontalBarChart 
                  data={dadosPorCidade} 
                  title="Qtde de Notas por Cidade"
                  xAxisLabel="Quantidade de NFs"
                  yAxisLabel="Cidade" 
                  barColor="#a11727"
                  backgroundColor="#dbdad9"
                  maxHeight={400}
                  onBarClick={handleCidadeClick}
                  selectedBar={activeFilter?.type === 'Cidade' ? activeFilter.value : undefined}
                />
              </div>
            </div>

            {/* Mapa de Distribuição de Envios */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-700 pb-2 flex justify-between items-center">
                <span>Mapa de Distribuição de NFs por Cidade</span>
                <div className="flex items-center">
                  <label className="inline-flex items-center cursor-pointer mr-2 text-sm">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={showCityNames}
                      onChange={() => setShowCityNames(!showCityNames)}
                    />
                    <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-2 text-sm font-medium text-gray-300">Mostrar nomes</span>
                  </label>
                </div>
              </h3>
              <HeatMap 
                data={filteredData} 
                showCityNames={showCityNames}
                onMarkerClick={handleMapMarkerClick}
                selectedCity={activeFilter?.type === 'Cidade' ? activeFilter.value : undefined}
              />
            </div>
            
            {/* Gráficos de análise de origem */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-700 pb-2">
                Análise de Origem dos Envios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Gráfico 1: Qtde de Notas por Base Origem */}
                <HorizontalBarChart 
                  data={dadosPorBaseOrigem} 
                  title="Envios - Base Origem"
                  xAxisLabel="Quantidade de NFs"
                  yAxisLabel="Base Origem" 
                  barColor="#b91c1c"
                  backgroundColor="#dbdad9"
                  maxHeight={400}
                  onBarClick={handleBaseOrigemClick}
                  selectedBar={activeFilter?.type === 'Base Origem' ? activeFilter.value : undefined}
                />
                
                {/* Gráfico 2: Qtde de Notas por UF Origem */}
                <HorizontalBarChart 
                  data={dadosPorUFOrigem} 
                  title="Envios - UF Origem"
                  xAxisLabel="Quantidade de NFs"
                  yAxisLabel="UF Origem" 
                  barColor="#b91c1c"
                  backgroundColor="#dbdad9"
                  maxHeight={400}
                  onBarClick={handleUFOrigemClick}
                  selectedBar={activeFilter?.type === 'UF Origem' ? activeFilter.value : undefined}
                />
                
                {/* Gráfico 3: Qtde de Notas por Cidade Origem */}
                <HorizontalBarChart 
                  data={dadosPorCidadeOrigem} 
                  title="Envios - Cidade Origem"
                  xAxisLabel="Quantidade de NFs"
                  yAxisLabel="Cidade Origem" 
                  barColor="#b91c1c"
                  backgroundColor="#dbdad9"
                  maxHeight={400}
                  onBarClick={handleCidadeOrigemClick}
                  selectedBar={activeFilter?.type === 'Cidade Origem' ? activeFilter.value : undefined}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPanel; 