import { readLibraryJson, writeLibraryJson } from './drive-client'
import {
  junpaLibrarySchema,
  createEmptyLibrary,
  type JunpaLibrary,
} from '../schemas'

export interface SyncResult {
  success: boolean
  library?: JunpaLibrary
  conflict?: boolean
  error?: string
}

export async function fetchLibrary(
  accessToken: string,
  junpaDirId: string
): Promise<SyncResult> {
  try {
    const raw = await readLibraryJson(accessToken, junpaDirId)

    if (!raw) {
      const empty = createEmptyLibrary()
      await writeLibraryJson(accessToken, junpaDirId, JSON.stringify(empty))
      return { success: true, library: empty }
    }

    const parsed = junpaLibrarySchema.safeParse(JSON.parse(raw))
    if (!parsed.success) {
      return { success: false, error: 'Invalid library.json schema' }
    }

    return { success: true, library: parsed.data }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

export async function saveLibrary(
  accessToken: string,
  junpaDirId: string,
  library: JunpaLibrary,
  lastKnownModified?: string
): Promise<SyncResult> {
  try {
    // Conflict detection: check if remote was modified since last fetch
    if (lastKnownModified) {
      const currentRaw = await readLibraryJson(accessToken, junpaDirId)
      if (currentRaw) {
        const current = JSON.parse(currentRaw)
        if (current.lastModified > lastKnownModified) {
          return {
            success: false,
            conflict: true,
            error: 'Remote modified since last fetch',
          }
        }
      }
    }

    const updated = { ...library, lastModified: new Date().toISOString() }
    const validation = junpaLibrarySchema.safeParse(updated)
    if (!validation.success) {
      return { success: false, error: 'Invalid library data' }
    }

    await writeLibraryJson(accessToken, junpaDirId, JSON.stringify(updated))
    return { success: true, library: updated }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
