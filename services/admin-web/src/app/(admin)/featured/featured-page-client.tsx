'use client'

import { useState } from 'react'
import { FeaturedEditor } from '@/components/featured/featured-editor'
import { FeaturedContentPicker } from '@/components/featured/featured-content-picker'
import type { FeaturedItemWithDetails } from '@/lib/actions/featured-actions'
import type { Video, Playlist, Series } from '@/lib/schemas'

interface FeaturedPageClientProps {
  featuredItems: FeaturedItemWithDetails[]
  videos: Video[]
  playlists: Playlist[]
  series: Series[]
  featuredIds: Set<string>
}

export function FeaturedPageClient({
  featuredItems,
  videos,
  playlists,
  series,
  featuredIds,
}: FeaturedPageClientProps) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="space-y-6">
      <FeaturedEditor
        items={featuredItems}
        onAddClick={() => setShowPicker(true)}
      />

      {showPicker && (
        <FeaturedContentPicker
          videos={videos}
          playlists={playlists}
          series={series}
          featuredIds={featuredIds}
          currentCount={featuredItems.length}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
