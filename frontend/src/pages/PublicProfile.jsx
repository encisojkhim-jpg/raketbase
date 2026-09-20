// PublicProfile.jsx — Read-only profile of any user, in one role, with their average rating and reviews.
// Route: /users/:id?role=freelancer|customer   (defaults to freelancer)
// Linked from proposal cards (freelancers), job pages (clients), and the Dashboard.
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RatingsPanel from '../components/RatingsPanel';
import AveragePriceCard from '../components/AveragePriceCard';
import { RatingBadge } from '../components/StarRating';
import { getUserReviews } from '../services/api';

export default function PublicProfile() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') === 'customer' ? 'customer' : 'freelancer';
  const isFreelancer = role === 'freelancer';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarBroken, setAvatarBroken] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setAvatarBroken(false);
      try {
        const res = await getUserReviews(id, role);
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load this profile.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, role]);

  const user = data?.user;
  // Portfolio URLs are typed in by users, so only ever link http(s) addresses.
  const portfolioHref = /^https?:\/\//i.test(user?.portfolio_url || '') ? user.portfolio_url : null;
  const name = user ? [user.first_name, user.last_name].filter(Boolean).join(' ') || 'RaketBase user' : '';
  const initial = name[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar showBack />
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        {loading && <p className="text-text-secondary">Loading profile...</p>}

        {!loading && error && (
          <div className="rounded-lg border border-border bg-panel p-10 text-center">
            <p className="font-display text-lg font-medium">Couldn't load this profile</p>
            <p className="mt-1 text-sm text-text-secondary">{error}</p>
          </div>
        )}

        {!loading && !error && user && (
          <>
            <div className="flex flex-col gap-6 rounded-lg border border-border bg-panel p-6 sm:flex-row sm:items-start">
              {/* Photo with the average price/budget card just below it */}
              <div className="flex shrink-0 flex-col items-center gap-4 sm:w-48">
              {user.avatar_url && !avatarBroken ? (
                <img
                  src={user.avatar_url}
                  alt={`${name}'s profile photo`}
                  onError={() => setAvatarBroken(true)}
                  className="h-28 w-28 shrink-0 rounded-full border border-border object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-accent font-display text-5xl font-semibold text-[#1A1305]"
                >
                  {initial}
                </div>
              )}
              {data.price && <AveragePriceCard role={role} price={data.price} className="w-full" />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-text-secondary">{isFreelancer ? 'Freelancer' : 'Client'}</p>
                <h1 className="break-words font-display text-3xl font-semibold tracking-tight">{name}</h1>
                {!isFreelancer && user.company_name && (
                  <p className="mt-0.5 text-sm text-text-secondary">{user.company_name}</p>
                )}
                <RatingBadge rating={data.summary} className="mt-2" />

                {user.bio && (
                  <p className="mt-4 whitespace-pre-line text-[14px] leading-relaxed text-text-secondary">{user.bio}</p>
                )}

                {isFreelancer && user.skills?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-accent/40 bg-accent/15 px-2.5 py-1 text-[12px] font-medium text-accent"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {isFreelancer && portfolioHref && (
                  <a
                    href={portfolioHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-[13px] font-medium text-accent hover:underline cursor-pointer"
                  >
                    View portfolio
                  </a>
                )}
              </div>
            </div>

            <RatingsPanel data={data} role={role} className="mt-10" />
          </>
        )}
      </div>
    </div>
  );
}
