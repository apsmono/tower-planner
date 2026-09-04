import { describe, it, expect } from 'vitest';
import { sanitizeModuleSubstats } from '../components/ModuleEditModal';
import { MASTER_SUBSTATS_CATALOG, MASTER_MODULES_CATALOG, type ModuleSlot } from '../data/modulesCatalog';

describe('Modules & Substats Blocker Logic', () => {
  it('should eliminate duplicate substats and backfill with unique ones up to maxSlots', () => {
    const duplicateInput = [
      { substatId: 'coins_per_kill', rarity: 'ancestral' as const },
      { substatId: 'coins_per_kill', rarity: 'epic' as const },
      { substatId: 'package_chance', rarity: 'mythic' as const },
      { substatId: 'coins_per_kill', rarity: 'rare' as const },
      { substatId: 'coins_per_kill', rarity: 'legendary' as const },
    ];

    const sanitized = sanitizeModuleSubstats(duplicateInput, 'generator', 5);

    // Must have exactly 5 substats
    expect(sanitized).toHaveLength(5);

    // All substat IDs must be distinct
    const ids = sanitized.map(s => s.substatId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(5);

    // Preserved the first occurrences of valid entries
    expect(sanitized[0].substatId).toBe('coins_per_kill');
    expect(sanitized[0].rarity).toBe('ancestral');
    expect(sanitized[1].substatId).toBe('package_chance');
    expect(sanitized[1].rarity).toBe('mythic');
  });

  it('should provide at least 5 unique substats for every module slot', () => {
    const slots: ModuleSlot[] = ['cannon', 'armor', 'generator', 'core'];

    slots.forEach(slot => {
      const slotDef = MASTER_SUBSTATS_CATALOG.filter(s => s.slot === slot);
      expect(slotDef.length).toBeGreaterThanOrEqual(5);

      // No duplicate IDs in catalog
      const ids = slotDef.map(s => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  it('should have 4 unique modules for each slot category in catalog', () => {
    const slots: ModuleSlot[] = ['cannon', 'armor', 'generator', 'core'];

    slots.forEach(slot => {
      const slotMods = MASTER_MODULES_CATALOG.filter(m => m.slot === slot);
      expect(slotMods.length).toBe(4);
    });
  });
});
