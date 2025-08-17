import React, { useState, useRef, useEffect } from 'react'; // 1. Adicione useRef e useEffect
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type DateRange, DayPicker } from 'react-day-picker'; // 2. Corrija a importação
import 'react-day-picker/dist/style.css';

import { api } from '../api';
import { useAuth } from '../providers/authProvider';
import { CustoMensalChart } from '../components/charts/CustoMensalChart';
import './Dashboard.css';

// --- COMPONENTES AUXILIARES ---

const StatCard = ({ icon, title, value, isLoading }: {
  icon: string;
  title: string;
  value: string | number;
  isLoading: boolean;
}) => (
  <div className="stat-card-v2">
    <div className="stat-info-v2">
      <span className="stat-title-v2">{title}</span>
      {isLoading ? (
        <div className="loading-shimmer" style={{ height: '36px', width: '50px' }}></div>
      ) : (
        <span className="stat-value-v2">{value}</span>
      )}
    </div>
    <div className="stat-icon-v2"><i className={icon}></i></div>
  </div>
);

// --- COMPONENTE PRINCIPAL DO DASHBOARD ---

export default function Dashboard() {
  const { user } = useAuth();
  const empresaId = user?.empresaId;

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // 3. NOVO ESTADO para controlar a visibilidade do calendário
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // --- QUERIES (permanecem as mesmas) ---
  const { data: kpiData, isLoading: isLoadingKpis } = useQuery({
    queryKey: ['dashboardData', empresaId, dateRange],
    queryFn: () => api.getDashboardData(String(empresaId), {
      de: dateRange?.from?.toISOString(),
      ate: dateRange?.to?.toISOString(),
    }),
    enabled: !!empresaId,
  });

  const { data: mensalData, isLoading: isLoadingMensal } = useQuery({
    queryKey: ['dashboardMensal', empresaId, dateRange],
    queryFn: () => api.getDashboardMensal(String(empresaId), {
      de: dateRange?.from?.toISOString(),
      ate: dateRange?.to?.toISOString(),
    }),
    enabled: !!empresaId,
  });

  // 4. Lógica para fechar o calendário ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

  const dateFilterText = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd/MM/yy")} a ${format(dateRange.to, "dd/MM/yy")}`
      : format(dateRange.from, "dd/MM/yy")
    : "Selecione um período";

  return (
    <div className="dashboard-page-v2">
      <div className="dashboard-header-v2">
        <div>
          <h1>Dashboard Combustível</h1>
          <p>Bem-vindo ao sistema, {user?.nome || 'Usuário'}! Controle total da sua frota.</p>
        </div>

        {/* 5. ATUALIZADO o wrapper do seletor de data */}
        <div className="date-picker-wrapper" ref={pickerRef}>
          <button className="date-picker-button" onClick={() => setIsPickerOpen(!isPickerOpen)}>
            <i className="fa-solid fa-calendar-days"></i>
            <span>{dateFilterText}</span>
          </button>

          {isPickerOpen && (
            <DayPicker
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              locale={ptBR}
              className="date-picker-calendar"
            />
          )}
        </div>
      </div>

      <div className="stats-grid-v2">
        <StatCard icon="fa-solid fa-car" title="VEÍCULOS ATIVOS" value={kpiData?.veiculosAtivos ?? 0} isLoading={isLoadingKpis} />
        <StatCard icon="fa-solid fa-users" title="MOTORISTAS ATIVOS" value={kpiData?.motoristasAtivos ?? 0} isLoading={isLoadingKpis} />
        <StatCard icon="fa-solid fa-gas-pump" title="ABASTEC. (MÊS)" value={kpiData?.abastecimentosMensal ?? 0} isLoading={isLoadingKpis} />
        <StatCard icon="fa-solid fa-piggy-bank" title="ECONOMIA (MÊS)" value={`R$ ${kpiData?.economiaMensal?.toFixed(2) ?? '0.00'}`} isLoading={isLoadingKpis} />
      </div>

      <div className="card-v2 chart-container">
        <div className="card-header-v2">
          <div className="header-icon-v2"><i className="fa-solid fa-chart-line"></i></div>
          <h2>Análise Mensal (Custo vs. Economia)</h2>
        </div>
        <CustoMensalChart data={mensalData} isLoading={isLoadingMensal} />
      </div>
    </div>
  );
}
