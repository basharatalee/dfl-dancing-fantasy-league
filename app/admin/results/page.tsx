'use client';

import { useState } from 'react';
import { useAdminGuard } from '@/hooks/useAdminGuard';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dancer, WeeklyResult, DancerPrediction } from '@/lib/types';
import { calculateFullScore, validateScoringData } from '@/lib/scoring-engine';
import { CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';

const mockDancers: Dancer[] = [
  { id: '1', name: 'Graceful Gliders', style: 'Contemporary', status: 'active', performance: 8.5 },
  { id: '2', name: 'Rhythmic Waves', style: 'Hip-Hop', status: 'active', performance: 7.8 },
  { id: '3', name: 'Dynamic Beats', style: 'Jazz', status: 'active', performance: 8.2 },
  { id: '4', name: 'Elegant Movers', style: 'Ballet', status: 'active', performance: 7.5 },
];

export default function ResultsAdminPage() {
  const { isAdmin, isLoading } = useAdminGuard();
  const [activeWeek, setActiveWeek] = useState(4);
  const [placements, setPlacements] = useState<DancerPrediction[]>(
    mockDancers.map((d, idx) => ({ dancerId: d.id, placement: idx + 1 }))
  );
  const [eliminations, setEliminations] = useState<string[]>(['3']);
  const [scoringResults, setScoringResults] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

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

  const handlePlacementChange = (dancerId: string, placement: number) => {
    setPlacements(
      placements.map(p =>
        p.dancerId === dancerId ? { ...p, placement } : p
      )
    );
  };

  const handleToggleElimination = (dancerId: string) => {
    setEliminations(
      eliminations.includes(dancerId)
        ? eliminations.filter(id => id !== dancerId)
        : [...eliminations, dancerId]
    );
  };

  const handleSubmitResults = () => {
    const result: WeeklyResult = {
      id: `result-${Date.now()}`,
      week: activeWeek,
      placements,
      eliminations,
      submittedAt: new Date().toISOString(),
      submittedBy: 'admin-1',
    };

    // Validate
    const validation = validateScoringData(placements, result);

    if (!validation.valid) {
      alert('Validation errors:\n' + validation.errors.join('\n'));
      return;
    }

    // TODO: Call API endpoint to submit results
    // await fetch('/api/admin/results', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(result),
    // });

    // Calculate scoring for demo
    const mockPredictions = placements;
    const scores = calculateFullScore(mockPredictions, result, placements.slice(0, 3).map(p => p.dancerId));

    setScoringResults(scores);
    setSubmitted(true);
  };

  const sortedDancers = [...mockDancers].sort(
    (a, b) => (placements.find(p => p.dancerId === a.id)?.placement || 999) -
              (placements.find(p => p.dancerId === b.id)?.placement || 999)
  );

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">Results & Scoring</h1>
            <p className="text-muted-foreground mt-1">Submit weekly results and calculate points</p>
          </div>

          {submitted && (
            <div className="mb-8 p-4 bg-secondary/10 border border-secondary/30 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Results Submitted Successfully</h3>
                <p className="text-sm text-muted-foreground mt-1">Week {activeWeek} scoring has been calculated and ledger updated.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Results Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Week {activeWeek} Results</h2>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(week => (
                      <button
                        key={week}
                        onClick={() => setActiveWeek(week)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeWeek === week
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        W{week}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground text-sm">Placements</h3>
                  <div className="space-y-3">
                    {sortedDancers.map((dancer) => {
                      const placement = placements.find(p => p.dancerId === dancer.id)?.placement || 0;
                      const isEliminated = eliminations.includes(dancer.id);

                      return (
                        <div
                          key={dancer.id}
                          className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border/50"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                            {placement}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{dancer.name}</p>
                            <p className="text-xs text-muted-foreground">{dancer.style}</p>
                          </div>
                          <input
                            type="number"
                            min="1"
                            max="26"
                            value={placement}
                            onChange={(e) => handlePlacementChange(dancer.id, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 bg-input border border-border rounded text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          <button
                            onClick={() => handleToggleElimination(dancer.id)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              isEliminated
                                ? 'bg-destructive/20 text-destructive'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            }`}
                          >
                            {isEliminated ? 'Elim.' : 'Active'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border flex gap-3">
                  <Button onClick={handleSubmitResults} className="flex-1 flex items-center justify-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Submit & Calculate Scores
                  </Button>
                </div>
              </Card>
            </div>

            {/* Scoring Summary */}
            <div>
              <Card className="p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">Scoring Summary</h2>

                {scoringResults ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/10 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Total Points Distributed</p>
                      <p className="text-2xl font-bold text-secondary">
                        {scoringResults.reduce((sum: number, s: any) => sum + s.totalPoints, 0)}
                      </p>
                    </div>

                    <div className="p-4 bg-accent/10 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Avg Accuracy</p>
                      <p className="text-2xl font-bold text-accent">
                        {Math.round(scoringResults.reduce((sum: number, s: any) => sum + s.accuracy, 0) / scoringResults.length)}%
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground">Scoring Breakdown</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {scoringResults.slice(0, 5).map((score: any, idx: number) => (
                          <div key={idx} className="text-xs flex justify-between text-muted-foreground">
                            <span>Contestant {idx + 1}</span>
                            <span className="font-medium text-foreground">+{score.totalPoints}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">Submit results to calculate scores</p>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Previous Results Table */}
          <Card className="mt-8 p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Previous Weeks</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-2 text-left text-muted-foreground">Week</th>
                    <th className="px-4 py-2 text-left text-muted-foreground">Date</th>
                    <th className="px-4 py-2 text-left text-muted-foreground">Eliminations</th>
                    <th className="px-4 py-2 text-left text-muted-foreground">Points Dist.</th>
                    <th className="px-4 py-2 text-left text-muted-foreground">Submitted By</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(week => (
                    <tr key={week} className="border-b border-border hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">Week {week}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(Date.now() - (4 - week) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs">{week === 2 ? '1 dancer' : week === 1 ? '2 dancers' : '0'}</td>
                      <td className="px-4 py-3 text-foreground font-medium">+{1230 - week * 100}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">Admin User</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
