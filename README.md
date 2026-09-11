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

A small React + TypeScript component and UI-tools library for frontend applications, with an optional Node.js backend terminal API.

> **Status:** UI Tools is currently under development and published as a beta package.

## Security

UI Tools has a documented security history. Earlier beta releases of the optional backend terminal had insufficient authentication around the WebSocket/PTY terminal.

- `0.1.0-beta` through `0.1.8-beta` are treated as affected by the historical terminal authentication issue.
- `0.1.9-beta` added authentication before WebSocket upgrades and PTY creation.
- `0.2.0-beta` added additional connection, origin, session, environment, and execution hardening.
- `0.2.1-beta` adds credential verification and additional execution/sandbox controls.
- The terminal backend is exposed separately through `@bananacool467/ui-tools/backend`.
- Installing the package does **not** start the terminal. The terminal functionality must be explicitly imported and used by an application.
- The package does not define a `postinstall` script.

For the detailed security policy and current status, see [`SECURITY.md`](SECURITY.md) and [`SECURITY-STATUS.md`](SECURITY-STATUS.md). The machine-readable LLM context is available in [`llms.txt`](llms.txt) and [`llms-full.txt`](llms-full.txt).

## Installation

### NPM

```bash
npm i @bananacool467/ui-tools@latest
```

### From GitHub

```bash
git clone https://github.com/bananakitssu/ui-tools
cd ui-tools
npm run setup
npm run build
```

The package exposes the browser/React API from `@bananacool467/ui-tools` and the Node.js terminal API from `@bananacool467/ui-tools/backend`.

## Quick start

```tsx
import {
  Button,
  Card,
  ThemeProvider,
  Typography,
} from '@bananacool467/ui-tools';

export function App() {
  return (
    <ThemeProvider>
      <Card title="Hello UI Tools">
        <Typography variant="body1">
          A simple React UI built with UI Tools.
        </Typography>
        <Button onClick={() => console.log('clicked')}>
          Click me
        </Button>
      </Card>
    </ThemeProvider>
  );
}
```

`ThemeProvider` is optional because the library has a built-in default theme, but using it is recommended when customizing application-wide styling.

---

# Documentation

## Public exports

The root entry point (`src/index.ts`) re-exports the following public API:

### Layout

| Export | Purpose | Main props |
| --- | --- | --- |
| `Box` / `BoxProps` | Polymorphic basic container | `as`, `p`, `bgcolor` |
| `Container` / `ContainerProps` | Centered page container | `maxWidth`, `fullHeight` |
| `View` / `ViewProps` | Flexbox layout primitive | `as`, `direction`, `align`, `justify`, `wrap`, `gap`, `flex` |
| `Grid` / `GridProps` | CSS grid container/item | `container`, `span`, `columns`, `spacing` |
| `Paper` / `PaperProps` | Surface with elevation or border | `as`, `elevation`, `variant`, `square` |
| `Card` / `CardProps` | Pre-styled content card | `title`, `elevation`, `variant` |
| `Divider` / `DividerProps` | Horizontal/vertical divider | `orientation`, `children` |

### Navigation and menus

| Export | Purpose | Main props |
| --- | --- | --- |
| `AppBar` / `AppBarProps` | Application header | `position`, `color`, `elevation` |
| `AppBarTitle` / `AppBarTitleProps` | Flexible title inside `AppBar` | `children`, `style` |
| `Breadcrumbs` | Breadcrumb navigation | See `BreadcrumbsProps` in the generated TypeScript declarations |
| `BottomNavigation` | Bottom navigation UI | See its TypeScript props |
| `Tabs` / `TabsProps` / `TabItem` | Tab navigation with active indicator | `items`, `value`, `onChange` |
| `Menu` / `MenuProps` / `MenuItem` | Click-triggered popup menu | `items`, `children` |
| `ContextMenu` / `ContextMenuProps` / `ContextMenuItem` | Right-click context menu | `items`, `children` |
| `Pagination` / `PaginationProps` | Page navigation | `count`, `page`, `onChange` |
| `Link` / `LinkProps` | Styled anchor/link primitive | `href`, `onClick` plus anchor attributes |

