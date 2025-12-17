"use client";

import { Badge } from "@/components/ui/badge";

export function ApiKeyBadge({
  mode,
  onClick,
}: {
  mode: "DEMO" | "BYOK";
  onClick: () => void;
}) {
  return (
    <Badge
      onClick={onClick}
      className={`cursor-pointer ${mode === "BYOK" ? "bg-primary/80" : "bg-gray-400"} font-bold`}
      variant={"default"}
    >
      {mode === "BYOK" ? "BYOK Active" : "Demo Mode"}
    </Badge>
  );
}
