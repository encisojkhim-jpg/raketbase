// Lightweight inline icons so the marketplace UI doesn't need a new
// dependency. All accept the usual svg props (className, etc).

export function SearchIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}>
      <circle cx="9" cy="9" r="6.25" />
      <path d="m17 17-3.6-3.6" />
    </svg>
  );
}

export function StarIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 1.8l2.47 5.15 5.68.72-4.15 3.94 1.1 5.6L10 14.35l-5.1 2.86 1.1-5.6L1.85 7.67l5.68-.72z" />
    </svg>
  );
}

export function BookmarkIcon({ filled, ...props }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 3.5h10a.5.5 0 0 1 .5.5v13.2a.4.4 0 0 1-.63.32L10 13.6l-4.87 3.92A.4.4 0 0 1 4.5 17.2V4a.5.5 0 0 1 .5-.5Z" />
    </svg>
  );
}

export function ExperienceIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="6.2" width="14" height="9.3" rx="1.6" />
      <path d="M7.2 6.2V4.9a1.4 1.4 0 0 1 1.4-1.4h2.8a1.4 1.4 0 0 1 1.4 1.4v1.3" />
    </svg>
  );
}

export function ClockIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6.2V10l2.6 1.6" />
    </svg>
  );
}

export function ChevronDownIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m5.5 7.5 4.5 5 4.5-5" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}>
      <path d="M5 5l10 10M15 5 5 15" />
    </svg>
  );
}

export function ArrowLeftIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.5 4.5 6 11l6.5 6.5" />
    </svg>
  );
}

export function SendIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M2.4 2.6a.6.6 0 0 1 .77-.45l14.7 5.05a.9.9 0 0 1 0 1.7l-14.7 5.05a.6.6 0 0 1-.79-.68l1.4-5.03a.3.3 0 0 1 .28-.22l7-.32a.2.2 0 0 0 0-.4l-7-.32a.3.3 0 0 1-.28-.22z" />
    </svg>
  );
}

export function PlusIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}>
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  );
}

export function ShareIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 12.7V3.3M6.6 6.6 10 3.2l3.4 3.4" />
      <path d="M4 10.8v4.4a1.3 1.3 0 0 0 1.3 1.3h9.4a1.3 1.3 0 0 0 1.3-1.3v-4.4" />
    </svg>
  );
}

export function ChatIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 4.8A1.8 1.8 0 0 1 4.8 3h10.4A1.8 1.8 0 0 1 17 4.8v6.4a1.8 1.8 0 0 1-1.8 1.8H8l-3.6 3v-3H4.8A1.8 1.8 0 0 1 3 11.2z" />
    </svg>
  );
}

export function PaperclipIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 7.2 8.3 13.4a2.6 2.6 0 0 1-3.7-3.7l6.6-6.6a1.9 1.9 0 0 1 2.7 2.7L7.5 12.2a1.1 1.1 0 0 1-1.6-1.6l5.4-5.4" />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 6h12M8 6V4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V6m-7.5 0 .6 9a1.5 1.5 0 0 0 1.5 1.4h4.8a1.5 1.5 0 0 0 1.5-1.4l.6-9" />
    </svg>
  );
}

export function DownloadIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 3v9.5m0 0L6.5 9M10 12.5 13.5 9" />
      <path d="M4 14.5v.8a1.7 1.7 0 0 0 1.7 1.7h8.6a1.7 1.7 0 0 0 1.7-1.7v-.8" />
    </svg>
  );
}

export function FileIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2.8h5.4L15 6.4v10.8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.8a1 1 0 0 1 1-1Z" />
      <path d="M11.2 2.8v3.6H15" />
    </svg>
  );
}

export function MenuIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...props}>
      <path d="M3.5 5h13M3.5 10h13M3.5 15h13" />
    </svg>
  );
}