### Inputs and controls

| Export | Purpose | Main props |
| --- | --- | --- |
| `Button` / `ButtonProps` | Primary/secondary action button | `variant`, `isLoading` plus button attributes |
| `IconButton` / `IconButtonProps` | Circular icon action | `size`, `color` plus button attributes |
| `Fab` / `FabProps` | Floating action button | `size`, `color`, `variant` plus button attributes |
| `Input` / `InputProps` | Labeled text input | `label`, `error`, `helperText`, `labelColor`, `activeColor` plus input attributes |
| `TextArea` / `TextAreaProps` | Labeled multiline input | `label`, `error`, `helperText`, `labelColor`, `activeColor` plus textarea attributes |
| `Select` / `SelectProps` / `SelectOption` | Custom keyboard-accessible select | `label`, `options`, `value`, `onChange`, `placeholder` |
| `Checkbox` / `CheckboxProps` | Checkbox control | `label`, `labelColor` plus checkbox attributes |
| `Radio` / `RadioProps` | Radio control | `label`, `labelColor` plus radio attributes |
| `RadioGroup` / `RadioGroupProps` | Controlled group of radios | `label`, `name`, `value`, `onChange`, `direction` |
| `Switch` / `SwitchProps` | Toggle switch | `label`, `labelColor` plus checkbox attributes |
| `Slider` / `SliderProps` | Numeric range slider | `label`, `value`, `min`, `max`, `step`, `disabled`, `onChange`, `showValue` |

### Feedback and overlays

| Export | Purpose | Main props |
| --- | --- | --- |
| `Alert` / `AlertProps` / `AlertSeverity` | Inline status message | `severity`, `title`, `onClose`, `children` |
| `Badge` / `BadgeProps` | Badge or notification dot | `content`, `color`, `variant`, `max`, `invisible`, `children` |
| `Chip` / `ChipProps` | Compact label/tag | `label`, `color`, `variant`, `onDelete`, `onClick` |
| `Modal` / `ModalProps` | Centered modal dialog | `isOpen`, `onClose`, `title`, `children` |
| `PromptModal` / `PromptModalProps` | Modal containing a text prompt | `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `label`, `placeholder`, `defaultValue`, `confirmText`, `cancelText`, `destructive` |
| `Drawer` / `DrawerProps` | Sliding modal surface | `isOpen`, `onClose`, `anchor`, `children` |
| `Tooltip` / `TooltipProps` | Delayed hover/focus tooltip | `label`, `children`, `placement` |
| `ToastProvider` / `useToast` / `Toast` / `ToastType` | Application toast notifications | `addToast(message, type?, duration?)`, `removeToast(id)` |

### Data display and progress

| Export | Purpose | Main props |
| --- | --- | --- |
| `Avatar` / `AvatarProps` | Image or fallback avatar | `src`, `alt`, `children`, `size`, `color`, `variant` |
| `List` / `ListProps` | Styled unordered list | `disablePadding`, `children` |
| `ListItem` / `ListItemProps` | List row with optional actions/adornments | `button`, `onClick`, `selected`, `disabled`, `startAdornment`, `endAdornment`, `primary`, `secondary` |
| `CircularProgress` / `CircularProgressProps` | Circular progress indicator | `value`, `size`, `strokeWidth`, `color`, `trackColor` |
| `LinearProgress` / `LinearProgressProps` | Linear progress indicator | `value`, `color`, `trackColor` |
| `Skeleton` / `SkeletonProps` | Loading placeholder | `variant`, `width`, `height` |
| `Typography` / `TypographyProps` / `TypographyVariant` | Themed text and headings | `variant`, `as`, `color`, `align` |

### Theme and hooks

| Export | Purpose |
| --- | --- |
| `defaultTheme` / `Theme` | Built-in design tokens and theme type |
| `ThemeProvider` / `ThemeProviderProps` | Deep-merges custom theme values with `defaultTheme` |
| `useTheme` | Reads the active theme |
| `useRipple` / `RippleItem` | Reusable ripple interaction state and controls |

### Terminal UI

| Export | Purpose | Main props |
| --- | --- | --- |
| `Terminal` / `TermProps` | Browser terminal connected to a terminal WebSocket | `token`, `url`, `width`, `height`, `controls`, `p`, `bgcolor`, `controlscolor`, `variant` |

> **Important:** `Terminal` is the client-side terminal UI. The Node.js WebSocket/PTY server is provided separately through `@bananacool467/ui-tools/backend`.

---

## Layout components

### `Box`

`Box` is a lightweight polymorphic container. `as` changes the rendered HTML element, `p` uses a spacing token, and `bgcolor` accepts one of the theme background names or a custom CSS color.

```tsx
<Box as="section" p="lg" bgcolor="surfaceSunken">
  Content
