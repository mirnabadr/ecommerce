# Stripe Webhook Setup Guide

## Option 1: Stripe CLI (Recommended for Local Development)

### Step 1: Install Stripe CLI

If not already installed, run:
```bash
brew install stripe/stripe-cli/stripe
```

Or download from: https://stripe.com/docs/stripe-cli

### Step 2: Login to Stripe

```bash
stripe login
```

This will open your browser to authenticate with your Stripe account.

### Step 3: Forward Webhooks to Your Local Server

In a **separate terminal window** (keep your Next.js dev server running), run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Important:** Keep this terminal window open while testing!

### Step 4: Copy the Webhook Signing Secret

When you run `stripe listen`, you'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

Copy the `whsec_xxxxxxxxxxxxx` value and update your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 5: Restart Your Next.js Server

After updating `.env.local`, restart your dev server:
```bash
npm run dev
```

## Option 2: Stripe Dashboard (For Production Only)

**Note:** This won't work for localhost development unless you use a tunneling service like ngrok.

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL:
   - **Production:** `https://yourdomain.com/api/stripe/webhook`
   - **Local (with ngrok):** `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed` (required)
5. Copy the "Signing secret" and add to your environment variables

## Testing the Webhook

1. Add items to cart
2. Go to `/cart` and click "Checkout with Stripe"
3. Use test card: `4242 4242 4242 4242`
4. Complete the payment
5. Check your terminal running `stripe listen` - you should see webhook events
6. Check your Next.js server logs - the webhook should process successfully
7. Verify the order status changed to "processing" in your database

## Troubleshooting

- **Webhook not receiving events:** Make sure `stripe listen` is running
- **Invalid signature error:** Check that `STRIPE_WEBHOOK_SECRET` matches the secret from `stripe listen`
- **Webhook endpoint not found:** Verify your Next.js server is running on port 3000

