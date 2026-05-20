import { useEffect, useState } from 'react';
import { CheckCircle, Package, ArrowRight, Sparkles, Truck, Brain } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ORDER_ID = `SC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const STEPS = [
  { icon: CheckCircle, label: 'Order Confirmed', done: true },
  { icon: Package, label: 'Being Packed', done: false },
  { icon: Truck, label: 'Out for Delivery', done: false },
];

const CONFETTI_COUNT = 50;

export function SuccessPage() {
  const { navigate } = useApp();
  const [confetti] = useState(() => Array.from({ length: CONFETTI_COUNT }, (_, i) => i));
  const [savingsVisible, setSavingsVisible] = useState(false);
  const [iconVisible, setIconVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [ringsVisible, setRingsVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setIconVisible(true), 100);
    const t2 = setTimeout(() => setRingsVisible(true), 300);
    const t3 = setTimeout(() => setSavingsVisible(true), 600);
    const t4 = setTimeout(() => setContentVisible(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confetti.map(i => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-20px`,
              width: 6 + Math.random() * 8,
              height: 6 + Math.random() * 8,
              borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
              backgroundColor: ['#06b6d4','#3b82f6','#10b981','#f59e0b','#f43f5e','#8b5cf6'][i % 6],
              animation: `confetti-fall ${1.5 + Math.random() * 2.5}s ease-in ${Math.random() * 1.5}s forwards`,
              transform: `rotate(${Math.random() * 360}deg)`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <div className="max-w-xl w-full text-center">
        {/* Success icon with radiating rings */}
        <div className="relative inline-flex mb-8">
          {/* Radiating glow rings */}
          {ringsVisible && [1, 2, 3].map(r => (
            <span
              key={r}
              className="absolute rounded-full"
              style={{
                inset: -(r * 12),
                border: '1px solid rgba(16,185,129,0.3)',
                animation: `ringPulse ${1.5 + r * 0.3}s ease-out infinite`,
                animationDelay: `${r * 0.2}s`,
              }}
            />
          ))}

          <div
            className="w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              boxShadow: '0 0 60px rgba(16,185,129,0.5), 0 8px 32px rgba(16,185,129,0.3)',
              transform: iconVisible ? 'scale(1)' : 'scale(0)',
              transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <CheckCircle className="w-14 h-14 text-white" />
          </div>

          <div
            className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              boxShadow: '0 4px 16px rgba(6,182,212,0.4)',
              opacity: iconVisible ? 1 : 0,
              transition: 'opacity 0.4s ease 0.4s',
            }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div style={{ opacity: contentVisible ? 1 : 0, transform: contentVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease' }}>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-3">Order Placed!</h1>
          <p className="text-gray-400 mb-2">Confirmation sent to your email</p>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-8"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className="text-gray-400 text-sm">Order ID:</span>
            <span className="font-mono font-bold text-cyan-400">{ORDER_ID}</span>
          </div>
        </div>

        {/* AI Savings badge */}
        <div
          style={{
            opacity: savingsVisible ? 1 : 0,
            transform: savingsVisible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
            transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            marginBottom: 32,
          }}
        >
          <div
            className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))',
              border: '1px solid rgba(16,185,129,0.3)',
              boxShadow: '0 0 30px rgba(16,185,129,0.15)',
            }}
          >
            <Brain className="w-5 h-5 text-green-400 animate-pulse" />
            <div className="text-left">
              <p className="text-green-400 font-bold">SmartCart AI saved you money!</p>
              <p className="text-xs text-gray-400 mt-0.5">AI behavioral detection · Price optimization applied</p>
            </div>
            <Sparkles className="w-5 h-5 text-green-400" style={{ animation: 'float 2s ease-in-out infinite' }} />
          </div>
        </div>

        {/* Delivery tracking */}
        <div
          className="rounded-2xl p-7 mb-8"
          style={{
            background: 'rgba(8,16,36,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            opacity: contentVisible ? 1 : 0,
            transition: 'opacity 0.5s ease 0.3s',
          }}
        >
          <h3 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Delivery Status</h3>
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500"
                    style={
                      i === 0
                        ? { background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 24px rgba(16,185,129,0.5)' }
                        : { background: 'rgba(255,255,255,0.06)', color: '#374151' }
                    }
                  >
                    <s.icon className={`w-5 h-5 ${i === 0 ? 'text-white' : 'text-gray-700'}`} />
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap ${i === 0 ? 'text-green-400' : 'text-gray-600'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-3 mb-6 rounded-full" style={{ background: i === 0 ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.06)' }} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 text-center mt-5">Estimated delivery: 3–5 business days</p>
        </div>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          style={{ opacity: contentVisible ? 1 : 0, transition: 'opacity 0.5s ease 0.5s' }}
        >
          <button
            onClick={() => navigate('products')}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:-translate-y-1 group"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', boxShadow: '0 8px 32px rgba(6,182,212,0.3)' }}
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('home')}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
