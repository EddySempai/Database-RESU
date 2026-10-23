# 🗺️ Mapa de Rutas y Enlazado Inteligente de Palabras Clave

## 1. Rutas Principales de la Web (`resudb.com`)
- `/` — Página de Inicio (Hero, Últimas Noticias, Accesos Rápidos, Operativos Destacados).
- `/noticias` — Portada del Newsletter y Notas de Parche.
- `/noticias/:id` — Vista de lectura completa estilo Newsletter / Editorial de cada noticia o parche (incluye `gran-actualizacion-3-fases-wiki`, `patch-1-10-1-datamine`, `tierlist-meta-pvp-pve-update`, etc.).
- `/heroes` — Base de Datos de Operativos.
- `/heroes/:id` — Expediente detallado del operativo, habilidades y calculadoras de nivel/ascenso/armas.
- `/llaveros` — Base de Datos interactiva de Llaveros por rareza con calculadora de EXP a Nivel 30, tabla de CP y 96 sub-stats.
- `/tier-list` — Tier List competitiva (PvP Arena y PvE Campaign: Early, Mid, Late Game) y Equipos Meta 5v5.
- `/comparador` — Comparador cara a cara de operativos de la misma clase con análisis de Red Queen IA.
- `/herramientas` — Calculadoras Tácticas (Mapa & Calculadora de Mansión de Luminio P1–P10, Puntos de Entrenamiento/Aceleradores con OCR, Simulador de Árbol de Luminio, Calculadora de Tesoros Míticos, Joyas y Consola de IA Red Queen). Totalmente localizada en ES, EN y JA.
- `/conversores` — Centro de Conversores Tácticos (Tienda de Intercambio de Tesoros Míticos con cupos semanales, Calculadora y Optimizador de Aceleradores, Mochila de Recursos Seguros y Conversor de Polvo/Piedras de Luminio). Totalmente localizada en ES, EN y JA.
- `/guias` — Centro de Guías y Dossiers Tácticos.
- `/guias/:slug` — Lectura interactiva de guías (`repeler-a-mortem`, `cumbre-de-ases`, `guerra-de-hierbas`, `dominar-llaveros`, `primeros-7-dias`, `mansion-nivel-1-a-30`).

## 2. Diccionario de Auto-Enlazado (`SmartText`)
Cualquier mención en el cuerpo de una noticia o guía a estos términos se resalta automáticamente y enlaza a su sección:
- **Llaveros / Keyrings / Keychains / キーリング / キーホルダー** ➔ `/llaveros`
- **Tier List / Meta PvP / Meta PvE** ➔ `/tier-list`
- **Mansión / Mansión de Luminio / Tesoros Míticos / Joyas / Luminio / Aceleradores / Calculadoras** ➔ `/herramientas`
- **Conversores / Conversores Tácticos / Tienda de Intercambio / Intercambio de Tesoros / Maletines de Recursos / Bolsas de Recursos / Recursos Seguros** ➔ `/conversores`
- **Hoja de Ruta de Mansión / Mansión Nivel 1 a 30 / Requisitos de Mansión** ➔ `/guias/mansion-nivel-1-a-30`
- **Comparador** ➔ `/comparador`
- **Mortem / Repeler a Mortem** ➔ `/guias/repeler-a-mortem`
- **Cumbre de Ases / Ace Summit** ➔ `/guias/cumbre-de-ases`
- **Guerra de Hierbas / Herb War** ➔ `/guias/guerra-de-hierbas`
- **Nombres de Operativos (Leon, Sheva, Jill, Krauser, Ashley, etc.)** ➔ `/heroes/:id`

