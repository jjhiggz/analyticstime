import * as React from "react"
import { transactions } from "../transactions.const"
import { CustomerDetailsModal } from "./CustomerDetailsModal"

interface TopCustomersTableProps {
  selectedDealerId?: string
}

interface CustomerData {
  id: number
  name: string
  totalAmount: number
}


const calculateTopCustomers = (dealerId?: string): CustomerData[] => {
  // Filter transactions by dealer if selected (empty string means all dealers)
  const filteredTransactions = dealerId && dealerId !== "" 
    ? transactions.filter(t => t.dealer.id.toString() === dealerId)
    : transactions

  // Group transactions by customer
  const customerData = filteredTransactions.reduce((acc, transaction) => {
    const customerId = transaction.customer.id
    
    if (!acc[customerId]) {
      acc[customerId] = {
        id: transaction.customer.id,
        name: transaction.customer.name,
        totalAmount: 0
      }
    }
    
    acc[customerId].totalAmount += transaction.amount
    
    return acc
  }, {} as Record<number, { id: number; name: string; totalAmount: number }>)

  // Convert to array and get top 5
  return Object.values(customerData)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5)
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}


export const TopCustomersTable = ({ selectedDealerId }: TopCustomersTableProps) => {
  const data = React.useMemo(() => 
    calculateTopCustomers(selectedDealerId), 
    [selectedDealerId]
  )

  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerData | null>(null)

  const handleRowClick = (customer: CustomerData) => {
    setSelectedCustomer(customer)
  }

  const closeModal = () => {
    setSelectedCustomer(null)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Top 5 Transacting Customers</h3>
        
      </div>
      
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Name</th>
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
