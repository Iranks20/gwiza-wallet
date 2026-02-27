import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import crypto from 'node:crypto'

const isTypedArray = value =>
  value instanceof Int8Array ||
  value instanceof Uint8Array ||
  value instanceof Uint8ClampedArray ||
  value instanceof Int16Array ||
  value instanceof Uint16Array ||
  value instanceof Int32Array ||
  value instanceof Uint32Array ||
  value instanceof BigInt64Array ||
  value instanceof BigUint64Array ||
  value instanceof Float32Array ||
  value instanceof Float64Array

if (typeof crypto.getRandomValues !== 'function') {
  if (crypto.webcrypto?.getRandomValues) {
    crypto.getRandomValues = crypto.webcrypto.getRandomValues.bind(crypto.webcrypto)
  } else {
    crypto.getRandomValues = typedArray => {
      if (!isTypedArray(typedArray)) {
        throw new TypeError('Expected an integer typed array')
      }
      return crypto.randomFillSync(typedArray)
    }
  }
}

const fallbackCrypto = crypto.webcrypto ?? { getRandomValues: crypto.getRandomValues.bind(crypto) }

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: fallbackCrypto,
    configurable: true,
    writable: true,
  })
} else if (typeof globalThis.crypto.getRandomValues !== 'function') {
  globalThis.crypto.getRandomValues = crypto.getRandomValues.bind(crypto)
}

const viteCliPath = pathToFileURL(resolve(process.cwd(), 'node_modules/vite/bin/vite.js')).href
await import(viteCliPath)
