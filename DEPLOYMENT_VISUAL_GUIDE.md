# Azure Static Web Apps - Quick Start Visual Guide

## 🎯 The Big Picture

```
Your GitHub Repo
       ↓ (Push to main)
GitHub Actions Workflow
       ↓ (Runs: npm install, npm run build)
Builds dist/ folder
       ↓ (Deploys using API Token)
Azure Static Web Apps
       ↓
Live App URL: https://budget-tracker-xxx.azurestaticapps.net 🎉
```

---

## 📋 Step-by-Step Flow

```
START
  │
  ├─→ [1] Create Azure Static Web App
  │    └─ Name: budget-tracker
  │    └─ Output location: dist
  │    └─ Select your GitHub repo & main branch
  │
  ├─→ [2] Get Deployment Token
  │    └─ Azure Portal → Manage deployment token
  │    └─ Copy the token (starts with ?sv=)
  │
  ├─→ [3] Add GitHub Secret
  │    └─ GitHub repo → Settings → Secrets
  │    └─ Name: AZURE_STATIC_WEB_APPS_API_TOKEN_BUDGET_TRACKER
  │    └─ Value: [paste token]
  │
  ├─→ [4] Verify Workflow File
  │    └─ Check .github/workflows/azure-deploy.yml exists
  │    └─ Verify npm registry configuration
  │
  ├─→ [5] Push Code to Main
  │    └─ git push origin main
  │
  ├─→ [6] GitHub Actions Runs
  │    └─ npm install (with registry flag)
  │    └─ npm run build → creates dist/
  │    └─ Deploy to Azure
  │    └─ Watch on GitHub → Actions tab
  │
  └─→ [7] Access Live App ✅
       └─ URL: Azure Portal → Static Web App → Overview
```

---

## 🔑 Key Configuration Values

```
Azure Static Web Apps Settings:
┌─────────────────────────────────────────┐
│ Plan Type:        Free                  │
│ Region:           East US (or nearest)  │
│ Deployment Source: GitHub               │
│ Branch:           main                  │
│ App location:     /                     │
│ API location:     (empty)               │
│ Output location:  dist                  │
└─────────────────────────────────────────┘

GitHub Secret:
┌────────────────────────────────────────────────────────────┐
│ Name:  AZURE_STATIC_WEB_APPS_API_TOKEN_BUDGET_TRACKER     │
│ Value: ?sv=2021-03-02&sig=xxxxx...                        │
│        (Full token from Azure)                            │
└────────────────────────────────────────────────────────────┘

npm Registry (Public):
┌───────────────────────────────────────────────────────────┐
│ https://registry.npmjs.org/                               │
└───────────────────────────────────────────────────────────┘
```

---

## 🗺️ Where to Find Everything

```
Azure Portal (https://portal.azure.com)
│
├─ Static Web Apps (Search)
│  │
│  ├─ Overview
│  │  └─ URL: Your live app link ← CLICK THIS TO TEST
│  │
│  ├─ Deployments
│  │  └─ History of all deployments
│  │  └─ Redeploy button
│  │
│  └─ Configuration / Manage deployment token
│     └─ Copy API token here
│

GitHub (github.com/yourusername/budget-tracker)
│
├─ Settings
│  └─ Secrets and variables → Actions
│     └─ Add AZURE_STATIC_WEB_APPS_API_TOKEN_BUDGET_TRACKER
│
└─ Actions
   └─ Deploy to Azure Static Web Apps workflow
      └─ Watch it run (2-5 minutes)
      └─ Green ✓ = Success
      └─ Red X = Failed (check logs)
```

---

## 💡 Secret Management

### Creating the GitHub Secret (Most Important!)

```
1. GitHub Repo Settings
   ↓
2. Secrets and variables → Actions
   ↓
3. Click "New repository secret"
   ↓
4. Fill in:
   Name:   AZURE_STATIC_WEB_APPS_API_TOKEN_BUDGET_TRACKER
   Secret: [Paste the ?sv=... token from Azure]
   ↓
5. Click "Add secret"
   ↓
✓ Done! Workflow can now deploy
```

### Token Flow

```
Azure Portal
    ↓ (generates token)
Manage deployment token
    ↓ (you copy it)
GitHub Secret
    ↓ (stored securely)
GitHub Actions
    ↓ (uses it to deploy)
Azure Static Web Apps (deployment succeeds)
```

---

## 🚀 Workflow File Requirements

Your `.github/workflows/azure-deploy.yml` must have:

```yaml
✅ Trigger: push to main branch
✅ Node.js 18
✅ npm install (with corporate registry flag)
✅ npm run build
✅ Azure/static-web-apps-deploy action
✅ API token reference: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_BUDGET_TRACKER }}
✅ Output location: dist
```

---

## 📊 Deployment Status Indicators

```
GitHub Actions (Actions Tab)
│
├─ 🟢 Green checkmark
│  └─ SUCCESS! App is deployed
│  └─ Check Azure Portal for live URL
│
├─ 🔴 Red X
│  └─ FAILED - Click to see error logs
│  └─ Most common: wrong registry, missing secret, build error
│
└─ 🟡 Yellow dot (in progress)
   └─ DEPLOYING - Wait 2-5 minutes
   └─ Check "Setup Node.js" → "Install deps" → "Build" → "Deploy"
```

