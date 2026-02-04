import Link from 'next/link'
import { SeriesForm } from '@/components/series/series-form'

export default function NewSeriesPage() {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Breadcrumb navigation */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/series"
              className="transition-colors hover:text-foreground"
            >
              Series
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-foreground">New Series</li>
        </ol>
      </nav>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Create New Series
        </h2>
        <SeriesForm mode="create" />
      </div>
    </div>
  )
}
