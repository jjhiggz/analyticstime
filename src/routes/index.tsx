import { createFileRoute } from '@tanstack/react-router'
import { UPLLogo } from '../components/UPLLogo'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        <UPLLogo size="lg" className="mx-auto" />
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            UPL Analytics
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            View comprehensive sales analytics and customer insights
          </p>
        </div>
        
        <a
          href="/products"
          className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
        >
          Go to Products Dashboard
        </a>
      </div>
    </div>
  )
}
