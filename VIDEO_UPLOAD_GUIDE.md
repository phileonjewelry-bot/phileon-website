# Video Upload Feature - Product Media Gallery

## 🎥 Overview

Your admin dashboard now supports **video uploads** for products! This is perfect for:
- **360° product rotation videos** - Show rings, earrings rotating
- **Promotional videos** - Lifestyle clips, brand stories
- **Close-up detail videos** - Show craftsmanship, gemstone clarity
- **Unboxing videos** - Premium packaging reveal
- **Wear demos** - Show how jewelry looks when worn

## ✨ Features Added

### 1. Admin Dashboard
- ✅ Drag & drop video upload
- ✅ Multiple video support per product
- ✅ Video preview thumbnails
- ✅ Delete videos individually
- ✅ Supports MP4, MOV, WebM formats

### 2. Product Detail Page
- ✅ Combined image + video gallery
- ✅ Click to switch between images and videos
- ✅ Video thumbnails with play icon
- ✅ "360°" badge on video thumbnails
- ✅ Auto-play videos with controls
- ✅ Seamless switching between media types

### 3. Backend API
- ✅ Video upload endpoint `/api/products/upload-video`
- ✅ Video storage in `/uploads/videos/`
- ✅ Video URLs in product database
- ✅ Support for multiple videos per product

## 📤 How to Upload Videos

### Step 1: Access Admin Dashboard
```
http://localhost:3000/admin
```

### Step 2: Add Product or Edit Existing
1. Scroll to **"Product Videos"** section
2. You'll see it right after the images section

### Step 3: Upload Videos
**Method 1: Drag & Drop**
- Drag video files from your computer
- Drop them into the dashed box
- Multiple files supported

**Method 2: Click to Browse**
- Click the upload box
- Select video files
- Choose multiple videos at once

### Step 4: Preview & Manage
- Videos appear as thumbnails below upload area
- Hover to see delete button
- Labeled as "Video 1", "Video 2", etc.
- Click delete (X) to remove

### Step 5: Save Product
- Click "Save Product" button
- Videos are saved with product
- Visible on product detail page

## 🎬 Video Best Practices

### File Format
- **Recommended:** MP4 (H.264 codec)
- **Alternatives:** MOV, WebM
- **Avoid:** AVI, FLV (large file sizes)

### File Size
- **Optimal:** Under 50MB per video
- **Maximum:** 100MB (browser limitation)
- **Tip:** Compress videos before uploading

### Resolution
- **360° Rotation:** 1080p (1920x1080)
- **Promotional:** 1080p or 4K
- **Close-ups:** 1080p minimum

### Duration
- **360° Rotation:** 5-10 seconds
- **Promotional:** 15-30 seconds
- **Detail videos:** 10-15 seconds
- **Keep it short!** Attention span is limited

### Aspect Ratio
- **Recommended:** 1:1 (square) - matches image gallery
- **Alternative:** 16:9 (landscape)
- **Avoid:** Vertical/portrait (9:16)

## 📹 Video Types & Use Cases

### 1. 360° Product Rotation
**Best For:** Rings, Earrings, Pendants
- Show product from all angles
- Slow, smooth rotation
- Good lighting, clean background
- 5-10 seconds loop

**How to Create:**
- Use turntable or lazy susan
- Fixed camera position
- Rotate product slowly
- Edit to loop seamlessly

### 2. Lifestyle/Promotional
**Best For:** Brand storytelling, collections
- Show jewelry being worn
- Elegant lifestyle settings
- Music/background audio optional
- 15-30 seconds

### 3. Close-up Details
**Best For:** Highlighting craftsmanship
- Macro shots of gemstones
- Show engravings, textures
- Demonstrate quality
- 10-15 seconds

### 4. Try-On Demos
**Best For:** Showing scale, fit
- Model wearing jewelry
- Different angles/movements
- Show clasps, adjustments
- 10-20 seconds

## 🎨 Creating Great Product Videos

### Equipment Needed
**Minimum:**
- Smartphone camera (iPhone/Android)
- Good natural lighting
- Stable surface/tripod

**Better:**
- DSLR camera
- Ring light/softbox
- Motorized turntable
- Tripod

**Professional:**
- 4K camera
- Studio lighting setup
- Motorized turntable
- Video editing software

### Lighting Tips
- ✅ Use soft, diffused lighting
- ✅ Avoid harsh shadows
- ✅ Consistent color temperature
- ✅ Bright but not overexposed
- ❌ Avoid direct sunlight (too harsh)

### Background
- ✅ Clean, neutral background (white/black)
- ✅ Consistent with product photos
- ✅ No distractions
- ❌ Avoid busy patterns
- ❌ No visible cords/equipment

