'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { addFeaturedItem } from '@/lib/actions/featured-actions'
import type { Video, Playlist, Series } from '@/lib/schemas'

interface FeaturedContentPickerProps {
  videos: Video[]
  playlists: Playlist[]
  series: Series[]
  featuredIds: Set<string>
  currentCount: number
  onClose: () => void
}

type TabType = 'videos' | 'playlists' | 'series'

export function FeaturedContentPicker({
  videos,
  playlists,
  series,
  featuredIds,
  currentCount,
  onClose,
}: FeaturedContentPickerProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('videos')
  const [adding, setAdding] = useState<string | null>(null)

  const atLimit = currentCount >= 10

  const availableVideos = videos.filter((v) => !featuredIds.has(v.id))
  const availablePlaylists = playlists.filter((p) => !featuredIds.has(p.id))
  const availableSeries = series.filter((s) => !featuredIds.has(s.id))

  async function handleAdd(
    contentType: 'video' | 'playlist' | 'series',
    contentId: string
  ) {
    if (atLimit) return
    setAdding(contentId)
    const result = await addFeaturedItem(contentType, contentId)
    setAdding(null)
    if (result.success) {
      router.refresh()
      onClose()
    }
  }

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'videos', label: 'Videos', count: availableVideos.length },
    { key: 'playlists', label: 'Playlists', count: availablePlaylists.length },
    { key: 'series', label: 'Series', count: availableSeries.length },
  ]

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          Add to Featured
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close picker"
        >
          Close
        </button>
      </div>

      {atLimit && (
        <div className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Featured content limit reached (maximum 10 items).
        </div>
      )}

      {/* Tabs */}
      <div className="mb-3 flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-3 py-2 text-sm font-medium transition-colors',
              'border-b-2 -mb-px',
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content list */}
      <div className="max-h-60 overflow-y-auto">
        {activeTab === 'videos' && (
          <ContentList
            items={availableVideos.map((v) => ({
              id: v.id,
              title: v.title,
            }))}
            contentType="video"
            onSelect={handleAdd}
            adding={adding}
            disabled={atLimit}
          />
        )}
        {activeTab === 'playlists' && (
          <ContentList
            items={availablePlaylists.map((p) => ({
              id: p.id,
              title: p.title,
            }))}
            contentType="playlist"
            onSelect={handleAdd}
            adding={adding}
            disabled={atLimit}
          />
        )}
        {activeTab === 'series' && (
          <ContentList
            items={availableSeries.map((s) => ({
              id: s.id,
              title: s.title,
            }))}
            contentType="series"
            onSelect={handleAdd}
            adding={adding}
            disabled={atLimit}
          />
        )}
      </div>
    </div>
  )
}

interface ContentListProps {
  items: { id: string; title: string }[]
  contentType: 'video' | 'playlist' | 'series'
  onSelect: (
    contentType: 'video' | 'playlist' | 'series',
    contentId: string
  ) => void
  adding: string | null
  disabled: boolean
}

function ContentList({
  items,
  contentType,
  onSelect,
  adding,
  disabled,
}: ContentListProps) {
  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No available items.
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(contentType, item.id)}
          disabled={disabled || adding === item.id}
          className={cn(
            'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm',
            'transition-colors hover:bg-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
        >
          <span className="truncate text-foreground">{item.title}</span>
          {adding === item.id ? (
            <span className="text-xs text-muted-foreground">Adding...</span>
          ) : (
            <span className="text-xs text-primary">+ Add</span>
          )}
        </button>
      ))}
    </div>
  )
}
