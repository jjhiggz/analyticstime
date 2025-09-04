import * as React from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { type CategoryType, categories, transactions } from "../transactions.const"

interface SalesByProductChartProps {
  selectedDealerId?: string
}

interface ProductData {
  product: string
  sales: number
  color: string
}

// Color palette for different product categories
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

const calculateProductSales = (dealerId?: string): ProductData[] => {
  // Filter transactions by dealer if selected
  const filteredTransactions = dealerId 
    ? transactions.filter(t => t.dealer.id.toString() === dealerId)
    : transactions

  // Group transactions by category (product)
  const productData = filteredTransactions.reduce((acc, transaction) => {
    const category = transaction.category
    acc[category] = (acc[category] || 0) + transaction.amount
    return acc
  }, {} as Record<CategoryType, number>)

  // Convert to array format for chart
  return categories.map(category => ({
    product: category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' '),
    sales: productData[category] || 0,
    color: categoryColors[category]
  })).sort((a, b) => a.product.localeCompare(b.product)) // Sort alphabetically
}

export const SalesByProductChart = ({ selectedDealerId }: SalesByProductChartProps) => {
  const data = React.useMemo(() => 
    calculateProductSales(selectedDealerId), 
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

  const totalSales = data.reduce((sum, product) => sum + product.sales, 0)


  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Net Sales by Product</h3>
        <p className="text-sm text-gray-500">
          Total: {formatCurrency(totalSales)} across all products
          {selectedDealerId && (
            <span className="ml-2 text-green-600">
              (Filtered by dealer)
            </span>
          )}
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="product"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Sales']}
              labelStyle={{ color: '#374151', fontWeight: '500' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar 
              dataKey="sales" 
              radius={[4, 4, 0, 0]}
              stroke="#ffffff"
              strokeWidth={1}
            >
              {data.map((entry) => (
                <Cell key={entry.product} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Color Legend */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        {data.filter(d => d.sales > 0).map(item => (
          <div key={item.product} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600 truncate">{item.product}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
