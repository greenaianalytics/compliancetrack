import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { rolloverTasksToNextYear } from '@/lib/task-materializer'

export async function GET(request: NextRequest) {
  // Check for cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServerClient()
    
    // Get all active SMEs
    const { data: smeProfiles } = await supabase
      .from('sme_profiles')
      .select('id')
      .eq('is_active', true)

    if (!smeProfiles) {
      return NextResponse.json({ success: false, error: 'No SMEs found' })
    }

    console.log(`Rolling over tasks for ${smeProfiles.length} SMEs`)
    
    // Roll over tasks for each SME
    const results = await Promise.allSettled(
      smeProfiles.map(sme => rolloverTasksToNextYear(sme.id))
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      message: `Yearly rollover completed. Successful: ${successful}, Failed: ${failed}`,
      details: results.map((r, i) => ({
        smeId: smeProfiles[i].id,
        status: r.status,
        error: r.status === 'rejected' ? r.reason.message : null
      }))
    })

  } catch (error) {
    console.error('Yearly rollover error:', error)
    return NextResponse.json({ success: false, error: error.message })
  }
}
