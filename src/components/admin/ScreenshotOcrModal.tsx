import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Upload, Sparkles, Check, AlertCircle, Trash2, Plus, 
  Key, RefreshCw, X, CheckCircle2, Shield, Edit3, FileSpreadsheet,
  Clipboard, ArrowRight
} from 'lucide-react';
import { 
  analyzeGameRankingScreenshots, 
  getGeminiApiKey, 
  setGeminiApiKey, 
} from '../../services/geminiService';
import {
  parseExcelFile,
  parseClipboardTableText,
  extractRowsFromData,
  type DetectedColumns
} from '../../utils/excelParser';
import { useSound } from '../../contexts/SoundContext';

export interface UploadedImage {
  id: string;
  preview: string;
  mimeType: string;
  name: string;
}

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
  allowedEvents?: string[];
}

const EVENT_OPTIONS: { id: EventTargetType; label: string; field: string; desc: string; eventKey?: string }[] = [
  { id: 'crocodile', label: 'Caza del Caimán', field: 'crocodile_damage', desc: 'Asigna puntos como Daño de Cocodrilo', eventKey: 'crocodile' },
  { id: 'lab', label: 'Vacunas (Lab)', field: 'lab_points', desc: 'Asigna puntos de Vacunas y marca participación', eventKey: 'vacunas' },
  { id: 'tac', label: 'TAC (Torneo)', field: 'tac_power', desc: 'Asigna poder de TAC y marca participación', eventKey: 'tac' },
  { id: 'mortem', label: 'Repeler a Mortem', field: 'mortem_damage', desc: 'Asigna daño principal infligido a Mortem', eventKey: 'mortem' },
  { id: 'wesker', label: 'Wesker', field: 'wesker_points', desc: 'Asigna puntos de Wesker', eventKey: 'wesker' },
  { id: 'power', label: 'Poder de Operativos', field: 'power', desc: 'Actualiza el poder general de los miembros' },
];

