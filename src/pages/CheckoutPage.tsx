import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Brain,
  CheckCircle,
  CreditCard,
  Lock,
  Shield,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useApp } from '../context/AppContext';
import { CartSummary } from '../components/checkout/CartSummary';
import { AIInsightsPanel } from '../components/checkout/AIInsightsPanel';
import { CheckoutProgress } from '../components/checkout/CheckoutProgress';
import { useAIHesitationDetection } from '../hooks/useAIHesitationDetection';
import { AIReactionToast } from '../components/ai/AIReactionToast';
import { toast } from '../components/ui/NotificationToast';
import { formatINR } from '../utils/currency';
import { readStorage, removeStorage, writeStorage } from '../utils/storage';

type Step = 1 | 2 | 3;
type CueTone = 'cyan' | 'amber' | 'violet' | 'emerald';

interface FieldConfig {
  field: keyof CheckoutFormState;
  label: string;
  placeholder: string;
  colSpan: string;
  type?: string;
}

interface CheckoutFormState {
  email: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  card: string;
  expiry: string;
  cvv: string;
}

interface BehaviorCue {
  title: string;
  message: string;
  tone: CueTone;
}

const PROCESSING_STAGES = [
  'Validating payment details...',
  'AI verifying basket integrity...',
  'Applying best price guarantee...',
  'Locking checkout confirmation...',
];

const TONE_STYLES: Record<CueTone, { border: string; bg: string; text: string }> = {
  cyan: {
    border: 'rgba(34,211,238,0.25)',
    bg: 'rgba(34,211,238,0.08)',
    text: '#67e8f9',
  },
  amber: {
    border: 'rgba(245,158,11,0.25)',
    bg: 'rgba(245,158,11,0.08)',
    text: '#fbbf24',
  },
  violet: {
    border: 'rgba(168,85,247,0.24)',
    bg: 'rgba(168,85,247,0.08)',
    text: '#c4b5fd',
  },
  emerald: {
    border: 'rgba(16,185,129,0.24)',
    bg: 'rgba(16,185,129,0.08)',
    text: '#6ee7b7',
  },
};
const CHECKOUT_STORAGE_KEY = 'smartcart:checkout';

