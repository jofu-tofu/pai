import { NextResponse } from "next/server"
import fs from 'fs'
import path from 'path'
import os from 'os'
import { getEnvVar, isWindows } from '../../../../../../hooks/lib/platform'

// Windows filename validation
// Invalid characters: < > : " / \ | ? *
// Reserved names: CON, PRN, AUX, NUL, COM1-9, LPT1-9
function isValidFilename(name: string): { valid: boolean; reason?: string } {
  // Check for invalid characters (always invalid on Windows, safe to reject everywhere)
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(name)) {
    return { valid: false, reason: 'Filename contains invalid characters: < > : " / \\ | ? *' };
  }

  // Check for Windows reserved names
  const baseName = name.replace(/\.[^.]+$/, '').toUpperCase();
  const reserved = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/;
  if (reserved.test(baseName)) {
    return { valid: false, reason: `"${baseName}" is a reserved filename on Windows` };
  }

  return { valid: true };
}

const PAI_DIR = getEnvVar('PAI_DIR') || path.join(os.homedir(), 'pai')
const TELOS_DIR = path.join(PAI_DIR, 'skills', 'PAI', 'USER', 'TELOS')

export async function POST(request: Request) {
  try {
    const { filename, content } = await request.json()

    if (!filename || content === undefined) {
      return NextResponse.json(
        { error: "Filename and content are required" },
        { status: 400 }
      )
    }

    // Validate filename for cross-platform compatibility
    const filenameCheck = isValidFilename(filename);
    if (!filenameCheck.valid) {
      return NextResponse.json(
        { error: filenameCheck.reason },
        { status: 400 }
      )
    }

    // Determine file path
    const isCSV = filename.endsWith('.csv')
    let filePath: string

    if (isCSV) {
      const csvDir = path.join(TELOS_DIR, 'data')
      filePath = path.join(csvDir, filename)
    } else {
      filePath = path.join(TELOS_DIR, filename)
    }

    // Verify file exists before overwriting
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File ${filename} does not exist` },
        { status: 404 }
      )
    }

    // Save file
    fs.writeFileSync(filePath, content, 'utf-8')

    // Log the edit
    const timestamp = new Date().toISOString()
    const logMessage = `\n## ${timestamp}\n\n- **Action:** File edited via dashboard\n- **File:** ${filename}\n`

    const updatesPath = path.join(TELOS_DIR, 'updates.md')
    if (fs.existsSync(updatesPath)) {
      fs.appendFileSync(updatesPath, logMessage)
    }

    return NextResponse.json({
      success: true,
      message: `${filename} saved successfully`,
    })
  } catch (error) {
    console.error("Error saving file:", error)
    return NextResponse.json(
      { error: "Failed to save file" },
      { status: 500 }
    )
  }
}
