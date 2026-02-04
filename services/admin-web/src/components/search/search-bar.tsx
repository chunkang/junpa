'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { searchContent } from '@/lib/actions/search-actions'
import type { Video, Playlist, Series } from '@/lib/schemas'

interface SearchResults {
  videos: Video[]
  playlists: Playlist[]
  series: Series[]
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (query.trim().length < 2) {
      setResults(null)
      setIsOpen(false)
      return
    }

    timerRef.current = setTimeout(async () => {
      const data = await searchContent(query)
      setResults(data)
      setIsOpen(true)
    }, 300)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasResults =
    results &&
    (results.videos.length > 0 ||
      results.playlists.length > 0 ||
      results.series.length > 0)

  function handleResultClick() {
    setIsOpen(false)
    setQuery('')
    setResults(null)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        {/* Magnifying glass icon */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          &#128269;
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results) setIsOpen(true)
          }}
          placeholder="Search videos, playlists, series..."
          aria-label="Search content"
          className={cn(
            'w-full rounded-md border border-input bg-background py-2 pl-9 pr-3',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
          )}
        />
      </div>

      {/* Results dropdown */}
      {isOpen && results && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-card shadow-lg">
          {!hasResults ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results found
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto py-1">
              {results.videos.length > 0 && (
                <ResultSection
                  label="Videos"
                  items={results.videos.map((v) => ({
                    id: v.id,
                    title: v.title,
                    href: `/library/${v.id}`,
                  }))}
                  onClick={handleResultClick}
                />
              )}
              {results.playlists.length > 0 && (
                <ResultSection
                  label="Playlists"
                  items={results.playlists.map((p) => ({
                    id: p.id,
                    title: p.title,
                    href: `/playlists/${p.id}`,
                  }))}
                  onClick={handleResultClick}
                />
              )}
              {results.series.length > 0 && (
                <ResultSection
                  label="Series"
                  items={results.series.map((s) => ({
                    id: s.id,
                    title: s.title,
                    href: `/series/${s.id}`,
                  }))}
                  onClick={handleResultClick}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ResultSectionProps {
  label: string
  items: { id: string; title: string; href: string }[]
  onClick: () => void
}

function ResultSection({ label, items, onClick }: ResultSectionProps) {
  return (
    <div>
      <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          onClick={onClick}
          className={cn(
            'block px-3 py-2 text-sm text-foreground',
            'transition-colors hover:bg-muted',
            'focus-visible:outline-none focus-visible:bg-muted'
          )}
        >
          {item.title}
        </Link>
      ))}
    </div>
  )
}
