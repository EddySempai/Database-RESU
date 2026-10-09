import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface KeywordRule {
  terms: string[];
  href: string;
  title?: string;
}

const KEYWORD_RULES: KeywordRule[] = [
  // Secciones principales y herramientas
  {
    terms: ['llaveros', 'llavero', 'keyrings', 'keyring', 'keychains', 'keychain', 'キーリング', 'キーホルダー'],
    href: '/llaveros',
    title: 'Ir a la Base de Datos de Llaveros'
  },
  {
    terms: ['tier list', 'tier lists', 'meta pvp', 'meta pve', 'ティアリスト'],
    href: '/tier-list',
    title: 'Consultar Tier List & Meta'
  },
  {
    terms: [
      'calculadora de mansión',
      'mansión de luminio',
      'mansiones',
      'mansión',
      'tesoros míticos',
      'tesoros',
      'joyas míticas',
      'calculadora de joyas',
      'joyas',
      'investigación de luminio',
      'polvo de luminio',
      'luminio',
      'loyminium',
      'optimizador de aceleradores',
      'aceleradores',
      'herramientas tácticas',
      'calculadoras',
      'ルミニウム',
      'ジュエル'
    ],
    href: '/herramientas',
    title: 'Abrir Herramientas y Calculadoras Tácticas'
  },
  {
    terms: ['comparador de héroes', 'comparador'],
    href: '/comparador',
    title: 'Abrir Comparador de Operativos'
  },
  {
    terms: [
      'conversores tácticos',
      'conversores',
      'conversor',
      'tienda de intercambio',
      'intercambio de tesoros',
      'conversor de tesoros',
      'conversor de aceleradores',
      'maletines de recursos',
      'bolsas de recursos',
      'recursos seguros'
    ],
    href: '/conversores',
    title: 'Abrir Centro de Conversores Tácticos'
  },
  // Guías específicas
  {
    terms: ['repeler a mortem', 'huellas de mortem', 'mortem'],
    href: '/guias/repeler-a-mortem',
    title: 'Ver Dossier: Repeler a Mortem'
  },
  {
    terms: ['cumbre de ases', 'cumbres de ases', 'ace summit'],
    href: '/guias/cumbre-de-ases',
    title: 'Ver Dossier: Cumbre de Ases'
  },
  {
    terms: ['guerra de hierbas', 'herb war'],
    href: '/guias/guerra-de-hierbas',
    title: 'Ver Dossier: Guerra de Hierbas'
  },
  {
    terms: ['hoja de ruta de mansión', 'mansión nivel 1 a 30', 'requisitos de mansión', 'mansion 1 a 30', 'mansion nivel 1 a 30'],
    href: '/guias/mansion-nivel-1-a-30',
    title: 'Ver Guía de Mansión Nivel 1 a 30'
  },
  {
    terms: ['centro de guías', 'dossiers tácticos', 'guía de supervivencia', 'primeros 7 días'],
    href: '/guias',
    title: 'Abrir Centro de Guías'
  },
  // Operativos destacados
  { terms: ['bsaa chris redfield', 'chris (bsaa)', 'bsaa chris'], href: '/heroes/bsaa-chris', title: 'Ver ficha de BSAA Chris' },
  { terms: ['chris redfield', 'chris (stars)'], href: '/heroes/chris', title: 'Ver ficha de Chris Redfield' },
  { terms: ['leon s. kennedy', 'leon'], href: '/heroes/leon', title: 'Ver ficha de Leon S. Kennedy' },
  { terms: ['jill valentine', 'jill'], href: '/heroes/jill', title: 'Ver ficha de Jill Valentine' },
  { terms: ['claire redfield', 'claire'], href: '/heroes/claire', title: 'Ver ficha de Claire Redfield' },
  { terms: ['ada wong', 'ada'], href: '/heroes/ada', title: 'Ver ficha de Ada Wong' },
  { terms: ['sheva alomar', 'sheva'], href: '/heroes/sheva', title: 'Ver ficha de Sheva Alomar' },
  { terms: ['ashley graham', 'ashley'], href: '/heroes/ashley', title: 'Ver ficha de Ashley Graham' },
  { terms: ['jack krauser', 'krauser'], href: '/heroes/jack', title: 'Ver ficha de Jack Krauser' },
  { terms: ['luis serra navarro', 'luis serra', 'luis'], href: '/heroes/luis', title: 'Ver ficha de Luis Serra' },
  { terms: ['excella gionne', 'excella'], href: '/heroes/excella', title: 'Ver ficha de Excella Gionne' },
  { terms: ['carlos oliveira', 'carlos'], href: '/heroes/carlos', title: 'Ver ficha de Carlos Oliveira' },
  { terms: ['piers nivans', 'piers'], href: '/heroes/piers', title: 'Ver ficha de Piers Nivans' },
  { terms: ['rebecca chambers', 'rebecca'], href: '/heroes/rebecca', title: 'Ver ficha de Rebecca Chambers' },
  { terms: ['barry burton', 'barry'], href: '/heroes/barry', title: 'Ver ficha de Barry Burton' },
  { terms: ['billy coen', 'billy'], href: '/heroes/billy', title: 'Ver ficha de Billy Coen' },
  { terms: ['sherry birkin', 'sherry'], href: '/heroes/sherry', title: 'Ver ficha de Sherry Birkin' },
  { terms: ['jake muller', 'jake'], href: '/heroes/jake', title: 'Ver ficha de Jake Muller' },
  { terms: ['mikhail victor', 'mikhail'], href: '/heroes/mikhail', title: 'Ver ficha de Mikhail Victor' },
  { terms: ['marvin branagh', 'marvin'], href: '/heroes/marvin', title: 'Ver ficha de Marvin Branagh' },
  { terms: ['mark wilkins', 'mark'], href: '/heroes/mark', title: 'Ver ficha de Mark Wilkins' },
  { terms: ['tyrell patrick', 'tyrell'], href: '/heroes/tyrell', title: 'Ver ficha de Tyrell Patrick' },
  { terms: ['becca woolett', 'becca'], href: '/heroes/becca', title: 'Ver ficha de Becca Woolett' },
  { terms: ['alyssa ashcroft', 'alyssa'], href: '/heroes/alyssa', title: 'Ver ficha de Alyssa Ashcroft' },
  { terms: ['katherine warren', 'katherine'], href: '/heroes/katherine', title: 'Ver ficha de Katherine Warren' },
  { terms: ['robert kendo', 'robert'], href: '/heroes/robert', title: 'Ver ficha de Robert Kendo' },
  { terms: ['tyrone henry', 'tyrone'], href: '/heroes/tyrone', title: 'Ver ficha de Tyrone Henry' },
  { terms: ['murphy seeker', 'murphy'], href: '/heroes/murphy', title: 'Ver ficha de Murphy Seeker' },
  { terms: ['brad vickers', 'brad'], href: '/heroes/brad', title: 'Ver ficha de Brad Vickers' },
  { terms: ['cazadora'], href: '/heroes/cazadora', title: 'Ver ficha de Cazadora' },
  { terms: ['cazador'], href: '/heroes/cazador', title: 'Ver ficha de Cazador' }
];

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface SmartTextProps {
  text: string;
  className?: string;
}

