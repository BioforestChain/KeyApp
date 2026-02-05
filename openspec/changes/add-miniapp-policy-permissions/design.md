# Design: Miniapp Permissions Policy

## Goals
- Manifest-driven Permissions Policy for cross-origin miniapps.
- Full directive coverage aligned with Web standard.
- Immediate manifest refresh for installed and running apps.

## Manifest Field
- `permissionsPolicy?: PermissionsPolicyDirective[]`
- Directive names match Permissions-Policy tokens (e.g. `clipboard-write`, `camera`).
- Validation uses a compile-time list of known directives.

## Policy Enforcement
- Top-level document must allow delegation for all directives (header `Permissions-Policy: <directive>=*`), while per-miniapp restriction is enforced via iframe/wujie `allow` attributes.
- Allow string format: `directive1; directive2; ...` (deduped, stable order).

## Runtime Sync
- Registry refresh triggers manifest refresh for installed/running apps.
- If a running app's manifest changes, update:
  - stored manifest
  - iframe allow attribute
  - active bridge permissions (when active)

## Risk/Compatibility
- No behavior change for miniapps without `permissionsPolicy`.
- Headers are additive in dev; production requires CDN/host config.
