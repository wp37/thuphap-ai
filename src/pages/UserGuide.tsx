
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../i18n';
import { 
  SparklesIcon, 
  CameraIcon, 
  PaletteIcon, 
  BoxIcon, 
  GlobeIcon, 
  UserIcon, 
  ShapesIcon,
  BookOpenIcon,
  CheckCircleIcon
} from '../components/Icons';

const features = [
  { id: 'tetPhoto', icon: SparklesIcon, color: '#FFB800' },
  { id: 'fashionStudio', icon: PaletteIcon, color: '#EC4899' },
  { id: 'productPackaging', icon: BoxIcon, color: '#8B5CF6' },
  { id: 'productPhotoshoot', icon: CameraIcon, color: '#3B82F6' },
  { id: 'onlineTravel', icon: GlobeIcon, color: '#10B981' },
  { id: 'profileImage', icon: UserIcon, color: '#F59E0B' },
  { id: 'legoAssembly', icon: ShapesIcon, color: '#EF4444' },
];

const UserGuide: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <header className="text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[#FFB800] text-xs font-black uppercase tracking-widest mb-6"
        >
          <BookOpenIcon className="w-4 h-4" />
          {t('userGuide.badge')}
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight"
        >
          {t('userGuide.titleStart')} <span className="text-[#FFB800]">{t('userGuide.titleHighlight')}</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-400 text-lg max-w-2xl mx-auto font-medium"
        >
          {t('userGuide.description')}
        </motion.p>
      </header>

      <div className="space-y-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.section 
              key={feature.id}
              id={`guide-${feature.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden"
            >
              <div className="p-8 lg:p-12">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Column: Icon & Title */}
                  <div className="lg:w-1/3">
                    <div className={`w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-2xl`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
                      {index + 1}. {t(`nav.${feature.id}`)}
                    </h2>
                    <p className="text-zinc-400 font-medium leading-relaxed">
                      {t(`userGuide.features.${feature.id}.description`)}
                    </p>
                  </div>

                <div className="flex-1 space-y-4">
                    {[1, 2, 3].map((stepNum) => {
                      const stepTitle = t(`userGuide.features.${feature.id}.step${stepNum}_title`);
                      if (stepTitle.includes(`.step${stepNum}_title`)) return null;

                      return (
                        <div key={stepNum} className="p-5 rounded-2xl bg-zinc-950/40 border border-zinc-800/30">
                          <h3 className="text-sm font-black text-[#FFB800] mb-2 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-[#FFB800] text-black flex items-center justify-center text-[10px]">{stepNum}</span>
                            {stepTitle}
                          </h3>
                          
                          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                            {[1, 2, 3, 4, 5].map((subNum) => {
                              const subText = t(`userGuide.features.${feature.id}.step${stepNum}_sub${subNum}`);
                              if (subText.includes(`_sub${subNum}`)) return null;

                              return (
                                <div key={subNum} className="flex items-start gap-2 text-zinc-400 text-[13px] font-medium py-0.5">
                                  <span className="text-[#FFB800]/50">•</span>
                                  <span>{subText}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.section>
          );
        })}
      </div>

      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-20 p-10 rounded-[2.5rem] bg-zinc-900/50 border border-zinc-800/50 text-center"
      >
        <h3 className="text-2xl font-black text-white mb-3">{t('userGuide.footerTitle')}</h3>
        <p className="text-zinc-400 text-sm font-medium mb-10 max-w-lg mx-auto">
          {t('userGuide.footerDescription')}
        </p>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-bold bg-zinc-950/50 p-6 rounded-[2rem] border border-zinc-800">
          <div className="flex items-center gap-3">
             <span className="text-zinc-500 uppercase tracking-widest text-[10px]">{t('userGuide.contactPhone')} (Võ Ngọc Tùng):</span>
             <a href="tel:0814666040" className="text-white hover:text-[#FFB800] transition-colors font-black text-lg">0814 666 040</a>
          </div>
          
          <div className="w-[1px] h-6 bg-zinc-800 hidden lg:block" />

          <div className="flex items-center gap-3">
             <span className="text-zinc-500 uppercase tracking-widest text-[10px]">Zalo Web:</span>
             <a 
              href="https://zalo.me/0814666040" 
              target="_blank" 
              rel="noreferrer"
              className="text-[#FFB800] hover:text-white transition-colors font-black underline underline-offset-4"
             >
                0814 666 040 (Chat Ngay)
             </a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default UserGuide;
