// Auth
export interface LoginRequest {
  login: string;
  password: string;
}

export interface OdooSessionInfo {
  uid: number;
  session_id: string;
  name: string;
  partner_id: [number, string];
}

// API envelope
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  meta: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: number;
    name: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Resources — mirrors Pydantic schema field names exactly
export interface Opportunity {
  id: number;
  name: string;
  partner_name: string;
  stage_name: string;
  expected_revenue: number;
  probability: number;
  date_deadline: string | null;
}

export interface SalesOrder {
  id: number;
  name: string;
  partner_name: string;
  amount_total: number;
  currency_name: string;
  date_order: string;
  state: string;
}

export interface Invoice {
  id: number;
  name: string;
  partner_name: string;
  amount_total: number;
  currency_name: string;
  invoice_date: string;
  payment_state: string;
  state: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  country_name: string;
}

// Dashboard
export interface DashboardData {
  opportunities: Opportunity[];
  quotations: SalesOrder[];
  sales_orders: SalesOrder[];
  invoices: Invoice[];
  customers: Customer[];
}

export interface DashboardMeta {
  limit: number;
  counts: {
    opportunities: number;
    quotations: number;
    sales_orders: number;
    invoices: number;
    customers: number;
  };
}

// Create opportunity — mirrors CreateOpportunityPayload
export interface CreateOpportunityRequest {
  name: string;
  partner_id?: number;
  expected_revenue?: number;
  description?: string;
}

// Pagination
export interface PaginatedMeta {
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}