</Box>
```

### `View`

`View` is a flexbox primitive:

```tsx
<View direction="row" align="center" justify="space-between" gap={16}>
  <Typography>Left</Typography>
  <Button>Right</Button>
</View>
```

`direction` is `row | column`; `align` supports `start | center | end | stretch | baseline`; and `justify` supports `start | center | end | space-between | space-around | space-evenly`.

### `Grid`

Use `container` for the grid itself and `span` for an item:

```tsx
<Grid container columns={12} spacing={16}>
  <Grid span={8}>Main</Grid>
  <Grid span={4}>Sidebar</Grid>
</Grid>
```

### `Paper` and `Card`

```tsx
<Paper elevation={2}>
  Surface content
</Paper>

<Card title="Account" elevation="card" variant="outlined">
  Card content
</Card>
```

`Paper` supports elevations `0` through `4` and `elevation | outlined` variants. `Card` maps `flat`, `card`, and `modal` to predefined paper elevations.

### `Container`

```tsx
<Container maxWidth="lg" fullHeight>
  Page content
</Container>
```

Available `maxWidth` values are `sm`, `md`, `lg`, `xl`, or `false` to remove the maximum width.

---

## Buttons and controls

### `Button`

`Button` extends the normal React button attributes and adds `variant` and `isLoading`.

```tsx
<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button isLoading>Saving...</Button>
```

`isLoading` also disables the button while the loading indicator is shown.

### `IconButton` and `Fab`

```tsx
<IconButton size="small" aria-label="Settings">
  ⚙
</IconButton>

<Fab size="large">+</Fab>
```

Both controls include the library ripple interaction.

### `Checkbox`, `Radio`, and `Switch`

These controls support the normal React input attributes while adding an optional label and label color.

```tsx
<Checkbox label="Enable notifications" checked={enabled} onChange={handleChange} />
<Radio label="Option A" value="a" checked={value === 'a'} onChange={handleChange} />
<Switch label="Dark mode" checked={dark} onChange={handleChange} />
```

### `RadioGroup`

`RadioGroup` controls the `name`, `checked`, and `onChange` values of its radio children:

```tsx
<RadioGroup
  label="Plan"
  name="plan"
  value={plan}
  onChange={setPlan}
>
  <Radio value="free" label="Free" />
  <Radio value="pro" label="Pro" />
</RadioGroup>
```

### `Select`

```tsx
<Select
  label="Country"
  options={[
    { label: 'Trinidad and Tobago', value: 'tt' },
    { label: 'Canada', value: 'ca' },
  ]}
  value={country}
  onChange={setCountry}
/>
```

The component supports mouse selection plus `Enter`, `Space`, `ArrowUp`, `ArrowDown`, `Escape`, and `Tab` keyboard interaction.

### `Slider`

```tsx
<Slider
  label="Volume"
  min={0}
  max={100}
  value={volume}
  onChange={setVolume}
  showValue
/>
```

If `value` is omitted, the slider manages its own internal value starting at `min`.

---

## Feedback and overlays

### `Alert`

`severity` is one of `success`, `error`, `info`, or `warning`.

```tsx
<Alert severity="success" title="Saved">
  Your changes were saved.
</Alert>
```

### `Badge`

```tsx
<Badge content={7}>
  <Avatar>BK</Avatar>
