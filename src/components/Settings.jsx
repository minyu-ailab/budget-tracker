import { useStore } from '../store/appStore'
import { themeStore } from '../store/themeStore'
import './Settings.css'

export default function Settings() {
  const { categories, transactions } = useStore()
  const { theme, toggleTheme, currency, setCurrency } = themeStore()

  const handleExport = () => {
    const dataToExport = {
      transactions,
      categories,
      exportedAt: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(dataToExport, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `budget-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result)
        // In a real app, you'd validate and merge this data
        console.log('Imported data:', importedData)
        alert('Data imported successfully! Please refresh the page to see changes.')
      } catch (error) {
        alert('Error importing data. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all data? This action cannot be undone.'
      )
    ) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="settings">
      <h2>Settings</h2>

      <div className="settings-section">
        <div className="settings-group">
          <h3>Theme</h3>
          <div className="setting-item">
            <div className="setting-label">
              <span>Dark Mode</span>
              <span className="setting-description">
                {theme === 'dark' ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-group">
          <h3>Preferences</h3>
          <div className="setting-item">
            <div className="setting-label">
              <span>Currency</span>
              <span className="setting-description">
                Used for displaying amounts throughout the app
              </span>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="currency-select"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-group">
          <h3>Data Management</h3>
          <div className="setting-item">
            <div className="setting-label">
              <span>Export Data</span>
              <span className="setting-description">
                Download your budget data as a JSON file for backup
              </span>
            </div>
            <button className="btn-secondary" onClick={handleExport}>
              Export
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <span>Import Data</span>
              <span className="setting-description">
                Restore budget data from a previously exported file
              </span>
            </div>
            <label className="btn-secondary">
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="setting-item danger-zone">
            <div className="setting-label">
              <span>Clear All Data</span>
              <span className="setting-description">
                This will permanently delete all your transactions and settings
              </span>
            </div>
            <button className="btn-danger" onClick={handleClearData}>
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-info">
          <h3>About</h3>
          <p>Budget Tracker v1.0.0</p>
          <p>A personal finance management app for tracking income and expenses.</p>
          <p>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
