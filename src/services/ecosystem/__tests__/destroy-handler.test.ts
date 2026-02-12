import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BioErrorCodes } from '../types';
import { handleDestroyAsset, setDestroyDialog } from '../handlers/destroy';

describe('handleDestroyAsset amount semantics', () => {
  const context = {
    appId: 'test-miniapp',
    appName: 'Test Miniapp',
    appIcon: 'https://miniapp.example/icon.png',
    origin: 'https://test.app',
    permissions: ['bio_destroyAsset'],
  };

  beforeEach(() => {
    setDestroyDialog(null);
  });

  it('rejects formatted amount before opening dialog', async () => {
    const dialog = vi.fn(async () => ({ txHash: 'tx-hash' }));
    setDestroyDialog(dialog);

    await expect(
      handleDestroyAsset(
        {
          from: 'b_sender',
          amount: '10.00000000',
          chain: 'bfmeta',
          asset: 'BFM',
        },
        context,
      ),
    ).rejects.toMatchObject({
      code: BioErrorCodes.INVALID_PARAMS,
      message: 'Invalid amount: expected raw integer string',
    });

    expect(dialog).not.toHaveBeenCalled();
  });

  it('accepts raw amount and opens dialog', async () => {
    const dialog = vi.fn(async () => ({ txHash: 'tx-hash' }));
    setDestroyDialog(dialog);

    const result = await handleDestroyAsset(
      {
        from: 'b_sender',
        amount: '1000000000',
        chain: 'bfmeta',
        asset: 'BFM',
      },
      context,
    );

    expect(result).toEqual({ txHash: 'tx-hash' });
    expect(dialog).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: '1000000000',
      }),
    );
  });
});
