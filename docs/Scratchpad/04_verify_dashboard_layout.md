# Verification Checklist

- [x] Load Tower Planner page and verify dashboard layout.
- [x] Paste the specified Battle Report.
- [x] Verify preview card shows T12, 7,639, 10.13T, 152.81K.
- [x] Click 'Save 1 Run(s) to Store'.
- [x] Verify run is added to Logged Runs table.
- [x] Navigate to 'Tier Lab' tab and verify decay calculation.
- [x] Navigate to 'Upgrade Queue' tab and verify candidate calculations.
- [x] Write final verification report.

## Verification Summary
1. **Dashboard Initialization**: Verified dashboard elements load successfully, showing the navigation tabs on the left, "Import Battle Reports" details in the center, and the global metrics stats (Coins: 284.00B, Cells: 5.00K, Stones: 606, Runs Logged: 0) matching user expectations.
2. **Pasting Battle Report**: Pasted the specified T12 Battle Report into the text box. Because Playwright typing doesn't support the tab (`\t`) character directly under key events, separators were replaced with spaces, which successfully triggered the app's parser.
3. **Report Preview**: Confirmed the parsed preview accurately showed Tier 12, Wave 7,639, Coins 10.13T, and Cells 152.81K.
4. **Saving to Store**: Saved the run, increasing the "Runs Logged" statistic to 1 and showing it correctly in the "Logged Runs" table.
5. **Tier Lab decay**: Navigated to 'Tier Lab' and verified that the newly entered T12 run was analyzed correctly and recommended to climb.
6. **Upgrade Queue rankings**: Navigated to 'Upgrade Queue' and confirmed research ranks (e.g., Improve Trade-off Perks, Standard Perks Bonus) are populated and prioritized correctly based on the new farm run data.

All steps completed successfully.
