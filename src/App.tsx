
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import * as authService from './services/authService';
import ImagePreviewModal from './components/ImagePreviewModal';
import { LanguageProvider, useLanguage } from './i18n';
import { LoaderIcon } from './components/Icons';

const CalligraphyGenerator = lazy(() => import('./pages/CalligraphyGenerator'));
const CharacterSwapper = lazy(() => import('./pages/CharacterSwapper'));
const UserGuide = lazy(() => import('./pages/UserGuide'));

export type Page = 
  | 'calligraphy'
  | 'swapper'
  | 'userGuide';

const validPages: Page[] = [
  'calligraphy',
  'swapper',
  'userGuide'
];

const TRIAL_LIMIT = 10;
const LOCAL_STORAGE_TRIAL_KEY = 'tuai-trial-creations';

const getInitialTrialCount = (): number => {
  if (authService.getCurrentUser()) {
    return TRIAL_LIMIT;
  }
  const savedTrials = localStorage.getItem(LOCAL_STORAGE_TRIAL_KEY);
  if (savedTrials === null) {
    localStorage.setItem(LOCAL_STORAGE_TRIAL_KEY, String(TRIAL_LIMIT));
    return TRIAL_LIMIT;
  }
  const parsedTrials = parseInt(savedTrials, 10);
  if (isNaN(parsedTrials) || parsedTrials < 0) {
    localStorage.setItem(LOCAL_STORAGE_TRIAL_KEY, String(TRIAL_LIMIT));
    return TRIAL_LIMIT;
  }
  return parsedTrials;
};

type PreviewState = {
  url: string;
  onDownload: () => void;
  onRefresh?: () => void;
} | null;

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const [activePage, setActivePage] = useState<Page>(() => {
    const savedPage = localStorage.getItem('tuai-activePage');
    if (savedPage && (validPages as string[]).includes(savedPage)) {
      return savedPage as Page;
    }
    return 'calligraphy';
  });

  const [previewImage, setPreviewImage] = useState<PreviewState>(null);
  const isAdmin = true;
  
  useEffect(() => {
    localStorage.setItem('tuai-activePage', activePage);
  }, [activePage]);

  const handleOpenPreview = (url: string, onDownload: () => void, onRefresh?: () => void) => setPreviewImage({ url, onDownload, onRefresh });
  const handleClosePreview = () => setPreviewImage(null);

  const renderPage = () => {
    const commonProps = {
      isTrial: false,
      trialCreations: 9999,
      onTrialGenerate: () => {},
      onRequireLogin: () => {},
      onRequirePricing: () => {},
    };

    switch (activePage) {
      case 'calligraphy':
        return <CalligraphyGenerator {...commonProps} onOpenPreview={handleOpenPreview} />;
      case 'swapper':
        return <CharacterSwapper onOpenPreview={handleOpenPreview} />;
      case 'userGuide':
        return <UserGuide />;
      default:
        return <CalligraphyGenerator {...commonProps} onOpenPreview={handleOpenPreview} />; 
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#09090b] text-[#fafafa] selection:bg-[#D4AF37]/30 overflow-hidden relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-[250px] bg-[#D4AF37]/5 blur-[100px] rounded-full" />
      </div>

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />
      
      <div className="flex-1 flex flex-col overflow-y-auto w-full relative z-10">
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-[1700px] mx-auto w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePage}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                  className="w-full"
                >
                  <Suspense fallback={
                    <div className="flex justify-center items-center h-[50vh]">
                      <LoaderIcon className="w-8 h-8 animate-spin text-slate-500" />
                    </div>
                  }>
                    {renderPage()}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
          </div>
        </main>
        <Footer />
      </div>

      {previewImage && <ImagePreviewModal isOpen={!!previewImage} onClose={handleClosePreview} imageUrl={previewImage.url} onDownload={previewImage.onDownload} onRefresh={previewImage.onRefresh} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
