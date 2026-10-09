import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Star,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Loader2,
  KeyRound,
  RotateCcw,
  Radio,
  Image as ImageIcon,
  Link as LinkIcon,
  Tag,
  Plus,
  ArrowUp,
  ArrowDown,
  FileText,
  AlertTriangle,
  Eye,
  Upload,
  Type,
  ListChecks
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNews } from '../../hooks/useNews';
import {
  generateNewsArticleWithAI,
  getGeminiApiKey,
  setGeminiApiKey
} from '../../services/geminiService';
import { SmartText } from '../../components/SmartText';
import type {
  NewsArticle,
  NewsCategory,
  SupportedLang,
  NewsletterCustomBlock,
  EditorBlockType
} from '../../data/newsData';

const PRESET_BANNERS = [
  { label: 'Bingo Temporada 1 (v1.10.1)', value: '/noticias/Event_BingoSeason01_bg_C.webp' },
  { label: 'Hot Time Tropas (v1.10.1)', value: '/noticias/Banner_Hottime_Troop_Main.webp' },
  { label: 'Ranking Temporada (Tier List)', value: '/noticias/Event_Ranking_Season01_C.webp' },
  { label: 'Jefe Mundial Mortem', value: '/guias/Event_WorldBoss_Mortem.webp' },
  { label: 'Skin Cuartel General #34', value: '/noticias/SKIN_HQ_34.webp' },
  { label: 'Skin Cuartel General #35', value: '/noticias/SKIN_HQ_35.webp' },
  { label: 'Sin imagen de banner', value: '' }
];

const ACTION_ROUTES = [
  { label: 'Base de Datos de Héroes (/heroes)', value: '/heroes' },
  { label: 'Tier List & Meta (/tier-list)', value: '/tier-list' },
  { label: 'Herramientas & Calculadoras (/herramientas)', value: '/herramientas' },
  { label: 'Centro de Guías (/guias)', value: '/guias' },
  { label: 'Base de Datos de Llaveros (/llaveros)', value: '/llaveros' }
];

