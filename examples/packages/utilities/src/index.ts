const objectToString = Object.prototype.toString
const toTypeString = (value: unknown): string => objectToString.call(value)

/**
 * Whether the value is Function or not
 *
 * @param val target value
 * @returns boolean value
 */
export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}

/**
 * Whether the value is String or not
 *
 * @param val target value
 * @returns boolean value
 */
export function isString(val: unknown): val is string {
  return typeof val === 'string'
}

/**
 * Whether the value is Boolean or not
 *
 * @param val target value
 * @returns boolean value
 */
export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean'
}

/**
 * Whether the value is Object or not
 *
 * @param val target value
 * @returns boolean value
 */
export function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object'
}

/**
 * Whether the value is Plain Object or not
 *
 * @param val target value
 * @returns boolean value
 */
export function isPlainObject(val: unknown): val is Record<string, unknown> {
  return toTypeString(val) === '[object Object]'
}

/**
 * Whether the value is Symbol or not
 *
 * @param val target value
 * @returns boolean value
 */
export function isSymbol(val: unknown): val is symbol {
  return typeof val === 'symbol'
}

/**
 * Whether the value is Promise or not
 *
 * @param val target value
 * @returns boolean value
 */
export function isPromise<T = any>(val: unknown): val is Promise<T> { // eslint-disable-line
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}
