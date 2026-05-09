import React from 'react';
import { motion } from 'framer-motion';
import { LoaderIcon, CheckCircleIcon } from './Icons';

interface ProgressBarProps {
  progress: number;
  statusText: string;
  accentColor?: 'emerald' | 'fuchsia' | 'cyan' | 'sky' | 'amber' | 'purple';
}

const colorClasses = {
  emerald: 'bg-emerald-500',
  fuchsia: 'bg-fuchsia-500',
  cyan: 'bg-cyan-500',
  sky: 'bg-sky-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
  yellow: 'bg-yellow-500',
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, statusText, accentColor = 'amber' }) => {
  const isComplete = progress >= 100;

  return (
    <div className="w-full flex flex-col items-center justify-center bg-[#18181b] border border-[#27272a] rounded-xl p-10">
      {isComplete ? (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <CheckCircleIcon className="w-12 h-12 text-emerald-500 mb-4" />
        </motion.div>
      ) : (
        <LoaderIcon className="w-12 h-12 text-[#fafafa] animate-spin mb-4" />
      )}
      <p className="text-[#fafafa] font-bold text-lg text-center mb-6 tracking-tight">{statusText}</p>
      <div className="w-full bg-[#09090b] rounded-full h-3 relative overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClasses[accentColor]}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="mt-2 text-[#71717a] font-bold text-xs uppercase tracking-widest">
        {Math.round(progress)}% {statusText || '...'}
      </div>
    </div>
  );
};

export default ProgressBar;