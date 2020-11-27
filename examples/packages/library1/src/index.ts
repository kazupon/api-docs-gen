/**
 * A
 *
 * @public
 */
export type A = string

/**
 * {@link A}
 *
 * @public
 */
export type B = number

/**
 * A dumb type
 */
export type DumbType<T> = { foo: T }

/**
 * app version
 *
 * @remarks
 * you can lookup application version that is semver format.
 *
 * @example
 * ```javascript
 * console.log(VERSION)
 * ```
 */
export const VERSION = '1.0.0'

/**
 * Configrations
 *
 * @defaultValue `{}`
 */
export const Config: { [name: string]: unknown } = {}

/**
 * Locale
 */
export type Locale = string

/**
 * Falback Locale
 *
 * @remarks
 * This is remarks of `Fallback Locale`
 */
export type FallbackLocale =
  | Locale
  | Locale[]
  | { [locale in string]: Locale[] }
  | false

/**
 * Locale Message resources
 */
export type LocaleMessage = string | LocaleMessage[]

/**
 * Error Code
 */
export enum ErrorCodes {
  /**
   * Success
   */
  Succcess,
  /**
   * Invalid format
   */
  InvalidFormat
}

/**
 * Token Characters
 *
 * @remarks
 * This is remarks of Token Chararaceters
 */
export enum TokenChars {
  /**
   * Modulo charactor
   */
  Modulo = '%',
  /**
   * Plus charactor
   */
  Plus = '+'
}

/**
 * add function : `x`
 *
 * @remarks
 * This is add function remarks: {@link ErrorCodes}.
 *
 * See {@link https://foo.bar.com/api/add | add}.
 *
 * @param a target `1`
 * @param b target 2
 * @returns result as `a` + `b`
 *
 * @throws `SyntaxError`
 * this is syntax error
 *
 * @throws `Error`
 * this is general error
 *
 * @example
 * example of `add` function:
 * ```javascript
 * console.log(add(1, 1))
 * ```
 *
 * @public
 */
export function add(a: number, b: number): number {
  return a + b
}

/**
 * un dummy
 *
 * @param dummy - A dummy
 */
export function undumbify<T>(dummy: DumbType<T>): T {
  return dummy.foo
}

/**
 * Calculatable interface
 *
 * @public
 */
export interface Calculatable {
  /**
   * add method
   * @param a target 1
   * @param b target 2
   * @public
   */
  add(a: number, b: number): number
  /**
   * PI
   */
  PI: number
}

/**
 * My Options
 *
 * @public
 */
export interface MyOptions {
  /**
   * Field
   *
   * @defaultValue `'simple'`
   */
  field?: string
}

/**
 * Calculator class
 *
 * @remarks
 * This is remarks of Calculator class
 *
 * @example
 * ```javascript
 * const c = new Calculator()
 * const v1 = c.add(1, 1)
 * const v2 = c.sub(1, 1)
 * ```
 *
 * @public
 */
export class Calculator implements Calculatable {
  /**
   * calcurator types
   */
  type: string

  /**
   * Conssutructor of usage
   *
   * @param type calculator type
   */
  constructor(type: string) {
    this.type = type
  }

  /**
   * add method
   *
   * @param a target 1
   * @param b target 2
   *
   * @public
   */
  add(a: number, b: number): number {
    return a + b
  }

  /**
   * sub method
   *
   * @param a target 1
   * @param b target 2
   *
   * @public
   */
  sub(a: number, b: number): number {
    return a - b
  }

  /**
   * PI
   *
   * @returns 3.14
   */
  PI = 3.14
}
