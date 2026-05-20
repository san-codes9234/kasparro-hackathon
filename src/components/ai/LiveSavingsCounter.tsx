import { useEffect, useRef, useState } from 'react';
import { TrendingDown, Sparkles } from 'lucide-react';
import { formatINR } from '../../utils/currency';

interface Props {
  savings: number;
  label?: string;
  animateOnChange?: boolean;
}

export function LiveSavingsCounter({ savings, label = 'Total Savings', animateOnChange = true }: Props) {
  const [display, setDisplay] = useState(0);
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (savings === prevRef.current) return;
    if (animateOnChange && savings > prevRef.current) {
      setFlash(true);
      setTimeout(() => setFlash(false), 700);
    }

    const start = display;
    const target = savings;
    const duration = 900;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + (target - start) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    prevRef.current = savings;

    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savings, animateOnChange]);

  if (savings <= 0) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-500 ${
        flash ? 'scale-105' : 'scale-100'
      }`}
      style={{
        background: flash
          ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.15))'
          : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.08))',
        border: flash ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(16,185,129,0.25)',
        boxShadow: flash ? '0 0 30px rgba(16,185,129,0.3)' : '0 0 0px transparent',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Shine sweep on flash */}
      {flash && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.15), transparent)',
            animation: 'shimmerSweep 0.7s ease-out',
          }}
        />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.2)' }}>
            <TrendingDown className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">{label}</p>
            <p className="text-xs text-gray-500">SmartCart AI applied</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-green-400" />
          <span
            className="text-xl font-black text-green-400 tabular-nums"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatINR(display)}
          </span>
        </div>
      </div>

      {/* Progress bar showing savings vs subtotal */}
      <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full progress-glow"
          style={{
            width: `${Math.min((savings / (savings + 50)) * 100, 95)}%`,
            background: 'linear-gradient(90deg, #10b981, #34d399)',
            transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}
