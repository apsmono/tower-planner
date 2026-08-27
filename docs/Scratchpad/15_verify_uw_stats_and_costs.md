# Verification Plan for Ultimate Weapons (UW) Tab

## Checklist
- [x] Navigate to localhost:5173 and go to 'Build State' -> 'UWs'
- [x] Verify there are 9 Ultimate Weapons in the list
- [x] Verify each UW has Acquired / Active checkboxes
- [x] Verify each UW has 3 main upgrades with numeric input fields
- [x] Verify the Wiki reference section at the bottom is present and has correct details (cooldown sync, UW+, strategy, etc.)

## Notes
- Checked page DOM: Currently on 'UWs' tab.
- Already visible: Golden Tower (GT), Black Hole (BH), Death Wave (DW).
- Scrolled down and verified the remaining weapons (Spotlight, Chrono Field, Poison Swamp, Smart Missiles, Inner Land Mines, Chain Lightning).
- Tested unlocking Inner Land Mines and Chain Lightning:
  - Both successfully updated their state to 'Acquired'.
  - Both showed their respective 3 upgrades:
    - Inner Land Mines: Mine Damage (%), Mine Quantity (mines), Cooldown (s).
    - Chain Lightning: Shock Damage (%), Bolt Quantity (bolts), Proc Chance (%).
- Verified Wiki Knowledge Base at the bottom contains:
  - Holy Trinity Synchronization info.
  - Power Stone Milestone costs.
  - UW+ description.
  - Cooldown upgrade warning.
  - Direct Wiki links for all 9 weapons and the general UW page.

