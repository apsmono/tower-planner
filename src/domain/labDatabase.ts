import { MASTER_LAB_CATALOG, type LabDefinition, type LabCategory } from '../data/labCatalog';
import type { ResearchEntry } from './store';

export interface LabQueryOptions {
  category?: LabCategory;
  searchQuery?: string;
  onlyInCatalog?: boolean;
}

export class LabDatabase {
  private static masterLabs: LabDefinition[] = MASTER_LAB_CATALOG;

  /**
   * Get all master lab definitions from the wiki catalog
   */
  public static getAllMasterLabs(): LabDefinition[] {
    return this.masterLabs;
  }

  /**
   * Find a specific lab definition by its unique ID
   */
  public static getLabById(id: string): LabDefinition | undefined {
    return this.masterLabs.find((lab) => lab.id === id);
  }

  /**
   * Get counts of master labs grouped by category
   */
  public static getCategoryCounts(): Record<LabCategory, number> {
    const counts: Record<string, number> = {
      all: this.masterLabs.length,
      main: 0,
      attack: 0,
      defense: 0,
      utility: 0,
      perks: 0,
      ultimate_weapons: 0,
      modules: 0,
    };

    for (const lab of this.masterLabs) {
      if (counts[lab.category] !== undefined) {
        counts[lab.category]++;
      }
    }

    return counts as Record<LabCategory, number>;
  }

  /**
   * Filter master labs by category and search term
   */
  public static queryMasterLabs(options: LabQueryOptions = {}): LabDefinition[] {
    const { category = 'all', searchQuery = '' } = options;
    const query = searchQuery.trim().toLowerCase();

    return this.masterLabs.filter((lab) => {
      // Category filter
      if (category !== 'all' && lab.category !== category) {
        return false;
      }
      // Search filter
      if (query) {
        const matchName = lab.name.toLowerCase().includes(query);
        const matchDesc = lab.description.toLowerCase().includes(query);
        const matchId = lab.id.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchId) return false;
      }
      return true;
    });
  }

  /**
   * Helper to merge user research catalog entry with master lab metadata
   */
  public static enrichResearchEntry(entry: ResearchEntry): ResearchEntry & { meta?: LabDefinition } {
    const meta = this.getLabById(entry.id);
    return {
      ...entry,
      meta,
    };
  }
}
