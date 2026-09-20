import { useToast, dismissToast } from '../utils/toast';

export default function Toaster() {
  const toast = useToast();
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      className="fixed bottom-5 right-5 z-[100] w-72 overflow-hidden rounded-md bg-panel/95 shadow-xl backdrop-blur"
    >
      <div className="flex items-center gap-3 px-3.5 py-2.5 text-[13px] text-text">
        <span className="flex-1">{toast.message}</span>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Dismiss message"
          className="shrink-0 text-text-secondary hover:text-text cursor-pointer"
        >
          ✕
        </button>
      </div>
      <div className="h-0.5 w-full bg-border/60">
        <div
          className="h-full bg-accent"
          style={{ animation: `toast-progress ${toast.duration}ms linear forwards` }}
        />
      </div>
    </div>
  );
}
