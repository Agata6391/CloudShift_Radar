# CloudShift Radar Terminology Guide

## Findings vs Technical Findings

### Standard Terminology: "Findings"

**Use:** `findings` (lowercase, plural)

**Definition:** Migration-related issues detected by Bob during repository analysis.

### Data Structure

All findings are stored in a single data structure:
- **Interface:** `Finding` (from `@cloudshift-radar/shared`)
- **Location in results:** `ScanResult.findings[]`
- **Source:** Bob's analysis of preliminary scanner detections

### There is NO separate "technical findings" data type

The term "technical findings" was causing confusion. Here's the clarification:

- ✅ **Correct:** `findings` - The standard term for all detected issues
- ❌ **Avoid:** "technical findings" as a separate concept
- ✅ **Correct:** "technical details of findings" - When referring to technical aspects

### Component Naming

- **`MigrationImpactFindingsTab`** - Main findings view (migration impact focus)
- **`TechnicalFindingsTab`** - Alternative view (technical details focus)
- Both components display the same underlying data (`ScanResult.findings`)

### Why Both Components Exist

While there's only one `findings` data structure, we have two different views:

1. **MigrationImpactFindingsTab** (Primary)
   - Emphasizes migration risk and feature survival
   - Shows business impact and feature status
   - Used in the main "Findings" tab

2. **TechnicalFindingsTab** (Alternative)
   - Emphasizes technical details and severity
   - Shows resolution levels and confidence
   - Can be used for technical-focused reports

### Preliminary Findings

**Interface:** `PreliminaryFinding`

These are scanner-detected issues BEFORE Bob's analysis:
- Created by the scanner (detectCloudSignals, detectEnvGaps, etc.)
- Converted to full `Finding` objects by Bob
- Bob enriches them with severity, confidence, and recommendations

### Usage Examples

```typescript
// ✅ Correct
const findings = result.findings;
const highRiskFindings = findings.filter(f => f.severity === "High");

// ✅ Correct - referring to technical aspects
const technicalDetails = finding.technicalIssue;
const technicalComplexity = finding.technicalComplexity;

// ❌ Avoid - implies separate data structure
const technicalFindings = result.technicalFindings; // This doesn't exist!
```

### Key Points

1. **Single source of truth:** `ScanResult.findings[]`
2. **No separate technical findings:** All findings contain both technical and business information
3. **Component names:** May reference "technical" but they all use the same `findings` data
4. **Preliminary findings:** Scanner output before Bob's enrichment

### Related Interfaces

- `Finding` - Full finding with Bob's analysis
- `PreliminaryFinding` - Scanner detection before Bob
- `HumanReviewItem` - Subset of findings requiring human review
- `FeatureSurvivalItem` - Feature-level migration predictions

---

**Last Updated:** 2026-05-16
**Issue Reference:** QAVer1.md #23