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
    ├─ Found? → Return cached result ✓
    ↓
    └─ Not found
        ↓
    Try Bob Analysis
        ↓
        ├─ Success? → Store & return Bob result ✓
        ↓
        └─ Failed/Unavailable
            ↓
        Generate Fallback Result
            ↓
        Store fallback for caching
            ↓
        Return fallback result ✓
```

### Implementation in `scan.routes.ts`

```typescript
server.post("/api/scans/demo", async (request, reply) => {
  const migrationContext = buildMigrationContext(request.body);
  const scanId = "demo-legacy-cloud-api";

  // 1. Try cached result first (no Bob cost)
  const savedResult = await getScanResult(scanId);
  if (savedResult) {
    return reply.send(savedResult);
  }

  // 2. Try Bob analysis
  try {
    assertBobConfigured(env);
    const scanContext = loadDemoRepositoryScanContext();
    const result = await analyzeWithBob(migrationContext, scanContext, scanId, env);
    return reply.send(result);
  } catch (error) {
    // 3. Fallback to pre-generated result
    const fallbackResult = generateDemoFallbackResult(migrationContext, scanId);
    await storeScanResult(fallbackResult); // Cache for next time
    return reply.send(fallbackResult);
  }
});
```

## Benefits

### 1. **Hackathon Reliability** 🎯
- Demo never crashes due to Bob unavailability
- Presenters can confidently show the application
- No dependency on external services during demo

### 2. **Cost Efficiency** 💰
- First request uses Bob (if available)
- Result is cached for subsequent requests
- Fallback is free (no Bobcoins consumed)

### 3. **Realistic Demo Data** 📊
- Fallback result mirrors real Bob analysis
- Contains realistic findings and recommendations
- Demonstrates all UI features properly

### 4. **Clear Indication** 🏷️
- Fallback results clearly marked as "Demo Mode"
- Bob confidence shows "(Demo Mode - Bob unavailable)"
- Analysis status indicates "Demo mode - Bob unavailable"

## Testing the Fallback

### Scenario 1: Bob Available
```bash
# Bob is configured and working
curl -X POST http://localhost:3000/api/scans/demo \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Test Project"}'

# Result: Real Bob analysis
# bobConfidence: "High" (or Medium/Low based on analysis)
```

### Scenario 2: Bob Unavailable
```bash
# Bob is not configured or fails
curl -X POST http://localhost:3000/api/scans/demo \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Test Project"}'

# Result: Fallback demo result
# bobConfidence: "Medium (Demo Mode - Bob unavailable)"
```

### Scenario 3: Cached Result
```bash
# Second request (Bob or fallback already cached)
curl -X POST http://localhost:3000/api/scans/demo \
  -H "Content-Type: application/json" \
  -d '{"projectName": "Test Project"}'

# Result: Cached result (instant response)
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

### Updating Fallback Data

To update the fallback result with new findings or recommendations:

1. Edit `demoFallbackResult.ts`
2. Modify the `generateDemoFallbackResult` function
3. Update findings, action plan, or reasoning trace
4. Clear cached results: `rm scan-results/demo-legacy-cloud-api.json`
5. Test with a new demo request

### Adding New Demo Scenarios

To add different demo scenarios:

1. Create new scan context in `loadDemoRepository.ts`
2. Add corresponding fallback generator
3. Update routes to handle new demo types
4. Use different scanIds for different scenarios

## Error Handling

The fallback pattern handles these error cases:

1. **Bob not configured** - `BOB_CONFIGURATION_ERROR`
2. **Bob executable missing** - `BOB_EXECUTABLE_ERROR`
3. **Bob provider error** - `BOB_PROVIDER_ERROR`
4. **Bob analysis failed** - Any other error during analysis
5. **Bob timeout** - Network or execution timeout

All errors trigger the fallback, ensuring demo reliability.

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