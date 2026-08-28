-- ============================================================================
-- Seed data for ref_modules & ref_module_substats
-- ============================================================================

insert into public.ref_modules (id, name, slot, unique_effect_name, unique_effect_description, theme_color, max_level, sort_order) values
('death_penalty', 'Death Penalty', 'cannon', 'Instant Execution', '5% to 15% chance to instantly kill non-boss enemies on hit and reduces boss health by 50% on spawn.', '#ef4444', 160, 1),
('astral_deliverance', 'Astral Deliverance', 'cannon', 'Orb Volley Bounce', 'Every 10th projectile spawns an extra energy bounce that shatters armor.', '#f97316', 160, 2),
('being_annihilator', 'Being Annihilator', 'cannon', 'Super Crit Ramp', 'Consecutive projectile hits on the same target grant escalating Super Crit Multipliers.', '#eab308', 160, 3),
('havoc_bringer', 'Havoc Bringer', 'cannon', 'Rend Armor Surge', 'Rend armor stacks up to +200% faster and applies explosive blast shockwaves.', '#84cc16', 160, 4),

('wormhole_redirector', 'Wormhole Redirector', 'armor', 'Wall Health Shield', 'Health Regen can overheal Tower Wall up to 100% of maximum health value.', '#06b6d4', 160, 10),
('anti_cube_portal', 'Anti-Cube Portal', 'armor', 'Shockwave Damage Amp', 'Enemies hit by shockwave take +10x to +30x more damage from all sources for 7 seconds.', '#3b82f6', 160, 11),
('space_displacer', 'Space Displacer', 'armor', 'Land Mine Replicator', 'Land mines replicate into surrounding cluster charges when triggered.', '#6366f1', 160, 12),
('negative_mass_projector', 'Negative Mass Projector', 'armor', 'Orb Slow Field', 'Enemies passing through orb radius are slowed by 60% and have reduced damage.', '#8b5cf6', 160, 13),

('galaxy_compressor', 'Galaxy Compressor', 'generator', 'Recovery Package UW Rush', 'Recovery packages reduce all active Ultimate Weapon cooldowns by 10 to 20 seconds.', '#10b981', 160, 20),
('pulsar_harvester', 'Pulsar Harvester', 'generator', 'Level Degrader', 'Projectiles have a chance to permanently reduce enemy tier level and max health.', '#14b8a6', 160, 21),
('singularity_harness', 'Singularity Harness', 'generator', 'Bot Radius Surge', 'Golden Bot and Amplify Bot range increased by +12m and cooldowns reduced.', '#d946ef', 160, 22),
('primordial_collapse', 'Primordial Collapse', 'generator', 'Cell Multiplier Harvest', 'Elite enemies drop +1 to +3 extra Elite Cells on destruction.', '#ec4899', 160, 23),

('multiverse_nexus', 'Multiverse Nexus', 'core', 'UW Cooldown Synchronizer', 'Synchronizes Golden Tower, Black Hole, and Death Wave cooldowns to their average timer.', '#f43f5e', 160, 30),
('harmony_conductor', 'Harmony Conductor', 'core', 'Poison Swamp Missiles', 'Enemies caught in Poison Swamp have a 60% chance to misfire and hit other enemies.', '#a855f7', 160, 31),
('diminishing_core', 'Diminishing Core', 'core', 'Chain Lightning Shock Cascade', 'Chain Lightning shock stacks up to 5 times for massive damage amplification.', '#38bdf8', 160, 32),
('om_chip', 'Om Chip', 'core', 'Spotlight Boss Lock', 'Spotlight permanently rotates to target the strongest boss or elite on the screen.', '#fbbf24', 160, 33)
on conflict (id) do update set
  name = excluded.name,
  slot = excluded.slot,
  unique_effect_name = excluded.unique_effect_name,
  unique_effect_description = excluded.unique_effect_description,
  theme_color = excluded.theme_color,
  max_level = excluded.max_level,
  sort_order = excluded.sort_order;

insert into public.ref_module_substats (id, name, slot, unit, rare_val, epic_val, legendary_val, mythic_val, ancestral_val, sort_order) values
('attack_speed', 'Attack Speed', 'cannon', '', 1, 2, 3, 4, 5, 1),
('crit_factor', 'Crit Factor', 'cannon', 'x', 2, 5, 10, 15, 25, 2),
('super_crit_chance', 'Super Crit Chance', 'cannon', '%', 1, 3, 5, 8, 12, 3),
('bounce_shot_targets', 'Bounce Shot Targets', 'cannon', '', 1, 1, 2, 2, 3, 4),
('attack_range', 'Attack Range', 'cannon', 'm', 2, 4, 6, 8, 12, 5),

('defense_percent', 'Defense %', 'armor', '%', 1.5, 3.0, 5.0, 7.0, 9.0, 10),
('health_regen', 'Health Regen', 'armor', 'x', 0.5, 1.5, 3.0, 5.0, 8.0, 11),
('wall_health', 'Wall Health', 'armor', '%', 10, 25, 50, 75, 120, 12),
('wall_rebuild_time', 'Wall Rebuild Time', 'armor', 's', -5, -10, -15, -20, -30, 13),
('thorns_damage', 'Thorns Damage', 'armor', '%', 5, 10, 15, 20, 30, 14),

('coins_per_kill', 'Coins / Kill Bonus', 'generator', 'x', 0.2, 0.5, 1.0, 1.5, 2.5, 20),
('package_chance', 'Recovery Package Chance', 'generator', '%', 2, 4, 6, 8, 12, 21),
('free_upgrade_chance', 'Free Upgrade Chance', 'generator', '%', 2, 4, 6, 8, 10, 22),
('enemy_level_skip', 'Enemy Level Skip %', 'generator', '%', 1, 2, 3, 5, 8, 23),

('gt_bonus', 'Golden Tower Bonus', 'core', 'x', 1.0, 2.0, 3.5, 5.0, 8.0, 30),
('bh_size', 'Black Hole Size', 'core', 'm', 2, 4, 6, 8, 12, 31),
('sl_angle', 'Spotlight Angle', 'core', '°', 2, 5, 8, 12, 18, 32),
('dw_damage', 'Death Wave Damage', 'core', 'x', 2, 5, 10, 20, 40, 33),
('cf_slow', 'Chrono Field Slow %', 'core', '%', 2, 4, 6, 8, 10, 34)
on conflict (id) do update set
  name = excluded.name,
  slot = excluded.slot,
  unit = excluded.unit,
  rare_val = excluded.rare_val,
  epic_val = excluded.epic_val,
  legendary_val = excluded.legendary_val,
  mythic_val = excluded.mythic_val,
  ancestral_val = excluded.ancestral_val,
  sort_order = excluded.sort_order;
