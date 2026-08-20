import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function LearnMorePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 max-w-3xl">
            {/* <p className="mb-3 text-sm font-bold uppercase tracking-wide text-primary">How It Works</p>
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              Play in the Dancing League with your friends every Tuesday night.
            </h1> */}
             <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
             How it Works!
            </h1>
            {/* <p className="mt-5 text-lg text-muted-foreground">
              Create your account, join a league, make weekly predictions, and watch your points update as the live performances air.
            </p> */}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: 'Create or Join a League',
                desc: 'Sign up with a username, join your friends, and keep your team in one easy dashboard.',
                className: 'border-[#c77dff]/45 bg-gradient-to-br from-[#f2dcff]/24 via-[#c77dff]/14 to-card/70',
              },
              {
                title: 'Make Weekly Picks',
                desc: 'Choose your predictions before the Tuesday show starts so your lineup is ready for scoring.',
                className: 'border-[#a78bfa]/45 bg-gradient-to-br from-[#2f2258]/80 via-[#6d3fd1]/22 to-card/75',
              },
              {
                title: 'Follow Tuesday Night',
                desc: 'New performances air each Tuesday. Check the countdown on the home page to see when the next live show begins.',
                className: 'border-[#8b5cf6]/45 bg-gradient-to-br from-card/85 via-[#8b5cf6]/20 to-[#1d2045]/90',
              },
              {
                title: 'Track Points and Rank',
                desc: 'Your points earned this week and league rank show how your team compares against the rest of the league.',
                className: 'border-[#d8b4fe]/45 bg-gradient-to-br from-[#3d355d]/70 via-[#d8b4fe]/16 to-card/80',
              },
            ].map((item, index) => (
              <div key={item.title} className={`rounded-lg border p-6 ${item.className}`}>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                  {index + 1}
                </div>
                <h2 className="text-xl font-bold text-foreground">{item.title}</h2>
                <p className="mt-2 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link href="/auth/register" className="rounded-lg bg-primary px-8 py-3 text-center font-bold text-primary-foreground transition-colors hover:bg-primary/90">
              Join a League
            </Link>
            <Link href="/" className="rounded-lg border border-primary px-8 py-3 text-center font-bold text-primary transition-colors hover:bg-primary/10">
              Back Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
