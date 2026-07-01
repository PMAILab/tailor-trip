import Skeleton from './ui/Skeleton';

/** Loading placeholder shaped like a Smart Destination Card. */
export default function SkeletonCard() {
  return (
    <article className="overflow-hidden rounded-xl border border-outline-variant bg-surface">
      <Skeleton className="h-64 w-full rounded-none" />
      <div className="p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="w-2/3">
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="w-1/4">
            <Skeleton className="mb-1 h-5 w-full" />
            <Skeleton className="ml-auto h-3 w-2/3" />
          </div>
        </div>
        <div className="mb-6 flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="border-t border-outline-variant pt-4">
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </article>
  );
}
