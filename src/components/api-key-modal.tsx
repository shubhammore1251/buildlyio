"use client";

import { use, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function ApiKeyModal({
  open,
  onOpenChange,
  mode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "DEMO" | "BYOK";
}) {
  const [key, setKey] = useState("");
  const trpc = useTRPC();
  const clerk = useClerk();
  const router = useRouter();
  const queryClient = useQueryClient();

  const saveKey = useMutation(
    trpc.apikeys.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("API key saved securely");
        queryClient.invalidateQueries(trpc.apikeys.getStatus.queryOptions());
        setKey("");
        onOpenChange(false);
      },
      onError: (error) => {
        console.log(error);
        toast.error(error?.message);

        if (error?.data?.code === "UNAUTHORIZED") {
          clerk.openSignIn();
        }

        if (error?.data?.code === "TOO_MANY_REQUESTS") {
          router.push("/pricing");
        }
      },
    })
  );

  //   const removeKey = trpc.apiKeys.remove.useMutation({
  //     onSuccess: () => {
  //       toast.success("API key removed");
  //       utils.apiKeys.getStatus.invalidate();
  //       onOpenChange(false);
  //     },
  //   });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>API Key Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {mode === "DEMO" ? (
            <p className="text-muted-foreground">
              You are currently using a shared demo API key. Responses may be
              limited or less accurate if the demo quota is reached.
              <br />
              <br />
              Add your own OpenAI API key to get unlimited and more reliable
              results.
            </p>
          ) : (
            <p className="text-muted-foreground">
              You are using your own OpenAI API key. All requests are sent
              directly using your key.
            </p>
          )}

          {mode === "DEMO" && (
            <>
              <Input
                type="password"
                placeholder="sk-..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />

              <Button
                className="w-full"
                disabled={saveKey.isPending || key.length < 20}
                onClick={() => saveKey.mutateAsync({ apiKey: key })}
              >
                Save API Key
              </Button>
            </>
          )}

          {mode === "BYOK" && (
            <Button
              variant="destructive"
              className="w-full"
              //   onClick={() => removeKey.mutate()}
            >
              Remove API Key
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
