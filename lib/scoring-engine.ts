import { DancerPrediction, PointsLedger, ScoringRules, WeeklyResult, PointsBreakdown } from './types';

// Default scoring rules per spec
export const DEFAULT_SCORING_RULES: ScoringRules = {
  // Season long predictions
  seasonBase: 5,
  seasonBonus: 20,
  seasonPenalty: 5,
  // Weekly predictions
  weeklyBase: 3,
  weeklyBonus: 10,
  weeklyPenalty: 3,
  // Special bonuses
  eliminationBonus: 5,
  draftSurvivalBonus: 5,
  finalistBonusMultiplier: 1.5,
};

/**
 * Calculate season-long prediction points
 * +5 base points for correct placement
 * +20 bonus for top 3 finalists
 * -5 penalty if eliminated and not predicted as finalist
 */
export function calculateSeasonPoints(
  prediction: DancerPrediction,
  actualPlacement: DancerPrediction,
  wasEliminated: boolean,
  isFinalist: boolean,
  rules: ScoringRules = DEFAULT_SCORING_RULES
): { points: number; breakdown: string } {
  let points = 0;
  const breakdowns: string[] = [];

  // Base points for correct placement
  if (prediction.placement === actualPlacement.placement) {
    points += rules.seasonBase;
    breakdowns.push(`Correct placement: +${rules.seasonBase}`);
  }

  // Bonus for predicting finalist correctly
  if (isFinalist && prediction.placement <= 3) {
    points += rules.seasonBonus;
    breakdowns.push(`Finalist bonus: +${rules.seasonBonus}`);
  }

  // Penalty if eliminated but predicted as finalist
  if (wasEliminated && !isFinalist && prediction.placement <= 3) {
    points -= rules.seasonPenalty;
    breakdowns.push(`Elimination penalty: -${rules.seasonPenalty}`);
  }

  return {
    points,
    breakdown: breakdowns.join(', '),
  };
}

/**
 * Calculate weekly prediction points
 * +3 base points for correct placement
 * +10 bonus for top 3 placements
 * -3 penalty if in bottom 3 and predicted high
 */
export function calculateWeeklyPoints(
  prediction: DancerPrediction,
  actualPlacement: DancerPrediction,
  totalContestants: number,
  rules: ScoringRules = DEFAULT_SCORING_RULES
): { points: number; breakdown: string } {
  let points = 0;
  const breakdowns: string[] = [];

  // Base points for correct placement
  if (prediction.placement === actualPlacement.placement) {
    points += rules.weeklyBase;
    breakdowns.push(`Correct placement: +${rules.weeklyBase}`);
  }

  // Bonus for top 3 predictions
  const isTopThree = actualPlacement.placement <= 3;
  if (isTopThree && prediction.placement <= 3) {
    points += rules.weeklyBonus;
    breakdowns.push(`Top 3 bonus: +${rules.weeklyBonus}`);
  }

  // Penalty for bottom 3 misprediction
  const isBottomThree = actualPlacement.placement > totalContestants - 3;
  const predictedHigh = prediction.placement <= 3;
  if (isBottomThree && predictedHigh) {
    points -= rules.weeklyPenalty;
    breakdowns.push(`Bottom 3 penalty: -${rules.weeklyPenalty}`);
  }

  return {
    points,
    breakdown: breakdowns.join(', '),
  };
}

/**
 * Calculate elimination bonus
 * +5 points for correctly predicting elimination
 */
export function calculateEliminationBonus(
  predictedAsEliminated: boolean,
  wasActuallyEliminated: boolean,
  week: number,
  rules: ScoringRules = DEFAULT_SCORING_RULES
): { points: number; breakdown: string } {
  let points = 0;

  if (predictedAsEliminated && wasActuallyEliminated) {
    points = rules.eliminationBonus;
    return {
      points,
      breakdown: `Correct elimination prediction (Week ${week}): +${rules.eliminationBonus}`,
    };
  }

  return {
    points: 0,
    breakdown: 'No elimination bonus',
  };
}

/**
 * Calculate draft survival bonus
 * +5 points per week contestant survives after draft
 */
