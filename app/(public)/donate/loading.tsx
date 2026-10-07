import { LoadingScreen } from "@/components/skeletons";

export default function DonateLoading() {
  return (
    <LoadingScreen label="Loading donation information">
      {/* hero */}
      <div className="mb-14 text-center">
        <div className="skeleton h-6 w-40 rounded-full mx-auto" />
        <div className="skeleton h-12 w-72 max-w-full mx-auto mt-6" />
        <div className="skeleton h-5 w-full max-w-xl mx-auto mt-5" />
        <div className="skeleton h-12 w-64 mx-auto mt-8 rounded-full" />
      </div>

      {/* bank details card */}
      <div className="max-w-3xl mx-auto card p-8">
        <div className="skeleton h-4 w-28" />
        <div className="skeleton h-5 w-full mt-5" />
        <div className="skeleton h-5 w-2/3 mt-3" />
        <div className="skeleton h-14 w-full mt-6" />
        <div className="skeleton h-14 w-full mt-4" />
        <div className="skeleton h-14 w-full mt-4" />
      </div>

      {/* steps */}
      <div className="max-w-3xl mx-auto mt-14 space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="skeleton w-8 h-8 rounded-full shrink-0" />
            <div className="flex-1">
              <div className="skeleton h-4 w-44" />
              <div className="skeleton h-3 w-full mt-2" />
              <div className="skeleton h-3 w-5/6 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </LoadingScreen>
  );
}
