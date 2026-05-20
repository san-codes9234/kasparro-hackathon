import { useCallback, useEffect, useRef, useState } from 'react';

interface HesitationEvent {
  type: 'idle' | 'quantity_change' | 'remove_add' | 'hover_back' | 'rapid_switch';
  timestamp: number;
  details?: string;
}

interface AIReaction {
  message: string;
  type: 'help' | 'trending' | 'discount' | 'preference' | 'general';
  confidence: number;
}

interface ReactionState extends AIReaction {
  timestamp: number;
}

const AI_REACTIONS: AIReaction[] = [
  { message: 'Need help deciding?', type: 'help', confidence: 85 },
  { message: 'This item is trending right now.', type: 'trending', confidence: 78 },
  { message: 'Limited-time discount available.', type: 'discount', confidence: 92 },
  { message: 'Students usually prefer this option.', type: 'preference', confidence: 75 },
  { message: 'Based on your browsing, this might be a good fit.', type: 'general', confidence: 80 },
  { message: 'Other customers often complete this bundle.', type: 'general', confidence: 82 },
  { message: 'This product has excellent reviews.', type: 'trending', confidence: 88 },
  { message: 'You seem interested - want to learn more?', type: 'help', confidence: 79 },
];

export function useAIHesitationDetection() {
  const [hesitationLevel, setHesitationLevel] = useState(0);
  const [lastReaction, setLastReaction] = useState<ReactionState | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(75);

  const eventsRef = useRef<HesitationEvent[]>([]);
  const idleTimerRef = useRef<number | null>(null);
  const reactionTimerRef = useRef<number | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      recordEvent({ type: 'idle', timestamp: Date.now() });
    }, 8000); // 8 seconds of idle triggers hesitation
  }, []);

  const recordEvent = useCallback((event: HesitationEvent) => {
    eventsRef.current.push(event);

    // Keep only last 20 events
    if (eventsRef.current.length > 20) {
      eventsRef.current = eventsRef.current.slice(-20);
    }

    calculateHesitationLevel();
  }, []);

  const calculateHesitationLevel = useCallback(() => {
    const recentEvents = eventsRef.current.filter(
      e => Date.now() - e.timestamp < 30000 // Last 30 seconds
    );

    let level = 0;
    recentEvents.forEach(event => {
      switch (event.type) {
        case 'idle':
          level += 25;
          break;
        case 'quantity_change':
          level += 15;
          break;
        case 'remove_add':
          level += 30;
          break;
        case 'hover_back':
          level += 20;
          break;
        case 'rapid_switch':
          level += 18;
          break;
      }
    });

    // Cap at 100
    level = Math.min(100, level);
    setHesitationLevel(level);

    // Update confidence score based on hesitation
    const newConfidence = Math.max(50, 85 - Math.floor(level / 3));
    setConfidenceScore(newConfidence);

    // Trigger AI reaction if hesitation is high enough
    if (level >= 50 && (!lastReaction || Date.now() - lastReaction.timestamp > 15000) && !isAnalyzing) {
      triggerAIReaction();
    }
  }, [isAnalyzing, lastReaction]);

  const triggerAIReaction = useCallback(() => {
    if (reactionTimerRef.current) {
      window.clearTimeout(reactionTimerRef.current);
    }

    setIsAnalyzing(true);

    // Keep the demo feeling responsive while still believable.
    const delay = 550 + Math.random() * 550;

    reactionTimerRef.current = window.setTimeout(() => {
      // Select appropriate reaction based on hesitation level and type
      const recentEvents = eventsRef.current.slice(-3);
      let filteredReactions = AI_REACTIONS;

      if (recentEvents.some(e => e.type === 'idle')) {
        filteredReactions = AI_REACTIONS.filter(r => r.type === 'help' || r.type === 'general');
      } else if (recentEvents.some(e => e.type === 'quantity_change' || e.type === 'remove_add')) {
        filteredReactions = AI_REACTIONS.filter(r => r.type === 'preference' || r.type === 'trending');
      }

      const reaction = filteredReactions[Math.floor(Math.random() * filteredReactions.length)];
      setLastReaction({ ...reaction, timestamp: Date.now() });
      setIsAnalyzing(false);
      reactionTimerRef.current = null;
    }, delay);
  }, []);

  // Track user activity
  const trackQuantityChange = useCallback(() => {
    recordEvent({ type: 'quantity_change', timestamp: Date.now() });
    resetIdleTimer();
  }, [recordEvent, resetIdleTimer]);

  const trackRemoveAdd = useCallback(() => {
    recordEvent({ type: 'remove_add', timestamp: Date.now() });
    resetIdleTimer();
  }, [recordEvent, resetIdleTimer]);

  const trackHoverBack = useCallback(() => {
    recordEvent({ type: 'hover_back', timestamp: Date.now() });
    resetIdleTimer();
  }, [recordEvent, resetIdleTimer]);

  const trackRapidSwitch = useCallback(() => {
    recordEvent({ type: 'rapid_switch', timestamp: Date.now() });
    resetIdleTimer();
  }, [recordEvent, resetIdleTimer]);

  const trackActivity = useCallback(() => {
    resetIdleTimer();
  }, [resetIdleTimer]);

  const dismissReaction = useCallback(() => {
    setLastReaction(null);
  }, []);

  // Initialize idle timer
  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
      if (reactionTimerRef.current) {
        window.clearTimeout(reactionTimerRef.current);
      }
    };
  }, [resetIdleTimer]);

  // Gradually decrease hesitation level over time
  useEffect(() => {
    const decayInterval = setInterval(() => {
      setHesitationLevel(prev => Math.max(0, prev - 2));
    }, 5000);

    return () => clearInterval(decayInterval);
  }, []);

  return {
    hesitationLevel,
    lastReaction,
    isAnalyzing,
    confidenceScore,
    trackQuantityChange,
    trackRemoveAdd,
    trackHoverBack,
    trackRapidSwitch,
    trackActivity,
    dismissReaction,
  };
}
