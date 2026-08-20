'use client';

import { useProtectedRoute } from '@/hooks/useAdminGuard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Star, Filter, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function Dancers() {
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const [filterStyle, setFilterStyle] = useState<string>('all');

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

  const dancers = [
    {
      id: 1,
      name: 'Isabella Santos',
      style: 'Salsa',
      avgScore: 9.2,
      seasonPoints: 1840,
      appearances: 8,
      status: 'hot',
      specialty: 'Latin Rhythms'
    },
    {
      id: 2,
      name: 'Zendaya Chen',
      style: 'Contemporary',
      avgScore: 8.9,
      seasonPoints: 1780,
      appearances: 8,
      status: 'consistent',
      specialty: 'Modern Expression'
    },
    {
      id: 3,
      name: 'Sofia Rodriguez',
      style: 'Latin',
      avgScore: 8.7,
      seasonPoints: 1740,
      appearances: 8,
      status: 'consistent',
      specialty: 'Partnered Styles'
    },
    {
      id: 4,
      name: 'Olivia Brown',
      style: 'Contemporary',
      avgScore: 8.6,
      seasonPoints: 1720,
      appearances: 8,
      status: 'consistent',
      specialty: 'Emotional Depth'
    },
    {
      id: 5,
      name: 'Marcus Williams',
      style: 'Hip-Hop',
      avgScore: 8.4,
      seasonPoints: 1680,
      appearances: 8,
      status: 'hot',
      specialty: 'Street Style'
    },
    {
      id: 6,
      name: 'Emma Sinclair',
      style: 'Ballroom',
      avgScore: 8.5,
      seasonPoints: 1700,
      appearances: 8,
      status: 'emerging',
      specialty: 'Elegance'
    },
    {
      id: 7,
      name: 'David Kim',
      style: 'Contemporary',
      avgScore: 8.1,
      seasonPoints: 1620,
      appearances: 7,
      status: 'emerging',
      specialty: 'Storytelling'
    },
    {
      id: 8,
      name: 'Lucas Martinez',
      style: 'Tango',
      avgScore: 8.3,
      seasonPoints: 1660,
      appearances: 8,
      status: 'consistent',
      specialty: 'Passion & Drama'
    },
    {
      id: 9,
      name: 'Ryan Jackson',
      style: 'Modern',
      avgScore: 8.0,
      seasonPoints: 1600,
      appearances: 8,
      status: 'rising',
      specialty: 'Innovation'
    },
  ];

  const styles = ['all', 'Contemporary', 'Latin', 'Salsa', 'Ballroom', 'Hip-Hop', 'Tango', 'Modern'];

  const filteredDancers = filterStyle === 'all' 
    ? dancers 
    : dancers.filter(d => d.style === filterStyle);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'hot': return 'bg-red-500/20 text-red-400';
      case 'consistent': return 'bg-blue-500/20 text-blue-400';
      case 'emerging': return 'bg-yellow-500/20 text-yellow-400';
      case 'rising': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'hot': return '🔥 Hot Streak';
      case 'consistent': return '⭐ Consistent';
      case 'emerging': return '📈 Emerging';
      case 'rising': return '🚀 Rising Star';
      default: return 'Active';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Star className="text-primary" size={32} />
              <h1 className="text-4xl font-bold text-foreground">All Dancers</h1>
            </div>
            <p className="text-muted-foreground">
              Explore all competing dancers and their performance stats
            </p>
          </div>

          {/* Filter */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Filter size={20} className="text-muted-foreground" />
              <span className="text-sm font-semibold text-muted-foreground">Filter by Style:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {styles.map((style) => (
                <button
                  key={style}
                  onClick={() => setFilterStyle(style)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                    filterStyle === style
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {style === 'all' ? 'All Styles' : style}
                </button>
              ))}
            </div>
          </div>

          {/* Dancers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredDancers.map((dancer) => (
              <div
                key={dancer.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/20 to-secondary/20 h-32 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30"></div>
                  <div className="absolute top-4 right-4">
                    <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${getStatusColor(dancer.status)}`}>
                      {getStatusLabel(dancer.status)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {dancer.name}
                  </h3>
                  <p className="text-primary text-sm font-semibold mt-1">{dancer.specialty}</p>

                  <div className="mt-4 space-y-3 border-t border-border/50 pt-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase mb-1">Avg Score</p>
                        <p className="text-2xl font-bold text-primary">{dancer.avgScore}</p>
                      </div>
                      <div className="bg-background rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase mb-1">Style</p>
                        <p className="font-semibold text-foreground">{dancer.style}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase mb-1">Points</p>
                        <p className="text-lg font-bold text-foreground">{dancer.seasonPoints}</p>
                      </div>
                      <div className="bg-background rounded-lg p-3">
                        <p className="text-xs text-muted-foreground uppercase mb-1">Appearances</p>
                        <p className="text-lg font-bold text-foreground">{dancer.appearances}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full mt-4 px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">Season Statistics</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Top Performers</h3>
                <div className="space-y-3">
                  {dancers.slice(0, 3).map((dancer, idx) => (
                    <div key={dancer.id} className="flex items-center justify-between">
                      <span className="text-sm">
                        <span className="font-semibold text-foreground">{dancer.name}</span>
                      </span>
                      <span className="text-primary font-bold">{dancer.avgScore}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Style Distribution</h3>
                <div className="space-y-2">
                  {['Contemporary', 'Latin', 'Ballroom', 'Modern'].map((style) => {
                    const count = dancers.filter(d => d.style === style).length;
                    return (
                      <div key={style} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{style}</span>
                        <span className="text-foreground font-semibold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Status Overview</h3>
                <div className="space-y-2">
                  {['hot', 'consistent', 'emerging', 'rising'].map((status) => {
                    const count = dancers.filter(d => d.status === status).length;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{getStatusLabel(status)}</span>
                        <span className="text-foreground font-semibold">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
