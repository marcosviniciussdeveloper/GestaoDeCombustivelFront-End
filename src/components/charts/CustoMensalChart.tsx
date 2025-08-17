import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DashboardMensalData } from '../../api';

interface ChartProps {
  data: DashboardMensalData[] | undefined;
  isLoading: boolean;
}

export const CustoMensalChart = ({ data, isLoading }: ChartProps) => {
  if (isLoading) {
    return <div className="loading-shimmer" style={{ height: '300px', width: '100%', borderRadius: '8px' }}></div>;
  }

  if (!data || data.length === 0) {
    return <div className="chart-placeholder">Sem dados para exibir no período.</div>;
  }

  // Formata os dados para o formato que o gráfico espera
  const chartData = data.map(item => ({
    name: item.mes, // O backend já retorna o nome do mês formatado (ex: "ago")
    'Custo Total': item.totalCusto,
    'Economia': item.economia,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
        <XAxis dataKey="name" stroke="#6c757d" fontSize={12} />
        <YAxis
          stroke="#6c757d"
          fontSize={12}
          tickFormatter={(value) => `R$${value.toLocaleString('pt-BR')}`} // Formata o número para o padrão brasileiro
        />
        <Tooltip
          formatter={(value: number, name: string) => [`R$ ${value.toFixed(2)}`, name]}
          labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
        />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        
        {/* Linha 1: Custo Total */}
        <Line
          type="monotone"
          dataKey="Custo Total"
          stroke="#dc3545" // Vermelho
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
        
        {/* 1. ADICIONADA A SEGUNDA LINHA PARA A ECONOMIA */}
        <Line
          type="monotone"
          dataKey="Economia"
          stroke="#28a745" // Verde
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
