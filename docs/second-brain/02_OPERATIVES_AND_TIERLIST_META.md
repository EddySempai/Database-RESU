# 🦸 Operativos y Meta de Tier List (PvP & PvE)

## 1. Lista de los 31 Operativos (`src/data/operativos.json`)
| ID (`id`) | Nombre Completo | Ruta de Ficha |
| :--- | :--- | :--- |
| `leon` | Leon S. Kennedy | `/heroes/leon` |
| `claire` | Claire Redfield | `/heroes/claire` |
| `jill` | Jill Valentine | `/heroes/jill` |
| `carlos` | Carlos Oliveira | `/heroes/carlos` |
| `ada` | Ada Wong | `/heroes/ada` |
| `mikhail` | Mikhail Victor | `/heroes/mikhail` |
| `marvin` | Marvin Branagh | `/heroes/marvin` |
| `becca` | Becca Woolett | `/heroes/becca` |
| `tyrone` | Tyrone Henry | `/heroes/tyrone` |
| `murphy` | Murphy Seeker | `/heroes/murphy` |
| `alyssa` | Alyssa Ashcroft | `/heroes/alyssa` |
| `katherine` | Katherine Warren | `/heroes/katherine` |
| `mark` | Mark Wilkins | `/heroes/mark` |
| `barry` | Barry Burton | `/heroes/barry` |
| `tyrell` | Tyrell Patrick | `/heroes/tyrell` |
| `robert` | Robert Kendo | `/heroes/robert` |
| `brad` | Brad Vickers | `/heroes/brad` |
| `chris` | Chris Redfield (S.T.A.R.S.) | `/heroes/chris` |
| `rebecca` | Rebecca Chambers | `/heroes/rebecca` |
| `billy` | Billy Coen | `/heroes/billy` |
| `ashley` | Ashley Graham | `/heroes/ashley` |
| `luis` | Luis Serra Navarro | `/heroes/luis` |
| `jack` | Jack Krauser | `/heroes/jack` |
| `jake` | Jake Muller | `/heroes/jake` |
| `sherry` | Sherry Birkin | `/heroes/sherry` |
| `piers` | Piers Nivans | `/heroes/piers` |
| `cazador` | Cazador (Rathalos) | `/heroes/cazador` |
| `cazadora` | Cazadora (Rathalos) | `/heroes/cazadora` |
| `bsaa-chris` | BSAA Chris Redfield | `/heroes/bsaa-chris` |
| `sheva` | Sheva Alomar | `/heroes/sheva` |
| `excella` | Excella Gionne | `/heroes/excella` |

---

## 2. Resumen del Meta (`src/data/tierlistData.ts`)
- **PvP Early Game:** Dominan `sheva`, `barry`, `mark`, `bsaa-chris` (Tier S).
- **PvP Mid Game:** Tier SS compuesto por `leon`, `jake`, `piers`, `bsaa-chris`, `sheva`, `excella`.
- **PvP Late Game:** Tier SS compuesto por `jack`, `bsaa-chris`, `leon`, `ashley`, `excella`, `sheva`, `chris`.
- **PvE Mid Game:** Tier SS compuesto por `carlos`, `piers`, `luis`, `ashley`, `sheva`, `rebecca`.
- **PvE Late Game:** Tier SS compuesto por `carlos`, `piers`, `sheva`, `leon`, `ashley`, `rebecca`, `luis`, `excella`.

---

## 3. Localización e Internacionalización (`i18n` Trilingüe: ES, EN, JA)
- **Archivos Fuente:**
  - Español (Base): `src/data/operativos.json`
  - Inglés: `src/locales/en/operativos.json`
  - Japonés: `src/locales/ja/operativos.json`
  - Diccionarios generales: `src/locales/{es,en,ja}/translation.json`
- **Hook `useOperativos` (`src/hooks/useOperativos.ts`):**
  - Fusiona dinámicamente según el idioma activo (`i18n.language`):
    - `name`, `unitType`, `rarity`
    - `fieldStats` con mapeo automático de etiquetas canónicas:
      - Defender ATK/DEF Power ⇄ ディフェンダー攻撃力/防御力 ⇄ Poder de ataque/defensa de Defensor
      - Attacker ATK/DEF Power ⇄ アタッカー攻撃力/防御力 ⇄ Poder de ataque/defensa de Atacante
      - Ranger ATK/DEF Power ⇄ レンジャー攻撃力/防御力 ⇄ Poder de ataque/defensa de Ranger
    - `skills`: Nombre, descripción, tipo e iconos combinados sin perder metadatos (`isArmaEspecial`, `isVipSkill`).
- **Páginas Clave:**
  - Catálogo: `src/pages/Operativos.tsx` (rutas `/operativos` y `/heroes`) con filtros por IDs normalizados (`ALL`, `DEFENDER`, etc.) para preservar estado al cambiar de idioma.
  - Ficha: `src/pages/OperativoDetalle.tsx` (rutas `/heroes/:id`) con breadcrumbs, botones de voz y tabs accesibles y traducidos.
  - Calculadora de Equipamiento: src/components/EquipamientoView.tsx integrada en /heroes/:id.
    - Soporte completo para Tier +1 a +20. A partir de Tier 10+ (+11 a +20) cada nivel adicional requiere 1 Arma Legendaria a elección (ítem oficial: Item_Custom_Box_Equipment_02.webp - *Maletín de Arma Legendaria a Elección*).
    - HUD superior de 4 tarjetas con marcas de agua tácticas (sin cajas frontales para máxima legibilidad sin truncamiento de texto): EXP Total, Componentes (+), Armas Legendarias 10+ y Fragmentos de Exclusiva.
    - Desglose por Arma inferior con diseño monocromático dorado/ámbar (Champagne para Exclusiva, Oro fundido para Tier 10+, Ámbar para Penetración y Bronce antiguo para Vida), biseles tácticos, marcas de agua expandidas y adaptabilidad móvil responsive.
