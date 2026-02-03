# Deploying to GitHub Pages

This guide will help you deploy your SvelteKit site to GitHub Pages so others can view it online.

## Prerequisites

- A GitHub account
- Git installed on your computer

## Step 1: Initialize Git Repository (if not already done)

```bash
git init
git add .
git commit -m "Initial commit"
```

## Step 2: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., `my-sveltekit-site`)
5. Choose "Public" (required for free GitHub Pages)
6. **Do NOT** initialize with README, .gitignore, or license (you already have these)
7. Click "Create repository"

## Step 3: Configure Base Path (Important!)

If your repository is NOT `username.github.io`, you need to update the base path:

1. Open `svelte.config.js`
2. Find the `base` setting in the `paths` section
3. Update it to match your repository name:

```javascript
paths: {
  base: process.env.NODE_ENV === "production" ? "/your-repo-name" : "";
}
```

For example, if your repo is `my-sveltekit-site`, use:

```javascript
base: process.env.NODE_ENV === "production" ? "/my-sveltekit-site" : "";
```

**Note:** If deploying to `username.github.io`, leave it as `''`

## Step 4: Push to GitHub

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` and `YOUR-REPO-NAME` with your actual GitHub username and repository name.

## Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" (top menu)
3. Click "Pages" (left sidebar)
4. Under "Build and deployment":
   - **Source:** Select "GitHub Actions"
5. That's it! The workflow will automatically deploy your site

## Step 6: Wait for Deployment

1. Go to the "Actions" tab in your repository
2. You should see a workflow running called "Deploy to GitHub Pages"
3. Wait for it to complete (usually takes 1-2 minutes)
4. Once complete, your site will be live at:
   - `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/` (for regular repos)
   - `https://YOUR-USERNAME.github.io/` (for username.github.io repos)

## Updating Your Site

Every time you push changes to the `main` branch, GitHub Actions will automatically rebuild and redeploy your site:

```bash
git add .
git commit -m "Update site"
git push
```

## Testing Locally Before Deployment

To test the production build locally:

```bash
npm run build
npm run preview
```

## Troubleshooting

### Assets not loading (404 errors)

- Make sure you've set the correct `base` path in `svelte.config.js`
- When linking to pages, use relative paths or the `base` from `$app/paths`:

```svelte
<script>
  import { base } from '$app/paths';
</script>

<a href="{base}/about">About</a>
```

### Workflow fails

- Check the Actions tab for error messages
- Ensure your `package.json` has all necessary dependencies
- Make sure GitHub Pages is enabled in repository settings

### Page shows 404

- Wait a few minutes after the workflow completes
- Check that GitHub Pages source is set to "GitHub Actions"
- Verify your repository is public

## Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file to the `static` folder with your domain name
2. Configure your domain's DNS settings to point to GitHub Pages
3. Enable "Enforce HTTPS" in GitHub Pages settings

## Need Help?

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
