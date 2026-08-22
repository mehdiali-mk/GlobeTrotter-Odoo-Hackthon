import { Link } from "@tanstack/react-router";
import { ButtonLink } from "../components/ui/Button";
import CityCard from "../components/CityCard";
import { useAppData } from "../context/AppDataContext";
import { heroImage } from "../utils/images";

// SCREEN 1 — Main home page. Public entry point of the platform.
export default function HomePage() {
  const data = useAppData();
  const featuredCities = data.cities.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-16">
          <div>
            <p className="eyebrow">Multi-city trip planning</p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl lg:text-[2.9rem]">
              Plan every stop, cost and day of your next journey
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground">
              GlobeTrotter brings destinations, itineraries, activities and shared budgets into a
              single calm workspace, so your whole travel group plans from the same page.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink to="/register" size="lg">
                Start planning a trip
              </ButtonLink>
              <ButtonLink to="/login" size="lg" variant="secondary">
                Sign in
              </ButtonLink>
            </div>

            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-6">
              <HeroStat label="Destinations" value={data.cities.length} />
              <HeroStat label="Activities" value={data.catalog.length} />
              <HeroStat label="Shared plans" value={data.getPublicTrips().length} />
            </dl>
          </div>

          <div className="panel overflow-hidden">
            <img
              src={heroImage}
              alt="Sunlit coastal city seen from the water"
              width={1600}
              height={900}
              className="h-64 w-full object-cover sm:h-80 lg:h-[26rem]"
            />
          </div>
        </section>

        <section className="border-y border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
            <h2 className="font-display text-2xl">Everything a trip needs</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Feature
                title="Build the route"
                detail="Add city stops with arrival and departure dates and keep the order tidy."
              />
              <Feature
                title="Fill the days"
                detail="Pick activities from the catalog or add your own with times and costs."
              />
              <Feature
                title="Watch the budget"
                detail="Track expenses per category and see who owes who across the group."
              />
              <Feature
                title="Travel together"
                detail="Invite members as editors or viewers and share plans with a join code."
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-2xl">Popular destinations</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A look at where GlobeTrotter travellers are heading.
              </p>
            </div>
            <ButtonLink to="/login" variant="secondary">
              Explore all
            </ButtonLink>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCities.map((city) => (
              <CityCard key={city._id} city={city} />
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-5 py-12 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-2xl">Ready to map out your trip?</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Create an account and your first itinerary takes minutes.
              </p>
            </div>
            <ButtonLink to="/register" size="lg">
              Create your account
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-5 py-8 text-sm text-muted-foreground sm:px-8">
        GlobeTrotter · Plan multi-city trips, budgets and activities in one place.
      </footer>
    </div>
  );
}

function HomeHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3.5 sm:px-8">
        <Link to="/" className="flex items-center">
          <img
            src="/globetrotter-logo.svg"
            alt="GlobeTrotter"
            className="h-14 w-36 object-contain"
          />
        </Link>

        <nav aria-label="Home navigation" className="ml-auto hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
            Features
          </a>
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Destinations
          </Link>
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Community
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ButtonLink to="/login" variant="secondary" size="sm">
            Login
          </ButtonLink>
          <ButtonLink to="/register" size="sm">
            Register
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

function HeroStat({ label, value }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 font-display text-xl">{value}</dd>
    </div>
  );
}

function Feature({ title, detail }) {
  return (
    <article className="panel p-4" id="features">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{detail}</p>
    </article>
  );
}
