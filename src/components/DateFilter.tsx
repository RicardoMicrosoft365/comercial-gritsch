import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateFilterProps {
  onFilterChange: (startDate: Date | null, endDate: Date | null) => void;
  startDate: Date | null;
  endDate: Date | null;
}

// Função para garantir que a data esteja no formato yyyy-MM-dd para o input type="date"
const formatDateForInput = (date: Date | null): string => {
  if (!date || !isValid(date)) return '';
  return format(date, 'yyyy-MM-dd');
};

// Função para formatar data para exibição (sem depender de hooks)
const formatDateForDisplay = (date: Date | null): string => {
  if (!date || !isValid(date)) return '';
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

// Função para converter a string do input para uma data normalizada (sem horas)
const parseInputDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  try {
    // Criar data a partir da string no formato yyyy-MM-dd
    const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    
    if (!isValid(parsedDate)) return null;
    
    // Normalizar a data (sem horas/minutos/segundos)
    parsedDate.setHours(0, 0, 0, 0);
    return parsedDate;
  } catch (error) {
    console.error('Erro ao converter data:', error);
    return null;
  }
};

const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange, startDate, endDate }) => {
  // Estados para controlar os valores dos inputs
  const [startDateStr, setStartDateStr] = useState<string>(formatDateForInput(startDate));
  const [endDateStr, setEndDateStr] = useState<string>(formatDateForInput(endDate));
  const [pendingStartDate, setPendingStartDate] = useState<Date | null>(startDate);
  const [pendingEndDate, setPendingEndDate] = useState<Date | null>(endDate);
  
  // Estado interno para mostrar o texto de filtro
  const [filterText, setFilterText] = useState<string>('Nenhum filtro de data aplicado');
  
  // Função para aplicar o filtro
  const applyFilter = useCallback((newStartDate: Date | null, newEndDate: Date | null) => {
    // Atualizar o texto de filtro
    if (newStartDate && newEndDate) {
      setFilterText(`Filtrando dados de ${formatDateForDisplay(newStartDate)} a ${formatDateForDisplay(newEndDate)}`);
    } else if (newStartDate) {
      setFilterText(`Filtrando dados a partir de ${formatDateForDisplay(newStartDate)}`);
    } else if (newEndDate) {
      setFilterText(`Filtrando dados até ${formatDateForDisplay(newEndDate)}`);
    } else {
      setFilterText('Nenhum filtro de data aplicado');
    }
    
    // Notificar o componente pai sobre a mudança
    onFilterChange(newStartDate, newEndDate);
  }, [onFilterChange]);
  
  // Atualizar os valores dos inputs quando as props mudam
  useEffect(() => {
    setStartDateStr(formatDateForInput(startDate));
    setPendingStartDate(startDate);
  }, [startDate]);

  useEffect(() => {
    setEndDateStr(formatDateForInput(endDate));
    setPendingEndDate(endDate);
  }, [endDate]);
  
  // Atualizar o texto de filtro quando as datas mudam
  useEffect(() => {
    if (startDate && endDate) {
      setFilterText(`Filtrando dados de ${formatDateForDisplay(startDate)} a ${formatDateForDisplay(endDate)}`);
    } else if (startDate) {
      setFilterText(`Filtrando dados a partir de ${formatDateForDisplay(startDate)}`);
    } else if (endDate) {
      setFilterText(`Filtrando dados até ${formatDateForDisplay(endDate)}`);
    } else {
      setFilterText('Nenhum filtro de data aplicado');
    }
  }, [startDate, endDate]);

  // Handler para mudança da data inicial
  const handleStartDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setStartDateStr(inputValue);
    
    // Converter para objeto Date adequado
    const newStartDate = parseInputDate(inputValue);
    setPendingStartDate(newStartDate);
  }, []);

  // Handler para mudança da data final
  const handleEndDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setEndDateStr(inputValue);
    
    // Converter para objeto Date adequado
    const newEndDate = parseInputDate(inputValue);
    setPendingEndDate(newEndDate);
  }, []);

  // Handler para confirmar o filtro
  const handleConfirmFilter = useCallback(() => {
    applyFilter(pendingStartDate, pendingEndDate);
  }, [pendingStartDate, pendingEndDate, applyFilter]);

  // Handler para limpar os filtros
  const clearFilters = useCallback(() => {
    setStartDateStr('');
    setEndDateStr('');
    setPendingStartDate(null);
    setPendingEndDate(null);
    setFilterText('Nenhum filtro de data aplicado');
    
    // Aplicar o filtro imediatamente
    onFilterChange(null, null);
  }, [onFilterChange]);
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700">
      <h3 className="text-lg font-semibold mb-3">Filtro de Data</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-1">
            Data Inicial
          </label>
          <input
            type="date"
            id="startDate"
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={startDateStr}
            onChange={handleStartDateChange}
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-1">
            Data Final
          </label>
          <input
            type="date"
            id="endDate"
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={endDateStr}
            onChange={handleEndDateChange}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2">
        <div className="text-xs text-gray-400 flex items-center">
          {filterText}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleConfirmFilter}
            className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded-md text-sm transition-colors"
          >
            Confirmar
          </button>
          <button
            onClick={clearFilters}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateFilter; 