</Badge>

<Badge variant="dot">
  <Avatar>BK</Avatar>
</Badge>
```

Numeric standard badges are capped using `max` and displayed as `max+` when exceeded. `invisible` hides the badge without removing its child.

### `Chip`

```tsx
<Chip label="TypeScript" variant="outlined" onDelete={() => removeTag()} />
```

### `Modal`

`Modal` renders through a portal and manages body scroll, focus, Escape-to-close, and Tab focus wrapping.

```tsx
<Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm">
  <Typography>Are you sure?</Typography>
</Modal>
```

### `PromptModal`

```tsx
<PromptModal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Rename"
  label="Name"
  defaultValue="New project"
  onConfirm={(value) => rename(value)}
/>
```

Pressing Enter in the input confirms the prompt. `destructive` changes the confirm action styling.

### `Drawer`

```tsx
<Drawer
  isOpen={open}
  onClose={() => setOpen(false)}
  anchor="left"
>
  Navigation
</Drawer>
```

`anchor` supports `left`, `right`, `top`, and `bottom`. Escape closes an open drawer and the body is locked while it is mounted.

### `Menu` and `ContextMenu`

```tsx
<Menu
  items={[
    { label: 'Edit', onClick: edit },
    { label: 'Delete', danger: true, onClick: remove },
    { label: '', divider: true },
  ]}
>
  <Button>Actions</Button>
</Menu>
```

`ContextMenu` uses the same `MenuItem`-style fields but opens from a right-click instead of a trigger click.

### `Tooltip`

```tsx
<Tooltip label="More information" placement="right">
  <Button aria-label="Info">?</Button>
</Tooltip>
```

Tooltips appear after a short delay on mouse hover or focus.

### Toasts

Wrap the application with `ToastProvider`, then call `useToast` from descendants:

```tsx
<ToastProvider>
  <App />
</ToastProvider>
```

```tsx
const { addToast, removeToast } = useToast();

addToast('Saved successfully', 'success');
addToast('Something went wrong', 'error', 5000);
```

`ToastType` is `success | error | info | warning`. The default duration is 3000 ms; a duration of `0` leaves the toast until it is explicitly removed.

---

## Progress and loading

### `CircularProgress`

```tsx
<CircularProgress />
<CircularProgress value={65} size={48} strokeWidth={5} />
```

Omitting `value` creates an indeterminate spinner. Values are clamped to `0..100`.

### `LinearProgress`

```tsx
<LinearProgress />
<LinearProgress value={65} />
```

As with `CircularProgress`, omitting `value` produces an indeterminate indicator.

### `Skeleton`

```tsx
<Skeleton variant="text" width="240px" />
<Skeleton variant="circular" />
<Skeleton variant="rectangular" height={120} />
```

Variants are `text`, `circular`, and `rectangular`.

---

## Typography

`TypographyVariant` supports:

- `h1`
- `h2`
- `h3`
- `h4`
- `body1`
- `body2`
- `caption`
- `overline`

```tsx
<Typography variant="h2">Dashboard</Typography>
<Typography variant="body2" color="#666">Last updated just now.</Typography>
<Typography variant="caption" align="center">Caption</Typography>
```

Use `as` when you need a different semantic HTML element without changing the visual variant.

---

## Theme system

The library ships with `defaultTheme`, containing colors, spacing, radii, shadows, and typography tokens.

```tsx
import {
  ThemeProvider,
  defaultTheme,
  useTheme,
} from '@bananacool467/ui-tools';

const theme = {
  colors: {
    primary: '#7c3aed',
  },
  spacing: {
    md: '18px',
  },
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Page />
    </ThemeProvider>
  );
}

