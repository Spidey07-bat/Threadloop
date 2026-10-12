import React, { useState } from 'react';
import { Repeat, Mail, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onOpenPolicy: (policyName: string) => void;
  onOpenCreateListing: () => void;
  onSelectCategory: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPolicy,
  onOpenCreateListing,
  onSelectCategory
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600 text-xs mt-20">
      {/* Newsletter & Promo Strip */}
      <div className="border-b border-slate-200 bg-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200 mb-3">
              🎁 Instant Welcome Voucher
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display">
              Join the Circular Fashion Loop
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-md">
              Subscribe to weekly curated drop alerts & receive coupon code <strong className="text-teal-700">CIRCULAR50</strong> for flat ₹50 OFF on your first pre-loved order.
            </p>
          </div>

          <div>
            {subscribed ? (
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <span>You're in! Use coupon code <strong className="text-emerald-900">CIRCULAR50</strong> at checkout for ₹50 off.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs transition flex items-center justify-center space-x-1 shadow-sm"
                >
                  <span>Claim ₹50 Voucher</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
            <p className="text-[11px] text-slate-500 mt-2">
              We respect your privacy. Zero spam. Unsubscribe anytime with 1-click.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="col-span-2 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-pink-500 p-0.5 shadow-2xs">
              <div className="w-full h-full bg-slate-900 rounded-[6px] flex items-center justify-center">
                <Repeat className="w-4 h-4 text-teal-400" />
              </div>
            </div>
            <span className="text-lg font-bold text-slate-900 font-display">
              Thread<span className="text-teal-700">Loop</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
            ThreadLoop is India's dedicated circular fashion resale & wardrobe exchange marketplace. We make sustainable style accessible, reduce landfill waste, and let you swap clothes safely.
          </p>

          <div className="space-y-1 text-slate-600 pt-2">
            <div className="flex items-center space-x-2 text-xs">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Bengaluru Innovation Hub & Mumbai Logistics Hub</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>support@threadloop.in | grievance@threadloop.in</span>
            </div>
          </div>
        </div>

        {/* Explore Categories */}
        <div>
          <h4 className="text-slate-900 font-bold mb-3 tracking-wider uppercase text-[11px]">Shop Categories</h4>
          <ul className="space-y-2">
            {['Women', 'Men', 'Footwear', 'Bags & Totes', 'Vintage & Y2K', 'Unisex'].map(c => (
              <li key={c}>
                <button
                  onClick={() => onSelectCategory(c)}
                  className="hover:text-teal-700 transition text-left"
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Circular Hub */}
        <div>
          <h4 className="text-slate-900 font-bold mb-3 tracking-wider uppercase text-[11px]">Circular Hub</h4>
          <ul className="space-y-2">
            <li>
              <button onClick={onOpenCreateListing} className="hover:text-teal-700 transition">
                List Pre-Loved Clothes
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('exchange')} className="hover:text-teal-700 transition">
                Safe Wardrobe Swap Protocol
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('quality')} className="hover:text-teal-700 transition">
                Quality & Authenticity Checks
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('pricing')} className="hover:text-teal-700 transition">
                Zero Listing Fees & Payouts
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Compliance (India) */}
        <div>
          <h4 className="text-slate-900 font-bold mb-3 tracking-wider uppercase text-[11px]">Trust & Legal (India)</h4>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onOpenPolicy('grievance')} className="hover:text-teal-700 transition">
                Grievance Officer (India)
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('returns')} className="hover:text-teal-700 transition">
                Returns & Refund Policy
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('terms')} className="hover:text-teal-700 transition">
                Terms of Marketplace
              </button>
            </li>
            <li>
              <button onClick={() => onOpenPolicy('privacy')} className="hover:text-teal-700 transition">
                Privacy & Data Retention
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Payment Badges & Copyright */}
      <div className="border-t border-slate-200 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} ThreadLoop Circular Technologies Private Limited. All Rights Reserved.
        </div>
        <div className="flex items-center space-x-3 text-slate-600">
          <span>Supported Payments:</span>
          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700 shadow-2xs">UPI / QR</span>
          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700 shadow-2xs">RuPay</span>
          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700 shadow-2xs">Visa / Mastercard</span>
          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700 shadow-2xs">NetBanking</span>
        </div>
      </div>
    </footer>
  );
};
