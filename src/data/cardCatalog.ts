export type CardRarity = 'common' | 'rare' | 'epic';
export type CardCategory = 'attack' | 'defense' | 'economy' | 'utility' | 'ultimate';

export interface CardDefinition {
  id: string;
  name: string;
  rarity: CardRarity;
  category: CardCategory;
  maxLevel: number;
  description: string;
  bonusSummary: string;
  wikiUrl?: string;
}

export const CARD_SLOT_COSTS: { slot: number; costGems: number }[] = [
  { slot: 1, costGems: 0 },
  { slot: 2, costGems: 0 },
  { slot: 3, costGems: 0 },
  { slot: 4, costGems: 20 },
  { slot: 5, costGems: 50 },
  { slot: 6, costGems: 100 },
  { slot: 7, costGems: 200 },
  { slot: 8, costGems: 300 },
  { slot: 9, costGems: 400 },
  { slot: 10, costGems: 500 },
  { slot: 11, costGems: 600 },
  { slot: 12, costGems: 700 },
  { slot: 13, costGems: 800 },
  { slot: 14, costGems: 900 },
  { slot: 15, costGems: 1000 },
  { slot: 16, costGems: 1200 },
  { slot: 17, costGems: 1400 },
  { slot: 18, costGems: 1600 },
  { slot: 19, costGems: 1800 },
];

