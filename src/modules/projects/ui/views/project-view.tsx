"use client";
import React, { Suspense, useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import MessageContainer from "../components/message-container";
import { Fragment } from "@/lib/types";
import ProjectHeader from "../components/project-header";

interface Props {
  projectId: string;
}

const ProjectView = ({ projectId }: Props) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  //   const trpc = useTRPC();
  //   const { data: project } = useSuspenseQuery(
  //     trpc.projects.getOne.queryOptions({ id: projectId })
  //   );

  return (
    <div className="h-screen">
      <ResizablePanelGroup
        direction="horizontal"
        // className="max-w-md rounded-lg border md:min-w-[450px]"
      >
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <Suspense fallback={<div>Loading project...</div>}>
            <ProjectHeader projectId={projectId} />
          </Suspense>
          <Suspense fallback={<div>Loading messages...</div>}>
            <MessageContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
            />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} minSize={50}>
          <div className="flex h-[200px] items-center justify-center p-6">
            <span className="font-semibold">Projects</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ProjectView;
