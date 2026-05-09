import React from 'react';
import { useLanguage } from '../i18n';

type Color = {
  name: string;
  hex: string;
};

interface ColorPaletteProps {
  colors: Color[];
  onSelectColor: (colorName: string) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({ colors, onSelectColor }) => {
  const { t } = useLanguage();
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-slate-400 mb-2">{t('common.addColor')}:</h3>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => (
          <button
            key={color.name}
            type="button"
            title={color.name}
            onClick={() => onSelectColor(color.name)}
            style={{ backgroundColor: color.hex }}
            className={`w-7 h-7 rounded-full cursor-pointer border-2 border-slate-700 hover:border-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-fuchsia-500 transition-transform hover:scale-110
            ${color.hex === '#ffffff' ? 'border-slate-400' : ''}
            ${color.hex === '#000000' ? 'shadow-inner' : ''}`}
            aria-label={`${t('common.addColor')} ${color.name}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
