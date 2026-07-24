# UI Tools v0.1.2-beta

Just some UI tools.
Kind of like MUI.

**Some notes:**
  - If your using Authtics Host, this will not be bundled because of "crypto", to fix this, go into **"node_modules/@bananacool467/authtics-host/dist/renderEngine.js"** -> **buildWithEsbuild** and add this value in the part after `:` in **external**: `"crypto",`
  - If the UI renders and isn't responsive or the code doesnt run, go into **"node_modules/@bananacool467/ui-tools/dist/index.js"** and comment out `export { useTerminal } from "./useTerminal";` and `export type { UseTerminalOptions } from "./useTerminal";`
> [!IMPORTANT]
> The Notes above ***may*** be fixed soon