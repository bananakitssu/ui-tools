import { useState, useRef, useEffect } from "react";


const ANSI_COLORS: Record<string, string> = {
  "30": "#000000", "31": "#cd0000", "32": "#00cd00", "33": "#cdcd00",
  "34": "#0000ee", "35": "#cd00cd", "36": "#00cdcd", "37": "#e5e5e5",
  "90": "#7f7f7f", "91": "#ff0000", "92": "#00ff00", "93": "#ffff00",
  "94": "#5c5cff", "95": "#ff00ff", "96": "#00ffff", "97": "#ffffff",
};

const ANSI_BG_COLORS: Record<string, string> = {
  "40": "#000000", "41": "#cd0000", "42": "#00cd00", "43": "#cdcd00",
  "44": "#0000ee", "45": "#cd00cd", "46": "#00cdcd", "47": "#e5e5e5",
  "100": "#7f7f7f", "101": "#ff0000", "102": "#00ff00", "103": "#ffff00",
  "104": "#5c5cff", "105": "#ff00ff", "106": "#00ffff", "107": "#ffffff",
};

const get256Color = (index: number): string => {
  if (index < 8) return ANSI_COLORS[String(index + 30)] || "#000000";
  if (index < 16) return ANSI_COLORS[String(index - 8 + 90)] || "#ffffff";
  
  if (index >= 16 && index <= 231) {
    const r = Math.floor((index - 16) / 36);
    const g = Math.floor(((index - 16) % 36) / 6);
    const b = (index - 16) % 6;
    const rHex = Math.round(r * 51).toString(16).padStart(2, '0');
    const gHex = Math.round(g * 51).toString(16).padStart(2, '0');
    const bHex = Math.round(b * 51).toString(16).padStart(2, '0');
    return `#${rHex}${gHex}${bHex}`;
  }
  
  const grayVal = Math.round((index - 232) * 10 + 8).toString(16).padStart(2, '0');
  return `#${grayVal}${grayVal}${grayVal}`;
};

const getCtrlChar = (key: string): string | null => {
  const lower = key.toLowerCase();
  
  if (lower >= 'a' && lower <= 'z') {
    return String.fromCharCode(lower.charCodeAt(0) - 96);
  }
  
  switch (lower) {
    case '@': case ' ': return '\x00';
    case '[': return '\x1b';
    case '\\': return '\x1c';
    case ']': return '\x1d';
    case '^': return '\x1e';
    case '_': return '\x1f';
    case '?': return '\x7f';
    case 'm': return '\r';
    case 'j': return '\n';
    case 'i': return '\t';
    default: return null;
  }
};

interface Cell {
  char: string;
  fg: string;
  bg: string;
}


interface RepeatingButtonProps {
  style: React.CSSProperties;
  onAction: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}


const RepeatingButton = ({ style, onAction, onFocus, children }: RepeatingButtonProps) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startRepeat = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    onAction();
    onFocus();

    stopRepeat();

    
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        onAction();
        onFocus();
      }, 60);
    }, 350);
  };

  const stopRepeat = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopRepeat();
  }, []);

  return (
    <button
      style={style}
      onPointerDown={startRepeat}
      onPointerUp={stopRepeat}
      onPointerLeave={stopRepeat}
      onPointerCancel={stopRepeat}
    >
      {children}
    </button>
  );
};

