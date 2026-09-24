import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, ExternalLink } from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const BuyMeACoffeeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.216 6.415l-.132-.666c-.119-.597-.388-1.156-.78-1.618C18.665 3.385 17.71 3 16.59 3H4.72C3.22 3 2 4.22 2 5.72v7.1c0 3.19 2.59 5.78 5.78 5.78h6.22c3.19 0 5.78-2.59 5.78-5.78v-1.21c1.83-.34 3.22-1.94 3.22-3.87 0-1.25-.58-2.42-1.564-3.145l-.22-.18zM17.78 12.82c0 2.08-1.7 3.78-3.78 3.78H7.78c-2.08 0-3.78-1.7-3.78-3.78V5.72c0-.4.32-.72.72-.72h11.87c.45 0 .82.16 1.07.45.24.29.35.65.41 1.05l.13.66v5.66h-.42zm2.22-2.91c0 .99-.81 1.8-1.8 1.8h-.42V7.12h.42c.99 0 1.8.81 1.8 1.8v.99zM6 19.5h11a1 1 0 110 2H6a1 1 0 110-2z" />
  </svg>
);

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative z-10 border-t border-gray-900 bg-[#020202] text-center mt-auto pt-14 pb-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Support Section - Highlighted Card */}
        <div className="w-full mb-10 p-6 md:p-8 rounded-2xl border border-blood-red/40 bg-gradient-to-b from-[#180909]/90 via-[#0d0505]/95 to-[#050505] shadow-[0_0_30px_rgba(220,38,38,0.18)] relative overflow-hidden text-center">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-blood-red to-transparent opacity-80" />
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blood-red/15 border border-blood-red/40 text-neon-red text-xs font-mono uppercase tracking-widest mb-3">
            <Heart className="w-3.5 h-3.5 fill-neon-red animate-pulse" />
            <span>{t('footer.support_badge', 'INICIATIVA COMUNITARIA // PROYECTO ABIERTO')}</span>
          </div>

          {/* Heading */}
          <h3 className="font-bebas text-2xl md:text-3xl tracking-wider text-white mb-2 uppercase">
            {t('footer.support_title', '¿Te resulta útil la Database?')}
          </h3>

          {/* Description */}
          <p className="text-gray-300 font-inter text-xs md:text-sm max-w-xl mx-auto leading-relaxed mb-6">
            {t(
              'footer.support_desc',
              'Este sitio es gratuito y sin publicidad para toda la comunidad de Resident Evil: Survival Unit. Si deseas apoyar los costos de mantenimiento o colaborar con el código fuente, ¡eres más que bienvenido!'
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center max-w-lg mx-auto">
            {/* Buy Me a Coffee Button */}
            <a
              href="https://buymeacoffee.com/eddsempai"
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-[#FFDD00] hover:bg-[#FFE338] text-black font-semibold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(255,221,0,0.35)] hover:shadow-[0_0_28px_rgba(255,221,0,0.55)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <BuyMeACoffeeIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <div className="flex flex-col text-left">
                <span className="font-bold leading-tight font-inter">
                  {t('footer.buymeacoffee_btn', 'Buy Me a Coffee')}
                </span>
                <span className="text-[10px] text-gray-800 font-medium leading-tight">
                  {t('footer.buymeacoffee_sub', 'Invítanos un café')}
                </span>
              </div>
            </a>

            {/* GitHub Repository Button */}
            <a
              href="https://github.com/EddySempai/Database-RESU"
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-[#111318] hover:bg-[#1a1e27] text-white font-medium text-sm border border-gray-700 hover:border-gray-500 transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <GithubIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 text-gray-200" />
              <div className="flex flex-col text-left">
                <span className="font-bold leading-tight font-inter flex items-center gap-1.5">
                  {t('footer.github_btn', 'Código en GitHub')}
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </span>
                <span className="text-[10px] text-gray-400 font-normal leading-tight">
                  {t('footer.github_sub', 'Ver repositorio y aportar')}
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Divider with tactical touch */}
        <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-6" />

        {/* Official Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <a
            href="https://www.residentevil-survivalunit.com"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors"
          >
            {t('footer.official_web', 'Official Website')}
          </a>
          <a
            href="https://x.com/RE_SU_EN"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors"
          >
            {t('footer.twitter', 'Twitter (X)')}
          </a>
          <a
            href="https://discord.com/invite/3q63SSBeeW"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-colors"
          >
            {t('footer.discord', 'Discord')}
          </a>
        </div>

        {/* Disclaimer & Copyright */}
        <p className="text-xs text-gray-600 font-inter max-w-xl leading-relaxed">
          {t('footer.disclaimer')}
          <br /><br />
          © 2026 UMBRELLA CORP. TACTICAL DATABASE HUB // RESUDB.COM
        </p>
      </div>
    </footer>
  );
};

export default Footer;
