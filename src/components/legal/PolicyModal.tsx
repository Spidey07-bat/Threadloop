import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface PolicyModalProps {
  policyType: string | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policyType, onClose }) => {
  if (!policyType) return null;

  const contentMap: Record<string, { title: string; subtitle: string; body: React.ReactNode }> = {
    exchange: {
      title: 'ThreadLoop Safe Wardrobe Swap Protocol',
      subtitle: 'Guidelines & Safeguards for Peer-to-Peer Clothing Trades',
      body: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800">
            <strong>Draft Policy Notice:</strong> This operating protocol governs all wardrobe exchange transactions on the ThreadLoop marketplace.
          </div>
          <h4 className="font-bold text-slate-900 text-sm">1. Eligibility & Garment Condition</h4>
          <p>
            Only clean, freshly washed garments with disclosed wear and accurately photographed details are permitted for exchange proposals. Items with undisclosed holes, stains, or counterfeit designer labels are strictly prohibited.
          </p>
          <h4 className="font-bold text-slate-900 text-sm">2. Proposal & Dual-Way Courier Tracking</h4>
          <p>
            When a wardrobe exchange proposal is mutually accepted, both participants receive automated logistics pickup notifications. Both parties must hand over their package to the registered courier agent (BlueDart / Delhivery) within 48 hours.
          </p>
          <h4 className="font-bold text-slate-900 text-sm">3. Inspection & 48-Hour Resolution Window</h4>
          <p>
            Upon delivery, both swappers have 48 hours to inspect the garment. If condition matches the agreed disclosures, the swap is marked Completed and both parties receive Circular Trust badges.
          </p>
        </div>
      )
    },
    quality: {
      title: 'Garment Quality & Authenticity Standards',
      subtitle: 'Circular Fashion Quality Verification Framework',
      body: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <h4 className="font-bold text-slate-900 text-sm">4-Tier Condition Standard:</h4>
          <ul className="space-y-2 list-disc pl-5">
            <li><strong>Brand New with Tags:</strong> Unworn garment with original tags still attached.</li>
            <li><strong>Like New:</strong> Worn once or twice with zero detectable signs of wear.</li>
            <li><strong>Gently Used:</strong> Minor natural wear consistent with gentle usage; zero tears or permanent stains.</li>
            <li><strong>Well Loved:</strong> Characteristic vintage wear or minor flaws clearly itemized in the listing description.</li>
          </ul>
          <h4 className="font-bold text-slate-900 text-sm">Hygiene & Cleanliness Obligation</h4>
          <p>
            All garments must be professionally laundered or hand-washed prior to dispatch. ThreadLoop reserves the right to suspend seller privileges if unclean garments are dispatched.
          </p>
        </div>
      )
    },
    grievance: {
      title: 'Grievance Redressal Mechanism (India)',
      subtitle: 'In Compliance with the Consumer Protection (E-Commerce) Rules, 2020',
      body: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <p>
            In accordance with the Consumer Protection (E-Commerce) Rules, 2020 and Information Technology (Intermediary Guidelines) Rules, ThreadLoop has appointed a designated Grievance Officer:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900">Grievance Officer: Aditi Rao</div>
            <div className="text-slate-600">Designation: Trust & Safety Grievance Officer</div>
            <div className="text-slate-600">Entity: ThreadLoop Circular Technologies Pvt. Ltd.</div>
            <div className="text-slate-600">Address: Level 4, Green Glen Hub, Bellandur, Bengaluru, Karnataka - 560103</div>
            <div className="text-teal-700 font-mono">Email: grievance@threadloop.in</div>
          </div>
          <p>
            Any customer grievance submitted will be acknowledged within 48 hours and redressed within one month of receipt.
          </p>
        </div>
      )
    },
    returns: {
      title: 'Returns & Refund Policy',
      subtitle: 'Circular Resale Consumer Protections',
      body: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <p>
            Because ThreadLoop provides a marketplace for individual closet owners to circularize pre-owned clothing, conventional retail returns do not apply. However:
          </p>
          <h4 className="font-bold text-slate-900 text-sm">Valid Grounds for Dispute:</h4>
          <ul className="space-y-1 list-disc pl-5">
            <li>Garment received has undisclosed holes, tears, or structural damage.</li>
            <li>Garment is significantly different in measurements or color from the photos.</li>
            <li>Item is confirmed to be non-genuine or counterfeit.</li>
          </ul>
          <p>
            Disputes must be raised with unboxing photos within 48 hours of doorstep delivery. Verified refunds are credited to the original payment source (UPI/Bank) within 3-5 business days.
          </p>
        </div>
      )
    },
    terms: {
      title: 'Terms of Marketplace Service',
      subtitle: 'Draft Legal Terms of Use',
      body: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <p>
            By accessing or transacting on ThreadLoop, you agree to abide by our circular community principles, respectful communication standards, and honest garment condition disclosures.
          </p>
          <h4 className="font-bold text-slate-900 text-sm">Prohibited Items:</h4>
          <p>
            Counterfeit luxury merchandise, undergarments without hygienic seals, stolen goods, and hazardous materials are strictly banned.
          </p>
        </div>
      )
    },
    pricing: {
      title: 'Zero Listing Fees & Seller Economics',
      subtitle: 'How ThreadLoop Empowers Circular Sellers',
      body: (
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span>Listing an Item</span>
              <strong className="text-emerald-700">₹0 (100% FREE)</strong>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span>Marketplace Platform Commission</span>
              <strong className="text-slate-900">8% on completed sales</strong>
            </div>
            <div className="flex justify-between">
              <span>Wardrobe Exchange Commission</span>
              <strong className="text-teal-700">₹0 (Standard courier applies)</strong>
            </div>
          </div>
          <p>
            Net earnings are automatically credited to your UPI VPA within 48 hours of successful customer delivery inspection.
          </p>
        </div>
      )
    }
  };

  const current = contentMap[policyType] || contentMap.exchange;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative my-8 text-slate-900">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">{current.title}</h2>
              <p className="text-xs text-slate-500">{current.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {current.body}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0d9488] text-white font-bold text-xs hover:bg-teal-700"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
