import type {
  QRGenerateRequest,
  QRGenerateResponse,
  TrackedQRRequest,
  TrackedQRResponse,
  QrListItem,
  StatsResponse,
  PublicStatsResponse,
  DashboardToggleResponse,
} from "../types";
import { API_ENDPOINTS } from "../constants";

/**
 * Servicio para generar códigos QR
 */
export class QRService {
  /**
   * Genera un código QR estático (sin tracking) en el backend.
   */
  static async generateQR(data: QRGenerateRequest): Promise<QRGenerateResponse> {
    const response = await fetch(API_ENDPOINTS.GENERATE_QR, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Error al generar el código QR");
    }
    return result;
  }

  /**
   * Crea un QR con tracking: guarda el Link y devuelve la imagen en /download/{slug}.
   * Requiere autenticación (cookie de sesión).
   */
  static async createTrackedQR(data: TrackedQRRequest): Promise<TrackedQRResponse> {
    const response = await fetch("/api/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("No autenticado. Inicia sesión.");
      }
      throw new Error(result.detail || "Error al crear el QR");
    }
    return result;
  }

  /** Lista todos los QR creados (con conteo de escaneos). Requiere auth. */
  static async listQrs(): Promise<QrListItem[]> {
    const response = await fetch("/api/qrs");
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401) throw new Error("No autenticado.");
      throw new Error(result.detail || "Error al listar los QR");
    }
    return result;
  }

  /** Estadísticas de escaneos de un slug. Requiere auth. */
  static async getStats(slug: string): Promise<StatsResponse> {
    const response = await fetch(`/stats/${encodeURIComponent(slug)}`);
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401) throw new Error("No autenticado.");
      throw new Error(result.detail || "Error al obtener estadísticas");
    }
    return result;
  }

  /**
   * Estadísticas públicas del dashboard de un slug (SIN auth).
   * Lanza un error con `.status` 403 si el dashboard está apagado, 404 si el slug no existe.
   */
  static async getPublicStats(slug: string, date?: string): Promise<PublicStatsResponse> {
    const url = `/api/public-stats/${encodeURIComponent(slug)}` + (date ? `?date=${encodeURIComponent(date)}` : "");
    const response = await fetch(url);
    const result = await response.json();
    if (!response.ok) {
      const err = new Error(result.error || "Error al obtener estadísticas públicas") as Error & { status?: number };
      err.status = response.status;
      throw err;
    }
    return result;
  }

  /** Activa/desactiva el dashboard público de un slug. Requiere auth. */
  static async setDashboardEnabled(slug: string, enabled: boolean): Promise<DashboardToggleResponse> {
    const response = await fetch(`/api/qr/${encodeURIComponent(slug)}/dashboard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401) throw new Error("No autenticado.");
      throw new Error(result.detail || "Error al actualizar el dashboard");
    }
    return result;
  }
}
