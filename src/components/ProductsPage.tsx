import * as React from "react"
import { dealers } from "../transactions.const"
import { SalesByProductChart } from "./SalesByProductChart"
import { SalesByQuarterChart } from "./SalesByQuarterChart"
import { SalesSummaryCard } from "./SalesSummaryCard"
import { TopCustomersTable } from "./TopCustomersTable"
import { Combobox } from "./ui/combobox"

// Transform dealers for combobox format with "All" option
const dealerOptions = [
  { value: "", label: "All Dealers" },
  ...dealers.map(dealer => ({
    value: dealer.id.toString(),
    label: dealer.name
  }))
]

export const ProductsPage = () => {
  const [selectedDealer, setSelectedDealer] = React.useState<string>("")
  const [selectedQuarter, setSelectedQuarter] = React.useState<string>("past-12-months") // Default to past 12 months

  const quarterOptions = [
    { value: "past-12-months", label: "Past 12 Months" },
    { value: "Q4 2024", label: "Q4 2024" },
    { value: "Q1 2025", label: "Q1 2025" },
    { value: "Q2 2025", label: "Q2 2025" },
    { value: "Q3 2025", label: "Q3 2025" },
    { value: "Q4 2025", label: "Q4 2025" }
  ]

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          
          {/* Current Dealer Display */}
          <div className="flex items-center space-x-6">
            <span className="text-lg font-semibold text-gray-900">
              {selectedDealer ? 
                dealerOptions.find(d => d.value === selectedDealer)?.label : 
                "All Dealers"
              }
            </span>
            <Combobox
              options={quarterOptions}
              value={selectedQuarter}
              onValueChange={setSelectedQuarter}
              placeholder="Select Quarter"
              className="w-60"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Combobox
            options={dealerOptions}
            value={selectedDealer}
            onValueChange={setSelectedDealer}
            placeholder="Select dealer..."
            emptyText="No dealer found."
            className="w-60"
          />
          <button 
            type="button" 
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Dashboard Tiles */}
      <div className="grid grid-cols-1 xl:grid-cols-6 gap-5">
        {/* Sales by Quarter Chart - Takes 4 columns */}
        <div className="xl:col-span-4">
          <SalesByQuarterChart 
            selectedDealerId={selectedDealer} 
            selectedQuarter={selectedQuarter}
          />
        </div>
        
        {/* Sales Summary Card - Takes 2 columns */}
        <div className="xl:col-span-2">
          <SalesSummaryCard 
            selectedDealerId={selectedDealer} 
            selectedQuarter={selectedQuarter}
          />
        </div>
      </div>
      
      {/* Bottom Row - Sales by Product Chart and Top Customers Table */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Sales by Product Chart - Takes 1 column */}
        <div className="h-96">
          <SalesByProductChart 
            selectedDealerId={selectedDealer} 
            selectedQuarter={selectedQuarter}
          />
        </div>
        
        {/* Top Customers Table - Takes 1 column */}
        <div className="h-96">
          <TopCustomersTable 
            selectedDealerId={selectedDealer} 
            selectedQuarter={selectedQuarter}
          />
        </div>
      </div>
    </div>
  )
}

