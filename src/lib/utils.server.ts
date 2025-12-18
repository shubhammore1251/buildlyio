import "server-only";
import { prisma } from "@/lib/prisma";
import { decrypt } from "./crypto";


export async function resolveApiKey(userId?: string) {
  if (userId) {
    const userKey = await prisma.apiKey.findFirst({
      where: {
        userId,
        scope: "BYOK",
        is_active: true,
      },
    });

    if (userKey) {
      return {
        provider: userKey.provider,
        apiKey: decrypt(userKey.encrypted_key),
      };
    }
  }

  const adminKey = await prisma.apiKey.findFirst({
    where: {
      userId: null,
      scope: "DEMO",
      is_active: true,
    },
  });

  if (!adminKey) {
    throw new Error("Admin API key missing");
  }

  return {
    provider: adminKey.provider,
    apiKey: decrypt(adminKey.encrypted_key),
  };
}