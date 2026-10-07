/**
 * Route-level loading placeholders.
 *
 * Deliberately plain server-rendered markup (no client JS) whose shapes mirror
 * the real sections, so the swap into loaded content doesn't shift the layout.
 * Every block is announced once via `role="status"` on the wrapper.
 */

export function LoadingScreen({ children, label = "Loading page" }: { children: React.ReactNode; label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label={label} className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-10">
      {children}
    </div>
  );
}

export function HeadingSkeleton({ wide }: { wide?: boolean }) {
  return (
    <div className="mb-10">
      <div className="skeleton h-6 w-28 rounded-full" />
      <div className={`skeleton h-10 mt-4 ${wide ? "w-80 sm:w-[26rem]" : "w-64"}`} />
      <div className="skeleton h-4 w-full max-w-xl mt-4" />
      <div className="skeleton h-4 w-2/3 max-w-md mt-2" />
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <div className="skeleton h-11 w-full sm:max-w-xs" />
      <div className="skeleton h-11 w-full sm:max-w-[12rem]" />
      <div className="skeleton h-11 w-24" />
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-6">
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton h-5 w-3/4 mt-4" />
          <div className="skeleton h-3 w-full mt-3" />
          <div className="skeleton h-3 w-5/6 mt-2" />
          <div className="skeleton h-3 w-1/2 mt-2" />
          <div className="skeleton h-3 w-24 mt-5" />
        </div>
      ))}
    </div>
  );
}

export function TimelineSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ol className="relative max-w-5xl mx-auto">
      <div aria-hidden className="timeline-rail absolute left-4 md:left-1/2 top-2 bottom-2 w-px md:-translate-x-1/2" />
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="relative pb-12 md:grid md:grid-cols-2 md:gap-16 last:pb-0">
          <span aria-hidden className="absolute left-[9px] md:left-1/2 md:-translate-x-1/2 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-sage-200" />
          <div className={`pl-11 md:pl-0 ${i % 2 === 1 ? "md:col-start-2 md:pl-6" : "md:col-start-1"}`}>
            <div className="card p-6 sm:p-7">
              <div className="skeleton h-6 w-40 rounded-full" />
              <div className="skeleton h-6 w-2/3 mt-4" />
              <div className="skeleton h-3 w-full mt-4" />
              <div className="skeleton h-3 w-5/6 mt-2" />
              <div className="skeleton h-20 w-full mt-5" />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-6">
          <div className="skeleton h-6 w-28 rounded-full" />
          <div className="skeleton h-5 w-full mt-4" />
          <div className="skeleton h-5 w-2/3 mt-2" />
          <div className="skeleton h-3 w-full mt-3" />
          <div className="skeleton h-3 w-4/5 mt-2" />
          <div className="skeleton h-3 w-32 mt-5" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="bg-sage-50/60 border-b border-sage-200 px-4 py-3 flex gap-6">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="skeleton h-3 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-sage-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-4 flex gap-6">
            {Array.from({ length: columns }).map((_, c) => (
              <div key={c} className={`skeleton h-3 flex-1 ${c === 0 ? "max-w-[7rem]" : ""}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Admin pages render inside the admin shell, so they skip the page container. */
export function AdminTableLoading({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-5" role="status" aria-live="polite" aria-busy="true" aria-label="Loading table">
      <div className="skeleton h-9 w-56" />
      <TableSkeleton rows={rows} columns={columns} />
    </div>
  );
}

/** Card-grid loading state for admin managers (content, gallery, projects, events). */
export function AdminListLoading({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-5" role="status" aria-live="polite" aria-busy="true" aria-label="Loading list">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="skeleton h-7 w-48" />
          <div className="skeleton h-4 w-72 mt-2" />
        </div>
        <div className="skeleton h-9 w-32 rounded-full" />
      </div>
      <div className="grid gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card p-5 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[14rem]">
              <div className="skeleton h-5 w-64" />
              <div className="skeleton h-3 w-40 mt-2" />
            </div>
            <div className="skeleton h-8 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <>
      <div className="skeleton h-4 w-40" />
      <div className="skeleton h-6 w-36 rounded-full mt-6" />
      <div className="skeleton h-10 w-full max-w-2xl mt-4" />
      <div className="skeleton h-4 w-64 mt-4" />
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 mt-10">
        <div className="card p-8">
          <div className="skeleton h-6 w-48" />
          <div className="skeleton h-3 w-full mt-5" />
          <div className="skeleton h-3 w-full mt-2" />
          <div className="skeleton h-3 w-5/6 mt-2" />
          <div className="skeleton h-3 w-2/3 mt-2" />
        </div>
        <div className="card p-7">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-4 w-full mt-5" />
          <div className="skeleton h-4 w-4/5 mt-3" />
          <div className="skeleton h-11 w-full mt-6" />
        </div>
      </div>
    </>
  );
}
