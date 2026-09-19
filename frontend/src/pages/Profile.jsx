// Profile.jsx — Profile editor for both modes.
// The left card shows the profile photo with the person's name underneath; the form
// on the right depends on the active mode:
//   Freelancer mode: bio, skills, portfolio URL (shown to clients on proposal cards).
//   Client mode:     company name and "about you" (client_bio).
// Each mode has its own photo and bio. The photo uploads immediately when picked
// (separate from the "Save profile" button) and is stored in Supabase Storage via the backend.
import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { CloseIcon } from '../components/Icons';
import { getProfile, updateProfile, uploadAvatar, removeAvatar, getUserReviews } from '../services/api';
import RatingsPanel from '../components/RatingsPanel';
import { RatingBadge } from '../components/StarRating';
import { useCurrentUser, setCurrentUser } from '../utils/currentUser';
import { showToast } from '../utils/toast';
import { setUnsaved } from '../utils/unsavedChanges';

const BIO_MAX = 500;
const COMPANY_MAX = 100;
const UNSAVED_KEY = 'profile-editor';
const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // keep in sync with backend/src/middleware/upload.js
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function Profile() {
  const currentUser = useCurrentUser();
  const mode = currentUser.active_role === 'freelancer' ? 'freelancer' : 'customer';
  // Keyed by mode so switching Client <-> Freelancer remounts the editor, which reloads
  // that mode's photo and fields (and drops any half-edited state from the other mode).
  return <ProfileEditor key={mode} mode={mode} />;
}

