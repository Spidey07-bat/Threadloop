import React, { useState } from 'react';
import { X, Repeat, ShieldCheck, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import { ProductListing, User } from '../../types/index.js';
import { formatINR } from '../../lib/formatters.js';

interface ProposeExchangeModalProps {
  targetListing: ProductListing | null;
  userListings: ProductListing[];
  currentUser: User | null;
  onClose: () => void;
  onSubmit: (data: {
    targetListingId: string;
    offeredListingId: string;
    cashDifference: number;
    note: string;
  }) => Promise<void>;
  onOpenCreateListing: () => void;
}

export const ProposeExchangeModal: React.FC<ProposeExchangeModalProps> = ({
  targetListing,
  userListings,
  currentUser,
  onClose,
  onSubmit,
  onOpenCreateListing
}) => {
  const [selectedOfferId, setSelectedOfferId] = useState<string>(userListings[0]?.id || '');
  const [cashDifference, setCashDifference] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!targetListing) return null;

  const offeredListing = userListings.find(l => l.id === selectedOfferId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferId) {
      setError('Please select an item from your closet to offer.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        targetListingId: targetListing.id,
        offeredListingId: selectedOfferId,
        cashDifference: Number(cashDifference) || 0,
        note
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative my-8 text-slate-900">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-pink-50 text-pink-700 border border-pink-200">
              <Repeat className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">Propose Wardrobe Exchange</h2>
              <p className="text-xs text-slate-500">Trade clothing with {targetListing.sellerName} (Zero middleman fee)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Trade Visual Comparison (Wanted vs Offered) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Wanted Item */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[10px] uppercase font-bold text-teal-700 tracking-wider">Item You Want</div>
              <div className="flex space-x-3">
                <img
                  src={targetListing.images[0]}
                  alt={targetListing.title}
                  className="w-16 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs text-slate-900 truncate">{targetListing.title}</div>
                  <div className="text-[11px] text-slate-500">{targetListing.brand} • Size {targetListing.size}</div>
                  <div className="text-xs font-bold text-teal-700 mt-1">{formatINR(targetListing.sellingPrice)}</div>
                </div>
              </div>
            </div>

            {/* Offered Item */}
            <div className="p-3.5 rounded-2xl bg-pink-50/50 border border-pink-200 space-y-2">
              <div className="text-[10px] uppercase font-bold text-pink-700 tracking-wider">Your Item to Offer</div>
              {offeredListing ? (
                <div className="flex space-x-3">
                  <img
                    src={offeredListing.images[0]}
                    alt={offeredListing.title}
                    className="w-16 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-slate-900 truncate">{offeredListing.title}</div>
                    <div className="text-[11px] text-slate-500">{offeredListing.brand} • Size {offeredListing.size}</div>
                    <div className="text-xs font-bold text-pink-700 mt-1">{formatINR(offeredListing.sellingPrice)}</div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  Select an item below
                </div>
              )}
            </div>
          </div>

          {/* Select From Closet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900">Select from your listed closet items:</label>
              <button
                type="button"
                onClick={onOpenCreateListing}
                className="text-xs text-teal-700 font-semibold hover:underline flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ List a new garment</span>
              </button>
            </div>

            {userListings.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs space-y-2">
                <p className="text-slate-600">You don't have any items in your closet yet to offer for trade.</p>
                <button
                  type="button"
                  onClick={onOpenCreateListing}
                  className="px-4 py-2 rounded-xl bg-[#0d9488] text-white font-bold text-xs"
                >
                  List a Garment to Trade
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {userListings.map(listing => (
                  <div
                    key={listing.id}
                    onClick={() => setSelectedOfferId(listing.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center space-x-2.5 ${
                      selectedOfferId === listing.id
                        ? 'bg-pink-50 border-pink-400 text-slate-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <img src={listing.images[0]} alt="" className="w-10 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-xs font-semibold truncate">{listing.title}</div>
                      <div className="text-[10px] text-slate-500">{listing.brand} • {formatINR(listing.sellingPrice)}</div>
                    </div>
                    {selectedOfferId === listing.id && (
                      <CheckCircle2 className="w-4 h-4 text-pink-600 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cash Difference Balancer */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 block">Cash Balancing Amount (Optional)</label>
                <span className="text-[11px] text-slate-500">Offer extra INR if your garment has lower estimated value.</span>
              </div>
              <div className="w-32">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={cashDifference}
                    onChange={e => setCashDifference(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Note to Seller */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">Note to {targetListing.sellerName}:</label>
            <textarea
              rows={3}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Hi! Loved your jacket. Offering my ribbed knit dress which is barely worn. Let me know if you want to trade!"
              className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600"
            />
          </div>

          {/* Trust notice */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-600 bg-teal-50/60 p-3 rounded-xl border border-teal-200">
            <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>Both items are held in reservation once accepted. BlueDart / Delhivery tracked shipping applies.</span>
          </div>

          {/* Submit button */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedOfferId}
              className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition flex items-center space-x-2 disabled:opacity-50 shadow-sm"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting...' : 'Send Swap Proposal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
