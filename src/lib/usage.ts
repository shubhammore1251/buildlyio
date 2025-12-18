import { RateLimiterPrisma } from "rate-limiter-flexible";
import { prisma } from "./prisma";
import { auth } from "@clerk/nextjs/server";

const FREE_POINTS = 2;
const PRO_POINTS = 100;
const DURATION = 30 * 24 * 60 * 60; // 30 days in seconds
const GENERATION_COST = 1;

export async function getUsageTracker() {

  const { userId, has } = await auth();

  // 1️⃣ If user logged in, check BYOK
  if (userId) {
    const hasByok = await prisma.apiKey.findFirst({
      where: {
        userId,
        scope: "BYOK",
        is_active: true,
      },
      select: { id: true },
    });

    // 2️⃣ BYOK users → NO LIMITS
    if (hasByok) {
      return null; // 👈 important
    }
  }

  const hasProPlan = has({ plan: "pro" })

  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: "Usage",
    points: hasProPlan ? PRO_POINTS : FREE_POINTS,
    duration: DURATION, // 30 days
  });

  return usageTracker;
}

export async function consumeCredits() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker?.consume(userId, GENERATION_COST);
  return result;
}

export async function getUsageStatus() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker?.get(userId);
  return result;
}


export async function getUserAccess() {
  const { userId, has } = await auth();

  if (!userId) {
    return { isByok: false, hasProPlan: false };
  }

  const hasByok = await prisma.apiKey.findFirst({
    where: {
      userId,
      scope: "BYOK",
      is_active: true,
    },
    select: { id: true },
  });

  if (hasByok) {
    return {
      isByok: true,
      hasProPlan: false, // ignored when BYOK
    };
  }

  return {
    isByok: false,
    hasProPlan: has({ plan: "pro" }),
  };
}