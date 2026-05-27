# PaidVille Shop Management - Simple & Independent

## What's Been Set Up

Your shop is now **completely independent** from Sanity.io - just simple file-based storage that you control entirely through your dashboard.

### Storage System
- **Products:** Stored in `data/shop-products.json` (auto-created)
- **Images:** Stored in `public/shop/` folder
- **No external dependencies** - everything stays in your project

### Shop Dashboard Features
- **"Shop" tab** in your admin dashboard at `/admin/dashboard`
- Add/Edit/Delete products with a clean interface
- Simple form with only what you need:
  - Product name
  - Description
  - Price (USD)
  - Payment link (Stripe, PayPal, anything!)
  - Product image
  - Availability toggle

### How It Works
1. You add products through the dashboard
2. Images are automatically saved to `public/shop/`
3. Product data is saved to `data/shop-products.json`
4. Shop page at `/shop` shows all available products
5. Customers click "Pre-Order Now" → goes to your payment link

## Adding Your Products

Your client has 4 products ready to add. Here's the info for each:

### Product 1: Women's Summer Set
```
Name: PaidVille Women's Summer Set
Description: Exclusive black tee and shorts set with gold PaidVille American Summer Club branding and athletic stripes
Price: 45.00
Payment Link: https://buy.stripe.com/3cI4gz4kwc3a26d7AhbjW04
Image: Use public/shop-images/womens-set.png
```
_Enter price as dollars (e.g., 45.00) - the system automatically converts to cents for storage_

### Product 2: American Summer Club Tee
```
Name: American Summer Club Tee - Sand
Description: PaidVille American Summer Club signature tee in premium sand/cream color with pool scene back graphic
Price: 35.00
Payment Link: https://buy.stripe.com/7sY00j6sEffm26d2fXbjW02
Image: Use public/shop-images/asc-tee.png
```

### Product 3: Economics Tee (White)
```
Name: Economics Tee - White
Description: Property of PaidVille EST.2018 Finance Dept "Building the Future" tee in classic white
Price: 32.00
Payment Link: https://buy.stripe.com/5kQeVd8AM3wE3ahg6NbjW01
Image: Use public/shop-images/economics-tee-white.png
```

### Product 4: Economics Tee (Black)
```
Name: Economics Tee - Black
Description: Property of PaidVille EST.2018 Finance Dept "Building the Future" tee in sleek black with gold lettering
Price: 32.00
Payment Link: https://buy.stripe.com/fZu9ATaIU7MU4el6wdbjW00
Image: Use public/shop-images/economics-tee-black.png
```

## Steps to Add Products

1. **Login to your admin dashboard**
   - Go to `/admin/login`

2. **Click the "Shop" tab**

3. **Click "+ Add Product"**

4. **Fill in the form:**
   - Copy the info from above for each product
   - **Enter price in dollars** (e.g., 45.00) - system converts to cents automatically
   - Upload the corresponding image from `public/shop-images/`
   - Make sure "Available for purchase" is checked
   - Click "Create"

5. **Repeat for all 4 products**

## Managing Products

### Add New Product
- Go to Shop tab → "+ Add Product"
- Fill in: name, description, price (in dollars like 45.00), payment link
- Upload image
- Click "Create"

### Edit Product
- Find product → Click "Edit"
- Change any field (leave image empty to keep current)
- Click "Update"

### Delete Product
- Find product → Click "Delete"
- Confirm

### Toggle Availability
- Edit product → Check/uncheck "Available for purchase"
- Only available products show on `/shop` page

## Technical Details

### Files Created
- `lib/shop-storage.ts` - File-based storage system
- `app/api/admin/shop/route.ts` - CRUD API endpoints
- `data/shop-products.json` - Your products database (auto-created)
- `public/shop/` - Product images folder (auto-created)

### How It's Different
- **No Sanity:** Shop products stored locally in JSON file
- **No external API calls:** Everything is server-side file operations
- **No tokens needed:** Just works out of the box
- **Fully portable:** Copy the `data` folder = copy your shop

### Payment Links
The "Payment Link" field accepts ANY checkout URL:
- Stripe payment links
- PayPal checkout URLs
- Shopify buy buttons
- Square invoices
- Any other payment processor

### Backup Your Shop
Your entire shop is in two places:
1. `data/shop-products.json` - all product info (prices stored in cents internally)
2. `public/shop/` - all product images

Just copy these to back up or migrate your shop!

## Notes
- **Enter prices in dollars** (e.g., 45.00) when adding products - the system converts to cents for accurate storage
- Prices are stored in cents internally (e.g., 4500 = $45.00) to avoid floating-point errors
- Maximum image size: 12MB
- All fields except description are required
- Products must have "Available" checked to show on shop page
- Changes appear instantly on the `/shop` page
