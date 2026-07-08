# Sooqna — Stripe Webhook Setup

## Endpoint

```
POST /api/webhooks/stripe
```

Production URL example:

```
https://your-domain.com/api/webhooks/stripe
```

## Environment

```env
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SECRET_KEY=sk_test_...   # or sk_live_... in production
```

## Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Mark order paid, create escrow hold, update wallet |
| `payment_intent.succeeded` | Fallback payment confirmation |
| `payment_intent.payment_failed` | Mark payment failed |
| `charge.refunded` | Log refund event |

## Local Development with Stripe CLI

### 1. Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

### 2. Login

```bash
stripe login
```

### 3. Forward webhooks to local server

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints a webhook signing secret:

```
> Ready! Your webhook signing secret is whsec_... (^C to quit)
```

Copy this into `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Start the app

```bash
npm run dev
```

### 5. Trigger test events

```bash
stripe trigger checkout.session.completed
```

Or complete a real test checkout with card `4242 4242 4242 4242`.

## Production Setup

### 1. Stripe Dashboard

1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 2. Deploy env vars

Set on your hosting platform (Vercel, etc.):

```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=aed
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Verify

- Complete a live-mode test payment
- Check Stripe Dashboard → Webhooks → event delivery logs
- Confirm order status updates in `/admin/orders`

## Signature Verification

The endpoint uses `stripe.webhooks.constructEvent()` with the raw request body and `stripe-signature` header. Requests with invalid signatures return `400`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `INVALID_SIGNATURE` | Ensure `STRIPE_WEBHOOK_SECRET` matches the endpoint secret |
| Order not updating | Check `.data/orders.json` exists; verify `metadata.orderId` in session |
| 503 `STRIPE_NOT_CONFIGURED` | Set `STRIPE_SECRET_KEY` in env |
| Webhook timeout | Handler is synchronous; for high volume, add queue (production) |

## Security Notes

- Never expose `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` to the client
- Use separate webhook endpoints for test and live mode
- Monitor failed webhook deliveries in Stripe Dashboard
