# How to Test AR Try-On Camera Feature

## ✅ Requirements

To test the AR Try-On feature, you need:

1. **Real Device** with camera:
   - Laptop/Desktop with webcam
   - Smartphone (iPhone/Android)
   - Tablet with front/rear camera

2. **Supported Browsers**:
   - ✅ Chrome (Desktop & Mobile) - Best performance
   - ✅ Safari (Desktop & Mobile)
   - ✅ Firefox (Desktop & Mobile)
   - ✅ Edge (Desktop)
   - ❌ Does NOT work in testing environments (Playwright, Puppeteer)

3. **Camera Permissions**:
   - Browser must have camera access
   - Camera not in use by other apps

## 🧪 How to Test

### Step 1: Access the Website
```
http://localhost:3000
```

### Step 2: Navigate to a Product
1. Click on any product from the homepage
2. OR go to Products page and select any jewelry item

### Step 3: Try Different Categories

**For Rings:**
1. Select a ring product
2. Click "Try On with AR Camera"
3. Allow camera access when prompted
4. Show your hand to the camera
5. AR will detect your hand and place a ring on your ring finger

**For Earrings:**
1. Select earring product
2. Click "Try On with AR Camera"
3. Allow camera access
4. Face the camera directly
5. AR will detect your face and place earrings on your ears

**For Necklaces:**
1. Select necklace product
2. Click "Try On with AR Camera"
3. Allow camera access
4. Face the camera (upper body visible)
5. AR will detect your face/neck and drape the necklace

### Step 4: Capture Photo
- Once AR overlay is working, click "Save Photo" button
- Image will download to your device

## ⚠️ Troubleshooting

### "Camera access denied"
**Solution:**
- Click the camera icon in browser address bar
- Allow camera permissions
- Refresh page and try again

### "Camera not supported"
**Solution:**
- Ensure you're using Chrome, Safari, or Firefox
- Check if camera works in other apps
- Try a different browser

### AR overlay not appearing
**Solution:**
- Ensure good lighting conditions
- Position yourself 2-3 feet from camera
- Make sure face/hand is fully visible
- Try different angles

### "Requested device not found"
**Solution:**
- This means no camera detected
- Check if camera is connected (external webcam)
- Try restarting browser
- Check camera drivers (Windows/Mac)

### Slow/Laggy Performance
**Solution:**
- Close other browser tabs
- Ensure good internet connection (for loading MediaPipe libraries)
- Use Chrome for best performance
- Check CPU usage

## 📱 Mobile Testing

### iOS (Safari):
1. Open Safari browser
2. Go to http://localhost:3000 (or your deployed URL)
3. Navigate to product
4. Click "Try On with AR Camera"
5. Tap "Allow" for camera access
6. Hold phone steady

### Android (Chrome):
1. Open Chrome browser
2. Go to http://localhost:3000 (or your deployed URL)
3. Navigate to product
4. Click "Try On with AR Camera"
5. Tap "Allow" for camera access
6. Hold phone steady

## 🎥 Expected Behavior

### Successful AR Session:
1. Camera preview appears on screen
2. Real-time video feed visible
3. AR overlays appear on detected features:
   - Gold ring on ring finger (for rings)
   - Gold earrings on ears (for earrings)
   - Gold necklace on neck/chest (for necklaces)
4. Overlays track movement in real-time
5. "Save Photo" button works

### Loading States:
- "Initializing camera..." - Normal, takes 2-5 seconds
- Loading longer? - Check internet connection for MediaPipe libraries

## 🚀 Production Deployment

When deploying to production:

1. **HTTPS Required** - Camera access only works on HTTPS
2. **Domain Whitelist** - Add your domain to CORS if needed
3. **Performance** - Consider CDN for MediaPipe libraries
4. **Analytics** - Track AR usage rates

## 📊 What to Track

Monitor these metrics:
- AR feature usage rate (% of users who try it)
- Screenshot downloads
- Time spent in AR view
- Conversion rate after AR usage
- Drop-off points (permission denied, etc.)

## 🔧 Known Limitations

Current version:
- ✅ Works on real devices with cameras
- ❌ Won't work in automated testing (no physical camera)
- ❌ Won't work in Playwright/Puppeteer screenshots
- ❌ Requires HTTPS in production
- ⚠️ Basic 2D overlay (not full 3D rendering)
- ⚠️ Generic jewelry shapes (will be enhanced with product images)

## 🎯 Testing Checklist

- [ ] Test on laptop/desktop with webcam
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test rings category (hand detection)
- [ ] Test earrings category (ear detection)
- [ ] Test necklaces category (neck detection)
- [ ] Test screenshot download
- [ ] Test in good lighting
- [ ] Test in low lighting
- [ ] Test with multiple users
- [ ] Test camera permission denial
- [ ] Test camera permission acceptance

## 💡 Demo Tips

When demoing to stakeholders:
1. Use well-lit room
2. Position camera at eye level
3. Keep face/hand clearly visible
4. Show different jewelry categories
5. Demonstrate screenshot feature
6. Explain it's 100% free (no API costs)

## 🆘 Still Having Issues?

If AR Try-On still not working:

1. **Check browser console** (F12 → Console tab)
2. **Verify camera works** in other apps (Zoom, etc.)
3. **Try incognito/private mode**
4. **Clear browser cache**
5. **Restart browser**
6. **Try different device**

---

**Note:** The AR feature uses your device's camera in real-time. All processing happens locally in your browser - no images are uploaded to servers. Your privacy is protected!

**Ready to test?** Go to http://localhost:3000 and try it on your device! 🎉
