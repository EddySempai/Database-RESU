# 🎮 Contexto del Juego, Sistemas y Eventos (Resident Evil: Survival Unit)

## 1. Tipos de Unidades y Clases de Héroes
En *Resident Evil: Survival Unit*, cada operativo comanda un tipo específico de tropa:
- **Defensor (Infantería / Escudo):** Vanguardia encargada de absorber el daño frontal. Icono: `UI_Hero_Infantry.webp`.
- **Atacante (Armamento Pesado):** Daño sostenido y de área desde la línea media/trasera. Icono: `UI_Hero_Heavy.webp`.
- **Ranger (Rifle / Francotirador):** Letalidad explosiva a objetivo único y control desde la retaguardia. Icono: `UI_Hero_Rifle.webp`.

## 2. Sistemas de Progresión y Optimización
- **Llaveros (`/llaveros`):** Accesorios tácticos del *Maletín Attaché* divididos por rareza (*Común*, *Poco Común*, *Raro*, *Épico*, *Legendario*).
  - **Potenciador en Posesión (Estadística Principal):** Exclusivo de rarezas **Épica** y **Legendaria** (`KeyRingMainBuffSetSheet`). Aplica pasivamente desde el inventario sin necesidad de equiparlo (no se acumulan duplicados del mismo modelo).
  - **Fórmula de Porcentajes Mín–Máx (`v1.10.1`):** Cada estadística suma dos tablas de `BuffLevelKindSheet`:
    1. `CreationBuffkind` (termina en `1`): **5 candidatos iniciales** al fabricar/obtener el llavero, cada uno con **20% de probabilidad exacta** (`KeyRingCreationProbSheet`: `[20, 20, 20, 20, 20]`).
    2. `Buffkind` (termina en `2`): **Crecimiento fijo por nivel** hasta el Nivel Máximo actual (**Nv. 30**).
    - *Rangos Máx Nv. 30 principales (Legendario / Épico):* Combate y Vel. Despliegue (`+3.90%–4.30%` Leg / `+3.27%–3.62%` Épico); Construcción e Investigación (`+4.68%–5.16%` Leg / `+4.04%–4.46%` Épico); Entrenamiento (`+5.85%–6.45%` Leg / `+4.90%–5.43%` Épico); Recolección General (`+6.24%–6.88%` Leg / `+5.29%–5.85%` Épico); Hospital, Caza de Criaturas y Recolección Específica (`+7.80%–8.60%` Leg / `+6.54%–7.24%` Épico); Tropas por sesión (`+42–46` Leg / `+39–42` Épico).
  - **Progresión de EXP a Nivel 30:**
    - Nivel 1 a 10: `6,480 EXP acumulada`.
    - Nivel 11 a 20: `43,600 EXP acumulada` (`+37,120 EXP`).
    - Nivel 21 a 30: `193,790 EXP acumulada` (`+150,190 EXP`).
    - *Calculadora Táctica de EXP:* Hub interactivo con selector numérico táctico de nivel actual y deseado (`[ Nv. Actual ] ──► [ Nv. Deseado ]`), controles paso a paso `[-]` / `[+]`, accesos directos de hitos (Nv.10, 20, 30), barra de progreso hacia Nv.30 e ilustración de cabecera con el elenco de llaveros subiendo de nivel, flechas verdes tácticas y retroiluminación roja ambiental (`keyrings_upgrade_showcase.png`).
  - **Poder de Combate (CP) por Rareza y Hito:**
    - *Común:* Nv.10 = `18,660` | Nv.20 = `27,660` | Nv.30 = `36,660 CP` (1 ranura).
    - *Poco Común (Advanced):* Nv.10 = `44,760` | Nv.20 = `65,160` | Nv.30 = `85,560 CP` (2 ranuras).
    - *Raro:* Nv.10 = `63,900` | Nv.20 = `93,900` | Nv.30 = `123,900 CP` (2 a 3 ranuras).
    - *Épico:* Nv.10 = `107,370` | Nv.20 = `160,170` | Nv.30 = `212,970 CP` (3 a 4 ranuras).
    - *Legendario:* Nv.10 = `128,220` | Nv.20 = `191,820` | Nv.30 = `255,420 CP` (3 a 4 ranuras).
  - **Catálogo de 96 Sub-Estadísticas Equipables:** 96 sub-stats por rareza (480 registros totales en `KeyringEquippedBuffs`) divididos en categorías: *Concentración (Rally)*, *Ataque a Base*, *Defensa de Base*, *Guerra de Hierbas (In Search of Herbs)*, *Lab. de Vacunas (Vaccine Lab)* y *Saint Vale*. Cada sub-stat tiene probabilidad de aparición fija (*Appearance Chance*, ej. `0.82%` o `0.99%`) y 5 candidatos iniciales y finales (con 20% de probabilidad cada uno).
  - **Soporte Internacional 100% (i18n ES/EN/JA):** Toda la sección `/llaveros` (catálogo, filtros, tooltips, calculadora de EXP interactiva, tabla de CP, hitos de evolución y sub-stats con copiado dinámico) cuenta con localización completa y reactiva en Español, Inglés y Japonés.
  - **Despertar de Operativos (Hero Files):** Reclutar (10 archivos), 1★ (2), 2★ (5), 3★ (15), 4★ (40), 5★ (100) y 6★ Maxed (1,075 archivos acumulados).
  - **Nota de Bug Visual (`v1.10.1`):** El popup in-game *"Candidatos de Potenciadores en posesión"* muestra valores inflados (ej. `+12,13%` a `+12,53%`) por sumar erróneamente sub-stats al tooltip.
