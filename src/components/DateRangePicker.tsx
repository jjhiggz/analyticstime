import * as React from "react"

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onStartDateChange: (date: Date | null) => void
  onEndDateChange: (date: Date | null) => void
  onClear: () => void
}

export const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange, 
  onClear 
}: DateRangePickerProps) => {
  const formatDate = (date: Date | null) => {
    if (!date) return ""
    return date.toISOString().split('T')[0]
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onStartDateChange(value ? new Date(value) : null)
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onEndDateChange(value ? new Date(value) : null)
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600">From:</label>
        <input
          type="date"
          value={formatDate(startDate)}
          onChange={handleStartDateChange}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600">To:</label>
        <input
          type="date"
          value={formatDate(endDate)}
          onChange={handleEndDateChange}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      
      {(startDate || endDate) && (
        <button
          onClick={onClear}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Clear
        </button>
      )}
    </div>
  )
}
