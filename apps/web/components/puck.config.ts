/**
 * Puck Configuration with Shadon Integration
 * 
 * This config defines all available blocks for the Unified Puck + Shadon + AI builder.
 * Blocks are composed using Shadon UI components and can be suggested by the AI assistant.
 * 
 * Import in UnifiedPuckAIBuilder: import puckConfig from './puck.config';
 */

import { Config, h } from '@puckeditor/core';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface PuckBlockProps {
  [key: string]: any;
}

/**
 * Hero Block - Welcoming section with headline and CTA
 */
const HeroBlock = ({ title = 'Welcome', subtitle = '', cta = 'Get Started', hideNavbar = false }: PuckBlockProps) => {
  return h(
    'div',
    {
      style: {
        padding: '60px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '8px',
        marginBottom: '20px',
      },
    },
    h('h1', { style: { fontSize: '48px', margin: '0 0 16px 0', fontWeight: 'bold' } }, title),
    subtitle && h('p', { style: { fontSize: '18px', margin: '0 0 24px 0', opacity: 0.9 } }, subtitle),
    h(Button, { style: { marginTop: '16px' } }, cta)
  );
};

/**
 * Contact Block - Form for collecting user inquiries
 */
const ContactBlock = ({ formTitle = 'Get In Touch', buttonText = 'Send Message': PuckBlockProps) => {
  return h(
    Card,
    { style: { marginBottom: '20px' } },
    h(CardHeader, {},
      h(CardTitle, {}, formTitle)
    ),
    h(CardContent, {},
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        h('input', { placeholder: 'Name', style: { padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' } }),
        h('input', { placeholder: 'Email', type: 'email', style: { padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' } }),
        h('textarea', { placeholder: 'Message', rows: 4, style: { padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' } }),
        h(Button, {}, buttonText)
      )
    )
  );
};

/**
 * Feature Grid Block - Showcase 3+ features in a grid
 */
const GridBlock = ({ title = 'Features', features = ['Feature 1', 'Feature 2', 'Feature 3'] }: PuckBlockProps) => {
  return h(
    'div',
    { style: { marginBottom: '20px' } },
    h('h2', { style: { fontSize: '32px', marginBottom: '24px', fontWeight: 'bold' } }, title),
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        },
      },
      ...(Array.isArray(features) ? features : []).map((feature: string, i: number) =>
        h(
          Card,
          { key: i, style: { padding: '24px' } },
          h(CardTitle, {}, feature),
          h(CardDescription, {}, 'Feature description goes here')
        )
      )
    )
  );
};

/**
 * Pricing Block - Pricing table with multiple plans
 */
const PricingBlock = ({ title = 'Pricing', pricingTiers = ['Starter', 'Pro', 'Enterprise'] }: PuckBlockProps) => {
  return h(
    'div',
    { style: { marginBottom: '20px' } },
    h('h2', { style: { fontSize: '32px', marginBottom: '24px', textAlign: 'center', fontWeight: 'bold' } }, title),
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        },
      },
      ...(Array.isArray(pricingTiers) ? pricingTiers : []).map((tier: string, i: number) =>
        h(
          Card,
          { key: i, style: { padding: '24px', textAlign: 'center' } },
          h(CardTitle, {}, tier),
          h('p', { style: { fontSize: '24px', fontWeight: 'bold', margin: '16px 0' } }, `$${(i + 1) * 29}/mo`),
          h(Button, { style: { marginTop: '16px' } }, 'Choose Plan')
        )
      )
    )
  );
};

/**
 * Testimonial Block - Single customer testimonial with attribution
 */
const TestimonialBlock = ({ quote = 'Great product!', author = 'John Doe', title = 'CEO' }: PuckBlockProps) => {
  return h(
    Alert,
    { style: { marginBottom: '20px', borderLeft: '4px solid #667eea' } },
    h('blockquote', { style: { fontSize: '18px', fontStyle: 'italic', margin: '0 0 12px 0' } }, `"${quote}"`),
    h('p', { style: { margin: '0', fontWeight: 'bold' } }, author),
    h('p', { style: { margin: '4px 0 0 0', fontSize: '14px', opacity: 0.7 } }, title)
  );
};

/**
 * CTA Block - Standalone call-to-action section
 */
const CTABlock = ({ headline = 'Ready to get started?', buttonText = 'Start Free Trial' }: PuckBlockProps) => {
  return h(
    'div',
    {
      style: {
        padding: '40px 20px',
        background: '#f0f4ff',
        textAlign: 'center',
        borderRadius: '8px',
        marginBottom: '20px',
      },
    },
    h('h2', { style: { fontSize: '28px', margin: '0 0 16px 0' } }, headline),
    h(Button, { style: { marginTop: '12px' } }, buttonText)
  );
};

/**
 * FAQ Block - Frequently asked questions section
 */
const FAQBlock = ({ title = 'Frequently Asked Questions', faqs = [] }: PuckBlockProps) => {
  return h(
    'div',
    { style: { marginBottom: '20px' } },
    h('h2', { style: { fontSize: '32px', marginBottom: '24px', fontWeight: 'bold' } }, title),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
      ...(Array.isArray(faqs) && faqs.length > 0
        ? faqs.map((faq: any, i: number) =>
            h(
              Card,
              { key: i, style: { padding: '16px' } },
              h(CardTitle, { style: { fontSize: '16px' } }, faq.question || `Q${i + 1}`),
              h(CardDescription, {}, faq.answer || 'Answer goes here')
            )
          )
        : [
            h(Card, { style: { padding: '16px' } },
              h(CardTitle, { style: { fontSize: '16px' } }, 'What is this product?'),
              h(CardDescription, {}, 'This is an example FAQ entry.')
            ),
          ])
    )
  );
};

/**
 * Navigation Block - Navbar component
 */
const NavbarBlock = ({ links = ['Home', 'About', 'Contact'], brandName = 'Brand' }: PuckBlockProps) => {
  return h(
    'div',
    {
      style: {
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '20px',
      },
    },
    h('h1', { style: { fontSize: '20px', fontWeight: 'bold', margin: 0 } }, brandName),
    h(
      'div',
      {
        style: {
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        },
      },
      ...(Array.isArray(links) ? links : []).map((link: string, i: number) =>
        h(Button, { key: i, variant: 'ghost' }, link)
      )
    )
  );
};

/**
 * Footer Block - Footer section with links and copyright
 */
const FooterBlock = ({ brandName = 'Brand', copyright = '© 2024. All rights reserved.', links = ['Privacy', 'Terms', 'Contact'] }: PuckBlockProps) => {
  return h(
    'div',
    {
      style: {
        padding: '32px 20px',
        backgroundColor: '#f3f4f6',
        textAlign: 'center',
        marginTop: '40px',
      },
    },
    h(
      'div',
      { style: { marginBottom: '16px', display: 'flex', justifyContent: 'center', gap: '16px' } },
      ...(Array.isArray(links) ? links : []).map((link: string, i: number) =>
        h(Button, { key: i, variant: 'ghost', size: 'sm' }, link)
      )
    ),
    h('p', { style: { margin: '0', fontSize: '14px', color: '#6b7280' } }, copyright)
  );
};

/**
 * Gallery Block - Image gallery showcase
 */
const GalleryBlock = ({ title = 'Gallery', imageCount = 6 }: PuckBlockProps) => {
  return h(
    'div',
    { style: { marginBottom: '20px' } },
    h('h2', { style: { fontSize: '32px', marginBottom: '24px', fontWeight: 'bold' } }, title),
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        },
      },
      ...Array.from({ length: imageCount }).map((_, i) =>
        h('div', {
          key: i,
          style: {
            background: '#e5e7eb',
            aspectRatio: '1',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
          },
        }, '🖼️')
      )
    )
  );
};

