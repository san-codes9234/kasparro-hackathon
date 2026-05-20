import { useEffect, useState, useRef } from 'react';
import { Brain, Search, Tag, TrendingUp, Zap, Shield, Star } from 'lucide-react';

interface Activity {
  id: string;
  icon: typeof Brain;
  text: string;
  color: string;
  time: string;
}

const BASE_ACTIVITIES: Omit<Activity, 'id' | 'time'>[] = [
  { icon: Brain, text: 'Analyzing cart composition', color: 'text-cyan-400' },
  { icon: Search, text: 'Scanning 12,847 price databases', color: 'text-blue-400' },
  { icon: TrendingUp, text: 'Checking price history (90 days)', color: 'text-purple-400' },
  { icon: Tag, text: 'Finding applicable coupon codes', color: 'text-amber-400' },
  { icon: Shield, text: 'Verifying product authenticity', color: 'text-green-400' },
  { icon: Star, text: 'Aggregating review sentiment (4.2k reviews)', color: 'text-rose-400' },
  { icon: Zap, text: 'Calculating bundle savings opportunities', color: 'text-cyan-400' },
  { icon: Brain, text: 'Detecting purchase hesitation patterns', color: 'text-purple-400' },
  { icon: TrendingUp, text: 'Comparing alternatives across 8 retailers', color: 'text-blue-400' },
  { icon: Tag, text: 'Applying AI-negotiated discount: SAVE10', color: 'text-amber-400' },
  { icon: Shield, text: 'Confirming best price guarantee', color: 'text-green-400' },
  { icon: Brain, text: 'Personalizing recommendations for you', color: 'text-cyan-400' },
];

function fmt(d: Date) {
  return d.toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function AIActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const idxRef = useRef(0);

  useEffect(() => {
    // Seed 3 initial activities quickly
    const seed = BASE_ACTIVITIES.slice(0, 3).map((a, i) => ({
      ...a,
      id: `seed-${i}`,
      time: fmt(new Date(Date.now() - (3 - i) * 8000)),
    }));
    setActivities(seed);
    idxRef.current = 3;

    const interval = setInterval(() => {
      const next = BASE_ACTIVITIES[idxRef.current % BASE_ACTIVITIES.length];
      idxRef.current++;
      const entry: Activity = {
        ...next,
        id: `a-${Date.now()}`,
        time: fmt(new Date()),
      };
      setActivities(prev => {
        const updated = [entry, ...prev];
        return updated.slice(0, 7); // Keep last 7
      });
    }, 3500 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(8,16,36,0.7)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-60" />
        </div>
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">AI Activity</span>
        <span className="ml-auto text-xs text-gray-600">Live</span>
      </div>

      <div>
        {activities.map((a, i) => (
          <div
            key={a.id}
            className="flex items-start gap-3 px-4 py-2.5 transition-all duration-500"
            style={{
              opacity: i === 0 ? 1 : Math.max(0.4, 1 - i * 0.12),
              animation: i === 0 ? 'slideDown 0.4s cubic-bezier(0.34,1.56,0.64,1) both' : undefined,
              borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div className="flex-shrink-0 mt-0.5">
              <a.icon className={`w-3 h-3 ${a.color}`} />
            </div>
            <p className="text-xs text-gray-400 flex-1 leading-relaxed">{a.text}</p>
            <span className="flex-shrink-0 text-[10px] text-gray-600 font-mono">{a.time}</span>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="px-4 py-4 text-xs text-gray-600 italic">Initializing AI engine...</div>
        )}
      </div>
    </div>
  );
}