// Helper to compress uploaded/dropped image to lightweight WebP data URL
async function fileToCompressedWebp(file: File, maxWidth = 960): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.82));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function NewsPanel() {
  const { isDark } = useTheme();
  const {
    articles,
    saving,
    publishArticle,
    deleteArticle,
    setFeaturedArticle,
    resetToDefaults
  } = useNews();

  // Generator Form State
  const [rawDiscordText, setRawDiscordText] = useState('');
  const [category, setCategory] = useState<NewsCategory>('patch');
  const [version, setVersion] = useState('');
  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0].value);
  const [actionHref, setActionHref] = useState('/heroes');
  const [makeFeatured, setMakeFeatured] = useState(true);

  // Visual Document / Newsletter Draft State
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftArticle, setDraftArticle] = useState<NewsArticle | null>(null);
  const [previewLang, setPreviewLang] = useState<SupportedLang>('es');
  const [editorMode, setEditorMode] = useState<'edit' | 'preview'>('edit');
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Optional API Key inline config
  const [apiKeyInput, setApiKeyInput] = useState(() => getGeminiApiKey());
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput);
    setShowKeyConfig(false);
    setStatusMsg({ type: 'ok', text: 'API Key de Gemini guardada correctamente.' });
  };

  // Start a Blank Newsletter Document manually (Word-style)
  const handleCreateBlankNewsletter = () => {
    const monthsEs = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const now = new Date();
    const todayFormatted = `${String(now.getDate()).padStart(2, '0')} ${monthsEs[now.getMonth()]} ${now.getFullYear()}`;

    const blank: NewsArticle = {
      id: `boletin-${Date.now().toString().slice(-5)}`,
      date: todayFormatted,
      readTime: '4 min',
      author: 'Red Queen Dispatch',
      version: version || 'v1.10.x',
      category,
      tag: {
        es: 'BOLETÍN OFICIAL',
        en: 'OFFICIAL DISPATCH',
        ja: '公式ニュースレター'
      },
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
      title: {
        es: 'Nuevo Boletín de Actualización',
        en: 'New Update Newsletter',
        ja: '新アップデートニュースレター'
      },
      excerpt: {
        es: 'Resumen principal del boletín. Menciona palabras clave como Llaveros, Tier List o Tesoros Míticos para auto-enlazar.',
        en: 'Main newsletter summary. Mention keywords like Keychains or Tier List to auto-link.',
        ja: 'ニュースレターの概要。キーホルダーやティアリストなどのキーワードは自動リンクされます。'
      },
      intro: {
        es: 'Escribe aquí la introducción editorial de tu boletín explicando el contexto general de los cambios.',
        en: 'Write your editorial introduction here explaining the overall context of the changes.',
        ja: 'ここにニュースレターの導入文を入力してください。'
      },
      image: bannerUrl || undefined,
      isFeatured: makeFeatured,
      actionLink: {
        href: actionHref,
        label: {
          es: 'Abrir Sección Relacionada',
          en: 'Open Related Section',
          ja: '関連セクションを開く'
        }
      },
      highlights: {
        es: ['Punto clave 1 con explicación rápida.', 'Punto clave 2 sobre Llaveros o Tier List.'],
        en: ['Key highlight 1 with quick explanation.', 'Key highlight 2 about Keychains or Tier List.'],
        ja: ['ハイライト1の解説。', 'ハイライト2の解説。']
      },
      sections: [
        {
          title: {
            es: '1. Primera Sección del Boletín',
            en: '1. First Newsletter Section',
            ja: '1. 第1セクション'
          },
          description: {
            es: 'Mini explicación de lo que trata esta sección para dar contexto al lector:',
            en: 'Mini explanation of what this section covers to give readers context:',
            ja: 'このセクションの簡単な説明：'
          },
          items: {
            es: ['Nuevo Cambio: Explicación detallada de cómo funciona y cómo aprovecharlo con tus Aceleradores o Joyas.'],
            en: ['New Change: Detailed explanation of how it works and how to use it.'],
            ja: ['新要素：具体的な仕組みと活用方法の解説。']
          }
        }
      ],
      customBlocks: []
    };

    setDraftArticle(blank);
    setEditorMode('edit');
    setStatusMsg({
      type: 'ok',
      text: 'Documento de Boletín creado. Usa la barra de herramientas para añadir bloques, imágenes o texto.'
    });
  };

  const handleGenerateWithAI = async () => {
    if (!rawDiscordText.trim()) {
      setStatusMsg({
        type: 'err',
        text: 'Pega primero el anuncio del Discord oficial o pulsa "Crear Boletín en Blanco".'
      });
      return;
    }

    setIsGenerating(true);
    setStatusMsg(null);
    try {
      const generated = await generateNewsArticleWithAI(rawDiscordText, {
        category,
        version: version.trim() || undefined,
        image: bannerUrl || undefined,
        actionHref,
        isFeatured: makeFeatured
      });
      setDraftArticle(generated);
      setEditorMode('edit');
      setStatusMsg({
        type: 'ok',
        text: '¡Boletín generado con el Second Brain en ES / EN / JA! Puedes añadir imágenes o bloques abajo antes de publicar.'
      });
    } catch (err: any) {
      setStatusMsg({
        type: 'err',
        text: err?.message || 'Error al conectar con Gemini IA. Verifica tu API Key.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishDraft = async () => {
    if (!draftArticle) return;
    setStatusMsg(null);
    const res = await publishArticle(draftArticle, makeFeatured);
    if (res.success) {
      setStatusMsg({
        type: 'ok',
        text: `¡Boletín publicado! Puedes verlo en /noticias/${draftArticle.id}`
      });
      setDraftArticle(null);
      setRawDiscordText('');
      setVersion('');
    } else {
      setStatusMsg({
        type: 'err',
        text: `Guardado localmente, pero hubo un aviso de Supabase: ${res.error}`
      });
    }
  };

  const handleEditExisting = (article: NewsArticle) => {
    const copy: NewsArticle = JSON.parse(JSON.stringify(article));
    if (!copy.customBlocks) copy.customBlocks = [];
    setDraftArticle(copy);
    setMakeFeatured(Boolean(article.isFeatured));
    setEditorMode('edit');
    setStatusMsg({
      type: 'ok',
      text: `Editando "${article.title.es}" en el Editor Visual de Newsletter.`
    });
  };

  // Add Custom Block to Newsletter (Word / Notion style)
  const addCustomBlock = (type: EditorBlockType) => {
    if (!draftArticle) return;
    const newBlock: NewsletterCustomBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      type,
      title: {
        es: type === 'heading' ? 'Nuevo Subtítulo de Sección' : type === 'callout' ? 'Nota Táctica Importante' : '',
        en: type === 'heading' ? 'New Section Subheading' : type === 'callout' ? 'Important Tactical Note' : '',
        ja: type === 'heading' ? '新しいセクション見出し' : type === 'callout' ? '重要な戦術ノート' : ''
      },
      content: {
        es:
          type === 'paragraph'
            ? 'Escribe aquí tu párrafo explicativo. Si mencionas Llaveros, Tier List, Joyas, Luminio o a Leon S. Kennedy, se creará el enlace automáticamente.'
            : type === 'callout'
            ? 'Consejo: Ahorra tus Aceleradores y Polvo de Luminio para el evento Cumbre de Ases.'
            : '',
        en:
          type === 'paragraph'
            ? 'Write your explanatory paragraph here. Mentioning Keychains, Tier List, or Leon S. Kennedy will auto-link.'
            : type === 'callout'
            ? 'Tip: Save your Speedups and Loyminium Dust for Ace Summit.'
            : '',
        ja:
          type === 'paragraph'
            ? 'ここに解説パラグラフを入力します。キーホルダーやティアリストなどの単語は自動リンクされます。'
            : type === 'callout'
            ? 'ヒント：エースサミットに向けて加速アイテムを温存しましょう。'
            : ''
      },
      imageUrl: type === 'image' ? '/noticias/SKIN_HQ_34.webp' : undefined,
      caption: {
        es: type === 'image' ? 'Imagen de referencia del parche (puedes arrastrar un archivo aquí)' : '',
        en: type === 'image' ? 'Patch reference image (you can drag & drop a file here)' : '',
        ja: type === 'image' ? 'パッチ参考画像（ファイルをドラッグ＆ドロップ可能）' : ''
      },
      calloutStyle: 'info'
    };

    setDraftArticle({
      ...draftArticle,
      customBlocks: [...(draftArticle.customBlocks || []), newBlock]
    });
  };

  const addSectionBlock = () => {
    if (!draftArticle) return;
    const nextNum = draftArticle.sections.length + 1;
    setDraftArticle({
      ...draftArticle,
      sections: [
        ...draftArticle.sections,
        {
          title: {
            es: `${nextNum}. Nueva Sección Explicativa`,
            en: `${nextNum}. New Explanatory Section`,
            ja: `${nextNum}. 新しい解説セクション`
          },
          description: {
            es: 'Breve explicación de por qué esta sección es importante para los jugadores:',
            en: 'Brief explanation of why this section matters for players:',
            ja: 'このセクションが重要な理由の簡単な説明：'
          },
          items: {
            es: ['Elemento 1: Explicación clara con enlaces automáticos a Llaveros o Herramientas Tácticas.'],
            en: ['Item 1: Clear explanation with auto-links to Keychains or Tactical Tools.'],
            ja: ['項目1：キーホルダーや戦術ツールへの自動リンク付き解説。']
          }
        }
      ]
    });
  };

  const moveCustomBlock = (idx: number, dir: -1 | 1) => {
    if (!draftArticle || !draftArticle.customBlocks) return;
    const list = [...draftArticle.customBlocks];
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    const temp = list[idx];
    list[idx] = list[target];
    list[target] = temp;
    setDraftArticle({ ...draftArticle, customBlocks: list });
  };

  const removeCustomBlock = (idx: number) => {
    if (!draftArticle || !draftArticle.customBlocks) return;
    setDraftArticle({
      ...draftArticle,
      customBlocks: draftArticle.customBlocks.filter((_, i) => i !== idx)
    });
  };

  // Handle Drag & Drop Image onto Cover or Custom Image Block
  const handleDropImageOnCover = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingCover(false);
    if (!draftArticle) return;
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const dataUrl = await fileToCompressedWebp(file);
      setDraftArticle({ ...draftArticle, image: dataUrl });
    }
  };

  const handleDropImageOnBlock = async (e: React.DragEvent, blockIdx: number) => {
    e.preventDefault();
    if (!draftArticle || !draftArticle.customBlocks) return;
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const dataUrl = await fileToCompressedWebp(file);
      const next = [...draftArticle.customBlocks];
      next[blockIdx] = { ...next[blockIdx], imageUrl: dataUrl };
      setDraftArticle({ ...draftArticle, customBlocks: next });
    }
  };

  const cardBg = isDark
    ? 'bg-[#121622] border-slate-800 text-slate-100'
    : 'bg-white border-black text-slate-900 shadow-sm';

  const inputBg = isDark
    ? 'bg-[#0b0e17] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-rose-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-rose-600';

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
      {/* Top Header Bar */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${cardBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
            <Radio size={20} />
          </div>
          <div>
            <h2 className="font-bebas text-2xl tracking-wider leading-none">
              ESTUDIO EDITORIAL DE NEWSLETTER & PARCHES (IA + DRAG & DROP)
            </h2>
            <p className="text-xs text-slate-400 font-inter mt-0.5">
              Genera boletines desde Discord con el Second Brain o edítalos como un documento visual con imágenes arrastrables y auto-enlaces.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCreateBlankNewsletter}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors font-bold"
          >
            <Plus size={14} />
            <span>Crear Boletín en Blanco</span>
          </button>
          <button
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className="px-3 py-1.5 rounded-xl border border-slate-700 hover:border-rose-500/50 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <KeyRound size={13} className="text-rose-500" />
            <span>API Key IA</span>
          </button>
          <a
            href="/noticias"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors font-bold"
          >
            <span>Abrir /noticias</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Optional Gemini API Key Drawer */}
      {showKeyConfig && (
        <div className={`p-4 rounded-2xl border ${cardBg} flex flex-col sm:flex-row gap-3 items-stretch sm:items-center`}>
          <input
            type="password"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            placeholder="Pega tu Gemini API Key (AIzaSy...)"
            className={`flex-1 px-3.5 py-2 rounded-xl border text-xs font-mono outline-none ${inputBg}`}
          />
          <button
            onClick={handleSaveApiKey}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-bold"
          >
            Guardar Key
          </button>
        </div>
      )}

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 ${
            statusMsg.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-xs underline opacity-75 hover:opacity-100">
            Cerrar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): AI Importer + Visual Word/Block Newsletter Editor */}
        <div className="xl:col-span-8 space-y-6">
          {/* Box 1: Quick Discord AI Importer */}
          <div className={`p-5 rounded-2xl border space-y-4 ${cardBg}`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-mono text-xs uppercase tracking-widest text-rose-400 font-bold flex items-center gap-2">
                <Sparkles size={15} /> Paso 1: Importar Anuncio del Discord Oficial con IA (Opcional)
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                Conectado a docs/second-brain/*.md
              </span>
            </div>

            <textarea
              rows={4}
              value={rawDiscordText}
              onChange={e => setRawDiscordText(e.target.value)}
              placeholder="Pega aquí las notas del parche del Discord oficial y pulsa 'Generar Boletín con IA', o pulsa arriba 'Crear Boletín en Blanco' para redactar desde cero..."
              className={`w-full p-3.5 rounded-xl border text-sm font-inter outline-none resize-y ${inputBg}`}
            />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <Tag size={11} /> Categoría
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as NewsCategory)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${inputBg}`}
                >
                  <option value="patch">Parche & Datamine</option>
                  <option value="meta">Meta & Tier List</option>
                  <option value="tools">Herramientas Web</option>
                  <option value="guides">Guías & Comunidad</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  Versión
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  placeholder="Ej: v1.10.2"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${inputBg}`}
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <ImageIcon size={11} /> Portada Inicial
                </label>
                <select
                  value={bannerUrl}
                  onChange={e => setBannerUrl(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${inputBg}`}
                >
                  {PRESET_BANNERS.map(b => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <LinkIcon size={11} /> Enlace Final
                </label>
                <select
                  value={actionHref}
                  onChange={e => setActionHref(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${inputBg}`}
                >
                  {ACTION_ROUTES.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                <input
                  type="checkbox"
                  checked={makeFeatured}
                  onChange={e => setMakeFeatured(e.target.checked)}
                  className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                />
                <span>Marcar como Boletín Principal Destacado</span>
              </label>

              <button
                onClick={handleGenerateWithAI}
                disabled={isGenerating}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Redactando Newsletter en ES / EN / JA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Generar Boletín con IA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Box 2: Visual Word-Style Document & Drag-and-Drop Editor */}
          {draftArticle && (
            <div className={`rounded-2xl border-2 border-rose-500/40 overflow-hidden ${cardBg}`}>
              {/* Sticky Document Toolbar (Word / Notion ribbon) */}
              <div className="bg-[#0b0d14] border-b border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={addSectionBlock}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] flex items-center gap-1.5 transition-colors"
                    title="Añadir sección numerada con explicación"
                  >
                    <ListChecks size={13} className="text-rose-400" /> + Sección
                  </button>
                  <button
                    onClick={() => addCustomBlock('paragraph')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] flex items-center gap-1.5 transition-colors"
                    title="Añadir párrafo de texto"
                  >
                    <FileText size={13} className="text-blue-400" /> + Párrafo
                  </button>
                  <button
                    onClick={() => addCustomBlock('image')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] flex items-center gap-1.5 transition-colors"
                    title="Insertar bloque de imagen (Drag & Drop)"
                  >
                    <ImageIcon size={13} className="text-emerald-400" /> + Imagen (Drag & Drop)
                  </button>
                  <button
                    onClick={() => addCustomBlock('heading')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] flex items-center gap-1.5 transition-colors"
                    title="Insertar subtítulo grande"
                  >
                    <Type size={13} className="text-purple-400" /> + Subtítulo
                  </button>
                  <button
                    onClick={() => addCustomBlock('callout')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] flex items-center gap-1.5 transition-colors"
                    title="Insertar caja de nota o consejo táctico"
                  >
                    <AlertTriangle size={13} className="text-amber-400" /> + Caja Consejo
                  </button>
                </div>

                {/* Language & Live Preview Switch */}
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                    {(['es', 'en', 'ja'] as SupportedLang[]).map(l => (
                      <button
                        key={l}
                        onClick={() => setPreviewLang(l)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase transition-colors ${
                          previewLang === l
                            ? 'bg-rose-600 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setEditorMode(editorMode === 'edit' ? 'preview' : 'edit')}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs uppercase flex items-center gap-1.5 border transition-colors ${
                      editorMode === 'preview'
                        ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
                    }`}
                  >
                    <Eye size={14} />
                    <span>{editorMode === 'preview' ? 'Volver a Editar' : 'Vista Previa Newsletter'}</span>
                  </button>
                </div>
              </div>

              {/* Mode A: Live Real Newsletter Preview (Exact look with SmartText links) */}
              {editorMode === 'preview' ? (
                <div className="p-6 sm:p-8 bg-[#09090c] text-white space-y-6">
                  <div className="border-b border-gray-800 pb-4">
                    <span className="px-2.5 py-0.5 bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-[10px] uppercase">
                      {draftArticle.tag[previewLang]}
                    </span>
                    <h1 className="font-bebas text-4xl sm:text-5xl text-white mt-3">
                      {draftArticle.title[previewLang]}
                    </h1>
                    <p className="text-gray-300 font-inter text-base mt-2">
                      <SmartText text={draftArticle.excerpt[previewLang]} />
                    </p>
                  </div>

                  {draftArticle.image && (
                    <img
                      src={draftArticle.image}
                      alt=""
                      className="w-full max-h-72 object-cover rounded-xl border border-gray-800"
                    />
                  )}

                  {draftArticle.intro?.[previewLang] && (
                    <div className="border-l-4 border-blood-red pl-4 text-gray-300 font-inter">
                      <SmartText text={draftArticle.intro[previewLang]} />
                    </div>
                  )}

                  {draftArticle.sections.map((s, idx) => (
                    <div key={idx} className="space-y-3 pt-2">
                      <h2 className="font-bebas text-3xl text-white border-b border-gray-800 pb-1">
                        {s.title[previewLang]}
                      </h2>
                      {s.description?.[previewLang] && (
                        <p className="text-sm text-gray-300 font-inter">
                          <SmartText text={s.description[previewLang]} />
                        </p>
                      )}
                      <div className="space-y-2">
                        {s.items[previewLang].map((it, j) => (
                          <div key={j} className="bg-[#0e0e13] border border-gray-800 rounded-xl p-3.5 text-sm text-gray-200">
                            <SmartText text={it} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {(draftArticle.customBlocks || []).map(blk => (
                    <div key={blk.id} className="pt-2">
                      {blk.type === 'heading' && (
                        <h2 className="font-bebas text-3xl text-white border-b border-gray-800 pb-1">
                          {blk.title?.[previewLang]}
                        </h2>
                      )}
                      {blk.type === 'paragraph' && (
                        <p className="text-gray-300 font-inter text-base">
                          <SmartText text={blk.content?.[previewLang] || ''} />
                        </p>
                      )}
                      {blk.type === 'image' && blk.imageUrl && (
                        <figure className="rounded-xl overflow-hidden border border-gray-800 bg-black p-2 text-center">
                          <img src={blk.imageUrl} alt="" className="max-h-80 mx-auto object-contain" />
                          {blk.caption?.[previewLang] && (
                            <figcaption className="text-xs font-mono text-gray-400 mt-2">
                              <SmartText text={blk.caption[previewLang]} />
                            </figcaption>
                          )}
                        </figure>
                      )}
                      {blk.type === 'callout' && (
                        <div className="p-4 rounded-xl bg-blood-red/15 border border-blood-red/40 text-sm text-gray-200">
                          <strong className="block text-white mb-1">{blk.title?.[previewLang]}</strong>
                          <SmartText text={blk.content?.[previewLang] || ''} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Mode B: Visual Document Block Editor */
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Cover Image Drag & Drop Zone */}
                  <div
                    onDragOver={e => {
                      e.preventDefault();
                      setIsDraggingCover(true);
                    }}
                    onDragLeave={() => setIsDraggingCover(false)}
                    onDrop={handleDropImageOnCover}
                    className={`relative rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                      isDraggingCover
                        ? 'border-emerald-400 bg-emerald-500/10'
                        : 'border-slate-700 bg-[#0b0e17]/60'
                    }`}
                  >
                    {draftArticle.image ? (
                      <div className="relative">
                        <img
                          src={draftArticle.image}
                          alt="Portada"
                          className="max-h-48 mx-auto rounded-lg object-cover"
                        />
                        <div className="mt-2 flex items-center justify-center gap-3">
                          <label className="cursor-pointer px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5">
                            <Upload size={12} /> Cambiar o Arrastrar Imagen de Portada
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async e => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  const dataUrl = await fileToCompressedWebp(f);
                                  setDraftArticle({ ...draftArticle, image: dataUrl });
                                }
                              }}
                            />
                          </label>
                          <button
                            onClick={() => setDraftArticle({ ...draftArticle, image: undefined })}
                            className="px-2.5 py-1 rounded bg-rose-950/50 text-rose-400 text-xs font-mono"
                          >
                            Quitar Portada
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center py-4 text-slate-400 hover:text-white">
                        <Upload size={22} className="text-rose-500 mb-1.5" />
                        <span className="font-mono text-xs">
                          Arrastra y suelta aquí una imagen de portada desde tu PC o haz clic para subir
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async e => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const dataUrl = await fileToCompressedWebp(f);
                              setDraftArticle({ ...draftArticle, image: dataUrl });
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Title, Excerpt & Intro */}
                  <div className="space-y-4">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1">
                        Título Principal del Boletín ({previewLang.toUpperCase()})
                      </label>
                      <input
                        type="text"
                        value={draftArticle.title[previewLang]}
                        onChange={e =>
                          setDraftArticle({
                            ...draftArticle,
                            title: { ...draftArticle.title, [previewLang]: e.target.value }
                          })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-base font-bold outline-none ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1">
                        Subtítulo / Resumen Corto ({previewLang.toUpperCase()})
                      </label>
                      <textarea
                        rows={2}
                        value={draftArticle.excerpt[previewLang]}
                        onChange={e =>
                          setDraftArticle({
                            ...draftArticle,
                            excerpt: { ...draftArticle.excerpt, [previewLang]: e.target.value }
                          })
                        }
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1">
                        Introducción Editorial ({previewLang.toUpperCase()}) — Palabras como "Llaveros" o "Tier List" se auto-enlazan
                      </label>
                      <textarea
                        rows={3}
                        value={draftArticle.intro?.[previewLang] || ''}
                        onChange={e =>
                          setDraftArticle({
                            ...draftArticle,
                            intro: {
                              es: draftArticle.intro?.es || '',
                              en: draftArticle.intro?.en || '',
                              ja: draftArticle.intro?.ja || '',
                              [previewLang]: e.target.value
                            }
                          })
                        }
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1">
                        Resumen Ejecutivo / Puntos Clave ({previewLang.toUpperCase()}) — 1 por línea
                      </label>
                      <textarea
                        rows={3}
                        value={draftArticle.highlights[previewLang].join('\n')}
                        onChange={e =>
                          setDraftArticle({
                            ...draftArticle,
                            highlights: {
                              ...draftArticle.highlights,
                              [previewLang]: e.target.value.split('\n').filter(Boolean)
                            }
                          })
                        }
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                      />
                    </div>
                  </div>

                  {/* Editable Structured Sections (with Mini-Explanations) */}
                  <div className="space-y-4">
                    <div className="font-mono text-xs uppercase tracking-wider text-rose-400 font-bold">
                      Secciones del Boletín ({draftArticle.sections.length})
                    </div>
                    {draftArticle.sections.map((sec, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-4 rounded-xl border border-slate-800 bg-[#0d111b] space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={sec.title[previewLang]}
                            onChange={e => {
                              const next = [...draftArticle.sections];
                              next[sIdx] = {
                                ...next[sIdx],
                                title: { ...next[sIdx].title, [previewLang]: e.target.value }
                              };
                              setDraftArticle({ ...draftArticle, sections: next });
                            }}
                            className={`flex-1 px-3 py-1.5 rounded-lg border text-sm font-bold outline-none ${inputBg}`}
                          />
                          <button
                            onClick={() => {
                              const next = draftArticle.sections.filter((_, i) => i !== sIdx);
                              setDraftArticle({ ...draftArticle, sections: next });
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-500"
                            title="Eliminar sección"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1">
                            Mini-Explicación de la Sección ({previewLang.toUpperCase()})
                          </label>
                          <textarea
                            rows={2}
                            value={sec.description?.[previewLang] || ''}
                            onChange={e => {
                              const next = [...draftArticle.sections];
                              next[sIdx] = {
                                ...next[sIdx],
                                description: {
                                  es: next[sIdx].description?.es || '',
                                  en: next[sIdx].description?.en || '',
                                  ja: next[sIdx].description?.ja || '',
                                  [previewLang]: e.target.value
                                }
                              };
                              setDraftArticle({ ...draftArticle, sections: next });
                            }}
                            placeholder="Explica brevemente qué significa esta sección para el jugador..."
                            className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none ${inputBg}`}
                          />
                        </div>

                        <div>
                          <label className="block font-mono text-[10px] uppercase text-slate-400 mb-1">
                            Puntos Detallados ({previewLang.toUpperCase()}) — 1 por línea (Usa "Nombre: Explicación")
                          </label>
                          <textarea
                            rows={4}
                            value={sec.items[previewLang].join('\n')}
                            onChange={e => {
                              const next = [...draftArticle.sections];
                              next[sIdx] = {
                                ...next[sIdx],
                                items: {
                                  ...next[sIdx].items,
                                  [previewLang]: e.target.value.split('\n').filter(Boolean)
                                }
                              };
                              setDraftArticle({ ...draftArticle, sections: next });
                            }}
                            className={`w-full px-3 py-2 rounded-lg border text-xs outline-none ${inputBg}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Custom Visual Blocks (Drag & Drop Images, Callouts, Paragraphs) */}
                  {draftArticle.customBlocks && draftArticle.customBlocks.length > 0 && (
                    <div className="space-y-4">
                      <div className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold">
                        Bloques Visuales Extra ({draftArticle.customBlocks.length})
                      </div>

                      {draftArticle.customBlocks.map((blk, bIdx) => (
                        <div
                          key={blk.id}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => blk.type === 'image' && handleDropImageOnBlock(e, bIdx)}
                          className="p-4 rounded-xl border border-slate-700 bg-[#0d111b] space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              Bloque: {blk.type.toUpperCase()}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveCustomBlock(bIdx, -1)}
                                className="p-1 text-slate-400 hover:text-white"
                                title="Subir bloque"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                onClick={() => moveCustomBlock(bIdx, 1)}
                                className="p-1 text-slate-400 hover:text-white"
                                title="Bajar bloque"
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                onClick={() => removeCustomBlock(bIdx)}
                                className="p-1 text-slate-500 hover:text-rose-500"
                                title="Eliminar bloque"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {(blk.type === 'heading' || blk.type === 'callout') && (
                            <input
                              type="text"
                              value={blk.title?.[previewLang] || ''}
                              onChange={e => {
                                const next = [...(draftArticle.customBlocks || [])];
                                next[bIdx] = {
                                  ...next[bIdx],
                                  title: {
                                    es: next[bIdx].title?.es || '',
                                    en: next[bIdx].title?.en || '',
                                    ja: next[bIdx].title?.ja || '',
                                    [previewLang]: e.target.value
                                  }
                                };
                                setDraftArticle({ ...draftArticle, customBlocks: next });
                              }}
                              placeholder="Título del bloque..."
                              className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold outline-none ${inputBg}`}
                            />
                          )}

                          {(blk.type === 'paragraph' || blk.type === 'callout' || blk.type === 'heading') && (
                            <textarea
                              rows={3}
                              value={blk.content?.[previewLang] || ''}
                              onChange={e => {
                                const next = [...(draftArticle.customBlocks || [])];
                                next[bIdx] = {
                                  ...next[bIdx],
                                  content: {
                                    es: next[bIdx].content?.es || '',
                                    en: next[bIdx].content?.en || '',
                                    ja: next[bIdx].content?.ja || '',
                                    [previewLang]: e.target.value
                                  }
                                };
                                setDraftArticle({ ...draftArticle, customBlocks: next });
                              }}
                              placeholder="Escribe el contenido... (Usa [Texto](/ruta) o menciona Llaveros, Tier List, Joyas, etc.)"
                              className={`w-full px-3 py-2 rounded-lg border text-xs outline-none ${inputBg}`}
                            />
                          )}

                          {blk.type === 'image' && (
                            <div className="space-y-2">
                              {blk.imageUrl && (
                                <img
                                  src={blk.imageUrl}
                                  alt=""
                                  className="max-h-48 mx-auto rounded border border-slate-700 object-contain"
                                />
                              )}
                              <div className="flex flex-wrap items-center gap-2">
                                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-1.5">
                                  <Upload size={13} /> Subir o Arrastrar Imagen Aquí
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async e => {
                                      const f = e.target.files?.[0];
                                      if (f && draftArticle.customBlocks) {
                                        const dataUrl = await fileToCompressedWebp(f);
                                        const next = [...draftArticle.customBlocks];
                                        next[bIdx] = { ...next[bIdx], imageUrl: dataUrl };
                                        setDraftArticle({ ...draftArticle, customBlocks: next });
                                      }
                                    }}
                                  />
                                </label>
                                <input
                                  type="text"
                                  value={blk.imageUrl || ''}
                                  onChange={e => {
                                    const next = [...(draftArticle.customBlocks || [])];
                                    next[bIdx] = { ...next[bIdx], imageUrl: e.target.value };
                                    setDraftArticle({ ...draftArticle, customBlocks: next });
                                  }}
                                  placeholder="O pega URL de imagen (/noticias/SKIN_HQ_34.webp)"
                                  className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-mono outline-none ${inputBg}`}
                                />
                              </div>
                              <input
                                type="text"
                                value={blk.caption?.[previewLang] || ''}
                                onChange={e => {
                                  const next = [...(draftArticle.customBlocks || [])];
                                  next[bIdx] = {
                                    ...next[bIdx],
                                    caption: {
                                      es: next[bIdx].caption?.es || '',
                                      en: next[bIdx].caption?.en || '',
                                      ja: next[bIdx].caption?.ja || '',
                                      [previewLang]: e.target.value
                                    }
                                  };
                                  setDraftArticle({ ...draftArticle, customBlocks: next });
                                }}
                                placeholder="Pie de foto explicativo de la imagen..."
                                className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none ${inputBg}`}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Save & Publish Action Bar */}
              <div className="bg-[#0b0d14] border-t border-slate-800 p-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => setDraftArticle(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-mono uppercase text-slate-400 hover:text-white"
                >
                  Cerrar Editor
                </button>
                <button
                  onClick={handlePublishDraft}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-2 shadow-lg"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Guardar y Publicar Boletín</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Active Published Newsletters List */}
        <div className={`xl:col-span-4 p-5 rounded-2xl border space-y-4 ${cardBg}`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-mono text-xs uppercase tracking-widest text-slate-300 font-bold">
              Boletines Publicados ({articles.length})
            </span>
            <button
              onClick={resetToDefaults}
              title="Restaurar boletines base"
              className="text-[11px] font-mono text-slate-400 hover:text-rose-400 flex items-center gap-1"
            >
              <RotateCcw size={12} /> Restaurar Base
            </button>
          </div>

          <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1 custom-scrollbar">
            {articles.map(item => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                  item.isFeatured
                    ? 'border-rose-500/60 bg-rose-950/15'
                    : isDark
                    ? 'border-slate-800 bg-[#0c0f18]'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] text-slate-400">{item.date}</span>
                      {item.version && (
                        <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold rounded">
                          {item.version}
                        </span>
                      )}
                      {item.isFeatured && (
                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[9px] uppercase font-bold rounded">
                          ★ Portada
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={`/noticias/${item.id}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Abrir página del boletín"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => setFeaturedArticle(item.id)}
                        title="Marcar como Destacado"
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.isFeatured
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-slate-500 hover:text-amber-400'
                        }`}
                      >
                        <Star size={14} />
                      </button>
                      <button
                        onClick={() => handleEditExisting(item)}
                        title="Abrir en el Editor Visual"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deleteArticle(item.id)}
                        title="Eliminar boletín"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bebas text-lg tracking-wide leading-snug">
                    {item.title.es}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-inter">
                    {item.excerpt.es}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
