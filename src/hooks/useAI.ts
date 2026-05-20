import { useState, useCallback, useEffect } from 'react';
import { AIMessage } from '../types';
import { aiResponses } from '../data/products';
import { readStorage, writeStorage } from '../utils/storage';

const AI_MESSAGES_STORAGE_KEY = 'smartcart:ai-messages';
const WELCOME_MESSAGE: AIMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi, I'm SmartCart AI. I can compare options, explain value, and surface the best coupon for your basket.",
  timestamp: new Date(),
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('worth') || lower.includes('good') || lower.includes('should i buy')) {
    const arr = aiResponses.worth;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  if (lower.includes('cheaper') || lower.includes('alternative') || lower.includes('other')) {
    const arr = aiResponses.alternative;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  if (lower.includes('best') || lower.includes('recommend') || lower.includes('which')) {
    const arr = aiResponses.best;
    return arr[Math.floor(Math.random() * arr.length)];
  }
  const arr = aiResponses.default;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useAI() {
  const [messages, setMessages] = useState<AIMessage[]>(() => {
    const stored = readStorage<Array<Omit<AIMessage, 'timestamp'> & { timestamp: string }>>(
      AI_MESSAGES_STORAGE_KEY,
      [],
    );

    if (stored.length === 0) return [WELCOME_MESSAGE];

    return stored.map(message => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }));
  });
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    writeStorage(
      AI_MESSAGES_STORAGE_KEY,
      messages.slice(-12).map(message => ({
        ...message,
        timestamp: message.timestamp.toISOString(),
      })),
    );
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const response = getAIResponse(content);
    const words = response.split(/\s+/).length;
    const typingDelay = Math.min(1900, 600 + words * 28 + Math.random() * 320);

    await new Promise(resolve => setTimeout(resolve, typingDelay));

    const aiMsg: AIMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiMsg]);
  }, []);

  return { messages, isTyping, sendMessage };
}
