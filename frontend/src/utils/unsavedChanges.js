// Registry of forms with unsaved input, so risky actions (like switching
// modes, which unmounts client-only pages) can ask before discarding it.
const dirty = new Set();

export function setUnsaved(key, isDirty) {
  if (isDirty) dirty.add(key);
  else dirty.delete(key);
}

export function hasUnsavedChanges() {
  return dirty.size > 0;
}
