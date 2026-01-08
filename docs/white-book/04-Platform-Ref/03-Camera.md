# Camera Service

## Interface

```typescript
interface ICameraService {
  scanQRCode(): Promise<string | null>;
  requestPermission(): Promise<boolean>;
}
```

## Implementations

### Web (`web.ts`)

- Uses `navigator.mediaDevices.getUserMedia` to access the camera.
- Implements a software QR code decoder (e.g., `jsQR` or native BarcodeDetector).

### DWEB (`dweb.ts`)

- Invokes the native system camera UI for scanning.
- Returns the decoded string directly.

### Mock (`mock.ts`)

- Returns a hardcoded QR string immediately (e.g., a test address).
