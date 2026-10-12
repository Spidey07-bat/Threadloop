import fs from 'fs';
import path from 'path';
import {
  User,
  ProductListing,
  ExchangeProposal,
  Order,
  Review,
  Notification,
  PlatformStats,
  CartItem
} from '../src/types/index.js';
import {
  SEED_USERS,
  SEED_LISTINGS,
  SEED_EXCHANGES,
  SEED_ORDERS,
  SEED_REVIEWS,
  SEED_NOTIFICATIONS
} from './seedData.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'threadloop-db.json');

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface PlatformConfig {
  platformFeePercent: number; // e.g. 5%
  baseShippingFee: number; // INR
  freeShippingAbove: number; // INR
  sustainabilityPlatformFee: number; // INR 29
  razorpayKeyId: string;
  coupons: {
    code: string;
    discountPercent?: number;
    flatDiscount?: number;
    minSpend: number;
    description: string;
    active: boolean;
  }[];
}

export interface DatabaseSchema {
  users: User[];
  listings: ProductListing[];
  exchanges: ExchangeProposal[];
  orders: Order[];
  reviews: Review[];
  notifications: Notification[];
  carts: Record<string, CartItem[]>; // userId -> CartItem[]
  wishlists: Record<string, string[]>; // userId -> listingId[]
  config: PlatformConfig;
  auditLogs: AuditLog[];
}

