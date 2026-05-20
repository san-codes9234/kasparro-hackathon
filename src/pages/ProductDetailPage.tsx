import { useState } from 'react';
import { Star, ShoppingCart, ArrowLeft, Zap, AlertTriangle, ChevronRight, Brain, CheckCircle, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';
import { AIConfidenceMeter } from '../components/ai/AIConfidenceMeter';
import { toast } from '../components/ui/NotificationToast';
import { formatINR } from '../utils/currency';

export function ProductDetailPage() {
  const { selectedProductId, navigate, toggleChat } = useApp();
  const { addToCart, items } = useCart();
  const [imageZoomed, setImageZoomed] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);

  const product = products.find(p => p.id === selectedProductId);
  if (!product) return null;

  const inCart = items.some(i => i.product.id === product.id);
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const simplifiedDesc = () => {
    const tags = product.tags;
    if (tags.includes('gaming')) return 'Built for intense gaming — handles AAA titles, streaming, and heavy multitasking without breaking a sweat.';
    if (tags.includes('business') || tags.includes('portable')) return 'Perfect travel companion — lightweight design with all-day battery that keeps up with your schedule.';
    if (tags.includes('4K') || tags.includes('design')) return 'See your work in true color — cinema-quality visuals give designers and editors the accuracy they need.';
    if (tags.includes('mechanical')) return 'Every keystroke feels satisfying — built for gaming and typing with customizable RGB lighting.';
    if (tags.includes('wireless')) return 'Cut the cord without cutting performance — ultra-precise and lightweight for hours of fatigue-free use.';
    return 'A premium pick with excellent reviews and strong perceived value for this price band.';
  };

  const handleAddToCart = () => {
    addToCart(product);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 800);
    if (!inCart) {
      toast.show({ type: 'success', title: 'Added to Cart!', message: 'AI is updating your cart insights', duration: 3000 });
    }
  };

  const panelStyle = {
    background: 'rgba(8,16,36,0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 20,
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('products')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-200 text-sm mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </button>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Image */}
          <div className="animate-slide-right">
            <div
              className="relative rounded-3xl overflow-hidden cursor-zoom-in"
              style={{
                ...panelStyle,
                aspectRatio: '1',
                transition: 'transform 0.4s ease',
              }}
              onMouseEnter={() => setImageZoomed(true)}
              onMouseLeave={() => setImageZoomed(false)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                style={{
                  transform: imageZoomed ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
              {/* Shimmer on zoom */}
              {imageZoomed && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)', animation: 'shimmerSweep 1.5s ease infinite' }} />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(3,7,18,0.5) 0%, transparent 50%)' }} />

              {discount > 0 && (
                <div
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-sm font-black text-white"
                  style={{ background: '#f43f5e', boxShadow: '0 4px 16px rgba(244,63,94,0.5)' }}
                >
                  -{discount}% OFF
                </div>
              )}
              {product.stock <= 3 && (
                <div
                  className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: 'rgba(249,115,22,0.9)', backdropFilter: 'blur(8px)' }}
                >
                  <AlertTriangle className="w-4 h-4 urgency-pulse" />
                  Only {product.stock} left in stock!
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="animate-slide-left flex flex-col">
            {/* Brand + Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">{product.brand}</span>
              {product.badge && (
                <span
                  className="px-2.5 py-0.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
                >
                  {product.badge}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4" style={{ fill: i < Math.floor(product.rating) ? '#fbbf24' : 'transparent', color: i < Math.floor(product.rating) ? '#fbbf24' : '#374151' }} />
                ))}
              </div>
              <span className="font-bold text-amber-400">{product.rating}</span>
              <span className="text-gray-500 text-sm">({product.reviewCount.toLocaleString()} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6 flex flex-wrap items-baseline gap-3">
              <span className="text-4xl font-black text-white">{formatINR(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-600 line-through">{formatINR(product.originalPrice)}</span>
                  <span className="text-green-400 font-bold text-sm px-2.5 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    Save {formatINR(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* AI Summary */}
            <div
              className="p-4 mb-6"
              style={{ ...panelStyle, borderColor: 'rgba(6,182,212,0.2)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">AI Summary</span>
                </div>
                <AIConfidenceMeter size="sm" showLabel={false} />
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-2">{simplifiedDesc()}</p>
              <button
                onClick={toggleChat}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                Ask AI more questions <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Buttons */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-300"
                style={
                  inCart
                    ? { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }
                    : {
                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                        color: 'white',
                        boxShadow: addedFlash ? '0 0 40px rgba(6,182,212,0.6)' : '0 8px 24px rgba(6,182,212,0.3)',
                        transform: addedFlash ? 'scale(0.97)' : 'scale(1)',
                      }
                }
              >
                {inCart ? <><CheckCircle className="w-5 h-5" /> Added to Cart</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
              </button>
              <button
                onClick={() => { addToCart(product); navigate('checkout'); }}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <Zap className="w-5 h-5 text-cyan-400" />
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              {[
                { icon: Shield, text: 'Secure Payment' },
                { icon: CheckCircle, text: 'AI Verified' },
                { icon: Zap, text: 'Fast Delivery' },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <b.icon className="w-3.5 h-3.5 text-cyan-500/60" />
                  {b.text}
                </div>
              ))}
            </div>

            {/* Specs */}
            <div className="p-4" style={panelStyle}>
              <h3 className="font-bold text-white mb-3 text-xs uppercase tracking-wider text-gray-400">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-xs text-gray-600">{key}</span>
                    <span className="text-xs text-gray-300 font-medium text-right ml-2">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white">Related Products</h2>
              <button onClick={() => navigate('products')} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
