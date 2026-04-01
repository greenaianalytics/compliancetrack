import { NextResponse } from 'next/server'

export async function GET() {
  const settings = {
    price: process.env['PRICE_PER_USER'] || '19.99',
    sponsored: process.env['SPONSORED'] === 'true',
    emailProvider: process.env['RESEND_API_KEY'] ? 'resend' : 'none',
    smsProvider: process.env['ELKS_USERNAME'] && process.env['ELKS_PASSWORD'] ? '46elks' : 'none',
  }

  return NextResponse.json(settings)
}
