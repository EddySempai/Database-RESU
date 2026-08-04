# ☣️ RESIDENT EVIL: SURVIVAL UNIT — Database & Tactical Companion

<div align="center">

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![i18next](https://img.shields.io/badge/i18n-Español_|_English_|_日本語-26A69A?style=for-the-badge)](https://react.i18next.com/)

**Una plataforma web interactiva y suite táctica integral para *Resident Evil: Survival Unit*.**  
Diseñada con una estética oscura militar/cibernética inspirada en *Umbrella Corporation*, animaciones fluidas, base de datos completa de operativos, comparador de estadísticas, optimizador matemático de aceleradores y asistente de inteligencia artificial con visión por computadora.

[Explorar Funcionalidades](#-funcionalidades-principales) • [Guía de la Calculadora](#-guía-de-uso-calculadora-de-entrenamiento) • [Arquitectura](#-arquitectura-y-tecnologías) • [Instalación](#-instalación-y-configuración)

</div>

---

## 🎯 Propósito del Proyecto

*Resident Evil: Survival Unit* es un juego de estrategia donde la gestión de recursos, la optimización de aceleradores de tiempo durante eventos competitivos (SvS, Cumbres) y el conocimiento detallado de los héroes (*Operativos*) definen la victoria.

Esta plataforma fue desarrollada como una solución integral para los jugadores:
1. **Centralizar información oficial y oculta** de más de 30 personajes, habilidades de exploración, campo y armas especiales VIP.
2. **Resolver el problema matemático de maximización de puntos** mediante un algoritmo de optimización voraz (*Greedy Optimizer*).
3. **Integrar Visión e IA Generativa (Google Gemini)** para escanear inventarios mediante capturas de pantalla y brindar asistencia estratégica en tiempo real.

---

## ✨ Funcionalidades Principales

### 🧠 1. Asistente Táctico "Red Queen AI"
* **Chat interactivo con la IA Red Queen**: Conectada a la API de **Google Gemini**, responde dudas sobre composiciones de tropas, contras de enemigos, escalado de habilidades y sinergias entre héroes.
* **Efecto de terminal retro / teletipo**: Interfaz inmersiva con feedback visual de transmisiones tácticas encriptadas.

### 📊 2. Calculadora y Optimizador de Entrenamiento
* **Algoritmo de Optimización Voraz (*Greedy Strategy*)**: Evalúa múltiples tandas de entrenamiento nuevo y ascensos de tropas (T1 a T11), calculando la tasa exacta de **puntos por segundo invertido** para priorizar automáticamente las filas más eficientes.
* **Soporte multi-evento**: Cálculo instantáneo según las reglas de puntuación de **Evento Cumbres** y **Evento SvS (Servidor vs Servidor)**.
* **Auto-Llenado por IA (OCR Visión)**: Sube una captura de pantalla de tu inventario del juego y la IA detectará automáticamente la cantidad de aceleradores generales y de tropas (1m, 5m, 1h, 3h, 8h).

### 👥 3. Base de Datos de Operativos (Héroes)
* **Fichas Técnicas Detalladas**: Estadísticas base (Salud, Ataque, Defensa, Capacidad de Tropas) y bonificadores pasivos de campo por tipo de tropa (*Defensor, Atacante, Ranger*).
* **Desglose de Habilidades**: Habilidades activas y pasivas de exploración, habilidades tácticas de campo y Armas Especiales exclusivas.
* **Filtros Avanzados y Búsqueda en Tiempo Real**: Filtrado por rareza (*Legendario, Épico, Raro, Común*) y especialización de unidad.

### ⚖️ 4. Comparador Cara a Cara (*Head-to-Head*)
* Permite seleccionar dos operativos y comparar simultáneamente sus atributos, estadísticas de combate, sinergias y conjuntos de habilidades en una sola vista dividida.

### 🏆 5. Tier List Táctica
* Clasificación dinámica y visual de personajes evaluados por su desempeño en modos PvE, PvP y eventos de supervivencia.

### 💎 6. Calculadoras de Tesoros y Joyas
* Planificación de costes de mejora, fragmentos necesarios y estadísticas acumuladas para la optimización de equipamiento.

### 📜 7. Centro de Guías y Manuales de Supervivencia *(Próximamente / Roadmap)*
* Arquitectura preparada para expedientes estratégicos interactivos, protocolos de inicio de 7 días, optimización de estamina y formaciones meta.

### 🌐 8. Internacionalización Completa (i18n)
* Soporte nativo para 3 idiomas con cambio en caliente: **Español (ES)**, **Inglés (EN)** y **Japonés (JA)**.

### ⚡ 9. Rendimiento y Optimización WebP
* Todas las imágenes de personajes e iconos fueron convertidas localmente a **WebP**, reduciendo el peso de los assets en más de un **80%** para garantizar tiempos de carga ultrarrápidos.

---

## 🛠️ Guía de Uso: Calculadora de Entrenamiento

```
 ┌─────────────────────────────────────────────────────────────┐
 │ 1. Seleccionar Evento: [ Cumbres ] o [ SvS ]                │
 ├─────────────────────────────────────────────────────────────┤
 │ 2. Configurar Tandas (Nuevas tropas o Ascenso T_x -> T_y)   │
 │ 3. Ingresar Inventario de Aceleradores o Subir Captura (IA) │
 ├─────────────────────────────────────────────────────────────┤
 │ 4. ¡Listo! El algoritmo genera:                             │
 │    • Puntos Máximos Alcanzables                             │
 │    • Tropas Totales Generadas                               │
 │    • Distribución óptima del tiempo por tanda               │
 └─────────────────────────────────────────────────────────────┘
```

1. **Selecciona el Tipo de Evento**: Cambia entre **Cumbres** y **SvS** en el interruptor superior para aplicar la tabla de puntuación correspondiente.
2. **Configura tus Filas de Entrenamiento**:
   - Pulsa **"+ Añadir Fila"** para agregar múltiples tandas de entrenamiento en paralelo.
   - Elige entre **Nuevo** (entrenar desde cero) o **Ascenso** (mejorar tropas de un Tier inferior a uno superior, ej: T8 ➔ T11).
   - Especifica la cantidad por tanda y el tiempo de entrenamiento que tarda tu cuartel.
3. **Carga tus Aceleradores**:
   - **Manual**: Escribe la cantidad de aceleradores de 1m, 5m, 1h, 3h u 8h en las tarjetas de inventario.
   - **Auto-Llenado IA**: Haz clic en **"Auto-Llenado IA"** y selecciona una captura de pantalla de tu mochila del juego para que Gemini procese los números al instante.
4. **Interpreta los Resultados**:
   - El panel derecho mostrará la puntuación máxima optimizada, el tiempo total consumido y un desglose detallado de cuántas tandas y horas conviene invertir en cada fila.

---

## 🧱 Arquitectura y Tecnologías

El proyecto sigue una arquitectura limpia de componentes React impulsada por Vite y TypeScript para máximo rendimiento y seguridad de tipos:

```
re-survival-unit/
├── public/                 # Assets estáticos optimizados (WebP, SVGs, iconos)
│   ├── iconos/
│   ├── operativos/         # Renders de personajes en formato WebP
│   └── portraits/          # Retratos en miniatura
├── resources/              # Hojas de cálculo y datos fuente en bruto (ignorado por Git)
├── scripts/                # Scripts de automatización y mantenimiento
│   ├── convert_operativos.mjs  # Conversor Sharp PNG -> WebP y sincronizador JSON
│   ├── download_images.js      # Descarga automatizada de assets
│   └── migrations/         # Historial de scripts de migración de datos
├── src/
│   ├── components/         # Componentes modulares (Hero, Calculadora, IA, Showcase...)
│   ├── data/               # Base de datos central en JSON (operativos.json)
│   ├── locales/            # Archivos de traducción i18n (es, en, ja)
│   ├── pages/              # Vistas principales (Home, Operativos, Calculadoras, Comparador, Guias...)
│   ├── services/           # Integración con APIs externas (Google Gemini SDK)
│   └── styles/             # Estilos globales y configuración Tailwind
├── .gitignore              # Configuración de exclusión para un repositorio limpio
├── tailwind.config.js      # Paleta de colores personalizada (blood-red, neon-red, etc.)
└── vite.config.ts          # Configuración del bundler Vite
```

### Stack Técnico

| Capa | Tecnología |
| :--- | :--- |
| **Core Framework** | React 19 + TypeScript |
| **Build Tool & Bundler** | Vite 8 + Rolldown |
| **Estilos & Animaciones** | Tailwind CSS 3 + Framer Motion + Lucide React |
| **Inteligencia Artificial** | Google Generative AI SDK (`@google/generative-ai`) |
| **Enrutamiento** | React Router DOM v7 |
| **Internacionalización** | i18next + react-i18next |
| **Optimización de Medios** | Sharp (WebP lossless/lossy compression) |

---

## 🚀 Instalación y Configuración Local

### Prerrequisitos
* **Node.js** (versión 18 o superior recomendada)
* **pnpm** (o npm / yarn)
* Clave de API de **Google Gemini** ([Obtener en Google AI Studio](https://aistudio.google.com/))

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/re-survival-unit.git
cd re-survival-unit
```

### 2. Instalar dependencias
```bash
pnpm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_GEMINI_API_KEY=tu_clave_de_gemini_aqui
```

### 4. Iniciar en modo desarrollo
```bash
pnpm run dev
```
Abre tu navegador en `http://localhost:5173`.

### 5. Compilar para producción
```bash
pnpm run build
```

---

## 👨‍💻 Autor y Portafolio

Proyecto desarrollado y diseñado por **Eddy**.  
Creado como un proyecto de ingeniería de software enfocado en **Frontend de Alto Impacto**, **Algoritmos de Optimización**, **Integración de Modelos de Lenguaje y Visión (LLMs/VLMs)** y **Alineación de Experiencia de Usuario (UI/UX Gamer)**.

---

<div align="center">
  <sub>Desarrollado para la comunidad de Resident Evil: Survival Unit. Todos los derechos de imágenes y personajes pertenecen a sus respectivos creadores (Capcom / Joycity).</sub>
</div>