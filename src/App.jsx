import { useState, useEffect } from 'react'
import { useStore } from './store/appStore'
import { themeStore } from './store/themeStore'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import TransactionLog from './components/TransactionLog'
import CategoryBudgets from './components/CategoryBudgets'
import Settings from './components/Settings'
import Accounts from './components/Accounts'
import AuthPanel from './components/auth/AuthPanel'
import { useAuthStore } from './store/authStore'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { theme } = themeStore()
  const { initializeStore } = useStore()
  const { status, initializeAuth } = useAuthStore()

  useEffect(() => {
    void initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    // Initialize app state from persistent storage
    if (status === 'authenticated') {
      void initializeStore()
    }
  }, [initializeStore, status])

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  if (status === 'loading') {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <h1>Budget Tracker</h1>
          <p className="auth-subtitle">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <AuthPanel />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'transactions':
        return <TransactionLog />
      case 'budgets':
        return <CategoryBudgets />
      case 'accounts':
        return <Accounts />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  )
}

export default App
