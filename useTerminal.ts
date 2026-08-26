import type { IncomingMessage, ServerResponse } from "http";

const MAX_HISTORY_LIMIT = 150 * 1024;
const isNode = typeof process !== "undefined" && process.versions?.node != null;

interface TerminalSession {
  ptyProcess: any;
  ws: import("ws").WebSocket | null;
  cleanupTimeout: ReturnType<typeof setTimeout> | null;
  history: string;
}

export interface UseTerminalOptions {
  path?: string;
  shell?: string;
  shellArgs?: string[];
  maxHistory?: number;
  token?: string;
}

export type TerminalHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  next?: () => void,
) => void;

export function useTerminal(token?: string): Promise<TerminalHandler | undefined>;
export function useTerminal(
  options?: UseTerminalOptions,
): Promise<TerminalHandler | undefined>;
export async function useTerminal(
  tokenOrOptions: string | UseTerminalOptions = {},
): Promise<TerminalHandler | undefined> {
  if (!isNode) {
    console.warn("useTerminal must be called in a Node.js environment");
    return undefined;
  }

  const [
    { WebSocketServer },
    ptyModule,
    osModule,
    cryptoModule,
  ] = await Promise.all([
    import("ws"),
    import("@lydell/node-pty"),
    import("os"),
    import("crypto"),
  ]);

  const options: UseTerminalOptions =
    typeof tokenOrOptions === "string"
      ? { token: tokenOrOptions }
      : tokenOrOptions;

  const {
    path = "/terminal-stream",
    shell = process.platform === "win32" ? "powershell.exe" : "bash",
    shellArgs = shell === "bash" ? ["-i"] : [],
    maxHistory = MAX_HISTORY_LIMIT,
    token,
  } = options;

  const wss = new WebSocketServer({ noServer: true });
  const sessions = new Map<string, TerminalSession>();

  const tokensMatch = (provided: string | null, expected: string): boolean => {
    if (!provided) return false;

    const providedBytes = Buffer.from(provided);
    const expectedBytes = Buffer.from(expected);

    return (
      providedBytes.length === expectedBytes.length &&
      cryptoModule.timingSafeEqual(providedBytes, expectedBytes)
    );
  };

  wss.on("connection", (ws: any) => {
    let clientSessionId: string | null = null;

    ws.on("message", (message: any) => {
      try {
        const parsed = JSON.parse(message.toString());

        if (parsed.type === "init") {
          const { sessionId, cols, rows } = parsed.data;

          if (sessionId && sessions.has(sessionId)) {
            clientSessionId = sessionId;
            const session = sessions.get(sessionId)!;

            if (session.cleanupTimeout) {
              clearTimeout(session.cleanupTimeout);
              session.cleanupTimeout = null;
            }

            session.ws = ws;

            if (cols && rows) session.ptyProcess.resize(cols, rows);

            ws.send(JSON.stringify({ type: "session", sessionId }));
            ws.send(JSON.stringify({ type: "history", history: session.history }));
          } else {
            const newSessionId = cryptoModule.randomUUID();
            clientSessionId = newSessionId;

            const ptyProcess = ptyModule.spawn(shell, shellArgs, {
              name: "xterm-256color",
              cols: cols || 29,
              rows: rows || 8,
              cwd: process.env.HOME || osModule.homedir(),
              env: { ...process.env, TERM: "xterm-256color" },
            });

            setTimeout(() => {
              if (shell === "bash") {
                ptyProcess.write(
                  'export PS1="\\[\\e[1;36m\\]\\w\\[\\e[0m\\] \\[\\e[1;32m\\]\\$\\[\\e[0m\\] "; clear\r',
                );
              } else if (shell === "powershell.exe") {
                ptyProcess.write('function prompt { "PS $(get-location)> " }; clear\r');
              }
            }, 100);

            const sessionState: TerminalSession = {
              ptyProcess,
              ws,
              cleanupTimeout: null,
              history: "",
            };
            sessions.set(newSessionId, sessionState);

            ptyProcess.onExit((event: any) => {
              if (ws.readyState === ws.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: "exit",
                    code: event.exitCode,
                    signal: event.signal,
                  }),
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
                  current.history.length - maxHistory,
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

          if (parsed.type === "input") {
            session.ptyProcess.write(parsed.data);
          } else if (parsed.type === "resize") {
            const { cols, rows } = parsed.data;
            if (cols && rows) session.ptyProcess.resize(cols, rows);
          } else if (parsed.type === "restart") {
            session.history = "";
            session.ptyProcess.kill();
            ws.send(JSON.stringify({ type: "giveInit" }));
          }
        }
      } catch (_) {
        if (clientSessionId) {
          const session = sessions.get(clientSessionId);
          if (session) session.ptyProcess.write(message.toString());
        }
      }
    });

    ws.on("close", () => {
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

  return (req, res, next) => {
    const requestUrl = new URL(req.url || "/", "http://localhost");
    const isWebSocketUpgrade =
      req.headers.upgrade?.toLowerCase() === "websocket";

    if (requestUrl.pathname !== path || !isWebSocketUpgrade) {
      if (next) {
        next();
      } else {
        res.writeHead(404);
        res.end();
      }
      return;
    }

    const authorization = req.headers.authorization;
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;
    const providedToken =
      requestUrl.searchParams.get("token") || bearerToken;

    if (token && !tokensMatch(providedToken, token)) {
      res.writeHead(401, {
        "Content-Type": "text/plain",
        Connection: "close",
      });
      res.end("Unauthorized");
      return;
    }

    req.socket.setTimeout(0);
    req.socket.setNoDelay(true);
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws: any) => {
      wss.emit("connection", ws, req);
    });
  };
}