export const SmartText: React.FC<SmartTextProps> = ({ text, className = '' }) => {
  const renderedNodes = useMemo(() => {
    if (!text) return null;

    // Step 1: Parse explicit markdown links [label](/url) or **bold**
    const mdTokens = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);

    // Prepare flat dictionary sorted by longest phrase first
    const termMap = new Map<string, { href: string; title?: string }>();
    for (const rule of KEYWORD_RULES) {
      for (const t of rule.terms) {
        termMap.set(t.toLowerCase(), { href: rule.href, title: rule.title });
      }
    }

    const sortedTerms = Array.from(termMap.keys()).sort((a, b) => b.length - a.length);
    const keywordRegex = new RegExp(
      `(?<![\\p{L}\\p{N}_])(${sortedTerms.map(escapeRegExp).join('|')})(?![\\p{L}\\p{N}_])`,
      'giu'
    );

    const linkedOncePerParagraph = new Set<string>();

    return mdTokens.map((segment, segIdx) => {
      // Explicit markdown link [Label](href)
      const linkMatch = segment.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const isInternal = href.startsWith('/');
        return isInternal ? (
          <Link
            key={`md-link-${segIdx}`}
            to={href}
            className="inline-flex items-center gap-1 px-[8px] py-[2px] mx-0.5 rounded-[5px] bg-[#ff3333]/10 border border-[#ff3333]/20 text-[#ff3333] hover:bg-[#ff3333]/20 hover:text-[#ff5555] font-medium transition-colors text-[0.93em] leading-snug align-baseline"
          >
            <span>{label}</span>
            <ArrowUpRight size={11} className="inline shrink-0 opacity-85" />
          </Link>
        ) : (
          <a
            key={`ext-link-${segIdx}`}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-[8px] py-[2px] mx-0.5 rounded-[5px] bg-[#ff3333]/10 border border-[#ff3333]/20 text-[#ff3333] hover:bg-[#ff3333]/20 hover:text-[#ff5555] font-medium transition-colors text-[0.93em] leading-snug align-baseline"
          >
            <span>{label}</span>
            <ArrowUpRight size={11} className="inline shrink-0 opacity-85" />
          </a>
        );
      }

      // Bold text **bold**
      const boldMatch = segment.match(/^\*\*([^*]+)\*\*$/);
      if (boldMatch) {
        return (
          <strong key={`bold-${segIdx}`} className="text-white font-semibold">
            {boldMatch[1]}
          </strong>
        );
      }

      // Auto-detect keywords in plain segment
      const parts = segment.split(keywordRegex);
      return parts.map((part, partIdx) => {
        const lower = part.toLowerCase();
        const found = termMap.get(lower);
        if (found && !linkedOncePerParagraph.has(found.href + ':' + lower)) {
          linkedOncePerParagraph.add(found.href + ':' + lower);
          return (
            <Link
              key={`kw-${segIdx}-${partIdx}`}
              to={found.href}
              title={found.title}
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-[8px] py-[2px] mx-0.5 rounded-[5px] bg-[#ff3333]/10 border border-[#ff3333]/20 text-[#ff3333] hover:bg-[#ff3333]/20 hover:border-[#ff3333]/40 hover:text-[#ff5555] font-medium transition-all duration-150 text-[0.93em] leading-snug align-baseline"
            >
              <span>{part}</span>
              <ArrowUpRight size={11} className="inline shrink-0 opacity-80" />
            </Link>
          );
        }
        return <React.Fragment key={`txt-${segIdx}-${partIdx}`}>{part}</React.Fragment>;
      });
    });
  }, [text]);

  return <span className={className}>{renderedNodes}</span>;
};

export default SmartText;
