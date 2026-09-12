import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categories, freelancers, skillOptions } from '../data/mockFreelancers';
import {
  BookmarkIcon,
  ChevronDownIcon,
  CloseIcon,
  ExperienceIcon,
  ClockIcon,
  SearchIcon,
  StarIcon,
} from '../components/Icons';

const DEFAULT_SALARY = { min: 20, max: 300 };
const DEFAULT_EXPERIENCE = { min: 0, max: 6 };

export default function Explore() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('design');
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [availability, setAvailability] = useState('Full-time');
  const [salary, setSalary] = useState(DEFAULT_SALARY);
  const [experience, setExperience] = useState(DEFAULT_EXPERIENCE);
  const [activeSkills, setActiveSkills] = useState(['Figma']);
  const [saved, setSaved] = useState(() => new Set());

  function toggleSkill(skill) {
    setActiveSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function toggleSaved(id) {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function resetFilters() {
    setAvailability('Full-time');
    setSalary(DEFAULT_SALARY);
    setExperience(DEFAULT_EXPERIENCE);
    setActiveSkills([]);
  }

  const visibleFreelancers = useMemo(() => {
    return freelancers.filter((f) => {
      if (f.category !== activeCategory) return false;
      if (f.price < salary.min || f.price > salary.max) return false;
      if (f.experienceYears < experience.min || f.experienceYears > experience.max) return false;
      if (activeSkills.length && !activeSkills.some((s) => f.skills.includes(s))) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const haystack = `${f.name} ${f.role} ${f.serviceTitle}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [activeCategory, salary, experience, activeSkills, query]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-bg/95 px-5 py-4 backdrop-blur md:px-8">
        <Link to="/dashboard" className="font-display text-xl font-semibold tracking-tight">
          RaketBase
        </Link>

        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="ml-1 hidden items-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] font-medium text-text-secondary hover:border-accent/40 hover:text-text md:flex"
        >
          {filtersOpen ? 'Hide filters' : 'Show filters'}
        </button>

        <div className="relative ml-auto w-full max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search freelancers or services"
            className="w-full rounded-md border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-text-secondary focus:border-accent transition-colors"
          />
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-[#1A1305]">
          U
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-5 py-6 md:px-8">
        {filtersOpen && (
          <FiltersSidebar
            availability={availability}
            setAvailability={setAvailability}
            salary={salary}
            setSalary={setSalary}
            experience={experience}
            setExperience={setExperience}
            activeSkills={activeSkills}
            toggleSkill={toggleSkill}
            resetFilters={resetFilters}
            resultCount={visibleFreelancers.length}
            onClose={() => setFiltersOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex items-baseline justify-between">
            <h1 className="font-display text-3xl font-semibold tracking-tight">Explore</h1>
          </div>

          <nav className="mb-6 flex gap-6 overflow-x-auto border-b border-border pb-3 text-[15px]">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`shrink-0 whitespace-nowrap transition-colors ${
                  activeCategory === c.id
                    ? 'font-semibold text-text'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                {c.label} <span className="text-text-secondary">({c.count})</span>
              </button>
            ))}
          </nav>

          {visibleFreelancers.length === 0 ? (
            <div className="rounded-lg border border-border bg-panel p-10 text-center">
              <p className="font-display text-lg font-medium">No freelancers match those filters</p>
              <p className="mt-1 text-sm text-text-secondary">
                Try widening the salary range or clearing a skill tag.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-accent/40"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleFreelancers.map((f) => (
                <FreelancerCard
                  key={f.id}
                  freelancer={f}
                  isSaved={saved.has(f.id)}
                  onToggleSave={() => toggleSaved(f.id)}
                  onOpen={() => navigate(`/explore/${f.id}`)}
                />
              ))}

              <PromoCard />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FiltersSidebar({
  availability,
  setAvailability,
  salary,
  setSalary,
  experience,
  setExperience,
  activeSkills,
  toggleSkill,
  resetFilters,
  resultCount,
  onClose,
}) {
  return (
    <aside className="hidden w-[280px] shrink-0 md:block">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Filters</h2>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:text-text"
          aria-label="Hide filters"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <FieldSelect label="Category" value="UI/UX Design" />

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">Availability</label>
          <div className="relative">
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full appearance-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors"
            >
              <option>Full-time</option>
              <option>Part-Time</option>
              <option>Project work</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          </div>
        </div>

        <RangeField
          label="Salary"
          unit="$"
          value={salary}
          onChange={setSalary}
          bounds={{ min: 0, max: 500 }}
          onReset={() => setSalary(DEFAULT_SALARY)}
        />

        <RangeField
          label="Years experience"
          value={experience}
          onChange={setExperience}
          bounds={{ min: 0, max: 10 }}
          onReset={() => setExperience(DEFAULT_EXPERIENCE)}
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[13px] font-medium text-text-secondary">Skills</span>
            <button
              onClick={() => activeSkills.forEach((s) => toggleSkill(s))}
              className="text-[13px] font-medium text-accent hover:underline"
            >
              Reset
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skillOptions.map((skill) => {
              const active = activeSkills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    active
                      ? 'border-accent bg-accent text-[#1A1305]'
                      : 'border-border text-text-secondary hover:border-accent/40 hover:text-text'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button className="w-full rounded-md bg-accent py-3 text-sm font-semibold text-[#1A1305] transition-colors hover:bg-accent-hover">
            Show {resultCount} results
          </button>
          <button
            onClick={resetFilters}
            className="w-full rounded-md border border-border py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-text"
          >
            Reset all
          </button>
        </div>
      </div>
    </aside>
  );
}

function FieldSelect({ label, value }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={() => {}}
          className="w-full appearance-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors"
        >
          <option>{value}</option>
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
      </div>
    </div>
  );
}

function RangeField({ label, unit, value, onChange, bounds, onReset }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-text-secondary">{label}</span>
        <button onClick={onReset} className="text-[13px] font-medium text-accent hover:underline">
          Reset
        </button>
      </div>
      <input
        type="range"
        min={bounds.min}
        max={bounds.max}
        value={value.max}
        onChange={(e) => onChange({ ...value, max: Number(e.target.value) })}
        className="mb-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-[color:var(--color-accent)]"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="mb-1 block text-[11px] text-text-secondary">From{unit ? `, ${unit}` : ''}</span>
          <input
            type="number"
            value={value.min}
            onChange={(e) => onChange({ ...value, min: Number(e.target.value) })}
            className="w-full rounded-md border border-border bg-surface px-2.5 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <span className="mb-1 block text-[11px] text-text-secondary">To{unit ? `, ${unit}` : ''}</span>
          <input
            type="number"
            value={value.max}
            onChange={(e) => onChange({ ...value, max: Number(e.target.value) })}
            className="w-full rounded-md border border-border bg-surface px-2.5 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>
    </div>
  );
}

function FreelancerCard({ freelancer, isSaved, onToggleSave, onOpen }) {
  const f = freelancer;
  return (
    <div className="flex flex-col rounded-lg border border-border bg-panel p-5 transition-colors hover:border-accent/40">
      <div className="mb-3 flex items-start justify-between">
        <button onClick={onOpen} className="flex items-center gap-3 text-left">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold text-[#1A1305]"
            style={{ backgroundColor: `hsl(${f.hue} 70% 65%)` }}
          >
            {f.initials}
          </div>
          <div>
            <p className="text-[15px] font-medium leading-tight">{f.name}</p>
            <p className="text-[13px] text-text-secondary">{f.role}</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[13px] font-medium text-text-secondary">
            <StarIcon className="h-3.5 w-3.5 text-accent" />
            {f.rating} <span className="text-text-secondary">({f.reviews})</span>
          </span>
          <button
            onClick={onToggleSave}
            aria-label={isSaved ? 'Remove bookmark' : 'Save freelancer'}
            className={`transition-colors ${isSaved ? 'text-accent' : 'text-text-secondary hover:text-text'}`}
          >
            <BookmarkIcon filled={isSaved} className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <button onClick={onOpen} className="mb-3 flex items-start justify-between gap-3 text-left">
        <span className="font-display text-lg font-medium leading-snug">{f.serviceTitle}</span>
        <span className="shrink-0 text-[13px] text-text-secondary">
          from <span className="font-display text-lg font-semibold text-text">${f.price}</span>
        </span>
      </button>

      <div className="mb-3 flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[12px] text-text-secondary">
          <ExperienceIcon className="h-3.5 w-3.5" />
          {f.experienceYears} years exp
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[12px] text-text-secondary">
          <ClockIcon className="h-3.5 w-3.5" />
          {f.workType}
        </span>
      </div>

      <p className="mb-4 line-clamp-3 text-[13px] leading-relaxed text-text-secondary">{f.description}</p>

      <button
        onClick={onOpen}
        className="mt-auto rounded-md border border-border py-2.5 text-[13px] font-medium transition-colors hover:border-accent/40 hover:text-accent"
      >
        View profile
      </button>
    </div>
  );
}

function PromoCard() {
  return (
    <div className="relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-lg border border-border p-6 sm:col-span-2 xl:col-span-1">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 140% at 20% 0%, #3a2a12 0%, #17130c 55%, #10131A 100%)',
        }}
      />
      <div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-70 blur-2xl"
        style={{ background: 'radial-gradient(circle, #E7B24B, transparent 70%)' }}
      />
      <div className="relative">
        <p className="font-display text-xl font-semibold leading-snug text-text">
          Connecting you with trusted freelancers, fast.
        </p>
        <p className="mt-2 text-[13px] text-text-secondary">
          Post a job or browse profiles — RaketBase handles the rest.
        </p>
      </div>
    </div>
  );
}
