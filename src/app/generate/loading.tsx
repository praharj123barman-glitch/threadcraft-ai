import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GenerateLoading() {
  return (
    <div className="max-w-4xl">
      <Skeleton className="h-8 w-64 mb-2" />
      <Skeleton className="h-4 w-96 mb-8" />
      <Card className="bg-gray-900 border-gray-800 p-8">
        <Skeleton className="h-5 w-32 mb-3" />
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-5 w-20 mb-3" />
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="flex gap-3 mb-6">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
        <Skeleton className="h-12 w-full" />
      </Card>
    </div>
  );
}
