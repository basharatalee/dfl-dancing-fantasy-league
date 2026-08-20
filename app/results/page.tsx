'use client';

import { useProtectedRoute } from '@/hooks/useAdminGuard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatCard from '@/components/StatCard';
import { Calendar, Award, TrendingUp } from 'lucide-react';

export default function Results() {
  const { isAuthenticated, isLoading } = useProtectedRoute();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
  const weeks = [
    { week: 8, date: 'May 22', aired: true, points: 2450, accuracy: 89, trend: 'up' },
    { week: 7, date: 'May 15', aired: true, points: 2180, accuracy: 76, trend: 'up' },
    { week: 6, date: 'May 8', aired: true, points: 1920, accuracy: 72, trend: 'down' },
    { week: 5, date: 'May 1', aired: true, points: 2050, accuracy: 81, trend: 'up' },
  ];

  const week8Results = [
    { rank: 1, dancer: 'Isabella Santos', score: 9.2, predict: 8.9, diff: 0.3, status: 'excellent' },
    { rank: 2, dancer: 'Zendaya Chen', score: 8.9, predict: 8.7, diff: 0.2, status: 'excellent' },
    { rank: 3, dancer: 'Sofia Rodriguez', score: 8.7, predict: 9.1, diff: -0.4, status: 'close' },
    { rank: 4, dancer: 'Olivia Brown', score: 8.6, predict: 8.4, diff: 0.2, status: 'excellent' },
    { rank: 5, dancer: 'Marcus Williams', score: 8.4, predict: 8.5, diff: -0.1, status: 'excellent' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-2">Results & History</h1>
            <p className="text-muted-foreground">Review past competitions and track your prediction accuracy</p>
          </div>

          {/* Season Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <StatCard
              title="Season Accuracy"
              value="82%"
              subtitle="8 weeks of predictions"
              highlight
              icon={<Award size={32} />}
            />
            <StatCard
              title="Best Week"
              value="Week 8"
              subtitle="89% accuracy, 2,450 points"
              icon={<TrendingUp size={32} />}
            />
            <StatCard
              title="Avg Points/Week"
              value="2,150"
              subtitle="Season total: 17,200"
              icon={<Award size={32} />}
            />
          </div>

          {/* Week Results */}
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-foreground">Week-by-Week Results</h2>

            {weeks.map((week) => (
              <div key={week.week} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Week {week.week}</h3>
                      <p className="text-muted-foreground text-sm">{week.date}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                      {week.aired ? 'Results In' : 'Upcoming'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-background rounded-lg p-4">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Points</p>
                      <p className="text-2xl font-bold text-primary">{week.points}</p>
                    </div>
                    <div className="bg-background rounded-lg p-4">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Accuracy</p>
                      <p className="text-2xl font-bold text-secondary">{week.accuracy}%</p>
                    </div>
                    <div className="bg-background rounded-lg p-4">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Trend</p>
                      <p className={`text-2xl font-bold ${week.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {week.trend === 'up' ? '↑' : '↓'} 8%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Results */}
          <div className="bg-card border border-border rounded-xl p-6 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Week 8 Detailed Results</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Rank</th>
                    <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Dancer</th>
                    <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Actual Score</th>
                    <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Your Prediction</th>
                    <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {week8Results.map((result) => (
                    <tr key={result.rank} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          result.rank === 1 ? 'bg-primary/20 text-primary' : 'bg-muted text-foreground'
                        }`}>
                          {result.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-foreground">{result.dancer}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="font-bold text-primary text-lg">{result.score}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <p className="font-semibold text-foreground">{result.predict}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm ${
                          result.status === 'excellent' 
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {result.status === 'excellent' ? '✓' : '±'}
                          {Math.abs(result.diff).toFixed(1)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Season Performance</h2>
            <div className="space-y-4">
              {weeks.map((week) => (
                <div key={week.week}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">Week {week.week}</span>
                    <span className="text-sm text-muted-foreground">{week.accuracy}% Accuracy</span>
                  </div>
                  <div className="h-3 bg-background rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        week.accuracy >= 85 
                          ? 'bg-gradient-to-r from-primary to-secondary'
                          : 'bg-gradient-to-r from-secondary to-primary'
                      }`}
                      style={{ width: `${week.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
