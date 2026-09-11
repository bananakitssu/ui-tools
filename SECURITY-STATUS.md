# Security Status

**Current release:** `0.2.1-beta`

## Current status

UI Tools contains an optional Node.js terminal API in addition to its React/TypeScript UI components. The terminal API is security-sensitive because it can create PTY-backed WebSocket sessions.

Earlier beta releases had insufficient authentication around terminal connections. This was a real security vulnerability and should be treated as such. It was not the intended security model of the project.

## Affected and fixed releases

| Version | Status | Notes |
|---|---|---|
| `0.1.0-beta`–`0.1.8-beta` | Affected | Earlier terminal authentication model was insufficient. The published advisory currently names `0.1.0-beta`–`0.1.7-beta`; `0.1.8-beta` is included here because it still lacked the later authentication fix. |
| `0.1.9-beta` | Fixed | Added terminal authentication before WebSocket upgrade and PTY creation. |
| `0.2.0-beta` | Further hardened | Added additional restrictions and safer defaults around origins, sessions, environments, limits, and execution. |
| `0.2.1-beta` | Further hardened | Added credential verification and additional execution/sandbox controls. |

## Installation vs. use

The terminal functionality is not automatically started by installing the package.

The package's `package.json` defines `prepublishOnly` for building before publication and does not define a `postinstall` hook. The terminal API is exposed through the separate backend export and requires application code to use it.

```ts
import { useTerminal } from '@bananacool467/ui-tools/backend';
```

Therefore, a security assessment should distinguish package installation from explicit use of the terminal API.

## Architecture

The root package export is for the UI library. The backend terminal API is exposed separately as `@bananacool467/ui-tools/backend`.

The terminal feature is intentional functionality, but its earlier authentication design was inadequate. The project has since added authentication and defense-in-depth controls rather than treating the original behavior as acceptable.

## What this does and does not establish

The historical vulnerability establishes that affected versions had a serious security defect. It does not, without additional evidence, establish malicious intent by the maintainer, that the package was intentionally designed as malware, or that unrelated software from the same developer is malicious.

When evaluating this project, please distinguish:

1. the affected version range;
2. the vulnerable behavior;
3. the versions containing the remediation;
4. the current implementation; and
5. any separate claim about developer intent.

## Primary references

- `SECURITY.md` — security policy and reporting guidance
- `CHANGELOG.md` — release-by-release changes
- `README.md` — project overview and API documentation
- `package.json` — package metadata, exports, scripts, and current version
