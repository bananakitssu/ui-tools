# UI Tools

<p align="center">
  <img alt="version" src="https://img.shields.io/badge/version-v0.1.7-green?style=for-the-badge" />
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

## Installing
From NPM:
```bash
npm i @bananacool467/ui-tools@latest
```
Via GitHub:
***(This clones ui-tools, sets it ip and builds it, then puts the required files into node_modules and updates package.json for if NPM installing fails)***
```bash
git clone https://github.com/bananakitssu/ui-tools; cd ui-tools; npm run setup; npm run build; cd ..; mkdir -p node_modules/@bananacool467/ui-tools; mv ui-tools/package.json node_modules/@bananacool467/ui-tools/package.json; mv ui-tools/README.md node_modules/@bananacool467/ui-tools/README.md; mv ui-tools/dist node_modules/@bananacool467/ui-tools/dist; mv ui-tools/LICENSE node_modules/@bananacool467/ui-tools/LICENSE; rmdir ui-tools; node -e "const fs = require('fs'); const pkg = fs.existsSync('package.json') ? require('./package.json') : { dependencies: {} }; pkg.dependencies = pkg.dependencies || {}; pkg.dependencies['@bananacool467/ui-tools'] = require('./node_modules/@bananacool467/ui-tools/package.json').version || 'latest'; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));"
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
> Documentation coming soon. Instead of reading a documentation, you can read the component files in `src/` instead