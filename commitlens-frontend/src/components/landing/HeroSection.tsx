"use client";

import Link from "next/link";
import { GitCommitHorizontal, ArrowRight, Zap, GitBranch, Search } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[300px] w-[400px] rounded-full bg-violet-500/10 blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo mark */}
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-2xl ring-1 ring-zinc-700/50 backdrop-blur-md">
          <GitCommitHorizontal size={30} className="text-indigo-400" />
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1 text-xs text-zinc-400 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Git Analysis · Conventional Commits · Jira Integration
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h1 className="bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-500 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
            CommitLens
          </h1>
          <p className="max-w-lg text-base text-zinc-400 leading-relaxed">
            Gain deep visibility into your Git history and conventional commits.
            Explore repositories, search semantic commits, and trace Jira keys — all in one place.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/workspace"
            className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/30 hover:scale-[1.02]"
          >
            Open App
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
          <a
            href="https://www.conventionalcommits.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Learn about Conventional Commits →
          </a>
        </div>

        {/* Feature pills */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {[
            { icon: <Search size={12} />, label: "Semantic commit search" },
            { icon: <GitBranch size={12} />, label: "Branch & repo insights" },
            { icon: <Zap size={12} />, label: "Instant Jira key detection" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 backdrop-blur-md"
            >
              <span className="text-indigo-400">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
    </div>
  );
}
