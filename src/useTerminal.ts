import type { IncomingMessage, ServerResponse } from "http";

const MAX_HISTORY_LIMIT = 1024 * 1024;
const MAX_SESSION_LIFETIME = 60 * 60 * 1000;
const MAX_MESSAGE_SIZE = 64 * 1024;
const isNode = typeof process !== "undefined" && process.versions?.node != null;

interface AuthenticatedUser {
  id: string;
}

type AuthenticationResult =
false |
AuthenticatedUser;

export interface CredExpect {
  credName: string;
  credTypes: ('password' | 'string' | 'number')[];
  credValue: string | number;
}

export interface Cred {
  credName: string;
  credTypes: ('password' | 'string' | 'number')[];
}

export type TerminalExecutionMode = "sandbox" | "restricted" | "host";

interface TerminalSession {
  ptyProcess: any;
  ws: import("ws").WebSocket | null;
  cleanupTimeout: ReturnType<typeof setTimeout> | null;
  maxLifetimeTimeout?: ReturnType<typeof setTimeout>;
  history: string;
  userId: string;
}

export interface UseTerminalOptions {
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





  executionMode?: TerminalExecutionMode;

  strictExecution?: boolean;

  sandboxCommand?: string;

  workspaceRoot?: string;

  allowNetwork?: boolean;
  authentication?: (
  providedToken: string | null,
  req: IncomingMessage,
  res: ServerResponse)
  => AuthenticationResult | Promise<AuthenticationResult>;
  credentials?: Cred[];
  credVerification?: (cred: CredExpect[]) => boolean;
  strictEnv?: boolean;
  env?: Record<string, string>;
  maxSessions?: number;
  maxConnections?: number;
}

export type TerminalHandler = (
req: IncomingMessage,
res: ServerResponse,
next?: () => void)
=> void;

