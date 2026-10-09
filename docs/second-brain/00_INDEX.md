# 🧠 RESUDB — Second Brain (Índice Maestro)

Este directorio funciona como la **Memoria Persistente (Second Brain)** del proyecto **Resident Evil: Survival Unit Wiki & Database Hub (`resudb.com`)**.
Su objetivo es que tanto el asistente de programación como la IA integrada (**Red Queen / Gemini**) puedan consultar rápidamente el contexto del juego, las rutas de la web y el historial de parches sin saturar la ventana de contexto.

---

## 📂 Estructura de Archivos del Second Brain

1. **[01_GAME_CONTEXT_AND_MECHANICS.md](./01_GAME_CONTEXT_AND_MECHANICS.md)**
   - Clases de tropa (*Defensor*, *Atacante*, *Ranger*), sistemas de crecimiento (*Llaveros*, *Tesoros Míticos*, *Joyas*, *Luminio*, *Armas Exclusivas*) y mecánicas de eventos (*Repeler a Mortem*, *Cumbre de Ases*, *Guerra de Hierbas*, *SvS*).
2. **[02_OPERATIVES_AND_TIERLIST_META.md](./02_OPERATIVES_AND_TIERLIST_META.md)**
   - Catálogo de los **31 Operativos** con sus IDs internos (`leon`, `bsaa-chris`, `sheva`, `cazadora`, etc.) y las Tier Lists vigentes para **PvP Arena** y **PvE Campaign** (*Early*, *Mid* y *Late Game*).
3. **[03_SITE_ROUTES_AND_KEYWORDS.md](./03_SITE_ROUTES_AND_KEYWORDS.md)**
   - Mapa de rutas de la aplicación y diccionario de **Palabras Clave Inteligentes** que se convierten automáticamente en enlaces interactivos dentro de los artículos y newsletters.
4. **[04_DATAMINE_AND_PATCH_WORKFLOW.md](./04_DATAMINE_AND_PATCH_WORKFLOW.md)**
   - Procedimiento de extracción de activos con `UnityPy` en `D:\Proyecto de juego` y registro de novedades extraídas por versión (ej. `v1.10.1`).
