import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useStore, type Run } from './store';
import { syncReferenceData } from './refDataService';
import { 
  getOutboxItemsIDB, 
  removeOutboxItemIDB, 
  getSyncMetaIDB, 
  setSyncMetaIDB, 
  putRunsIDB, 
  deleteRunIDB,
  enqueueOutboxIDB
} from './db/indexedDB';
import { parseBattleReport, CURRENT_PARSER_VERSION } from './parser';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

type SyncListener = (status: SyncStatus) => void;
const listeners = new Set<SyncListener>();
let currentStatus: SyncStatus = 'synced';

export function getSyncStatus(): SyncStatus {
  return currentStatus;
}

export function subscribeSyncStatus(listener: SyncListener): () => void {
  listeners.add(listener);
  listener(currentStatus);
  return () => listeners.delete(listener);
}

function setStatus(status: SyncStatus) {
  currentStatus = status;
  listeners.forEach((l) => l(status));
}

let isSyncRunning = false;
let userStateDebounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Lane A: Reference Data (inward only).
 */
export async function syncLaneA(): Promise<void> {
  await syncReferenceData();
}

/**
 * Lane B: User State (round-trip, last-write-wins).
 *
 * NOTE: Last-write-wins is acceptable here ONLY because it is one person on two devices.
 * Do not assume this is safe for multi-user collaborative editing.
 */
export async function pushUserStateLaneB(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  const { build, tasks } = useStore.getState();

  try {
    // 1. build_states
    await supabase.from('build_states').upsert({
      user_id: userId,
      coins: build.resources.coins,
      cells: build.resources.cells,
      gems: build.resources.gems,
      stones: build.resources.stones,
      shards: build.resources.shards,
      lab_speed_multiplier: build.labSpeedMultiplier,
      card_slots: build.cards.slots,
      card_levels: build.cards.levels,
      verification_flags: build.verificationFlags
    });

    // 2. lab_slots
    const labSlotRows = build.labs.slice(0, 5).map((slot, index) => ({
      user_id: userId,
      slot_index: index,
      research_id: slot.researchId || null,
      level: slot.level || 0,
      boost: slot.boost || 1.0,
      started_at: slot.startedAt || null
    }));
    await supabase.from('lab_slots').upsert(labSlotRows);

    // 3. research_catalog_entries
    if (build.researchCatalog.length > 0) {
      const catalogRows = build.researchCatalog.map((entry) => ({
        user_id: userId,
        lab_id: entry.id,
        name: entry.name,
        level: entry.level,
        change_label: entry.change,
        coin_cost: entry.coinCost,
        base_time_seconds: entry.baseTimeSeconds,
        effect_channel: entry.effect?.channel || null,
        effect_from: entry.effect?.from ?? null,
        effect_to: entry.effect?.to ?? null,
        effect_kind: entry.effect?.kind || null,
        target_level: entry.targetLevel ?? null,
        reason: entry.reason || null,
        estimated_impact: entry.estimatedImpact ?? null
      }));
      await supabase.from('research_catalog_entries').upsert(catalogRows);
    }

    // 4. ultimate_weapons
    if (build.ultimateWeapons.length > 0) {
      const uwRows = build.ultimateWeapons.map((uw) => ({
        user_id: userId,
        uw_id: uw.id,
        unlocked: uw.unlocked,
        active: uw.active,
        level: uw.level,
        stat1: uw.upgrades.stat1,
        stat2: uw.upgrades.stat2,
        stat3: uw.upgrades.stat3
      }));
      await supabase.from('ultimate_weapons').upsert(uwRows);
    }

    // 5. modules
    if (build.modules.length > 0) {
      const moduleRows = build.modules.map((m) => ({
        user_id: userId,
        module_id: m.id,
        name: m.name,
        tier: m.tier
      }));
      await supabase.from('modules').upsert(moduleRows);

      const subEffectRows = build.modules.flatMap((m) =>
        m.subEffects.map((se) => ({
          user_id: userId,
          module_id: m.id,
          sub_effect_id: se.id,
          name: se.name,
          tier: se.tier,
          locked: se.locked
        }))
      );
      if (subEffectRows.length > 0) {
        await supabase.from('module_sub_effects').upsert(subEffectRows);
      }
    }

    // 6. planner_tasks
    if (tasks.length > 0) {
      const taskRows = tasks.map((t) => ({
        id: t.id,
        user_id: userId,
        type: t.type,
        name: t.name,
        status: t.status,
        target_research_id: t.targetResearchId || null,
        target_level: t.targetLevel ?? null,
        target_resource: t.targetResource || null,
        target_amount: t.targetAmount ?? null,
        experiment_tier: t.experimentTier ?? null,
        experiment_required_runs: t.experimentRequiredRuns ?? null,
        experiment_completed_run_ids: t.experimentCompletedRunIds || [],
        notes: t.notes || null,
        created_at: t.createdAt
      }));
      await supabase.from('planner_tasks').upsert(taskRows);
    }
  } catch (err) {
    console.warn('Lane B user state push error:', err);
  }
}

