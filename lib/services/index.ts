// Export all services for easy importing
export { BaseService } from './base.service';
export { AuthService } from './auth.service';
export { CategoriesService } from './categories.service';
export { ProductsService } from './products.service';
export { VendorsService } from './vendors.service';
export { OrdersService } from './orders.service';
export { CartService } from './cart.service';
export { WishlistService } from './wishlist.service';
export { ReviewsService } from './reviews.service';
export { StatsService } from './stats.service';

// Export types
export type {
  ServiceResponse,
  PaginatedResponse,
  PaginationParams
} from './base.service';

export type {
  UserProfile,
  SignUpData,
  SignInData,
  UpdateProfileData,
  ChangePasswordData,
  AuthResponse
} from './auth.service';

export type {
  Category,
  CategoryReference,
  CategoryFilters,
  CreateCategoryData,
  UpdateCategoryData
} from './categories.service';

export type {
  Product,
  ProductFilters,
  ProductSortOptions,
  CreateProductData,
  UpdateProductData
} from './products.service';

export type {
  Vendor,
  VendorFilters,
  CreateVendorData,
  UpdateVendorData,
  VendorStats
} from './vendors.service';

export type {
  Order,
  OrderItem,
  OrderFilters,
  CreateOrderData,
  UpdateOrderData,
  OrderStats
} from './orders.service';

export type {
  CartItem,
  CartSummary,
  AddToCartData,
  UpdateCartItemData
} from './cart.service';

export type {
  WishlistItem,
  WishlistFilters
} from './wishlist.service';

export type {
  ProductReview,
  ReviewFilters,
  CreateReviewData,
  UpdateReviewData,
  ReviewStats
} from './reviews.service';

export type {
  DashboardStats,
  SalesData,
  CategoryData,
  MonthlyStats
} from './stats.service';