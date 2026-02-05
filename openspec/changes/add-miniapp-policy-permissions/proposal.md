# Change: Add manifest-driven Permissions Policy for miniapps

## Why
Miniapps run cross-origin inside KeyApp. Without a manifest-driven Permissions Policy layer, Web APIs like clipboard and camera fail at runtime, and updates to miniapp manifests do not propagate to running apps.

## What Changes
- Introduce a manifest field for Permissions Policy directives (full Web standard list).
- Map manifest directives to iframe/wujie `allow` attributes and update policies on source refresh.
- Ensure installed miniapps refresh their manifests immediately when sources update.
- Add runtime integration to keep allowlists in sync for running apps.
- Update docs and example miniapps to declare required directives.

## Impact
- Affected specs: miniapp-runtime (new)
- Affected code: ecosystem registry, miniapp runtime container, manifest schema/types, docs, i18n, Vite dev headers
