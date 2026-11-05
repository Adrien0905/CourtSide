import React from 'react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadar,
} from 'recharts';
import type { CategoryGrades } from '../../types/scouting';

export interface RadarDataPoint {
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

const RADAR_AXES = ['Physical', 'Offense', 'Defense', 'B-Ball IQ', 'Mentality'] as const;

function clampScore(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.min(10, Math.max(0, num));
}

export function categoryRadarPoints(grades?: Partial<CategoryGrades> | null): RadarDataPoint[] {
  const source = grades || {};
  return [
    { axis: 'Physical', value: clampScore(source.physical) },
    { axis: 'Offense', value: clampScore(source.offensive) },
    { axis: 'Defense', value: clampScore(source.defensive) },
    { axis: 'B-Ball IQ', value: clampScore(source.basketballIq) },
    { axis: 'Mentality', value: clampScore(source.mentality) },
  ];
}

function normalizeSeries(data: RadarDataPoint[], comparisonData?: RadarDataPoint[]) {
  const primary = new Map(data.map((point) => [point.axis, clampScore(point.value)]));
  const comparison = new Map((comparisonData || []).map((point) => [point.axis, clampScore(point.value)]));
  const axes = data.length > 0 ? data.map((point) => point.axis) : [...RADAR_AXES];
  const uniqueAxes = axes.length >= 5 ? axes : [...RADAR_AXES];

  return uniqueAxes.map((axis) => ({
    axis,
    primary: primary.get(axis) ?? 0,
    comparison: comparisonData ? comparison.get(axis) ?? 0 : undefined,
  }));
}

class RadarErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[COURTSIDE] RadarChart Recharts render failed, using SVG fallback', error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function SvgRadar({
  chartData,
  primaryLabel,
  comparisonLabel,
  size,
}: {
  chartData: Array<{ axis: string; primary: number; comparison?: number }>;
  primaryLabel: string;
  comparisonLabel: string;
  size: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.34;
  const levels = [2, 4, 6, 8, 10];
  const angleAt = (index: number) => (Math.PI * 2 * index) / chartData.length - Math.PI / 2;
  const coord = (index: number, value: number) => {
    const r = (clampScore(value) / 10) * radius;
    return [cx + r * Math.cos(angleAt(index)), cy + r * Math.sin(angleAt(index))];
  };
  const polygon = (key: 'primary' | 'comparison') =>
    chartData
      .map((point, index) => coord(index, Number(point[key] ?? 0)).join(','))
      .join(' ');
  const hasComparison = chartData.some((point) => point.comparison !== undefined);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Skill radar chart">
        {levels.map((level) => {
          const ring = chartData
            .map((_, index) => coord(index, level).join(','))
            .join(' ');
          return <polygon key={level} points={ring} fill="none" stroke="#2A364F" strokeWidth="1" />;
        })}
        {chartData.map((point, index) => {
          const [x, y] = coord(index, 10);
          const [labelX, labelY] = coord(index, 12.2);
          return (
            <g key={point.axis}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="#2A364F" strokeWidth="1" />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#cbd5e1"
                fontSize="11"
              >
                {point.axis}
              </text>
            </g>
          );
        })}
        {hasComparison && (
          <polygon points={polygon('comparison')} fill="#38BDF8" fillOpacity="0.18" stroke="#38BDF8" strokeWidth="2" />
        )}
        <polygon points={polygon('primary')} fill="#F59E0B" fillOpacity="0.28" stroke="#F59E0B" strokeWidth="2" />
      </svg>
      <div className="flex items-center gap-4 text-[11px] text-slate-300 -mt-1">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500" />
          {primaryLabel}
        </span>
        {hasComparison && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-sky-400" />
            {comparisonLabel}
          </span>
        )}
      </div>
    </div>
  );
}

function RechartsRadarPlot({
  chartData,
  primaryLabel,
  comparisonLabel,
  size,
}: {
  chartData: Array<{ axis: string; primary: number; comparison?: number }>;
  primaryLabel: string;
  comparisonLabel: string;
  size: number;
}) {
  const hasComparison = chartData.some((point) => point.comparison !== undefined);

  return (
    <div className="w-full flex justify-center" style={{ minHeight: size }}>
      <RechartsRadar width={size} height={size} data={chartData} cx="50%" cy="50%" outerRadius="68%">
        <PolarGrid stroke="#2A364F" />
        <PolarAngleAxis dataKey="axis" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
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
        {hasComparison && (
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
    </div>
  );
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  comparisonData,
  primaryLabel = 'Prospect',
  comparisonLabel = 'Comparison',
  size = 280,
}) => {
  const chartData = normalizeSeries(data, comparisonData);

  if (data.length === 0) {
    return (
      <p className="text-xs text-slate-500 text-center py-8">
        Aucune note de catégorie à afficher.
      </p>
    );
  }

  const fallback = (
    <SvgRadar
      chartData={chartData}
      primaryLabel={primaryLabel}
      comparisonLabel={comparisonLabel}
      size={size}
    />
  );

  return (
    <RadarErrorBoundary fallback={fallback}>
      <RechartsRadarPlot
        chartData={chartData}
        primaryLabel={primaryLabel}
        comparisonLabel={comparisonLabel}
        size={size}
      />
    </RadarErrorBoundary>
  );
};
