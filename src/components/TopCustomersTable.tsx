import * as React from "react"
import { transactions } from "../transactions.const"
import { CustomerDetailsModal } from "./CustomerDetailsModal"

interface TopCustomersTableProps {
  selectedDealerId?: string
  selectedQuarter: string
}

interface CustomerData {
  id: number
  name: string
  totalAmount: number
  dealer?: string
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

const calculateTopCustomers = (dealerId?: string, selectedQuarter: string): CustomerData[] => {
  // Filter transactions by dealer if selected (empty string means all dealers)
  let filteredTransactions = dealerId && dealerId !== "" 
    ? transactions.filter(t => t.dealer.id.toString() === dealerId)
    : transactions

  if (selectedQuarter === "past-12-months") {
    // For past 12 months, use Oct 2024 - Sept 2025
    const startDate = new Date(2024, 9, 1) // Oct 1, 2024
    const endDate = new Date(2025, 8, 30) // Sept 30, 2025
    
    filteredTransactions = filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  } else {
    // Get quarter date range
    const { startDate, endDate } = getQuarterDateRange(selectedQuarter)
    
    filteredTransactions = filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

  // Group transactions by customer
  const customerData = filteredTransactions.reduce((acc, transaction) => {
    const customerId = transaction.customer.id
    
    if (!acc[customerId]) {
      acc[customerId] = {
        id: transaction.customer.id,
        name: transaction.customer.name,
        totalAmount: 0,
        dealer: transaction.dealer.name
      }
    }
    
    acc[customerId].totalAmount += transaction.amount
    
    return acc
  }, {} as Record<number, { id: number; name: string; totalAmount: number; dealer: string }>)

  // Convert to array and get top customers (10 for all dealers, 10 for specific dealer)
  const topCount = 10
  
  return Object.values(customerData)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, topCount)
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}


export const TopCustomersTable = ({ selectedDealerId, selectedQuarter }: TopCustomersTableProps) => {
  const data = React.useMemo(() => 
    calculateTopCustomers(selectedDealerId, selectedQuarter), 
    [selectedDealerId, selectedQuarter]
  )

  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerData | null>(null)
  
  // Show dealer column when all dealers are selected (no specific dealer filter)
  const showDealerColumn = !selectedDealerId || selectedDealerId === ""
  const tableTitle = `Top 10 Transacting Customers - ${selectedQuarter === "past-12-months" ? "Past 12 Months" : selectedQuarter}`

  const handleRowClick = (customer: CustomerData) => {
    setSelectedCustomer(customer)
  }

  const closeModal = () => {
    setSelectedCustomer(null)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900">{tableTitle}</h3>
      </div>
      
      <div className="overflow-y-auto flex-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Name</th>
              {showDealerColumn && (
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Dealer</th>
              )}
              <th className="text-right py-3 px-4 font-medium text-gray-700 text-sm">Total Amount</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((customer, index) => (
              <tr 
                key={customer.id} 
                className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  index < 3 ? 'bg-green-50' : ''
                }`}
                onClick={() => handleRowClick(customer)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleRowClick(customer)
                  }
                }}
                tabIndex={0}
              >
                <td className="py-2 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {customer.name}
                    </span>
                    {index < 3 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    )}
                  </div>
                </td>
                {showDealerColumn && (
                  <td className="py-2 px-4">
                    <span className="text-sm text-gray-700">
                      {customer.dealer || 'N/A'}
                    </span>
                  </td>
                )}
                <td className="py-2 px-4 text-right">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(customer.totalAmount)}
                  </span>
                </td>
                <td className="py-2 px-4 text-center">
                  <span className="text-xs text-green-600 font-medium">
                    View Details →
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500">No customer data available</p>
            {selectedDealerId && (
              <p className="text-sm text-gray-400 mt-1">
                Try selecting a different dealer
              </p>
            )}
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          isOpen={!!selectedCustomer}
          onClose={closeModal}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          selectedDealerId={selectedDealerId}
        />
      )}
    </div>
  )
}
