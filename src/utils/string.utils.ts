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
