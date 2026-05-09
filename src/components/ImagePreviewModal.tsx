import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadIcon, EyeIcon, RefreshCwIcon } from './Icons';
import { useLanguage } from '../i18n';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  onDownload: (() => void) | null;
  onRefresh?: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, onClose, imageUrl, onDownload, onRefresh }) => {
  const { t } = useLanguage();
  if (!imageUrl) return null;

  const handleDownloadClick = () => {
    if (onDownload) onDownload();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[100] p-4 overflow-y-auto w-full h-[100dvh]" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-4 md:p-6 max-w-5xl w-full flex flex-col gap-4 relative my-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-10" aria-label={t('common.close')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-white text-center flex items-center justify-center gap-3 mr-12 ml-12"><EyeIcon />{t('common.previewAndDownload')}</h2>
            <div className="relative w-full max-h-[60vh] md:max-h-[75vh] flex items-center justify-center bg-zinc-900/50 rounded-xl p-2 md:p-4 border border-zinc-800/50">
                <img src={imageUrl} alt={t('common.previewAndDownload')} className="max-w-full max-h-[55vh] md:max-h-[70vh] object-contain rounded-lg shadow-lg" />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mt-2">
               <button onClick={handleDownloadClick} className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFB800] to-[#E6A600] text-zinc-950 font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-all text-lg w-full sm:w-auto"><DownloadIcon className="w-6 h-6" />{t('common.save')}</button>
               {onRefresh && (
                 <button onClick={() => { onRefresh(); onClose(); }} className="flex items-center justify-center gap-2 bg-zinc-800 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-zinc-700 transition-colors border border-zinc-700 w-full sm:w-auto"><RefreshCwIcon className="w-5 h-5" />{t('common.retry')}</button>
               )}
               <button onClick={onClose} className="w-full sm:w-auto bg-zinc-800/50 text-zinc-300 px-8 py-3 rounded-xl text-lg font-medium hover:bg-zinc-800 hover:text-white transition-colors border border-zinc-800">{t('common.close')}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImagePreviewModal;
