import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/wonder-build/ai/unified-suggestions
 * Get AI block suggestions with context awareness
 * Integrates with Shadon UI components and Puck blocks
 */

const BLOCK_LIBRARY = {
  hero: {
    name: 'Hero Section',
    icon: '🎯',
    description: 'Full-width hero section with headline and CTA',
    keywords: ['hero', 'welcome', 'intro', 'banner', 'headline'],
    shadonDeps: ['Button', 'Badge'],
  },
  contact: {
    name: 'Contact Form',
    icon: '📧',
    description: 'Email contact form with validation',
    keywords: ['contact', 'form', 'email', 'message', 'inquiry'],
    shadonDeps: ['Button', 'Card', 'Alert'],
  },
  grid: {
    name: 'Feature Grid',
    icon: '⚡',
    description: '3-column feature showcase',
    keywords: ['features', 'grid', 'showcase', 'benefits', 'advantages'],
    shadonDeps: ['Card', 'Badge'],
  },
  pricing: {
    name: 'Pricing Table',
    icon: '💰',
    description: 'Pricing plans comparison',
    keywords: ['pricing', 'plans', 'cost', 'subscription', 'packages'],
    shadonDeps: ['Card', 'Button', 'Badge'],
  },
  testimonial: {
    name: 'Testimonials',
    icon: '⭐',
    description: 'Customer testimonials carousel',
    keywords: ['testimonial', 'review', 'quote', 'feedback', 'social proof'],
    shadonDeps: ['Card', 'Badge'],
  },
  cta: {
    name: 'Call-to-Action',
    icon: '🚀',
    description: 'Bold CTA section with button',
    keywords: [
      'call to action',
      'cta',
      'subscribe',
      'signup',
      'join',
      'register',
    ],
    shadonDeps: ['Button', 'Alert'],
  },
  faq: {
    name: 'FAQ Section',
    icon: '❓',
    description: 'Accordion-style FAQ section',
    keywords: ['faq', 'questions', 'answers', 'help', 'support'],
    shadonDeps: ['Card', 'Alert'],
  },
  navbar: {
    name: 'Navigation Bar',
    icon: '🔗',
    description: 'Responsive navigation menu',
    keywords: ['nav', 'navigation', 'menu', 'header', 'links'],
    shadonDeps: ['Button', 'Badge'],
  },
  footer: {
    name: 'Footer',
    icon: '🦶',
    description: 'Multi-column footer with links',
    keywords: ['footer', 'bottom', 'copyright', 'links', 'social'],
    shadonDeps: ['Badge', 'Card'],
  },
  gallery: {
    name: 'Image Gallery',
    icon: '🖼️',
    description: 'Grid gallery with lightbox',
    keywords: ['gallery', 'images', 'portfolio', 'showcase', 'photos'],
    shadonDeps: ['Card', 'Badge'],
  },
  testimonialCarousel: {
    name: 'Testimonial Carousel',
    icon: '🎠',
    description: 'Rotating testimonials',
    keywords: ['carousel', 'slide', 'testimonial', 'rotate', 'autoplay'],
    shadonDeps: ['Card', 'Badge', 'Button'],
  },
  aiChat: {
    name: 'AI Chat Widget',
    icon: '🤖',
    description: 'Embedded AI chat assistant',
    keywords: ['ai', 'chat', 'bot', 'assistant', 'conversation'],
    shadonDeps: ['Card', 'Button', 'Alert'],
  },
};

interface PageContext {
  currentBlocks?: Array<{ type: string; id: string }>;
  pageTitle?: string;
  totalBlocks?: number;
}

interface SuggestionRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: PageContext;
}

/**
 * Score relevance of a block to user intent
 */
function scoreBlockRelevance(
  blockKey: string,
  blockData: any,
  userPrompt: string
): number {
  let score = 0;
  const promptLower = userPrompt.toLowerCase();

  // Keyword matching (strongest signal)
  for (const keyword of blockData.keywords || []) {
    if (promptLower.includes(keyword)) {
      score += 100;
    } else if (promptLower.includes(keyword.substring(0, 3))) {
      score += 50; // Partial match
    }
  }

  // Semantic patterns
  if (
    promptLower.includes('for') &&
    blockKey === 'cta' &&
    promptLower.includes('users')
  ) {
    score += 75;
  }
  if (promptLower.includes('build') && blockKey === 'grid') {
    score += 50;
  }
  if (promptLower.includes('collect') && blockKey === 'contact') {
    score += 75;
  }

  return score;
}

