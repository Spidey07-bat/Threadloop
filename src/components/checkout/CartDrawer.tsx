import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../../types/index.js';
import { formatINR } from '../../lib/formatters.js';
import { api } from '../../lib/api.js';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (listingId: string) => void;
  onProceedToCheckout: (couponDiscount: number, appliedCouponCode?: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onProceedToCheckout
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; description: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.listing.sellingPrice, 0);
  const shippingFee = subtotal >= 2499 || subtotal === 0 ? 0 : 80;
  const platformFee = subtotal > 0 ? 29 : 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal + shippingFee + platformFee - discount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setLoadingCoupon(true);
      setCouponError(null);
      const res = await api.validateCoupon(couponCode, subtotal);
      if (res.valid) {
        setAppliedCoupon(res);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
    } finally {
      setLoadingCoupon(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900 font-display">Your Shopping Bag</h2>
            <span className="text-xs text-slate-500">({cartItems.length} items)</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-slate-900 font-bold text-sm">Your bag is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore thousands of pre-loved items ready for a new wardrobe life.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#0d9488] text-white text-xs font-bold"
              >
                Browse Marketplace
              </button>
            </div>
          ) : (
            cartItems.map(item => (
              <div
                key={item.listingId}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex space-x-3.5 items-center justify-between"
              >
                <img
                  src={item.listing.images[0]}
                  alt={item.listing.title}
                  className="w-16 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">{item.listing.brand}</span>
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{item.listing.title}</h4>
                  <div className="text-[11px] text-slate-500">Size: {item.listing.size} • {item.listing.city}</div>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    {formatINR(item.listing.sellingPrice)}
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(item.listingId)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition"
                  title="Remove from bag"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4 text-xs">
            {/* Coupon input */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span><strong>{appliedCoupon.code}</strong> applied (-{formatINR(appliedCoupon.discount)})</span>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} className="text-xs text-slate-500 hover:text-slate-800">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Coupon code (e.g. CIRCULAR50)"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingCoupon}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}
            </div>

            {/* Price breakdown */}
            <div className="space-y-1.5 text-slate-600 border-t border-slate-200 pt-3">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Doorstep Delivery (BlueDart / Delhivery)</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatINR(shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  <span>Circular Platform & Eco Fee</span>
                  <span className="ml-1 text-[10px] text-slate-400">(Zero Waste)</span>
                </span>
                <span>{formatINR(platformFee)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Final Total (Incl. GST)</span>
                <span className="text-lg text-teal-800">{formatINR(total)}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => {
                onProceedToCheckout(discount, appliedCoupon?.code);
                onClose();
              }}
              className="w-full py-3.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-sm transition flex items-center justify-center space-x-2 shadow-md shadow-teal-700/15 active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
