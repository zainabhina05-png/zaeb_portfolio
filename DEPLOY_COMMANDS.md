# 🚀 Deploy Your Portfolio - Step by Step

## ✅ Step 1: Initialize Git and Commit

Open your terminal in `c:\Users\MG\Downloads\saewre` and run these commands one by one:

```powershell
# Initialize Git repository
git init

# Add all files to staging
git add .

# Create your first commit
git commit -m "Initial commit: Full-stack portfolio with 3D game mode, resume section, certifications, and projects"

# Set the main branch name
git branch -M main

# Connect to your GitHub repository
git remote add origin https://github.com/zainabhina05-png/zaeb_portfolio.git

# Push to GitHub
git push -u origin main
```

---

## ✅ Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended - Fastest)

```powershell
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy (it will ask you a few questions)
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - What's your project's name? zaeb-portfolio
# - In which directory is your code located? ./
# - Want to modify settings? N

# Then deploy to production
vercel --prod
```

### Option B: Using Vercel Dashboard (Visual)

1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Click "Import Project"
4. Select `zaeb_portfolio` repository
5. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click **Deploy**
7. Wait 2-3 minutes ⏱️
8. Your site will be live at: `https://zaeb-portfolio.vercel.app`

---

## ✅ Step 3: Verify Deployment

Once deployed, check your live site:
- ✅ Hero section loads
- ✅ Resume section with ivory background
- ✅ Education shows Software Engineering 2024-PRESENT
- ✅ Certifications display with verify links
- ✅ Projects show correct GitHub/Vercel links
- ✅ 3D game mode works
- ✅ Footer perspective grid animates

---

## 🎉 Success!

Your portfolio is now live! Share it with:
- Employers
- LinkedIn profile
- GitHub profile README
- Your resume

---

## 🔄 Future Updates

Whenever you make changes:

```powershell
# Add changed files
git add .

# Commit with a message
git commit -m "Update: describe your changes"

# Push to GitHub (Vercel auto-deploys)
git push
```

Vercel will automatically rebuild and redeploy your site within 2-3 minutes! 🚀

---

## 🆘 Troubleshooting

### If build fails on Vercel:

**Error: "Command failed"**
```powershell
# Test build locally first
npm install
npm run build
```

**Error: "Node version"**
Add to `package.json`:
```json
"engines": {
  "node": ">=18.0.0"
}
```

**Error: "Module not found"**
```powershell
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### If Git push fails:

**Error: "rejected - non-fast-forward"**
```powershell
# Force push (ONLY for first deployment)
git push -u origin main --force
```

**Error: "Authentication failed"**
- Make sure you're logged into GitHub
- Use GitHub Desktop or authenticate via browser

---

## 📝 Custom Domain (Optional)

After deployment, you can add a custom domain:

1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Domains"
3. Add your domain (e.g., `zainab.dev`)
4. Follow DNS configuration instructions

---

## 🎯 Your Portfolio URLs

- **GitHub Repository**: https://github.com/zainabhina05-png/zaeb_portfolio
- **Live Site**: `https://zaeb-portfolio.vercel.app` (after deployment)
- **Vercel Dashboard**: https://vercel.com/dashboard

---

**Ready to deploy? Run the commands above!** 🚀
