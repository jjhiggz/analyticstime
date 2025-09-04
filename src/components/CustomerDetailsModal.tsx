import * as React from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
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

interface CategoryData {
  name: string
  value: number
  color: string
}

// Color mapping for category pills (same as other charts)
const categoryColors: Record<CategoryType, string> = {
  "biologicals": "#16a34a",      // Green
  "micronutrients": "#2563eb",   // Blue
  "adjuvants": "#dc2626",        // Red
  "seed-treatment": "#ea580c",   // Orange
  "herbicide": "#7c3aed",        // Purple
  "fungicidee": "#db2777",       // Pink
  "insecticide": "#0891b2",      // Cyan
  "fertilizer": "#65a30d",       // Lime
  "seed": "#eab308"              // Yellow
}

const calculateCustomerCategories = (customerId: number, dealerId?: string): CategoryData[] => {
  // Filter transactions by customer and optionally by dealer (empty string means all dealers)
  const customerTransactions = transactions.filter(t => {
    const matchesCustomer = t.customer.id === customerId
    const matchesDealer = dealerId && dealerId !== "" ? t.dealer.id.toString() === dealerId : true
    return matchesCustomer && matchesDealer
  })

  // Group by category
  const categoryData = customerTransactions.reduce((acc, transaction) => {
    const category = transaction.category
    acc[category] = (acc[category] || 0) + transaction.amount
    return acc
  }, {} as Record<CategoryType, number>)

  // Convert to array format for pie chart
  return Object.entries(categoryData)
    .map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
      value: amount,
      color: categoryColors[category as CategoryType]
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

export const CustomerDetailsModal = ({ 
  isOpen, 
  onClose, 
  customerId, 
  customerName,
  selectedDealerId 
}: CustomerDetailsModalProps) => {
  const data = React.useMemo(() => 
    calculateCustomerCategories(customerId, selectedDealerId), 
    [customerId, selectedDealerId]
  )

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
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Sales']}
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
                    formatter={(value) => <span style={{ color: '#374151' }}>{value}</span>}
                  />
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
