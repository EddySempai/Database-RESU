# Reglas Permanentes del Proyecto — Resident Evil: Survival Unit (Database-RESU)

Estas reglas son **obligatorias y permanentes** para cualquier sesión del agente en este repositorio.

---

## 1. Regla de Oro: Mantenimiento Obligatorio del Second Brain (`docs/second-brain/*.md`)

Para **nunca perder el contexto del juego ni de la arquitectura de la web**, debes cumplir siempre este ciclo:

1. **Lectura antes de actuar:**
   - Antes de modificar mecánicas, héroes, Tier Lists, calculadoras, guías o noticias, consulta primero el índice maestro: `docs/second-brain/00_INDEX.md` y los archivos relevantes:
     - `docs/second-brain/01_GAME_CONTEXT_AND_MECHANICS.md` (Economía, Luminio, Joyas, Tesoros Míticos, Llaveros, Eventos).
     - `docs/second-brain/02_OPERATIVES_AND_TIERLIST_META.md` (Los 31+ operativos, roles, sinergias y estado actual de las Tier Lists PvP/PvE).
     - `docs/second-brain/03_SITE_ROUTES_AND_KEYWORDS.md` (Rutas internas y diccionario de palabras clave auto-enlazables).
     - `docs/second-brain/04_DATAMINE_AND_PATCH_WORKFLOW.md` (Historial de parches, datamine y rutas de assets `.webp`).

2. **Actualización o creación de `.md` en cada cambio o subida:**
   - **CADA VEZ** que se agregue, modifique o suba algo nuevo al proyecto (un nuevo parche, datamine, operativo, cambio en Tier List, llavero, calculadora, guía o sección web):
     - **Actualiza inmediatamente** el archivo `.md` correspondiente dentro de `docs/second-brain/`, **o crea un nuevo archivo `.md`** en `docs/second-brain/` (y regístralo en `docs/second-brain/00_INDEX.md`) si se trata de un sistema o módulo nuevo.
     - Si se añade un nuevo término clave, evento, guía, herramienta u operativo, **agrégalo también a `src/components/SmartText.tsx` y a `docs/second-brain/03_SITE_ROUTES_AND_KEYWORDS.md`** para que los Boletines/Newsletters (`/noticias/:id`) lo auto-enlacen automáticamente.

---

## 2. Regla de Despliegue y Sincronización Local

1. **Vista previa local antes de subir a Vercel (`git push`):**
   - No hagas `git push origin main` automáticamente salvo que el usuario lo pida de forma explícita después de revisar los cambios en local (`http://localhost:5173`).
2. **Sincronización entre directorios de trabajo:**
   - Mantén siempre sincronizados los cambios entre:
     - `C:\Users\Usuario\.gemini\antigravity\worktrees\re-survival-unit\convert-assets-web-format`
     - `C:\Users\Usuario\.gemini\antigravity\scratch\re-survival-unit`
