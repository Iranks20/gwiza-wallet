const crypto = require('node:crypto')

function isTypedArray(value) {
  return ArrayBuffer.isView(value) && !(value instanceof DataView)
}

function ensureGetRandomValues(target) {
  if (!target || typeof target.getRandomValues === 'function') {
    return
  }

  if (crypto.webcrypto && typeof crypto.webcrypto.getRandomValues === 'function') {
    target.getRandomValues = crypto.webcrypto.getRandomValues.bind(crypto.webcrypto)
    return
  }

  target.getRandomValues = typedArray => {
    if (!isTypedArray(typedArray)) {
      throw new TypeError('Expected a typed array')
    }
    return crypto.randomFillSync(typedArray)
  }
}

ensureGetRandomValues(crypto)

if (!globalThis.crypto) {
  globalThis.crypto = crypto.webcrypto || { getRandomValues: crypto.getRandomValues.bind(crypto) }
}
ensureGetRandomValues(globalThis.crypto)
