import type { Metadata } from "next";
import { SpecificationsView } from "@/components/specifications/SpecificationsView";

export const metadata: Metadata = { title: "Specifications" };

export default function SpecificationsPage() {
  return <SpecificationsView />;
}
