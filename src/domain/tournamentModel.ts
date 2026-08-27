import { getCachedTournamentRewards } from './refDataService';

export interface TournamentRewards {
  gems: number;
  stones: number;
  keys: number;
}

const STATIC_TOURNAMENT_BANDS: Record<string, Array<{ min: number; max: number; gems: number; stones: number; keys: number }>> = {
  copper: [
    { min: 1, max: 1, gems: 100, stones: 20, keys: 0 },
    { min: 2, max: 2, gems: 80, stones: 18, keys: 0 },
    { min: 3, max: 4, gems: 65, stones: 16, keys: 0 },
    { min: 5, max: 6, gems: 50, stones: 12, keys: 0 },
    { min: 7, max: 8, gems: 45, stones: 10, keys: 0 },
    { min: 9, max: 10, gems: 40, stones: 9, keys: 0 },
    { min: 11, max: 12, gems: 30, stones: 8, keys: 0 },
    { min: 13, max: 15, gems: 20, stones: 7, keys: 0 },
    { min: 16, max: 22, gems: 15, stones: 6, keys: 0 },
    { min: 23, max: 30, gems: 10, stones: 5, keys: 0 }
  ],
  silver: [
    { min: 1, max: 1, gems: 200, stones: 40, keys: 0 },
    { min: 2, max: 2, gems: 150, stones: 35, keys: 0 },
    { min: 3, max: 4, gems: 100, stones: 30, keys: 0 },
    { min: 5, max: 6, gems: 75, stones: 20, keys: 0 },
    { min: 7, max: 8, gems: 65, stones: 19, keys: 0 },
    { min: 9, max: 10, gems: 60, stones: 18, keys: 0 },
    { min: 11, max: 12, gems: 55, stones: 17, keys: 0 },
    { min: 13, max: 15, gems: 50, stones: 16, keys: 0 },
    { min: 16, max: 22, gems: 45, stones: 14, keys: 0 },
    { min: 23, max: 30, gems: 40, stones: 12, keys: 0 }
  ],
  gold: [
    { min: 1, max: 1, gems: 300, stones: 80, keys: 0 },
    { min: 2, max: 2, gems: 250, stones: 70, keys: 0 },
    { min: 3, max: 4, gems: 200, stones: 60, keys: 0 },
    { min: 5, max: 6, gems: 150, stones: 40, keys: 0 },
    { min: 7, max: 8, gems: 125, stones: 30, keys: 0 },
    { min: 9, max: 10, gems: 100, stones: 28, keys: 0 },
    { min: 11, max: 12, gems: 90, stones: 26, keys: 0 },
    { min: 13, max: 15, gems: 80, stones: 24, keys: 0 },
    { min: 16, max: 22, gems: 70, stones: 22, keys: 0 },
    { min: 23, max: 30, gems: 50, stones: 20, keys: 0 }
  ],
  platinum: [
    { min: 1, max: 1, gems: 400, stones: 160, keys: 0 },
    { min: 2, max: 2, gems: 350, stones: 140, keys: 0 },
    { min: 3, max: 4, gems: 300, stones: 120, keys: 0 },
    { min: 5, max: 6, gems: 250, stones: 70, keys: 0 },
    { min: 7, max: 8, gems: 225, stones: 65, keys: 0 },
    { min: 9, max: 10, gems: 200, stones: 60, keys: 0 },
    { min: 11, max: 12, gems: 175, stones: 56, keys: 0 },
    { min: 13, max: 15, gems: 150, stones: 53, keys: 0 },
    { min: 16, max: 24, gems: 125, stones: 50, keys: 0 },
    { min: 25, max: 30, gems: 100, stones: 20, keys: 0 }
  ],
  champion: [
    { min: 1, max: 1, gems: 600, stones: 320, keys: 0 },
    { min: 2, max: 2, gems: 500, stones: 300, keys: 0 },
    { min: 3, max: 4, gems: 400, stones: 280, keys: 0 },
    { min: 5, max: 6, gems: 350, stones: 200, keys: 0 },
    { min: 7, max: 8, gems: 325, stones: 175, keys: 0 },
    { min: 9, max: 10, gems: 300, stones: 150, keys: 0 },
    { min: 11, max: 12, gems: 275, stones: 125, keys: 0 },
    { min: 13, max: 15, gems: 250, stones: 100, keys: 0 },
    { min: 16, max: 24, gems: 200, stones: 90, keys: 0 },
    { min: 25, max: 30, gems: 150, stones: 20, keys: 0 }
  ],
  legend: [
    { min: 1, max: 1, gems: 675, stones: 375, keys: 25 },
    { min: 2, max: 2, gems: 650, stones: 350, keys: 20 },
    { min: 3, max: 4, gems: 625, stones: 325, keys: 15 },
    { min: 5, max: 6, gems: 475, stones: 275, keys: 10 },
    { min: 7, max: 8, gems: 460, stones: 260, keys: 8 },
    { min: 9, max: 10, gems: 445, stones: 245, keys: 6 },
    { min: 11, max: 12, gems: 430, stones: 230, keys: 4 },
    { min: 13, max: 15, gems: 415, stones: 215, keys: 2 },
    { min: 16, max: 24, gems: 400, stones: 200, keys: 1 },
    { min: 25, max: 30, gems: 250, stones: 100, keys: 0 }
  ],
  mythic: [
    { min: 1, max: 1, gems: 900, stones: 475, keys: 50 },
    { min: 2, max: 2, gems: 800, stones: 450, keys: 45 },
    { min: 3, max: 4, gems: 700, stones: 425, keys: 40 },
    { min: 5, max: 6, gems: 650, stones: 400, keys: 37 },
    { min: 7, max: 8, gems: 600, stones: 385, keys: 34 },
    { min: 9, max: 10, gems: 575, stones: 370, keys: 31 },
    { min: 11, max: 12, gems: 550, stones: 355, keys: 28 },
    { min: 13, max: 15, gems: 525, stones: 340, keys: 25 },
    { min: 16, max: 24, gems: 500, stones: 325, keys: 20 },
    { min: 25, max: 30, gems: 335, stones: 225, keys: 8 }
  ]
};

/**
 * Returns the Gems, Stones, and Keys rewarded for a tournament run
 * based on the bracket and final rank/placing.
 *
 * Ground rule / schema invariant: returns 0 rewards for unknown bracket or rank outside 1..30.
 * Never guesses or substitutes a default league.
 */
export function getTournamentRewards(bracket: string | null | undefined, rank: number | null | undefined): TournamentRewards {
  if (!bracket || !rank || rank < 1 || rank > 30) {
    return { gems: 0, stones: 0, keys: 0 };
  }

  // 1. Try cache from refDataService
  const cached = getCachedTournamentRewards(bracket, rank);
  if (cached) {
    return cached;
  }

  // 2. Fallback to bundled static bands
  const b = bracket.toLowerCase();
  const leagueBands = STATIC_TOURNAMENT_BANDS[b];
  if (!leagueBands) {
    return { gems: 0, stones: 0, keys: 0 };
  }

  const match = leagueBands.find((band) => rank >= band.min && rank <= band.max);
  if (match) {
    return { gems: match.gems, stones: match.stones, keys: match.keys };
  }

  return { gems: 0, stones: 0, keys: 0 };
}
