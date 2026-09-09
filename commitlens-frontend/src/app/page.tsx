import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";

export const metadata: Metadata = {
  title: "CommitLens — Deep visibility into your Git history",
  description:
    "CommitLens helps you gain deep visibility into your Git history and conventional commits. Search commits, trace Jira keys, and analyse your repositories.",
};

export default function LandingPage() {
  return <HeroSection />;
}