## 3. Estándar Visual de `/noticias` y `/noticias/:id`
- **Diseño Minimalista (Sin estrés visual):** La portada `/noticias` (`src/pages/Noticias.tsx`) y la lectura de boletines `/noticias/:id` (`src/pages/NoticiaDetalle.tsx`) mantienen un diseño editorial limpio (`max-w-4xl` / `max-w-3xl`), sin partículas rojas flotantes al azar en `/noticias/:id`.
- **Fondo Táctico con Grid Animado hacia Abajo (`/noticias/:id`):** Combina una escena del juego difuminada (`backdrop-blur-[20px]` bajo una capa `#080809/88`), cuadrícula milimétrica animada en caída vertical (`@keyframes tacticalGridDown` de `0px` a `32px` cada `3s`) con máscara radial suave y un degradado de horizonte superior + viñeta perimetral oscura.
- **Etiquetas Inline (`SmartText.tsx`):** Los enlaces automáticos usan texto rojo carmesí vivo (`#ff3333`), fondo semitransparente (`bg-[#ff3333]/10`), borde sutil (`border-[#ff3333]/20`), `padding: 2px 8px` y `rounded-[5px]`.
- **Separación de Cabecera (`Navbar.tsx`):** Usa `bg-[#0a0a0c]/80` con `backdrop-blur-[12px]` y borde inferior `border-white/[0.06]` únicamente en el `<Navbar />` principal, mientras que los botones `Volver a noticias` y `Compartir` se integran de forma limpia y transparente sobre el contenedor del artículo sin una franja negra adicional.
- **Panel "Data HUD" para Puntos Clave (`/noticias/:id`):** Contenedor con esquinas superiores biseladas (`clip-path`), acentos angulares en `#ff3333`, bordes en gris grafito (`#26262b`) e indicador de estado activo (`SYS.HUD // MONITOREO ACTIVO`).
- **Carrusel Automático Superior (`/noticias`):** La tarjeta principal de `/noticias` rota automáticamente cada 5.5 segundos entre las últimas noticias (se pausa al pasar el ratón), integrando la imagen de fondo a la derecha con un degradado transparente (`mask-image: linear-gradient(to left, ...)`).
- **Tarjetas con Etiquetas de Color e Imagen Difuminada a la Izquierda (`/noticias`):** Cada tarjeta del listado inferior conserva su etiqueta de categoría con color (`badgeColor`) para identificar rápido el tema y muestra su imagen como fondo difuminado en el lado izquierdo (`mask-image: linear-gradient(to right, ...)`), fundiéndose de forma transparente hacia el texto sin parecer un recuadro pegado.
- **Barra de Progreso de Lectura (`Navbar.tsx`):** La barra de progreso de scroll se renderiza en el borde inferior (`bottom-0`) de `src/components/Navbar.tsx` cuando el usuario está en `/noticias/:id` o `/guias/:slug`, evitando que el header fijo (`z-50`) la cubra al hacer scroll.

## 4. Transición de Portal Táctico (Cierre y Apertura de Compuertas de Seguridad)
- **Mecánica de Cierre y Apertura Completa:** Entre rutas generales de la aplicación, el portal de seguridad de Umbrella ejecuta un ciclo físico completo:
  1. **Fase de Cierre (Exit):** Las compuertas blindadas superior e inferior se deslizan hacia el centro (`y: 0%` en 0.38s con curva acelerada `[0.76, 0, 0.24, 1]`), sellando la pantalla con franjas de advertencia de peligro rojas/negras y bordes carmesí mientras la página saliente permanece congelada y visible debajo.
  2. **Bloqueo Central (Seam Lock):** Al colisionar en el centro (`50vh + 50vh`), los sellos tácticos se alinean (`UMBRELLA FACILITY // SECURITY PORTAL` y `TRANSIT VERIFIED // ACCESS AUTHORIZED`). En este instante de pantalla sellada se produce el cambio de ruta y `window.scrollTo(0, 0)` restaura el scroll.
  3. **Fase de Apertura (Enter):** Las compuertas inician cerradas en `0%` y se deslizan hacia el exterior (`-100%` y `100%` en 0.42s con curva decelerada `[0.22, 1, 0.36, 1]`), revelando la nueva página cargada sin saltos ni destellos.




