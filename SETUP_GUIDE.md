# Setup and Deployment Guide

## Initial Setup

The Budget Tracker project has been successfully created with all necessary files and dependencies.

### Prerequisites Setup

If you haven't already, install these globally:
- Node.js 18+ from https://nodejs.org/
- npm comes with Node.js

### Development Commands

All npm commands should use the public npm registry. You can either:

**Option 1: Add to each command (recommended for CI/CD)**
```bash
npm install --registry https://registry.npmjs.org/
npm run dev
```

**Option 2: Configure .npmrc globally**
Edit or create `~\.npmrc` (in your home directory) and add:
```
registry=https://registry.npmjs.org/
strict-ssl=false
```

Then you can use standard npm commands:
```bash
npm install
npm run dev
npm run build
npm run preview
```

## Local Development

To start the development server:

```bash
npm install --registry https://registry.npmjs.org/
npm run dev
```

The app will open at `http://localhost:5173` with hot module reloading enabled.

## Production Build

Create a production build:

```bash
npm run build
```

Output will be in the `dist/` folder, ready for deployment to Azure Static Web Apps.

## Azure Deployment Setup

### 1. Create Azure Static Web Apps Resource

In Azure Portal:
1. Create a new "Static Web Apps" resource
2. Set the resource group and name
3. Select "Free" plan
4. Choose deployment source as GitHub

### 2. Connect GitHub Repository

1. Authorize Azure with your GitHub account
2. Select your repository
3. Select the `main` branch
4. Build configuration:
   - App location: `/`
   - API location: (leave empty)
   - Output location: `dist`

### 3. Add Repository Secret

In your GitHub repository settings:
1. Go to Settings > Secrets and variables > Actions
2. Create a new secret named: `AZURE_STATIC_WEB_APPS_API_TOKEN_BUDGET_TRACKER`
3. Get the value from Azure Portal > Static Web Apps > Manage deployment token

### 4. Configure npm Registry

The GitHub Actions workflow needs to install dependencies. Update the workflow file or create a `.npmrc` in the repo root with:

```
registry=https://registry.npmjs.org/
strict-ssl=false
```

Or modify `.github/workflows/azure-deploy.yml` to add the registry parameter to npm install:

```yaml
- name: Install dependencies
  run: npm install --registry https://registry.npmjs.org/
```

### 5. Deploy

Simply push to `main` branch:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

The GitHub Actions workflow will automatically:
1. Install dependencies
2. Build the project (`npm run build`)
3. Deploy to Azure Static Web Apps

## Testing the Build Locally

After building, you can preview the production build locally:

```bash
npm run preview
```

This starts a local server with the production build output.

## Project Features

✅ Dashboard with income/expense summary
✅ Transaction CRUD operations  
✅ Category-based expense tracking
✅ Monthly budget limits with progress bars
✅ Month-by-month navigation
✅ Dark/Light theme toggle
✅ Responsive mobile design
✅ Data export/import
✅ GitHub Actions CI/CD pipeline
✅ Azure Static Web Apps deployment

## Troubleshooting

### npm install fails with 403 errors
- Make sure you're using the public npm registry: `https://registry.npmjs.org/`
- Add the registry parameter to the install step or configure `.npmrc`

### App doesn't start in dev mode
- Ensure port 5173 is not in use
- Check that all dependencies installed correctly with `npm list`
- Clear node_modules and reinstall: `rm -r node_modules && npm install`

### Build fails with terser error
- This has already been fixed. If it recurs, ensure terser is installed: `npm install terser --save-dev`

### Deployment to Azure fails
- Check that the `dist/` folder contains build output
- Verify the Azure Static Web Apps API token is correct
- Ensure the workflow file has correct paths

## Next Steps

1. **Local Development**: Run `npm run dev` to start developing
2. **Make Changes**: Edit components in `src/components/`
3. **Test**: Verify functionality in browser
4. **Deploy**: Push to main branch to trigger GitHub Actions deployment
5. **Monitor**: Check GitHub Actions tab to see deployment progress

## Project Structure Reference

```
budget-tracker/
├── .github/
│   ├── workflows/
│   │   └── azure-deploy.yml    # GitHub Actions workflow
│   └── copilot-instructions.md # Copilot guidance
├── src/
│   ├── components/             # React components + CSS
│   ├── store/                  # Zustand state management
│   ├── utils/                  # Helper functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── dist/                       # Production build (created by npm run build)
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.js             # Vite configuration
├── .npmrc                      # npm registry configuration
├── .gitignore
└── README.md                   # Project documentation
```

---

For questions or issues, refer to the README.md or check the inline code comments.
