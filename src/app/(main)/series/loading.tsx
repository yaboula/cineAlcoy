import CardSkeletonRow from "@/components/catalog/CardSkeletonRow";
export default function SeriesLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-12 space-y-16">
        <div className="h-10 w-24 bg-surface animate-pulse rounded" />
        <CardSkeletonRow />
        <CardSkeletonRow />
        <CardSkeletonRow />
      </div>
    </div>
  );
}
