import * as React from "react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { type CategoryType, categories, transactions, products } from "../transactions.const"

interface SalesByProductChartProps {
  selectedDealerId?: string
  selectedQuarter: string
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Custom tooltip component to show category total and product breakdown
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    const categoryName = label
    const total = payload.reduce((sum: number, item: any) => sum + (item.value || 0), 0)
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
        <div className="mb-3">
          <h4 className="font-semibold text-gray-900 text-sm">{categoryName}</h4>
          <p className="text-sm font-medium text-green-600">
            Total: {formatCurrency(total)}
          </p>
        </div>
        
        <div>
          <p className="text-xs font-medium text-gray-700 mb-2">Products:</p>
          <div className="space-y-1">
            {payload.slice().reverse().map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-sm mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600 truncate flex-1 mr-2">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  return null
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

const calculateProductSales = (dealerId?: string, selectedQuarter: string): { data: CategoryData[], productColors: Record<string, string> } => {
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
    
    // Filter by quarter
    filteredTransactions = filteredTransactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= startDate && transactionDate <= endDate
    })
  }

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

export const SalesByProductChart = ({ selectedDealerId, selectedQuarter }: SalesByProductChartProps) => {
  const { data, productColors } = React.useMemo(() => 
    calculateProductSales(selectedDealerId, selectedQuarter), 
    [selectedDealerId, selectedQuarter]
  )


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
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900">Net Sales by Product</h3>
        <p className="text-sm text-gray-500">
          Total: {formatCurrency(totalSales)} across all products - {selectedQuarter === "past-12-months" ? "Past 12 Months" : selectedQuarter}
          {selectedDealerId && (
            <span className="ml-2 text-green-600">
              (Filtered by dealer)
            </span>
          )}
        </p>
      </div>
      
      <div className="flex-1 w-full overflow-x-auto">
        <ResponsiveContainer width="100%" height="100%" minWidth={600}>
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="category"
              tick={{ fontSize: 11, fill: '#6b7280' }}
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
            />
            <Tooltip content={<CustomTooltip />} />
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
