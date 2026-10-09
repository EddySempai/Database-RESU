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
    id: 'sistema-llaveros-exp-v1-10-1',
    date: '09 OCT 2026',
    readTime: '4 min',
    author: 'Red Queen Intelligence',
    version: 'v1.10.1',
    category: 'tools',
    tag: {
      es: 'ACTUALIZACIÓN & BASE DE DATOS',
      en: 'MAJOR UPDATE & DATABASE',
      ja: '大型アップデート＆データベース'
    },
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    title: {
      es: 'Expansión Completa del Sistema de Llaveros: Catálogo v1.10.1, Calculadora de EXP y 96 Sub-Estadísticas',
      en: 'Complete Keyrings System Expansion: v1.10.1 Catalog, EXP Calculator & 96 Sub-Stats',
      ja: 'キーリング完全システム拡張：v1.10.1カタログ、EXP計算機、96種サブステータス'
    },
    excerpt: {
      es: 'Lanzamiento oficial de la base de datos de Llaveros (KeyRings): 42 modelos con efectos pasivos, calculadora interactiva de 1 a 30 con 193,790 EXP acumulada, tabla de Poder de Combate (CP), catálogo de 96 sub-estadísticas con mecánica de 5 candidatos al 20%, y 100% traducido en ES, EN y JA.',
      en: 'Official release of the complete Keyrings database: 42 models with passive effects, interactive 1 to 30 EXP calculator with 193,790 cumulative curve, Combat Power (CP) table, 96 equippable sub-stats with 20% candidate roll mechanics, and 100% localization in ES, EN, and JA.',
      ja: 'キーリング完全データベースを正式リリース：パッシブ効果付き42モデル、総累積193,790 EXP対応のLv.1〜30対話型EXP計算機、戦力（CP）表、20%候補ロール仕様の96種サブステータス、日・英・西の100%多言語対応。'
    },
    intro: {
      es: 'El sistema de Llaveros del Maletín Attaché representa uno de los saltos de poder y optimización más decisivos en Resident Evil: Survival Unit v1.10.1. Para garantizar una planificación milimétrica de tus recursos, hemos integrado en la web la base de datos definitiva con todos los modelos extraídos, la progresión oficial de EXP hasta Nivel 30, las tablas de Poder de Combate (CP) por hito, el desglose de sub-stats y localización total en tres idiomas.',
      en: 'The Attaché Case Keyring system represents one of the most critical power boosts in Resident Evil: Survival Unit v1.10.1. To empower tactical squad optimization, our database now features all 42 extracted keyrings, official Lv. 30 EXP progression curves, Combat Power (CP) milestone tables, sub-stat candidate roll breakdowns, and full trilingual localization.',
      ja: 'アタッシェケースのキーリングシステムは、『バイオハザード サバイバルユニット』v1.10.1における最重要育成要素の一つです。戦術資源の計画を完璧に行えるよう、全42種のモデル、Lv.30公式EXP成長曲線、節目別戦闘力（CP）テーブル、サブステータス抽選仕様、および3言語完全ローカライズを統合しました。'
    },
    image: '/llaveros/keyrings_upgrade_showcase.webp',
    gallery: [
      {
        src: '/llaveros/keyrings_upgrade_showcase.png',
        caption: {
          es: 'Calculadora táctica de EXP para subir Llaveros de Nivel 1 a 30 en /llaveros',
          en: 'Tactical Keyring EXP Calculator (Level 1 to 30) in /llaveros',
          ja: '/llaveros のキーリングLv.1〜30戦術EXP計算機'
        }
      }
    ],
    isFeatured: true,
    actionLink: {
      href: '/llaveros',
      label: {
        es: 'Abrir Base de Datos de Llaveros',
        en: 'Open Keyrings Database',
        ja: 'キーリングデータベースを開く'
      }
    },
    highlights: {
      es: [
        'Catálogo visual de los 42 Llaveros extraídos con rangos exactos de Nivel 30 para rarezas Épica y Legendaria.',
        'Calculadora interactiva de EXP de Llaveros calibrada con la curva oficial de 193,790 EXP acumulada a Nv. 30 y selectores rápidos.',
        'Tabla oficial de Poder de Combate (CP) en hitos clave (Nv. 10, Nv. 20, Nv. 30) para las 5 rarezas (hasta 255,420 CP por llavero Legendario).',
        'Catálogo exhaustivo de 96 Sub-Estadísticas equipables con desglose de los 5 candidatos iniciales y finales (20% de probabilidad fija c/u).',
        'Internacionalización completa (i18n): catálogo, herramientas, descripciones de hitos y copiado rápido al portapapeles en Español, Inglés y Japonés.'
      ],
      en: [
        'Visual catalog of all 42 extracted Keyrings with exact Lv. 30 ranges for Epic and Legendary rarities.',
        'Interactive Keyring EXP Calculator calibrated with the official 193,790 cumulative EXP curve at Lv. 30 with quick presets.',
        'Official Combat Power (CP) table across milestones (Lv. 10, Lv. 20, Lv. 30) for all 5 rarities (up to 255,420 CP for Legendary).',
        'Exhaustive catalog of 96 equippable Sub-Stats detailing all 5 initial and final candidate rolls (20% fixed probability each).',
        '100% Internationalization (i18n): catalog, tools, milestone dossiers, and clipboard copy fully translated in Spanish, English, and Japanese.'
      ],
      ja: [
        'エピックおよびレジェンダリーのLv.30正確な範囲を含む全42種キーリングのビジュアルカタログ。',
        '総累積193,790 EXPの公式成長曲線に対応した対話型EXP計算機（Lv.1〜30）とクイック選択プリセット。',
        '全5レアリティの節目別（Lv.10、Lv.20、Lv.30）戦闘力（CP）表（レジェンダリー最大255,420 CP）。',
        '各ロール20%固定確率の初期・最終5候補を含む装備可能サブステータス96種の完全カタログ。',
        '100%多言語対応（i18n）：カタログ、計算ツール、節目解説、クリップボードコピーが日本語・英語・スペイン語に完全対応。'
      ]
    },
    sections: [
      {
        title: {
          es: '1. Catálogo Completo de 42 Llaveros y Efectos Pasivos en Posesión',
          en: '1. Complete 42 Keyrings Catalog & Passive In-Possession Effects',
          ja: '1. 全42種キーリングカタログ＆所持パッシブ効果'
        },
        description: {
          es: 'Los llaveros son accesorios del Maletín Attaché que otorgan bonificaciones sustanciales a tu cuenta. Solo puedes equipar hasta 3 llaveros simultáneamente (el 1º al pasar Oleada 1, el 2º al pasar Oleada 200, y el 3º mediante paquete de tienda), pero sus efectos más poderosos aplican de forma global:',
          en: 'Keyrings are Attaché Case items that grant massive account-wide bonuses. You can equip up to 3 keyrings at once (1st upon clearing Wave 1, 2nd upon Wave 200, 3rd via shop bundle), but their strongest perks apply globally:',
          ja: 'キーリングはアタッシェケースにセットして強力なボーナスを得られる装備です。同時に最大3個まで装備可能（1個目はウェーブ1クリア、2個目はウェーブ200クリア、3個目はショップパックで解放）ですが、最強の恩恵は全体に適用されます：'
        },
        image: '/llaveros/keyrings_upgrade_showcase.webp',
        imageCaption: {
          es: 'Catálogo de Llaveros con rangos exactos de combate en /llaveros',
          en: 'Keyrings catalog with exact combat ranges in /llaveros',
          ja: '/llaveros で実際の戦闘数値を確認可能'
        },
        items: {
          es: [
            'Efectos Pasivos en Posesión: Los efectos principales de rarezas Épica y Legendaria aplican pasivamente desde el inventario sin necesidad de equiparlos (no se acumulan duplicados del mismo modelo exacto).',
            'Bug Visual del Popup In-Game (v1.10.1): El juego muestra erróneamente valores inflados (ej. +12,13% en vez de +3,90% a +4,30%) porque suma sub-stats al tooltip. Los datos de nuestra base de datos reflejan los valores reales de combate.',
            'Clasificación Táctica: Filtros rápidos por Combate (ataque, defensa, salud, penetración), Defensa y Economía (recolección, construcción, investigación y hospital).'
          ],
          en: [
            'Passive In-Possession Effects: Epic and Legendary main perks apply passively from your inventory without needing to be equipped (duplicates of the same model do not stack).',
            'In-Game Tooltip Visual Bug (v1.10.1): The internal client mistakenly displays inflated numbers (e.g. +12.13% instead of +3.90% to +4.30%) due to sub-stats being added to the popup. Our database provides verified in-game combat numbers.',
            'Tactical Categorization: Instant filters for Combat (attack, defense, HP, penetration), Defense, and Economy (gathering, construction, research, hospital).'
          ],
          ja: [
            '所持パッシブ効果：エピックおよびレジェンダリーのメイン効果は装備しなくてもインベントリから自動適用（同種重複不可）。',
            'ゲーム内ポップアップ表示バグ（v1.10.1）：ゲーム内のツールチップはサブステータスを加算して誤表示（+3.90%〜+4.30%の代わりに+12.13%）。当データベースは検証済みの実戦闘数値を掲載。',
            '戦術分類：戦闘（攻撃、防御、HP、殺傷力）、防衛、経済（採集、建設、研究、病院）の高速フィルター。'
          ]
        }
      },
      {
        title: {
          es: '2. Calculadora de EXP (1 a 30) y Tabla Oficial de Poder de Combate (CP)',
          en: '2. EXP Calculator (1 to 30) & Official Combat Power (CP) Benchmarks',
          ja: '2. EXP計算機（Lv.1〜30）＆公式戦闘力（CP）基準表'
        },
        description: {
          es: 'Subir un llavero a Nivel 30 requiere una planificación cuidadosa de experiencia táctica. Hemos integrado una calculadora interactiva y la tabla de Poder de Combate por hitos:',
          en: 'Upgrading a keyring to Level 30 requires disciplined tactical EXP resource management. We integrated an interactive calculator alongside milestone Combat Power values:',
          ja: 'キーリングをLv.30まで強化するには、計画的な戦術EXPの投入が不可欠です。対話型計算機と節目別戦闘力表を統合しました：'
        },
        items: {
          es: [
            'Curva de EXP Acumulada: Nivel 1 a 10 consume 6,480 EXP; Nivel 11 a 20 consume 37,120 EXP adicionales (43,600 total); y Nivel 21 a 30 consume 150,190 EXP adicionales (193,790 EXP total).',
            'Escalamiento de Poder de Combate (CP): Un llavero Común otorga 36,660 CP a Nv.30; Poco Común 85,560 CP; Raro 123,900 CP; Épico 212,970 CP; y Legendario 255,420 CP.',
            'Ranuras Equipables Desbloqueadas: Aumentan de 1 ranura (Común) hasta 3-4 ranuras equipables (Épico y Legendario).',
            'Descarga Oficial en Excel: Enlace directo en cabecera para descargar la hoja completa "Llaveros_EXP_Poder_30_Niveles.xlsx".'
          ],
          en: [
            'Cumulative EXP Curve: Level 1 to 10 requires 6,480 EXP; Level 11 to 20 requires 37,120 additional EXP (43,600 total); and Level 21 to 30 requires 150,190 additional EXP (193,790 EXP total).',
            'Combat Power (CP) Scaling: A Common keyring grants 36,660 CP at Lv.30; Advanced 85,560 CP; Rare 123,900 CP; Epic 212,970 CP; and Legendary 255,420 CP.',
            'Equippable Slots Unlocked: Scales from 1 slot (Common) up to 3-4 active slots (Epic and Legendary).',
            'Official Excel Spreadsheet: Direct one-click download for "Llaveros_EXP_Poder_30_Niveles.xlsx".'
          ],
          ja: [
            '累積EXP曲線：Lv.1〜10で6,480 EXP、Lv.11〜20で追加37,120 EXP（累計43,600）、Lv.21〜30で追加150,190 EXP（累計193,790 EXP）。',
            '戦闘力（CP）上昇：Lv.30時点でコモン36,660 CP、アンコモン85,560 CP、レア123,900 CP、エピック212,970 CP、レジェンダリー255,420 CP。',
            '装備スロット解放：コモンの1スロットから、エピック・レジェンダリーの3〜4スロットまで拡張。',
            '公式Excelダウンロード：ヘッダーから「Llaveros_EXP_Poder_30_Niveles.xlsx」を直接ダウンロード可能。'
          ]
        }
      },
      {
        title: {
          es: '3. Catálogo de 96 Sub-Estadísticas y Mecánica de 5 Candidatos (20% c/u)',
          en: '3. 96 Sub-Stats Catalog & 5 Candidates Roll Mechanics (20% each)',
          ja: '3. 96種サブステータスカタログ＆5候補ロール仕様（各20%）'
        },
        description: {
          es: 'Las sub-estadísticas se activan únicamente cuando el llavero está equipado en una de tus ranuras activas. En v1.10.1 existen 96 variantes por rareza estructuradas con una regla matemática fija:',
          en: 'Sub-stats activate exclusively when the keyring is slotted into an active briefcase slot. In v1.10.1 there are 96 variants per rarity governed by fixed mathematical rules:',
          ja: 'サブステータスはキーリングをアクティブスロットに装備している時のみ発動します。v1.10.1には各レアリティ96種類が存在し、固定確率で抽選されます：'
        },
        items: {
          es: [
            'Sorteo de 5 Candidatos: Al obtener un llavero o forjar rolls, se sortea 1 de 5 candidatos iniciales con un 20% de probabilidad fija cada uno (V1 a V5). El candidato inicial determina si terminará en el rango mínimo o máximo a Nivel 30.',
            'Categorías Estratégicas: Filtros dedicados para Concentración (Rally), Ataque a Base, Defensa de Base, Guerra de Hierbas, Lab. de Vacunas y Saint Vale.',
            'Copiado Táctico Rápido: Botón para copiar la ficha técnica completa al portapapeles formateada automáticamente en tu idioma actual.'
          ],
          en: [
            '5 Candidates Roll Mechanics: Upon obtaining a keyring, 1 of 5 initial candidates is rolled with fixed 20% probability (V1 to V5). This initial roll determines whether the stat lands at the minimum or maximum Lv. 30 value.',
            'Strategic Categories: Dedicated filters for Rally, Base Attack, Base Defense, Herb War, Vaccine Lab, and Saint Vale.',
            'One-Click Tactical Copy: Instantly copies the full sub-stat data card to your clipboard formatted in your current language.'
          ],
          ja: [
            '5候補抽選仕様：キーリング獲得時、5つの初期候補から各20%固定確率で1つが抽選（V1〜V5）。この初期候補がLv.30での最小・最大値を決定。',
            '戦略カテゴリ：集結（ラリー）、拠点攻撃、拠点防衛、ハーブを求めて、ワクチン研究所、SAINT VALE専用フィルター。',
            'ワンクリック戦術コピー：選択中言語で整形されたサブステータス情報をクリップボードへ即座にコピー。'
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
