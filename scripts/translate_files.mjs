import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replaceInFile = (filePath, replacements) => {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(filePath, content, 'utf8');
};

const opDetallePath = path.join(__dirname, '..', 'src', 'pages', 'OperativoDetalle.tsx');

replaceInFile(opDetallePath, [
  [
    `{[
            { id: 'skills', label: 'Habilidades' },
            { id: 'exp', label: 'Calc. Experiencia' },
            { id: 'stars', label: 'Calc. Ascenso (Contratos)' },
            { id: 'books', label: 'Calc. Libros Habilidad' },
            { id: 'equipment', label: 'Equipamiento' }
          ].map`,
    `{[
            { id: 'skills', label: t('op_detail.tab_skills') },
            { id: 'exp', label: t('op_detail.tab_exp') },
            { id: 'stars', label: t('op_detail.tab_stars') },
            { id: 'books', label: t('op_detail.tab_books') },
            { id: 'equipment', label: t('op_detail.tab_equipment') }
          ].map`
  ],
  [
    `<span className="font-bebas tracking-widest">SALUD</span>`,
    `<span className="font-bebas tracking-widest">{t('heroes.health')}</span>`
  ],
  [
    `<span className="font-bebas tracking-widest">ATAQUE</span>`,
    `<span className="font-bebas tracking-widest">{t('heroes.attack')}</span>`
  ],
  [
    `<span className="font-bebas tracking-widest">DEFENSA</span>`,
    `<span className="font-bebas tracking-widest">{t('heroes.defense')}</span>`
  ],
  [
    `Estadísticas Máximas`,
    `{t('op_detail.max_stats')}`
  ],
  [
    `Bonificaciones de Campo`,
    `{t('op_detail.field_bonuses')}`
  ],
  [
    `Tropas Base`,
    `{t('op_detail.base_troops')}`
  ],
  [
    `<h2 className="font-bebas text-3xl tracking-widest text-white mb-6 flex items-center gap-3">
                <Star className="text-neon-red" /> Archivos de Habilidad
              </h2>
              <div className="text-gray-400 font-mono text-sm mb-8 leading-relaxed">
                Este operativo es de rareza <span className="text-white">{rarity}</span>, por lo que dispone de <span className="text-neon-red font-bold">{maxSkills}</span> habilidades activas y pasivas en total. (Datos específicos de habilidad se añadirán pronto).
              </div>`,
    `<div className="flex gap-4 items-start mb-8">
                <div className="w-12 h-12 bg-blood-red/10 border border-blood-red flex items-center justify-center text-neon-red flex-shrink-0">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 className="font-bebas text-2xl text-white tracking-widest">{t('comparador.skill_archives')}</h4>
                  <p className="font-inter text-sm text-gray-400 mt-1">
                    {t('op_detail.rarity_desc_1')}<span className="text-neon-red uppercase font-mono">{rarity}</span>{t('op_detail.rarity_desc_2')}
                    <span className="text-white font-bold font-mono">{maxSkills}</span>{t('op_detail.rarity_desc_3')}
                  </p>
                </div>
              </div>`
  ],
  [
    `Habilidades de Campo`,
    `{t('op_detail.field_skills')}`
  ],
  [
    `Habilidades de Exploración`,
    `{t('op_detail.explore_skills')}`
  ],
  [
    `Calculadora de Experiencia`,
    `{t('op_detail.tab_exp')}`
  ],
  [
    `PLANIFICA TUS RECURSOS DE ENTRENAMIENTO TÁCTICO`,
    `{t('op_detail.exp_plan')}`
  ],
  [
    `Nivel Actual (1-80)`,
    `{t('op_detail.curr_level')}`
  ],
  [
    `Nivel Deseado (1-80)`,
    `{t('op_detail.target_level')}`
  ],
  [
    `Experiencia Total Requerida`,
    `{t('op_detail.total_exp_req')}`
  ],
  [
    `Calculadora de Ascenso`,
    `{t('op_detail.ascension_calc')}`
  ],
  [
    `Contratos de Operativo necesarios`,
    `{t('op_detail.req_contracts')}`
  ],
  [
    `<h3 className="font-mono text-neon-red text-sm tracking-widest uppercase mb-2">Estado Actual</h3>`,
    `<h3 className="font-mono text-neon-red text-sm tracking-widest uppercase mb-2">{t('op_detail.curr_state')}</h3>`
  ],
  [
    `Estrella{currentStar !== 1 ? 's' : ''} / {currentNode} Asta{currentNode !== 1 ? 's' : ''}`,
    `{t('op_detail.star')} / {currentNode} {t('op_detail.node')}`
  ],
  [
    `<h3 className="font-mono text-yellow-500 text-sm tracking-widest uppercase mb-2">Objetivo</h3>`,
    `<h3 className="font-mono text-yellow-500 text-sm tracking-widest uppercase mb-2">{t('op_detail.target')}</h3>`
  ],
  [
    `Estrella{targetStar !== 1 ? 's' : ''} / {targetNode} Asta{targetNode !== 1 ? 's' : ''}`,
    `{t('op_detail.star')} / {targetNode} {t('op_detail.node')}`
  ],
  [
    `Contratos Totales Requeridos`,
    `{t('op_detail.total_contracts_req')}`
  ],
  [
    `No incluye los 10 contratos iniciales para desbloquear al personaje.`,
    `{t('op_detail.contracts_note')}`
  ],
  [
    `Calculadora de Libros`,
    `{t('op_detail.books_calc')}`
  ],
  [
    `Mejora de una Habilidad Específica`,
    `{t('op_detail.upgrade_skill')}`
  ],
  [
    `Nivel Actual (1-5)`,
    `{t('op_detail.curr_skill_level')}`
  ],
  [
    `Nivel Deseado (1-5)`,
    `{t('op_detail.target_skill_level')}`
  ],
  [
    `Libros de Habilidad Requeridos`,
    `{t('op_detail.req_books')}`
  ],
  [
    `Costo Máximo (1 Habilidad): 165`,
    `{t('op_detail.max_cost_1')} 165`
  ],
  [
    `Costo Máximo (Total {rarity}): {165 * maxSkills}`,
    `{t('op_detail.max_cost_total')}{rarity}{t('op_detail.max_cost_total_2')} {165 * maxSkills}`
  ]
]);