function Page() {
  const theme = useTheme();
  return <div style={{ color: theme.colors.primary }}>Hello</div>;
}
```

`ThemeProvider` accepts a deep partial theme and merges it with the default theme, so you only need to provide the tokens you want to override.

### Default spacing

`xs`, `sm`, `md`, `lg`, `xl`, `xxl` → `4px`, `8px`, `16px`, `24px`, `32px`, `48px`.

### Default radii

`sm`, `md`, `lg`, `xl`, `pill`.

### Typography tokens

The default theme provides display/body font families, sizes from `xs` through `3xl`, and weights `regular`, `medium`, `semibold`, and `bold`.

---

# Terminal

UI Tools has two separate pieces for terminal functionality:

1. `Terminal` — the React/browser terminal component.
2. `useTerminal` — the Node.js backend WebSocket/PTY handler, exported from `@bananacool467/ui-tools/backend`.

The backend **requires an authentication token** before it will create a WebSocket session or spawn a PTY.

## Backend installation

The backend uses `ws` and `@lydell/node-pty`. They are dependencies of the package.

Import it with:

```ts
import { useTerminal } from '@bananacool467/ui-tools/backend';
```

## Minimal backend setup

```ts
const terminalHandler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
});

app.get('/terminal-stream', terminalHandler);
```

The browser component receives the same token:

```tsx
<Terminal token={terminalToken} />
```

The browser sends the token through the WebSocket subprotocol rather than putting it in the URL query string.

> Do not expose a long-lived terminal token in a public application. Prefer an authenticated application session or a short-lived credential.

## `useTerminal` options

```ts
interface UseTerminalOptions {
  path?: string;
  shell?: string;
  shellArgs?: string[];
  maxHistory?: number;
  token: string | undefined;
  restrictToLocalhost?: boolean;
  startupShell?: string;
  startupShellArgs?: string[];
  allowedOrigins?: string[];
  strictConnection?: boolean;
  executionMode?: 'sandbox' | 'restricted' | 'host';
  strictExecution?: boolean;
  sandboxCommand?: string;
  workspaceRoot?: string;
  allowNetwork?: boolean;
  authentication?: (
    providedToken: string | null,
    req: IncomingMessage,
    res: ServerResponse
  ) => false | { id: string } | Promise<false | { id: string }>;
  credentials?: Cred[];
  credVerification?: (cred: CredExpect[]) => boolean;
  strictEnv?: boolean;
  env?: Record<string, string>;
  maxSessions?: number;
  maxConnections?: number;
}
```

### Authentication

The simplest authentication mode is a shared token:

```ts
const handler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
});
```

For application-specific authentication, provide `authentication`. Return `false` to reject a connection or an object containing a stable user `id` to authenticate it:

```ts
const handler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
  authentication: async (providedToken, req, res) => {
    const user = await getUserFromSession(req);
    if (!user || providedToken !== user.terminalToken) {
      return false;
    }
    return { id: user.id };
  },
});
```

When an existing session is resumed, its user ID is checked against the authenticated user.

### Credential challenges

For an additional credential prompt, provide `credentials` and `credVerification`:

```ts
const handler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
  credentials: [
    { credName: 'PIN', credTypes: ['password', 'string'] },
  ],
  credVerification: (credentials) => {
    return credentials.some(
      (cred) => cred.credName === 'PIN' && cred.credValue === '1234'
    );
  },
});
```

`CredTypes` are `password`, `string`, and `number`. The terminal UI handles the credential challenge flow.

### Connection restrictions

For local development, keep the terminal bound to localhost:

```ts
const handler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
  restrictToLocalhost: true,
});
```

`restrictToLocalhost` defaults to `true`.

To restrict WebSocket origins:

```ts
const handler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
  strictConnection: true,
  allowedOrigins: ['https://your-app.example'],
});
```

### Execution modes

`executionMode` supports three modes:

| Mode | Behavior |
| --- | --- |
| `restricted` | Default. Uses a limited environment/PATH but runs the shell on the host. **Not a security sandbox.** |
| `host` | Runs directly with the host environment. Intended for development only. |
| `sandbox` | Runs the shell through Bubblewrap (`bwrap`) on Linux. Fails closed if a usable user namespace cannot be created. |

For a Linux Bubblewrap setup:

```ts
const handler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
  executionMode: 'sandbox',
  workspaceRoot: process.cwd(),
  allowNetwork: false,
});
```

Bubblewrap is not Docker. Install `bwrap` using your operating system's package manager. The sandbox mounts the configured workspace at `/workspace` and, unless `allowNetwork` is enabled, unshares the network namespace.

> `strictEnv` and `restricted` are hardening measures, not substitutes for isolation. Do not present host execution as a security boundary for hostile or multi-tenant users.

### Environment

By default, restricted/sandbox execution receives a minimal environment. You can add variables with `env`:

```ts
const handler = await useTerminal({
  token: process.env.TERMINAL_TOKEN,
  env: {
    SESSION_ID: '123',
  },
});
```

Use `strictEnv: true` when you want to explicitly control the environment rather than inheriting the host environment.

### Resource limits

The backend has built-in limits for terminal sessions and connections:

- Maximum history: 1 MiB.
- Maximum message size: 64 KiB.
- Maximum session lifetime: 1 hour.
- Default maximum sessions: 100.
- Default maximum WebSocket connections: 100.

`maxHistory`, `maxSessions`, and `maxConnections` can be configured through `UseTerminalOptions`; the message-size and maximum-lifetime constants are enforced internally.

---

# Terminal component

`Terminal` renders the terminal UI in React and communicates with the backend through WebSockets.

The `url` prop is a **path on the current host**, not a complete WebSocket URL. The component automatically builds the WebSocket URL using the current page's protocol and host:

```tsx
<Terminal
  token={terminalToken}
  url="/terminal-stream"
  width={600}
  height={420}
  controls
