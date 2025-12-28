import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { adminSecret, apiKey } = body;

  // console.log(adminSecret, process.env.ADMIN_SECRET, adminSecret === process.env.ADMIN_SECRET);

  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { success: false, message: "Invalid admin secret" },
      {
        status: 401,
      }
    );
  }

  if (!apiKey || apiKey.length < 20) {
    return NextResponse.json(
      { success: false, message: "Invalid API key" },
      {
        status: 401,
      }
    );
  }

  const encryptedKey = encrypt(apiKey);

  // deactivate previous admin keys
  const adminKeys = await prisma.apiKey.findFirst({
    where: {
      userId: null,
      scope: "DEMO",
    },
  });

  if (adminKeys) {
    await prisma.apiKey.update({
      where: {
        id: adminKeys.id,
      },
      data: {
        encrypted_key: encryptedKey,
      },
    });
  } else {
    await prisma.apiKey.create({
      data: {
        userId: null,
        provider: "OPENAI",
        scope: "DEMO",
        encrypted_key: encryptedKey,
        is_active: true,
      },
    });
  }

  // store new admin key

  return NextResponse.json({ success: true });
}
