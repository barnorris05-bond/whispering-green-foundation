import { LoadingScreen, HeadingSkeleton } from "@/components/skeletons";

export default function GalleryLoading() {
  return (
    <LoadingScreen label="Loading the gallery">
      <HeadingSkeleton wide />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[4/3] w-full rounded-2xl" />
        ))}
      </div>
    </LoadingScreen>
  );
}
