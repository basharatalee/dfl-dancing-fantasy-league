'use client';

import { MOCK_USERS } from './mock-data';
import {
  Pod,
  PodActivity,
  PodInvite,
  PodJoinRequest,
  PodMember,
  PodMemberRole,
  PodStats,
  PodType,
  User,
} from './types';

const STORAGE_KEY = 'fdl_pods_v1';
const COMMUNITY_CAPACITY = 8;

export interface PodTypeMeta {
  label: string;
  shortDescription: string;
  detailDescription: string;
  communityEnabled: boolean;
}

const POD_TYPE_META: Record<PodType, PodTypeMeta> = {
  draft: {
    label: 'Draft',
    shortDescription: 'Pick dancers in a shared draft before the season begins.',
    detailDescription: 'Great for friends who want a private draft room and season-long bragging rights.',
    communityEnabled: false,
  },
  weekly: {
    label: 'Weekly predictions',
    shortDescription: 'Make fresh predictions every week and compete round by round.',
    detailDescription: 'Best for flexible groups who want a new contest every episode week.',
    communityEnabled: true,
  },
  seasonal: {
    label: 'Seasonal predictions',
    shortDescription: 'Lock in long-range calls and track performance over the full season.',
    detailDescription: 'Ideal for players who want one running table across the whole competition.',
    communityEnabled: true,
  },
};

type CreatePodInput = {
  name: string;
  type: PodType;
  curator: User;
  inviteEmails: string[];
  invitePhones: string[];
};

type SearchPodsInput = {
  type: PodType;
  query: string;
  user: User;
};

type RequestToJoinInput = {
  podId: string;
  user: User;
  note?: string;
};

type ApproveRequestInput = {
  podId: string;
  requestId: string;
  curatorUserId: string;
};

type JoinCommunityInput = {
  type: Extract<PodType, 'weekly' | 'seasonal'>;
  user: User;
};

type AcceptInviteInput = {
  podId: string;
  user: User;
};

export function getPodTypeOptions(): Array<{ value: PodType; meta: PodTypeMeta }> {
  return (Object.keys(POD_TYPE_META) as PodType[]).map((value) => ({
    value,
    meta: POD_TYPE_META[value],
  }));
}

export function getPodTypeMeta(type: PodType): PodTypeMeta {
  return POD_TYPE_META[type];
}

export function loadPods(): Pod[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const seeded = createSeedPods();
    savePods(seeded);
    return seeded;
  }

  try {
    const parsed = JSON.parse(stored) as Pod[];
    const normalized = parsed.map(normalizePod);
    const hydrated = ensureDemoPods(ensureCommunityPods(normalized));
    if (hydrated.length !== normalized.length) {
      savePods(hydrated);
    }
    return hydrated;
  } catch (error) {
    console.error('Failed to parse pod storage:', error);
    const seeded = createSeedPods();
    savePods(seeded);
    return seeded;
  }
}

export function getUserPods(userId: string): Pod[] {
  return loadPods().filter((pod) => pod.members.some((member) => member.userId === userId));
}

export function getPendingEmailInvites(email: string): Pod[] {
  const normalizedEmail = email.trim().toLowerCase();
  return loadPods().filter((pod) =>
    pod.invites.some((invite) => invite.channel === 'email' && invite.value.toLowerCase() === normalizedEmail)
  );
}

export function createPod({ name, type, curator, inviteEmails, invitePhones }: CreatePodInput): Pod {
  const pods = loadPods();
  const invites = [
    ...inviteEmails.map((value) => createInvite('email', value)),
    ...invitePhones.map((value) => createInvite('phone', value)),
  ];

  const pod: Pod = {
    id: createId('pod'),
    name: name.trim(),
    type,
    visibility: 'private',
    curatorUserId: curator.id,
    curatorName: curator.name,
    curatorEmail: curator.email,
    createdAt: new Date().toISOString(),
    members: [createMember(curator, 'curator')],
    invites,
    joinRequests: [],
    stats: createFreshStats(),
    activity: [
      createActivity(`${curator.name} created the pod.`),
      ...invites.map((invite) =>
        createActivity(`Invitation sent to ${invite.channel === 'email' ? invite.value : `phone ${invite.value}`}.`)
      ),
    ],
  };

  const nextPods = [pod, ...pods];
  savePods(nextPods);
  return pod;
}

