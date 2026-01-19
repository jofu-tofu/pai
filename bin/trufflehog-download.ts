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

import { existsSync, mkdirSync, chmodSync, unlinkSync, createWriteStream, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { isWindows, getBinaryExtension, commandExistsSync, getPlatformString, getArchitecture, getPlatformDisplayName, getWindowsSyncSpawnOptions } from "../hooks/lib/platform";

const GITHUB_API_URL = "https://api.github.com/repos/trufflesecurity/trufflehog/releases/latest";

/**
 * Extract a tar archive from a Uint8Array buffer.
 * Pure TypeScript implementation - no external dependencies or PowerShell.
 * Implements the POSIX ustar tar format.
 */
function extractTarBuffer(buffer: Uint8Array, destDir: string): void {
  const BLOCK_SIZE = 512;
  let offset = 0;
  const decoder = new TextDecoder("utf-8");

  while (offset + BLOCK_SIZE <= buffer.length) {
    const header = buffer.subarray(offset, offset + BLOCK_SIZE);

    // Check for end of archive (two zero blocks)
    if (header.every((byte) => byte === 0)) {
      break;
    }

    // Parse header fields (ustar format)
    const name = decoder.decode(header.subarray(0, 100)).replace(/\0/g, "").trim();
    if (!name) break;

    // Parse file size (octal, bytes 124-135)
    const sizeStr = decoder.decode(header.subarray(124, 136)).replace(/\0/g, "").trim();
    const size = sizeStr ? parseInt(sizeStr, 8) : 0;

    // Parse type flag (byte 156)
    const typeFlag = String.fromCharCode(header[156]);

    // Parse prefix for long paths (ustar format, bytes 345-500)
    const prefix = decoder.decode(header.subarray(345, 500)).replace(/\0/g, "").trim();
    const fullPath = prefix ? join(prefix, name) : name;

    // Calculate content blocks (rounded up to 512-byte boundary)
    const contentBlocks = Math.ceil(size / BLOCK_SIZE);
    const contentStart = offset + BLOCK_SIZE;
    const contentEnd = contentStart + size;

    // Create full destination path
    const filePath = join(destDir, fullPath);
    const fileDir = dirname(filePath);

    if (typeFlag === "5" || typeFlag === "D") {
      // Directory
      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true });
      }
      if (!existsSync(filePath)) {
        mkdirSync(filePath, { recursive: true });
      }
    } else if (typeFlag === "0" || typeFlag === "\0" || typeFlag === "") {
      // Regular file
      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true });
      }
      const content = buffer.subarray(contentStart, contentEnd);
      writeFileSync(filePath, content);
    }
    // Skip other types (symlinks, etc.) - not needed for binary downloads

    // Move to next header (header + content blocks)
    offset = contentStart + contentBlocks * BLOCK_SIZE;
  }
}

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
 * Uses centralized utilities from platform.ts for consistency
 */
function getPlatformConfig(): { os: string; arch: string; ext: string } {
  // Use centralized utility for platform string (windows, darwin, linux)
  const os = getPlatformString();

  // Use centralized utility for binary extension
  const ext = getBinaryExtension();

  // Map Node's architecture to TruffleHog's naming convention
  const arch = getArchitecture();
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
      // Use spawnSync with cross-platform options for reliable behavior
      const tarResult = spawnSync("tar", ["-xzf", archivePath, "-C", destDir], {
        stdio: "inherit",
        ...getWindowsSyncSpawnOptions(),
      });
      if (tarResult.status === 0) {
        console.log("Extraction complete!");
        return;
      }
      if (!isWindows()) {
        throw new Error(`Failed to extract archive with tar: ${archivePath}`);
      }
      // Fall through to alternative methods on Windows
    } catch {
      // Fall through to alternative methods on Windows
      if (!isWindows()) {
        throw new Error(`Failed to extract archive with tar: ${archivePath}`);
      }
    }
  }

  // Method 2: Windows fallback - Use Bun's native gunzip + TypeScript tar parser
  // This eliminates the PowerShell dependency for cleaner cross-platform support
  if (isWindows()) {
    console.log("Native tar unavailable, using Bun gunzip + TypeScript tar parser...");

    try {
      // Read and decompress using Bun's native gunzipSync
      const gzBuffer = await Bun.file(archivePath).arrayBuffer();
      const tarBuffer = Bun.gunzipSync(new Uint8Array(gzBuffer));

      // Extract tar archive using pure TypeScript
      extractTarBuffer(tarBuffer, destDir);

      console.log("Extraction complete!");
      return;
    } catch (error) {
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
    `Platform: ${getPlatformDisplayName()}\n` +
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
