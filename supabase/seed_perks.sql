-- ============================================================================
-- Seed data for ref_perks
-- ============================================================================

insert into public.ref_perks (id, name, category, max_picks, base_value, unit, positive_effect, negative_effect, uw_id, description, tier_score, recommended_ban, sort_order) values
('tradeoff_coins_health', '1.80x Coins / -70% Tower Health', 'tradeoff', 1, 1.8, 'x', '+1.80x Coins from all sources (multiplicative)', '-70% Tower Max Health', null, 'The premier farming trade-off perk. Essential for high CPM economy runs.', 5, false, 1),
('tradeoff_damage_boss_health', '+50% Tower Damage / +50% Boss Health', 'tradeoff', 1, 50, '%', '+50% Tower Damage', '+50% Boss Health', null, 'Great for damage-hybrid builds or dealing with high wave elites.', 4, false, 2),
('tradeoff_enemy_dmg_tower_dmg', '-50% Enemy Damage / -50% Tower Damage', 'tradeoff', 1, -50, '%', '-50% Enemy Attack Damage', '-50% Tower Damage', null, 'Massively extends eHP (effective health) survival in pure tank / health builds.', 4, false, 3),
('tradeoff_regen_health', '8.00x Health Regen / -60% Tower Health', 'tradeoff', 1, 8.0, 'x', '+8.00x Health Regen', '-60% Tower Max Health', null, 'Useful for Wormhole Redirector module users relying on wall regen.', 3, false, 4),
('tradeoff_lifesteal_knockback', '+2.50x Lifesteal / -70% Knockback Force', 'tradeoff', 1, 2.5, 'x', '+2.50x Lifesteal multiplier', '-70% Knockback force to enemies', null, 'DANGEROUS: Usually a top ban target because reduced knockback lets mobs overwhelm the tower.', 1, true, 5),
('tradeoff_ranged_enemies', '-75% Ranged Enemy Distance / -50% Tower Range', 'tradeoff', 1, -75, '%', '-75% Distance for Ranged enemies to attack', '-50% Tower Attack Range', null, 'Pulls ranged enemies into orb range. Highly favored in blender and black hole strategies.', 4, false, 6),
('tradeoff_boss_health_speed', '-70% Boss Health / +50% Boss Speed', 'tradeoff', 1, -70, '%', '-70% Boss Health', '+50% Boss Movement Speed', null, 'Allows plasma cannon / thorns to eliminate bosses faster.', 3, false, 7),
('tradeoff_enemies_speed_dmg', '+44% Enemy Speed / -50% Enemy Damage', 'tradeoff', 1, 44, '%', '-50% Enemy Damage', '+44% Enemy Speed', null, 'Increases spawn throughput into kill zones while mitigating single-hit damage.', 3, false, 8),

