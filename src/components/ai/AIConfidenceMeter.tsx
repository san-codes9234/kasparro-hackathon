import { useEffect, useRef, useState } from 'react';
import { Brain, Zap } from 'lucide-react';

interface Props {
  value?: number; // 0-100, if not provided it animates automatically
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getColor(v: number) {
  if (v < 40) return { stroke: '#ef4444', glow: 'rgba(239,68,68,0.4)', text: 'text-red-400', label: 'Low' };
  if (v < 70) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.4)', text: 'text-amber-400', label: 'Moderate' };
  return { stroke: '#06b6d4', glow: 'rgba(6,182,212,0.5)', text: 'text-cyan-400', label: 'High' };
}

export function AIConfidenceMeter({ value, label = 'AI Confidence', size = 'md', showLabel = true }: Props) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(!value);
  const targetRef = useRef(value ?? Math.floor(Math.random() * 25 + 72));
  const animRef = useRef<number>(0);
  const gradientIdRef = useRef(`ai-confidence-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    if (value !== undefined) {
      targetRef.current = value;
      setIsAnalyzing(false);
    } else {
      // Simulate AI analyzing
      const analyzeTimer = setTimeout(() => {
        setIsAnalyzing(false);
        targetRef.current = Math.floor(Math.random() * 20 + 75);
      }, 1200 + Math.random() * 800);
      return () => clearTimeout(analyzeTimer);
    }
  }, [value]);

  useEffect(() => {
    if (isAnalyzing) return;
    const target = targetRef.current;
    let current = displayValue;

    const animate = () => {
      const diff = target - current;
      if (Math.abs(diff) < 0.5) {
        setDisplayValue(target);
        return;
      }
      current += diff * 0.08;
      setDisplayValue(Math.round(current));
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnalyzing, value]);

  const dims = size === 'sm'
    ? { r: 26, sw: 4, box: 72, icon: 'w-3.5 h-3.5', valueText: 'text-sm', labelText: 'text-[11px]' }
    : size === 'lg'
      ? { r: 46, sw: 6, box: 120, icon: 'w-5 h-5', valueText: 'text-2xl', labelText: 'text-sm' }
      : { r: 34, sw: 5, box: 90, icon: 'w-4 h-4', valueText: 'text-lg', labelText: 'text-xs' };
  const { r, sw, box } = dims;
  const circ = 2 * Math.PI * r;
  const progress = isAnalyzing ? 0 : (displayValue / 100) * circ;
  const colors = getColor(displayValue);
  const gradientId = gradientIdRef.current;

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex-shrink-0 rounded-full"
        style={{
          width: box,
          height: box,
          background: 'radial-gradient(circle at 50% 45%, rgba(15,23,42,0.96), rgba(2,6,23,0.88))',
          boxShadow: `0 14px 36px rgba(2,6,23,0.35), 0 0 24px ${colors.glow}`,
        }}
      >
        <div
          className={`absolute inset-[10%] rounded-full border ${isAnalyzing ? 'animate-pulse' : ''}`}
          style={{
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: `inset 0 0 20px rgba(255,255,255,0.03), 0 0 24px ${colors.glow}`,
          }}
        />
        <div
          className={`absolute inset-[3px] rounded-full ${isAnalyzing ? 'ai-pulse-ring' : ''}`}
          style={{ opacity: isAnalyzing ? 0.8 : 0 }}
        />

        <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} className="rotate-[-90deg]">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="55%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <circle
            cx={box / 2}
            cy={box / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={sw}
          />
          <circle
            cx={box / 2}
            cy={box / 2}
            r={r}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={sw}
            strokeDasharray={circ}
            strokeDashoffset={circ - progress}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease',
              filter: `drop-shadow(0 0 6px ${colors.glow})`,
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isAnalyzing ? (
            <>
              <Brain className={`${dims.icon} text-cyan-300 animate-pulse`} />
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Scan
              </span>
            </>
          ) : (
            <>
              <span className={`font-black leading-none ${colors.text} ${dims.valueText}`}>
                {displayValue}%
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {colors.label}
              </span>
            </>
          )}
        </div>
      </div>

      {showLabel && (
        <div>
          <div className="mb-1 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className={`font-medium text-gray-400 ${dims.labelText}`}>{label}</span>
          </div>
          {isAnalyzing ? (
            <p className="text-xs italic text-gray-500">Running live confidence scan...</p>
          ) : (
            <p className={`text-xs font-semibold ${colors.text}`}>{colors.label} Confidence</p>
          )}
        </div>
      )}
    </div>
  );
}
