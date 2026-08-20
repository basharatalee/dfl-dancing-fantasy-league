/**
 * API Client - Single point for all backend integration
 * 
 * INTEGRATION GUIDE:
 * Replace mock implementations with actual fetch() calls to your Node.js backend
 * All endpoints follow RESTful conventions
 */

import { Contestant, Season, WeeklyPrediction, WeeklyResult } from './types';
import { CONTESTANTS, DEFAULT_SEASON, MOCK_RESULTS, MOCK_PREDICTIONS } from './mock-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============================================================================
// SEASON ENDPOINTS
// ============================================================================

export async function getSeason(): Promise<Season> {
  // TODO: Replace with real backend
  // const response = await fetch(`${API_BASE_URL}/seasons/current`);
  // if (!response.ok) throw new Error('Failed to fetch season');
  // return response.json();

  await delay(100);
  return DEFAULT_SEASON;
}

export async function updateSeason(season: Partial<Season>): Promise<Season> {
  // TODO: Replace with real backend
  // const response = await fetch(`${API_BASE_URL}/seasons/${season.id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(season),
  // });
  // if (!response.ok) throw new Error('Failed to update season');
  // return response.json();

  await delay(200);
  return { ...DEFAULT_SEASON, ...season };
}

// ============================================================================
// CONTESTANT ENDPOINTS
// ============================================================================

export async function getContestants(): Promise<Contestant[]> {
  // TODO: Replace with real backend
  // const response = await fetch(`${API_BASE_URL}/contestants`);
  // if (!response.ok) throw new Error('Failed to fetch contestants');
  // return response.json();

  await delay(100);
  return CONTESTANTS;
}

export async function addContestant(contestant: Omit<Contestant, 'id'>): Promise<Contestant> {
  // TODO: Replace with real backend
  // const response = await fetch(`${API_BASE_URL}/contestants`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(contestant),
  // });
  // if (!response.ok) throw new Error('Failed to add contestant');
  // return response.json();

  await delay(200);
  const newId = Math.max(...CONTESTANTS.map(c => c.id), 0) + 1;
  return { ...contestant, id: newId };
}

export async function updateContestant(id: number, contestant: Partial<Contestant>): Promise<Contestant> {
  // TODO: Replace with real backend
  // const response = await fetch(`${API_BASE_URL}/contestants/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(contestant),
  // });
  // if (!response.ok) throw new Error('Failed to update contestant');
  // return response.json();

  await delay(200);
  const original = CONTESTANTS.find(c => c.id === id);
  if (!original) throw new Error('Contestant not found');
  return { ...original, ...contestant };
}

export async function deleteContestant(id: number): Promise<void> {
  // TODO: Replace with real backend
  // const response = await fetch(`${API_BASE_URL}/contestants/${id}`, {
  //   method: 'DELETE',
  // });
  // if (!response.ok) throw new Error('Failed to delete contestant');

  await delay(200);
}

// ============================================================================
// PREDICTION ENDPOINTS
// ============================================================================

export async function getUserPredictions(userId: string, week?: number): Promise<WeeklyPrediction[]> {
  // TODO: Replace with real backend
  // const url = week ? `${API_BASE_URL}/predictions/${userId}?week=${week}` : `${API_BASE_URL}/predictions/${userId}`;
  // const response = await fetch(url);
  // if (!response.ok) throw new Error('Failed to fetch predictions');
  // return response.json();

  await delay(100);
  return Object.entries(MOCK_PREDICTIONS[userId] || {}).map(([key, value]) => ({
    userId,
    week: parseInt(key.replace('week', '')),
    ...value,
  }));
}

export async function submitPrediction(userId: string, prediction: WeeklyPrediction): Promise<WeeklyPrediction> {
  // TODO: Replace with real backend
  // const response = await fetch(`${API_BASE_URL}/predictions`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ userId, ...prediction }),
  // });
  // if (!response.ok) throw new Error('Failed to submit prediction');
  // return response.json();

  await delay(300);
  return { ...prediction, submittedAt: new Date(), userId };
}

