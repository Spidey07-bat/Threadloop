import React, { useState } from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  RotateCcw,
  Leaf
} from 'lucide-react';
import { PlatformStats, ProductListing, Order, User, ExchangeProposal } from '../../types/index.js';
import { formatINR, formatDate } from '../../lib/formatters.js';

interface AdminDashboardProps {
  stats: PlatformStats;
  listings: ProductListing[];
  orders: Order[];
  users: User[];
  exchanges: ExchangeProposal[];
  auditLogs: any[];
  config: any;
  onUpdateConfig: (newConfig: any) => Promise<void>;
  onModerateListing: (listingId: string, status: string) => Promise<void>;
  onResetDb: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  listings,
  orders,
  users,
  exchanges,
  auditLogs,
  config,
  onUpdateConfig,
  onModerateListing,
  onResetDb
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'settings' | 'logs'>('overview');
  const [feePercent, setFeePercent] = useState(config?.platformFeePercent || 8);
  const [shippingFee, setShippingFee] = useState(config?.baseShippingFee || 80);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(config?.freeShippingAbove || 2499);
  const [savingSettings, setSavingSettings] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await onUpdateConfig({
        platformFeePercent: Number(feePercent),
        baseShippingFee: Number(shippingFee),
        freeShippingAbove: Number(freeShippingThreshold)
      });
      setMsg('Platform settings updated successfully.');
      setTimeout(() => setMsg(null), 3000);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleExecuteReset = async () => {
    setResetting(true);
    try {
      await onResetDb();
      setShowConfirmReset(false);
      setMsg('Database reset to clean demo state.');
      setTimeout(() => setMsg(null), 3000);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-900">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            ThreadLoop Operations Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervise circular marketplace health, approve listings, configure commercial fees & audit logs.
          </p>
        </div>

        {showConfirmReset ? (
          <div className="flex items-center space-x-2 bg-red-50 p-2.5 rounded-xl border border-red-200">
            <span className="text-xs text-red-800 font-medium">Reset all demo data?</span>
            <button
              onClick={handleExecuteReset}
              disabled={resetting}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
            >
              {resetting ? 'Resetting...' : 'Yes, Reset'}
            </button>
            <button
              onClick={() => setShowConfirmReset(false)}
              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-xs transition flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Database</span>
          </button>
        )}
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-xs font-bold">
        {[
          { id: 'overview', label: 'Platform Metrics & Eco Impact' },
          { id: 'listings', label: `Listing Moderation Queue (${listings.length})` },
          { id: 'settings', label: 'Commercial Fees & Rules' },
          { id: 'logs', label: `Security Audit Logs (${auditLogs.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3 transition border-b-2 ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">Total Marketplace GMV</span>
              <div className="text-2xl font-bold text-slate-950 font-display">{formatINR(stats.gmv)}</div>
              <span className="text-[11px] text-teal-700 font-semibold mt-1 block">{orders.length} total completed orders</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">Wardrobe Swaps</span>
              <div className="text-2xl font-bold text-pink-700 font-display">{stats.totalExchanges}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">{stats.completedExchanges} completed/in transit</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">Active Catalog Listings</span>
              <div className="text-2xl font-bold text-emerald-700 font-display">{stats.activeListings}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">{listings.length} total garments registered</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block mb-1">Registered Users</span>
              <div className="text-2xl font-bold text-slate-950 font-display">{stats.totalUsers}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">100% verified Indian profiles</span>
            </div>
          </div>

          {/* Environmental Impact Card */}
          <div className="p-6 rounded-3xl bg-teal-50/70 border border-teal-200 space-y-4">
            <div className="flex items-center space-x-2 text-teal-900 font-bold text-sm">
              <Leaf className="w-5 h-5 text-teal-600" />
              <span>Real Environmental Circular Savings</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-2xl font-bold text-teal-700 font-display">
                  {stats.waterLitresSaved.toLocaleString()} L
                </div>
                <div className="text-slate-600 mt-1">Freshwater conserved by keeping garments in circulation</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-2xl font-bold text-emerald-700 font-display">
                  {stats.co2KgSaved} kg CO₂
                </div>
                <div className="text-slate-600 mt-1">Atmospheric carbon emissions avoided vs new production</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-2xl font-bold text-purple-700 font-display">
                  {stats.treesEquivalentSaved} Trees
                </div>
                <div className="text-slate-600 mt-1">Equivalent annual carbon absorption of mature trees</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Queue */}
      {activeTab === 'listings' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-500">
            Audit seller listings to ensure authentic Indian resale standards and fair condition disclosures.
          </div>

          <div className="space-y-3">
            {listings.map(l => (
              <div key={l.id} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 text-xs shadow-2xs">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <img src={l.images[0]} alt="" className="w-14 h-16 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm truncate">{l.title}</span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                        l.status === 'active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {l.status}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Seller: {l.sellerName} ({l.city}) • Price: {formatINR(l.sellingPrice)} • {l.condition}
                    </div>
                    <div className="text-[11px] text-amber-700 truncate">
                      Disclosures: {l.defectsDisclosed}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  {l.status !== 'active' ? (
                    <button
                      onClick={() => onModerateListing(l.id, 'active')}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 font-bold"
                    >
                      Approve & Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => onModerateListing(l.id, 'archived')}
                      className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold"
                    >
                      Suspend Listing
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commercial Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-white border border-slate-200 space-y-6 text-xs max-w-2xl shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Commercial Commission & Logistics Parameters</h3>

          <div className="space-y-4">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Marketplace Platform Commission (%)</label>
              <input
                type="number"
                value={feePercent}
                onChange={e => setFeePercent(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Standard 8% charged only upon successful order fulfillment.</span>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Standard Doorstep Shipping Fee (INR ₹)</label>
              <input
                type="number"
                value={shippingFee}
                onChange={e => setShippingFee(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Free Shipping Order Threshold (INR ₹)</label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={e => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="px-6 py-2.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs transition shadow-xs"
          >
            {savingSettings ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      )}

      {/* Audit Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-2 text-xs">
          <div className="text-slate-500 mb-2">Immutable security & administrative audit trails:</div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="font-bold text-teal-700 mr-2">[{log.action}]</span>
                  <span className="text-slate-900 font-medium">{log.details}</span>
                  <span className="text-slate-500 text-[11px] ml-2">by {log.actorName}</span>
                </div>
                <span className="text-[10px] text-slate-400">{formatDate(log.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
