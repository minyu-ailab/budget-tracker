import { useStore } from '../store/appStore'
import { themeStore } from '../store/themeStore'
import { formatCurrency } from '../utils/dateHelpers'
import StatCard from './StatCard'
import MonthPicker from './MonthPicker'
import CategoryChart from './CategoryChart'
import IncomeExpenseChart from './IncomeExpenseChart'
import './Dashboard.css'

export default function Dashboard() {
  const {
    getMonthTransactions,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getCategoryBreakdown,
  } = useStore()
  const { currency } = themeStore()

  const monthTransactions = getMonthTransactions()
  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const balance = getBalance()
  const categoryData = getCategoryBreakdown()

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <MonthPicker />
      </div>

      <div className="stat-cards">
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome, currency)}
          type="income"
          icon="📈"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses, currency)}
          type="expense"
          icon="📉"
        />
        <StatCard
          title="Remaining Balance"
          value={formatCurrency(balance, currency)}
          type={balance >= 0 ? 'income' : 'expense'}
          icon={balance >= 0 ? '✅' : '⚠️'}
        />
      </div>

      <div className="charts-container">
        <div className="chart-wrapper">
          <h3>Expenses by Category</h3>
          <CategoryChart data={categoryData} />
        </div>
        <div className="chart-wrapper">
          <h3>Income vs Expenses</h3>
          <IncomeExpenseChart income={totalIncome} expenses={totalExpenses} />
        </div>
      </div>

      {monthTransactions.length === 0 && (
        <div className="empty-state">
          <p>No transactions for this month yet.</p>
          <p>Head to the Transactions tab to add your first transaction!</p>
        </div>
      )}
    </div>
  )
}
