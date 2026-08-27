import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { QrCode, BarChart3, Link2, Copy, Check } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { QRService } from "../services/qrService";
import type { QrListItem, StatsResponse } from "../types";

export function DashboardPage() {
  const { authed } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<QrListItem[]>([]);
  const [selected, setSelected] = useState<QrListItem | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authed !== true) return;
    (async () => {
      try {
        const list = await QRService.listQrs();
        setItems(list);
        if (list.length > 0) setSelected(list[0]); // predeterminado: el más reciente
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [authed]);

  useEffect(() => {
    if (!selected) {
      setStats(null);
      return;
    }
    (async () => {
      try {
        setStats(await QRService.getStats(selected.slug));
      } catch {
        setStats(null);
      }
    })();
  }, [selected]);

  if (authed === false) return <Navigate to="/login" replace />;
  if (authed === null)
    return <div className="p-8 text-center text-gray-500">Cargando…</div>;

  const trackingUrl = selected ? `${window.location.origin}/r/${selected.slug}` : "";

  const copyTracking = async () => {
    if (!trackingUrl) return;
    await navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Panel de QR
          </h1>
        </div>

        {loading && <p className="text-gray-500">Cargando QR…</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && items.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Todavía no creaste ningún QR.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Crear mi primer QR
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de QR */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Tus QR ({items.length})
              </h2>
              <ul className="space-y-2 max-h-[60vh] overflow-auto">
                {items.map((it) => (
                  <li key={it.slug}>
                    <button
                      onClick={() => setSelected(it)}
                      className={`w-full text-left px-3 py-2 rounded-md border text-sm ${
                        selected?.slug === it.slug
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {it.slug}
                      </span>
                      <span className="block text-xs text-gray-500 truncate">
                        {it.target_url}
                      </span>
                      <span className="text-xs text-gray-400">
                        {it.scan_count} escaneos
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detalle del QR seleccionado */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              {selected && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col items-center">
                    <img
                      src={`/download/${selected.slug}`}
                      alt={`QR ${selected.slug}`}
                      className="w-48 h-48 bg-white rounded-lg p-2 border"
                    />
                    <p className="mt-3 text-sm text-gray-500 flex items-center gap-1">
                      <QrCode className="h-4 w-4" /> {selected.slug}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase text-gray-400">URL de tracking</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 break-all">
                          {trackingUrl}
                        </code>
                        <button
                          onClick={copyTracking}
                          className="p-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Copiar"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs uppercase text-gray-400">Total de escaneos</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats?.total_escaneos ?? selected.scan_count}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase text-gray-400 mb-2">
                        Últimos escaneos
                      </p>
                      {stats && stats.clicks.length > 0 ? (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500">
                              <th className="py-1">Fecha</th>
                              <th className="py-1">Navegador</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.clicks.slice(0, 10).map((c, i) => (
                              <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                                <td className="py-1">
                                  {new Date(c.fecha).toLocaleString()}
                                </td>
                                <td className="py-1 text-gray-500 truncate max-w-[200px]">
                                  {c.navegador}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-sm text-gray-400">Sin escaneos todavía.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
