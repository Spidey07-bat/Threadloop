import React, { useState } from 'react';
import { Repeat, ArrowRight } from 'lucide-react';
import { ExchangeProposal, User } from '../../types/index.js';
import { formatINR, formatDate } from '../../lib/formatters.js';

interface ExchangeListViewProps {
  exchanges: ExchangeProposal[];
  currentUser: User | null;
  onSelectExchange: (exchange: ExchangeProposal) => void;
  onExploreListings: () => void;
  onOpenCreateListing: () => void;
}

export const ExchangeListView: React.FC<ExchangeListViewProps> = ({
  exchanges,
  currentUser,
  onSelectExchange,
  onExploreListings,
  onOpenCreateListing
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'my'>('all');

  const filtered = filterTab === 'my' && currentUser
    ? exchanges.filter(e => e.proposerId === currentUser.id || e.ownerId === currentUser.id)
    : exchanges;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-teal-50 border border-slate-200 rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700 border border-pink-200">
            <Repeat className="w-3.5 h-3.5" />
            <span>ThreadLoop Direct Swaps</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Circular Wardrobe Exchanges
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Trade items directly without spending money. Offer pieces from your closet for pieces you love, verified and shipped doorstep-to-doorstep.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onExploreListings}
              className="px-5 py-2.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
            >
              <span>Browse Swap-Eligible Items</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenCreateListing}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold transition shadow-xs"
            >
              List an Item to Swap
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterTab === 'all'
                ? 'bg-teal-50 text-teal-800 border border-teal-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Community Swaps ({exchanges.length})
          </button>
          <button
            onClick={() => setFilterTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              filterTab === 'my'
                ? 'bg-pink-50 text-pink-700 border border-pink-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Proposals & Offers
          </button>
        </div>
      </div>

      {/* Grid of Proposals */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <Repeat className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-slate-900 font-bold text-sm">No Wardrobe Swaps Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You don't have active exchange proposals in this view. Browse listings tagged "Swap Eligible" to propose a trade.
          </p>
          <button
            onClick={onExploreListings}
            className="px-5 py-2.5 bg-[#0d9488] text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Explore Swap Pieces
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(ex => (
            <div
              key={ex.id}
              onClick={() => onSelectExchange(ex)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition space-y-4 shadow-xs hover:shadow-md group"
            >
              {/* Header status */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">Swap #{ex.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{formatDate(ex.createdAt)}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize bg-teal-50 text-teal-800 border border-teal-200">
                  {ex.status.replace('_', ' ')}
                </span>
              </div>

              {/* Items Comparison Preview */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex space-x-2.5">
                  <img
                    src={ex.targetListing.images[0]}
                    alt=""
                    className="w-12 h-14 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-teal-700 font-bold block truncate">Target</span>
                    <h4 className="text-xs font-semibold text-slate-900 truncate">{ex.targetListing.title}</h4>
                    <p className="text-[10px] text-slate-500">{formatINR(ex.targetListing.sellingPrice)}</p>
                  </div>
                </div>

                <div className="flex space-x-2.5 border-l border-slate-200 pl-3">
                  <img
                    src={ex.offeredListing.images[0]}
                    alt=""
                    className="w-12 h-14 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-pink-700 font-bold block truncate">Offered</span>
                    <h4 className="text-xs font-semibold text-slate-900 truncate">{ex.offeredListing.title}</h4>
                    <p className="text-[10px] text-slate-500">{formatINR(ex.offeredListing.sellingPrice)}</p>
                  </div>
                </div>
              </div>

              {/* Footer preview */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="text-slate-600 flex items-center space-x-2">
                  <span>Parties: <strong>{ex.proposerName}</strong> ↔ <strong>{ex.ownerName}</strong></span>
                </div>
                <span className="text-teal-700 font-semibold text-xs group-hover:translate-x-0.5 transition flex items-center">
                  <span>Manage Swap</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
