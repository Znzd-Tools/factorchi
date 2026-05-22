export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProjectType = 'hourly' | 'total';
export type ProjectStatus = 'active' | 'archived';
export type PaymentMethodType = 'bank' | 'crypto';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'canceled' | 'overdue';
export type InvoiceLineType = 'hourly' | 'fixed';
export type ExchangeMethod = 'divide' | 'multiply';

export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					full_name: string | null;
					default_currency: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					full_name?: string | null;
					default_currency?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					full_name?: string | null;
					default_currency?: string;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			payment_methods: {
				Row: {
					id: string;
					user_id: string;
					type: PaymentMethodType;
					label: string;
					details: Json;
					is_default: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					type: PaymentMethodType;
					label: string;
					details: Json;
					is_default?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					type?: PaymentMethodType;
					label?: string;
					details?: Json;
					is_default?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			projects: {
				Row: {
					id: string;
					user_id: string;
					name: string;
					client_name: string;
					client_contact: string | null;
					type: ProjectType;
					currency: string;
					hourly_rate: number | null;
					total_amount: number | null;
					status: ProjectStatus;
					notes: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					name: string;
					client_name: string;
					client_contact?: string | null;
					type: ProjectType;
					currency?: string;
					hourly_rate?: number | null;
					total_amount?: number | null;
					status?: ProjectStatus;
					notes?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					name?: string;
					client_name?: string;
					client_contact?: string | null;
					type?: ProjectType;
					currency?: string;
					hourly_rate?: number | null;
					total_amount?: number | null;
					status?: ProjectStatus;
					notes?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			time_entries: {
				Row: {
					id: string;
					project_id: string;
					user_id: string;
					work_date: string;
					hours: number;
					rate_at_entry: number;
					description: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					project_id: string;
					user_id: string;
					work_date: string;
					hours: number;
					rate_at_entry: number;
					description?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					project_id?: string;
					user_id?: string;
					work_date?: string;
					hours?: number;
					rate_at_entry?: number;
					description?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			invoices: {
				Row: {
					id: string;
					project_id: string;
					user_id: string;
					payment_method_id: string | null;
					invoice_no: string;
					issue_date: string;
					period_start: string | null;
					period_end: string | null;
					percentage: number | null;
					status: InvoiceStatus;
					subtotal: number;
					tax_rate: number;
					tax_amount: number;
					total: number;
					alt_currency: string | null;
					exchange_rate: number | null;
					exchange_method: ExchangeMethod | null;
					show_project_name: boolean;
					show_owner_name: boolean;
					notes: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					project_id: string;
					user_id: string;
					payment_method_id?: string | null;
					invoice_no: string;
					issue_date?: string;
					period_start?: string | null;
					period_end?: string | null;
					percentage?: number | null;
					status?: InvoiceStatus;
					subtotal?: number;
					tax_rate?: number;
					tax_amount?: number;
					total?: number;
					alt_currency?: string | null;
					exchange_rate?: number | null;
					exchange_method?: ExchangeMethod | null;
					show_project_name?: boolean;
					show_owner_name?: boolean;
					notes?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					project_id?: string;
					user_id?: string;
					payment_method_id?: string | null;
					invoice_no?: string;
					issue_date?: string;
					period_start?: string | null;
					period_end?: string | null;
					percentage?: number | null;
					status?: InvoiceStatus;
					subtotal?: number;
					tax_rate?: number;
					tax_amount?: number;
					total?: number;
					alt_currency?: string | null;
					exchange_rate?: number | null;
					exchange_method?: ExchangeMethod | null;
					show_project_name?: boolean;
					show_owner_name?: boolean;
					notes?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			invoice_line_items: {
				Row: {
					id: string;
					invoice_id: string;
					title: string;
					type: InvoiceLineType;
					hours: number | null;
					rate: number | null;
					total: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					invoice_id: string;
					title: string;
					type: InvoiceLineType;
					hours?: number | null;
					rate?: number | null;
					total: number;
					created_at?: string;
				};
				Update: {
					id?: string;
					invoice_id?: string;
					title?: string;
					type?: InvoiceLineType;
					hours?: number | null;
					rate?: number | null;
					total?: number;
					created_at?: string;
				};
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type TimeEntry = Database['public']['Tables']['time_entries']['Row'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceLineItem = Database['public']['Tables']['invoice_line_items']['Row'];
