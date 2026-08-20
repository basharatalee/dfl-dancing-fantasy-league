import { Contestant, Season, User, WeeklyResult } from './types';

// 15 Official Contestants - Dancer Pairs
export const CONTESTANTS: Contestant[] = [
  { id: 1, name: 'Pasha Pashkov & partner', status: 'active', eliminated: false, order: 1 },
  { id: 2, name: 'Gleb Savchenko & partner', status: 'active', eliminated: false, order: 2 },
  { id: 3, name: 'Valentin Chmerkovskiy & partner', status: 'active', eliminated: false, order: 3 },
  { id: 4, name: 'Alan Bersten & partner', status: 'active', eliminated: false, order: 4 },
  { id: 5, name: 'Brandon Armstrong & partner', status: 'active', eliminated: false, order: 5 },
  { id: 6, name: 'Jan Ravnik & partner', status: 'active', eliminated: false, order: 6 },
  { id: 7, name: 'Ezra Sosa & partner', status: 'active', eliminated: false, order: 7 },
  { id: 8, name: 'Mark Ballas & partner', status: 'active', eliminated: false, order: 8 },
  { id: 9, name: 'Emma Slater & partner', status: 'active', eliminated: false, order: 9 },
  { id: 10, name: 'Jenna Johnson & partner', status: 'active', eliminated: false, order: 10 },
  { id: 11, name: 'Daniella Karagach & partner', status: 'active', eliminated: false, order: 11 },
  { id: 12, name: 'Witney Carson & partner', status: 'active', eliminated: false, order: 12 },
  { id: 13, name: 'Britt Stewart & partner', status: 'active', eliminated: false, order: 13 },
  { id: 14, name: 'Rylee Arnold & partner', status: 'active', eliminated: false, order: 14 },
  { id: 15, name: 'Adelphi New & partner', status: 'active', eliminated: false, order: 15 },
];

// Default Season Configuration
export const DEFAULT_SEASON: Season = {
  id: 1,
  name: 'Season 33',
  status: 'preseason', // 'preseason' | 'live' | 'postseason'
  startDate: new Date('2025-03-17'),
  endDate: new Date('2025-05-26'),
  currentWeek: 0,
  totalWeeks: 10,
  finalistCount: 3,
  predictionDeadlineHour: 20, // 8 PM ET
  predictionDeadlineDay: 1, // Tuesday
};

// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: 'admin1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'user1',
    email: 'user@example.com',
    name: 'John Player',
    role: 'user',
    createdAt: new Date('2025-01-05'),
  },
  {
    id: 'user2',
    email: 'sarah@example.com',
    name: 'Sarah Dancer',
    role: 'user',
    createdAt: new Date('2025-01-10'),
  },
];

// Season Predictions (multiple users predicting)
export const MOCK_PREDICTIONS = {
  'user1': {
    week1: { top3: [1, 2, 3], bottom3: [13, 14, 15], eliminated: [15] },
    week2: { top3: [1, 3, 5], bottom3: [12, 13, 14], eliminated: [14] },
  },
  'user2': {
    week1: { top3: [2, 4, 5], bottom3: [12, 13, 15], eliminated: [15] },
    week2: { top3: [1, 2, 4], bottom3: [11, 13, 14], eliminated: [13] },
  },
};

// Mock Weekly Results (what actually happened)
export const MOCK_RESULTS: WeeklyResult[] = [
  {
    id: 1,
    week: 1,
    placements: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    eliminated: [15],
    eliminatedDouble: [],
    submittedAt: new Date('2025-03-25'),
    scoringCalculated: true,
  },
  {
    id: 2,
    week: 2,
    placements: [2, 1, 5, 3, 4, 7, 6, 8, 9, 10, 11, 12, 13, 14],
    eliminated: [14],
    eliminatedDouble: [],
    submittedAt: new Date('2025-04-01'),
    scoringCalculated: true,
  },
];

// Helper function to get active contestants
export function getActiveContestants(): Contestant[] {
  return CONTESTANTS.filter(c => !c.eliminated);
}

// Helper function to get remaining weeks in season
export function getRemainingWeeks(currentWeek: number, totalWeeks: number): number {
  return Math.max(0, totalWeeks - currentWeek);
}
