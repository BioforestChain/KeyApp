# Biometric Service

## Interface

```typescript
interface IBiometricService {
  isAvailable(): Promise<boolean>;
  authenticate(reason: string): Promise<boolean>;
}
```

## Implementations

### Web (`web.ts`)

- Uses `window.PublicKeyCredential` (WebAuthn) where applicable, or falls back to simulated success/failure in dev mode.
- **Note**: Full biometric support in standard web browsers is limited to secure contexts and specific hardware.

### DWEB (`dweb.ts`)

- Bridges to the native DWEB biometric plugin.
- Supports FaceID, TouchID, and Android Biometrics.

### Mock (`mock.ts`)

- Always returns `true` for availability.
- Simulates a 1-second delay and returns `true` for authentication.
