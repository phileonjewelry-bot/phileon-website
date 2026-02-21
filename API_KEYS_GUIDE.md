# API Keys Setup Guide - Phileon Jewelry E-commerce

## 🔑 Where to Get Your API Keys

---

## 1. STRIPE (Payment Processing - Cards)

**Website:** https://stripe.com

**Steps:**
1. Go to https://stripe.com and click "Start now" (free)
2. Create account with email
3. Complete business verification (can start in test mode immediately)
4. Go to **Developers** > **API Keys**
5. You'll see:
   - **Publishable key** (starts with `pk_test_...` or `pk_live_...`)
   - **Secret key** (starts with `sk_test_...` or `sk_live_...`)

**Test Mode vs Live Mode:**
- Test mode: For development (use test cards like 4242 4242 4242 4242)
- Live mode: For real transactions (need full verification)

**Keys Needed:**
```
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

**Cost:** Free to start, 2.9% + $0.30 per transaction

---

## 2. PAYPAL (Alternative Payment Method)

**Website:** https://developer.paypal.com

**Steps:**
1. Go to https://developer.paypal.com
2. Log in with PayPal account (or create one)
3. Go to **Dashboard** > **My Apps & Credentials**
4. Click **Create App**
5. Choose **Merchant** application type
6. Get your credentials:
   - **Client ID**
   - **Secret**

**Sandbox vs Live:**
- Sandbox: For testing (fake money)
- Live: Real transactions

**Keys Needed:**
```
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_SECRET=xxxxx
```

**Cost:** Free to start, 2.9% + $0.30 per transaction (US)

---

## 3. EASYPOST (Shipping Rate Calculator)

**Website:** https://www.easypost.com

**Steps:**
1. Go to https://www.easypost.com/signup
2. Sign up for free account
3. Go to **API Keys** in dashboard
4. Copy your **Test API Key** and **Production API Key**

**Keys Needed:**
```
EASYPOST_API_KEY=EZTEST_xxxxx (for testing)
EASYPOST_API_KEY=EZAK_xxxxx (for production)
```

**Cost:** 
- Free tier: 10,000 shipments/month
- Pay-as-you-go after that

---

## 4. NEUROVIZ.AI (Virtual Try-On)

**Website:** https://neuroviz.ai

**Steps:**
1. Go to https://neuroviz.ai
2. Click "Get Started" or "Request Demo"
3. Contact sales team for API access
4. They'll provide API key and documentation

**Alternative Options:**
- **Jeeliz** (https://jeeliz.com) - AR jewelry try-on
- **Banuba** (https://www.banuba.com) - Face AR SDK
- **ModiFace** (https://modiface.com) - Beauty & jewelry AR

**Keys Needed:**
```
NEUROVIZ_API_KEY=xxxxx
```

**Cost:** Enterprise pricing (contact for quote)

---

## 5. SENDGRID (Email Notifications)

**Website:** https://sendgrid.com

**Steps:**
1. Go to https://signup.sendgrid.com
2. Create free account (100 emails/day free forever)
3. Complete sender verification
4. Go to **Settings** > **API Keys**
5. Click **Create API Key**
6. Give it full access
7. Copy the key (shown only once!)

**Keys Needed:**
```
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=orders@getyourphileon.com
```

**Cost:** 
- Free: 100 emails/day
- Essentials: $19.95/month (50,000 emails)

---

## 📋 Summary - Keys You Need

Create a file called `.env.local` and add:

```bash
# Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_SECRET=xxxxx

# Shipping
EASYPOST_API_KEY=EZTEST_xxxxx

# Virtual Try-On
NEUROVIZ_API_KEY=xxxxx

# Email
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=orders@getyourphileon.com

# Database (already configured)
MONGO_URL=mongodb://localhost:27017/phileon
DB_NAME=phileon
```

---

## 🚀 Getting Started Order

### Phase 1: Start Building NOW (No keys needed)
- ✅ Product management (CRUD)
- ✅ Cart functionality
- ✅ Order management
- ✅ Image uploads (local storage)

### Phase 2: Test Mode (Free test keys)
- Get Stripe test keys (instant)
- Get SendGrid free account (instant)
- Get EasyPost test key (instant)

### Phase 3: Advanced Features (Requires contact/paid)
- PayPal credentials (15 minutes)
- Neuroviz.ai (requires sales contact)

---

## 💡 What I'll Do Now

1. **Build core backend** (products, cart, orders) - No keys needed
2. **Setup payment structure** - Ready for when you add Stripe keys
3. **Mock shipping** - Replace with EasyPost when you get key
4. **Mock try-on** - Replace with Neuroviz when you get key

You can **start with test/free accounts** for:
- Stripe (instant test keys)
- SendGrid (instant free account)
- EasyPost (instant test key)

Then upgrade to production keys later!

---

## 📞 Need Help?

**Stripe Support:** https://support.stripe.com
**PayPal Support:** https://www.paypal.com/us/smarthelp/contact-us
**EasyPost Support:** support@easypost.com
**SendGrid Support:** https://support.sendgrid.com

---

**Next Step:** I'll start building the backend infrastructure now. You can get the free test API keys while I'm building!
