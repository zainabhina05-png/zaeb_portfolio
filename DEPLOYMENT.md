# 🚀 Deployment Guide

Quick guide to deploy your portfolio to Vercel or Netlify.

---

## 📦 Pre-Deployment Checklist

- [ ] All images load correctly locally
- [ ] Build succeeds: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Update personal links in README.md
- [ ] Update contact information in `src/data/`

---

## 🌐 Deploy to Vercel (Recommended)

### **Method 1: Web Dashboard**

1. Push your code to GitHub
2. Visit [vercel.com/new](https://vercel.com/new)
3. Sign in with GitHub
4. Import your repository: `zaeb_portfolio`
5. Configure build settings:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
6. Click **Deploy**
7. Wait 2-3 minutes ⏱️
8. Your site is live! 🎉

### **Method 2: CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts, then deploy to production
vercel --prod
```

---

## 🔷 Deploy to Netlify

### **Method 1: Drag & Drop**

1. Build your project:
   ```bash
   npm run build
   ```
2. Visit [app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist/` folder onto the page
4. Done! 🎉

### **Method 2: CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### **Method 3: Git Integration**

1. Push to GitHub
2. Visit [app.netlify.com](https://app.netlify.com)
3. Click "Import from Git"
4. Select your repository
5. Configure:
   ```
   Build Command: npm run build
   Publish Directory: dist
   ```
6. Click **Deploy**

---

## 🔧 Custom Domain (Optional)

### **Vercel**
1. Go to your project dashboard
2. Settings → Domains
3. Add your custom domain (e.g., `zainab.dev`)
4. Update DNS records with your registrar
5. Wait for SSL certificate (automatic)

### **Netlify**
1. Go to Site Settings → Domain Management
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. SSL is automatic via Let's Encrypt

---

## 🐛 Troubleshooting

### **Build fails with "out of memory"**
```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### **Images don't load in production**
- Check all image imports use absolute paths
- Verify images are in `public/` or imported in components
- Clear browser cache

### **3D game mode doesn't work**
- Check browser console for errors
- Verify Three.js bundles correctly
- Test in Chrome/Edge (best WebGL support)

### **Slow initial load**
- Enable Vercel/Netlify image optimization
- Consider lazy-loading heavy 3D assets
- Use `npm run build -- --mode production` for optimizations

---

## 📊 Post-Deployment

### **Monitor Performance**
- Run Lighthouse audit in Chrome DevTools
- Check Core Web Vitals in Google Search Console
- Monitor bundle size with Vercel Analytics

### **Update Content**
```bash
# Make changes locally
git add .
git commit -m "Update project links"
git push

# Vercel/Netlify auto-deploys!
```

---

## 🎯 Deployment Platforms Comparison

| Feature | Vercel | Netlify |
|---------|--------|---------|
| **Free Tier** | 100 GB bandwidth | 100 GB bandwidth |
| **Build Time** | ~2-3 min | ~2-3 min |
| **SSL** | Automatic | Automatic |
| **CDN** | Global | Global |
| **Analytics** | Free (basic) | Paid only |
| **Best For** | React/Next.js | Static sites |

---

## ✅ Success!

Your portfolio should now be live at:
- Vercel: `https://zaeb-portfolio.vercel.app`
- Netlify: `https://zaeb-portfolio.netlify.app`

Share your link with employers and on LinkedIn! 🎉
