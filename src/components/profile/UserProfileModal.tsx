import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Repeat,
  Heart,
  Truck,
  Trash2
} from 'lucide-react';
import { User, Order, ExchangeProposal, ProductListing } from '../../types/index.js';
import { formatINR, formatDate } from '../../lib/formatters.js';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  orders: Order[];
  exchanges: ExchangeProposal[];
  wishlist: ProductListing[];
  onOpenListing: (listing: ProductListing) => void;
  onRemoveWishlist: (listingId: string) => void;
  onUpdateProfile: (data: Partial<User>) => Promise<void>;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  orders,
  exchanges,
  wishlist,
  onOpenListing,
  onRemoveWishlist,
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'exchanges' | 'wishlist' | 'settings'>('orders');
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || '');

  if (!isOpen || !currentUser) return null;

  const myOrders = orders.filter(o => o.buyerId === currentUser.id);
  const myExchanges = exchanges.filter(e => e.proposerId === currentUser.id || e.ownerId === currentUser.id);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile({ name, bio, phone, city });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative my-8 max-h-[92vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={currentUser.avatar} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-500/20" />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900 font-display">{currentUser.name}</h2>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 capitalize">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500">{currentUser.city}, {currentUser.state} • Member since 2024</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 space-x-2 text-xs font-bold pt-2">
          {[
            { id: 'orders', label: `My Orders (${myOrders.length})` },
            { id: 'exchanges', label: `My Swaps (${myExchanges.length})` },
            { id: 'wishlist', label: `Wishlist (${wishlist.length})` },
            { id: 'settings', label: 'Profile Settings' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-3 px-3 transition border-b-2 ${
                activeTab === t.id
                  ? 'border-teal-600 text-teal-800'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4 text-xs">
          {/* Tab 1: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {myOrders.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No orders placed yet. Browse the marketplace to find curated circular fashion pieces.
                </div>
              ) : (
                myOrders.map(o => (
                  <div key={o.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
                      <div>
                        <span className="font-bold text-slate-900">Order #{o.orderNumber}</span>
                        <span className="text-slate-400 ml-2">{formatDate(o.createdAt)}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize bg-teal-50 text-teal-800 border border-teal-200">
                        {o.status}
                      </span>
                    </div>

                    <div className="flex space-x-3 items-center">
                      <img src={o.listingImage} alt="" className="w-14 h-16 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{o.listingTitle}</h4>
                        <p className="text-[11px] text-slate-500">Seller: {o.sellerName}</p>
                        <p className="text-xs font-bold text-teal-800 mt-1">{formatINR(o.totalAmount)}</p>
                      </div>
                    </div>

                    {/* Delivery tracking */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700 flex items-center justify-between shadow-2xs">
                      <span className="flex items-center space-x-1.5">
                        <Truck className="w-3.5 h-3.5 text-teal-600" />
                        <span>Carrier: {o.carrier || 'BlueDart Express'}</span>
                      </span>
                      <span className="text-slate-500 font-mono">AWB: {o.trackingNumber || 'Tracking ID Pending'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Exchanges */}
          {activeTab === 'exchanges' && (
            <div className="space-y-3">
              {myExchanges.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Repeat className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No wardrobe exchanges right now. Find swap-eligible pieces and trade directly.
                </div>
              ) : (
                myExchanges.map(ex => (
                  <div key={ex.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">Swap #{ex.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-pink-50 text-pink-700 border border-pink-200">
                        {ex.status}
                      </span>
                    </div>
                    <div className="text-slate-700 text-xs">
                      Trading: <strong>{ex.targetListing.title}</strong> ↔ <strong>{ex.offeredListing.title}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-3">
              {wishlist.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  Your wishlist is empty. Tap the heart on items you love to save them here.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wishlist.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex space-x-3 items-center justify-between"
                    >
                      <img src={item.images[0]} alt="" className="w-14 h-16 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-teal-700 font-bold block">{item.brand}</span>
                        <h4 className="font-semibold text-slate-900 truncate">{item.title}</h4>
                        <div className="text-xs font-bold text-slate-900 mt-1">{formatINR(item.sellingPrice)}</div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenListing(item);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#0d9488] text-white font-bold text-[11px]"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onRemoveWishlist(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Profile Settings */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div>
                <label className="text-slate-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Mobile Phone (WhatsApp Notifications)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Bio & Style Taste</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs"
              >
                Save Profile Changes
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
