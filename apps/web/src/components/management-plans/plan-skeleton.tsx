import { Skeleton } from '@/components/ui/skeleton';

export function ManagementPlanSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  );
}



