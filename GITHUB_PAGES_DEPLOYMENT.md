# Deploy Shipping Calculator to GitHub Pages

This guide will help you deploy your shipping calculator to GitHub Pages so you can embed it via iframe on any website.

## Quick Setup (5 minutes)

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `shipping-calculator` (you can choose any name)
3. Make it **Public** (required for free GitHub Pages)
4. Don't initialize with README (we'll push existing code)

**Important:** The repository name will be part of your URL:
- Repository named `shipping-calculator` → `https://username.github.io/shipping-calculator/`
- Choose a short, memorable name for easier embedding

### Step 2: Push Your Code to GitHub

In your Replit terminal, run these commands (replace `YOUR-USERNAME` and `YOUR-REPO-NAME`):

```bash
git init
git add .
git commit -m "Initial commit: shipping calculator"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

**Note:** If you already have a git repository set up, just run:
```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select **GitHub Actions**
4. That's it! The deployment will start automatically

### Step 4: Configure Workflow Permissions

1. In your repository, go to **Settings** → **Actions** → **General**
2. Scroll down to **Workflow permissions**
3. Select **Read and write permissions**
4. Check **Allow GitHub Actions to create and approve pull requests**
5. Click **Save**

### Step 5: Wait for Deployment

1. Go to the **Actions** tab in your repository
2. You'll see the "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (usually 2-3 minutes)
4. Once complete, your site will be live!

### Step 6: Get Your URL

Your shipping calculator will be available at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

For example: `https://johndoe.github.io/shipping-calculator/`

---

## Embed on Your Website

Once deployed, use this iframe code on any website:

### Basic Embed
```html
<iframe 
  src="https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/" 
  width="100%" 
  height="700" 
  frameborder="0"
  style="border: none; border-radius: 8px; max-width: 1000px; margin: 0 auto; display: block;"
></iframe>
```

### Full Screen Embed
```html
<div style="position: relative; width: 100%; height: 100vh; overflow: hidden;">
  <iframe 
    src="https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
  ></iframe>
</div>
```

### Responsive Container
```html
<div style="width: 100%; max-width: 1000px; margin: 0 auto; padding: 20px;">
  <iframe 
    src="https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/"
    style="width: 100%; height: 700px; border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
  ></iframe>
</div>
```

---

## Alternative: Use Root Domain (Cleaner URL)

If you want a cleaner URL without the repository name, you can use a root-level GitHub Pages site:

### Option A: User/Organization Site

1. Create a repository named exactly: `YOUR-USERNAME.github.io`
   - Example: `johndoe.github.io`
2. Follow steps 2-6 above
3. **Important:** Edit `.github/workflows/deploy.yml` and change:
   ```yaml
   run: npx vite build --base="/${{ github.event.repository.name }}/"
   ```
   to:
   ```yaml
   run: npx vite build --base="/"
   ```
4. Your site will be at: `https://YOUR-USERNAME.github.io/`
5. Embed code becomes:
   ```html
   <iframe src="https://YOUR-USERNAME.github.io/" ...></iframe>
   ```

### Which Option Should You Choose?

**Repository Site** (`username.github.io/repo-name/`):
- ✅ Can have multiple GitHub Pages sites
- ✅ Works with the default workflow (no changes needed)
- ❌ Longer URL with repository name

**Root Site** (`username.github.io/`):
- ✅ Cleaner, shorter URL
- ✅ Easier to remember and share
- ❌ Only one root site per GitHub account
- ⚠️ Requires editing the workflow file (change base path to "/")

---

## Making Updates

Whenever you make changes to your calculator:

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Update shipping calculator"
   git push
   ```

2. The GitHub Action will automatically rebuild and redeploy your site
3. Changes will be live in 2-3 minutes

---

## Using a Custom Domain (Optional)

If you want to use your own domain instead of `github.io`:

1. In your repository, go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain (e.g., `calculator.yourdomain.com`)
3. Follow [GitHub's instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) to configure your DNS

Then your embed URL becomes:
```html
<iframe src="https://calculator.yourdomain.com/" ...></iframe>
```

---

## Troubleshooting

### ❌ "Deployment failed" in Actions tab
- Check that you enabled **Read and write permissions** in Settings → Actions → General
- Make sure your repository is **Public**

### ❌ Blank page after deployment
- Wait 5-10 minutes for DNS propagation
- Check the Actions tab to ensure deployment completed successfully
- Clear your browser cache and try again

### ❌ "404 - Page not found"
- Verify GitHub Pages is enabled in Settings → Pages
- Make sure the source is set to **GitHub Actions**
- Check that the workflow completed successfully in the Actions tab

### ❌ Changes not appearing
- Check that your git push was successful
- Wait 2-3 minutes for the rebuild to complete
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)

---

## File Structure

The deployment workflow is already set up in:
```
.github/workflows/deploy.yml
```

This workflow:
- Triggers automatically on every push to the `main` branch
- Installs dependencies
- Builds your React app with the correct base path for your repository
- Deploys to GitHub Pages

**How It Works:**
The workflow automatically detects your repository name and sets the correct base path. This ensures all assets (CSS, JavaScript, images) load properly when served from `https://username.github.io/repo-name/`.

You don't need to modify this file unless you want to:
- Use a root-level site (see "Alternative: Use Root Domain" section above)
- Customize the deployment process

---

## Benefits of GitHub Pages

✅ **Free hosting** for public repositories  
✅ **Automatic SSL/HTTPS** included  
✅ **Fast CDN** delivery worldwide  
✅ **Automatic deployments** on every git push  
✅ **Version control** with git history  
✅ **Custom domain** support (optional)  

---

## Need Help?

If you run into issues:
1. Check the **Actions** tab in your GitHub repository for error messages
2. Verify all steps in this guide were completed
3. Make sure your repository is public
4. Ensure workflow permissions are set correctly

Your shipping calculator is now ready to be embedded anywhere on the web! 🚀
