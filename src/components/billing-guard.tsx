"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function ByokBillingGuard() {
    const trpc = useTRPC();
  const { data } = useQuery(trpc.apikeys.getStatus.queryOptions());
  const isByok = data?.mode === "BYOK";

  if (!isByok) return null;

  return (
    <style jsx global>{`
      .cl-navbarButton__billing {
        display: none !important;
      }
    `}</style>
  );
}
