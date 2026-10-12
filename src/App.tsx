import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Package
} from 'lucide-react';
import {
  User,
  ProductListing,
  ExchangeProposal,
  Order,
  Notification,
  PlatformStats,
  CartItem
} from './types/index.js';
import { api, setCurrentUserId } from './lib/api.js';
import { Navbar } from './components/common/Navbar.js';
import { Footer } from './components/common/Footer.js';
import { Hero } from './components/home/Hero.js';
import { ExchangeExplainer } from './components/home/ExchangeExplainer.js';
import { FaqSection } from './components/home/FaqSection.js';
import { ListingCard } from './components/marketplace/ListingCard.js';
import { FilterSidebar } from './components/marketplace/FilterSidebar.js';
import { ListingDetailModal } from './components/marketplace/ListingDetailModal.js';
import { ProposeExchangeModal } from './components/exchange/ProposeExchangeModal.js';
import { ExchangeDetailModal } from './components/exchange/ExchangeDetailModal.js';
import { ExchangeListView } from './components/exchange/ExchangeListView.js';
import { CreateListingModal } from './components/seller/CreateListingModal.js';
import { SellerDashboard } from './components/seller/SellerDashboard.js';
import { CartDrawer } from './components/checkout/CartDrawer.js';
import { CheckoutModal } from './components/checkout/CheckoutModal.js';
import { OrderSuccessModal } from './components/checkout/OrderSuccessModal.js';
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { UserProfileModal } from './components/profile/UserProfileModal.js';
import { PolicyModal } from './components/legal/PolicyModal.js';
import { useThreadLoopSocket } from './lib/websocket.js';

