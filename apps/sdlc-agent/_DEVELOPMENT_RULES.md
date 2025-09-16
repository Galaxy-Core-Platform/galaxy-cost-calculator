# Galaxy SDLC Agent Development Rules

## Critical Principles

### 1. DATA SOURCE TRANSPARENCY
**RULE:** Users must ALWAYS know the source of data they're viewing.

- **NEVER** automatically fall back to mock data without explicit user awareness
- **ALWAYS** show clear indicators when data is from mock vs real API
- **ALWAYS** display error messages that specify which provider failed
- **NEVER** hide API failures behind silent mock data substitution

**Violations:**
```javascript
// WRONG - Silent fallback
try {
  const data = await fetchFromAPI();
  return data;
} catch {
  return mockData; // User doesn't know this is mock!
}

// CORRECT - Transparent error handling
try {
  const data = await fetchFromAPI();
  return data;
} catch (error) {
  setError(`Failed to fetch from ${currentProvider}: ${error.message}`);
  throw error; // Let user decide what to do
}
```

### 2. WORKFLOW CONSISTENCY
**RULE:** Workflows must be IDENTICAL between mock and real modes.

- **SAME** sequence of operations in both modes
- **SAME** UI states and transitions
- **SAME** data structures and formats
- **NO** special behaviors or shortcuts in either mode

**Example:**
When Upload Requirements is clicked:
1. Run knock-out verification ✓ (both modes)
2. Run assessment in parallel ✓ (both modes)
3. Run summary generation in parallel ✓ (both modes)
4. Display results in same format ✓ (both modes)

### 3. NO AUTOMATIC MODE SWITCHING
**RULE:** The selected provider/mode must remain constant until explicitly changed by user.

- **NEVER** switch from real API to mock on error
- **NEVER** assume user wants fallback behavior
- **ALWAYS** maintain user's explicit selection
- **ALWAYS** require user action to change providers

### 4. USER CONTROL AND AWARENESS
**RULE:** Users must have complete control over data sources and system behavior.

- Provider selector must **ALWAYS** show current active provider
- Mock option must be **EXPLICITLY** labeled as "Mock Data (no API)"
- Real providers must show actual model names (e.g., "gpt-4o-mini" not just "GPT-4")
- **NEVER** make assumptions about user preferences

## Implementation Guidelines

### API Integration

1. **Mock Mode Requirements:**
   - Must be clearly labeled in UI
   - Must follow exact same flow as real API
   - Must return realistic data structures
   - Must simulate appropriate delays

2. **Real API Mode Requirements:**
   - Must show actual provider/model being used
   - Must handle errors gracefully with clear messages
   - Must not fall back to mock automatically
   - Must maintain state consistency

3. **Error Handling:**
   ```javascript
   // ALWAYS include provider context in errors
   if (currentProvider === 'mockup') {
     // Process mock data
   } else {
     try {
       // Real API call
     } catch (error) {
       setError(`${currentProvider} API failed: ${error.message}`);
       // DO NOT fall back to mock
       // DO NOT retry with different provider
       // Let user decide next action
     }
   }
   ```

### UI/UX Rules

1. **Initial State:**
   - Requirements field starts EMPTY (no pre-filled mock data)
   - Summary/Recommendations tabs show "Please upload requirements first"
   - No mock data displayed until explicitly requested

2. **Button States:**
   - Upload Requirements: Always enabled when file is selected
   - Recommend: Enabled only after requirements uploaded and processed
   - Improve: Enabled only after recommendations generated
   - YOLO: Runs full cycle (verify → assess → improve → repeat)

3. **Tab Behavior:**
   - All tabs must be scrollable when content overflows
   - Activity Log must show ALL operations with timestamps
   - Clear indication of data source in each operation

### Backend Integration

1. **Endpoint Consistency:**
   - Same endpoints handle both mock and real modes
   - Provider selection determines behavior
   - No separate mock-only endpoints

2. **Model Configuration:**
   ```python
   # Backend must support these providers
   providers = {
     "mockup": "Mock Data (no API)",
     "openai": "gpt-4o-mini",  # Actual model name
     "openai-4": "gpt-4",      # If available
     "fallback": "Fallback"    # Only if explicitly selected
   }
   ```

3. **Environment Variables:**
   - `OPENAI_API_KEY`: Required for OpenAI providers
   - `LLM_PROVIDER`: Current active provider
   - `LLM_MODEL`: Specific model name
   - No automatic fallback based on missing keys

## Testing Requirements

### Before Any Feature Release:

1. **Test in Mock Mode:**
   - Verify complete workflow functions
   - Document expected behavior
   - Save mock responses for consistency

2. **Test in Real API Mode:**
   - Verify IDENTICAL workflow to mock
   - Verify error handling shows provider
   - Verify no automatic fallbacks

3. **Test Mode Switching:**
   - Verify selector shows current state
   - Verify switching providers works mid-flow
   - Verify no data leakage between modes

## Common Mistakes to Avoid

1. **DON'T** pre-populate fields with example data
2. **DON'T** change workflows between mock and real modes
3. **DON'T** hide API failures behind mock data
4. **DON'T** assume user preferences
5. **DON'T** create different UX for different providers
6. **DON'T** automatically retry with different providers
7. **DON'T** show generic error messages without provider context
8. **DON'T** disable features based on provider selection

## Compliance Checklist

Before committing any changes:

- [ ] Data source is transparent to user
- [ ] Workflows are identical in all modes
- [ ] No automatic fallbacks implemented
- [ ] Error messages include provider context
- [ ] UI clearly shows current provider
- [ ] Mock mode is explicitly labeled
- [ ] User has full control over provider selection
- [ ] No pre-filled mock data in production areas
- [ ] All API failures are surfaced to user
- [ ] Testing completed in both mock and real modes

## Priority Order

When in conflict, follow this priority:
1. **User Awareness** - User must know what's happening
2. **User Control** - User must control system behavior
3. **Consistency** - Same behavior across all modes
4. **Transparency** - Clear about data sources and failures
5. **Functionality** - Features work as designed

## Remember

> "The user must be aware of the source of data! This is CRITICAL!"

> "You can't change existing, running flows! If something is tested in mockup mode, the same should be in LLM mode!"

> "Don't automatically switch to mockup; if backend is not running or returns errors, the user must be informed!"

These rules are non-negotiable and must be followed in EVERY development iteration.