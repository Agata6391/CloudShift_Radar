# Demo Mode with Bob Fallback

## Overview

This directory contains the demo mode implementation with automatic fallback when Bob is unavailable. This ensures the demo always works during hackathon presentations, even if Bob Shell is not configured or fails.

## Files

### `loadDemoRepository.ts`
Provides the demo repository scan context with pre-defined technical signals, environment gaps, and preliminary findings.

### `demoFallbackResult.ts`
Generates a complete, realistic ScanResult when Bob is unavailable. This fallback result:
- Contains 4 realistic findings (ElastiCache, S3, GameLift, SendGrid)
- Includes proper severity levels (Critical, High, Medium, Low)
- Has complete human review queue with 2 items
- Provides comprehensive action plan
- Includes Bob reasoning trace
- Clearly indicates "Demo Mode" in confidence and summaries

## How It Works

### Flow Diagram

```
Demo Request
    ↓
Check for saved result
    ↓
    ├─ Found? → Return cached result ✓ (CONSISTENT)
    ↓
    └─ Not found (first time only)
        ↓
    Generate Demo Result
        ↓
    Store for all future requests
        ↓
    Return demo result ✓
```

**Key Change:** Demo mode now ALWAYS uses saved results for consistency.
No Bob calls are made in demo mode, ensuring reproducible results every time.

### Implementation in `scan.routes.ts`

```typescript
server.post("/api/scans/demo", async (request, reply) => {
  const migrationContext = buildMigrationContext(request.body);
  const scanId = "demo-legacy-cloud-api";

  // ALWAYS use saved demo result for consistency
  const savedResult = await getScanResult(scanId);
  if (savedResult) {
    return reply.send(savedResult); // Guaranteed consistent result
  }

  // First time only - generate and save demo result
  const demoResult = generateDemoFallbackResult(migrationContext, scanId);
  await storeScanResult(demoResult);
  return reply.send(demoResult);
});
```

## Benefits

### 1. **Guaranteed Consistency** 🎯
- **Same results every time** - No variation between demo runs
- Perfect for hackathon judging and presentations
- Reproducible demo flow ensures fair evaluation

### 2. **Zero Bob Dependency** 💰
- Demo mode never calls Bob API
- No Bobcoins consumed during demos
- Works even if Bob is completely unavailable

### 3. **Instant Response** ⚡
- Cached results return immediately
- No waiting for Bob analysis
- Smooth demo experience

### 4. **Realistic Demo Data** 📊
- Pre-generated result mirrors real Bob analysis
- Contains realistic findings and recommendations
- Demonstrates all UI features properly

### 5. **Clear Indication** 🏷️
- Results clearly marked as "Demo Mode"
- Bob confidence shows "(Demo Mode - Bob unavailable)"
- Analysis status indicates "Demo mode - Bob unavailable"

## Testing Demo Mode

### First Request (Generates and Saves)
```bash
curl -X POST http://localhost:3000/api/scans/demo \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Test Project"}'

# Result: Demo result generated and saved
# bobConfidence: "Medium (Demo Mode - Bob unavailable)"
# Response time: ~50ms (generation + save)
```

### Subsequent Requests (Cached)
```bash
curl -X POST http://localhost:3000/api/scans/demo \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Test Project"}'

# Result: EXACT SAME cached result
# bobConfidence: "Medium (Demo Mode - Bob unavailable)"
# Response time: ~5ms (instant from cache)
```

### Verify Consistency
```bash
# Run demo multiple times - results are IDENTICAL
for i in {1..5}; do
  curl -s http://localhost:3000/api/scans/demo \
    -H "Content-Type: application/json" \
    -d '{}' | jq '.scanId, .readinessScore'
done

# Output (all identical):
# "demo-legacy-cloud-api"
# 65
# "demo-legacy-cloud-api"
# 65
# ...
```

## Fallback Result Contents

The fallback result includes:

### Findings (4 total)
1. **ElastiCache** - High severity, needs configuration changes
2. **S3 Storage** - High severity, requires code refactoring
3. **GameLift** - Critical severity, blocks migration
4. **SendGrid** - Medium severity, documentation needed

### Human Review Queue (2 items)
1. S3 refactoring - Senior Backend Engineer
2. GameLift architecture - Principal Engineer/CTO

### Action Plan (5 categories)
- Fix before migration (3 items)
- Validate before migration (3 items)
- Review with senior engineer (3 items)
- Document before migration (3 items)
- Post-migration checks (4 items)

### Bob Reasoning Trace
- Architecture summary
- Cloud dependency reasoning (4 items)
- Risk classification rationale (4 items)
- Confidence rationale (2 items)
- Human review rationale (2 items)
- Recommended modernization notes (3 items)
- Trace timeline (5 items)

## Maintenance

### Updating Demo Results

To update the demo result with new findings or recommendations:

1. Edit `demoFallbackResult.ts`
2. Modify the `generateDemoFallbackResult` function
3. Update findings, action plan, or reasoning trace
4. **Clear cached result:** `rm scan-results/demo-legacy-cloud-api.json`
5. Test with a new demo request (will regenerate and save)

### Pre-generating Demo Results

To pre-generate the demo result before deployment:

```bash
# Start the backend server
cd backend && npm run dev

# Generate and save demo result
curl -X POST http://localhost:3000/api/scans/demo \
  -H "Content-Type: application/json" \
  -d '{}'

# Verify the saved result exists
ls -la scan-results/demo-legacy-cloud-api.json

# Commit the saved result to version control (optional)
git add scan-results/demo-legacy-cloud-api.json
git commit -m "Pre-generate demo result for consistency"
```

### Adding New Demo Scenarios

To add different demo scenarios:

1. Create new scan context in `loadDemoRepository.ts`
2. Add corresponding result generator in `demoFallbackResult.ts`
3. Update routes to handle new demo types with different scanIds
4. Pre-generate and save each demo scenario

## Consistency Guarantees

### What's Guaranteed
- ✅ **Same scanId** - Always `demo-legacy-cloud-api`
- ✅ **Same findings** - Identical 4 findings every time
- ✅ **Same scores** - readinessScore always 65
- ✅ **Same recommendations** - Action plan never changes
- ✅ **Same timestamps** - Only `createdAt` varies (when first generated)

### What Can Vary
- ⚠️ **createdAt timestamp** - Set when result is first generated
- ⚠️ **generatedDate** - Set when result is first generated

To ensure 100% identical results including timestamps, pre-generate and commit the result to version control.

## Future Enhancements

Potential improvements:

1. **Multiple fallback scenarios** - Different demo results for different migration types
2. **Partial fallback** - Use Bob for some analysis, fallback for others
3. **Fallback versioning** - Track which version of fallback was used
4. **Fallback metrics** - Log when fallback is used vs real Bob
5. **Custom fallback** - Allow users to provide their own demo data

## Related Files

- `backend/src/routes/scan.routes.ts` - Demo endpoint implementation
- `backend/src/storage/scanResultStore.ts` - Result caching
- `shared/src/scan.ts` - ScanResult type definitions
- `frontend/src/data/mockScanResult.ts` - Frontend mock data (separate from backend fallback)