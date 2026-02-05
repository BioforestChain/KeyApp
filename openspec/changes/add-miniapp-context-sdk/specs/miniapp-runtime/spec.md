## ADDED Requirements

### Requirement: Miniapp context channel
The host SHALL accept `miniapp:context-request` messages and respond with `keyapp:context-update` containing the latest context payload and the originating `requestId`.

#### Scenario: Context request success
- **WHEN** a miniapp sends `miniapp:context-request`
- **THEN** the host responds with `keyapp:context-update` within the configured timeout
- **AND** the payload includes safe area insets and host version information

### Requirement: Context update broadcast
The host SHALL broadcast `keyapp:context-update` whenever the context changes (safe area, environment, host version) so running miniapps can react without polling.

#### Scenario: Safe area change
- **WHEN** the host safe area insets change
- **THEN** all active miniapps receive a `keyapp:context-update` event

### Requirement: SDK access and caching
The SDK SHALL provide `getMiniappContext` and `onMiniappContextUpdate` APIs, cache the latest context, and avoid duplicate event bindings.

#### Scenario: Cached context replay
- **WHEN** a consumer calls `onMiniappContextUpdate`
- **THEN** the SDK replays the latest cached context once
- **AND** returns an unsubscribe function

### Requirement: Automatic refresh on enter
The SDK SHALL request context once when accessed if no cached context is available.

#### Scenario: First load without cached context
- **WHEN** the miniapp loads with no cached context
- **THEN** the SDK sends a `miniapp:context-request`
- **AND** resolves `getMiniappContext()` with the next `keyapp:context-update`

### Requirement: Compatibility fallback
When the host does not support the context channel, the SDK SHALL resolve with fallback values derived from standard Web APIs (safe-area env vars, prefers-color-scheme, document language) and emit a warning.

#### Scenario: Unsupported host
- **WHEN** the SDK times out waiting for a `keyapp:context-update`
- **THEN** it resolves with default context values
- **AND** logs a warning about unsupported host capability
