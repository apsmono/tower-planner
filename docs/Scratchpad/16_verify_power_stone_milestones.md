# Verification Results for Power Stone Milestone Costs Highlight

- **Initial State:**
  - 6 UWs acquired (GT, BH, DW, SL, ILM, CL).
  - The "Power Stone Milestone Costs" section correctly highlights the **7th** milestone (`7th: 1,750 NEXT`) dynamically according to the number of acquired UWs.
- **Toggling Test:**
  - Unacquired **Chain Lightning (CL)** (reducing acquired UW count to 5).
  - The "Power Stone Milestone Costs" section dynamically changed the highlight to the **6th** milestone (`6th: 1,250 NEXT`).
  - Re-acquired **Chain Lightning (CL)** (increasing acquired UW count to 6).
  - The highlight dynamically changed back to the **7th** milestone (`7th: 1,750 NEXT`).
- **Conclusion:**
  - The Power Stone Milestone Costs section dynamically highlights the next UW unlock milestone according to the number of acquired UWs, and toggling an acquired UW dynamically updates the highlighted milestone.
