import * as React from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { type CategoryType, transactions } from "../transactions.const"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

interface CustomerDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  customerId: number
  customerName: string
  selectedDealerId?: string
}

interface ProductData {
  name: string
  value: number
}

interface CategoryData {
  name: string
  value: number
  color: string
  products: ProductData[]
}

// Color mapping for category pills (same as other charts)
const categoryColors: Record<CategoryType, string> = {
  "biologicals": "#16a34a",      // Green
  "micronutrients": "#2563eb",   // Blue
  "adjuvants": "#dc2626",        // Red
  "herbicide": "#7c3aed",        // Purple
  "fungicide": "#db2777",        // Pink
  "insecticide": "#0891b2",      // Cyan
}

const calculateCustomerCategories = (customerId: number, dealerId?: string): CategoryData[] => {
  // Filter transactions by customer and optionally by dealer (empty string means all dealers)
  const customerTransactions = transactions.filter(t => {
    const matchesCustomer = t.customer.id === customerId
    const matchesDealer = dealerId && dealerId !== "" ? t.dealer.id.toString() === dealerId : true
    return matchesCustomer && matchesDealer
  })

  // Group by category and product
  const categoryData = customerTransactions.reduce((acc, transaction) => {
    const category = transaction.category
    const productName = transaction.product.name
    
    if (!acc[category]) {
      acc[category] = {
        total: 0,
        products: {} as Record<string, number>
      }
    }
    
    acc[category].total += transaction.amount
    acc[category].products[productName] = (acc[category].products[productName] || 0) + transaction.amount
    
    return acc
  }, {} as Record<CategoryType, { total: number; products: Record<string, number> }>)

  // Convert to array format for pie chart
  return Object.entries(categoryData)
    .map(([category, data]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
      value: data.total,
      color: categoryColors[category as CategoryType],
      products: Object.entries(data.products)
        .map(([productName, amount]) => ({
          name: productName,
          value: amount
        }))
        .sort((a, b) => b.value - a.value)
    }))
    .sort((a, b) => b.value - a.value)
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Custom tooltip component to show products when hovering over pie slices
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload as CategoryData
    const total = data.value
    const percentage = ((data.value / payload[0].payload.totalAmount) * 100).toFixed(1)
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
        <div className="mb-2">
          <h4 className="font-semibold text-gray-900 text-sm">{data.name}</h4>
          <p className="text-sm text-gray-600">
            {formatCurrency(total)} ({percentage}%)
          </p>
        </div>
        
        {data.products && data.products.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Products:</p>
            <div className="space-y-1">
              {data.products.map((product, index) => (
                <div key={index} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 truncate flex-1 mr-2">{product.name}</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(product.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
  return null
}

export const CustomerDetailsModal = ({ 
  isOpen, 
  onClose, 
  customerId, 
  customerName,
  selectedDealerId 
}: CustomerDetailsModalProps) => {
  const data = React.useMemo(() => {
    const categoryData = calculateCustomerCategories(customerId, selectedDealerId)
    const totalAmount = categoryData.reduce((sum, item) => sum + item.value, 0)
    
    // Add totalAmount to each data point for percentage calculation
    return categoryData.map(item => ({
      ...item,
      totalAmount
    }))
  }, [customerId, selectedDealerId])

  const totalAmount = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{customerName}</DialogTitle>
          <DialogDescription>
            Category breakdown - Total: {formatCurrency(totalAmount)}
            {selectedDealerId && (
              <span className="ml-2 text-green-600">
                (Filtered by dealer)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {data.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No transaction data available for this customer</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
