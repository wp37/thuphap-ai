import React from 'react';

interface PageHeaderProps {
  titleStart: string;
  highlightWords: string;
  titleEnd?: string;
  description: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ titleStart, highlightWords, titleEnd = '', description }) => {
  return (
    <div className="mb-10 text-center lg:flex lg:flex-col lg:items-center">
      <div className="bg-transparent text-center bg-zinc-900/0 p-4 rounded-xl inline-block lg:block max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
          {titleStart} <span className="text-[#FFB800]">{highlightWords}</span> {titleEnd}
        </h1>
        <p className="text-zinc-400 text-lg font-light leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
