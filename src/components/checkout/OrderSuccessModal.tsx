import React from 'react';
import { CheckCircle2, Truck, Leaf } from 'lucide-react';
import { Order } from '../../types/index.js';
import { formatINR } from '../../lib/formatters.js';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewOrders
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative my-8 text-center p-6 sm:p-8 space-y-6 text-slate-900">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Payment Verified</span>
          <h2 className="text-2xl font-bold text-slate-900 font-display">Order Confirmed!</h2>
          <p className="text-xs text-slate-500">Order Reference: <strong className="text-slate-900 font-mono">{order.orderNumber}</strong></p>
        </div>

        {/* Order Card Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left flex space-x-3.5 items-center">
          <img src={order.listingImage} alt="" className="w-16 h-20 rounded-xl object-cover" />
          <div className="flex-1 min-w-0 text-xs">
            <h4 className="font-bold text-slate-900 truncate">{order.listingTitle}</h4>
            <p className="text-[11px] text-slate-500">Seller: {order.sellerName}</p>
            <p className="text-xs font-bold text-teal-800 mt-1">Paid: {formatINR(order.totalAmount)}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Shipping to: {order.shippingAddress.city}, {order.shippingAddress.pincode}</p>
          </div>
        </div>

        {/* Eco Badge */}
        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-slate-700 flex items-center space-x-3 text-left">
          <Leaf className="w-6 h-6 text-teal-600 flex-shrink-0" />
          <div>
            <div className="font-bold text-teal-900">You Kept Fashion in the Loop!</div>
            <div className="text-[11px] text-slate-600">Saved ~2,700 liters of water & 3.6 kg CO₂ by choosing pre-owned instead of fast fashion.</div>
          </div>
        </div>

        {/* Stepper Preview */}
        <div className="pt-2 border-t border-slate-100 text-left text-xs space-y-2">
          <div className="text-slate-500 font-semibold">Delivery Timeline:</div>
          <div className="flex items-center space-x-2 text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Order Placed & Seller Notified</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-500">
            <Truck className="w-4 h-4" />
            <span>BlueDart / Delhivery Doorstep Pickup (Within 24-48 hrs)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onViewOrders();
            }}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
          >
            Track in My Orders
          </button>
          <button
            onClick={onClose}
            className="py-3 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs transition shadow-sm"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