function ProfileEditor({ mode }) {
  const isFreelancer = mode === 'freelancer';
  // users column holding this mode's photo (the server picks the same one on upload).
  const photoField = isFreelancer ? 'avatar_url' : 'client_avatar_url';
  const currentUser = useCurrentUser();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // `bio` holds the freelancer bio in Freelancer mode and the client bio in Client mode.
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Profile photo (saved instantly on upload — not part of the form's dirty state).
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [profileName, setProfileName] = useState('');
  // Ratings other people have given this user in the current mode (null until loaded).
  const [ratings, setRatings] = useState(null);
  const fileInputRef = useRef(null);

  // Snapshot of last-saved values, used to detect unsaved changes.
  const [saved, setSaved] = useState({ bio: '', skills: [], portfolioUrl: '', companyName: '' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        // Ratings are a bonus: if they fail to load the rest of the profile still shows.
        const [res, ratingsRes] = await Promise.all([
          getProfile(),
          currentUser.user_id
            ? getUserReviews(currentUser.user_id, isFreelancer ? 'freelancer' : 'customer').catch(() => null)
            : Promise.resolve(null),
        ]);
        const profile = res.data || {};
        if (cancelled) return;
        setRatings(ratingsRes?.data || null);
        const nextBio = (isFreelancer ? profile.bio : profile.client_bio) || '';
        const nextSkills = Array.isArray(profile.skills) ? profile.skills : [];
        const nextPortfolio = profile.portfolio_url || '';
        const nextCompany = profile.company_name || '';
        setBio(nextBio);
        setSkills(nextSkills);
        setPortfolioUrl(nextPortfolio);
        setCompanyName(nextCompany);
        setAvatarUrl((isFreelancer ? profile.avatar_url : profile.client_avatar_url) || '');
        setProfileName([profile.first_name, profile.last_name].filter(Boolean).join(' '));
        setSaved({
          bio: nextBio,
          skills: nextSkills,
          portfolioUrl: nextPortfolio,
          companyName: nextCompany,
        });
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Could not load your profile.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isFreelancer, currentUser.user_id]);

  // Only the fields shown for the current mode count toward "unsaved changes".
  const isDirty = isFreelancer
    ? bio !== saved.bio ||
      portfolioUrl !== saved.portfolioUrl ||
      JSON.stringify(skills) !== JSON.stringify(saved.skills)
    : bio !== saved.bio || companyName !== saved.companyName;

  useEffect(() => {
    setUnsaved(UNSAVED_KEY, isDirty);
    return () => setUnsaved(UNSAVED_KEY, false);
  }, [isDirty]);

  function addSkill(raw) {
    const value = raw.trim();
    if (!value) return;
    setSkills((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setSkillInput('');
  }

  function removeSkill(value) {
    setSkills((prev) => prev.filter((s) => s !== value));
  }

  function handleSkillKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === 'Backspace' && !skillInput && skills.length > 0) {
      // Quick-remove the last chip when backspacing on an empty input.
      setSkills((prev) => prev.slice(0, -1));
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    e.target.value = '';
    if (!file) return;

    setAvatarError('');
    if (!AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Please choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError('Image must be 2 MB or smaller.');
      return;
    }

    setAvatarBusy(true);
    try {
      const res = await uploadAvatar(file);
      const nextUrl = res.data?.avatar_url || '';
      setAvatarUrl(nextUrl);
      setAvatarBroken(false);
      // Keep the shared user (localStorage) in sync so the Navbar avatar updates immediately.
      // The server says which column it updated, so the right mode's photo is refreshed.
      setCurrentUser({ ...currentUser, [res.data?.field || photoField]: nextUrl });
      showToast('Profile photo updated');
    } catch (err) {
      setAvatarError(err.message || 'Could not upload your photo. Please try again.');
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarError('');
    setAvatarBusy(true);
    try {
      const res = await removeAvatar();
      setAvatarUrl('');
      setCurrentUser({ ...currentUser, [res.data?.field || photoField]: null });
      showToast('Profile photo removed');
    } catch (err) {
      setAvatarError(err.message || 'Could not remove your photo. Please try again.');
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (bio.length > BIO_MAX) {
      setSaveError(`${isFreelancer ? 'Bio' : 'About you'} must be ${BIO_MAX} characters or less.`);
      return;
    }
    if (!isFreelancer && companyName.length > COMPANY_MAX) {
      setSaveError(`Company name must be ${COMPANY_MAX} characters or less.`);
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      // Each mode only sends its own fields, so saving here never overwrites the other mode's data.
      const payload = isFreelancer
        ? { bio: bio.trim(), skills, portfolio_url: portfolioUrl.trim() }
        : { client_bio: bio.trim(), company_name: companyName.trim() };
      await updateProfile(payload);

      // Keep the shared user object (localStorage) in sync so the Navbar,
      // proposal-gate nudge, etc. all see the change immediately.
      setCurrentUser({ ...currentUser, ...payload });

      setSaved({
        bio: bio.trim(),
        skills,
        portfolioUrl: portfolioUrl.trim(),
        companyName: companyName.trim(),
      });
      showToast('Profile updated');
    } catch (err) {
      setSaveError(err.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const displayName =
    profileName ||
    [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') ||
    currentUser.email?.split('@')[0] ||
    (isFreelancer ? 'Freelancer' : 'Client');
  const initial = displayName[0]?.toUpperCase() || 'U';
  const showAvatarImage = Boolean(avatarUrl) && !avatarBroken;

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <div className="mx-auto max-w-4xl px-5 py-8 md:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Your profile</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {isFreelancer
            ? 'Clients see this on every proposal you send — a filled-out profile helps them say yes.'
            : 'Add a photo and a few details about you or your business. Your photo shows next to your job postings.'}
        </p>

        {loading && <p className="mt-8 text-text-secondary">Loading your profile...</p>}

        {!loading && loadError && (
          <div className="mt-8 rounded-lg border border-border bg-panel p-10 text-center">
            <p className="font-display text-lg font-medium">Couldn't load your profile</p>
            <p className="mt-1 text-sm text-text-secondary">{loadError}</p>
          </div>
        )}

        {!loading && !loadError && (
          <div className="mt-8 grid gap-6 md:grid-cols-[260px_1fr] md:items-start">
            {/* Left column: profile photo with the person's name underneath */}
            <aside className="rounded-lg border border-border bg-panel p-6 text-center md:sticky md:top-24">
              <div className="relative mx-auto h-40 w-40">
                {showAvatarImage ? (
                  <img
                    src={avatarUrl}
                    alt={`${displayName}'s profile photo`}
                    onError={() => setAvatarBroken(true)}
                    className="h-full w-full rounded-full border border-border object-cover"
                  />
                ) : (
                  <div
                    aria-label="No profile photo yet"
                    className="flex h-full w-full items-center justify-center rounded-full bg-accent font-display text-6xl font-semibold text-[#1A1305]"
                  >
                    {initial}
                  </div>
                )}
                {avatarBusy && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-bg/70 text-[12px] font-medium text-text">
                    Working...
                  </div>
                )}
              </div>

              <p className="mt-4 break-words font-display text-lg font-semibold">{displayName}</p>
              <p className="mt-0.5 text-[12px] uppercase tracking-wider text-text-secondary">
                {isFreelancer ? 'Freelancer profile' : 'Client profile'}
              </p>
              <RatingBadge rating={ratings?.summary} className="mt-2 justify-center" />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarBusy}
                  className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {showAvatarImage ? 'Change photo' : 'Upload photo'}
                </button>
                {showAvatarImage && (
                  <button
                    type="button"
                    onClick={handleAvatarRemove}
                    disabled={avatarBusy}
                    className="text-[13px] font-medium text-text-secondary transition-colors hover:text-error disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Remove photo
                  </button>
                )}
              </div>
              <p className="mt-3 text-[12px] text-text-secondary">JPG, PNG or WebP, up to 2 MB.</p>
              {avatarError && (
                <p role="alert" className="mt-2 text-[13px] text-error">
                  {avatarError}
                </p>
              )}
            </aside>

            {/* Right column: the profile form for the current mode */}
            <div className="space-y-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company name (client mode only) */}
              {!isFreelancer && (
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                    Company name <span className="font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    maxLength={COMPANY_MAX}
                    placeholder="e.g. Acme Studio"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
                  />
                </div>
              )}

              {/* Bio (freelancer bio, or "About you" for clients) */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[13px] font-medium text-text-secondary">
                    {isFreelancer ? 'Bio' : 'About you'}
                  </label>
                  <span
                    className={`text-[12px] ${bio.length > BIO_MAX ? 'text-error' : 'text-text-secondary'}`}
                  >
                    {bio.length}/{BIO_MAX}
                  </span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
                  placeholder={
                    isFreelancer
                      ? 'Tell clients what you do, your experience, and what makes you a good fit for their projects.'
                      : 'Describe yourself or your business, and the kinds of projects you usually post.'
                  }
                />
              </div>

              {/* Skills + portfolio (freelancer mode only) */}
              {isFreelancer && (
                <>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                      Skills
                    </label>
                    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 focus-within:border-accent">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="flex items-center gap-1.5 rounded-full bg-accent/15 border border-accent/40 px-2.5 py-1 text-[12px] font-medium text-accent"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            aria-label={`Remove ${skill}`}
                            className="cursor-pointer text-accent/80 hover:text-accent"
                          >
                            <CloseIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        onBlur={() => addSkill(skillInput)}
                        placeholder={skills.length === 0 ? 'e.g. Logo Design, React, Copywriting' : 'Add another...'}
                        className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder-text-secondary"
                      />
                    </div>
                    <p className="mt-1.5 text-[12px] text-text-secondary">
                      Press Enter or comma to add a skill.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">
                      Portfolio URL
                    </label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://your-portfolio.com"
                      className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
                    />
                  </div>
                </>
              )}

              {saveError && <p className="text-[13px] text-error">{saveError}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving || !isDirty}
                  className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save profile'}
                </button>
                {isDirty && !saving && (
                  <span className="text-[12px] text-text-secondary">You have unsaved changes</span>
                )}
              </div>
            </form>

            {/* What other people said about you in this mode (public on your profile) */}
            {ratings && <RatingsPanel data={ratings} role={mode} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
