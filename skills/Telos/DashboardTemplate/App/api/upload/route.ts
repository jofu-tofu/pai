import { NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'
import os from 'os'

function isValidFilename(name: string): { valid: boolean; reason?: string } {
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(name)) {
    return { valid: false, reason: 'Filename contains invalid characters: < > : " / \\ | ? *' }
  }

  const baseName = name.replace(/\.[^.]+$/, '').toUpperCase()
  const reserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/
  if (reserved.test(baseName)) {
    return { valid: false, reason: `"${baseName}" is a reserved filename on Windows` }
  }

  return { valid: true }
}

const TELOS_DIR = path.join(os.homedir(), 'Obsidian', 'TELOS')
const UPDATES_FILE = path.join(TELOS_DIR, 'Reviews', 'updates.md')

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    const fileName = file.name
    const isMarkdown = fileName.endsWith('.md')
    const isCSV = fileName.endsWith('.csv')

    if (!isMarkdown && !isCSV) {
      return NextResponse.json(
        { error: "Only .md and .csv files are allowed" },
        { status: 400 }
      )
    }

    const filenameCheck = isValidFilename(fileName)
    if (!filenameCheck.valid) {
      return NextResponse.json(
        { error: filenameCheck.reason },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (!fs.existsSync(TELOS_DIR)) {
      fs.mkdirSync(TELOS_DIR, { recursive: true })
    }

    let savePath: string
    if (isCSV) {
      const csvDir = path.join(TELOS_DIR, 'data')
      if (!fs.existsSync(csvDir)) {
        fs.mkdirSync(csvDir, { recursive: true })
      }
      savePath = path.join(csvDir, fileName)
    } else {
      savePath = path.join(TELOS_DIR, fileName)
    }

    if (fs.existsSync(savePath)) {
      return NextResponse.json(
        { error: `File ${fileName} already exists. Please delete the existing file first or rename your file.` },
        { status: 409 }
      )
    }

    fs.writeFileSync(savePath, buffer)

    const timestamp = new Date().toISOString()
    const logMessage = `\n## ${timestamp}\n\n- **Action:** File uploaded via dashboard\n- **File:** ${fileName}\n- **Type:** ${isCSV ? 'CSV' : 'Markdown'}\n- **Path:** ${savePath}\n`

    if (fs.existsSync(UPDATES_FILE)) {
      fs.appendFileSync(UPDATES_FILE, logMessage)
    }

    return NextResponse.json({
      success: true,
      message: `${fileName} uploaded successfully to ${isCSV ? 'data/' : ''}`,
      path: savePath,
    })
  } catch (error) {
    console.error("Error in upload API:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
