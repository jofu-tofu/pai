# Design Review Report Template

## 1. Summary

- **Target:** `[SkillName]`
- **Overall Score:** `[0-100]`
- **Top Risk:** `[one sentence]`
- **Top Opportunity:** `[one sentence]`

## 2. Scope

- **Included:** `[files/directories]`
- **Excluded:** `[files/directories]`
- **Review Mode:** `[structure-only | structure+content]`

## 3. Design Metadata Links

Use this section when external artifacts are part of the design context.

| Item | Type | Link | Why Linked (not embedded) | In-Design Summary Present |
|---|---|---|---|---|
| `[example: decision log]` | `[ticket | dashboard | transcript | spec]` | `[URL/path]` | `[reason]` | `[yes/no]` |

## 4. Critical Context Coverage

List critical information that must be known to implement or review safely.

| Critical Item | Where Captured | Adequate for Decisions (Y/N) | Gap |
|---|---|---|---|
| `[item]` | `[in design section or metadata link]` | `[Y/N]` | `[if any]` |

## 5. Structure Enumeration

### Routing and Entry Points

- User-facing workflows:
  - `[WorkflowName] -> [file path]`
- Internal workflows:
  - `[WorkflowName] -> [file path]`

### Artifact Contracts

| Stage | Input | Output |
|---|---|---|
| `[stage]` | `[artifact]` | `[artifact]` |

## 6. Visuals

### Execution Flow

```mermaid
flowchart TD
  A[Entry Point] --> B[Stage]
  B --> C[Stage]
  C --> D[Report]
```

Interpretation: `[1 short paragraph]`

### Structure Map

```mermaid
graph TD
  S[Skill Root] --> W[Workflows]
  S --> R[Reference Files]
  S --> T[Tools]
```

Interpretation: `[1 short paragraph]`

## 7. Dimension Scores

| Dimension | Raw (0-2) | Weight | Weighted Score | Evidence | Recommendation |
|---|---:|---:|---:|---|---|
| D1 Audience, Readability, and Accessibility | | | | | |
| D2 Scope and Boundaries | | | | | |
| D3 Signal Density and Digestibility | | | | | |
| D4 Decision Traceability and Tradeoffs | | | | | |
| D5 Workflow and Ownership Clarity | | | | | |
| D6 Verification and Credibility | | | | | |
| D7 Visual Expressiveness (Mermaid-First) | | | | | |
| D8 Metadata Boundary and Link Hygiene | | | | | |

## 8. Findings by Priority

### Must Fix

1. `[issue]`  
   - Owner: `[role]`  
   - Change: `[artifact]`  
   - Outcome: `[measurable result]`

### Should Fix

1. `[issue]`  
   - Owner: `[role]`  
   - Change: `[artifact]`  
   - Outcome: `[measurable result]`

### Optional

1. `[issue]`  
   - Owner: `[role]`  
   - Change: `[artifact]`  
   - Outcome: `[measurable result]`

## 9. Source Links

- `[Source title](URL)`
