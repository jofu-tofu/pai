#!/usr/bin/env bun

/**
 * TranslateSkill - Core translation engine
 *
 * Translates skills between platforms using declarative mappings.
 *
 * Usage:
 *   bun run TranslateSkill.ts --skill SkillName --from claude-code --to windsurf --output ~/output/
 *   bun run TranslateSkill.ts --skill UpdatePAI --from claude-code --to windsurf
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml';
import { homedir } from 'os';
import { parseFrontmatter as parseFrontmatterUtil, splitLines, getEnvVar } from '../../../hooks/core/platform';

// Types
interface PlatformSchema {
  platform: string;
  version: string;
  structure: any;
  components: any;
  naming_conventions: any;
}

interface TranslationMapping {
  mapping_version: string;
  source: string;
  target: string;
  bidirectional: boolean;
  component_mappings: any;
  field_mappings: any;
  directory_mappings: any;
  transforms: any;
}

interface SkillMetadata {
  name: string;
  description: string;
  [key: string]: any;
}

interface TranslationContext {
  sourceSchema: PlatformSchema;
  targetSchema: PlatformSchema;
  mapping: TranslationMapping;
  sourcePath: string;
  targetPath: string;
}

// Configuration
const PAI_DIR = getEnvVar('PAI_DIR') || join(homedir(), 'pai');
const SKILLS_DIR = join(PAI_DIR, 'skills');
const MAPPINGS_DIR = join(PAI_DIR, 'skills', 'SkillTranslate', 'Mappings');

// Parse CLI arguments
function parseArgs(): { skill: string; from: string; to: string; output?: string } {
  const args = process.argv.slice(2);
  const result: any = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    result[key] = value;
  }

  if (!result.skill || !result.from || !result.to) {
    console.error('Usage: TranslateSkill.ts --skill <name> --from <platform> --to <platform> [--output <path>]');
    process.exit(1);
  }

  return result as { skill: string; from: string; to: string; output?: string };
}

// Load platform schema
function loadPlatformSchema(platform: string): PlatformSchema {
  const schemaPath = join(MAPPINGS_DIR, 'Platforms', `${platform}.yaml`);

  if (!existsSync(schemaPath)) {
    throw new Error(`Platform schema not found: ${platform} (${schemaPath})`);
  }

  const content = readFileSync(schemaPath, 'utf-8');
  return parseYAML(content) as PlatformSchema;
}

// Load translation mapping
function loadTranslationMapping(from: string, to: string): TranslationMapping {
  // Try direct mapping first
  let mappingPath = join(MAPPINGS_DIR, 'Translations', `${from}-${to}.yaml`);

  // Try reverse if bidirectional
  if (!existsSync(mappingPath)) {
    mappingPath = join(MAPPINGS_DIR, 'Translations', `${to}-${from}.yaml`);
  }

  if (!existsSync(mappingPath)) {
    throw new Error(`Translation mapping not found: ${from} → ${to}`);
  }

  const content = readFileSync(mappingPath, 'utf-8');
  const mapping = parseYAML(content) as TranslationMapping;

  // Verify bidirectional or correct direction
  if (mapping.source !== from && mapping.target !== to) {
    if (!mapping.bidirectional) {
      throw new Error(`Mapping is not bidirectional and direction is wrong`);
    }
  }

  return mapping;
}

// Transform functions
const transforms = {
  to_kebab_case(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  },

  to_title_case(str: string): string {
    return str.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
  },

  extract_trigger_patterns(description: string): string[] {
    const match = description.match(/USE WHEN (.+?)(?:\.|$)/);
    if (!match) return [];

    return match[1].split(/,| OR /).map(s => s.trim());
  },

  extract_frontmatter(markdownContent: string): SkillMetadata | null {
    const parsed = parseFrontmatterUtil(markdownContent);
    if (!parsed) return null;

    return parseYAML(parsed.frontmatter) as SkillMetadata;
  },

  markdown_to_flow_steps(markdown: string): any[] {
    const steps: any[] = [];
    const lines = splitLines(markdown);

    for (const line of lines) {
      const match = line.match(/^[-*]\s+(.+)$/);
      if (match) {
        steps.push({
          action: match[1].replace(/^Step \d+:\s*/, ''),
          description: match[1]
        });
      }
    }

    return steps;
  }
};

// Parse Claude Code SKILL.md
function parseClaudeSkill(skillPath: string): any {
  const skillMdPath = join(skillPath, 'SKILL.md');

  if (!existsSync(skillMdPath)) {
    throw new Error(`SKILL.md not found in ${skillPath}`);
  }

  const content = readFileSync(skillMdPath, 'utf-8');
  const metadata = transforms.extract_frontmatter(content);

  if (!metadata) {
    throw new Error('No frontmatter found in SKILL.md');
  }

  // Find workflows
  const workflowsDir = join(skillPath, 'Workflows');
  const workflows = existsSync(workflowsDir)
    ? readdirSync(workflowsDir).filter(f => f.endsWith('.md'))
    : [];

  // Find tools
  const toolsDir = join(skillPath, 'Tools');
  const tools = existsSync(toolsDir)
    ? readdirSync(toolsDir).filter(f => f.endsWith('.ts'))
    : [];

  return {
    metadata,
    content,
    workflows,
    tools,
    workflowsDir,
    toolsDir
  };
}

