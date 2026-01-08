# Haptics Service

## Interface

```typescript
interface IHapticService {
  vibrate(pattern: number | number[]): void;
  impact(style: 'light' | 'medium' | 'heavy'): void;
  notification(type: 'success' | 'warning' | 'error'): void;
}
```

## Implementations

### Web (`web.ts`)

- Uses `navigator.vibrate()`.
- Maps impact styles to specific duration patterns (e.g., Light = 10ms, Heavy = 40ms).

### DWEB (`dweb.ts`)

- Bridges to native Taptic Engine (iOS) or Vibrator (Android).
- Provides high-fidelity haptic feedback.

### Mock (`mock.ts`)

- Logs haptic events to the console for debugging.
