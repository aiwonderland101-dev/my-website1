import Link from 'next/link';
import { UnrealWonderBuildPage } from 'unreal-wonder-build';
import { Breadcrumbs } from '@/app/components/navigation/Breadcrumbs';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { AiScriptPanel } from './AiScriptPanel';

type RouteProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstQueryValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function UnrealWonderBuildRoutePage({ searchParams }: RouteProps) {
  const resolved  = (await searchParams) ?? {};
  const sceneId   = getFirstQueryValue(resolved.sceneId);
  const assetUrl  = getFirstQueryValue(resolved.assetUrl);
  const projectId = getFirstQueryValue(resolved.projectId);

  return (
    <div className="space-y-4 text-white">
      <PageHeader
        lead={<Breadcrumbs items={[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/wonder-build/ai-builder', label: 'AI Builder' },
          { label: 'Unreal + PlayCanvas' },
        ]} />}
        title="Unreal Wonder Build"
        subtitle="3D world editor powered by PlayCanvas. Use the AI Script Generator below to create entity scripts with Gemini 2.5."
        action={
          <div className="flex gap-2">
            <Link
              href="/wonder-build/ai-builder"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-semibold hover:bg-violet-500 transition-colors"
            >
              ✨ AI Builder
            </Link>
            <Link
              href="/wonder-build/playcanvas"
              className="inline-flex h-10 items-center rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-semibold hover:bg-white/15 transition-colors"
            >
              WonderPlay Bridge
            </Link>
          </div>
        }
      />

      <UnrealWonderBuildPage assetUrl={assetUrl} sceneId={sceneId} projectId={projectId} />

      {/* AI Script Generator — powered by Gemini 2.5 + agent pipeline */}
      <AiScriptPanel />
    </div>
  );
}