// Generate Windsurf cascade.yaml
function generateWindsurfCascade(claudeSkill: any, ctx: TranslationContext): any {
  const { metadata } = claudeSkill;
  const { mapping } = ctx;

  const cascade: any = {
    cascadeName: transforms.to_kebab_case(metadata.name),
    summary: metadata.description,
    version: metadata.version || '1.0.0'
  };

  // Extract triggers from description
  const triggers = transforms.extract_trigger_patterns(metadata.description);
  if (triggers.length > 0) {
    cascade.triggers = triggers;
  }

  return cascade;
}

// Translate workflow to flow
function translateWorkflowToFlow(workflowPath: string, workflowName: string): any {
  const content = readFileSync(workflowPath, 'utf-8');

  // Extract workflow name from H1
  const nameMatch = content.match(/^#\s+(.+)$/m);
  const name = nameMatch ? nameMatch[1] : workflowName;

  // Extract purpose/description (CRLF-safe)
  const purposeMatch = content.match(/##\s+Purpose\s+(.+?)(?=\r?\n##|\r?\n$)/s);
  const description = purposeMatch ? purposeMatch[1].trim() : '';

  // Extract steps (CRLF-safe)
  const stepsMatch = content.match(/##\s+Steps\s+([\s\S]+?)(?=\r?\n##|\r?\n$)/);
  const steps = stepsMatch ? transforms.markdown_to_flow_steps(stepsMatch[1]) : [];

  return {
    flowName: transforms.to_kebab_case(name),
    description,
    steps
  };
}

// Main translation function
async function translateSkill(skill: string, from: string, to: string, output?: string): Promise<void> {
  console.log(`\n🔄 Translating skill: ${skill}`);
  console.log(`   From: ${from}`);
  console.log(`   To: ${to}\n`);

  // Load schemas and mappings
  const sourceSchema = loadPlatformSchema(from);
  const targetSchema = loadPlatformSchema(to);
  const mapping = loadTranslationMapping(from, to);

  console.log('✓ Loaded platform schemas and mappings');

  // Setup paths
  const sourcePath = join(SKILLS_DIR, skill);
  const targetPath = output
    ? join(output, transforms.to_kebab_case(skill))
    : join(SKILLS_DIR, `${skill}-${to}`);

  const ctx: TranslationContext = {
    sourceSchema,
    targetSchema,
    mapping,
    sourcePath,
    targetPath
  };

  // Parse source skill (Claude Code)
  const claudeSkill = parseClaudeSkill(sourcePath);
  console.log('✓ Parsed source skill');

  // Create target directory
  if (!existsSync(targetPath)) {
    mkdirSync(targetPath, { recursive: true });
  }

  // Generate cascade.yaml
  const cascade = generateWindsurfCascade(claudeSkill, ctx);
  const cascadePath = join(targetPath, 'cascade.yaml');
  writeFileSync(cascadePath, stringifyYAML(cascade), 'utf-8');
  console.log('✓ Generated cascade.yaml');

  // Translate workflows to flows
  if (claudeSkill.workflows.length > 0) {
    const flowsDir = join(targetPath, 'flows');
    mkdirSync(flowsDir, { recursive: true });

    for (const workflowFile of claudeSkill.workflows) {
      const workflowPath = join(claudeSkill.workflowsDir, workflowFile);
      const flow = translateWorkflowToFlow(workflowPath, workflowFile.replace('.md', ''));

      const flowFileName = transforms.to_kebab_case(workflowFile.replace('.md', '')) + '.yaml';
      const flowPath = join(flowsDir, flowFileName);

      writeFileSync(flowPath, stringifyYAML(flow), 'utf-8');
      console.log(`  ✓ Translated workflow: ${workflowFile} → ${flowFileName}`);
    }
  }

  // Copy tools to commands (with minimal transformation)
  if (claudeSkill.tools.length > 0) {
    const commandsDir = join(targetPath, 'commands');
    mkdirSync(commandsDir, { recursive: true });

    for (const toolFile of claudeSkill.tools) {
      const toolPath = join(claudeSkill.toolsDir, toolFile);
      const commandFileName = transforms.to_kebab_case(toolFile.replace('.ts', '')) + '.ts';
      const commandPath = join(commandsDir, commandFileName);

      // Read and copy (could add transformations here)
      const toolContent = readFileSync(toolPath, 'utf-8');
      writeFileSync(commandPath, toolContent, 'utf-8');
      console.log(`  ✓ Copied tool: ${toolFile} → ${commandFileName}`);
    }
  }

  console.log(`\n✅ Translation complete!`);
  console.log(`   Output: ${targetPath}\n`);
}

// Main execution
if (import.meta.main) {
  const args = parseArgs();

  try {
    await translateSkill(args.skill, args.from, args.to, args.output);
  } catch (error) {
    console.error(`\n❌ Translation failed:`, (error as Error).message);
    process.exit(1);
  }
}

export { translateSkill, loadPlatformSchema, loadTranslationMapping };
