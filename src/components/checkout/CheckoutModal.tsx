import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Truck,
  Building,
  Lock,
  AlertCircle
} from 'lucide-react';
import { CartItem, ShippingAddress, Order } from '../../types/index.js';
import { formatINR } from '../../lib/formatters.js';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  discount: number;
  couponCode?: string;
  onCompleteOrder: (orderData: {
    listingId: string;
    shippingAddress: ShippingAddress;
    paymentMethod: 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'cod_verified';
    couponCode?: string;
  }) => Promise<Order>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  discount,
  couponCode,
  onCompleteOrder
}) => {
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: 'Aanya Sharma',
    phone: '+91 98201 44520',
    streetAddress: 'Flat 402, Green Glen Layout, Bellandur',
    landmark: 'Near EcoSpace Tech Park',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103'
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'cod_verified'>('razorpay_upi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || cartItems.length === 0) return null;

  const primaryItem = cartItems[0];
  const subtotal = primaryItem.listing.sellingPrice;
  const shippingFee = subtotal >= 2499 ? 0 : 80;
  const platformFee = 29;
  const total = Math.max(0, subtotal + shippingFee + platformFee - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.streetAddress || !address.pincode) {
      setError('Please provide all required shipping details.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onCompleteOrder({
        listingId: primaryItem.listingId,
        shippingAddress: address,
        paymentMethod,
        couponCode
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative my-8 text-slate-900">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
              <Lock className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">Secure Indian Checkout</h2>
              <p className="text-xs text-slate-500">Encrypted Razorpay Gateway • 100% Buyer Protection</p>
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Shipping & Payment (7 cols) */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-teal-600" />
                  <span>1. Doorstep Delivery Address (India)</span>
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-600 block text-[11px] mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={address.fullName}
                        onChange={e => setAddress({ ...address, fullName: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block text-[11px] mb-1">Mobile Phone *</label>
                      <input
                        type="text"
                        required
                        value={address.phone}
                        onChange={e => setAddress({ ...address, phone: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-600 block text-[11px] mb-1">Street Address / Flat / Society *</label>
                    <input
                      type="text"
                      required
                      value={address.streetAddress}
                      onChange={e => setAddress({ ...address, streetAddress: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-slate-600 block text-[11px] mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={address.city}
                        onChange={e => setAddress({ ...address, city: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block text-[11px] mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={address.state}
                        onChange={e => setAddress({ ...address, state: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block text-[11px] mb-1">6-Digit PIN *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={address.pincode}
                        onChange={e => setAddress({ ...address, pincode: e.target.value })}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  <span>2. Payment Option (Razorpay Sandbox)</span>
                </h3>

                <div className="space-y-2">
                  {[
                    {
                      id: 'razorpay_upi',
                      title: 'UPI (GPay / PhonePe / Paytm / QR)',
                      desc: 'Instant zero-fee transaction with instant buyer protection',
                      icon: <QrCode className="w-4 h-4 text-teal-600" />
                    },
                    {
                      id: 'razorpay_card',
                      title: 'Credit / Debit Card (RuPay, Visa, Mastercard)',
                      desc: 'Encrypted tokenized 3D Secure checkout',
                      icon: <CreditCard className="w-4 h-4 text-pink-600" />
                    },
                    {
                      id: 'razorpay_netbanking',
                      title: 'NetBanking (50+ Indian Banks)',
                      desc: 'SBI, HDFC, ICICI, Axis, Kotak, etc.',
                      icon: <Building className="w-4 h-4 text-emerald-600" />
                    },
                    {
                      id: 'cod_verified',
                      title: 'Cash on Delivery (OTP Verified)',
                      desc: 'Pay directly to BlueDart courier agent on arrival',
                      icon: <Truck className="w-4 h-4 text-purple-600" />
                    }
                  ].map(opt => (
                    <label
                      key={opt.id}
                      className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition ${
                        paymentMethod === opt.id
                          ? 'bg-teal-50 border-teal-500 text-slate-900 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === opt.id}
                        onChange={() => setPaymentMethod(opt.id as any)}
                        className="accent-teal-600"
                      />
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                        {opt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-slate-900">{opt.title}</div>
                        <div className="text-[10px] text-slate-500">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Order Summary (5 cols) */}
            <div className="md:col-span-5 space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 h-fit">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Order Review</h3>

              <div className="flex space-x-3 pb-3 border-b border-slate-200">
                <img
                  src={primaryItem.listing.images[0]}
                  alt=""
                  className="w-16 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <span className="text-[10px] text-teal-700 font-bold block">{primaryItem.listing.brand}</span>
                  <h4 className="font-semibold text-slate-900 truncate">{primaryItem.listing.title}</h4>
                  <p className="text-[11px] text-slate-500">Size: {primaryItem.listing.size}</p>
                  <p className="font-bold text-slate-950 mt-1">{formatINR(primaryItem.listing.sellingPrice)}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Piece Price</span>
                  <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatINR(shippingFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sustainability Platform Fee</span>
                  <span>{formatINR(platformFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({couponCode})</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due</span>
                  <span className="text-teal-800 text-base">{formatINR(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2 shadow-md shadow-teal-700/15 active:scale-95 disabled:opacity-50"
              >
                <span>{loading ? 'Processing via Razorpay...' : `Pay ${formatINR(total)} Securely`}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
