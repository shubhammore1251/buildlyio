"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [value, setValue] = useState("");
  const trpc = useTRPC();

  const {data: messages} = useQuery(trpc.messages.getMany.queryOptions());
  // const parsedMessages = JSON.parse(messages || "[]");

  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        toast.success("Message created!");
      },
    })
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        disabled={createMessage.isPending}
        onClick={() =>
          createMessage.mutate({
            value: value,
          })
        }
      >
        Invoke background job
      </Button>

      {
        messages?.map((message:any, index:number) => (
          <div className="mt-4 mb-2" key={index}>
           {index + 1}. {message.content}
          </div>
        ))
      }
    </div>
  );
}
