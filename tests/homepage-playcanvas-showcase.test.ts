import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

describe('homepage playcanvas showcase', () => {
  test('renders centered PlayCanvas showcase in landing page content', () => {
    const homepage = readFileSync('apps/web/app/homepage/Homepage.tsx', 'utf8');

    expect(homepage).toContain('Powerful <span className="text-blue-500">PlayCanvas</span> Integration');
    expect(homepage).toContain('Experience seamless real-time 3D editing and high-performance gameplay directly in the browser.');
    expect(homepage).toContain('/images/playcanvas.png');
    expect(homepage).toContain('/images/PlayCanvas-Features-TheEditor-CBR4.mp4');
  });
});
