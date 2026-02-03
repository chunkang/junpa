import { google } from 'googleapis'

const JUNPA_DIR = '.junpa'
const LIBRARY_FILE = 'library.json'

export function createDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.drive({ version: 'v3', auth })
}

export async function ensureJunpaDirectory(
  accessToken: string
): Promise<string> {
  const drive = createDriveClient(accessToken)

  // Check if .junpa directory exists
  const res = await drive.files.list({
    q: `name='${JUNPA_DIR}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  })

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!
  }

  // Create .junpa directory
  const folder = await drive.files.create({
    requestBody: {
      name: JUNPA_DIR,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id',
  })

  const folderId = folder.data.id!

  // Create subdirectories
  await Promise.all([
    drive.files.create({
      requestBody: {
        name: 'videos',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId],
      },
    }),
    drive.files.create({
      requestBody: {
        name: 'thumbnails',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId],
      },
    }),
  ])

  return folderId
}

export async function readLibraryJson(
  accessToken: string,
  junpaDirId: string
): Promise<string | null> {
  const drive = createDriveClient(accessToken)

  const res = await drive.files.list({
    q: `name='${LIBRARY_FILE}' and '${junpaDirId}' in parents and trashed=false`,
    fields: 'files(id, name, modifiedTime)',
    spaces: 'drive',
  })

  if (!res.data.files || res.data.files.length === 0) {
    return null
  }

  const fileId = res.data.files[0].id!
  const content = await drive.files.get({
    fileId,
    alt: 'media',
  })

  return JSON.stringify(content.data)
}

export async function writeLibraryJson(
  accessToken: string,
  junpaDirId: string,
  content: string
): Promise<void> {
  const drive = createDriveClient(accessToken)

  const res = await drive.files.list({
    q: `name='${LIBRARY_FILE}' and '${junpaDirId}' in parents and trashed=false`,
    fields: 'files(id)',
    spaces: 'drive',
  })

  const media = {
    mimeType: 'application/json',
    body: content,
  }

  if (res.data.files && res.data.files.length > 0) {
    await drive.files.update({
      fileId: res.data.files[0].id!,
      media,
    })
  } else {
    await drive.files.create({
      requestBody: {
        name: LIBRARY_FILE,
        mimeType: 'application/json',
        parents: [junpaDirId],
      },
      media,
      fields: 'id',
    })
  }
}
