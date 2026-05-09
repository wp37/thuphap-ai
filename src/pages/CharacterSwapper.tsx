
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadIcon, 
  Trash2Icon, 
  RefreshCwIcon, 
  DownloadIcon, 
  ImageIcon, 
  UserIcon, 
  ArrowRightLeftIcon,
  CheckCircle2Icon,
  LoaderIcon
} from 'lucide-react';
import * as geminiService from '../services/geminiService';
import { useLanguage } from '../i18n';

type ImageState = {
  url: string;
  base64: string;
  mimeType: string;
} | null;

const CharacterSwapper: React.FC<{ onOpenPreview: (url: string, onDownload: () => void) => void }> = ({ onOpenPreview }) => {
  const { t } = useLanguage();
  const [backgroundImg, setBackgroundImg] = useState<ImageState>(null);
  const [characterImg, setCharacterImg] = useState<ImageState>(null);
  const [aspectRatio, setAspectRatio] = useState<geminiService.AspectRatio>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const aspectRatios: { id: geminiService.AspectRatio; label: string; icon: string }[] = [
    { id: '1:1', label: '1:1 (Vuông)', icon: '▢' },
    { id: '9:16', label: '9:16 (Dọc)', icon: '▯' },
    { id: '16:9', label: '16:9 (Ngang)', icon: '▭' }
  ];
  
  const [isSeparated, setIsSeparated] = useState(false);
  const [isAnalyseReady, setIsAnalyseReady] = useState(false);
  const [analysisData, setAnalysisData] = useState<geminiService.SwapAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const bgInputRef = useRef<HTMLInputElement>(null);
  const charInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setBackgroundImg(null);
    setCharacterImg(null);
    setResult(null);
    setError(null);
    setIsSeparated(false);
    setIsAnalyseReady(false);
    setAnalysisData(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'bg' | 'char') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setError('Vui lòng tải lên đúng định dạng ảnh.');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const newState = {
        url: URL.createObjectURL(file),
        base64,
        mimeType: file.type
      };
      if (type === 'bg') {
          setBackgroundImg(newState);
          setIsSeparated(false);
          setAnalysisData(null);
      } else {
          setCharacterImg(newState);
          setIsSeparated(false);
          setAnalysisData(null);
      }
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyse = async () => {
      if (!backgroundImg || !characterImg) return;
      setIsProcessing(true);
      setError(null);
      try {
          const analysis = await geminiService.analyzeSwapContext(
              { base64: backgroundImg.base64, mimeType: backgroundImg.mimeType },
              { base64: characterImg.base64, mimeType: characterImg.mimeType }
          );
          setAnalysisData(analysis);
          setIsAnalyseReady(true);
          setIsSeparated(true); // Auto-advance to ready state
      } catch (err: any) {
          setError(err.message || 'Lỗi phân tích bối cảnh.');
      } finally {
          setIsProcessing(false);
      }
  };

  const handleSwap = async () => {
    if (!backgroundImg || !characterImg) {
      setError('Vui lòng tải lên cả ảnh bối cảnh và ảnh nhân vật.');
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setError(null);

    try {
      const swappedUrl = await geminiService.swapCharacter(
        { base64: backgroundImg.base64, mimeType: backgroundImg.mimeType },
        { base64: characterImg.base64, mimeType: characterImg.mimeType },
        aspectRatio,
        analysisData || undefined
      );
      setResult(swappedUrl);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi hoán đổi nhân vật.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `character-swap-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3 italic">
          <ArrowRightLeftIcon className="w-10 h-10 text-[#D4AF37]" />
          {t('swapper.title').split(' ').map((word, i, arr) => (
            i === arr.length - 1 ? <span key={i} className="text-[#D4AF37]">{word}</span> : word + ' '
          ))}
        </h1>
        <p className="text-zinc-500 text-sm sm:text-base max-w-2xl font-medium">
          {t('swapper.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-950/50 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="space-y-6 relative z-10">
              {/* Step 1: Background */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-[#D4AF37] flex items-center justify-center text-[10px]">1</span>
                  {t('swapper.bgLabel')}
                </label>
                <div 
                  className={`relative group aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${backgroundImg ? 'border-[#D4AF37]/50 bg-zinc-900/50' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900'}`}
                  onClick={() => bgInputRef.current?.click()}
                >
                  <input type="file" hidden accept="image/*" ref={bgInputRef} onChange={(e) => handleImageUpload(e, 'bg')} />
                  {backgroundImg ? (
                    <div className="relative w-full h-full">
                      <img src={backgroundImg.url} alt="Background" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); setBackgroundImg(null); }} className="p-3 bg-red-500/20 backdrop-blur-md rounded-full text-red-500 hover:bg-red-500/40 transition-colors">
                          <Trash2Icon className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
                          <RefreshCwIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">{t('swapper.uploadBg')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Character Source */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-[#D4AF37] flex items-center justify-center text-[10px]">2</span>
                  {t('swapper.charLabel')}
                </label>
                <div 
                  className={`relative group aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${characterImg ? 'border-[#D4AF37]/50 bg-zinc-900/50' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900'}`}
                  onClick={() => charInputRef.current?.click()}
                >
                  <input type="file" hidden accept="image/*" ref={charInputRef} onChange={(e) => handleImageUpload(e, 'char')} />
                  {characterImg ? (
                    <div className="relative w-full h-full">
                      <img src={characterImg.url} alt="Character" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); setCharacterImg(null); setIsSeparated(false); }} className="p-3 bg-red-500/20 backdrop-blur-md rounded-full text-red-500 hover:bg-red-500/40 transition-colors">
                          <Trash2Icon className="w-5 h-5" />
                        </button>
                        <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors">
                          <RefreshCwIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">{t('swapper.uploadChar')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Aspect Ratio */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Tỷ lệ khung hình
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {aspectRatios.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id)}
                      className={`py-2 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${aspectRatio === ratio.id ? 'bg-[#D4AF37] border-white/20 text-black shadow-lg shadow-[#D4AF37]/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                    >
                      <span className="text-lg">{ratio.icon}</span>
                      {ratio.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Controls */}
              <div className="pt-4 space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleAnalyse}
                      disabled={!backgroundImg || !characterImg || isProcessing || isAnalyseReady}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${isAnalyseReady ? 'bg-green-500/10 border-green-500/30 text-green-500' : (backgroundImg && characterImg) ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-[#D4AF37] hover:text-[#D4AF37]' : 'bg-zinc-900/30 border-zinc-900 text-zinc-700 cursor-not-allowed'}`}
                    >
                      {isProcessing ? <LoaderIcon className="w-5 h-5 animate-spin mb-1" /> : isAnalyseReady ? <CheckCircle2Icon className="w-5 h-5 mb-1" /> : <RefreshCwIcon className="w-5 h-5 mb-1" />}
                      <span className="text-[9px] font-black uppercase tracking-widest text-center">{isAnalyseReady ? 'Đã phân tích Blueprint' : 'Bước 1: Phân tích Blueprint'}</span>
                    </button>
                    
                    <button 
                      onClick={handleSwap}
                      disabled={!backgroundImg || !characterImg || !isAnalyseReady || isGenerating}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border shadow-xl transition-all ${isGenerating ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white animate-pulse' : (backgroundImg && characterImg && isAnalyseReady) ? 'bg-[#D4AF37] border-white/20 text-black hover:scale-[1.02]' : 'bg-zinc-900/30 border-zinc-900 text-zinc-700 cursor-not-allowed'}`}
                    >
                      {isGenerating ? <LoaderIcon className="w-5 h-5 animate-spin mb-1" /> : <ArrowRightLeftIcon className="w-5 h-5 mb-1" />}
                      <span className="text-[9px] font-black uppercase tracking-widest text-center">Bước 2: Hoán đổi & Ghép</span>
                    </button>
                 </div>

                 <button 
                   onClick={handleReset}
                   disabled={isProcessing || isGenerating}
                   className="w-full py-3 rounded-2xl border border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                 >
                   <Trash2Icon className="w-4 h-4" />
                   Xóa tất cả & Làm lại từ đầu
                 </button>

                 {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-wider text-center">
                      {error}
                    </motion.div>
                 )}
              </div>
            </div>
          </div>

          <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-2xl p-4">
             <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                   <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                   <h4 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider mb-1">{t('swapper.tipTitle')}</h4>
                   <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                     Lưu ý: Đảm bảo hình ảnh tải lên hiển thị đầy đủ trong khung. AI sẽ phân tích toàn bộ bối cảnh và nhân vật để tạo ra bản ghép hoàn hảo nhất. {t('swapper.tipContent')}
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-7 h-full">
           <div className="bg-zinc-950/30 border border-zinc-800/80 rounded-[2rem] aspect-square lg:aspect-auto lg:h-[700px] flex items-center justify-center relative overflow-hidden group">
              <AnimatePresence mode="wait">
                 {result ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      className="w-full h-full relative"
                    >
                       <img src={result} alt="Result" className="w-full h-full object-contain" />
                       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                          <button 
                            onClick={handleDownload}
                            className="px-6 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-2xl"
                          >
                            <DownloadIcon className="w-4 h-4" />
                            {t('swapper.download')}
                          </button>
                          <button 
                            onClick={() => onOpenPreview(result, handleDownload)}
                            className="px-6 py-3 bg-zinc-900 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all"
                          >
                            {t('swapper.zoom')}
                          </button>
                       </div>
                    </motion.div>
                 ) : isGenerating ? (
                    <motion.div 
                       key="loading"
                       className="flex flex-col items-center gap-6"
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                    >
                       <div className="relative">
                          <div className="w-24 h-24 border-b-2 border-[#D4AF37] rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                             <ArrowRightLeftIcon className="w-8 h-8 text-[#D4AF37] animate-pulse" />
                          </div>
                       </div>
                       <div className="space-y-1 text-center">
                          <p className="text-white font-black uppercase tracking-[0.3em] text-xs">{t('swapper.processing')}</p>
                          <p className="text-zinc-500 text-[10px] font-bold">{t('common.processing')}</p>
                       </div>
                    </motion.div>
                 ) : (
                    <div className="flex flex-col items-center gap-4 text-zinc-600">
                       <ArrowRightLeftIcon className="w-16 h-16 opacity-10" />
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">{t('swapper.resultsPlaceholder')}</p>
                    </div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSwapper;
