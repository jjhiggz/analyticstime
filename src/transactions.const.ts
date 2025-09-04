import { faker } from '@faker-js/faker'

type Customer = {
  name: string
  id: number
  dealerId: number
}

type Product = {
  id: number
  name: string
  category: string
}

type CategoryType =
  | "biologicals"
  | "micronutrients"
  | "adjuvants"
  | "herbicide"
  | "fungicide"
  | "insecticide"

type Dealer = {
  id: number
  name: string
}

type Transaction = {
  amount: number
  category: CategoryType
  product: Product
  customer: Customer
  date: Date
  dealer: Dealer
}

// Define the 3 dealers
const dealers: Dealer[] = [
  { id: 1, name: "Barrett" },
  { id: 2, name: "Landus" },
  { id: 3, name: "Big Yield" }
]

// Define the products for each category
const products: Product[] = [
  // Adjuvants
  { id: 1, name: "Silwet Gold", category: "adjuvants" },
  
  // Biologicals
  { id: 2, name: "Brus", category: "biologicals" },
  { id: 3, name: "Extrasol", category: "biologicals" },
  { id: 4, name: "Clover Inoculant", category: "biologicals" },
  
  // Fungicide
  { id: 5, name: "Bluestone", category: "fungicide" },
  { id: 6, name: "Aroxy 250 SC", category: "fungicide" },
  { id: 7, name: "Benomyl", category: "fungicide" },
  { id: 8, name: "Brilliant SL", category: "fungicide" },
  { id: 9, name: "Evito C", category: "fungicide" },
  
  // Herbicide
  { id: 10, name: "Alachlore", category: "herbicide" },
  { id: 11, name: "Apmlify", category: "herbicide" },
  { id: 12, name: "Armour", category: "herbicide" },
  { id: 13, name: "Baseline 960", category: "herbicide" },
  { id: 14, name: "Cheetah 600", category: "herbicide" },
  
  // Insecticide
  { id: 15, name: "Akito", category: "insecticide" },
  { id: 16, name: "Swat 150 SC", category: "insecticide" },
  { id: 17, name: "Oxadate", category: "insecticide" },
  { id: 18, name: "Desta 100 EC", category: "insecticide" },
  
  // Micronutrients
  { id: 19, name: "Biozyme", category: "micronutrients" },
  { id: 20, name: "Zincflo Plus", category: "micronutrients" }
]

// Define the categories for random selection
const categories: CategoryType[] = [
  "biologicals",
  "micronutrients", 
  "adjuvants",
  "herbicide",
  "fungicide",
  "insecticide"
]

// Generate 30 customers, ensuring each dealer has at least 10 customers
const customers: Customer[] = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  name: faker.company.name(),
  dealerId: (index % dealers.length) + 1 // Assign customers evenly across dealers (10 per dealer)
}))

// Helper function to get random item from array
const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

// Helper function to get random date within this year
const getRandomDateThisYear = (): Date => {
  const start = new Date(2024, 0, 1) // January 1, 2024
  const end = new Date(2024, 11, 31) // December 31, 2024
  return faker.date.between({ from: start, to: end })
}

// Generate simplified transactions where each customer buys 1-3 products from 1-4 categories
export const transactions: Transaction[] = (() => {
  const allTransactions: Transaction[] = []
  
  // First, ensure every product is purchased by at least one customer
  const productAssignments: Record<number, number[]> = {} // productId -> customerIds
  
  // Assign each product to at least one customer
  products.forEach(product => {
    const randomCustomer = getRandomItem(customers)
    if (!productAssignments[product.id]) {
      productAssignments[product.id] = []
    }
    productAssignments[product.id].push(randomCustomer.id)
  })
  
  // Generate transactions for each customer
  customers.forEach(customer => {
    const assignedDealer = dealers.find(d => d.id === customer.dealerId)!
    
    // Each customer buys from 1-4 categories
    const numCategories = faker.number.int({ min: 1, max: 4 })
    const selectedCategories = faker.helpers.arrayElements(categories, numCategories)
    
    selectedCategories.forEach(category => {
      // Each category has 1-3 products for this customer
      const categoryProducts = products.filter(p => p.category === category)
      const numProducts = Math.min(faker.number.int({ min: 1, max: 3 }), categoryProducts.length)
      const selectedProducts = faker.helpers.arrayElements(categoryProducts, numProducts)
      
      selectedProducts.forEach(product => {
        // Generate 1-5 transactions per product for this customer
        const numTransactions = faker.number.int({ min: 1, max: 5 })
        
        for (let i = 0; i < numTransactions; i++) {
          allTransactions.push({
            amount: faker.number.float({ min: 100, max: 50000, fractionDigits: 2 }),
            category: category,
            product: product,
            customer: customer,
            date: getRandomDateThisYear(),
            dealer: assignedDealer
          })
        }
      })
    })
  })
  
  return allTransactions
})()

// Also export the supporting data
export { dealers, customers, categories, products }
export type { Transaction, Dealer, Customer, CategoryType, Product }
