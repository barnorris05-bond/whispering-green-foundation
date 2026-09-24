export default function AdminLoading() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading">
      <div className="skeleton h-9 w-56" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton h-5 w-5" />
            <div className="skeleton h-9 w-20 mt-3" />
            <div className="skeleton h-3 w-24 mt-2" />
          </div>
        ))}
      </div>
      <div className="card p-6 space-y-3">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  );
}
