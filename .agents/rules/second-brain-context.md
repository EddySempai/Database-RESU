---
trigger: always_on
description: Obliga al agente a leer y actualizar siempre los archivos .md del Second Brain (docs/second-brain/) cada vez que se modifique o suba contenido del juego o de la web.
---

# Regla Permanente: Mantenimiento Automático del Second Brain (`docs/second-brain/*.md`)

1. **Lectura de Contexto Rápida:**
   - Para mantener el contexto completo de *Resident Evil: Survival Unit* sin saturar la ventana de conversación, lee siempre `docs/second-brain/00_INDEX.md` y el archivo `.md` específico antes de editar datos del juego, operativos, Tier Lists, herramientas o noticias.

2. **Actualización Obligatoria en Cada Cambio o Subida:**
   - **Cada vez que se agregue, edite o suba cualquier cambio** (nuevos operativos, ajustes de Tier List PvP/PvE, nuevos llaveros, parches/datamine, calculadoras, guías o rutas):
     - **Actualiza el archivo `.md` correspondiente** en `docs/second-brain/` (`01_GAME_CONTEXT_AND_MECHANICS.md`, `02_OPERATIVES_AND_TIERLIST_META.md`, `03_SITE_ROUTES_AND_KEYWORDS.md`, `04_DATAMINE_AND_PATCH_WORKFLOW.md`).
     - Si el cambio introduce un tema o sistema nuevo, **crea un nuevo archivo `.md`** dentro de `docs/second-brain/` y enlázalo en `docs/second-brain/00_INDEX.md`.
     - Si hay nuevas palabras clave o páginas, actualízalas tanto en `docs/second-brain/03_SITE_ROUTES_AND_KEYWORDS.md` como en `src/components/SmartText.tsx` para que el auto-enlazado del Newsletter siga al día.
