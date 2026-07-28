# Azure & GitHub Actions Deployment Checklist

Quick checklist to get your Budget Tracker deployed to Azure Static Web Apps.

## ✅ Pre-Deployment Checklist

- [ ] Code pushed to GitHub `main` branch
- [ ] `.github/workflows/azure-deploy.yml` exists in repo
- [ ] `package.json` has correct scripts (`build`, `dev`)
- [ ] `vite.config.js` configured for SPA
- [ ] `dist/` folder builds successfully locally (`npm run build`)
- [ ] `.npmrc` configured with corporate registry OR workflow has `--registry` flag

## ✅ Part 1: Create Azure Static Web Apps (5-10 minutes)

### In Azure Portal

1. [ ] Sign in to https://portal.azure.com
2. [ ] Click "Create a resource"
3. [ ] Search for and select "Static Web Apps"
4. [ ] Fill in details:
   - [ ] Subscription: Select your subscription
   - [ ] Resource Group: Create new (e.g., `budget-tracker-rg`)
   - [ ] Name: `budget-tracker` (must be globally unique)
   - [ ] Plan type: **Free**
   - [ ] Region: Select closest to you
5. [ ] Click "Next: Deployment details"

### GitHub Connection

6. [ ] Source: Select **GitHub**
7. [ ] Click "Sign in with GitHub"
8. [ ] Authorize Azure
9. [ ] Organization: Select your GitHub account
10. [ ] Repository: Select `budget-tracker`
11. [ ] Branch: Select `main`
12. [ ] Click "Next: Build details"

### Build Configuration

13. [ ] Build Presets: **Custom**
14. [ ] App location: `/`
15. [ ] API location: (leave blank)
16. [ ] Output location: `dist`
17. [ ] Click "Create"
18. [ ] **Wait 2-3 minutes** for resource to be created

## ✅ Part 2: Get Deployment Token (2-3 minutes)

### In Azure Portal

1. [ ] Go to your Static Web App resource
2. [ ] In left sidebar, find "Manage deployment token"
   - Alternative: Settings > Manage deployment token
3. [ ] Click "Copy" to copy the token
4. [ ] **Save the token** - starts with `?sv=`

## ✅ Part 3: Configure GitHub Secret (3-5 minutes)

### In GitHub Repository

1. [ ] Go to https://github.com/yourusername/budget-tracker
2. [ ] Click "Settings" tab
3. [ ] Left sidebar: "Secrets and variables" > "Actions"
4. [ ] Click "New repository secret" (green button)
5. [ ] Name: `AZURE_STATIC_WEB_APPS_API_TOKEN_BUDGET_TRACKER`
   - **Must be exactly this name (case-sensitive)**
6. [ ] Secret: Paste the deployment token (the `?sv=...` value)
7. [ ] Click "Add secret"

## ✅ Part 4: Verify Workflow File (2 minutes)

### In Your Repository

1. [ ] Check that file exists: `.github/workflows/azure-deploy.yml`
2. [ ] Verify it contains:
   ```yaml
   name: Deploy to Azure Static Web Apps
   on:
     push:
       branches: [main]
   ```
3. [ ] If missing, create the file with proper content (see guide)
4. [ ] Verify npm registry line (corporate):
   ```yaml
   run: npm install --registry https://registry.npmjs.org/
   ```

## ✅ Part 5: Trigger First Deployment (5-10 minutes)

### Push to Main Branch

1. [ ] Commit any pending changes:
   ```bash
   git add .
   git commit -m "Deploy to Azure Static Web Apps"
   ```
2. [ ] Push to main:
   ```bash
   git push origin main
   ```

### Monitor Deployment

3. [ ] Go to GitHub repo
4. [ ] Click "Actions" tab
5. [ ] Watch "Deploy to Azure Static Web Apps" workflow
6. [ ] Steps should complete in order:
   - [ ] Checkout code ✓
   - [ ] Setup Node.js ✓
   - [ ] Install dependencies ✓
   - [ ] Build ✓
   - [ ] Deploy to Azure ✓
7. [ ] Wait for green checkmark ✓ (indicates success)
8. [ ] **Estimated time: 3-5 minutes**

## ✅ Part 6: Verify Deployment (2-3 minutes)

### In Azure Portal

1. [ ] Go to Static Web App resource
2. [ ] Click "Overview"
3. [ ] Find the "URL" field
4. [ ] Copy the production URL (e.g., `https://budget-tracker-abc123.azurestaticapps.net`)

### Test Live App

5. [ ] Open the URL in browser
6. [ ] Verify it loads without 404
7. [ ] Test features:
   - [ ] Dashboard loads
   - [ ] Can click "Add Transaction" button
   - [ ] Dark mode toggle works
   - [ ] Can navigate to Budgets tab
   - [ ] Charts display properly
8. [ ] Open DevTools (F12) > Console
9. [ ] Check for any red error messages

## ✅ Part 7: Set Up Continuous Deployment (Done!)

Your app now auto-deploys when you:
- [ ] Push to `main` branch - Auto-deploys to production
- [ ] Create a pull request - Creates preview environment
- [ ] Close a pull request - Cleans up preview

---

## 🚀 You're Live!

| What | Where |
|-----|-------|
| **Live App URL** | Azure Portal > Static Web App > Overview > URL |
| **Deployment Status** | GitHub > Actions tab |
| **Deployment History** | Azure Portal > Deployments |
| **View Logs** | GitHub > Actions > Click workflow run |

---

## ⚠️ If Something Goes Wrong

### Deployment Shows Red ❌

1. Click the failed workflow in GitHub Actions
2. Find the failed step
3. Read the error message carefully
4. **Common fixes:**
   - Missing npm registry flag
   - Wrong secret name
   - Build fails (check `npm run build` locally)

### App Shows 404 or Blank

1. Check Azure Portal > Deployments
2. Verify output location is `dist`
3. Run locally: `npm run build && npm run preview`
4. Check that `dist/index.html` exists

### npm Registry Errors (403 Forbidden)

1. Edit `.github/workflows/azure-deploy.yml`
2. Find the "Install dependencies" step
3. Make sure it has:
   ```
   npm install --registry https://registry.npmjs.org/
   ```

---

## 📞 Getting Help

| Issue | Solution |
|-------|----------|
| GitHub workflow fails | Click workflow > view logs |
| Azure shows 404 | Check `dist/` output location, run build locally |
| npm install errors | Add `--registry` flag to npm install command |
| App is slow | Normal for first request (cold start), subsequent requests are cached |
| Domain issues | Use Azure-provided URL first, add custom domain later |

---

## Time Estimate

- **Part 1 (Azure Setup)**: 5-10 min
- **Part 2 (Token)**: 1-2 min
- **Part 3 (GitHub Secret)**: 2-3 min
- **Part 4 (Verify Workflow)**: 1-2 min
- **Part 5 (Deploy)**: 5-10 min
- **Total: 15-30 minutes** ⏱️

---

## Next Steps After Deployment

1. ✅ Test the live app
2. ⏭️ [Optional] Add custom domain (Azure Portal > Custom domains)
3. ⏭️ [Optional] Enable authentication (Azure Portal > Authentication)
4. ⏭️ Share the URL with others
5. ⏭️ Continue developing - deployments are automatic!

---

**That's it! Your Budget Tracker is now live on Azure Static Web Apps with automatic CI/CD! 🎉**
