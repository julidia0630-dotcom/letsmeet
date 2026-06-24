'use client'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

interface CalendarProps {
  year: number
  month: number
  availableDates: string[]
  selectedDates?: string[]
  onToggle?: (date: string) => void
  getColor?: (date: string) => { bg: string; text: string; label?: string }
  disabled?: boolean
}

function fmt(d: string) {
  return new Date(d).getDate()
}

export default function Calendar({
  year,
  month,
  availableDates,
  selectedDates = [],
  onToggle,
  getColor,
  disabled,
}: CalendarProps) {
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const availableSet = new Set(availableDates)

  const cells: (string | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= lastDate; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push(key)
  }

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-medium py-1 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />

          const isAvailable = availableSet.has(date)
          const isSelected = selectedDates.includes(date)
          const color = getColor?.(date)
          const dayOfWeek = new Date(date).getDay()

          if (!isAvailable) {
            return (
              <div key={date} className="aspect-square flex items-center justify-center">
                <span className="text-xs text-gray-200">{fmt(date)}</span>
              </div>
            )
          }

          if (getColor && color) {
            return (
              <div
                key={date}
                className="aspect-square flex flex-col items-center justify-center rounded-lg relative"
                style={{ backgroundColor: color.bg }}
              >
                <span className="text-xs font-medium" style={{ color: color.text }}>
                  {fmt(date)}
                </span>
                {color.label && (
                  <span className="text-[10px] mt-0.5" style={{ color: color.text, opacity: 0.7 }}>
                    {color.label}
                  </span>
                )}
              </div>
            )
          }

          return (
            <button
              key={date}
              onClick={() => !disabled && onToggle?.(date)}
              disabled={disabled}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-gray-900 text-white'
                  : dayOfWeek === 0
                  ? 'bg-red-50 text-red-400 hover:bg-red-100'
                  : dayOfWeek === 6
                  ? 'bg-blue-50 text-blue-400 hover:bg-blue-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {fmt(date)}
            </button>
          )
        })}
      </div>
    </div>
  )
}