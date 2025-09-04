import * as React from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { type CategoryType, categories, transactions, products } from "../transactions.const"

interface SalesByProductChartProps {
  selectedDealerId?: string
}

interface CategoryData {
  category: string
  [key: string]: string | number // Dynamic product keys
}

// Color palette for different product categories
const categoryColors: Record<CategoryType, string> = {
  "biologicals": "#16a34a",      // Green
  "micronutrients": "#2563eb",   // Blue
  "adjuvants": "#dc2626",        // Red
  "herbicide": "#7c3aed",        // Purple
  "fungicide": "#db2777",        // Pink
  "insecticide": "#0891b2",      // Cyan
}

// Generate distinct colors for products within each category
const generateProductColors = (category: CategoryType, productCount: number): string[] => {
  const baseColor = categoryColors[category]
  const colors: string[] = []
  
  for (let i = 0; i < productCount; i++) {
    // Create variations of the base color
    const hue = i * (360 / productCount)
    colors.push(`hsl(${hue}, 70%, 50%)`)
  }
  
  return colors
}

const calculateProductSales = (dealerId?: string): { data: CategoryData[], productColors: Record<string, string> } => {
  // Filter transactions by dealer if selected (empty string means all dealers)
  const filteredTransactions = dealerId && dealerId !== "" 
    ? transactions.filter(t => t.dealer.id.toString() === dealerId)
    : transactions

  // Group transactions by category and product
  const categoryData: Record<string, Record<string, number>> = {}
  
  filteredTransactions.forEach(transaction => {
    const category = transaction.category
    const productName = transaction.product.name
    
    if (!categoryData[category]) {
      categoryData[category] = {}
    }
    
    categoryData[category][productName] = (categoryData[category][productName] || 0) + transaction.amount
  })

  // Convert to array format for stacked bar chart - include ALL categories
  const chartData: CategoryData[] = categories.map(category => {
    const categoryProducts = products.filter(p => p.category === category)
    const data: CategoryData = { category: category.charAt(0).toUpperCase() + category.slice(1) }
    
    // Only add products if they exist for this category
    if (categoryProducts.length > 0) {
      categoryProducts.forEach(product => {
        data[product.name] = categoryData[category]?.[product.name] || 0
      })
    }
    
    return data
  })

  // Generate colors for each product
  const productColors: Record<string, string> = {}
  categories.forEach(category => {
    const categoryProducts = products.filter(p => p.category === category)
    const colors = generateProductColors(category, categoryProducts.length)
    
    categoryProducts.forEach((product, index) => {
      productColors[product.name] = colors[index]
    })
  })

  return { data: chartData, productColors }
}

export const SalesByProductChart = ({ selectedDealerId }: SalesByProductChartProps) => {
  const { data, productColors } = React.useMemo(() => 
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

  // Calculate total sales across all categories and products
  const totalSales = data.reduce((sum, category) => {
    return sum + Object.entries(category)
      .filter(([key]) => key !== 'category')
      .reduce((catSum, [, value]) => catSum + (value as number), 0)
  }, 0)

  // Get all unique products for creating bars
  const allProducts = products // Include all products
  const productNames = allProducts.map(p => p.name)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900">Net Sales by Product</h3>
        <p className="text-sm text-gray-500">
          Total: {formatCurrency(totalSales)} across all products
          {selectedDealerId && (
            <span className="ml-2 text-green-600">
              (Filtered by dealer)
            </span>
          )}
        </p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="category"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              labelStyle={{ color: '#374151', fontWeight: '500' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            {productNames.map((productName) => (
              <Bar 
                key={productName}
                dataKey={productName}
                stackId="a"
                fill={productColors[productName]}
                name={productName}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  )
}
