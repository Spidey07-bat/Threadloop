import React, { useState } from 'react';
import {
  Store,
  PlusCircle,
  Repeat,
  Truck,
  Trash2
} from 'lucide-react';
import { ProductListing, Order, ExchangeProposal, User } from '../../types/index.js';
import { formatINR, formatDate } from '../../lib/formatters.js';

interface SellerDashboardProps {
  currentUser: User | null;
  listings: ProductListing[];
  orders: Order[];
  exchanges: ExchangeProposal[];
  onOpenCreateListing: () => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status'], carrier?: string, trackingNumber?: string) => Promise<void>;
  onDeleteListing: (listingId: string) => Promise<void>;
  onSelectExchange: (exchange: ExchangeProposal) => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  currentUser,
  listings,
  orders,
  exchanges,
  onOpenCreateListing,
  onUpdateOrderStatus,
  onDeleteListing,
  onSelectExchange
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'orders' | 'exchanges' | 'payouts'>('listings');
  const [shippingCarrier, setShippingCarrier] = useState('BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState('');

  const myListings = listings.filter(l => l.sellerId === currentUser?.id);
  const myOrders = orders.filter(o => o.sellerId === currentUser?.id);
  const myExchanges = exchanges.filter(e => e.ownerId === currentUser?.id || e.proposerId === currentUser?.id);

  const totalGrossSales = myOrders.reduce((sum, o) => sum + o.itemPrice, 0);
  const platformFees = Math.round(totalGrossSales * 0.08);
  const netEarnings = totalGrossSales - platformFees;

  const handleDispatchOrder = async (orderId: string) => {
    if (!trackingNumber.trim()) return;
    await onUpdateOrderStatus(orderId, 'shipped', shippingCarrier, trackingNumber.trim());
    setTrackingNumber('');
  };

  const emailUsername = currentUser?.email ? currentUser.email.split('@')[0] : 'seller';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-900">
      {/* Seller Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-500/20"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-slate-900 font-display">{currentUser?.name || 'Seller'}'s Studio</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Verified Circular Seller
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {currentUser?.city}, {currentUser?.state} • {currentUser?.rating} ★ ({currentUser?.reviewCount} reviews) • {currentUser?.totalSwaps} swaps completed
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreateListing}
          className="px-5 py-2.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-xs active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Listing</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Active Wardrobe Items</div>
          <div className="text-2xl font-bold text-slate-950 font-display">
            {myListings.filter(l => l.status === 'active').length}
          </div>
          <div className="text-[11px] text-teal-700 font-semibold mt-1">{myListings.length} total pieces cataloged</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Gross Sales (GMV)</div>
          <div className="text-2xl font-bold text-slate-950 font-display">
            {formatINR(totalGrossSales)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{myOrders.length} customer orders</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Net Earnings (UPI Payout)</div>
          <div className="text-2xl font-bold text-emerald-700 font-display">
            {formatINR(netEarnings)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">After 8% platform maintenance</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Swaps in Progress</div>
          <div className="text-2xl font-bold text-pink-700 font-display">
            {myExchanges.filter(e => e.status === 'pending' || e.status === 'in_transit' || e.status === 'accepted').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{currentUser?.totalSwaps} all-time swaps</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-xs font-bold">
        {[
          { id: 'listings', label: `My Closet Items (${myListings.length})` },
          { id: 'orders', label: `Orders to Ship (${myOrders.length})` },
          { id: 'exchanges', label: `Swap Proposals (${myExchanges.length})` },
          { id: 'payouts', label: 'Payouts & UPI Banking' }
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

      {/* Tab 1: Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {myListings.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <Store className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-slate-900 font-bold text-sm">No Listings in Your Closet Yet</h3>
              <p className="text-xs text-slate-500">Declutter unused garments and start earning or swapping.</p>
              <button
                onClick={onOpenCreateListing}
                className="px-5 py-2.5 bg-[#0d9488] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                List Your First Garment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map(l => (
                <div key={l.id} className="p-4 rounded-2xl bg-white border border-slate-200 flex space-x-3 items-center justify-between shadow-2xs">
                  <img src={l.images[0]} alt="" className="w-16 h-20 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="text-[10px] text-teal-700 font-bold block">{l.brand}</span>
                    <h4 className="font-semibold text-slate-900 truncate">{l.title}</h4>
                    <p className="text-[11px] text-slate-500">Size: {l.size} • {l.condition}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-bold text-slate-900">{formatINR(l.sellingPrice)}</span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                        l.status === 'active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {l.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteListing(l.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Orders to Ship */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs shadow-xs">
              No orders received yet. Active listings will appear here once purchased.
            </div>
          ) : (
            myOrders.map(order => (
              <div key={order.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">Order #{order.orderNumber}</span>
                    <span className="text-slate-500 ml-2">Placed {formatDate(order.createdAt)}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-teal-50 text-teal-800 border border-teal-200 w-fit">
                    Status: {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex space-x-3">
                    <img src={order.listingImage} alt="" className="w-16 h-20 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900">{order.listingTitle}</h4>
                      <p className="text-slate-500 mt-1">Item price: {formatINR(order.itemPrice)}</p>
                      <p className="text-emerald-700 font-bold">Your Net Payout: {formatINR(order.itemPrice - Math.round(order.itemPrice * 0.08))}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block">Deliver to Customer:</span>
                    <p className="text-slate-800 font-semibold">{order.shippingAddress.fullName} ({order.shippingAddress.phone})</p>
                    <p className="text-slate-600 leading-relaxed">
                      {order.shippingAddress.streetAddress}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </p>
                  </div>
                </div>

                {/* Dispatch Controls */}
                {order.status === 'confirmed' && (
                  <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-3 text-xs">
                    <h5 className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <Truck className="w-4 h-4 text-teal-600" />
                      <span>Fulfill & Schedule Doorstep Courier Dispatch</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-600 block mb-1">Courier Carrier</label>
                        <select
                          value={shippingCarrier}
                          onChange={e => setShippingCarrier(e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs"
                        >
                          <option value="BlueDart Express">BlueDart Express</option>
                          <option value="Delhivery Surface">Delhivery Surface</option>
                          <option value="Shadowfax Logistics">Shadowfax Logistics</option>
                          <option value="India Post SpeedPost">India Post SpeedPost</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-600 block mb-1">Tracking Number / AWB</label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={e => setTrackingNumber(e.target.value)}
                          placeholder="e.g. BD-889102401"
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!trackingNumber.trim()}
                      onClick={() => handleDispatchOrder(order.id)}
                      className="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs transition disabled:opacity-50 shadow-xs"
                    >
                      Confirm Dispatch & Send Tracking to Buyer
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Exchanges */}
      {activeTab === 'exchanges' && (
        <div className="space-y-3">
          {myExchanges.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs shadow-xs">
              No wardrobe swap proposals right now.
            </div>
          ) : (
            myExchanges.map(ex => (
              <div
                key={ex.id}
                onClick={() => onSelectExchange(ex)}
                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer flex items-center justify-between transition shadow-2xs"
              >
                <div className="flex items-center space-x-3 text-xs">
                  <Repeat className="w-5 h-5 text-pink-600" />
                  <div>
                    <div className="font-bold text-slate-900">Swap #{ex.id}: {ex.targetListing.title} ↔ {ex.offeredListing.title}</div>
                    <div className="text-slate-500">Proposer: {ex.proposerName} • Status: {ex.status}</div>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-slate-100 text-teal-800 font-semibold text-xs hover:bg-slate-200">
                  View & Manage
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Payouts */}
      {activeTab === 'payouts' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 text-xs shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Automated UPI Payouts (India)</h3>
              <p className="text-slate-500">Disbursed directly into your verified bank account 48 hours after customer delivery.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              Active Escrow
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-slate-500 block">Registered UPI ID / VPA</span>
              <div className="text-sm font-bold text-slate-900 font-mono">{emailUsername}@okaxis</div>
              <span className="text-[10px] text-teal-700 font-semibold">Verified by NPCI Instant Rails</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-slate-500 block">Payout Frequency</span>
              <div className="text-sm font-bold text-slate-900">Daily Auto-Settlement at 6:00 PM IST</div>
              <span className="text-[10px] text-slate-500">Zero transfer fee</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
