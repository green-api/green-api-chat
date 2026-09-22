// crypto.randomUUID() is only exposed in secure contexts, and Safari doesn't always
// consider an embedded iframe secure even when it's served over https (e.g. when the
// partner page embedding it is http, or in some cross-origin nesting cases) — calling it
// there throws synchronously, which silently aborts the whole onQueryStarted optimistic
// update it's used in. This id is only ever compared against our own local cache, so it
// doesn't need cryptographic randomness.
export function generateTempMessageId(): string {
  return `temp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getFirstNonEmptyString(
  ...values: Array<string | null | undefined>
): string | undefined {
  for (const value of values) {
    if (typeof value !== 'string') continue;

    const normalized = value.trim();
    if (normalized) return normalized;
  }

  return undefined;
}
