export type QRType = "url" | "whatsapp" | "wifi" | "text";
export type OutputFormat = "jpg" | "png" | "pdf" | "svg";
export type Language = "es" | "en" | "pt";
export type WiFiSecurity = "WPA" | "WPA2" | "WEP" | "nopass";

export interface QRFormData {
  url: string;
  whatsappMessage: string;
  wifiSSID: string;
  wifiPassword: string;
  wifiSecurity: WiFiSecurity;
  wifiHidden: boolean;
  textContent: string;
  type: QRType;
  qrSize: number;
  enableLogo: boolean;
  logoFile: File | null;
  outputFormat: OutputFormat;
  qrColor: string;
}

export interface QRGenerateRequest {
  url: string;
  size: number;
  logo: string | null;
  format: OutputFormat;
  color: string;
}

export interface QRGenerateResponse {
  qrCode: string;
  size?: number;
  warning?: string;
  error?: string;
}

// --- Tracking (nuestro backend) ---
export interface TrackedQRRequest {
  slug: string;
  target_url: string;
  size?: number;
  logo?: string | null;
  color?: string;
}

export interface TrackedQRResponse {
  slug: string;
  url: string;
  tracking_url: string;
}

export interface QrListItem {
  slug: string;
  target_url: string;
  scan_count: number;
}

export interface StatsResponse {
  slug: string;
  total_escaneos: number;
  clicks: Array<{ fecha: string; navegador: string }>;
}

