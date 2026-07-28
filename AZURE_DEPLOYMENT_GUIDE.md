# Azure Static Web Apps Deployment Guide

Complete step-by-step guide to deploy Budget Tracker to Azure Static Web Apps with GitHub Actions.

## Prerequisites

- GitHub repository with Budget Tracker code pushed to `main` branch
- Azure subscription (free tier available)
- Admin access to both GitHub repo and Azure subscription

---

## Part 1: Create Azure Static Web Apps Resource

### Step 1: Sign into Azure Portal

1. Go to [https://portal.azure.com](https://portal.azure.com)
2. Sign in with your Azure account
3. If you don't have an account, create a free one at [https://azure.microsoft.com/free](https://azure.microsoft.com/free)

### Step 2: Create a New Static Web App

1. Click **"Create a resource"** (top left)
2. Search for **"Static Web Apps"**
3. Click on **"Static Web Apps"** result
4. Click **"Create"**

### Step 3: Fill in Basic Information

| Field | Value | Notes |
|-------|-------|-------|
| **Subscription** | Select your subscription | |
| **Resource Group** | Create new or select existing | e.g., `budget-tracker-rg` |
| **Name** | `budget-tracker` | Must be globally unique, lowercase only |
| **Plan type** | Free | Sufficient for personal apps |
| **Region** | East US (or closest to you) | Choose region near your location |

Click **"Next: Deployment details >"**

### Step 4: Configure GitHub Connection

1. **Source**: Select **"GitHub"**
2. Click **"Sign in with GitHub"**
   - Authorize Azure to access your GitHub account
3. **Organization**: Select your GitHub organization/user account
4. **Repository**: Select `budget-tracker` (or your repo name)
5. **Branch**: Select `main`

### Step 5: Configure Build Details

Fill in the build configuration:

| Field | Value |
|-------|-------|
| **Build Presets** | Custom |
| **App location** | `/` |
| **API location** | (leave empty) |
| **Output location** | `dist` |

**Explanation:**
- **App location** `/` - Root of repo
- **API location** - Empty (no backend API)
- **Output location** `dist` - Where Vite outputs the build

### Step 6: Review and Create

1. Review all settings
2. Click **"Create"**
3. Wait 2-3 minutes for the resource to be created

**You'll see:**
- Deployment in progress
- GitHub Actions workflow being created automatically
- Deployment token generated

---

## Part 2: Get Your Deployment Token

### Step 1: Navigate to Your Static Web App

After creation, you'll see your Static Web App resource in Azure Portal.

### Step 2: Get the Deployment Token

1. In the Static Web App resource page, find **"Manage deployment token"** in the left sidebar
   - Or go to: **Settings** > **Manage deployment token**
2. Click **"Copy"** to copy the full token (starts with `?`)
3. **Save this token securely** - you'll use it in the next step

**The token will look like:**
```
?sv=2021-03-02&sig=xxxxxxxxxxxxx&se=2027-07-28T00:00:00Z&sr=b&sp=racwd&se=2027-12-31T23:59:59Z&spr=https&sig=xxxxxxxxxxx
```

---

## Part 3: Configure GitHub Secrets

### Step 1: Go to Your GitHub Repository

1. Navigate to your GitHub repository: `github.com/yourusername/budget-tracker`
2. Click **"Settings"** tab (top right)

### Step 2: Add Repository Secret

1. In the left sidebar, click **"Secrets and variables"** > **"Actions"**
2. Click **"New repository secret"** (green button)

### Step 3: Create the Secret

1. **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN_BUDGET_TRACKER`
   - Use exactly this name (case-sensitive)
   - Replace `BUDGET_TRACKER` with uppercase version of your app name if different
2. **Secret**: Paste the deployment token you copied (the full `?sv=...` value)
3. Click **"Add secret"**

**✓ Secret is now saved and ready for GitHub Actions**

---

## Part 4: Verify GitHub Actions Workflow

### Step 1: Check Workflow File

Your repo should have `.github/workflows/azure-deploy.yml` with this content:

```yaml
name: Deploy to Azure Static Web Apps

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install --registry https://artifactory.wolterskluwer.io/artifactory/api/npm/npm-remote/

      - name: Build
        run: npm run build

      - name: Deploy to Azure Static Web Apps
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_BUDGET_TRACKER }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: '/'
          api_location: ''
          output_location: 'dist'
```

**If the file is missing:**
1. Create `.github/workflows/azure-deploy.yml` in your repo
2. Copy the YAML above
3. Commit and push

### Step 2: Fix npm Registry (if needed)

The workflow includes the corporate npm registry. You have two options:

**Option A: Keep registry in workflow (recommended for Azure)**
- The workflow already has: `npm install --registry https://artifactory.wolterskluwer.io/artifactory/api/npm/npm-remote/`
- No additional changes needed

**Option B: Use .npmrc file**
If your `.npmrc` is configured properly:
```
registry=https://artifactory.wolterskluwer.io/artifactory/api/npm/npm-remote/
strict-ssl=false
```
Then simplify the workflow to just: `npm install`

---

## Part 5: Trigger the First Deployment

### Method 1: Push Code to Main Branch

```bash
git add .
git commit -m "Initial deployment setup"
git push origin main
```

### Method 2: Redeploy from Azure Portal

1. Go to your Static Web App in Azure Portal
2. Click **"Deployments"** in the left sidebar
3. Find the latest deployment
4. Click **"Redeploy"**

### Method 3: Trigger from GitHub

1. Go to your GitHub repo
2. Click **"Actions"** tab
3. Click **"Deploy to Azure Static Web Apps"** workflow
4. Click **"Run workflow"** > **"Run workflow"**

