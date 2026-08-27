/** Base URL del sitio (sin barra final). Usado para canonical y sitemap. */
export const SITE_URL = "https://www.qrgratis.es";

/** Nombre del proyecto para títulos (fallback). */
export const PROJECT_NAME = "Generador QR";

export type GeneratorRouteType = "url" | "whatsapp" | "wifi" | "texto";

/** Mapeo ruta URL → tipo interno del formulario (QRType). */
export const ROUTE_TO_TYPE: Record<GeneratorRouteType, "url" | "whatsapp" | "wifi" | "text"> = {
  url: "url",
  whatsapp: "whatsapp",
  wifi: "wifi",
  texto: "text",
};

/** Mapeo tipo interno (QRType) → segmento de ruta. */
export const TYPE_TO_ROUTE: Record<"url" | "whatsapp" | "wifi" | "text", GeneratorRouteType> = {
  url: "url",
  whatsapp: "whatsapp",
  wifi: "wifi",
  text: "texto",
};

export const GENERATOR_ROUTE_META: Record<
  GeneratorRouteType,
  { title: string; description: string }
> = {
  url: {
    title: `Generador de Código QR para URLs gratis | ${PROJECT_NAME}`,
    description:
      "Crea códigos QR para cualquier enlace o URL en segundos. Personaliza tamaño, color y descarga en PNG, JPG, SVG o PDF. Gratis y sin registro.",
  },
  whatsapp: {
    title: `Generador de QR para WhatsApp gratis | ${PROJECT_NAME}`,
    description:
      "Genera un código QR que abre WhatsApp directo con tu número y mensaje. Ideal para negocios y emprendedores. Sin registro.",
  },
  wifi: {
    title: `Generador de QR para WiFi gratis | ${PROJECT_NAME}`,
    description:
      "Crea un código QR para compartir tu red WiFi fácilmente. Compatible con WPA, WPA2 y WEP. Descarga gratis al instante.",
  },
  texto: {
    title: `Generador de QR para Texto gratis | ${PROJECT_NAME}`,
    description:
      "Convierte cualquier texto en un código QR al instante. Personaliza y descarga en múltiples formatos. 100% gratis.",
  },
};