export async function checkPredictionDeadline(week: number): Promise<{ locked: boolean; timeUntilDeadline: number }> {
  // TODO: Replace with real backend
  // const response = await fetch(`${API_BASE_URL}/predictions/deadline/${week}`);
  // if (!response.ok) throw new Error('Failed to check deadline');
  // return response.json();

  await delay(100);
  const deadline = calculateDeadline(week);
  const now = new Date().getTime();
  const timeUntil = deadline.getTime() - now;
  return {
    locked: timeUntil < 0,
    timeUntilDeadline: Math.max(0, timeUntil),
  };
}

// ============================================================================
// RESULTS ENDPOINTS
// ============================================================================

export async function getWeeklyResults(week?: number): Promise<WeeklyResult[]> {
  // TODO: Replace with real backend
  // const url = week ? `${API_BASE_URL}/results?week=${week}` : `${API_BASE_URL}/results`;
  // const response = await fetch(url);
  // if (!response.ok) throw new Error('Failed to fetch results');
  // return response.json();

  await delay(100);
  return week ? MOCK_RESULTS.filter(r => r.week === week) : MOCK_RESULTS;
}

export async function submitWeeklyResults(result: WeeklyResult): Promise<WeeklyResult> {
  // TODO: Replace with real backend
  // const response = await fetch(`${API_BASE_URL}/results`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(result),
  // });
  // if (!response.ok) throw new Error('Failed to submit results');
  // return response.json();

  await delay(300);
  return { ...result, submittedAt: new Date(), scoringCalculated: false };
}

// ============================================================================
// SCORING ENDPOINTS
// ============================================================================

export async function calculateScoring(week: number): Promise<{ success: boolean; message: string; pointsAdded: number }> {
  // TODO: Replace with real backend
  // const response = await fetch(`${API_BASE_URL}/scoring/calculate/${week}`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  // if (!response.ok) throw new Error('Failed to calculate scoring');
  // return response.json();

  await delay(500);
  return {
    success: true,
    message: `Scoring calculated for week ${week}. All predictions scored.`,
    pointsAdded: 150, // Mock value
  };
}

export async function getScoringLedger(userId?: string, week?: number): Promise<any[]> {
  // TODO: Replace with real backend
  // const url = new URL(`${API_BASE_URL}/scoring/ledger`);
  // if (userId) url.searchParams.set('userId', userId);
  // if (week) url.searchParams.set('week', week);
  // const response = await fetch(url);
  // if (!response.ok) throw new Error('Failed to fetch scoring ledger');
  // return response.json();

  await delay(100);
  return [];
}

// ============================================================================
// LEADERBOARD ENDPOINTS
// ============================================================================

export async function getLeaderboard(week?: number): Promise<any[]> {
  // TODO: Replace with real backend
  // const url = week ? `${API_BASE_URL}/leaderboard?week=${week}` : `${API_BASE_URL}/leaderboard`;
  // const response = await fetch(url);
  // if (!response.ok) throw new Error('Failed to fetch leaderboard');
  // return response.json();

  await delay(200);
  // Mock leaderboard data
  return [
    { rank: 1, userId: 'user1', name: 'John Player', totalPoints: 450, accuracy: 78 },
    { rank: 2, userId: 'user2', name: 'Sarah Dancer', totalPoints: 425, accuracy: 75 },
    { rank: 3, userId: 'user3', name: 'Mike Predictor', totalPoints: 400, accuracy: 72 },
  ];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateDeadline(week: number): Date {
  // Assuming Tuesday 8 PM ET
  const now = new Date();
  const days = (1 - now.getDay() + 7) % 7 || 7;
  const deadline = new Date(now);
  deadline.setDate(deadline.getDate() + days);
  deadline.setHours(20, 0, 0, 0);
  return deadline;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// BATCH OPERATIONS (useful helpers)
// ============================================================================

export async function bulkUpdateContestants(updates: Record<number, Partial<Contestant>>): Promise<Contestant[]> {
  // TODO: Implement batch endpoint
  const results: Contestant[] = [];
  for (const [id, update] of Object.entries(updates)) {
    results.push(await updateContestant(parseInt(id), update));
  }
  return results;
}

export async function exportWeekResults(week: number): Promise<string> {
  // TODO: Implement export endpoint - returns CSV or JSON
  const results = await getWeeklyResults(week);
  return JSON.stringify(results, null, 2);
}
