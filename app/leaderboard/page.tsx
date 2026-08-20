'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProtectedRoute } from '@/hooks/useAdminGuard';
import { useAuth } from '@/lib/auth-context';
import { getPodTypeMeta, loadPods } from '@/lib/pod-storage';
import { Pod, PodMember } from '@/lib/types';
import { ArrowLeft, ChevronDown, ChevronUp, Trophy, Users } from 'lucide-react';

type SortBy = 'season' | 'weekly';

type PodLeaderboardRow = {
  rank: number;
  member: PodMember;
  points: number;
  weeklyPoints: number;
  accuracy: number;
  change: number;
};

export default function Leaderboard() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user } = useAuth();
  const [pods, setPods] = useState<Pod[]>([]);
  const [selectedPodId, setSelectedPodId] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('season');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const loadedPods = loadPods();
    const myPods = loadedPods.filter((pod) => pod.members.some((member) => member.userId === user.id));
    const params = new URLSearchParams(window.location.search);
    const requestedPodId = params.get('podId') ?? '';
    const requestedPod = myPods.find((pod) => pod.id === requestedPodId);

    setPods(loadedPods);
    setSelectedPodId(requestedPod?.id ?? myPods[0]?.id ?? '');
  }, [isAuthenticated, user]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const myPods = pods.filter((pod) => pod.members.some((member) => member.userId === user.id));
  const selectedPod = myPods.find((pod) => pod.id === selectedPodId) ?? null;
  const rows = selectedPod ? createPodLeaderboardRows(selectedPod, sortBy) : [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <Button asChild variant="ghost" className="mb-4 px-0">
              <Link href="/dashboard">
                <ArrowLeft className="size-4" />
                Back to dashboard
              </Link>
            </Button>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <Trophy className="text-primary" size={32} />
                  <h1 className="text-4xl font-bold text-foreground">
                    {selectedPod ? `${selectedPod.name} Leaderboard` : 'Leaderboard'}
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  {selectedPod
                    ? `Showing who is winning inside this ${getPodTypeMeta(selectedPod.type).label.toLowerCase()} pod.`
                    : 'Join or create a pod to see a leaderboard for your group.'}
                </p>
              </div>

              {selectedPod ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{getPodTypeMeta(selectedPod.type).label}</Badge>
                  <Badge variant={selectedPod.visibility === 'community' ? 'secondary' : 'outline'}>
                    {selectedPod.visibility === 'community' ? 'Community pod' : 'Private pod'}
                  </Badge>
                  <Badge variant="outline">
                    <Users className="mr-1 size-3" />
                    {selectedPod.members.length} members
                  </Badge>
                </div>
              ) : null}
            </div>
          </div>

          {myPods.length > 1 ? (
            <div className="mb-8 rounded-xl border border-border bg-card p-4">
              <p className="mb-3 text-sm font-semibold text-muted-foreground">Go to my pod leaderboard</p>
              <div className="flex flex-wrap gap-2">
                {myPods.map((pod) => (
                  <Link
                    key={pod.id}
                    href={`/leaderboard?podId=${encodeURIComponent(pod.id)}`}
                    onClick={() => setSelectedPodId(pod.id)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedPodId === pod.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {pod.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {selectedPod ? (
            <>
              <div className="mb-8 flex gap-4">
                <button
                  onClick={() => setSortBy('season')}
                  className={`rounded-lg px-6 py-3 font-semibold transition-colors ${
                    sortBy === 'season'
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  Season Standings
                </button>
                <button
                  onClick={() => setSortBy('weekly')}
                  className={`rounded-lg px-6 py-3 font-semibold transition-colors ${
                    sortBy === 'weekly'
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  This Week
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Rank</th>
                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Player</th>
                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground">Role</th>
                        <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Points</th>
                        <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Accuracy</th>
                        {sortBy === 'season' ? (
                          <th className="px-6 py-4 text-right font-semibold text-muted-foreground">Change</th>
                        ) : null}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.member.userId}
                          className={`border-b border-border/50 transition-colors hover:bg-muted/50 ${
                            row.rank <= 3 ? 'bg-gradient-to-r from-primary/5 to-transparent' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex size-8 items-center justify-center rounded-full font-bold ${
                                  row.rank <= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                                }`}
                              >
                                {row.rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-foreground">{row.member.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedPod.visibility === 'community' ? 'Username visible to pod only' : row.member.email}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={row.member.role === 'curator' ? 'default' : 'outline'}>
                              {row.member.role}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-lg font-bold text-primary">
                              {(sortBy === 'season' ? row.points : row.weeklyPoints).toLocaleString()}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-semibold text-foreground">{row.accuracy}%</span>
                          </td>
                          {sortBy === 'season' ? (
                            <td className="px-6 py-4 text-right">
                              <div
                                className={`inline-flex items-center gap-1 font-semibold ${
                                  row.change > 0
                                    ? 'text-green-400'
                                    : row.change < 0
                                      ? 'text-red-400'
                                      : 'text-muted-foreground'
                                }`}
                              >
                                {row.change > 0 ? <ChevronUp size={16} /> : null}
                                {row.change < 0 ? <ChevronDown size={16} /> : null}
                                {Math.abs(row.change)}
                              </div>
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <p className="font-semibold text-foreground">No pod leaderboard yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Create or join a pod from your dashboard to start competing with your friends.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function createPodLeaderboardRows(pod: Pod, sortBy: SortBy): PodLeaderboardRow[] {
  const basePoints = Math.max(pod.stats.totalPoints, pod.members.length * 120);

  return pod.members
    .map((member, index) => {
      const seed = member.userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const memberShare = Math.max(80, Math.round(basePoints / Math.max(1, pod.members.length)));
      const points = memberShare + (seed % 260) + (member.role === 'curator' ? 45 : 0);
      const weeklyPoints = Math.max(20, Math.round(points * 0.18) + ((seed + index) % 45));

      return {
        rank: 0,
        member,
        points,
        weeklyPoints,
        accuracy: Math.min(99, Math.max(40, pod.stats.accuracy + ((seed % 13) - 6))),
        change: ((seed + index) % 5) - 2,
      };
    })
    .sort((a, b) => {
      const firstScore = sortBy === 'season' ? b.points - a.points : b.weeklyPoints - a.weeklyPoints;
      return firstScore || a.member.name.localeCompare(b.member.name);
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
