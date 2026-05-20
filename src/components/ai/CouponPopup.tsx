import { Check, Copy, Sparkles, Tag, Timer, X, Zap, Crown, Flame } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';

export function CouponPopup() {
  const { showCouponPopup, setShowCouponPopup } = useApp();
  const { applyCoupon } = useCart();
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [seconds, setSeconds] = useState(300);
  const [confetti, setConfetti] = useState<number[]>([]);
  const [visible, setVisible] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [cardGlow, setCardGlow] = useState(0);

  useEffect(() => {
    if (showCouponPopup) {
      setApplied(false);
      setSeconds(300);
      setCopied(false);
      setConfetti([]);
      setButtonHovered(false);
      const timer = window.setTimeout(() => setVisible(true), 20);
      return () => window.clearTimeout(timer);
    }

    setVisible(false);
    return undefined;
  }, [showCouponPopup]);

  useEffect(() => {
    if (!showCouponPopup || applied) return undefined;

    const interval = window.setInterval(() => {
      setSeconds(current => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [showCouponPopup, applied]);

  useEffect(() => {
    if (!showCouponPopup) return undefined;
    const glowInterval = window.setInterval(() => {
      setCardGlow(prev => (prev + 0.5) % 100);
    }, 50);
    return () => window.clearInterval(glowInterval);
  }, [showCouponPopup]);

  const timeLabel = useMemo(
    () => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`,
    [seconds],
  );

  const handleApply = () => {
    applyCoupon('SAVE10');
    setApplied(true);
    setConfetti(Array.from({ length: 50 }, (_, index) => index));
    window.setTimeout(() => setShowCouponPopup(false), 2500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('SAVE10').catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (!showCouponPopup) return null;

  const glowIntensity = 0.3 + Math.sin(cardGlow * 0.0628) * 0.15;
  const glowColor = `rgba(245, 158, 11, ${glowIntensity})`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(16px)',
        animation: 'fadeIn 0.4s ease-out',
      }}
      onClick={() => setShowCouponPopup(false)}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cinematicEntrance {
          0% {
            transform: scale(0.75) translateY(60px) rotateX(12deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.02) translateY(-6px) rotateX(-2deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(0) rotateX(0deg);
            opacity: 1;
          }
        }
        @keyframes scanLine {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes shimmerSweep {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(180px) rotate(720deg) scale(0.3);
            opacity: 0;
          }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.4), 0 0 60px rgba(245, 158, 11, 0.2); }
          50% { box-shadow: 0 0 50px rgba(245, 158, 11, 0.6), 0 0 100px rgba(245, 158, 11, 0.3); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes successPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .urgency-pulse {
          animation: pulse 1s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {applied && confetti.map(index => (
        <div
          key={index}
          className="fixed pointer-events-none rounded-sm"
          style={{
            left: `${40 + (Math.random() - 0.5) * 30}%`,
            top: `${35 + (Math.random() - 0.5) * 20}%`,
            width: 8 + Math.random() * 12,
            height: 8 + Math.random() * 12,
            backgroundColor: ['#22d3ee', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#06b6d4'][index % 7],
            animation: `confettiFall ${1.2 + Math.random() * 1.4}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.3}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}

      <div
        className="w-full max-w-[520px] max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-none"
        onClick={event => event.stopPropagation()}
        style={{
          animation: visible ? 'cinematicEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
          transform: visible ? 'none' : 'scale(0.75) translateY(60px)',
          opacity: visible ? 1 : 0,
        }}
      >
        <div
          className="relative overflow-hidden rounded-[32px] border border-amber-300/30 bg-slate-950/95 backdrop-blur-3xl"
          style={{
            boxShadow: `0 40px 100px rgba(0, 0, 0, 0.7), 0 0 80px ${glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
            animation: applied ? 'successPulse 0.6s ease-out' : 'none',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.15),transparent_35%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_35%),radial-gradient(circle_at_center,rgba(245,158,11,0.08),transparent_50%)]" />
          
          <div className="absolute left-0 right-0 top-0 h-[4px] bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-[length:200%_100%]" style={{ animation: 'shimmerSweep 3s linear infinite' }} />
          
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${15 + i * 14}%`,
                  top: `${10 + (i % 3) * 25}%`,
                  animation: `sparkle ${2 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>

          <div className="relative px-5 pb-5 pt-5 sm:px-7 sm:pb-7">
            <div className="mb-5 flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-violet-400/30 bg-violet-500/15 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200 shadow-lg shadow-violet-500/20">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-400" />
                  </span>
                  AI detected hesitation
                </div>
                <h3 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl" style={{ textShadow: '0 0 40px rgba(245, 158, 11, 0.5)' }}>
                  Exclusive AI Discount
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-300">
                  SmartCart AI analyzed your browsing patterns and generated a personalized incentive to help you complete your purchase with confidence.
                </p>
              </div>

              <button
                onClick={() => setShowCouponPopup(false)}
                className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white hover:scale-110"
              >
                <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
              </button>
            </div>

            <div
              className="mb-5 grid gap-5 rounded-[32px] border border-amber-400/25 bg-gradient-to-br from-amber-400/10 via-amber-500/5 to-orange-400/10 p-5 backdrop-blur-2xl"
              style={{
                boxShadow: `0 0 40px ${glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                animation: 'float 4s ease-in-out infinite',
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-300"
                    style={{
                      boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
                      animation: 'pulseGlow 2s ease-in-out infinite',
                    }}
                  >
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">AI coupon unlock</p>
                    <p className="mt-1 text-sm font-medium text-slate-200">Personalized incentive generated for this session</p>
                  </div>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-400/25 bg-rose-500/15 px-4 py-1.5 text-xs font-bold text-rose-200 shadow-lg shadow-rose-500/20">
                  <Flame className="h-3.5 w-3.5 urgency-pulse" />
                  Expires soon
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[26px] border border-white/15 bg-slate-950/80 p-5 backdrop-blur-xl">
                <div
                  className="pointer-events-none absolute left-0 right-0 h-0.5"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.9), rgba(34, 211, 238, 0.7), transparent)',
                    animation: 'scanLine 2.5s ease-in-out infinite',
                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.8)',
                  }}
                />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
                      <Tag className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Coupon code</p>
                      <p className="font-mono text-3xl font-black tracking-[0.22em] text-white sm:text-4xl" style={{ textShadow: '0 0 30px rgba(245, 158, 11, 0.6)' }}>
                        SAVE10
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 transition-all duration-300 hover:border-amber-400/40 hover:bg-amber-400/10 hover:text-white hover:scale-105 active:scale-95 sm:w-auto"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 group-hover:text-amber-300 transition-colors" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Save <span className="font-bold text-amber-300">10%</span> on your entire order with this AI-generated offer, perfectly timed to your current shopping journey.
                </p>
              </div>
            </div>

            {!applied && (
              <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-rose-400/25 bg-gradient-to-r from-rose-500/10 to-orange-500/10 px-4 py-3 text-sm backdrop-blur-sm sm:rounded-full sm:px-5 sm:py-2.5">
                <Timer className="h-4.5 w-4.5 text-rose-300 urgency-pulse" />
                <span className="text-slate-300">Offer expires in</span>
                <span className="font-mono text-lg font-bold text-rose-300" style={{ textShadow: '0 0 20px rgba(244, 63, 94, 0.5)' }}>
                  {timeLabel}
                </span>
              </div>
            )}

            <button
              onClick={handleApply}
              disabled={applied}
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
              className="group relative w-full overflow-hidden rounded-2xl py-4.5 text-sm font-bold text-white transition-all duration-500 disabled:cursor-default"
              style={{
                background: applied
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.2))'
                  : buttonHovered
                  ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.98), rgba(245, 158, 11, 0.95), rgba(249, 115, 22, 0.92))'
                  : 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(249, 115, 22, 0.92), rgba(251, 191, 36, 0.9))',
                color: applied ? '#6ee7b7' : 'white',
                border: applied ? '1px solid rgba(16, 185, 129, 0.4)' : buttonHovered ? '1px solid rgba(251, 191, 36, 0.5)' : '1px solid rgba(245, 158, 11, 0.3)',
                boxShadow: applied
                  ? '0 0 30px rgba(16, 185, 129, 0.3)'
                  : buttonHovered
                  ? '0 20px 50px rgba(245, 158, 11, 0.4), 0 0 30px rgba(245, 158, 11, 0.2)'
                  : '0 16px 40px rgba(245, 158, 11, 0.3)',
                transform: buttonHovered && !applied ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              <span
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  background: applied ? 'transparent' : 'linear-gradient(110deg, transparent 25%, rgba(255, 255, 255, 0.3) 50%, transparent 75%)',
                  backgroundSize: '200% 100%',
                  animation: applied ? undefined : 'shimmerSweep 2s ease-in-out infinite',
                }}
              />
              <span className="relative z-10 inline-flex items-center justify-center gap-2.5">
                {applied ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Discount Applied Successfully!</span>
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="group-hover:tracking-wide transition-all">Apply SAVE10 Now</span>
                    <Sparkles className="h-4 w-4 group-hover:animate-spin" />
                  </>
                )}
              </span>
            </button>

            <p className="mt-4 text-center text-xs leading-6 text-slate-500">
              SmartCart AI uses real-time behavioral analysis to deliver personalized incentives that respect your shopping experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
