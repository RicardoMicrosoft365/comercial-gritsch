import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface HorizontalBarChartProps {
  data: ChartData[];
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  maxHeight?: number;
  barColor?: string;
  backgroundColor?: string;
  onBarClick?: (item: ChartData) => void;
  showPercentage?: boolean;
  selectedBar?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const name = payload[0].payload.name;
    const total = payload[0].payload.total;
    
    // Calcular o percentual
    const percentText = total 
      ? `\u00A0(${((value / total) * 100).toFixed(1)}%)` 
      : '';
    
    return (
      <div className="bg-gray-800 border border-gray-700 rounded p-2 shadow-lg">
        <p className="font-semibold text-gray-300">{name}</p>
        <p className="text-white font-bold">{`Quantidade: ${value.toLocaleString('pt-BR')}${percentText}`}</p>
      </div>
    );
  }
  return null;
};

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  title,
  xAxisLabel = 'Quantidade',
  yAxisLabel = '',
  maxHeight = 500,
  barColor = '#a11727',
  backgroundColor = '#dbdad9',
  onBarClick,
  showPercentage = true,
  selectedBar
}) => {
  // Calcular o total para obter percentuais
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Adicionar total aos dados para uso no tooltip
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: total > 0 ? Number(((item.value / total) * 100).toFixed(1)) : 0,
    total // Adicionar o total para uso no tooltip
  }));
  
  // Ordenar por valor decrescente
  const sortedData = [...dataWithPercentage].sort((a, b) => b.value - a.value);

  // Calcular a altura dinâmica com base no número de registros
  // Altura mínima por item para garantir legibilidade
  const heightPerItem = 45;
  
  // Altura real do conteúdo do gráfico
  const contentHeight = heightPerItem * sortedData.length;
  
  // Altura mínima de exibição para garantir que o gráfico seja sempre visível
  const minDisplayHeight = 200;
  
  // Altura máxima de exibição (sem rolagem)
  const maxDisplayHeight = maxHeight;
  
  // Calcular o valor máximo para determinar o domínio do eixo X
  const maxValue = Math.max(...sortedData.map(item => item.value), 0);
  
  // Definir valores para garantir que os rótulos fiquem visíveis
  const domainMax = Math.ceil(maxValue * 1.35); // 35% a mais para espaçamento dos percentuais

  // Função para lidar com o clique na barra
  const handleBarClick = (data: any, index: number) => {
    if (onBarClick) {
      onBarClick({ name: data.name, value: data.value });
    }
  };
  
  // Função simplificada para formatação do percentual
  const formatPercent = (value: number) => {
    return showPercentage && total > 0 
      ? `\u00A0(${((value / total) * 100).toFixed(1)}%)`
      : '';
  };
  
  // Função para formatar os valores exibidos no final das barras
  const formatLabelValue = (value: any) => {
    const numValue = typeof value === 'number' ? value : 0;
    const percentText = formatPercent(numValue);
    return `${numValue.toLocaleString('pt-BR')}${percentText}`;
  };
  
  // Determinar se precisamos de rolagem
  const needsScroll = contentHeight > maxDisplayHeight;

  // Definir altura do container do gráfico
  const chartContainerHeight = Math.max(
    minDisplayHeight,
    needsScroll ? maxDisplayHeight : contentHeight
  );

  // Definir cores para destacar a barra selecionada
  const highlightColor = '#38bdf8'; // Cor azul brilhante para destaque
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-100 flex items-center">
        <span className="inline-block w-3 h-3 bg-red-700 rounded-full mr-2"></span>
        {title}
        <span className="ml-auto text-xs text-gray-400">
          {data.length} itens
        </span>
      </h3>
      
      {/* Container com altura fixa e scroll quando necessário */}
      <div 
        style={{ height: chartContainerHeight }}
        className={`w-full ${needsScroll ? 'overflow-y-auto overflow-x-hidden scrollbar-custom' : ''}`}
      >
        {/* Container com altura dinâmica baseada no conteúdo real */}
        <div style={{ height: contentHeight, minHeight: minDisplayHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sortedData}
              margin={{
                top: 10,
                right: 180,
                left: 80,
                bottom: 20,
              }}
              barSize={20}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true} 
                vertical={false} 
                stroke="#4B5563" 
              />
              <XAxis
                type="number"
                domain={[0, domainMax]}
                label={{ 
                  value: xAxisLabel, 
                  position: 'insideBottom', 
                  offset: -10, 
                  fill: '#D1D5DB',
                  fontSize: 12
                }}
                tick={{ fill: '#D1D5DB', fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
                axisLine={{ stroke: '#4B5563' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#E5E7EB', fontSize: 12 }}
                width={80}
                axisLine={{ stroke: '#4B5563' }}
                label={
                  yAxisLabel 
                    ? { 
                        value: yAxisLabel, 
                        angle: -90, 
                        position: 'insideLeft', 
                        fill: '#D1D5DB',
                        fontSize: 12,
                        offset: -50
                      } 
                    : undefined
                }
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              />
              <Bar
                dataKey="value"
                background={{ fill: backgroundColor, radius: 4, opacity: 0.3 }}
                radius={[0, 4, 4, 0]}
                onClick={handleBarClick}
                cursor={onBarClick ? 'pointer' : 'default'}
                className={onBarClick ? 'hover:opacity-80 transition-opacity duration-150' : ''}
              >
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={selectedBar === entry.name ? highlightColor : barColor}
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="right"
                  fill="#fff"
                  fontSize={12}
                  fontWeight="bold"
                  formatter={formatLabelValue}
                  offset={10}
                  style={{ whiteSpace: 'nowrap' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {needsScroll && (
        <div className="text-xs text-gray-400 text-center mt-2">
          Role para ver todos os itens
        </div>
      )}
      
      {onBarClick && (
        <div className="text-xs text-gray-400 text-center mt-2">
          {selectedBar ? 
            "Clique novamente na barra destacada para remover o filtro" : 
            "Clique em uma barra para filtrar os dados"}
        </div>
      )}
    </div>
  );
};

export default HorizontalBarChart; 