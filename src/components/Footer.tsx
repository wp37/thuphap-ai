import React from 'react';
import { useLanguage } from '../i18n';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-zinc-800/30 bg-[#020202] text-zinc-400 py-16 px-6 mt-16 relative z-10 transition-all">
      <div className="max-w-[1700px] mx-auto flex flex-col items-center gap-12">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-10 md:gap-4">
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-zinc-50 font-black text-2xl tracking-tighter uppercase leading-none">TUAI Enterprise</span>
              <div className="h-[2px] w-12 bg-gradient-to-r from-[#FFB800] to-transparent mt-2 rounded-full hidden md:block"></div>
            </div>
              <span className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase">{t('footer.tagline')}</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <p className="text-[9px] text-zinc-600 font-black tracking-[0.4em] uppercase">{t('footer.contactSupport')}</p>
            <a href="https://zalo.me/0814666040" target="_blank" rel="noopener noreferrer" className="px-10 py-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-xl hover:border-[#FFB800]/50 hover:bg-[#FFB800]/5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-700 group flex items-center gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFB800] shadow-[0_0_10px_#FFB800] animate-pulse"></div>
              <span className="text-[#FFB800] font-black text-sm tracking-[0.2em] group-hover:scale-105">{t('footer.contactButton')}</span>
            </a>
          </div>
          <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right space-y-3">
            <div className="flex flex-col items-center md:items-end">
              <span className="text-[10px] text-zinc-600 font-black tracking-[0.2em] uppercase mb-1">{t('footer.poweredBy')}</span>
              <span className="text-[11px] text-zinc-400 font-medium tracking-tight opacity-70 italic">{t('footer.rights')}</span>
            </div>
          </div>
        </div>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent"></div>
      </div>
    </footer>
  );
}

export default Footer;
