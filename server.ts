import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { db } from './server/db.js';
import { User } from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Process safety handlers
process.on('uncaughtException', (err) => {
  console.error('ThreadLoop server uncaughtException:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('ThreadLoop server unhandledRejection:', reason);
});

const args = process.argv.slice(2);
function getArg(flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : undefined;
}

const cliPort = getArg('--port');
const cliHost = getArg('--host');
const PORT = cliPort ? parseInt(cliPort, 10) : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
const HOST = cliHost || process.env.HOST || '0.0.0.0';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ----------------- WEBSOCKET BROADCAST SYSTEM ----------------- //

interface ClientMeta {
  userId?: string;
  connectedAt: string;
}

const wsClients = new Map<WebSocket, ClientMeta>();

export function broadcastWs(type: string, payload: any) {
  const message = JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString()
  });

  wsClients.forEach((_meta, ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(message);
      } catch (err) {
        console.error('WebSocket send error:', err);
      }
    }
  });
}

function broadcastPresence() {
  const activeCount = Math.max(1, wsClients.size);
  broadcastWs('presence:update', {
    activeUsers: activeCount,
    timestamp: new Date().toISOString()
  });
}

// Helper to extract actor from request headers
function getAuthUser(req: Request): User {
  const userId = (req.headers['x-user-id'] as string) || 'usr_demo_customer';
  const found = db.getUserById(userId) || db.getUserById('usr_demo_customer');
  return found || db.getUsers()[0];
}

// ----------------- API ROUTES ----------------- //

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    brand: 'ThreadLoop',
    websocket: 'enabled',
    activeConnections: wsClients.size,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Platform Stats & Eco Metrics
