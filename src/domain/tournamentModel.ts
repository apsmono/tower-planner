export interface TournamentRewards {
  gems: number;
  stones: number;
  keys: number;
}

/**
 * Returns the Gems, Stones, and Keys rewarded for a tournament run
 * based on the bracket and final rank/placing.
 */
export function getTournamentRewards(bracket: string, rank: number | null): TournamentRewards {
  if (!rank || rank < 1 || rank > 30) {
    return { gems: 0, stones: 0, keys: 0 };
  }

  const b = bracket.toLowerCase();
  
  if (b === 'copper') {
    if (rank === 1) return { gems: 100, stones: 20, keys: 0 };
    if (rank === 2) return { gems: 80, stones: 18, keys: 0 };
    if (rank >= 3 && rank <= 4) return { gems: 65, stones: 16, keys: 0 };
    if (rank >= 5 && rank <= 6) return { gems: 50, stones: 12, keys: 0 };
    if (rank >= 7 && rank <= 8) return { gems: 45, stones: 10, keys: 0 };
    if (rank >= 9 && rank <= 10) return { gems: 40, stones: 9, keys: 0 };
    if (rank >= 11 && rank <= 12) return { gems: 30, stones: 8, keys: 0 };
    if (rank >= 13 && rank <= 15) return { gems: 20, stones: 7, keys: 0 };
    if (rank >= 16 && rank <= 22) return { gems: 15, stones: 6, keys: 0 };
    return { gems: 10, stones: 5, keys: 0 };
  }
  
  if (b === 'silver') {
    if (rank === 1) return { gems: 200, stones: 40, keys: 0 };
    if (rank === 2) return { gems: 150, stones: 35, keys: 0 };
    if (rank >= 3 && rank <= 4) return { gems: 100, stones: 30, keys: 0 };
    if (rank >= 5 && rank <= 6) return { gems: 75, stones: 20, keys: 0 };
    if (rank >= 7 && rank <= 8) return { gems: 65, stones: 19, keys: 0 };
    if (rank >= 9 && rank <= 10) return { gems: 60, stones: 18, keys: 0 };
    if (rank >= 11 && rank <= 12) return { gems: 55, stones: 17, keys: 0 };
    if (rank >= 13 && rank <= 15) return { gems: 50, stones: 16, keys: 0 };
    if (rank >= 16 && rank <= 22) return { gems: 45, stones: 14, keys: 0 };
    return { gems: 40, stones: 12, keys: 0 };
  }
  
  if (b === 'gold') {
    if (rank === 1) return { gems: 300, stones: 80, keys: 0 };
    if (rank === 2) return { gems: 250, stones: 70, keys: 0 };
    if (rank >= 3 && rank <= 4) return { gems: 200, stones: 60, keys: 0 };
    if (rank >= 5 && rank <= 6) return { gems: 150, stones: 40, keys: 0 };
    if (rank >= 7 && rank <= 8) return { gems: 125, stones: 30, keys: 0 };
    if (rank >= 9 && rank <= 10) return { gems: 100, stones: 28, keys: 0 };
    if (rank >= 11 && rank <= 12) return { gems: 90, stones: 26, keys: 0 };
    if (rank >= 13 && rank <= 15) return { gems: 80, stones: 24, keys: 0 };
    if (rank >= 16 && rank <= 22) return { gems: 70, stones: 22, keys: 0 };
    return { gems: 50, stones: 20, keys: 0 };
  }
  
  if (b === 'platinum') {
    if (rank === 1) return { gems: 400, stones: 160, keys: 0 };
    if (rank === 2) return { gems: 350, stones: 140, keys: 0 };
    if (rank >= 3 && rank <= 4) return { gems: 300, stones: 120, keys: 0 };
    if (rank >= 5 && rank <= 6) return { gems: 250, stones: 70, keys: 0 };
    if (rank >= 7 && rank <= 8) return { gems: 225, stones: 65, keys: 0 };
    if (rank >= 9 && rank <= 10) return { gems: 200, stones: 60, keys: 0 };
    if (rank >= 11 && rank <= 12) return { gems: 175, stones: 56, keys: 0 };
    if (rank >= 13 && rank <= 15) return { gems: 150, stones: 53, keys: 0 };
    if (rank >= 16 && rank <= 24) return { gems: 125, stones: 50, keys: 0 };
    return { gems: 100, stones: 20, keys: 0 };
  }
  
  if (b === 'champion') {
    if (rank === 1) return { gems: 600, stones: 320, keys: 0 };
    if (rank === 2) return { gems: 500, stones: 300, keys: 0 };
    if (rank >= 3 && rank <= 4) return { gems: 400, stones: 280, keys: 0 };
    if (rank >= 5 && rank <= 6) return { gems: 350, stones: 200, keys: 0 };
    if (rank >= 7 && rank <= 8) return { gems: 325, stones: 175, keys: 0 };
    if (rank >= 9 && rank <= 10) return { gems: 300, stones: 150, keys: 0 };
    if (rank >= 11 && rank <= 12) return { gems: 275, stones: 125, keys: 0 };
    if (rank >= 13 && rank <= 15) return { gems: 250, stones: 100, keys: 0 };
    if (rank >= 16 && rank <= 24) return { gems: 200, stones: 90, keys: 0 };
    return { gems: 150, stones: 20, keys: 0 };
  }
  
  if (b === 'legend') {
    if (rank === 1) return { gems: 675, stones: 375, keys: 25 };
    if (rank === 2) return { gems: 650, stones: 350, keys: 20 };
    if (rank >= 3 && rank <= 4) return { gems: 625, stones: 325, keys: 15 };
    if (rank >= 5 && rank <= 6) return { gems: 475, stones: 275, keys: 10 };
    if (rank >= 7 && rank <= 8) return { gems: 460, stones: 260, keys: 8 };
    if (rank >= 9 && rank <= 10) return { gems: 445, stones: 245, keys: 6 };
    if (rank >= 11 && rank <= 12) return { gems: 430, stones: 230, keys: 4 };
    if (rank >= 13 && rank <= 15) return { gems: 415, stones: 215, keys: 2 };
    if (rank >= 16 && rank <= 24) return { gems: 400, stones: 200, keys: 1 };
    return { gems: 250, stones: 100, keys: 0 };
  }

  if (b === 'mythic') {
    if (rank === 1) return { gems: 900, stones: 475, keys: 50 };
    if (rank === 2) return { gems: 800, stones: 450, keys: 45 };
    if (rank >= 3 && rank <= 4) return { gems: 700, stones: 425, keys: 40 };
    if (rank >= 5 && rank <= 6) return { gems: 650, stones: 400, keys: 37 };
    if (rank >= 7 && rank <= 8) return { gems: 600, stones: 385, keys: 34 };
    if (rank >= 9 && rank <= 10) return { gems: 575, stones: 370, keys: 31 };
    if (rank >= 11 && rank <= 12) return { gems: 550, stones: 355, keys: 28 };
    if (rank >= 13 && rank <= 15) return { gems: 525, stones: 340, keys: 25 };
    if (rank >= 16 && rank <= 24) return { gems: 500, stones: 325, keys: 20 };
    return { gems: 335, stones: 225, keys: 8 };
  }

  return { gems: 0, stones: 0, keys: 0 };
}
