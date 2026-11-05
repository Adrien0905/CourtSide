import React from 'react';

interface RadarDataPoint {
  axis: string;
  value: number; // 0 to 10
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
  const center = size / 2;
  const radius = (size / 2) - 40;
  const numAxes = data.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Concentric levels (2, 4, 6, 8, 10)
  const levels = [2, 4, 6, 8, 10];

  const getCoordinates = (index: number, val: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (val / 10) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius + 22;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Build polygon path points
  const primaryPoints = data
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.value);
      return `${x},${y}`;
    })
    .join(' ');

  const comparisonPoints = comparisonData
    ? comparisonData
        .map((d, i) => {
          const { x, y } = getCoordinates(i, d.value);
          return `${x},${y}`;
        })
        .join(' ')
    : null;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Background web polygons */}
        {levels.map((lvl) => {
          const levelPoints = Array.from({ length: numAxes })
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={`lvl-${lvl}`}
              points={levelPoints}
              fill="none"
              stroke="#1E293B"
              strokeWidth={lvl === 10 ? '1.5' : '1'}
              strokeDasharray={lvl < 10 ? '2 2' : undefined}
            />
          );
        })}

        {/* Axis Spokes */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(i, 10);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#243045"
              strokeWidth="1"
            />
          );
        })}

        {/* Comparison Polygon (if present) */}
        {comparisonPoints && (
          <polygon
            points={comparisonPoints}
            fill="rgba(56, 189, 248, 0.18)"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        )}

        {/* Primary Prospect Polygon */}
        <polygon
          points={primaryPoints}
          fill="rgba(245, 158, 11, 0.22)"
          stroke="#F59E0B"
          strokeWidth="2.5"
        />

        {/* Primary Data Points */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(i, d.value);
          return (
            <g key={`pt-${i}`}>
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#F59E0B"
                stroke="#0B0F17"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-amber-300 pointer-events-none"
              >
                {d.value.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Axis Labels */}
        {data.map((d, i) => {
          const { x, y } = getLabelCoordinates(i);
          return (
            <text
              key={`label-${i}`}
              x={x}
              y={y + 4}
              textAnchor="middle"
              className="text-[11px] font-medium fill-slate-300 select-none tracking-wide"
            >
              {d.axis}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
          <span className="text-slate-300 font-medium">{primaryLabel}</span>
        </div>
        {comparisonData && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-400 inline-block shadow-sm"></span>
            <span className="text-slate-300 font-medium">{comparisonLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
