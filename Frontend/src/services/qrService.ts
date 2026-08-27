import type {
  QRGenerateRequest,
  QRGenerateResponse,
  TrackedQRRequest,
  TrackedQRResponse,
  QrListItem,
  StatsResponse,
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
}
