import { z } from 'zod'

const reactionsSchema = z.object({
  likes: z.number().int().min(0),
  views: z.number().int().min(0),
  lastViewedAt: z.string().datetime().optional(),
})

const videoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  filename: z.string().min(1),
  thumbnailPath: z.string().optional(),
  duration: z.number().min(0),
  fileSize: z.number().int().min(0),
  format: z.enum(['mp4', 'webm', 'mov', 'avi']),
  tags: z.array(z.string()),
  uploadedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  source: z.enum(['local', 'google-photos']),
  googleDriveFileId: z.string().optional(),
  reactions: reactionsSchema.optional(),
})

const playlistItemSchema = z.object({
  videoId: z.string().uuid(),
  order: z.number().int().min(0),
  startAt: z.string().optional(),
})

const playlistSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(playlistItemSchema),
  loop: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const seriesEpisodeSchema = z.object({
  videoId: z.string().uuid(),
  episodeNumber: z.number().int().min(1),
  title: z.string().optional(),
})

const seriesSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  episodes: z.array(seriesEpisodeSchema),
  autoPlay: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

const featuredItemSchema = z.object({
  contentType: z.enum(['video', 'playlist', 'series']),
  contentId: z.string(),
  priority: z.number().int().min(0),
  featuredAt: z.string().datetime(),
})

const featuredConfigSchema = z.object({
  maxItems: z.literal(10),
  items: z.array(featuredItemSchema).max(10),
  updatedAt: z.string().datetime(),
})

export const junpaLibrarySchema = z.object({
  version: z.string(),
  lastModified: z.string().datetime(),
  videos: z.array(videoSchema),
  playlists: z.array(playlistSchema),
  series: z.array(seriesSchema),
  featured: featuredConfigSchema,
})

export type JunpaLibrary = z.infer<typeof junpaLibrarySchema>
export type Video = z.infer<typeof videoSchema>
export type Playlist = z.infer<typeof playlistSchema>
export type Series = z.infer<typeof seriesSchema>
export type FeaturedConfig = z.infer<typeof featuredConfigSchema>
export type FeaturedItem = z.infer<typeof featuredItemSchema>
export type PlaylistItem = z.infer<typeof playlistItemSchema>
export type SeriesEpisode = z.infer<typeof seriesEpisodeSchema>

export function createEmptyLibrary(): JunpaLibrary {
  return {
    version: '1.0.0',
    lastModified: new Date().toISOString(),
    videos: [],
    playlists: [],
    series: [],
    featured: {
      maxItems: 10,
      items: [],
      updatedAt: new Date().toISOString(),
    },
  }
}
