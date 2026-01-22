# Frontend API Integration Plan

## Objective
Ensure that the frontend API completely interacts with the backend API by creating all missing frontend services.

## Current State Analysis

### Frontend Services (14 files)
| Service | Status | Backend Routes Covered |
|---------|--------|----------------------|
| `api.ts` | ✅ Complete | Base configuration with auth interceptors |
| `authService.ts` | ✅ Complete | `/auth/*` - Login, Register, Logout, Refresh, Me, Password reset, Email verify |
| `cartService.ts` | ✅ Complete | `/cart/*` - Get cart, Add/Update/Remove items, Apply coupon, Sync prices |
| `productService.ts` | ✅ Complete | `/products/*` - List, Get, Create, Update, Delete, Vendor products, Stats |
| `orderService.ts` | ✅ Complete | `/orders/*` - Create, Get, Cancel orders |
| `paymentService.ts` | ✅ Complete | `/payments/*` - Create, Confirm, Status, Refund |
| `categoryService.ts` | ✅ Complete | `/categories/*` - CRUD operations, Tree structure |
| `vendorService.ts` | ✅ Complete | `/vendors/*` - Registration, Profile, Stats |
| `adminService.ts` | ✅ Complete | `/admin/*` - Dashboard, Users, Products, Vendors, Orders |
| `userService.ts` | ✅ Complete | `/users/*` - Profile, Addresses, Preferences |
| `wishlistService.ts` | ✅ Complete | `/wishlist/*` - Add, Remove, Move to cart |
| `reviewService.ts` | ✅ Complete | `/reviews/*` - CRUD, Helpful, User reviews |
| `chatbotService.ts` | ✅ Complete | `/chatbot/*` - Messages, Sessions, Product search |
| `imageSearchService.ts` | ✅ Complete | `/image-search/*` - Upload, Results, Visual recommendations |

### Backend Routes Analysis (13 route files)
| Route File | Endpoint | Frontend Service | Status |
|------------|----------|------------------|--------|
| `auth.routes.ts` | `/api/v1/auth/*` | authService.ts | ✅ Complete |
| `product.routes.ts` | `/api/v1/products/*` | productService.ts | ✅ Complete |
| `cart.routes.ts` | `/api/v1/cart/*` | cartService.ts | ✅ Complete |
| `order.routes.ts` | `/api/v1/orders/*` | orderService.ts | ✅ Complete |
| `payment.routes.ts` | `/api/v1/payments/*` | paymentService.ts | ✅ Complete |
| `category.routes.ts` | `/api/v1/categories/*` | categoryService.ts | ✅ Complete |
| `vendor.routes.ts` | `/api/v1/vendors/*` | vendorService.ts | ✅ Complete |
| `admin.routes.ts` | `/api/v1/admin/*` | adminService.ts | ✅ Complete |
| `chatbot.routes.ts` | `/api/v1/chatbot/*` | chatbotService.ts | ✅ Complete |
| `user.routes.ts` | `/api/v1/users/*` | userService.ts | ✅ Complete |
| `wishlist.routes.ts` | `/api/v1/wishlist/*` | wishlistService.ts | ✅ Complete |
| `review.routes.ts` | `/api/v1/reviews/*` | reviewService.ts | ✅ Complete |
| `imageSearch.routes.ts` | `/api/v1/image-search/*` | imageSearchService.ts | ✅ Complete |

## Missing Services to Create

### 1. orderService.ts
```typescript
// Endpoints to implement:
- POST /orders - Create order
- GET /orders - Get user orders
- GET /orders/:id - Get order by ID
- POST /orders/:id/cancel - Cancel order
- PATCH /orders/:id/status - Update order status (admin)
```

### 2. paymentService.ts
```typescript
// Endpoints to implement:
- POST /payments/create - Create payment
- POST /payments/confirm - Confirm payment
- GET /payments/status/:orderId - Get payment status
- POST /payments/refund - Process refund (admin)
```

### 3. categoryService.ts
```typescript
// Endpoints to implement:
- GET /categories - Get all categories
- GET /categories/:id - Get category by ID
- POST /categories - Create category (admin)
- PUT /categories/:id - Update category (admin)
- DELETE /categories/:id - Delete category (admin)
```

