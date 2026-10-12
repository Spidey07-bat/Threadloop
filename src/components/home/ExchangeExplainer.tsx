import React from 'react';
import { Repeat, ShieldCheck, Truck, Scale, Sparkles, ArrowRight } from 'lucide-react';

interface ExchangeExplainerProps {
  onStartSwap: () => void;
  onListGarment: () => void;
}

export const ExchangeExplainer: React.FC<ExchangeExplainerProps> = ({
  onStartSwap,
  onListGarment
}) => {
  const steps = [
    {
      num: '01',
      title: 'Find Swap-Eligible Pieces',
      desc: 'Browse items tagged "Swap Only" or "Buy & Swap". Filter by style, brand, or location.',
      icon: <Sparkles className="w-5 h-5 text-teal-600" />,
      color: 'bg-teal-50/60 border-teal-100'
    },
    {
      num: '02',
      title: 'Offer an Item from Your Closet',
      desc: 'Pick one of your active listings to exchange. Add an optional cash balancer (e.g. +₹200) if retail prices differ.',
      icon: <Scale className="w-5 h-5 text-pink-600" />,
      color: 'bg-pink-50/60 border-pink-100'
    },
    {
      num: '03',
      title: 'Review & Accept Proposal',
      desc: 'The seller reviews your garment condition and photos. They can accept, decline, or propose a counteroffer.',
      icon: <Repeat className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50/60 border-emerald-100'
    },
    {
      num: '04',
      title: 'Tracked Doorstep Dispatch',
      desc: 'Both swappers get shipping labels (BlueDart / Delhivery). Track dispatch until both packages safely arrive.',
      icon: <Truck className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50/60 border-purple-100'
    }
  ];

  return (
    <div className="py-16 bg-slate-50/80 border-y border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200 mb-3">
            <Repeat className="w-3.5 h-3.5 text-pink-600" />
            <span>Circular Economy in Action</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            How Wardrobe Exchanges Work on ThreadLoop
          </h2>
          <p className="text-slate-600 text-sm mt-3">
            Swap clothes you’ve already worn for fresh styles you’ll love. No need to spend money on fast fashion when you can trade gently used treasures.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(step => (
            <div
              key={step.num}
              className={`p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition relative flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl border ${step.color}`}>
                    {step.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-200 font-display">{step.num}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action card */}
        <div className="mt-12 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-base">Protected Circular Swapping</h4>
              <p className="text-xs text-slate-600">
                Disputes, non-delivery, or condition mismatch are backed by ThreadLoop Resolution Guarantee.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onStartSwap}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1 shadow-sm"
            >
              <span>Explore Swaps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onListGarment}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
            >
              List an Item to Swap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
