import { NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'
import os from 'os'

function normalizeTelosPath(filePath: string): string {
  return filePath.trim().replace(/\\/g, '/')
}

function isValidTelosRelativePath(filePath: string): { valid: boolean; reason?: string } {
  const normalized = normalizeTelosPath(filePath)
  if (!normalized) {
    return { valid: false, reason: 'Filename is required' }
  }

  if (path.isAbsolute(normalized)) {
    return { valid: false, reason: 'Use a path relative to the TELOS folder' }
  }

  const segments = normalized.split('/').filter(Boolean)
  if (segments.length === 0) {
    return { valid: false, reason: 'Filename is empty' }
  }

  const invalidChars = /[<>:"|?*]/
  const reserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/

  for (const segment of segments) {
    if (segment === '.' || segment === '..') {
      return { valid: false, reason: 'Path traversal is not allowed' }
    }

    if (invalidChars.test(segment)) {
      return { valid: false, reason: 'Filename contains invalid characters: < > : " | ? *' }
    }

    const baseName = segment.replace(/\.[^.]+$/, '').toUpperCase()
    if (reserved.test(baseName)) {
      return { valid: false, reason: `"${baseName}" is a reserved filename on Windows` }
    }
  }

  return { valid: true }
}

const TELOS_DIR = path.join(os.homedir(), 'Obsidian', 'TELOS')
const UPDATES_FILE = path.join(TELOS_DIR, 'Reviews', 'updates.md')

export async function POST(request: Request) {
  try {
    const { filename, content } = await request.json()

    if (!filename || content === undefined) {
      return NextResponse.json(
        { error: "Filename and content are required" },
        { status: 400 }
      )
    }

    const normalizedFilename = normalizeTelosPath(filename)
    const filenameCheck = isValidTelosRelativePath(normalizedFilename)
    if (!filenameCheck.valid) {
      return NextResponse.json(
        { error: filenameCheck.reason },
        { status: 400 }
      )
    }

    const filePath = path.resolve(TELOS_DIR, ...normalizedFilename.split('/'))
    const relativeToRoot = path.relative(TELOS_DIR, filePath)
    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
      return NextResponse.json(
        { error: 'Filename must stay inside the TELOS folder' },
        { status: 400 }
      )
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File ${normalizedFilename} does not exist` },
        { status: 404 }
      )
    }

    fs.writeFileSync(filePath, content, 'utf-8')

    const timestamp = new Date().toISOString()
    const logMessage = `\n## ${timestamp}\n\n- **Action:** File edited via dashboard\n- **File:** ${normalizedFilename}\n`

    if (fs.existsSync(UPDATES_FILE)) {
      fs.appendFileSync(UPDATES_FILE, logMessage)
    }

    return NextResponse.json({
      success: true,
      message: `${normalizedFilename} saved successfully`,
    })
  } catch (error) {
    console.error("Error saving file:", error)
    return NextResponse.json(
      { error: "Failed to save file" },
      { status: 500 }
    )
  }
}
