'use client'

import { useState } from 'react'

export function GooglePhotosPicker() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#4285F4" />
          <path d="M2 17l10 5 10-5" stroke="#34A853" strokeWidth="2" />
          <path d="M2 12l10 5 10-5" stroke="#FBBC05" strokeWidth="2" />
        </svg>
        Import from Google Photos
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Google Photos
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Close dialog"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-4 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                Google Photos integration will connect to your Google Photos
                library to import videos directly.
              </p>
            </div>

            <div className="mt-3 rounded-lg bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                This feature requires additional Google API setup including
                OAuth consent screen configuration and Photos Library API
                enablement.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50 cursor-not-allowed"
              >
                Connect Google Photos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
