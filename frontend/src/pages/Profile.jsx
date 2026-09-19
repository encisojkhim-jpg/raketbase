// Profile.jsx — Freelancer profile editor (bio, skills, portfolio URL).
// These fields already exist on public.users and are already shown to clients
// on proposal cards (see ClientJobView.jsx) — this page is what makes them
// meaningful by letting the freelancer actually fill them in.
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { CloseIcon } from '../components/Icons';
import { getProfile, updateProfile } from '../services/api';
import { useCurrentUser, setCurrentUser } from '../utils/currentUser';
import { showToast } from '../utils/toast';
import { setUnsaved } from '../utils/unsavedChanges';

const BIO_MAX = 500;
const UNSAVED_KEY = 'profile-editor';

export default function Profile() {
  const currentUser = useCurrentUser();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Snapshot of last-saved values, used to detect unsaved changes.
  const [saved, setSaved] = useState({ bio: '', skills: [], portfolioUrl: '' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await getProfile();
        const profile = res.data || {};
        if (cancelled) return;
        const nextBio = profile.bio || '';
        const nextSkills = Array.isArray(profile.skills) ? profile.skills : [];
        const nextPortfolio = profile.portfolio_url || '';
        setBio(nextBio);
        setSkills(nextSkills);
        setPortfolioUrl(nextPortfolio);
        setSaved({ bio: nextBio, skills: nextSkills, portfolioUrl: nextPortfolio });
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
  }, []);

  const isDirty =
    bio !== saved.bio ||
    portfolioUrl !== saved.portfolioUrl ||
    JSON.stringify(skills) !== JSON.stringify(saved.skills);

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (bio.length > BIO_MAX) {
      setSaveError(`Bio must be ${BIO_MAX} characters or less.`);
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const payload = { bio: bio.trim(), skills, portfolio_url: portfolioUrl.trim() };
      await updateProfile(payload);

      // Keep the shared user object (localStorage) in sync so the Navbar,
      // proposal-gate nudge, etc. all see the change immediately.
      setCurrentUser({ ...currentUser, ...payload });

      setSaved({ bio: payload.bio, skills: payload.skills, portfolioUrl: payload.portfolio_url });
      showToast('Profile updated');
    } catch (err) {
      setSaveError(err.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <div className="mx-auto max-w-2xl px-5 py-8 md:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Your profile</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Clients see this on every proposal you send — a filled-out profile helps them say yes.
        </p>

        {loading && <p className="mt-8 text-text-secondary">Loading your profile...</p>}

        {!loading && loadError && (
          <div className="mt-8 rounded-lg border border-border bg-panel p-10 text-center">
            <p className="font-display text-lg font-medium">Couldn't load your profile</p>
            <p className="mt-1 text-sm text-text-secondary">{loadError}</p>
          </div>
        )}

        {!loading && !loadError && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Bio */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[13px] font-medium text-text-secondary">Bio</label>
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
                placeholder="Tell clients what you do, your experience, and what makes you a good fit for their projects."
              />
            </div>

            {/* Skills */}
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

            {/* Portfolio URL */}
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
        )}
      </div>
    </div>
  );
}
