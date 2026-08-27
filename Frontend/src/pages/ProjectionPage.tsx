import { useState } from "react";
import { useParams } from "react-router-dom";
import { QRService } from "../services/qrService";
import { usePolling } from "../hooks/usePolling";
import { LineChart } from "../components/charts/LineChart";
import type { PublicStatsResponse } from "../types";

function fmtLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function lastNDays(n: number): Array<{ value: string; label: string }> {
  const out: Array<{ value: string; label: string }> = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const value = fmtLocal(d);
    out.push({ value, label: d.toLocaleDateString() });
  }
  return out;
}

type Status = "loading" | "ok" | "off" | "notfound" | "error";

export function ProjectionPage() {
  const { slug = "" } = useParams();
  const [date, setDate] = useState<string>("");
  const [stats, setStats] = useState<PublicStatsResponse | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [tzLabel, setTzLabel] = useState("Bogotá");

  const fetchStats = async () => {
    try {
      const s = await QRService.getPublicStats(slug, date || undefined);
      setStats(s);
      setTzLabel(s.tz || "Bogotá");
      setStatus("ok");
    } catch (e) {
      const statusCode = (e as Error & { status?: number }).status;
      if (statusCode === 403) setStatus("off");
      else if (statusCode === 404) setStatus("notfound");
      else setStatus("error");
    }
  };

  // Refresca cada 30s y cuando cambian slug o date.
  usePolling(30000, fetchStats, [slug, date]);

  if (status === "off") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Dashboard apagado</h1>
          <p className="text-gray-400 mt-2">Este panel no está disponible en este momento.</p>
        </div>
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold">QR no encontrado</h1>
        </div>
      </div>
    );
  }

  if (status === "loading" || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-400">
        Cargando…
      </div>
    );
  }

  const days = lastNDays(7);
  const picoLabel = `${String(stats.hora_pico.hour).padStart(2, "0")}:00`;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold">Dashboard: {slug}</h1>
            <p className="text-gray-400">
              Zona horaria: {tzLabel} ({stats.tz})
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-5">
            <p className="text-xs uppercase text-gray-400">Total de escaneos</p>
            <p className="text-4xl font-bold">{stats.total_escaneos}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5">
            <p className="text-xs uppercase text-gray-400">Hora pico ({tzLabel})</p>
            <p className="text-4xl font-bold">{picoLabel}</p>
            <p className="text-sm text-gray-400">{stats.hora_pico.count} escaneos</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-5">
            <p className="text-xs uppercase text-gray-400">Último escaneo</p>
            <p className="text-xl font-semibold">
              {stats.ultimo_escaneo ? new Date(stats.ultimo_escaneo).toLocaleString() : "—"}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Escaneos por hora</h2>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-700 text-gray-100 rounded px-3 py-1"
              aria-label="Seleccionar día"
            >
              <option value="">Hoy</option>
              {days.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <LineChart data={stats.escaneos_por_hora} tzLabel={tzLabel} />
        </div>
      </div>
    </div>
  );
}
