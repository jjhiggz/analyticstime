type Customer = {
    name: string;
    id: number;
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
  | "seed";

type Dealer = {
    id: number;
    name: string;
}

type Transaction = {
    amount: number;
    category: CategoryType
    customer: Customer
    date: Date
    dealer: Dealer
}