app.get('/api/stats', (_req, res) => {
  try {
    const stats = db.getPlatformStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Platform Config & Active Coupons
app.get('/api/config', (_req, res) => {
  try {
    const config = db.getConfig();
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Auth Routes ---
app.get('/api/auth/users', (_req, res) => {
  try {
    const users = db.getUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/current', (req, res) => {
  try {
    const user = getAuthUser(req);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, userId } = req.body;
    if (userId) {
      const user = db.getUserById(userId);
      if (user) return res.json(user);
    }
    if (email) {
      const user = db.getUserByEmail(email);
      if (user) return res.json(user);
    }
    const fallback = db.getUserById('usr_demo_customer');
    res.json(fallback);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, role, city, state, phone, bio } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }
    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
    const newUser = db.createUser({ name, email, role, city, state, phone, bio });
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/auth/profile', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const updated = db.updateUser(user.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Listings Routes ---
app.get('/api/listings', (req, res) => {
  try {
    const { category, condition, mode, query, minPrice, maxPrice, city, status, sellerId } = req.query;
    const listings = db.getListings({
      category: category as string,
      condition: condition as string,
      mode: mode as string,
      query: query as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      city: city as string,
      status: status as string,
      sellerId: sellerId as string
    });
    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/listings/:id', (req, res) => {
  try {
    const listing = db.getListingById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    db.incrementListingViews(listing.id);
    res.json(listing);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/listings', (req, res) => {
  try {
    const user = getAuthUser(req);
    const {
      title,
      description,
      category,
      subcategory,
      brand,
      size,
      color,
      material,
      condition,
      defectsDisclosed,
      originalPrice,
      sellingPrice,
      listingMode,
      images,
      city,
      state,
      pincode,
      acceptsReturns
    } = req.body;

    if (!title || !category || !condition || !sellingPrice || !images?.length) {
      return res.status(400).json({ error: 'Missing required listing information' });
    }

    const listing = db.createListing({
      sellerId: user.id,
      sellerName: user.name,
      sellerAvatar: user.avatar,
      sellerRating: user.rating,
      sellerCity: user.city,
      title,
      description: description || '',
      category,
      subcategory: subcategory || 'Clothing',
      brand: brand || 'Unbranded / Vintage',
      size: size || 'M',
      color: color || 'Multi',
      material: material || 'Cotton',
      condition,
      defectsDisclosed: defectsDisclosed || 'None disclosed.',
      originalPrice: Number(originalPrice) || Number(sellingPrice) * 2,
      sellingPrice: Number(sellingPrice),
      listingMode: listingMode || 'buy_and_exchange',
      images: Array.isArray(images) ? images : [images],
      status: 'active',
      city: city || user.city,
      state: state || user.state,
      pincode: pincode || '560001',
      acceptsReturns: acceptsReturns ?? true
    });

    // Real-Time WebSocket broadcast
    broadcastWs('listing:created', listing);

    res.status(201).json(listing);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/listings/:id', (req, res) => {
  try {
    const user = getAuthUser(req);
    const existing = db.getListingById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Listing not found' });

    if (existing.sellerId !== user?.id && user?.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to edit this listing' });
    }

    const updated = db.updateListing(req.params.id, req.body, user.id, user.name);

    // Real-Time WebSocket broadcast
    broadcastWs('listing:updated', updated);

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/listings/:id', (req, res) => {
  try {
    const user = getAuthUser(req);
    const existing = db.getListingById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Listing not found' });

    if (existing.sellerId !== user?.id && user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const ok = db.deleteListing(req.params.id, user.id, user.name);

    // Real-Time WebSocket broadcast
    broadcastWs('listing:deleted', { id: req.params.id });

    res.json({ success: ok });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/listings/:id/like', (req, res) => {
  try {
    const user = getAuthUser(req);
    const result = db.toggleListingLike(req.params.id, user.id);

    // Real-Time WebSocket broadcast
    broadcastWs('listing:liked', { id: req.params.id, ...result });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Cart & Wishlist Routes ---
app.get('/api/cart', (req, res) => {
  try {
    const user = getAuthUser(req);
    const cart = db.getCart(user.id);
    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart', (req, res) => {
  try {
    const user = getAuthUser(req);
    const { listingId } = req.body;
    if (!listingId) return res.status(400).json({ error: 'listingId is required' });
    const cart = db.addToCart(user.id, listingId);
    res.json(cart);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/cart/:listingId', (req, res) => {
  try {
    const user = getAuthUser(req);
    const cart = db.removeFromCart(user.id, req.params.listingId);
    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart', (req, res) => {
  try {
    const user = getAuthUser(req);
    db.clearCart(user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/wishlist', (req, res) => {
  try {
    const user = getAuthUser(req);
    const wishlist = db.getWishlist(user.id);
    res.json(wishlist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Exchange Proposals ---
app.get('/api/exchanges', (req, res) => {
  try {
    const user = getAuthUser(req);
    const exchanges = db.getExchanges(user.role === 'admin' ? undefined : user.id);
    res.json(exchanges);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/exchanges/:id', (req, res) => {
  try {
    const exchange = db.getExchangeById(req.params.id);
    if (!exchange) return res.status(404).json({ error: 'Exchange proposal not found' });
    res.json(exchange);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/exchanges', (req, res) => {
  try {
    const user = getAuthUser(req);
    const { targetListingId, offeredListingId, cashDifference, note } = req.body;
    if (!targetListingId || !offeredListingId) {
      return res.status(400).json({ error: 'Both target and offered listings are required' });
    }

    const proposal = db.createExchangeProposal({
      targetListingId,
      offeredListingId,
      proposerId: user.id,
      cashDifference: Number(cashDifference) || 0,
      note
    });

    // Real-Time WebSocket broadcast
    broadcastWs('exchange:created', proposal);

    res.status(201).json(proposal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/exchanges/:id/status', (req, res) => {
  try {
    const user = getAuthUser(req);
    const { status, counterOfferNote, cashDifference, carrier, trackingNumber } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const updated = db.updateExchangeStatus(req.params.id, status, user.id, {
      counterOfferNote,
      cashDifference: cashDifference !== undefined ? Number(cashDifference) : undefined,
      carrier,
      trackingNumber
    });

    // Real-Time WebSocket broadcast
    broadcastWs('exchange:status_changed', updated);

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- Orders & Checkout ---
app.get('/api/orders', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (user.role === 'admin') {
      res.json(db.getOrders());
    } else if (user.role === 'seller') {
      res.json(db.getOrders({ sellerId: user.id }));
    } else {
      res.json(db.getOrders({ buyerId: user.id }));
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const user = getAuthUser(req);
    const { listingId, shippingAddress, paymentMethod, couponCode } = req.body;
    if (!listingId || !shippingAddress) {
      return res.status(400).json({ error: 'listingId and shippingAddress are required' });
    }

    const order = db.createOrder({
      buyerId: user.id,
      listingId,
      shippingAddress,
      paymentMethod: paymentMethod || 'razorpay_upi',
      couponCode
    });

    // Real-Time WebSocket broadcast
    broadcastWs('order:created', order);

    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/orders/:id/status', (req, res) => {
  try {
    const { status, carrier, trackingNumber } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    const order = db.updateOrderStatus(req.params.id, status, { carrier, trackingNumber });

    // Real-Time WebSocket broadcast
    broadcastWs('order:status_changed', order);

    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- Coupons ---
app.post('/api/coupons/validate', (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code required' });

    const config = db.getConfig();
    const coupon = config.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.active);

    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid or expired coupon code' });
    }

    if (cartTotal && cartTotal < coupon.minSpend) {
      return res.status(400).json({
        valid: false,
        message: `Minimum order value of ₹${coupon.minSpend} required for coupon ${coupon.code}`
      });
    }

    let discount = 0;
    if (coupon.flatDiscount) {
      discount = coupon.flatDiscount;
    } else if (coupon.discountPercent && cartTotal) {
      discount = Math.round((cartTotal * coupon.discountPercent) / 100);
    }

    res.json({
      valid: true,
      code: coupon.code,
      discount,
      description: coupon.description
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Reviews ---
app.get('/api/reviews/:userId', (req, res) => {
  try {
    const reviews = db.getReviewsForUser(req.params.userId);
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reviews', (req, res) => {
  try {
    const user = getAuthUser(req);
    const { targetUserId, listingId, listingTitle, rating, comment, type } = req.body;
    if (!targetUserId || !rating || !comment) {
      return res.status(400).json({ error: 'Target user, rating, and comment are required' });
    }

    const review = db.createReview({
      targetUserId,
      reviewerId: user.id,
      reviewerName: user.name,
      reviewerAvatar: user.avatar,
      listingId: listingId || 'lst_direct',
      listingTitle: listingTitle || 'Marketplace Item',
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment,
      type: type || 'purchase'
    });

    res.status(201).json(review);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- Notifications ---
app.get('/api/notifications', (req, res) => {
  try {
    const user = getAuthUser(req);
    const notifs = db.getNotifications(user.id);
    res.json(notifs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/:id/read', (req, res) => {
  try {
    const user = getAuthUser(req);
    db.markNotificationRead(req.params.id, user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/read-all', (req, res) => {
  try {
    const user = getAuthUser(req);
    db.markAllNotificationsRead(user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Admin Endpoints ---
app.get('/api/admin/metrics', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator privileges required' });
    }
    const stats = db.getPlatformStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/logs', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator privileges required' });
    }
    const logs = db.getAuditLogs();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/config', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator privileges required' });
    }
    const config = db.updateConfig(req.body, user.id, user.name);
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/reset', (req, res) => {
  try {
    const user = getAuthUser(req);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator privileges required' });
    }
    db.resetDatabase();
    broadcastWs('database:reset', { timestamp: new Date().toISOString() });
    res.json({ success: true, message: 'Database reset to demo state' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- VITE & WEBSOCKET SERVER ----------------- //

async function startServer() {
  const server = http.createServer(app);

  // Initialize WebSocketServer
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    try {
      const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
      const isWsPath = url.pathname === '/ws' || url.pathname === '/ws/' || url.pathname.startsWith('/ws') || url.pathname === '/api/ws' || url.pathname === '/websocket';
      if (isWsPath) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    } catch (err) {
      console.error('WebSocket upgrade error:', err);
    }
  });

  wss.on('connection', (ws: WebSocket, request?: http.IncomingMessage) => {
    let initialUserId: string | undefined;
    if (request?.url) {
      try {
        const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
        initialUserId = url.searchParams.get('userId') || undefined;
      } catch {
        // ignore
      }
    }

    wsClients.set(ws, {
      userId: initialUserId,
      connectedAt: new Date().toISOString()
    });
    broadcastPresence();

    // Send welcome packet
    ws.send(JSON.stringify({
      type: 'connection:established',
      payload: {
        message: 'Connected to ThreadLoop Real-Time Gateway ⚡',
        activeUsers: Math.max(1, wsClients.size),
        timestamp: new Date().toISOString()
      }
    }));

    ws.on('message', (messageData) => {
      try {
        const data = JSON.parse(messageData.toString());
        if (data.type === 'auth' && data.userId) {
          const meta = wsClients.get(ws);
          if (meta) meta.userId = data.userId;
          broadcastPresence();
        } else if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (err) {
        // ignore parse error
      }
    });

    ws.on('close', () => {
      wsClients.delete(ws);
      broadcastPresence();
    });

    ws.on('error', () => {
      wsClients.delete(ws);
      broadcastPresence();
    });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.on('error', (err: any) => {
    console.error('ThreadLoop server error:', err);
  });

  server.listen(PORT, HOST, () => {
    console.log(`🚀 ThreadLoop Fashion Marketplace running with WebSockets at http://${HOST}:${PORT}`);
  });
}

startServer();
