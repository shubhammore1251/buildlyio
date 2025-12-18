import { Skeleton } from "@/components/ui/skeleton";
import ProjectView from "@/modules/projects/ui/views/project-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import {ErrorBoundary} from "react-error-boundary";

interface Props {
  params: Promise<{ projectId: string }>;
}

const ProjectViewSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
      {/* Left: messages */}
      <div className="border-r p-4 flex flex-col gap-4">
        <Skeleton className="h-6 w-32" />

        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-14 w-3/4 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Right: code / preview */}
      <div className="p-4 flex flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    </div>
  );
};

const Page = async ({ params }: Props) => {
    const {projectId} = await params;

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({projectId}));
    void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({id: projectId}));

    return <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<p>Error loading project</p>}>
        <Suspense fallback={<ProjectViewSkeleton/>}>
          <ProjectView projectId={projectId} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>;
};

export default Page;