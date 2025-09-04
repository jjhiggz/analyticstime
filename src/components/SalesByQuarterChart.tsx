import * as React from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { transactions } from "../transactions.const"

interface SalesByQuarterChartProps {
  selectedDealerId?: string
}

interface MonthlyData {
  month: string
  quarter: string
  sales: number
  monthNumber: number
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

const calculateMonthlySales = (dealerId?: string): MonthlyData[] => {
  // Filter transactions by dealer if selected (empty string means all dealers)
  const filteredTransactions = dealerId && dealerId !== "" 
    ? transactions.filter(t => t.dealer.id.toString() === dealerId)
    : transactions

  // Group transactions by month
  const monthlyData = filteredTransactions.reduce((acc, transaction) => {
    const monthInfo = getMonthInfo(transaction.date)
    const key = `${monthInfo.month} 2024`
    acc[key] = (acc[key] || 0) + transaction.amount
    return acc
  }, {} as Record<string, number>)

  // Convert to array format for chart with all 12 months
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  return months.map((month, index) => {
    const quarter = Math.floor(index / 3) + 1
    return {
      month: `${month} 2024`,
      quarter: `Q${quarter}`,
      sales: monthlyData[`${month} 2024`] || 0,
      monthNumber: index + 1
    }
  })
}

export const SalesByQuarterChart = ({ selectedDealerId }: SalesByQuarterChartProps) => {
  const data = React.useMemo(() => 
    calculateMonthlySales(selectedDealerId), 
    [selectedDealerId]
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
        <h3 className="text-base font-semibold text-gray-900">Net Sales</h3>
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
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => {
                // Show quarter labels at quarter boundaries
                const monthData = data.find(d => d.month === value)
                if (monthData) {
                  const monthIndex = monthData.monthNumber - 1
                  // Show quarter label only for first month of each quarter
                  if (monthIndex % 3 === 0) {
                    return monthData.quarter
                  }
                }
                return ''
              }}
              interval={0}
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
                  const data = payload[0].payload as MonthlyData
                  return `${data.month} (${data.quarter})`
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
