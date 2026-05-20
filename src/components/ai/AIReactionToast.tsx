import { Brain, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AIReactionToastProps {
  message: string;
  type: 'help' | 'trending' | 'discount' | 'preference' | 'general';
  confidence: number;
  isAnalyzing: boolean;
  onDismiss: () => void;
}

export function AIReactionToast({ message, type, confidence, isAnalyzing, onDismiss }: AIReactionToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(showTimer);
  }, []);
  const glowColor = 'rgba(34, 211, 238, 0.24)';

  const getTypeColor = () => {
    switch (type) {
      case 'help': return 'text-violet-300 border-violet-400/30 bg-violet-500/10';
      case 'trending': return 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10';
      case 'discount': return 'text-amber-300 border-amber-400/30 bg-amber-500/10';
      case 'preference': return 'text-cyan-300 border-cyan-400/30 bg-cyan-500/10';
      default: return 'text-slate-300 border-slate-400/30 bg-slate-500/10';
    }
  };

  if (!visible && !isAnalyzing) return null;

  return (
    <div
      className="fixed bottom-24 left-3 right-3 z-[70] max-w-sm sm:bottom-6 sm:left-auto sm:right-6"
      style={{
        animation: visible ? 'slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'slideOut 0.3s ease-in forwards',
      }}
    >
      <style>{`
        @keyframes slideIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideOut {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(20px) scale(0.95); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px ${glowColor}, 0 0 40px ${glowColor}; }
          50% { box-shadow: 0 0 35px ${glowColor}, 0 0 70px ${glowColor}; }
        }
        @keyframes thinking {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-3xl p-5"
        style={{
          boxShadow: `0 20px 60px rgba(2,6,23,0.5), 0 0 40px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.08)`,
          animation: 'pulseGlow 2s ease-in-out infinite',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-violet-400/5" />
        
        <div className="relative flex items-start gap-4">
          <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-gradient-to-br from-cyan-400/15 to-cyan-500/10">
            <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-xl" />
            {isAnalyzing ? (
              <Brain className="relative z-10 h-6 w-6 text-cyan-300" style={{ animation: 'thinking 1s ease-in-out infinite' }} />
            ) : (
              <Sparkles className="relative z-10 h-6 w-6 text-cyan-300" style={{ animation: 'float 2s ease-in-out infinite' }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                {isAnalyzing ? 'AI Analyzing...' : 'AI Insight'}
              </span>
              {!isAnalyzing && (
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${getTypeColor()}`}>
                  {confidence}% confidence
                </span>
              )}
            </div>
            
            {isAnalyzing ? (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
                <span>Analyzing your behavior...</span>
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-200">{message}</p>
            )}
          </div>

          <button
            onClick={onDismiss}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
