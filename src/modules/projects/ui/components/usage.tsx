import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { formatDuration, intervalToDuration } from "date-fns";
import { CrownIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface UsageProps {
  points: number;
  msBeforeNext: number;
}

const Usage = ({ points, msBeforeNext }: UsageProps) => {
  const { has } = useAuth();
  const hasProPlan = has?.({ plan: "pro" });
  const resetTime = useMemo(() => {
    try {
      return formatDuration(
        intervalToDuration({
          start: new Date(),
          end: new Date(Date.now() + msBeforeNext),
        }),
        { format: ["months", "days", "hours"] }
      );
    } catch (error) {
      console.log("Error getting reset time", error);
      return "unkown";
    }
  }, [msBeforeNext]);

  return (
    <div className="rouned-t-xl bg-background border border-b-0 p-2.5">
      <div className="flex items-center gap-x-2">
        <div>
          <p className="text-sm">
            {points} {hasProPlan ? "credits" : "free credits"} remaining
          </p>
          <p>
            Resets in{" "}
            {resetTime}
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