const comparadorPath = path.join(__dirname, '..', 'src', 'pages', 'Comparador.tsx');
replaceInFile(comparadorPath, [
  [
    `ERROR DE SISTEMA. IMPOSIBLE COMUNICARSE CON EL MAINFRAME.`,
    `t('comparador.sys_error')`
  ],
  [
    `"Simulación de combate directo. Solo operativos de la misma clase táctica son elegibles para comparación."`,
    `t('comparador.sim_desc')`
  ],
  [
    `"SELECCIONAR OPERATIVO"`,
    `t('comparador.select_op')`
  ],
  [
    `"Debe ser "`,
    `t('comparador.must_be')`
  ],
  [
    `placeholder="Buscar por nombre..."`,
    `placeholder={t('comparador.search_name')}`
  ],
  [
    `"No hay operativos disponibles para esta selección."`,
    `t('comparador.no_ops')`
  ],
  [
    `"Desempeño Base (Nivel 1)"`,
    `t('comparador.base_perf')`
  ],
  [
    `"Salud"`,
    `t('heroes.health')`
  ],
  [
    `"Ataque"`,
    `t('heroes.attack')`
  ],
  [
    `"Defensa"`,
    `t('heroes.defense')`
  ],
  [
    `"Porcentajes de Campo (Habilidades)"`,
    `t('comparador.field_pct')`
  ],
  [
    `"Resolución Táctica"`,
    `t('comparador.tactical_res')`
  ],
  [
    `"Cerrar Evaluación"`,
    `t('comparador.close_eval')`
  ],
  [
    `"Análisis "`,
    `t('comparador.analysis')`
  ],
  [
    `"Comparativo"`,
    `t('comparador.comparative')`
  ]
]);

console.log("Replaced strings successfully.");
