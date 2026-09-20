// Tiny global toast store. Call showToast('message') from anywhere;
// <Toaster /> (mounted once in App) renders it.
import { useSyncExternalStore } from 'react';

let toast = null;
let timer = null;
const listeners = new Set();

function emit() {
  listeners.forEach((l) => l());
}

export function dismissToast() {
  clearTimeout(timer);
  toast = null;
  emit();
}

export function showToast(message, duration = 5000) {
  clearTimeout(timer);
  toast = { id: Date.now(), message, duration };
  emit();
  timer = setTimeout(dismissToast, duration);
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useToast() {
  return useSyncExternalStore(subscribe, () => toast, () => null);
}
