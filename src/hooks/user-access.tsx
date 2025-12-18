"use client";

import { useAuth } from "@clerk/nextjs";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useUserAccess() {
  const { has } = useAuth();
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.apikeys.getStatus.queryOptions());

  const isByok = data?.mode === "BYOK";
  const hasProPlan = !isByok && has?.({ plan: "pro" });

  return { isByok, hasProPlan, isLoading };
}