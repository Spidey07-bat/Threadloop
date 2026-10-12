export type UserRole = 'customer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  city: string;
  state: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  totalSwaps: number;
  totalSales: number;
  isVerified: boolean;
  createdAt: string;
}

export type ClothingCategory =
  | 'Women'
  | 'Men'
  | 'Unisex'
  | 'Accessories'
  | 'Footwear'
  | 'Bags & Totes'
  | 'Vintage & Y2K';

export type ClothingCondition =
  | 'Brand New with Tags'
  | 'Like New (Worn Once)'
  | 'Gently Used (Excellent)'
  | 'Well Loved (Good)';

export type ListingMode = 'buy_only' | 'exchange_only' | 'buy_and_exchange';

export type ListingStatus = 'active' | 'reserved' | 'sold' | 'exchanged' | 'pending_review' | 'archived';

export interface ProductListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating: number;
  sellerCity: string;
  title: string;
  description: string;
  category: ClothingCategory;
  subcategory: string;
  brand: string;
  size: string;
  color: string;
  material?: string;
  condition: ClothingCondition;
  defectsDisclosed?: string;
  originalPrice: number;
  sellingPrice: number;
  listingMode: ListingMode;
  images: string[];
  status: ListingStatus;
  views: number;
  likes: number;
  city: string;
  state: string;
  pincode: string;
  acceptsReturns: boolean;
  featured?: boolean;
  createdAt: string;
}

export type ExchangeStatus =
  | 'pending'
  | 'counteroffered'
  | 'accepted'
  | 'rejected'
  | 'in_transit'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface ExchangeProposal {
  id: string;
  targetListingId: string;
  targetListing: ProductListing;
  offeredListingId: string;
  offeredListing: ProductListing;
  proposerId: string;
  proposerName: string;
  proposerAvatar: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  status: ExchangeStatus;
  cashDifference: number; // positive = proposer pays owner; negative = owner pays proposer
  note?: string;
  counterOfferNote?: string;
  proposerTracking?: {
    carrier: string;
    trackingNumber: string;
    status: 'shipped' | 'delivered';
    updatedAt: string;
  };
  ownerTracking?: {
    carrier: string;
    trackingNumber: string;
    status: 'shipped' | 'delivered';
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  listingId: string;
  listing: ProductListing;
  addedAt: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  itemPrice: number;
  shippingFee: number;
  platformFee: number;
  discount: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: 'razorpay_upi' | 'razorpay_card' | 'razorpay_netbanking' | 'cod_verified';
  paymentId?: string;
  status: OrderStatus;
  carrier?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  targetUserId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  listingId: string;
  listingTitle: string;
  rating: number; // 1-5
  comment: string;
  type: 'purchase' | 'exchange';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'exchange' | 'system' | 'price_drop';
  read: boolean;
  linkAction?: string;
  createdAt: string;
}

export interface PlatformStats {
  totalListings: number;
  activeListings: number;
  totalOrders: number;
  gmv: number;
  totalExchanges: number;
  completedExchanges: number;
  totalUsers: number;
  treesEquivalentSaved: number;
  waterLitresSaved: number;
  co2KgSaved: number;
}
