import React from 'react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadar,
  ResponsiveContainer,
} from 'recharts';

interface RadarDataPoint {
  axis: string;
  value: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  comparisonData?: RadarDataPoint[];
  primaryLabel?: string;
  comparisonLabel?: string;
  size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  comparisonData,
  primaryLabel = 'Prospect',
  comparisonLabel = 'Comparison',
  size = 280,
}) => {
  if (data.length === 0) {
    return (
      <p className="text-xs text-slate-500 text-center py-8">
        Aucune note de catégorie à afficher.
      </p>
    );
  }

  const chartData = data.map((point, index) => ({
    axis: point.axis,
    primary: point.value,
    comparison: comparisonData?.[index]?.value,
  }));

  return (
    <div className="w-full" style={{ height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={chartData} cx="50%" cy="50%" outerRadius="68%">
          <PolarGrid stroke="#2A364F" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#cbd5e1', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name={primaryLabel}
            dataKey="primary"
            stroke="#F59E0B"
            fill="#F59E0B"
            fillOpacity={0.28}
            strokeWidth={2}
          />
          {comparisonData && (
            <Radar
              name={comparisonLabel}
              dataKey="comparison"
              stroke="#38BDF8"
              fill="#38BDF8"
              fillOpacity={0.18}
              strokeWidth={2}
            />
          )}
          <Legend wrapperStyle={{ fontSize: 12, color: '#cbd5e1' }} />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
};
