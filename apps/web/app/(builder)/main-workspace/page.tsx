'use client'

import dynamic from 'next/dynamic';

const MainWorkspace = dynamic(
  () => import('@/components/engines/MainWorkspace').then((mod) => mod.default),
  { ssr: false },
);

export default function MainWorkspacePage() {
  return <MainWorkspace />;
}
