"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          success:
            "border-emerald-500! bg-emerald-50! text-emerald-700! dark:bg-emerald-950/40! dark:text-emerald-400!",
          error:
            "border-red-500! bg-red-50! text-red-700! dark:bg-red-950/40! dark:text-red-400!",
          warning:
            "border-amber-500! bg-amber-50! text-amber-700! dark:bg-amber-950/40! dark:text-amber-400!",
          info: "border-blue-500! bg-blue-50! text-blue-700! dark:bg-blue-950/40! dark:text-blue-400!",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
