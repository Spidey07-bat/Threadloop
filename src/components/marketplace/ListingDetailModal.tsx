import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Repeat,
  ShoppingBag,
  ShieldCheck,
  MapPin,
  Star,
  AlertTriangle,
  Share2,
  Eye
} from 'lucide-react';
import { ProductListing, Review } from '../../types/index.js';
import {
  formatINR,
  calculateSavingsPercent,
  getConditionBadge,
  getListingModeBadge
} from '../../lib/formatters.js';
import { api } from '../../lib/api.js';

interface ListingDetailModalProps {
  listing: ProductListing | null;
  onClose: () => void;
  isLiked?: boolean;
  onToggleLike: (listingId: string) => void;
  onAddToCart?: (listingId: string) => void;
  onProposeExchange?: (listing: ProductListing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  isLiked = false,
  onToggleLike,
  onAddToCart,
  onProposeExchange
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reported, setReported] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (listing) {
      setActiveImageIdx(0);
      setReported(false);
      api.getReviews(listing.sellerId)
        .then(setReviews)
        .catch(console.error);
    }
  }, [listing]);

  if (!listing) return null;

  const savings = calculateSavingsPercent(listing.originalPrice, listing.sellingPrice);
  const condition = getConditionBadge(listing.condition);
  const modeBadge = getListingModeBadge(listing.listingMode);

  const handleShare = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
      }
    } catch {
      // ignore
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative my-8 max-h-[90vh] flex flex-col text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1 p-5 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={listing.images[activeImageIdx] || listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${condition.bg} ${condition.text}`}>
                    {condition.label}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${modeBadge.style}`}>
                    {modeBadge.icon} {modeBadge.label}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex gap-2">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                        activeImageIdx === idx ? 'border-teal-600 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Garment Verification Certificate Card */}
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-slate-700 space-y-1.5">
                <div className="flex items-center text-teal-800 font-bold space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>ThreadLoop Circular Quality Pledge</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Defects, fabric material, and exact measurements have been declared by the seller. Backed by 48-hour return inspection upon delivery.
                </p>
              </div>
            </div>

            {/* Right: Info & Actions */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-bold text-teal-700 uppercase tracking-wider">{listing.brand}</span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center text-slate-500">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      {listing.views} views
                    </span>
                    <button onClick={handleShare} className="text-slate-500 hover:text-slate-900 flex items-center space-x-1">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedLink ? 'Copied!' : 'Share'}</span>
                    </button>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                  {listing.title}
                </h1>

                {/* Price Display */}
                <div className="mt-3 flex items-baseline space-x-3">
                  <span className="text-3xl font-extrabold text-slate-950">
                    {formatINR(listing.sellingPrice)}
                  </span>
                  {listing.originalPrice > listing.sellingPrice && (
                    <>
                      <span className="text-sm text-slate-400 line-through">
                        Orig: {formatINR(listing.originalPrice)}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Save {savings}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Size</span>
                  <strong className="text-slate-900 font-semibold">{listing.size}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Category</span>
                  <strong className="text-slate-900 font-semibold">{listing.category}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Color</span>
                  <strong className="text-slate-900 font-semibold">{listing.color}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Material</span>
                  <strong className="text-slate-900 font-semibold">{listing.material || 'Cotton blend'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Location</span>
                  <strong className="text-slate-900 font-semibold">{listing.city}, {listing.state}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Returns</span>
                  <strong className="text-emerald-700 font-semibold">{listing.acceptsReturns ? '48h Window' : 'Final Sale'}</strong>
                </div>
              </div>

              {/* Disclosed Flaws / Defects */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                <span className="font-semibold text-amber-900 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Condition & Wear Disclosures:</span>
                </span>
                <p className="text-amber-950 text-xs leading-relaxed">
                  {listing.defectsDisclosed || 'No defects or damages. In pristine maintained condition.'}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  About this garment
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Seller Trust Profile */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={listing.sellerAvatar}
                    alt={listing.sellerName}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-teal-500/20"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-bold text-slate-900">{listing.sellerName}</span>
                      <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-200 px-1.5 py-0.5 rounded font-semibold">
                        Verified Seller
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                      <span className="flex items-center text-amber-600 font-semibold">
                        <Star className="w-3 h-3 fill-current mr-0.5" />
                        {listing.sellerRating} ({reviews.length} reviews)
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-0.5" />
                        {listing.sellerCity}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setReported(true)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 transition"
                >
                  {reported ? 'Reported ✓' : 'Report'}
                </button>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {listing.listingMode !== 'buy_only' && onProposeExchange && (
                    <button
                      onClick={() => {
                        onClose();
                        onProposeExchange(listing);
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-xs active:scale-95"
                    >
                      <Repeat className="w-4 h-4 text-pink-600" />
                      <span>Propose Wardrobe Swap</span>
                    </button>
                  )}

                  {listing.listingMode !== 'exchange_only' && onAddToCart && (
                    <button
                      onClick={() => {
                        onAddToCart(listing.id);
                        onClose();
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-md shadow-teal-700/15 active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart ({formatINR(listing.sellingPrice)})</span>
                    </button>
                  )}
                </div>

                {/* Wishlist toggle secondary button */}
                <button
                  onClick={() => onToggleLike(listing.id)}
                  className={`w-full py-2.5 rounded-xl border text-xs font-semibold transition flex items-center justify-center space-x-2 ${
                    isLiked
                      ? 'border-pink-300 text-pink-700 bg-pink-50'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? 'Saved to Wishlist' : 'Save for Later'}</span>
                </button>
              </div>

              {/* Reviews Section */}
              {reviews.length > 0 && (
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Seller Feedback ({reviews.length})
                  </h4>
                  <div className="space-y-2">
                    {reviews.slice(0, 2).map(r => (
                      <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between text-slate-500 mb-1">
                          <span className="font-semibold text-slate-900">{r.reviewerName}</span>
                          <span className="flex items-center text-amber-500">
                            {'★'.repeat(r.rating)}
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px]">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
