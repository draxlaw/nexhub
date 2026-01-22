# Fix Payment Routes TypeScript Errors Plan

## Problem Analysis

The `payment.routes.ts` file has several TypeScript errors:

1. **Missing imports**: `Request`, `Response`, `NextFunction` are not imported from 'express'
2. **Incorrect approach**: Using `req.on('data')` which doesn't exist on Express Request objects
3. **Type mismatch**: The route handler function doesn't properly type the Express types

## Root Cause

The webhook middleware is trying to manually capture raw body data using Node.js stream events (`req.on('data')`), but Express Request objects don't have these methods. The proper way to handle raw bodies in Express is to use `express.raw()` middleware or a proper body parser.

## Solution Plan

### Step 1: Fix imports in `src/routes/payment.routes.ts`

Add the missing imports from 'express':
```typescript
import { Router, Request, Response, NextFunction } from 'express';
```

### Step 2: Replace the incorrect webhook middleware

The current code:
```typescript
router.post(
  '/webhook/stripe',
  (req: Request, res: Response, next: NextFunction) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      (req as any).rawBody = data;
      next();
    });
  },
  paymentController.handleStripeWebhook,
);
```

Will be replaced with a proper raw body capture approach using `express.raw()`:

```typescript
// Stripe webhook - use express.raw() to capture raw body for signature verification
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  (req: Request, res: Response, next: NextFunction) => {
    // Store raw body as string for webhook signature verification
    (req as any).rawBody = req.body.toString();
    next();
  },
  paymentController.handleStripeWebhook,
);
```

Note: The `express.raw()` middleware needs to be imported from 'express'.

### Step 3: Verify no other changes needed

The Paystack webhook doesn't need raw body capture since it uses the parsed JSON body directly.

## Files to Modify

1. `src/routes/payment.routes.ts` - Fix imports and webhook middleware

## Expected Outcome

After the fix:
- All TypeScript compilation errors will be resolved
- Stripe webhook will properly capture raw body for signature verification
- The code will follow Express best practices for raw body handling

