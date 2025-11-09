import { Country, NaceCode } from '@/types/onboarding'

// Sample countries - you can expand this list
export const COUNTRIES: Country[] = [
  { code: 'IE', name: 'Ireland' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
]

// Sample NACE codes for Ireland - you'll want to pull this from your GitHub repo
export const NACE_CODES: NaceCode[] = [
  { code: '47.11', description: 'Retail sale in non-specialised stores with food, beverages or tobacco predominating', country: 'IE' },
  { code: '47.19', description: 'Other retail sale in non-specialised stores', country: 'IE' },
  { code: '47.21', description: 'Retail sale of fruit and vegetables in specialised stores', country: 'IE' },
  { code: '47.25', description: 'Retail sale of beverages in specialised stores', country: 'IE' },
  { code: '47.29', description: 'Other retail sale of food in specialised stores', country: 'IE' },
  { code: '47.30', description: 'Retail sale of automotive fuel in specialised stores', country: 'IE' },
  { code: '47.41', description: 'Retail sale of computers, peripheral units and software in specialised stores', country: 'IE' },
  { code: '47.42', description: 'Retail sale of telecommunications equipment in specialised stores', country: 'IE' },
  { code: '47.43', description: 'Retail sale of audio and video equipment in specialised stores', country: 'IE' },
  { code: '47.51', description: 'Retail sale of textiles in specialised stores', country: 'IE' },
  { code: '47.52', description: 'Retail sale of hardware, paints and glass in specialised stores', country: 'IE' },
  { code: '47.59', description: 'Retail sale of furniture, lighting equipment and other household articles in specialised stores', country: 'IE' },
  { code: '47.61', description: 'Retail sale of books in specialised stores', country: 'IE' },
  { code: '47.62', description: 'Retail sale of newspapers and stationery in specialised stores', country: 'IE' },
  { code: '47.63', description: 'Retail sale of music and video recordings in specialised stores', country: 'IE' },
  { code: '47.64', description: 'Retail sale of sporting equipment in specialised stores', country: 'IE' },
  { code: '47.65', description: 'Retail sale of games and toys in specialised stores', country: 'IE' },
  { code: '47.71', description: 'Retail sale of clothing in specialised stores', country: 'IE' },
  { code: '47.72', description: 'Retail sale of footwear and leather goods in specialised stores', country: 'IE' },
  { code: '47.73', description: 'Dispensing chemist in specialised stores', country: 'IE' },
  { code: '47.74', description: 'Retail sale of medical and orthopaedic goods in specialised stores', country: 'IE' },
  { code: '47.75', description: 'Retail sale of cosmetic and toilet articles in specialised stores', country: 'IE' },
  { code: '47.76', description: 'Retail sale of flowers, plants, seeds, fertilisers, pet animals and pet food in specialised stores', country: 'IE' },
  { code: '47.77', description: 'Retail sale of watches and jewellery in specialised stores', country: 'IE' },
  { code: '47.78', description: 'Other retail sale of new goods in specialised stores', country: 'IE' },
  { code: '47.79', description: 'Retail sale of second-hand goods in stores', country: 'IE' },
  { code: '47.81', description: 'Retail sale via stalls and markets of food, beverages and tobacco products', country: 'IE' },
  { code: '47.82', description: 'Retail sale via stalls and markets of textiles, clothing and footwear', country: 'IE' },
  { code: '47.89', description: 'Retail sale via stalls and markets of other goods', country: 'IE' },
  { code: '47.91', description: 'Retail sale via mail order houses or via Internet', country: 'IE' },
  { code: '47.99', description: 'Other retail sale not in stores, stalls or markets', country: 'IE' },
]

export const getNaceCodesByCountry = (countryCode: string): NaceCode[] => {
  return NACE_CODES.filter(nace => nace.country === countryCode)
}

export const validateBusinessInfo = (data: any): string[] => {
  const errors: string[] = []
  
  if (!data.business_name?.trim()) {
    errors.push('Business name is required')
  }
  
  if (!data.business_address?.trim()) {
    errors.push('Business address is required')
  }
  
  if (!data.city?.trim()) {
    errors.push('City is required')
  }
  
  if (!data.county?.trim()) {
    errors.push('County is required')
  }
  
  if (!data.phone_number?.trim()) {
    errors.push('Phone number is required')
  }
  
  if (!data.company_size?.trim()) {
    errors.push('Company size is required')
  }
  
  if (!data.registration_date) {
    errors.push('Registration date is required')
  }
  
  return errors
}

export const validateCountryNace = (data: any): string[] => {
  const errors: string[] = []
  
  if (!data.country_code) {
    errors.push('Country is required')
  }
  
  if (!data.nace_code) {
    errors.push('NACE code is required')
  }
  
  return errors
}