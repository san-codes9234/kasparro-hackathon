import { Star, ShoppingCart, Zap, AlertTriangle, Crown, TrendingUp, Brain } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { toast } from '../ui/NotificationToast';
import { formatINR } from '../../utils/currency';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { addToCart, items } = useCart();
  const { navigate } = useApp();
  const inCart = items.some(i => i.product.id === product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate AI score based on rating, discount, and stock
  const aiScore = Math.min(98, Math.round((product.rating / 5) * 40 + (discount > 0 ? 20 : 0) + (product.stock > 10 ? 15 : 0) + (product.reviewCount > 100 ? 15 : 0)));
  const isTrending = product.rating >= 4.5 && product.reviewCount > 200;
  const isBestValue = discount >= 20;

  const glowColor = 'rgba(34, 211, 238, 0.24)';

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x, y });
  }, []);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    setButtonPressed(true);
    setTimeout(() => setButtonPressed(false), 200);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
    addToCart(product);
    if (!inCart) {
      toast.show({
        type: 'success',
        title: 'Added to Cart',
        message: `${product.name.split(' ').slice(0, 3).join(' ')} — AI is updating insights`,
        duration: 3000,
      });
    }
  };

  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col overflow-hidden transform-gpu"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      style={{
        borderRadius: 24,
        background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(2,6,23,0.9))',
        backdropFilter: 'blur(24px)',
        border: hovered ? `1px solid ${glowColor}` : '1px solid rgba(255,255,255,0.08)',
        boxShadow: hovered
          ? `0 24px 70px rgba(2,6,23,0.5), 0 0 50px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.08)`
          : '0 8px 32px rgba(2,6,23,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        transform: hovered
          ? `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(-8px) scale(1.02)`
          : 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)',
        transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s ease, border-color 0.4s ease',
        willChange: 'transform',
      }}
    >
      <style>{`
        @keyframes shimmerSweep {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes ringPulse {
          0% { transform: scale(0); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 20px rgba(34,211,238,0.4); }
          50% { box-shadow: 0 0 30px rgba(34,211,238,0.6); }
        }
        @keyframes buttonPress {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Image area */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ height: 220 }}
        onClick={() => navigate('product-detail', product.id)}
      >
        {imageBroken ? (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.28),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] px-6 text-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-300">{product.brand}</p>
              <p className="mt-3 text-lg font-black text-white">{product.name}</p>
            </div>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            style={{
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)',
            }}
            loading="lazy"
            onError={() => setImageBroken(true)}
          />
        )}
        
        {/* Premium gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(to top, rgba(2,6,23,0.95) 0%, rgba(15,23,42,0.8) 40%, transparent 70%)',
            transition: 'opacity 0.4s ease',
          }}
        />

        {/* Animated shimmer on hover */}
        {hovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
              backgroundSize: '200% 100%',
              animation: 'shimmerSweep 2s linear infinite',
            }}
          />
        )}

        {/* AI Score Badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-xl"
          style={{
            background: 'rgba(15,23,42,0.9)',
            border: '1px solid rgba(34,211,238,0.3)',
            boxShadow: hovered ? '0 0 25px rgba(34,211,238,0.3)' : '0 4px 16px rgba(2,6,23,0.4)',
            transition: 'all 0.3s ease',
          }}
        >
          <Brain className="w-3.5 h-3.5 text-cyan-300" style={{ animation: hovered ? 'float 2s ease-in-out infinite' : 'none' }} />
          <span className="text-[10px] font-bold text-cyan-300">AI {aiScore}</span>
        </div>

        {/* Badges */}
        {isTrending && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white backdrop-blur-xl"
            style={{ 
              background: 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))',
              border: '1px solid rgba(16,185,129,0.4)',
              boxShadow: hovered ? '0 0 25px rgba(16,185,129,0.4)' : '0 4px 16px rgba(16,185,129,0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            <TrendingUp className="w-3 h-3" />
            Trending
          </div>
        )}
        {isBestValue && !isTrending && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white backdrop-blur-xl"
            style={{ 
              background: 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(217,119,6,0.9))',
              border: '1px solid rgba(245,158,11,0.4)',
              boxShadow: hovered ? '0 0 25px rgba(245,158,11,0.4)' : '0 4px 16px rgba(245,158,11,0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            <Crown className="w-3 h-3" />
            Best Value
          </div>
        )}
        {discount > 0 && !isTrending && !isBestValue && (
          <div
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white backdrop-blur-xl"
            style={{ 
              background: 'linear-gradient(135deg, rgba(244,63,94,0.95), rgba(225,29,72,0.95))',
              border: '1px solid rgba(244,63,94,0.4)',
              boxShadow: hovered ? '0 0 25px rgba(244,63,94,0.4)' : '0 4px 16px rgba(244,63,94,0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            -{discount}%
          </div>
        )}
        {product.stock <= 3 && (
          <div
            className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium text-white backdrop-blur-xl"
            style={{ 
              background: 'rgba(249,115,22,0.9)',
              border: '1px solid rgba(249,115,22,0.4)',
              boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
            }}
          >
            <AlertTriangle className="w-3 h-3 urgency-pulse" />
            Only {product.stock} left!
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] font-bold text-cyan-300 mb-2 uppercase tracking-[0.2em]">{product.brand}</p>
        <button
          onClick={() => navigate('product-detail', product.id)}
          className="text-sm font-black text-left mb-3 leading-snug line-clamp-2 transition-all duration-300 hover:text-cyan-300"
          style={{ color: '#f1f5f9', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}
        >
          {product.name}
        </button>

        {/* Stars */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5"
                style={{
                  fill: i < Math.floor(product.rating) ? '#fbbf24' : 'transparent',
                  color: i < Math.floor(product.rating) ? '#fbbf24' : '#475569',
                  filter: i < Math.floor(product.rating) ? 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' : 'none',
                }}
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-slate-400">{product.rating} ({product.reviewCount.toLocaleString()})</span>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xl font-black text-white" style={{ textShadow: '0 0 20px rgba(255,255,255,0.15)' }}>{formatINR(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-slate-500 line-through">{formatINR(product.originalPrice)}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold overflow-hidden transition-all duration-300"
            style={{
              background: inCart
                ? 'rgba(16,185,129,0.15)'
                : 'linear-gradient(135deg, rgba(34,211,238,0.95), rgba(59,130,246,0.95), rgba(99,102,241,0.92))',
              color: inCart ? '#34d399' : 'white',
              border: inCart ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(34,211,238,0.4)',
              boxShadow: inCart
                ? '0 4px 16px rgba(16,185,129,0.2)'
                : hovered ? `0 8px 24px rgba(34,211,238,0.4), 0 0 30px ${glowColor}` : '0 4px 16px rgba(34,211,238,0.3)',
              transform: buttonPressed ? 'scale(0.95)' : hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {/* Ripple */}
            {ripple && (
              <span
                key={ripple.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: ripple.x - 24,
                  top: ripple.y - 24,
                  width: 48,
                  height: 48,
                  background: 'rgba(255,255,255,0.4)',
                  animation: 'ringPulse 0.6s ease-out forwards',
                }}
              />
            )}
            {inCart ? (
              <><Zap className="w-4 h-4" /> In Cart</>
            ) : (
              <><ShoppingCart className="w-4 h-4" /> Add</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
