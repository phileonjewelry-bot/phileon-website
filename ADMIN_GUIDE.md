# Admin Dashboard User Guide
## How to Upload & Edit Products for Phileon Jewelry

---

## 🔐 Accessing the Admin Panel

**Two ways to access:**
1. **Direct URL:** Go to `http://localhost:3000/admin`
2. **From Website:** Scroll to the bottom footer and click "Admin" link

---

## 📦 Adding New Products

### Step 1: Upload Product Images (Drag & Drop)

1. Look for the **"Add New Product"** form on the left side
2. Find the **"Product Images"** section with the upload area
3. **Two ways to upload:**
   - **Drag & Drop:** Drag image files from your computer directly into the dashed box
   - **Click to Browse:** Click on the dashed box to open file browser
4. You can upload **multiple images** for each product
5. Images will appear as thumbnails below the upload area
6. Hover over any thumbnail and click the **trash icon** to remove it

### Step 2: Fill in Product Details

**Required Fields:**
- **Product Name:** e.g., "Diamond Engagement Ring"
- **Category:** Choose from dropdown (Necklaces, Rings, Bracelets, Earrings)
- **Price ($):** Enter price without $ symbol, e.g., "2499.99"

**Optional Fields:**
- **Description:** Detailed product description
- **Material:** e.g., "18K Yellow Gold, Diamond"
- **Weight:** e.g., "12.5g"
- **Certification:** e.g., "GIA Certified"

### Step 3: Save Product

Click the **"Save Product"** button at the bottom of the form.
- Product will appear in the "All Products" list on the right
- Product will be visible on your store immediately

---

## 📸 Managing Customer Photos

### Adding Customer Photos

1. Click the **"Customer Photos"** tab at the top
2. Look for the **"Add Customer Photo"** form on the left
3. **Upload Photo:**
   - Drag & drop customer photo into the upload area
   - OR click to browse and select image
4. **Fill in Details:**
   - Customer Name: e.g., "Sarah M."
   - Product Name: e.g., "Diamond Solitaire Ring"
   - Location: e.g., "New York, USA"
5. Click **"Save Photo"**
6. Photo will appear in the Customer Gallery on the right

---

## 🗑️ Deleting Products or Photos

**To Delete a Product:**
1. Find the product in the "All Products" list
2. Click the red **"Delete"** button under the product
3. Product will be removed immediately

**To Delete a Customer Photo:**
1. Go to "Customer Photos" tab
2. Find the photo in the gallery
3. Click the red **"Delete"** button
4. Photo will be removed immediately

---

## 💾 Where is Data Stored?

**Current Setup (Frontend Only):**
- All data is stored in your browser's **localStorage**
- Data persists even after closing the browser
- Products you add in Admin appear on the store immediately
- **Note:** Data is local to your browser only

**After Backend Integration:**
- Data will be stored in MongoDB database
- Images will be stored in cloud storage (AWS S3 or Cloudinary)
- Data will be accessible from any device
- Backup and recovery available

---

## 🎯 Quick Tips

### Image Best Practices:
- **Format:** JPG, PNG, or WEBP
- **Size:** Under 5MB per image
- **Resolution:** At least 1000x1000px for best quality
- **Background:** Clean, neutral backgrounds work best
- **Lighting:** Well-lit, clear photos

### Pricing Tips:
- Use two decimal places (e.g., 1299.99)
- Don't include $ symbol or commas
- Be consistent with pricing across similar items

### Product Descriptions:
- Highlight key features (carat, material, certification)
- Keep descriptions concise but informative
- Mention unique selling points

---

## 🔄 Editing Existing Products

**Current Version:**
- To edit a product, delete it and add it again with new details

**Coming Soon (Backend Integration):**
- Edit button for each product
- Update prices, descriptions, and images without deleting
- Bulk editing capabilities

---

## 📊 Viewing Your Store

Click the **"View Store"** button at the top right to:
- See how your products look on the live site
- Test the shopping experience
- Verify images and pricing

---

## 🆘 Troubleshooting

**Images not uploading?**
- Check file size (must be under 10MB)
- Ensure file is an image format (JPG, PNG, WEBP)
- Try refreshing the page and uploading again

**Product not appearing on store?**
- Check that you clicked "Save Product"
- Refresh the store page
- Verify the product appears in "All Products" list

**Lost all products?**
- If you cleared browser data, localStorage is erased
- This is temporary until backend is integrated
- Keep backups of product images and details

---

## 🚀 Coming Soon with Backend Integration

- **Edit products** without deleting
- **Bulk upload** multiple products at once
- **Inventory management** (stock levels)
- **Order management** dashboard
- **Sales analytics** and reports
- **Customer management**
- **Search and filter** in admin panel
- **Product categories** management
- **Discount and coupon** codes

---

## 📞 Need Help?

The admin panel is designed to be intuitive and easy to use. Just drag, drop, fill, and save!

For technical issues or feature requests, contact your developer.

---

**Happy Selling! 💎✨**
