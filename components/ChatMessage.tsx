import React, { useEffect, useState } from 'react';
import { Message, AICharacter } from '../types';
import { getTranslation } from '../translations';

interface Props {
  message: Message;
  ai1: AICharacter;
  ai2: AICharacter;
  language: string;
}

export const ChatMessage: React.FC<Props> = ({ message, ai1, ai2, language }) => {
  const isSystem = message.senderId === 'system';
  const isUser = message.senderId === 'user';
  const isAi1 = message.senderId === 'ai1'; // Red
  const isAi2 = message.senderId === 'ai2'; // Blue
  
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const t = (key: string) => getTranslation(language, key);

  // Typewriter effect logic
  useEffect(() => {
    // If it's a system message, thinking, or user message (optional), show immediately
    // Or if the component is mounting with an OLD message (from history), show immediately
    if (isSystem || message.isThinking) {
      setDisplayedContent(message.content);
      setIsTyping(false);
      return;
    }

    // Check if message is "new" (arrived within last 2 seconds)
    const isNew = (Date.now() - message.timestamp) < 2000;

    if (!isNew) {
      setDisplayedContent(message.content);
      setIsTyping(false);
      return;
    }

    // Start typing
    setIsTyping(true);
    setDisplayedContent("");
    
    let currentIndex = 0;
    const fullText = message.content;
    const speed = 20; // ms per character (faster for short messages)

    const intervalId = setInterval(() => {
      currentIndex++;
      setDisplayedContent(fullText.substring(0, currentIndex));
      
      if (currentIndex >= fullText.length) {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [message.content, message.isThinking, message.timestamp, isSystem]);

  
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs font-mono text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          {message.content}
        </span>
      </div>
    );
  }

  // Determine alignment and color
  // DEFAULT (AI1/Red) -> RIGHT
  let alignClass = 'justify-end ml-12';
  let bgClass = 'bg-gradient-to-br from-slate-800 to-slate-900';
  let borderClass = `border-${ai1.avatarColor.replace('bg-', '')} border-r-4`;
  let name = message.senderName;
  
  if (isUser) {
    alignClass = 'justify-center';
    bgClass = 'bg-purple-900/80 text-purple-100';
    borderClass = 'border-purple-500';
  } else if (isAi2) { // Blue -> LEFT
    alignClass = 'justify-start mr-12';
    bgClass = 'bg-gradient-to-bl from-slate-800 to-slate-900';
    borderClass = `border-${ai2.avatarColor.replace('bg-', '')} border-l-4`;
  }

  return (
    <div className={`flex w-full mb-4 ${alignClass}`}>
      <div className={`
        relative max-w-[85%] md:max-w-[70%] p-4 rounded-lg shadow-md border ${borderClass} ${bgClass}
        ${message.isThinking ? 'animate-pulse' : ''}
      `}>
        {!isUser && (
          <div className={`text-xs font-bold mb-1 opacity-70 ${isAi2 ? 'text-left' : 'text-right'}`}>
            {name}
          </div>
        )}
        {isUser && (
           <div className="text-xs font-bold mb-1 text-center opacity-70 text-purple-300">{t('userInterjection')}</div>
        )}
        <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base min-h-[1.5rem]">
          {displayedContent}
          {isTyping && <span className="inline-block w-1.5 h-4 bg-slate-400 ml-1 animate-pulse align-middle"></span>}
        </div>
        {!message.isThinking && !isTyping && (
          <div className="text-[10px] text-slate-500 mt-2 text-right">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};