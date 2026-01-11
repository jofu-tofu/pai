#!/usr/bin/env bun
/**
 * Convert BMAD Claude commands to Windsurf workflows
 *
 * This script reads all .md files from pai-cli/src/templates/bmad/.claude/commands/bmad/
 * and converts them to Windsurf-compatible workflow files in
 * pai-cli/src/templates/bmad/.windsurf/workflows/bmad/
 */

import { promises as fs } from 'fs';
import { join, relative, dirname, basename } from 'path';

interface FrontMatter {
  name?: string;
  description?: string;
  [key: string]: any;
}

/**
 * Parse frontmatter from markdown file
 */
function parseFrontMatter(content: string): { frontMatter: FrontMatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    return { frontMatter: {}, body: content };
  }

  const [, frontMatterText, body] = match;
  const frontMatter: FrontMatter = {};

  // Parse YAML-like frontmatter
  frontMatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Remove quotes
      if ((value.startsWith("'") && value.endsWith("'")) ||
          (value.startsWith('"') && value.endsWith('"'))) {
        value = value.slice(1, -1);
      }

      frontMatter[key] = value;
    }
  });

  return { frontMatter, body };
}

/**
 * Convert Claude command to Windsurf workflow
 */
function convertToWindsurfWorkflow(content: string, filename: string): string {
  const { frontMatter, body } = parseFrontMatter(content);

  // Extract description
  const description = frontMatter.description || frontMatter.name || 'BMAD workflow';

  // Build Windsurf frontmatter
  const windsurfFrontMatter = [
    '---',
    `description: ${description}`,
    'auto_execution_mode: 1',
    '---',
    ''
  ].join('\n');

  // Build workflow content
  // Windsurf workflows can contain the same instructions as Claude commands
  return windsurfFrontMatter + body;
}

/**
 * Recursively find all .md files in a directory
 */
async function findMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        return findMarkdownFiles(fullPath);
      } else if (entry.name.endsWith('.md')) {
        return [fullPath];
      }
      return [];
    })
  );

  return files.flat();
}

/**
 * Main conversion function
 */
async function convertBmadToWindsurf() {
  const rootDir = process.cwd();
  const sourceDir = join(rootDir, 'pai-cli/src/templates/bmad/.claude/commands/bmad');
  const targetDir = join(rootDir, 'pai-cli/src/templates/bmad/.windsurf/workflows/bmad');

  console.log('🔄 Converting BMAD Claude commands to Windsurf workflows...');
  console.log(`📂 Source: ${sourceDir}`);
  console.log(`📂 Target: ${targetDir}`);

  // Find all markdown files in source directory
  const sourceFiles = await findMarkdownFiles(sourceDir);
  console.log(`\n📝 Found ${sourceFiles.length} command files to convert`);

  let converted = 0;
  let errors = 0;

  for (const sourceFile of sourceFiles) {
    try {
      // Read source file
      const content = await fs.readFile(sourceFile, 'utf-8');

      // Convert to Windsurf format
      const windsurfContent = convertToWindsurfWorkflow(content, basename(sourceFile));

      // Calculate relative path from source root
      const relativePath = relative(sourceDir, sourceFile);
      const targetFile = join(targetDir, relativePath);

      // Ensure target directory exists
      await fs.mkdir(dirname(targetFile), { recursive: true });

      // Write target file
      await fs.writeFile(targetFile, windsurfContent, 'utf-8');

      console.log(`  ✓ ${relativePath}`);
      converted++;
    } catch (error) {
      console.error(`  ✗ ${relative(sourceDir, sourceFile)}: ${error}`);
      errors++;
    }
  }

  console.log(`\n✅ Conversion complete!`);
  console.log(`   Converted: ${converted} files`);
  if (errors > 0) {
    console.log(`   Errors: ${errors} files`);
  }
  console.log(`\n💡 Windsurf workflows created in: ${targetDir}`);
  console.log(`\n📋 Next steps:`);
  console.log(`   1. Run: pai init --method bmad --ide windsurf`);
  console.log(`   2. Open project in Windsurf IDE`);
  console.log(`   3. Use workflows via: /workflow-name`);
}

// Run conversion
convertBmadToWindsurf().catch(console.error);
