# Modals-First UX Rule for Value & Configuration Edits

Whenever designing, implementing, or refactoring user interfaces in Tower Planner:

1. **Always Use Modals for Edits**:
   - Editing any value, level, target, budget, module substat, perk priority/ban, or configuration MUST open in a dedicated edit modal dialog.
   - Avoid cramped inline inputs, direct table-cell editing, or cluttered inline stepper controls that disrupt reading flows and cause accidental changes.

2. **Modal Experience Standards**:
   - **Context & Preview**: Modals must show current vs. new value, with calculated deltas (e.g., cost, time, stat increase, hourly rate impact).
   - **Explicit Actions**: Modals must provide clear "Apply / Confirm" and "Cancel / Close" actions (as well as `Escape` key and backdrop click dismissals).
   - **Quick Presets**: Provide quick shortcuts where applicable (e.g., Min, Max, +1, +5, +10, Target Next Milestone).
   - **Accessibility & Focus**: Trap focus properly, autofocus the primary adjustment control, and ensure keyboard navigability.
