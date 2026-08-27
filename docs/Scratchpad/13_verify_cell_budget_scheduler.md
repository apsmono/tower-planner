# Task Checklist
- [x] Navigate to http://localhost:5173/ and ensure page is loaded <!-- id: 0 -->
- [x] Click "Cell Budget" tab in the left sidebar <!-- id: 1 -->
- [x] Verify display of hourly cell gain, hourly cell burn, and net hourly flow comparison <!-- id: 2 -->
- [x] Locate Lab Speed Boost Scheduler <!-- id: 3 -->
- [x] Change a lab slot select dropdown to "8.0x (24.0M/d)" <!-- id: 4 -->
- [x] Verify Daily Cell Burn and Net Hourly Flow values recalculate <!-- id: 5 -->
- [x] Document findings and write report <!-- id: 6 -->

# Verification Report

## Visual Verification of Cell Budget Page
- **Hourly Cell Gain**: Displayed as `22.904/hr` (Daily Cell Income `549.691`).
- **Hourly Cell Burn**: Displayed as `330/hr` (Daily Cell Burn `7.92K`) initially.
- **Net Hourly Flow Comparison**: Displayed as `Net Hourly Flow: -307.096 cells/hr` and `Gain vs Burn: 22.904 vs 330 /hr`.

## Lab Speed Boost Scheduler Interaction
- Selected **Lab 1 Boost** and changed it to **8.0x (24.0M/d)** (simulated by focusing and typing/navigating to the 8.0x option which corresponds to 24,000,000 cells/day).
- **Recalculation Verification**:
    - **Daily Cell Burn** updated to **24.01M (1.00M/hr)** (previously 7.92K).
        - Detailed breakdown: 24,000,000 (Lab 1) + 360 (Lab 2) + 2,400 (Lab 3) + 2,400 (Lab 4) + 2,400 (Lab 5) = 24,007,560 cells/day.
        - Hourly burn: 24,007,560 / 24 = ~1,000,315 cells/hr (displayed as 1.00M/hr).
    - **Net Hourly Flow** updated to **-1,000,292.096 cells/hr** (previously -307.096).
        - Calculation: 22.904 (gain) - 1,000,315 (burn) = -1,000,292.096 cells/hr.
    - **Insufficient Funds Block** warning appeared, indicating the queue is unsustainable.

The changes work as expected and the calculations are correct.