export const ScreenshotOcrModal: React.FC<ScreenshotOcrModalProps> = ({
  isOpen,
  onClose,
  members,
  knownAliases,
  onApply,
  defaultEvent = 'crocodile',
  allowedEvents,
}) => {
  const { playClick, playHover } = useSound();
  const [selectedEvent, setSelectedEvent] = useState<EventTargetType>(defaultEvent);
  const [importMode, setImportMode] = useState<'ocr' | 'excel'>('ocr');
  
  // OCR Images queue
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [detectedTitle, setDetectedTitle] = useState('');
  
  // Excel / CSV state
  const [excelRawRows, setExcelRawRows] = useState<Record<string, any>[]>([]);
  const [excelDetected, setExcelDetected] = useState<DetectedColumns | null>(null);
  const [excelFileName, setExcelFileName] = useState<string>('');
  const [selectedNameCol, setSelectedNameCol] = useState<string>('');
  const [selectedPointsCol, setSelectedPointsCol] = useState<string>('');
  const [selectedRankCol, setSelectedRankCol] = useState<string>('');
  const [clipboardText, setClipboardText] = useState<string>('');
  const [excelLoading, setExcelLoading] = useState(false);

  // Common Review step
  const [extractedRows, setExtractedRows] = useState<EditableOcrRow[]>([]);
  const [step, setStep] = useState<'upload' | 'review'>('upload');

  // API Key management
  const [apiKey, setApiKey] = useState(getGeminiApiKey());
  const [showKeyInput, setShowKeyInput] = useState(!getGeminiApiKey());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const validOptions = EVENT_OPTIONS.filter(opt => {
        if (!allowedEvents) return true;
        if (!opt.eventKey) return false;
        return allowedEvents.includes(opt.eventKey);
      });
      const initial = validOptions.some(o => o.id === defaultEvent) 
        ? defaultEvent 
        : (validOptions[0]?.id || 'crocodile');
      setSelectedEvent(initial);
      setApiKey(getGeminiApiKey());
      setShowKeyInput(!getGeminiApiKey());
      setScanError(null);
      
      // Reset state for a fresh session
      setImages([]);
      setExtractedRows([]);
      setStep('upload');
      setExcelRawRows([]);
      setExcelDetected(null);
      setExcelFileName('');
      setClipboardText('');
    }
  }, [isOpen, defaultEvent, allowedEvents]);

  // Global Clipboard paste listener (Ctrl+V)
  useEffect(() => {
    if (!isOpen || step === 'review') return;

    const handlePaste = (e: ClipboardEvent) => {
      // If user is typing/pasting into an input or textarea, let it handle natively
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      let foundImage = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFiles([file]);
            foundImage = true;
            setImportMode('ocr');
            break;
          }
        }
      }

      // If tabular text was copied from spreadsheet, handle as table paste
      if (!foundImage) {
        const text = e.clipboardData?.getData('text');
        if (text && text.includes('\t')) {
          handlePasteText(text);
          setImportMode('excel');
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, step]);

  if (!isOpen) return null;

  // Process image files
  const processImageFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setScanError('Por favor selecciona archivos de imagen válidos (PNG, JPG, WEBP).');
      return;
    }
    setScanError(null);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [
          ...prev,
          {
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            preview: e.target?.result as string,
            mimeType: file.type,
            name: file.name
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (importMode === 'ocr') {
        processImageFiles(e.dataTransfer.files);
      } else {
        handleExcelUpload(e.dataTransfer.files[0]);
      }
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

  // Scan multiple images with Gemini Vision
  const handleScan = async () => {
    if (images.length === 0) {
      setScanError('Primero carga o pega al menos una captura de pantalla.');
      return;
    }

    const currentKey = getGeminiApiKey();
    if (!currentKey) {
      setShowKeyInput(true);
      setScanError('Se requiere una clave API de Gemini para procesar las imágenes.');
      return;
    }

    playClick();
    setScanning(true);
    setScanError(null);

    try {
      const inputImages = images.map(img => ({ base64: img.preview, mimeType: img.mimeType }));
      const result = await analyzeGameRankingScreenshots(
        inputImages,
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
      setScanError(err.message || 'Error al procesar las capturas con Gemini. Verifica tu conexión y API Key.');
    } finally {
      setScanning(false);
    }
  };

  // Process Excel File
  const handleExcelUpload = async (file: File) => {
    setExcelLoading(true);
    setScanError(null);
    try {
      const { rawRows, detected } = await parseExcelFile(file);
      setExcelFileName(file.name);
      setExcelRawRows(rawRows);
      setExcelDetected(detected);
      setSelectedNameCol(detected.nameCol);
      setSelectedPointsCol(detected.pointsCol);
      setSelectedRankCol(detected.rankCol || '');
    } catch (err: any) {
      setScanError(err.message || 'Error al leer el archivo Excel.');
    } finally {
      setExcelLoading(false);
    }
  };

  // Process Pasted Tabular Text
  const handlePasteText = (textToParse?: string) => {
    const text = textToParse || clipboardText;
    if (!text.trim()) {
      setScanError('Ingresa o pega texto tabular primero.');
      return;
    }
    setScanError(null);
    try {
      const { rawRows, detected } = parseClipboardTableText(text);
      setExcelFileName('Datos de Portapapeles');
      setExcelRawRows(rawRows);
      setExcelDetected(detected);
      setSelectedNameCol(detected.nameCol);
      setSelectedPointsCol(detected.pointsCol);
      setSelectedRankCol(detected.rankCol || '');
    } catch (err: any) {
      setScanError(err.message || 'No se pudo interpretar el formato de los datos pegados.');
    }
  };

  // Convert Excel raw rows to review rows
  const handleProcessExcelData = () => {
    if (!selectedNameCol || !selectedPointsCol) {
      setScanError('Por favor selecciona las columnas de Operativo y Puntuación.');
      return;
    }

    const parsed = extractRowsFromData(
      excelRawRows,
      selectedNameCol,
      selectedPointsCol,
      selectedRankCol || undefined
    );

    const rows: EditableOcrRow[] = parsed.map((r, idx) => {
      const match = matchMember(r.rawName);
      return {
        id: `row-excel-${idx}-${Date.now()}`,
        rank: r.rank || idx + 1,
        rawName: r.rawName,
        points: r.points,
        memberId: match.memberId,
        saveAlias: !match.matchedByAlias && Boolean(match.memberId),
      };
    });

    setDetectedTitle(excelFileName || 'Importación de Excel');
    setExtractedRows(rows);
    setStep('review');
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
        <div className="p-4 sm:p-5 border-b border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-black/50 gap-4 sm:gap-0">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 shrink-0 bg-blood-red/20 border border-blood-red/50 flex items-center justify-center rounded-sm text-neon-red">
              {importMode === 'ocr' ? <Camera size={18} /> : <FileSpreadsheet size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bebas text-xl sm:text-2xl tracking-widest text-white leading-none">
                  {importMode === 'ocr' ? 'ASISTENTE OCR TÁCTICO' : 'IMPORTADOR EXCEL'}
                </h3>
                <span className="bg-blood-red/20 border border-blood-red/40 text-neon-red font-mono text-[10px] px-2 py-0.5 uppercase tracking-widest">
                  {importMode === 'ocr' ? 'Gemini Vision' : 'SheetJS Engine'}
                </span>
              </div>
              <p className="font-mono text-[10px] sm:text-xs text-gray-400 mt-1">
                {importMode === 'ocr' 
                  ? 'Sube capturas de ranking con deduplicación automática'
                  : 'Carga archivos o pega celdas directamente de Excel'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {importMode === 'ocr' && (
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="font-mono text-[11px] text-gray-400 hover:text-white border border-gray-800 px-2.5 py-1.5 flex items-center gap-1.5 transition-colors"
                title="Configuración API Key"
              >
                <Key size={13} />
                <span>API Key</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white p-1.5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs (only visible in upload step) */}
        {step === 'upload' && (
          <div className="px-4 sm:px-6 pt-3 pb-0 bg-black/40 border-b border-gray-800 flex overflow-x-auto gap-2 custom-scrollbar">
            <button
              onClick={() => { playClick(); setImportMode('ocr'); setScanError(null); }}
              className={`px-4 py-2 shrink-0 font-mono text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${importMode === 'ocr' ? 'border-neon-red text-white font-bold bg-blood-red/10' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
              <Camera size={14} />
              Capturas IA (Múltiples)
              {images.length > 0 && (
                <span className="ml-1 bg-neon-red text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {images.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { playClick(); setImportMode('excel'); setScanError(null); }}
              className={`px-4 py-2 shrink-0 font-mono text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${importMode === 'excel' ? 'border-neon-red text-white font-bold bg-blood-red/10' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
              <FileSpreadsheet size={14} />
              Excel / CSV / Portapapeles
              {excelRawRows.length > 0 && (
                <span className="ml-1 bg-green-500 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {excelRawRows.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* API Key Banner */}
        {showKeyInput && importMode === 'ocr' && (
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
              
              {/* Event selection */}
              <div>
                <label className="block font-mono text-xs text-gray-400 uppercase tracking-widest mb-2">
                  1. Selecciona el evento de destino:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {EVENT_OPTIONS.filter(opt => {
                    if (!allowedEvents) return true;
                    if (!opt.eventKey) return false;
                    return allowedEvents.includes(opt.eventKey);
                  }).map(opt => (
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

              {/* MODE 1: OCR MULTI-SCREENSHOT */}
              {importMode === 'ocr' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-mono text-xs text-gray-400 uppercase tracking-widest">
                      2. Carga o Pega (<kbd className="bg-gray-800 text-gray-300 px-1 py-0.5 rounded text-[10px]">Ctrl+V</kbd>) tus capturas:
                    </label>
                    {images.length > 0 && (
                      <span className="font-mono text-xs text-neon-red">
                        {images.length} {images.length === 1 ? 'captura lista' : 'capturas listas (secuencial)'}
                      </span>
                    )}
                  </div>

                  {/* Multi-image dropzone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => images.length === 0 && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-sm p-5 flex flex-col items-center justify-center transition-colors relative min-h-[180px] ${images.length === 0 ? 'cursor-pointer' : ''} ${isDragging ? 'border-neon-red bg-blood-red/10' : 'border-gray-800 bg-[#070707] hover:border-gray-700'}`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => e.target.files && processImageFiles(e.target.files)}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />

                    {images.length > 0 ? (
                      <div className="w-full flex flex-col gap-4">
                        {/* Thumbnail gallery */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-56 overflow-y-auto p-1 custom-scrollbar">
                          {images.map((img, idx) => (
                            <div key={img.id} className="relative group bg-black border border-gray-800 rounded-sm overflow-hidden shadow">
                              <img 
                                src={img.preview} 
                                alt={img.name} 
                                className="w-full h-24 object-cover object-top" 
                              />
                              <div className="absolute top-1 left-1 bg-black/80 font-mono text-[9px] text-white px-1 rounded">
                                #{idx + 1}
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                className="absolute top-1 right-1 bg-red-600/90 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                title="Eliminar captura"
                              >
                                <Trash2 size={11} />
                              </button>
                              <div className="p-1 bg-[#111] font-mono text-[9px] text-gray-400 truncate text-center">
                                {img.name}
                              </div>
                            </div>
                          ))}

                          {/* Add More Button */}
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="h-24 border border-dashed border-gray-700 hover:border-neon-red hover:bg-white/5 flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center"
                          >
                            <Plus size={20} className="text-gray-400 mb-1" />
                            <span className="font-mono text-[10px] text-gray-400 uppercase">+ Agregar Más</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800/80 font-mono text-xs text-gray-400">
                          <span className="flex items-center gap-1 text-green-400">
                            <Check size={13} /> {images.length} capturas en cola para consolidación y deduplicación.
                          </span>
                          <button
                            type="button"
                            onClick={() => setImages([])}
                            className="text-gray-500 hover:text-red-400 text-[11px] underline"
                          >
                            Limpiar todas
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center text-gray-400">
                          <Upload size={20} />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-white font-medium">
                            Arrastra una o varias capturas aquí o haz clic para explorar
                          </p>
                          <p className="font-mono text-xs text-gray-500 mt-1">
                            Soporta capturas continuas de scroll. También puedes presionar <strong className="text-neon-red">Ctrl + V</strong> repetidamente
                          </p>
                        </div>
                        <span className="font-mono text-[10px] text-gray-600 border border-gray-800 px-2 py-1 uppercase">
                          Formatos: PNG, JPG, WEBP • Múltiples archivos simultáneos
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 2: EXCEL / CSV / CLIPBOARD */}
              {importMode === 'excel' && (
                <div className="flex flex-col gap-4">
                  <label className="block font-mono text-xs text-gray-400 uppercase tracking-widest">
                    2. Carga un archivo Excel (.xlsx, .csv) o pega celdas copiadas:
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Excel File Dropzone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => excelInputRef.current?.click()}
                      className={`border border-dashed rounded-sm p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center ${isDragging ? 'border-neon-red bg-blood-red/10' : 'border-gray-800 bg-[#070707] hover:border-gray-700'}`}
                    >
                      <input
                        type="file"
                        ref={excelInputRef}
                        onChange={(e) => e.target.files?.[0] && handleExcelUpload(e.target.files[0])}
                        accept=".xlsx, .xls, .csv, .tsv"
                        className="hidden"
                      />
                      {excelLoading ? (
                        <div className="flex flex-col items-center gap-2 py-4">
                          <RefreshCw size={24} className="animate-spin text-green-400" />
                          <span className="font-mono text-xs text-gray-300">Leyendo hoja de cálculo...</span>
                        </div>
                      ) : (
                        <>
                          <FileSpreadsheet size={28} className="text-green-500 mb-2" />
                          <p className="font-mono text-xs text-white font-bold uppercase">
                            Subir Archivo Excel o CSV
                          </p>
                          <p className="font-mono text-[11px] text-gray-500 mt-1">
                            Formatos soportados: .xlsx, .xls, .csv
                          </p>
                          {excelFileName && (
                            <div className="mt-3 px-2 py-1 bg-green-950/40 border border-green-800 text-green-300 font-mono text-[11px] truncate max-w-full">
                              {excelFileName} ({excelRawRows.length} filas)
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Clipboard Paste Box */}
                    <div className="border border-gray-800 bg-[#070707] rounded-sm p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-gray-400 flex items-center gap-1">
                          <Clipboard size={12} /> Pegar celdas copiadas (Ctrl+V):
                        </span>
                        {clipboardText && (
                          <button
                            onClick={() => handlePasteText()}
                            className="text-[10px] font-mono text-neon-red hover:underline"
                          >
                            Procesar texto
                          </button>
                        )}
                      </div>
                      <textarea
                        value={clipboardText}
                        onChange={(e) => setClipboardText(e.target.value)}
                        placeholder="Ejemplo: copia y pega filas directo de Google Sheets o Excel:&#10;Nick&#9;Daño&#10;MariluMark&#9;290708166&#10;fa.cof&#9;147957882"
                        className="w-full h-24 bg-black border border-gray-800 focus:border-neon-red text-white p-2 font-mono text-[11px] resize-none outline-none"
                      />
                      <button
                        onClick={() => handlePasteText()}
                        disabled={!clipboardText.trim()}
                        className="self-end px-3 py-1 font-mono text-xs bg-white/5 border border-gray-700 hover:bg-white/10 text-white disabled:opacity-40"
                      >
                        Interpretar Texto
                      </button>
                    </div>
                  </div>

                  {/* Column Mapping Section (When rows are parsed) */}
                  {excelRawRows.length > 0 && excelDetected && (
                    <div className="p-4 bg-[#111] border border-gray-800 rounded-sm flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <span className="font-mono text-xs text-white font-bold uppercase flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-green-400" />
                          Columnas Detectadas ({excelRawRows.length} filas leídas)
                        </span>
                        <span className="font-mono text-[11px] text-gray-400">
                          Verifica las columnas correspondientes
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Name Column */}
                        <div>
                          <label className="block font-mono text-[10px] text-gray-400 uppercase mb-1">
                            Columna Operativo / Nick:
                          </label>
                          <select
                            value={selectedNameCol}
                            onChange={(e) => setSelectedNameCol(e.target.value)}
                            className="w-full bg-black border border-gray-700 text-white px-2 py-1.5 text-xs font-mono focus:border-neon-red outline-none"
                          >
                            {excelDetected.allColumns.map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>

                        {/* Points Column */}
                        <div>
                          <label className="block font-mono text-[10px] text-gray-400 uppercase mb-1">
                            Columna Puntos / Daño:
                          </label>
                          <select
                            value={selectedPointsCol}
                            onChange={(e) => setSelectedPointsCol(e.target.value)}
                            className="w-full bg-black border border-gray-700 text-white px-2 py-1.5 text-xs font-mono focus:border-neon-red outline-none"
                          >
                            {excelDetected.allColumns.map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>

                        {/* Rank Column */}
                        <div>
                          <label className="block font-mono text-[10px] text-gray-400 uppercase mb-1">
                            Columna Rank (Opcional):
                          </label>
                          <select
                            value={selectedRankCol}
                            onChange={(e) => setSelectedRankCol(e.target.value)}
                            className="w-full bg-black border border-gray-700 text-white px-2 py-1.5 text-xs font-mono focus:border-neon-red outline-none"
                          >
                            <option value="">-- No incluir / Auto 1, 2, 3... --</option>
                            {excelDetected.allColumns.map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Mini Preview of First 2 rows */}
                      <div className="text-[11px] font-mono text-gray-400 bg-black/60 p-2 border border-gray-800 overflow-x-auto">
                        <span className="text-gray-500 uppercase">Vista previa fila 1:</span>{' '}
                        Operativo: <strong className="text-white">{String(excelRawRows[0]?.[selectedNameCol] ?? '')}</strong> |{' '}
                        Puntos: <strong className="text-neon-red">{String(excelRawRows[0]?.[selectedPointsCol] ?? '')}</strong>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleProcessExcelData}
                          className="px-5 py-2 font-mono text-xs uppercase tracking-widest bg-blood-red/30 border border-blood-red text-neon-red hover:bg-blood-red hover:text-white transition-colors flex items-center gap-2"
                        >
                          Continuar a Revisión ({excelRawRows.length} registros)
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload footer actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 font-mono text-xs text-gray-400 hover:text-white border border-gray-800 hover:border-gray-600 transition-colors uppercase tracking-wider"
                >
                  Cancelar
                </button>
                
                {importMode === 'ocr' && (
                  <button
                    onClick={handleScan}
                    disabled={images.length === 0 || scanning}
                    className={`px-6 py-2.5 font-mono text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${images.length === 0 || scanning ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-blood-red/30 border border-blood-red text-neon-red hover:bg-blood-red hover:text-white shadow-[0_0_15px_rgba(255,42,42,0.3)]'}`}
                  >
                    {scanning ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Analizando {images.length} {images.length === 1 ? 'Captura' : 'Capturas'} con IA...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Escanear {images.length > 0 ? `${images.length} ` : ''}con IA
                      </>
                    )}
                  </button>
                )}
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

              {/* Japanese names and alias hint */}
              <div className="p-3 bg-black/60 border border-gray-800/80 rounded-sm flex items-start gap-3">
                <Shield size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div className="font-mono text-[11px] text-gray-300">
                  <strong className="text-blue-400">Mapeo Inteligente de Alias:</strong> Si el nombre en la captura o archivo Excel tiene caracteres especiales, japoneses o apodos (ej. <code className="text-gray-200">ヤスノリ-アルカナ</code>), selecciónalo en el menú desplegable. La casilla <em>"Recordar alias"</em> guardará la equivalencia en el sistema para que futuros registros se reconozcan automáticamente.
                </div>
              </div>

              {/* Editable Table */}
              <div className="border border-gray-800 bg-black overflow-x-auto max-h-96 custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead className="sticky top-0 bg-[#161616] border-b border-gray-800 z-10 text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3 w-16 text-center">Rank</th>
                      <th className="py-3 px-3 w-48">Nombre Detectado (OCR / Excel)</th>
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
