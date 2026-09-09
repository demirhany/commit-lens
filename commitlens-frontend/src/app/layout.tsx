import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CommitLens",
    template: "%s · CommitLens",
  },
  description:
    "Gain deep visibility into your Git history and conventional commits.",
  keywords: ["git", "commits", "conventional commits", "jira", "github", "developer tools"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="h-full bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
