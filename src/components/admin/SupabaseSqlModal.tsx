import React, { useState } from 'react';
import { Database, Copy, Check, X, AlertTriangle } from 'lucide-react';
import { useSound } from '../../contexts/SoundContext';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_MIGRATION_SCRIPT = `-- ================================================================
-- UMBRELLA NETWORK DATABASE: ACTUALIZACIÓN DE EVENTOS Y VACUNAS
-- Ejecuta este script en el "SQL Editor" de tu proyecto en Supabase
-- ================================================================

-- 1. Añadir columnas para el nuevo evento de Alianza: Repeler a Mortem
ALTER TABLE guild_activity_cycles
ADD COLUMN IF NOT EXISTS mortem_prep_points BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS mortem_damage BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS mortem_shield_damage BIGINT DEFAULT 0;

-- 2. Añadir columna para los Equipos y Roles de Vacunas (Laboratorio)
ALTER TABLE guild_activity_cycles
ADD COLUMN IF NOT EXISTS vacunas_role TEXT DEFAULT 'none';

-- 3. Verificar que la tabla de configuración del gremio exista y soporte JSONB
CREATE TABLE IF NOT EXISTS guild_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Notificación de éxito
COMMENT ON COLUMN guild_activity_cycles.mortem_damage IS 'Daño individual infligido al jefe Mortem';
COMMENT ON COLUMN guild_activity_cycles.mortem_shield_damage IS 'Daño cooperativo enfocado en el escudo de Mortem';
COMMENT ON COLUMN guild_activity_cycles.vacunas_role IS 'Rol en Vacunas: team1_titular, team1_suplente, team2_titular, team2_suplente, none';
`;

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const { playClick } = useSound();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    playClick();
    navigator.clipboard.writeText(SQL_MIGRATION_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#0c0c0c] border border-gray-800 w-full max-w-2xl shadow-[0_0_50px_rgba(255,42,42,0.15)] flex flex-col max-h-[92vh] rounded-sm relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blood-red/20 border border-blood-red/50 flex items-center justify-center rounded-sm text-neon-red">
              <Database size={18} />
            </div>
            <div>
              <h3 className="font-bebas text-xl sm:text-2xl tracking-widest text-white">
                ACTUALIZAR TABLAS EN SUPABASE
              </h3>
              <p className="font-mono text-xs text-gray-400">
                Script SQL para habilitar las nuevas columnas de Mortem y Vacunas en Postgres
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-gray-500 hover:text-white p-1.5 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Instructions banner */}
        <div className="p-4 bg-amber-950/30 border-b border-amber-800/40 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="font-mono text-xs text-amber-200/90 leading-relaxed">
            <strong>¿Cómo aplicar este cambio?</strong>
            <ol className="list-decimal list-inside mt-1 space-y-0.5 text-gray-300 text-[11px]">
              <li>Haz clic en el botón verde <strong>"Copiar Script SQL"</strong> abajo.</li>
              <li>Abre tu consola de <strong>Supabase</strong> &gt; sección <strong>SQL Editor</strong>.</li>
              <li>Pega el código y haz clic en <strong>RUN</strong>. ¡Y listo! Las columnas quedarán creadas de forma permanente.</li>
            </ol>
          </div>
        </div>

        {/* SQL Code Box */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <pre className="bg-black border border-gray-800 p-4 font-mono text-xs text-green-400 overflow-x-auto whitespace-pre rounded-sm leading-relaxed max-h-[45vh]">
            {SQL_MIGRATION_SCRIPT}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-between items-center bg-[#070707]">
          <span className="font-mono text-[11px] text-gray-500">
            Seguro de ejecutar: utiliza comandos IF NOT EXISTS
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
              className={`px-5 py-2 font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${copied ? 'bg-green-700 text-white border border-green-500' : 'bg-blood-red/30 border border-blood-red text-neon-red hover:bg-blood-red hover:text-white shadow-[0_0_15px_rgba(255,42,42,0.3)]'}`}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  ¡Copiado al Portapapeles!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copiar Script SQL
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
