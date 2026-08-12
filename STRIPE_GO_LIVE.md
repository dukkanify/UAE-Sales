# تفعيل Stripe لسوقنا — قائمة جاهزية

الكود جاهز لاستقبال مدفوعات حقيقية. بعد تفعيل حساب Stripe، نفّذ الخطوات التالية فقط.

## 1) مفاتيح Vercel / الإنتاج (`sooqna.site`)

أضف في Environment Variables (Production):

| المتغير | القيمة |
|---------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` من [API keys](https://dashboard.stripe.com/apikeys) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` من endpoint الـ webhook |
| `STRIPE_CURRENCY` | `aed` |
| `NEXT_PUBLIC_APP_URL` | `https://sooqna.site` |
| `NEXT_PUBLIC_ENABLE_MOCK_CHECKOUT` | `false` |
| `ALLOW_MOCK_CHECKOUT` | `false` أو احذفه |

ثم **Redeploy** حتى تُبنى الواجهة بـ `NEXT_PUBLIC_*` الصحيحة.

## 2) Webhook في Stripe Dashboard

1. Developers → Webhooks → Add endpoint  
2. URL: `https://sooqna.site/api/webhooks/stripe`  
3. الأحداث:
   - `checkout.session.completed` *(أساسي)*
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. انسخ Signing secret → `STRIPE_WEBHOOK_SECRET`
5. أرسل test event وتأكد من HTTP 200

تفاصيل إضافية: [STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md)

## 3) تحقق سريع بعد التفعيل

1. `/admin/stripe` — Secret + Webhook = موجود، Mock = مغلق  
2. شراء تجريبي بمبلغ صغير ببطاقة اختبار/حقيقية  
3. بعد الدفع: الطلب يصبح `paid_held_in_escrow`  
4. من الإدارة: تحرير ضمان أو استرداد يعملان  
5. استرداد من Dashboard Stripe يزامن حالة الطلب محلياً

## 4) ما يفعله المنتج حالياً

- Stripe Checkout بعملة AED وواجهة عربية  
- حجز داخلي (escrow ledger) بعد الدفع — الأموال في رصيد منصة Stripe  
- استرداد إداري عبر Stripe Refunds  
- لا يوجد Stripe Connect لصرف تلقائي للبائعين بعد — التحويل للبائع تشغيلي/يدوي من رصيد المنصة

## 5) اختبار محلي قبل Live

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# انسخ whsec_... إلى .env المحلي
npm run dev
```

استخدم مفاتيح `sk_test_` / `pk_test_` فقط على localhost.
