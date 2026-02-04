import { promises as fs } from 'fs'
import path from 'path'
import {
  junpaLibrarySchema,
  createEmptyLibrary,
  type JunpaLibrary,
} from '@/lib/schemas'

const LIBRARY_PATH = path.join(process.cwd(), 'library.json')

/**
 * Read the library from the local JSON file.
 * Creates an empty library if the file does not exist.
 */
export async function readLibrary(): Promise<JunpaLibrary> {
  try {
    const raw = await fs.readFile(LIBRARY_PATH, 'utf-8')
    const parsed = junpaLibrarySchema.safeParse(JSON.parse(raw))
    if (parsed.success) {
      return parsed.data
    }
    // Invalid schema - return empty library
    return createEmptyLibrary()
  } catch {
    // File does not exist - create and return empty library
    const empty = createEmptyLibrary()
    await writeLibrary(empty)
    return empty
  }
}

/**
 * Write the library to the local JSON file.
 */
export async function writeLibrary(library: JunpaLibrary): Promise<void> {
  const updated = { ...library, lastModified: new Date().toISOString() }
  await fs.writeFile(LIBRARY_PATH, JSON.stringify(updated, null, 2), 'utf-8')
}
