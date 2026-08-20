# تفعيل Stripe لسوقنا — قائمة جاهزية

الكود جاهز لاستقبال مدفوعات حقيقية. يمكنك التفعيل من **لوحة الأدمن** أو من Vercel.

## أ) الأسرع: من لوحة الأدمن (`/admin/stripe`)

1. Dashboard → API keys → انسخ `sk_live_...` و `pk_live_...`
2. Webhooks → Add endpoint → `https://sooqna.site/api/webhooks/stripe`
3. أحداث: `checkout.session.completed`, `payment_intent.*`, `charge.refunded`
4. انسخ Signing secret `whsec_...`
5. في `/admin/stripe` الصق المفاتيح الثلاثة واضغط **حفظ وتفعيل**

المفاتيح تُحفظ مشفّرة في Postgres. لا تلصق مفاتيح في Git.

> ملاحظة: إذا كان `STRIPE_SECRET_KEY` موجوداً في Vercel، الإدارة من الأدمن تُقفل حتى تحذف متغير البيئة.

## ب) البديل: مفاتيح Vercel / الإنتاج

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

ثم **Redeploy**.

## 2) تحقق سريع بعد التفعيل

1. `/admin/stripe` — Secret + Webhook = موجود، Mock = مغلق
2. شراء تجريبي بمبلغ صغير
3. بعد الدفع: الطلب يصبح `paid_held_in_escrow`

## 3) ما يفعله المنتج حالياً

- Stripe Checkout بعملة AED وواجهة عربية
- حجز داخلي (escrow ledger) بعد الدفع
- استرداد إداري عبر Stripe Refunds
- لا يوجد Stripe Connect لصرف تلقائي للبائعين بعد

تفاصيل الـ webhook: [STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md)
