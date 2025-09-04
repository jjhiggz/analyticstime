import { createFileRoute } from "@tanstack/react-router";
import { ProductsPage } from "../components/ProductsPage";
import { UPLLogo } from "../components/UPLLogo";

export const Route = createFileRoute("/products")({
	component: ProductsWireframe,
});

function ProductsWireframe() {
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Top Navigation */}
			<nav className="bg-white border-b border-gray-200">
				<div className="px-6 py-3">
					<div className="flex items-center space-x-8">
						<UPLLogo size="md" />
						<div className="flex space-x-8">
							<button
								type="button"
								className="text-gray-600 hover:text-gray-900 pb-3 border-b-2 border-transparent"
							>
								Transactions
							</button>
							<button
								type="button"
								className="text-gray-600 hover:text-gray-900 pb-3 border-b-2 border-transparent"
							>
								Dealers
							</button>
							<button
								type="button"
								className="text-gray-600 hover:text-gray-900 pb-3 border-b-2 border-transparent"
							>
								Programs
							</button>
							<button
								type="button"
								className="text-green-600 pb-3 border-b-2 border-green-600 font-medium"
							>
								Products
							</button>
						</div>
						<div className="ml-auto flex items-center space-x-4">
							<div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
								<span className="text-gray-600 font-medium text-sm">SA</span>
							</div>
						</div>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<div className="p-6">
				<ProductsPage />
			</div>
		</div>
	);
}
