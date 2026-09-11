# Security Policy

## Overview

UI Tools is a React + TypeScript UI library with an optional Node.js backend terminal API.

The terminal functionality is security-sensitive by design because it can create PTY-backed WebSocket sessions. Earlier releases had an authentication vulnerability in this functionality. That issue was treated as a security defect and subsequently fixed and hardened.

## Security history

- `0.1.0-beta` through `0.1.8-beta`: considered affected by the terminal authentication vulnerability. The official advisory currently identifies `0.1.0-beta` through `0.1.7-beta`; `0.1.8-beta` is included here because it did not contain the later authentication fix.
- `0.1.9-beta`: introduced terminal authentication and performed authentication before WebSocket upgrade / PTY creation.
- `0.2.0-beta`: added additional terminal security hardening, including stricter defaults and restrictions around sessions, origins, environments, and execution.
- `0.2.1-beta`: further changed the terminal security model with credential verification and additional execution/sandbox controls.

The changelog contains the version-by-version implementation history.

## Important clarification about package installation

The terminal API is not the package's installation mechanism. The package declares a `prepublishOnly` build script, but does not declare a `postinstall` script. Installing the package does not by itself start a terminal session.

The Node.js terminal API is exposed separately through:

```ts
import { useTerminal } from '@bananacool467/ui-tools/backend';
```

The browser/React API remains the root package export.

## Reporting a vulnerability

Please report suspected security vulnerabilities through GitHub's private vulnerability reporting feature when available, or open a security issue if private reporting is unavailable.

When reporting an issue, include:

- affected version(s)
- environment and Node.js version
- reproduction steps or a minimal proof of concept
- expected behavior
- actual behavior
- any relevant logs

Please do not publish credentials, tokens, private keys, or other sensitive information in a public issue.

## Scope and interpretation

A security vulnerability in a particular version of a package is evidence of a security defect in that software version. It is not, by itself, evidence of malicious intent by the maintainer or evidence that unrelated projects from the same developer are malicious.

Security assessments should distinguish between documented vulnerable code, current releases, remediation status, and claims about intent. This repository's source code, release history, changelog, and security documentation are the primary technical references for UI Tools.