/>
```

If `url` is omitted, the default path is `/terminal-stream`. For an HTTPS page the component uses `wss://`; for an HTTP page it uses `ws://`.

Useful props include:

- `token` — required authentication token.
- `url` — relative WebSocket endpoint path on the current host; defaults to `/terminal-stream`.
- `width` / `height` — terminal dimensions.
- `controls` — shows terminal controls.
- `p` — theme spacing token for padding.
- `bgcolor` — theme background name or custom color.
- `controlscolor` — theme/custom color for controls.
- `variant` — terminal visual variant.

The component includes terminal interaction such as text selection, scrolling, keyboard modifiers, ANSI foreground/background colors, credential prompts, and session reconnection behavior.

---

# Ripple hook

`useRipple` is exported for components that need the same interaction effect used by buttons and selection controls.

```tsx
const { ripples, startRipple, endRipple } = useRipple(false);

startRipple(x, y, size);
endRipple();
```

`RippleItem` contains `id`, `x`, `y`, `size`, `active`, and `exiting` state.

---

# Accessibility and behavior notes

Several components include built-in interaction behavior rather than being simple visual wrappers:

- `Modal` traps Tab focus while open, closes on Escape, locks body scrolling, and restores the previously focused element.
- `Drawer` closes on Escape and locks body scrolling while open.
- `Select` supports keyboard navigation and exposes combobox/listbox roles.
- `Alert`, `Toast`, `Modal`, and `Drawer` use appropriate ARIA roles where applicable.
- `Button`, `Checkbox`, `Radio`, `Switch`, `IconButton`, and `ListItem` include ripple interactions.
- `Tooltip` responds to both pointer hover and focus.

---

# Source-only files and exports

The public root API is defined by `src/index.ts`, not by every file that happens to exist under `src/`.

A few source files deserve special mention:

- `Video.tsx` currently declares a **default export**. Because `src/index.ts` uses `export *`, its default export is not re-exported as a named `Video` export from `@bananacool467/ui-tools`.
- `Autocomplete.tsx`, `CodeEditor.tsx`, and other source files that are not referenced by `src/index.ts` are not part of the root public API.
- `Rating.tsx` is also not referenced by the current root export list.
- The backend entry point is intentionally separate: `src/backend.ts` exports the terminal backend API from `@bananacool467/ui-tools/backend`.

For the authoritative TypeScript API, use the generated `dist/*.d.ts` files produced by `npm run build`.

---

# Build

```bash
npm run setup
npm run build
```

The build compiles TypeScript and flattens the generated `dist/src` output into `dist`.

# License

MIT
