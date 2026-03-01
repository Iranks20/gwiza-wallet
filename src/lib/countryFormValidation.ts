/**
 * Client-side validation for country (OPCO) create/edit form.
 * Matches Wallet+ API schema: minLength, maxLength, patterns.
 */

export type CountryFormData = {
  name: string
  alpha2: string
  alpha3: string
  numeric: string
  currency: string
  dial: string
  flag?: string
  status: string
}

export type FieldErrors = Partial<Record<keyof CountryFormData, string>>

const COUNTRY_NAME_MIN = 4
const COUNTRY_NAME_MAX = 255
const COUNTRY_NAME_PATTERN = /^[\p{L}\p{N}\s\-']+$/u
const ALPHA2_PATTERN = /^[A-Z]{2}$/
const ALPHA3_PATTERN = /^[A-Z]{3}$/
const CALLING_CODE_PATTERN = /^\+?[0-9]{1,4}$/
const CALLING_CODE_MAX = 4
const CURRENCY_PATTERN = /^[A-Z]{3,4}$/
const CURRENCY_MIN = 3
const CURRENCY_MAX = 4
const FLAG_MAX = 255
const URI_PATTERN = /^https?:\/\/.+$/i

export function validateCountryForm(data: CountryFormData, isCreate: boolean): FieldErrors {
  const err: FieldErrors = {}

  const name = (data.name ?? '').trim()
  if (isCreate || data.name !== undefined) {
    if (name.length < COUNTRY_NAME_MIN)
      err.name = `Country name must be at least ${COUNTRY_NAME_MIN} characters`
    else if (name.length > COUNTRY_NAME_MAX)
      err.name = `Country name must be at most ${COUNTRY_NAME_MAX} characters`
    else if (!COUNTRY_NAME_PATTERN.test(name))
      err.name = 'Country name can only contain letters, numbers, spaces, hyphens and apostrophes'
  }

  const alpha2 = (data.alpha2 ?? '').trim().toUpperCase()
  if (isCreate || data.alpha2 !== undefined) {
    if (alpha2.length !== 2)
      err.alpha2 = 'Alpha-2 must be exactly 2 letters (e.g. US)'
    else if (!ALPHA2_PATTERN.test(alpha2))
      err.alpha2 = 'Alpha-2 must be 2 uppercase letters (A–Z)'
  }

  const alpha3 = (data.alpha3 ?? '').trim().toUpperCase()
  if (isCreate || data.alpha3 !== undefined) {
    if (alpha3.length !== 3)
      err.alpha3 = 'Alpha-3 must be exactly 3 letters (e.g. USA)'
    else if (!ALPHA3_PATTERN.test(alpha3))
      err.alpha3 = 'Alpha-3 must be 3 uppercase letters (A–Z)'
  }

  const dial = (data.dial ?? '').trim()
  if (isCreate || data.dial !== undefined) {
    if (dial.length === 0)
      err.dial = 'Dial code is required'
    else if (dial.length > CALLING_CODE_MAX)
      err.dial = `Dial code must be at most ${CALLING_CODE_MAX} characters (e.g. +1 or +254)`
    else if (!CALLING_CODE_PATTERN.test(dial))
      err.dial = 'Dial code: optional + followed by 1–4 digits (e.g. +1, +254)'
  }

  const currency = (data.currency ?? '').trim().toUpperCase()
  if (isCreate || data.currency !== undefined) {
    if (currency.length < CURRENCY_MIN)
      err.currency = `Currency must be ${CURRENCY_MIN}–${CURRENCY_MAX} letters (e.g. USD). Create it under Currencies first.`
    else if (currency.length > CURRENCY_MAX)
      err.currency = `Currency must be ${CURRENCY_MIN}–${CURRENCY_MAX} letters`
    else if (!CURRENCY_PATTERN.test(currency))
      err.currency = 'Currency must be 3–4 uppercase letters (e.g. USD, UGX)'
  }

  const flag = (data.flag ?? '').trim()
  if (flag.length > 0) {
    if (flag.length > FLAG_MAX)
      err.flag = `Flag URL must be at most ${FLAG_MAX} characters`
    else if (!URI_PATTERN.test(flag))
      err.flag = 'Flag must be a valid URL (e.g. https://flagcdn.com/w80/us.png)'
  }

  return err
}

export const countryFormRules = {
  name: { min: COUNTRY_NAME_MIN, max: COUNTRY_NAME_MAX, example: 'United States' },
  alpha2: { length: 2, example: 'US' },
  alpha3: { length: 3, example: 'USA' },
  dial: { max: CALLING_CODE_MAX, example: '+1 or +254' },
  currency: { min: CURRENCY_MIN, max: CURRENCY_MAX, example: 'USD (create under Currencies first)' },
  flag: { optional: true, example: 'https://flagcdn.com/w80/us.png' },
} as const
