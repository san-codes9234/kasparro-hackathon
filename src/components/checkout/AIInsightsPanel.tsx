import { ArrowRight, Brain, Lightbulb, Package, ShieldCheck, Sparkles, TrendingUp, Crown, Zap, Activity } from 'lucide-react';
import { bundleDeals, products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { AIConfidenceMeter } from '../ai/AIConfidenceMeter';
import { AIActivityTimeline } from '../ai/AIActivityTimeline';
import { LiveSavingsCounter } from '../ai/LiveSavingsCounter';
import { toast } from '../ui/NotificationToast';
import { formatINR } from '../../utils/currency';

interface AIInsightsPanelProps {
  behaviorMessage?: string;
}

export function AIInsightsPanel({ behaviorMessage }: AIInsightsPanelProps) {
  const { items, addToCart, total, savings } = useCart();
  const { navigate } = useApp();

  const cartIds = items.map(item => item.product.id);
  const suggestions = products.filter(product => !cartIds.includes(product.id)).slice(0, 3);
  const relevantBundle = bundleDeals.find(bundle => bundle.products.some(product => cartIds.includes(product.id)));
  const mostExpensive = items.length > 0
    ? [...items].sort((a, b) => b.product.price - a.product.price)[0]
    : null;

  const confidenceValue = items.length === 0
    ? 78
    : Math.min(98, Math.round(82 + items.length * 3 + (savings > 0 ? 5 : 0) + (total > 90000 ? 4 : 0)));

  const valueNarrative = (() => {
    if (!mostExpensive) return 'AI waits for items before analyzing product value and confidence signals.';

    const tags = mostExpensive.product.tags;
    if (tags.includes('gaming')) return 'High-performance product with strong review density. Ideal if speed and power are your main conversion drivers.';
    if (tags.includes('business') || tags.includes('portable')) return 'Strong utility-to-price balance with portability upside. Excellent perceived value for practical buyers.';
    if (tags.includes('4K') || tags.includes('design')) return 'Premium visual quality raises perceived value. This item anchors the basket with strong spec credibility.';
    return 'Balanced feature set and social proof make this item a stable value leader inside the basket.';
  })();

  const handleAddSuggestion = (productId: string) => {
    const product = products.find(entry => entry.id === productId);
    if (!product) return;

    addToCart(product);
    toast.show({
      type: 'ai',
      title: 'AI Recommendation Added',
      message: `${product.name.split(' ').slice(0, 3).join(' ')} improves bundle strength`,
      duration: 2800,
    });
  };

  const glowColor = 'rgba(34, 211, 238, 0.2)';
  const amberGlow = 'rgba(245, 158, 11, 0.2)';

  const premiumCardStyle = {
    background: 'linear-gradient(180deg, rgba(15,23,42,0.92), rgba(2,6,23,0.88))',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 32,
    boxShadow: `0 24px 70px rgba(2,6,23,0.5), 0 0 40px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.08)`,
  };

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3), 0 0 40px rgba(34, 211, 238, 0.15); }
          50% { box-shadow: 0 0 35px rgba(34, 211, 238, 0.5), 0 0 70px rgba(34, 211, 238, 0.25); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shimmerSweep {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes cardEntrance {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .ai-pulse-ring {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        .float-animation {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      <div className="overflow-hidden p-[1px]" style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.35), rgba(139,92,246,0.3), rgba(245,158,11,0.25))', borderRadius: 33 }}>
        <div className="rounded-[32px] p-6" style={premiumCardStyle}>
          <div className="flex items-start gap-4">
            <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-400/15 to-cyan-500/10 text-white ai-pulse-ring">
              <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-xl" />
              <Brain className="relative z-10 h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-[0.22em] text-white" style={{ textShadow: '0 0 30px rgba(34, 211, 238, 0.5)' }}>
                  SmartCart AI
                </h3>
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1">
                  <Activity className="h-3 w-3 text-emerald-300 status-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200">Active</span>
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {behaviorMessage ?? 'Realtime conversion analysis, confidence scoring, and value optimization are active for this basket.'}
              </p>
              {items.length > 0 && savings > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1.5">
                  <Crown className="h-3.5 w-3.5 text-amber-300" />
                  <span className="text-xs font-semibold text-amber-200">AI optimized your cart</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5" style={{ ...premiumCardStyle, animation: 'cardEntrance 0.5s ease-out 0.1s both' }}>
        <AIConfidenceMeter value={confidenceValue} size="md" label="Checkout Confidence" showLabel />
      </div>

      {items.length > 0 && savings > 0 && (
        <div style={{ animation: 'cardEntrance 0.5s ease-out 0.2s both' }}>
          <LiveSavingsCounter savings={savings} label="AI Savings Locked" />
        </div>
      )}

      {items.length > 0 && (
        <div className="grid gap-5" style={{ animation: 'cardEntrance 0.5s ease-out 0.3s both' }}>
          <div
            className="rounded-[32px] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/8 via-slate-950/60 to-slate-950/80 p-6 backdrop-blur-2xl transition-all duration-500 hover:border-cyan-400/30"
            style={{ boxShadow: `0 0 30px ${glowColor}` }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Product Value Analysis</h4>
              {mostExpensive && (
                <div className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1">
                  <Zap className="h-3 w-3 text-emerald-300" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">Best value detected</span>
                </div>
              )}
            </div>
            <p className="text-sm leading-7 text-slate-300">{valueNarrative}</p>
            {mostExpensive && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Highest impact item</p>
                <p className="mt-1 text-base font-semibold text-white">{mostExpensive.product.name}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-500/12 px-3 py-1.5 text-[11px] font-bold text-emerald-300">Trending</span>
                  <span className="rounded-full border border-amber-400/25 bg-amber-500/12 px-3 py-1.5 text-[11px] font-bold text-amber-300">Best value choice</span>
                  <span className="rounded-full border border-violet-400/25 bg-violet-500/12 px-3 py-1.5 text-[11px] font-bold text-violet-200">Popular among students</span>
                </div>
              </div>
            )}
          </div>

          {relevantBundle && (
            <div
              className="rounded-[32px] border border-amber-400/25 bg-gradient-to-br from-amber-400/10 via-slate-950/60 to-slate-950/80 p-6 backdrop-blur-2xl transition-all duration-500 hover:border-amber-400/35 float-animation"
              style={{ boxShadow: `0 0 30px ${amberGlow}` }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-300">
                  <Package className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Bundle Opportunity</h4>
              </div>
              <p className="text-sm font-semibold text-white">{relevantBundle.label}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                AI predicts stronger purchase justification if this bundle is completed. Estimated bundle upside: <span className="font-bold text-amber-300">{formatINR(relevantBundle.savings)}</span>.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {relevantBundle.products.filter(product => !cartIds.includes(product.id)).map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleAddSuggestion(product.id)}
                    className="group rounded-full border border-amber-400/25 bg-amber-400/12 px-4 py-2 text-xs font-bold text-amber-200 transition-all duration-300 hover:-translate-y-1 hover:bg-amber-400/20 hover:shadow-lg hover:shadow-amber-500/20"
                  >
                    Add {product.name.split(' ').slice(0, 2).join(' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className="rounded-[32px] border border-violet-400/20 bg-gradient-to-br from-violet-400/8 via-slate-950/60 to-slate-950/80 p-6 backdrop-blur-2xl transition-all duration-500 hover:border-violet-400/30"
            style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)' }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-400/10 text-violet-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Personalized Suggestions</h4>
              </div>
              <button
                onClick={() => navigate('products')}
                className="group inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 transition-all duration-300 hover:text-cyan-200 hover:translate-x-1"
              >
                Explore all
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="space-y-3">
              {suggestions.map((product, index) => (
                <div
                  key={product.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/25 hover:bg-slate-950/70 hover:shadow-lg hover:shadow-cyan-500/10"
                  style={{ animation: `cardEntrance 0.5s ease-out ${0.4 + index * 0.1}s both` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative flex gap-4">
                    <img src={product.image} alt={product.name} className="h-20 w-20 rounded-xl object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="line-clamp-2 text-sm font-semibold text-white">{product.name}</p>
                          <p className="mt-1 text-xs text-slate-400">AI sees strong adjacency with your current basket.</p>
                        </div>
                        <span className="rounded-full border border-cyan-400/25 bg-cyan-400/12 px-2.5 py-1 text-[10px] font-bold text-cyan-200">
                          {product.rating.toFixed(1)} rating
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-black text-cyan-300" style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.5)' }}>{formatINR(product.price)}</span>
                        <button
                          onClick={() => handleAddSuggestion(product.id)}
                          className="group/btn rounded-full border border-cyan-400/25 bg-cyan-400/12 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200 transition-all duration-300 hover:bg-cyan-400/20 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105"
                        >
                          Add item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-[32px] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/8 via-slate-950/60 to-slate-950/80 p-6 backdrop-blur-2xl transition-all duration-500 hover:border-cyan-400/30"
            style={{ boxShadow: `0 0 30px ${glowColor}` }}
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-white">AI Persuasion Signals</h4>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Scarcity cues are increasing urgency on your highest-value item.',
                'Savings + free shipping create the strongest price reassurance mix.',
                'Bundle completion likely improves perceived checkout value.',
                'Recommendation cards are optimized for low-friction add-ons.',
              ].map((signal, index) => (
                <div
                  key={signal}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300 transition-all duration-300 hover:border-cyan-400/20 hover:bg-white/[0.06] hover:translate-x-1"
                  style={{ animation: `cardEntrance 0.5s ease-out ${0.5 + index * 0.1}s both` }}
                >
                  {signal}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ animation: 'cardEntrance 0.5s ease-out 0.6s both' }}>
        <AIActivityTimeline />
      </div>

      {items.length === 0 && (
        <div
          className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950/80 to-slate-950/90 p-10 text-center backdrop-blur-2xl"
          style={{ animation: 'cardEntrance 0.5s ease-out 0.4s both' }}
        >
          <div className="relative inline-flex">
            <Lightbulb className="h-10 w-10 text-cyan-300" style={{ filter: 'drop-shadow(0 0 20px rgba(34, 211, 238, 0.5))' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-cyan-400/20 blur-xl animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-300">AI insight cards will populate as soon as products enter the checkout basket.</p>
        </div>
      )}
    </div>
  );
}
