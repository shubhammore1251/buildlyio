import PricingPage from "@/components/pricing-page";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Pricing",
  openGraph: {
    title: "Pricing",
  }
};

export default function Page() {
  return <PricingPage />;
}