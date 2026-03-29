import { createBrowserClient } from './supabase'

/**
 * Materialize compliance tasks for an SME for a specific year
 */
export async function materializeTasksForYear(smeId: string, year: number) {
  const supabase = createBrowserClient()
  
  // Get SME profile
  const { data: smeProfile } = await supabase
    .from('sme_profiles')
    .select('*')
    .eq('id', smeId)
    .single()

  if (!smeProfile) {
    throw new Error('SME profile not found')
  }

  // Get compliance rules for SME's country
  const { data: rules } = await supabase
    .from('compliance_rules')
    .select('*')
    .eq('country_code', smeProfile.country_code)
    .single()

  if (!rules?.rules_json?.categories) {
    throw new Error('No compliance rules found for country')
  }

  // Process each category and task
  const tasksToCreate = []
  
  for (const category of rules.rules_json.categories) {
    for (const task of category.tasks) {
      // Check if task applies to SME's NACE codes
      if (!task.nace || smeProfile.nace_codes?.includes(task.nace)) {
        const dueDate = calculateTaskDueDate(task.frequency, task.due_rule, year)
        
        tasksToCreate.push({
          sme_id: smeId,
          task_id: task.id,
          task_year: year,
          due_date: dueDate,
          status: 'pending',
          evidence_required: task.evidence_required || false,
          weekend_policy: task.weekend_policy || 'next_business_day'
        })
      }
    }
  }

  // Insert tasks in batch
  if (tasksToCreate.length > 0) {
    const { error } = await supabase
      .from('sme_compliance_status')
      .upsert(tasksToCreate, { onConflict: 'sme_id,task_id,task_year' })

    if (error) {
      throw new Error(`Failed to materialize tasks: ${error.message}`)
    }
  }

  return tasksToCreate.length
}

/**
 * Calculate due date based on frequency and due_rule for a specific year
 */
function calculateTaskDueDate(frequency: string, dueRule: string, year: number): string {
  if (frequency === 'annual') {
    // Parse due_rule like "month=3,day=31"
    const monthMatch = dueRule.match(/month=(\d+)/)
    const dayMatch = dueRule.match(/day=(\d+)/)
    
    if (monthMatch && dayMatch) {
      const month = parseInt(monthMatch[1]) - 1 // JS months are 0-indexed
      const day = parseInt(dayMatch[1])
      return new Date(year, month, day).toISOString()
    }
  }
  
  // For other frequencies, use current logic
  // Add more logic for quarterly, monthly, etc.
  return new Date(year, 11, 31).toISOString() // Default to end of year
}

/**
 * Ensure tasks exist for a given year, materialize if needed
 */
export async function ensureTasksForYear(smeId: string, year: number) {
  const supabase = createBrowserClient()
  
  // Check if tasks already exist for this year
  const { data: existingTasks, error: checkError } = await supabase
    .from('sme_compliance_status')
    .select('id')
    .eq('sme_id', smeId)
    .eq('task_year', year)
    .limit(1)

  if (checkError) {
    console.error('Error checking existing tasks:', checkError)
    return false
  }

  // If tasks already exist, no need to materialize
  if (existingTasks && existingTasks.length > 0) {
    return true
  }

  // Tasks don't exist for this year, materialize them
  try {
    await materializeTasksForYear(smeId, year)
    return true
  } catch (error) {
    console.error(`Failed to materialize tasks for year ${year}:`, error)
    return false
  }
}

/**
 * Check and roll over tasks to next year if needed
 */
export async function rolloverTasksToNextYear(smeId: string) {
  const currentYear = new Date().getFullYear()
  const nextYear = currentYear + 1
  
  // Check if tasks already exist for next year
  const supabase = createBrowserClient()
  
  const { data: existingTasks } = await supabase
    .from('sme_compliance_status')
    .select('id')
    .eq('sme_id', smeId)
    .eq('task_year', nextYear)
    .limit(1)

  // If no tasks for next year, materialize them
  if (!existingTasks || existingTasks.length === 0) {
    await materializeTasksForYear(smeId, nextYear)
    console.log(`Rolled over tasks to ${nextYear} for SME ${smeId}`)
  }
}
