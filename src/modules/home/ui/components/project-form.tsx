"use client";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Form, FormField } from "@/components/ui/form";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  value: z.string().min(1, { message: "Value is required" }).max(10000, {
    message: "Value is too long",
  }),
});

export const ProjectForm = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isFocused, setIsFocused] = useState(false);
  const formState = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  });

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        formState.reset();
        queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
        router.push(`/projects/${data.id}`);
        // TODO: Invalidate usage status
      },
      onError: (error) => {
        // TODO: Redirect to pricing page if specific error
        console.log(error);
        toast.error(error?.message);
      },
    })
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createProject.mutateAsync({
      value: values.value,
    });
  };

  const isPending = createProject.isPending;
  const isButtonDisabled = isPending || !formState.formState.isValid;

  return (
    <Form {...formState}>
      <form
        onSubmit={formState.handleSubmit(onSubmit)}
        noValidate
        className={cn(
          "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
          isFocused && "shadow-xs",
        )}
      >
        <FormField
          control={formState.control}
          name="value"
          render={({ field }) => (
            <TextareaAutosize
              {...field}
              disabled={isPending}
              minRows={2}
              maxRows={8}
              className="pt-4 resize-none border-none w-full outline-none bg-transparent"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="What would you like to build?"
              onKeyDown={(e) => {
                // if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                //   e.preventDefault();
                //   formState.handleSubmit(onSubmit)(e);
                // }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  formState.handleSubmit(onSubmit)();
                }
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  formState.handleSubmit(onSubmit)();
                }
              }}
            />
          )}
        />
        <div className="flex gap-x-2 items-end justify-between pt-2">
          <div className="text-sm text-muted-foreground font-mono">
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-sm font-medium">
              <span>&#8984;</span>Enter
            </kbd>
            &nbsp; to submit
          </div>
          <Button
            disabled={isButtonDisabled}
            className={cn("size-8 rounded-full cursor-pointer")}
            type="submit"
          >
            {isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
