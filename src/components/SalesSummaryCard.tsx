import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { transactions } from "../transactions.const"

interface SalesSummaryCardProps {
  selectedDealerId?: string
  selectedQuarter: string
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
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

// Define consistent colors and order for dealers
const DEALER_COLORS: Record<string, string> = {
  'Barrett': '#16a34a',    // Green
  'Big Yield': '#2563eb',  // Blue  
  'Landus': '#dc2626'      // Red
}

const DEALER_ORDER = ['Barrett', 'Big Yield', 'Landus'] // Consistent order

export const SalesSummaryCard = ({ selectedDealerId, selectedQuarter }: SalesSummaryCardProps) => {
  const { totalSales, dealerSales, percentage, dealerBreakdown, pieData } = React.useMemo(() => {
    let dateFilteredTransactions = transactions
    
    if (selectedQuarter === "past-12-months") {
      // For past 12 months, use Oct 2024 - Sept 2025
      const startDate = new Date(2024, 9, 1) // Oct 1, 2024
      const endDate = new Date(2025, 8, 30) // Sept 30, 2025
      
      dateFilteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= startDate && transactionDate <= endDate
      })
    } else {
      // Get quarter date range
      const { startDate, endDate } = getQuarterDateRange(selectedQuarter)
      
      // Filter transactions by quarter
      dateFilteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= startDate && transactionDate <= endDate
      })
    }
    
    // Calculate total sales across all dealers
    const allSales = dateFilteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    
    // Calculate sales for selected dealer (or all dealers if none selected)
    const filteredTransactions = selectedDealerId && selectedDealerId !== "" 
      ? dateFilteredTransactions.filter(t => t.dealer.id.toString() === selectedDealerId)
      : dateFilteredTransactions
    
    const dealerSales = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    
    // Calculate percentage
    const percentage = allSales > 0 ? (dealerSales / allSales) * 100 : 0
    
    // Calculate dealer breakdown when all dealers are selected
    const dealerBreakdown = !selectedDealerId || selectedDealerId === "" 
      ? dateFilteredTransactions.reduce((acc, transaction) => {
          const dealerName = transaction.dealer.name
          acc[dealerName] = (acc[dealerName] || 0) + transaction.amount
          return acc
        }, {} as Record<string, number>)
      : null
    
    // Prepare pie chart data in consistent order
    const pieData = dealerBreakdown 
      ? DEALER_ORDER
          .filter(dealer => dealerBreakdown[dealer] > 0) // Only include dealers with sales
          .map(dealer => ({
            name: dealer,
            value: dealerBreakdown[dealer],
            percentage: ((dealerBreakdown[dealer] / allSales) * 100).toFixed(1)
          }))
      : []
    
    return {
      totalSales: allSales,
      dealerSales,
      percentage,
      dealerBreakdown,
      pieData
    }
  }, [selectedDealerId, selectedQuarter])

  const dealerName = selectedDealerId && selectedDealerId !== "" 
    ? transactions.find(t => t.dealer.id.toString() === selectedDealerId)?.dealer.name || "Selected Dealer"
    : "All Dealers"

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">Sales Summary</h3>
        <p className="text-sm text-gray-500">
          {dealerName} performance - {selectedQuarter === "past-12-months" ? "Past 12 Months" : selectedQuarter}
        </p>
      </div>
      
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {/* Dealer Sales or Pie Chart */}
        {dealerBreakdown ? (
          // Show pie chart when all dealers are selected
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-3">
              <div className="text-lg font-semibold text-gray-700">Sales by Dealer</div>
            </div>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={DEALER_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name, props) => [
                      formatCurrency(value), 
                      `${props.payload.name} (${props.payload.percentage}%)`
                    ]}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: '#374151', fontSize: '12px' }}>
                        {value} ({entry.payload.percentage}%)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Total Sales in Center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(totalSales)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Show individual dealer sales when specific dealer is selected
          <>
            {/* Total Sales */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalSales)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Total Sales
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(dealerSales)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {dealerName} Sales
              </div>
            </div>
            
            {/* Percentage */}
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Dealer Revenue Share
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
