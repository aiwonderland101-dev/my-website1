import Link from 'next/link';
import { PlayCanvasEngine } from 'unreal-wonder-build';
import { Breadcrumbs } from '@/app/components/navigation/Breadcrumbs';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { AiScriptPanel } from './AiScriptPanel';
import { ProjectLoader } from './ProjectLoader';

type RouteProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstQueryValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function UnrealWonderBuildRoutePage({ searchParams }: RouteProps) {
  const resolved  = (await searchParams) ?? {};
  const projectId = getFirstQueryValue(resolved.projectId);
  const sceneId   = getFirstQueryValue(resolved.sceneId);
  const assetUrl  = getFirstQueryValue(resolved.assetUrl);

  return (
    <div className="flex flex-col bg-black text-white min-h-screen">
      <PageHeader
        lead={<Breadcrumbs items={[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/dashboard/projects', label: 'Projects' },
          { label: projectId ? 'Builder' : 'New Builder' },
        ]} />}
        title="3D Builder"
        subtitle="Edit your 3D project. AI-powered scripting with Gemini 2.5."
        action={
          <div className="flex gap-2">
            <Link
              href="/dashboard/projects"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-700 px-4 text-sm font-semibold hover:bg-slate-600 transition-colors"
            >
              ← Back to Projects
            </Link>
          </div>
        }
      />

      {/* PROJECT LOADER — Initializes project context */}
      <ProjectLoader projectId={projectId} />

      {/* AI SCRIPT GENERATOR UI — Powered by Gemini 2.5 */}
      <div className="px-4 py-2 border-t border-white/10">
        <AiScriptPanel />
      </div>

      {/* EDITOR + ENGINE — Merged & Working Together */}
      <div className="flex-1 w-full flex flex-col">
        <PlayCanvasEngine 
          projectId={projectId}
          sceneId={sceneId} 
          assetUrl={assetUrl} 
        />
      </div>
    </div>
  );
}
