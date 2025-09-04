import * as React from "react"
import { dealers } from "../transactions.const"
import { SalesByProductChart } from "./SalesByProductChart"
import { SalesByQuarterChart } from "./SalesByQuarterChart"
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

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          
          {/* Current Dealer Display */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Viewing:</span>
            <span className="text-sm font-medium text-gray-900">
              {selectedDealer ? 
                dealerOptions.find(d => d.value === selectedDealer)?.label : 
                "All Dealers"
              }
            </span>
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Sales by Quarter Chart - Takes 2 columns */}
        <div className="xl:col-span-2">
          <SalesByQuarterChart selectedDealerId={selectedDealer} />
        </div>
        
        {/* Sales by Product Chart - Takes 1 column */}
        <div className="xl:col-span-1">
          <SalesByProductChart selectedDealerId={selectedDealer} />
        </div>
      </div>
      
      {/* Top Customers Table - Full width below charts */}
      <div>
        <TopCustomersTable selectedDealerId={selectedDealer} />
      </div>
    </div>
  )
}