- **Tesoros Míticos (`/herramientas`):** Artefactos que se mejoran usando *Fragmentos Dorados (Gold Frag)*, *Polish*, *Blueprints* y *Advance Polish*. Calibrados oficialmente hasta *Mythic ++++ T4* (`180,000` Gold Frag, `1,950` Polish, `325` Blueprints, `40` Advance Polish).
- **Joyas y Gemas (`/herramientas`):** Se refinan hasta rango `Mythic++++` utilizando *Joyas en Bruto (Rough Jewel)*, *Herramientas de Tallado (Jewel Tool)* y *Herramientas Avanzadas (Advance Tool)*. Calibrados oficialmente: *Legend++* (`420`), *Legend+++* (`560`), *Mythic* y *Mythic+* (`580`), *Mythic++* y *Mythic+++* (`600`) y *Mythic++++* (`650` Rough Jewels).
- **Mansión y Edificios de Prestigio P1–P10 (`/herramientas` & `/guias/mansion-nivel-1-a-30`):** Al alcanzar el Nivel 30 Base (`Nv. 30`), los edificios del asentamiento (*Mansion*, *Lumi Lab*, los 3 *Training* de tropas: *Infantería*, *Atacantes*, *Rangers*, *Alliance*, *Helipad / Centro de Héroes*, *Command*, *Hospital*) ascienden por niveles de Luminio (`Lumi Level 1` a `Lumi Level 10` / `P1`–`P10`) divididos en 5 sub-etapas cada uno. Para ascender la Mansión a cada rango, el juego exige obligatoriamente **2 edificios previos**: el primero es invariablemente el **Centro de la Alianza (Alliance Center)** en `Lv.(N-1)`, y el segundo es un edificio rotativo que alterna los 3 edificios de tropas (tras el Laboratorio inicial):
  - `P1`: Centro de Alianza Nv.30 + Laboratorio de Investigación (Lumi Lab) Nv.30
  - `P2`: Centro de Alianza P1 + Campo de Tiro (Rangers / Shooting Range) P1
  - `P3`: Centro de Alianza P2 + Cuartel de Infantería (Barracks) P2
  - `P4`: Centro de Alianza P3 + Taller Pesado (Garage / Atacantes) P3
  - `P5`: Centro de Alianza P4 + Campo de Tiro (Rangers) P4
  - `P6`: Centro de Alianza P5 + Cuartel de Infantería (Barracks) P5
  - `P7`: Centro de Alianza P6 + Taller Pesado (Garage) P6
  - `P8`: Centro de Alianza P7 + Campo de Tiro (Rangers) P7
  - `P9`: Centro de Alianza P8 + Cuartel de Infantería (Barracks) P8
  - `P10`: Centro de Alianza P9 + Taller Pesado (Garage) P9
  *(Además, el Centro de Mando / Command Center exige Mansión Lv.N + Centro de Alianza Lv.N).*
  - **Materiales Comunes y Tiempos Base:** Además de Luminio y Composite, cada nivel P1–P10 consume millones de recursos comunes (Comida, Madera, Hierro, Petróleo) y cientos de horas base de construcción sin aceleradores. La calculadora en `/herramientas` suma automáticamente estos recursos en tiempo real tanto a nivel global como por fase y por paso.
  - **Lógica de Requisitos Previos:** Al seleccionar un nivel actual N (ej. P3), los edificios sin nivel personalizado asumen por defecto el nivel base `N - 1` (ej. P2), evitando que la hoja de ruta pida de forma redundante pasos ya completados de prestigios inferiores (como P1 o P2).
  - **Guía Dedicada 1 a 30 (`/guias/mansion-nivel-1-a-30`):** Dossier táctico completo con tabla interactiva filtrable por rangos (1-10, 11-20, 21-30), buscador por requisitos, poder de combate (CP) ganado y enlace directo a la calculadora.
