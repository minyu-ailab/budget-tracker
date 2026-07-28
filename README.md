# Budget Tracker - Personal Finance App

A modern, responsive web application for tracking personal budget and expenses. Built with React, Vite, and deployed on Azure Static Web Apps.

## Features

- **Dashboard** - View summary statistics with income vs expense visualization
- **Transaction Management** - Add, edit, and delete transactions with filters
- **Category Budgets** - Set monthly spending limits per category with progress tracking
- **Month Navigation** - Switch between different months to view historical data
- **Dark/Light Mode** - Toggle between themes with persistent preference
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Data Export/Import** - Backup and restore your budget data
- **Offline First** - All data stored locally in the browser

## Tech Stack

- **Frontend**: React 18 with Vite
- **State Management**: Zustand
- **Visualization**: Recharts
- **Styling**: CSS3 with CSS Variables
- **Deployment**: Azure Static Web Apps
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/budget-tracker.git
cd budget-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The optimized build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Azure Static Web Apps Setup

1. Create an Azure Static Web Apps resource in the Azure Portal
2. Connect your GitHub repository
3. During setup, configure:
   - **App location**: `/`
   - **API location**: (leave empty)
   - **Output location**: `dist`

4. The GitHub Actions workflow will automatically deploy on push to `main` branch

### Environment Variables

No environment variables are required for the basic setup. The app works entirely with client-side storage.

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.jsx
│   ├── TransactionLog.jsx
│   ├── CategoryBudgets.jsx
│   ├── Settings.jsx
│   └── ...
├── store/              # Zustand state management
│   ├── appStore.js
│   └── themeStore.js
├── utils/              # Helper functions
│   ├── dateHelpers.js
│   └── validators.js
├── App.jsx
└── main.jsx
```

## Key Features in Detail

### Dashboard
- Real-time summary cards showing total income, expenses, and balance
- Pie chart showing expense breakdown by category
- Bar chart comparing income vs expenses
- Quick-access month navigation

### Transaction Management
- Add transactions with name, amount, type (income/expense), category, date, and notes
- Search and filter transactions by type and category
- Edit and delete existing transactions
- Visual indicators for income (green) and expenses (red)

### Category Budgets
- Set monthly spending limits for each expense category
- Visual progress bars showing percentage of budget used
- Color-coded indicators for over-budget situations
- Quick budget edit interface

### Settings
- Theme toggle (dark/light mode)
- Currency selection (USD, EUR, GBP, JPY, CAD, AUD)
- Data export as JSON backup
- Data import to restore from backups
- Data deletion option

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions

## Performance

- Optimized build with tree-shaking and code splitting
- Lazy-loaded components for faster initial load
- Efficient chart rendering with Recharts
- Zustand for minimal state management overhead

## Future Enhancements

- Cloud database sync for multi-device support
- Budget analytics and trends
- Recurring transaction templates
- Expense receipts storage
- Mobile app version
- Budget goals and savings targets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub Issues page.

## Changelog

### v1.0.0 (Initial Release)
- Core budget tracking functionality
- Dashboard with charts
- Transaction CRUD operations
- Category budget management
- Dark/light mode
- Responsive mobile layout
- GitHub Actions deployment

---

Built with ❤️ for personal finance management.
