## 0.1.9-beta

### Security

- Fixed authentication for the `useTerminal()` WebSocket terminal.
- Terminal connections now require an authentication token.
- Authentication is performed before WebSocket upgrades and PTY creation.
- Removed insecure unauthenticated terminal usage.
- Terminal authentication tokens are no longer accepted through URL query parameters.