- **Investigación de Luminio (`/herramientas`):** Árbol tecnológico de 3 ramas (Atacante, Defensor, Ranger) que consume *Polvo de Luminio (Luminium Powder)* y *Piedras de Luminio (Lumi Stones)*. Los niveles de investigación se desbloquean según el nivel del *Laboratorio de Luminio (Lumi Lab)* (que a su vez requiere Mansión). Total de investigación por rama: 27,314 de Polvo (x3 ramas = 81,942 Polvo) y 21,010 Piedras (x3 ramas = 63,032 Piedras, ratio exacto `Polvo / 1.3`).
- **Equipamiento y Armas Exclusivas (`/heroes/:id`):** Cada operativo equipa 4 piezas (*Arma Grande*, *Pistola*, *Revólver*, *Cuchillo*) más un **Arma Exclusiva** (nivel 0 a 10) para operativos Legendarios que desbloquea habilidades únicas. Subir equipo de +1 a +20 consume un total de 2,100 partes de mejora y 55 armas legendarias (+11 a +20). Subir un arma exclusiva de +1 a +10 consume 275 fragmentos/núcleos.
- **Centro de Conversores Tácticos (`/conversores`):** Hub especializado de conversión y gestión de inventario:
  - **Tienda de Intercambio de Tesoros (*Treasure Exchange*):** Ratios oficiales con cupos semanales (*Weekly Cap*):
    - `10 Planos (Blueprints)` ➔ `1 Pulidor Avanzado (Advance Polish)` (Límite: 500/sem)
    - `1 Plano` ➔ `3 Pulidores (Polish)` (Límite: 500/sem)
    - `1 Plano` ➔ `300 Fragmentos Dorados (Gold Frags)` (Límite: 500/sem)
    - `10 Pulidores` ➔ `1 Plano` (Límite: 50/sem)
    - `1 Pulidor` ➔ `50 Fragmentos Dorados` (Límite: 1,000/sem)
    - `1,000 Fragmentos Dorados` ➔ `1 Plano` (Límite: 50/sem)
    - `200 Fragmentos Dorados` ➔ `1 Pulidor` (Límite: 500/sem)
    - Calculadora bidireccional que proyecta el número exacto de reseteos semanales (lunes 00:00 UTC) necesarios si se excede el cupo.
  - **Calculadora de Aceleradores (*Speedup Converter*):** Desglose y suma de aceleradores en 10 denominaciones (1m a 3d) en 5 categorías (Universal, Construcción, Investigación, Tropa, Hospital), cálculo en días/horas/minutos, puntos estimados para Cumbre de Ases (~30 pts/min) y comprobador inverso de tiempo para proyectos.
  - **Mochila de Recursos Seguros (*Safe Resource Packs*):** Cuantificador de cajas de inventario (1K, 10K, 50K, 150K, 500K, 1.5M, 5M) para Comida, Madera, Hierro, Petróleo y Maletines de Selección. Blindaje táctico: los recursos en mochila son inmunes a saqueos enemigos en ataques a la base.
  - **Conversor de Luminio (*Luminio Powder ⇄ Stones*):** Conversión bidireccional con ratio exacto 1.3 (`Piedras = Polvo / 1.3` | `Polvo = Piedras * 1.3`).

## 3. Eventos Principales del Juego
- **Repeler a Mortem (`/guias/repeler-a-mortem`):** Jefe mundial de alianza con 3 formas evolutivas. Día 1-2: misiones de radar (Huellas de Mortem). Combate: Fase de Escudo (solo se rompe con Rallies/Concentraciones) y Fase de Aturdimiento/Stun (ventana para ataques individuales rápidos).
- **Cumbre de Ases / Ace Summit (`/guias/cumbre-de-ases`):** Evento competitivo por fases diarias donde se puntúa entrenando tropas, usando aceleradores, recolectando recursos y mejorando equipo.
- **Guerra de Hierbas (`/guias/guerra-de-hierbas`):** Evento PvP/Alianza de control de zonas y recolección táctica de hierbas (Verdes, Rojas, Amarillas).
- **Bingo de Temporada & Recarga de Temporada (`v1.10.1`):** Tableros de recompensas progresivas por temporada (Season 01 y Season 02) y bonificaciones de recarga.
- **Eventos Hot Time (`v1.10.1`):** Ventanas de bonificación global para *Construcción*, *Investigación* y *Entrenamiento de Tropas*.
