'use client'

import { KnowledgeFilters, DEFAULT_KNOWLEDGE_FILTERS } from '@/types/knowledge'

interface KnowledgeFiltersProps {
  filters: KnowledgeFilters
  onFiltersChange: (filters: KnowledgeFilters) => void
  categories: string[]
  tags: string[]
  countries: string[]
  articleCount: number
}

export default function KnowledgeFiltersComponent({
  filters,
  onFiltersChange,
  categories,
  tags,
  countries,
  articleCount
}: KnowledgeFiltersProps) {
  const handleFilterChange = (key: keyof KnowledgeFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    
    handleFilterChange('tags', newTags)
  }

  const clearFilters = () => {
    onFiltersChange(DEFAULT_KNOWLEDGE_FILTERS)
  }

  const hasActiveFilters = 
    filters.category !== 'all' ||
    filters.country !== 'all' ||
    filters.search !== '' ||
    filters.tags.length > 0

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Knowledge Hub ({articleCount} articles)
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search articles..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Country Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>
                {country.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Popular Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 8).map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`
                  px-3 py-1 text-xs rounded-full transition-colors
                  ${filters.tags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.category !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Category: {filters.category}
              <button
                onClick={() => handleFilterChange('category', 'all')}
                className="ml-1 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.country !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Country: {filters.country.toUpperCase()}
              <button
                onClick={() => handleFilterChange('country', 'all')}
                className="ml-1 hover:text-green-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.tags.map(tag => (
            <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="ml-1 hover:text-purple-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}