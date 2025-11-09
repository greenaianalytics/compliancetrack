'use client'

import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  // Simple markdown to HTML conversion (you can use a library like react-markdown for production)
  const renderMarkdown = (text: string) => {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-10 mb-5">$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
      
      // Links
      .replace(/\[([^\[]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Lists
      .replace(/^\s*\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\s*\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/(<li.*<\/li>)/gim, '<ul class="list-disc ml-6 my-3">$1</ul>')
      
      // Line breaks
      .replace(/\n/gim, '<br />')
      
      // Paragraphs (handle consecutive line breaks)
      .split(/\n\n+/)
      .map(paragraph => {
        if (paragraph.startsWith('<')) {
          return paragraph // Already processed element
        }
        return `<p class="mb-4">${paragraph}</p>`
      })
      .join('')
  }

  return (
    <div 
      className={`prose prose-gray max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}