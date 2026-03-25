"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { listProjects, Project } from "@lib/wonder-build/projects";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await listProjects();
        if (!cancelled) setProjects(data);
      } catch (err) {
        if (!cancelled) setError("Failed to load projects");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-8 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Open your workspaces or jump straight into Wonder-Build.
          </p>
        </div>
        <Link
          href="/wonderspace"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold hover:bg-emerald-500 transition-colors whitespace-nowrap"
        >
          💻 WonderSpace IDE
        </Link>
      </header>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="mb-4 inline-block">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-purple-500"></div>
            </div>
            <p className="text-sm text-muted-foreground">Loading your projects...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="min-h-[600px] flex items-center justify-center">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20">
                <span className="text-5xl">🌍</span>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create Your First World
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Start building amazing websites, games, and interactive experiences. Choose how you want to create.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/wonder-build"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 font-semibold text-white shadow-lg hover:shadow-xl transition-all h-auto"
              >
                <span>✨ Create Project</span>
              </Link>
              <Link
                href="/wonderspace"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-8 py-4 font-semibold text-white border border-slate-700 transition-colors h-auto"
              >
                <span>💻 Open WonderSpace IDE</span>
              </Link>
            </div>

            {/* Secondary Options */}
            <div className="grid sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-slate-800">
              <a
                href="/"
                className="group text-left p-4 rounded-lg hover:bg-slate-900/50 transition-colors"
              >
                <div className="text-2xl mb-2">🎨</div>
                <h3 className="font-semibold mb-1 group-hover:text-purple-400">Puck Editor</h3>
                <p className="text-sm text-muted-foreground">Drag-and-drop website builder</p>
              </a>
              <a
                href="/"
                className="group text-left p-4 rounded-lg hover:bg-slate-900/50 transition-colors"
              >
                <div className="text-2xl mb-2">🎮</div>
                <h3 className="font-semibold mb-1 group-hover:text-purple-400">PlayCanvas 3D</h3>
                <p className="text-sm text-muted-foreground">Create 3D games & scenes</p>
              </a>
              <a
                href="/"
                className="group text-left p-4 rounded-lg hover:bg-slate-900/50 transition-colors"
              >
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold mb-1 group-hover:text-purple-400">AI Builder</h3>
                <p className="text-sm text-muted-foreground">Type what you want, AI builds it</p>
              </a>
            </div>

            {/* Help Text */}
            <div className="text-sm text-muted-foreground space-y-2 pt-4">
              <p>Not sure where to start?</p>
              <div className="flex gap-2 justify-center text-purple-400">
                <a href="/" className="hover:underline">
                  View tutorials
                </a>
                <span>•</span>
                <a href="/" className="hover:underline">
                  Browse templates
                </a>
                <span>•</span>
                <a href="/" className="hover:underline">
                  Contact support
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-4 bg-white/5 shadow-sm flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">{project.name}</h2>
                <span className="text-xs text-slate-500">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <Link
                  href={`/unreal-wonder-build?projectId=${project.id}`}
                  className="px-3 py-2 rounded-md bg-purple-600 text-white text-sm"
                >
                  Open Builder
                </Link>
                <Link
                  href={`/workspace/wonderspace/${project.id}`}
                  className="px-3 py-2 rounded-md border text-sm"
                >
                  Open Workspace
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
