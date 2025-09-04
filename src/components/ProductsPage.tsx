import * as React from "react"
import { dealers } from "../transactions.const"
import { SalesByQuarterChart } from "./SalesByQuarterChart"
import { Combobox } from "./ui/combobox"

// Transform dealers for combobox format
const dealerOptions = dealers.map(dealer => ({
  value: dealer.id.toString(),
  label: dealer.name
}))

export const ProductsPage = () => {
  const [selectedDealer, setSelectedDealer] = React.useState<string>("")

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <div className="flex items-center space-x-2 border-b-2 border-green-500 pb-2">
            <span className="text-green-600 font-medium">Products</span>
            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">0</span>
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
            Import CSV
          </button>
          <button 
            type="button" 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Dashboard Tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Sales by Quarter Chart */}
        <div className="lg:col-span-2">
          <SalesByQuarterChart selectedDealerId={selectedDealer} />
        </div>
        
        {/* Placeholder for additional charts */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Placeholder 2</h3>
          <div className="h-80 flex items-center justify-center text-gray-400">
            <p>Additional chart coming soon...</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Placeholder 3</h3>
          <div className="h-80 flex items-center justify-center text-gray-400">
            <p>Additional chart coming soon...</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Placeholder 4</h3>
          <div className="h-80 flex items-center justify-center text-gray-400">
            <p>Additional chart coming soon...</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Placeholder 5</h3>
          <div className="h-80 flex items-center justify-center text-gray-400">
            <p>Additional chart coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
