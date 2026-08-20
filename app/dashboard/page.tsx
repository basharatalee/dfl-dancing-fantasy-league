'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  Percent,
  Phone,
  Plus,
  Search,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useProtectedRoute } from '@/hooks/useAdminGuard';
import { useAuth } from '@/lib/auth-context';
import {
  acceptInvite,
  approveJoinRequest,
  createPod,
  getPodTypeMeta,
  getPodTypeOptions,
  joinCommunityPod,
  loadPods,
  requestToJoinPod,
} from '@/lib/pod-storage';
import { Pod, PodType } from '@/lib/types';

type PodAction = 'create' | 'join';

const podTypes = getPodTypeOptions();

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { user } = useAuth();
  const [pods, setPods] = useState<Pod[]>([]);
  const [selectedAction, setSelectedAction] = useState<PodAction | null>(null);
  const [selectedType, setSelectedType] = useState<PodType | null>(null);
  const [isPodFlowOpen, setIsPodFlowOpen] = useState(false);
  const [selectedPodId, setSelectedPodId] = useState('');
  const [createName, setCreateName] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [invitePhones, setInvitePhones] = useState('');
  const [joinQuery, setJoinQuery] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [activeSummaryModal, setActiveSummaryModal] = useState<'approvals' | 'invites' | null>(null);
  const quickviewSliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setPods(loadPods());
    }
  }, [isAuthenticated]);

  const myPods = user ? pods.filter((pod) => pod.members.some((member) => member.userId === user.id)) : [];
  const invitedPods = user
    ? pods.filter(
        (pod) =>
          !pod.members.some((member) => member.userId === user.id) &&
          pod.invites.some(
            (invite) => invite.channel === 'email' && invite.value.toLowerCase() === user.email.toLowerCase()
          )
      )
    : [];

  useEffect(() => {
    if (!myPods.length) {
      setSelectedPodId('');
      return;
    }

    if (selectedPodId && !myPods.some((pod) => pod.id === selectedPodId)) {
      setSelectedPodId('');
    }
  }, [myPods, selectedPodId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const selectedPod = myPods.find((pod) => pod.id === selectedPodId) ?? null;
  const isCurator = selectedPod?.curatorUserId === user.id;
  const pendingRequests =
    selectedPod?.joinRequests.filter((request) => request.status === 'pending') ?? [];
  const pendingApprovalsCount = myPods.reduce(
    (total, pod) =>
      total + (pod.curatorUserId === user.id ? pod.joinRequests.filter((request) => request.status === 'pending').length : 0),
    0
  );
  const pendingApprovalItems = myPods.flatMap((pod) =>
    pod.curatorUserId === user.id
      ? pod.joinRequests
          .filter((request) => request.status === 'pending')
          .map((request) => ({ pod, request }))
      : []
  );
  const podSearchResults =
    selectedType && selectedAction === 'join'
      ? pods
          .filter((pod) => pod.type === selectedType && pod.visibility === 'private')
          .filter((pod) => !pod.members.some((member) => member.userId === user.id))
          .filter((pod) => {
            const query = joinQuery.trim().toLowerCase();
            if (!query) {
              return true;
            }

            return (
              pod.name.toLowerCase().includes(query) ||
              pod.curatorEmail.toLowerCase().includes(query) ||
              pod.curatorName.toLowerCase().includes(query)
            );
          })
      : [];

  const refreshPods = () => {
    setPods(loadPods());
  };

  const resetFlowFeedback = () => {
    setFeedback('');
  };

  const openPodFlow = (action: PodAction) => {
    setSelectedAction(action);
    setSelectedType((currentType) => currentType ?? podTypes[0].value);
    setIsPodFlowOpen(true);
    resetFlowFeedback();
  };

  const scrollQuickview = (direction: 'left' | 'right') => {
    quickviewSliderRef.current?.scrollBy({
      left: direction === 'left' ? -380 : 380,
      behavior: 'smooth',
    });
  };

  const handleCreatePod = () => {
    if (!selectedType) {
      setFeedback('Choose a pod type first.');
      return;
    }

    if (!createName.trim()) {
      setFeedback('Give your pod a name before creating it.');
      return;
    }

    const pod = createPod({
      name: createName,
      type: selectedType,
      curator: user,
      inviteEmails: splitList(inviteEmails),
      invitePhones: splitList(invitePhones),
    });

    refreshPods();
    setSelectedPodId(pod.id);
    setCreateName('');
    setInviteEmails('');
    setInvitePhones('');
    setFeedback('Pod created. You are now the curator and people can find it through your email.');
  };

  const handleRequestToJoin = (podId: string) => {
    const pod = requestToJoinPod({
      podId,
      user,
      note: joinMessage,
    });

    if (pod) {
      refreshPods();
      setJoinMessage('');
      setFeedback(`Request sent to ${pod.curatorName}. You will join once the curator approves it.`);
    }
  };

  const handleJoinCommunity = () => {
    if (!selectedType || (selectedType !== 'weekly' && selectedType !== 'seasonal')) {
      setFeedback('Community pods are only available for weekly and seasonal predictions.');
      return;
    }

    const pod = joinCommunityPod({
      type: selectedType,
      user,
    });

    refreshPods();
    setSelectedPodId(pod.id);
    setFeedback(`You were matched into ${pod.name}. Community pods only show usernames to other members.`);
  };

  const handleApproveRequest = (podId: string, requestId: string) => {
    const pod = approveJoinRequest({
      podId,
      requestId,
      curatorUserId: user.id,
    });

    if (pod) {
      refreshPods();
      setFeedback('Join request approved.');
    }
  };

  const handleAcceptInvite = (podId: string) => {
    const pod = acceptInvite({
      podId,
      user,
    });

    if (pod) {
      refreshPods();
      setSelectedPodId(pod.id);
      setFeedback(`You joined ${pod.name} from your email invitation.`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(199,125,255,0.18),_transparent_32%),radial-gradient(circle_at_80%_15%,_rgba(167,139,250,0.14),_transparent_28%),linear-gradient(180deg,rgba(38,25,74,0.72),rgba(10,14,39,0.95)_38%)]">
      <Header />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Your Dashboard</h1>

          <section className="overflow-hidden rounded-[2rem] border border-purple-200/35 bg-[radial-gradient(circle_at_top_left,_rgba(216,180,254,0.28),_transparent_38%),linear-gradient(135deg,rgba(111,66,165,0.98),rgba(68,44,116,0.98))] p-8 shadow-2xl shadow-purple-950/30">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                {/* <Badge className="mb-4 bg-primary/15 text-primary hover:bg-primary/15" variant="outline">
                  Signed-in dashboard
                </Badge> */}
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Welcome back, {user.name} !
                </h1>
                <p className="mt-3 max-w-2xl text-base text-white-100 sm:text-lg">
All of your pods are displayed here. See your stats, compare results with friends and track your draft picks here. 
Don’t forget to share your weekly results on social media!                </p>
              </div>

              <div className="grid w-full grid-cols-1 gap-3 sm:w-[28rem] sm:grid-cols-2 lg:w-[32rem]">
                <SummaryTile
                  label="Pending approvals"
                  value={String(pendingApprovalsCount)}
                  icon={<Clock3 className="size-4" />}
                  onClick={() => setActiveSummaryModal('approvals')}
                />
                <SummaryTile
                  label="Pod Invites"
                  value={String(invitedPods.length)}
                  icon={<Mail className="size-4" />}
                  onClick={() => setActiveSummaryModal('invites')}
                />
              </div>
            </div>
          </section>


{/* Create / Join Horizontal Tabs */}
{/* <section className="mt-5">
  <div className="rounded-2xl border border-border/60 bg-card/70 p-1.5 shadow-sm">
    <div className="grid grid-cols-2 gap-2">
      {(
        [
          {
            value: 'create',
            title: 'Create Pod',
            icon: <Plus className="size-4" />,
          },
          {
            value: 'join',
            title: 'Join Pod',
            icon: <Search className="size-4" />,
          },
        ] as const
      ).map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => openPodFlow(option.value)}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-all duration-200 ${
            selectedAction === option.value
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'text-muted-foreground hover:bg-background hover:text-foreground'
          }`}
        >
          {option.icon}
          {option.title}
        </button>
      ))}
    </div>
  </div>
</section> */}


{/* Create / Join Theme Matched Tabs */}
<section className="mt-3 mb-2">
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {(
        [
          {
            value: 'create',
            title: 'Create Pod',
            icon: <Plus className="size-4" />,
          },
          {
            value: 'join',
            title: 'Join Pod',
            icon: <Search className="size-4" />,
          },
        ] as const
      ).map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => openPodFlow(option.value)}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold shadow-lg transition-all duration-300 ${
            selectedAction === option.value
              ? 'border-purple-100/60 bg-[#7c4bb2]/82 text-white shadow-purple-950/30 ring-1 ring-purple-100/35'
              : 'border-purple-200/35 bg-[#4d347d]/72 text-purple-100 shadow-purple-950/20 hover:border-purple-100/55 hover:bg-[#614094] hover:text-white'
          }`}
        >
          {option.icon}
          {option.title}
        </button>
      ))}
  </div>
</section>




<Card className="border-purple-200/25 bg-[#2f2258]/82 shadow-lg shadow-purple-950/20">
                <CardHeader>
                  <CardTitle className="text-3xl">Quickview</CardTitle>
                  <CardDescription>
                    Go to my pod
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {myPods.length ? (
                    <div className="relative">
                      {myPods.length > 2 ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => scrollQuickview('left')}
                          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 shadow-lg"
                          aria-label="Scroll pods left"
                        >
                          <ChevronLeft className="size-4" />
                        </Button>
                      ) : null}

                      <div
                        ref={quickviewSliderRef}
                        className="flex gap-4 overflow-x-auto scroll-smooth px-12 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      >
                        {myPods.map((pod) => (
                          <button
                            key={pod.id}
                            type="button"
                            onClick={() => setSelectedPodId(pod.id)}
                            className={`min-h-28 w-[20rem] shrink-0 rounded-2xl border p-4 text-left transition-all sm:w-[23rem] ${
                              selectedPodId === pod.id
                                ? 'border-[#d8b4fe]/70 bg-[#7c4bb2]/70 shadow-lg shadow-purple-950/30'
                                : 'border-[#b98cff]/35 bg-[#4c2f78]/70 hover:border-[#d8b4fe]/60 hover:bg-[#67409c]/72'
                            }`}
                          >
                            <div className="min-w-0">
                              <h3 className="min-w-0 truncate text-3xl font-bold leading-tight text-yellow-300">
                                {pod.name}
                              </h3>
                              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                                <Badge variant="outline">{getPodTypeMeta(pod.type).label}</Badge>
                                <Badge variant={pod.visibility === 'community' ? 'secondary' : 'outline'}>
                                  {pod.visibility === 'community' ? 'Community' : 'Private'}
                                </Badge>
                              </div>
                            </div>

                            <p className="mt-2 text-sm text-muted-foreground">
                              {pod.visibility === 'community'
                                ? 'Matched with solo players by the app.'
                                : `Created by ${pod.curatorName}`}
                            </p>
                          </button>
                        ))}
                      </div>

                      {myPods.length > 2 ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => scrollQuickview('right')}
                          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/90 shadow-lg"
                          aria-label="Scroll pods right"
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-purple-200/30 bg-purple-950/20 p-8 text-center">
                      <p className="font-semibold text-foreground">No pods yet</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Use the create or join flow above to get your first pod onto this dashboard.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>







                  












          {feedback ? (
            <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
              {feedback}
            </div>
          ) : null}

          {/* <section className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]"> */}



          <section className="flex flex-col gap-8 w-full">

            <div className="space-y-8">


          <div className="space-y-8">
              {selectedPod ? (
              <Card className="!border-[#d8b4fe]/55 !bg-[#6f42a5]/72 shadow-2xl shadow-purple-950/35 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {selectedPod ? selectedPod.name : 'Select a pod'}
                  </CardTitle>
                  <CardDescription>
                    {selectedPod
                      ? `Everything for this ${getPodTypeMeta(selectedPod.type).label.toLowerCase()} pod lives here.`
                      : 'Choose one of your pods to view its full information.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedPod ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{getPodTypeMeta(selectedPod.type).label}</Badge>
                        <Badge variant={selectedPod.visibility === 'community' ? 'secondary' : 'outline'}>
                          {selectedPod.visibility === 'community' ? 'Community pod' : 'Private pod'}
                        </Badge>
                        {isCurator ? <Badge>You are the curator</Badge> : null}
                        <Button asChild className="ml-auto">
                          <Link href={`/leaderboard?podId=${encodeURIComponent(selectedPod.id)}`}>
                            View leaderboard
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <PodStatCard
                          title="Pod total points"
                          value={String(selectedPod.stats.totalPoints)}
                          subtitle="Combined score for all members"
                          icon={<Trophy className="size-5" />}
                        />
                        <PodStatCard
                          title="Your accuracy"
                          value={`${selectedPod.stats.accuracy}%`}
                          subtitle="Prediction hit rate"
                          icon={<Percent className="size-5" />}
                        />
                        <PodStatCard
                          title="Your current rank"
                          value={`#${selectedPod.stats.currentRank}`}
                          subtitle={`Trend: ${selectedPod.stats.trend}`}
                          icon={<Sparkles className="size-5" />}
                        />
                        <PodStatCard
                          title="Members"
                          value={String(selectedPod.members.length)}
                          subtitle={`${selectedPod.stats.wins} wins logged`}
                          icon={<Users className="size-5" />}
                        />
                      </div>

                      <div className="rounded-2xl border border-purple-200/30 bg-purple-950/22 p-4">
                        <p className="text-sm text-muted-foreground">Created {formatDate(selectedPod.createdAt)}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-semibold text-foreground">Members</h3>
                          <Badge variant="outline">{selectedPod.members.length} total</Badge>
                        </div>

                        {selectedPod.members.map((member) => (
                          <div
                            key={`${selectedPod.id}-${member.userId}`}
                            className="flex items-center justify-between rounded-2xl border border-purple-200/30 bg-purple-950/22 p-4"
                          >
                            <div>
                              <p className="font-medium text-foreground">{member.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedPod.visibility === 'community' ? 'Username visible to pod only' : member.email}
                              </p>
                            </div>
                            <Badge variant={member.role === 'curator' ? 'default' : 'outline'}>
                              {member.role}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      {selectedPod.visibility === 'private' ? (
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-foreground">Invitations</h3>
                          {selectedPod.invites.length ? (
                            selectedPod.invites.map((invite) => (
                              <div
                                key={invite.id}
                                className="flex items-center justify-between rounded-2xl border border-purple-200/30 bg-purple-950/22 p-4"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                    {invite.channel === 'email' ? <Mail className="size-4" /> : <Phone className="size-4" />}
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{invite.value}</p>
                                    <p className="text-sm text-muted-foreground">Invite pending</p>
                                  </div>
                                </div>
                                <Badge variant="outline">{invite.channel}</Badge>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-purple-200/35 bg-purple-950/22 p-4 text-sm text-purple-100/78">
                              No pending invitations in this pod.
                            </div>
                          )}
                        </div>
                      ) : null}

                      {isCurator && selectedPod.visibility === 'private' ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-foreground">Requests to join</h3>
                            <Badge variant="outline">{pendingRequests.length} pending</Badge>
                          </div>

                          {pendingRequests.length ? (
                            pendingRequests.map((request) => (
                              <div
                                key={request.id}
                                className="rounded-2xl border border-purple-200/30 bg-purple-950/22 p-4"
                              >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                  <div>
                                    <p className="font-medium text-foreground">{request.name}</p>
                                    <p className="text-sm text-muted-foreground">{request.email}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                      Requested {formatDate(request.requestedAt)}
                                    </p>
                                    {request.note ? (
                                      <p className="mt-2 text-sm text-foreground/80">{request.note}</p>
                                    ) : null}
                                  </div>
                                  <Button onClick={() => handleApproveRequest(selectedPod.id, request.id)}>
                                    <CheckCircle2 className="size-4" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-purple-200/35 bg-purple-950/22 p-4 text-sm text-purple-100/78">
                              Nobody is waiting for approval right now.
                            </div>
                          )}
                        </div>
                      ) : null}

                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-purple-200/35 bg-purple-950/22 p-8 text-center">
                      <p className="font-semibold text-foreground">No pod selected</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Once you create or join a pod, you can click it from the list and see all its stats here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              ) : null}

              <Dialog open={isPodFlowOpen} onOpenChange={setIsPodFlowOpen}>
                <DialogContent
                  showCloseButton={false}
                  className="pod-flow-dialog max-h-[90vh] overflow-y-auto border-border/60 bg-card/95 sm:max-w-4xl"
                >
                  <DialogHeader>
                    <DialogTitle className="text-2xl">
                      {selectedAction === 'join' ? 'Join a pod' : 'Create a pod'}
                    </DialogTitle>
                    <DialogDescription>
                      Choose a pod type, then complete the details inside that tab.
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs
                    value={selectedType ?? podTypes[0].value}
                    onValueChange={(value) => {
                      setSelectedType(value as PodType);
                      resetFlowFeedback();
                    }}
                    className="gap-5"
                  >
                    <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-purple-950/25 p-2 sm:grid-cols-3">
                      {podTypes.map(({ value, meta }) => (
                        <TabsTrigger
                          key={value}
                          value={value}
                          className="min-h-12 justify-start px-4 py-3 text-left data-[state=active]:border-primary data-[state=active]:bg-primary/10"
                        >
                          {meta.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {podTypes.map(({ value, meta }) => (
                      <TabsContent key={value} value={value} className="mt-0">
                        <div className="space-y-5 rounded-2xl border border-purple-200/25 bg-purple-950/20 p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold text-foreground">{meta.label}</h3>
                                {meta.communityEnabled ? <Badge variant="secondary">Community</Badge> : null}
                              </div>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">{meta.shortDescription}</p>
                            </div>
                            <Badge variant="outline">{selectedAction === 'join' ? 'Join flow' : 'Create flow'}</Badge>
                          </div>

                          {selectedAction === 'join' ? (
                            <div className="space-y-5 rounded-2xl border border-purple-200/25 bg-[#4c2f78]/45 p-5">
                              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-foreground">Join a {meta.label.toLowerCase()} pod</h3>
                                  <p className="text-sm text-muted-foreground">
                                    Search by pod name or curator email, then request to join and wait for approval.
                                  </p>
                                </div>
                                {meta.communityEnabled ? (
                                  <Button variant="secondary" onClick={handleJoinCommunity}>
                                    <Sparkles className="size-4" />
                                    Join community pod
                                  </Button>
                                ) : (
                                  <Badge variant="outline">Community pods not available for draft</Badge>
                                )}
                              </div>
                              <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
                                <div>
                                  <label className="mb-2 block text-sm font-medium text-foreground">Search pods</label>
                                  <Input
                                    value={joinQuery}
                                    onChange={(event) => setJoinQuery(event.target.value)}
                                    placeholder="Search by curator email or pod name"
                                  />
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-medium text-foreground">Optional message</label>
                                  <Input
                                    value={joinMessage}
                                    onChange={(event) => setJoinMessage(event.target.value)}
                                    placeholder="Hi, I'd love to join this pod."
                                  />
                                </div>
                              </div>

                              {meta.communityEnabled ? (
                                <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="rounded-xl bg-secondary/20 p-2 text-secondary">
                                      <Users className="size-5" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-foreground">Community pods</p>
                                      <p className="text-sm text-muted-foreground">
                                        The app matches solo players together instantly. No approval is needed and other members only see usernames, not email addresses.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : null}

                              <div className="space-y-3">
                                {podSearchResults.length ? (
                                  podSearchResults.map((pod) => {
                                    const myRequest = pod.joinRequests.find(
                                      (request) => request.userId === user.id && request.status === 'pending'
                                    );

                                    return (
                                      <div
                                        key={pod.id}
                                        className="rounded-2xl border border-[#b98cff]/35 bg-[#4c2f78]/68 p-4 shadow-sm shadow-purple-950/25"
                                      >
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                          <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                              <h4 className="font-semibold text-foreground">{pod.name}</h4>
                                              <Badge variant="outline">{getPodTypeMeta(pod.type).label}</Badge>
                                            </div>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                              Curator: {pod.curatorName} ({pod.curatorEmail})
                                            </p>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                              {pod.members.length} member{pod.members.length === 1 ? '' : 's'} - {pod.stats.totalPoints} pts - {pod.stats.accuracy}% accuracy
                                            </p>
                                          </div>

                                          <Button
                                            onClick={() => handleRequestToJoin(pod.id)}
                                            disabled={!!myRequest}
                                          >
                                            {myRequest ? 'Request sent' : 'Request to join'}
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="rounded-2xl border border-dashed border-purple-200/30 bg-purple-950/20 p-6 text-sm text-purple-100/75">
                                    No matching private pods yet. You can search by curator email or pod name, or use a community pod if this type supports it.
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-purple-200/25 bg-[#4c2f78]/45 p-5">
                              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-foreground">Create your {meta.label.toLowerCase()} pod</h3>
                                  <p className="text-sm text-muted-foreground">
                                    You will be the curator, and your email will be used so others can find and request this pod.
                                  </p>
                                </div>
                                <Badge variant="outline">Curator controls approvals</Badge>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                  <label className="mb-2 block text-sm font-medium text-foreground">Pod name</label>
                                  <Input
                                    value={createName}
                                    onChange={(event) => setCreateName(event.target.value)}
                                    placeholder="Example: Ballroom Besties"
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-medium text-foreground">Invite by email</label>
                                  <Textarea
                                    value={inviteEmails}
                                    onChange={(event) => setInviteEmails(event.target.value)}
                                    placeholder="one@example.com, two@example.com"
                                    className="min-h-24"
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-sm font-medium text-foreground">Invite by phone number</label>
                                  <Textarea
                                    value={invitePhones}
                                    onChange={(event) => setInvitePhones(event.target.value)}
                                    placeholder="+1 555 0101, +1 555 0102"
                                    className="min-h-24"
                                  />
                                </div>
                              </div>

                              <div className="mt-5 flex flex-wrap items-center gap-3">
                                <Button onClick={handleCreatePod}>
                                  Create pod
                                  <ArrowRight className="size-4" />
                                </Button>
                                <p className="text-sm text-muted-foreground">{meta.detailDescription}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </DialogContent>
              </Dialog>

              <Dialog
                open={activeSummaryModal === 'approvals'}
                onOpenChange={(open) => setActiveSummaryModal(open ? 'approvals' : null)}
              >
                <DialogContent className="max-h-[85vh] overflow-y-auto border-border/60 bg-card/95 sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Pending approvals</DialogTitle>
                    <DialogDescription>
                      Requests waiting for approval in pods you curate.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3">
                    {pendingApprovalItems.length ? (
                      pendingApprovalItems.map(({ pod, request }) => (
                        <div
                          key={`${pod.id}-${request.id}`}
                          className="rounded-2xl border border-purple-200/30 bg-purple-950/22 p-4"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-foreground">{request.name}</p>
                                <Badge variant="outline">{pod.name}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{request.email}</p>
                              <p className="mt-2 text-sm text-muted-foreground">
                                Requested {formatDate(request.requestedAt)}
                              </p>
                              {request.note ? (
                                <p className="mt-2 text-sm text-foreground/80">{request.note}</p>
                              ) : null}
                            </div>
                            <Button onClick={() => handleApproveRequest(pod.id, request.id)}>
                              <CheckCircle2 className="size-4" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-purple-200/30 bg-purple-950/20 p-4 text-sm text-purple-100/75">
                        Nobody is waiting for approval right now.
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog
                open={activeSummaryModal === 'invites'}
                onOpenChange={(open) => setActiveSummaryModal(open ? 'invites' : null)}
              >
                <DialogContent className="max-h-[85vh] overflow-y-auto border-border/60 bg-card/95 sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Pod Invites</DialogTitle>
                    <DialogDescription>
                      Pod invitations sent to your email.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3">
                    {invitedPods.length ? (
                      invitedPods.map((pod) => (
                        <div
                          key={pod.id}
                          className="rounded-2xl border border-purple-200/30 bg-purple-950/22 p-4"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-foreground">{pod.name}</p>
                                <Badge variant="outline">{getPodTypeMeta(pod.type).label}</Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Sent by {pod.curatorName} ({pod.curatorEmail})
                              </p>
                            </div>
                            <Button onClick={() => handleAcceptInvite(pod.id)}>
                              Accept invite
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-purple-200/30 bg-purple-950/20 p-4 text-sm text-purple-100/75">
                        You do not have any pod invites right now.
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

              {selectedPod ? (
                <>
                  <Button
                    type="button"
                    onClick={() => setIsActivityOpen(true)}
                    className="fixed bottom-6 right-6 z-50 size-14 rounded-full border border-purple-200/35 p-0 shadow-2xl shadow-purple-950/45"
                    aria-label="Open recent pod activity"
                  >
                    <Bell className="size-6" />
                    {selectedPod.activity.length ? (
                      <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {Math.min(selectedPod.activity.length, 3)}
                      </span>
                    ) : null}
                  </Button>

                  <Dialog open={isActivityOpen} onOpenChange={setIsActivityOpen}>
                    <DialogContent className="border-border/60 bg-card/95 sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Recent pod activity</DialogTitle>
                        <DialogDescription>
                          Latest notifications for {selectedPod.name}.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-3">
                        {selectedPod.activity.length ? (
                          selectedPod.activity.slice(0, 3).map((activity) => (
                            <div
                              key={activity.id}
                              className="rounded-2xl border border-purple-200/25 bg-purple-950/20 p-4"
                            >
                              <p className="font-medium text-foreground">{activity.text}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{formatDate(activity.timestamp)}</p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-purple-200/30 bg-purple-950/20 p-4 text-sm text-purple-100/75">
                            Activity will appear here as members join, invites go out, and requests are approved.
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              ) : null}





              {/* <Card className="border-border/60 bg-card/90">
                <CardHeader>
                  <CardTitle className="text-2xl">Create or join a pod</CardTitle>
                  <CardDescription>
                    First choose whether you want to create a pod or join one, then pick the pod type.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary">1</span>
                      Choose your path
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {([
                        {
                          value: 'create',
                          title: 'Create a pod',
                          description: 'Start a pod, become the curator, and invite people by phone number or email.',
                          icon: <Plus className="size-5" />,
                        },
                        {
                          value: 'join',
                          title: 'Join a pod',
                          description: 'Search by curator email or pod name, request access, or jump into a community pod.',
                          icon: <Search className="size-5" />,
                        },
                      ] as const).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSelectedAction(option.value);
                            setSelectedType(null);
                            resetFlowFeedback();
                          }}
                          className={`rounded-2xl border p-5 text-left transition-all ${
                            selectedAction === option.value
                              ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                              : 'border-border/60 bg-background/70 hover:border-primary/30 hover:bg-background'
                          }`}
                        >
                          <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-primary/15 p-3 text-primary">{option.icon}</div>
                            <div>
                              <h3 className="font-semibold text-foreground">{option.title}</h3>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedAction ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary">2</span>
                        Pick your pod type
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        {podTypes.map(({ value, meta }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => {
                              setSelectedType(value);
                              resetFlowFeedback();
                            }}
                            className={`rounded-2xl border p-5 text-left transition-all ${
                              selectedType === value
                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                                : 'border-border/60 bg-background/70 hover:border-primary/30 hover:bg-background'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-foreground">{meta.label}</h3>
                              {meta.communityEnabled ? <Badge variant="secondary">Community</Badge> : null}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{meta.shortDescription}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                      <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">Search pods</label>
                          <Input
                            value={joinQuery}
                            onChange={(event) => setJoinQuery(event.target.value)}
                            placeholder="Search by curator email or pod name"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">Optional message</label>
                          <Input
                            value={joinMessage}
                            onChange={(event) => setJoinMessage(event.target.value)}
                            placeholder="Hi, I’d love to join this pod."
                          />
                        </div>
                      </div>

                      {getPodTypeMeta(selectedType).communityEnabled ? (
                        <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
                          <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-secondary/20 p-2 text-secondary">
                              <Users className="size-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Community pods</p>
                              <p className="text-sm text-muted-foreground">
                                The app matches solo players together instantly. No approval is needed and other members only see usernames, not email addresses.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div className="space-y-3">
                        {podSearchResults.length ? (
                          podSearchResults.map((pod) => {
                            const myRequest = pod.joinRequests.find(
                              (request) => request.userId === user.id && request.status === 'pending'
                            );

                            return (
                              <div
                                key={pod.id}
                                className="rounded-2xl border border-[#b98cff]/35 bg-[#4c2f78]/68 p-4 shadow-sm shadow-purple-950/25"
                              >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-semibold text-foreground">{pod.name}</h4>
                                      <Badge variant="outline">{getPodTypeMeta(pod.type).label}</Badge>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      Curator: {pod.curatorName} ({pod.curatorEmail})
                                    </p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                      {pod.members.length} member{pod.members.length === 1 ? '' : 's'} • {pod.stats.totalPoints} pts • {pod.stats.accuracy}% accuracy
                                    </p>
                                  </div>

                                  <Button
                                    onClick={() => handleRequestToJoin(pod.id)}
                                    disabled={!!myRequest}
                                  >
                                    {myRequest ? 'Request sent' : 'Request to join'}
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="rounded-2xl border border-dashed border-purple-200/30 bg-purple-950/20 p-6 text-sm text-purple-100/75">
                            No matching private pods yet. You can search by curator email or pod name, or use a community pod if this type supports it.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card> */}

              {invitedPods.length ? (
                <Card className="border-purple-200/25 bg-[#2f2258]/82 shadow-lg shadow-purple-950/20">
                  <CardHeader>
                    <CardTitle className="text-2xl">Invitations waiting for you</CardTitle>
                    <CardDescription>
                      These invitations were sent to your email. You can join immediately.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {invitedPods.map((pod) => (
                      <div key={pod.id} className="rounded-2xl border border-[#b98cff]/35 bg-[#4c2f78]/68 p-4 shadow-sm shadow-purple-950/25">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-foreground">{pod.name}</h3>
                              <Badge variant="outline">{getPodTypeMeta(pod.type).label}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Sent by {pod.curatorName} ({pod.curatorEmail})
                            </p>
                          </div>
                          <Button onClick={() => handleAcceptInvite(pod.id)}>
                            Accept invite
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}

              
            </div>


                  {/* crate al league card remove */}



            {/* <div className="space-y-8">
              <Card className="border-border/60 bg-card/90">
                <CardHeader>
                  <CardTitle className="text-2xl">Create or join a pod</CardTitle>
                  <CardDescription>
                    First choose whether you want to create a pod or join one, then pick the pod type.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary">1</span>
                      Choose your path
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                      {([
                        {
                          value: 'create',
                          title: 'Create a pod',
                          description: 'Start a pod, become the curator, and invite people by phone number or email.',
                          icon: <Plus className="size-5" />,
                        },
                        {
                          value: 'join',
                          title: 'Join a pod',
                          description: 'Search by curator email or pod name, request access, or jump into a community pod.',
                          icon: <Search className="size-5" />,
                        },
                      ] as const).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            openPodFlow(option.value);
                          }}
                          className={`rounded-2xl border p-5 text-left transition-all ${
                            selectedAction === option.value
                              ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                              : 'border-border/60 bg-background/70 hover:border-primary/30 hover:bg-background'
                          }`}
                        >
                          <div className="flex min-h-28 items-center gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">{option.icon}</div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground">{option.title}</h3>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {false && selectedAction === 'join' && selectedType ? (
                    <div className="space-y-5 rounded-2xl border border-border/60 bg-background/60 p-5">
                      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Join a {getPodTypeMeta(selectedType!).label.toLowerCase()} pod</h3>
                          <p className="text-sm text-muted-foreground">
                            Search by pod name or curator email, then request to join and wait for approval.
                          </p>
                        </div>
                        {getPodTypeMeta(selectedType!).communityEnabled ? (
                          <Button variant="secondary" onClick={handleJoinCommunity}>
                            <Sparkles className="size-4" />
                            Join community pod
                          </Button>
                        ) : (
                          <Badge variant="outline">Community pods not available for draft</Badge>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">Search pods</label>
                          <Input
                            value={joinQuery}
                            onChange={(event) => setJoinQuery(event.target.value)}
                            placeholder="Search by curator email or pod name"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">Optional message</label>
                          <Input
                            value={joinMessage}
                            onChange={(event) => setJoinMessage(event.target.value)}
                            placeholder="Hi, I’d love to join this pod."
                          />
                        </div>
                      </div>

                      {getPodTypeMeta(selectedType!).communityEnabled ? (
                        <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
                          <div className="flex items-start gap-3">
                            <div className="rounded-xl bg-secondary/20 p-2 text-secondary">
                              <Users className="size-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Community pods</p>
                              <p className="text-sm text-muted-foreground">
                                The app matches solo players together instantly. No approval is needed and other members only see usernames, not email addresses.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div className="space-y-3">
                        {podSearchResults.length ? (
                          podSearchResults.map((pod) => {
                            const myRequest = pod.joinRequests.find(
                              (request) => request.userId === user!.id && request.status === 'pending'
                            );

                            return (
                              <div
                                key={pod.id}
                                className="rounded-2xl border border-[#b98cff]/35 bg-[#4c2f78]/68 p-4 shadow-sm shadow-purple-950/25"
                              >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-semibold text-foreground">{pod.name}</h4>
                                      <Badge variant="outline">{getPodTypeMeta(pod.type).label}</Badge>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      Curator: {pod.curatorName} ({pod.curatorEmail})
                                    </p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                      {pod.members.length} member{pod.members.length === 1 ? '' : 's'} • {pod.stats.totalPoints} pts • {pod.stats.accuracy}% accuracy
                                    </p>
                                  </div>

                                  <Button
                                    onClick={() => handleRequestToJoin(pod.id)}
                                    disabled={!!myRequest}
                                  >
                                    {myRequest ? 'Request sent' : 'Request to join'}
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-6 text-sm text-muted-foreground">
                            No matching private pods yet. You can search by curator email or pod name, or use a community pod if this type supports it.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div> */}







            {/* <div className="space-y-8">
              <Card className="border-border/60 bg-card/90">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {selectedPod ? selectedPod.name : 'Select a pod'}
                  </CardTitle>
                  <CardDescription>
                    {selectedPod
                      ? `Everything for this ${getPodTypeMeta(selectedPod.type).label.toLowerCase()} pod lives here.`
                      : 'Choose one of your pods to view its full information.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedPod ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{getPodTypeMeta(selectedPod.type).label}</Badge>
                        <Badge variant={selectedPod.visibility === 'community' ? 'secondary' : 'outline'}>
                          {selectedPod.visibility === 'community' ? 'Community pod' : 'Private pod'}
                        </Badge>
                        {isCurator ? <Badge>You are the curator</Badge> : null}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <PodStatCard
                          title="Total points"
                          value={String(selectedPod.stats.totalPoints)}
                          subtitle="Combined pod score"
                          icon={<Trophy className="size-5" />}
                        />
                        <PodStatCard
                          title="Accuracy"
                          value={`${selectedPod.stats.accuracy}%`}
                          subtitle="Prediction hit rate"
                          icon={<Percent className="size-5" />}
                        />
                        <PodStatCard
                          title="Current rank"
                          value={`#${selectedPod.stats.currentRank}`}
                          subtitle={`Trend: ${selectedPod.stats.trend}`}
                          icon={<Sparkles className="size-5" />}
                        />
                        <PodStatCard
                          title="Members"
                          value={String(selectedPod.members.length)}
                          subtitle={`${selectedPod.stats.wins} wins logged`}
                          icon={<Users className="size-5" />}
                        />
                      </div>

                      <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                        <p className="text-sm font-semibold text-foreground">Pod setup</p>
                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                          <p>
                            {selectedPod.visibility === 'community'
                              ? 'Community pods are assigned by the app. Members only see usernames and no curator approval is needed.'
                              : `Curator email: ${selectedPod.curatorEmail}. Players search by pod name or curator email, then wait for curator approval.`}
                          </p>
                          <p>Created {formatDate(selectedPod.createdAt)}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-lg font-semibold text-foreground">Members</h3>
                          <Badge variant="outline">{selectedPod.members.length} total</Badge>
                        </div>

                        {selectedPod.members.map((member) => (
                          <div
                            key={`${selectedPod.id}-${member.userId}`}
                            className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-4"
                          >
                            <div>
                              <p className="font-medium text-foreground">{member.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedPod.visibility === 'community' ? 'Username visible to pod only' : member.email}
                              </p>
                            </div>
                            <Badge variant={member.role === 'curator' ? 'default' : 'outline'}>
                              {member.role}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      {selectedPod.visibility === 'private' ? (
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-foreground">Invitations</h3>
                          {selectedPod.invites.length ? (
                            selectedPod.invites.map((invite) => (
                              <div
                                key={invite.id}
                                className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-4"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                    {invite.channel === 'email' ? <Mail className="size-4" /> : <Phone className="size-4" />}
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{invite.value}</p>
                                    <p className="text-sm text-muted-foreground">Invite pending</p>
                                  </div>
                                </div>
                                <Badge variant="outline">{invite.channel}</Badge>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
                              No pending invitations in this pod.
                            </div>
                          )}
                        </div>
                      ) : null}

                      {isCurator && selectedPod.visibility === 'private' ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-foreground">Requests to join</h3>
                            <Badge variant="outline">{pendingRequests.length} pending</Badge>
                          </div>

                          {pendingRequests.length ? (
                            pendingRequests.map((request) => (
                              <div
                                key={request.id}
                                className="rounded-2xl border border-border/60 bg-background/60 p-4"
                              >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                  <div>
                                    <p className="font-medium text-foreground">{request.name}</p>
                                    <p className="text-sm text-muted-foreground">{request.email}</p>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                      Requested {formatDate(request.requestedAt)}
                                    </p>
                                    {request.note ? (
                                      <p className="mt-2 text-sm text-foreground/80">{request.note}</p>
                                    ) : null}
                                  </div>
                                  <Button onClick={() => handleApproveRequest(selectedPod.id, request.id)}>
                                    <CheckCircle2 className="size-4" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
                              Nobody is waiting for approval right now.
                            </div>
                          )}
                        </div>
                      ) : null}

                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-foreground">Recent pod activity</h3>
                        {selectedPod.activity.length ? (
                          selectedPod.activity.map((activity) => (
                            <div
                              key={activity.id}
                              className="rounded-2xl border border-border/60 bg-background/60 p-4"
                            >
                              <p className="font-medium text-foreground">{activity.text}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{formatDate(activity.timestamp)}</p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
                            Activity will appear here as members join, invites go out, and requests are approved.
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 p-8 text-center">
                      <p className="font-semibold text-foreground">No pod selected</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Once you create or join a pod, you can click it from the list and see all its stats here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div> */}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon,
  onClick,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="mb-3 flex min-h-8 items-start justify-between gap-3">
        <span className="text-xs uppercase leading-4 tracking-[0.16em] text-white-100">{label}</span>
        <span className="shrink-0 text-primary">{icon}</span>
      </div>
      <p className="text-4xl text-center font-semibold text-foreground">{value}</p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      {content}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-purple-200/30 bg-purple-950/24 px-3 py-3">
      <p className="text-[10px] uppercase leading-4 tracking-normal text-purple-100/72">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function PodStatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-purple-200/32 bg-purple-950/24 p-4">
      <div className="mb-4 flex min-h-8 items-start justify-between gap-3">
        <p className="text-sm font-medium leading-5 text-purple-100/76">{title}</p>
        <span className="shrink-0 text-primary">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm leading-5 text-purple-100/72">{subtitle}</p>
    </div>
  );
}

function splitList(value: string): string[] {
  return value
    .split(/[\n,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
