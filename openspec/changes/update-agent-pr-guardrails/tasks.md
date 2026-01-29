## 1. Implementation
- [ ] Add PR title lint (default strict) with `--loose` bypass
- [ ] Normalize PR title/body during `task submit` and `task start` flows
- [ ] Ensure `Closes #<issue>` is always present in PR body
- [ ] Auto-derive conventional commit title from type label + issue title

## 2. Verification
- [ ] `task submit` with default strict validates and fixes title/body
- [ ] `task submit --loose` allows non-standard titles
- [ ] Merged PR auto-closes linked issue
