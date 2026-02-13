import { describe, expect, it } from 'vitest';
import type { MiniappManifest } from '@/services/ecosystem/types';
import { buildMiniappLaunchContextParams } from '../launch-context';

function createManifest(partial?: Partial<MiniappManifest>): MiniappManifest {
  return {
    id: 'xin.dweb.demo',
    name: 'Demo',
    description: 'Demo miniapp',
    icon: 'https://example.com/icon.svg',
    url: 'https://example.com',
    version: '1.0.0',
    ...partial,
  };
}

describe('buildMiniappLaunchContextParams', () => {
  it('appends stable revision by manifest version', () => {
    const manifest = createManifest({ version: '1.2.3' });

    const result = buildMiniappLaunchContextParams(manifest);

    expect(result).toEqual({ __rv: 'v:1.2.3' });
  });

  it('keeps existing params and appends revision', () => {
    const manifest = createManifest({ version: '2.0.0' });

    const result = buildMiniappLaunchContextParams(manifest, {
      account: 'bfm-address-1',
    });

    expect(result).toEqual({
      account: 'bfm-address-1',
      __rv: 'v:2.0.0',
    });
  });

  it('does not override explicit revision param', () => {
    const manifest = createManifest({ version: '3.0.0' });

    const result = buildMiniappLaunchContextParams(manifest, {
      __rv: 'v:custom',
      from: 'bridge',
    });

    expect(result).toEqual({
      __rv: 'v:custom',
      from: 'bridge',
    });
  });

  it('falls back to updated timestamp when version is empty', () => {
    const manifest = createManifest({
      version: '',
      updated: '2026-02-13T03:00:00Z',
    });

    const result = buildMiniappLaunchContextParams(manifest);

    expect(result).toEqual({ __rv: 'u:2026-02-13T03:00:00Z' });
  });
});

