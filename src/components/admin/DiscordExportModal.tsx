import React, { useState } from 'react';
import { Share2, Copy, Check, X, Swords, Shield, Building2, Trophy, Users, Award, Skull } from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';

export interface ClanMember {
  id: string;
  nickname: string;
  rank: string;
  account_type?: 'main' | 'alt';
  power?: number;
}

export interface ActivityRecord {
  id?: string;
  member_id: string;
  cycle_date: string;
  power: number;
  mansion_level: number;
  alliance_points: number;
  tac_joined: boolean;
  tac_power: number;
  lab_joined: boolean;
  lab_points: number;
  nemesis_difficulty: string;
  nemesis_level: number;
  nemesis_phase: number;
  crocodile_damage: number;
  saint_valley: boolean;
  wesker_points: number;
  security_centers: boolean;
  security_centers_data?: string[];
}

export interface MortemMemberData {
  prep_points?: number;
  damage?: number;
  shield_damage?: number;
}

export interface MortemAllianceMeta {
  server_rank?: string;
  strategy_notes?: string;
}

interface DiscordExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAlliance: string;
  selectedDate: string;
  members: ClanMember[];
  activities: Record<string, ActivityRecord>;
  activeCenters: string[];
  vacunasTeams?: Record<string, string>;
  mortemData?: Record<string, MortemMemberData>;
  mortemAllianceMeta?: MortemAllianceMeta;
  participationScores?: Record<string, { total: number; max: number; level: string }>;
  initialTab?: string;
}

