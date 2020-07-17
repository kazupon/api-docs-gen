/**
 * Constant of `--genereate-style` options
 */
export const GENERATE_STYLES = {
  prefix: 'prefix',
  directory: 'directory'
} as const

/**
 * Type of `--generate-style` options
 *
 * @remarks See {@link GENERATE_STYLES} contents
 */
export type GenerateStyle = typeof GENERATE_STYLES[keyof typeof GENERATE_STYLES]