export const CARD_CATALOG: CardDefinition[] = [
  // ── Common Cards ──────────────────────────────────────────
  {
    id: 'attack_speed',
    name: 'Attack Speed',
    rarity: 'common',
    category: 'attack',
    maxLevel: 7,
    description: 'Increases Tower attack speed dramatically.',
    bonusSummary: '+1.0x ~ +4.0x Attack Speed',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Attack_Speed_(Card)'
  },
  {
    id: 'damage',
    name: 'Damage',
    rarity: 'common',
    category: 'attack',
    maxLevel: 7,
    description: 'Increases Tower attack damage multiplier.',
    bonusSummary: '+1.2x ~ +4.0x Damage',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Damage_(Card)'
  },
  {
    id: 'health',
    name: 'Health',
    rarity: 'common',
    category: 'defense',
    maxLevel: 7,
    description: 'Increases Tower max health base multiplier.',
    bonusSummary: '+1.2x ~ +4.0x Health',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Health_(Card)'
  },
  {
    id: 'health_regen',
    name: 'Health Regen',
    rarity: 'common',
    category: 'defense',
    maxLevel: 7,
    description: 'Increases health regeneration rate per second.',
    bonusSummary: '+1.2x ~ +4.0x Health Regen',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Health_Regen_(Card)'
  },
  {
    id: 'range',
    name: 'Range',
    rarity: 'common',
    category: 'utility',
    maxLevel: 7,
    description: 'Increases Tower firing and projectile range.',
    bonusSummary: '+1.1x ~ +1.4x Range',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Range_(Card)'
  },
  {
    id: 'cash',
    name: 'Cash',
    rarity: 'common',
    category: 'economy',
    maxLevel: 7,
    description: 'Increases Cash earned from enemy kills and waves.',
    bonusSummary: '+1.2x ~ +4.0x Cash',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Cash_(Card)'
  },
  {
    id: 'coins',
    name: 'Coins',
    rarity: 'common',
    category: 'economy',
    maxLevel: 7,
    description: 'Increases raw Coins earned per kill.',
    bonusSummary: '+1.15x ~ +2.05x Coins Bonus',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Coins_(Card)'
  },
  {
    id: 'free_upgrades',
    name: 'Free Upgrades',
    rarity: 'common',
    category: 'utility',
    maxLevel: 7,
    description: 'Adds chance to receive free workshop upgrades during runs.',
    bonusSummary: '+2.5% ~ +10.0% Free Chance',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Free_Upgrades_(Card)'
  },
  {
    id: 'enemy_balance',
    name: 'Enemy Balance',
    rarity: 'common',
    category: 'economy',
    maxLevel: 7,
    description: 'Increases enemy spawn density and provides major Cash multiplier.',
    bonusSummary: '+1.2x ~ +2.0x Enemy Spawn Rate & Cash',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Enemy_Balance_(Card)'
  },
  {
    id: 'extra_defense',
    name: 'Extra Defense',
    rarity: 'common',
    category: 'defense',
    maxLevel: 7,
    description: 'Increases Defense % damage reduction directly.',
    bonusSummary: '+3.0% ~ +15.0% Defense %',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Extra_Defense_(Card)'
  },

  // ── Rare Cards ────────────────────────────────────────────
  {
    id: 'critical_chance',
    name: 'Critical Chance',
    rarity: 'rare',
    category: 'attack',
    maxLevel: 7,
    description: 'Increases the probability of landing critical strikes.',
    bonusSummary: '+2.0% ~ +14.0% Crit Chance',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Critical_Chance_(Card)'
  },
  {
    id: 'critical_coin',
    name: 'Critical Coin',
    rarity: 'rare',
    category: 'economy',
    maxLevel: 7,
    description: 'Grants chance for enemies killed by crits/orbs/UWs to drop extra coins.',
    bonusSummary: '+10.0% ~ +35.0% Crit Coin Drop',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Critical_Coin_(Card)'
  },
  {
    id: 'plasma_cannon',
    name: 'Plasma Cannon',
    rarity: 'rare',
    category: 'defense',
    maxLevel: 7,
    description: 'Shoots plasma projectile removing a % of Boss maximum health.',
    bonusSummary: '10.0% ~ 54.0% Boss Max HP Damage',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Plasma_Cannon_(Card)'
  },
  {
    id: 'extra_orb',
    name: 'Extra Orb',
    rarity: 'rare',
    category: 'defense',
    maxLevel: 7,
    description: 'Adds extra revolving outer defense orbs to shred normal enemies.',
    bonusSummary: '+1 ~ +4 Extra Orbs',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Extra_Orb_(Card)'
  },
  {
    id: 'fortress',
    name: 'Fortress',
    rarity: 'rare',
    category: 'defense',
    maxLevel: 7,
    description: 'Increases Absolute Defense by a substantial flat amount.',
    bonusSummary: '+10 ~ +10,000 Absolute Defense',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Fortress_(Card)'
  },
  {
    id: 'recovery_package_chance',
    name: 'Recovery Package Chance',
    rarity: 'rare',
    category: 'utility',
    maxLevel: 7,
    description: 'Increases chance of recovery package delivering health overdrive.',
    bonusSummary: '+5.0% ~ +20.0% Package Chance',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Recovery_Package_Chance_(Card)'
  },
  {
    id: 'death_ray',
    name: 'Death Ray',
    rarity: 'rare',
    category: 'attack',
    maxLevel: 7,
    description: 'Fires sweeping laser beams that instantly vaporize non-boss enemies.',
    bonusSummary: 'Instant Kill Ray (Periodic)',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Death_Ray_(Card)'
  },
  {
    id: 'land_mine_stun',
    name: 'Land Mine Stun',
    rarity: 'rare',
    category: 'utility',
    maxLevel: 7,
    description: 'Causes land mine explosions to stun surviving enemies.',
    bonusSummary: '1.0s ~ 3.5s Stun Duration',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Land_Mine_Stun_(Card)'
  },
  {
    id: 'slow_aura',
    name: 'Slow Aura',
    rarity: 'rare',
    category: 'defense',
    maxLevel: 7,
    description: 'Slows down the movement speed of all enemies in range.',
    bonusSummary: '-10.0% ~ -35.0% Enemy Movement Speed',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Slow_Aura_(Card)'
  },

  // ── Epic Cards ────────────────────────────────────────────
  {
    id: 'wave_skip',
    name: 'Wave Skip',
    rarity: 'epic',
    category: 'economy',
    maxLevel: 7,
    description: 'Chance to skip next wave and gain 1.1x coins from skipped waves.',
    bonusSummary: '7.0% ~ 19.0% Wave Skip Chance',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Wave_Skip_(Card)'
  },
  {
    id: 'wave_accelerator',
    name: 'Wave Accelerator',
    rarity: 'epic',
    category: 'utility',
    maxLevel: 7,
    description: 'Reduces downtime between enemy spawn waves significantly.',
    bonusSummary: '-20% ~ -50% Time Between Waves',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Wave_Accelerator_(Card)'
  },
  {
    id: 'berserker',
    name: 'Berserker',
    rarity: 'epic',
    category: 'attack',
    maxLevel: 7,
    description: 'Converts damage taken into massive bonus attack damage (up to +300%).',
    bonusSummary: 'Absorbs hit damage into up to +300% ATK',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Berserker_(Card)'
  },
  {
    id: 'energy_shield',
    name: 'Energy Shield',
    rarity: 'epic',
    category: 'defense',
    maxLevel: 7,
    description: 'Charges rechargeable shields that completely block lethal hits.',
    bonusSummary: '1 ~ 3 Hit Shields (Rechargeable)',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Energy_Shield_(Card)'
  },
  {
    id: 'second_wind',
    name: 'Second Wind',
    rarity: 'epic',
    category: 'defense',
    maxLevel: 7,
    description: 'Prevents death once per run, granting invulnerability & full heal.',
    bonusSummary: '1x Fatal Hit Resurrection',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Second_Wind_(Card)'
  },
  {
    id: 'demon_mode',
    name: 'Demon Mode',
    rarity: 'epic',
    category: 'ultimate',
    maxLevel: 7,
    description: 'Manual activation triggers complete invincibility and massive DPS boost.',
    bonusSummary: '+300% ~ +800% ATK & Invulnerable (10-30s)',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Demon_Mode_(Card)'
  },
  {
    id: 'energy_net',
    name: 'Energy Net',
    rarity: 'epic',
    category: 'defense',
    maxLevel: 7,
    description: 'Locks approaching Bosses in place with an energy grid.',
    bonusSummary: 'Immobilizes Bosses for 4.0s ~ 10.0s',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Energy_Net_(Card)'
  },
  {
    id: 'super_tower',
    name: 'Super Tower',
    rarity: 'epic',
    category: 'attack',
    maxLevel: 7,
    description: 'Periodically enters Super Tower state with immense laser beam damage.',
    bonusSummary: '+1.5x ~ +5.0x Super Laser Multiplier',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Super_Tower_(Card)'
  },
  {
    id: 'ultimate_crit',
    name: 'Ultimate Crit',
    rarity: 'epic',
    category: 'ultimate',
    maxLevel: 7,
    description: 'Enables Ultimate Weapons to land devastating critical strikes.',
    bonusSummary: 'Enables UW Critical Multipliers',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Ultimate_Crit_(Card)'
  },
  {
    id: 'nuke',
    name: 'Nuke',
    rarity: 'epic',
    category: 'ultimate',
    maxLevel: 7,
    description: 'Detonate a nuclear strike wiping all non-boss enemies on screen.',
    bonusSummary: '1x Screen Wipe Active Ability',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Nuke_(Card)'
  },
  {
    id: 'intro_sprint',
    name: 'Intro Sprint',
    rarity: 'epic',
    category: 'utility',
    maxLevel: 7,
    description: 'Accelerates game speed dramatically during the first waves of a run.',
    bonusSummary: 'Hyper Speed for first 30 ~ 70 waves',
    wikiUrl: 'https://the-tower-idle-tower-defense.fandom.com/wiki/Intro_Sprint_(Card)'
  }
];
