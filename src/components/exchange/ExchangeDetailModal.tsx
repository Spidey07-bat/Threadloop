import React, { useState } from 'react';
import {
  X,
  Repeat,
  CheckCircle2,
  XCircle,
  Truck,
  MessageSquare,
  ShieldAlert,
  AlertCircle,
  PackageCheck
} from 'lucide-react';
import { ExchangeProposal, User } from '../../types/index.js';
import { formatINR, formatDate } from '../../lib/formatters.js';

interface ExchangeDetailModalProps {
  exchange: ExchangeProposal | null;
  currentUser: User | null;
  onClose: () => void;
  onUpdateStatus: (
    status: ExchangeProposal['status'],
    options?: {
      counterOfferNote?: string;
      cashDifference?: number;
      carrier?: string;
      trackingNumber?: string;
    }
  ) => Promise<void>;
}

export const ExchangeDetailModal: React.FC<ExchangeDetailModalProps> = ({
  exchange,
  currentUser,
  onClose,
  onUpdateStatus
}) => {
  const [loading, setLoading] = useState(false);
  const [carrier, setCarrier] = useState('Delhivery Surface');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [counterCash, setCounterCash] = useState<number>(0);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!exchange) return null;

  const isOwner = currentUser?.id === exchange.ownerId;
  const isProposer = currentUser?.id === exchange.proposerId;

  const handleAction = async (status: ExchangeProposal['status'], extra?: any) => {
    try {
      setLoading(true);
      setError(null);
      await onUpdateStatus(status, extra);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Pending Review' },
    counteroffered: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800', label: 'Counter-Offered' },
    accepted: { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-800', label: 'Accepted (Awaiting Dispatch)' },
    in_transit: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', label: 'In Transit 🚚' },
    completed: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'Completed Swap 🎉' },
    rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', label: 'Declined' },
    disputed: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-800', label: 'Disputed' }
  };

  const currStatus = statusColors[exchange.status] || statusColors.pending;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative my-8 text-slate-900">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
              <Repeat className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 font-display">Wardrobe Exchange Details</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currStatus.bg} ${currStatus.text}`}>
                  {currStatus.label}
                </span>
              </div>
              <p className="text-xs text-slate-500">Proposal ID: {exchange.id} • Created {formatDate(exchange.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Trade Visual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Item (Owner) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-700">Target Piece (Owner: {exchange.ownerName})</span>
                <span className="font-bold text-slate-900">{formatINR(exchange.targetListing.sellingPrice)}</span>
              </div>
              <div className="flex space-x-3">
                <img
                  src={exchange.targetListing.images[0]}
                  alt=""
                  className="w-20 h-24 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{exchange.targetListing.title}</h4>
                  <p className="text-xs text-slate-500">{exchange.targetListing.brand} • Size {exchange.targetListing.size}</p>
                  <p className="text-xs text-slate-500">{exchange.targetListing.condition}</p>
                  {exchange.ownerTracking ? (
                    <div className="mt-2 text-[11px] text-teal-800 bg-teal-50 p-1.5 rounded-lg border border-teal-200">
                      Dispatched: {exchange.ownerTracking.carrier} ({exchange.ownerTracking.trackingNumber})
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 mt-2 block">Tracking pending</span>
                  )}
                </div>
              </div>
            </div>

            {/* Offered Item (Proposer) */}
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-pink-700">Offered Piece (Proposer: {exchange.proposerName})</span>
                <span className="font-bold text-slate-900">{formatINR(exchange.offeredListing.sellingPrice)}</span>
              </div>
              <div className="flex space-x-3">
                <img
                  src={exchange.offeredListing.images[0]}
                  alt=""
                  className="w-20 h-24 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{exchange.offeredListing.title}</h4>
                  <p className="text-xs text-slate-500">{exchange.offeredListing.brand} • Size {exchange.offeredListing.size}</p>
                  <p className="text-xs text-slate-500">{exchange.offeredListing.condition}</p>
                  {exchange.proposerTracking ? (
                    <div className="mt-2 text-[11px] text-pink-800 bg-pink-50 p-1.5 rounded-lg border border-pink-200">
                      Dispatched: {exchange.proposerTracking.carrier} ({exchange.proposerTracking.trackingNumber})
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 mt-2 block">Tracking pending</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cash Balancing info & Notes */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            {exchange.cashDifference !== 0 && (
              <div className="flex items-center justify-between font-semibold text-slate-800 pb-2 border-b border-slate-200">
                <span>Cash Balancer:</span>
                <span className="text-teal-700 font-bold">
                  {exchange.cashDifference > 0
                    ? `Proposer offers +${formatINR(exchange.cashDifference)} cash difference`
                    : `Requested ${formatINR(Math.abs(exchange.cashDifference))} cash adjustment`}
                </span>
              </div>
            )}

            {exchange.note && (
              <div>
                <span className="text-slate-500 block font-semibold mb-0.5">Note from {exchange.proposerName}:</span>
                <p className="text-slate-800 italic bg-white p-2.5 rounded-xl border border-slate-200">
                  "{exchange.note}"
                </p>
              </div>
            )}

            {exchange.counterOfferNote && (
              <div>
                <span className="text-purple-700 block font-semibold mb-0.5">Counteroffer Note from {exchange.ownerName}:</span>
                <p className="text-slate-800 italic bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                  "{exchange.counterOfferNote}"
                </p>
              </div>
            )}
          </div>

          {/* Dispatch Shipment Box (when accepted or in_transit) */}
          {(exchange.status === 'accepted' || exchange.status === 'in_transit') && (
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-teal-600" />
                <span>Dispatch & Shipping Tracking (Doorstep Carrier)</span>
              </h4>
              <p className="text-[11px] text-slate-600">
                Enter your courier partner (BlueDart, Delhivery, Shadowfax) and tracking number once handed over to the courier.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Carrier Partner</label>
                  <select
                    value={carrier}
                    onChange={e => setCarrier(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Delhivery Surface">Delhivery Surface</option>
                    <option value="BlueDart Express">BlueDart Express</option>
                    <option value="Shadowfax Courier">Shadowfax Courier</option>
                    <option value="India Post SpeedPost">India Post SpeedPost</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">Tracking / AWB Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DEL-88910248"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={!trackingNumber.trim() || loading}
                  onClick={() => handleAction('in_transit', { carrier, trackingNumber })}
                  className="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  Save Dispatch Tracking
                </button>
              </div>
            </div>
          )}

          {/* Recipient Action Controls (Accept, Reject, Counter) */}
          {exchange.status === 'pending' && isOwner && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAction('accepted')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Wardrobe Swap</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCounterForm(!showCounterForm)}
                  className="py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-xs transition flex items-center space-x-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Suggest Counteroffer</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAction('rejected')}
                  className="py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold text-xs transition flex items-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Decline</span>
                </button>
              </div>

              {showCounterForm && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3 text-xs">
                  <h4 className="font-bold text-purple-800">Propose Counteroffer</h4>
                  <div>
                    <label className="text-[11px] text-slate-700 block mb-1">Requested Cash Adjustment</label>
                    <input
                      type="number"
                      value={counterCash}
                      onChange={e => setCounterCash(Number(e.target.value))}
                      className="p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 w-40"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-700 block mb-1">Message to Proposer</label>
                    <textarea
                      rows={2}
                      value={counterNote}
                      onChange={e => setCounterNote(e.target.value)}
                      placeholder="e.g. Can you add ₹200 or ship by tomorrow?"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction('counteroffered', { counterOfferNote: counterNote, cashDifference: counterCash })}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                  >
                    Send Counteroffer
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Complete or Dispute controls */}
          {(exchange.status === 'in_transit' || exchange.status === 'accepted') && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => handleAction('disputed')}
                className="text-rose-600 hover:text-rose-700 flex items-center space-x-1 text-[11px]"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Report Swap Dispute</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleAction('completed')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center space-x-1 shadow-xs"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Mark Swap Received & Complete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
