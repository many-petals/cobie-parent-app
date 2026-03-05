# Deploying Many Petals to manypetals.com

This guide provides step-by-step instructions for deploying your Many Petals app to your custom domain **manypetals.com**.

---

## Option 1: Netlify (Recommended)

Netlify is the easiest option for deploying React apps with custom domains.

### Step 1: Build Your App

```bash
npm run build
```

This creates a `dist` folder with your production-ready files.

### Step 2: Deploy to Netlify

#### Method A: Netlify CLI (Fastest)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   netlify deploy --prod --dir=dist
   ```

#### Method B: Netlify Dashboard (Drag & Drop)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Sign up/login
3. Drag and drop your `dist` folder onto the dashboard
4. Your site is live!

#### Method C: Connect to Git Repository

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub/GitLab/Bitbucket repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click "Deploy site"

### Step 3: Configure Custom Domain (manypetals.com)

1. In Netlify dashboard, go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter `manypetals.com`
4. Netlify will provide DNS records to configure

### Step 4: Update DNS Records

Go to your domain registrar (where you bought manypetals.com) and add these DNS records:

| Type  | Name | Value                          |
|-------|------|--------------------------------|
| A     | @    | 75.2.60.5                      |
| CNAME | www  | your-site-name.netlify.app     |

**Note:** Replace `your-site-name` with your actual Netlify site name.

### Step 5: Enable HTTPS

1. In Netlify dashboard, go to **Site settings** → **Domain management**
2. Scroll to **HTTPS** section
3. Click **Verify DNS configuration**
4. Once verified, click **Provision certificate**
5. SSL certificate will be automatically installed (free!)

---

## Option 2: Vercel

### Step 1: Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

### Step 2: Configure Custom Domain

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Domains**
4. Add `manypetals.com`

### Step 3: Update DNS Records

Add these DNS records at your domain registrar:

| Type  | Name | Value                |
|-------|------|----------------------|
| A     | @    | 76.76.21.21          |
| CNAME | www  | cname.vercel-dns.com |

---

## Option 3: Cloudflare Pages

### Step 1: Deploy to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Select **Pages** from the sidebar
3. Click **Create a project** → **Connect to Git**
4. Select your repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Click **Save and Deploy**

### Step 2: Add Custom Domain

1. In your Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter `manypetals.com`
4. If your domain is already on Cloudflare, DNS is automatic
5. If not, add the provided DNS records at your registrar

---

## Option 4: AWS Amplify

### Step 1: Deploy to AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click **New app** → **Host web app**
3. Connect your Git repository
4. Configure build settings (auto-detected for Vite)
5. Click **Save and deploy**

### Step 2: Add Custom Domain

1. In Amplify Console, go to **App settings** → **Domain management**
2. Click **Add domain**
3. Enter `manypetals.com`
4. Follow the DNS configuration instructions provided

---

## Required Assets for Production

Before deploying, ensure you have these files in your `public` folder:

### Favicon Files (Create these)
- `favicon.svg` - SVG favicon (modern browsers)
- `favicon-16x16.png` - 16x16 PNG favicon
- `favicon-32x32.png` - 32x32 PNG favicon
- `apple-touch-icon.png` - 180x180 PNG for iOS
- `android-chrome-192x192.png` - 192x192 PNG for Android
- `android-chrome-512x512.png` - 512x512 PNG for Android

### Social Media Image
- `og-image.png` - 1200x630 PNG for social media sharing

### Generate Favicons
Use [realfavicongenerator.net](https://realfavicongenerator.net) to generate all favicon sizes from a single image.

---

## Post-Deployment Checklist

- [ ] Verify site loads at https://manypetals.com
- [ ] Verify www.manypetals.com redirects properly
- [ ] Test HTTPS is working (green lock icon)
- [ ] Check all pages load correctly (no 404 errors)
- [ ] Test on mobile devices
- [ ] Verify social media preview (use [opengraph.xyz](https://www.opengraph.xyz))
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (optional)

---

## Troubleshooting

### Page Not Found on Refresh
This is handled by the `_redirects` file for Netlify. For other hosts:
- **Vercel:** Automatic for Vite apps
- **Cloudflare Pages:** Add a `_redirects` file or configure in dashboard
- **AWS Amplify:** Add redirect rules in amplify.yml

### DNS Not Propagating
DNS changes can take up to 48 hours. Check propagation at [dnschecker.org](https://dnschecker.org)

### HTTPS Certificate Issues
- Ensure DNS is properly configured
- Wait for DNS propagation
- Try re-provisioning the certificate

---

## Environment Variables (If Needed)

If your app uses environment variables, configure them in your hosting provider:

### Netlify
Site settings → Build & deploy → Environment → Environment variables

### Vercel
Project Settings → Environment Variables

### Cloudflare Pages
Settings → Environment variables

---

## Need Help?

- [Netlify Docs](https://docs.netlify.com)
- [Vercel Docs](https://vercel.com/docs)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [AWS Amplify Docs](https://docs.amplify.aws)
