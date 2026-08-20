'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Medal, Music2, Sparkles, Star } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

// Replace these presentation values with the latest show summary when the results API is available.
const weeklyHighlights = [
  {
    couple: 'Jordan & Riley',
    dance: 'Contemporary',
    score: '29 / 30',
    rank: 1,
    moment: 'A soaring lift and a powerful final pose earned the night’s top score.',
    accent: 'from-primary/25 via-primary/10 to-secondary/20',
  },
  {
    couple: 'Mia & Theo',
    dance: 'Argentine Tango',
    score: '28 / 30',
    rank: 2,
    moment: 'Their sharp footwork and dramatic storytelling brought the ballroom to its feet.',
    accent: 'from-secondary/30 via-secondary/10 to-primary/15',
  },
  {
    couple: 'Sofia & Lucas',
    dance: 'Viennese Waltz',
    score: '27 / 30',
    rank: 3,
    moment: 'Elegant turns and beautiful musicality made this a standout performance.',
    accent: 'from-primary/20 via-secondary/15 to-primary/10',
  },
];

export default function WeeklyHighlightsSlider() {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    const updateSelectedSlide = () => setSelectedIndex(api.selectedScrollSnap());
    updateSelectedSlide();
    api.on('select', updateSelectedSlide);
    api.on('reInit', updateSelectedSlide);

    return () => {
      api.off('select', updateSelectedSlide);
      api.off('reInit', updateSelectedSlide);
    };
  }, [api]);

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="weekly-highlights-title">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <div>
            <div className="mb-3 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles size={16} aria-hidden="true" />
              Most recent show
            </div>
            <h2 id="weekly-highlights-title" className="text-3xl font-bold text-foreground sm:text-4xl">
              Weekly Highlights
            </h2>
            <p className="mt-2 text-muted-foreground">
              Relive the dances, judges&apos; scores, and leaderboard moves from last week.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/60 bg-background/90 text-primary shadow-lg transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:size-12"
            aria-label="Previous highlight"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>

          <Carousel setApi={setApi} opts={{ loop: true }} className="min-w-0 flex-1">
            <CarouselContent className="-ml-0">
              {weeklyHighlights.map((highlight) => (
                <CarouselItem key={highlight.couple} className="pl-0">
                  <article className={`overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${highlight.accent} p-1 shadow-xl shadow-black/10`}>
                    <div className="grid gap-8 rounded-[0.9rem] bg-card/90 p-6 backdrop-blur-sm md:grid-cols-[1.1fr_1.4fr] md:p-9">
                      <div className="flex min-h-52 flex-col justify-between rounded-xl border border-primary/25 bg-background/45 p-6">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Featured couple</p>
                          <h3 className="mt-3 text-3xl font-bold text-foreground">{highlight.couple}</h3>
                          <div className="mt-6 flex items-center gap-3 text-secondary">
                            {/* <Music2 size={21} aria-hidden="true" /> */}

                            {/* here sparkels */}
                            
                            <Sparkles size={21} aria-hidden="true" />
                            <span className="font-semibold text-foreground">{highlight.dance}</span>
                          </div>
                        </div>
                        <div className="mt-8 flex items-end justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Judges&apos; score</p>
                            <p className="mt-1 text-3xl font-bold text-primary">{highlight.score}</p>
                          </div>
                          <Star className="fill-primary text-primary" size={32} aria-hidden="true" />
                        </div>
                      </div>

                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-primary">
                          <Medal size={20} aria-hidden="true" />
                          <span className="font-bold">#{highlight.rank} on the overall leaderboard</span>
                        </div>
                        <p className="mt-5 text-2xl font-semibold leading-relaxed text-foreground sm:text-3xl">
                          “{highlight.moment}”
                        </p>
                        {/* <p className="mt-5 text-sm text-muted-foreground">
                          Weekly performance recap · Scores and rankings from the latest show
                        </p> */}
                      </div>
                    </div>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <button
            type="button"
            onClick={() => api?.scrollNext()}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/60 bg-background/90 text-primary shadow-lg transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:size-12"
            aria-label="Next highlight"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-2" aria-label="Choose a weekly highlight">
          {weeklyHighlights.map((highlight, index) => (
            <button
              key={highlight.couple}
              type="button"
              onClick={() => api?.scrollTo(index)}
              className={`h-2.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${selectedIndex === index ? 'w-8 bg-primary' : 'w-2.5 bg-muted-foreground/45 hover:bg-muted-foreground'}`}
              aria-label={`Show highlight for ${highlight.couple}`}
              aria-current={selectedIndex === index ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
