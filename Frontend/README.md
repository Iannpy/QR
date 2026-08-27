# Generador QR - Frontend

Aplicación web moderna desarrollada con React, TypeScript y Vite para generar códigos QR personalizados con una interfaz intuitiva y soporte multiidioma.

## 📋 Características

- Generación de códigos QR en múltiples formatos (PNG, JPG, PDF, SVG)
- Soporte para diferentes tipos de QR:
  - URLs
  - WiFi (con configuración de SSID, contraseña y tipo de seguridad)
  - WhatsApp (con mensaje predefinido)
- Personalización avanzada:
  - Tamaño del código QR (200-2000 píxeles)
  - Color del código QR
  - Agregar logo personalizado al centro del QR
- Interfaz moderna y responsive con Tailwind CSS
- Modo oscuro/claro
- Soporte multiidioma (Español, Inglés, Portugués)
- Descarga de códigos QR generados
- Validación de archivos y datos de entrada

## 🛠️ Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de CSS utility-first
- **React i18next** - Internacionalización
- **Lucide React** - Iconos modernos
- **jsPDF** - Generación de PDFs

## 📦 Instalación

1. Asegúrate de tener Node.js instalado (versión 18 o superior recomendada)

2. Instala las dependencias usando pnpm (recomendado) o npm:

```bash
pnpm install  
```

o

```bash
npm install
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del directorio `Frontend` con la siguiente variable:

```env
VITE_API_URL=http://localhost:3800
```

**Variables requeridas:**

- `VITE_API_URL`: URL base del backend API. En desarrollo, usa `http://localhost:3800` (o el puerto donde esté corriendo tu backend). En producción, usa la URL de tu API desplegada.

### Ejemplo de `.env`:

```env
# Desarrollo
VITE_API_URL=http://localhost:3800

**Nota:** Todas las variables de entorno en Vite deben comenzar con `VITE_` para ser accesibles en el código del cliente.

## 🚀 Uso

### Desarrollo

Para ejecutar la aplicación en modo desarrollo:

```bash
pnpm run dev
```

o

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173` (puerto por defecto de Vite).

```

## 🏗️ Estructura del Proyecto

```
Frontend/
├── public/
│   └── icon.webp          # Icono de la aplicación
├── src/
│   ├── components/
│   │   ├── common/        # Componentes comunes (Modal, ComingSoonModal)
│   │   ├── layout/        # Componentes de layout (Header, Footer, Hero)
│   │   ├── qr/            # Componentes relacionados con QR (QRForm, QRDisplay)
│   │   └── sections/      # Secciones informativas (WhatIsQR, HowToUse, UseCases)
│   ├── constants/
│   │   └── index.ts       # Constantes de la aplicación
│   ├── hooks/
│   │   ├── useDarkMode.ts      # Hook para modo oscuro
│   │   ├── useLanguage.ts      # Hook para idioma
│   │   └── useQRGenerator.ts   # Hook principal para generar QR
│   ├── i18n/
│   │   ├── config.ts      # Configuración de i18next
│   │   └── locales/        # Archivos de traducción (es.json, en.json, pt.json)
│   ├── services/
│   │   └── qrService.ts   # Servicio para comunicarse con la API
│   ├── types/
│   │   └── index.ts       # Definiciones de tipos TypeScript
│   ├── utils/
│   │   ├── fileUtils.ts   # Utilidades para manejo de archivos
│   │   └── qrUtils.ts     # Utilidades para generación de URLs QR
│   ├── App.tsx            # Componente principal
│   ├── main.tsx           # Punto de entrada
│   └── index.css          # Estilos globales
├── index.html             # HTML principal
├── package.json           # Dependencias y scripts
├── tailwind.config.js     # Configuración de Tailwind
├── tsconfig.json          # Configuración de TypeScript
└── vite.config.ts         # Configuración de Vite
```

## 🎨 Componentes Principales

### `App.tsx`
Componente raíz que organiza la estructura de la aplicación y maneja el estado global.

### `QRForm.tsx`
Formulario principal donde el usuario ingresa los datos para generar el código QR. Incluye:
- Selector de tipo de QR (URL, WiFi, WhatsApp)
- Campos específicos según el tipo seleccionado
- Configuración de tamaño, color y formato
- Opción para agregar logo

### `QRDisplay.tsx`
Componente que muestra el código QR generado y permite descargarlo.

### `useQRGenerator.ts`
Hook personalizado que maneja toda la lógica de generación de códigos QR, incluyendo:
- Estado del formulario
- Validación de datos
- Llamadas a la API
- Manejo de errores
- Descarga de archivos

## 🌐 Internacionalización

La aplicación soporta tres idiomas:
- Español (es)
- Inglés (en)
- Portugués (pt)

Los archivos de traducción están en `src/i18n/locales/`. El idioma se guarda en el localStorage y persiste entre sesiones.

## 🎨 Tema Oscuro/Claro

La aplicación incluye soporte para modo oscuro y claro. La preferencia del usuario se guarda en el localStorage.

## 📱 Responsive Design

La aplicación está completamente optimizada para dispositivos móviles, tablets y escritorio usando Tailwind CSS.

## 🔧 Configuración de Build

### Vite
El proyecto usa Vite como build tool, que proporciona:
- Hot Module Replacement (HMR) rápido
- Build optimizado para producción
- Soporte nativo para TypeScript

### TypeScript
Configuración estricta de TypeScript para garantizar la calidad del código.

### Tailwind CSS
Configuración personalizada de Tailwind con soporte para modo oscuro.

## 📝 Validaciones

La aplicación incluye validaciones para:
- URLs válidas
- Archivos de imagen válidos (PNG, JPG, etc.)
- Tamaño máximo de archivos (10MB para logos)
- Campos requeridos según el tipo de QR seleccionado


Asegúrate de configurar la variable de entorno `VITE_API_URL` según corresponda.


## 📄 Tipos de Códigos QR Soportados

### URL
Genera un código QR que redirige a una URL cuando se escanea.

### WiFi
Genera un código QR que permite conectarse automáticamente a una red WiFi. Incluye:
- SSID (nombre de la red)
- Contraseña
- Tipo de seguridad (WPA, WPA2, WEP, None)
- Opción de red oculta

### WhatsApp
Genera un código QR que abre WhatsApp con un mensaje predefinido.

## 🤝 Contribución

Si vas a contribuir a este proyecto:

1. Asegúrate de crear tu archivo `.env` con `VITE_API_URL`
2. Instala las dependencias con `pnpm install`
3. Ejecuta el servidor de desarrollo con `pnpm dev`
4. Sigue las convenciones de código existentes
5. Prueba tus cambios localmente antes de hacer un pull request


Espero que el proyecto crezca y que siga siendo gratis , si me pueden apoyar en mi pagina de Facebook "BigNight" para que siga creciendo la comunidad y haces mas cosas mas adelante 

