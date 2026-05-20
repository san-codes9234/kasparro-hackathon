import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Brain,
  Mic,
  MicOff,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  Wand2,
  X,
} from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { useApp } from '../../context/AppContext';
import { products, coupons } from '../../data/products';
import { AIConfidenceMeter } from './AIConfidenceMeter';
import { AIActivityTimeline } from './AIActivityTimeline';
import type { AIMessage, Coupon, Product } from '../../types';
import { formatCouponValue, formatINR } from '../../utils/currency';

const QUICK_ACTIONS = [
  'Find cheaper option',
  'Apply best coupon',
  'Best value product',
  'Why should I buy this?',
];

const CHEAPER_PRODUCT = products.find(product => product.id === 'p2') ?? products[0];
const BEST_VALUE_PRODUCT = products.find(product => product.id === 'p3') ?? products[0];
const POWER_PRODUCT = products.find(product => product.id === 'p1') ?? products[0];
const BEST_COUPON = coupons.find(coupon => coupon.code === 'FLASH50') ?? coupons[0];
const SAFE_COUPON = coupons.find(coupon => coupon.code === 'SAVE10') ?? coupons[0];

function formatTime(timestamp: Date) {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function VoiceWave({ active = false }: { active?: boolean }) {
  return (
    <div className="flex h-6 items-center gap-0.5">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="voice-bar"
          style={{
            height: active ? 18 : 8,
            opacity: active ? 1 : 0.55,
            animationDuration: active ? '1s' : '1.6s',
            animationDelay: `${index * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

function ThinkingIndicator() {
  const phases = [
    'Analyzing pricing signals...',
    'Comparing alternatives...',
    'Preparing a confident answer...',
  ];
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPhaseIndex(index => (index + 1) % phases.length);
    }, 900);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start gap-3 px-1 py-2 animate-fade-in">
      <div className="relative mt-1 flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
        <div className="absolute inset-0 rounded-2xl ai-pulse-ring opacity-70" />
        <Brain className="relative z-10 h-4 w-4" />
      </div>
      <div className="max-w-[88%] rounded-[22px] rounded-tl-md border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-1">
            <div className="thinking-dot" />
            <div className="thinking-dot" />
            <div className="thinking-dot" />
          </div>
          <span className="text-xs font-medium text-slate-400">{phases[phaseIndex]}</span>
        </div>
      </div>
    </div>
  );
}

function inferProduct(content: string, recentPrompt: string): Product {
  const lower = `${recentPrompt} ${content}`.toLowerCase();

  if (lower.includes('cheaper') || lower.includes('alternative') || lower.includes('battery') || lower.includes('portable')) {
    return CHEAPER_PRODUCT;
  }

  if (lower.includes('gaming') || lower.includes('creative') || lower.includes('performance') || lower.includes('power')) {
    return POWER_PRODUCT;
  }

  return BEST_VALUE_PRODUCT;
}

function inferCoupon(content: string, recentPrompt: string): Coupon | null {
  const lower = `${recentPrompt} ${content}`.toLowerCase();

  if (lower.includes('coupon') || lower.includes('save') || lower.includes('deal') || lower.includes('discount')) {
    return BEST_COUPON;
  }

  if (lower.includes('worth') || lower.includes('best value') || lower.includes('buy')) {
    return SAFE_COUPON;
  }

  return null;
}

function getInsightTags(content: string, recentPrompt: string) {
  const lower = `${recentPrompt} ${content}`.toLowerCase();
  const tags = ['Live AI reasoning'];

  if (lower.includes('alternative') || lower.includes('cheaper')) {
    tags.push('Lower-cost path');
  }

  if (lower.includes('worth') || lower.includes('best') || lower.includes('reviews')) {
    tags.push('High confidence');
  }

  if (lower.includes('coupon') || lower.includes('save') || lower.includes('deal')) {
    tags.push('Savings unlock');
  }

  return tags.slice(0, 3);
}

function ProductSuggestionCard({ product, onView }: { product: Product; onView: () => void }) {
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5">
      <div className="flex gap-3 p-3">
        <img
          src={product.image}
          alt={product.name}
          className="h-16 w-16 rounded-xl object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">AI Pick</p>
              <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">{product.name}</p>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
              {product.rating.toFixed(1)} rating
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <span className="text-base font-black text-white">{formatINR(product.price)}</span>
              {product.originalPrice && (
                <span className="ml-2 text-xs text-slate-500 line-through">{formatINR(product.originalPrice)}</span>
              )}
            </div>
            <button
              onClick={onView}
              className="inline-flex items-center gap-1 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200 transition-all duration-300 hover:border-cyan-300/35 hover:bg-cyan-400/15"
            >
              Explore
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CouponSuggestionCard({ coupon }: { coupon: Coupon }) {
  return (
    <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/35 hover:bg-emerald-400/12">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
            <Tag className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">Best Coupon</p>
            <p className="mt-1 text-sm font-semibold text-white">{coupon.code}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-emerald-300">
            {formatCouponValue(coupon.discount, coupon.type)}
          </p>
          <p className="text-[11px] text-slate-300">savings</p>
        </div>
      </div>
      <p className="mt-2 text-xs leading-6 text-slate-300">{coupon.description}</p>
    </div>
  );
}

function AssistantMessageCard({
  message,
  previousUserMessage,
  onExplore,
}: {
  message: AIMessage;
  previousUserMessage: AIMessage | undefined;
  onExplore: () => void;
}) {
  const promptContext = previousUserMessage?.content ?? '';
  const product = inferProduct(message.content, promptContext);
  const coupon = inferCoupon(message.content, promptContext);
  const tags = getInsightTags(message.content, promptContext);

  return (
    <div className="max-w-[88%]">
      <div
        className="group rounded-[24px] rounded-tl-md border border-white/10 bg-white/[0.05] px-4 py-3 text-sm leading-7 text-slate-200 backdrop-blur-xl transition-all duration-300 hover:border-cyan-300/20 hover:bg-white/[0.06]"
        style={{
          boxShadow: '0 18px 40px rgba(2,6,23,0.22), inset 3px 0 0 rgba(34,211,238,0.7)',
        }}
      >
        <p>{message.content}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <ProductSuggestionCard product={product} onView={onExplore} />
        {coupon && <CouponSuggestionCard coupon={coupon} />}
      </div>

      <div className="mt-2 flex items-center gap-2 pl-1 text-[11px] text-slate-500">
        <ShieldCheck className="h-3 w-3 text-cyan-300" />
        <span>SmartCart AI</span>
        <span>|</span>
        <span>{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}

export function ChatPanel() {
  const { isChatOpen, toggleChat, isVoiceActive, toggleVoice, navigate } = useApp();
  const { messages, isTyping, sendMessage } = useAI();
  const [input, setInput] = useState('');
  const [showSystems, setShowSystems] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isChatOpen) return;

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 260);
    setShowSystems(false);
    const systemsTimer = window.setTimeout(() => setShowSystems(true), 420);

    return () => {
      window.clearTimeout(focusTimer);
      window.clearTimeout(systemsTimer);
    };
  }, [isChatOpen]);

  const statusLine = useMemo(() => {
    if (isVoiceActive) return 'Voice copilot active';
    if (isTyping) return 'Synthesizing answer';
    return 'Realtime shopping intelligence';
  }, [isTyping, isVoiceActive]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput('');
  };

  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 animate-slide-up sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[430px]">
      <div
        className="relative overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/80 backdrop-blur-2xl"
        style={{
          boxShadow: '0 32px 90px rgba(2,6,23,0.62), 0 0 50px rgba(34,211,238,0.09)',
          maxHeight: 'min(calc(100vh - 7.5rem), 820px)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.14),transparent_32%),radial-gradient(circle_at_bottom_center,rgba(59,130,246,0.1),transparent_36%)]" />

        <div className="relative flex max-h-[inherit] flex-col">
          <div className="overflow-hidden border-b border-white/10">
            <div className="relative px-5 py-4">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(59,130,246,0.08),rgba(139,92,246,0.18))]" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className="relative mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-white">
                    <div className="absolute inset-0 rounded-2xl ai-pulse-ring opacity-70" />
                    <div
                      className="absolute inset-[2px] rounded-[14px]"
                      style={{
                        background: 'radial-gradient(circle at 35% 35%, rgba(125,211,252,0.88), rgba(34,211,238,0.8) 24%, rgba(59,130,246,0.88) 58%, rgba(91,33,182,0.92) 100%)',
                        boxShadow: '0 14px 32px rgba(34,211,238,0.32)',
                      }}
                    />
                    <Sparkles className="relative z-10 h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-black uppercase tracking-[0.24em] text-white">
                        SmartCart AI Assistant
                      </p>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                      {isVoiceActive ? <VoiceWave active /> : <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
                      <span>{statusLine}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Premium shopping copilot for pricing, confidence, and conversion.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleVoice}
                    className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:text-white"
                    title="Toggle voice assistant"
                  >
                    {isVoiceActive && <span className="absolute inset-0 rounded-2xl ai-pulse-ring opacity-80" />}
                    {isVoiceActive ? <Mic className="relative z-10 h-4 w-4 text-cyan-200" /> : <MicOff className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={toggleChat}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:text-white"
                    title="Close AI assistant"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {showSystems && (
              <div className="grid gap-3 border-t border-white/8 bg-black/10 px-4 py-4 animate-fade-in md:grid-cols-[auto_1fr]">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-3 py-2">
                  <AIConfidenceMeter size="sm" label="Response Confidence" />
                </div>
                <div className="hidden md:block">
                  <AIActivityTimeline />
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin sm:px-4" style={{ scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
            <div className="space-y-4">
              {messages.map((message, index) => {
                const previousUserMessage = [...messages.slice(0, index)].reverse().find(entry => entry.role === 'user');

                return (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    {message.role === 'assistant' ? (
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-400/10 text-cyan-100 shadow-[0_10px_24px_rgba(34,211,238,0.18)]">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <AssistantMessageCard
                          message={message}
                          previousUserMessage={previousUserMessage}
                          onExplore={() => navigate('products')}
                        />
                      </div>
                    ) : (
                      <div className="max-w-[86%] sm:max-w-[82%]">
                        <div
                          className="rounded-[22px] rounded-tr-md px-4 py-3 text-sm leading-7 text-white"
                          style={{
                            background: 'linear-gradient(135deg, rgba(34,211,238,0.95), rgba(59,130,246,0.95), rgba(99,102,241,0.9))',
                            boxShadow: '0 14px 34px rgba(34,211,238,0.24)',
                          }}
                        >
                          {message.content}
                        </div>
                        <div className="mt-2 pr-1 text-right text-[11px] text-slate-500">{formatTime(message.timestamp)}</div>
                      </div>
                    )}
                  </div>
                );
              })}

              {isTyping && <ThinkingIndicator />}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-white/10 bg-slate-950/70 px-3 py-4 backdrop-blur-2xl sm:px-4">
            <div className="mb-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {QUICK_ACTIONS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleQuickAction(prompt)}
                  className="group flex-shrink-0 rounded-full border border-cyan-300/18 bg-cyan-400/8 px-3.5 py-2 text-xs font-semibold text-cyan-100 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/32 hover:bg-cyan-400/14"
                >
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <Wand2 className="h-3 w-3 text-cyan-300 transition-transform duration-300 group-hover:rotate-12" />
                    {prompt}
                  </span>
                </button>
              ))}
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2 rounded-[18px] bg-slate-950/40 px-3 py-2.5">
                <button
                  onClick={toggleVoice}
                  className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition-all duration-300 hover:border-cyan-300/25 hover:text-white"
                  title="Voice AI"
                >
                  {isVoiceActive && <span className="absolute inset-0 rounded-2xl ai-pulse-ring opacity-90" />}
                  <Mic className={`relative z-10 h-4 w-4 ${isVoiceActive ? 'text-cyan-200' : ''}`} />
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={event => setInput(event.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask SmartCart AI about pricing, value, or coupons..."
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  style={{ fontFamily: 'inherit' }}
                />

                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="group flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-35"
                  style={{
                    background: input.trim()
                      ? 'linear-gradient(135deg, rgba(34,211,238,0.98), rgba(59,130,246,0.95), rgba(99,102,241,0.92))'
                      : 'rgba(255,255,255,0.08)',
                    boxShadow: input.trim() ? '0 14px 30px rgba(34,211,238,0.28)' : 'none',
                  }}
                >
                  <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