export function debouncePushUserState(userId: string) {
  if (userStateDebounceTimer) {
    clearTimeout(userStateDebounceTimer);
  }
  userStateDebounceTimer = setTimeout(() => {
    pushUserStateLaneB(userId);
  }, 2000);
}

/**
 * Lane C: Run Log Sync (outbox drain + cursor-based pull).
 */
export async function syncLaneC(userId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  // 1. Drain Outbox
  const outboxItems = await getOutboxItemsIDB();
  for (const item of outboxItems) {
    try {
      if (item.type === 'upsert_run' || item.type === 'update_run') {
        const run: Run = item.payload;
        let parsedBattleDate: string | null = null;
        if (run.battleDate) {
          const d = new Date(run.battleDate);
          if (!isNaN(d.getTime())) parsedBattleDate = d.toISOString();
        }

        const { error } = await supabase.from('runs').upsert({
          id: run.id,
          user_id: userId,
          run_type: run.runType,
          tier: run.tier,
          tier_suffix: run.tierSuffix,
          wave: run.wave,
          killed_by: run.killedBy || '',
          game_time_sec: run.gameTimeSec || 0,
          real_time_sec: run.realTimeSec || 0,
          dissonance_multiplier: run.dissonanceMultiplier || 1.0,
          excluded: run.excluded || false,
          notes: run.notes || '',
          game_version: run.gameVersion || null,
          battle_date: parsedBattleDate,
          imported_at: run.importedAt || new Date().toISOString(),
          fields: run.fields || {},
          raw: run.raw || {},
          raw_text: run.rawText || null,
          parser_version: run.parserVersion || 0,
          content_hash: run.contentHash
        });

        if (!error && item.outboxId) {
          await removeOutboxItemIDB(item.outboxId);
        }
      } else if (item.type === 'soft_delete_run') {
        const { id, deletedAt } = item.payload;
        const { error } = await supabase
          .from('runs')
          .update({ deleted_at: deletedAt || new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId);

        if (!error && item.outboxId) {
          await removeOutboxItemIDB(item.outboxId);
        }
      }
    } catch (err) {
      console.warn('Failed to drain outbox item:', err);
    }
  }

  // 2. Cursor-based Inward Pull
  const cursorKey = `runs_cursor_${userId}`;
  const lastCursor = await getSyncMetaIDB(cursorKey);

  let query = supabase
    .from('runs')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: true });

  if (lastCursor) {
    query = query.gt('updated_at', lastCursor);
  }

  const { data: remoteRuns, error: pullErr } = await query;
  if (pullErr) throw pullErr;

  if (remoteRuns && remoteRuns.length > 0) {
    const store = useStore.getState();
    const liveRemoteRuns: Run[] = [];
    const deletedRunIds = new Set<string>();

    for (const r of remoteRuns) {
      if (r.deleted_at) {
        deletedRunIds.add(r.id);
        await deleteRunIDB(r.id);
      } else {
        const formattedRun: Run = {
          id: r.id,
          importedAt: r.imported_at,
          battleDate: r.battle_date,
          gameTimeSec: r.game_time_sec,
          realTimeSec: r.real_time_sec,
          tier: r.tier,
          tierSuffix: r.tier_suffix as '+' | null,
          wave: r.wave,
          killedBy: r.killed_by,
          fields: (r.fields as Record<string, number>) || {},
          raw: (r.raw as Record<string, string>) || {},
          rawText: r.raw_text || '',
          parserVersion: r.parser_version || 0,
          contentHash: r.content_hash,
          runType: r.run_type as 'farm' | 'tournament' | 'milestone',
          tournament: null,
          dissonanceMultiplier: Number(r.dissonance_multiplier) || 1.0,
          excluded: r.excluded,
          notes: r.notes || '',
          gameVersion: r.game_version
        };
        liveRemoteRuns.push(formattedRun);
      }
    }

    if (liveRemoteRuns.length > 0) {
      await putRunsIDB(liveRemoteRuns);
    }

    // Merge into local store state
    const currentStoreRuns = store.runs.filter((r) => !deletedRunIds.has(r.id));
    const mergedMap = new Map<string, Run>();
    currentStoreRuns.forEach((r) => mergedMap.set(r.id, r));
    liveRemoteRuns.forEach((r) => mergedMap.set(r.id, r));
    useStore.setState({ runs: Array.from(mergedMap.values()) });

    // Update cursor
    const latestUpdatedAt = remoteRuns[remoteRuns.length - 1].updated_at;
    await setSyncMetaIDB(cursorKey, latestUpdatedAt);
  }
}

