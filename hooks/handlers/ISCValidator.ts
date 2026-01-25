#!/usr/bin/env bun
/**
 * ISCValidator.ts - IdealState Validation Handler (Stop Event)
 *
 * PURPOSE:
 * Validates that IdealState.jsonl was properly populated during algorithm execution.
 * Checks for empty dimensions/criteria arrays and verifies state was updated.
 *
 * VALIDATION RULES:
 * 1. IdealState.jsonl must exist and be non-empty after OBSERVE
 * 2. At least one dimension or success criterion should be defined
 * 3. State should have been updated during the session (version > 1)
 *
 * BEHAVIOR:
 * - Currently WARNS (logs to stderr) if validation fails
 * - Can be upgraded to BLOCK response if validation fails (shouldBlock)
 *
 * CALLED BY: StopOrchestrator.hook.ts
 *
 * ADAPTED FROM: v2.4 ISCValidator.ts
 * - Uses IdealState.jsonl instead of ISC.json
 * - Uses multi-session getSession() instead of single-file read
 * - Validates dimensions/success_criteria instead of criteria[]
 */

import { existsSync } from 'fs';
import { join } from 'path';
import type { ParsedTranscript } from '../../skills/CORE/Tools/TranscriptParser';
import { getSession, type SessionWork } from '../core/current-work';
import { readIdealState, type IdealState } from '../core/IdealState';
import { getPaiDir } from '../core/paths';

const WORK_DIR = join(getPaiDir(), 'MEMORY', 'WORK');

interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

function validate(workDir: string, sessionWork: SessionWork): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    warnings: [],
    errors: [],
  };

  const workPath = join(WORK_DIR, workDir);

  // Check IdealState.jsonl exists
  const idealStatePath = join(workPath, 'IdealState.jsonl');
  if (!existsSync(idealStatePath)) {
    result.errors.push('IdealState.jsonl not found');
    result.valid = false;
    return result;
  }

  // Read and parse IdealState
  const idealState = readIdealState(workPath);
  if (!idealState) {
    result.errors.push('IdealState.jsonl exists but is empty or unreadable');
    result.valid = false;
    return result;
  }

  // Rule 1: Check for dimensions
  const hasDimensions = idealState.dimensions && idealState.dimensions.length > 0;
  const hasCriteria = idealState.success_criteria && idealState.success_criteria.length > 0;

  if (!hasDimensions && !hasCriteria) {
    result.warnings.push('IdealState has no dimensions or success criteria - algorithm may not have executed properly');
  }

  // Rule 2: Check version indicates updates occurred
  if (idealState.version <= 1) {
    result.warnings.push('IdealState version is 1 - no updates during algorithm execution');
  }

  // Rule 3: Check for UNKNOWN dimensions that weren't resolved
  if (idealState.dimensions) {
    const unknownCount = idealState.dimensions.filter(d => d.status === 'unknown').length;
    if (unknownCount > 0) {
      result.warnings.push(`${unknownCount} dimensions still marked as 'unknown' - THINK phase may not have resolved them`);
    }
  }

  // Rule 4: Check anti-criteria aren't violated
  if (idealState.anti_criteria) {
    const violatedCount = idealState.anti_criteria.filter(ac => ac.status === 'violated').length;
    if (violatedCount > 0) {
      result.warnings.push(`${violatedCount} anti-criteria were violated during execution`);
    }
  }

  return result;
}

export interface ISCValidationResult {
  shouldBlock: boolean;
  blockReason?: string;
  warnings: string[];
  errors: string[];
}

export async function handleISCValidation(
  parsed: ParsedTranscript,
  hookInput: { session_id: string }
): Promise<ISCValidationResult> {
  const result: ISCValidationResult = {
    shouldBlock: false,
    warnings: [],
    errors: [],
  };

  // Get session work (multi-session aware)
  const sessionWork = getSession(hookInput.session_id);
  if (!sessionWork) {
    console.error('[ISCValidator] No current work found for session - skipping validation');
    return result;
  }

  const workPath = join(WORK_DIR, sessionWork.work_dir);
  if (!existsSync(workPath)) {
    console.error(`[ISCValidator] Work path not found: ${workPath}`);
    return result;
  }

  const validationResult = validate(sessionWork.work_dir, sessionWork);
  result.warnings = validationResult.warnings;
  result.errors = validationResult.errors;

  // Log results
  if (result.errors.length > 0) {
    console.error('[ISCValidator] ERRORS:');
    result.errors.forEach((e) => console.error(`  ❌ ${e}`));
  }

  if (result.warnings.length > 0) {
    console.error('[ISCValidator] WARNINGS:');
    result.warnings.forEach((w) => console.error(`  ⚠️  ${w}`));
  }

  // Check if OBSERVE phase was attempted (algorithm was run)
  const responseText = parsed.plainCompletion || '';
  const algorithmAttempted = responseText.includes('OBSERVE') ||
                              responseText.includes('ISC TRACKER') ||
                              responseText.includes('🎯 ISC') ||
                              responseText.includes('O B S E R V E');

  // BLOCKING LOGIC: If algorithm was attempted but IdealState is empty, block
  const idealState = readIdealState(workPath);
  if (algorithmAttempted && idealState) {
    const hasDimensions = idealState.dimensions && idealState.dimensions.length > 0;
    const hasCriteria = idealState.success_criteria && idealState.success_criteria.length > 0;

    if (!hasDimensions && !hasCriteria) {
      result.shouldBlock = true;
      result.blockReason = `IdealState has no dimensions or success criteria after algorithm execution.

You attempted the algorithm but did not populate the IdealState.

REQUIRED:
1. In OBSERVE phase, identify dimensions (what "ideal" looks like)
2. In PLAN phase, define success criteria (how to verify each dimension)
3. Each criterion: 8 words, binary testable STATE

Example dimension: { type: "Functional", description: "User can log in with valid credentials" }
Example criterion: "Login succeeds with valid username and password"

Update the IdealState and try again.`;
    }
  }

  if (validationResult.valid && result.warnings.length === 0) {
    console.error('[ISCValidator] ✓ All validation checks passed');
  }

  return result;
}