export default function App() {
  // --- Data State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [exchanges, setExchanges] = useState<ExchangeProposal[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<ProductListing[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalListings: 8,
    activeListings: 8,
    totalOrders: 1,
    gmv: 1899,
    totalExchanges: 1,
    completedExchanges: 1,
    totalUsers: 4,
    treesEquivalentSaved: 1,
    waterLitresSaved: 8100,
    co2KgSaved: 11
  });
  const [config, setConfig] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // --- UI Navigation State ---
  const [activeTab, setActiveTab] = useState<'explore' | 'exchanges' | 'how-it-works' | 'seller' | 'admin'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedCity, setSelectedCity] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // --- Modals State ---
  const [selectedListing, setSelectedListing] = useState<ProductListing | null>(null);
  const [exchangeTargetListing, setExchangeTargetListing] = useState<ProductListing | null>(null);
  const [selectedExchange, setSelectedExchange] = useState<ExchangeProposal | null>(null);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutCouponCode, setCheckoutCouponCode] = useState<string | undefined>(undefined);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  // --- Toast Notification ---
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Real-Time WebSocket Connection ---
  const { status: socketStatus, activeUsers, subscribe, reconnect } = useThreadLoopSocket(currentUser?.id);

  useEffect(() => {
    // Listen for live orders
    const unsubOrder = subscribe('order:created', (newOrder: Order) => {
      setOrders(prev => {
        if (prev.some(o => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
      api.getStats().then(setStats).catch(() => {});
      showToast(`📦 Live Order #${newOrder.orderNumber} placed by ${newOrder.buyerName}!`);
    });

    const unsubOrderUpdate = subscribe('order:status_changed', (updated: Order) => {
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    });

    // Listen for live wardrobe swap proposals
    const unsubExchange = subscribe('exchange:created', (newExchange: ExchangeProposal) => {
      setExchanges(prev => {
        if (prev.some(e => e.id === newExchange.id)) return prev;
        return [newExchange, ...prev];
      });
      showToast(`🔄 Real-time Swap: ${newExchange.proposerName} proposed an exchange!`);
    });

    const unsubExchangeStatus = subscribe('exchange:status_changed', (updated: ExchangeProposal) => {
      setExchanges(prev => prev.map(e => e.id === updated.id ? updated : e));
    });

    // Listen for live catalog drops & likes
    const unsubListingCreated = subscribe('listing:created', (newListing: ProductListing) => {
      setListings(prev => {
        if (prev.some(l => l.id === newListing.id)) return prev;
        return [newListing, ...prev];
      });
      showToast(`✨ Live Drop: "${newListing.title}" just listed!`);
    });

    const unsubListingUpdated = subscribe('listing:updated', (updated: ProductListing) => {
      setListings(prev => prev.map(l => l.id === updated.id ? updated : l));
    });

    const unsubListingDeleted = subscribe('listing:deleted', (data: { id: string }) => {
      setListings(prev => prev.filter(l => l.id !== data.id));
    });

    const unsubListingLiked = subscribe('listing:liked', (data: { id: string; likes: number }) => {
      setListings(prev => prev.map(l => l.id === data.id ? { ...l, likes: data.likes } : l));
    });

    const unsubReset = subscribe('database:reset', () => {
      loadAllData();
      showToast('⚡ Marketplace reset via live sync');
    });

    return () => {
      unsubOrder();
      unsubOrderUpdate();
      unsubExchange();
      unsubExchangeStatus();
      unsubListingCreated();
      unsubListingUpdated();
      unsubListingDeleted();
      unsubListingLiked();
      unsubReset();
    };
  }, [subscribe]);

  // --- Initial Data Load with Resilience ---
  const loadAllData = async () => {
    try {
      const [uList, cUser, lList, eList, oList, cItems, wItems, notifs, st, cfg] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getCurrentUser().catch(() => null),
        api.getListings().catch(() => []),
        api.getExchanges().catch(() => []),
        api.getOrders().catch(() => []),
        api.getCart().catch(() => []),
        api.getWishlist().catch(() => []),
        api.getNotifications().catch(() => []),
        api.getStats().catch(() => null),
        api.getConfig().catch(() => null)
      ]);

      if (uList && uList.length) setUsers(uList);
      if (cUser) setCurrentUser(cUser);
      if (lList) setListings(lList);
      if (eList) setExchanges(eList);
      if (oList) setOrders(oList);
      if (cItems) setCart(cItems);
      if (wItems) setWishlist(wItems);
      if (notifs) setNotifications(notifs);
      if (st) setStats(st);
      if (cfg) setConfig(cfg);

      if (cUser && cUser.role === 'admin') {
        api.getAdminLogs().then(setAuditLogs).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to load initial marketplace data', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- User Switching Handler ---
  const handleSwitchUser = async (userId: string) => {
    try {
      setCurrentUserId(userId);
      const user = await api.login({ userId });
      setCurrentUser(user);

      // Refresh personal data
      const [cItems, wItems, notifs, eList, oList] = await Promise.all([
        api.getCart().catch(() => []),
        api.getWishlist().catch(() => []),
        api.getNotifications().catch(() => []),
        api.getExchanges().catch(() => []),
        api.getOrders().catch(() => [])
      ]);
      setCart(cItems);
      setWishlist(wItems);
      setNotifications(notifs);
      setExchanges(eList);
      setOrders(oList);

      if (user.role === 'admin') {
        api.getAdminLogs().then(setAuditLogs).catch(() => {});
      }

      showToast(`Switched account to ${user.name} (${user.role})`);
    } catch (err) {
      console.error('Switch user error', err);
    }
  };

  // --- Like / Wishlist Toggle ---
  const handleToggleLike = async (listingId: string) => {
    try {
      const result = await api.toggleLike(listingId);
      // update listing likes count locally
      setListings(prev =>
        prev.map(l => (l.id === listingId ? { ...l, likes: result.likes } : l))
      );
      // update wishlist
      const updatedWishlist = await api.getWishlist();
      setWishlist(updatedWishlist);
      showToast(result.isLiked ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist');
    } catch (err) {
      console.error('Toggle like error', err);
    }
  };

  // --- Cart Actions ---
  const handleAddToCart = async (listingId: string) => {
    try {
      const updatedCart = await api.addToCart(listingId);
      setCart(updatedCart);
      setIsCartOpen(true);
      showToast('Item added to your shopping bag! 🛍️');
    } catch (err: any) {
      showToast(err.message || 'Could not add to cart');
    }
  };

  const handleRemoveCartItem = async (listingId: string) => {
    try {
      const updatedCart = await api.removeFromCart(listingId);
      setCart(updatedCart);
      showToast('Item removed from shopping bag');
    } catch (err) {
      console.error(err);
    }
  };

  // --- Checkout & Order Placement ---
  const handleProceedToCheckout = (discount: number, couponCode?: string) => {
    setCheckoutDiscount(discount);
    setCheckoutCouponCode(couponCode);
    setIsCheckoutOpen(true);
  };

  const handleCompleteOrder = async (orderData: any) => {
    const created = await api.createOrder(orderData);
    setOrders(prev => [created, ...prev]);
    setCart([]);
    const updatedListings = await api.getListings();
    setListings(updatedListings);
    const updatedStats = await api.getStats();
    setStats(updatedStats);

    setConfirmedOrder(created);
    showToast(`Order #${created.orderNumber} placed successfully! 🎉`);
    return created;
  };

  // --- Exchange Proposals ---
  const handleProposeExchange = async (data: {
    targetListingId: string;
    offeredListingId: string;
    cashDifference: number;
    note: string;
  }) => {
    const created = await api.createExchange(data);
    setExchanges(prev => [created, ...prev]);
    showToast('Wardrobe exchange proposal sent to seller! 🔄');
  };

  const handleUpdateExchangeStatus = async (
    status: ExchangeProposal['status'],
    options?: any
  ) => {
    if (!selectedExchange) return;
    const updated = await api.updateExchangeStatus(selectedExchange.id, {
      status,
      ...options
    });
    setExchanges(prev => prev.map(e => (e.id === updated.id ? updated : e)));
    setSelectedExchange(updated);
    const updatedListings = await api.getListings();
    setListings(updatedListings);
    const updatedStats = await api.getStats();
    setStats(updatedStats);
    showToast(`Exchange updated: ${status.replace('_', ' ')}`);
  };

  // --- Listing Creation & Moderation ---
  const handleCreateListing = async (listingData: any) => {
    const created = await api.createListing(listingData);
    setListings(prev => [created, ...prev]);
    const updatedStats = await api.getStats();
    setStats(updatedStats);
    showToast('Garment cataloged successfully! Ready for resale & swaps ✨');
  };

  const handleDeleteListing = async (listingId: string) => {
    await api.deleteListing(listingId);
    setListings(prev => prev.filter(l => l.id !== listingId));
    showToast('Listing removed');
  };

  const handleModerateListing = async (listingId: string, status: string) => {
    await api.updateListing(listingId, { status });
    const updatedListings = await api.getListings({ status: 'all' });
    setListings(updatedListings);
    showToast(`Listing status updated to ${status}`);
  };

  // --- Filtering & Sorting Computation ---
  const filteredListings = useMemo(() => {
    let list = [...listings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        l =>
          l.title.toLowerCase().includes(q) ||
          l.brand.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'All') {
      list = list.filter(l => l.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedCondition !== 'All') {
      list = list.filter(l => l.condition === selectedCondition);
    }

    if (selectedMode === 'swap') {
      list = list.filter(l => l.listingMode === 'exchange_only' || l.listingMode === 'buy_and_exchange');
    } else if (selectedMode === 'buy') {
      list = list.filter(l => l.listingMode === 'buy_only' || l.listingMode === 'buy_and_exchange');
    }

    if (selectedCity !== 'All') {
      list = list.filter(l => l.city.toLowerCase() === selectedCity.toLowerCase());
    }

    if (priceRange[1]) {
      list = list.filter(l => l.sellingPrice <= priceRange[1]);
    }

    // Sort
    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.views || 0) + (b.likes || 0) - ((a.views || 0) + (a.likes || 0)));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [listings, searchQuery, selectedCategory, selectedCondition, selectedMode, selectedCity, priceRange, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCondition('All');
    setSelectedMode('all');
    setSelectedCity('All');
    setSortBy('newest');
    setPriceRange([0, 10000]);
  };

  // User's own listings for trade picker
  const userOwnListings = listings.filter(l => l.sellerId === currentUser?.id && l.status === 'active');

  const wishlistIds = new Set(wishlist.map(w => w.id));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#20D4BF] selection:text-[#0f172a]">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        cartCount={cart.length}
        wishlistCount={wishlist.length}
        notifications={notifications}
        socketStatus={socketStatus}
        activeOnlineUsers={activeUsers}
        onReconnect={reconnect}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsProfileOpen(true)}
        onOpenCreateListing={() => setIsCreateListingOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAdmin={() => setActiveTab('admin')}
        onOpenSellerDashboard={() => setActiveTab('seller')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={tab => setActiveTab(tab as any)}
        onMarkNotificationRead={id => {
          api.markNotificationRead(id);
          setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
        }}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {activeTab === 'explore' && (
          <div>
            {/* Hero Banner */}
            <Hero
              onExplore={() => {
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExchanges={() => setActiveTab('exchanges')}
              onListGarment={() => setIsCreateListingOpen(true)}
              stats={stats}
            />

            {/* Catalog & Shop Section */}
            <div id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Curated Circular Drops</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                    Explore Wardrobe Resale & Swaps
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Showing <strong className="text-slate-900">{filteredListings.length}</strong> authenticated circular fashion pieces across India.
                  </p>
                </div>

                {/* Quick Transaction Mode Pills */}
                <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start md:self-auto text-xs font-semibold">
                  <button
                    onClick={() => setSelectedMode('all')}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      selectedMode === 'all'
                        ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Items
                  </button>
                  <button
                    onClick={() => setSelectedMode('swap')}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1 ${
                      selectedMode === 'swap'
                        ? 'bg-pink-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-pink-700'
                    }`}
                  >
                    <span>🔄 Swap Only</span>
                  </button>
                  <button
                    onClick={() => setSelectedMode('buy')}
                    className={`px-3 py-1.5 rounded-xl transition flex items-center space-x-1 ${
                      selectedMode === 'buy'
                        ? 'bg-[#0d9488] text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🛍️ Buy Now</span>
                  </button>
                </div>
              </div>

              {/* Grid with Filter Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <FilterSidebar
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    selectedCondition={selectedCondition}
                    onSelectCondition={setSelectedCondition}
                    selectedMode={selectedMode}
                    onSelectMode={setSelectedMode}
                    selectedCity={selectedCity}
                    onSelectCity={setSelectedCity}
                    sortBy={sortBy}
                    onSelectSort={setSortBy}
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                    onResetFilters={handleResetFilters}
                  />
                </div>

                {/* Product Grid */}
                <div className="lg:col-span-3">
                  {filteredListings.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
                      <Package className="w-10 h-10 text-slate-400 mx-auto" />
                      <h3 className="text-slate-900 font-bold text-sm">No items match your filter criteria</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Try clearing some filters or searching for different brands like Zara, Levi's, H&M, or Fabindia.
                      </p>
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredListings.map(listing => (
                        <ListingCard
                          key={listing.id}
                          listing={listing}
                          isLiked={wishlistIds.has(listing.id)}
                          onToggleLike={handleToggleLike}
                          onOpenDetails={setSelectedListing}
                          onProposeExchange={item => setExchangeTargetListing(item)}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* How Wardrobe Exchanges Work Visual Section */}
            <ExchangeExplainer
              onStartSwap={() => {
                setSelectedMode('swap');
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onListGarment={() => setIsCreateListingOpen(true)}
            />

            {/* FAQs */}
            <FaqSection />
          </div>
        )}

        {/* Tab 2: Wardrobe Exchanges Feed & Management */}
        {activeTab === 'exchanges' && (
          <ExchangeListView
            exchanges={exchanges}
            currentUser={currentUser}
            onSelectExchange={setSelectedExchange}
            onExploreListings={() => {
              setSelectedMode('swap');
              setActiveTab('explore');
            }}
            onOpenCreateListing={() => setIsCreateListingOpen(true)}
          />
        )}

        {/* Tab 3: How it Works Page */}
        {activeTab === 'how-it-works' && (
          <div>
            <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                The Circular Fashion Standard
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-display">
                How ThreadLoop Powers Resale & Swaps
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Fast fashion fills Indian landfills with millions of tons of wearable clothing every year. ThreadLoop creates a high-trust peer-to-peer ecosystem where great clothes keep circulating.
              </p>
            </div>
            <ExchangeExplainer
              onStartSwap={() => setActiveTab('explore')}
              onListGarment={() => setIsCreateListingOpen(true)}
            />
            <FaqSection />
          </div>
        )}

        {/* Tab 4: Seller Dashboard */}
        {activeTab === 'seller' && (
          <SellerDashboard
            currentUser={currentUser}
            listings={listings}
            orders={orders}
            exchanges={exchanges}
            onOpenCreateListing={() => setIsCreateListingOpen(true)}
            onUpdateOrderStatus={async (orderId, status, carrier, tracking) => {
              await api.updateOrderStatus(orderId, { status, carrier, trackingNumber: tracking });
              const updatedOrders = await api.getOrders();
              setOrders(updatedOrders);
              showToast(`Order status updated to ${status}`);
            }}
            onDeleteListing={handleDeleteListing}
            onSelectExchange={setSelectedExchange}
          />
        )}

        {/* Tab 5: Admin Dashboard */}
        {activeTab === 'admin' && (
          <AdminDashboard
            stats={stats}
            listings={listings}
            orders={orders}
            users={users}
            exchanges={exchanges}
            auditLogs={auditLogs}
            config={config}
            onUpdateConfig={async newCfg => {
              const updated = await api.updateAdminConfig(newCfg);
              setConfig(updated);
              showToast('Platform commercial rules updated');
            }}
            onModerateListing={handleModerateListing}
            onResetDb={async () => {
              await api.resetDatabase();
              await loadAllData();
              showToast('Database reset to clean demo seed state');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPolicy={setActivePolicy}
        onOpenCreateListing={() => setIsCreateListingOpen(true)}
        onSelectCategory={cat => {
          setSelectedCategory(cat);
          setActiveTab('explore');
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ----------------- MODALS ----------------- */}

      {/* Listing Detail View Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          isLiked={wishlistIds.has(selectedListing.id)}
          onToggleLike={handleToggleLike}
          onAddToCart={handleAddToCart}
          onProposeExchange={item => {
            setSelectedListing(null);
            setExchangeTargetListing(item);
          }}
        />
      )}

      {/* Propose Wardrobe Exchange Modal */}
      {exchangeTargetListing && (
        <ProposeExchangeModal
          targetListing={exchangeTargetListing}
          userListings={userOwnListings}
          currentUser={currentUser}
          onClose={() => setExchangeTargetListing(null)}
          onSubmit={handleProposeExchange}
          onOpenCreateListing={() => {
            setExchangeTargetListing(null);
            setIsCreateListingOpen(true);
          }}
        />
      )}

      {/* Exchange Detail & Counteroffer Modal */}
      {selectedExchange && (
        <ExchangeDetailModal
          exchange={selectedExchange}
          currentUser={currentUser}
          onClose={() => setSelectedExchange(null)}
          onUpdateStatus={handleUpdateExchangeStatus}
        />
      )}

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        onSubmit={handleCreateListing}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        discount={checkoutDiscount}
        couponCode={checkoutCouponCode}
        onCompleteOrder={handleCompleteOrder}
      />

      {/* Order Confirmed Success Modal */}
      <OrderSuccessModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewOrders={() => {
          setConfirmedOrder(null);
          setIsProfileOpen(true);
        }}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        orders={orders}
        exchanges={exchanges}
        wishlist={wishlist}
        onOpenListing={l => setSelectedListing(l)}
        onRemoveWishlist={handleToggleLike}
        onUpdateProfile={async data => {
          const updated = await api.updateProfile(data);
          setCurrentUser(updated);
          showToast('Profile information saved');
        }}
      />

      {/* Legal & Policy Draft Modal */}
      <PolicyModal
        policyType={activePolicy}
        onClose={() => setActivePolicy(null)}
      />
    </div>
  );
}
