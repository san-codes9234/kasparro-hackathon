import { CheckCircle, CreditCard, ShoppingCart, Sparkles } from 'lucide-react';

interface Props {
  step: 1 | 2 | 3;
}

const steps = [
  { icon: ShoppingCart, label: 'Cart Review' },
  { icon: CreditCard, label: 'Payment' },
  { icon: CheckCircle, label: 'Confirm' },
];

export function CheckoutProgress({ step }: Props) {
  const glowColor = 'rgba(34, 211, 238, 0.32)';
  const successGlow = 'rgba(16, 185, 129, 0.3)';

  return (
    <div className="mb-10 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950/80 to-slate-950/90 p-5 backdrop-blur-3xl" style={{ boxShadow: '0 20px 60px rgba(2,6,23,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <style>{`
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes shimmerSweep {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes stepEntrance {
          0% { opacity: 0; transform: translateY(10px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes progressGlow {
          0% { opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { opacity: 0.3; }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes checkmarkPop {
          0% { transform: scale(0) rotate(-180deg); }
          50% { transform: scale(1.2) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
      `}</style>

      <div className="flex items-start justify-center gap-0 overflow-x-auto pb-2 scrollbar-none">
        {steps.map((s, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === step;
          const isDone = stepNum < step;

          return (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-700"
                  style={{
                    background: isDone
                      ? 'linear-gradient(135deg, rgba(16,185,129,0.98), rgba(5,150,105,0.95))'
                      : isActive
                        ? 'linear-gradient(135deg, rgba(34,211,238,0.98), rgba(59,130,246,0.95), rgba(99,102,241,0.92))'
                        : 'rgba(255,255,255,0.06)',
                    color: isDone || isActive ? 'white' : '#64748b',
                    boxShadow: isActive
                      ? `0 0 40px ${glowColor}, 0 16px 40px rgba(59,130,246,0.3)`
                      : isDone
                        ? `0 0 30px ${successGlow}, 0 12px 28px rgba(16,185,129,0.25)`
                        : '0 8px 20px rgba(2,6,23,0.2)',
                    border: isDone
                      ? '1px solid rgba(16,185,129,0.5)'
                      : isActive
                        ? '1px solid rgba(34,211,238,0.6)'
                        : '1px solid rgba(255,255,255,0.1)',
                    transform: isActive ? 'translateY(-4px) scale(1.08)' : 'scale(1)',
                    animation: isActive ? 'stepEntrance 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-70"
                    style={{
                      background: isActive
                        ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 45%)'
                        : isDone
                        ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent 45%)'
                        : 'none',
                    }}
                  />
                  {isDone ? (
                    <CheckCircle className="h-6 w-6" style={{ animation: 'checkmarkPop 0.5s ease-out' }} />
                  ) : (
                    <s.icon className={`h-6 w-6 ${isActive ? 'iconFloat' : ''}`} style={{ animation: isActive ? 'iconFloat 2s ease-in-out infinite' : 'none' }} />
                  )}
                  {isActive && (
                    <>
                      <span
                        className="absolute inset-0 rounded-2xl border-2 border-cyan-400/60"
                        style={{ animation: 'ringPulse 2s ease-out infinite' }}
                      />
                      <span
                        className="absolute inset-0 rounded-2xl border border-cyan-300/40"
                        style={{ animation: 'ringPulse 2s ease-out infinite 0.5s' }}
                      />
                    </>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span
                    className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-500"
                    style={{
                      color: isActive ? '#22d3ee' : isDone ? '#34d399' : '#64748b',
                      textShadow: isActive ? '0 0 20px rgba(34, 211, 238, 0.5)' : isDone ? '0 0 15px rgba(52, 211, 153, 0.4)' : 'none',
                    }}
                  >
                    {s.label}
                  </span>
                  {isActive && (
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-cyan-300" style={{ animation: 'iconFloat 1.5s ease-in-out infinite' }} />
                      <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Active</span>
                    </div>
                  )}
                </div>
              </div>

              {i < steps.length - 1 && (
                <div
                  className="relative mx-2 mb-10 h-1.5 w-12 overflow-hidden rounded-full sm:mx-3 sm:w-20 lg:w-32"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: isDone ? '100%' : '0%',
                      background: 'linear-gradient(90deg, rgba(16,185,129,0.98), rgba(34,211,238,0.98), rgba(99,102,241,0.95))',
                      backgroundSize: '200% 100%',
                      boxShadow: isDone ? `0 0 20px ${glowColor}` : 'none',
                      animation: isDone ? 'shimmerSweep 2s linear infinite' : 'none',
                    }}
                  />
                  {isDone && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'progressGlow 2s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