export function searchPrivatePods({ type, query, user }: SearchPodsInput): Pod[] {
  const normalizedQuery = query.trim().toLowerCase();

  return loadPods()
    .filter((pod) => pod.type === type && pod.visibility === 'private')
    .filter((pod) => !pod.members.some((member) => member.userId === user.id))
    .filter((pod) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        pod.name.toLowerCase().includes(normalizedQuery) ||
        pod.curatorEmail.toLowerCase().includes(normalizedQuery) ||
        pod.curatorName.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((a, b) => b.members.length - a.members.length || a.name.localeCompare(b.name));
}

export function requestToJoinPod({ podId, user, note }: RequestToJoinInput): Pod | null {
  const pods = loadPods();
  let updatedPod: Pod | null = null;

  const nextPods = pods.map((pod) => {
    if (pod.id !== podId || pod.visibility !== 'private') {
      return pod;
    }

    const isMember = pod.members.some((member) => member.userId === user.id);
    const hasPendingRequest = pod.joinRequests.some(
      (request) => request.userId === user.id && request.status === 'pending'
    );

    if (isMember || hasPendingRequest) {
      updatedPod = pod;
      return pod;
    }

    const request: PodJoinRequest = {
      id: createId('request'),
      userId: user.id,
      name: user.name,
      email: user.email,
      note: note?.trim() || undefined,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    updatedPod = {
      ...pod,
      joinRequests: [request, ...pod.joinRequests],
      activity: [createActivity(`${user.name} requested to join the pod.`), ...pod.activity].slice(0, 12),
    };

    return updatedPod;
  });

  savePods(nextPods);
  return updatedPod;
}

export function approveJoinRequest({ podId, requestId, curatorUserId }: ApproveRequestInput): Pod | null {
  const pods = loadPods();
  let updatedPod: Pod | null = null;

  const nextPods = pods.map((pod) => {
    if (pod.id !== podId || pod.curatorUserId !== curatorUserId) {
      return pod;
    }

    const request = pod.joinRequests.find((entry) => entry.id === requestId && entry.status === 'pending');
    if (!request) {
      updatedPod = pod;
      return pod;
    }

    const alreadyMember = pod.members.some((member) => member.userId === request.userId);
    const nextMembers = alreadyMember
      ? pod.members
      : [
          ...pod.members,
          createRequestedMember(request),
        ];

    updatedPod = {
      ...pod,
      members: nextMembers,
      joinRequests: pod.joinRequests.map((entry) =>
        entry.id === requestId
          ? { ...entry, status: 'approved', reviewedAt: new Date().toISOString() }
          : entry
      ),
      activity: [createActivity(`${request.name} was approved and joined the pod.`), ...pod.activity].slice(0, 12),
      stats: rebalanceStats(pod.stats, nextMembers.length),
    };

    return updatedPod ?? pod;
  });

  savePods(nextPods);
  return updatedPod;
}

export function joinCommunityPod({ type, user }: JoinCommunityInput): Pod {
  let pods = ensureCommunityPods(loadPods());
  const matchingPod = chooseCommunityPod(pods, type);

  if (!pods.some((pod) => pod.id === matchingPod.id)) {
    pods = [matchingPod, ...pods];
  }

  const nextPods = pods.map((pod) => {
    if (pod.id !== matchingPod.id) {
      return pod;
    }

    if (pod.members.some((member) => member.userId === user.id)) {
      return pod;
    }

    const nextMembers = [...pod.members, createMember(user, 'member')];
    return {
      ...pod,
      members: nextMembers,
      stats: rebalanceStats(pod.stats, nextMembers.length),
      activity: [createActivity(`${user.name} was matched into the community pod.`), ...pod.activity].slice(0, 12),
    };
  });

  savePods(nextPods);
  return nextPods.find((pod) => pod.id === matchingPod.id) ?? matchingPod;
}

export function acceptInvite({ podId, user }: AcceptInviteInput): Pod | null {
  const pods = loadPods();
  let updatedPod: Pod | null = null;

  const nextPods = pods.map((pod) => {
    if (pod.id !== podId) {
      return pod;
    }

    const inviteMatch = pod.invites.find(
      (invite) => invite.channel === 'email' && invite.value.toLowerCase() === user.email.toLowerCase()
    );

    if (!inviteMatch) {
      updatedPod = pod;
      return pod;
    }

    if (pod.members.some((member) => member.userId === user.id)) {
      updatedPod = pod;
      return pod;
    }

    const nextMembers = [...pod.members, createMember(user, 'member')];
    updatedPod = {
      ...pod,
      members: nextMembers,
      invites: pod.invites.filter((invite) => invite.id !== inviteMatch.id),
      stats: rebalanceStats(pod.stats, nextMembers.length),
      activity: [createActivity(`${user.name} accepted an email invitation.`), ...pod.activity].slice(0, 12),
    };

    return updatedPod;
  });

  savePods(nextPods);
  return updatedPod;
}

function chooseCommunityPod(pods: Pod[], type: JoinCommunityInput['type']): Pod {
  const matches = pods.filter((pod) => pod.type === type && pod.visibility === 'community');
  const available = matches.filter((pod) => pod.members.length < COMMUNITY_CAPACITY);

  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  return createCommunityPod(type, matches.length + 1);
}

function ensureCommunityPods(pods: Pod[]): Pod[] {
  const nextPods = [...pods];

  (['weekly', 'seasonal'] as const).forEach((type) => {
    const hasCommunity = nextPods.some((pod) => pod.type === type && pod.visibility === 'community');
    if (!hasCommunity) {
      nextPods.push(createCommunityPod(type, 1));
    }
  });

  return nextPods;
}

function ensureDemoPods(pods: Pod[]): Pod[] {
  const john = mustFindUser('user@example.com');
  const sarah = mustFindUser('sarah@example.com');
  const admin = mustFindUser('admin@example.com');
  const demoPods = createDemoDraftPods(john, sarah, admin);
  const existingIds = new Set(pods.map((pod) => pod.id));
  const missingDemoPods = demoPods.filter((pod) => !existingIds.has(pod.id));

  return missingDemoPods.length ? [...pods, ...missingDemoPods] : pods;
}

function createSeedPods(): Pod[] {
  const admin = mustFindUser('admin@example.com');
  const john = mustFindUser('user@example.com');
  const sarah = mustFindUser('sarah@example.com');

  return ensureDemoPods(ensureCommunityPods([
    {
      id: 'pod-seed-draft',
      name: 'Spotlight Draft House',
      type: 'draft',
      visibility: 'private',
      curatorUserId: sarah.id,
      curatorName: sarah.name,
      curatorEmail: sarah.email,
      createdAt: '2026-04-10T13:00:00.000Z',
      members: [createMember(sarah, 'curator'), createMember(john, 'member')],
      invites: [createInvite('email', 'alex@example.com'), createInvite('phone', '+1 555 0199')],
      joinRequests: [],
      stats: {
        totalPoints: 1840,
        accuracy: 72,
        wins: 3,
        currentRank: 2,
        trend: 'up',
      },
      activity: [
        createActivity('Sarah Dancer opened the draft room for this season.'),
        createActivity('John Player joined from a direct invite.'),
        createActivity('Draft board order was locked in for opening night.'),
      ],
    },
    {
      id: 'pod-seed-weekly-private',
      name: 'Mirrorball Weekly Club',
      type: 'weekly',
      visibility: 'private',
      curatorUserId: john.id,
      curatorName: john.name,
      curatorEmail: john.email,
      createdAt: '2026-04-12T15:30:00.000Z',
      members: [createMember(john, 'curator')],
      invites: [createInvite('email', 'sarah@example.com')],
      joinRequests: [
        {
          id: 'request-seed-admin',
          userId: admin.id,
          name: admin.name,
          email: admin.email,
          note: 'I want in for the week-by-week competition.',
          requestedAt: '2026-04-20T09:00:00.000Z',
          status: 'pending',
        },
      ],
      stats: {
        totalPoints: 980,
        accuracy: 78,
        wins: 1,
        currentRank: 6,
        trend: 'steady',
      },
      activity: [
        createActivity('Mirrorball Weekly Club started taking requests.'),
        createActivity('Admin User requested to join and is waiting for approval.'),
      ],
    },
    {
      id: 'pod-seed-seasonal-private',
      name: 'Finale Forecast Circle',
      type: 'seasonal',
      visibility: 'private',
      curatorUserId: sarah.id,
      curatorName: sarah.name,
      curatorEmail: sarah.email,
      createdAt: '2026-04-09T18:15:00.000Z',
      members: [createMember(sarah, 'curator')],
      invites: [],
      joinRequests: [],
      stats: {
        totalPoints: 1325,
        accuracy: 81,
        wins: 2,
        currentRank: 4,
        trend: 'up',
      },
      activity: [
        createActivity('Season-long predictions were opened for early members.'),
      ],
    },
  ]));
}

function createDemoDraftPods(john: User, sarah: User, admin: User): Pod[] {
  return [
    {
      id: 'pod-demo-ballroom-draft',
      name: 'Ballroom Draft Crew',
      type: 'draft',
      visibility: 'private',
      curatorUserId: john.id,
      curatorName: john.name,
      curatorEmail: john.email,
      createdAt: '2026-04-14T12:00:00.000Z',
      members: [createMember(john, 'curator'), createMember(sarah, 'member'), createMember(admin, 'member')],
      invites: [createInvite('email', 'morgan@example.com')],
      joinRequests: [],
      stats: {
        totalPoints: 2210,
        accuracy: 76,
        wins: 4,
        currentRank: 1,
        trend: 'up',
      },
      activity: [
        createActivity('Ballroom Draft Crew added its draft board.'),
        createActivity('Sarah Dancer joined the draft pod.'),
      ],
    },
    {
      id: 'pod-demo-glitter-draft',
      name: 'Glitter Draft League',
      type: 'draft',
      visibility: 'private',
      curatorUserId: sarah.id,
      curatorName: sarah.name,
      curatorEmail: sarah.email,
      createdAt: '2026-04-16T17:45:00.000Z',
      members: [createMember(sarah, 'curator'), createMember(john, 'member'), createMember(admin, 'member')],
      invites: [],
      joinRequests: [],
      stats: {
        totalPoints: 1985,
        accuracy: 70,
        wins: 2,
        currentRank: 3,
        trend: 'steady',
      },
      activity: [
        createActivity('Glitter Draft League finished its opening picks.'),
      ],
    },
    {
      id: 'pod-demo-latin-night-draft',
      name: 'Latin Night Draft',
      type: 'draft',
      visibility: 'private',
      curatorUserId: john.id,
      curatorName: john.name,
      curatorEmail: john.email,
      createdAt: '2026-04-18T20:15:00.000Z',
      members: [createMember(john, 'curator'), createMember(sarah, 'member')],
      invites: [createInvite('email', 'riley@example.com'), createInvite('phone', '+1 555 0134')],
      joinRequests: [],
      stats: {
        totalPoints: 1645,
        accuracy: 68,
        wins: 1,
        currentRank: 5,
        trend: 'down',
      },
      activity: [
        createActivity('Latin Night Draft opened for friends.'),
      ],
    },
    {
      id: 'pod-demo-finale-draft-table',
      name: 'Finale Draft Table',
      type: 'draft',
      visibility: 'private',
      curatorUserId: sarah.id,
      curatorName: sarah.name,
      curatorEmail: sarah.email,
      createdAt: '2026-04-22T10:30:00.000Z',
      members: [createMember(sarah, 'curator'), createMember(john, 'member')],
      invites: [],
      joinRequests: [],
      stats: {
        totalPoints: 1750,
        accuracy: 74,
        wins: 3,
        currentRank: 2,
        trend: 'up',
      },
      activity: [
        createActivity('Finale Draft Table started tracking picks.'),
      ],
    },
  ];
}

function createCommunityPod(type: JoinCommunityInput['type'], index: number): Pod {
  const label = type === 'weekly' ? 'Weekly Community Pod' : 'Seasonal Community Pod';

  return {
    id: createId(`community-${type}`),
    name: `${label} ${index}`,
    type,
    visibility: 'community',
    curatorUserId: `community-${type}`,
    curatorName: 'Community Matchmaker',
    curatorEmail: 'community@fantasydancingleague.com',
    createdAt: new Date().toISOString(),
    members: [],
    invites: [],
    joinRequests: [],
    stats: type === 'weekly'
      ? { totalPoints: 640, accuracy: 69, wins: 1, currentRank: 10, trend: 'steady' }
      : { totalPoints: 870, accuracy: 74, wins: 1, currentRank: 8, trend: 'steady' },
    activity: [
      createActivity(`${label} ${index} is open for solo players.`),
    ],
  };
}

function createInvite(channel: PodInvite['channel'], value: string): PodInvite {
  return {
    id: createId('invite'),
    channel,
    value,
    invitedAt: new Date().toISOString(),
    status: 'pending',
  };
}

function createMember(user: User, role: PodMemberRole): PodMember {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role,
    joinedAt: new Date().toISOString(),
  };
}

function createFreshStats(): PodStats {
  return {
    totalPoints: 0,
    accuracy: 0,
    wins: 0,
    currentRank: 1,
    trend: 'steady',
  };
}

function createRequestedMember(request: PodJoinRequest): PodMember {
  return {
    userId: request.userId,
    name: request.name,
    email: request.email,
    role: 'member',
    joinedAt: new Date().toISOString(),
  };
}

function rebalanceStats(stats: PodStats, memberCount: number): PodStats {
  return {
    totalPoints: stats.totalPoints + 45,
    accuracy: Math.min(99, stats.accuracy === 0 ? 63 : stats.accuracy + 1),
    wins: stats.wins + (memberCount > 1 ? 1 : 0),
    currentRank: Math.max(1, stats.currentRank - 1),
    trend: 'up',
  };
}

function createActivity(text: string): PodActivity {
  return {
    id: createId('activity'),
    text,
    timestamp: new Date().toISOString(),
  };
}

function normalizePod(pod: Pod): Pod {
  return {
    ...pod,
    invites: pod.invites ?? [],
    joinRequests: pod.joinRequests ?? [],
    members: pod.members ?? [],
    activity: pod.activity ?? [],
    stats: pod.stats ?? createFreshStats(),
  };
}

function savePods(pods: Pod[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pods));
}

function mustFindUser(email: string): User {
  const user = MOCK_USERS.find((entry) => entry.email === email);
  if (!user) {
    throw new Error(`Missing mock user for ${email}`);
  }
  return user;
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
