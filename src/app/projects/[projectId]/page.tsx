import { Skeleton } from "@/components/ui/skeleton";
import ProjectView from "@/modules/projects/ui/views/project-view";
import { caller, getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  const project = await caller.projects.getOne({
    id: projectId,
  });

  const title = project?.name ?? "Project";

  return {
    title,
    openGraph: {
      title,
    },
  };
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
  const { projectId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.messages.getMany.queryOptions({ projectId })
  );
  void queryClient.prefetchQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ErrorBoundary fallback={<p>Error loading project</p>}>
        <Suspense fallback={<ProjectViewSkeleton />}>
          <ProjectView projectId={projectId} />
        </Suspense>
      </ErrorBoundary>
    </HydrationBoundary>
  );
};

export default Page;
