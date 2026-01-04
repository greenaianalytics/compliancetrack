'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface YearSelectorProps {
  currentYear: number
  availableYears: number[]
  onYearChange: (year: number) => void
}

export default function YearSelector({ currentYear, availableYears, onYearChange }: YearSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleYearChange = (year: number) => {
    onYearChange(year)
    
    // Update URL with year parameter
    const params = new URLSearchParams(searchParams.toString())
    params.set('year', year.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700">Year:</span>
      <div className="flex items-center space-x-1">
        {availableYears.map((year) => (
          <button
            key={year}
            onClick={() => handleYearChange(year)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              currentYear === year
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {year}
          </button>
        ))}
        <button
          onClick={() => handleYearChange(new Date().getFullYear())}
          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Current
        </button>
      </div>
      <div className="ml-2 text-sm text-gray-500">
        {currentYear === new Date().getFullYear() ? '📅 Current year' : `📅 Viewing ${currentYear}`}
      </div>
    </div>
  )
}
