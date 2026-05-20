import { ShoppingCart, Zap, Menu, X, Brain } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/currency';

export function Header() {
  const { itemCount, total } = useCart();
  const { navigate, currentPage } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const prevCountRef = useRef(itemCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cart bump animation on item add
  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setCartBump(true);
      window.setTimeout(() => setCartBump(false), 600);
    }
    prevCountRef.current = itemCount;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemCount]);

  const navLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Products', page: 'products' as const },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? 'rgba(3,7,18,0.9)'
          : 'rgba(3,7,18,0.7)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: scrolled
          ? '1px solid rgba(6,182,212,0.15)'
          : '1px solid rgba(255,255,255,0.06)',
        boxShadow: scrolled
          ? '0 4px 32px rgba(0,0,0,0.4), 0 0 1px rgba(6,182,212,0.2)'
          : 'none',
      }}
    >
      {/* Top shimmer line */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.4), rgba(139,92,246,0.3), transparent)',
        opacity: scrolled ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }} />

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <button onClick={() => navigate('home')} className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              boxShadow: '0 4px 16px rgba(6,182,212,0.4)',
            }}
          >
            <Zap className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-black text-white tracking-tight">
              Smart<span className="text-cyan-400">Cart</span>
              <span className="text-xs font-semibold text-cyan-400/60 ml-1 align-middle">AI</span>
            </span>
          </div>

          {/* AI active pill */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full ml-1"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <Brain className="w-2.5 h-2.5 text-green-400" />
            <span className="text-[10px] font-semibold text-green-400">AI Active</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
        </button>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <button
              key={link.page}
              onClick={() => navigate(link.page)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: currentPage === link.page ? 'rgba(6,182,212,0.12)' : 'transparent',
                color: currentPage === link.page ? '#22d3ee' : '#9ca3af',
                border: currentPage === link.page ? '1px solid rgba(6,182,212,0.2)' : '1px solid transparent',
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart button */}
          <button
            onClick={() => navigate('checkout')}
            className="relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white transition-all duration-300 sm:px-4"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              boxShadow: '0 4px 16px rgba(6,182,212,0.3)',
              transform: cartBump ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <ShoppingCart
              className="w-4 h-4"
              style={{ transform: cartBump ? 'rotate(-10deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }}
            />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white"
                style={{
                  background: '#f43f5e',
                  boxShadow: '0 0 8px rgba(244,63,94,0.6)',
                  animation: cartBump ? 'bounceOnce 0.6s ease both' : undefined,
                }}
              >
                {itemCount}
              </span>
            )}
            {total > 0 && (
              <span className="hidden font-bold text-cyan-100 sm:inline">{formatINR(total, { compact: true })}</span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="space-y-1 border-t px-4 py-3 animate-slide-down md:hidden"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(3,7,18,0.95)' }}
        >
          {navLinks.map(link => (
            <button
              key={link.page}
              onClick={() => { navigate(link.page); setMobileOpen(false); }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={{
                color: currentPage === link.page ? '#22d3ee' : '#9ca3af',
                background: currentPage === link.page ? 'rgba(6,182,212,0.1)' : 'transparent',
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
