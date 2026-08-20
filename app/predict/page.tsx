'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CONTESTANTS, DEFAULT_SEASON } from '@/lib/mock-data';
import { getDeadlineInfo, formatTimeRemaining } from '@/lib/deadline-utils';
import { Calendar, AlertCircle, CheckCircle, Lock, Clock } from 'lucide-react';

export default function PredictPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [top3, setTop3] = useState<number[]>([]);
  const [bottom3, setBottom3] = useState<number[]>([]);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [deadlineInfo, setDeadlineInfo] = useState(getDeadlineInfo(DEFAULT_SEASON.currentWeek, DEFAULT_SEASON));
  const [timeRemaining, setTimeRemaining] = useState(deadlineInfo.timeRemaining);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role === 'admin')) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Update deadline info and time remaining every second
  useEffect(() => {
    const interval = setInterval(() => {
      const info = getDeadlineInfo(DEFAULT_SEASON.currentWeek, DEFAULT_SEASON);
      setDeadlineInfo(info);
      setTimeRemaining(info.timeRemaining);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role === 'admin') {
    return null;
  }

  const activeContestants = CONTESTANTS.filter(c => !c.eliminated);

  const toggleTop3 = (id: number) => {
    if (top3.includes(id)) {
      setTop3(top3.filter(x => x !== id));
    } else if (top3.length < 3) {
      setTop3([...top3, id]);
    }
  };

  const toggleBottom3 = (id: number) => {
    if (bottom3.includes(id)) {
      setBottom3(bottom3.filter(x => x !== id));
    } else if (bottom3.length < 3) {
      setBottom3([...bottom3, id]);
    }
  };

  const toggleEliminated = (id: number) => {
    if (eliminated.includes(id)) {
      setEliminated(eliminated.filter(x => x !== id));
    } else {
      setEliminated([id]);
    }
  };

  const canSubmit = top3.length === 3 && bottom3.length === 3 && eliminated.length === 1;
  const isLocked = deadlineInfo.isLocked;

  const handleSubmit = () => {
    if (!canSubmit || isLocked) return;
    // TODO: Call API to submit predictions
    // const response = await fetch('/api/predictions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ week: DEFAULT_SEASON.currentWeek, top3, bottom3, eliminated, userId: user?.id }),
    // });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Make Your Predictions</h1>
            <p className="text-muted-foreground">Select top 3, bottom 3, and who will be eliminated this week</p>
          </div>

          {/* Status Alert */}
          <Card className={`mb-8 p-6 border-secondary/30 ${isLocked ? 'bg-destructive/5 border-destructive/30' : 'bg-secondary/5'}`}>
            <div className="flex items-between justify-between items-start">
              <div className="flex items-start gap-3">
                {isLocked ? (
                  <Lock className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-semibold ${isLocked ? 'text-destructive' : 'text-foreground'}`}>
                    Week {DEFAULT_SEASON.currentWeek} Predictions
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isLocked ? 'Predictions are locked' : deadlineInfo.message}
                  </p>
                </div>
              </div>
              {!isLocked && timeRemaining > 0 && (
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-secondary">
                    {formatTimeRemaining(timeRemaining)}
                  </div>
                  <div className="text-xs text-muted-foreground">time left</div>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Top 3 Predictions */}
            <Card className="p-6 border-secondary/30 bg-secondary/5">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold">
                  🏆
                </span>
                Top 3
              </h3>
              <div className="space-y-2">
                {activeContestants.map(contestant => (
                  <button
                    key={contestant.id}
                    onClick={() => toggleTop3(contestant.id)}
                    disabled={isLocked}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      top3.includes(contestant.id)
                        ? 'bg-secondary text-secondary-foreground font-semibold'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {contestant.name}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Selected: {top3.length}/3
              </div>
            </Card>

            {/* Bottom 3 Predictions */}
            <Card className="p-6 border-accent/30 bg-accent/5">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
                  ⬇️
                </span>
                Bottom 3
              </h3>
              <div className="space-y-2">
                {activeContestants.map(contestant => (
                  <button
                    key={contestant.id}
                    onClick={() => toggleBottom3(contestant.id)}
                    disabled={isLocked}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      bottom3.includes(contestant.id)
                        ? 'bg-accent text-accent-foreground font-semibold'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {contestant.name}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Selected: {bottom3.length}/3
              </div>
            </Card>

            {/* Elimination Prediction */}
            <Card className="p-6 border-destructive/30 bg-destructive/5">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">
                  ✕
                </span>
                Eliminated
              </h3>
              <div className="space-y-2">
                {activeContestants.map(contestant => (
                  <button
                    key={contestant.id}
                    onClick={() => toggleEliminated(contestant.id)}
                    disabled={isLocked}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      eliminated.includes(contestant.id)
                        ? 'bg-destructive text-destructive-foreground font-semibold'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {contestant.name}
                  </button>
                ))}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Selected: {eliminated.length}/1
              </div>
            </Card>
          </div>

          {submitted && (
            <Card className="mb-8 p-6 border-secondary/30 bg-secondary/5">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <div>
                  <h3 className="font-semibold text-secondary">Predictions Submitted!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your predictions are locked in. Good luck!
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isLocked || submitted}
              size="lg"
              className="px-8"
            >
              {submitted ? 'Submitted!' : `Submit Predictions (${top3.length + bottom3.length + eliminated.length}/7)`}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
