---
name: System
description: Inspect repository integrity, document work, check secrets and publish authorized changes. USE WHEN integrity check, document session, document recent, commit and push, security scan, privacy check, recall past work.
---

# System

Read `PORTABILITY.md` before use.

Use the workspace or repository explicitly named by the user. Never assume its path, remote owner, visibility or default branch. Evidence comes from current files and Git history, not a global memory service.

| Request | Read |
|---|---|
| Integrity check | Workflows/IntegrityCheck.md |
| Document this session | Workflows/DocumentSession.md |
| Catch up documentation | Workflows/DocumentRecent.md |
| Commit and push | Workflows/GitPush.md |
| Scan credentials | Workflows/SecretScanning.md |
| Compare repositories | Workflows/CrossRepoValidation.md |
| Privacy review | Workflows/PrivacyCheck.md |
| Recall earlier work | Workflows/WorkContextRecall.md |

Tools are optional. WORKSPACE_DIR selects their workspace; otherwise they use the invoking directory. Choose output locations explicitly and keep personal data private. Documenting work never automatically authorizes a commit, push or another workflow.

## Examples

Ask for the System workflow with the relevant task, input files and output destination. Apply the local method using available host tools, then report the result and evidence; identify any unavailable capability.
