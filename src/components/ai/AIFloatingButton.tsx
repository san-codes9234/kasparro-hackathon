import { Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function AIFloatingButton() {
  const { toggleChat, isChatOpen } = useApp();

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50">
      <button
        onClick={toggleChat}
        aria-label={isChatOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        title="SmartCart AI Assistant"
        className="group relative"
        style={{ width: 72, height: 72 }}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-full opacity-90 transition-all duration-300 group-hover:scale-110"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.34) 0%, rgba(59,130,246,0.22) 38%, rgba(139,92,246,0.08) 65%, transparent 78%)',
            filter: 'blur(12px)',
            transform: isChatOpen ? 'scale(0.96)' : 'scale(1)',
          }}
        />

        {!isChatOpen && (
          <>
            <span
              className="pointer-events-none absolute inset-0 rounded-full border border-cyan-300/35"
              style={{ animation: 'ringPulse 2.4s ease-out infinite' }}
            />
            <span
              className="pointer-events-none absolute inset-0 rounded-full border border-violet-300/30"
              style={{ animation: 'ringPulse 2.4s ease-out infinite', animationDelay: '0.75s' }}
            />
            <span
              className="pointer-events-none absolute inset-[7px] rounded-full border border-white/10"
              style={{ animation: 'glowPulse 2.8s ease-in-out infinite' }}
            />
          </>
        )}

        <span
          className="absolute inset-0 rounded-full transition-transform duration-300 group-hover:scale-105"
          style={{
            background: isChatOpen
              ? 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.05))'
              : 'conic-gradient(from 0deg, rgba(34,211,238,1), rgba(59,130,246,0.95), rgba(139,92,246,0.95), rgba(34,211,238,1))',
            animation: !isChatOpen ? 'spin 5s linear infinite' : undefined,
            padding: 2,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
          }}
        />

        <span
          className="absolute inset-[3px] flex items-center justify-center rounded-full transition-all duration-300"
          style={{
            background: isChatOpen
              ? 'radial-gradient(circle at 30% 30%, rgba(30,41,59,0.98), rgba(15,23,42,0.96) 65%, rgba(2,6,23,0.98))'
              : 'radial-gradient(circle at 30% 30%, rgba(125,211,252,0.92), rgba(34,211,238,0.88) 16%, rgba(59,130,246,0.92) 52%, rgba(91,33,182,0.96) 100%)',
            boxShadow: isChatOpen
              ? '0 12px 36px rgba(2,6,23,0.48), inset 0 1px 0 rgba(255,255,255,0.12)'
              : '0 18px 44px rgba(34,211,238,0.42), 0 8px 24px rgba(139,92,246,0.28), inset 0 1px 0 rgba(255,255,255,0.22)',
            transform: isChatOpen ? 'scale(0.96)' : 'scale(1)',
          }}
        >
          <span
            className="pointer-events-none absolute inset-[10px] rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.34), transparent 45%)',
              filter: 'blur(1px)',
            }}
          />

          {isChatOpen ? (
            <X className="relative z-10 w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-90" />
          ) : (
            <div className="relative z-10" style={{ animation: 'orbFloat 4s ease-in-out infinite' }}>
              <Sparkles className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
            </div>
          )}
        </span>

        <span
          className={[
            'pointer-events-none absolute right-full top-1/2 mr-4 -translate-y-1/2 whitespace-nowrap rounded-full',
            'border px-4 py-2 text-xs font-semibold tracking-[0.18em] text-slate-200 uppercase',
            'transition-all duration-300',
            isChatOpen ? 'opacity-0 translate-x-2' : 'opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
          ].join(' ')}
          style={{
            background: 'rgba(8,16,36,0.82)',
            borderColor: 'rgba(34,211,238,0.28)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 16px 30px rgba(2,6,23,0.28)',
            transform: isChatOpen ? 'translateX(8px) translateY(-50%)' : undefined,
          }}
        >
          SmartCart AI Assistant
        </span>
      </button>
    </div>
  );
}
