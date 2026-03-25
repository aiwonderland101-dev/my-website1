'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createContext, useContext, ReactNode } from 'react';

interface ProjectData {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  state?: Record<string, any>;
}

interface ProjectContextType {
  project: ProjectData | null;
  loading: boolean;
  error: string | null;
  saveProject: (state: Record<string, any>) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}

interface ProjectLoaderProps {
  projectId?: string;
}

export function ProjectLoader({ projectId }: ProjectLoaderProps) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(!!projectId);
  const [error, setError] = useState<string | null>(null);

  // Load project from Supabase when projectId is provided
  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const loadProject = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${projectId}`, {
          method: 'GET',
        });
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Project not found');
          }
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to load project');
        }

        const data = await res.json();
        setProject(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, router]);

  const saveProject = async (state: Record<string, any>) => {
    if (!projectId) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state }),
      });

      if (!res.ok) {
        throw new Error('Failed to save project');
      }

      const data = await res.json();
      setProject(prev => 
        prev ? { ...prev, ...data } : null
      );
    } catch (err: any) {
      console.error('Save failed:', err);
      throw err;
    }
  };

  if (error && projectId) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-500/50 rounded">
        <p className="text-red-200">Error: {error}</p>
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <ProjectContext.Provider 
      value={{ 
        project, 
        loading, 
        error,
        saveProject 
      }}
    >
      {/* This component just provides context, no visible UI */}
    </ProjectContext.Provider>
  );
}