export function useTerminal(
options: UseTerminalOptions)
: Promise<TerminalHandler | undefined>;
export async function useTerminal(
options: UseTerminalOptions | undefined = undefined)
: Promise<TerminalHandler | undefined> {
  const configuredToken = options?.token;
  const restrictToLocalhost = options?.restrictToLocalhost ?? true;
  const allowedOrigins = options?.allowedOrigins ?? [];
  const executionMode =
  options?.executionMode ?? (
  options?.strictExecution === true ?
  "sandbox" :
  options?.strictExecution === false ?
  "host" :
  "restricted");
  const strictConnection = options?.strictConnection ?? false;
  const startupShell = options?.startupShell;
  const startupShellArgs = options?.startupShellArgs;
  const authFunction = options?.authentication;
  const pathname = options?.path ?? "/terminal-stream";
  const strictEnv = options?.strictEnv ?? false;
  const env = options?.env ?? {};
  const maxConnections = options?.maxConnections ?? 100;
  const maxSessions = options?.maxSessions ?? 100;
  const allowNetwork = options?.allowNetwork ?? false;
  if (executionMode === "host") {
    console.warn(
      "[UI Tools Backend] executionMode: 'host' runs commands directly on the host."
    );
  } else if (executionMode === "restricted") {
    console.warn(
      "[UI Tools Backend] executionMode: 'restricted' is not a security sandbox. " +
      "Use executionMode: 'sandbox' for host isolation."
    );
  }
  if (
  typeof configuredToken !== "string" ||
  configuredToken.length === 0)
  {
    throw new Error(
      "useTerminal requires an authentication token. " +
      'Use useTerminal({ token: process.env.TERMINAL_TOKEN }).'
    );
  }

  if (!isNode) {
    console.warn("useTerminal must be called in a Node.js environment");
    return undefined;
  }

  const [
  { WebSocketServer },
  ptyModule,
  osModule,
  cryptoModule,
  childProcessModule,
  pathModule] =
  await Promise.all([
  import("ws"),
  import("@lydell/node-pty"),
  import("os"),
  import("crypto"),
  import("node:child_process"),
  import("node:path")]
  );

  const {
    path = pathname,
    shell = startupShell ?? (process.platform === "win32" ? "powershell.exe" : "bash"),
    shellArgs = startupShellArgs ?? (shell === "bash" ? ["-i"] : []),
    maxHistory = Math.min(
      Math.max(options?.maxHistory ?? MAX_HISTORY_LIMIT, 0),
      MAX_HISTORY_LIMIT
    )
  } = options!;
  const token = configuredToken;
  const workspaceRoot = pathModule.resolve(
    options?.workspaceRoot ?? process.cwd()
  );
  const defaultPath =
  process.platform === "win32" ?
  "C:\\Windows\\system32;C:\\Windows" :
  "/bin:/usr/bin";
  const terminalEnv =
  executionMode === "host" && !strictEnv ?
  {
    ...process.env,
    ...env,
    TERM: "xterm-256color"
  } :
  {
    ...env,
    HOME: executionMode === "sandbox" ?
    "/workspace" :
    env.HOME ?? process.env.HOME ?? osModule.homedir(),
    PATH: env.PATH ?? defaultPath,
    TERM: "xterm-256color"
  };

  const findExecutable = (name: string): string | undefined => {
    try {
      const lookupCommand = process.platform === "win32" ? "where" : "which";
      return childProcessModule.
      execFileSync(lookupCommand, [name], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
      }).
      trim().
      split(/\r?\n/)[0] || undefined;
    } catch (_) {
      return undefined;
    }
  };

  let sandboxCommandPath: string | undefined;
  if (executionMode === "sandbox") {
    sandboxCommandPath =
    options?.sandboxCommand ?? findExecutable("bwrap");
    if (!sandboxCommandPath) {
      throw new Error(
        "executionMode: 'sandbox' requires Bubblewrap (bwrap). " +
        "Install bwrap or choose executionMode: 'restricted' for local development."
      );
    }
    if (process.platform !== "linux") {
      throw new Error(
        "Bubblewrap sandbox execution is currently supported on Linux only."
      );
    }
    try {
      childProcessModule.execFileSync(
        sandboxCommandPath,
        [
        "--die-with-parent",
        "--new-session",
        "--unshare-user",
        "--ro-bind-try",
        "/bin",
        "/bin",
        "--ro-bind-try",
        "/usr",
        "/usr",
        "--ro-bind-try",
        "/lib",
        "/lib",
        "--ro-bind-try",
        "/lib64",
        "/lib64",
        "--ro-bind-try",
        "/nix",
        "/nix",
        "--ro-bind-try",
        "/run",
        "/run",
        "--",
        "/bin/true"],

        { stdio: "ignore", timeout: 5000 }
      );
    } catch (_) {
      throw new Error(
        "Bubblewrap is installed but cannot create a user namespace. " +
        "Enable unprivileged user namespaces or choose executionMode: 'restricted'."
      );
    }
  }

  const wss = new WebSocketServer({ noServer: true });
  const sessions = new Map<string, TerminalSession>();

















  const authenticate = async (
  provided: string | null,
  req: IncomingMessage,
  res: ServerResponse)
  : Promise<AuthenticatedUser | false> => {
    if (authFunction) {
      return await authFunction(provided, req, res);
    }

    if (!provided) return false;

    const providedBytes = Buffer.from(provided);
    const expectedBytes = Buffer.from(token);

    const valid =
    providedBytes.length === expectedBytes.length &&
    cryptoModule.timingSafeEqual(providedBytes, expectedBytes);

    return valid ? { id: "token-user" } : false;
  };

  const getSubprotocolToken = (req: IncomingMessage): string | null => {
    const protocolHeader = req.headers["sec-websocket-protocol"];
    const headerValue = Array.isArray(protocolHeader) ?
    protocolHeader.join(",") :
    protocolHeader;
    if (!headerValue) return null;

    const tokenProtocol = headerValue.
    split(",").
    map((protocol) => protocol.trim()).
    find((protocol) => protocol.startsWith("terminal-token."));
    if (!tokenProtocol) return null;

    const encodedToken = tokenProtocol.slice("terminal-token.".length);
    if (!encodedToken) return null;

    try {
      const base64 = encodedToken.
      replace(/-/g, "+").
      replace(/_/g, "/").
      padEnd(Math.ceil(encodedToken.length / 4) * 4, "=");
      return Buffer.from(base64, "base64").toString("utf8");
    } catch (_) {
      return null;
    }
  };

  wss.on(
    "connection",
    (ws: any, _: IncomingMessage, authenticatedUser: AuthenticatedUser) => {
      let authenticated = false;
      if (wss.clients.size >= maxConnections) {
        ws.close(4003, "Too many connections");
        return;
      }
      const credentialChallenge = options?.credentials?.map(
        ({ credName, credTypes }) => ({ credName, credTypes })
      );
      if (options?.credVerification) {
        ws.send(JSON.stringify({
          type: "credVerify",
          data: { creds: credentialChallenge }
        }));
      } else {
        authenticated = true;
        ws.send(JSON.stringify({ type: "authReady" }));
      }
      let clientSessionId: string | null = null;

      const heartbeat = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.ping();
        }
      }, 30000);

      ws.on("message", (message: any) => {
        try {
          const rawMessage =
          typeof message === "string" ?
          message :
          message.toString("utf8");

          if (Buffer.byteLength(rawMessage, "utf8") >= MAX_MESSAGE_SIZE) {
            ws.close(1009, "Message too large");
            return;
          }

          let parsed: any;

          try {
            parsed = JSON.parse(rawMessage);
          } catch {

            ws.close(1007, "Invalid JSON");
            return;
          }

          if (
          parsed === null ||
          typeof parsed !== "object" ||
          Array.isArray(parsed))
          {
            ws.close(1007, "Invalid message");
            return;
          }


          const messageData = parsed as Record<string, unknown>;
          if (!authenticated) {
            if (parsed.type !== "credVerify") {
              ws.close(4001, "Unauthorized");
              return;
            }

            if (
            !options?.credVerification ||
            !options.credVerification(parsed.data))
            {
              ws.send(JSON.stringify({
                type: "credFail",
                message: "Invalid credentials"
              }));
              return;
            }

            authenticated = true;
            ws.send(JSON.stringify({ type: "authReady" }));
            return;
          }

          if (
          parsed.type === "init" &&
          parsed.data &&
          typeof parsed.data === "object")
          {
            const { sessionId, cols, rows } = parsed.data;

            if (
            sessionId !== undefined &&
            typeof sessionId !== "string")
            {
              return;
            }

            if (sessionId && sessions.has(sessionId)) {
              clientSessionId = sessionId;
              const session = sessions.get(sessionId)!;
              if (session.userId !== authenticatedUser.id) {
                ws.close(4001, "Unauthorized");
                return;
              }

              if (session.cleanupTimeout) {
                clearTimeout(session.cleanupTimeout);
                session.cleanupTimeout = null;
              }

              session.ws = ws;

              if (cols && rows) session.ptyProcess.resize(cols, rows);

              ws.send(JSON.stringify({ type: "session", sessionId }));
              ws.send(JSON.stringify({ type: "history", history: session.history }));
            } else {
              if (sessions.size >= maxSessions) {
                ws.close(4003, "Too many sessions");
                return;
              }
              const newSessionId = cryptoModule.randomUUID();
              clientSessionId = newSessionId;

              const spawnCommand =
              executionMode === "sandbox" ?
              sandboxCommandPath! :
              shell;
              const spawnArgs =
              executionMode === "sandbox" ?
              [
              "--die-with-parent",
              "--new-session",
              "--unshare-user",
              "--unshare-pid",
              "--unshare-ipc",
              "--unshare-uts",
              ...(allowNetwork ? [] : ["--unshare-net"]),
              "--proc",
              "/proc",
              "--dev",
              "/dev",
              "--tmpfs",
              "/tmp",
              "--ro-bind-try",
              "/bin",
              "/bin",
              "--ro-bind-try",
              "/usr",
              "/usr",
              "--ro-bind-try",
              "/lib",
              "/lib",
              "--ro-bind-try",
              "/lib64",
              "/lib64",
              "--ro-bind-try",
              "/nix",
              "/nix",
              "--ro-bind-try",
              "/run",
              "/run",
              "--bind",
              workspaceRoot,
              "/workspace",
              "--chdir",
              "/workspace",
              "--clearenv",
              ...Object.entries(terminalEnv).flatMap(([key, value]) => [
              "--setenv",
              key,
              String(value)]
              ),
              "--",
              shell,
              ...shellArgs] :

              shellArgs;
              const spawnCwd =
              executionMode === "sandbox" ?
              workspaceRoot :
              process.env.HOME || osModule.homedir();
              const ptyProcess = ptyModule.spawn(spawnCommand, spawnArgs, {
                name: "xterm-256color",
                cols: cols || 29,
                rows: rows || 8,
                cwd: spawnCwd,
                env: terminalEnv
              });

              const maxLifetimeTimeout = setTimeout(() => {
                try {
                  ptyProcess.kill();
                  sessions.delete(newSessionId);
                } catch (_) {

                }
              }, MAX_SESSION_LIFETIME);

              setTimeout(() => {
                if (shell === "bash") {
                  ptyProcess.write(
                    'export PS1="\\[\\e[1;36m\\]\\w\\[\\e[0m\\] \\[\\e[1;32m\\]\\$\\[\\e[0m\\] "; clear\r'
                  );
                } else if (shell === "powershell.exe") {
                  ptyProcess.write('function prompt { "PS $(get-location)> " }; clear\r');
                }
              }, 100);

              const sessionState: TerminalSession = {
                ptyProcess,
                ws,
                cleanupTimeout: null,
                maxLifetimeTimeout,
                history: "",
                userId: authenticatedUser.id
              };
              sessions.set(newSessionId, sessionState);

              ptyProcess.onExit((event: any) => {
                if (ws.readyState === ws.OPEN) {
                  ws.send(
                    JSON.stringify({
                      type: "exit",
                      code: event.exitCode,
                      signal: event.signal
                    })
                  );
                }
                sessions.delete(newSessionId);
              });

              ptyProcess.onData((data: string) => {
                const current = sessions.get(newSessionId);
                if (!current) return;

                current.history += data;
                if (current.history.length > maxHistory) {
                  current.history = current.history.slice(
                    current.history.length - maxHistory
                  );
                }

                if (current.ws && current.ws.readyState === current.ws.OPEN) {
                  current.ws.send(data);
                }
              });

              ws.send(JSON.stringify({ type: "session", sessionId: newSessionId }));
            }
            return;
          }

          if (clientSessionId) {
            const session = sessions.get(clientSessionId);
            if (!session) return;

            if (
            parsed.type === "input" &&
            typeof parsed.data === "string")
            {
              session.ptyProcess.write(parsed.data);
            } else if (
            parsed.type === "resize" &&
            Number.isInteger(parsed.data?.cols) &&
            Number.isInteger(parsed.data?.rows) &&
            parsed.data.cols > 0 &&
            parsed.data.rows > 0)
            {
              const { cols, rows } = parsed.data;
              if (cols && rows) session.ptyProcess.resize(cols, rows);
            } else if (
            parsed.type === "restart")
            {
              session.history = "";
              session.ptyProcess.kill();
              ws.send(JSON.stringify({ type: "giveInit" }));
            }
          }
        } catch (error) {
          console.error("Terminal protocol error:", error);
          ws.close(1011, "Internal server error");
          return;
        }
      });

      ws.on("close", () => {
        clearInterval(heartbeat);
        if (!clientSessionId || !sessions.has(clientSessionId)) return;

        const session = sessions.get(clientSessionId)!;
        session.ws = null;
        session.cleanupTimeout = setTimeout(() => {
          try {
            session.ptyProcess.kill();
          } catch (_) {

          }
          sessions.delete(clientSessionId!);
        }, 10 * 60 * 1000);
      });

      ws.on("error", (error: any) => {
        console.error("Terminal WebSocket error:", error);
      });
    });

  return async (req, res, next) => {
    const protocol = req.headers["x-forwarded-proto"] === "https" ||
    'encrypted' in req.socket && req.socket.encrypted ?
    "https" :
    "http";

    const base = `${protocol}://${req.headers.host}`;
    const requestUrl = new URL(req.url || "/", restrictToLocalhost ? "http://localhost" : base);
    const origin = req.headers.origin;
    if (!restrictToLocalhost && protocol !== "https") {
      res.writeHead(400);
      res.end("Secure connection required");
      return;
    }
    if (strictConnection && !allowedOrigins.includes(origin || "unknown")) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    if (!requestUrl.pathname.startsWith(path)) {
      if (next) {
        next();
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
      return;
    }
    const remoteAddress = req.socket.remoteAddress;

    const isLocalhost =
    remoteAddress === "127.0.0.1" ||
    remoteAddress === "::1" ||
    remoteAddress === "::ffff:127.0.0.1";

    if (restrictToLocalhost && !isLocalhost) {
      res.writeHead(403);
      res.end("Terminal is restricted to localhost");
      return;
    }
    const isWebSocketUpgrade =
    req.headers.upgrade?.toLowerCase() === "websocket";

    if (requestUrl.pathname !== path || !isWebSocketUpgrade) {
      if (next) {
        next();
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
      return;
    }

    const authorization = req.headers.authorization;
    const bearerToken = authorization?.startsWith("Bearer ") ?
    authorization.slice("Bearer ".length) :
    null;
    const providedToken = getSubprotocolToken(req) || bearerToken;



    const authenticatedUser = await authenticate(
      providedToken,
      req,
      res
    );

    if (!authenticatedUser) {
      res.writeHead(401, {
        "Content-Type": "text/plain",
        Connection: "close"
      });
      res.end("Unauthorized");
      return;
    }

    req.socket.setTimeout(0);
    req.socket.setNoDelay(true);
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws: any) => {
      wss.emit("connection", ws, req, authenticatedUser);
    });
  };
}