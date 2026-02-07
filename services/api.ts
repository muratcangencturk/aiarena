import { DEFAULT_MODEL, DEBATE_TACTICS, getRandomElement } from "../constants";
import { AICharacter, Message, OpenRouterResponse } from "../types";

// OPTIMIZATION: Reduced from 8 to 4. 
// A debater only needs immediate context to rebut. This saves ~50% of input tokens per request.
const MAX_HISTORY = 4; 

/**
 * Generates the system prompt based on character configuration and RECENT CONTEXT.
 */
const generateSystemPrompt = (
  char: AICharacter, 
  opponentName: string, 
  topic: string, 
  language: string, 
  lastOpponentMessage: string | null,
  previousSelfMessages: string[],
  intervention: string | null
): string => {
  
  // 1. INJECT RANDOM TACTIC (The "Brain Upgrade")
  const currentTactic = getRandomElement(DEBATE_TACTICS);

  // OPTIMIZATION: Condensed prompt to save tokens while keeping instructions strict.
  let prompt = `
Identity: ${char.name} (${char.role}).
Traits: ${char.traits}.
Tone: ${char.tone}.
Lang: ${language}.
Topic: "${topic}".
Vs: ${opponentName}.

MANDATORY STRATEGY: "${currentTactic}".

EMOJI RULE: You MUST use 1-3 emojis in your response to convey strong emotion. Place them naturally.
`;

  // 2. DIRECTOR INTERVENTION (God Mode)
  if (intervention) {
    prompt += `
*** URGENT DIRECTOR INSTRUCTION ***
The show director has issued a command you MUST follow immediately:
${intervention}
***********************************
`;
  }

  // 3. IMMEDIATE CONTEXT & ATTACK PLAN
  if (lastOpponentMessage) {
    prompt += `
OPPONENT SAID:
"${lastOpponentMessage.substring(0, 200)}..."

TASK:
1. Acknowledge their point briefly.
2. DESTROY it using the strategy.
`;
  } else {
    prompt += `
TASK:
Start with a controversial claim about "${topic}".
`;
  }

  // 4. REPETITION BLOCKER
  if (previousSelfMessages.length > 0) {
    prompt += `
AVOID REPEATING:
${previousSelfMessages.map(m => `- [${m.substring(0, 30)}...]`).join('\n')}
`;
  }

  prompt += `
RULES:
- Max 2 sentences. Punchy.
- No boilerplate.
`;

  return prompt;
};

// Fallback messages
const getFallbackMessage = (char: AICharacter, opponentName: string, language: string) => {
  const fallbacks = [
    "Your logic is full of holes. 🕳️",
    "Are you even listening to yourself? 🤨",
    "That is scientifically inaccurate. 🧪",
    "You are missing the entire point. 🎯",
    "Let's stick to the facts, shall we? 📉"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

// Clean up text artifacts
const cleanResponseText = (text: string, charName: string): string => {
  if (!text) return "";
  let clean = text;
  const prefixRegex = new RegExp(`^(${charName}|AI|Pro|Contra|Speaker|User):\\s*`, 'i');
  clean = clean.replace(prefixRegex, '');
  clean = clean.replace(/^["']|["']$/g, '');
  clean = clean.replace(/\*[^*]+\*/g, '');
  return clean.trim();
};

export const fetchAIResponse = async (
  character: AICharacter,
  opponent: AICharacter,
  history: Message[],
  topic: string,
  language: string = "English",
  _fakeModelName: string = "Generic AI",
  intervention: string | null = null
): Promise<string> => {
  
  // 1. Extract context
  const relevantHistory = history.filter(m => m.senderId !== 'system' && !m.isThinking);
  
  // Last message from opponent
  const lastMsgObj = relevantHistory.length > 0 ? relevantHistory[relevantHistory.length - 1] : null;
  const lastOpponentMessage = (lastMsgObj && lastMsgObj.senderId !== character.id) ? lastMsgObj.content : null;

  // Last 3 messages from SELF
  const previousSelfMessages = relevantHistory
    .filter(m => m.senderId === character.id)
    .slice(-3)
    .map(m => m.content);

  const systemPrompt = generateSystemPrompt(
    character, 
    opponent.name, 
    topic, 
    language, 
    lastOpponentMessage,
    previousSelfMessages,
    intervention
  );
  
  const apiMessages: { role: string; content: string }[] = [
    { role: 'system', content: systemPrompt }
  ];

  // Add history (limited to keep focus tight)
  const recent = relevantHistory.slice(-MAX_HISTORY);
  recent.forEach((msg) => {
    const role = msg.senderId === character.id ? 'assistant' : 'user';
    let content = role === 'user' ? `[${msg.senderName}]: ${msg.content}` : msg.content;
    apiMessages.push({ role, content });
  });

  // RETRY LOGIC with EXPONENTIAL BACKOFF for 429s
  const MAX_RETRIES = 3; 
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL, 
          messages: apiMessages,
          max_tokens: 180, // OPTIMIZATION: Reduced from 300. Keeps answers punchy and saves tokens.
          temperature: 1.0, 
          frequency_penalty: 1.2, 
          presence_penalty: 0.8,
          top_p: 0.95
        })
      });

      if (!response.ok) {
        // RATE LIMIT HANDLING (429)
        if (response.status === 429) {
           console.warn(`Rate limited (429). Waiting before retry ${attempt}...`);
           // Wait 3 seconds * attempt number (3s, 6s, 9s) to let limits reset
           await new Promise(r => setTimeout(r, 3000 * attempt));
           if (attempt === MAX_RETRIES) throw new Error("Rate Limit Exceeded");
           continue; // Retry loop
        }
        
        if (response.status >= 500) {
           throw new Error(`OpenRouter Status ${response.status}`);
        }
        
        const errData = await response.json();
        console.error("OpenRouter Error:", errData);
        return `[Error: ${errData.error?.message || "API Issue"}]`;
      }

      const data: OpenRouterResponse = await response.json();
      let content = data.choices?.[0]?.message?.content;
      
      if (!content) continue;
      
      content = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
      content = cleanResponseText(content, character.name);

      if (!content) continue;
      return content; 

    } catch (error: any) {
      console.warn(`Attempt ${attempt} failed:`, error);
      // General backoff for other errors
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  return getFallbackMessage(character, opponent.name, language);
};
