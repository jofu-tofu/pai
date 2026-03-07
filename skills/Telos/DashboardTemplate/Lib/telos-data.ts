import fs from 'fs'
import path from 'path'
import os from 'os'

export interface TelosFile {
  name: string
  filename: string
  content: string
  type: 'markdown' | 'csv'
}

const TELOS_DIR = path.join(os.homedir(), 'Obsidian', 'TELOS')
const EXCLUDED_DIRS = new Set(['Backups'])
const PRIORITY_FILES = [
  'Home.md',
  'Now.md',
  'Core/MISSION.md',
  'Core/BELIEFS.md',
  'Direction/GOALS.md',
  'Career/Overview.md',
  'Reviews/updates.md',
]

function toForwardSlash(filePath: string): string {
  return filePath.replace(/\\/g, '/')
}

function walkTelosDirectory(currentDir: string, relativeDir = ''): TelosFile[] {
  const files: TelosFile[] = []
  const entries = fs.readdirSync(currentDir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue

    const relativePath = relativeDir ? path.join(relativeDir, entry.name) : entry.name
    const fullPath = path.join(currentDir, entry.name)

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue
      files.push(...walkTelosDirectory(fullPath, relativePath))
      continue
    }

    if (!entry.isFile()) continue

    const type = entry.name.endsWith('.md')
      ? 'markdown'
      : entry.name.endsWith('.csv')
        ? 'csv'
        : null

    if (!type) continue

    try {
      const filename = toForwardSlash(relativePath)
      const content = fs.readFileSync(fullPath, 'utf-8')
      files.push({
        name: filename.replace(/\.(md|csv)$/i, ''),
        filename,
        content,
        type,
      })
    } catch (error) {
      console.error(`Error reading ${relativePath}:`, error)
    }
  }

  return files
}

export function getAllTelosData(): TelosFile[] {
  try {
    if (!fs.existsSync(TELOS_DIR)) {
      return []
    }

    const files = walkTelosDirectory(TELOS_DIR)

    files.sort((a, b) => {
      const aPriority = PRIORITY_FILES.indexOf(a.filename)
      const bPriority = PRIORITY_FILES.indexOf(b.filename)

      if (aPriority !== -1 || bPriority !== -1) {
        if (aPriority === -1) return 1
        if (bPriority === -1) return -1
        return aPriority - bPriority
      }

      return a.filename.localeCompare(b.filename)
    })

    return files
  } catch (error) {
    console.error('Error scanning TELOS directory:', error)
    return []
  }
}

export function getTelosContext(): string {
  const files = getAllTelosData()

  let context = '# Personal TELOS (Obsidian vault)\n\n'
  context += 'You have access to the complete TELOS context from the Obsidian vault. Use this information to answer questions about life direction, goals, beliefs, career strategy, and current priorities.\n\n'

  for (const file of files) {
    context += `\n## ${file.filename}\n\n`
    context += file.content
    context += '\n\n---\n\n'
  }

  return context
}

export function getTelosFileList(): string[] {
  const files = getAllTelosData()
  return files.map(f => f.filename)
}

export function getTelosFileCount(): number {
  const files = getAllTelosData()
  return files.length
}
