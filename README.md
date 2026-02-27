# Gwiza Wallet Frontend

React + TypeScript + Vite frontend for Gwiza Wallet.

## Prerequisites

- Node.js `>=18.18.0` (Node 20+ recommended)
- npm

> If you were seeing `TypeError: crypto.getRandomValues is not a function` when starting Vite,
> this repo now runs Vite with a preload patch (`scripts/crypto-patch.cjs`) plus `--experimental-global-webcrypto` to ensure `crypto.getRandomValues` is available in environments where Node exposes an incomplete crypto API.

> Note: Vite config intentionally avoids `@tailwindcss/vite` to prevent Windows optional native binding failures (`@tailwindcss/oxide`).
> Tailwind directives are still kept in `src/index.css`, but startup does not depend on the oxide plugin path.


## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Project Structure

```text
src/
├── components/
├── screens/
├── App.tsx
└── main.tsx
```


### Troubleshooting

If this still happens on Windows, check your Node version:

```bash
node -v
```

Use Node 20 LTS if possible, then reinstall dependencies:

```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```
