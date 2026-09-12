import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getFreelancerById } from '../data/mockFreelancers';
import { ArrowLeftIcon, BookmarkIcon, PlusIcon, SendIcon, ShareIcon, StarIcon } from '../components/Icons';

const SERVICE_TABS = ['Graphic design', 'Branding', 'Package', 'Web design'];

const SEED_MESSAGES = [
  { id: 1, from: 'client', text: 'Hello! I need to create a cover for my album. Can you design something like this?', time: '11:31am' },
  { id: 2, from: 'freelancer', text: "Of course! I'd love to help. What's the vibe or concept you're going for?", time: '11:32am' },
  { id: 3, from: 'client', text: "It's an indie/folk album. I want something earthy and nostalgic — maybe with warm tones and some vintage textures.", time: '11:32am' },
];

const AUTO_REPLY = "Got it, thanks for the detail! I'll put together a couple of concept directions and send them over shortly.";

export default function FreelancerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const freelancer = getFreelancerById(id);

  const [activeTab, setActiveTab] = useState(SERVICE_TABS[0]);
  const [saved, setSaved] = useState(false);
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  if (!freelancer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg text-text">
        <p className="text-text-secondary">That freelancer profile doesn't exist.</p>
        <Link to="/explore" className="text-accent font-medium hover:underline">
          Back to Explore
        </Link>
      </div>
    );
  }

  function sendMessage(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const now = timeNow();
    setMessages((prev) => [...prev, { id: prev.length + 1, from: 'client', text, time: now }]);
    setDraft('');

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, from: 'freelancer', text: AUTO_REPLY, time: timeNow() },
      ]);
    }, 900);
  }

  const portfolio = freelancer.portfolio || [
    { id: 1, label: 'Project one', hue: freelancer.hue },
    { id: 2, label: 'Project two', hue: (freelancer.hue + 40) % 360 },
    { id: 3, label: 'Project three', hue: (freelancer.hue + 80) % 360 },
    { id: 4, label: 'Project four', hue: (freelancer.hue + 120) % 360 },
  ];

  return (
    <div className="flex h-screen flex-col bg-bg text-text">
      <header className="flex items-center gap-3 border-b border-border px-5 py-4 md:px-8">
        <button
          onClick={() => navigate('/explore')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary hover:text-text"
          aria-label="Back to Explore"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
        <span className="font-display text-lg font-semibold tracking-tight">RaketBase</span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-8">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-xl font-semibold text-[#1A1305]"
                style={{ backgroundColor: `hsl(${freelancer.hue} 70% 65%)` }}
              >
                {freelancer.initials}
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold">{freelancer.name}</h1>
                <p className="text-text-secondary">
                  {freelancer.role}
                  {freelancer.role.toLowerCase() !== 'designer' ? ', illustrator' : ''}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-text-secondary">
                  <StarIcon className="h-3.5 w-3.5 text-accent" />
                  {freelancer.rating} ({freelancer.reviews})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary hover:text-text">
                <ShareIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSaved((v) => !v)}
                className={`flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors ${
                  saved ? 'text-accent' : 'text-text-secondary hover:text-text'
                }`}
              >
                <BookmarkIcon filled={saved} className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-6 flex gap-6 overflow-x-auto border-b border-border text-[15px]">
            {SERVICE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 whitespace-nowrap border-b-2 pb-3 transition-colors ${
                  activeTab === tab
                    ? 'border-accent font-semibold text-text'
                    : 'border-transparent text-text-secondary hover:text-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 rounded-lg border border-border bg-panel p-6 sm:grid-cols-2">
            <div className="space-y-4">
              <Stat label="Cost of service" value={`$${freelancer.costOfService}`} />
              <Stat label="Revisions" value={freelancer.revisions} />
              <Stat label="Deadlines" value={freelancer.deadline} />
            </div>
            <div>
              <p className="mb-1 text-[13px] font-medium text-text-secondary">About</p>
              <p className="font-display text-lg font-medium leading-relaxed">{freelancer.description}</p>
            </div>
          </div>

          <h2 className="mb-4 font-display text-xl font-semibold">Portfolio</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {portfolio.map((item) => (
              <div
                key={item.id}
                className="flex aspect-square items-end rounded-lg p-3"
                style={{
                  background: `linear-gradient(155deg, hsl(${item.hue} 55% 30%), hsl(${item.hue} 45% 12%))`,
                }}
              >
                <span className="text-[12px] font-medium text-white/85">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="flex min-h-0 w-full flex-col border-t border-border md:w-[380px] md:border-l md:border-t-0">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Chat</h2>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <p className="mb-1 text-center text-[12px] text-text-secondary">Thu, 7 May</p>
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.from === 'client' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.from === 'client'
                      ? 'bg-accent text-[#1A1305]'
                      : 'border border-border bg-surface text-text'
                  }`}
                >
                  {m.text}
                </div>
                <span className="mt-1 text-[11px] text-text-secondary">{m.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-border p-3">
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-text-secondary hover:text-text"
              aria-label="Attach a file"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Your message"
              className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-text-secondary focus:border-accent"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[#1A1305] transition-colors hover:bg-accent-hover disabled:bg-border disabled:text-text-secondary"
              aria-label="Send message"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[13px] text-text-secondary">{label}</p>
      <p className="font-display text-lg font-semibold">{value}</p>
    </div>
  );
}

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
}
