import * as React from "react"
import { transactions } from "../transactions.const"

interface SalesSummaryCardProps {
  selectedDealerId?: string
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export const SalesSummaryCard = ({ selectedDealerId }: SalesSummaryCardProps) => {
  const { totalSales, dealerSales, percentage, dealerBreakdown } = React.useMemo(() => {
    // Calculate total sales across all dealers
    const allSales = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    
    // Calculate sales for selected dealer (or all dealers if none selected)
    const filteredTransactions = selectedDealerId && selectedDealerId !== "" 
      ? transactions.filter(t => t.dealer.id.toString() === selectedDealerId)
      : transactions
    
    const dealerSales = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    
    // Calculate percentage
    const percentage = allSales > 0 ? (dealerSales / allSales) * 100 : 0
    
    // Calculate dealer breakdown when all dealers are selected
    const dealerBreakdown = !selectedDealerId || selectedDealerId === "" 
      ? transactions.reduce((acc, transaction) => {
          const dealerName = transaction.dealer.name
          acc[dealerName] = (acc[dealerName] || 0) + transaction.amount
          return acc
        }, {} as Record<string, number>)
      : null
    
    return {
      totalSales: allSales,
      dealerSales,
      percentage,
      dealerBreakdown
    }
  }, [selectedDealerId])

  const dealerName = selectedDealerId && selectedDealerId !== "" 
    ? transactions.find(t => t.dealer.id.toString() === selectedDealerId)?.dealer.name || "Selected Dealer"
    : "All Dealers"

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">Sales Summary</h3>
        <p className="text-sm text-gray-500">
          {dealerName} performance
        </p>
      </div>
      
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {/* Total Sales */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalSales)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Total Sales
          </div>
        </div>
        
        {/* Dealer Sales or Breakdown */}
        {dealerBreakdown ? (
          // Show dealer breakdown when all dealers are selected
          <div className="space-y-2">
            <div className="text-center mb-3">
              <div className="text-lg font-semibold text-gray-700">Sales by Dealer</div>
            </div>
            {Object.entries(dealerBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([dealer, amount]) => {
                const dealerPercentage = (amount / totalSales) * 100
                return (
                  <div key={dealer} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{dealer}</span>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(amount)}</div>
                      <div className="text-xs text-gray-500">{dealerPercentage.toFixed(1)}%</div>
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          // Show individual dealer sales when specific dealer is selected
          <>
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
                Market Share
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
