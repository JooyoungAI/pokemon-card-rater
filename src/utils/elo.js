// Elo Rating System math
// Expected score for player A versus player B:
// Ea = 1 / (1 + 10^((Rb - Ra) / 400))
// 
// New Rating for player A:
// Ra' = Ra + K * (Sa - Ea)
//
// Where K is a constant (e.g., 32), and Sa is the actual score (1 for win, 0 for loss).

const K = 32;

export function calculateElo(ratingA, ratingB, aWon) {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));

  const actualA = aWon ? 1 : 0;
  const actualB = aWon ? 0 : 1;

  const newRatingA = Math.round(ratingA + K * (actualA - expectedA));
  const newRatingB = Math.round(ratingB + K * (actualB - expectedB));

  return { newRatingA, newRatingB };
}
