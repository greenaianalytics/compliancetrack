import { NextRequest, NextResponse } from 'next/server'
import { generatePDFHTML } from '@/lib/pdf-generator'
import { ExportData } from '@/types/export'
import puppeteer from 'puppeteer'

/**
 * Server-side PDF generation endpoint
 * Generates a PDF from compliance export data
 */
export async function POST(request: NextRequest) {
  try {
    const exportData: ExportData = await request.json()

    // Generate HTML content
    const htmlContent = generatePDFHTML(exportData)

    // Generate actual PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })

    await browser.close()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compliance-report-${exportData.metadata.businessName.replace(/\s+/g, '-')}.pdf"`,
      },
    })

  } catch (error) {
    console.error('Error generating PDF:', error)

    // Fallback: return HTML that can be printed to PDF
    const exportData: ExportData = await request.json()
    const htmlContent = generatePDFHTML(exportData)

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="compliance-report-${exportData.metadata.businessName.replace(/\s+/g, '-')}.html"`,
      },
    })
  }
}
    //   },
    //   body: JSON.stringify({ source: { html: htmlContent } })
    // })
    // const pdfBuffer = await response.arrayBuffer()
    // return new NextResponse(pdfBuffer, {
    //   headers: { 'Content-Type': 'application/pdf' }
    // })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
