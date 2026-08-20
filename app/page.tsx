'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatCard from '@/components/StatCard';
import WeeklyHighlightsSlider from '@/components/WeeklyHighlightsSlider';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Star, Zap, TrendingUp, Users, Trophy, Calendar } from 'lucide-react';

const easternTimeZone = 'America/New_York';

function getTimeZoneOffset(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );

  return asUtc - date.getTime();
}

function easternDateToUtc(year: number, month: number, day: number, hour: number) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour));
  return new Date(utcGuess.getTime() - getTimeZoneOffset(utcGuess, easternTimeZone));
}

function getNextTuesdayShowDate() {
  const now = new Date();

  for (let offset = 0; offset <= 7; offset += 1) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: easternTimeZone,
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(candidate);

    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    if (values.weekday !== 'Tue') continue;

    const showDate = easternDateToUtc(
      Number(values.year),
      Number(values.month),
      Number(values.day),
      20
    );

    if (showDate.getTime() > now.getTime()) {
      return showDate;
    }
  }

  const fallback = new Date(now);
  fallback.setDate(now.getDate() + 7);
  return fallback;
}

function formatCountdown(targetDate: Date, now: Date) {
  const diff = Math.max(0, targetDate.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return `${days}d ${hours}h ${minutes}m`;
}

function formatNextEventDate(targetDate: Date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: easternTimeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(targetDate);
}

export default function Home() {
  const [countdown, setCountdown] = useState('Loading...');
  const [nextEventDate, setNextEventDate] = useState('');
  // TODO: Replace this snapshot with the backend event summary API response.
  const homeEventSnapshot = {
    remainingCouples: 12,
    lastWeeksElimination: 'Alex & Emma',
    lastWeeksLeaderboardTop: 'Jordan & Riley',
  };

  useEffect(() => {
    const updateCountdown = () => {
      const nextShowDate = getNextTuesdayShowDate();
      setCountdown(formatCountdown(nextShowDate, new Date()));
      setNextEventDate(formatNextEventDate(nextShowDate));
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 60000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Content */}
            <div className="space-y-9 lg-mt-[100px]">
              {/* <div className="inline-block">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 w-fit">
                  <Star size={16} className="text-secondary" />
                  <span className="text-sm font-semibold text-secondary">The Ultimate Fantasy Experience</span>
                </div>
              </div> */}

              <h1 className="text-5xl sm:text-6xl font-bold text-balance leading-tight">
                <span className="text-primary">Every Tuesday Night</span>
                <span className="block text-foreground">Play in the Dancing League with your friends!</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg">
Watch your favorite couples dance each week and join in the fun with your very own fantasy dancing league! Create pods and play weekly with your friends, your colleagues or even your whole college campus!
Tuesdays nights can be even more fun when you're part of the competition!
</p>

              {/* Tuesday Night Highlight */}
              {/* <div className="my-8 max-w-lg">
               
                <h2 className="text-2xl font-bold text-foreground">Live Competition Heats Up</h2>
                <p className="text-muted-foreground mt-2">
                  New performances air every Tuesday night. Make your predictions, track scores in real-time, and compete for weekly and seasonal glory.
                </p>
              </div> */}





                <div className="my-8 max-w-lg">
               
                <h2 className="text-2xl font-bold text-foreground">Ready to play?!</h2>
                <p className="text-muted-foreground mt-2">
Join thousands of fantasy league enthusiasts competing every week. Build your team today, make predictions, track points and start earning points!</p>
              </div>




              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register" className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl hover:shadow-primary/20 text-center">
                  Join a League
                </Link>
                <Link href="/learn-more" className="px-8 py-3 rounded-lg border border-primary text-primary font-bold hover:bg-primary/10 transition-colors text-center">
                  Learn More
                </Link>
              </div>

              {/* <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <span>5,000+ Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-primary" />
                  <span>$50K+ Prizes</span>
                </div>
              </div> */}
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/30 to-primary/20 rounded-3xl blur-3xl opacity-50"></div>
              <div className="relative mx-auto flex min-h-[560px] w-full max-w-[360px] bg-gradient-to-br from-[#f2dcff]/30 via-secondary/20 to-[#8b5cf6]/20 border border-secondary/50 rounded-none px-8 pb-28 pt-14 shadow-2xl shadow-secondary/20 backdrop-blur-xl [clip-path:polygon(0_0,100%_0,100%_84%,50%_100%,0_84%)] lg:min-h-[760px] lg:pb-36">
                <div className="flex w-full flex-col items-center justify-start text-center">
                  <p className="text-xl font-bold leading-snug text-foreground">
                    The next show is
                  </p>
                  <h3 className="mt-2 text-3xl font-bold leading-tight text-primary">
                    {nextEventDate || 'Tuesday'}!
                  </h3>

                  <p className="mt-12 text-xl font-bold leading-snug text-foreground">
                    Count down to show
                  </p>
                  <p className="mt-3 whitespace-nowrap text-5xl font-bold leading-none text-primary sm:text-6xl">
                    {countdown}
                  </p>

                  <div className="mt-12 flex items-baseline justify-center gap-2">
                    <p className="text-xl font-bold leading-snug text-foreground">
                      Remaining couples:
                    </p>
                    <p className="text-xl font-bold leading-snug text-primary">
                      {homeEventSnapshot.remainingCouples}
                    </p>
                  </div>


                  <p className="mt-6 text-xl font-bold leading-snug text-foreground">
                    Last weeks elimination:
                  </p>
                  <p className="mt-2 text-xl font-bold leading-snug text-primary">
                    {homeEventSnapshot.lastWeeksElimination}
                  </p>
                  <p className="mt-8 text-xl font-bold leading-snug text-foreground">
                    Last weeks top of the leader board
                  </p>
                  <p className="mt-2 text-xl font-bold leading-snug text-primary">
                    {homeEventSnapshot.lastWeeksLeaderboardTop}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WeeklyHighlightsSlider />

      {/* How It Works */}
      {/* <section className="px-4 sm:px-6 lg:px-8 py-20 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to start your fantasy dancing journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: 1, title: 'Create Account', desc: 'Sign up and join your first league' },
              { num: 2, title: 'Draft Dancers', desc: 'Select your team of 5 professional dancers' },
              { num: 3, title: 'Make Predictions', desc: 'Predict performance scores before Tuesday shows' },
              { num: 4, title: 'Earn Points', desc: 'Score points based on actual performance' },
            ].map((step) => (
              <div key={step.num} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                <div className="relative bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border border-primary text-primary font-bold mb-4 text-lg">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}




























        {/* leaderboard */}

        <section className="px-4 sm:px-6 lg:px-8 py-20 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Top Teams This Season</h2>
            <Link href="/leaderboard" className="text-primary hover:text-primary/80 transition-colors font-semibold">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Rank</th>
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Team Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Owner</th>
                  <th className="text-right py-4 px-4 font-semibold text-muted-foreground">Points</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, team: 'Golden Stars', owner: 'Alex K.', points: 12450 },
                  { rank: 2, team: 'Purple Dreams', owner: 'Jordan M.', points: 12280 },
                  { rank: 3, team: 'Elite Movers', owner: 'Sam T.', points: 12150 },
                  { rank: 4, team: 'Rhythm Kings', owner: 'Casey L.', points: 11980 },
                  { rank: 5, team: 'Dance Masters', owner: 'Riley P.', points: 11850 },
                ].map((row) => (
                  <tr key={row.rank} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${row.rank === 1 ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-foreground">{row.team}</td>
                    <td className="py-4 px-4 text-muted-foreground">{row.owner}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-primary font-bold">{row.points.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>



























      {/* Stats */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">League Stats This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
            <StatCard title="Active Teams" value="2,847" highlight icon={<Users size={32} />} />
            <StatCard
              title="Points Earned This Week"
              value="2,450"
              subtitle="Your team's score"
              trend={{ value: 15, isPositive: true }}
              icon={<TrendingUp size={32} />}
            />
            <StatCard
              title="Next Competition"
              value="2 Days"
              subtitle="Tuesday 8 PM EST"
              icon={<Zap size={32} />}
            />
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      {/* <section className="px-4 sm:px-6 lg:px-8 py-20 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Top Teams This Season</h2>
            <Link href="/leaderboard" className="text-primary hover:text-primary/80 transition-colors font-semibold">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Rank</th>
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Team Name</th>
                  <th className="text-left py-4 px-4 font-semibold text-muted-foreground">Owner</th>
                  <th className="text-right py-4 px-4 font-semibold text-muted-foreground">Points</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, team: 'Golden Stars', owner: 'Alex K.', points: 12450 },
                  { rank: 2, team: 'Purple Dreams', owner: 'Jordan M.', points: 12280 },
                  { rank: 3, team: 'Elite Movers', owner: 'Sam T.', points: 12150 },
                  { rank: 4, team: 'Rhythm Kings', owner: 'Casey L.', points: 11980 },
                  { rank: 5, team: 'Dance Masters', owner: 'Riley P.', points: 11850 },
                ].map((row) => (
                  <tr key={row.rank} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${row.rank === 1 ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-foreground">{row.team}</td>
                    <td className="py-4 px-4 text-muted-foreground">{row.owner}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-primary font-bold">{row.points.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="px-4 sm:px-6 bg-muted/20 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">Ready to Dance?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of fantasy sports enthusiasts competing every Tuesday night. Build your team today and start earning points!
          </p>
          <Link href="/auth/register" className="inline-flex px-8 py-4 rounded-lg bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl hover:shadow-primary/30">
            Join the Fantasy Dancing League
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
