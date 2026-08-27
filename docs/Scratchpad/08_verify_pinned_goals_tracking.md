# Task Tracking Verification Checklist

- [x] Navigate to http://localhost:5173/ and check initial page state
- [x] Verify sidebar contains 'Pinned Goals' with pre-seeded active goals
- [x] Navigate to 'Upgrade Queue' tab
- [x] Locate an unpinned item and pin it, verify it appears in the sidebar immediately
- [ ] Navigate to 'Build State' tab
- [ ] Select 'GOALS' sub-tab
- [ ] Add a new stone savings goal (target: 2000), verify it is added
- [ ] Navigate to 'RESOURCES' sub-tab in Build State
- [ ] Update stones balance to 2100
- [ ] Navigate back to 'GOALS' sub-tab
- [ ] Verify the stone savings goal is marked as completed

## Blocking Issues / Errors
- Build State tab crashes when selecting the GOALS sub-tab.
  - Error: `ReferenceError: CheckCircleCircle is not defined` at `src/components/BuildState.tsx:1061`
  - Impact: Cannot proceed with step 8 ("Select 'GOALS' sub-tab") and subsequent steps.
