export type NewsCategory = 'patch' | 'meta' | 'tools' | 'guides';
export type SupportedLang = 'es' | 'en' | 'ja';

export interface NewsSectionBlock {
  title: Record<SupportedLang, string>;
  description?: Record<SupportedLang, string>;
  image?: string;
  imageCaption?: Record<SupportedLang, string>;
  items: Record<SupportedLang, string[]>;
}

export type EditorBlockType = 'heading' | 'paragraph' | 'image' | 'callout' | 'list';

export interface NewsletterCustomBlock {
  id: string;
  type: EditorBlockType;
  title?: Record<SupportedLang, string>;
  content?: Record<SupportedLang, string>;
  imageUrl?: string;
  caption?: Record<SupportedLang, string>;
  items?: Record<SupportedLang, string[]>;
  calloutStyle?: 'info' | 'warning' | 'tip';
}

export interface NewsArticle {
  id: string;
  date: string;
  readTime?: string;
  author?: string;
  version?: string;
  category: NewsCategory;
  tag: Record<SupportedLang, string>;
  badgeColor: string;
  title: Record<SupportedLang, string>;
  excerpt: Record<SupportedLang, string>;
  intro?: Record<SupportedLang, string>;
  image?: string;
  gallery?: {
    src: string;
    caption: Record<SupportedLang, string>;
  }[];
  isFeatured?: boolean;
  actionLink?: {
    href: string;
    label: Record<SupportedLang, string>;
  };
  highlights: Record<SupportedLang, string[]>;
  sections: NewsSectionBlock[];
  customBlocks?: NewsletterCustomBlock[];
}

