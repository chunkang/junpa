'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { PlaylistForm } from '@/components/playlist/playlist-form'
import { createPlaylist } from '@/lib/actions/playlist-actions'

export default function NewPlaylistPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(data: {
    title: string
    description?: string
    loop: boolean
  }) {
    setSaving(true)
    setError('')

    const result = await createPlaylist({
      title: data.title,
      description: data.description,
    })

    if (result.success && result.playlist) {
      router.push(`/playlists/${result.playlist.id}`)
    } else {
      setSaving(false)
      setError(result.error ?? 'Failed to create playlist')
    }
  }

  function handleCancel() {
    router.push('/playlists')
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Breadcrumb navigation */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/playlists"
              className="transition-colors hover:text-foreground"
            >
              Playlists
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-foreground">New Playlist</li>
        </ol>
      </nav>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Create New Playlist
        </h2>

        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <PlaylistForm
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      </div>
    </div>
  )
}