const DEFAULT_CONFIG: PlatformConfig = {
  platformFeePercent: 8,
  baseShippingFee: 80,
  freeShippingAbove: 2499,
  sustainabilityPlatformFee: 29,
  razorpayKeyId: 'rzp_test_threadloop_sandbox',
  coupons: [
    {
      code: 'CIRCULAR50',
      flatDiscount: 50,
      minSpend: 499,
      description: 'Flat ₹50 OFF on your first pre-loved circular fashion order',
      active: true
    },
    {
      code: 'THREAD10',
      discountPercent: 10,
      minSpend: 999,
      description: '10% OFF on wardrobe resale collections',
      active: true
    },
    {
      code: 'SWAPFEST',
      flatDiscount: 150,
      minSpend: 1999,
      description: 'Special ₹150 discount for top circular community shoppers',
      active: true
    }
  ]
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to read db file, initializing with defaults', err);
    }

    const initial: DatabaseSchema = {
      users: [...SEED_USERS],
      listings: [...SEED_LISTINGS],
      exchanges: [...SEED_EXCHANGES],
      orders: [...SEED_ORDERS],
      reviews: [...SEED_REVIEWS],
      notifications: [...SEED_NOTIFICATIONS],
      carts: {
        usr_demo_customer: [
          {
            listingId: 'lst_002',
            listing: SEED_LISTINGS[1],
            addedAt: new Date().toISOString()
          }
        ]
      },
      wishlists: {
        usr_demo_customer: ['lst_001', 'lst_005']
      },
      config: DEFAULT_CONFIG,
      auditLogs: [
        {
          id: 'log_1',
          actorId: 'usr_demo_admin',
          actorName: 'Aditi Rao',
          action: 'SYSTEM_INIT',
          targetId: 'sys',
          details: 'ThreadLoop database bootstrapped with production seed data.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db file', err);
    }
  }

  // --- Users & Auth ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData: Partial<User> & { name: string; email: string; role?: 'customer' | 'seller' | 'admin' }): User {
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'customer',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
      phone: userData.phone || '',
      city: userData.city || 'Bengaluru',
      state: userData.state || 'Karnataka',
      bio: userData.bio || 'New member of the circular fashion community.',
      rating: 5.0,
      reviewCount: 0,
      totalSwaps: 0,
      totalSales: 0,
      isVerified: true,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.saveData();
    return this.data.users[idx];
  }

  // --- Listings ---
  getListings(filters?: {
    category?: string;
    condition?: string;
    mode?: string;
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    status?: string;
    sellerId?: string;
  }): ProductListing[] {
    let list = [...this.data.listings];

    if (!filters) return list;

    if (filters.status) {
      list = list.filter(l => l.status === filters.status);
    } else {
      // By default show active
      list = list.filter(l => l.status === 'active');
    }

    if (filters.sellerId) {
      list = list.filter(l => l.sellerId === filters.sellerId);
    }

    if (filters.category && filters.category !== 'All') {
      list = list.filter(l => l.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters.condition) {
      list = list.filter(l => l.condition === filters.condition);
    }

    if (filters.mode) {
      if (filters.mode === 'exchange') {
        list = list.filter(l => l.listingMode === 'exchange_only' || l.listingMode === 'buy_and_exchange');
      } else if (filters.mode === 'buy') {
        list = list.filter(l => l.listingMode === 'buy_only' || l.listingMode === 'buy_and_exchange');
      }
    }

    if (filters.city) {
      list = list.filter(l => l.city.toLowerCase() === filters.city!.toLowerCase());
    }

    if (filters.minPrice !== undefined) {
      list = list.filter(l => l.sellingPrice >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      list = list.filter(l => l.sellingPrice <= filters.maxPrice!);
    }

    if (filters.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.brand.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q)
      );
    }

    return list;
  }

  getListingById(id: string): ProductListing | undefined {
    return this.data.listings.find(l => l.id === id);
  }

  createListing(listingData: Omit<ProductListing, 'id' | 'views' | 'likes' | 'createdAt'>): ProductListing {
    const newListing: ProductListing = {
      ...listingData,
      id: `lst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      views: 1,
      likes: 0,
      createdAt: new Date().toISOString()
    };
    this.data.listings.unshift(newListing);
    this.logAudit(listingData.sellerId, listingData.sellerName, 'CREATE_LISTING', newListing.id, `Created listing: ${newListing.title}`);
    this.saveData();
    return newListing;
  }

  updateListing(id: string, updates: Partial<ProductListing>, actorId: string, actorName: string): ProductListing | undefined {
    const idx = this.data.listings.findIndex(l => l.id === id);
    if (idx === -1) return undefined;
    this.data.listings[idx] = { ...this.data.listings[idx], ...updates };
    this.logAudit(actorId, actorName, 'UPDATE_LISTING', id, `Updated listing fields: ${Object.keys(updates).join(', ')}`);
    this.saveData();
    return this.data.listings[idx];
  }

  incrementListingViews(id: string) {
    const listing = this.data.listings.find(l => l.id === id);
    if (listing) {
      listing.views = (listing.views || 0) + 1;
      this.saveData();
    }
  }

  toggleListingLike(id: string, userId: string): { likes: number; isLiked: boolean } {
    const listing = this.data.listings.find(l => l.id === id);
    if (!listing) return { likes: 0, isLiked: false };

    if (!this.data.wishlists[userId]) {
      this.data.wishlists[userId] = [];
    }

    const isLiked = this.data.wishlists[userId].includes(id);
    if (isLiked) {
      this.data.wishlists[userId] = this.data.wishlists[userId].filter(x => x !== id);
      listing.likes = Math.max(0, (listing.likes || 1) - 1);
    } else {
      this.data.wishlists[userId].push(id);
      listing.likes = (listing.likes || 0) + 1;
    }
    this.saveData();
    return { likes: listing.likes, isLiked: !isLiked };
  }

  deleteListing(id: string, actorId: string, actorName: string): boolean {
    const idx = this.data.listings.findIndex(l => l.id === id);
    if (idx === -1) return false;
    const removed = this.data.listings.splice(idx, 1)[0];
    this.logAudit(actorId, actorName, 'DELETE_LISTING', id, `Deleted listing: ${removed.title}`);
    this.saveData();
    return true;
  }

  // --- Cart & Wishlist ---
  getCart(userId: string): CartItem[] {
    return this.data.carts[userId] || [];
  }

  addToCart(userId: string, listingId: string): CartItem[] {
    const listing = this.getListingById(listingId);
    if (!listing || listing.status !== 'active') {
      throw new Error('Item is not available for purchase');
    }

    if (!this.data.carts[userId]) {
      this.data.carts[userId] = [];
    }

    const exists = this.data.carts[userId].some(item => item.listingId === listingId);
    if (!exists) {
      this.data.carts[userId].push({
        listingId,
        listing,
        addedAt: new Date().toISOString()
      });
    }
    this.saveData();
    return this.data.carts[userId];
  }

  removeFromCart(userId: string, listingId: string): CartItem[] {
    if (!this.data.carts[userId]) return [];
    this.data.carts[userId] = this.data.carts[userId].filter(item => item.listingId !== listingId);
    this.saveData();
    return this.data.carts[userId];
  }

  clearCart(userId: string) {
    this.data.carts[userId] = [];
    this.saveData();
  }

  getWishlist(userId: string): ProductListing[] {
    const ids = this.data.wishlists[userId] || [];
    return this.data.listings.filter(l => ids.includes(l.id));
  }

  // --- Exchanges ---
  getExchanges(userId?: string): ExchangeProposal[] {
    if (!userId) return this.data.exchanges;
    return this.data.exchanges.filter(e => e.proposerId === userId || e.ownerId === userId);
  }

  getExchangeById(id: string): ExchangeProposal | undefined {
    return this.data.exchanges.find(e => e.id === id);
  }

  createExchangeProposal(proposal: {
    targetListingId: string;
    offeredListingId: string;
    proposerId: string;
    cashDifference?: number;
    note?: string;
  }): ExchangeProposal {
    const targetListing = this.getListingById(proposal.targetListingId);
    const offeredListing = this.getListingById(proposal.offeredListingId);
    const proposer = this.getUserById(proposal.proposerId);

    if (!targetListing || !offeredListing || !proposer) {
      throw new Error('Invalid listings or proposer for exchange');
    }

    if (targetListing.status !== 'active' || offeredListing.status !== 'active') {
      throw new Error('Both garments must be active and available to propose an exchange');
    }

    const owner = this.getUserById(targetListing.sellerId);
    if (!owner) throw new Error('Listing owner not found');

    const newExchange: ExchangeProposal = {
      id: `exc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      targetListingId: targetListing.id,
      targetListing,
      offeredListingId: offeredListing.id,
      offeredListing,
      proposerId: proposer.id,
      proposerName: proposer.name,
      proposerAvatar: proposer.avatar,
      ownerId: owner.id,
      ownerName: owner.name,
      ownerAvatar: owner.avatar,
      status: 'pending',
      cashDifference: proposal.cashDifference || 0,
      note: proposal.note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.exchanges.unshift(newExchange);

    // Notify owner
    this.addNotification({
      userId: owner.id,
      title: 'New Exchange Proposal! 🔄',
      message: `${proposer.name} proposed to swap "${offeredListing.title}" for your "${targetListing.title}".`,
      type: 'exchange'
    });

    this.logAudit(proposer.id, proposer.name, 'PROPOSE_EXCHANGE', newExchange.id, `Proposed swap for ${targetListing.title}`);
    this.saveData();
    return newExchange;
  }

  updateExchangeStatus(
    exchangeId: string,
    status: ExchangeProposal['status'],
    actorId: string,
    options?: {
      counterOfferNote?: string;
      cashDifference?: number;
      carrier?: string;
      trackingNumber?: string;
    }
  ): ExchangeProposal {
    const exchange = this.getExchangeById(exchangeId);
    if (!exchange) throw new Error('Exchange proposal not found');

    const prevStatus = exchange.status;
    exchange.status = status;
    exchange.updatedAt = new Date().toISOString();

    if (options?.counterOfferNote) {
      exchange.counterOfferNote = options.counterOfferNote;
    }
    if (options?.cashDifference !== undefined) {
      exchange.cashDifference = options.cashDifference;
    }

    // Handle tracking updates
    if (options?.carrier && options?.trackingNumber) {
      const trackingData = {
        carrier: options.carrier,
        trackingNumber: options.trackingNumber,
        status: 'shipped' as const,
        updatedAt: new Date().toISOString()
      };

      if (actorId === exchange.proposerId) {
        exchange.proposerTracking = trackingData;
      } else {
        exchange.ownerTracking = trackingData;
      }

      // If both shipped, set in_transit
      if (exchange.proposerTracking && exchange.ownerTracking) {
        exchange.status = 'in_transit';
      }
    }

    // If accepted, reserve both listings
    if (status === 'accepted') {
      const target = this.getListingById(exchange.targetListingId);
      const offered = this.getListingById(exchange.offeredListingId);
      if (target) target.status = 'reserved';
      if (offered) offered.status = 'reserved';

      // Send notifications to both
      this.addNotification({
        userId: exchange.proposerId,
        title: 'Exchange Accepted! 🤝',
        message: `${exchange.ownerName} accepted your wardrobe swap for "${target?.title}". Time to dispatch!`,
        type: 'exchange'
      });
      this.addNotification({
        userId: exchange.ownerId,
        title: 'Exchange Confirmed! 📦',
        message: `You accepted exchange with ${exchange.proposerName}. Please print shipping label.`,
        type: 'exchange'
      });
    }

    if (status === 'completed') {
      const target = this.getListingById(exchange.targetListingId);
      const offered = this.getListingById(exchange.offeredListingId);
      if (target) target.status = 'exchanged';
      if (offered) offered.status = 'exchanged';

      // Increment swaps for both
      const pUser = this.getUserById(exchange.proposerId);
      if (pUser) pUser.totalSwaps += 1;
      const oUser = this.getUserById(exchange.ownerId);
      if (oUser) oUser.totalSwaps += 1;
    }

    this.logAudit(actorId, 'User', 'UPDATE_EXCHANGE_STATUS', exchangeId, `Changed status from ${prevStatus} to ${status}`);
    this.saveData();
    return exchange;
  }

  // --- Orders ---
  getOrders(filters?: { buyerId?: string; sellerId?: string }): Order[] {
    let list = [...this.data.orders];
    if (filters?.buyerId) {
      list = list.filter(o => o.buyerId === filters.buyerId);
    }
    if (filters?.sellerId) {
      list = list.filter(o => o.sellerId === filters.sellerId);
    }
    return list;
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  createOrder(params: {
    buyerId: string;
    listingId: string;
    shippingAddress: Order['shippingAddress'];
    paymentMethod: Order['paymentMethod'];
    couponCode?: string;
  }): Order {
    const buyer = this.getUserById(params.buyerId);
    const listing = this.getListingById(params.listingId);

    if (!buyer || !listing) {
      throw new Error('Buyer or listing not found');
    }

    if (listing.status !== 'active') {
      throw new Error('This fashion piece is no longer available');
    }

    const seller = this.getUserById(listing.sellerId);
    if (!seller) throw new Error('Seller not found');

    let discount = 0;
    if (params.couponCode) {
      const coupon = this.data.config.coupons.find(c => c.code.toUpperCase() === params.couponCode!.toUpperCase() && c.active);
      if (coupon && listing.sellingPrice >= coupon.minSpend) {
        if (coupon.flatDiscount) {
          discount = coupon.flatDiscount;
        } else if (coupon.discountPercent) {
          discount = Math.round((listing.sellingPrice * coupon.discountPercent) / 100);
        }
      }
    }

    const shippingFee = listing.sellingPrice >= this.data.config.freeShippingAbove ? 0 : this.data.config.baseShippingFee;
    const platformFee = this.data.config.sustainabilityPlatformFee;
    const totalAmount = Math.max(0, listing.sellingPrice + shippingFee + platformFee - discount);

    const orderNumber = `TL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderNumber,
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      sellerId: seller.id,
      sellerName: seller.name,
      listingId: listing.id,
      listingTitle: listing.title,
      listingImage: listing.images[0] || '',
      itemPrice: listing.sellingPrice,
      shippingFee,
      platformFee,
      discount,
      totalAmount,
      shippingAddress: params.shippingAddress,
      paymentMethod: params.paymentMethod,
      paymentId: `pay_rzp_mock_${Date.now().toString(36)}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Mark listing as sold
    listing.status = 'sold';

    // Remove from all carts
    Object.keys(this.data.carts).forEach(uid => {
      this.data.carts[uid] = (this.data.carts[uid] || []).filter(c => c.listingId !== listing.id);
    });

    // Increment seller sales
    seller.totalSales = (seller.totalSales || 0) + 1;

    this.data.orders.unshift(newOrder);

    // Notify buyer & seller
    this.addNotification({
      userId: buyer.id,
      title: 'Order Confirmed! 🎉',
      message: `Your order #${orderNumber} for "${listing.title}" is confirmed. Track it anytime in your dashboard.`,
      type: 'order'
    });

    this.addNotification({
      userId: seller.id,
      title: 'New Sale! 💰',
      message: `Great news! "${listing.title}" was purchased by ${buyer.name}. Please package & ship the item.`,
      type: 'order'
    });

    this.logAudit(buyer.id, buyer.name, 'CREATE_ORDER', newOrder.id, `Order placed for ${listing.title} (Amount: ₹${totalAmount})`);
    this.saveData();
    return newOrder;
  }

  updateOrderStatus(orderId: string, status: Order['status'], details?: { carrier?: string; trackingNumber?: string }): Order {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (details?.carrier) order.carrier = details.carrier;
    if (details?.trackingNumber) order.trackingNumber = details.trackingNumber;

    if (status === 'shipped') {
      this.addNotification({
        userId: order.buyerId,
        title: 'Order Shipped 🚚',
        message: `Your order #${order.orderNumber} is on the way via ${order.carrier || 'Express Courier'} (${order.trackingNumber || 'Tracking Active'}).`,
        type: 'order'
      });
    } else if (status === 'delivered') {
      this.addNotification({
        userId: order.buyerId,
        title: 'Order Delivered! 👗',
        message: `Your garment for order #${order.orderNumber} has been delivered. Enjoy wearing sustainable fashion!`,
        type: 'order'
      });
    }

    this.saveData();
    return order;
  }

  // --- Reviews ---
  getReviewsForUser(userId: string): Review[] {
    return this.data.reviews.filter(r => r.targetUserId === userId);
  }

  createReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Review {
    const newReview: Review = {
      ...reviewData,
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.data.reviews.unshift(newReview);

    // Update target user's rating & review count
    const targetUser = this.getUserById(reviewData.targetUserId);
    if (targetUser) {
      const userReviews = this.data.reviews.filter(r => r.targetUserId === targetUser.id);
      const avg = userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length;
      targetUser.rating = Math.round(avg * 10) / 10;
      targetUser.reviewCount = userReviews.length;
    }

    this.saveData();
    return newReview;
  }

  // --- Notifications ---
  getNotifications(userId: string): Notification[] {
    return (this.data.notifications || []).filter(n => n.userId === userId);
  }

  addNotification(n: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
    const notif: Notification = {
      ...n,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    this.saveData();
    return notif;
  }

  markNotificationRead(id: string, userId: string) {
    const n = this.data.notifications.find(item => item.id === id && item.userId === userId);
    if (n) {
      n.read = true;
      this.saveData();
    }
  }

  markAllNotificationsRead(userId: string) {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    this.saveData();
  }

  // --- Stats & Admin ---
  getPlatformStats(): PlatformStats {
    const totalListings = this.data.listings.length;
    const activeListings = this.data.listings.filter(l => l.status === 'active').length;
    const totalOrders = this.data.orders.length;
    const gmv = this.data.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalExchanges = this.data.exchanges.length;
    const completedExchanges = this.data.exchanges.filter(e => e.status === 'completed' || e.status === 'accepted' || e.status === 'in_transit').length;
    const totalUsers = this.data.users.length;

    // Environmental metrics based on verified circular fashion research:
    // Avg circular garment reuse saves ~2,700 liters of water and ~3.6 kg CO2 eq.
    const itemsCirculated = totalOrders + (completedExchanges * 2);
    const waterLitresSaved = itemsCirculated * 2700;
    const co2KgSaved = Math.round(itemsCirculated * 3.6);
    const treesEquivalentSaved = Math.round(co2KgSaved / 21); // ~21 kg CO2 absorbed per mature tree per year

    return {
      totalListings,
      activeListings,
      totalOrders,
      gmv,
      totalExchanges,
      completedExchanges,
      totalUsers,
      treesEquivalentSaved,
      waterLitresSaved,
      co2KgSaved
    };
  }

  getConfig(): PlatformConfig {
    return this.data.config;
  }

  updateConfig(updates: Partial<PlatformConfig>, adminId: string, adminName: string): PlatformConfig {
    this.data.config = { ...this.data.config, ...updates };
    this.logAudit(adminId, adminName, 'UPDATE_CONFIG', 'config', `Updated settings: ${Object.keys(updates).join(', ')}`);
    this.saveData();
    return this.data.config;
  }

  getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  logAudit(actorId: string, actorName: string, action: string, targetId: string, details: string) {
    const log: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId,
      actorName,
      action,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
  }

  // Reset to seed data
  resetDatabase() {
    this.data = {
      users: [...SEED_USERS],
      listings: [...SEED_LISTINGS],
      exchanges: [...SEED_EXCHANGES],
      orders: [...SEED_ORDERS],
      reviews: [...SEED_REVIEWS],
      notifications: [...SEED_NOTIFICATIONS],
      carts: {
        usr_demo_customer: [
          {
            listingId: 'lst_002',
            listing: SEED_LISTINGS[1],
            addedAt: new Date().toISOString()
          }
        ]
      },
      wishlists: {
        usr_demo_customer: ['lst_001', 'lst_005']
      },
      config: DEFAULT_CONFIG,
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          actorId: 'usr_demo_admin',
          actorName: 'Aditi Rao',
          action: 'DB_RESET',
          targetId: 'sys',
          details: 'ThreadLoop database re-seeded to pristine demo state.',
          timestamp: new Date().toISOString()
        }
      ]
    };
    this.saveData();
  }
}

export const db = new Database();
