import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesPath = path.join(__dirname, '..', 'src', 'locales');

const newTranslations = {
  es: {
    footer: {
      disclaimer: "Este es un sitio web informativo creado por fans para fines educativos y de guía. Resident Evil: Survival Unit es un juego co-desarrollado por Aniplex, JOYCITY y Capcom."
    },
    home: {
      news_title: "Últimas Noticias",
      view_all: "VER TODO →",
      update: "ACTUALIZACIÓN",
      new_op: "NUEVO OPERATIVO",
      community: "COMUNIDAD",
      news_1_title: "Parche v1.2: Evento 'Invasión Nemesis' Activo",
      news_1_desc: "Nuevas mecánicas de defensa contra el asedio biológico. Obtén recursos dobles en misiones de asalto.",
      news_2_title: "Claire Redfield se une a la lucha",
      news_2_desc: "Añade a Claire a tu escuadrón. Experta en manejo de armas explosivas y bonos de recolección rápida.",
      news_3_title: "Guía Oficial de Supervivencia: Primeros Pasos",
      news_3_desc: "Conoce los errores más comunes que debes evitar al mejorar el centro de mando al nivel 10."
    },
    heroes: {
      showing: "MOSTRANDO: "
    },
    op_detail: {
      max_stats: "ESTADÍSTICAS MÁXIMAS",
      field_bonuses: "BONIFICACIONES DE CAMPO",
      base_troops: "TROPAS BASE",
      field_skills: "HABILIDADES DE CAMPO",
      explore_skills: "HABILIDADES DE EXPLORACIÓN",
      rarity_desc_1: "Este operativo es de rareza ",
      rarity_desc_2: ", por lo que dispone de ",
      rarity_desc_3: " habilidades activas y pasivas en total. (Datos específicos de habilidad se añadirán pronto).",
      exp_plan: "PLANIFICA TUS RECURSOS DE ENTRENAMIENTO TÁCTICO",
      curr_level: "NIVEL ACTUAL",
      target_level: "NIVEL DESEADO",
      total_exp_req: "EXPERIENCIA TOTAL REQUERIDA",
      ascension_calc: "Calculadora de Ascenso",
      req_contracts: "CONTRATOS DE OPERATIVO NECESARIOS",
      curr_state: "ESTADO ACTUAL",
      star: " ESTRELLA",
      node: " NODO",
      target: "OBJETIVO",
      total_contracts_req: "CONTRATOS TOTALES REQUERIDOS",
      contracts_note: "No incluye los 10 contratos iniciales para desbloquear al personaje.",
      books_calc: "Calculadora de Libros",
      upgrade_skill: "MEJORA DE UNA HABILIDAD ESPECÍFICA",
      curr_skill_level: "NIVEL ACTUAL (1-5)",
      target_skill_level: "NIVEL DESEADO (1-5)",
      req_books: "LIBROS DE HABILIDAD REQUERIDOS",
      max_cost_1: "Costo Máximo (1 Habilidad): ",
      max_cost_total: "Costo Máximo (Total ",
      max_cost_total_2: "): ",
      equip_summary: "Resumen Total de Equipamiento",
      proj_resources: "PROYECCIÓN DE RECURSOS COMBINADOS",
      breakdown: "DESGLOSE POR ARMA",
      big_gun: "Arma Grande",
      pistol: "Pistola",
      revolver: "Revólver",
      knife: "Cuchillo",
      components: "Componentes",
      total_exp_cost: "COSTO TOTAL DE EXPERIENCIA",
      exp_equivalents: "EQUIVALENCIAS DE EXP (CUALQUIERA DE ESTAS OPCIONES TE SIRVE):",
      mat_green: "Mat. Verde:",
      mat_purple: "Mat. Morado:",
      gun_gray: "Arma Gris:",
      gun_green: "Arma Verde:",
      gun_blue: "Arma Azul:",
      gun_purple: "Arma Morada:",
      total_comp_cost: "COSTO TOTAL COMPONENTES (+)",
      base_level: "Nivel Base",
      plus_level: "Nivel de Mejora (+)"
    },
    comparador: {
      analysis: "Análisis ",
      comparative: "Comparativo",
      sim_desc: "Simulación de combate directo. Solo operativos de la misma clase táctica son elegibles para comparación.",
      vs: "VS",
      select_op: "SELECCIONAR OPERATIVO",
      must_be: "Debe ser ",
      search_name: "Buscar por nombre...",
      no_ops: "No hay operativos disponibles para esta selección.",
      base_perf: "Desempeño Base (Nivel 1)",
      field_pct: "Porcentajes de Campo (Habilidades)",
      tactical_res: "Resolución Táctica",
      close_eval: "Cerrar Evaluación",
      sys_error: "ERROR DE SISTEMA. IMPOSIBLE COMUNICARSE CON EL MAINFRAME."
    },
    tools_page: {
      tactical_tools: "Herramientas Tácticas",
      tools_desc: "Calcula la producción de tropas y simula escenarios de combate con la asistencia directa de la IA Red Queen."
    }
  },
  en: {
    footer: {
      disclaimer: "This is an informative fan-made website for educational and guide purposes. Resident Evil: Survival Unit is a game co-developed by Aniplex, JOYCITY, and Capcom."
    },
    home: {
      news_title: "Latest News",
      view_all: "VIEW ALL →",
      update: "UPDATE",
      new_op: "NEW OPERATIVE",
      community: "COMMUNITY",
      news_1_title: "Patch v1.2: 'Nemesis Invasion' Event Active",
      news_1_desc: "New defense mechanics against the biological siege. Get double resources in assault missions.",
      news_2_title: "Claire Redfield joins the fight",
      news_2_desc: "Add Claire to your squad. Expert in handling explosive weapons and fast gathering bonuses.",
      news_3_title: "Official Survival Guide: First Steps",
      news_3_desc: "Learn the most common mistakes to avoid when upgrading your command center to level 10."
    },
    heroes: {
      showing: "SHOWING: "
    },
    op_detail: {
      max_stats: "MAX STATS",
      field_bonuses: "FIELD BONUSES",
      base_troops: "BASE TROOPS",
      field_skills: "FIELD SKILLS",
      explore_skills: "EXPLORATION SKILLS",
      rarity_desc_1: "This operative is of ",
      rarity_desc_2: " rarity, so they have ",
      rarity_desc_3: " active and passive skills in total. (Specific skill data will be added soon).",
      exp_plan: "PLAN YOUR TACTICAL TRAINING RESOURCES",
      curr_level: "CURRENT LEVEL",
      target_level: "TARGET LEVEL",
      total_exp_req: "TOTAL EXP REQUIRED",
      ascension_calc: "Ascension Calculator",
      req_contracts: "REQUIRED OPERATIVE CONTRACTS",
      curr_state: "CURRENT STATE",
      star: " STAR",
      node: " NODE",
      target: "TARGET",
      total_contracts_req: "TOTAL CONTRACTS REQUIRED",
      contracts_note: "Does not include the 10 initial contracts to unlock the character.",
      books_calc: "Skill Books Calculator",
      upgrade_skill: "UPGRADE A SPECIFIC SKILL",
      curr_skill_level: "CURRENT LEVEL (1-5)",
      target_skill_level: "TARGET LEVEL (1-5)",
      req_books: "SKILL BOOKS REQUIRED",
      max_cost_1: "Max Cost (1 Skill): ",
      max_cost_total: "Max Cost (Total ",
      max_cost_total_2: "): ",
      equip_summary: "Equipment Summary",
      proj_resources: "COMBINED RESOURCES PROJECTION",
      breakdown: "BREAKDOWN BY WEAPON",
      big_gun: "Big Gun",
      pistol: "Pistol",
      revolver: "Revolver",
      knife: "Knife",
      components: "Components",
      total_exp_cost: "TOTAL EXP COST",
      exp_equivalents: "EXP EQUIVALENTS (ANY OF THESE OPTIONS WORK):",
      mat_green: "Green Mat:",
      mat_purple: "Purple Mat:",
      gun_gray: "Gray Gun:",
      gun_green: "Green Gun:",
      gun_blue: "Blue Gun:",
      gun_purple: "Purple Gun:",
      total_comp_cost: "TOTAL COMPONENT COST (+)",
      base_level: "Base Level",
      plus_level: "Plus Level (+)"
    },
    comparador: {
      analysis: "Analysis ",
      comparative: "Comparative",
      sim_desc: "Direct combat simulation. Only operatives of the same tactical class are eligible for comparison.",
      vs: "VS",
      select_op: "SELECT OPERATIVE",
      must_be: "Must be ",
      search_name: "Search by name...",
      no_ops: "No operatives available for this selection.",
      base_perf: "Base Performance (Level 1)",
      field_pct: "Field Percentages (Skills)",
      tactical_res: "Tactical Resolution",
      close_eval: "Close Evaluation",
      sys_error: "SYSTEM ERROR. UNABLE TO COMMUNICATE WITH MAINFRAME."
    },
    tools_page: {
      tactical_tools: "Tactical Tools",
      tools_desc: "Calculate troop production and simulate combat scenarios with direct assistance from the Red Queen AI."
    }
  },
  ja: {
    footer: {
      disclaimer: "このサイトは、教育およびガイドを目的としたファン作成の情報ウェブサイトです。Resident Evil: Survival Unitは、Aniplex、JOYCITY、およびカプコンが共同開発したゲームです。"
    },
    home: {
      news_title: "最新ニュース",
      view_all: "すべて見る →",
      update: "アップデート",
      new_op: "新工作員",
      community: "コミュニティ",
      news_1_title: "パッチv1.2: 「ネメシス侵攻」イベント開催中",
      news_1_desc: "生物的包囲に対する新たな防衛メカニズム。強襲ミッションで2倍の資源を獲得。",
      news_2_title: "クレア・レッドフィールドが参戦",
      news_2_desc: "クレアを部隊に加えましょう。爆発武器の扱いに長け、迅速な採集ボーナスを持ちます。",
      news_3_title: "公式サバイバルガイド: 最初のステップ",
      news_3_desc: "コマンドセンターをレベル10にアップグレードする際に避けるべき最も一般的な間違いを学びます。"
    },
    heroes: {
      showing: "表示中: "
    },
    op_detail: {
      max_stats: "最大ステータス",
      field_bonuses: "フィールドボーナス",
      base_troops: "基本部隊",
      field_skills: "フィールドスキル",
      explore_skills: "探索スキル",
      rarity_desc_1: "この工作員は ",
      rarity_desc_2: " レアリティで、合計 ",
      rarity_desc_3: " 個のアクティブおよびパッシブスキルを持ちます。（詳細なスキルデータは近日追加予定）。",
      exp_plan: "戦術訓練リソースを計画する",
      curr_level: "現在のレベル",
      target_level: "目標レベル",
      total_exp_req: "必要な合計経験値",
      ascension_calc: "昇進計算機",
      req_contracts: "必要な工作員契約書",
      curr_state: "現在の状態",
      star: " 星",
      node: " ノード",
      target: "目標",
      total_contracts_req: "必要な合計契約書",
      contracts_note: "キャラクターをアンロックするための最初の10個の契約書は含まれていません。",
      books_calc: "スキルブック計算機",
      upgrade_skill: "特定のスキルをアップグレード",
      curr_skill_level: "現在のレベル (1-5)",
      target_skill_level: "目標レベル (1-5)",
      req_books: "必要なスキルブック",
      max_cost_1: "最大コスト (1スキル): ",
      max_cost_total: "最大コスト (合計 ",
      max_cost_total_2: "): ",
      equip_summary: "装備の概要",
      proj_resources: "統合リソース予測",
      breakdown: "武器別の内訳",
      big_gun: "大型銃",
      pistol: "ハンドガン",
      revolver: "リボルバー",
      knife: "ナイフ",
      components: "コンポーネント",
      total_exp_cost: "合計経験値コスト",
      exp_equivalents: "経験値の等価物（これらのオプションのいずれかで機能します）:",
      mat_green: "緑の素材:",
      mat_purple: "紫の素材:",
      gun_gray: "灰色の銃:",
      gun_green: "緑の銃:",
      gun_blue: "青の銃:",
      gun_purple: "紫の銃:",
      total_comp_cost: "合計コンポーネントコスト (+)",
      base_level: "ベースレベル",
      plus_level: "強化レベル (+)"
    },
    comparador: {
      analysis: "分析 ",
      comparative: "比較",
      sim_desc: "直接戦闘シミュレーション。同じ戦術クラスの工作員のみが比較対象となります。",
      vs: "対",
      select_op: "工作員を選択",
      must_be: "指定: ",
      search_name: "名前で検索...",
      no_ops: "この選択で利用可能な工作員はいません。",
      base_perf: "基本性能 (レベル1)",
      field_pct: "フィールド割合 (スキル)",
      tactical_res: "戦術的解決",
      close_eval: "評価を閉じる",
      sys_error: "システムエラー。メインフレームと通信できません。"
    },
    tools_page: {
      tactical_tools: "戦術ツール",
      tools_desc: "部隊の生産を計算し、レッドクイーンAIの直接支援を受けて戦闘シナリオをシミュレートします。"
    }
  }
};

const deepMerge = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
};

for (const lang of ['es', 'en', 'ja']) {
  const filePath = path.join(localesPath, lang, 'translation.json');
  let current = {};
  if (fs.existsSync(filePath)) {
    current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  const merged = deepMerge(current, newTranslations[lang]);
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8');
}

console.log("Translations added successfully.");
