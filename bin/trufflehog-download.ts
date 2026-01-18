#!/usr/bin/env bun
/**
 * trufflehog-download.ts
 *
 * Cross-platform TruffleHog binary downloader.
 * Downloads the appropriate binary from GitHub releases for the current platform.
 *
 * Usage:
 *   bun bin/trufflehog-download.ts [--force]
 *
 * Options:
 *   --force  Re-download even if binary already exists
 */

import { existsSync, mkdirSync, chmodSync, unlinkSync, createWriteStream } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execFileSync, execSync } from "child_process";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { isWindows, getBinaryExtension, commandExistsSync } from "../hooks/lib/platform";

const GITHUB_API_URL = "https://api.github.com/repos/trufflesecurity/trufflehog/releases/latest";

interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface GithubRelease {
  tag_name: string;
  assets: ReleaseAsset[];
}

/**
 * Get platform-specific configuration
 */
function getPlatformConfig(): { os: string; arch: string; ext: string } {
  // Note: We use process.platform directly here because we need the string value
  // for the OS name mapping (win32 -> "windows", darwin -> "darwin", linux -> "linux")
  const platform = process.platform;
  const arch = process.arch;

  let os: string;

  switch (platform) {
    case "win32":
      os = "windows";
      break;
    case "darwin":
      os = "darwin";
      break;
    case "linux":
      os = "linux";
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  // Use centralized utility for binary extension
  const ext = getBinaryExtension();

  let archStr: string;
  switch (arch) {
    case "x64":
      archStr = "amd64";
      break;
    case "arm64":
      archStr = "arm64";
      break;
    default:
      throw new Error(`Unsupported architecture: ${arch}`);
  }

  return { os, arch: archStr, ext };
}

/**
 * Get the binary filename for the current platform
 */
function getBinaryFilename(): string {
  const { ext } = getPlatformConfig();
  return `trufflehog${ext}`;
}

/**
 * Fetch the latest release info from GitHub
 */
async function fetchLatestRelease(): Promise<GithubRelease> {
  const response = await fetch(GITHUB_API_URL, {
    headers: {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "PAI-TruffleHog-Downloader",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch release info: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<GithubRelease>;
}

/**
 * Find the matching asset for the current platform
 */
function findAssetForPlatform(assets: ReleaseAsset[], version: string): ReleaseAsset {
  const { os, arch } = getPlatformConfig();
  const versionNum = version.replace(/^v/, "");

  // Expected filename pattern: trufflehog_3.92.5_darwin_arm64.tar.gz
  const expectedName = `trufflehog_${versionNum}_${os}_${arch}.tar.gz`;

  const asset = assets.find(a => a.name === expectedName);

  if (!asset) {
    const availableAssets = assets.map(a => a.name).join(", ");
    throw new Error(
      `No matching asset found for ${os}/${arch}. ` +
      `Expected: ${expectedName}. Available: ${availableAssets}`
    );
  }

  return asset;
}

/**
 * Download a file with progress indication
 */
async function downloadFile(url: string, destPath: string): Promise<void> {
  console.log(`Downloading from: ${url}`);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "PAI-TruffleHog-Downloader",
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  const totalSize = parseInt(response.headers.get("content-length") || "0", 10);
  const totalMB = (totalSize / 1024 / 1024).toFixed(1);

  console.log(`Total size: ${totalMB} MB`);

  // Ensure directory exists
  const dir = dirname(destPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Stream to file
  const fileStream = createWriteStream(destPath);
  const body = response.body;

  if (!body) {
    throw new Error("Response body is null");
  }

  // @ts-ignore - Bun's ReadableStream works with pipeline
  await pipeline(Readable.fromWeb(body as any), fileStream);

  console.log("Download complete!");
}

/**
 * Extract tar.gz archive using platform-appropriate methods
 * Uses multiple fallback strategies for cross-platform compatibility
 */
async function extractTarGz(archivePath: string, destDir: string): Promise<void> {
  console.log(`Extracting to: ${destDir}`);

  // Method 1: Try native tar (available on Windows 10+, macOS, Linux)
  if (commandExistsSync("tar")) {
    try {
      execFileSync("tar", ["-xzf", archivePath, "-C", destDir], { stdio: "inherit" });
      console.log("Extraction complete!");
      return;
    } catch {
      // Fall through to alternative methods on Windows
      if (!isWindows()) {
        throw new Error(`Failed to extract archive with tar: ${archivePath}`);
      }
    }
  }

  // Method 2: Windows fallback - Use PowerShell with .NET GZipStream and tar
  if (isWindows()) {
    console.log("Native tar unavailable, trying PowerShell extraction...");

    // First decompress .gz to .tar, then extract .tar
    const tarPath = archivePath.replace(/\.gz$/, "");

    try {
      // Decompress .gz using PowerShell's .NET GZipStream
      const decompressScript = `
        $gzPath = '${archivePath.replace(/'/g, "''")}'
        $tarPath = '${tarPath.replace(/'/g, "''")}'
        $input = New-Object System.IO.FileStream $gzPath, ([IO.FileMode]::Open), ([IO.FileAccess]::Read), ([IO.FileShare]::Read)
        $output = New-Object System.IO.FileStream $tarPath, ([IO.FileMode]::Create), ([IO.FileAccess]::Write), ([IO.FileShare]::None)
        $gzipStream = New-Object System.IO.Compression.GzipStream $input, ([IO.Compression.CompressionMode]::Decompress)
        $buffer = New-Object byte[](1024)
        while ($true) {
          $read = $gzipStream.Read($buffer, 0, 1024)
          if ($read -le 0) { break }
          $output.Write($buffer, 0, $read)
        }
        $gzipStream.Close()
        $output.Close()
        $input.Close()
      `;
      execSync(`powershell -NoProfile -Command "${decompressScript}"`, { stdio: "inherit" });

      // Now extract the .tar file using tar or PowerShell
      if (commandExistsSync("tar")) {
        execFileSync("tar", ["-xf", tarPath, "-C", destDir], { stdio: "inherit" });
      } else {
        // Use PowerShell to extract .tar (requires PowerShell 5.0+ with appropriate modules)
        // This is a basic tar extraction using .NET
        const extractScript = `
          Add-Type -AssemblyName System.IO.Compression.FileSystem
          $tarPath = '${tarPath.replace(/'/g, "''")}'
          $destDir = '${destDir.replace(/'/g, "''")}'
          # Basic tar extraction - reads tar format manually
          $tarStream = [System.IO.File]::OpenRead($tarPath)
          $buffer = New-Object byte[](512)
          while ($tarStream.Read($buffer, 0, 512) -eq 512) {
            $name = [System.Text.Encoding]::ASCII.GetString($buffer, 0, 100).Trim([char]0)
            if ([string]::IsNullOrEmpty($name)) { break }
            $sizeStr = [System.Text.Encoding]::ASCII.GetString($buffer, 124, 12).Trim([char]0, ' ')
            $size = if ($sizeStr) { [Convert]::ToInt64($sizeStr, 8) } else { 0 }
            $typeFlag = [char]$buffer[156]
            if ($typeFlag -eq '0' -or $typeFlag -eq [char]0) {
              $filePath = Join-Path $destDir $name
              $fileDir = Split-Path $filePath -Parent
              if (!(Test-Path $fileDir)) { New-Item -ItemType Directory -Path $fileDir -Force | Out-Null }
              $fileData = New-Object byte[]($size)
              $tarStream.Read($fileData, 0, $size) | Out-Null
              [System.IO.File]::WriteAllBytes($filePath, $fileData)
            }
            # Skip to next 512-byte boundary
            $padding = (512 - ($size % 512)) % 512
            $tarStream.Seek($padding, [System.IO.SeekOrigin]::Current) | Out-Null
          }
          $tarStream.Close()
        `;
        execSync(`powershell -NoProfile -Command "${extractScript}"`, { stdio: "inherit" });
      }

      // Clean up intermediate .tar file
      try {
        unlinkSync(tarPath);
      } catch {
        // Ignore cleanup errors
      }

      console.log("Extraction complete!");
      return;
    } catch (error) {
      // Clean up intermediate file on error
      try {
        unlinkSync(tarPath);
      } catch {
        // Ignore
      }
      throw new Error(
        `Failed to extract archive on Windows.\n` +
        `Archive: ${archivePath}\n` +
        `Error: ${error}\n\n` +
        `Possible solutions:\n` +
        `  1. Install Windows 10 version 1803 or later (includes tar)\n` +
        `  2. Install Git for Windows (includes tar in Git Bash)\n` +
        `  3. Manually download and extract TruffleHog from:\n` +
        `     https://github.com/trufflesecurity/trufflehog/releases`
      );
    }
  }

  // If we get here, no extraction method worked
  throw new Error(
    `No suitable extraction tool found.\n` +
    `Platform: ${process.platform}\n` +
    `Archive: ${archivePath}\n\n` +
    `Please install tar or extract manually.`
  );
}

/**
 * Make file executable (Unix only)
 */
function makeExecutable(filePath: string): void {
  if (!isWindows()) {
    chmodSync(filePath, 0o755);
    console.log(`Made ${filePath} executable`);
  }
}

/**
 * Main download function
 */
async function downloadTrufflehog(force: boolean = false): Promise<void> {
  // Cross-platform path handling using fileURLToPath
  const binDir = dirname(fileURLToPath(import.meta.url));
  const binaryFilename = getBinaryFilename();
  const binaryPath = join(binDir, binaryFilename);

  // Check if binary already exists
  if (!force && existsSync(binaryPath)) {
    console.log(`TruffleHog binary already exists at: ${binaryPath}`);
    console.log("Use --force to re-download");
    return;
  }

  console.log("Fetching latest TruffleHog release info...");
  const release = await fetchLatestRelease();
  console.log(`Latest version: ${release.tag_name}`);

  const asset = findAssetForPlatform(release.assets, release.tag_name);
  console.log(`Found matching asset: ${asset.name}`);

  // Download to temp file
  const tempPath = join(binDir, asset.name);
  await downloadFile(asset.browser_download_url, tempPath);

  // Extract
  await extractTarGz(tempPath, binDir);

  // Clean up archive
  try {
    unlinkSync(tempPath);
    console.log("Cleaned up archive file");
  } catch (e) {
    console.warn("Warning: Could not remove archive file:", e);
  }

  // Make executable on Unix
  if (existsSync(binaryPath)) {
    makeExecutable(binaryPath);
    console.log(`\nTruffleHog ${release.tag_name} installed successfully!`);
    console.log(`Binary location: ${binaryPath}`);
  } else {
    // The extracted binary might have a different name
    const extractedBinary = join(binDir, "trufflehog");
    if (existsSync(extractedBinary) && isWindows()) {
      // On Windows, rename to add .exe
      const { renameSync } = await import("fs");
      renameSync(extractedBinary, binaryPath);
      console.log(`\nTruffleHog ${release.tag_name} installed successfully!`);
      console.log(`Binary location: ${binaryPath}`);
    } else if (existsSync(extractedBinary)) {
      makeExecutable(extractedBinary);
      console.log(`\nTruffleHog ${release.tag_name} installed successfully!`);
      console.log(`Binary location: ${extractedBinary}`);
    } else {
      throw new Error("Binary not found after extraction");
    }
  }
}

// Main execution
const args = process.argv.slice(2);
const force = args.includes("--force");

downloadTrufflehog(force).catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
