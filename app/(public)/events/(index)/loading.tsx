import { LoadingScreen, HeadingSkeleton, CardGridSkeleton } from "@/components/skeletons";

export default function EventsLoading() {
  return (
    <LoadingScreen label="Loading events">
      <HeadingSkeleton wide />
      <div className="flex gap-2 mb-8">
        <div className="skeleton h-9 w-24 rounded-full" />
        <div className="skeleton h-9 w-20 rounded-full" />
      </div>
      <CardGridSkeleton count={6} />
    </LoadingScreen>
  );
}
