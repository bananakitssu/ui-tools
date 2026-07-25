# UI Tools

<p align="center">
  <img alt="version" src="https://img.shields.io/badge/version-v0.1.5-green?style=for-the-badge" />
  <img alt="version type" src="https://img.shields.io/badge/version_type-BETA-yellow?style=for-the-badge" />
  <img alt="license" src="https://img.shields.io/github/license/bananakitssu/ui-tools?style=for-the-badge" />
  <img alt="downloads" src="https://img.shields.io/npm/dm/@bananacool467/ui-tools?style=for-the-badge" />
</p>

<p align="center">
  <a href="https://npmjs.org/package/@bananacool467/ui-tools"><img alt="NPM" src="https://img.shields.io/badge/NPM-@bananacool467%2Fui--tools-red?style=for-the-badge&logo=npm" /></a>
  <a href="https://github.com/bananakitssu/ui-tools"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-bananakitssu%2Fui--tools-grey?style=for-the-badge&logo=github" /></a>
</p>


Just some UI tools.

Kind of like MUI.

***(UI tools is currently under development)***

**Some notes:**
  - If your using Authtics Host, this will not be bundled because of "crypto", to fix this, go into **"node_modules/@bananacool467/authtics-host/dist/renderEngine.js"** -> **buildWithEsbuild** and add this value in the part after `:` in **external**: `"crypto",`
  - If the UI renders and isn't responsive or the code doesnt run, go into **"node_modules/@bananacool467/ui-tools/dist/index.js"** and comment out `export { useTerminal } from "./useTerminal";` and `export type { UseTerminalOptions } from "./useTerminal";`

> [!IMPORTANT]
> The Notes above ***may*** be fixed soon

> [!NOTE]
> Documentation coming soon. Instead of reading a documentation, you can read the component files in `src/` instead