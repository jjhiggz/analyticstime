import * as React from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { transactions } from "../transactions.const"

interface SalesByQuarterChartProps {
  selectedDealerId?: string
  selectedQuarter: string
}

interface WeeklyData {
  week: string
  weekNumber: number
  sales: number
  quarter: string
}

const getQuarterDateRange = (quarter: string) => {
  const [q, year] = quarter.split(' ')
  const yearNum = parseInt(year)
  const quarterNum = parseInt(q.replace('Q', ''))
  
  const quarterMonths = {
    1: { start: 0, end: 2 },   // Q1: Jan-Mar
    2: { start: 3, end: 5 },   // Q2: Apr-Jun
    3: { start: 6, end: 8 },   // Q3: Jul-Sep
    4: { start: 9, end: 11 }   // Q4: Oct-Dec
  }
  
  const { start, end } = quarterMonths[quarterNum as keyof typeof quarterMonths]
  const startDate = new Date(yearNum, start, 1)
  const endDate = new Date(yearNum, end + 1, 0) // Last day of the quarter
  
  return { startDate, endDate }
}

const getWeekNumber = (date: Date, quarterStart: Date): number => {
  const diffTime = date.getTime() - quarterStart.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.ceil(diffDays / 7)
}

const getMonthInfo = (date: Date) => {
  const month = date.getMonth()
  const quarter = Math.floor(month / 3) + 1
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  return {
    month: monthNames[month],
    quarter: `Q${quarter}`,
    monthNumber: month + 1
  }
}

const calculateSalesData = (dealerId?: string, selectedQuarter: string): WeeklyData[] => {
  // Filter transactions by dealer if selected (empty string means all dealers)
  let filteredTransactions = dealerId && dealerId !== "" 
    ? transactions.filter(t => t.dealer.id.toString() === dealerId)
    : transactions

  if (selectedQuarter === "past-12-months") {
    // For past 12 months, show monthly data (Oct 2024 - Sept 2025)
    const startDate = new Date(2024, 9, 1) // Oct 1, 2024
    const endDate = new Date(2025, 8, 30) // Sept 30, 2025
    
    filteredTransactions = filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })

    // Group transactions by month
    const monthlyData = filteredTransactions.reduce((acc, transaction) => {
      const monthInfo = getMonthInfo(transaction.date)
      const year = transaction.date.getFullYear()
      const key = `${monthInfo.month} ${year}`
      acc[key] = (acc[key] || 0) + transaction.amount
      return acc
    }, {} as Record<string, number>)

    // Convert to array format for chart with all 12 months across 2024-2025
    const months = [
      { name: 'Oct', year: 2024, quarter: 4 },
      { name: 'Nov', year: 2024, quarter: 4 },
      { name: 'Dec', year: 2024, quarter: 4 },
      { name: 'Jan', year: 2025, quarter: 1 },
      { name: 'Feb', year: 2025, quarter: 1 },
      { name: 'Mar', year: 2025, quarter: 1 },
      { name: 'Apr', year: 2025, quarter: 2 },
      { name: 'May', year: 2025, quarter: 2 },
      { name: 'Jun', year: 2025, quarter: 2 },
      { name: 'Jul', year: 2025, quarter: 3 },
      { name: 'Aug', year: 2025, quarter: 3 },
      { name: 'Sep', year: 2025, quarter: 3 }
    ]
    
    return months.map((month, index) => {
      const monthKey = `${month.name} ${month.year}`
      return {
        week: monthKey,
        weekNumber: index + 1,
        sales: monthlyData[monthKey] || 0,
        quarter: `Q${month.quarter} ${month.year}`
      }
    })
  } else {
    // For specific quarters, show weekly data
    const { startDate, endDate } = getQuarterDateRange(selectedQuarter)
    
    filteredTransactions = filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })

    // Group transactions by week
    const weeklyData = filteredTransactions.reduce((acc, transaction) => {
      const weekNumber = getWeekNumber(transaction.date, startDate)
      const key = `Week ${weekNumber}`
      acc[key] = (acc[key] || 0) + transaction.amount
      return acc
    }, {} as Record<string, number>)

    // Generate all weeks for the quarter (typically 12-13 weeks)
    const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
    
    return Array.from({ length: totalWeeks }, (_, index) => {
      const weekNumber = index + 1
      const weekStart = new Date(startDate.getTime() + (index * 7 * 24 * 60 * 60 * 1000))
      const weekEnd = new Date(Math.min(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000), endDate.getTime()))
      
      const formatDate = (date: Date) => {
        return `${date.getMonth() + 1}/${date.getDate()}`
      }
      
      const weekKey = `Week ${weekNumber}`
      const dateRange = `${formatDate(weekStart)}-${formatDate(weekEnd)}`
      
      return {
        week: dateRange,
        weekNumber,
        sales: weeklyData[weekKey] || 0,
        quarter: selectedQuarter
      }
    })
  }
}

export const SalesByQuarterChart = ({ selectedDealerId, selectedQuarter }: SalesByQuarterChartProps) => {
  const data = React.useMemo(() => 
    calculateSalesData(selectedDealerId, selectedQuarter), 
    [selectedDealerId, selectedQuarter]
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const totalSales = data.reduce((sum, quarter) => sum + quarter.sales, 0)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900">
          Net Sales - {selectedQuarter === "past-12-months" ? "Past 12 Months" : selectedQuarter}
        </h3>
        <p className="text-sm text-gray-500">
          Total: {formatCurrency(totalSales)}
          {selectedDealerId && (
            <span className="ml-2 text-green-600">
              (Filtered by dealer)
            </span>
          )}
        </p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatCurrency}
              domain={['dataMin', 'dataMax']}
              scale="linear"
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Sales']}
              labelFormatter={(label, payload) => {
                if (payload?.[0]) {
                  const data = payload[0].payload as WeeklyData
                  return `${data.week} (${data.quarter})`
                }
                return label
              }}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Line 
              type="monotone"
              dataKey="sales" 
              stroke="#16a34a" 
              strokeWidth={3}
              dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#16a34a', strokeWidth: 2, fill: '#ffffff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
