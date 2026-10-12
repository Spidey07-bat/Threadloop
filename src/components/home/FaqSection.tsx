import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does ThreadLoop verify garment quality and condition?',
      a: 'Sellers are required to disclose all defects, wear and tear, and upload clear unedited photos under natural lighting. We enforce a 4-tier condition standard: Brand New with Tags, Like New, Gently Used, and Well Loved. Buyers have 48 hours upon delivery to inspect garments before funds are released to the seller.'
    },
    {
      q: 'How do wardrobe exchanges work without money?',
      a: 'When an item is tagged "Swap Eligible", any user can offer one of their own active closet items in trade. If there is a price mismatch (e.g. a ₹2,000 jacket for a ₹1,500 sweater), the proposer can add a cash difference (e.g. +₹500). Once accepted, both parties dispatch via our tracked courier partners.'
    },
    {
      q: 'Which payment methods are supported across India?',
      a: 'We support all major Indian payment rails via Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay/Visa/Mastercard credit and debit cards, and NetBanking across 50+ Indian banks. Payment details are never stored on ThreadLoop servers.'
    },
    {
      q: 'Who handles shipping and how does doorstep pickup work?',
      a: 'ThreadLoop partners with leading Indian logistics carriers including BlueDart, Delhivery, and Shadowfax. When an order or exchange is confirmed, prepaid shipping labels and automated doorstep pickup are scheduled from the seller’s registered address.'
    },
    {
      q: 'What are the platform fees for sellers?',
      a: 'Listing items is 100% FREE. We only charge a modest 8% platform maintenance and sustainability fee when a garment is successfully sold. For pure wardrobe exchanges, only standard logistics courier costs apply.'
    },
    {
      q: 'What is the return policy for pre-owned clothing?',
      a: 'Because items are pre-owned and individual closet pieces, returns are accepted if the item received has undisclosed defects, incorrect measurements, or does not match the photos. We offer a 48-hour dispute window backed by our Buyer Protection policy.'
    }
  ];

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
          Everything You Need to Know About Resale & Swaps
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition shadow-2xs"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-slate-900 font-semibold text-sm hover:text-teal-700 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                    isOpen ? 'rotate-180 text-teal-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
