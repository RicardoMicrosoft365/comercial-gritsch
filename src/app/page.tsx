import React from 'react';
import Header from '../components/Header';
import { FaFileUpload, FaChartLine, FaTable } from 'react-icons/fa';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto py-12 px-4">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-primary">Boost</span>
            <span className="text-secondary ml-2 font-light">Comercial</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Plataforma de análise avançada para visualização e processamento de dados comerciais
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-primary text-5xl mb-4 flex justify-center">
              <FaFileUpload />
            </div>
            <h3 className="text-xl font-semibold mb-2">Processamento de Arquivos</h3>
            <p className="text-gray-400">
              Importe seus arquivos para análise e processamento rápido dos dados
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-primary text-5xl mb-4 flex justify-center">
              <FaChartLine />
            </div>
            <h3 className="text-xl font-semibold mb-2">Visualização Gráfica</h3>
            <p className="text-gray-400">
              Visualize seus dados em gráficos interativos para análise detalhada
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="text-primary text-5xl mb-4 flex justify-center">
              <FaTable />
            </div>
            <h3 className="text-xl font-semibold mb-2">Análise de Volumetria</h3>
            <p className="text-gray-400">
              Analise o volume de dados por diferentes dimensões e métricas
            </p>
          </div>
        </section>

        <section className="mt-16 text-center">
          <button className="bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-full text-lg transition-all shadow-lg hover:shadow-xl">
            Comece Agora
          </button>
        </section>
      </div>
    </main>
  );
} 