export function calculateDraftSurvivalBonus(
  weeksAlive: number,
  rules: ScoringRules = DEFAULT_SCORING_RULES
): { points: number; breakdown: string } {
  if (weeksAlive > 0) {
    const points = weeksAlive * rules.draftSurvivalBonus;
    return {
      points,
      breakdown: `Draft survival (${weeksAlive} weeks): +${points}`,
    };
  }

  return {
    points: 0,
    breakdown: 'No survival bonus',
  };
}

/**
 * Calculate finalist bonus multiplier
 * 1.5x multiplier for finalist predictions if all correct
 */
export function applyFinalistMultiplier(
  points: number,
  allFinalistsCorrect: boolean,
  rules: ScoringRules = DEFAULT_SCORING_RULES
): { points: number; breakdown: string } {
  if (allFinalistsCorrect) {
    const multipliedPoints = Math.floor(points * rules.finalistBonusMultiplier);
    const bonus = multipliedPoints - points;
    return {
      points: multipliedPoints,
      breakdown: `Finalist bonus applied (1.5x multiplier): +${bonus}`,
    };
  }

  return {
    points,
    breakdown: 'No finalist multiplier',
  };
}

/**
 * Calculate accuracy percentage
 * (Correct predictions / Total predictions) * 100
 */
export function calculateAccuracy(correctCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return Math.round((correctCount / totalCount) * 100);
}

/**
 * Full scoring calculation for a user's predictions against actual results
 */
export function calculateFullScore(
  userPredictions: DancerPrediction[],
  actualResults: WeeklyResult,
  finalists: string[],
  rules: ScoringRules = DEFAULT_SCORING_RULES
): PointsBreakdown[] {
  const breakdowns: PointsBreakdown[] = [];

  userPredictions.forEach(prediction => {
    const actualPlacement = actualResults.placements.find(p => p.dancerId === prediction.dancerId);
    const wasEliminated = actualResults.eliminations.includes(prediction.dancerId);
    const isFinalist = finalists.includes(prediction.dancerId);

    if (!actualPlacement) return;

    let totalPoints = 0;
    let details = '';

    // Calculate weekly points
    const weeklyResult = calculateWeeklyPoints(
      prediction,
      actualPlacement,
      userPredictions.length,
      rules
    );
    totalPoints += weeklyResult.points;
    details += weeklyResult.breakdown + '; ';

    // Add elimination bonus
    const eliminationResult = calculateEliminationBonus(false, wasEliminated, actualResults.week, rules);
    totalPoints += eliminationResult.points;
    details += eliminationResult.breakdown;

    breakdowns.push({
      dancerId: prediction.dancerId,
      dancerName: `Contestant ${prediction.dancerId}`,
      seasonPoints: 0, // Will be calculated separately for season
      weeklyPoints: [weeklyResult.points],
      eliminationBonus: eliminationResult.points,
      survivedWeeksBonus: 0,
      totalPoints,
      accuracy: calculateAccuracy(prediction.placement === actualPlacement.placement ? 1 : 0, 1),
    });
  });

  return breakdowns;
}

/**
 * Create ledger entries for audit trail
 */
export function createLedgerEntries(
  userId: string,
  dancerId: string,
  points: number,
  pointType: PointsLedger['pointType'],
  week?: number,
  reason?: string
): PointsLedger {
  return {
    id: `ledger-${Date.now()}-${Math.random()}`,
    userId,
    dancerId,
    week,
    pointType,
    points,
    reason: reason || '',
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Validate scoring data for consistency
 */
export function validateScoringData(
  predictions: DancerPrediction[],
  results: WeeklyResult
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for duplicate placements in predictions
  const placements = predictions.map(p => p.placement);
  const uniquePlacements = new Set(placements);
  if (uniquePlacements.size !== placements.length) {
    errors.push('Duplicate placements found in predictions');
  }

  // Check if all results dancers are in predictions
  const resultDancers = results.placements.map(p => p.dancerId);
  const predictionDancers = predictions.map(p => p.dancerId);
  for (const dancer of resultDancers) {
    if (!predictionDancers.includes(dancer)) {
      errors.push(`Result contains dancer not in predictions: ${dancer}`);
    }
  }

  // Check for eliminated dancers not in results
  for (const dancer of results.eliminations) {
    if (!resultDancers.includes(dancer)) {
      errors.push(`Eliminated dancer not found in results: ${dancer}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
