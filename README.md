# Boost Comercial

Sistema web para processamento de arquivos, análise de dados e visualização gráfica.

## Funcionalidades

- Interface moderna com tema dark
- Upload e processamento de arquivos (CSV, Excel, JSON)
- Visualização de dados em gráficos interativos
- Análise de volumetria com métricas
- Dashboard com cards informativos
- Mapas interativos com visualização geográfica dos dados
- Tabelas ordenáveis com análise de faixas de peso

## Tecnologias Utilizadas

- Next.js 14
- React 18
- TypeScript 5
- TailwindCSS 3
- React Icons
- Recharts (para gráficos)
- Leaflet (para mapas)

## Requisitos

- Node.js 18.0.0 ou superior
- NPM 8.0.0 ou superior

## Arquivos de Dados Necessários

O projeto utiliza alguns arquivos de dados que precisam estar disponíveis na pasta `/public`:

- `municipios_sem_acentos.json` - Base de dados de municípios brasileiros
- `brasil-estados.geojson` - Arquivo com as fronteiras dos estados brasileiros para o mapa

**Importante**: O arquivo `brasil-estados.geojson` precisa ser baixado e adicionado à pasta `/public` antes de executar o projeto. Este arquivo pode ser obtido em:
[https://github.com/codeforgermany/click_that_hood/blob/main/public/data/brazil-states.geojson](https://github.com/codeforgermany/click_that_hood/blob/main/public/data/brazil-states.geojson)

## Como Executar

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/boost-comercial.git
cd boost-comercial
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

3. Certifique-se de que os arquivos de dados necessários estão presentes na pasta `/public`

4. Execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

5. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Build para Produção

Para compilar o projeto para produção:

```bash
npm run build
npm start
```

## Estrutura do Projeto

- `/src/app` - Páginas da aplicação no formato App Router do Next.js
- `/src/components` - Componentes reutilizáveis
- `/public` - Assets estáticos e arquivos de dados

## Páginas

- Início (`/`) - Página inicial com visão geral do sistema
- Análise de Volumetria (`/analise-volumetria`) - Upload e análise de dados com mapas e gráficos

## Solução de Problemas

- **Erro no mapa**: Verifique se o arquivo `brasil-estados.geojson` está presente na pasta `/public`
- **Erro "Cannot read properties of undefined"**: Se ocorrer erro relacionado a propriedades indefinidas nos gráficos, verifique se os dados estão sendo processados corretamente antes de serem exibidos

## Compatibilidade de Navegadores

Este projeto é otimizado para navegadores modernos como Chrome, Firefox, Safari e Edge em suas versões mais recentes. 