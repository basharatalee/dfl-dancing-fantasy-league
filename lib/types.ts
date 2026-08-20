// User & Auth Types
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  avatar?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

// Contestant Types
export interface Contestant {
  id: number;
  name: string;
  status: 'active' | 'eliminated' | 'upcoming';
  eliminated: boolean;
  order: number;
}

// Prediction Types
export interface WeeklyPrediction {
  id?: string;
  userId: string;
  week: number;
  top3: number[]; // IDs of top 3
  bottom3: number[]; // IDs of bottom 3
  eliminated: number[]; // IDs eliminated this week
  submittedAt?: Date;
  lockedAt?: Date;
  points?: number;
  accuracy?: number;
}

export interface SeasonPrediction {
  id?: string;
  userId: string;
  predictions: Record<string, WeeklyPrediction>;
  points?: number;
  accuracy?: number;
}

// Results Types
export interface WeeklyResult {
  id: number;
  week: number;
  placements: number[]; // Contestant IDs in order of placement
  eliminated: number[]; // Contestant IDs eliminated this week
  eliminatedDouble?: number[]; // Contestant IDs eliminated in double elimination
  submittedAt: Date;
  scoringCalculated: boolean;
}

export interface PointsBreakdown {
  dancerId: string;
  dancerName: string;
  seasonPoints: number;
  weeklyPoints: number[];
  eliminationBonus: number;
  survivedWeeksBonus: number;
  totalPoints: number;
  accuracy: number;
}

export interface PointsLedger {
  id: string;
  userId: string;
  dancerId: string;
  week?: number;
  pointType: 'season-base' | 'season-bonus' | 'season-penalty' | 'weekly-base' | 'weekly-bonus' | 'weekly-penalty' | 'elimination' | 'draft';
  points: number;
  reason: string;
  calculatedAt: string;
}

// Season Types
export type SeasonStatus = 'preseason' | 'live' | 'postseason';

export interface Season {
  id: number;
  name: string;
  status: SeasonStatus;
  startDate: Date;
  endDate: Date;
  currentWeek: number;
  totalWeeks: number;
  finalistCount: number;
  predictionDeadlineHour: number; // Hour in 24-hour format
  predictionDeadlineDay: number; // Day of week (0-6, where 1 is Tuesday)
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalPoints: number;
  seasonAccuracy: number;
  weaklyAccuracy: number;
  predictions: number;
}

// Scoring Rule Types
export interface ScoringRules {
  seasonBase: number;
  seasonBonus: number;
  seasonPenalty: number;
  weeklyBase: number;
  weeklyBonus: number;
  weeklyPenalty: number;
  eliminationBonus: number;
  draftSurvivalBonus: number;
  finalistBonusMultiplier: number;
}

// Pod Types
export type PodType = 'draft' | 'weekly' | 'seasonal';
export type PodVisibility = 'private' | 'community';
export type PodMemberRole = 'curator' | 'member';
export type PodInviteChannel = 'email' | 'phone';
export type PodJoinRequestStatus = 'pending' | 'approved';

export interface PodMember {
  userId: string;
  name: string;
  email: string;
  role: PodMemberRole;
  joinedAt: string;
}

export interface PodInvite {
  id: string;
  channel: PodInviteChannel;
  value: string;
  invitedAt: string;
  status: 'pending';
}

export interface PodJoinRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  note?: string;
  requestedAt: string;
  status: PodJoinRequestStatus;
  reviewedAt?: string;
}

export interface PodStats {
  totalPoints: number;
  accuracy: number;
  wins: number;
  currentRank: number;
  trend: 'up' | 'steady' | 'down';
}

export interface PodActivity {
  id: string;
  text: string;
  timestamp: string;
}

export interface Pod {
  id: string;
  name: string;
  type: PodType;
  visibility: PodVisibility;
  curatorUserId: string;
  curatorName: string;
  curatorEmail: string;
  createdAt: string;
  members: PodMember[];
  invites: PodInvite[];
  joinRequests: PodJoinRequest[];
  stats: PodStats;
  activity: PodActivity[];
}
