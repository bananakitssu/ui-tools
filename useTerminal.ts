import { WebSocketServer } from 'ws';
import * as pty from '@lydell/node-pty';
import os from 'os';
import crypto from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';

const MAX_HISTORY_LIMIT = 150 * 1024;

interface TerminalSession {
  ptyProcess: pty.IPty;
  ws: import('ws').WebSocket | null;
  cleanupTimeout: ReturnType<typeof setTimeout> | null;
  history: string;
}

export interface UseTerminalOptions {
  path?: string;
  shell?: string;
  shellArgs?: string[];
  maxHistory?: number;
}

export function useTerminal(options: UseTerminalOptions = {}) {
  const {
    path = '/terminal-stream',
    shell = process.platform === 'win32' ? 'powershell.exe' : 'bash',
    shellArgs = shell === 'bash' ? ['-i'] : [],
    maxHistory = MAX_HISTORY_LIMIT,
  } = options;

  const wss = new WebSocketServer({ noServer: true });
  const sessions = new Map<string, TerminalSession>();

  wss.on('connection', (ws) => {
    let clientSessionId: string | null = null;

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());

        if (parsed.type === 'init') {
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

            ws.send(JSON.stringify({ type: 'session', sessionId }));
            ws.send(JSON.stringify({ type: 'history', history: session.history }));

            
          } else {
            
            const newSessionId = crypto.randomUUID();
            clientSessionId = newSessionId;

            

            const ptyProcess = pty.spawn(shell, shellArgs, {
              name: 'xterm-256color',
              cols: cols || 29,
              rows: rows || 8,
              cwd: process.env.HOME || os.homedir(),
              env: { ...process.env, TERM: 'xterm-256color' },
            });

            setTimeout(() => {
              if (shell === 'bash') {
                ptyProcess.write('export PS1="\\[\\e[1;36m\\]\\w\\[\\e[0m\\] \\[\\e[1;32m\\]\\$\\[\\e[0m\\] "; clear\r');
              } else if (shell === 'powershell.exe') {
                ptyProcess.write('function prompt { "PS $(get-location)> " }; clear\r');
              }
            }, 100);

            const sessionState: TerminalSession = {
              ptyProcess,
              ws,
              cleanupTimeout: null,
              history: '',
            };
            sessions.set(newSessionId, sessionState);

            ptyProcess.onData((data) => {
              const current = sessions.get(newSessionId);
              if (current) {
                current.history += data;
                if (current.history.length > maxHistory) {
                  current.history = current.history.slice(current.history.length - maxHistory);
                }
                if (current.ws && current.ws.readyState === current.ws.OPEN) {
                  current.ws.send(data);
                }
              }
            });

            ws.send(JSON.stringify({ type: 'session', sessionId: newSessionId }));
          }
          return;
        }

        if (clientSessionId) {
          const session = sessions.get(clientSessionId);
          if (session) {
            if (parsed.type === 'input') {
              session.ptyProcess.write(parsed.data);
            } else if (parsed.type === 'resize') {
              const { cols, rows } = parsed.data;
              if (cols && rows) session.ptyProcess.resize(cols, rows);
            }
          }
        }
      } catch (_) {
        if (clientSessionId) {
          const session = sessions.get(clientSessionId);
          if (session) session.ptyProcess.write(message.toString());
        }
      }
    });

    ws.on('close', () => {
      if (clientSessionId && sessions.has(clientSessionId)) {
        const session = sessions.get(clientSessionId)!;
        session.ws = null;

        

        session.cleanupTimeout = setTimeout(() => {
          
          try { session.ptyProcess.kill(); } catch (_) {}
          sessions.delete(clientSessionId!);
        }, 10 * 60 * 1000);
      }
    });

    ws.on('error', (err) => {
      console.error('Terminal WebSocket error:', err);
    });
  });

  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url === path && req.headers.upgrade?.toLowerCase() === 'websocket') {
      req.socket.setTimeout(0);
      req.socket.setNoDelay(true);
      wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
        wss.emit('connection', ws, req);
      });
    } else {
      next();
    }
  };
}
