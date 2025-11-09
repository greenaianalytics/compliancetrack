import { createBrowserClient } from './supabase'
import { KnowledgeArticle, KnowledgeFilters } from '@/types/knowledge'

export const getKnowledgeArticles = async (filters?: KnowledgeFilters): Promise<KnowledgeArticle[]> => {
  const supabase = createBrowserClient()
  
  let query = supabase
    .from('knowledge_articles')
    .select('*')
    .eq('is_active', true)
    .order('last_updated', { ascending: false })

  // Apply filters
  if (filters) {
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }
    
    if (filters.country && filters.country !== 'all') {
      query = query.eq('country_code', filters.country)
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content_markdown.ilike.%${filters.search}%`)
    }
    
    if (filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }
  }

  const { data: articles, error } = await query

  if (error) {
    console.error('Error fetching knowledge articles:', error)
    return []
  }

  return articles || []
}

export const getKnowledgeArticle = async (articleId: string): Promise<KnowledgeArticle | null> => {
  const supabase = createBrowserClient()
  
  const { data: article, error } = await supabase
    .from('knowledge_articles')
    .select('*')
    .eq('article_id', articleId)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching knowledge article:', error)
    return null
  }

  return article
}

export const getUniqueCategories = async (): Promise<string[]> => {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('knowledge_articles')
    .select('category')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  const categories = [...new Set(data.map(item => item.category))].sort()
  return categories
}

export const getUniqueTags = async (): Promise<string[]> => {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('knowledge_articles')
    .select('tags')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  const allTags = data.flatMap(item => item.tags || [])
  const uniqueTags = [...new Set(allTags)].sort()
  return uniqueTags
}

export const getUniqueCountries = async (): Promise<string[]> => {
  const supabase = createBrowserClient()
  
  const { data, error } = await supabase
    .from('knowledge_articles')
    .select('country_code')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching countries:', error)
    return []
  }

  const countries = [...new Set(data.map(item => item.country_code))].sort()
  return countries
}