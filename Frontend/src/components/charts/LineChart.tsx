interface LineChartProps {
  /** 24 valores (una por hora) en el orden del día. */
  data: number[];
  height?: number;
  /** Etiqueta de la zona horaria para el eje, opcional. */
  tzLabel?: string;
}

/**
 * Gráfico de líneas SVG hecho a mano. CERO dependencias externas.
 * Dibuja una polilínea de los 24 buckets horarios con ejes y puntos.
 */
export function LineChart({ data, height = 260, tzLabel = "" }: LineChartProps) {
  const width = 760;
  const padX = 36;
  const padY = 28;
  const max = Math.max(1, ...data);
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const xAt = (i: number) => padX + i * stepX;
  const yAt = (v: number) => height - padY - (v / max) * innerH;

  const points = data.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");
  const ticks = [0, 6, 12, 18, 23];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={`Escaneos por hora${tzLabel ? ` (${tzLabel})` : ""}`}
    >
      {/* Ejes */}
      <line x1={padX} y1={padY} x2={padX} y2={height - padY} stroke="#475569" strokeWidth={1} />
      <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="#475569" strokeWidth={1} />

      {/* Polilínea + puntos */}
      <polyline points={points} fill="none" stroke="#38bdf8" strokeWidth={2} />
      {data.map((v, i) => (
        <circle key={i} cx={xAt(i)} cy={yAt(v)} r={2.5} fill="#38bdf8" />
      ))}

      {/* Etiquetas del eje X (horas) */}
      {ticks.map((i) => (
        <text
          key={i}
          x={xAt(i)}
          y={height - padY + 16}
          fontSize={10}
          fill="#94a3b8"
          textAnchor="middle"
        >
          {i}h
        </text>
      ))}

      {/* Máximo como referencia */}
      <text x={padX} y={padY - 8} fontSize={10} fill="#64748b">
        máx {max}
      </text>
    </svg>
  );
}
