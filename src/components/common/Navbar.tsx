import React, { useState } from 'react';
import {
  ShoppingBag,
  Heart,
  Repeat,
  PlusCircle,
  Bell,
  Search,
  Leaf,
  Store,
  SlidersHorizontal,
  CheckCircle2
} from 'lucide-react';
import { User, Notification } from '../../types/index.js';

interface NavbarProps {
  currentUser: User | null;
  users: User[];
  onSwitchUser: (userId: string) => void;
  cartCount: number;
  wishlistCount: number;
  notifications: Notification[];
  socketStatus?: 'connected' | 'connecting' | 'disconnected';
  activeOnlineUsers?: number;
  onReconnect?: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenCreateListing: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenSellerDashboard: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onMarkNotificationRead: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  onSwitchUser,
  cartCount,
  wishlistCount,
  notifications,
  socketStatus = 'connected',
  activeOnlineUsers = 1,
  onReconnect,
  onOpenCart,
  onOpenWishlist,
  onOpenCreateListing,
  onOpenProfile,
  onOpenAdmin,
  onOpenSellerDashboard,
  searchQuery,
  onSearchChange,
  activeTab,
  setActiveTab,
  onMarkNotificationRead
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner: Circular Mission & India delivery */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-1.5 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              🇮🇳 India's Circular Fashion Hub
            </span>
            {/* Real-Time WebSocket Status Pill */}
            <button
              onClick={() => onReconnect && onReconnect()}
              title="Click to connect or refresh WebSocket sync"
              className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:border-emerald-300 transition cursor-pointer"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                socketStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : socketStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
              }`} />
              <span>{socketStatus === 'connected' ? 'Live WebSocket Connected' : socketStatus === 'connecting' ? 'Connecting WebSocket...' : 'Connect to WebSocket'}</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700">{activeOnlineUsers} live swapper{activeOnlineUsers > 1 ? 's' : ''}</span>
            </button>
            <span className="hidden lg:inline text-slate-400">
              Wear the trend. Pass it on.
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-teal-700 font-medium text-xs">
              <Leaf className="w-3.5 h-3.5 mr-1 text-teal-600" />
              <span>Zero Textile Waste Mission</span>
            </div>
            <span className="text-slate-300">|</span>
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-1 text-slate-700 hover:text-slate-900 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 hover:border-slate-300 transition shadow-xs"
              >
                <span className="text-[11px] text-slate-500">Role:</span>
                <span className="font-semibold text-teal-700 text-[11px]">
                  {currentUser?.name ? currentUser.name.split(' ')[0] : 'Guest'} ({currentUser?.role || 'user'})
                </span>
                <span className="text-slate-400 text-[10px]">▼</span>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
                  <div className="text-[11px] font-medium text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Switch Demo Account
                  </div>
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-xs transition ${
                        currentUser?.id === u.id
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-500 capitalize flex items-center justify-between">
                          <span>{u.role}</span>
                          <span>{u.city}</span>
                        </div>
                      </div>
                      {currentUser?.id === u.id && <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-pink-500 to-lime-500 p-0.5 shadow-md shadow-teal-500/10">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Repeat className="w-5 h-5 text-teal-400 transform -rotate-12" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-950 font-display">
                  Thread<span className="text-teal-600">Loop</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 border border-pink-200">
                  Resale & Swap
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block">Wear the trend. Pass it on.</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Zara blazers, vintage denim, sneakers, swap offers..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-600 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-3 py-2 rounded-lg transition ${
                activeTab === 'explore'
                  ? 'text-slate-900 bg-slate-100 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Shop All
            </button>
            <button
              onClick={() => setActiveTab('exchanges')}
              className={`px-3 py-2 rounded-lg flex items-center space-x-1.5 transition ${
                activeTab === 'exchanges'
                  ? 'text-teal-700 bg-teal-50 font-bold border border-teal-200'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-slate-50'
              }`}
            >
              <Repeat className="w-3.5 h-3.5 text-teal-600" />
              <span>Wardrobe Exchanges</span>
            </button>
            <button
              onClick={() => setActiveTab('how-it-works')}
              className={`px-3 py-2 rounded-lg transition ${
                activeTab === 'how-it-works'
                  ? 'text-slate-900 bg-slate-100 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              How it Works
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* List an item button */}
            <button
              onClick={onOpenCreateListing}
              className="flex items-center space-x-1.5 bg-[#0d9488] hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">List & Swap</span>
              <span className="sm:hidden">Sell</span>
            </button>

            {/* Seller dashboard quick button */}
            <button
              onClick={onOpenSellerDashboard}
              title="Seller Dashboard"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition relative hidden sm:block"
            >
              <Store className="w-5 h-5" />
            </button>

            {/* Admin link if admin */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="px-2.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition flex items-center space-x-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="p-2 text-slate-600 hover:text-pink-600 hover:bg-slate-100 rounded-xl transition relative"
              title="Saved Items"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-pink-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-teal-600 text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <span className="text-[10px] text-teal-600 font-semibold">{unreadNotifs.length} unread</span>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400">No notifications yet.</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl text-xs cursor-pointer transition ${
                            n.read
                              ? 'bg-slate-50 text-slate-500'
                              : 'bg-teal-50 border border-teal-100 text-slate-800'
                          }`}
                        >
                          <div className="font-semibold text-slate-900 mb-0.5">{n.title}</div>
                          <p className="text-[11px] leading-relaxed text-slate-600">{n.message}</p>
                          <span className="text-[9px] text-slate-400 mt-1 block">Just now</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={onOpenCart}
              className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#0d9488] text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Avatar */}
            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-2 pl-1 group"
              title="My Account"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={currentUser?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 group-hover:ring-teal-500 transition"
              />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clothes, swap listings, brands..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
