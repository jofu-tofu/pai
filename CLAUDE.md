# Instructions for Claude - Development & Testing

## Context & Motivation

Development and testing in this repository requires specific environment configuration. Without proper setup, tests will fail, files will be created in wrong locations, and code will access incorrect paths. Reading DEVELOPMENT.md BEFORE any development or testing work prevents these issues and ensures efficient, error-free development.

## Critical Pre-Work Requirement

**Before doing ANY development or testing work in this repository:**

1. Read the **DEVELOPMENT.md** file completely
2. Follow ALL setup instructions in order
3. Verify environment configuration as specified

## What DEVELOPMENT.md Contains

DEVELOPMENT.md provides essential instructions for:

- **Environment Variables:** Setting PAI_DIR correctly for dev vs production
- **Test Execution:** Running tests with proper configuration
- **Directory Structure:** Understanding where code and data live
- **Common Issues:** Troubleshooting path errors, missing modules, and wrong locations
- **Deployment:** Checklist for moving from development to production

## Execution Pattern

When user requests development or testing work:

1. **FIRST:** Read DEVELOPMENT.md if not already read this session
2. **THEN:** Set environment variables as specified (PAI_DIR)
3. **VERIFY:** Environment is configured correctly
4. **PROCEED:** With development or testing tasks

## Success Criteria

- PAI_DIR is set to correct location (worktree for dev, ~/.pai for prod)
- All required directories exist
- Tests run without path-related errors
- Files are created/modified in expected locations

## Why This Matters

The PAI system uses PAI_DIR to locate resources throughout the codebase. Without it:
- Tests fail with "path not found" errors
- Files are created in wrong directories
- Code accesses production paths during development
- Development pollutes production environment

Following DEVELOPMENT.md setup prevents all these issues.
