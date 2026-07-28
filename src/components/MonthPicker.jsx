import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store/appStore'
import { getMonthName, addMonths } from '../utils/dateHelpers'
import './MonthPicker.css'

export default function MonthPicker() {
  const { selectedMonth, setSelectedMonth } = useStore()

  const handlePrevious = () => {
    setSelectedMonth(addMonths(selectedMonth, -1))
  }

  const handleNext = () => {
    setSelectedMonth(addMonths(selectedMonth, 1))
  }

  const handleToday = () => {
    setSelectedMonth(new Date())
  }

  return (
    <div className="month-picker">
      <button
        className="month-btn month-prev"
        onClick={handlePrevious}
        title="Previous month"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="month-display">
        <button className="month-today-btn" onClick={handleToday}>
          {getMonthName(selectedMonth)}
        </button>
      </div>

      <button
        className="month-btn month-next"
        onClick={handleNext}
        title="Next month"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
