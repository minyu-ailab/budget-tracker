import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function IncomeExpenseChart({ income, expenses }) {
  const data = [
    {
      name: 'Monthly',
      Income: income,
      Expenses: expenses,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
        <Legend />
        <Bar dataKey="Income" fill="#10b981" />
        <Bar dataKey="Expenses" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  )
}
