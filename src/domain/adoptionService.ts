import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useStore, type BuildState, type Run, type PlannerTask } from './store';
import { computeContentHash } from './parser';

const ADOPTION_MARKER_KEY_PREFIX = 'tower_planner_adopted_';
const ADOPTION_BACKUP_KEY = 'tower_planner_pre_adoption_backup';

export function isAccountAdopted(userId: string): boolean {
  return localStorage.getItem(`${ADOPTION_MARKER_KEY_PREFIX}${userId}`) === 'true';
}

export function markAccountAdopted(userId: string): void {
  localStorage.setItem(`${ADOPTION_MARKER_KEY_PREFIX}${userId}`, 'true');
}

/**
 * Creates a safety JSON backup of current local state in localStorage before adoption.
 */
export function createPreAdoptionBackup(runs: Run[], build: BuildState, tasks: PlannerTask[]): void {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      runs,
      build,
      tasks
    };
    localStorage.setItem(ADOPTION_BACKUP_KEY, JSON.stringify(backup));
  } catch (err) {
    console.warn('Unable to create pre-adoption local backup:', err);
  }
}

/**
 * Adopts local client state into Supabase for the authenticated user.
 * Strictly adheres to Ground Rule 2: local state is source of truth and upserted over cloud defaults.
 * Idempotent: safe to rerun if interrupted.
 */
export async function adoptLocalStateToCloud(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const state = useStore.getState();
    const { runs, build, tasks, user } = state;

    // 0. Create pre-adoption safety snapshot
    createPreAdoptionBackup(runs, build, tasks);

    // 1. profiles
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: user?.name || 'Tower Commander',
      email: user?.email || null
    });
    if (profileErr) throw new Error(`profiles adoption failed: ${profileErr.message}`);

    // 2. build_states
    const { error: buildErr } = await supabase.from('build_states').upsert({
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
    if (buildErr) throw new Error(`build_states adoption failed: ${buildErr.message}`);

    // 3. lab_slots (5 rows)
    const labSlotRows = build.labs.slice(0, 5).map((slot, index) => ({
      user_id: userId,
      slot_index: index,
      research_id: slot.researchId || null,
      level: slot.level || 0,
      boost: slot.boost || 1.0,
      started_at: slot.startedAt || null
    }));
    const { error: labsErr } = await supabase.from('lab_slots').upsert(labSlotRows);
    if (labsErr) throw new Error(`lab_slots adoption failed: ${labsErr.message}`);

    // 4. research_catalog_entries
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
      const { error: catErr } = await supabase.from('research_catalog_entries').upsert(catalogRows);
      if (catErr) throw new Error(`research_catalog_entries adoption failed: ${catErr.message}`);
    }

    // 5. ultimate_weapons
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
      const { error: uwErr } = await supabase.from('ultimate_weapons').upsert(uwRows);
      if (uwErr) throw new Error(`ultimate_weapons adoption failed: ${uwErr.message}`);
    }

    // 6. modules
    if (build.modules.length > 0) {
      const moduleRows = build.modules.map((m) => ({
        user_id: userId,
        module_id: m.id,
        name: m.name,
        tier: m.tier
      }));
      const { error: modErr } = await supabase.from('modules').upsert(moduleRows);
      if (modErr) throw new Error(`modules adoption failed: ${modErr.message}`);

      // 7. module_sub_effects
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
        const { error: subErr } = await supabase.from('module_sub_effects').upsert(subEffectRows);
        if (subErr) throw new Error(`module_sub_effects adoption failed: ${subErr.message}`);
      }
    }

    // 8. planner_tasks
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
      const { error: tasksErr } = await supabase.from('planner_tasks').upsert(taskRows);
      if (tasksErr) throw new Error(`planner_tasks adoption failed: ${tasksErr.message}`);
    }

    // 9. runs (and tournament_results if applicable)
    if (runs.length > 0) {
      const runRows = await Promise.all(
        runs.map(async (r) => {
          let parsedBattleDate: string | null = null;
          if (r.battleDate) {
            const d = new Date(r.battleDate);
            if (!isNaN(d.getTime())) {
              parsedBattleDate = d.toISOString();
            }
          }

          const hash = r.contentHash || (await computeContentHash(r.rawText || r.id));

          return {
            id: r.id,
            user_id: userId,
            run_type: r.runType,
            tier: r.tier,
            tier_suffix: r.tierSuffix,
            wave: r.wave,
            killed_by: r.killedBy || '',
            game_time_sec: r.gameTimeSec || 0,
            real_time_sec: r.realTimeSec || 0,
            dissonance_multiplier: r.dissonanceMultiplier || 1.0,
            excluded: r.excluded || false,
            notes: r.notes || '',
            game_version: r.gameVersion || null,
            battle_date: parsedBattleDate,
            imported_at: r.importedAt || new Date().toISOString(),
            fields: r.fields || {},
            raw: r.raw || {},
            raw_text: r.rawText || null,
            parser_version: r.parserVersion || 0,
            content_hash: hash
          };
        })
      );

      const { error: runsErr } = await supabase.from('runs').upsert(runRows);
      if (runsErr) throw new Error(`runs adoption failed: ${runsErr.message}`);
    }

    // Explicit adoption marker written on success
    markAccountAdopted(userId);
    return { success: true };
  } catch (err: any) {
    console.error('Adoption failed:', err);
    return { success: false, error: err.message || String(err) };
  }
}
