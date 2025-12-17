"use client";
import { ApiKeyBadge } from "@/components/api-key-badge";
import { ApiKeyModal } from "@/components/api-key-modal";
import { Button } from "@/components/ui/button";
import UserControl from "@/components/user-control";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const Navbar = () => {
  const trpc = useTRPC();
  const isScrolled = useScroll(20);
  const { data } = useQuery(trpc.apikeys.getStatus.queryOptions());
  const [open, setOpen] = useState(false);

  const mode = data?.mode ?? "DEMO";

  return (
    <nav
      className={cn(
        "p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent",
        isScrolled && "bg-background border-border"
      )}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="BuildlyIO" width={24} height={24} />
          <span className="text-lg font-semibold">Buildly.io</span>
        </Link>
        <SignedOut>
          <div className="flex gap-2">
            <SignUpButton>
              <Button variant="outline" size="sm">
                Sign Up
              </Button>
            </SignUpButton>

            <SignInButton>
              <Button size="sm">Sign In</Button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <ApiKeyBadge mode={mode} onClick={() => setOpen(true)} />

          <UserControl showName />
        </SignedIn>
      </div>

      {open && <ApiKeyModal open={open} onOpenChange={setOpen} mode={mode} />}
    </nav>
  );
};

export default Navbar;
