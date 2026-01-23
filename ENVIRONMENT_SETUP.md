# Environment Variables Setup Guide

## 📋 Current Configuration

Your Phileon jewelry store uses these environment variables:

### Frontend (.env location: `/app/frontend/.env`)

```bash
# Backend API URL (already configured for production)
REACT_APP_BACKEND_URL=https://phileon-official.preview.emergentagent.com

# Calendly booking link for consultations
REACT_APP_BOOKING_URL=https://calendly.com/YOURNAME/15min

# WebSocket configuration (for hot reload)
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

### Backend (.env location: `/app/backend/.env`)

```bash
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017/phileon
DB_NAME=phileon

# Optional: SendGrid for email notifications
SENDGRID_API_KEY=your_sendgrid_key_here
SENDGRID_FROM_EMAIL=orders@getyourphileon.com
ADMIN_EMAIL=admin@getyourphileon.com

# Optional: Payment integrations
STRIPE_SECRET_KEY=sk_test_xxxxx
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_SECRET=xxxxx

# Optional: Shipping API
EASYPOST_API_KEY=EZTEST_xxxxx
```

---

## 🔧 Setup Instructions

### Step 1: Update Calendly Link

**Current (placeholder):**
```bash
REACT_APP_BOOKING_URL=https://calendly.com/YOURNAME/15min
```

**Replace with your actual Calendly link:**
1. Go to https://calendly.com
2. Create/login to your account
3. Set up an "Event Type" (e.g., "Custom Jewelry Consultation - 15 min")
4. Copy your booking link
5. Update `.env` file:

```bash
REACT_APP_BOOKING_URL=https://calendly.com/your-actual-username/consultation
```

### Step 2: Restart Frontend

After updating `.env`, restart the frontend to load new variables:

```bash
sudo supervisorctl restart frontend
```

Or if deployed:
- Redeploy your app
- New environment variables will be picked up automatically

---

## 🎯 Where Calendly Link Appears

The booking link is integrated in:

1. **Custom Landing Page (`/custom`)**
   - "Schedule Consultation" button in hero section
   - "Talk to a Designer" button at bottom

2. **Opens in New Tab**
   - Calendly opens in new window
   - User can book without leaving your site

---

## 🔐 Optional: MongoDB Atlas (Cloud Database)

**Current:** Using local MongoDB in container  
**Upgrade to:** MongoDB Atlas for production

### Why MongoDB Atlas?
- ✅ Cloud-hosted (accessible from anywhere)
- ✅ Automatic backups
- ✅ Free tier available (512MB)
- ✅ Better for production

### Setup Steps:

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to your users
   - Create cluster (takes 5-10 minutes)

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/phileon?retryWrites=true&w=majority
   ```

4. **Update Backend `.env`**
   ```bash
   MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/phileon?retryWrites=true&w=majority
   DB_NAME=phileon
   ```

5. **Restart Backend**
   ```bash
   sudo supervisorctl restart backend
   ```

6. **Migrate Data (optional)**
   ```bash
   cd /app/backend
   python populate_db.py
   ```

---

## 📧 Optional: Email Notifications

For low stock alerts and order confirmations:

### SendGrid Setup:

1. **Sign up at https://sendgrid.com** (free: 100 emails/day)

2. **Create API Key**
   - Go to Settings → API Keys
   - Create key with "Full Access"
   - Copy the key (shown only once!)

3. **Verify Sender Email**
   - Go to Settings → Sender Authentication
   - Verify your email (e.g., orders@getyourphileon.com)

4. **Update Backend `.env`**
   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=orders@getyourphileon.com
   ADMIN_EMAIL=admin@getyourphileon.com
   ```

5. **Test It**
   ```bash
   curl -X POST http://localhost:8001/api/inventory/send-stock-alert
   ```

---

## 💳 Optional: Payment Integration

### Stripe Setup:

1. **Sign up at https://stripe.com**

2. **Get API Keys**
   - Go to Developers → API Keys
   - Copy "Publishable key" and "Secret key"

3. **Update Backend `.env`**
   ```bash
   STRIPE_SECRET_KEY=sk_test_xxxxx
   ```

4. **Update Frontend `.env`**
   ```bash
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   ```

---

## 🚚 Optional: Shipping API

### EasyPost Setup:

1. **Sign up at https://www.easypost.com** (free: 10k shipments/month)

2. **Get API Key**
   - Dashboard → API Keys
   - Copy "Test API Key"

3. **Update Backend `.env`**
   ```bash
   EASYPOST_API_KEY=EZTEST_xxxxx
   ```

---

## ✅ Testing Your Configuration

### Test Calendly Link:
1. Visit http://localhost:3000/custom
2. Click "Schedule Consultation"
3. Should open Calendly in new tab

### Test Backend Connection:
```bash
curl http://localhost:8001/api/products
```

### Test MongoDB Connection:
```bash
curl http://localhost:8001/api/health
```

---

## 🔄 Restart Services After Changes

**Restart Frontend:**
```bash
sudo supervisorctl restart frontend
```

**Restart Backend:**
```bash
sudo supervisorctl restart backend
```

**Restart All:**
```bash
sudo supervisorctl restart all
```

---

## 📝 Quick Reference

| Variable | Purpose | Required? |
|----------|---------|-----------|
| `REACT_APP_BACKEND_URL` | Backend API URL | ✅ Yes |
| `REACT_APP_BOOKING_URL` | Calendly link | ✅ Yes (for consultations) |
| `MONGO_URL` | Database connection | ✅ Yes |
| `SENDGRID_API_KEY` | Email notifications | ⚠️ Optional |
| `STRIPE_SECRET_KEY` | Payment processing | ⚠️ Optional |
| `EASYPOST_API_KEY` | Shipping rates | ⚠️ Optional |

---

## 🆘 Troubleshooting

**Calendly button not working?**
- Check `.env` has correct URL
- Restart frontend: `sudo supervisorctl restart frontend`
- Clear browser cache

**Backend not connecting?**
- Check `REACT_APP_BACKEND_URL` in frontend `.env`
- Verify backend is running: `curl http://localhost:8001/api/`

**MongoDB connection failed?**
- Check `MONGO_URL` is correct
- If using Atlas, check IP whitelist (add 0.0.0.0/0 for testing)
- Verify username/password in connection string

---

## 📍 File Locations

```
/app/
├── frontend/
│   └── .env                    ← Frontend environment variables
├── backend/
│   └── .env                    ← Backend environment variables
└── ENVIRONMENT_SETUP.md        ← This file
```

---

**Need Help?** All the API setup guides are in `/app/API_KEYS_GUIDE.md`