export default function Terminal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  
  const [inputValue, setInputValue] = useState(' ');

  const [connectionState, setConnectionState] = useState<"connected" | "reconnecting" | "failed">("reconnecting");
  const sessionIdRef = useRef<string | null>(null);

  const [ctrlPressed, setCtrlPressedState] = useState(false);
  const [altPressed, setAltPressedState] = useState(false);
  const [shiftPressed, setShiftPressedState] = useState(false);

  const ctrlPressedRef = useRef(false);
  const altPressedRef = useRef(false);
  const shiftPressedRef = useRef(false);

  const setCtrlPressed = (val: boolean) => {
    ctrlPressedRef.current = val;
    setCtrlPressedState(val);
  };
  const setAltPressed = (val: boolean) => {
    altPressedRef.current = val;
    setAltPressedState(val);
  };
  const setShiftPressed = (val: boolean) => {
    shiftPressedRef.current = val;
    setShiftPressedState(val);
  };

  const COLS = 29;
  const ROWS = 20; 
  const PADDING = 8;
  const CHARACTER_WIDTH = 9.6; 
  const CHARACTER_HEIGHT = 18;  

  const CONTAINER_WIDTH = 295; 
  const CONTAINER_HEIGHT = 380; 

  const gridRef = useRef<Cell[][]>(
    Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ char: ' ', fg: '#ffffff', bg: '#0a0a0a' }))
    )
  );

  const isAltScreenRef = useRef(false);
  const mainGridRef = useRef<Cell[][] | null>(null);
  const mainCursorRef = useRef({ x: 0, y: 0 });
  const savedCursorRef = useRef({ x: 0, y: 0 });

  const scrollTopRef = useRef(0);
  const scrollBottomRef = useRef(ROWS - 1);

  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchAccumulatedRef = useRef(0);

  const scrollbackRef = useRef<Cell[][]>([]);
  const scrollOffsetRef = useRef(0); 

  const cursorRef = useRef({ x: 0, y: 0 });
  const currentStyleRef = useRef({ fg: '#ffffff', bg: '#0a0a0a', inverse: false });

  const clearGrid = (clearHistory = false) => {
    gridRef.current = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ char: ' ', fg: '#ffffff', bg: '#0a0a0a' }))
    );
    cursorRef.current = { x: 0, y: 0 };
    if (clearHistory) {
      scrollbackRef.current = [];
      scrollOffsetRef.current = 0;
    }
  };

  const writeToTerminal = (data: string) => {
    const grid = gridRef.current;
    let { x, y } = cursorRef.current;
    let style = currentStyleRef.current;

    const scrollUp = (amount: number) => {
      const top = scrollTopRef.current;
      const bottom = scrollBottomRef.current;
      for (let step = 0; step < amount; step++) {
        if (!isAltScreenRef.current && top === 0 && bottom === ROWS - 1) {
          scrollbackRef.current.push(grid[0].map(cell => ({ ...cell })));
          if (scrollbackRef.current.length > 1000) {
            scrollbackRef.current.shift();
          }
        }

        for (let r = top; r < bottom; r++) {
          grid[r] = grid[r + 1].map(cell => ({ ...cell }));
        }
        grid[bottom] = Array.from({ length: COLS }, () => ({ char: ' ', fg: '#ffffff', bg: '#0a0a0a' }));
      }
    };

    const scrollDown = (amount: number) => {
      const top = scrollTopRef.current;
      const bottom = scrollBottomRef.current;
      for (let step = 0; step < amount; step++) {
        for (let r = bottom; r > top; r--) {
          grid[r] = grid[r - 1].map(cell => ({ ...cell }));
        }
        grid[top] = Array.from({ length: COLS }, () => ({ char: ' ', fg: '#ffffff', bg: '#0a0a0a' }));
      }
    };

    let i = 0;
    while (i < data.length) {
      const char = data[i];

      if (char === '\r') {
        x = 0;
        i++;
      } else if (char === '\n') {
        if (y === scrollBottomRef.current) {
          scrollUp(1);
        } else {
          y = Math.min(ROWS - 1, y + 1);
        }
        i++;
      } else if (char === '\b') {
        x = Math.max(0, x - 1);
        i++;
      } else if (char === '\x1b') {
        const nextChar = data[i + 1];
        
        if (nextChar === '[') {
          let seqEnd = i + 2;
          while (seqEnd < data.length && !/[a-zA-Z]/.test(data[seqEnd])) {
            seqEnd++;
          }
          const sequence = data.slice(i + 2, seqEnd);
          const commandLetter = data[seqEnd];
          i = seqEnd + 1;

          if (commandLetter === 'm') {
            const params = sequence.split(';');
            for (let idx = 0; idx < params.length; idx++) {
              const p = params[idx];
              if (p === '0' || p === '') {
                style = { fg: '#ffffff', bg: '#0a0a0a', inverse: false };
              } else if (p === '7') {
                style.inverse = true;
              } else if (p === '27') {
                style.inverse = false;
              } else if (p === '39') {
                style.fg = '#ffffff';
              } else if (p === '49') {
                style.bg = '#0a0a0a';
              } 
              else if (p === '38' && params[idx + 1] === '5') {
                const colorIdx = parseInt(params[idx + 2], 10);
                if (!isNaN(colorIdx)) style.fg = get256Color(colorIdx);
                idx += 2;
              } else if (p === '48' && params[idx + 1] === '5') {
                const colorIdx = parseInt(params[idx + 2], 10);
                if (!isNaN(colorIdx)) style.bg = get256Color(colorIdx);
                idx += 2;
              }
              else if (p === '38' && params[idx + 1] === '2') {
                const r = parseInt(params[idx + 2], 10);
                const g = parseInt(params[idx + 3], 10);
                const b = parseInt(params[idx + 4], 10);
                if (!isNaN(r) && !isNaN(g) && !isNaN(b)) style.fg = `rgb(${r},${g},${b})`;
                idx += 4;
              } else if (p === '48' && params[idx + 1] === '2') {
                const r = parseInt(params[idx + 2], 10);
                const g = parseInt(params[idx + 3], 10);
                const b = parseInt(params[idx + 4], 10);
                if (!isNaN(r) && !isNaN(g) && !isNaN(b)) style.bg = `rgb(${r},${g},${b})`;
                idx += 4;
              }
              else if (ANSI_COLORS[p]) {
                style.fg = ANSI_COLORS[p];
              } else if (ANSI_BG_COLORS[p]) {
                style.bg = ANSI_BG_COLORS[p];
              }
            }
          } else if (commandLetter === 'H' || commandLetter === 'f') {
            const parts = sequence.split(';');
            const targetY = parts[0] ? parseInt(parts[0], 10) - 1 : 0;
            const targetX = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
            y = Math.min(ROWS - 1, Math.max(0, targetY));
            x = Math.min(COLS - 1, Math.max(0, targetX));
          } else if (commandLetter === 'A') {
            const amount = parseInt(sequence, 10) || 1;
            y = Math.max(0, y - amount);
          } else if (commandLetter === 'B') {
            const amount = parseInt(sequence, 10) || 1;
            y = Math.min(ROWS - 1, y + amount);
          } else if (commandLetter === 'C') {
            const amount = parseInt(sequence, 10) || 1;
            x = Math.min(COLS - 1, x + amount);
          } else if (commandLetter === 'D') {
            const amount = parseInt(sequence, 10) || 1;
            x = Math.max(0, x - amount);
          } else if (commandLetter === 'G') {
            const targetX = (parseInt(sequence, 10) || 1) - 1;
            x = Math.min(COLS - 1, Math.max(0, targetX));
          } else if (commandLetter === 'd') {
            const targetY = (parseInt(sequence, 10) || 1) - 1;
            y = Math.min(ROWS - 1, Math.max(0, targetY));
          } else if (commandLetter === 'J') {
            const mode = sequence || '0';
            if (mode === '0' || mode === '0J') {
              for (let col = x; col < COLS; col++) grid[y][col] = { char: ' ', fg: style.fg, bg: style.bg };
              for (let r = y + 1; r < ROWS; r++) {
                for (let col = 0; col < COLS; col++) grid[r][col] = { char: ' ', fg: style.fg, bg: style.bg };
              }
            } else if (mode === '1' || mode === '1J') {
              for (let r = 0; r < y; r++) {
                for (let col = 0; col < COLS; col++) grid[r][col] = { char: ' ', fg: style.fg, bg: style.bg };
              }
              for (let col = 0; col <= Math.min(x, COLS - 1); col++) grid[y][col] = { char: ' ', fg: style.fg, bg: style.bg };
            } else if (mode === '2' || mode === '2J') {
              for (let r = 0; r < ROWS; r++) {
                for (let col = 0; col < COLS; col++) grid[r][col] = { char: ' ', fg: style.fg, bg: style.bg };
              }
            }
          } else if (commandLetter === 'K') {
            const mode = sequence || '0';
            if (mode === '0' || mode === '0K') {
              for (let col = x; col < COLS; col++) grid[y][col] = { char: ' ', fg: style.fg, bg: style.bg };
            } else if (mode === '1' || mode === '1K') {
              for (let col = 0; col <= Math.min(x, COLS - 1); col++) grid[y][col] = { char: ' ', fg: style.fg, bg: style.bg };
            } else if (mode === '2' || mode === '2K') {
              for (let col = 0; col < COLS; col++) grid[y][col] = { char: ' ', fg: style.fg, bg: style.bg };
            }
          } else if (commandLetter === 'S') {
            const amount = parseInt(sequence, 10) || 1;
            scrollUp(amount);
          } else if (commandLetter === 'T') {
            const amount = parseInt(sequence, 10) || 1;
            scrollDown(amount);
          } else if (commandLetter === 'L') {
            const amount = parseInt(sequence, 10) || 1;
            const top = y;
            const bottom = scrollBottomRef.current;
            for (let step = 0; step < amount; step++) {
              if (top <= bottom) {
                for (let r = bottom; r > top; r--) {
                  grid[r] = grid[r - 1].map(cell => ({ ...cell }));
                }
                grid[top] = Array.from({ length: COLS }, () => ({ char: ' ', fg: '#ffffff', bg: '#0a0a0a' }));
              }
            }
          } else if (commandLetter === 'M') {
            const amount = parseInt(sequence, 10) || 1;
            const top = y;
            const bottom = scrollBottomRef.current;
            for (let step = 0; step < amount; step++) {
              if (top <= bottom) {
                for (let r = top; r < bottom; r++) {
                  grid[r] = grid[r + 1].map(cell => ({ ...cell }));
                }
                grid[bottom] = Array.from({ length: COLS }, () => ({ char: ' ', fg: '#ffffff', bg: '#0a0a0a' }));
              }
            }
          } else if (commandLetter === 'r') {
            const parts = sequence.split(';');
            const top = parts[0] ? parseInt(parts[0], 10) - 1 : 0;
            const bottom = parts[1] ? parseInt(parts[1], 10) - 1 : ROWS - 1;
            scrollTopRef.current = Math.min(ROWS - 1, Math.max(0, top));
            scrollBottomRef.current = Math.min(ROWS - 1, Math.max(0, bottom));
          } else if (commandLetter === 'h') {
            if (sequence === '?1049' || sequence === '?47' || sequence === '?1047') {
              if (!isAltScreenRef.current) {
                mainGridRef.current = gridRef.current.map(row => row.map(cell => ({ ...cell })));
                mainCursorRef.current = { ...cursorRef.current };
                clearGrid();
                isAltScreenRef.current = true;
                scrollOffsetRef.current = 0;
                scrollTopRef.current = 0;
                scrollBottomRef.current = ROWS - 1;
              }
            }
          } else if (commandLetter === 'l') {
            if (sequence === '?1049' || sequence === '?47' || sequence === '?1047') {
              if (isAltScreenRef.current && mainGridRef.current) {
                gridRef.current = mainGridRef.current;
                cursorRef.current = mainCursorRef.current;
                isAltScreenRef.current = false;
                mainGridRef.current = null;
                scrollOffsetRef.current = 0;
                scrollTopRef.current = 0;
                scrollBottomRef.current = ROWS - 1;
              }
            }
          }
        } else if (nextChar === '(' || nextChar === ')') {
          i += 3; 
        } else if (nextChar === '7') {
          savedCursorRef.current = { x, y };
          i += 2;
        } else if (nextChar === '8') {
          x = savedCursorRef.current.x;
          y = savedCursorRef.current.y;
          i += 2;
        } else if (nextChar === 'M') {
          if (y === scrollTopRef.current) {
            scrollDown(1);
          } else {
            y = Math.max(0, y - 1);
          }
          i += 2;
        } else if (nextChar === 'D') {
          if (y === scrollBottomRef.current) {
            scrollUp(1);
          } else {
            y = Math.min(ROWS - 1, y + 1);
          }
          i += 2;
        } else if (nextChar === '=' || nextChar === '>') {
          i += 2;
        } else {
          i += 2;
        }
      } else {
        if (x >= COLS) {
          x = 0;
          if (y === scrollBottomRef.current) {
            scrollUp(1);
          } else {
            y = Math.min(ROWS - 1, y + 1);
          }
        }
        const finalFg = style.inverse ? style.bg : style.fg;
        const finalBg = style.inverse ? style.fg : style.bg;
        grid[y][x] = { char, fg: finalFg, bg: finalBg };
        x++;
        i++;
      }
    }

    cursorRef.current = { x, y };
    currentStyleRef.current = style;
  };

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;
    sessionIdRef.current = localStorage.getItem("terminal_session_id");

    const connect = () => {
      setConnectionState("reconnecting");
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/terminal-stream`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState("connected");
        ws.send(JSON.stringify({
          type: "init",
          data: { 
            sessionId: sessionIdRef.current,
            cols: COLS, 
            rows: ROWS 
          }
        }));
      };

      ws.onmessage = (event) => {
        let processed = false;
        try {
          const payload = JSON.parse(event.data);
          if (payload && typeof payload === "object") {
            if (payload.type === "session") {
              sessionIdRef.current = payload.sessionId;
              localStorage.setItem("terminal_session_id", payload.sessionId);
              processed = true;
            } 
            
            else if (payload.type === "history" || payload.type === "recovery") {
              clearGrid(true);
              const historyData = payload.history || payload.data || payload.logs || "";
              if (historyData) {
                writeToTerminal(historyData);
              }
              processed = true;
            }
          }
        } catch (_) {}

        if (!processed) {
          writeToTerminal(event.data);
        }
      };

      ws.onclose = () => {
        setConnectionState("reconnecting");
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const sendKeyStroke = (rawKey: string, isControlChar = false) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    if (!isAltScreenRef.current) {
      scrollOffsetRef.current = 0;
    }

    let payload = rawKey;

    if (!isControlChar) {
      const isCtrl = ctrlPressedRef.current;
      const isAlt = altPressedRef.current;
      const isShift = shiftPressedRef.current;

      if (isCtrl) {
        const mapped = getCtrlChar(rawKey);
        if (mapped !== null) payload = mapped;
      } else if (isAlt) {
        payload = '\x1b' + rawKey; 
      } else if (isShift) {
        payload = rawKey.toUpperCase();
      }
    }

    wsRef.current.send(JSON.stringify({ type: "input", data: payload }));

    setCtrlPressed(false);
    setAltPressed(false);
    setShiftPressed(false);
  };

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (text === '') {
      sendKeyStroke("\x7f", true); 
    } else if (text.length > 1) {
      const newChars = text.slice(1);
      sendKeyStroke(newChars);
    }
    setInputValue(' ');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isCtrl = e.ctrlKey || ctrlPressedRef.current;
    const isAlt = e.altKey || altPressedRef.current;
    const isShift = e.shiftKey || shiftPressedRef.current;

    if (e.key === 'Tab') {
      e.preventDefault();
      if (isShift) {
        sendKeyStroke("\x1b[Z", true); 
      } else {
        sendKeyStroke("\t", true);
      }
      setInputValue(' ');
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (isAlt) {
        sendKeyStroke("\x1b\x7f", true); 
      } else if (isCtrl) {
        sendKeyStroke("\x17", true);     
      } else {
        sendKeyStroke("\x7f", true);     
      }
      setInputValue(' ');
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (isAlt) {
        sendKeyStroke("\x1b\r", true);   
      } else {
        sendKeyStroke("\r", true);       
      }
      setInputValue(' ');
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isShift) sendKeyStroke("\x1b[1;2A", true);
      else if (isCtrl) sendKeyStroke("\x1b[1;5A", true);
      else sendKeyStroke("\x1b[A", true);
      setInputValue(' ');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (isShift) sendKeyStroke("\x1b[1;2B", true);
      else if (isCtrl) sendKeyStroke("\x1b[1;5B", true);
      else sendKeyStroke("\x1b[B", true);
      setInputValue(' ');
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (isShift) sendKeyStroke("\x1b[1;2C", true);
      else if (isCtrl) sendKeyStroke("\x1b[1;5C", true);
      else sendKeyStroke("\x1b[C", true);
      setInputValue(' ');
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (isShift) sendKeyStroke("\x1b[1;2D", true);
      else if (isCtrl) sendKeyStroke("\x1b[1;5D", true);
      else sendKeyStroke("\x1b[D", true);
      setInputValue(' ');
      return;
    }

    if (e.key.length === 1) {
      if (isCtrl) {
        const ctrlVal = getCtrlChar(e.key);
        if (ctrlVal !== null) {
          e.preventDefault();
          sendKeyStroke(ctrlVal, true);
          setInputValue(' ');
        }
      } else if (isAlt) {
        e.preventDefault();
        sendKeyStroke('\x1b' + e.key, true);
        setInputValue(' ');
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault(); 
      if (isAltScreenRef.current) {
        if (e.deltaY < 0) sendKeyStroke("\x1b[A", true);
        else if (e.deltaY > 0) sendKeyStroke("\x1b[B", true);
      } else {
        const maxScroll = scrollbackRef.current.length;
        if (e.deltaY < 0) scrollOffsetRef.current = Math.min(maxScroll, scrollOffsetRef.current + 1);
        else if (e.deltaY > 0) scrollOffsetRef.current = Math.max(0, scrollOffsetRef.current - 1);
      }
    };

    const handleTouchStartRaw = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchAccumulatedRef.current = 0;
      }
    };

    const handleTouchMoveRaw = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault(); 
        const currentY = e.touches[0].clientY;
        const diffY = currentY - touchStartRef.current.y;
        const delta = diffY - touchAccumulatedRef.current;
        const threshold = 30; 
        
        if (Math.abs(delta) >= threshold) {
          const steps = Math.trunc(delta / threshold);
          if (isAltScreenRef.current) {
            for (let s = 0; s < Math.abs(steps); s++) {
              sendKeyStroke(steps > 0 ? "\x1b[A" : "\x1b[B", true);
            }
          } else {
            const maxScroll = scrollbackRef.current.length;
            scrollOffsetRef.current = steps > 0 
              ? Math.min(maxScroll, scrollOffsetRef.current + steps)
              : Math.max(0, scrollOffsetRef.current - Math.abs(steps));
          }
          touchAccumulatedRef.current += steps * threshold;
        }
      }
    };

    container.addEventListener('wheel', handleWheelEvent, { passive: false });
    container.addEventListener('touchstart', handleTouchStartRaw, { passive: true });
    container.addEventListener('touchmove', handleTouchMoveRaw, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheelEvent);
      container.removeEventListener('touchstart', handleTouchStartRaw);
      container.removeEventListener('touchmove', handleTouchMoveRaw);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CONTAINER_WIDTH * dpr;
    canvas.height = CONTAINER_HEIGHT * dpr;

    let animationFrameId: number;
    let cursorBlink = true;
    let lastBlinkTime = Date.now();

    const render = () => {
      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, CONTAINER_WIDTH, CONTAINER_HEIGHT);

      ctx.font = '18px "Courier New", Courier, monospace';
      ctx.textBaseline = 'top';

      const scrollOffset = scrollOffsetRef.current;
      const combined = [...scrollbackRef.current, ...gridRef.current];
      const totalLines = combined.length;
      const startIndex = totalLines - ROWS - scrollOffset;

      for (let y = 0; y < ROWS; y++) {
        const lineIndex = startIndex + y;
        const rowCells = combined[lineIndex] || Array.from({ length: COLS }, () => ({ char: ' ', fg: '#ffffff', bg: '#0a0a0a' }));

        for (let x = 0; x < COLS; x++) {
          const cell = rowCells[x] || { char: ' ', fg: '#ffffff', bg: '#0a0a0a' };
          const px = PADDING + x * CHARACTER_WIDTH;
          const py = PADDING + y * CHARACTER_HEIGHT;

          if (cell.bg !== '#0a0a0a') {
            ctx.fillStyle = cell.bg;
            ctx.fillRect(px, py, Math.ceil(CHARACTER_WIDTH), CHARACTER_HEIGHT);
          }

          if (cell.char !== ' ') {
            ctx.fillStyle = cell.fg;
            ctx.fillText(cell.char, px, py);
          }
        }
      }

      if (Date.now() - lastBlinkTime > 500) {
        
        lastBlinkTime = Date.now();
      }

      if (cursorBlink && connectionState === "connected") {
        const { x, y } = cursorRef.current;
        const visualY = y + scrollOffset;
        if (x >= 0 && x < COLS && visualY >= 0 && visualY < ROWS) {
          const cursorX = PADDING + x * CHARACTER_WIDTH;
          const cursorY = PADDING + visualY * CHARACTER_HEIGHT;

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(cursorX, cursorY, CHARACTER_WIDTH, CHARACTER_HEIGHT, 0);
          ctx.fill();
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [connectionState]);

  const forceFocus = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  const handleToggleClick = (e: React.PointerEvent<HTMLButtonElement>, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    forceFocus();
  };

  const buttonStyle = (active: boolean) => ({
    background: active ? "#ffffff" : "#1e1e1e",
    color: active ? "#000000" : "#ffffff",
    border: "1px solid #333",
    borderRadius: "5px",
    width: "100%",
    height: "44px", 
    fontSize: "11px",
    fontFamily: "monospace",
    cursor: "pointer",
    touchAction: "none" as const,
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
    WebkitTouchCallout: "none" as const,
  });

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: "8px" }}>
      
      
      <div 
        ref={containerRef}
        onClick={forceFocus} 
        style={{ 
          position: "relative", 
          width: CONTAINER_WIDTH,
          height: CONTAINER_HEIGHT, 
          borderRadius: 10, 
          overflow: "hidden",
          border: "1px solid #222"
        }}
      >
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
        
        {connectionState === "reconnecting" && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10, 10, 10, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffff55",
            fontFamily: "monospace",
            fontSize: "12px",
            gap: "8px",
            zIndex: 2,
            pointerEvents: "none"
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#ffff55",
              animation: "pulse 1s infinite alternate"
            }} />
            RECONNECTING SESSION...
          </div>
        )}

        <input 
          type="text" 
          ref={inputRef} 
          value={inputValue} 
          onChange={handleInputChange} 
          onKeyDown={handleKeyDown} 
          aria-hidden="true" 
          autoCapitalize="none" 
          autoCorrect="off" 
          autoComplete="off" 
          spellCheck="false" 
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            width: "100%", 
            height: "100%", 
            opacity: 0, 
            background: "transparent", 
            border: "none", 
            outline: "none", 
            color: "transparent", 
            caretColor: "transparent", 
            fontSize: "16px", 
            zIndex: 1,
            cursor: "text"
          }} 
        />
      </div>

      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)", 
        gap: "4px", 
        width: "114px", 
        height: CONTAINER_HEIGHT 
      }}>
        
        <RepeatingButton style={buttonStyle(false)} onAction={() => sendKeyStroke("\x1b", true)} onFocus={forceFocus}>
          ESC
        </RepeatingButton>
        <RepeatingButton style={buttonStyle(false)} onAction={() => sendKeyStroke("\x1b[5~", true)} onFocus={forceFocus}>
          PGUP
        </RepeatingButton>

        
        <RepeatingButton style={buttonStyle(false)} onAction={() => sendKeyStroke("\t", true)} onFocus={forceFocus}>
          TAB
        </RepeatingButton>
        <RepeatingButton style={buttonStyle(false)} onAction={() => sendKeyStroke("\x1b[6~", true)} onFocus={forceFocus}>
          PGDN
        </RepeatingButton>

        
        <button style={buttonStyle(ctrlPressed)} onPointerDown={(e) => handleToggleClick(e, () => setCtrlPressed(!ctrlPressed))}>
          CTRL
        </button>
        <RepeatingButton style={buttonStyle(false)} onAction={() => sendKeyStroke("-")} onFocus={forceFocus}>
          -
        </RepeatingButton>

        
        <button style={buttonStyle(altPressed)} onPointerDown={(e) => handleToggleClick(e, () => setAltPressed(!altPressed))}>
          ALT
        </button>
        <RepeatingButton style={buttonStyle(false)} onAction={() => sendKeyStroke("\\")} onFocus={forceFocus}>
          \
        </RepeatingButton>

        
        <button style={buttonStyle(shiftPressed)} onPointerDown={(e) => handleToggleClick(e, () => setShiftPressed(!shiftPressed))}>
          SHFT
        </button>
        <RepeatingButton style={buttonStyle(false)} onAction={() => sendKeyStroke("\x1b[A", true)} onFocus={forceFocus}>
          ↑
        </RepeatingButton>

        
        <RepeatingButton style={buttonStyle(false)} onAction={() => sendKeyStroke("/")} onFocus={forceFocus}>
          /
        </RepeatingButton>
        <RepeatingButton style={buttonStyle(false)} onAction={() => sendKeyStroke("\x1b[D", true)} onFocus={forceFocus}>
          ←
        </RepeatingButton>

        
        <RepeatingButton style={buttonStyle(false)} onAction={() => sendKeyStroke("\x1b[H", true)} onFocus={forceFocus}>
          HOME
        </RepeatingButton>
        <RepeatingButton style={buttonStyle(false)} onAction={() => sendKeyStroke("\x1b[B", true)} onFocus={forceFocus}>
          ↓
        </RepeatingButton>

        
        <RepeatingButton style={buttonStyle(false)} onAction={() => sendKeyStroke("\x1b[F", true)} onFocus={forceFocus}>
          END
        </RepeatingButton>
        <RepeatingButton style={buttonStyle(false)} onAction={() => sendKeyStroke("\x1b[C", true)} onFocus={forceFocus}>
          →
        </RepeatingButton>
      </div>

      <style>{`
        @keyframes pulse {
          from { opacity: 0.3; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}