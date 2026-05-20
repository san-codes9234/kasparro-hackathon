import { useState } from 'react';
import { Search, SlidersHorizontal, X, Sparkles, Brain } from 'lucide-react';
import { products } from '../data/products';
import { ProductGrid } from '../components/product/ProductGrid';

const CATEGORIES = ['all', 'laptops', 'monitors', 'audio', 'peripherals', 'streaming', 'accessories'];
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Best Rated' },
];

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');

  let filtered = products
    .filter(p => category === 'all' || p.category === category)
    .filter(p =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some(t => t.includes(search.toLowerCase()))
    );

  if (sort === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sort === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  const panelStyle = {
    background: 'rgba(8,16,36,0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)',
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">AI-Curated Collection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">All Products</h1>
          <p className="text-gray-400 text-sm">
            <span className="text-cyan-400 font-semibold">{filtered.length}</span> products · Verified quality scores · Best price guaranteed
          </p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in delay-100">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, brand, or feature..."
              className="w-full pl-10 pr-4 py-3 text-sm text-white outline-none transition-all duration-300 rounded-xl"
              style={{
                ...panelStyle,
                borderColor: search ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.07)',
                boxShadow: search ? '0 0 0 3px rgba(6,182,212,0.06)' : 'none',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={panelStyle}>
            <SlidersHorizontal className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-transparent text-sm text-white outline-none cursor-pointer appearance-none"
              style={{ minWidth: 150 }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#0a1428' }}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none animate-fade-in delay-150">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-200 hover:-translate-y-0.5"
              style={{
                animationDelay: `${idx * 0.05}s`,
                background: category === cat
                  ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                  : 'rgba(8,16,36,0.7)',
                color: category === cat ? 'white' : '#9ca3af',
                border: category === cat
                  ? '1px solid rgba(6,182,212,0.4)'
                  : '1px solid rgba(255,255,255,0.07)',
                boxShadow: category === cat ? '0 4px 16px rgba(6,182,212,0.25)' : 'none',
              }}
            >
              {cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid or empty state */}
        {filtered.length > 0 ? (
          <ProductGrid products={filtered} />
        ) : (
          <div className="text-center py-24 animate-fade-in">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.12)' }}
            >
              <Brain className="w-10 h-10 text-gray-700" />
            </div>
            <p className="text-gray-300 text-lg font-semibold mb-1">No products found</p>
            <p className="text-gray-600 text-sm mb-6">Try a different search term or category</p>
            <button
              onClick={() => { setSearch(''); setCategory('all'); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#22d3ee' }}
            >
              <Sparkles className="w-4 h-4" />
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
