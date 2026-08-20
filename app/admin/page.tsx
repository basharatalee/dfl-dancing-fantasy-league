'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AdminSidebar } from '@/components/AdminSidebar';
import StatCard from '@/components/StatCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Zap, Calendar, Trophy, AlertCircle, ArrowRight } from 'lucide-react';
import { DEFAULT_SEASON, CONTESTANTS, MOCK_RESULTS } from '@/lib/mock-data';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const activeContestants = CONTESTANTS.filter(c => !c.eliminated).length;
  const totalUsers = 125; // Mock value
  const completedWeeks = MOCK_RESULTS.length;

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground text-lg">Manage season, contestants, results, and scoring</p>
          </div>

          {/* Season Status Alert */}
          <Card className="mb-8 p-6 border-secondary/30 bg-secondary/5">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">Current Season: {DEFAULT_SEASON.name}</h3>
                <p className="text-muted-foreground mt-1">
                  Status: <span className="font-semibold text-secondary capitalize">{DEFAULT_SEASON.status}</span> • 
                  Week {DEFAULT_SEASON.currentWeek} of {DEFAULT_SEASON.totalWeeks} • 
                  Finalists: {DEFAULT_SEASON.finalistCount}
                </p>
              </div>
              <Link href="/admin/season">
                <Button variant="outline" size="sm">
                  Manage Season
                </Button>
              </Link>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Active Contestants"
              value={activeContestants.toString()}
              highlight={activeContestants <= 5}
              description={`of ${CONTESTANTS.length} total`}
            />
            <StatCard
              label="Total Users"
              value={totalUsers.toString()}
              description="Registered players"
            />
            <StatCard
              label="Weeks Completed"
              value={completedWeeks.toString()}
              description={`of ${DEFAULT_SEASON.totalWeeks}`}
            />
            <StatCard
              label="Scoring"
              value={MOCK_RESULTS[MOCK_RESULTS.length - 1]?.scoringCalculated ? 'Complete' : 'Pending'}
              highlight={!MOCK_RESULTS[MOCK_RESULTS.length - 1]?.scoringCalculated}
              description="Latest week status"
            />
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Contestant Management */}
            <Card className="p-6 border-border/50 hover:border-border transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Contestant Management
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Add, edit, or remove contestants</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {activeContestants} contestants remaining. {CONTESTANTS.filter(c => c.eliminated).length} eliminated.
                </p>
                <Link href="/admin/contestants">
                  <Button className="w-full" variant="outline">
                    <span>Manage Contestants</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Weekly Results */}
            <Card className="p-6 border-border/50 hover:border-border transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Zap className="w-5 h-5 text-secondary" />
                    Submit Results
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Upload placements and eliminations</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Week {DEFAULT_SEASON.currentWeek} results. Scoring available after submission.
                </p>
                <Link href="/admin/results">
                  <Button className="w-full" variant="outline">
                    <span>Submit Weekly Results</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Scoring Engine */}
            <Card className="p-6 border-border/50 hover:border-border transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    Scoring & Points
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Calculate and review scores</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Run scoring calculations and view points ledger.
                </p>
                <Link href="/admin/results">
                  <Button className="w-full" variant="outline">
                    <span>Run Scoring Engine</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Season Settings */}
            <Card className="p-6 border-border/50 hover:border-border transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Season Settings
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Configure rules and deadlines</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Manage season lifecycle and scoring rules.
                </p>
                <Link href="/admin/settings">
                  <Button className="w-full" variant="outline">
                    <span>Configure Settings</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6 border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-foreground">Week {DEFAULT_SEASON.currentWeek} results submitted</span>
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-foreground">Scoring calculation completed</span>
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-foreground">Contestant eliminated: Rylee Arnold & partner</span>
                <span className="text-xs text-muted-foreground">Yesterday</span>
              </div>
            </div>
          </Card>
        </div>

        <Footer />
      </main>
    </div>
  );
}
