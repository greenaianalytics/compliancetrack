export interface OnboardingData {
  // Step 1: Business Information
  business_name: string
  business_address: string
  city: string
  county: string
  eircode: string
  phone_number: string
  company_size: string
  registration_date: string
  
  // Step 2: Country & NACE
  country_code: string
  nace_code: string
  nace_description: string
  
  // Step 3: Team Invites
  team_members: TeamMember[]
}

export interface TeamMember {
  email: string
  role: 'org_admin' | 'user'
  name: string
}

export interface Country {
  code: string
  name: string
}

export interface NaceCode {
  code: string
  description: string
  country: string
}