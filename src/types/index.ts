export type Role = "FARMER" | "BUYER" | "AGGREGATOR";
export type InventoryStatus = "AVAILABLE" | "RESERVED" | "SOLD";
export type TransactionStatus = "PENDING" | "PAID" | "ASSISTED" | "CANCELLED";
export type PaymentMethod = "INTERSWITCH" | "ASSISTED";

export interface User {
  id:           string;
  name:         string;
  phone:        string;
  email?:       string;
  role:         Role;
  farmerId?:    string | null;
  buyerId?:     string | null;
  aggregatorId?:string | null;
}

export interface Farmer {
  id:               string;
  farmName:         string;
  location:         string;
  cropTypes:        string[];
  virtualAccountNo?:string;
  bankName?:        string;
  totalEarned:      number;
  walletBalance:    number;
  registeredBy?:    string;
  user:             { name: string; phone: string; email?: string };
  inventory?:           Inventory[];
  transactions?:        Transaction[];
  recentTransactions?:  Transaction[];
  stats?: {
    totalTransactions: number;
    paidCount:         number;
    pendingCount:      number;
    availableStock:    number;
    unreadCount:       number;
  };
}

export interface Inventory {
  id:         string;
  farmerId:   string;
  cropType:   string;
  quantity:   number;
  pricePerKg: number;
  totalValue: number;
  status:     InventoryStatus;
  notes?:     string;
  createdAt:  string;
  updatedAt:  string;
  farmer?: {
    farmName: string;
    location: string;
    user:     { name: string; phone: string };
  };
}

export interface BuyerContact {
  id:          string;
  name:        string;
  phone:       string;
  email?:      string;
  companyName?:string;
  createdAt:   string;
}

export interface Transaction {
  id:             string;
  txnRef:         string;
  farmerId:       string;
  cropType:       string;
  quantity:       number;
  pricePerKg:     number;
  totalAmount:    number;
  platformFee:    number;
  farmerReceives: number;
  status:         TransactionStatus;
  paymentMethod?: PaymentMethod;
  buyerNotified:  boolean;
  paymentLink?:   string;
  notes?:         string;
  paidAt?:        string;
  createdAt:      string;
  updatedAt:      string;
  farmer?:        { user: { name: string }; farmName?: string; location?: string };
  buyerContact?:  BuyerContact;
  buyer?:         { user: { name: string; phone: string } };
  receipt?:       Receipt | null;
}

export interface Receipt {
  id:             string;
  txnRef:         string;
  farmerName:     string;
  farmName:       string;
  buyerName:      string;
  cropType:       string;
  quantity:       number;
  pricePerKg:     number;
  totalAmount:    number;
  platformFee:    number;
  farmerReceives: number;
  paymentMethod:  string;
  paidAt:         string;
  createdAt:      string;
}

export interface Notification {
  id:        string;
  message:   string;
  channel:   "SMS" | "WHATSAPP" | "IN_APP";
  isRead:    boolean;
  createdAt: string;
}

export interface Pagination {
  page:  number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success:    boolean;
  data:       T;
  pagination?: Pagination;
  message?:   string;
  error?:     string;
}
