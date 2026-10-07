import { LoadingScreen, HeadingSkeleton, FilterBarSkeleton, ArticleGridSkeleton } from "@/components/skeletons";

export default function AwarenessLoading() {
  return (
    <LoadingScreen label="Loading the awareness portal">
      <HeadingSkeleton wide />
      <FilterBarSkeleton />
      <ArticleGridSkeleton count={6} />
    </LoadingScreen>
  );
}
