/**
 * Permissions Policy directives for miniapps.
 *
 * Source: MDN Permissions-Policy directive list + clipboard directives.
 */

export const PERMISSIONS_POLICY_DIRECTIVES = [
  'accelerometer',
  'ambient-light-sensor',
  'aria-notify',
  'attribution-reporting',
  'autoplay',
  'bluetooth',
  'browsing-topics',
  'camera',
  'captured-surface-control',
  'ch-ua-high-entropy-values',
  'compute-pressure',
  'cross-origin-isolated',
  'deferred-fetch',
  'deferred-fetch-minimal',
  'display-capture',
  'encrypted-media',
  'fullscreen',
  'gamepad',
  'geolocation',
  'gyroscope',
  'hid',
  'identity-credentials-get',
  'idle-detection',
  'language-detector',
  'local-fonts',
  'magnetometer',
  'microphone',
  'midi',
  'on-device-speech-recognition',
  'otp-credentials',
  'payment',
  'picture-in-picture',
  'private-state-token-issuance',
  'private-state-token-redemption',
  'publickey-credentials-create',
  'publickey-credentials-get',
  'screen-wake-lock',
  'serial',
  'speaker-selection',
  'storage-access',
  'translator',
  'summarizer',
  'usb',
  'web-share',
  'window-management',
  'xr-spatial-tracking',
  'clipboard-read',
  'clipboard-write',
] as const;

export type PermissionsPolicyDirective = (typeof PERMISSIONS_POLICY_DIRECTIVES)[number];

const PERMISSIONS_POLICY_DIRECTIVE_SET = new Set<PermissionsPolicyDirective>(PERMISSIONS_POLICY_DIRECTIVES);

export function isPermissionsPolicyDirective(value: string): value is PermissionsPolicyDirective {
  return PERMISSIONS_POLICY_DIRECTIVE_SET.has(value as PermissionsPolicyDirective);
}

export function normalizePermissionsPolicy(
  directives?: readonly string[] | null,
): PermissionsPolicyDirective[] {
  if (!directives || directives.length === 0) return [];

  const allowed = new Set<PermissionsPolicyDirective>();
  for (const entry of directives) {
    if (isPermissionsPolicyDirective(entry)) {
      allowed.add(entry);
    }
  }

  if (allowed.size === 0) return [];
  return PERMISSIONS_POLICY_DIRECTIVES.filter((directive) => allowed.has(directive));
}

export function buildPermissionsPolicyAllow(
  directives?: readonly PermissionsPolicyDirective[] | null,
): string | undefined {
  if (!directives || directives.length === 0) return undefined;
  return directives.join('; ');
}

export function buildPermissionsPolicyHeaderValue(
  directives: readonly PermissionsPolicyDirective[] = PERMISSIONS_POLICY_DIRECTIVES,
): string {
  return directives.map((directive) => `${directive}=*`).join(', ');
}