/**
 * Testimonial Carousel Block - Multiple testimonials
 */
const TestimonialCarouselBlock = ({ title = 'Customer Feedback' }: PuckBlockProps) => {
  return h(
    'div',
    { style: { marginBottom: '20px' } },
    h('h2', { style: { fontSize: '32px', marginBottom: '24px', textAlign: 'center', fontWeight: 'bold' } }, title),
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        },
      },
      h(
        Card,
        { style: { padding: '24px' } },
        h('p', { style: { fontSize: '14px', fontStyle: 'italic', margin: '0 0 12px 0' } }, '"Excellent service!"'),
        h(Badge, {}, 'Customer 1')
      ),
      h(
        Card,
        { style: { padding: '24px' } },
        h('p', { style: { fontSize: '14px', fontStyle: 'italic', margin: '0 0 12px 0' } }, '"Highly recommended!"'),
        h(Badge, {}, 'Customer 2')
      ),
      h(
        Card,
        { style: { padding: '24px' } },
        h('p', { style: { fontSize: '14px', fontStyle: 'italic', margin: '0 0 12px 0' } }, '"Best in class!"'),
        h(Badge, {}, 'Customer 3')
      )
    )
  );
};

/**
 * AI Chat Block - Embedded AI assistant widget
 */
const AIChatBlock = ({ title = 'Ask our AI Assistant' }: PuckBlockProps) => {
  return h(
    Card,
    { style: { marginBottom: '20px', padding: '24px' } },
    h(CardTitle, {}, title),
    h(CardContent, { style: { marginTop: '16px' } },
      h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          minHeight: '200px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          padding: '12px',
          backgroundColor: '#f9fafb',
        },
      },
        h('p', { style: { fontSize: '12px', color: '#6b7280' } }, 'Chat widget placeholder – AI assistant integration here'),
        h('div', { style: { flex: 1 } }),
        h('input', {
          placeholder: 'Type your question...',
          style: {
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            marginTop: '8px',
          },
        })
      )
    )
  );
};