### Editing
**Free Tools:**
- iMovie (Mac)
- Windows Video Editor
- DaVinci Resolve
- CapCut

**Paid Tools:**
- Adobe Premiere Pro
- Final Cut Pro
- Filmora

**What to Edit:**
- Trim to optimal length
- Add slow-motion for details
- Color correction
- Stabilization
- Compress file size

## 📊 Video Display on Website

### Product Page Layout
```
┌─────────────────────────┐
│   Main Display Area     │
│  (Image or Video shown) │
│                         │
└─────────────────────────┘
┌───┬───┬───┬───┬───┬───┐
│ 1 │ 2 │ 3 │📹│📹│📹 │ ← Gallery
└───┴───┴───┴───┴───┴───┘
 Images      Videos
```

### User Experience
1. Customer sees image thumbnails first
2. Video thumbnails have play icon overlay
3. Video thumbnails labeled "360°"
4. Click video thumbnail to play
5. Video auto-plays with controls
6. Can switch back to images anytime

### Mobile Experience
- Videos auto-play when selected
- Tap to pause/play
- Pinch to zoom
- Swipe to switch media
- Optimized for touch

## 🔧 Technical Details

### Supported Formats
```javascript
Formats: MP4, MOV, WebM, OGG
Codecs: H.264, H.265, VP8, VP9
Audio: AAC, MP3 (optional)
```

### Storage
**Current:** Local file storage
```
/app/backend/uploads/videos/
```

**Future (Production):**
- AWS S3
- Cloudinary
- Vimeo API
- YouTube embed

### Database Schema
```javascript
{
  id: "123",
  name: "Diamond Ring",
  images: ["img1.jpg", "img2.jpg"],
  videos: ["rotation.mp4", "lifestyle.mp4"],
  // ... other fields
}
```

### API Endpoints
```
POST /api/products/upload-video
  - Multipart form data
  - Returns: { videoUrl, filename }

POST /api/products
  - Include videos array in payload
  
PUT /api/products/:id
  - Update videos array
```

## 🚀 Advanced Features (Coming Soon)

### Video Processing
- Auto-compress large files
- Generate thumbnail previews
- Multiple quality versions
- Progressive loading

### Video Analytics
- Track play rates
- View duration
- Drop-off points
- Conversion impact

### Interactive Features
- Pause to shop hotspots
- Click to buy from video
- Zoom into video details
- Video annotations

### Social Integration
- Share videos to Instagram
- TikTok-style vertical videos
- Shoppable video posts
- User-generated content

## 📈 Marketing Tips

### Use Videos To:
1. **Reduce Returns** - Show accurate size/color
2. **Increase Trust** - Demonstrate quality
3. **Boost SEO** - Videos rank higher
4. **Social Sharing** - More engaging than images
5. **Tell Stories** - Connect emotionally

### Video Ideas:
- Behind-the-scenes craftsmanship
- Designer interviews
- Collection launches
- Seasonal campaigns
- Customer testimonials
- Unboxing experiences
- Care instructions

## ⚠️ Current Limitations

- Videos stored locally (not cloud yet)
- No automatic compression
- No video thumbnail generation
- File size limited by browser
- No video analytics (yet)

## 🎯 Testing Checklist

- [ ] Upload single video
- [ ] Upload multiple videos
- [ ] Preview video in admin
- [ ] Delete video from admin
- [ ] View video on product page
- [ ] Switch between images and videos
- [ ] Test on mobile device
- [ ] Test video auto-play
- [ ] Test video controls
- [ ] Check file size limits

## 💡 Pro Tips

1. **Start Small** - Upload 1-2 videos per product first
2. **Test Loading** - Large videos slow down page
3. **Compress First** - Use online tools to reduce size
4. **Loop Seamlessly** - For 360° rotations
5. **Add Music** - Makes promotional videos engaging
6. **Show Scale** - Include hand/model for size reference
7. **Consistent Style** - Match your brand aesthetic
8. **Mobile First** - Most users shop on phones

## 🆘 Troubleshooting

**Video won't upload:**
- Check file size (under 100MB)
- Verify format (MP4 recommended)
- Try compressing the video
- Check internet connection

**Video doesn't play:**
- Ensure format is supported
- Check browser compatibility
- Try different browser
- Clear cache and reload

**Video loads slowly:**
- File size too large
- Compress before uploading
- Check internet speed
- Consider shorter duration

**Video quality poor:**
- Upload higher resolution
- Check compression settings
- Use better camera
- Improve lighting

---

## 🎬 Ready to Create Amazing Product Videos!

Your luxury jewelry deserves to be showcased in motion. Start uploading videos to give customers a complete view of your stunning pieces!

**Quick Start:** Go to `/admin` → Add Product → Upload Videos → Save → View on product page!
