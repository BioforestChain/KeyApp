## 1. Design
- [ ] Confirm Permissions Policy directive list source and mapping strategy
- [ ] Define manifest field name and validation rules

## 2. Schema + Types
- [ ] Add Permissions Policy directive type + list
- [ ] Extend MiniappManifest schema/type with policy directives

## 3. Runtime Integration
- [ ] Build allowlist helper (dedupe + validation + string format)
- [ ] Inject allow attribute into iframe and wujie containers
- [ ] Update running miniapps when sources refresh (manifest + allow)

## 4. Permissions Policy Headers
- [ ] Add dev server Permissions-Policy header template
- [ ] Document production header requirements

## 5. Docs + Tests
- [ ] Update manifest docs with new field
- [ ] Add unit tests for allowlist generation + runtime updates

## 6. Miniapp Manifests
- [ ] Update bfm-rwa-hub-app manifest
- [ ] Update bfm-rwa-org-app manifest
