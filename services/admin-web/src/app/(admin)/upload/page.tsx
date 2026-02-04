import Link from 'next/link'
import { UploadDropzone } from '@/components/upload/upload-dropzone'
import { UploadProgress } from '@/components/upload/upload-progress'
import { GooglePhotosPicker } from '@/components/upload/google-photos-picker'

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upload Videos</h2>
          <p className="mt-1 text-sm text-gray-600">
            Upload video files from your computer or import from Google Photos.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Back to Library
        </Link>
      </div>

      <section aria-label="File upload">
        <UploadDropzone />
      </section>

      <section aria-label="Import options">
        <GooglePhotosPicker />
      </section>

      <section aria-label="Upload progress">
        <UploadProgress />
      </section>
    </div>
  )
}
