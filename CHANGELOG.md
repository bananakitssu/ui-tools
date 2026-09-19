## 0.2.1-beta

### Security

- Added credential verification support for terminal connections.
- Added configurable terminal execution modes: `restricted`, `host`, and `sandbox`.
- Added Bubblewrap (`bwrap`) support for Linux sandbox execution.
- Added additional environment and execution hardening controls.
- Terminal authentication remains required before WebSocket sessions and PTY creation.

## 0.2.0-beta

### Security

- Added localhost restrictions for the terminal backend by default.
- Added WebSocket origin allowlisting and stricter connection handling.
- Added terminal session ownership checks.
- Added session, connection, message-size, and lifetime limits.
- Added environment restrictions and configurable startup commands.

## 0.1.9-beta

### Security

- Fixed authentication for the `useTerminal()` WebSocket terminal.
- Terminal connections now require an authentication token.
- Authentication is performed before WebSocket upgrades and PTY creation.
- Removed insecure unauthenticated terminal usage.
- Terminal authentication tokens are no longer accepted through URL query parameters.