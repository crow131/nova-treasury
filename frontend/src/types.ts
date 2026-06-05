export type CardStatus = 'ACTIVE' | 'LOCKED';
export type CardType = 'Virtual' | 'Physical' | 'Platinum';

export interface Card {
  id: string;
  last4: string;
  fullNumber?: string;
  holder: string;
  limit: number;
  spent: number;
  expires: string;
  status: CardStatus;
  cardType: CardType;
  relativeBg?: string; // Hex color or gradient name
}

export type TransactionStatus = 'Cleared' | 'Pending' | 'Flagged' | 'Success';
export type TransactionCategory =
  | 'Infrastructure'
  | 'Software'
  | 'Travel'
  | 'Meals'
  | 'Entertainment'
  | 'Software & SaaS'
  | 'Business Meals'
  | 'Travel & Lodging'
  | 'Marketing & Advertising'
  | 'Office Supplies';

export interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: number; // Positive = deposit/funding, Negative = payment
  cardLast4: string;
  status: TransactionStatus;
  category: TransactionCategory;
  entity: string;
}

export interface ExchangeRate {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}
