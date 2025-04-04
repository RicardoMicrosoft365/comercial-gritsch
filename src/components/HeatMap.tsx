'use client';

import React, { useEffect, useRef, useState } from 'react';
// Importar dinamicamente o arquivo JSON para evitar problemas no SSR
import type { Municipio } from '../types/municipio';

// Importar Leaflet dinamicamente apenas no lado do cliente
let L: any = null;
let HeatLayer: any = null;
let municipios: Municipio[] = [];
let estadosGeoJSON: any = null; // Para armazenar os dados GeoJSON dos estados

// Adicionar um mapeamento entre códigos UF e siglas
const UF_CODIGO_PARA_SIGLA: { [key: number]: string } = {
  11: 'RO', 12: 'AC', 13: 'AM', 14: 'RR', 15: 'PA',
  16: 'AP', 17: 'TO', 21: 'MA', 22: 'PI', 23: 'CE',
  24: 'RN', 25: 'PB', 26: 'PE', 27: 'AL', 28: 'SE',
  29: 'BA', 31: 'MG', 32: 'ES', 33: 'RJ', 35: 'SP',
  41: 'PR', 42: 'SC', 43: 'RS', 50: 'MS', 51: 'MT',
  52: 'GO', 53: 'DF'
};

// Inverter o mapeamento para ter siglas -> código
const UF_SIGLA_PARA_CODIGO: { [key: string]: number } = {};
Object.entries(UF_CODIGO_PARA_SIGLA).forEach(([codigo, sigla]) => {
  UF_SIGLA_PARA_CODIGO[sigla] = Number(codigo);
});

