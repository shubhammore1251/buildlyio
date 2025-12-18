"use client";
import { useCurrentTheme } from "@/hooks/use-current-theme";
import { useTRPC } from "@/trpc/client";
import { PricingTable } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const PricingPage = () => {
  const currentTheme = useCurrentTheme();
  const trpc = useTRPC();
  const router = useRouter();
  const { data } = useQuery(trpc.apikeys.getStatus.queryOptions());
  const isByok = data?.mode === "BYOK";

  if (isByok) {
    router.push("/");
  }
  return (
    <div className="flex flex-col max-w-3xl mx-auto w-full">
      <section className="space-y-6 pt-[16vh] 2xl:pt-48">
        <div className="flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="BuildlyIO"
            width={50}
            height={50}
            className="hidden md:block"
          />
        </div>
        <h1 className="text-xl md:text-3xl font-bold text-center">Pricing</h1>
        <p className="text-muted-foreground text-center text-sm md:text-base">
          Choose the plan that fits your needs
        </p>
        <PricingTable
          key={"free"}
          appearance={{
            baseTheme: currentTheme === "dark" ? dark : undefined,
            elements: {
              pricingTableCard: "border! shadow-none! rounded-lg!",
            },
          }}
        />
      </section>
    </div>
  );
};

export default PricingPage;
