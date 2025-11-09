export interface KnowledgeArticle {
  id: string
  article_id: string
  country_code: string
  title: string
  content_markdown: string
  content_html?: string
  category: string
  tags: string[]
  last_updated: string
  source_file: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface KnowledgeFilters {
  category: string
  tags: string[]
  search: string
  country: string
}

export const DEFAULT_KNOWLEDGE_FILTERS: KnowledgeFilters = {
  category: 'all',
  tags: [],
  search: '',
  country: 'all'
}