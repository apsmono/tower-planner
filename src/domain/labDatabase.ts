import { MASTER_LAB_CATALOG, type LabDefinition, type LabCategory } from '../data/labCatalog';
import { 
  getBaseLabTime, 
  getLabCoinCost, 
  calculateEffectiveLabTime, 
  formatLabDuration,
  calculateLabResearchSummary,
  type LabResearchCalculationParams 
} from '../data/labLevelData';
import { getCachedLabLevel } from './refDataService';
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
   * Get base research time in seconds for a lab at a given level (checks cached DB row first, falls back to code formulas).
   */
  public static getLabBaseTime(labId: string, level: number): number {
    const cached = getCachedLabLevel(labId, level);
    if (cached && cached.baseTimeSeconds > 0) {
      return cached.baseTimeSeconds;
    }
    return getBaseLabTime(labId, level);
  }

  /**
   * Get base coin cost for a lab at a given level.
   */
  public static getLabCost(labId: string, level: number): number {
    const cached = getCachedLabLevel(labId, level);
    if (cached && cached.coinCost > 0) {
      return cached.coinCost;
    }
    return getLabCoinCost(labId, level);
  }

  /**
   * Calculate effective duration in seconds factoring user lab speed and cell boosts.
   */
  public static getEffectiveTime(
    baseTimeSeconds: number,
    labSpeedMultiplier: number = 1.0,
    cellBoost: number = 1.0
  ): number {
    return calculateEffectiveLabTime(baseTimeSeconds, labSpeedMultiplier, cellBoost);
  }

  /**
   * Formats duration in seconds into human-readable compact string.
   */
  public static formatDuration(seconds: number): string {
    return formatLabDuration(seconds);
  }

  /**
   * Calculate complete research summary for any lab and level range factoring speed, relic, and coin discount.
   */
  public static calculateResearch(params: LabResearchCalculationParams) {
    return calculateLabResearchSummary(params);
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