('std_coins_bonus', 'Coins Bonus', 'standard', 5, 15, '%', '+15% Coins / Kill per stack (scales with Standard Perk Bonus lab)', null, null, 'The foundation of all economy farming runs. Top priority pick.', 5, false, 10),
('std_pwr_reduction', 'Perk Wave Requirement', 'standard', 3, -20, '%', '-20% Waves required between new perk choices', null, null, 'Accelerates perk acquisition for the entire run. Must pick immediately.', 5, false, 11),
('std_free_upgrades', 'Free Upgrades Chance', 'standard', 5, 5, '%', '+5% Free Attack, Defense, and Utility upgrade chance', null, null, 'Helps max out workshop stats rapidly during early waves.', 4, false, 12),
('std_health_bonus', 'Tower Health', 'standard', 5, 20, '%', '+20% Tower Max Health per stack', null, null, 'Core survival perk for eHP builds and pushing high wave tiers.', 5, false, 13),
('std_defense_percent', 'Defense %', 'standard', 5, 4, '%', '+4% Defense % (Damage Reduction) per stack', null, null, 'Vital mitigation to reach the 98% defense cap.', 5, false, 14),
('std_damage_bonus', 'Tower Damage', 'standard', 5, 15, '%', '+15% Tower Damage per stack', null, null, 'Scales raw projectile damage and ultimate weapon triggers.', 4, false, 15),
('std_extra_orbs', 'Extra Orbs', 'standard', 1, 1, 'orb', '+1 Extra Orb to the extra orb card circle', null, null, 'Adds another instant-kill blender orb for crowd control.', 4, false, 16),
('std_extra_orbs_speed', 'Extra Orbs Speed', 'standard', 1, 2.0, 'x', '+2.0x Rotation speed for extra orbs', null, null, 'Significantly increases orb collision frequency.', 4, false, 17),
('std_bounce_shot', 'Bounce Shot +2', 'standard', 3, 2, 'bounces', '+2 Max Bounce Shot targets per stack', null, null, 'Increases bullet spread across approaching mobs.', 3, false, 18),
('std_landmine_damage', 'Landmine Damage', 'standard', 5, 150, '%', '+150% Landmine Damage per stack', null, null, 'Increases explosive trap damage against ground enemies.', 2, false, 19),
('std_health_regen', 'Health Regen', 'standard', 5, 100, '%', '+100% Health Regen per stack', null, null, 'Synergizes with Wall and Wormhole Redirector.', 3, false, 20),
('std_interest_bonus', 'Interest %', 'standard', 5, 1.5, '%', '+1.5% Max Interest rate per round', null, null, 'Very low utility in late-game. Common ban candidate.', 1, true, 21),

('uw_black_hole', 'Black Hole +12s Duration', 'ultimate_weapon', 1, 12, 's', '+12 Seconds Black Hole Duration for the active run', null, 'bh', 'Enables massive overlap with Golden Tower and coin multipliers.', 5, false, 30),
('uw_golden_tower', 'Golden Tower +1.5x Bonus', 'ultimate_weapon', 1, 1.5, 'x', '+1.5x Multiplier to Golden Tower Coin & Cash Bonus', null, 'gt', 'Multiplicative boost to Golden Tower income.', 5, false, 31),
('uw_death_wave', 'Death Wave +1 Wave', 'ultimate_weapon', 1, 1, 'wave', '+1 Additional Expanding Death Wave effect', null, 'dw', 'Provides extra health multiplier stacking and coin tag coverage.', 5, false, 32),
('uw_spotlight', 'Spotlight +1 Beam', 'ultimate_weapon', 1, 1, 'beam', '+1 Additional Spotlight beam rotation', null, 'sl', 'Widens map coverage for bonus coins and massive missile damage.', 5, false, 33),
('uw_chrono_field', 'Chrono Field -5s Cooldown & +5% Slow', 'ultimate_weapon', 1, 5, 's', '-5s Cooldown and +5% enemy movement speed reduction', null, 'cf', 'Helps achieve 100% permanent Chrono Field uptime.', 4, false, 34),
('uw_chain_lightning', 'Chain Lightning Shock +5%', 'ultimate_weapon', 1, 5, '%', '+5% Shock chance and +50% shock multiplier', null, 'cl', 'Amplifies all incoming damage to shocked enemies.', 4, false, 35),
('uw_poison_swamp', 'Poison Swamp Stun', 'ultimate_weapon', 1, 2.0, 's', 'Enemies caught in swamp have a chance to be stunned for 2.0s', null, 'ps', 'Extra crowd control lock-down.', 3, false, 36),
('uw_smart_missiles', 'Smart Missiles +4 Volley', 'ultimate_weapon', 1, 4, 'missiles', '+4 Missiles fired per barrage', null, 'sm', 'Significantly multiplies missile amplifier stack ramp.', 4, false, 37)
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  max_picks = excluded.max_picks,
  base_value = excluded.base_value,
  unit = excluded.unit,
  positive_effect = excluded.positive_effect,
  negative_effect = excluded.negative_effect,
  uw_id = excluded.uw_id,
  description = excluded.description,
  tier_score = excluded.tier_score,
  recommended_ban = excluded.recommended_ban,
  sort_order = excluded.sort_order;