---

## ✅ Pre-Deployment Checklist (2 minutes)

```
GitHub Repo:
  ☑ Code pushed to main branch
  ☑ .github/workflows/azure-deploy.yml exists
  ☑ npm run build works locally
  ☑ dist/ folder is created

Azure Portal:
  ☑ Static Web App created and linked to GitHub main branch
  ☑ Output location set to: dist
  ☑ API location set to: (empty)
  ☑ App location set to: /

GitHub Secret:
  ☑ Secret name: AZURE_STATIC_WEB_APPS_API_TOKEN_BUDGET_TRACKER
  ☑ Secret value: Full token (starts with ?sv=)
  ☑ Secret is active (green icon)

npm Registry (in workflow):
   ☑ npm install includes: --registry https://registry.npmjs.org/
```

---

## 🧪 Testing Your Deployment

```
After deployment completes:

1. Open Azure Portal
   → Static Web App
   → Overview
   → Copy the URL

2. Test in Browser
   ✓ Loads without 404
   ✓ Dashboard visible
   ✓ Can click buttons
   ✓ Dark mode works
   ✓ Charts display

3. Open DevTools (F12)
   ✓ No red errors in Console
   ✓ Network shows CSS/JS loading
   ✓ Local storage working

4. Share URL
   ✓ Works for others
   ✓ Add transaction
   ✓ Data persists (localStorage)
```

---

## 🔄 Continuous Deployment Timeline

```
You: git push origin main
              ↓ (instant)
GitHub: Triggers Actions workflow
              ↓ (5 seconds)
GitHub Actions: Starts build job
              ↓ (30 seconds)
npm install & npm run build
              ↓ (30 seconds)
Azure Deploy: Uploads dist/ folder
              ↓ (1-2 minutes)
DNS Propagation: Updates global CDN
              ↓ (2-5 minutes total)
Live! 🎉 Everyone sees new version
```

---

## 🎯 Success Indicators

```
✅ GitHub Actions shows green checkmark
✅ Azure Portal shows deployment date/time updated
✅ Azure Portal shows "Success" status
✅ Live URL opens without 404
✅ App features work in browser
✅ Can add test transaction
✅ Browser DevTools shows no errors
✅ URL works on different devices/networks
```

---

## ⚠️ Common Issues & Quick Fixes

```
Issue: GitHub Actions shows red X
Fix:   Click workflow → Check error message
       Usually: Wrong secret name or npm registry flag

Issue: App shows 404
Fix:   Check output location is "dist" in Azure Portal
       Run locally: npm run build

Issue: npm install fails (403 error)
Fix:   Workflow needs: npm install --registry https://...
       (Don't use public registry with corporate setup)

Issue: Deploy step fails silently
Fix:   Check Azure Portal → Log Stream
       View real-time deployment logs

Issue: App works locally but not on Azure
Fix:   Verify dist/ folder exists after build
       Check that index.html is in dist/ root
       Use Azure Portal → Log Stream to debug
```

---

## 📱 URL Format

Your live app will be at:

```
https://[app-name]-[random-id].azurestaticapps.net

Example:
https://budget-tracker-a1b2c3d4.azurestaticapps.net

You can add custom domain later:
https://budget-tracker.com (your domain)
```

---

## ⏱️ Time Breakdown

```
Setup (one-time):
  ├─ Create Azure resource:        5-10 min ⏱️
  ├─ Get token & add to GitHub:    3-5 min ⏱️
  ├─ Verify workflow file:         1-2 min ⏱️
  └─ Total: 15-25 minutes

First Deployment:
  ├─ Push to GitHub:               1 min ⏱️
  ├─ GitHub Actions builds:        2-3 min ⏱️
  ├─ Azure deploys:                1-2 min ⏱️
  └─ Total: 5-10 minutes

Future Deployments:
  └─ Automatic! Same 5-10 min per push

Support Time: 5-10 min for troubleshooting
```

---

## 🎓 Learning Resources

| Topic | Resource |
|-------|----------|
| **Azure Static Web Apps** | [docs.microsoft.com](https://docs.microsoft.com/en-us/azure/static-web-apps/) |
| **GitHub Actions** | [github.com/actions](https://github.com/actions) |
| **Vite Build Tool** | [vitejs.dev](https://vitejs.dev/) |
| **Npm Registry Config** | Check your `.npmrc` file |

---

## 🎉 You're Ready!

**Follow the checklist in `DEPLOYMENT_CHECKLIST.md` to get live in 15-30 minutes!**

Questions? Check:
1. `AZURE_DEPLOYMENT_GUIDE.md` (detailed walkthrough)
2. `DEPLOYMENT_CHECKLIST.md` (quick reference)
3. GitHub Actions logs (actual error messages)
4. Azure Portal → Log Stream (deployment logs)

---

**Happy deploying! 🚀**
