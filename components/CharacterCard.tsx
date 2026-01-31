import React from 'react';
import { AICharacter } from '../types';
import { getTranslation } from '../translations';

interface Props {
  character: AICharacter;
  isActive: boolean;
  align: 'left' | 'right';
  language: string;
}

export const CharacterCard: React.FC<Props> = ({ character, isActive, align, language }) => {
  const isLeft = align === 'left';
  const t = (key: string) => getTranslation(language, key);
  
  // Visual style based on team color, not role
  const isRed = character.id === 'ai1';
  let roleColor = isRed ? 'text-red-400 border-red-600 bg-red-900/30' : 'text-blue-400 border-blue-600 bg-blue-900/30';
  
  return (
    <div className={`
      relative w-full md:w-64 p-4 rounded-xl border-2 transition-all duration-300
      ${isActive 
        ? `border-${character.avatarColor.replace('bg-', '')} shadow-[0_0_20px_rgba(var(--color-${character.avatarColor}),0.3)] bg-arena-card scale-105 z-10` 
        : 'border-slate-800 bg-slate-900/40 opacity-80 blur-[1px]'}
      flex flex-col ${isLeft ? 'items-start' : 'items-end'}
    `}>
      {/* Speaking Indicator */}
      {isActive && (
        <div className={`absolute -top-3 ${isLeft ? 'left-4' : 'right-4'} bg-white text-black text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-lg animate-pulse`}>
          {t('speaking')}
        </div>
      )}

      {/* Avatar */}
      <div className={`w-20 h-20 rounded-full mb-3 flex items-center justify-center text-3xl font-bold shadow-2xl
        ${character.avatarColor} text-white ring-4 ring-offset-4 ring-offset-slate-950 ring-opacity-50 border-2 border-white/20
        ${isActive ? 'ring-white/20' : 'ring-transparent'} transition-all duration-300
      `}>
        {character.name.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <h2 className="text-2xl font-black text-white truncate max-w-full tracking-tight mb-1">{character.name}</h2>
      
      {/* Role / Stance Box (Neutral) */}
      <div className={`text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded border ${roleColor} w-full text-center shadow-inner`}>
        {character.role}
      </div>

      {/* Stats */}
      <div className={`w-full mt-1 pt-3 border-t border-white/10 text-xs space-y-1.5 text-slate-400 ${isLeft ? 'text-left' : 'text-right'}`}>
         <div className="flex justify-between items-center gap-2">
            <span className="text-slate-500 font-bold uppercase text-[10px]">{t('tone')}</span>
            <span className="text-slate-200 font-medium truncate">{character.tone}</span>
         </div>
         <div className="flex justify-between items-center gap-2">
            <span className="text-slate-500 font-bold uppercase text-[10px]">{t('traits')}</span>
            <span className="text-slate-400 text-[10px] truncate max-w-[80px]">{character.traits.split(',')[0]}</span>
         </div>
      </div>
    </div>
  );
};