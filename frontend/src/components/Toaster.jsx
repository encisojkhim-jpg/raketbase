import { useToast, dismissToast } from '../utils/toast';

export default function Toaster() {
  const toast = useToast();
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      role="status"
      className="fixed right-4 top-20 z-[100] flex max-w-sm items-start gap-3 rounded-md border border-accent/40 bg-panel px-4 py-3 text-sm text-text shadow-2xl"
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={dismissToast}
        aria-label="Dismiss message"
        className="text-text-secondary hover:text-text cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}
