# Platform Services

## Overview

Platform services abstract the underlying capabilities of the host environment (DWEB, Web, or Mock). They follow a consistent adapter pattern to ensure cross-platform compatibility.

## Architecture

Each service exposes a unified interface (e.g., `IBiometricService`) and selects the appropriate implementation at runtime based on the environment.

- **Web**: Standard browser APIs (e.g., `navigator.clipboard`, `navigator.vibrate`).
- **DWEB**: BioForest DWEB platform APIs (e.g., `dweb.biometrics`).
- **Mock**: Simulated behaviors for development and testing.

## Directory Structure

Services are located in `src/services/{service-name}`:

- `types.ts`: Interface definitions.
- `web.ts`: Browser implementation.
- `dweb.ts`: DWEB implementation.
- `mock.ts`: Mock implementation.
- `index.ts`: Factory/Selection logic.
