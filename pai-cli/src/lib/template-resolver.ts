import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

/**
 * Resolve the absolute path to bundled BMAD template root.
 * Works in both development (src/) and production (dist/) contexts.
 *
 * Returns the parent directory containing both _bmad/ and .claude/ structures.
 *
 * Resolution logic:
 * - In development: src/lib/template-resolver.ts → src/templates/bmad/
 * - In production: dist/lib/template-resolver.js → dist/templates/bmad/
 */
export function getBmadTemplatePath(): string {
  // Get the directory of this file
  // In dev: .../pai-cli/src/lib/
  // In prod: .../pai-cli/dist/lib/
  const currentFileUrl = import.meta.url
  const currentFilePath = fileURLToPath(currentFileUrl)
  const currentDir = dirname(currentFilePath)

  // Go up one level and into templates/bmad
  // src/lib/ → src/templates/bmad/
  // dist/lib/ → dist/templates/bmad/
  const templatePath = join(currentDir, '..', 'templates', 'bmad')

  return templatePath
}
