import type { MiniappManifest } from '@/services/ecosystem/types';

const MINIAPP_RUNTIME_REVISION_PARAM = '__rv';

function deriveMiniappRuntimeRevision(manifest: MiniappManifest): string | null {
  const version = manifest.version.trim();
  if (version.length > 0) {
    return `v:${version}`;
  }

  const updated = manifest.updatedAt?.trim();
  if (updated && updated.length > 0) {
    return `u:${updated}`;
  }

  return null;
}

export function buildMiniappLaunchContextParams(
  manifest: MiniappManifest,
  contextParams?: Record<string, string>,
): Record<string, string> | undefined {
  const nextContextParams = contextParams ? { ...contextParams } : {};
  if (manifest.strictUrl === true) {
    if (Object.keys(nextContextParams).length === 0) {
      return undefined;
    }
    return nextContextParams;
  }

  if (!(MINIAPP_RUNTIME_REVISION_PARAM in nextContextParams)) {
    const revision = deriveMiniappRuntimeRevision(manifest);
    if (revision) {
      nextContextParams[MINIAPP_RUNTIME_REVISION_PARAM] = revision;
    }
  }

  if (Object.keys(nextContextParams).length === 0) {
    return undefined;
  }
  return nextContextParams;
}
