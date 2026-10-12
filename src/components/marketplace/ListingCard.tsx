import React from 'react';
import { Heart, Repeat, ShoppingBag, Eye, MapPin } from 'lucide-react';
import { ProductListing } from '../../types/index.js';
import { formatINR, calculateSavingsPercent, getConditionBadge, getListingModeBadge } from '../../lib/formatters.js';

interface ListingCardProps {
  listing: ProductListing;
  isLiked?: boolean;
  onToggleLike: (listingId: string) => void;
  onOpenDetails: (listing: ProductListing) => void;
  onProposeExchange?: (listing: ProductListing) => void;
  onAddToCart?: (listingId: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isLiked = false,
  onToggleLike,
  onOpenDetails,
  onProposeExchange,
  onAddToCart
}) => {
  const savings = calculateSavingsPercent(listing.originalPrice, listing.sellingPrice);
  const condition = getConditionBadge(listing.condition);
  const modeBadge = getListingModeBadge(listing.listingMode);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 overflow-hidden flex flex-col transition duration-300 shadow-xs hover:shadow-md">
      {/* Image Area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onOpenDetails(listing)}>
        <img
          src={listing.images[0] || 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${condition.bg} ${condition.text}`}>
            {condition.label}
          </span>

          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${modeBadge.style}`}>
            {modeBadge.icon} {modeBadge.label}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(listing.id);
          }}
          className={`absolute bottom-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition shadow-xs ${
            isLiked
              ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
              : 'bg-white/90 text-slate-700 hover:text-pink-600 hover:bg-white'
          }`}
          title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Size Chip */}
        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/95 text-slate-900 text-[11px] font-bold backdrop-blur-md border border-slate-200 shadow-2xs">
          Size {listing.size}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & City */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-bold text-teal-700 uppercase tracking-wider">{listing.brand}</span>
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
              {listing.city}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetails(listing)}
            className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-teal-700 cursor-pointer line-clamp-1 transition"
          >
            {listing.title}
          </h3>

          {/* Price & Savings */}
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-base sm:text-lg font-extrabold text-slate-950">
              {formatINR(listing.sellingPrice)}
            </span>
            {listing.originalPrice > listing.sellingPrice && (
              <>
                <span className="text-xs text-slate-400 line-through">
                  {formatINR(listing.originalPrice)}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {savings}% OFF
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
          {listing.listingMode !== 'buy_only' && onProposeExchange ? (
            <button
              onClick={() => onProposeExchange(listing)}
              className="w-full py-1.5 px-2 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 text-xs font-bold transition flex items-center justify-center space-x-1"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Swap</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenDetails(listing)}
              className="w-full py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center justify-center space-x-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </button>
          )}

          {listing.listingMode !== 'exchange_only' && onAddToCart ? (
            <button
              onClick={() => onAddToCart(listing.id)}
              className="w-full py-1.5 px-2 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buy</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenDetails(listing)}
              className="w-full py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center justify-center space-x-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
