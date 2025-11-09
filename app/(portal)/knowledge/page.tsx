'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createBrowserClient } from '@/lib/supabase'

interface KnowledgeArticle {
  id: string
  article_id: string
  title: string
  content_markdown: string
  category: string
  tags: string[]
  last_updated: string
  country_code: string
}

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadArticles()
  }, [])

  useEffect(() => {
    filterArticles()
  }, [articles, searchTerm, selectedCategory])

  const loadArticles = async () => {
    const supabase = createBrowserClient()
    
    // Get user's country to filter articles
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: smeProfile } = await supabase
        .from('sme_profiles')
        .select('country_code')
        .eq('user_id', user.id)
        .single()

      if (smeProfile) {
        // Load articles for user's country
        const { data: articlesData, error } = await supabase
          .from('knowledge_articles')
          .select('*')
          .eq('country_code', smeProfile.country_code)
          .eq('is_active', true)
          .order('last_updated', { ascending: false })

        if (error) {
          console.error('Error loading articles:', error)
        } else {
          setArticles(articlesData || [])
        }
      }
    }
    setLoading(false)
  }

  const filterArticles = () => {
    let filtered = articles

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.content_markdown.toLowerCase().includes(searchLower) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    setFilteredArticles(filtered)
  }

  const getCategories = () => {
    return [...new Set(articles.map(article => article.category))]
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
        {paragraph}
      </p>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading knowledge hub...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Hub</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
                />
              </div>
              <div className="md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Categories</option>
                  {getCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Featured Updates */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Featured Updates</h2>
            <p className="text-blue-700 text-sm">
              Stay informed with the latest compliance requirements and regulatory changes for Irish SMEs.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredArticles.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p>No articles found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-500"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredArticles.map(article => (
                <div
                  key={article.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(article.last_updated).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {article.content_markdown.substring(0, 150)}...
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{article.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* No Articles Message */}
          {articles.length === 0 && filteredArticles.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles available</h3>
              <p className="text-gray-600 mb-4">
                Knowledge articles will appear here once they are added to the system.
              </p>
              <p className="text-sm text-gray-500">
                Check back later for compliance guides and regulatory updates.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2">
                    {selectedArticle.category}
                  </span>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedArticle.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>Last updated: {new Date(selectedArticle.last_updated).toLocaleDateString()}</span>
                <span>•</span>
                <span>Country: {selectedArticle.country_code}</span>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose max-w-none">
                {formatContent(selectedArticle.content_markdown)}
              </div>
              {selectedArticle.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}