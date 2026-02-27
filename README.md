# Gwiza Wallet Frontend

React + TypeScript + Vite frontend for Gwiza Wallet.

## Prerequisites

- Node.js `>=18.18.0` (Node 20+ recommended)
- npm

> If you were seeing `TypeError: crypto.getRandomValues is not a function` when starting Vite,
> this repo now runs Vite via Node's `--experimental-global-webcrypto` flag in npm scripts for compatibility.

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