/**
 * Puck Configuration
 * Defines all available blocks, components, and editor behavior
 */
const puckConfig: Config = {
  components: {
    // Core blocks
    hero: {
      label: 'Hero Section',
      fields: {
        title: { type: 'text', label: 'Title' },
        subtitle: { type: 'text', label: 'Subtitle' },
        cta: { type: 'text', label: 'CTA Button Text' },
      },
      defaultProps: {
        title: 'Welcome to Your Site',
        subtitle: 'Build amazing pages with Puck + Shadon + AI',
        cta: 'Get Started',
      },
      render: HeroBlock,
    },

    contact: {
      label: 'Contact Form',
      fields: {
        formTitle: { type: 'text', label: 'Form Title' },
        buttonText: { type: 'text', label: 'Submit Button Text' },
      },
      defaultProps: {
        formTitle: 'Get In Touch',
        buttonText: 'Send Message',
      },
      render: ContactBlock,
    },

    grid: {
      label: 'Feature Grid',
      fields: {
        title: { type: 'text', label: 'Section Title' },
        features: {
          type: 'array',
          label: 'Features',
          arrayType: {
            type: 'object',
            fields: {
              name: { type: 'text' },
            },
          },
        },
      },
      defaultProps: {
        title: 'Our Features',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
      },
      render: GridBlock,
    },

    pricing: {
      label: 'Pricing Table',
      fields: {
        title: { type: 'text', label: 'Section Title' },
        pricingTiers: {
          type: 'array',
          label: 'Pricing Tiers',
          arrayType: {
            type: 'object',
            fields: {
              name: { type: 'text' },
              price: { type: 'number' },
            },
          },
        },
      },
      defaultProps: {
        title: 'Our Pricing',
        pricingTiers: ['Starter', 'Pro', 'Enterprise'],
      },
      render: PricingBlock,
    },

    testimonial: {
      label: 'Testimonial',
      fields: {
        quote: { type: 'text', label: 'Quote' },
        author: { type: 'text', label: 'Author Name' },
        title: { type: 'text', label: 'Author Title' },
      },
      defaultProps: {
        quote: 'This product changed my business!',
        author: 'Jane Smith',
        title: 'Founder & CEO',
      },
      render: TestimonialBlock,
    },

    cta: {
      label: 'Call to Action',
      fields: {
        headline: { type: 'text', label: 'Headline' },
        buttonText: { type: 'text', label: 'Button Text' },
      },
      defaultProps: {
        headline: 'Ready to get started?',
        buttonText: 'Start Free Trial',
      },
      render: CTABlock,
    },

    faq: {
      label: 'FAQ Section',
      fields: {
        title: { type: 'text', label: 'Section Title' },
        faqs: {
          type: 'array',
          label: 'FAQ Items',
          arrayType: {
            type: 'object',
            fields: {
              question: { type: 'text' },
              answer: { type: 'text' },
            },
          },
        },
      },
      defaultProps: {
        title: 'Frequently Asked Questions',
        faqs: [],
      },
      render: FAQBlock,
    },

    navbar: {
      label: 'Navigation Bar',
      fields: {
        brandName: { type: 'text', label: 'Brand Name' },
        links: {
          type: 'array',
          label: 'Navigation Links',
          arrayType: { type: 'text' },
        },
      },
      defaultProps: {
        brandName: 'My Brand',
        links: ['Home', 'About', 'Services', 'Contact'],
      },
      render: NavbarBlock,
    },

    footer: {
      label: 'Footer',
      fields: {
        brandName: { type: 'text', label: 'Brand Name' },
        copyright: { type: 'text', label: 'Copyright Text' },
        links: {
          type: 'array',
          label: 'Footer Links',
          arrayType: { type: 'text' },
        },
      },
      defaultProps: {
        brandName: 'My Brand',
        copyright: '© 2024. All rights reserved.',
        links: ['Privacy', 'Terms', 'Contact'],
      },
      render: FooterBlock,
    },

    gallery: {
      label: 'Image Gallery',
      fields: {
        title: { type: 'text', label: 'Gallery Title' },
        imageCount: { type: 'number', label: 'Number of Images' },
      },
      defaultProps: {
        title: 'Our Gallery',
        imageCount: 6,
      },
      render: GalleryBlock,
    },

    testimonialCarousel: {
      label: 'Testimonial Carousel',
      fields: {
        title: { type: 'text', label: 'Section Title' },
      },
      defaultProps: {
        title: 'What Our Customers Say',
      },
      render: TestimonialCarouselBlock,
    },

    aiChat: {
      label: 'AI Chat Widget',
      fields: {
        title: { type: 'text', label: 'Widget Title' },
      },
      defaultProps: {
        title: 'Ask our AI Assistant',
      },
      render: AIChatBlock,
    },
  },
};

export default puckConfig;
