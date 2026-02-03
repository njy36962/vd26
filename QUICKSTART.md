# 🚀 Quick Start: Deploy Your SvelteKit Site to GitHub Pages

Your SvelteKit project is now configured for GitHub Pages deployment! Follow these simple steps:

## ✅ What's Already Set Up

- ✅ SvelteKit with TypeScript
- ✅ Static adapter for GitHub Pages
- ✅ GitHub Actions workflow for automatic deployment
- ✅ Prerendering enabled for static site generation

## 📋 Deployment Steps

### 1. Initialize Git (if not done)

```bash
git init
git add .
git commit -m "Initial commit: SvelteKit site ready for deployment"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Name your repository (e.g., `my-sveltekit-site`)
3. Make it **Public** (required for free GitHub Pages)
4. **Don't** initialize with README
5. Click "Create repository"

### 3. Update Base Path (IMPORTANT!)

**If your repo is NOT `username.github.io`:**

Edit `svelte.config.js` and update line 16:

```javascript
base: process.env.NODE_ENV === "production" ? "/your-repo-name" : "";
```

Replace `your-repo-name` with your actual repository name.

**If your repo IS `username.github.io`:**

Leave it as is (empty string).

### 4. Push to GitHub

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

### 5. Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under "Build and deployment", set **Source** to **GitHub Actions**
3. Done! 🎉

### 6. View Your Site

After the GitHub Action completes (1-2 minutes), your site will be live at:

- **Regular repo:** `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`
- **User site:** `https://YOUR-USERNAME.github.io/`

## 🔄 Updating Your Site

Just push changes to the main branch:

```bash
git add .
git commit -m "Update content"
git push
```

GitHub Actions will automatically rebuild and redeploy!

## 🧪 Test Locally First

```bash
# Development mode
npm run dev

# Production build test
npm run build
npm run preview
```

## 📚 More Details

See `DEPLOYMENT.md` for comprehensive documentation, troubleshooting, and advanced configuration.

## 🆘 Common Issues

**Assets not loading?**

- Check that you set the correct `base` path in `svelte.config.js`

**404 error?**

- Make sure GitHub Pages source is set to "GitHub Actions"
- Ensure your repository is public
- Wait a few minutes after deployment completes

**Need help with links?**

```svelte
<script>
  import { base } from '$app/paths';
</script>

<a href="{base}/about">About</a>
```

---

**Ready to deploy?** Start with step 1 above! 🚀
