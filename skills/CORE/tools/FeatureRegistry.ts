#!/usr/bin/env bun
/**
 * Feature Registry CLI
 *
 * JSON-based feature tracking for development projects.
 * "JSON for feature tracking proved more robust than Markdown,
 * as models were less likely to inadvertently corrupt structured data." - Anthropic
 *
 * Usage:
 *   bun run skills/CORE/Tools/FeatureRegistry.ts <command> [options]
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getPaiDir } from '../../../hooks/lib/paths';

type FeatureStatus = 'pending' | 'in_progress' | 'passing' | 'failing' | 'blocked';
type Priority = 'P1' | 'P2' | 'P3';

interface TestStep {
  description: string;
  status: 'pending' | 'passing' | 'failing';
}

interface Feature {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  status: FeatureStatus;
  acceptance_criteria: string[];
  test_steps: TestStep[];
  blocked_by: string[];
  notes: { timestamp: string; note: string }[];
  started_at: string | null;
  completed_at: string | null;
}

interface FeatureRegistry {
  project: string;
  created: string;
  updated: string;
  features: Feature[];
}

const PAI_DIR = getPaiDir();
const REGISTRY_DIR = join(PAI_DIR, 'MEMORY', 'progress');

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function getRegistryPath(project: string): string {
  ensureDir(REGISTRY_DIR);
  return join(REGISTRY_DIR, `${project}-features.json`);
}

function loadRegistry(project: string): FeatureRegistry | null {
  const path = getRegistryPath(project);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function saveRegistry(registry: FeatureRegistry): void {
  registry.updated = new Date().toISOString();
  writeFileSync(getRegistryPath(registry.project), JSON.stringify(registry, null, 2));
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 8);
}

// Commands

function initRegistry(project: string): void {
  const path = getRegistryPath(project);
  if (existsSync(path)) {
    console.log(`Registry already exists for ${project}`);
    return;
  }

  const registry: FeatureRegistry = {
    project,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    features: []
  };

  saveRegistry(registry);
  console.log(`Initialized feature registry: ${path}`);
}

function addFeature(project: string, name: string, options: { priority?: Priority; description?: string }): void {
  const registry = loadRegistry(project);
  if (!registry) {
    console.error(`No registry for ${project}. Run 'init' first.`);
    process.exit(1);
  }

  const feature: Feature = {
    id: generateId(),
    name,
    description: options.description || '',
    priority: options.priority || 'P2',
    status: 'pending',
    acceptance_criteria: [],
    test_steps: [],
    blocked_by: [],
    notes: [],
    started_at: null,
    completed_at: null
  };

  registry.features.push(feature);
  saveRegistry(registry);
  console.log(`Added feature: ${name} (${feature.id}) - ${feature.priority}`);
}

function updateFeature(project: string, id: string, status: FeatureStatus): void {
  const registry = loadRegistry(project);
  if (!registry) {
    console.error(`No registry for ${project}`);
    process.exit(1);
  }

  const feature = registry.features.find(f => f.id === id || f.name.toLowerCase().includes(id.toLowerCase()));
  if (!feature) {
    console.error(`Feature not found: ${id}`);
    process.exit(1);
  }

  const oldStatus = feature.status;
  feature.status = status;

  if (status === 'in_progress' && !feature.started_at) {
    feature.started_at = new Date().toISOString();
  }
  if ((status === 'passing' || status === 'failing') && !feature.completed_at) {
    feature.completed_at = new Date().toISOString();
  }

  saveRegistry(registry);
  console.log(`Updated ${feature.name}: ${oldStatus} -> ${status}`);
}

function listFeatures(project: string): void {
  const registry = loadRegistry(project);
  if (!registry) {
    console.error(`No registry for ${project}`);
    process.exit(1);
  }

  const statusIcons: Record<FeatureStatus, string> = {
    pending: '[ ]',
    in_progress: '[~]',
    passing: '[v]',
    failing: '[x]',
    blocked: '[!]'
  };

  console.log(`\nFeature Registry: ${project}`);
  console.log(`${'='.repeat(50)}\n`);

  const byPriority = { P1: [] as Feature[], P2: [] as Feature[], P3: [] as Feature[] };
  registry.features.forEach(f => byPriority[f.priority].push(f));

  for (const priority of ['P1', 'P2', 'P3'] as Priority[]) {
    if (byPriority[priority].length === 0) continue;
    console.log(`${priority}:`);
    for (const feature of byPriority[priority]) {
      console.log(`  ${statusIcons[feature.status]} ${feature.name} (${feature.id})`);
    }
    console.log('');
  }

  // Summary
  const total = registry.features.length;
  const passing = registry.features.filter(f => f.status === 'passing').length;
  const failing = registry.features.filter(f => f.status === 'failing').length;
  const inProgress = registry.features.filter(f => f.status === 'in_progress').length;

  console.log(`Summary: ${passing}/${total} passing, ${failing} failing, ${inProgress} in progress`);
}

function verifyFeatures(project: string): void {
  const registry = loadRegistry(project);
  if (!registry) {
    console.error(`No registry for ${project}`);
    process.exit(1);
  }

  console.log(`\nVerification Report: ${project}`);
  console.log(`${'='.repeat(50)}\n`);

  const issues: string[] = [];

  for (const feature of registry.features) {
    if (feature.status === 'passing') {
      console.log(`[v] ${feature.name} - PASSING`);
    } else if (feature.status === 'failing') {
      console.log(`[x] ${feature.name} - FAILING`);
      issues.push(`${feature.name} is failing`);
    } else if (feature.status === 'blocked') {
      console.log(`[!] ${feature.name} - BLOCKED by: ${feature.blocked_by.join(', ')}`);
      issues.push(`${feature.name} is blocked`);
    } else {
      console.log(`[ ] ${feature.name} - ${feature.status.toUpperCase()}`);
      if (feature.priority === 'P1') {
        issues.push(`P1 feature "${feature.name}" not complete`);
      }
    }
  }

  console.log('');
  if (issues.length === 0) {
    console.log('All features verified successfully!');
  } else {
    console.log(`Issues found (${issues.length}):`);
    issues.forEach(i => console.log(`  - ${i}`));
  }
}

function nextFeature(project: string): void {
  const registry = loadRegistry(project);
  if (!registry) {
    console.error(`No registry for ${project}`);
    process.exit(1);
  }

  // Find highest priority non-complete feature
  const priorities: Priority[] = ['P1', 'P2', 'P3'];

  for (const priority of priorities) {
    const feature = registry.features.find(
      f => f.priority === priority &&
           f.status !== 'passing' &&
           f.status !== 'blocked'
    );
    if (feature) {
      console.log(`\nNext feature to work on:`);
      console.log(`  ${feature.priority}: ${feature.name} (${feature.id})`);
      console.log(`  Status: ${feature.status}`);
      if (feature.description) {
        console.log(`  Description: ${feature.description}`);
      }
      return;
    }
  }

  console.log('No pending features found!');
}

// CLI Parser

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'init':
    if (!args[1]) {
      console.error('Usage: feature-registry init <project>');
      process.exit(1);
    }
    initRegistry(args[1]);
    break;

  case 'add':
    if (!args[1] || !args[2]) {
      console.error('Usage: feature-registry add <project> <name> [--priority P1|P2|P3]');
      process.exit(1);
    }
    const priorityIndex = args.indexOf('--priority');
    const priority = priorityIndex !== -1 ? args[priorityIndex + 1] as Priority : 'P2';
    addFeature(args[1], args[2], { priority });
    break;

  case 'update':
    if (!args[1] || !args[2] || !args[3]) {
      console.error('Usage: feature-registry update <project> <id> <status>');
      console.error('Status: pending, in_progress, passing, failing, blocked');
      process.exit(1);
    }
    updateFeature(args[1], args[2], args[3] as FeatureStatus);
    break;

  case 'list':
    if (!args[1]) {
      console.error('Usage: feature-registry list <project>');
      process.exit(1);
    }
    listFeatures(args[1]);
    break;

  case 'verify':
    if (!args[1]) {
      console.error('Usage: feature-registry verify <project>');
      process.exit(1);
    }
    verifyFeatures(args[1]);
    break;

  case 'next':
    if (!args[1]) {
      console.error('Usage: feature-registry next <project>');
      process.exit(1);
    }
    nextFeature(args[1]);
    break;

  default:
    console.log(`
Feature Registry CLI - JSON-based feature tracking

Commands:
  init <project>                    Initialize feature registry
  add <project> <name> [--priority P1|P2|P3]  Add a feature
  update <project> <id> <status>    Update feature status
  list <project>                    List all features by priority
  verify <project>                  Run verification report
  next <project>                    Show next priority feature

Status values: pending, in_progress, passing, failing, blocked

Examples:
  feature-registry init my-app
  feature-registry add my-app "User authentication" --priority P1
  feature-registry update my-app abc123 in_progress
  feature-registry list my-app
  feature-registry verify my-app
`);
}
