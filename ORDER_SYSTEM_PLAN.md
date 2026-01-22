# Order System Completion Plan

## Summary
The order system is missing critical admin functionality and payment integration. This plan addresses all gaps.

---

## Phase 1: Admin Order Management

### 1.1 Update `src/types/order.types.ts`
- [ ] Add `OrderFilterDto` interface for filtering orders
- [ ] Add `RefundDto` interface
- [ ] Add `OrderStatsDto` implementation
- [ ] Add `AdminOrderListItemDto` with vendor info

### 1.2 Update `src/services/order.service.ts`
- [ ] Add `getAllOrders(adminId, filters, pagination)` - Admin view all orders
- [ ] Add `getOrderStats(dateRange)` - Revenue and order statistics
- [ ] Add `processRefund(orderId, amount, reason)` - Refund processing
- [ ] Add `updatePaymentStatus(orderId, status, paymentId)` - Update payment info

### 1.3 Update `src/controllers/admin.controller.ts`
- [ ] Add `getAllOrders(req, res, next)` - List all orders with filters
- [ ] Add `getOrderStats(req, res, next)` - Dashboard statistics
- [ ] Add `processRefund(req, res, next)` - Process order refunds

### 1.4 Update `src/routes/admin.routes.ts`
- [ ] Add `GET /admin/orders` - List all orders
- [ ] Add `GET /admin/orders/stats` - Order statistics
- [ ] Add `POST /admin/orders/:id/refund` - Process refund

---

## Phase 2: Stripe Payment Integration

### 2.1 Create `src/services/stripe.service.ts`
- [ ] `createPaymentIntent(order)` - Create Stripe payment intent
- [ ] `confirmPayment(paymentIntentId)` - Confirm payment
- [ ] `createRefund(paymentIntentId, amount)` - Process refund
- [ ] `retrievePaymentIntent(paymentIntentId)` - Get payment status

### 2.2 Update `src/config/stripe.ts`
- [ ] Initialize Stripe with API key
- [ ] Export stripe instance

---

## Phase 3: Paystack Payment Integration

### 3.1 Create `src/services/paystack.service.ts`
- [ ] `initializeTransaction(order, callbackUrl)` - Initialize Paystack transaction
- [ ] `verifyTransaction(reference)` - Verify payment
- [ ] `createRefund(reference, amount)` - Process refund
- [ ] `getTransaction(reference)` - Get transaction details

### 3.2 Create `src/config/paystack.ts`
- [ ] Initialize Paystack with API key
- [ ] Export paystack instance

---

## Phase 4: Payment Controller & Routes

### 4.1 Create `src/controllers/payment.controller.ts`
- [ ] `createPaymentIntent(req, res, next)` - Create payment for order
- [ ] `confirmPayment(req, res, next)` - Confirm payment completion
- [ ] `handleWebhook(req, res, next)` - Handle payment webhooks
- [ ] `processRefund(req, res, next)` - Process refund

### 4.2 Create `src/validators/payment.validator.ts`
- [ ] `createPayment` validation
- [ ] `processRefund` validation

### 4.3 Create `src/routes/payment.routes.ts`
- [ ] `POST /payments/create` - Create payment
- [ ] `POST /payments/confirm` - Confirm payment
- [ ] `POST /payments/webhook` - Payment provider webhooks
- [ ] `POST /payments/refund` - Process refund

---

## Phase 5: Order Service Integration

### 5.1 Update `src/services/order.service.ts`
- [ ] Integrate Stripe/Paystack in `createOrder`
- [ ] Add payment ID to order on successful payment
- [ ] Update `updateOrderStatus` to handle payment on confirmation
- [ ] Add `confirmPayment(orderId, paymentId, provider)` method

---

## Phase 6: Order Routes Enhancement

### 6.1 Update `src/routes/order.routes.ts`
- [ ] Add `POST /orders/:id/pay` - Initiate payment for order
- [ ] Add `GET /orders/:id/payment-status` - Get payment status

---

## Phase 7: Testing & Documentation

### 7.1 Update tests
- [ ] Add integration tests for admin order management
- [ ] Add unit tests for payment services
- [ ] Update order.test.ts with payment scenarios

### 7.2 Update documentation
- [ ] Update API_DOCUMENTATION.md with new endpoints
- [ ] Add payment integration guide

---

## Files to Create/Modify

### New Files:
- `src/services/stripe.service.ts`
- `src/services/paystack.service.ts`
- `src/config/paystack.ts`
- `src/controllers/payment.controller.ts`
- `src/validators/payment.validator.ts`
- `src/routes/payment.routes.ts`

### Modified Files:
- `src/types/order.types.ts`
- `src/services/order.service.ts`
- `src/controllers/admin.controller.ts`
- `src/routes/admin.routes.ts`
- `src/routes/order.routes.ts`
- `src/config/stripe.ts`

---

## Implementation Order:
1. Update types (foundation)
2. Create payment services (Stripe & Paystack)
3. Update order service with payment integration
4. Create payment controller & routes
5. Add admin order management
6. Update admin routes
7. Test and verify

