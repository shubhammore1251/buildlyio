import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import Link from "next/link";

interface UsageProps {
  points: number;
  msBeforeNext: number;
}

const Usage = ({ points, msBeforeNext }: UsageProps) => {
  const { has } = useAuth();
  const hasProPlan = has?.({ plan: "pro" });
  return (
    <div className="rouned-t-xl bg-background border border-b-0 p-2.5">
      <div className="flex items-center gap-x-2">
        <div>
          <p className="text-sm">
            {points} {hasProPlan ? "credits" : "free credits"} remaining
          </p>
          <p>
            Resets in{" "}
            {formatDuration(
              intervalToDuration({
                start: new Date(),
                end: new Date(Date.now() + msBeforeNext),
              }),
              { format: ["months", "days", "hours"] }
            )}
          </p>
        </div>
        {!hasProPlan && (
          <Button asChild variant="tertiary" size="sm" className="ml-auto">
            <Link href="/pricing">
              <CrownIcon /> Upgrade
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Usage;
