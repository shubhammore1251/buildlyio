import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
// import { Poppins } from "next/font/google"
import { Montserrat } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Buildly.io",
    template: "%s | Buildly.io",
  },
  description:
    "Turn prompts into clean frontend UI code with live previews and shareable deployments.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: {
      default: "Buildly.io",
      template: "%s | Buildly.io",
    },
    description:
      "Turn prompts into clean frontend UI code with live previews and shareable deployments.",
    url: baseUrl,
    siteName: "BuildlyIO",
    images: [
      {
        url: "/logo.png", // put in /public
        width: 1200,
        height: 630,
        alt: "BuildlyIO",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Buildly.io",
    description:
      "Turn prompts into clean frontend UI code with live previews and shareable deployments.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#7011e8",
        },
      }}
    >
      <html lang="en" className={montserrat.className} suppressHydrationWarning>
        <body>
          <TRPCReactProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster position="top-right" />
            </ThemeProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
