import { useState, useEffect } from 'react'
import { useStore } from './store/appStore'
import { themeStore } from './store/themeStore'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import TransactionLog from './components/TransactionLog'
import CategoryBudgets from './components/CategoryBudgets'
import Settings from './components/Settings'
import Accounts from './components/Accounts'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { theme } = themeStore()
  const { initializeStore } = useStore()

  useEffect(() => {
    // Initialize app state from persistent storage
    initializeStore()
  }, [initializeStore])

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

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