---

## Part 6: Monitor Deployment

### Step 1: Watch GitHub Actions

1. Go to your repo > **"Actions"** tab
2. You'll see the workflow running:
   - **Setup Node.js** ✓
   - **Install dependencies** ✓
   - **Build** ✓
   - **Deploy to Azure Static Web Apps** ✓

**Expected duration:** 2-5 minutes

### Step 2: Check Deployment Status

**In GitHub:**
- Green checkmark ✓ = Deployment successful
- Red X = Deployment failed (check logs)

**In Azure Portal:**
- Go to Static Web App > **"Deployments"**
- Latest deployment shows status
- Production URL will be displayed

### Step 3: Access Your Deployed App

Once deployment completes:

1. **In Azure Portal**: Static Web App > **"Overview"**
2. Look for **"URL"** field (e.g., `https://budget-tracker-abc123.azurestaticapps.net`)
3. Click the URL to open your live app

---

## Part 7: Test the Deployment

### Test Your Live App

1. Open the production URL from Azure Portal
2. Verify all features work:
   - ✓ Dashboard loads with stat cards
   - ✓ Can add a transaction
   - ✓ Can navigate to different months
   - ✓ Dark mode toggle works
   - ✓ Settings page accessible
   - ✓ Charts render correctly

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for any errors (red text)
4. Go to **Network** tab to verify assets load

---

## Troubleshooting

### ❌ Deployment Failed - Check GitHub Actions Logs

1. Go to repo > **"Actions"**
2. Click the failed workflow run
3. Click the failed step to see error details
4. Common issues:

| Error | Solution |
|-------|----------|
| `npm install` fails | Verify `.npmrc` or add registry to workflow |
| `npm run build` fails | Check Vite config, verify all dependencies installed |
| `terser not found` | Run `npm install terser --save-dev` |
| `Deploy fails` | Verify API token secret name matches exactly |

### ❌ App Shows 404

- Verify "Output location" is `dist` in Azure Portal settings
- Confirm `dist/` folder has `index.html`
- Check build output: `npm run build` locally

### ❌ Static files return 403

This is normal for Azure Static Web Apps. They're cached globally. If you need to bust cache:
- Make a small change and push
- The new deployment will update everywhere
- Takes 2-5 minutes to propagate globally

### ❌ npm Registry Errors in GitHub Actions

**Error:**
```
403 Forbidden - GET https://registry.npmjs.org/@vitejs%2fplugin-react
```

**Solution:**
Ensure the workflow has:
```yaml
- name: Install dependencies
  run: npm install --registry https://artifactory.wolterskluwer.io/artifactory/api/npm/npm-remote/
```

---

## Continuous Deployment Setup

### Automatic Deployments on Push

Your workflow is now configured to:

1. **Trigger on push to `main`**: Automatically builds and deploys
2. **Create preview environments on PRs**: Each pull request gets a preview URL
3. **Close preview on PR close**: Cleanup after merge

### View Deployment History

1. Azure Portal > Static Web App > **"Deployments"**
2. See all past deployments with:
   - Timestamp
   - Commit message
   - Status (Success/Failed)
   - URL

### Roll Back to Previous Deployment

1. Azure Portal > Static Web App > **"Deployments"**
2. Find previous successful deployment
3. Click **"Redeploy"**

---

## Environment Variables (If Needed Later)

For future backend integration, add environment variables:

1. **Azure Portal** > Static Web App > **"Configuration"**
2. Add environment variables (e.g., API_URL, etc.)
3. They'll be available to your app

---

## Next Steps After Deployment

✅ **You've successfully deployed!** Here's what's next:

1. **Test Production App**
   - Add test transactions
   - Verify all features work
   - Test on mobile

2. **Set Up Custom Domain** (optional)
   - Azure Portal > Static Web App > **"Custom domains"**
   - Add your own domain (budget-tracker.com, etc.)

3. **Enable HTTPS** (automatic)
   - Azure Static Web Apps automatically provides free HTTPS
   - Certificate auto-renews

4. **Monitor Performance**
   - Use Azure Monitor
   - Check performance in browser DevTools

5. **Iterate and Deploy**
   - Make changes locally
   - Push to GitHub
   - Automatic deployment to production
   - Check GitHub Actions for status

---

## Quick Reference

| Task | Where |
|------|-------|
| View live app | Azure Portal > Static Web App > URL |
| Check deployment status | GitHub > Actions tab |
| View deployment history | Azure Portal > Deployments |
| Add environment variables | Azure Portal > Configuration |
| Manage custom domain | Azure Portal > Custom domains |
| View app logs | Azure Portal > Log Stream |
| Redeploy manually | Azure Portal > Deployments > Redeploy |

---

## Support Resources

- **Azure Docs**: [Static Web Apps](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- **GitHub Actions**: [Workflow Documentation](https://docs.github.com/en/actions)
- **Vite Build**: [Vite Documentation](https://vitejs.dev/)
- **React**: [React Documentation](https://react.dev/)

---

## Common Commands

```bash
# Local development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Install dependencies with corporate registry
npm install --registry https://artifactory.wolterskluwer.io/artifactory/api/npm/npm-remote/

# Deploy (after pushing to main)
# Automatic via GitHub Actions - no manual command needed
```

---

**Your Budget Tracker is now live on Azure Static Web Apps! 🎉**

Every push to the `main` branch will automatically:
1. Build the app
2. Run tests (if added)
3. Deploy to production
4. Update your live URL

**That's it!** You now have a professional CI/CD pipeline deployed to Azure. 🚀
