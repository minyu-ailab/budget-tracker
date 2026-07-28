import { Moon, Sun, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { themeStore } from '../store/themeStore'
import './Layout.css'

export default function Layout({ activeTab, onTabChange, children }) {
  const { theme, toggleTheme } = themeStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'settings', label: 'Settings' },
  ]

  const handleTabChange = (tabId) => {
    onTabChange(tabId)
    setMobileMenuOpen(false)
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-container">
          <div className="layout-logo">
            <span className="logo-icon">💰</span>
            <h1>Budget Tracker</h1>
          </div>

          <nav className="layout-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="layout-controls">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="layout-nav-mobile">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-tab-mobile ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      <main className="layout-main">
        <div className="layout-content">
          {children}
        </div>
      </main>

      <footer className="layout-footer">
        <p>&copy; 2024 Budget Tracker. All rights reserved.</p>
      </footer>
    </div>
  )
}
