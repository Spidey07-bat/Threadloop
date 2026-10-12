import React from 'react';
import { Repeat, ArrowRight, ShieldCheck, TrendingUp, CheckCircle } from 'lucide-react';

interface HeroProps {
  onExplore: () => void;
  onExchanges: () => void;
  onListGarment: () => void;
  stats: {
    activeListings: number;
    totalExchanges: number;
    waterLitresSaved: number;
    co2KgSaved: number;
  };
}

export const Hero: React.FC<HeroProps> = ({
  onExplore,
  onExchanges,
  onListGarment,
  stats
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-14 lg:py-20 bg-gradient-to-b from-white via-slate-50 to-slate-50/50 border-b border-slate-200/80">
      {/* Subtle background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="font-semibold text-teal-700">Wear the trend. Pass it on.</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">Resale & Swap Marketplace for India</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] font-display">
              Give Great Outfits a <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-pink-600 to-emerald-600">
                Second Life & Endless Swaps.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Discover authentic pre-owned streetwear, luxury blazers, ethnic silks, and Y2K staples at up to <strong className="text-slate-900">75% off retail</strong>. Trade wardrobe pieces directly with verified community members across India.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onExplore}
                className="px-6 py-3.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-sm transition flex items-center space-x-2 shadow-md shadow-teal-600/15 active:scale-95"
              >
                <span>Shop Resale Drops</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExchanges}
                className="px-6 py-3.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-bold text-sm transition flex items-center space-x-2 active:scale-95"
              >
                <Repeat className="w-4 h-4 text-pink-600" />
                <span>Wardrobe Swaps</span>
              </button>

              <button
                onClick={onListGarment}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm transition flex items-center space-x-2 shadow-xs active:scale-95"
              >
                <span>Sell Your Wardrobe</span>
              </button>
            </div>

            {/* Trust highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 max-w-lg">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Verified Garment Condition</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-pink-600 flex-shrink-0" />
                <span>Safe Escrow & UPI Payouts</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero Hidden Fees</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showpiece & Live Circular Metrics Card */}
          <div className="lg:col-span-5 space-y-4">
            {/* Featured Product Hero Preview */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl p-2 group">
              <div className="relative h-80 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80"
                  alt="Curated Zara Blazer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#0d9488] text-white shadow-sm">
                    Featured Circular Pick
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-pink-700 border border-pink-200 shadow-sm">
                    Swap Eligible 🔄
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-slate-900 text-sm font-bold">Zara Tailored Oversized Wool Blazer</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-emerald-700 font-extrabold text-base">₹1,890</span>
                      <span className="text-slate-400 text-xs line-through">₹5,990</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                        68% OFF
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onExplore}
                    className="px-3 py-1.5 rounded-lg bg-[#0d9488] text-white text-xs font-bold hover:bg-teal-700 transition"
                  >
                    View Piece
                  </button>
                </div>
              </div>

              {/* Eco Impact Live Widget */}
              <div className="p-4 bg-slate-50 rounded-2xl mt-2 border border-slate-200 grid grid-cols-2 gap-4 text-center">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-xl font-extrabold text-teal-700 font-display">
                    {(stats.waterLitresSaved / 1000).toFixed(1)}k L
                  </div>
                  <div className="text-[11px] text-slate-500">Freshwater Preserved</div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-xl font-extrabold text-emerald-700 font-display">
                    {stats.co2KgSaved} kg
                  </div>
                  <div className="text-[11px] text-slate-500">CO₂ Diverted from Air</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
