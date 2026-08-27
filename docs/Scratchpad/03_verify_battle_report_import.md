# Task Checklist: Tower Planner Verification

- [x] Navigate to http://localhost:5173/ and wait for load.
- [ ] Verify dashboard is visible and 'Tower Planner' is shown. (Blocked: Blank Page)
- [ ] Click text area, paste mock Battle Report text.
- [ ] Verify parsed preview card displays correct values (T12, 7,639, 10.13T, 152.81K).
- [ ] Click 'Save 1 Run(s) to Store' button.
- [ ] Verify run appears in 'Logged Runs' history table.
- [ ] Navigate to 'Tier Lab' tab and verify decay calculations.
- [ ] Navigate to 'Upgrade Queue' and verify candidate calculations.
- [ ] Provide final verification report.

## Observations / Blockers
The page loads as a blank screen. Checking the browser console logs revealed multiple runtime syntax errors due to non-type imports of TypeScript interfaces/types:

1. `src/domain/store.ts` imports `ParsedRun` from `src/domain/parser.ts` without `type` keyword, causing:
   `SyntaxError: The requested module '/src/domain/parser.ts' does not provide an export named 'ParsedRun'`

2. `src/components/ImportRuns.tsx` imports `Run` from `src/domain/store.ts` without `type` keyword, causing:
   `SyntaxError: The requested module '/src/domain/store.ts' does not provide an export named 'Run'`

3. `src/App.tsx` imports `TabId` from `src/components/Layout.tsx` without `type` keyword, causing:
   `SyntaxError: The requested module '/src/components/Layout.tsx' does not provide an export named 'TabId'`