export const DiscordExportModal: React.FC<DiscordExportModalProps> = ({
  isOpen,
  onClose,
  activeAlliance,
  selectedDate,
  members,
  activities,
  activeCenters,
  vacunasTeams = {},
  mortemData = {},
  mortemAllianceMeta = {},
  participationScores = {},
  initialTab = 'crocodile'
}) => {
  const { playClick } = useSound();
  const [selectedFormat, setSelectedFormat] = useState<string>(
    initialTab === 'lab' ? 'vacunas' : initialTab
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeMembers = members.filter(m => m.account_type === 'main');
  const altMembers = members.filter(m => m.account_type === 'alt');

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const formatMillions = (num: number) => {
    return ((num || 0) / 1000000).toFixed(2) + 'M';
  };

  const padRight = (str: string, len: number) => {
    return (str + ' '.repeat(len)).slice(0, len);
  };

  const padLeft = (str: string, len: number) => {
    return (' '.repeat(len) + str).slice(-len);
  };

  // Generate formatted Discord markdown text
  const generateDiscordText = (): string => {
    const divider = '='.repeat(48);
    const subDivider = '-'.repeat(48);

    switch (selectedFormat) {
      case 'crocodile': {
        const sorted = [...members]
          .map(m => ({ member: m, act: activities[m.id] }))
          .sort((a, b) => (b.act?.crocodile_damage || 0) - (a.act?.crocodile_damage || 0));

        const attackers = sorted.filter(s => (s.act?.crocodile_damage || 0) > 0);
        const zeroAttackers = sorted.filter(s => !s.act?.crocodile_damage || s.act.crocodile_damage === 0);
        const totalDamage = attackers.reduce((acc, s) => acc + (s.act?.crocodile_damage || 0), 0);

        let out = `\`\`\`yaml\n`;
        out += `# ================================================\n`;
        out += `# [REPORTE TÁCTICO: CAZA DEL CAIMÁN / COCODRILO]\n`;
        out += `# ALIANZA: ${activeAlliance} | CICLO: ${selectedDate}\n`;
        out += `# DAÑO TOTAL: ${formatNumber(totalDamage)} (${formatMillions(totalDamage)})\n`;
        out += `# PARTICIPACIÓN: ${attackers.length}/${members.length} Operativos\n`;
        out += `# ================================================\n\n`;

        out += `TOP_ATACANTES:\n`;
        attackers.slice(0, 15).forEach((item, idx) => {
          const medal = idx === 0 ? '[TOP 1]' : idx === 1 ? '[TOP 2]' : idx === 2 ? '[TOP 3]' : `#${idx + 1}    `;
          const name = padRight(item.member.nickname, 16);
          const dmg = padLeft(formatNumber(item.act?.crocodile_damage || 0), 14);
          out += `  ${medal} [${item.member.rank}] ${name} : ${dmg}\n`;
        });

        if (attackers.length > 15) {
          out += `\nRESTO_DE_ATACANTES:\n`;
          attackers.slice(15).forEach((item, idx) => {
            const name = padRight(item.member.nickname, 16);
            const dmg = padLeft(formatNumber(item.act?.crocodile_damage || 0), 14);
            out += `  #${idx + 16}    [${item.member.rank}] ${name} : ${dmg}\n`;
          });
        }

        if (zeroAttackers.length > 0) {
          out += `\nAUSENTES_O_SIN_DAÑO (${zeroAttackers.length}):\n`;
          zeroAttackers.forEach(item => {
            out += `  - [${item.member.rank}] ${item.member.nickname} ${item.member.account_type === 'alt' ? '(Secundaria)' : ''}\n`;
          });
        }

        out += `\`\`\``;
        return out;
      }

      case 'tac': {
        const sorted = [...members]
          .map(m => ({ member: m, act: activities[m.id] }))
          .sort((a, b) => (b.act?.tac_power || 0) - (a.act?.tac_power || 0));

        const joined = sorted.filter(s => s.act?.tac_joined || (s.act?.tac_power || 0) > 0);
        const missing = sorted.filter(s => !s.act?.tac_joined && (!s.act?.tac_power || s.act.tac_power === 0));

        let out = `\`\`\`ini\n`;
        out += `[ REPORTE OFICIAL: TORNEO DE ALIANZA (TAC) ]\n`;
        out += `Alianza = ${activeAlliance}\n`;
        out += `Ciclo = ${selectedDate}\n`;
        out += `Asistencias = ${joined.length}/${members.length}\n`;
        out += `${divider}\n\n`;

        out += `[ASISTENCIA CONFIRMADA] (Poder Registrado)\n`;
        joined.forEach((item, idx) => {
          const name = padRight(item.member.nickname, 16);
          const pwr = padLeft(formatMillions(item.act?.tac_power || 0), 10);
          out += `${idx + 1}. [${item.member.rank}] ${name} = ${pwr}\n`;
        });

        if (missing.length > 0) {
          out += `\n[FALTA DE ASISTENCIA] (${missing.length})\n`;
          missing.forEach(item => {
            out += `- [${item.member.rank}] ${item.member.nickname}\n`;
          });
        }

        out += `\`\`\``;
        return out;
      }

      case 'vacunas':
      case 'lab': {
        // Teams division
        const team1Titulares = members.filter(m => vacunasTeams[m.id] === 'team1_titular');
        const team1Suplentes = members.filter(m => vacunasTeams[m.id] === 'team1_suplente');
        const team2Titulares = members.filter(m => vacunasTeams[m.id] === 'team2_titular');
        const team2Suplentes = members.filter(m => vacunasTeams[m.id] === 'team2_suplente');

        const sorted = [...members]
          .map(m => ({ member: m, act: activities[m.id], team: vacunasTeams[m.id] }))
          .sort((a, b) => (b.act?.lab_points || 0) - (a.act?.lab_points || 0));

        const participants = sorted.filter(s => s.act?.lab_joined || (s.act?.lab_points || 0) > 0 || (s.team && s.team !== 'none'));
        const totalPoints = sorted.reduce((acc, s) => acc + (s.act?.lab_points || 0), 0);

        let out = `\`\`\`asciidoc\n`;
        out += `=== REPORTE ASALTO AL LABORATORIO (VACUNAS) ===\n`;
        out += `Alianza: ${activeAlliance} | Fecha: ${selectedDate}\n`;
        out += `Puntos Totales: ${formatNumber(totalPoints)}\n`;
        out += `Participantes Totales: ${participants.length}/${members.length}\n`;
        out += `${subDivider}\n\n`;

        out += `[EQUIPO 1] (Titulares: ${team1Titulares.length}/30 | Suplentes: ${team1Suplentes.length}/10)\n`;
        out += `  Titulares:\n`;
        if (team1Titulares.length > 0) {
          team1Titulares.forEach((m, idx) => {
            const pts = activities[m.id]?.lab_points ? ` (${formatNumber(activities[m.id].lab_points)} pts)` : '';
            out += `    ${idx + 1}. [${m.rank}] ${m.nickname}${pts}\n`;
          });
        } else {
          out += `    (Sin titulares asignados)\n`;
        }
        if (team1Suplentes.length > 0) {
          out += `  Suplentes (En reserva):\n`;
          team1Suplentes.forEach((m) => {
            out += `    * [${m.rank}] ${m.nickname}\n`;
          });
        }

        out += `\n[EQUIPO 2] (Titulares: ${team2Titulares.length}/30 | Suplentes: ${team2Suplentes.length}/10)\n`;
        out += `  Titulares:\n`;
        if (team2Titulares.length > 0) {
          team2Titulares.forEach((m, idx) => {
            const pts = activities[m.id]?.lab_points ? ` (${formatNumber(activities[m.id].lab_points)} pts)` : '';
            out += `    ${idx + 1}. [${m.rank}] ${m.nickname}${pts}\n`;
          });
        } else {
          out += `    (Sin titulares asignados)\n`;
        }
        if (team2Suplentes.length > 0) {
          out += `  Suplentes (En reserva):\n`;
          team2Suplentes.forEach((m) => {
            out += `    * [${m.rank}] ${m.nickname}\n`;
          });
        }

        out += `\`\`\``;
        return out;
      }

      case 'mortem': {
        const sorted = [...members]
          .map(m => ({ member: m, data: mortemData[m.id] || {} }))
          .sort((a, b) => ((b.data.damage || 0) + (b.data.shield_damage || 0)) - ((a.data.damage || 0) + (a.data.shield_damage || 0)));

        const participants = sorted.filter(s => (s.data.damage || 0) > 0 || (s.data.shield_damage || 0) > 0 || (s.data.prep_points || 0) > 0);
        const totalDamage = sorted.reduce((acc, s) => acc + (s.data.damage || 0), 0);
        const totalShieldDamage = sorted.reduce((acc, s) => acc + (s.data.shield_damage || 0), 0);
        const totalPrep = sorted.reduce((acc, s) => acc + (s.data.prep_points || 0), 0);

        let out = `\`\`\`yaml\n`;
        out += `# ================================================\n`;
        out += `# [REPORTE TÁCTICO: REPELER A MORTEM]\n`;
        out += `# ALIANZA: ${activeAlliance} | CICLO: ${selectedDate}\n`;
        if (mortemAllianceMeta.server_rank) {
          out += `# RANKING SERVIDOR: ${mortemAllianceMeta.server_rank}\n`;
        }
        out += `# DAÑO TOTAL MORTEM: ${formatNumber(totalDamage)} (${formatMillions(totalDamage)})\n`;
        out += `# DESTRUCCIÓN ESCUDO: ${formatNumber(totalShieldDamage)} (${formatMillions(totalShieldDamage)})\n`;
        out += `# PUNTOS PREPARACIÓN: ${formatNumber(totalPrep)}\n`;
        out += `# PARTICIPANTES: ${participants.length}/${members.length}\n`;
        out += `# ================================================\n\n`;

        if (mortemAllianceMeta.strategy_notes) {
          out += `NOTAS_ESTRATEGIA:\n`;
          out += `  "${mortemAllianceMeta.strategy_notes}"\n\n`;
        }

        out += `TOP_DESTRUCTORES_ESCUDO (Cooperativo):\n`;
        const shieldBreakers = [...sorted]
          .filter(s => (s.data.shield_damage || 0) > 0)
          .sort((a, b) => (b.data.shield_damage || 0) - (a.data.shield_damage || 0));

        shieldBreakers.slice(0, 10).forEach((item, idx) => {
          const medal = idx === 0 ? '[LÍDER ESCUDO]' : `#${idx + 1}          `;
          const name = padRight(item.member.nickname, 16);
          const dmg = padLeft(formatNumber(item.data.shield_damage || 0), 12);
          out += `  ${medal} [${item.member.rank}] ${name} : ${dmg}\n`;
        });

        out += `\nTOP_DAÑO_MORTEM:\n`;
        const bossHitters = [...sorted]
          .filter(s => (s.data.damage || 0) > 0)
          .sort((a, b) => (b.data.damage || 0) - (a.data.damage || 0));

        bossHitters.slice(0, 12).forEach((item, idx) => {
          const medal = idx === 0 ? '[TOP 1]' : idx === 1 ? '[TOP 2]' : idx === 2 ? '[TOP 3]' : `#${idx + 1}    `;
          const name = padRight(item.member.nickname, 16);
          const dmg = padLeft(formatNumber(item.data.damage || 0), 12);
          out += `  ${medal} [${item.member.rank}] ${name} : ${dmg}\n`;
        });

        out += `\`\`\``;
        return out;
      }

      case 'participation': {
        const sorted = [...members]
          .map(m => ({ member: m, score: participationScores[m.id] || { total: 0, max: 7, level: 'Baja' } }))
          .sort((a, b) => b.score.total - a.score.total);

        const elite = sorted.filter(s => s.score.total >= 7);
        const high = sorted.filter(s => s.score.total >= 5 && s.score.total < 7);
        const regular = sorted.filter(s => s.score.total >= 3 && s.score.total < 5);
        const low = sorted.filter(s => s.score.total < 3);

        let out = `\`\`\`asciidoc\n`;
        out += `=== [RANKING DE PARTICIPACIÓN & RECOMPENSAS] ===\n`;
        out += `Alianza: ${activeAlliance} | Ciclo: ${selectedDate}\n`;
        out += `Puntaje Máximo Posible: 7 Puntos de Compromiso\n`;
        out += `${subDivider}\n\n`;

        out += `[NIVEL 1] ÉLITE SUPREMO (7/7 Puntos - Prioridad Máxima de Recompensas):\n`;
        if (elite.length > 0) {
          elite.forEach(s => {
            out += `  * [${s.member.rank}] ${s.member.nickname} (${s.score.total}/7 pts)\n`;
          });
        } else {
          out += `  (Sin operativos en este rango)\n`;
        }

        out += `\n[NIVEL 2] MUY ACTIVOS (5-6/7 Puntos - Candidatos a Cajas):\n`;
        if (high.length > 0) {
          high.forEach(s => {
            out += `  - [${s.member.rank}] ${s.member.nickname} (${s.score.total}/7 pts)\n`;
          });
        } else {
          out += `  (Sin operativos en este rango)\n`;
        }

        out += `\n[NIVEL 3] ACTIVIDAD REGULAR (3-4/7 Puntos):\n`;
        if (regular.length > 0) {
          regular.forEach(s => {
            out += `  - [${s.member.rank}] ${s.member.nickname} (${s.score.total}/7 pts)\n`;
          });
        }

        out += `\n[NIVEL 4] BAJA PARTICIPACIÓN (0-2/7 Puntos - En Observación):\n`;
        if (low.length > 0) {
          low.forEach(s => {
            out += `  - [${s.member.rank}] ${s.member.nickname} (${s.score.total}/7 pts)\n`;
          });
        }

        out += `\`\`\``;
        return out;
      }

      case 'valley': {
        const joinedValley = members.filter(m => activities[m.id]?.saint_valley);
        const missingValley = members.filter(m => !activities[m.id]?.saint_valley);

        let out = `\`\`\`yaml\n`;
        out += `# ================================================\n`;
        out += `# [REPORTE: VALLE SANTO & CENTROS DE SEGURIDAD]\n`;
        out += `# ALIANZA: ${activeAlliance} | CICLO: ${selectedDate}\n`;
        out += `# ================================================\n\n`;

        out += `VALLE_SANTO_ASISTENCIA (${joinedValley.length}/${members.length}):\n`;
        joinedValley.forEach(m => {
          out += `  - [${m.rank}] ${m.nickname}\n`;
        });

        out += `\nCOBERTURA_CENTROS_DE_SEGURIDAD:\n`;
        activeCenters.forEach(center => {
          const assigned = members.filter(m => (activities[m.id]?.security_centers_data || []).includes(center));
          out += `  ${center} (${assigned.length} defensores):\n`;
          if (assigned.length > 0) {
            assigned.forEach(m => {
              out += `    * [${m.rank}] ${m.nickname}\n`;
            });
          } else {
            out += `    * (Sin defensores registrados)\n`;
          }
        });

        if (missingValley.length > 0) {
          out += `\nAUSENTES_VALLE (${missingValley.length}):\n`;
          missingValley.forEach(m => {
            out += `  - [${m.rank}] ${m.nickname}\n`;
          });
        }

        out += `\`\`\``;
        return out;
      }

      case 'wesker': {
        const sorted = [...members]
          .map(m => ({ member: m, act: activities[m.id] }))
          .sort((a, b) => (b.act?.wesker_points || 0) - (a.act?.wesker_points || 0));

        const scored = sorted.filter(s => (s.act?.wesker_points || 0) > 0);
        const missing = sorted.filter(s => !s.act?.wesker_points || s.act.wesker_points === 0);
        const total = scored.reduce((acc, s) => acc + (s.act?.wesker_points || 0), 0);

        let out = `\`\`\`yaml\n`;
        out += `# ☣️ REPORTE WESKER | ALIANZA ${activeAlliance}\n`;
        out += `# FECHA: ${selectedDate} | PUNTOS TOTALES: ${formatNumber(total)}\n\n`;

        scored.forEach((item, idx) => {
          const name = padRight(item.member.nickname, 16);
          const pts = padLeft(formatNumber(item.act?.wesker_points || 0), 10);
          out += `  #${idx + 1} [\${item.member.rank}] ${name} : ${pts}\n`;
        });

        if (missing.length > 0) {
          out += `\nSIN_PUNTOS (${missing.length}):\n`;
          missing.forEach(item => {
            out += `  - [${item.member.rank}] ${item.member.nickname}\n`;
          });
        }

        out += `\`\`\``;
        return out;
      }

      case 'full':
      default: {
        let out = `\`\`\`asciidoc\n`;
        out += `=== AUDITORÍA SEMANAL GENERAL: ${activeAlliance.toUpperCase()} ===\n`;
        out += `Ciclo: ${selectedDate} | Total Operativos: ${members.length} (Principales: ${activeMembers.length}, Alts: ${altMembers.length})\n`;
        out += `${subDivider}\n`;
        out += `RANK  NOMBRE            PODER      TAC  VAC  VAL  COCODRILO\n`;
        out += `${subDivider}\n`;

        members.forEach(m => {
          const act = activities[m.id];
          const rank = padRight(m.rank, 4);
          const name = padRight(m.nickname, 16);
          const pwr = padRight(formatMillions(act?.power || m.power || 0), 9);
          const tac = act?.tac_joined ? '✅  ' : '❌  ';
          const vac = (act?.lab_joined || vacunasTeams[m.id]) ? '✅  ' : '❌  ';
          const val = act?.saint_valley ? '✅  ' : '❌  ';
          const coco = formatMillions(act?.crocodile_damage || 0);

          out += `${rank}  ${name}  ${pwr}  ${tac}${vac}${val} ${coco}\n`;
        });

        out += `${subDivider}\n`;
        out += `Generado desde el Panel Táctico Umbrella Database-RESU\n`;
        out += `\`\`\``;
        return out;
      }
    }
  };

  const textToCopy = generateDiscordText();

  const handleCopy = () => {
    playClick();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#0c0c0c] border border-gray-800 w-full max-w-3xl shadow-[0_0_50px_rgba(255,42,42,0.15)] flex flex-col max-h-[92vh] rounded-sm relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blood-red/20 border border-blood-red/50 flex items-center justify-center rounded-sm text-neon-red">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="font-bebas text-xl sm:text-2xl tracking-widest text-white">
                EXPORTAR A DISCORD (1-CLIC)
              </h3>
              <p className="font-mono text-xs text-gray-400">
                Formatos especiales para auditoría y recompensas en canales de Discord
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-500 hover:text-white p-1.5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab selection */}
        <div className="p-3 bg-[#111] border-b border-gray-800 flex gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'participation', label: 'Recompensas', icon: Award },
            { id: 'crocodile', label: 'Caimán / Cocodrilo', icon: Swords },
            { id: 'tac', label: 'TAC Torneo', icon: Shield },
            { id: 'vacunas', label: 'Vacunas (Equipos)', icon: Building2 },
            { id: 'mortem', label: 'Repeler a Mortem', icon: Skull },
            { id: 'valley', label: 'Valle & Centros', icon: Trophy },
            { id: 'wesker', label: 'Wesker', icon: Swords },
            { id: 'full', label: 'Resumen General', icon: Users },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { playClick(); setSelectedFormat(tab.id); }}
                className={`flex items-center gap-1.5 px-3 py-2 font-mono text-xs uppercase tracking-wider whitespace-nowrap transition-all border rounded-sm ${selectedFormat === tab.id ? 'bg-blood-red/20 border-neon-red text-white shadow-[0_0_10px_rgba(255,42,42,0.2)]' : 'border-gray-800 text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={14} className={selectedFormat === tab.id ? 'text-neon-red' : 'text-gray-500'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Preview box */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="relative">
            <pre className="bg-black border border-gray-800 p-4 font-mono text-xs text-gray-300 overflow-x-auto whitespace-pre rounded-sm leading-relaxed max-h-[50vh]">
              {textToCopy}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-between items-center bg-[#070707]">
          <span className="font-mono text-[11px] text-gray-500">
            Formato optimizado para visualización con colores y jerarquía en Discord
          </span>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 font-mono text-xs text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 transition-colors uppercase"
            >
              Cerrar
            </button>
            <button
              onClick={handleCopy}
              className={`px-6 py-2 font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${copied ? 'bg-green-700 text-white border border-green-500' : 'bg-blood-red/30 border border-blood-red text-neon-red hover:bg-blood-red hover:text-white shadow-[0_0_15px_rgba(255,42,42,0.3)]'}`}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  ¡Copiado al Portapapeles!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copiar Código para Discord
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
