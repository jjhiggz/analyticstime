import { faker } from '@faker-js/faker'

type Customer = {
  name: string
  id: number
}

type CategoryType =
  | "biologicals"
  | "micronutrients"
  | "adjuvants"
  | "seed-treatment"
  | "herbicide"
  | "fungicidee"
  | "insecticide"
  | "fertilizer"
  | "seed"

type Dealer = {
  id: number
  name: string
}

type Transaction = {
  amount: number
  category: CategoryType
  customer: Customer
  date: Date
  dealer: Dealer
}

// Define the 3 dealers
const dealers: Dealer[] = [
  { id: 1, name: "Barrett" },
  { id: 2, name: "Landus" },
  { id: 3, name: "Holganix" }
]

// Define the categories for random selection
const categories: CategoryType[] = [
  "biologicals",
  "micronutrients", 
  "adjuvants",
  "seed-treatment",
  "herbicide",
  "fungicidee",
  "insecticide",
  "fertilizer",
  "seed"
]

// Generate 20 customers
const customers: Customer[] = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  name: faker.company.name()
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

// Generate 1000 transactions
export const transactions: Transaction[] = Array.from({ length: 1000 }, () => ({
  amount: faker.number.float({ min: 100, max: 50000, fractionDigits: 2 }),
  category: getRandomItem(categories),
  customer: getRandomItem(customers),
  date: getRandomDateThisYear(),
  dealer: getRandomItem(dealers)
}))

// Also export the supporting data
export { dealers, customers, categories }
export type { Transaction, Dealer, Customer, CategoryType }
