import { encrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const apiKeysRouter = createTRPCRouter({
  // 🔹 GET STATUS (demo vs byok)
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const key = await prisma.apiKey.findFirst({
      where: {
        userId: ctx.auth.userId,
        scope: "BYOK",
        is_active: true,
      },
    });

    return {
      mode: key ? "BYOK" : "DEMO",
    } satisfies { mode: "DEMO" | "BYOK" };
  }),

  // 🔹 GET METADATA (NO KEY VALUE EVER)
  getOne: protectedProcedure.query(async ({ ctx }) => {
    const key = await prisma.apiKey.findFirst({
      where: {
        userId: ctx.auth.userId,
        is_active: true,
      },
      select: {
        id: true,
        provider: true,
        scope: true,
        createdAt: true,
      },
    });

    return key ?? null;
  }),

  // 🔹 CREATE (SAVE USER KEY)
  create: protectedProcedure
    .input(
      z.object({
        apiKey: z.string().min(50),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const encryptedKey = encrypt(input.apiKey);

      await prisma.apiKey.create({
        data: {
          userId: ctx.auth.userId,
          provider: "OPENAI",
          scope: "BYOK",
          encrypted_key: encryptedKey,
          is_active: true,
        },
      });

      return { success: true };
    }),

  // 🔹 UPDATE (ROTATE KEY)
  update: protectedProcedure
    .input(
      z.object({
        apiKey: z.string().min(255),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await prisma.apiKey.findFirst({
        where: {
          userId: ctx.auth.userId,
          scope: "BYOK",
          is_active: true,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No API key to update",
        });
      }

      await prisma.apiKey.update({
        where: { id: existing.id },
        data: {
          encrypted_key: encrypt(input.apiKey),
        },
      });

      return { success: true };
    }),

  // 🔹 REMOVE (FALLBACK TO DEMO)
  remove: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.apiKey.updateMany({
      where: {
        userId: ctx.auth.userId,
        scope: "BYOK",
      },
      data: { is_active: false },
    });

    return { success: true };
  }),
});
