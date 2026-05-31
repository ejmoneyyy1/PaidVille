# Multi-Image Product Upload - Complete Guide

## What's New

### Multiple Images Per Product
You can now add front views, back views, and multiple angles for each product!

## How to Use

### Adding a New Product with Multiple Images:

1. **Go to Shop page** (logged in as admin)
2. **Click the "+ Add Product" button** in the top right
3. Fill in the product details:
   - Product Name
   - Description
   - Price (in dollars)
   - Payment Link
   - **Main Product Image** - The primary image shown in the grid
   - **Additional Images** - Upload multiple files for front/back views
4. Click **Create**

### How the Lightbox Works:

When a customer clicks on a product:
- They see ONLY that product's images
- Can navigate through: Main image → Front view → Back view → etc.
- Navigation arrows appear only if the product has multiple images
- Each product is isolated - no mixing between products!

### Example:
**ASC Cream Tee:**
- Main image: Front view
- Additional images: Back view, close-up, side view
- Customer clicks the tee → sees all 4 views of ONLY that tee
- Navigation: ← 1/4 → ← 2/4 → ← 3/4 → ← 4/4 →

## Technical Details

### File Storage:
- Main images: `/public/shop/`
- Gallery images: `/public/shop/`
- Product data: `data/shop-products.json`

### Data Structure:
```json
{
  "id": "shop-123",
  "productName": "ASC Cream Tee",
  "imagePath": "/shop/main-image.jpg",
  "galleryImages": [
    "/shop/back-view.jpg",
    "/shop/close-up.jpg"
  ]
}
```

## Sanity Status

✅ **Shop Products** - Completely independent, no Sanity
✅ **Events** - Completely independent, no Sanity
✅ **Collection Gallery** - Completely independent, no Sanity

All content managed through your onsite dashboard only!

## Hydration Warning

The hydration warning you're seeing is likely from:
- A browser extension modifying the HTML
- Development mode hot reloading
- Not critical for production

If it persists in production, let me know and we can investigate further.