export function CheckoutPage() {
  const { items, total, clearCart, savings, appliedCoupon, subtotal } = useCart();
  const { navigate, setShowCouponPopup } = useApp();
  const [step, setStep] = useState<Step>(() => readStorage<{ step: Step }>(CHECKOUT_STORAGE_KEY, { step: 1 }).step);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [form, setForm] = useState<CheckoutFormState>(() =>
    readStorage<{ form: CheckoutFormState }>(CHECKOUT_STORAGE_KEY, {
      form: {
        email: '',
        name: '',
        address: '',
        city: '',
        zip: '',
        card: '',
        expiry: '',
        cvv: '',
      },
    }).form,
  );
  const [behaviorCue, setBehaviorCue] = useState<BehaviorCue>({
    title: 'Checkout AI Active',
    message: 'SmartCart is monitoring savings, urgency, and value confidence while you complete checkout.',
    tone: 'cyan',
  });

  const previousIdsRef = useRef<string[]>([]);
  const removedIdsRef = useRef<string[]>([]);
  const quantityBurstRef = useRef(0);
  const quantityTimerRef = useRef<number | null>(null);

  const emitCue = (cue: BehaviorCue) => {
    setBehaviorCue(cue);
  };

  const maybeOpenCouponPopup = () => {
    if (step === 1 && !appliedCoupon && items.length > 0) {
      setShowCouponPopup(true);
    }
  };

  const {
    lastReaction,
    isAnalyzing,
    confidenceScore,
    trackQuantityChange,
    trackRemoveAdd,
    trackHoverBack,
    trackActivity,
    dismissReaction,
  } = useAIHesitationDetection();

  useEffect(() => {
    trackActivity();
  }, [step, items.length, trackActivity]);

  useEffect(() => {
    if (items.length === 0 && step === 1 && !form.email && !form.name && !form.address && !form.city && !form.zip && !form.card && !form.expiry && !form.cvv) {
      removeStorage(CHECKOUT_STORAGE_KEY);
      return;
    }

    writeStorage(CHECKOUT_STORAGE_KEY, { step, form });
  }, [form, items.length, step]);

  useEffect(() => {
    const currentIds = items.map(item => item.product.id);
    const removedIds = previousIdsRef.current.filter(id => !currentIds.includes(id));
    const addedIds = currentIds.filter(id => !previousIdsRef.current.includes(id));

    if (removedIds.length > 0) {
      removedIdsRef.current = [...removedIdsRef.current, ...removedIds].slice(-8);
      trackRemoveAdd();
      emitCue({
        title: 'Need help deciding?',
        message: 'AI spotted a product removal. Want a cheaper option, a trending alternative, or a temporary discount before you leave it out?',
        tone: 'violet',
      });
    }

    if (addedIds.some(id => removedIdsRef.current.includes(id))) {
      trackRemoveAdd();
      emitCue({
        title: 'This product is trending',
        message: 'Nice recovery. SmartCart detected a remove-and-readd pattern, which usually means the product still feels like the strongest fit.',
        tone: 'emerald',
      });
    }

    previousIdsRef.current = currentIds;
  }, [items, trackRemoveAdd]);

  useEffect(() => {
    return () => {
      if (quantityTimerRef.current) {
        window.clearTimeout(quantityTimerRef.current);
      }
    };
  }, []);

  const handleFieldChange = (field: keyof CheckoutFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleQuantitySignal = (productName: string, direction: 'increase' | 'decrease') => {
    trackQuantityChange();
    quantityBurstRef.current += 1;

    if (quantityTimerRef.current) {
      window.clearTimeout(quantityTimerRef.current);
    }

    quantityTimerRef.current = window.setTimeout(() => {
      quantityBurstRef.current = 0;
    }, 2200);

    if (quantityBurstRef.current >= 3) {
      emitCue({
        title: 'Need help deciding?',
        message: `${productName} has been adjusted multiple times. SmartCart can unlock a confidence-building discount or suggest the best-value alternative.`,
        tone: 'amber',
      });
      maybeOpenCouponPopup();
      quantityBurstRef.current = 0;
      return;
    }

    emitCue({
      title: direction === 'increase' ? 'This product is trending' : 'Checkout AI Updated',
      message: direction === 'increase'
        ? `${productName} is being viewed heavily today. AI sees positive momentum on this item.`
        : `${productName} quantity changed. SmartCart is recalculating value perception and savings impact in real time.`,
      tone: direction === 'increase' ? 'emerald' : 'cyan',
    });
  };

  const handleRemoveSignal = (productName: string) => {
    trackRemoveAdd();
    emitCue({
      title: 'Limited-time discount available',
      message: `${productName} was removed from the basket. AI can reveal a checkout incentive if price is the main blocker.`,
      tone: 'amber',
    });
  };

  const handleCouponIntent = () => {
    emitCue({
      title: 'Limited-time discount available',
      message: 'SmartCart predicts a coupon can improve confidence here. Hovering around promo entry is a strong savings intent signal.',
      tone: 'violet',
    });
  };

  const formatCard = (value: string) => value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 4);
    return numbers.length >= 2 ? `${numbers.slice(0, 2)}/${numbers.slice(2)}` : numbers;
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    for (let index = 0; index < PROCESSING_STAGES.length; index += 1) {
      setProcessingStage(index);
      await new Promise(resolve => setTimeout(resolve, 650));
    }
    removeStorage(CHECKOUT_STORAGE_KEY);
    clearCart();
    navigate('success');
  };

  const goToStep = (nextStep: Step) => {
    setStep(nextStep);

    if (nextStep === 2) {
      emitCue({
        title: 'Payment intelligence enabled',
        message: 'AI is ready to validate your inputs, monitor hesitation signals, and keep this conversion path friction-light.',
        tone: 'cyan',
      });
      toast.show({ type: 'ai', title: 'Smart Form Ready', message: 'AI validation and pricing confidence are active.', duration: 2600 });
    }

    if (nextStep === 3) {
      emitCue({
        title: 'Review before confirming',
        message: 'This basket looks strong. SmartCart sees healthy savings, urgency, and product-value alignment before final confirmation.',
        tone: 'emerald',
      });
      toast.show({ type: 'success', title: 'Almost there', message: 'Review your AI-optimized order before confirming.', duration: 2600 });
    }
  };

  const shippingFields: FieldConfig[] = [
    { field: 'email', label: 'Email Address', placeholder: 'you@example.com', colSpan: 'sm:col-span-2', type: 'email' },
    { field: 'name', label: 'Full Name', placeholder: 'John Smith', colSpan: 'sm:col-span-2' },
    { field: 'address', label: 'Address', placeholder: '123 Main Street', colSpan: 'sm:col-span-2' },
    { field: 'city', label: 'City', placeholder: 'San Francisco', colSpan: '' },
    { field: 'zip', label: 'ZIP Code', placeholder: '94102', colSpan: '' },
  ];

  const cueStyle = TONE_STYLES[behaviorCue.tone];

  const cartMetrics = useMemo(
    () => [
      { label: 'Subtotal', value: formatINR(subtotal) },
      { label: 'AI Savings', value: savings > 0 ? formatINR(savings) : 'Scanning' },
      { label: 'Checkout State', value: step === 1 ? 'Review' : step === 2 ? 'Payment' : 'Confirm' },
    ],
    [step, subtotal, savings],
  );

  const panelStyle = {
    background: 'linear-gradient(180deg, rgba(15,23,42,0.8), rgba(2,6,23,0.74))',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 28,
    boxShadow: '0 22px 70px rgba(2,6,23,0.32), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  const actionButtonClass = 'flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white transition-all duration-300 hover:-translate-y-0.5';

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[6%] top-20 h-72 w-72 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute right-[4%] top-40 h-80 w-80 rounded-full bg-violet-500/12 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              SmartCart AI Checkout
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
              The most intelligent part of your entire shopping flow.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              SmartCart AI blends urgency, pricing confidence, hesitation detection, and premium motion to create a cinematic checkout built for conversion.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {cartMetrics.map(metric => (
              <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{metric.label}</p>
                <p className="mt-2 break-words text-2xl font-black text-white">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mb-8 overflow-hidden rounded-[30px] border p-5 animate-fade-in"
          style={{
            background: `linear-gradient(135deg, ${cueStyle.bg}, rgba(255,255,255,0.03))`,
            borderColor: cueStyle.border,
            boxShadow: `0 22px 55px rgba(2,6,23,0.24), 0 0 24px ${cueStyle.bg}`,
          }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="relative mt-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white">
                <div className="absolute inset-0 rounded-2xl ai-pulse-ring opacity-70" />
                <Brain className="relative z-10 h-5 w-5" style={{ color: cueStyle.text }} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.24em]" style={{ color: cueStyle.text }}>{behaviorCue.title}</p>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">{behaviorCue.message}</p>
              </div>
            </div>
            <button
              onClick={() => maybeOpenCouponPopup()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
            >
              <Wand2 className="h-4 w-4" />
              Reveal AI Offer
            </button>
          </div>
        </div>

        <CheckoutProgress step={step} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            {step === 1 && (
              <div className="animate-fade-in space-y-5">
                <CartSummary
                  onQuantityAction={handleQuantitySignal}
                  onRemoveAction={handleRemoveSignal}
                  onCouponIntent={handleCouponIntent}
                />
                {items.length > 0 && (
                  <button
                    onClick={() => goToStep(2)}
                    className={`${actionButtonClass} w-full group`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(34,211,238,0.98), rgba(59,130,246,0.95), rgba(99,102,241,0.92))',
                      boxShadow: '0 18px 34px rgba(34,211,238,0.24)',
                    }}
                  >
                    Continue to Payment
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in space-y-5">
                <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="p-6" style={panelStyle}>
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-400/10 text-cyan-300">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Shipping Intelligence</h3>
                        <p className="text-xs text-slate-500">SmartCart keeps this form focused and friction-light.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {shippingFields.map(field => (
                        <div key={field.field} className={field.colSpan}>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-400">{field.label}</label>
                          <input
                            type={field.type ?? 'text'}
                            value={form[field.field]}
                            onChange={event => handleFieldChange(field.field, event.target.value)}
                            placeholder={field.placeholder}
                            className="input-premium"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6" style={panelStyle}>
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-400/10 text-cyan-300">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Payment Confidence</h3>
                        <p className="text-xs text-slate-500">AI validates card data and watches for hesitation signals.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-400">Card Number</label>
                        <input
                          type="text"
                          value={form.card}
                          onChange={event => handleFieldChange('card', formatCard(event.target.value))}
                          placeholder="4242 4242 4242 4242"
                          className="input-premium font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-400">Expiry Date</label>
                          <input
                            type="text"
                            value={form.expiry}
                            onChange={event => handleFieldChange('expiry', formatExpiry(event.target.value))}
                            placeholder="MM/YY"
                            className="input-premium font-mono"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-400">CVV</label>
                          <input
                            type="text"
                            value={form.cvv}
                            onChange={event => handleFieldChange('cvv', event.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="123"
                            className="input-premium font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-emerald-300/18 bg-emerald-400/8 px-4 py-3 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-300" />
                        <span>256-bit SSL encryption and live checkout verification are active.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => setStep(1)}
                    onMouseEnter={() => {
                      trackHoverBack();
                      emitCue({
                        title: 'Need help deciding?',
                        message: 'Hovering near back usually means uncertainty. SmartCart can surface a discount or value explanation before you leave payment.',
                        tone: 'violet',
                      });
                    }}
                    className="rounded-2xl px-6 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                    style={panelStyle}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => goToStep(3)}
                    className={`${actionButtonClass} flex-1 group`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(34,211,238,0.98), rgba(59,130,246,0.95), rgba(99,102,241,0.92))',
                      boxShadow: '0 18px 34px rgba(34,211,238,0.24)',
                    }}
                  >
                    Review Order
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in space-y-5">
                <div className="p-6" style={panelStyle}>
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-400/10 text-cyan-300">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">AI-Verified Order Review</h3>
                      <p className="text-xs text-slate-500">SmartCart confirms value, urgency, and checkout confidence before final placement.</p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-300/18 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      <CheckCircle className="h-3.5 w-3.5" />
                      AI Verified
                    </span>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 transition-all duration-300 hover:bg-white/[0.05]"
                        style={{ animation: 'slideRight 0.45s ease both', animationDelay: `${index * 70}ms` }}
                      >
                        <img src={item.product.image} alt={item.product.name} className="h-14 w-14 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{item.product.name}</p>
                          <p className="mt-1 text-xs text-slate-500">Qty {item.quantity} | Popular among students | {8 + index * 2} people viewed this today</p>
                        </div>
                        <span className="text-base font-black text-white">{formatINR(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Total</p>
                      <p className="mt-2 text-2xl font-black text-white">{formatINR(total)}</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-300/18 bg-emerald-400/8 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300">You saved</p>
                      <p className="mt-2 text-2xl font-black text-emerald-300">{formatINR(savings)}</p>
                    </div>
                    <div className="rounded-2xl border border-violet-300/18 bg-violet-400/8 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-violet-200">Confidence</p>
                      <p className="mt-2 text-2xl font-black text-violet-200">{confidenceScore}%</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => setStep(2)}
                    onMouseEnter={() => {
                      trackHoverBack();
                      emitCue({
                        title: 'Need help deciding?',
                        message: 'Moving back from review often signals hesitation. SmartCart can keep momentum with a subtle savings cue or reassurance message.',
                        tone: 'amber',
                      });
                    }}
                    className="rounded-2xl px-6 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                    style={panelStyle}
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className={`${actionButtonClass} flex-1 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(34,211,238,0.98), rgba(59,130,246,0.95), rgba(99,102,241,0.92))',
                      boxShadow: '0 18px 34px rgba(34,211,238,0.24)',
                    }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="thinking-dot h-2 w-2" />
                          <div className="thinking-dot h-2 w-2" />
                          <div className="thinking-dot h-2 w-2" />
                        </div>
                        <span>{PROCESSING_STAGES[processingStage]}</span>
                      </div>
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        Place Order - {formatINR(total)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <AIInsightsPanel behaviorMessage={behaviorCue.message} />
          </div>
        </div>
      </div>

      {lastReaction && (
        <AIReactionToast
          message={lastReaction.message}
          type={lastReaction.type}
          confidence={lastReaction.confidence}
          isAnalyzing={isAnalyzing}
          onDismiss={dismissReaction}
        />
      )}
    </div>
  );
}
