import { describe, it, expect } from 'vitest';
import { getTournamentRewards } from './tournamentModel';

describe('Tournament Rewards Model', () => {
  it('returns 0 for unknown league or rank outside 1..30', () => {
    expect(getTournamentRewards('', 1)).toEqual({ gems: 0, stones: 0, keys: 0 });
    expect(getTournamentRewards(null, 1)).toEqual({ gems: 0, stones: 0, keys: 0 });
    expect(getTournamentRewards('unknown_league', 1)).toEqual({ gems: 0, stones: 0, keys: 0 });
    expect(getTournamentRewards('champion', 0)).toEqual({ gems: 0, stones: 0, keys: 0 });
    expect(getTournamentRewards('champion', 31)).toEqual({ gems: 0, stones: 0, keys: 0 });
    expect(getTournamentRewards('champion', null)).toEqual({ gems: 0, stones: 0, keys: 0 });
  });

  it('correctly looks up champion rewards', () => {
    expect(getTournamentRewards('champion', 1)).toEqual({ gems: 600, stones: 320, keys: 0 });
    expect(getTournamentRewards('champion', 2)).toEqual({ gems: 500, stones: 300, keys: 0 });
    expect(getTournamentRewards('champion', 3)).toEqual({ gems: 400, stones: 280, keys: 0 });
    expect(getTournamentRewards('champion', 4)).toEqual({ gems: 400, stones: 280, keys: 0 });
    expect(getTournamentRewards('champion', 15)).toEqual({ gems: 250, stones: 100, keys: 0 });
    expect(getTournamentRewards('champion', 25)).toEqual({ gems: 150, stones: 20, keys: 0 });
  });

  it('correctly looks up legend rewards with keys', () => {
    expect(getTournamentRewards('legend', 1)).toEqual({ gems: 675, stones: 375, keys: 25 });
    expect(getTournamentRewards('legend', 2)).toEqual({ gems: 650, stones: 350, keys: 20 });
    expect(getTournamentRewards('legend', 25)).toEqual({ gems: 250, stones: 100, keys: 0 });
  });

  it('correctly looks up mythic rewards with keys', () => {
    expect(getTournamentRewards('mythic', 1)).toEqual({ gems: 900, stones: 475, keys: 50 });
    expect(getTournamentRewards('mythic', 15)).toEqual({ gems: 525, stones: 340, keys: 25 });
    expect(getTournamentRewards('mythic', 30)).toEqual({ gems: 335, stones: 225, keys: 8 });
  });
});
