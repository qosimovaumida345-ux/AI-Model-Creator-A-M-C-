import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  step: number;
  value: number;
}

interface Props {
  data: DataPoint[];
  label: string;
  color: string;
  height?: number;
  format?: (v: number) => string;
}

export default function TrainingChart({ data, label, color, height = 200, format }: Props) {
  const chart = useMemo(() => {
    if (data.length < 2) return null;

    const w = 600;
    const h = height;
    const pad = { top: 20, right: 20, bottom: 30, left: 55 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    const minX = data[0].step;
    const maxX = data[data.length - 1].step;
    const vals = data.map((d) => d.value);
    const minY = Math.min(...vals) * 0.95;
    const maxY = Math.max(...vals) * 1.05;
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const toX = (step: number) => pad.left + ((step - minX) / rangeX) * cw;
    const toY = (val: number) => pad.top + (1 - (val - minY) / rangeY) * ch;

    // Build path
    const points = data.map((d) => `${toX(d.step).toFixed(1)},${toY(d.value).toFixed(1)}`);
    const linePath = `M${points.join('L')}`;

    // Area fill
    const areaPath = `${linePath}L${toX(maxX).toFixed(1)},${(pad.top + ch).toFixed(1)}L${toX(minX).toFixed(1)},${(pad.top + ch).toFixed(1)}Z`;

    // Y-axis ticks
    const yTicks = 5;
    const yTickValues = Array.from({ length: yTicks }, (_, i) => minY + (rangeY * i) / (yTicks - 1));

    // X-axis ticks
    const xTicks = Math.min(6, data.length);
    const xStep = Math.floor(data.length / xTicks);
    const xTickData = data.filter((_, i) => i % xStep === 0 || i === data.length - 1);

    const formatVal = format || ((v: number) => v < 0.01 ? v.toExponential(1) : v.toFixed(3));

    return { w, h, pad, linePath, areaPath, yTickValues, xTickData, toX, toY, formatVal, color };
  }, [data, height, color, format]);

  if (!chart || data.length < 2) {
    return (
      <div className="flex items-center justify-center text-white/20 text-xs" style={{ height }}>
        Waiting for data...
      </div>
    );
  }

  const latest = data[data.length - 1];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-mono" style={{ color: chart.color }}>
          {chart.formatVal(latest.value)}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${chart.w} ${chart.h}`}
        className="w-full"
        style={{ height }}
      >
        {/* Grid lines */}
        {chart.yTickValues.map((val, i) => (
          <g key={i}>
            <line
              x1={chart.pad.left}
              y1={chart.toY(val)}
              x2={chart.w - chart.pad.right}
              y2={chart.toY(val)}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="4,4"
            />
            <text
              x={chart.pad.left - 8}
              y={chart.toY(val) + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.25)"
              fontSize="10"
              fontFamily="monospace"
            >
              {chart.formatVal(val)}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {chart.xTickData.map((d, i) => (
          <text
            key={i}
            x={chart.toX(d.step)}
            y={chart.h - 5}
            textAnchor="middle"
            fill="rgba(255,255,255,0.25)"
            fontSize="10"
            fontFamily="monospace"
          >
            {d.step}
          </text>
        ))}

        {/* Area gradient */}
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chart.color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={chart.color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area */}
        <motion.path
          d={chart.areaPath}
          fill={`url(#grad-${label})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Line */}
        <motion.path
          d={chart.linePath}
          fill="none"
          stroke={chart.color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Latest point glow */}
        <circle
          cx={chart.toX(latest.step)}
          cy={chart.toY(latest.value)}
          r="4"
          fill={chart.color}
          className="animate-pulse"
        />
        <circle
          cx={chart.toX(latest.step)}
          cy={chart.toY(latest.value)}
          r="8"
          fill={chart.color}
          opacity="0.2"
        />
      </svg>
    </div>
  );
}