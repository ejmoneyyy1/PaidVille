# Shop Page Admin Controls - Complete Guide

## What's New

You can now **fully manage products directly on the shop page** when logged in as admin!

## Admin Features on Shop Page

### 1. Edit Products
Each product card has an **"Edit"** button when you're logged in as admin:
- Click **Edit** on any product
- Modal opens with all current product data pre-filled
- Update product name, description, price, payment link
- **Replace main image** - Upload new main image
- **Add/Replace gallery images** - Upload new front/back views
- Changes save instantly

### 2. Delete Products
Each product card has a **"Delete"** button:
- Click **Delete** on any product
- Confirms before deleting
- Product removed immediately from shop

### 3. Add Products
**"+ Add Product"** button at the top right:
- Quick access to add new products
- Same as dashboard, but right on the shop page

## Visual Indicators

### For Customers (Not Admin):
- Product cards show "Pre-Order Now" button
- Click product image to view all angles in lightbox
- Clean, simple shopping experience

### For Admin (Logged In):
- Product cards show **Edit** and **Delete** buttons instead of "Pre-Order Now"
- Each product shows badge: "+3 views" if it has gallery images
- Click product image to preview all angles
- Full management controls right on the page

## How to Edit an Existing Product

1. **Navigate to /shop** (logged in as admin)
2. **Find the product** you want to edit
3. **Click "Edit"** button on the product card
4. **Modal opens** with current data:
   - Product Name (pre-filled)
   - Description (pre-filled)
   - Price (pre-filled in dollars)
   - Payment Link (pre-filled)
   - Main Image (shows current, upload new to replace)
   - Additional Images (upload new files to replace gallery)
   - Available checkbox (pre-checked if available)
5. **Make changes** to any fields
6. **Upload new images** if needed:
   - Main image: Replaces primary product image
   - Additional images: Select multiple files for front/back views
7. **Click "Update"**
8. Product updates immediately on the page!

## Example Workflow

**Scenario:** You need to add back view images to the ASC Cream Tee

1. Go to /shop (as admin)
2. Click "Edit" on ASC Cream Tee card
3. In "Additional Images" field, select 2 files:
   - asc-tee-back.jpg
   - asc-tee-closeup.jpg
4. Click "Update"
5. Done! Product now shows "+3 views" badge
6. Customers can now see all 3 angles in the lightbox

## Benefits

✅ **Faster editing** - No need to go to dashboard
✅ **Visual context** - See exactly what you're editing
✅ **Add images anytime** - Upload front/back views to existing products
✅ **Instant updates** - Changes reflect immediately
✅ **Full control** - Edit, add images, or delete right on the page

## Technical Notes

- Editing preserves all existing data you don't change
- If you don't upload new images, old images remain
- Uploading new gallery images replaces ALL old gallery images
- Main image only replaces if you upload a new one
- All changes save to `data/shop-products.json`
- Images save to `/public/shop/`
