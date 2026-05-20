import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import {
  ArrowRight,
  Brain,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { products } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';
import { formatINR } from '../utils/currency';

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  metric: string;
  accent: string;
  glow: string;
};

type TrustSignal = {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
};

function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    let frameId = 0;
    const startTime = performance.now();

    const frame = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));

      if (t < 1) {
        frameId = requestAnimationFrame(frame);
      }
    };

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration, start]);

  return value;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const HERO_WORDS = ['Smarter', 'Faster', 'Confidently'];

const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: 'AI Checkout Copilot',
    desc: 'Natural-language guidance explains every line item, predicts intent, and reduces checkout hesitation in real time.',
    metric: '82% faster decisions',
    accent: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.22)',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Savings Engine',
    desc: 'Behavioral signals trigger the highest-likelihood coupon and upsell sequence at the exact conversion moment.',
    metric: '₹4.8Cr AI savings',
    accent: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.22)',
  },
  {
    icon: ShieldCheck,
    title: 'Trust Layer Scoring',
    desc: 'Best-price validation, stock confidence, and delivery intelligence give shoppers startup-grade confidence to buy.',
    metric: '99.2% trust score',
    accent: '#34d399',
    glow: 'rgba(52, 211, 153, 0.2)',
  },
];

const TRUST_SIGNALS: TrustSignal[] = [
  {
    icon: Truck,
    title: 'Priority Fulfillment',
    desc: 'Delivery windows are scored by AI before you commit.',
    accent: '#38bdf8',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Transactions',
    desc: 'Encrypted checkout with confidence scoring on every order.',
    accent: '#34d399',
  },
  {
    icon: Star,
    title: 'Signal-Driven Curation',
    desc: 'Top products surface from quality, demand, and price momentum.',
    accent: '#f59e0b',
  },
];

