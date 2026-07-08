# Sooqna Web

واجهة ويب عربية RTL لمنصة **سوقنا (Sooqna)** — سوق إماراتي موثوق، مبنية باستخدام Next.js وTypeScript وTailwind CSS.

## التشغيل

```bash
npm install
npm run dev
```

افتح `http://localhost:3000`.

## بيانات التجربة

| الدور | البريد | كلمة المرور | OTP |
|-------|--------|-------------|-----|
| مستخدم | `user@sooqna.demo` | `User@123` | `123456` |
| أعمال | `company@sooqna.demo` | `Company@123` | `123456` |
| مدير | `admin@sooqna.demo` | `Admin@123` | `123456` |

## البنية

- `app` — صفحات Next.js App Router
- `features` — ميزات حسب المجال (home, listings, auth, admin…)
- `shared` — مكونات UI، تخطيطات، ثوابت العلامة التجارية
- `services` — طبقة البيانات والـ API
- `mock` — بيانات تجريبية
- `public/brand` — أصول العلامة التجارية (شعار، أيقونة، OG)

## التحقق

```bash
npm run lint
npm run build
```

## العلامة التجارية

راجع `BRAND_IDENTITY_GUIDE.md` و`BRAND_MIGRATION_REPORT.md`.
