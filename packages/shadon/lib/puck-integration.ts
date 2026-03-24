/**
 * Shadon Integration Layer
 * Bridges Puck blocks with Shadon UI components
 * Provides unified component exports with proper typing
 */

import { ReactNode } from 'react';

// Re-export core Shadon components
export {
  Button,
  ButtonGroup,
} from '@/components/ui/button';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export {
  Badge,
} from '@/components/ui/badge';

export {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert';

// Additional component wrappers for Puck integration

export interface ShadonBlockConfig {
  component: React.ComponentType<any>;
  label: string;
  keywords: string[];
  icon?: string;
  fields?: Record<string, any>;
}

export interface ShadonIntegrationConfig {
  [blockKey: string]: ShadonBlockConfig;
}

/**
 * Standard Shadon-enhanced block templates
 */
export const SHADON_BLOCK_TEMPLATES: ShadonIntegrationConfig = {
  // Button variations
  buttonPrimary: {
    component: async () => (await import('@/components/ui/button')).Button,
    label: 'Primary Button',
    keywords: ['button', 'primary', 'action', 'cta'],
    icon: '🔘',
    fields: {
      text: { type: 'text', label: 'Button Text' },
      variant: { type: 'select', options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] },
      size: { type: 'select', options: ['default', 'sm', 'lg', 'icon'] },
      disabled: { type: 'boolean' },
    },
  },

  // Card variations
  cardSimple: {
    component: async () => (await import('@/components/ui/card')).Card,
    label: 'Simple Card',
    keywords: ['card', 'container', 'content'],
    icon: '🎴',
    fields: {
      title: { type: 'text', label: 'Title' },
      content: { type: 'richtext', label: 'Content' },
      variant: { type: 'select', options: ['default', 'elevated', 'outlined'] },
    },
  },

  // Badge variations
  badgeDefault: {
    component: async () => (await import('@/components/ui/badge')).Badge,
    label: 'Badge',
    keywords: ['badge', 'label', 'tag'],
    icon: '🏷️',
    fields: {
      text: { type: 'text', label: 'Badge Text' },
      variant: { type: 'select', options: ['default', 'secondary', 'destructive', 'outline'] },
    },
  },

  // Alert variations
  alertInfo: {
    component: async () => (await import('@/components/ui/alert')).Alert,
    label: 'Alert',
    keywords: ['alert', 'notification', 'message'],
    icon: '⚠️',
    fields: {
      title: { type: 'text', label: 'Alert Title' },
      description: { type: 'text', label: 'Description' },
      variant: { type: 'select', options: ['default', 'destructive', 'info', 'success', 'warning'] },
    },
  },
};

/**
 * Shadon component composition helper
 */
export function composeShadonBlock(
  component: React.ComponentType<any>,
  props: Record<string, any>,
  children?: ReactNode
) {
  return React.createElement(component, props, children);
}

/**
 * Validate Shadon component props
 */
export function validateShadonProps(
  template: ShadonBlockConfig,
  props: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.fields) {
    return { valid: true, errors: [] };
  }

  for (const [key, field] of Object.entries(template.fields)) {
    const value = props[key];

    // Type validation
    if (field.type === 'text' && value && typeof value !== 'string') {
      errors.push(`${key} must be a string`);
    }
    if (field.type === 'number' && value && typeof value !== 'number') {
      errors.push(`${key} must be a number`);
    }
    if (field.type === 'boolean' && value && typeof value !== 'boolean') {
      errors.push(`${key} must be a boolean`);
    }

    // Enum validation
    if (field.options && !field.options.includes(value)) {
      errors.push(
        `${key} must be one of: ${field.options.join(', ')}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate Puck field configuration from Shadon template
 */
export function generatePuckFieldsFromShadon(
  template: ShadonBlockConfig
): Record<string, any> {
  if (!template.fields) {
    return {};
  }

  const fields: Record<string, any> = {};

  for (const [key, field] of Object.entries(template.fields)) {
    switch (field.type) {
      case 'text':
        fields[key] = {
          type: 'text',
          label: field.label || key,
        };
        break;

      case 'richtext':
        fields[key] = {
          type: 'textarea',
          label: field.label || key,
        };
        break;

      case 'select':
        fields[key] = {
          type: 'select',
          label: field.label || key,
          options: field.options?.map((opt: string) => ({
            label: opt,
            value: opt,
          })) || [],
        };
        break;

      case 'number':
        fields[key] = {
          type: 'number',
          label: field.label || key,
        };
        break;

      case 'boolean':
        fields[key] = {
          type: 'radio',
          label: field.label || key,
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
        };
        break;

      default:
        fields[key] = {
          type: 'text',
          label: field.label || key,
        };
    }
  }

  return fields;
}

/**
 * High-level wrapper for creating Shadon-integrated Puck blocks
 */
export function createShadonPuckBlock(
  blockId: string,
  template: ShadonBlockConfig
) {
  return {
    label: template.label,
    fields: generatePuckFieldsFromShadon(template),
    defaultProps: {
      // Default values based on field types
      ...Object.entries(template.fields || {}).reduce(
        (acc, [key, field]) => ({
          ...acc,
          [key]: field.type === 'boolean'
            ? false
            : field.type === 'number'
              ? 0
              : field.type === 'select'
                ? field.options?.[0] || ''
                : '',
        }),
        {}
      ),
    },
    render: (props: Record<string, any>) => {
      const validation = validateShadonProps(template, props);

      if (!validation.valid) {
        return (
          <div
            style={{
              padding: '16px',
              background: '#fee',
              border: '1px solid #f88',
              borderRadius: '4px',
              color: '#c00',
              fontSize: '12px',
            }}
          >
            <strong>Block Error:</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        );
      }

      return composeShadonBlock(template.component, props);
    },
  };
}

/**
 * Get all Shadon blocks as Puck config
 */
export function getShadonPuckConfig() {
  const config: Record<string, any> = {};

  for (const [blockId, template] of Object.entries(SHADON_BLOCK_TEMPLATES)) {
    config[blockId] = createShadonPuckBlock(blockId, template);
  }

  return config;
}

/**
 * Merge Shadon config with existing Puck config
 */
export function mergeWithPuckConfig(otherConfig: Record<string, any>) {
  return {
    ...otherConfig,
    ...getShadonPuckConfig(),
  };
}