### 4. vendorService.ts
```typescript
// Endpoints to implement:
- GET /vendors - Get all vendors
- GET /vendors/:id - Get vendor by ID
- POST /vendors/register - Register as vendor
- GET /vendors/me - Get vendor profile
- PUT /vendors/me - Update vendor profile
- PATCH /vendors/:id/approve - Approve vendor (admin)
- PATCH /vendors/:id/reject - Reject vendor (admin)
- PATCH /vendors/:id/deactivate - Deactivate vendor (admin)
```

### 5. adminService.ts
```typescript
// Endpoints to implement:
- GET /admin/dashboard/stats - Dashboard statistics
- GET /admin/users - Get all users
- GET /admin/users/:id - Get user by ID
- PATCH /admin/users/:id/role - Update user role
- PATCH /admin/users/:id/deactivate - Deactivate user
- GET /admin/products - Get all products
- PATCH /admin/products/:id/approve - Approve product
- PATCH /admin/products/:id/reject - Reject product
- GET /admin/vendors/pending - Get pending vendors
- PATCH /admin/vendors/:id/approve - Approve vendor
- GET /admin/orders - Get all orders
- PATCH /admin/orders/:id/status - Update order status
```

### 6. chatbotService.ts
```typescript
// Endpoints to implement:
- POST /chatbot/message - Send chat message
- GET /chatbot/session/:id - Get chat session
- GET /chatbot/history/:id - Get conversation history
- DELETE /chatbot/session/:id - Delete chat session
- GET /chatbot/products/search - Search products
```

### 7. userService.ts
```typescript
// Endpoints to implement:
- GET /users/profile - Get user profile
- PUT /users/profile - Update user profile
- GET /users/addresses - Get user addresses
- POST /users/addresses - Add address
- PUT /users/addresses/:id - Update address
- DELETE /users/addresses/:id - Delete address
```

### 8. wishlistService.ts
```typescript
// Endpoints to implement:
- GET /wishlist - Get wishlist
- POST /wishlist - Add to wishlist
- DELETE /wishlist/:productId - Remove from wishlist
- DELETE /wishlist - Clear wishlist
```

### 9. reviewService.ts
```typescript
// Endpoints to implement:
- GET /reviews/product/:productId - Get product reviews
- POST /reviews - Create review
- PUT /reviews/:id - Update review
- DELETE /reviews/:id - Delete review
- GET /reviews/user/:userId - Get user reviews
```

### 10. imageSearchService.ts
```typescript
// Endpoints to implement:
- POST /image-search/upload - Upload image for search
- GET /image-search/results/:id - Get search results
```

## Implementation Plan

### Phase 1: Core Services
1. Create `orderService.ts` - Critical for checkout flow
2. Create `paymentService.ts` - Critical for payment flow
3. Create `categoryService.ts` - Used in navigation and product filtering

### Phase 2: User Features
4. Create `userService.ts` - Profile and address management
5. Create `wishlistService.ts` - Wishlist functionality
6. Create `reviewService.ts` - Product reviews

### Phase 3: Advanced Features
7. Create `vendorService.ts` - Vendor registration and management
8. Create `adminService.ts` - Admin dashboard functionality
9. Create `chatbotService.ts` - AI chatbot integration
10. Create `imageSearchService.ts` - Visual search functionality

### Phase 4: Update Frontend Pages
Update the following pages to use the new services:
- OrdersPage.tsx - Use orderService
- PaymentPage.tsx - Use paymentService
- CategoryPage.tsx - Use categoryService
- VendorDashboardPage.tsx - Use vendorService
- AdminDashboardPage.tsx - Use adminService
- ProfilePage.tsx - Use userService
- WishlistPage.tsx - Use wishlistService

## File Structure
```
frontend/src/services/
├── api.ts              (existing)
├── authService.ts      (existing)
├── cartService.ts      (existing)
├── productService.ts   (existing)
├── orderService.ts     (new)
├── paymentService.ts   (new)
├── categoryService.ts  (new)
├── vendorService.ts    (new)
├── adminService.ts     (new)
├── chatbotService.ts   (new)
├── userService.ts      (new)
├── wishlistService.ts  (new)
├── reviewService.ts    (new)
└── imageSearchService.ts (new)
```

## Types to Add
Update `frontend/src/types/index.ts` with:
- Order types
- Payment types
- Category types
- Vendor types
- User profile types
- Address types
- Wishlist types
- Review types

