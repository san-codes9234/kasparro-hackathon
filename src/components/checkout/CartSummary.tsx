import {
  AlertTriangle,
  Brain,
  CheckCircle,
  Minus,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { bundleDeals, products } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { LiveSavingsCounter } from '../ai/LiveSavingsCounter';
import { toast } from '../ui/NotificationToast';
import { formatINR } from '../../utils/currency';

interface CartSummaryProps {
  onQuantityAction?: (productName: string, direction: 'increase' | 'decrease') => void;
  onRemoveAction?: (productName: string) => void;
  onCouponIntent?: () => void;
}

function useAnimatedNumber(target: number, duration = 500) {
  const [value, setValue] = useState(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = value;
    const startTime = performance.now();

    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(start + (target - start) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return value;
}

function getViewerCount(id: string) {
  const seed = id.charCodeAt(id.length - 1) || 4;
  return 8 + (seed % 7);
}

export function CartSummary({ onQuantityAction, onRemoveAction, onCouponIntent }: CartSummaryProps) {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    total,
    savings,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    addToCart,
  } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const animatedSubtotal = useAnimatedNumber(subtotal, 650);
  const animatedDiscount = useAnimatedNumber(discount, 650);
  const animatedTotal = useAnimatedNumber(total, 650);
  const animatedSavings = useAnimatedNumber(savings, 650);

  const cartIds = items.map(item => item.product.id);
  const recommendedBundle = useMemo(
    () => bundleDeals.find(bundle => bundle.products.some(product => cartIds.includes(product.id))),
    [cartIds],
  );
  const aiRecommendations = useMemo(
    () => products.filter(product => !cartIds.includes(product.id)).slice(0, 2),
    [cartIds],
  );

  const primaryInsight = useMemo(() => {
    if (savings > 0) {
      return `AI secured ${formatINR(savings)} in blended value across markdowns and coupon savings today.`;
    }
    if (subtotal > 100000) {
      return 'Your basket sits in a high-conversion range. A timed coupon reveal can meaningfully improve checkout confidence.';
    }
    return 'SmartCart AI is monitoring price confidence, urgency, and bundle efficiency while you review this order.';
  }, [savings, subtotal]);

  const handleApplyCoupon = () => {
    const success = applyCoupon(couponInput);
    if (success) {
      setCouponSuccess('Coupon applied!');
      setCouponError('');
      toast.show({
        type: 'success',
        title: 'Coupon Applied!',
        message: `${couponInput.toUpperCase()} validated by SmartCart AI`,
        duration: 3000,
      });
    } else {
      setCouponError('Invalid coupon code');
      setCouponSuccess('');
    }
    setCouponInput('');
    window.setTimeout(() => setCouponSuccess(''), 3000);
  };

  const handleQuantity = (productId: string, quantity: number, productName: string, direction: 'increase' | 'decrease') => {
    updateQuantity(productId, quantity);
    onQuantityAction?.(productName, direction);
  };

  const handleRemove = (productId: string, productName: string) => {
    removeFromCart(productId);
    onRemoveAction?.(productName);
  };

  const handleAddRecommendation = (productId: string) => {
    const product = products.find(entry => entry.id === productId);
    if (!product) return;

    addToCart(product);
    toast.show({
      type: 'ai',
      title: 'AI Recommendation Added',
      message: `${product.name.split(' ').slice(0, 3).join(' ')} added to improve basket value`,
      duration: 2800,
    });
  };

  const cardStyle = {
    background: 'linear-gradient(180deg, rgba(15,23,42,0.78), rgba(2,6,23,0.72))',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 28,
    boxShadow: '0 24px 70px rgba(2,6,23,0.34), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  return (
    <div className="space-y-5">
      {items.length === 0 ? (
        <div className="animate-fade-in p-12 text-center" style={cardStyle}>
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10"
          >
            <Sparkles className="h-8 w-8 text-cyan-300" />
          </div>
          <p className="mb-1 font-semibold text-slate-200">Your cart is ready for intelligence.</p>
          <p className="text-sm text-slate-500">Add products to unlock AI savings insights, value analysis, and conversion nudges.</p>
        </div>
      ) : (
        <>
          <div className="animate-fade-in overflow-hidden p-[1px]" style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.28), rgba(255,255,255,0.06), rgba(139,92,246,0.22))', borderRadius: 30 }}>
            <div className="rounded-[29px] p-5" style={cardStyle}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                    <Brain className="h-3.5 w-3.5" />
                    AI Cart Summary
                  </div>
                  <h3 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white">SmartCart is optimizing this checkout in real time.</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{primaryInsight}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px]">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">You saved</p>
                    <p className="mt-1 text-2xl font-black text-emerald-300">{formatINR(animatedSavings)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Conversion</p>
                    <p className="mt-1 text-2xl font-black text-cyan-300">High</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Confidence</p>
                    <p className="mt-1 text-2xl font-black text-violet-300">96%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="animate-fade-in overflow-hidden" style={cardStyle}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <h3 className="font-bold text-white">Checkout Basket</h3>
                <p className="mt-1 text-xs text-slate-500">Animated pricing, urgency cues, and AI conversion signals.</p>
              </div>
              <span className="rounded-full border border-cyan-300/18 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                {items.length} items
              </span>
            </div>

            <div>
              {items.map((item, index) => (
                <div
                  key={item.product.id}
                  className="flex flex-col gap-4 px-4 py-5 transition-all duration-300 hover:bg-white/[0.02] sm:flex-row sm:items-center sm:px-5"
                  style={{
                    borderBottom: index < items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    animation: 'slideRight 0.45s ease both',
                    animationDelay: `${index * 70}ms`,
                  }}
                >
                  <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/10 shadow-[0_14px_32px_rgba(2,6,23,0.22)]">
                    <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" loading="lazy" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-semibold text-white">{item.product.name}</p>
                      {index === 0 && (
                        <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                          Best value choice
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{item.product.brand}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.product.stock <= 3 && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-orange-300/20 bg-orange-400/10 px-2.5 py-1 text-[11px] font-semibold text-orange-300">
                          <AlertTriangle className="h-3 w-3 urgency-pulse" />
                          Only {item.product.stock} left in stock
                        </span>
                      )}
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                        {getViewerCount(item.product.id)} people viewed this today
                      </span>
                      <span className="rounded-full border border-violet-300/20 bg-violet-400/10 px-2.5 py-1 text-[11px] font-semibold text-violet-200">
                        Popular among students
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="text-right">
                      <p className="text-xl font-black text-white">{formatINR(item.product.price * item.quantity)}</p>
                      {item.product.originalPrice && (
                        <p className="text-xs text-slate-500 line-through">{formatINR(item.product.originalPrice * item.quantity)}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5">
                      <button
                        onClick={() => handleQuantity(item.product.id, item.quantity - 1, item.product.name, 'decrease')}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.05] text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08] hover:text-white"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantity(item.product.id, item.quantity + 1, item.product.name, 'increase')}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-400/15"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemove(item.product.id, item.product.name)}
                        className="ml-1 flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-slate-500 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {recommendedBundle && (
            <div className="animate-fade-in rounded-[28px] border border-amber-300/15 bg-amber-400/8 p-5 backdrop-blur-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
                    <Wand2 className="h-3.5 w-3.5" />
                    Smart bundle suggestion
                  </div>
                  <h4 className="mt-3 text-lg font-bold text-white">{recommendedBundle.label}</h4>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                    AI predicts stronger value perception if you complete this set. Unlock up to {formatINR(recommendedBundle.savings)} in bundled upside.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recommendedBundle.products.filter(product => !cartIds.includes(product.id)).map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleAddRecommendation(product.id)}
                      className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3.5 py-2 text-xs font-semibold text-amber-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-400/14"
                    >
                      Add {product.name.split(' ').slice(0, 2).join(' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                <div className="animate-fade-in p-5" style={cardStyle}>
                  <div className="mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-cyan-300" />
                    <h3 className="text-sm font-bold text-white">Smart Coupon Access</h3>
                    <span className="ml-auto text-xs text-slate-500">Try `SAVE10`</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-400/24 bg-emerald-400/10 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/18 bg-emerald-400/10">
                          <CheckCircle className="h-4 w-4 text-emerald-300" />
                        </div>
                        <div>
                          <span className="font-mono text-sm font-bold text-emerald-300">{appliedCoupon.code}</span>
                          <p className="mt-1 text-xs text-slate-300">{appliedCoupon.description}</p>
                        </div>
                      </div>
                      <button onClick={removeCoupon} className="text-slate-500 transition-colors hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex flex-col gap-3 sm:flex-row"
                      onMouseEnter={onCouponIntent}
                    >
                      <input
                        type="text"
                        value={couponInput}
                        onChange={event => {
                          setCouponInput(event.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        onFocus={onCouponIntent}
                        onKeyDown={event => event.key === 'Enter' && handleApplyCoupon()}
                        placeholder="Enter code or wait for AI reveal"
                        className="input-premium flex-1"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!couponInput}
                        className="rounded-2xl px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-35"
                        style={{
                          background: 'linear-gradient(135deg, rgba(34,211,238,0.95), rgba(59,130,246,0.95))',
                          boxShadow: couponInput ? '0 14px 28px rgba(34,211,238,0.22)' : 'none',
                        }}
                      >
                        Apply with AI
                      </button>
                    </div>
                  )}

                  {couponError && <p className="mt-2 text-xs text-rose-400">{couponError}</p>}
                  {couponSuccess && <p className="mt-2 text-xs text-emerald-400">{couponSuccess}</p>}
                </div>

                {savings > 0 && <LiveSavingsCounter savings={animatedSavings} label="You saved today" />}
              </div>

              <div className="animate-fade-in p-5" style={cardStyle}>
                <h3 className="mb-4 text-sm font-bold text-white">Order Totals</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-semibold text-white tabular-nums">{formatINR(animatedSubtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Shipping</span>
                    <span className="font-semibold text-emerald-300">FREE</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">AI Coupon Discount</span>
                      <span className="font-semibold text-emerald-300 tabular-nums">- {formatINR(animatedDiscount)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-white/8 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Total</span>
                    <span className="text-2xl font-black text-white tabular-nums">{formatINR(animatedTotal)}</span>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-slate-400">
                    AI predicts this basket presents strong conversion confidence based on savings, scarcity, and category fit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {aiRecommendations.length > 0 && (
            <div className="animate-fade-in p-5" style={cardStyle}>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-300" />
                <h3 className="text-sm font-bold text-white">AI Recommended Add-Ons</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {aiRecommendations.map(product => (
                  <div key={product.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05]">
                    <div className="flex gap-3">
                      <img src={product.image} alt={product.name} className="h-16 w-16 rounded-xl object-cover" loading="lazy" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-white">{product.name}</p>
                        <p className="mt-1 text-xs text-slate-500">Trending with similar checkouts</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-base font-black text-cyan-300">{formatINR(product.price)}</span>
                          <button
                            onClick={() => handleAddRecommendation(product.id)}
                            className="rounded-full border border-cyan-300/18 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200 transition-all duration-300 hover:bg-cyan-400/16"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
