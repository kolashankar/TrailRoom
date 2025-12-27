# TrailRoom User Guide

## Welcome to TrailRoom! 👗

TrailRoom is a revolutionary virtual try-on platform that uses AI to help you visualize how clothing would look on you before making a purchase. This guide will help you get started and make the most of the platform.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Account Management](#account-management)
3. [Credit System](#credit-system)
4. [Creating Virtual Try-Ons](#creating-virtual-try-ons)
5. [Managing Your History](#managing-your-history)
6. [Purchasing Credits](#purchasing-credits)
7. [API Access](#api-access)
8. [Billing & Invoices](#billing--invoices)
9. [Tips for Best Results](#tips-for-best-results)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)

---

## Getting Started

### Creating an Account

1. **Visit TrailRoom**: Go to [https://trailroom.com](https://trailroom.com)
2. **Sign Up**: Click the "Sign Up" button
3. **Choose Authentication Method**:
   - **Email & Password**: Enter your email and create a strong password
   - **Google Sign-In**: Click "Continue with Google" for quick registration
4. **Verify Email**: Check your inbox for a verification email (if using email/password)
5. **Welcome!**: You'll receive 3 free credits to get started

### Logging In

1. Click "Login" on the homepage
2. Enter your credentials or use Google Sign-In
3. You'll be redirected to your dashboard

---

## Account Management

### Dashboard Overview

Your dashboard shows:
- **Credit Balance**: Your available credits in the top right
- **Quick Stats**: Total generations, successful jobs, and account age
- **Quick Actions**: Fast access to generate try-ons and purchase credits
- **Recent Activity**: Your latest try-on generations

### Profile Settings

1. Navigate to **Settings** from the sidebar
2. Update your:
   - Display name
   - Email preferences
   - Password (if using email/password authentication)
3. Click **Save Changes**

### Dark Mode

Toggle between light and dark themes using the theme switcher in the top navigation bar.

---

## Credit System

### How Credits Work

- **1 Credit**: Generates one top-only try-on (shirts, tops, jackets)
- **2 Credits**: Generates one full-outfit try-on (top + bottom)
- **Free Users**: Get 3 free credits daily (resets at midnight UTC)
- **Paid Credits**: Never expire and roll over

### Checking Your Balance

Your credit balance is always visible in the top right corner of the dashboard. Click on it to:
- View detailed credit history
- See upcoming free credit reset time
- Purchase more credits

### Credit Transactions

View all credit activity in **Credits** > **Transactions**:
- Daily free credits received
- Credits purchased
- Credits used for generations
- Refunds for failed generations

---

## Creating Virtual Try-Ons

### Step-by-Step Guide

#### Step 1: Upload Your Photo

1. Click **Generate Try-On** from the sidebar or dashboard
2. Upload a clear photo of yourself:
   - **Format**: JPG, PNG, JPEG, or WEBP
   - **Size**: Maximum 5MB
   - **Tips**: 
     - Stand straight facing the camera
     - Good lighting
     - Full body visible (for full-outfit mode)
     - Plain background works best

3. **Upload Methods**:
   - Drag and drop your image
   - Click to browse files
   - Paste from clipboard (Ctrl+V)

#### Step 2: Select Mode

Choose your try-on mode:

**Top Only** (1 Credit)
- For upper garments only
- Best for: Shirts, t-shirts, jackets, sweaters, blazers

**Full Outfit** (2 Credits)
- For complete outfits
- Best for: Matching tops and bottoms

#### Step 3: Upload Clothing Image(s)

1. Upload clothing item photo:
   - Product photos from online stores work great
   - Clear, well-lit images of the garment
   - Plain background preferred
   - Show the complete garment

2. **For Full Outfit Mode**:
   - Upload both top and bottom garments
   - Or upload a single image showing both pieces

#### Step 4: Generate & View Result

1. Click **Generate Try-On**
2. **Processing Time**: Typically 20-30 seconds
3. **Status Indicators**:
   - 🔵 **Queued**: Waiting in line
   - 🟡 **Processing**: AI is generating your try-on
   - ✅ **Completed**: Ready to view!
   - ❌ **Failed**: Something went wrong (credits refunded)

4. Once complete:
   - View your generated try-on
   - Download the image
   - Share on social media
   - Create a new try-on

---

## Managing Your History

### Viewing Past Try-Ons

1. Navigate to **History** from the sidebar
2. View all your generated try-ons in a grid layout
3. Each card shows:
   - Result image thumbnail
   - Generation date and time
   - Mode used (top only / full outfit)
   - Status

### Actions on History Items

**View Full Size**: Click on any image to view in a modal

**Download**: 
1. Click the download icon on the image card
2. Image saves to your downloads folder
3. Filename format: `tryon_YYYYMMDD_HHMMSS.png`

**Delete**:
1. Click the delete icon (trash can)
2. Confirm deletion
3. Image is permanently removed

### Filtering & Search

- **Status Filter**: Show only completed, failed, or processing try-ons
- **Date Range**: Filter by creation date
- **Mode Filter**: Show only top-only or full-outfit generations

---

## Purchasing Credits

### Pricing Plans

TrailRoom offers flexible pricing with volume discounts:

| Credits | Base Price | Discount | Final Price | Price per Credit |
|---------|------------|----------|-------------|------------------|
| 300 | ₹300 | 0% | ₹300 | ₹1.00 |
| 2,100 | ₹2,100 | 10% | ₹1,890 | ₹0.90 |
| 5,000 | ₹5,000 | 13% | ₹4,350 | ₹0.87 |
| 10,000 | ₹10,000 | 17% | ₹8,300 | ₹0.83 |
| 50,000 | ₹50,000 | 25% | ₹37,500 | ₹0.75 |

**Recommended**: 2,100 credits (best value for individuals)

### How to Purchase

1. Click **Purchase Credits** from sidebar or credit balance
2. Choose a plan:
   - **Fixed Plans**: Pre-configured popular amounts
   - **Custom Amount**: Use slider to select any amount (300-50,000)

3. **Pricing Calculator**:
   - Adjust slider to see real-time pricing
   - Discount automatically applied
   - See final price before checkout

4. **Checkout**:
   - Click **Buy Now**
   - Razorpay checkout opens
   - Complete payment via:
     - Credit/Debit Card
     - UPI
     - Net Banking
     - Wallets

5. **Confirmation**:
   - Credits added instantly upon successful payment
   - Invoice generated automatically
   - Confirmation email sent

### Payment Security

- All payments processed securely via Razorpay
- PCI DSS compliant
- No card details stored on our servers
- 256-bit SSL encryption

---

## API Access

### For Developers

TrailRoom offers API access for integrating virtual try-on into your applications.

### Generating API Keys

1. Navigate to **Settings** > **API Keys**
2. Click **Generate New Key**
3. Give your key a name (e.g., "Production App")
4. **Important**: Copy the key immediately - it won't be shown again!
5. Store securely (like a password)

### Managing API Keys

- **View Keys**: See all your active API keys
- **Last Used**: Check when each key was last used
- **Regenerate**: Create a new key if compromised
- **Revoke**: Disable keys you no longer need

### API Documentation

Full API documentation available at: [API Reference](./API_REFERENCE.md)

### API Playground

Test API calls interactively:
1. Navigate to **API Playground**
2. Select an endpoint
3. Fill in parameters
4. Click **Send Request**
5. View response
6. Copy generated code (cURL, Python, JavaScript)

---

## Billing & Invoices

### Viewing Payment History

1. Navigate to **Billing** from the sidebar
2. See all your past payments:
   - Payment date
   - Amount paid
   - Credits purchased
   - Discount applied
   - Payment status

### Downloading Invoices

1. Go to **Billing** > **Invoices**
2. Find the invoice you need
3. Click **Download**
4. Invoice saves as text file with all details:
   - Invoice number
   - Date and time
   - Amount breakdown
   - Tax details (if applicable)
   - Payment method

### Refund Policy

- **Failed Generations**: Credits automatically refunded
- **Payment Issues**: Contact support within 7 days
- **Unused Credits**: Non-refundable (never expire)

---

## Tips for Best Results

### For Person Photos

✅ **Do**:
- Use high-resolution photos (at least 1000px height)
- Stand straight facing the camera
- Good, even lighting
- Solid, plain background
- Wear fitted clothing for better garment fit visualization
- Full body visible (especially for full-outfit mode)

❌ **Don't**:
- Use blurry or low-quality images
- Have multiple people in the photo
- Wear very baggy clothes that hide body shape
- Use photos with heavy filters or effects
- Have cluttered backgrounds
- Use photos taken at extreme angles

### For Clothing Images

✅ **Do**:
- Use product photos from online stores
- Ensure clothing is clearly visible
- Use images with plain/white backgrounds
- Show the complete garment
- Use flat lay or mannequin photos

❌ **Don't**:
- Use images with people already wearing the clothes
- Use heavily edited or filtered images
- Include multiple clothing items in one image (for top-only mode)
- Use extreme close-ups or cropped images

### Mode Selection Guide

**Use Top Only When**:
- Trying on shirts, t-shirts, tops, sweaters
- Trying on jackets or blazers
- You want to keep your current bottom garment
- Budget-conscious (uses only 1 credit)

**Use Full Outfit When**:
- Trying on complete outfits
- Trying on dresses or jumpsuits
- Want to see how top and bottom coordinate
- Need to visualize the full look

---

## Troubleshooting

### Generation Failed

**Problem**: Try-on generation failed

**Solutions**:
1. Check image file size (must be under 5MB)
2. Ensure images are in supported formats (JPG, PNG, JPEG, WEBP)
3. Try using a clearer photo
4. Check your internet connection
5. Try again - credits are automatically refunded for failures

### Poor Quality Results

**Problem**: Generated try-on doesn't look realistic

**Solutions**:
1. Use higher quality input images
2. Ensure good lighting in person photo
3. Try with a plain background
4. Use product photos for clothing (not photos of people wearing them)
5. Make sure body posture is straight and facing camera

### Upload Issues

**Problem**: Can't upload images

**Solutions**:
1. Check file size (max 5MB)
2. Verify file format (JPG, PNG, JPEG, WEBP only)
3. Try a different browser
4. Clear browser cache and cookies
5. Disable browser extensions temporarily
6. Check internet connection

### Payment Failed

**Problem**: Payment didn't go through

**Solutions**:
1. Check card details are correct
2. Ensure sufficient balance
3. Try a different payment method
4. Contact your bank if payment was declined
5. Try again after a few minutes
6. Contact support if issue persists

### Credits Not Added

**Problem**: Paid but credits not showing

**Solutions**:
1. Refresh the page
2. Check **Billing** > **Payment History**
3. Wait 2-3 minutes for processing
4. Check if payment was actually completed
5. Contact support with payment ID

---

## FAQ

### General

**Q: Is TrailRoom free to use?**
A: Yes! You get 3 free credits daily. You can purchase additional credits for unlimited use.

**Q: Do credits expire?**
A: Purchased credits never expire. Daily free credits reset every 24 hours.

**Q: How long does generation take?**
A: Typically 20-30 seconds, depending on server load.

**Q: Can I use TrailRoom on mobile?**
A: Yes! TrailRoom is fully responsive and works on all devices.

### Privacy & Security

**Q: What happens to my photos?**
A: Photos are stored securely for 30 days, then automatically deleted. You can delete them anytime.

**Q: Is my payment information secure?**
A: Yes. We use Razorpay (PCI DSS compliant). We never store your card details.

**Q: Can others see my try-ons?**
A: No. All try-ons are private and visible only to you.

### Technical

**Q: What image formats are supported?**
A: JPG, JPEG, PNG, and WEBP.

**Q: What's the maximum image size?**
A: 5MB per image.

**Q: Can I use the API?**
A: Yes! Generate API keys from your dashboard and see our API documentation.

**Q: What's the API rate limit?**
A: Free users: 10 requests/minute. Paid users: 60 requests/minute.

### Pricing

**Q: How much is one generation?**
A: Top-only: 1 credit. Full outfit: 2 credits.

**Q: What's the best value?**
A: The 2,100 credit pack offers 10% discount and is most popular.

**Q: Can I get a refund?**
A: Credits for failed generations are automatically refunded. Unused credits are non-refundable.

### Results

**Q: Why doesn't my try-on look perfect?**
A: AI-generated images depend heavily on input quality. Use high-quality, well-lit photos for best results.

**Q: Can I try on any type of clothing?**
A: Best results with tops, shirts, jackets, and full outfits. Some specialty items may not work as well.

**Q: Can I adjust the result?**
A: Not currently, but you can generate as many variations as you want with your credits.

---

## Need More Help?

### Contact Support

- **Email**: support@trailroom.com
- **Response Time**: Within 24 hours
- **Include**:
  - Your account email
  - Description of the issue
  - Screenshots if applicable
  - Job ID (for generation issues)

### Community

- **Discord**: Join our community for tips and tricks
- **Twitter**: @TrailRoomAI for updates and announcements

### Resources

- [API Documentation](./API_REFERENCE.md)
- [System Architecture](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

**Happy Trying On! 👕👖**

*Last Updated: December 2024*