// Remover acentos e colocar em minúsculas para normalizar nomes
const normalizarTexto = (texto: string): string => {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

interface HeatMapProps {
  data: Array<{
    'Cidade Destino': string;
    'UF Destino': string;
    NF: string | number;
  }>;
  showCityNames?: boolean; // Flag para mostrar nomes de cidades
  onMarkerClick?: (cidade: string) => void; // Callback para quando um marcador é clicado
  selectedCity?: string; // Cidade atualmente selecionada
}

const HeatMap: React.FC<HeatMapProps> = ({ 
  data, 
  showCityNames = false, 
  onMarkerClick,
  selectedCity 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const heatLayer = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const [isJSONLoaded, setIsJSONLoaded] = useState(false);
  const [isGeoJSONLoaded, setIsGeoJSONLoaded] = useState(false);

  // Carregar dados de municípios no cliente
  useEffect(() => {
    const carregarMunicipios = async () => {
      try {
        console.log('Tentando carregar o arquivo de municípios...');
        const response = await fetch('/municipios_sem_acentos.json');
        if (!response.ok) {
          throw new Error(`Erro ao carregar municípios: ${response.status}`);
        }
        municipios = await response.json();
        setIsJSONLoaded(true);
        console.log(`Carregados ${municipios.length} municípios. Primeiros 3 municípios:`, 
          municipios.slice(0, 3));
      } catch (error) {
        console.error('Erro ao carregar arquivo de municípios:', error);
      }
    };

    if (isClient) {
      carregarMunicipios();
    }
  }, [isClient]);

  useEffect(() => {
    // Executar apenas no cliente
    setIsClient(true);
    
    // Importar Leaflet e Leaflet.heat dinamicamente
    const loadLeaflet = async () => {
      try {
        console.log('Tentando carregar o Leaflet...');
        // Importar Leaflet
        const leafletModule = await import('leaflet');
        L = leafletModule.default || leafletModule;
        
        // No Next.js, não podemos importar CSS dinamicamente desta forma
        // Vamos adicionar manualmente o CSS do Leaflet
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(link);
        
        // Importar plugin heat
        console.log('Tentando carregar o plugin Leaflet.heat...');
        const heatModule = await import('leaflet.heat');
        HeatLayer = heatModule.default || heatModule;
        
        // Forçar atualização do componente
        setIsLeafletLoaded(true);
        console.log('Leaflet e plugin carregados com sucesso!');
      } catch (error) {
        console.error("Erro ao carregar Leaflet:", error);
      }
    };
    
    loadLeaflet();
  }, []);

  // Função para carregar o arquivo GeoJSON com as divisas dos estados
  const carregarDivisasEstados = async (map: any) => {
    try {
      console.log("Carregando divisas dos estados...");
      const response = await fetch("/brasil-estados.geojson");
      if (!response.ok) {
        throw new Error(`Erro ao carregar arquivo GeoJSON: ${response.status}`);
      }
      const geoJsonData = await response.json();
      estadosGeoJSON = geoJsonData;
      
      // Adicionar camada GeoJSON com estilo personalizado
      L.geoJSON(geoJsonData, {
        style: {
          color: "#FFF", // Cor da borda
          weight: 2, // Espessura da linha
          opacity: 0.7, // Opacidade da linha
          fillColor: "transparent", // Transparente para não cobrir o mapa
          fillOpacity: 0,
        },
        onEachFeature: (feature: any, layer: any) => {
          // Adicionar popup com nome do estado
          if (feature.properties && feature.properties.nome) {
            layer.bindTooltip(feature.properties.nome, {
              permanent: false,
              direction: 'center',
              className: 'estado-tooltip'
            });
          }
        }
      }).addTo(map);
      
      setIsGeoJSONLoaded(true);
      console.log("Divisas dos estados carregadas com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar divisas dos estados:", error);
    }
  };

  // Inicializar mapa quando componente montar e Leaflet estiver carregado
  useEffect(() => {
    if (!isClient || !mapRef.current || !L || !isLeafletLoaded) return;

    // Se o mapa já foi inicializado, não inicializar novamente
    if (leafletMap.current) return;

    try {
      console.log('Iniciando a criação do mapa...');
      // Corrigir o ícone do Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });

      // Inicializar mapa
      const map = L.map(mapRef.current).setView([-15.7801, -47.9292], 4); // Centro no Brasil
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Carregar as divisas dos estados
      carregarDivisasEstados(map);
      
      leafletMap.current = map;
      console.log('Mapa criado com sucesso!');
    } catch (error) {
      console.error("Erro ao inicializar mapa:", error);
    }

    return () => {
      // Limpar mapa quando componente desmontar
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [isClient, isLeafletLoaded]);

  // Atualizar mapa de calor quando os dados mudarem
  useEffect(() => {
    if (!isClient || !leafletMap.current || !L || !data.length || !isJSONLoaded || !municipios.length) {
      console.log('Não foi possível atualizar o mapa. Status:', {
        isClient,
        temMapa: !!leafletMap.current,
        temLeaflet: !!L,
        quantidadeDados: data.length,
        isJSONLoaded,
        quantidadeMunicipios: municipios.length
      });
      return;
    }

    try {
      console.log('Começando a processar dados para o mapa...');
      console.log(`Processando ${data.length} registros de dados.`);
      
      // Log exemplo dos primeiros registros recebidos
      console.log('Exemplos de dados recebidos:', data.slice(0, 3));
      
      // Limpar marcadores existentes
      if (leafletMap.current) {
        leafletMap.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
            leafletMap.current.removeLayer(layer);
          }
        });
      }
      
      // Agrupar NFs por cidade para contar os valores
      const nfsPorCidade: { [key: string]: number } = {};
      
      data.forEach(item => {
        if (!item['Cidade Destino'] || !item['UF Destino']) {
          console.log('Item com dados de cidade/UF incompletos:', item);
          return;
        }
        
        const cidadeNormalizada = normalizarTexto(item['Cidade Destino']);
        const uf = item['UF Destino'];
        const chave = `${cidadeNormalizada}-${uf}`;
        
        // Incrementar contador de NFs (cada linha representa uma NF)
        nfsPorCidade[chave] = (nfsPorCidade[chave] || 0) + 1;
      });
      
      console.log(`Agrupados ${Object.keys(nfsPorCidade).length} locais únicos de destino.`);
      console.log('Exemplos de destinos agrupados:', 
        Object.entries(nfsPorCidade).slice(0, 3).map(([chave, quantidade]) => ({ chave, quantidade })));
      
      // Marcadores para cada cidade
      const marcadores: { cidade: string, uf: string, quantidade: number, latitude: number, longitude: number }[] = [];
      const cidadesSemCoordenadas: { cidade: string, uf: string }[] = [];
      
      // Converter dados agrupados para marcadores no mapa
      Object.entries(nfsPorCidade).forEach(([chave, quantidade]) => {
        const [cidadeNormalizada, uf] = chave.split('-');
        
        // Buscar cidade no arquivo de municípios com verificação melhorada
        let municipioEncontrado: Municipio | undefined;
        
        // 1. Primeiro, tenta encontrar com correspondência exata de nome e UF
        if (uf && uf.length === 2) {
          const codigoUF = UF_SIGLA_PARA_CODIGO[uf];
          
          if (codigoUF) {
            municipioEncontrado = municipios.find(municipio => {
              const municipioNormalizado = normalizarTexto(municipio.nome);
              return municipioNormalizado === cidadeNormalizada && municipio.codigo_uf === codigoUF;
            });
          }
        }
        
        // 2. Se não encontrou, procura apenas pelo nome da cidade (ignorando UF)
        if (!municipioEncontrado) {
          municipioEncontrado = municipios.find(municipio => {
            const municipioNormalizado = normalizarTexto(municipio.nome);
            return municipioNormalizado === cidadeNormalizada;
          });
          
          if (municipioEncontrado) {
            console.log(`Cidade "${cidadeNormalizada}" encontrada, mas com UF diferente. Esperado: ${uf}, Encontrado: ${UF_CODIGO_PARA_SIGLA[municipioEncontrado.codigo_uf]}`);
          }
        }
        
        // 3. Se ainda não encontrou, procura por correspondência parcial
        if (!municipioEncontrado) {
          const candidatos = municipios.filter(municipio => {
            const municipioNormalizado = normalizarTexto(municipio.nome);
            return municipioNormalizado.includes(cidadeNormalizada) || 
                   cidadeNormalizada.includes(municipioNormalizado);
          });
          
          if (candidatos.length > 0) {
            // Usar o primeiro candidato (poderia refinar com mais lógica se necessário)
            municipioEncontrado = candidatos[0];
            console.log(`Correspondência parcial para "${cidadeNormalizada}": usando "${municipioEncontrado.nome}" (${UF_CODIGO_PARA_SIGLA[municipioEncontrado.codigo_uf]})`);
          }
        }
        
        if (municipioEncontrado) {
          const { latitude, longitude } = municipioEncontrado;
          marcadores.push({
            cidade: municipioEncontrado.nome,
            uf: UF_CODIGO_PARA_SIGLA[municipioEncontrado.codigo_uf],
            quantidade,
            latitude,
            longitude
          });
        } else {
          cidadesSemCoordenadas.push({
            cidade: cidadeNormalizada,
            uf
          });
        }
      });
      
      // Detalhes sobre cidades não encontradas
      if (cidadesSemCoordenadas.length > 0) {
        console.log(`${cidadesSemCoordenadas.length} cidades não encontradas (de ${Object.keys(nfsPorCidade).length} total).`);
        console.log('Exemplos de cidades não encontradas:', cidadesSemCoordenadas.slice(0, 5));
      }
      
      // Adicionar marcadores ao mapa
      if (marcadores.length > 0) {
        console.log(`Gerando marcadores para ${marcadores.length} cidades.`);
        
        // Encontrar o maior quantidade para escalar o tamanho dos círculos
        const maxQuantidade = Math.max(...marcadores.map(m => m.quantidade));
        
        // Criar um grupo de marcadores para poder fazer zoom automático
        const markersGroup = L.featureGroup();
        
        marcadores.forEach(marcador => {
          // Calcular o raio com base na quantidade (min 10px, max 50px)
          const raioBase = 10;
          const raioMax = 50;
          const raio = raioBase + (raioMax - raioBase) * (marcador.quantidade / maxQuantidade);
          
          // Ajustar raio se exibir nomes de cidades
          const raioAjustado = showCityNames ? raio * 1.2 : raio;
          
          // Criar o marcador circular
          const circle = L.circleMarker([marcador.latitude, marcador.longitude], {
            radius: Math.max(10, Math.min(50, raioAjustado)),
            fillColor: marcador.cidade === selectedCity ? '#ff6b6b' : '#ffc7ce', // Cor diferente para cidade selecionada
            color: marcador.cidade === selectedCity ? '#c92a2a' : '#9c0006', // Borda mais escura para cidade selecionada
            weight: marcador.cidade === selectedCity ? 2 : 1, // Borda mais espessa para cidade selecionada
            opacity: 1,
            fillOpacity: 0.8
          });
          
          circle.addTo(leafletMap.current);
          markersGroup.addLayer(circle);
          
          // Adicionar rótulo com a quantidade
          const quantidadeText = Math.round(marcador.quantidade).toString();
          const labelText = showCityNames 
            ? `<div style="text-align: center; line-height: 1.2;">
                <div style="font-size: 9px; white-space: nowrap; max-width: ${raioAjustado * 4}px; overflow: hidden; text-overflow: ellipsis;">${marcador.cidade}</div>
                <div style="font-size: 12px; font-weight: bold;">${quantidadeText}</div>
               </div>`
            : quantidadeText;
            
          const icon = L.divIcon({
            html: `<div style="background: transparent; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; color: ${marcador.cidade === selectedCity ? '#c92a2a' : '#9c0006'}; font-weight: bold; text-shadow: 0px 0px 2px white;">${labelText}</div>`,
            className: 'nf-marker-label',
            iconSize: [raioAjustado * 3, raioAjustado * 3] // Aumentado para acomodar o nome da cidade
          });
          
          const marker = L.marker([marcador.latitude, marcador.longitude], {
            icon: icon,
            interactive: false,
            keyboard: false
          });
          
          marker.addTo(leafletMap.current);
          markersGroup.addLayer(marker);
          
          // Adicionar popup com informações detalhadas
          circle.bindPopup(`
            <div>
              <strong>${marcador.cidade} - ${marcador.uf}</strong><br/>
              Quantidade de NFs: ${marcador.quantidade.toLocaleString('pt-BR')}
            </div>
          `);
          
          // Adicionar funcionalidade de clique para filtrar por cidade
          if (onMarkerClick) {
            circle.on('click', () => {
              onMarkerClick(marcador.cidade);
            });
            
            // Mudar o cursor para indicar que é clicável
            circle.on('mouseover', () => {
              circle.getElement()?.style.setProperty('cursor', 'pointer');
            });
          }
        });
        
        // Ajustar zoom para mostrar todos os marcadores com uma pequena margem
        if (markersGroup.getLayers().length > 0) {
          try {
            const bounds = markersGroup.getBounds();
            
            // Adicionar margem ao redor dos marcadores (padding em pixels)
            const paddingTopBottom = 50;
            const paddingLeftRight = 50;
            
            // Aplicar zoom com margem
            leafletMap.current.fitBounds(bounds, {
              padding: [paddingTopBottom, paddingLeftRight],
              maxZoom: 8 // Limitar o zoom máximo para não aproximar demais com poucos pontos
            });
            
            console.log('Zoom automático aplicado para enquadrar todos os marcadores');
          } catch (error) {
            console.error('Erro ao ajustar o zoom automático:', error);
            // Em caso de erro, voltar ao zoom padrão do Brasil
            leafletMap.current.setView([-15.7801, -47.9292], 4);
          }
        }
        
        console.log(`Marcadores gerados com sucesso - ${marcadores.length} pontos.`);
      } else {
        console.log('Nenhum dado válido para gerar marcadores. Verifique:');
        console.log('1. Se as cidades nos dados correspondem aos nomes no arquivo de municípios');
        console.log('2. Se os códigos de UF estão corretos');
        console.log('3. Se há dados de NFs válidos');
      }
    } catch (error) {
      console.error("Erro ao gerar marcadores no mapa:", error);
    }
  }, [data, isClient, isLeafletLoaded, isJSONLoaded, showCityNames, onMarkerClick, selectedCity]);

  if (!isClient) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <div style={{ height: '500px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      {!isJSONLoaded || !isLeafletLoaded ? (
        <div style={{ height: '500px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Carregando dados necessários para o mapa... {!isJSONLoaded ? 'Aguardando dados dos municípios.' : ''} {!isLeafletLoaded ? 'Aguardando Leaflet.' : ''}</p>
        </div>
      ) : (
        <div ref={mapRef} style={{ height: '500px', width: '100%' }} />
      )}
      
      {/* Painel de depuração para facilitar diagnóstico */}
      <div className="mt-4 p-4 bg-gray-700 rounded-lg text-xs">
        <h4 className="font-bold mb-2">Informações de Depuração:</h4>
        <ul>
          <li>Dados carregados: {data.length} registros</li>
          <li>Municípios carregados: {municipios.length}</li>
          <li>Status: {isClient ? 'Cliente inicializado' : 'Aguardando cliente'} | 
                     {isLeafletLoaded ? 'Leaflet carregado' : 'Aguardando Leaflet'} | 
                     {isJSONLoaded ? 'JSON carregado' : 'Aguardando JSON'} |
                     {isGeoJSONLoaded ? 'GeoJSON carregado' : 'Aguardando GeoJSON'}</li>
          <li>Estilo do mapa: Bolhas na cor <span style={{color: '#ffc7ce'}}>rosa</span> e quantidade de NFs em <span style={{color: '#9c0006'}}>vermelho escuro</span></li>
          <li>Exibição de nomes: {showCityNames ? 'Ativada' : 'Desativada'}</li>
          <li>Interatividade: {onMarkerClick ? 'Clique nas bolhas para filtrar por cidade' : 'Modo apenas visualização'}</li>
          {selectedCity && (
            <li>
              Cidade selecionada: <span className="font-bold text-red-300">{selectedCity}</span> 
              <span className="ml-2">(destacada em <span style={{color: '#ff6b6b'}}>vermelho mais intenso</span>)</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default HeatMap; 