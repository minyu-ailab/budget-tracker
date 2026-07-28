import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = [
  '#ff6b6b', '#4ecdc4', '#95e1d3', '#f38181',
  '#aa96da', '#fcbad3', '#a8e6cf', '#dda0dd',
]

export default function CategoryChart({ data }) {
  if (!data || data.length === 0) {
    return <p style={{ textAlign: 'center', color: '#999' }}>No expense data available</p>
  }

  const chartData = data
    .filter((item) => item.spent > 0)
    .map((item) => ({
      name: item.name,
      value: item.spent,
    }))

  if (chartData.length === 0) {
    return <p style={{ textAlign: 'center', color: '#999' }}>No expenses recorded</p>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
      </PieChart>
    </ResponsiveContainer>
  )
}
