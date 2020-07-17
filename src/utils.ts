import { promises as fs } from 'fs'

/**
 * string type checking function
 *
 * @param val the target value
 *
 * @returns if it's string, return `true`, else return `false`
 */
export const isString = (val: unknown): val is string => typeof val === 'string'

/**
 * number type checking function
 *
 * @param val the target value
 *
 * @returns if it's number , return `true`, else return `false`
 */
export const isNumber = (val: unknown): val is number =>
  typeof val === 'number' && isFinite(val)

/**
 * escape text
 *
 * @param text the target text
 *
 * @returns escaped text
 */
export function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\') // first replace the escape character
    .replace(/[*#[\]_|`~]/g, (x: string) => '\\' + x) // then escape any special characters
    .replace(/---/g, '\\-\\-\\-') // hyphens only if it's 3 or more
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const RE_BAD_PATH_CHARS = /[^a-z0-9_\-\.]/gi

/**
 * get safe path from display name of ApiItem
 *
 * @param name the target displayname
 *
 * @returns safe path
 */
export function getSafePathFromDisplayName(name: string): string {
  return name.replace(RE_BAD_PATH_CHARS, '_').toLowerCase()
}

export async function mkdir(path: string) {
  await fs.mkdir(path, { recursive: true })
}

export async function writeFile(path: string, data: string) {
  await fs.writeFile(path, data, 'utf-8')
}
