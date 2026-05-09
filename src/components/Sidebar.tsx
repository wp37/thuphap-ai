import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Page } from '../App';
import { useLanguage } from '../i18n';
import { SparklesIcon } from './Icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const navItems: Page[] = [
  'calligraphy',
  'swapper',
  'userGuide'
];

const LanguageSelector = ({ isMobile = false }: { isMobile?: boolean }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { 
      code: 'vi', 
      label: 'VN', 
      flag: (
        <svg viewBox="0 0 30 20" className="w-5 h-3.5 sm:w-6 sm:h-4 rounded-sm shadow-md">
          <rect width="30" height="20" fill="#da251d"/>
          <polygon fill="#ffff00" points="15,4 16.5,8.5 21,8.5 17.5,11 19,15.5 15,13 11,15.5 12.5,11 9,8.5 13.5,8.5"/>
        </svg>
      )
    },
    { 
      code: 'en', 
      label: 'EN', 
      flag: (
        <svg viewBox="0 0 30 20" className="w-5 h-3.5 sm:w-6 sm:h-4 rounded-sm shadow-md">
          <rect width="30" height="20" fill="#3c3b6e"/>
          <path d="M0,0 H30 M0,3 H30 M0,6 H30 M0,9 H30 M0,12 H30 M0,15 H30 M0,18 H30" stroke="#b22234" strokeWidth="1.5"/>
          <rect width="12" height="10" fill="#3c3b6e"/>
          <circle cx="2" cy="2" r="0.4" fill="white"/><circle cx="4" cy="2" r="0.4" fill="white"/><circle cx="6" cy="2" r="0.4" fill="white"/><circle cx="8" cy="2" r="0.4" fill="white"/><circle cx="10" cy="2" r="0.4" fill="white"/>
          <circle cx="3" cy="4" r="0.4" fill="white"/><circle cx="5" cy="4" r="0.4" fill="white"/><circle cx="7" cy="4" r="0.4" fill="white"/><circle cx="9" cy="4" r="0.4" fill="white"/>
          <circle cx="2" cy="6" r="0.4" fill="white"/><circle cx="4" cy="6" r="0.4" fill="white"/><circle cx="6" cy="6" r="0.4" fill="white"/><circle cx="8" cy="6" r="0.4" fill="white"/><circle cx="10" cy="6" r="0.4" fill="white"/>
        </svg>
      )
    },
    { 
      code: 'zh', 
      label: 'ZH', 
      flag: (
        <svg viewBox="0 0 30 20" className="w-5 h-3.5 sm:w-6 sm:h-4 rounded-sm shadow-md">
          <rect width="30" height="20" fill="#ee1c25"/>
          <polygon fill="#ffff00" points="5,5 6,8.5 9,8.5 6.5,10.5 7.5,14 5,12 2.5,14 3.5,10.5 1,8.5 4,8.5" />
          <polygon fill="#ffff00" points="10,2 10.5,3 11.5,3 10.7,3.6 11,4.5 10,4.2 9,4.5 9.3,3.6 8.5,3 9.5,3" />
          <polygon fill="#ffff00" points="12,5 12.5,6 13.5,6 12.7,6.6 13,7.5 12,7.2 11,7.5 11.3,6.6 10.5,6 11.5,6" />
          <polygon fill="#ffff00" points="12,9 12.5,10 13.5,10 12.7,10.6 13,11.5 12,11.2 11,11.5 11.3,10.6 10.5,10 11.5,10" />
          <polygon fill="#ffff00" points="10,12 10.5,13 11.5,13 10.7,13.6 11,14.5 10,14.2 9,14.5 9.3,13.6 8.5,13 9.5,13" />
        </svg>
      )
    },
  ] as const;

  useEffect(() => {
    if (!isMobile) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el.closest('.lang-dropdown')) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, isMobile]);

  if (isMobile) {
    const activeLang = languages.find(l => l.code === language) || languages[0];
    return (
      <div className="relative lang-dropdown">
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1.5 px-2 py-1.5 bg-zinc-900 rounded-lg border border-zinc-700 shadow-sm active:scale-95">
          <div className="shrink-0 w-4 h-3 flex items-center justify-center">{activeLang.flag}</div>
          <motion.svg animate={{ rotate: isOpen ? 180 : 0 }} width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-400">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -5 }} transition={{ duration: 0.15 }} className="absolute top-full mt-2 right-0 flex flex-col p-1.5 gap-1 bg-zinc-900 rounded-lg border border-zinc-700 shadow-xl z-50 min-w-[100px] origin-top-right">
              {languages.map((lang) => (
                <button key={lang.code} onClick={() => { setLanguage(lang.code); setIsOpen(false); }} className={`flex items-center gap-2 px-2 py-2 rounded-md transition-all text-left ${language === lang.code ? 'bg-[#FFB800]/15 text-[#FFB800]' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}>
                  <div className="shrink-0 w-4 h-3 flex items-center justify-center">{lang.flag}</div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{lang.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-3 gap-1 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800 shadow-2xl w-full`}>
      {languages.map((lang) => (
        <button key={lang.code} onClick={() => setLanguage(lang.code)} className={`flex items-center justify-center gap-2 px-2 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${language === lang.code ? 'bg-zinc-800 text-[#FFB800]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'}`} title={lang.label}>
          <div className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${language === lang.code ? 'scale-105' : ''}`}>{lang.flag}</div>
          <span className="text-[10px] font-black tracking-widest uppercase hidden xs:block">{lang.label}</span>
          {language === lang.code && <motion.div layoutId="activeLang" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFB800]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
        </button>
      ))}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => { setIsOpen(false); }, [activePage]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const Branding = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex ${isMobile ? 'items-center gap-3 overflow-hidden ml-1 flex-1' : 'flex-col gap-8 w-full'}`}>
      <div className={`flex items-center ${isMobile ? 'gap-2 max-w-full' : 'gap-4 w-full'} cursor-pointer group select-none min-w-0`} onClick={() => setActivePage('calligraphy')}>
        <div className={`relative shrink-0 ${isMobile ? 'w-10 h-10 rounded-xl' : 'w-16 h-16 rounded-[1.4rem]'} bg-zinc-950 flex items-center justify-center transition-all duration-500 border border-[#FFB800] group-hover:scale-105 active:scale-95`}>
          <span className={`text-[#FFB800] font-black tracking-tighter transition-all duration-500 ${isMobile ? 'text-sm' : 'text-xl'}`}>TUAI</span>
          <SparklesIcon className={`text-[#FFB800] absolute animate-pulse ${isMobile ? 'w-3 h-3 -top-0.5 -right-1' : 'w-6 h-6 -top-1.5 -right-2'}`} />
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <span className={`text-white font-black tracking-tight leading-tight transition-all duration-300 group-hover:text-[#FFB800] whitespace-normal ${isMobile ? 'text-base sm:text-lg' : 'text-2xl sm:text-3xl'}`}>{t('header.brandTitle')}</span>
          <div className="flex items-center gap-1 mt-1 overflow-hidden w-full">
            <div className="h-[1px] w-2 sm:flex-1 bg-[#FFB800]/40 group-hover:bg-[#FFB800] transition-all duration-300 shrink-0" />
            <span className={`text-[8px] sm:text-[9px] flex items-center text-center gap-1 uppercase tracking-tight text-[#FFB800] font-black leading-tight whitespace-normal`}>
              <SparklesIcon className="w-2.5 h-2.5 hidden sm:block shrink-0" />{t('header.brandTagline')}<SparklesIcon className="w-2.5 h-2.5 hidden sm:block shrink-0" />
            </span>
            <div className="h-[1px] w-2 sm:flex-1 bg-[#FFB800]/40 group-hover:bg-[#FFB800] transition-all duration-300 shrink-0" />
          </div>
        </div>
      </div>
      {!isMobile && <div className="w-full"><LanguageSelector isMobile={false} /></div>}
    </div>
  );

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 w-full bg-black border-b border-[#3f3f46] px-3 sm:px-4 h-16 flex items-center justify-between shadow-2xl shrink-0 gap-2">
        <Branding isMobile={true} />
        <div className="flex items-center gap-3 shrink-0">
          <LanguageSelector isMobile={true} />
          <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 rounded-lg bg-[#18181b] border border-[#3f3f46] flex flex-col items-center justify-center gap-1.5 text-white z-50 focus:outline-none shrink-0 cursor-pointer">
            <motion.div animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-white rounded-full origin-center" />
            <motion.div animate={isOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-0.5 bg-white rounded-full" />
            <motion.div animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-white rounded-full origin-center" />
          </button>
        </div>
      </header>
      <AnimatePresence>{isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setIsOpen(false)} className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />}</AnimatePresence>
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-black border-r border-[#3f3f46] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out shrink-0 min-h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 shrink-0 hidden lg:block"><Branding /></div>
        <div className="flex-1 overflow-y-auto px-4 py-8 lg:py-4 space-y-2">
          {navItems.map((item, index) => {
            const isUserGuide = item === 'userGuide';
            return (
              <React.Fragment key={item}>
                {isUserGuide && <div className="my-6 h-[1px] bg-zinc-800" />}
                <div className="relative group/nav">
                  <button onClick={() => setActivePage(item)} className={`w-full text-left px-4 py-3 rounded-lg text-xs font-black tracking-widest uppercase transition-all duration-150 flex items-center gap-3 ${activePage === item ? 'text-black bg-[#FFB800] border border-[#FFB800] shadow-[0_0_20px_rgba(255,184,0,0.3)]' : isUserGuide ? 'text-zinc-500 bg-zinc-900/50 border border-zinc-800 hover:text-white hover:bg-zinc-800' : 'text-[#a1a1aa] hover:text-white hover:bg-zinc-900 border border-transparent'}`}>
                    {!isUserGuide && <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border ${activePage === item ? 'bg-zinc-950 text-[#FFB800] border-[#FFB800]' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}`}>{index + 1}</span>}
                    {t(`nav.${item}`)}
                  </button>
                  {!isUserGuide && (
                    <button onClick={(e) => { e.stopPropagation(); setActivePage('userGuide'); setTimeout(() => { const el = document.getElementById(`guide-${item}`); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-zinc-800 text-zinc-400 opacity-0 group-hover/nav:opacity-100 hover:bg-[#FFB800] hover:text-black transition-all z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </button>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
