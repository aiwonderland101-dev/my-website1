export type HomepageSignLink = {
  label: string;
  href: string;
  description: string;
  requiresAuth?: boolean;
};

export const HOMEPAGE_SIGN_LINKS: HomepageSignLink[] = [
  { label: 'Features', href: '/features', description: 'Explore platform capabilities' },
  { label: 'Docs', href: '/docs', description: 'Read API and architecture docs' },
  { label: 'Tutorials', href: '/tutorials', description: 'Learn with guided walkthroughs' },
  { label: 'Community', href: '/community', description: 'Join builders and office hours' },
  { label: 'Support', href: '/support', description: 'Get product and account help' },
  { label: 'Status', href: '/status', description: 'Check current service health' },
  { label: 'Wonder Build', href: '/wonder-build', description: 'Create web products with AI', requiresAuth: true },
  { label: 'Unreal Build', href: '/unreal-wonder-build', description: 'Design game systems with AI', requiresAuth: true },
  { label: 'WonderSpace', href: '/wonderspace', description: 'Open the AI-powered IDE' },
];
