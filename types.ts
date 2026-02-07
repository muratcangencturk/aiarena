export type Role = string;

export type Tone = string;

export interface AICharacter {
  id: string; // 'ai1' or 'ai2'
  name: string;
  role: Role;
  tone: Tone;
  traits: string; // Comma separated list of traits
  inspiration?: string; // Optional: "Inspired by Socrates"
  avatarColor: string; // Tailwind class component, e.g., 'bg-red-600'
}

export interface Message {
  id: string;
  senderId: 'ai1' | 'ai2' | 'user' | 'system';
  senderName: string;
  content: string;
  timestamp: number;
  isThinking?: boolean; // For UI loading state
}

export interface DebateConfig {
  topic: string;
  ai1: AICharacter;
  ai2: AICharacter;
  language: string;
  model1: string; // The "Fake" model name for AI 1
  model2: string; // The "Fake" model name for AI 2
}

export type DebateStatus = 'idle' | 'running' | 'paused' | 'stopped';

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
  };
}
