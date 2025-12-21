# Stripe E-commerce Setup Guide

## Environment Variables

The following environment variables are required in `.env.local`:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Better Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (get this from Stripe Dashboard)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Database Migration

Run the migration to add `stripe_session_id` to the orders table:

```bash
# Generate migration (if using drizzle-kit)
npm run db:generate

# Or run the SQL directly
psql $DATABASE_URL -f drizzle/0003_add_stripe_session_id.sql

# Or push schema changes
npm run db:push
```

## Stripe Webhook Setup

1. **Install Stripe CLI** (for local development):
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`) and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

5. **For production**, create a webhook endpoint in Stripe Dashboard:
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select event: `checkout.session.completed`
   - Copy the signing secret to your production environment variables

## Testing the Flow

1. **Add products to cart** from the home page or product listing
2. **Go to cart** (`/cart`) and review items
3. **Click "Checkout with Stripe"** - this will:
   - Create an order in the database with status "pending"
   - Create a Stripe Checkout Session
   - Redirect to Stripe's payment page
4. **Complete payment** using test card: `4242 4242 4242 4242`
5. **Webhook will be triggered** and will:
   - Update order status to "processing"
   - Clear the user's cart
6. **Redirect to success page** showing order details

## Features Implemented

✅ Add to Cart (from product cards and favorites)
✅ Favorites/Wishlist (toggle favorite status)
✅ Shopping Cart (view, update quantities, remove items)
✅ Checkout with Stripe (creates order and Stripe session)
✅ Webhook handler (processes payment completion)
✅ Orders page (view all orders with status badges)
✅ Cancel Order (for pending/processing orders)
✅ Success/Cancel pages (after Stripe checkout)

## Notes

- Orders require addresses, but they're optional in the schema for now
- The webhook sets order status to "processing" - you can add logic to mark as "delivered" later
- Cart supports both authenticated users and guests (via guest sessions)
- Favorites require authentication

