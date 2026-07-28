# Copilot Instructions for Budget Tracker

This file contains workspace-specific guidance for Copilot when working on the Budget Tracker project.

## Project Overview

Budget Tracker is a personal finance management web application built with React + Vite, featuring transaction tracking, budget management, and data visualization. The app is deployed to Azure Static Web Apps via GitHub Actions.

## Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Zustand
- **Charting Library**: Recharts
- **Styling**: CSS3 with CSS Variables
- **Package Manager**: npm
- **Deployment**: Azure Static Web Apps
- **CI/CD**: GitHub Actions

## Key Directories and Files

- `src/` - Source code root
  - `components/` - React components (Dashboard, TransactionLog, CategoryBudgets, Settings, Layout)
  - `store/` - Zustand state management (appStore.js, themeStore.js)
  - `utils/` - Helper functions (dateHelpers.js, validators.js)
  - `App.jsx` - Main app component
  - `main.jsx` - React entry point
  - `index.css` - Global styles with CSS variables
- `.github/workflows/` - GitHub Actions workflows
- `vite.config.js` - Vite configuration
- `index.html` - HTML entry point
- `package.json` - Dependencies and scripts

## Development Workflow

1. **Local Development**: Run `npm run dev` to start the development server
2. **Build**: Run `npm run build` to create production build
3. **Preview**: Run `npm run preview` to test production build locally
4. **Deployment**: Push to `main` branch triggers automatic GitHub Actions deployment

## Code Conventions

- Use functional components with React hooks
- Use Zustand `create()` and `persist` middleware for state
- CSS Variables for theming: `--color-light-bg`, `--color-dark-bg`, etc.
- Mobile-first responsive design approach
- Date handling: All dates stored as ISO strings, displayed as formatted strings
- Validation: Use utility functions from `utils/validators.js`

## Data Model

**Transactions**:
```javascript
{ id, name, amount, type: 'income'|'expense', category, date, notes }
```

**Categories**:
```javascript
{ id, name, color, icon }
```

**Monthly Budgets**:
```javascript
{ "YYYY-MM": { categoryId: limit, ... } }
```

## Common Tasks

### Adding a New Component
1. Create file in `src/components/ComponentName.jsx`
2. Create corresponding CSS file: `ComponentName.css`
3. Import and use in appropriate parent component

### Adding a State Field
1. Edit `src/store/appStore.js` for app state
2. Edit `src/store/themeStore.js` for theme/settings
3. Use Zustand hooks: `const { field } = useStore()`

### Adding Validation
1. Add function to `src/utils/validators.js`
2. Return `{ isValid: boolean, errors: {} }`
3. Use in form submission

### Styling
- Use CSS Variables for colors, spacing, transitions
- Mobile-first approach: start with mobile, add media queries for larger screens
- Use CSS Grid and Flexbox for layouts

## Azure Deployment

- The GitHub Actions workflow builds and deploys to Azure Static Web Apps
- Set repository secret: `AZURE_STATIC_WEB_APPS_API_TOKEN_BUDGET_TRACKER`
- Deployment target: Output location is `dist/` (Vite output)
- Pre-production environments automatically created for PRs

## Performance Tips

- Keep components lightweight and memoize expensive computations
- Use React.lazy() for route-based code splitting
- Avoid unnecessary re-renders with proper dependency arrays
- Charts are computed client-side; consider memoizing chart data

## Testing & Debugging

- Browser DevTools for React component inspection
- Use console logs for debugging state changes
- Zustand state is logged in browser DevTools if installed
- Theme preference stored in localStorage: `budget-tracker-theme`
- App state stored in localStorage: `budget-tracker-store`

## Style Guide

- Variable names: camelCase
- Component names: PascalCase
- CSS class names: kebab-case
- Use descriptive names for functions and components
- Comment complex logic
- Keep functions focused and single-responsibility

## Next Steps / Future Work

- Implement cloud database sync (iteration 2)
- Add recurring transaction support
- Add budget analytics/trends
- Mobile app version
- Receipt storage capability

---

For more details, see README.md
