export interface BusinessSettings {
  business_name: string
  business_address: string
  city: string
  county: string
  eircode: string
  phone_number: string
  company_size: string
  country_code: string
  nace_code: string
}

export interface NotificationSettings {
  email_enabled: boolean
  whatsapp_enabled: boolean
  email_address: string
  whatsapp_number: string
  reminder_lead_days: number[]
  quiet_hours_start: string
  quiet_hours_end: string
}

export interface PaymentSettings {
  subscription_status: 'trial' | 'active' | 'cancelled' | 'expired'
  subscription_type: 'free' | 'paid' | 'sponsored'
  trial_ends_at?: string
  sponsored_until?: string
  billing_email: string
}

export interface SettingsData {
  business: BusinessSettings
  notifications: NotificationSettings
  payment: PaymentSettings
}