function MagneticButton({
  children,
  onClick,
  variant = 'primary',
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const moveX = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
    const moveY = ((event.clientY - rect.top) / rect.height - 0.5) * 14;
    setOffset({ x: moveX, y: moveY });
  };

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

  const isPrimary = variant === 'primary';
  const isActive = offset.x !== 0 || offset.y !== 0;

  return (
    <button
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={[
        'group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl px-7 py-4',
        'text-sm font-semibold text-white transition-all duration-300 transform-gpu',
        isPrimary ? 'border border-cyan-300/30' : 'border border-white/12 bg-white/[0.04]',
      ].join(' ')}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isActive ? (isPrimary ? 1.02 : 1.01) : 1})`,
        background: isPrimary
          ? 'linear-gradient(135deg, rgba(34,211,238,0.95), rgba(59,130,246,0.9), rgba(139,92,246,0.9))'
          : 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(18px)',
        boxShadow: isPrimary
          ? '0 18px 50px rgba(34,211,238,0.28), inset 0 1px 0 rgba(255,255,255,0.24)'
          : '0 18px 40px rgba(3,7,18,0.28), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <span
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isPrimary
            ? 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.16) 50%, transparent 80%)'
            : 'linear-gradient(110deg, transparent 10%, rgba(34,211,238,0.12) 50%, transparent 90%)',
          transform: 'translateX(-100%)',
          animation: 'shimmerSweep 2.4s ease-in-out infinite',
        }}
      />
      <span
        className="absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isPrimary ? 'rgba(34, 211, 238, 0.28)' : 'rgba(139, 92, 246, 0.14)',
        }}
      />
      <span className="relative z-10 flex items-center gap-3">{children}</span>
    </button>
  );
}

function FeatureTiltCard({ feature, index }: { feature: Feature; index: number }) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, x: 50, y: 50 });

  const handleMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const percentX = ((event.clientX - rect.left) / rect.width) * 100;
    const percentY = ((event.clientY - rect.top) / rect.height) * 100;
    const rotateY = clamp(((percentX - 50) / 50) * 8, -8, 8);
    const rotateX = clamp(((50 - percentY) / 50) * 8, -8, 8);

    setTilt({ rotateX, rotateY, x: percentX, y: percentY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, x: 50, y: 50 });
  };

  return (
    <div
      className="perspective-1000 animate-fade-scale"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <article
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="tilt-card group relative h-full overflow-hidden rounded-[28px] p-[1px]"
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-2px)`,
          background: `linear-gradient(135deg, ${feature.glow}, rgba(255,255,255,0.06), transparent 70%)`,
          boxShadow: `0 24px 70px rgba(2,6,23,0.45), 0 0 0 1px rgba(255,255,255,0.05), 0 0 42px ${feature.glow}`,
        }}
      >
        <div
          className="absolute -inset-20 rounded-full opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at ${tilt.x}% ${tilt.y}%, ${feature.glow} 0%, transparent 42%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `linear-gradient(140deg, ${feature.accent}24 0%, transparent 26%, transparent 72%, ${feature.accent}20 100%)`,
          }}
        />
        <div className="relative h-full rounded-[27px] border border-white/10 bg-slate-950/75 p-6 backdrop-blur-2xl">
          <div
            className="pointer-events-none absolute inset-0 rounded-[27px] opacity-70"
            style={{
              background: `radial-gradient(420px circle at ${tilt.x}% ${tilt.y}%, ${feature.glow} 0%, transparent 40%)`,
            }}
          />
          <div
            className="absolute inset-x-6 top-0 h-px opacity-70"
            style={{
              background: `linear-gradient(90deg, transparent, ${feature.accent}, transparent)`,
            }}
          />
          <div className="relative flex h-full flex-col">
            <div
              className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/12"
              style={{
                background: `linear-gradient(135deg, ${feature.accent}, rgba(15,23,42,0.6))`,
                transform: 'translateZ(42px)',
                boxShadow: `0 16px 34px ${feature.glow}`,
              }}
            >
              <feature.icon className="h-7 w-7 text-white" />
            </div>
            <div
              className="mb-4 inline-flex w-fit items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{
                borderColor: `${feature.accent}44`,
                color: feature.accent,
                background: `${feature.accent}14`,
              }}
            >
              {feature.metric}
            </div>
            <h3 className="mb-3 text-xl font-black tracking-tight text-white">{feature.title}</h3>
            <p className="text-sm leading-7 text-slate-300">{feature.desc}</p>
            <div className="mt-auto pt-8">
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <span className="text-xs uppercase tracking-[0.22em] text-slate-400">Signal confidence</span>
                <span className="text-sm font-semibold text-white">Realtime adaptive</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function HomePage() {
  const { navigate } = useApp();
  const featured = products.slice(0, 4);
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const [wordIndex, setWordIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const shoppers = useCountUp(2400000, 2000, statsVisible);
  const saved = useCountUp(48, 1750, statsVisible);
  const automation = useCountUp(96, 1600, statsVisible);
  const rating = useCountUp(49, 1500, statsVisible);

  useEffect(() => {
    let timeoutId = 0;

    const interval = setInterval(() => {
      setWordVisible(false);
      timeoutId = window.setTimeout(() => {
        setWordIndex(index => (index + 1) % HERO_WORDS.length);
        setWordVisible(true);
      }, 300);
    }, 2800);

    return () => {
      clearInterval(interval);
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.25 },
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: `particle-${index}`,
        left: `${(index * 17) % 100}%`,
        top: `${(index * 29) % 100}%`,
        size: 2 + (index % 4),
        duration: 7 + (index % 5),
        delay: (index % 6) * 0.6,
        opacity: 0.15 + (index % 5) * 0.04,
      })),
    [],
  );

  const dashboardBars = useMemo(() => [82, 64, 91, 72, 87, 58], []);

  const heroMetrics = [
    { label: 'Conversion lift', value: '3.4x' },
    { label: 'AI savings engine', value: '₹48Cr' },
    { label: 'Response latency', value: '120ms' },
  ];

  const statCards = [
    {
      label: 'Shoppers guided',
      value: shoppers >= 1000000 ? `${(shoppers / 1000000).toFixed(1)}M+` : `${shoppers.toLocaleString()}+`,
      detail: 'Realtime behavioral scoring across high-intent sessions.',
    },
    {
      label: 'Recovered savings',
      value: formatINR(saved * 1000000, { compact: true }),
      detail: 'Coupons triggered only when AI predicts conversion lift.',
    },
    {
      label: 'Automation accuracy',
      value: `${automation}%`,
      detail: 'Decision support tuned for confidence, trust, and velocity.',
    },
    {
      label: 'Experience rating',
      value: `${(rating / 10).toFixed(1)}/5`,
      detail: 'Startup-grade UX validated by verified shopper sentiment.',
    },
  ];

  const glassPanelStyle: CSSProperties = {
    background: 'linear-gradient(180deg, rgba(15,23,42,0.78), rgba(2,6,23,0.7))',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 32px 90px rgba(2,6,23,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative isolate overflow-hidden px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[720px] opacity-90"
          style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(34,211,238,0.18), transparent 34%), radial-gradient(circle at 80% 18%, rgba(139,92,246,0.16), transparent 30%), radial-gradient(circle at 50% 55%, rgba(59,130,246,0.14), transparent 40%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 animate-aurora opacity-70"
          style={{
            background: 'conic-gradient(from 90deg at 50% 50%, rgba(34,211,238,0.12), transparent 20%, rgba(139,92,246,0.16), transparent 50%, rgba(59,130,246,0.1), transparent 80%, rgba(34,211,238,0.12))',
            filter: 'blur(70px)',
          }}
        />
        <div
          className="pointer-events-none absolute left-[6%] top-24 h-72 w-72 rounded-full animate-float-slow"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, rgba(34,211,238,0.06) 32%, transparent 72%)',
            filter: 'blur(18px)',
          }}
        />
        <div
          className="pointer-events-none absolute bottom-12 right-[8%] h-80 w-80 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.06) 34%, transparent 72%)',
            filter: 'blur(22px)',
          }}
        />
        <div className="pointer-events-none absolute inset-0">
          {particles.map(particle => (
            <span
              key={particle.id}
              className="absolute rounded-full bg-cyan-300 animate-orb"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                opacity: particle.opacity,
                animationDuration: `${particle.duration}s`,
                animationDelay: `${particle.delay}s`,
                boxShadow: '0 0 20px rgba(34,211,238,0.35)',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-3xl">
            <div className="inline-flex animate-slide-down items-center gap-3 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              SmartCart AI commerce OS
            </div>

            <h1 className="mt-8 max-w-4xl animate-slide-up text-5xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
              The AI storefront that helps shoppers buy{' '}
              <span
                className="inline-block shimmer-text"
                style={{
                  opacity: wordVisible ? 1 : 0,
                  transform: wordVisible ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'opacity 0.3s ease, transform 0.3s ease',
                  minWidth: '4.8ch',
                }}
              >
                {HERO_WORDS[wordIndex]}
              </span>
              .
            </h1>

            <p className="mt-8 max-w-2xl animate-fade-in delay-150 text-lg leading-8 text-slate-300 sm:text-xl">
              Premium AI-assisted commerce for product discovery, trust scoring, coupon timing, and confident checkout.
              SmartCart feels like a funded startup product because every interaction is optimized for conversion and clarity.
            </p>

            <div className="mt-10 flex animate-slide-up flex-col gap-4 delay-300 sm:flex-row">
              <MagneticButton onClick={() => navigate('products')}>
                <Sparkles className="h-5 w-5" />
                <span>Launch AI Shopping</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </MagneticButton>
              <MagneticButton onClick={() => navigate('checkout')} variant="secondary">
                <Zap className="h-5 w-5 text-cyan-300" />
                <span>Open Smart Checkout</span>
              </MagneticButton>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {heroMetrics.map((metric, index) => (
                <div
                  key={metric.label}
                  className="animate-fade-in rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl"
                  style={{
                    animationDelay: `${index * 120 + 200}ms`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="text-2xl font-black tracking-tight text-white">{metric.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-slide-left delay-200">
            <div className="absolute -left-6 top-20 hidden h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl lg:block" />
            <div className="absolute -right-2 bottom-8 hidden h-32 w-32 rounded-full bg-violet-500/20 blur-3xl lg:block" />
            <div className="relative overflow-hidden rounded-[32px] p-6" style={glassPanelStyle}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.18),transparent_32%)]" />
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
                <div className="absolute bottom-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-violet-300/50 to-transparent" />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Realtime AI Session</div>
                    <div className="mt-1 text-lg font-bold text-white">Conversion Command Center</div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Live
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.24em] text-slate-400">AI Confidence</div>
                        <div className="mt-2 text-4xl font-black text-white">98.4%</div>
                      </div>
                      <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-3 text-cyan-200">
                        <Brain className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-5 rounded-full bg-white/5 p-1">
                      <div
                        className="progress-glow h-3 rounded-full"
                        style={{
                          width: '84%',
                          background: 'linear-gradient(90deg, rgba(34,211,238,0.95), rgba(59,130,246,0.95), rgba(139,92,246,0.95))',
                        }}
                      />
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Offer timing</div>
                        <div className="mt-1 text-sm font-semibold text-white">Intent-aware coupon release</div>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Cart analysis</div>
                        <div className="mt-1 text-sm font-semibold text-white">Low friction checkout flow</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Decision Signals</div>
                    <div className="mt-5 space-y-4">
                      {dashboardBars.map((bar, index) => (
                        <div key={bar} className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Layer 0{index + 1}</span>
                            <span>{bar}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${bar}%`,
                                background: index % 2 === 0
                                  ? 'linear-gradient(90deg, rgba(34,211,238,0.95), rgba(59,130,246,0.95))'
                                  : 'linear-gradient(90deg, rgba(139,92,246,0.95), rgba(168,85,247,0.95))',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    'Predicts hesitation windows',
                    'Generates premium recommendations',
                    'Optimizes cart trust in real time',
                  ].map(label => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-6 left-1/2 w-[82%] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-3xl">
              <div className="h-20" />
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-14 flex justify-center">
          <div className="animate-bounce rounded-full border border-white/12 bg-white/[0.03] p-3 backdrop-blur-xl">
            <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/15 pt-2">
              <div className="animate-scroll-dot h-2 w-1 rounded-full bg-cyan-300" />
            </div>
          </div>
        </div>
      </section>

      <section ref={statsRef} className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className="overflow-hidden rounded-[32px] p-[1px]"
            style={{
              background: 'linear-gradient(135deg, rgba(34,211,238,0.3), rgba(255,255,255,0.06), rgba(139,92,246,0.2))',
              boxShadow: '0 20px 80px rgba(2,6,23,0.3)',
            }}
          >
            <div className="grid gap-4 rounded-[31px] bg-slate-950/65 p-5 backdrop-blur-2xl sm:grid-cols-2 xl:grid-cols-4 xl:p-6">
              {statCards.map((stat, index) => (
                <div
                  key={stat.label}
                  className="animate-fade-in rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{stat.label}</div>
                  <div
                    className="mt-3 text-4xl font-black tracking-tight text-white tabular-nums"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {stat.value}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="ai-badge inline-flex">
              <Sparkles className="h-3 w-3" />
              Intelligence Layer
            </div>
            <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              A premium AI-commerce system, not just another storefront.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-400 sm:text-lg">
              SmartCart turns product discovery, pricing trust, and checkout optimization into one polished landing experience with motion designed to feel fast and intentional.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <FeatureTiltCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <div className="ai-badge inline-flex">
                <Zap className="h-3 w-3" />
                Conversion CTA
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                Turn browsing into confident checkout with a premium AI buying journey.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-400">
                SmartCart orchestrates recommendations, urgency, trust, and savings into one elegant interface built for demo impact and real product polish.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
              <MagneticButton onClick={() => navigate('products')}>
                <Sparkles className="h-5 w-5" />
                <span>Explore Products</span>
              </MagneticButton>
              <MagneticButton onClick={() => navigate('checkout')} variant="secondary">
                <ArrowRight className="h-5 w-5 text-violet-200" />
                <span>Go To Checkout</span>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="ai-badge inline-flex">
                <Star className="h-3 w-3" />
                Featured Inventory
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                Featured products selected by live AI signals.
              </h2>
              <p className="mt-3 text-sm text-slate-400 sm:text-base">
                Curated for quality, demand, and highest conversion potential.
              </p>
            </div>
            <button
              onClick={() => navigate('products')}
              className="hidden items-center gap-2 text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200 sm:flex"
            >
              View all products
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="ai-badge inline-flex">
              <ShieldCheck className="h-3 w-3" />
              Trust + Demand
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
              Highest-rated products, framed like a real venture-backed launch.
            </h2>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              Strong visuals, fast feedback, and believable AI product positioning.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {topRated.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div
          className="mx-auto max-w-5xl overflow-hidden rounded-[34px] p-[1px]"
          style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.25), rgba(255,255,255,0.08), rgba(139,92,246,0.18))' }}
        >
          <div className="rounded-[33px] bg-slate-950/70 p-8 backdrop-blur-2xl sm:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="ai-badge inline-flex">
                <Brain className="h-3 w-3" />
                Trust Layer
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                Built to look premium, but still grounded in real ecommerce signals.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-400">
                Every panel, stat, and hover state supports the same story: SmartCart AI helps shoppers discover faster, trust more, and convert with confidence.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {TRUST_SIGNALS.map(signal => (
                <div
                  key={signal.title}
                  className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-center"
                  style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10"
                    style={{
                      background: `${signal.accent}1f`,
                      boxShadow: `0 12px 30px ${signal.accent}1f`,
                    }}
                  >
                    <signal.icon className="h-7 w-7" style={{ color: signal.accent }} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white">{signal.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{signal.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

