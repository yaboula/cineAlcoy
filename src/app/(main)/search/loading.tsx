import CardSkeleton from "@/components/ui/CardSkeleton";
export default function SearchLoading() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-12">
        <div className="h-8 w-24 bg-surface animate-pulse rounded mb-6" />
        <div className="h-14 bg-surface animate-pulse rounded-xl mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}