/**
 * Analyze user prompt and extract intent
 */
function analyzePrompt(prompt: string): {
  intent: string;
  entities: string[];
  shouldAddNav: boolean;
  shouldAddFooter: boolean;
} {
  const promptLower = prompt.toLowerCase();

  return {
    intent: promptLower.includes('landing')
      ? 'landing'
      : promptLower.includes('product')
        ? 'product'
        : promptLower.includes('blog')
          ? 'blog'
          : 'general',
    entities: [],
    shouldAddNav:
      !promptLower.includes('no nav') &&
      !promptLower.includes('without nav') &&
      !promptLower.includes('just') &&
      !promptLower.includes('single'),
    shouldAddFooter:
      !promptLower.includes('no footer') && !promptLower.includes('simple'),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: SuggestionRequest = await req.json();

    const userMessage = body.messages[body.messages.length - 1]?.content || '';
    const context = body.context || {};
    const currentBlockTypes = new Set(
      context.currentBlocks?.map((b) => b.type) || []
    );

    // Analyze user intent
    const analysis = analyzePrompt(userMessage);

    // Score all blocks
    const scored = Object.entries(BLOCK_LIBRARY).map(([key, blockData]) => ({
      key,
      ...blockData,
      score: scoreBlockRelevance(key, blockData, userMessage),
      alreadyPresent: currentBlockTypes.has(key),
    }));

    // Sort by relevance and deduplicate
    let suggestions = scored
      .filter((b) => b.score > 0 && !b.alreadyPresent)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 suggestions

    // Add nav/footer if appropriate
    if (analysis.shouldAddNav && !currentBlockTypes.has('navbar')) {
      suggestions = [
        {
          ...BLOCK_LIBRARY['navbar' as keyof typeof BLOCK_LIBRARY],
          key: 'navbar',
          score: 80,
          alreadyPresent: false,
        },
        ...suggestions,
      ];
    }

    if (analysis.shouldAddFooter && !currentBlockTypes.has('footer')) {
      suggestions = [
        ...suggestions,
        {
          ...BLOCK_LIBRARY['footer' as keyof typeof BLOCK_LIBRARY],
          key: 'footer',
          score: 75,
          alreadyPresent: false,
        },
      ];
    }

    // Format response
    const formattedSuggestions = suggestions.map((block) => ({
      id: block.key,
      blockId: block.key,
      name: block.name,
      description: block.description,
      icon: block.icon,
      reason: `Suggested for: ${userMessage.slice(0, 40)}...`,
      shadonComponents: block.shadonDeps || [],
      props: {
        // Example props based on block type
        ...(block.key === 'hero' && {
          headline: 'Your Headline Here',
          subheading: 'Compelling subheading',
          ctaText: 'Get Started',
        }),
        ...(block.key === 'contact' && {
          title: 'Get in Touch',
          placeholder: 'Your message...',
        }),
        ...(block.key === 'grid' && {
          columns: 3,
          items: [],
        }),
      },
    }));

    return NextResponse.json({
      success: true,
      suggestions: formattedSuggestions,
      analysis: {
        intent: analysis.intent,
        totalBlocksSuggested: formattedSuggestions.length,
        currentBlockCount: context.totalBlocks || 0,
      },
      context: {
        pageTitle: context.pageTitle || 'Untitled Page',
      },
    });
  } catch (error) {
    console.error('AI suggestions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate suggestions',
        suggestions: [],
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wonder-build/ai/unified-suggestions/blocks
 * Get all available blocks with Shadon integration info
 */
export async function GET(req: NextRequest) {
  try {
    const blocks = Object.entries(BLOCK_LIBRARY).map(([key, data]) => ({
      id: key,
      ...data,
      shadonComponents: data.shadonDeps,
    }));

    return NextResponse.json({
      success: true,
      blocks,
      totalBlocks: blocks.length,
    });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blocks' },
      { status: 500 }
    );
  }
}
