# UI Tools

<p align="center">
  <img alt="version" src="https://img.shields.io/badge/version-v0.2.1-green?style=for-the-badge" />
  <img alt="version type" src="https://img.shields.io/badge/version_type-BETA-yellow?style=for-the-badge" />
  <img alt="license" src="https://img.shields.io/github/license/bananakitssu/ui-tools?style=for-the-badge" />
  <img alt="downloads" src="https://img.shields.io/npm/dm/@bananacool467/ui-tools?style=for-the-badge" />
</p>

<p align="center">
  <a href="https://npmjs.org/package/@bananacool467/ui-tools"><img alt="NPM" src="https://img.shields.io/badge/NPM-@bananacool467%2Fui--tools-red?style=for-the-badge&logo=npm" /></a>
  <a href="https://github.com/bananakitssu/ui-tools"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-bananakitssu%2Fui--tools-grey?style=for-the-badge&logo=github" /></a>
</p>


Just some UI tools, for frontend and backend.

Kind of like MUI.

***(UI tools is currently under development)***

## Installing
From NPM:
```bash
npm i @bananacool467/ui-tools@latest
```
Via GitHub:
***(This clones ui-tools, sets it ip and builds it, then puts the required files into node_modules and updates package.json for if NPM installing fails)***
```bash
git clone https://github.com/bananakitssu/ui-tools; cd ui-tools; npm run setup; npm run build; cd ..; mkdir -p node_modules/@bananacool467/ui-tools; mv ui-tools/package.json node_modules/@bananacool467/ui-tools/package.json; mv ui-tools/README.md node_modules/@bananacool467/ui-tools/README.md; mv ui-tools/dist node_modules/@bananacool467/ui-tools/dist; mv ui-tools/LICENSE node_modules/@bananacool467/ui-tools/LICENSE; rm -rf ui-tools; node -e "const fs = require('fs'); const pkg = fs.existsSync('package.json') ? require('./package.json') : { dependencies: {} }; pkg.dependencies = pkg.dependencies || {}; pkg.dependencies['@bananacool467/ui-tools'] = require('./node_modules/@bananacool467/ui-tools/package.json').version || 'latest'; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));"
```

## Cloning from GitHub
```bash
git clone https://github.com/bananakitssu/ui-tools
```

***If your cloning Ui Tools from GitHub, you should run:***
```bash
npm run setup
```
***And to build it, run:***
```bash
npm run build
```

> [!NOTE]
> Documentation coming soon. Instead of reading a documentation, you can read the component files in `src/` in GitHub, or `dist/` in NPM.

## Terminal

The terminal server requires an authentication token. It rejects missing or
incorrect credentials before creating a WebSocket connection or spawning a
PTY:

```ts
const terminalHandler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
});

app.get("/terminal-stream", terminalHandler);
```

Pass the same token to the browser component:

```tsx
<Terminal token={terminalToken} />
```

The browser sends the token through a WebSocket subprotocol, not a URL query
parameter. Do not expose a long-lived token in a public application; use an
authenticated application session or a short-lived credential for public
terminals.

For local development, keep the terminal restricted to localhost:
```ts
const terminalHandler = await useTerminal({
  restrictToLocalhost: true,
  token: process.env.TERMINAL_TOKEN,
});

app.get("/terminal-stream", terminalHandler);
```

### Command execution modes

`strictEnv` and a limited `PATH` are hardening measures, not a security
sandbox. Use an explicit execution mode:

- `restricted` (default) limits the environment but runs the shell on the host.
- `host` runs the shell directly with the host environment and is for
  development only.
- `sandbox` runs the shell inside Bubblewrap on Linux and fails closed if
  Bubblewrap cannot create a user namespace.

Bubblewrap does not require Docker. Install `bwrap` through your operating
system's package manager, then use:

```ts
const terminalHandler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
  executionMode: "sandbox",
  workspaceRoot: process.cwd(),
  allowNetwork: false,
});

app.get("/terminal-stream", terminalHandler);
```

If Bubblewrap is unavailable, use `executionMode: "restricted"` for local
development. It must not be presented as isolation for hostile or
multi-tenant users.

You can also setup your own authenticate feature, example:
```ts
const terminalHandler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
  authentication: (providedToken, req, res) => {
    // check cookies for session ids and other stuff
    return true; /* return false; to reject */
  }
});

app.get("/terminal-stream", terminalHandler);
```

You can also restrict the terminal to some origins:
```ts
const terminalHandler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
  strictConnection: true,
  allowedOrigins: [
    "https://your-app.example"
  ]
});

app.get("/terminal-stream", terminalHandler);
```

You can also restrict access to your process's ENV:
```ts
const terminalHandler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
  strictEnv: true,
  env: [
    /* custom env items */
    "item": "value"
  ]
});

app.get("/terminal-stream", terminalHandler);
```

Or add more to the ENV:
```ts
const terminalHandler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
  env: [
    "session": "123"
  ]
});

app.get("/terminal-stream", terminalHandler);
```