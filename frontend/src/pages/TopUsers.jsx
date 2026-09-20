// TopUsers.jsx — Leaderboard of the best-rated freelancers and clients.
// Two tabs (?tab=freelancers | clients), best-rated first, narrowed by the filters on the left:
// minimum star rating and a range on average price (freelancers) / average budget (clients).
// Only people with enough reviews are listed (the server decides; see min_reviews).
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TopUserCard from '../components/TopUserCard';
import { StarDisplay } from '../components/StarRating';
import { getTopUsers } from '../services/api';
import { formatPeso } from '../utils/ratings';

const PAGE_SIZE = 12;

const RATING_OPTIONS = [
  { value: 0, label: 'Any rating' },
  { value: 4.5, label: '4.5 & up' },
  { value: 4, label: '4.0 & up' },
  { value: 3.5, label: '3.5 & up' },
  { value: 3, label: '3.0 & up' },
];

// Returns `value`, but only after it has stopped changing for `delay` ms, so dragging the
// price slider doesn't fire a request on every pixel.
function useDebounced(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function TopUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'clients' ? 'clients' : 'freelancers';
  const role = tab === 'clients' ? 'customer' : 'freelancer';
  const isFreelancer = role === 'freelancer';

  const [minRating, setMinRating] = useState(0);
  // null = price filter off. Otherwise { min, max } chosen by the person.
  const [range, setRange] = useState(null);
  const [bounds, setBounds] = useState(null); // { min, max } across everyone listed, from the server
  const [filtersOpen, setFiltersOpen] = useState(false); // small screens only

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [minReviews, setMinReviews] = useState(3);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // The filters used by the most recent successful search, so "Load more" continues that same list.
  const paramsRef = useRef({ role });

  // Only send a price filter to the server when it actually narrows the range.
  const debouncedRange = useDebounced(range, 400);
  const apiMin = debouncedRange && bounds && debouncedRange.min > bounds.min ? debouncedRange.min : undefined;
  const apiMax = debouncedRange && bounds && debouncedRange.max < bounds.max ? debouncedRange.max : undefined;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const params = { role, minRating: minRating || undefined, minPrice: apiMin, maxPrice: apiMax };
      paramsRef.current = params;
      setLoading(true);
      setError(null);
      try {
        const res = await getTopUsers({ ...params, limit: PAGE_SIZE, offset: 0 });
        if (cancelled) return;
        setUsers(res.data.users);
        setTotal(res.data.total);
        setHasMore(res.data.has_more);
        setBounds(res.data.price_bounds);
        setMinReviews(res.data.min_reviews);
      } catch (err) {
        if (cancelled) return;
        setUsers([]);
        setError(err.message || 'Could not load the top users.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [role, minRating, apiMin, apiMax]);

  async function loadMore() {
    setLoadingMore(true);
    setError(null);
    try {
      const res = await getTopUsers({ ...paramsRef.current, limit: PAGE_SIZE, offset: users.length });
      setUsers((prev) => [...prev, ...res.data.users]);
      setTotal(res.data.total);
      setHasMore(res.data.has_more);
    } catch (err) {
      setError(err.message || 'Could not load more.');
    } finally {
      setLoadingMore(false);
    }
  }

  function changeTab(next) {
    if (next === tab) return;
    // Each tab is its own list with its own price scale, so start it fresh.
    setMinRating(0);
    setRange(null);
    setBounds(null);
    setUsers([]);
    setSearchParams(next === 'clients' ? { tab: 'clients' } : {});
  }

  function resetFilters() {
    setMinRating(0);
    setRange(null);
  }

  const filtersActive = minRating > 0 || apiMin !== undefined || apiMax !== undefined;
  const who = isFreelancer ? 'freelancers' : 'clients';

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />

      <div className="mx-auto flex max-w-[1400px] gap-6 px-5 py-6 md:px-8">
        <FiltersSidebar
          isFreelancer={isFreelancer}
          minRating={minRating}
          setMinRating={setMinRating}
          range={range}
          setRange={setRange}
          bounds={bounds}
          resetFilters={resetFilters}
          resultCount={total}
          who={who}
          open={filtersOpen}
        />

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">Top users</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Ranked by average rating. Only {who} with at least {minReviews} reviews are listed.
              </p>
            </div>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              className="shrink-0 rounded-md border border-border px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text md:hidden cursor-pointer"
            >
              Filters{filtersActive ? ' •' : ''}
            </button>
          </div>

          <div role="tablist" aria-label="User type" className="mb-6 flex gap-6 border-b border-border text-[15px]">
            {[
              { id: 'freelancers', label: 'Freelancers' },
              { id: 'clients', label: 'Clients' },
            ].map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => changeTab(t.id)}
                className={`-mb-px border-b-2 pb-3 transition-colors cursor-pointer ${
                  tab === t.id
                    ? 'border-accent font-semibold text-text'
                    : 'border-transparent text-text-secondary hover:text-text'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading && <StateCard title="Loading top users..." />}

          {!loading && error && users.length === 0 && (
            <StateCard
              title="Couldn't load the top users"
              body={error}
              action={{ label: 'Try again', onClick: () => window.location.reload() }}
            />
          )}

          {!loading && !error && users.length === 0 && (
            <StateCard
              title={filtersActive ? 'No one matches those filters' : `No top ${who} yet`}
              body={
                filtersActive
                  ? 'Try a lower minimum rating or a wider price range.'
                  : `${isFreelancer ? 'Freelancers' : 'Clients'} show up here once they've received at least ${minReviews} reviews.`
              }
              action={filtersActive ? { label: 'Reset filters', onClick: resetFilters } : undefined}
            />
          )}

          {!loading && users.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                {users.map((u, i) => (
                  <TopUserCard key={u.user_id} user={u} role={role} rank={i + 1} />
                ))}
              </div>

              {error && (
                <p role="alert" className="mt-4 text-center text-[13px] text-error">
                  {error}
                </p>
              )}

              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-text disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loadingMore ? 'Loading...' : `Load more (${total - users.length} left)`}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function FiltersSidebar({
  isFreelancer,
  minRating,
  setMinRating,
  range,
  setRange,
  bounds,
  resetFilters,
  resultCount,
  who,
  open,
}) {
  const priceLabel = isFreelancer ? 'Average price' : 'Average budget';
  const low = range ? range.min : bounds?.min;
  const high = range ? range.max : bounds?.max;

  return (
    <aside className={`${open ? 'block' : 'hidden'} w-full shrink-0 md:block md:w-[280px]`}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Filters</h2>
        <span className="text-[13px] text-text-secondary">
          {resultCount} {resultCount === 1 ? who.replace(/s$/, '') : who}
        </span>
      </div>

      <div className="mt-5 space-y-6">
        <fieldset>
          <legend className="mb-2 text-[13px] font-medium text-text-secondary">Star rating</legend>
          <div className="space-y-1.5">
            {RATING_OPTIONS.map((o) => (
              <label
                key={o.value}
                className={`flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-[13px] transition-colors ${
                  minRating === o.value
                    ? 'border-accent/60 bg-accent/10 text-text'
                    : 'border-border text-text-secondary hover:text-text'
                }`}
              >
                <input
                  type="radio"
                  name="min-rating"
                  checked={minRating === o.value}
                  onChange={() => setMinRating(o.value)}
                  className="h-4 w-4 cursor-pointer accent-[color:var(--color-accent)]"
                />
                {o.value > 0 && <StarDisplay value={o.value} className="h-3.5 w-3.5" />}
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[13px] font-medium text-text-secondary">{priceLabel}</span>
            {range && (
              <button
                onClick={() => setRange(null)}
                className="text-[13px] font-medium text-accent hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {bounds ? (
            <>
              <input
                type="range"
                aria-label={`Maximum ${priceLabel.toLowerCase()}`}
                min={bounds.min}
                max={bounds.max}
                value={Math.min(Math.max(high, bounds.min), bounds.max)}
                onChange={(e) => setRange({ min: low, max: Number(e.target.value) })}
                className="mb-3 h-1.5 w-full cursor-pointer accent-[color:var(--color-accent)]"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="mb-1 block text-[11px] text-text-secondary">From, ₱</span>
                  <input
                    type="number"
                    min={0}
                    value={low}
                    onChange={(e) => setRange({ min: Number(e.target.value) || 0, max: high })}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <span className="mb-1 block text-[11px] text-text-secondary">To, ₱</span>
                  <input
                    type="number"
                    min={0}
                    value={high}
                    onChange={(e) => setRange({ min: low, max: Number(e.target.value) || 0 })}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </div>
              </div>
              <p className="mt-2 font-sans text-[12px] text-text-secondary">
                Listed range: {formatPeso(bounds.min)} to {formatPeso(bounds.max)}
              </p>
            </>
          ) : (
            <p className="text-[12px] text-text-secondary">
              No {isFreelancer ? 'prices' : 'budgets'} to filter yet. They come from completed contracts.
            </p>
          )}
        </div>

        <button
          onClick={resetFilters}
          className="w-full rounded-md border border-border py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-text cursor-pointer"
        >
          Reset all
        </button>
      </div>
    </aside>
  );
}

function StateCard({ title, body, action }) {
  return (
    <div className="rounded-lg border border-border bg-panel p-10 text-center">
      <p className="font-display text-lg font-medium">{title}</p>
      {body && <p className="mt-1 text-sm text-text-secondary">{body}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
