import { LoadingScreen, HeadingSkeleton, TimelineSkeleton } from "@/components/skeletons";

export default function JourneyLoading() {
  return (
    <LoadingScreen label="Loading the foundation journey">
      <div className="mb-14">
        <div className="skeleton h-6 w-40 rounded-full mx-auto" />
        <div className="skeleton h-12 w-72 mx-auto mt-6" />
        <div className="skeleton h-5 w-full max-w-xl mx-auto mt-5" />
        <div className="skeleton h-4 w-2/3 max-w-lg mx-auto mt-3" />
      </div>
      <HeadingSkeleton wide />
      <TimelineSkeleton count={3} />
    </LoadingScreen>
  );
}
