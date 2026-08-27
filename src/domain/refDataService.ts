import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../lib/database.types';

const REF_CACHE_KEY = 'tower-planner-ref-cache';

export interface RefDataCache {
  dataVersion: number;
  lastCheckedAt: string;
  labs?: Database['public']['Tables']['ref_labs']['Row'][];
  uwConfigs?: Database['public']['Tables']['ref_uw_configs']['Row'][];
  uwStats?: Database['public']['Tables']['ref_uw_stats']['Row'][];
  tournamentLeagues?: Database['public']['Tables']['ref_tournament_leagues']['Row'][];
  tournamentRewards?: Database['public']['Tables']['ref_tournament_rewards']['Row'][];
  effectChannels?: Database['public']['Tables']['ref_effect_channels']['Row'][];
  cellAnchors?: Database['public']['Tables']['ref_cell_anchors']['Row'][];
  boostCosts?: Database['public']['Tables']['ref_boost_costs']['Row'][];
  idealFarmingWaves?: Database['public']['Tables']['ref_ideal_farming_waves']['Row'][];
  moduleTiers?: Database['public']['Tables']['ref_module_tiers']['Row'][];
}

// In-memory reference data store initialized from separate localStorage cache
let inMemoryRefCache: RefDataCache | null = null;

export function loadRefDataCache(): RefDataCache | null {
  if (inMemoryRefCache) return inMemoryRefCache;
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(REF_CACHE_KEY);
    if (raw) {
      inMemoryRefCache = JSON.parse(raw);
      return inMemoryRefCache;
    }
  } catch (err) {
    console.warn('Failed to load reference data cache from localStorage:', err);
  }
  return null;
}

export function saveRefDataCache(cache: RefDataCache): void {
  inMemoryRefCache = cache;
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(REF_CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn('Failed to save reference data cache to localStorage:', err);
  }
}

/**
 * Checks remote ref_data_version and updates cached reference tables if data version moved.
 * Adheres to Ground Rule 1: cache-first, fails gracefully if offline or unconfigured.
 */
export async function syncReferenceData(): Promise<void> {
  const isEnabled = import.meta.env.VITE_ENABLE_REMOTE_REF_DATA !== 'false';
  if (!isEnabled || !isSupabaseConfigured) {
    return;
  }

  try {
    const { data: versionData, error: versionErr } = await supabase
      .from('ref_data_version')
      .select('data_version')
      .order('data_version', { ascending: false })
      .limit(1)
      .single();

    if (versionErr || !versionData) {
      return;
    }

    const currentVersion = versionData.data_version;
    const existingCache = loadRefDataCache();

    if (existingCache && existingCache.dataVersion >= currentVersion) {
      return; // Cache is already up to date
    }

    // Pull all 11 reference tables
    const [
      labsRes,
      uwConfigsRes,
      uwStatsRes,
      tournamentLeaguesRes,
      tournamentRewardsRes,
      effectChannelsRes,
      cellAnchorsRes,
      boostCostsRes,
      idealFarmingWavesRes,
      moduleTiersRes
    ] = await Promise.all([
      supabase.from('ref_labs').select('*'),
      supabase.from('ref_uw_configs').select('*'),
      supabase.from('ref_uw_stats').select('*'),
      supabase.from('ref_tournament_leagues').select('*').order('sort_order', { ascending: true }),
      supabase.from('ref_tournament_rewards').select('*'),
      supabase.from('ref_effect_channels').select('*'),
      supabase.from('ref_cell_anchors').select('*'),
      supabase.from('ref_boost_costs').select('*'),
      supabase.from('ref_ideal_farming_waves').select('*'),
      supabase.from('ref_module_tiers').select('*').order('sort_order', { ascending: true })
    ]);

    const newCache: RefDataCache = {
      dataVersion: currentVersion,
      lastCheckedAt: new Date().toISOString(),
      labs: labsRes.data || existingCache?.labs,
      uwConfigs: uwConfigsRes.data || existingCache?.uwConfigs,
      uwStats: uwStatsRes.data || existingCache?.uwStats,
      tournamentLeagues: tournamentLeaguesRes.data || existingCache?.tournamentLeagues,
      tournamentRewards: tournamentRewardsRes.data || existingCache?.tournamentRewards,
      effectChannels: effectChannelsRes.data || existingCache?.effectChannels,
      cellAnchors: cellAnchorsRes.data || existingCache?.cellAnchors,
      boostCosts: boostCostsRes.data || existingCache?.boostCosts,
      idealFarmingWaves: idealFarmingWavesRes.data || existingCache?.idealFarmingWaves,
      moduleTiers: moduleTiersRes.data || existingCache?.moduleTiers
    };

    saveRefDataCache(newCache);
  } catch (err) {
    console.warn('Unable to sync reference tables from remote:', err);
  }
}

export function getCachedTournamentRewards(bracket: string, rank: number) {
  const cache = loadRefDataCache();
  if (!cache?.tournamentRewards) return null;
  const b = bracket.toLowerCase();
  const match = cache.tournamentRewards.find(
    (r) => r.league.toLowerCase() === b && rank >= r.rank_min && rank <= r.rank_max
  );
  if (match) {
    return {
      gems: match.gems,
      stones: match.stones,
      keys: match.keys
    };
  }
  return null;
}
