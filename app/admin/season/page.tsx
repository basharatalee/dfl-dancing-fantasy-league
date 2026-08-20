'use client';

import { useState } from 'react';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SeasonStatus } from '@/lib/types';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

export default function SeasonManagementPage() {
  const { isAdmin, isLoading } = useAdminGuard();
  const [seasonStatus, setSeasonStatus] = useState<SeasonStatus>('live');
  const [currentWeek, setCurrentWeek] = useState(4);
  const [totalWeeks, setTotalWeeks] = useState(10);
  const [predictionDeadline, setPredictionDeadline] = useState('20:00');
  const [resultsDeadline, setResultsDeadline] = useState('22:00');
  const [finalists, setFinalists] = useState(3);
  const [seasonYear, setSeasonYear] = useState(2024);
  const [changes, setChanges] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleSaveChanges = async () => {
    // TODO: Call API endpoint
    // await fetch('/api/admin/season', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     status: seasonStatus,
    //     currentWeek,
    //     totalWeeks,
    //     predictionDeadline,
    //     resultsDeadline,
    //     finalists,
    //   }),
    // });

    setChanges(false);
    alert('Season settings updated!');
  };

  const statusColor: Record<SeasonStatus, string> = {
    preseason: 'bg-blue-500/20 text-blue-400',
    live: 'bg-secondary/20 text-secondary',
    postseason: 'bg-primary/20 text-primary',
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">Season Management</h1>
            <p className="text-muted-foreground mt-1">Control season lifecycle and settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Season Status */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Season Status</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Current Status
                    </label>
                    <div className="flex gap-2">
                      {(['preseason', 'live', 'postseason'] as const).map(status => (
                        <button
                          key={status}
                          onClick={() => {
                            setSeasonStatus(status);
                            setChanges(true);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                            seasonStatus === status
                              ? statusColor[status]
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Season Year
                      </label>
                      <Input
                        type="number"
                        value={seasonYear}
                        onChange={(e) => {
                          setSeasonYear(parseInt(e.target.value) || 2024);
                          setChanges(true);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Current Week
                      </label>
                      <Input
                        type="number"
                        value={currentWeek}
                        onChange={(e) => {
                          setCurrentWeek(parseInt(e.target.value) || 1);
                          setChanges(true);
                        }}
                        min="1"
                        max={totalWeeks}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Total Weeks in Season
                    </label>
                    <Input
                      type="number"
                      value={totalWeeks}
                      onChange={(e) => {
                        setTotalWeeks(parseInt(e.target.value) || 10);
                        setChanges(true);
                      }}
                      min="5"
                      max="26"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Number of Finalists
                    </label>
                    <Input
                      type="number"
                      value={finalists}
                      onChange={(e) => {
                        setFinalists(parseInt(e.target.value) || 3);
                        setChanges(true);
                      }}
                      min="2"
                      max="10"
                    />
                  </div>
                </div>
              </Card>

              {/* Deadlines */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Prediction Deadlines</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Prediction Deadline (Tuesday Evening)
                    </label>
                    <Input
                      type="time"
                      value={predictionDeadline}
                      onChange={(e) => {
                        setPredictionDeadline(e.target.value);
                        setChanges(true);
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Users must submit predictions before this time on Tuesday
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Results Submission Deadline
                    </label>
                    <Input
                      type="time"
                      value={resultsDeadline}
                      onChange={(e) => {
                        setResultsDeadline(e.target.value);
                        setChanges(true);
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Admin must submit results before this time
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-secondary/10 border border-secondary/30 rounded-lg text-sm">
                  <p className="text-foreground font-medium">📅 Tuesday Night Competition</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Predictions deadline: <strong>{predictionDeadline} EST</strong><br />
                    Results deadline: <strong>{resultsDeadline} EST</strong>
                  </p>
                </div>
              </Card>

              {/* Save Changes */}
              {changes && (
                <Card className="p-4 bg-primary/10 border border-primary/30 flex items-center justify-between">
                  <p className="text-sm text-foreground">You have unsaved changes</p>
                  <Button onClick={handleSaveChanges} className="text-xs">
                    Save Changes
                  </Button>
                </Card>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Season Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-muted-foreground">Completion</p>
                      <p className="text-lg font-bold text-primary">
                        {Math.round((currentWeek / totalWeeks) * 100)}%
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(currentWeek / totalWeeks) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Week {currentWeek} of {totalWeeks}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Season</p>
                    <p className="font-medium text-foreground">{seasonYear}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium text-foreground capitalize">{seasonStatus}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Finalists</p>
                    <p className="font-medium text-foreground">{finalists} dancers</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-secondary/10 border border-secondary/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Tuesday Competition</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All times set for Tuesday night live competition window
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Warning */}
          {seasonStatus === 'postseason' && (
            <Card className="mt-8 p-4 bg-destructive/10 border border-destructive/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive">Postseason Active</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Users cannot submit new predictions in postseason. Consider changing to &apos;preseason&apos; to prepare for the next season.
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