export const NEWS_DATA: NewsArticle[] = [
  {
    id: 'gran-actualizacion-3-fases-wiki',
    date: '09 OCT 2026',
    readTime: '6 min',
    author: 'Red Queen Intelligence',
    version: 'v1.10.1',
    category: 'tools',
    tag: {
      es: 'MEGA-ACTUALIZACIÓN & 3 FASES',
      en: 'MAJOR EXPANSION & 3 PHASES',
      ja: '超大型アップデート＆3大フェーズ'
    },
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    title: {
      es: 'Gran Despliegue de la Base de Datos: Las 3 Fases Tácticas (Mansión P1–P10, Conversores y Llaveros)',
      en: 'Major Database Expansion: The 3 Tactical Phases (Mansion P1–P10, Converters & Keyrings)',
      ja: '大型データベース配備：3大戦術フェーズの完全実装（邸宅P1〜P10、換算機、キーリング）'
    },
    excerpt: {
      es: 'Completada la integración de las 3 Fases del plan táctico: Fase 1 con calibración milimétrica de Calculadoras (Mansión P1–P10 con recursos comunes y tiempos base, Investigación de Luminio, Tesoros y Joyas Míticas), Fase 2 con el Centro de Conversores Tácticos (/conversores: Intercambio de Tesoros semanal, Optimizador de Aceleradores, Mochila Segura anti-saqueo), y Fase 3 con la enciclopedia interactiva de Llaveros (/llaveros: 42 modelos, 193,790 EXP a Nv.30, 255K CP y 96 sub-stats).',
      en: 'Full deployment concluded across all 3 Tactical Phases: Phase 1 brings calibrated Calculators (Mansion P1–P10 with common resources and build times, Luminio Research, Mythic Treasures & Jewels), Phase 2 introduces the Tactical Converters Hub (/conversores: Weekly Treasure Exchange, Speedup Optimizer, Safe Backpack anti-raid protection), and Phase 3 launches the Keyrings encyclopedia (/llaveros: 42 models, 193,790 EXP to Lv. 30, 255K CP & 96 sub-stats).',
      ja: '戦術計画の3大フェーズを完全実装：フェーズ1の高精度計算機群（邸宅P1〜P10の基本資材・所要時間、ルミニオ研究、神話秘宝＆宝石）、フェーズ2の新設・戦術換算ハブ（/conversores：週間秘宝交換、加速アイテム最適化、略奪保護セーフバックパック）、フェーズ3のキーリング大百科（/llaveros：全42種、Lv.30累計193,790 EXP、最大255K CP、96種サブステ）。'
    },
    intro: {
      es: 'Durante las últimas jornadas hemos ejecutado una reestructuración y calibración sin precedentes en toda la suite de herramientas y base de datos de Resident Evil: Survival Unit. Para responder a las exigencias estratégicas de los comandantes, desglosamos aquí en detalle las 3 Fases completadas que transforman la planificación de tu base, optimizan la conversión de tus recursos y dominan el equipamiento supremo del Maletín Attaché.',
      en: 'Over recent cycles, we executed an unprecedented overhaul and calibration across the entire database suite for Resident Evil: Survival Unit. To empower commanders with peak strategic planning, this comprehensive dispatch details all 3 completed phases, revamping base progression, resource conversion economics, and Attaché Case gear mastery.',
      ja: 'ここ数週間にわたり、『バイオハザード サバイバルユニット』のデータベースツール群に対して全面改修と精密較正を実施しました。指揮官の皆様の高度な戦術的要求に応えるべく、基地発展計画、資材換算経済、アタッシェケース装備の運用を一変させる完了済みの「3大フェーズ」の全容をここに公開します。'
    },
    image: '/llaveros/keyrings_upgrade_showcase.webp',
    gallery: [
      {
        src: '/llaveros/keyrings_upgrade_showcase.png',
        caption: {
          es: 'Fase 3: Calculadora táctica de EXP para subir Llaveros de Nivel 1 a 30 en /llaveros',
          en: 'Phase 3: Tactical Keyring EXP Calculator (Level 1 to 30) in /llaveros',
          ja: 'フェーズ3：/llaveros のキーリングLv.1〜30戦術EXP計算機'
        }
      },
      {
        src: '/noticias/Banner_Hottime_Troop_Main.webp',
        caption: {
          es: 'Fase 2: Centro de Conversores Tácticos, Aceleradores y Mochila Segura en /conversores',
          en: 'Phase 2: Tactical Converters Hub, Speedups & Safe Backpack in /conversores',
          ja: 'フェーズ2：/conversores の戦術換算ハブ、加速計算機、セーフバックパック'
        }
      },
      {
        src: '/noticias/Event_BingoSeason01_bg_C.webp',
        caption: {
          es: 'Fase 1: Calibración de Mansión P1–P10 y Guía Completa de Nivel 1 a 30 en /guias/mansion-nivel-1-a-30',
          en: 'Phase 1: Mansion P1–P10 Calibration and Comprehensive Lv. 1 to 30 Guide at /guias/mansion-nivel-1-a-30',
          ja: 'フェーズ1：邸宅P1〜P10較正および /guias/mansion-nivel-1-a-30 のLv.1〜30完全攻略ガイド'
        }
      }
    ],
    isFeatured: true,
    actionLink: {
      href: '/llaveros',
      label: {
        es: 'Explorar Sistema de Llaveros',
        en: 'Explore Keyrings System',
        ja: 'キーリングシステムを開く'
      }
    },
    highlights: {
      es: [
        'Fase 1: Mansión P1–P10 con recursos comunes (Comida, Madera, Hierro, Petróleo), tiempos de construcción base y Guía interactiva de Nivel 1 a 30 en /guias/mansion-nivel-1-a-30.',
        'Fase 1: Calibración oficial de Árbol de Luminio (ratio exacto 1.3 Polvo/Piedras), Tesoros Míticos (Mythic++++ calibrado) y Joyas Míticas (costos de gemas en bruto).',
        'Fase 2: Lanzamiento del Centro de Conversores Tácticos (/conversores) con Tienda de Intercambio de Tesoros (cupo semanal), Mochila de Recursos Seguros y Optimizador de Aceleradores.',
        'Fase 2: Estimador de puntos para Cumbre de Ases (~30 pts/min) y comprobador inverso de aceleración para construcciones e investigaciones.',
        'Fase 3: Base de Datos de Llaveros (/llaveros) con 42 modelos extraídos, calculadora de EXP Nivel 1 a 30 (193,790 EXP acumulada) y tabla de Poder de Combate hasta 255,420 CP.',
        'Fase 3: Catálogo interactivo de 96 Sub-Estadísticas con desglose del 20% para los 5 candidatos iniciales/finales y descarga oficial del Excel de 30 niveles.',
        '100% Internacionalización (i18n): Todas las calculadoras, conversores, fichas técnicas y compuertas de seguridad Umbrella verificadas en Español, Inglés y Japonés.'
      ],
      en: [
        'Phase 1: Mansion P1–P10 with common resources (Food, Wood, Iron, Oil), base build times, and comprehensive Lv. 1 to 30 Guide at /guias/mansion-nivel-1-a-30.',
        'Phase 1: Official calibration of Luminio Tree (exact 1.3 Powder/Stone ratio), Mythic Treasures (Mythic++++ benchmarks), and Mythic Jewels (rough gem costs).',
        'Phase 2: Launch of the Tactical Converters Hub (/conversores) featuring Treasure Exchange (weekly cap tracker), Safe Resource Backpack, and Speedup Optimizer.',
        'Phase 2: Ace Commander point scoring estimator (~30 pts/min) and reverse project speedup verifier for construction & research.',
        'Phase 3: Keyrings Database (/llaveros) with 42 extracted models, Level 1 to 30 EXP Calculator (193,790 cumulative EXP), and Combat Power table up to 255,420 CP.',
        'Phase 3: Interactive 96 Sub-Stats catalog breaking down 20% chances across 5 roll candidates, plus official 30-level Excel spreadsheet download.',
        '100% Internationalization (i18n): All calculators, converters, milestone dossiers, and Umbrella blast door transitions verified in Spanish, English, and Japanese.'
      ],
      ja: [
        'フェーズ1：邸宅P1〜P10の基本資材（食糧、木材、鉄、石油）、基礎所要時間、および /guias/mansion-nivel-1-a-30 のLv.1〜30完全攻略ガイド。',
        'フェーズ1：ルミニオ研究樹（粉末/原石 比率1.3）、神話秘宝（Mythic++++実測値）、神話宝石（原石コスト）の公式データ較正。',
        'フェーズ2：戦術換算ハブ（/conversores）の開設（週間秘宝交換上限チェック、略奪保護セーフバックパック、加速最適化ツール）。',
        'フェーズ2：エース司令官イベントの獲得ポイント試算（約30 pt/分）および建設・研究の逆算所要時間チェッカー。',
        'フェーズ3：キーリング完全DB（/llaveros）の公開（全42モデル、Lv.1〜30累計193,790 EXP計算機、最大255,420 CP表）。',
        'フェーズ3：各20%の5候補抽選を網羅した96種サブステータスカタログ、および公式30レベルExcel直接ダウンロード。',
        '100%多言語対応（i18n）：全計算ツール、換算機、詳細解説、アンブレラ防壁ドア演出が日本語・英語・スペイン語で完全動作。'
      ]
    },
    sections: [
      {
        title: {
          es: '1. Fase 1: Calibración Milimétrica de Calculadoras (Mansión P1–P10, Luminio, Tesoros y Joyas)',
          en: '1. Phase 1: Millimetric Calculator Calibration (Mansion P1–P10, Luminio, Treasures & Jewels)',
          ja: '1. フェーズ1：高精度計算機群の較正（邸宅P1〜P10、ルミニオ、秘宝、宝石）'
        },
        description: {
          es: 'Eliminamos cualquier placeholder o estimación en las herramientas actuales, calibrando los valores con datos 100% verificados del juego:',
          en: 'We eliminated all placeholders and estimates from existing tools, recalibrating values with 100% verified in-game mechanics:',
          ja: '既存ツール内のプレースホルダーや推測値を全廃し、100%検証済みのゲーム内数値で再較正しました：'
        },
        image: '/noticias/Event_BingoSeason01_bg_C.webp',
        imageCaption: {
          es: 'Calibración de Mansión P1–P10 y Guía Nivel 1 a 30 en /herramientas',
          en: 'Mansion P1–P10 calibration and Lv. 1 to 30 Guide in /herramientas',
          ja: '/herramientas の邸宅P1〜P10較正およびLv.1〜30ガイド'
        },
        items: {
          es: [
            'Mansión P1–P10 con Recursos Comunes y Tiempos Base: La calculadora de Mansión en /herramientas ahora suma en tiempo real Comida, Madera, Hierro, Petróleo y Tiempo Base de Construcción en cada paso y fase.',
            'Corrección del Algoritmo de Requisitos: Al calcular Mansión Nivel N (ej. P3 a P4), los requisitos asumen por defecto el nivel anterior (P3), mostrando únicamente los edificios faltantes (Centro de Alianza y Taller Pesado) sin arrastrar pasos innecesarios de P1 o P2.',
            'Guía Completa de Mansión Nivel 1 a 30: Publicada la guía táctica en /guias/mansion-nivel-1-a-30 con buscador interactivo, filtros por rango (1-10, 11-20, 21-30) y tabla comparativa de Poder de Combate.',
            'Árbol de Investigación de Luminio: Sustituidos valores preliminares por las curvas oficiales (Recuperación 102-1500, Tratamiento 51-765, Entrenamiento 102-1500) y cálculo en vivo de Piedras con el ratio exacto (Polvo / 1.3).',
            'Tesoros Míticos y Joyas Míticas: Calibración de rarezas superiores (Mythic+++ y Mythic++++) y costos reales de gemas en bruto (hasta 650 Rough Jewels en Mythic++++).'
          ],
          en: [
            'Mansion P1–P10 with Common Resources & Base Build Times: The Mansion Calculator at /herramientas now tracks Food, Wood, Iron, Oil, and Base Construction Time live across all phases.',
            'Dependency Algorithm Rectification: Upgrading to Mansion Level N (e.g. P3 to P4) correctly defaults missing buildings to Level N-1 (P3), displaying only immediate requirements (Alliance Center & Heavy Workshop) without dragging unnecessary legacy steps.',
            'Comprehensive Mansion Level 1 to 30 Guide: Published the complete tactical dossier at /guias/mansion-nivel-1-a-30 featuring interactive search, milestone filters (1-10, 11-20, 21-30), and Combat Power charts.',
            'Luminio Research Tree: Replaced preliminary numbers with verified curves (Recovery 102-1500, Treatment 51-765, Training 102-1500) and live Stone conversion using the exact 1.3 ratio (Powder / 1.3).',
            'Mythic Treasures & Mythic Jewels: Recalibrated top-tier milestones (Mythic+++ and Mythic++++) alongside authentic rough gem costs (up to 650 Rough Jewels for Mythic++++).'
          ],
          ja: [
            '邸宅P1〜P10の基本資材＆基礎所要時間：/herramientas の邸宅計算機が、食糧・木材・鉄・石油および基礎建設時間を全フェーズでリアルタイム算出。',
            '前提条件アルゴリズムの是正：邸宅Lv.N（例：P3→P4）への強化時、未指定施設は前レベル（P3）を自動適用し、必須となる同盟センターや重機工場のみを正確に抽出。',
            '邸宅Lv.1〜30完全攻略ガイド：/guias/mansion-nivel-1-a-30 にリアルタイム検索、ランクフィルター（1-10、11-20、21-30）、戦力（CP）一覧表を備えた特設ガイドを公開。',
            'ルミニオ研究樹の精密化：回収（102-1500）、治療（51-765）、訓練（102-1500）の公式成長曲線を反映し、比率1.3（粉末/1.3）による原石リアルタイム換算を実装。',
            '神話秘宝＆神話宝石：上位ランク（Mythic+++、Mythic++++）の正確な数値と、Mythic++++に必要な最大650個の原石コストを精密較正。'
          ]
        }
      },
      {
        title: {
          es: '2. Fase 2: Nuevo Centro de Conversores Tácticos (/conversores)',
          en: '2. Phase 2: New Tactical Converters Hub (/conversores)',
          ja: '2. フェーズ2：新設・戦術換算ハブ（/conversores）'
        },
        description: {
          es: 'Creamos una suite integral de conversores tácticos para optimizar tus decisiones de inventario y compras semanales:',
          en: 'We established an all-in-one tactical conversion suite to optimize inventory decisions and weekly shop investments:',
          ja: 'インベントリ管理や週間ショップ購入の意思決定を最適化するため、包括的な戦術換算ハブを開設しました：'
        },
        image: '/noticias/Banner_Hottime_Troop_Main.webp',
        imageCaption: {
          es: 'Suite de Conversores Tácticos, Intercambio de Tesoros y Aceleradores en /conversores',
          en: 'Tactical Converters Suite, Treasure Exchange & Speedups at /conversores',
          ja: '/conversores の戦術換算ハブ、秘宝交換、加速最適化'
        },
        items: {
          es: [
            'Tienda de Intercambio de Tesoros Míticos: Conversión bidireccional ("Tengo" vs "Necesito") con ratios oficiales (Cheat Sheet R23-R30), comprobador de cupo semanal (Weekly Cap), semanas de reseteo requeridas y evaluación de eficiencia Red Queen.',
            'Calculadora y Optimizador de Aceleradores: Cuantificación en 10 denominaciones (1m a 3d) y 5 categorías (Construcción, Investigación, Entrenamiento, Curación, Universal), cálculo en Días/Horas/Minutos y estimador de puntos para el evento Cumbre de Ases (~30 pts/min).',
            'Comprobador Inverso de Aceleradores: Ingresa los días y horas de un proyecto pendiente para verificar al instante si tus reservas de aceleradores cubren la totalidad de la obra.',
            'Mochila de Recursos Seguros (Safe Resource Packs): Cuantificador de cajas cerradas (1K a 5M) para Comida, Madera, Hierro, Petróleo y Maletines de Selección, comparativa con Mansión P1–P10 y alerta de blindaje anti-saqueos (recursos protegidos de incursiones enemigas hasta el momento de construir).',
            'Conversor de Luminio: Conversor bidireccional instantáneo entre Polvo de Luminio y Piedras de Luminio (ratio exacto 1.3).',
            'Acceso a Equipamiento y Armas Exclusivas (+1 a +20): Integrada tarjeta de acceso directo a la calculadora de equipo exclusivo de operativos.'
          ],
          en: [
            'Mythic Treasure Exchange Shop: Bidirectional conversion ("I Have" vs "I Need") using official cheat sheet ratios, weekly cap tracker, reset weeks counter, and Red Queen efficiency ratings.',
            'Speedup Calculator & Optimizer: Breakdown across 10 denominations (1m to 3d) and 5 categories (Building, Research, Training, Healing, Universal), total Days/Hours/Minutes calculation, and Ace Commander event scoring estimation (~30 pts/min).',
            'Reverse Speedup Verifier: Enter the remaining days and hours of any project to immediately check whether your speedup stockpile covers the entire upgrade.',
            'Safe Resource Backpack (Packs): Quantifies sealed resource boxes (1K to 5M) for Food, Wood, Iron, Oil, and Selection Chests, compares reserves against Mansion P1–P10 costs, and provides anti-raid shielding advisories (resources remain completely safe from enemy scouts until opened).',
            'Luminio Converter: Instant bidirectional calculation between Luminio Powder and Luminio Stones (exact 1.3 ratio).',
            'Hero Exclusive Gear & Weapons (+1 to +20): Direct link and preview card for operative exclusive gear progression.'
          ],
          ja: [
            '神話秘宝交換ショップ：公式交換比率に基づく双方向換算（「所持」vs「必要」）、週間交換上限（Weekly Cap）追跡、リセット週数カウンター、Red Queen効率判定。',
            '加速アイテム計算機＆最適化ツール：10種類の期間区分（1分〜3日）と5分類（建設、研究、訓練、治療、共通）を集計し、総日数・時間・分を算出。エース司令官イベントのポイント試算（約30 pt/分）にも対応。',
            '逆算所要時間チェッカー：建設や研究の残り所要時間を入力するだけで、手持ちの加速アイテムで即時完了可能かを一発判定。',
            '略奪保護セーフバックパック：食糧・木材・鉄・石油・選択箱（1K〜5M）の未開封ボックスを集計し、邸宅P1〜P10の必要資材と比較。着工直前まで開封しない鉄壁の略奪対策を支援。',
            'ルミニオ換算機：ルミニオ粉末とルミニオ原石の双方向即時換算（精密比率1.3）。',
            '英雄専用装備＆武器（+1〜+20）：専用装備育成計算機へのダイレクトリンクと解説カードを統合。'
          ]
        }
      },
      {
        title: {
          es: '3. Fase 3: Expansión de Llaveros, EXP Nivel 1 a 30 y 96 Sub-Estadísticas (/llaveros)',
          en: '3. Phase 3: Keyrings Expansion, Level 1 to 30 EXP & 96 Sub-Stats (/llaveros)',
          ja: '3. フェーズ3：キーリング大百科、Lv.1〜30 EXP計算機＆96種サブステ（/llaveros）'
        },
        description: {
          es: 'El sistema de Llaveros del Maletín Attaché representa uno de los mayores saltos de poder en v1.10.1. Integramos su enciclopedia completa:',
          en: 'The Attaché Case Keyring system delivers one of the most substantial combat power leaps in v1.10.1. We integrated its definitive encyclopedia:',
          ja: 'アタッシェケースのキーリングシステムは、v1.10.1において最大級の戦力強化をもたらします。その完全百科を構築しました：'
        },
        image: '/llaveros/keyrings_upgrade_showcase.webp',
        imageCaption: {
          es: 'Catálogo de Llaveros y Calculadora de EXP a Nivel 30 en /llaveros',
          en: 'Keyrings Catalog & Level 30 EXP Calculator in /llaveros',
          ja: '/llaveros のキーリングカタログおよびLv.30 EXP計算機'
        },
        items: {
          es: [
            'Catálogo Completo de 42 Llaveros: Efectos pasivos en posesión (las piezas Épicas y Legendarias aplican sus bonificaciones desde el inventario sin equipar), rangos de combate verificados y filtros tácticos por Combate, Defensa y Economía.',
            'Aclaración del Bug Visual In-Game (v1.10.1): El juego infla erróneamente los números del tooltip sumando sub-stats (ej. +12,13% en vez de +3,90% a +4,30%). Nuestra base de datos expone los valores reales de combate.',
            'Calculadora Interactiva de EXP de Nivel 1 a 30: Curva oficial de 193,790 EXP acumulada (6,480 a Nv.10, 43,600 a Nv.20, y 150,190 adicionales para Nv.30) con selectores de nivel rápidos y porcentaje de avance.',
            'Tabla Oficial de Poder de Combate (CP): Hitos de poder para las 5 rarezas, alcanzando hasta 255,420 CP por llavero Legendario a Nivel 30.',
            'Catálogo de 96 Sub-Estadísticas Equipables: Desglose matemático de los 5 candidatos iniciales y finales (V1 a V5 con 20% de probabilidad fija cada uno), filtros por eventos (Rally, Ataque a base, Guerra de Hierbas, Lab. Vacunas, Saint Vale) y copiado rápido al portapapeles.',
            'Descarga Oficial en Excel: Enlace en cabecera para descargar la matriz completa "Llaveros_EXP_Poder_30_Niveles.xlsx".'
          ],
          en: [
            'Complete 42 Keyrings Catalog: Passive in-possession effects (Epic and Legendary items apply bonuses straight from inventory without equipping), verified combat ranges, and quick filters for Combat, Defense, and Economy.',
            'In-Game Tooltip Visual Bug Explained: The internal client mistakenly displays inflated values due to sub-stats being added to the popup. Our database provides verified in-game combat numbers.',
            'Interactive Level 1 to 30 EXP Calculator: Calibrated with the official 193,790 cumulative EXP curve (6,480 at Lv.10, 43,600 at Lv.20, and 150,190 additional for Lv.30) with quick presets and progress trackers.',
            'Official Combat Power (CP) Table: Power benchmarks across all 5 rarities, topping out at 255,420 CP for a Level 30 Legendary keyring.',
            '96 Equippable Sub-Stats Catalog: Mathematical breakdown of all 5 candidate rolls (V1 to V5 with fixed 20% probability each), event filters (Rally, Base Attack, Herb War, Vaccine Lab, Saint Vale), and instant clipboard copying.',
            'Official Excel Spreadsheet Download: Header direct download for "Llaveros_EXP_Poder_30_Niveles.xlsx".'
          ],
          ja: [
            '全42種キーリング完全カタログ：所持パッシブ効果（エピックおよびレジェンダリーは未装備でもインベントリから自動発動）、検証済み戦闘数値、戦闘・防衛・経済フィルター。',
            'ゲーム内ポップアップ表示バグの解明：ゲーム内ツールチップがサブステを加算して数値を誤表示（+3.90%〜+4.30%の代わりに+12.13%）。当DBでは検証済みの実戦闘数値を掲載。',
            '対話型Lv.1〜30 EXP計算機：総累積193,790 EXPの公式成長曲線（Lv.10で6,480、Lv.20で43,600、Lv.30で追加150,190 EXP）に対応し、クイック選択と進捗ゲージを搭載。',
            '公式戦闘力（CP）一覧表：全5レアリティの節目別戦闘力を網羅し、Lv.30レジェンダリーで最大255,420 CPに到達。',
            '装備可能サブステータス96種カタログ：各ロール20%固定確率の初期・最終5候補（V1〜V5）の完全展開、イベント別フィルター、ワンクリッククリップボードコピー。',
            '公式Excelダウンロード：ヘッダーから「Llaveros_EXP_Poder_30_Niveles.xlsx」をワンクリックでダウンロード可能。'
          ]
        }
      },
      {
        title: {
          es: '4. Compuertas de Seguridad Umbrella e Internacionalización Global (ES / EN / JA)',
          en: '4. Umbrella Security Blast Doors & Global Trilingual Experience (ES / EN / JA)',
          ja: '4. アンブレラ防壁セキュリティ演出＆3言語完全対応（日・英・西）'
        },
        description: {
          es: 'La experiencia de navegación ha sido elevada con estética cinematográfica y soporte idiomático total:',
          en: 'The browsing experience has been elevated with cinematic aesthetics and flawless multilingual fidelity:',
          ja: '重厚な世界観を表現する演出と、妥協のない多言語サポートによって閲覧体験を刷新しました：'
        },
        items: {
          es: [
            'Transición Física de Compuertas Umbrella: Animación táctica de doble compuerta de acero de Umbrella que se cierra y se abre al alternar entre páginas y módulos de la base de datos.',
            'Localización Trilingüe 100%: Cada herramienta, conversor, tooltip, hito de EXP y ficha operativa ha sido auditada y traducida con precisión militar en Español, Inglés y Japonés.',
            'Hipervínculos Inteligentes (SmartText): Enlace dinámico automático en los boletines de noticias para términos clave como Llaveros, Mansión, Conversores, Aceleradores, Luminio, Tesoros y Joyas.'
          ],
          en: [
            'Umbrella Physical Blast Door Transition: High-tech dual steel security blast doors closing and parting smoothly during page navigation across the database.',
            '100% Trilingual Localization: Every tool, converter, tooltip, EXP milestone, and technical card has been rigorously audited and translated in Spanish, English, and Japanese.',
            'Intelligent SmartText Auto-Linking: Dynamic automatic cross-links across news dispatches for key game concepts such as Keyrings, Mansion, Converters, Speedups, Luminio, Treasures, and Jewels.'
          ],
          ja: [
            'アンブレラ防壁ドアによる画面遷移：データベース各ページやツールの移動時に、二重鋼鉄セキュリティ防壁がスムーズに開閉する戦術的アニメーションを導入。',
            '3言語100%完全ローカライズ：全ツール、換算機、ツールチップ、EXP節目、解説カードを日本語・英語・スペイン語で徹底検証・実装。',
            'SmartTextスマートリンク：ニュース記事内の「キーリング」「邸宅」「換算機」「加速アイテム」「ルミニオ」「神話秘宝」「宝石」などの重要語句を自動で相互リンク。'
          ]
        }
      }
    ]
  },
  {
    id: 'patch-1-10-1-datamine',
    date: '26 SEP 2026',
    readTime: '4 min',
    author: 'Red Queen Intelligence',
    version: 'v1.10.1',
    category: 'patch',
    tag: {
      es: 'BOLETÍN DE PARCHE & DATAMINE',
      en: 'PATCH & DATAMINE DISPATCH',
      ja: 'パッチ＆解析ニュースレター'
    },
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    title: {
      es: 'Parche v1.10.1: Nuevas Skins de Base, Evento Bingo y Archivos Extraídos',
      en: 'Patch v1.10.1: New HQ Skins, Bingo Event & Extracted Game Assets',
      ja: 'パッチ v1.10.1：新本部スキン、ビンゴイベント、抽出アセット解析'
    },
    excerpt: {
      es: 'Boletín completo de los 507 nuevos archivos de la versión 1.10.1: diseños de Cuartel General #34 y #35, Bingo Temporada 1 y 2, Pase de Batalla renovado y mejoras para Leon S. Kennedy y Billy Coen.',
      en: 'Full newsletter covering the 507 new assets in version 1.10.1: HQ Skins #34 and #35, Season 1 & 2 Bingo, revamped Battle Pass UI, and updated models for Leon S. Kennedy and Billy Coen.',
      ja: 'バージョン1.10.1で追加された507個の新アセットを完全解説：本部スキン#34・#35、シーズン1＆2ビンゴ、バトルパスUI刷新、レオンとビリーのモデル更新。'
    },
    intro: {
      es: 'Hemos completado la extracción y análisis de los archivos internos de la actualización v1.10.1 de Resident Evil: Survival Unit. A continuación te explicamos qué significa cada novedad para tu progresión, cómo prepararte para los eventos que vienen y qué cambios visuales ya están dentro del cliente.',
      en: 'We have completed our extraction and analysis of the internal files from Resident Evil: Survival Unit update v1.10.1. Below we explain what each addition means for your progression, how to prepare for upcoming events, and which visual upgrades are now live in the client.',
      ja: '『バイオハザード サバイバルユニット』アップデートv1.10.1の内部ファイル解析が完了しました。各新要素が育成やイベント攻略にどう影響するか詳しく解説します。'
    },
    image: '/noticias/Event_BingoSeason01_bg_C.webp',
    gallery: [
      {
        src: '/noticias/SKIN_HQ_34.webp',
        caption: {
          es: 'Diseño de Cuartel General #34 (SKIN_HQ_34)',
          en: 'Headquarters Skin #34 (SKIN_HQ_34)',
          ja: '新本部スキン #34 (SKIN_HQ_34)'
        }
      },
      {
        src: '/noticias/SKIN_HQ_35.webp',
        caption: {
          es: 'Diseño de Cuartel General #35 (SKIN_HQ_35)',
          en: 'Headquarters Skin #35 (SKIN_HQ_35)',
          ja: '新本部スキン #35 (SKIN_HQ_35)'
        }
      },
      {
        src: '/noticias/Banner_Hottime_Troop_Main.webp',
        caption: {
          es: 'Banner Oficial Hot Time: Entrenamiento de Tropas',
          en: 'Official Hot Time Banner: Troop Training',
          ja: 'ホットタイム公式バナー：部隊訓練'
        }
      }
    ],
    isFeatured: false,
    actionLink: {
      href: '/heroes',
      label: {
        es: 'Explorar Base de Datos de Operativos',
        en: 'Explore Operatives Database',
        ja: 'オペレーターデータベースを見る'
      }
    },
    highlights: {
      es: [
        '507 nuevos archivos gráficos y 24 efectos de audio extraídos directamente del cliente v1.10.1.',
        'Nuevos Aspectos de Cuartel General (HQ #34 y #35) con efectos de marcha y marcos que potencian tus estadísticas igual que los Llaveros.',
        'Nuevo evento "Bingo de Temporada" (Season 01 y Season 02) ideal para conseguir Aceleradores, Joyas y fragmentos de Tesoros Míticos.',
        'Actualización de modelos 3D/LOD para Billy Coen, Leon S. Kennedy, Nemesis T2, Escopeta W870 y el Visualizador EMF.'
      ],
      en: [
        '507 brand-new graphic assets and 24 audio clips extracted directly from client v1.10.1.',
        'New Headquarters Skins (HQ #34 & #35) with matching March Skins and Frames that boost squad stats alongside your Keychains.',
        'New "Seasonal Bingo" event (Season 01 & 02) ideal for farming Speedups, Jewels, and Mythic Treasures.',
        'Updated 3D/LOD textures for Billy Coen, Leon S. Kennedy, Nemesis T2, W870 Shotgun, and EMF Visualizer.'
      ],
      ja: [
        'クライアントv1.10.1から507個の新規画像アセットと24個の音声ファイルを抽出。',
        '新本部スキン（HQ #34＆#35）および対応する行軍スキン・フレームを追加。キーホルダーと合わせて戦力を強化。',
        '新イベント「シーズンビンゴ（シーズン1＆2）」で加速アイテムやジュエルを獲得可能。',
        'ビリー・コーエン、レオン、ネメシスT2、W870ショットガン、EMFビジュアライザーのモデルを更新。'
      ]
    },
    sections: [
      {
        title: {
          es: '1. Nuevos Eventos de Temporada: Bingo y Hot Time',
          en: '1. New Seasonal Events: Bingo & Hot Time',
          ja: '1. 新シーズンイベント：ビンゴ＆ホットタイム'
        },
        description: {
          es: 'Los eventos de temporada son la fuente principal de recursos gratuitos para jugadores F2P y competitivos. En este parche se introducen dos mecánicas clave para ahorrar Aceleradores antes de Cumbre de Ases:',
          en: 'Seasonal events are the primary source of free progression items. This patch introduces two key mechanics to help you save Speedups before Ace Summit:',
          ja: 'シーズンイベントは無課金・微課金プレイヤーにとって重要な資源獲得源です。エースサミットに向けて加速アイテムを温存できる2つの新要素が追加されました。'
        },
        image: '/noticias/Banner_Hottime_Troop_Main.webp',
        imageCaption: {
          es: 'Aprovecha los eventos Hot Time para usar la Calculadora de Aceleradores en /herramientas',
          en: 'Use Hot Time windows alongside our Speedup Calculator in /herramientas',
          ja: 'ホットタイム期間中は戦術ツールの加速計算機を活用しましょう'
        },
        items: {
          es: [
            'Bingo de Temporada (Season 01 & 02): Completa líneas en el tablero temático para desbloquear cofres con Polvo de Luminio, materiales de Joyas y contratos de operativos.',
            'Eventos Hot Time (Construcción, Investigación y Tropas): Ventanas de bonificación global donde el tiempo de cola se reduce. Combínalo con nuestras Calculadoras para maximizar tus puntos en Cumbre de Ases.',
            'Pase de Batalla y Recarga de Temporada: Se añadió el botón "Reclamar Todo" (Claim All) y nuevos medidores de progreso.',
            'Link Store: Se detectó el nuevo Boleto Dorado de Ruleta (Gold Roulette Ticket) para sorteos especiales.'
          ],
          en: [
            'Seasonal Bingo (Season 01 & 02): Complete board lines to unlock chests containing Loyminium Dust, Jewel materials, and operative contracts.',
            'Hot Time Events (Construction, Research & Troops): Global buff windows that reduce queue times. Pair them with our Calculators to maximize Ace Summit points.',
            'Battle Pass & Season Recharge: Added "Claim All" functionality and revamped free/paid progress gauges.',
            'Link Store: Detected the new Gold Roulette Ticket for upcoming promotional draws.'
          ],
          ja: [
            'シーズンビンゴ（シーズン1＆2）：ラインを揃えてルミニウムやジュエル素材を獲得。',
            'ホットタイムイベント（建設・研究・部隊訓練）：訓練時間を短縮し、エースサミットのポイントを最大化。',
            'バトルパス＆シーズンチャージ：一括受取（Claim All）ボタンと新ゲージを実装。',
            'リンクストア：特別抽選用のゴールドルーレットチケットを追加。'
          ]
        }
      },
      {
        title: {
          es: '2. Cosméticos de Cuartel General, Operativos y Armamento',
          en: '2. Headquarters Cosmetics, Operatives & Weapons',
          ja: '2. 本部スキン、オペレーター、武器モデルの更新'
        },
        description: {
          es: 'Además de los eventos, el parche actualiza las texturas de varios operativos clave de la Tier List y añade dos aspectos completos de base:',
          en: 'Beyond events, the patch upgrades textures for several key Tier List operatives and introduces two full base cosmetics:',
          ja: 'イベントだけでなく、ティアリスト主要オペレーターのテクスチャ更新と2種類の新本部スキンが追加されています。'
        },
        items: {
          es: [
            'Skins de Cuartel General #34 y #35: Incluyen variantes evolucionadas, efectos de marcha (Skin_March_34/35), marcos y títulos que complementan tus bonificaciones de Llaveros y Tesoros Míticos.',
            'Optimización Visual de Operativos: Nuevos modelos LOD2 para Leon S. Kennedy (Tier SS en Meta PvP y Meta PvE) y Billy Coen, además del jefe Nemesis T2.',
            'Armas Icónicas en Alta Definición: Texturas renovadas para el Visualizador EMF de Leon y la escopeta táctica W870.'
          ],
          en: [
            'HQ Skins #34 & #35: Include evolved variants, March Skins (Skin_March_34/35), frames, and titles that stack with your Keychains and Mythic Treasures.',
            'Operative Visual Upgrades: Updated LOD2 models for Leon S. Kennedy (SS Tier in Meta PvP & PvE) and Billy Coen, plus boss Nemesis T2.',
            'High-Definition Iconic Weapons: Refreshed texture maps for Leon’s EMF Visualizer and the W870 tactical shotgun.'
          ],
          ja: [
            '本部スキン #34＆#35：進化バリエーション、行軍スキン、専用フレームを収録。キーホルダーのバフと重複して効果を発揮。',
            'オペレーターモデル更新：ティアリストSSのレオンとビリー・コーエン、ボス「ネメシスT2」のLOD2モデルを改善。',
            '高解像度武器アセット：EMFビジュアライザーとW870ショットガンのテクスチャを刷新。'
          ]
        }
      }
    ]
  },
  {
    id: 'tierlist-meta-pvp-pve-update',
    date: '24 SEP 2026',
    readTime: '3 min',
    author: 'Tactical Meta Team',
    version: 'Web v2.5',
    category: 'meta',
    tag: {
      es: 'ANÁLISIS DE META & TIER LIST',
      en: 'META & TIER LIST REPORT',
      ja: 'メタ＆ティアリスト分析'
    },
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    title: {
      es: 'Gran Actualización de Tier List: PvP Arena y Campaña PvE (Early, Mid & Late Game)',
      en: 'Major Tier List Update: PvP Arena & PvE Campaign (Early, Mid & Late Game)',
      ja: 'ティアリスト大型更新：PvPアリーナ＆PvEキャンペーン（序盤・中盤・終盤）'
    },
    excerpt: {
      es: 'Rediseñamos la Tier List separando el rendimiento de los 31 operativos según la fase del servidor (Early, Mid y Late Game) tanto en Arena PvP como en Campaña PvE.',
      en: 'We redesigned the Tier List to separate all 31 operatives by server progression phase (Early, Mid, and Late Game) across both PvP Arena and PvE Campaign.',
      ja: '全31名のオペレーター評価をサーバー進行度（序盤・中盤・終盤）およびPvP/PvEモード別に完全リニューアルしました。'
    },
    intro: {
      es: 'Uno de los errores más frecuentes al invertir contratos y libros de habilidad es subir un héroe pensando que rinde igual el día 1 que en el día 90 del servidor. Con esta actualización de la Tier List, ahora puedes filtrar exactamente qué operativos dominan en cada etapa y compararlos en el Comparador de Héroes.',
      en: 'One of the most common mistakes when investing contracts and skill books is assuming an operative performs the same on Day 1 as on Day 90. With this Tier List update, you can filter exactly who dominates each phase and test matchups in the Compare tool.',
      ja: '契約書やスキルブックを投資する際、序盤と終盤の性能差を把握することが重要です。新しいティアリストでは進行度別の最強編成を確認できます。'
    },
    image: '/noticias/Event_Ranking_Season01_C.webp',
    actionLink: {
      href: '/tier-list',
      label: {
        es: 'Consultar Tier List Interactiva',
        en: 'Open Interactive Tier List',
        ja: '最新ティアリストを見る'
      }
    },
    highlights: {
      es: [
        'Nuevos filtros por fase de servidor: Early Game, Mid Game y Late Game dentro de la Tier List.',
        'Clasificaciones independientes para Arena PvP y Campaña/Exploración PvE.',
        'Acceso directo a la ficha de cada operativo (como Leon S. Kennedy, Sheva Alomar o Jack Krauser) haciendo clic en su retrato.'
      ],
      en: [
        'New server-phase filters: Early Game, Mid Game, and Late Game inside the Tier List.',
        'Independent rankings for PvP Arena and PvE Campaign/Exploration.',
        'Direct links to every operative profile (such as Leon S. Kennedy, Sheva Alomar, or Jack Krauser) by clicking their portrait.'
      ],
      ja: [
        '進行度フィルター（Early / Mid / Late Game）をティアリストに実装。',
        'PvPアリーナとPvEキャンペーンの評価を完全に分離。',
        '各アイコンからレオン、シェバ、クラウザーなどの詳細ステータス画面へ直接移動可能。'
      ]
    },
    sections: [
      {
        title: {
          es: '1. Evolución del Meta en PvP Arena',
          en: '1. PvP Arena Meta Evolution',
          ja: '1. PvPアリーナのメタ変遷'
        },
        description: {
          es: 'En Arena PvP la velocidad de activación y la supervivencia de la vanguardia determinan quién gana el intercambio inicial:',
          en: 'In PvP Arena, skill activation speed and frontline durability dictate who wins the opening trade:',
          ja: 'PvPアリーナではスキル発動速度と前衛の耐久力が勝敗を左右します。'
        },
        items: {
          es: [
            'Early Game PvP: Sheva Alomar, Barry Burton, Mark Wilkins y BSAA Chris Redfield lideran el Tier S porque requieren menos fragmentos de arma exclusiva para brillar.',
            'Mid Game PvP: Leon S. Kennedy, Jake Muller, Piers Nivans, BSAA Chris Redfield, Sheva Alomar y Excella Gionne toman el control del Tier SS.',
            'Late Game PvP: Jack Krauser, Ashley Graham y Chris Redfield escalan a Tier SS una vez completadas tus Joyas, Tesoros Míticos y Llaveros legendarios.'
          ],
          en: [
            'Early Game PvP: Sheva Alomar, Barry Burton, Mark Wilkins, and BSAA Chris Redfield lead S Tier due to strong base stats.',
            'Mid Game PvP: Leon S. Kennedy, Jake Muller, Piers Nivans, BSAA Chris Redfield, Sheva Alomar, and Excella Gionne take over SS Tier.',
            'Late Game PvP: Jack Krauser, Ashley Graham, and Chris Redfield reach SS Tier once paired with maxed Jewels, Mythic Treasures, and Keychains.'
          ],
          ja: [
            '序盤PvP：シェバ、バリー、マーク、BSAAクリスが初期ステータスの高さでSティアを牽引。',
            '中盤PvP：レオン、ジェイク、ピアーズ、BSAAクリス、シェバ、エクセラがSSティアに君臨。',
            '終盤PvP：ジュエルやキーホルダーが完成すると、クラウザーやアシュリーがSSティアへ昇格。'
          ]
        }
      },
      {
        title: {
          es: '2. Dominio en Campaña PvE y Jefes como Mortem',
          en: '2. PvE Campaign & World Bosses like Mortem',
          ja: '2. PvEキャンペーン＆ボス「モルテム」対策'
        },
        description: {
          es: 'Para exploración y eventos de jefe como Repeler a Mortem, el daño en área (AoE) y los bufos de escuadrón cambian las prioridades:',
          en: 'For exploration and boss events like Repel Mortem, AoE damage and squad-wide buffs shift the priorities:',
          ja: 'PvE探索やワールドボス「モルテム」戦では、範囲火力と部隊バフを持つヒーローが最優先となります。'
        },
        items: {
          es: [
            'Tier SS en PvE: Carlos Oliveira, Piers Nivans, Sheva Alomar, Leon S. Kennedy, Ashley Graham, Rebecca Chambers, Luis Serra y Excella Gionne son indispensables.',
            'Usa el Comparador de Héroes para evaluar qué atacante o defensor se adapta mejor a tus Llaveros actuales.'
          ],
          en: [
            'PvE SS Tier: Carlos Oliveira, Piers Nivans, Sheva Alomar, Leon S. Kennedy, Ashley Graham, Rebecca Chambers, Luis Serra, and Excella Gionne are top priorities.',
            'Use the Compare tool to check which attacker or defender best fits your active Keychains.'
          ],
          ja: [
            'PvE SSティア：カルロス、ピアーズ、シェバ、レオン、アシュリー、レベッカ、ルイス、エクセラが必須級。',
            '比較ツールを使って手持ちのキーホルダーに最適な編成を確認しましょう。'
          ]
        }
      }
    ]
  },
  {
    id: 'guias-dossiers-mortem-cumbre',
    date: '18 SEP 2026',
    readTime: '4 min',
    author: 'Umbrella Tactical Academy',
    version: 'Web v2.3',
    category: 'guides',
    tag: {
      es: 'DOSSIERS & GUÍAS DE EVENTO',
      en: 'EVENT DOSSIERS & GUIDES',
      ja: 'イベント攻略＆戦術ガイド'
    },
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    title: {
      es: 'Nuevos Dossiers Tácticos: Repeler a Mortem, Cumbre de Ases y Guerra de Hierbas',
      en: 'New Tactical Dossiers: Repel Mortem, Ace Summit & Herb War Guides',
      ja: '新戦術ドシエ公開：モルテム撃退、エースサミット、ハーブ戦争ガイド'
    },
    excerpt: {
      es: 'Publicamos las guías interactivas paso a paso para dominar Repeler a Mortem, planificar tus Aceleradores en Cumbre de Ases y optimizar tus Llaveros.',
      en: 'We published interactive step-by-step guides to master Repel Mortem, plan your Speedups in Ace Summit, and optimize your Keychains.',
      ja: 'モルテム撃退、エースサミットの加速計画、キーホルダー最適化を網羅したインタラクティブガイドを公開しました。'
    },
    intro: {
      es: 'El Centro de Guías ahora cuenta con expedientes interactivos donde puedes marcar tu lista de tareas (Checklist), consultar las fases diarias de cada evento y evitar los errores más costosos de recursos.',
      en: 'The Tactical Guides Hub now features interactive dossiers with persistent checklists, daily event breakdowns, and resource optimization tips.',
      ja: '戦術ガイドセンターに、チェックリスト機能付きの詳細イベント攻略ドシエを追加しました。'
    },
    image: '/guias/Event_WorldBoss_Mortem.webp',
    actionLink: {
      href: '/guias',
      label: {
        es: 'Abrir Centro de Guías Tácticas',
        en: 'Open Tactical Guides Hub',
        ja: '戦術ガイドセンターを開く'
      }
    },
    highlights: {
      es: [
        'Estrategia completa para Repeler a Mortem: cuándo usar Rallies para romper el escudo y cuándo lanzar marchas individuales en el aturdimiento.',
        'Calendario día por día de Cumbre de Ases conectado con las Calculadoras de entrenamiento y Luminio.',
        'Guía especializada para dominar los Llaveros y los Primeros 7 Días de servidor.'
      ],
      en: [
        'Full strategy for Repel Mortem: when to rally to break the shield vs. when to spam solo marches during stun.',
        'Day-by-day Ace Summit schedule linked with our Troop Training and Loyminium Calculators.',
        'Dedicated guides for mastering Keychains and your First 7 Days on a new server.'
      ],
      ja: [
        'モルテム撃退の完全攻略：集結でシールドを削り、スタン中に単騎攻撃を叩き込むタイミングを解説。',
        'エースサミットの日別スケジュールとルミニウム・加速計算機の連携。',
        'キーホルダー厳選ガイドと初心者向け序盤7日間チャートを収録。'
      ]
    },
    sections: [
      {
        title: {
          es: '1. Qué Encontrarás en Cada Dossier Táctico',
          en: '1. What Is Inside Each Tactical Dossier',
          ja: '1. 各戦術ドシエの収録内容'
        },
        description: {
          es: 'Cada guía ha sido diseñada con herramientas interactivas integradas para que no tengas que salir de la página mientras diriges a tu alianza:',
          en: 'Every guide includes built-in interactive widgets so you can coordinate your alliance effortlessly:',
          ja: '同盟の指揮を取りながらその場で確認できるインタラクティブ機能を備えています。'
        },
        items: {
          es: [
            'Repeler a Mortem: Simulador de fase de Escudo vs Aturdimiento y formación recomendada con héroes de la Tier List como Jill Valentine y Rebecca Chambers.',
            'Cumbre de Ases: Selector interactivo por día para saber exactamente cuándo gastar Polvo de Luminio, Aceleradores, Joyas y Tesoros Míticos.',
            'Guerra de Hierbas: Mapa mental de rotación y control de zonas para maximizar las recompensas de alianza.'
          ],
          en: [
            'Repel Mortem: Shield vs. Stun phase toggle and recommended lineups featuring Tier List heroes like Jill Valentine and Rebecca Chambers.',
            'Ace Summit: Interactive day selector showing exactly when to spend Loyminium Dust, Speedups, Jewels, and Mythic Treasures.',
            'Herb War: Zone control and rotation tactics to secure maximum alliance rewards.'
          ],
          ja: [
            'モルテム撃退：シールド期とスタン期の切り替え解説およびジルやレベッカを使った推奨編成。',
            'エースサミット：ルミニウム、加速アイテム、ジュエルを消費すべき曜日がすぐ分かる日別セレクター。',
            'ハーブ戦争：エリア制圧とローテーションの戦術解説。'
          ]
        }
      }
    ]
  },
  {
    id: 'nuevas-herramientas-tesoros-joyas',
    date: '12 AGO 2026',
    readTime: '3 min',
    author: 'Red Queen Engineering',
    version: 'Web v2.1',
    category: 'tools',
    tag: {
      es: 'HERRAMIENTAS & CALCULADORAS',
      en: 'TOOLS & CALCULATORS',
      ja: '新ツール＆計算機'
    },
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    title: {
      es: 'Nuevas Herramientas: Calculadora de Tesoros Míticos, Joyas y Llaveros',
      en: 'New Tools: Mythic Treasures, Jewels & Keychains Calculators',
      ja: '新ツール実装：神話級トレジャー、ジュエル、キーホルダー計算機'
    },
    excerpt: {
      es: 'Descubre cómo optimizar tus materiales de mejora con las nuevas calculadoras de Joyas y Tesoros Míticos en el apartado de Herramientas Tácticas.',
      en: 'Optimize your upgrade materials with our new Jewels and Mythic Treasures calculators in the Tactical Tools hub.',
      ja: '戦術ツールセクションにて、ジュエルと神話級トレジャーの強化素材を正確に算出できる計算機を公開しました。'
    },
    intro: {
      es: 'Subir tus Tesoros Míticos y Joyas sin calcular antes los materiales suele dejarte a medias justo en medio de eventos como Cumbre de Ases. Hemos creado estas calculadoras para que sepas al milímetro cuántos fragmentos y herramientas necesitas.',
      en: 'Upgrading Mythic Treasures and Jewels without calculating costs beforehand can leave you short during Ace Summit. Use these tools to plan every single material.',
      ja: 'エースサミットなどのイベント前に、必要な強化素材を1つの無駄もなく計算できる専用ツールです。'
    },
    actionLink: {
      href: '/herramientas',
      label: {
        es: 'Abrir Calculadoras de Tesoros y Joyas',
        en: 'Open Treasures & Jewels Calculators',
        ja: 'トレジャー＆ジュエル計算機を開く'
      }
    },
    highlights: {
      es: [
        'Cálculo exacto de Fragmentos Dorados, Polish, Blueprints y Advance Polish para Tesoros Míticos.',
        'Desglose completo de Joyas en Bruto y Herramientas de Tallado hasta rango Mythic++++.',
        'Integración directa con el catálogo de Llaveros para planificar todo tu equipamiento.'
      ],
      en: [
        'Exact calculation of Gold Frags, Polish, Blueprints, and Advance Polish for Mythic Treasures.',
        'Full breakdown of Rough Jewels and Carving Tools up to Mythic++++.',
        'Direct integration with the Keychains catalog to plan your entire loadout.'
      ],
      ja: [
        '神話級トレジャーに必要なゴールドフラグメント、ポリッシュ、設計図を自動計算。',
        'Mythic++++までの原石と彫刻ツールの必要数を一覧表示。',
        'キーホルダー図鑑と合わせて装備全体の強化計画が可能。'
      ]
    },
    sections: [
      {
        title: {
          es: '1. Cómo Funciona la Calculadora de Tesoros y Joyas',
          en: '1. How the Treasures & Jewels Calculators Work',
          ja: '1. トレジャー＆ジュエル計算機の使い方'
        },
        description: {
          es: 'Dentro de la página de Herramientas Tácticas encontrarás pestañas dedicadas para cada sistema de progresión:',
          en: 'Inside the Tactical Tools page you will find dedicated tabs for each progression system:',
          ja: '戦術ツールページ内の専用タブから各計算機にアクセスできます。'
        },
        items: {
          es: [
            'Calculadora de Tesoros Míticos: Elige tu tier actual y el tier objetivo para ver el total acumulado de recursos y cuántos niveles subirás.',
            'Calculadora de Joyas: Filtra por rango y conoce cuántas Joyas en Bruto necesitas ahorrar antes del día de equipamiento en Cumbre de Ases.',
            'Base de Datos de Llaveros: Revisa qué Llaveros legendarios o épicos potencian mejor a tus héroes de la Tier List.'
          ],
          en: [
            'Mythic Treasures Calculator: Pick your current and target tier to see cumulative costs and total levels gained.',
            'Jewels Calculator: Filter by rank to see how many Rough Jewels to save for Ace Summit gear day.',
            'Keychains Database: Check which Legendary or Epic Keychains best boost your Tier List heroes.'
          ],
          ja: [
            'トレジャー計算機：現在ランクと目標ランクを選ぶだけで累計素材数を表示。',
            'ジュエル計算機：エースサミットの装備強化日に向けて必要な原石数を確認。',
            'キーホルダー図鑑：ティアリスト上位ヒーローに最適なキーホルダーを検索。'
          ]
        }
      }
    ]
  },
  {
    id: 'simulador-investigacion-luminio',
    date: '12 AGO 2026',
    readTime: '3 min',
    author: 'Red Queen Engineering',
    version: 'Web v2.0',
    category: 'tools',
    tag: {
      es: 'SIMULADOR & IA OCR',
      en: 'SIMULATOR & AI OCR',
      ja: 'シミュレーター＆AI認識'
    },
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    title: {
      es: 'Simulador de Investigación de Luminio y Escáner de Aceleradores con IA',
      en: 'Loyminium Research Simulator & AI Speedup Scanner',
      ja: 'ルミニウム研究シミュレーター＆AI加速アイテムスキャナー'
    },
    excerpt: {
      es: 'Planifica el árbol de tus investigadores calculando el Polvo de Luminio exacto y escanea capturas de tus Aceleradores automáticamente con IA.',
      en: 'Plan your researcher skill tree with exact Loyminium Dust costs and scan screenshots of your Speedups automatically using AI.',
      ja: '研究ツリーに必要なルミニウムダストを正確に計算し、スクショから加速アイテムをAIで自動読み取りします。'
    },
    intro: {
      es: 'Contar a mano cuántos minutos y horas de Aceleradores tienes en la mochila antes de un evento SvS o Cumbre de Ases es cosa del pasado. Ahora puedes subir una captura de tu inventario o simular tu árbol de Luminio en segundos.',
      en: 'Manually counting your speedup minutes and hours before SvS or Ace Summit is a thing of the past. Upload a screenshot of your inventory or simulate your Loyminium tree in seconds.',
      ja: 'イベント前にバッグ内の加速アイテムを手計算する必要はもうありません。スクショをアップロードするだけでAIが自動集計します。'
    },
    actionLink: {
      href: '/herramientas',
      label: {
        es: 'Probar Simulador de Luminio y Aceleradores',
        en: 'Try Loyminium & Speedup Simulator',
        ja: 'ルミニウム＆加速シミュレーターを試す'
      }
    },
    highlights: {
      es: [
        'Simulador interactivo de Investigación de Luminio con cálculo exacto de Polvo de Luminio por nodo.',
        'Lector visual con IA que extrae automáticamente tus Aceleradores generales y de entrenamiento desde una captura de pantalla.',
        'Proyección de tropas generadas y puntos máximos para Cumbre de Ases y SvS.'
      ],
      en: [
        'Interactive Loyminium Research simulator with exact Loyminium Dust costs per node.',
        'AI visual scanner that extracts your general and training Speedups directly from a screenshot.',
        'Projection of total troops trained and maximum points for Ace Summit and SvS.'
      ],
      ja: [
        'ノードごとのルミニウムダスト消費量を正確に算出する研究シミュレーター。',
        'スクリーンショットから汎用・訓練加速アイテムの所持数をAIが自動抽出。',
        'エースサミットやSvSで獲得できる最大ポイントと兵士数を自動予測。'
      ]
    },
    sections: [
      {
        title: {
          es: '1. Dos Herramientas Esenciales en Un Solo Lugar',
          en: '1. Two Essential Tools in One Hub',
          ja: '1. 2つの必須ツールを1箇所に集約'
        },
        description: {
          es: 'Ambas utilidades están disponibles de forma gratuita dentro de Herramientas Tácticas:',
          en: 'Both utilities are available for free inside the Tactical Tools page:',
          ja: 'どちらの機能も戦術ツールページから無料で利用できます。'
        },
        items: {
          es: [
            'Árbol de Luminio: Configura el nivel actual de tus nodos de investigación y descubre cuánto Polvo de Luminio necesitas para llegar al final de la rama.',
            'Optimizador de Aceleradores: Sube tus capturas, elige el tier de tropa (T1 a T10) y calcula cuántas tandas puedes completar.'
          ],
          en: [
            'Loyminium Tree: Set your current research node levels and see how much Loyminium Dust is required to max out the branch.',
            'Speedup Optimizer: Upload your screenshots, select your troop tier (T1–T10), and see how many batches you can finish.'
          ],
          ja: [
            'ルミニウムツリー：現在の研究レベルを入力し、ツリー完遂までの必要ダスト量を確認。',
            '加速オプティマイザー：スクショをアップロードして兵種ティア（T1〜T10）を選び、訓練可能な部隊数を算出。'
          ]
        }
      }
    ]
  }
];
