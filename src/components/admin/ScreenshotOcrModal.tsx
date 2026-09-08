import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Upload, Sparkles, Check, AlertCircle, Trash2, Plus, 
  Key, RefreshCw, X, CheckCircle2, Shield, Edit3
} from 'lucide-react';
import { 
  analyzeGameRankingScreenshot, 
  getGeminiApiKey, 
  setGeminiApiKey, 
} from '../../services/geminiService';
import { useSound } from '../../contexts/SoundContext';

export interface ClanMember {
  id: string;
  nickname: string;
  rank: string;
  account_type?: 'main' | 'alt';
  power?: number;
}

export type EventTargetType = 'crocodile' | 'lab' | 'tac' | 'wesker' | 'power' | 'mortem';

export interface EditableOcrRow {
  id: string;
  rank: number;
  rawName: string;
  points: number;
  memberId: string; // matched member id or empty
  saveAlias: boolean;
}

interface ScreenshotOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: ClanMember[];
  activeAlliance: string;
  knownAliases: Record<string, string[]>; // memberId -> list of aliases
  onApply: (
    updates: { memberId: string; field: string; value: any; extraFields?: Record<string, any> }[],
    newAliases: Record<string, string[]>
  ) => void;
  defaultEvent?: EventTargetType;
}

const EVENT_OPTIONS: { id: EventTargetType; label: string; field: string; desc: string }[] = [
  { id: 'crocodile', label: 'Caza del Caimán', field: 'crocodile_damage', desc: 'Asigna puntos como Daño de Cocodrilo' },
  { id: 'lab', label: 'Vacunas (Lab)', field: 'lab_points', desc: 'Asigna puntos de Vacunas y marca participación (✅)' },
  { id: 'tac', label: 'TAC (Torneo)', field: 'tac_power', desc: 'Asigna poder de TAC y marca participación (✅)' },
  { id: 'mortem', label: 'Repeler a Mortem', field: 'mortem_damage', desc: 'Asigna daño principal infligido a Mortem' },
  { id: 'wesker', label: 'Wesker', field: 'wesker_points', desc: 'Asigna puntos de Wesker' },
  { id: 'power', label: 'Poder de Operativos', field: 'power', desc: 'Actualiza el poder general de los miembros' },
];