/**
 * Master sync coordinator.
 */
export async function triggerFullSync(): Promise<void> {
  if (isSyncRunning || !isSupabaseConfigured) return;
  const user = useStore.getState().user;
  if (!user?.id) return;

  isSyncRunning = true;
  setStatus('syncing');

  try {
    await Promise.all([
      syncLaneA(),
      pushUserStateLaneB(user.id),
      syncLaneC(user.id)
    ]);
    setStatus('synced');
  } catch (err) {
    console.error('Full sync error:', err);
    setStatus('error');
  } finally {
    isSyncRunning = false;
  }
}

/**
 * Retroactive re-parser for stored rawText reports.
 */
export async function reparseLegacyRuns(): Promise<{ recomputedCount: number }> {
  const store = useStore.getState();
  const runs = store.runs;
  const runsToReparse = runs.filter(
    (r) => r.rawText && r.rawText.trim().length > 0 && r.parserVersion < CURRENT_PARSER_VERSION
  );

  if (runsToReparse.length === 0) {
    return { recomputedCount: 0 };
  }

  const updatedRuns = runs.map((r) => {
    if (!r.rawText || r.parserVersion >= CURRENT_PARSER_VERSION) return r;
    const reparsed = parseBattleReport(r.rawText);
    const updated: Run = {
      ...r,
      fields: reparsed.fields,
      raw: reparsed.raw,
      parserVersion: CURRENT_PARSER_VERSION
    };
    enqueueOutboxIDB({
      type: 'update_run',
      payload: updated
    });
    return updated;
  });

  useStore.setState({ runs: updatedRuns });
  await putRunsIDB(updatedRuns);
  return { recomputedCount: runsToReparse.length };
}

/**
 * Initializes listeners for window focus and online status.
 */
export function initSyncEngine(): void {
  window.addEventListener('online', () => triggerFullSync());
  window.addEventListener('offline', () => setStatus('offline'));
  window.addEventListener('focus', () => {
    const user = useStore.getState().user;
    if (user?.id) {
      triggerFullSync();
    }
  });
}
