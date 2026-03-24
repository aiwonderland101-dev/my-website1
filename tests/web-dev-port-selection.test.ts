import { describe, expect, it, vi } from 'vitest';

const devPortModulePath = new URL('../apps/web/scripts/dev-port.mjs', import.meta.url).pathname;

describe('web dev port selection helper', () => {
  it('uses env PORT when provided', async () => {
    const { selectDevPort } = await import(devPortModulePath);
    const isPortAvailable = vi.fn().mockResolvedValue(true);

    await expect(selectDevPort({ envPort: '9010', isPortAvailable })).resolves.toEqual({
      port: 9010,
      source: 'env',
    });
    expect(isPortAvailable).not.toHaveBeenCalled();
  });

  it('falls back to next available port when default 9002 is occupied', async () => {
    const { selectDevPort } = await import(devPortModulePath);
    const isPortAvailable = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await expect(selectDevPort({ envPort: undefined, isPortAvailable })).resolves.toEqual({
      port: 9003,
      source: 'auto-fallback',
    });
  });
});
