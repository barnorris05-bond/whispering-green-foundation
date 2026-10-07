import { LoadingScreen, HeadingSkeleton, FilterBarSkeleton, CardGridSkeleton } from "@/components/skeletons";

export default function InitiativesLoading() {
  return (
    <LoadingScreen label="Loading initiatives">
      <HeadingSkeleton wide />
      <FilterBarSkeleton />
      <CardGridSkeleton count={6} />
    </LoadingScreen>
  );
}
