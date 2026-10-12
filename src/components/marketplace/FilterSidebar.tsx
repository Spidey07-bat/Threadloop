import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { ClothingCategory } from '../../types/index.js';

interface FilterSidebarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedCondition: string;
  onSelectCondition: (cond: string) => void;
  selectedMode: string;
  onSelectMode: (mode: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  sortBy: string;
  onSelectSort: (sort: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onResetFilters: () => void;
}

const CATEGORIES: (ClothingCategory | 'All')[] = [
  'All',
  'Women',
  'Men',
  'Unisex',
  'Footwear',
  'Bags & Totes',
  'Vintage & Y2K',
  'Accessories'
];

const CONDITIONS = [
  'All',
  'Brand New with Tags',
  'Like New (Worn Once)',
  'Gently Used (Excellent)',
  'Well Loved (Good)'
];

const CITIES = ['All', 'Bengaluru', 'Mumbai', 'New Delhi', 'Pune', 'Hyderabad', 'Kolkata'];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedCondition,
  onSelectCondition,
  selectedMode,
  onSelectMode,
  selectedCity,
  onSelectCity,
  sortBy,
  onSelectSort,
  priceRange,
  onPriceRangeChange,
  onResetFilters
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-6 text-xs text-slate-700 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>Filter & Refine</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 text-[11px] transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-slate-900 font-semibold mb-2">Sort Results</label>
        <select
          value={sortBy}
          onChange={e => onSelectSort(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Listing Mode (Buy vs Swap) */}
      <div>
        <label className="block text-slate-900 font-semibold mb-2">Transaction Type</label>
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {[
            { id: 'all', label: 'All' },
            { id: 'swap', label: '🔄 Swap' },
            { id: 'buy', label: '🛍️ Buy' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`py-1.5 rounded-lg text-center font-medium transition ${
                selectedMode === m.id
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-slate-900 font-semibold mb-2">Category</label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                selectedCategory === cat
                  ? 'bg-teal-50 text-teal-800 border border-teal-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-slate-900 font-semibold mb-2">Garment Condition</label>
        <div className="space-y-1.5">
          {CONDITIONS.map(cond => (
            <button
              key={cond}
              onClick={() => onSelectCondition(cond)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition flex items-center justify-between ${
                selectedCondition === cond
                  ? 'bg-pink-50 text-pink-700 font-semibold border border-pink-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{cond}</span>
              {selectedCondition === cond && <span className="text-pink-600 font-bold">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Max Price Filter */}
      <div>
        <div className="flex items-center justify-between text-slate-900 font-semibold mb-2">
          <span>Max Price</span>
          <span className="text-teal-700 font-bold">₹{priceRange[1]}</span>
        </div>
        <input
          type="range"
          min="500"
          max="10000"
          step="250"
          value={priceRange[1]}
          onChange={e => onPriceRangeChange([priceRange[0], parseInt(e.target.value, 10)])}
          className="w-full accent-teal-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>₹500</span>
          <span>₹5,000</span>
          <span>₹10,000</span>
        </div>
      </div>

      {/* City Location */}
      <div>
        <label className="block text-slate-900 font-semibold mb-2">Metro / Location</label>
        <select
          value={selectedCity}
          onChange={e => onSelectCity(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white"
        >
          {CITIES.map(c => (
            <option key={c} value={c}>
              {c === 'All' ? 'All Indian Metros' : c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