export const ScreenshotOcrModal: React.FC<ScreenshotOcrModalProps> = ({
  isOpen,
  onClose,
  members,
  knownAliases,
  onApply,
  defaultEvent = 'crocodile',
}) => {
  const { playClick, playHover } = useSound();
  const [selectedEvent, setSelectedEvent] = useState<EventTargetType>(defaultEvent);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [detectedTitle, setDetectedTitle] = useState('');
  const [extractedRows, setExtractedRows] = useState<EditableOcrRow[]>([]);
  const [step, setStep] = useState<'upload' | 'review'>('upload');

  // API Key management
  const [apiKey, setApiKey] = useState(getGeminiApiKey());
  const [showKeyInput, setShowKeyInput] = useState(!getGeminiApiKey());

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedEvent(defaultEvent);
      setApiKey(getGeminiApiKey());
      setShowKeyInput(!getGeminiApiKey());
      setScanError(null);
    }
  }, [isOpen, defaultEvent]);

  // Clipboard paste listener (Ctrl+V)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setScanError('Por favor selecciona un archivo de imagen válido.');
      return;
    }
    setMimeType(file.type);
    setScanError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Helper to match an OCR raw name to a clan member
  const matchMember = (rawName: string): { memberId: string; matchedByAlias: boolean } => {
    const cleanRaw = rawName.trim().toLowerCase();
    if (!cleanRaw) return { memberId: '', matchedByAlias: false };

    // 1. Check known aliases (case-insensitive)
    for (const [memId, aliases] of Object.entries(knownAliases)) {
      if (Array.isArray(aliases)) {
        for (const alias of aliases) {
          if (alias && alias.trim().toLowerCase() === cleanRaw) {
            return { memberId: memId, matchedByAlias: true };
          }
        }
      }
    }

    // 2. Direct exact nickname match
    const exact = members.find(m => m.nickname.toLowerCase() === cleanRaw);
    if (exact) return { memberId: exact.id, matchedByAlias: false };

    // 3. Normalized / partial match
    const simplifiedRaw = cleanRaw.replace(/[^a-z0-9]/gi, '');
    if (simplifiedRaw.length >= 3) {
      const partial = members.find(m => {
        const memClean = m.nickname.toLowerCase().replace(/[^a-z0-9]/gi, '');
        return memClean === simplifiedRaw || memClean.includes(simplifiedRaw) || simplifiedRaw.includes(memClean);
      });
      if (partial) return { memberId: partial.id, matchedByAlias: false };
    }

    return { memberId: '', matchedByAlias: false };
  };

  const handleScan = async () => {
    if (!imagePreview) {
      setScanError('Primero carga o pega una captura de pantalla.');
      return;
    }

    const currentKey = getGeminiApiKey();
    if (!currentKey) {
      setShowKeyInput(true);
      setScanError('Se requiere una clave API de Gemini para procesar la imagen.');
      return;
    }

    playClick();
    setScanning(true);
    setScanError(null);

    try {
      const result = await analyzeGameRankingScreenshot(
        imagePreview,
        mimeType,
        EVENT_OPTIONS.find(e => e.id === selectedEvent)?.label
      );

      if (result.detectedEventTitle) {
        setDetectedTitle(result.detectedEventTitle);
      }

      // Auto-switch event type if Gemini detected it strongly
      if (result.eventType && result.eventType !== 'unknown' && result.eventType !== selectedEvent) {
        const matchEvt = EVENT_OPTIONS.find(o => o.id === result.eventType);
        if (matchEvt) {
          setSelectedEvent(matchEvt.id);
        }
      }

      // Build editable rows with intelligent member matching
      const rows: EditableOcrRow[] = (result.rows || []).map((r, idx) => {
        const match = matchMember(r.rawName);
        return {
          id: `row-${idx}-${Date.now()}`,
          rank: r.rank || idx + 1,
          rawName: r.rawName,
          points: r.points,
          memberId: match.memberId,
          saveAlias: !match.matchedByAlias && Boolean(match.memberId),
        };
      });

      setExtractedRows(rows);
      setStep('review');
    } catch (err: any) {
      console.error('OCR Error:', err);
      setScanError(err.message || 'Error al procesar la imagen. Verifica tu conexión y API Key.');
    } finally {
      setScanning(false);
    }
  };

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKey);
    setShowKeyInput(false);
    setScanError(null);
  };

  // Row operations in review step
  const updateRow = (id: string, patch: Partial<EditableOcrRow>) => {
    setExtractedRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      const updated = { ...row, ...patch };
      // If user manually chose a memberId, suggest saving alias if it's not already matched
      if (patch.memberId !== undefined && patch.memberId !== '') {
        const currentMatch = matchMember(row.rawName);
        if (currentMatch.memberId !== patch.memberId) {
          updated.saveAlias = true;
        }
      }
      return updated;
    }));
  };

  const deleteRow = (id: string) => {
    setExtractedRows(prev => prev.filter(r => r.id !== id));
  };

  const addManualRow = () => {
    setExtractedRows(prev => [
      ...prev,
      {
        id: `row-manual-${Date.now()}`,
        rank: prev.length + 1,
        rawName: '',
        points: 0,
        memberId: '',
        saveAlias: false,
      }
    ]);
  };

  const handleApplyChanges = () => {
    playClick();

    const targetOpt = EVENT_OPTIONS.find(o => o.id === selectedEvent)!;
    const targetField = targetOpt.field;

    const updates: { memberId: string; field: string; value: any; extraFields?: Record<string, any> }[] = [];
    const newAliasesMap: Record<string, string[]> = { ...knownAliases };

    extractedRows.forEach(row => {
      if (!row.memberId) return;

      const extra: Record<string, any> = {};
      if (selectedEvent === 'lab') extra.lab_joined = true;
      if (selectedEvent === 'tac') extra.tac_joined = true;

      updates.push({
        memberId: row.memberId,
        field: targetField,
        value: row.points,
        extraFields: Object.keys(extra).length > 0 ? extra : undefined,
      });

      // Save alias if requested and member assigned
      if (row.saveAlias && row.rawName.trim()) {
        const trimmed = row.rawName.trim();
        const existing = newAliasesMap[row.memberId] || [];
        if (!existing.includes(trimmed)) {
          newAliasesMap[row.memberId] = [...existing, trimmed];
        }
      }
    });

    onApply(updates, newAliasesMap);
    onClose();
  };

  const totalPoints = extractedRows.reduce((acc, r) => acc + (Number(r.points) || 0), 0);
  const matchedCount = extractedRows.filter(r => Boolean(r.memberId)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#0c0c0c] border border-gray-800 w-full max-w-4xl shadow-[0_0_50px_rgba(255,42,42,0.15)] flex flex-col max-h-[92vh] rounded-sm relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blood-red/20 border border-blood-red/50 flex items-center justify-center rounded-sm text-neon-red">
              <Camera size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bebas text-xl sm:text-2xl tracking-widest text-white">
                  ASISTENTE OCR TÁCTICO (IA)
                </h3>
                <span className="bg-blood-red/20 border border-blood-red/40 text-neon-red font-mono text-[10px] px-2 py-0.5 uppercase tracking-widest">
                  Gemini Vision
                </span>
              </div>
              <p className="font-mono text-xs text-gray-400">
                Extracción automática y edición previa de capturas de ranking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="font-mono text-[11px] text-gray-400 hover:text-white border border-gray-800 px-2.5 py-1.5 flex items-center gap-1.5 transition-colors"
              title="Configuración API Key"
            >
              <Key size={13} />
              <span className="hidden sm:inline">API Key</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white p-1.5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* API Key Banner */}
        {showKeyInput && (
          <div className="p-4 bg-[#141414] border-b border-gray-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="w-full sm:w-auto flex-1">
              <label className="block font-mono text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                Gemini API Key (Google AI Studio)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-black border border-gray-700 text-white px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-neon-red"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleSaveApiKey}
                className="bg-blood-red/30 border border-blood-red text-neon-red hover:bg-blood-red hover:text-white font-mono text-xs px-4 py-1.5 uppercase transition-colors"
              >
                Guardar Clave
              </button>
              <button
                onClick={() => setShowKeyInput(false)}
                className="font-mono text-xs text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {scanError && (
          <div className="p-3 bg-red-950/40 border-b border-red-800/50 flex items-center gap-2 text-red-400 font-mono text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{scanError}</span>
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          
          {step === 'upload' && (
            <div className="flex flex-col gap-6">
              <div>
                <label className="block font-mono text-xs text-gray-400 uppercase tracking-widest mb-2">
                  1. Selecciona el evento de la captura:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {EVENT_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { playClick(); setSelectedEvent(opt.id); }}
                      onMouseEnter={playHover}
                      className={`p-3 text-left border transition-all ${selectedEvent === opt.id ? 'bg-blood-red/20 border-neon-red text-white shadow-[0_0_10px_rgba(255,42,42,0.2)]' : 'bg-black/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'}`}
                    >
                      <div className="font-mono text-xs font-bold uppercase truncate">{opt.label}</div>
                      <div className="font-mono text-[10px] text-gray-500 mt-1 line-clamp-2">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-gray-400 uppercase tracking-widest mb-2">
                  2. Carga o Pega (<kbd className="bg-gray-800 text-gray-300 px-1 py-0.5 rounded text-[10px]">Ctrl+V</kbd>) la captura:
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-sm p-8 flex flex-col items-center justify-center cursor-pointer transition-colors relative min-h-[220px] ${isDragging ? 'border-neon-red bg-blood-red/10' : 'border-gray-800 bg-[#070707] hover:border-gray-600'}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                    accept="image/*"
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative max-h-52 overflow-hidden border border-gray-700 rounded-sm shadow-lg">
                        <img 
                          src={imagePreview} 
                          alt="Screenshot Preview" 
                          className="max-h-52 object-contain"
                        />
                      </div>
                      <p className="font-mono text-xs text-gray-400 flex items-center gap-2">
                        <Check size={14} className="text-green-500" />
                        Captura cargada. Haz clic en 'Escanear con IA' o arrastra otra imagen para reemplazarla.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center text-gray-400">
                        <Upload size={24} />
                      </div>
                      <div>
                        <p className="font-mono text-sm text-white font-medium">
                          Arrastra tu captura aquí o haz clic para explorar
                        </p>
                        <p className="font-mono text-xs text-gray-500 mt-1">
                          También puedes presionar <strong className="text-neon-red">Ctrl + V</strong> en cualquier parte de esta ventana
                        </p>
                      </div>
                      <span className="font-mono text-[10px] text-gray-600 border border-gray-800 px-2 py-1 uppercase">
                        Formatos soportados: PNG, JPG, WEBP
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 font-mono text-xs text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 transition-colors uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleScan}
                  disabled={!imagePreview || scanning}
                  className={`px-6 py-2.5 font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${!imagePreview || scanning ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-blood-red/30 border border-blood-red text-neon-red hover:bg-blood-red hover:text-white shadow-[0_0_15px_rgba(255,42,42,0.3)]'}`}
                >
                  {scanning ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Extrayendo Datos...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Escanear con IA
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="flex flex-col gap-5">
              {/* Review summary header */}
              <div className="p-4 bg-[#111] border border-gray-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bebas text-lg tracking-widest text-white flex items-center gap-2">
                      <Edit3 size={16} className="text-neon-red" />
                      Revisión y Edición Previa de Datos
                    </h4>
                    {detectedTitle && (
                      <span className="font-mono text-[11px] bg-black border border-gray-700 px-2 py-0.5 text-gray-300">
                        {detectedTitle}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-gray-400 mt-0.5">
                    Modifica cualquier nombre o puntaje antes de inyectarlo a la tabla del ciclo.
                  </p>
                </div>

                <div className="flex items-center gap-4 font-mono text-xs">
                  <div>
                    <span className="text-gray-500">Filas: </span>
                    <strong className="text-white">{extractedRows.length}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Mapeados: </span>
                    <strong className={matchedCount === extractedRows.length ? 'text-green-400' : 'text-yellow-400'}>
                      {matchedCount}/{extractedRows.length}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Puntos: </span>
                    <strong className="text-neon-red">{totalPoints.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Japanese names hint */}
              <div className="p-3 bg-black/60 border border-gray-800/80 rounded-sm flex items-start gap-3">
                <Shield size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="font-mono text-[11px] text-gray-300">
                  <strong className="text-blue-400">Mapeo de Nombres Especiales / Japoneses:</strong> Si el nombre en la captura tiene caracteres japoneses (ej. <code className="text-gray-200">ヤスノリ-アルカナ</code>), selecciónalo en el menú desplegable. La casilla <em>"Recordar alias"</em> guardará la equivalencia en el sistema para que futuras capturas se reconozcan solas.
                </div>
              </div>

              {/* Editable Table */}
              <div className="border border-gray-800 bg-black overflow-x-auto max-h-96 custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead className="sticky top-0 bg-[#161616] border-b border-gray-800 z-10 text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3 w-16 text-center">Rank</th>
                      <th className="py-3 px-3 w-48">Nombre Detectado (OCR)</th>
                      <th className="py-3 px-3 w-56">Operativo en Base de Datos</th>
                      <th className="py-3 px-3 w-40 text-right">Puntaje / Daño</th>
                      <th className="py-3 px-3 w-32 text-center">Recordar Alias</th>
                      <th className="py-3 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
                    {extractedRows.map((row) => {
                      const isAutoMatched = Boolean(row.memberId);

                      return (
                        <tr key={row.id} className="hover:bg-white/[0.03] transition-colors">
                          {/* Rank */}
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              value={row.rank}
                              onChange={(e) => updateRow(row.id, { rank: parseInt(e.target.value) || 0 })}
                              className="w-12 bg-transparent border-b border-transparent focus:border-neon-red text-center text-white focus:outline-none py-1"
                            />
                          </td>

                          {/* OCR Name */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={row.rawName}
                              onChange={(e) => updateRow(row.id, { rawName: e.target.value })}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-600 focus:border-neon-red text-white focus:outline-none py-1 px-1"
                              placeholder="Nombre en captura"
                            />
                          </td>

                          {/* Member Selector */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={row.memberId}
                                onChange={(e) => updateRow(row.id, { memberId: e.target.value })}
                                className={`w-full bg-[#111] border px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-neon-red ${isAutoMatched ? 'border-green-800/60 text-green-300' : 'border-yellow-700/60 text-yellow-300'}`}
                              >
                                <option value="">-- Seleccionar Operativo --</option>
                                {members.map(m => (
                                  <option key={m.id} value={m.id}>
                                    [{m.rank}] {m.nickname} {m.account_type === 'alt' ? '(Sec)' : ''}
                                  </option>
                                ))}
                              </select>
                              {isAutoMatched && (
                                <span title="Operativo asignado">
                                  <CheckCircle2 size={15} className="text-green-500 shrink-0" />
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Points */}
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="text"
                              value={row.points ? new Intl.NumberFormat('en-US').format(row.points) : '0'}
                              onChange={(e) => {
                                const clean = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                                updateRow(row.id, { points: clean });
                              }}
                              className="w-full bg-transparent border-b border-gray-800 hover:border-gray-600 focus:border-neon-red text-right text-gray-200 focus:outline-none py-1 px-1 font-mono"
                            />
                          </td>

                          {/* Save alias checkbox */}
                          <td className="py-2.5 px-3 text-center">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={row.saveAlias}
                                disabled={!row.memberId || !row.rawName.trim()}
                                onChange={(e) => updateRow(row.id, { saveAlias: e.target.checked })}
                                className="accent-neon-red w-4 h-4 cursor-pointer"
                              />
                            </label>
                          </td>

                          {/* Delete row */}
                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => deleteRow(row.id)}
                              className="text-gray-600 hover:text-red-400 transition-colors p-1"
                              title="Eliminar fila"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {extractedRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 font-mono text-xs">
                          No se detectaron registros en la captura. Haz clic en "Añadir Fila Manual" para ingresar datos manualmente.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table footer actions */}
              <div className="flex justify-between items-center">
                <button
                  onClick={addManualRow}
                  className="font-mono text-xs text-gray-400 hover:text-white border border-gray-800 px-3 py-1.5 flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={13} /> Añadir Fila Manual
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('upload')}
                    className="font-mono text-xs text-gray-400 hover:text-white border border-gray-800 px-4 py-2 transition-colors uppercase"
                  >
                    Volver a Subir
                  </button>
                  <button
                    onClick={handleApplyChanges}
                    disabled={matchedCount === 0}
                    className={`font-mono text-xs uppercase tracking-widest px-6 py-2 flex items-center gap-2 transition-all ${matchedCount === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-blood-red/30 border border-blood-red text-neon-red hover:bg-blood-red hover:text-white shadow-[0_0_15px_rgba(255,42,42,0.3)]'}`}
                  >
                    <Check size={14} />
                    Inyectar {matchedCount} Registros a la Tabla
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
