/** Human-readable age of a spot / snapshot timestamp (ISO 8601). */
export function formatSpotAge(iso: string, nowMs = Date.now()): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "Unknown age";

  const ageMs = Math.max(0, nowMs - t);
  const mins = ageMs / 60_000;
  if (mins < 90) return "Live";

  const hours = ageMs / 3_600_000;
  if (hours < 24) {
    const h = Math.max(1, Math.floor(hours));
    return h === 1 ? "1 hour old" : `${h} hours old`;
  }

  const days = Math.floor(ageMs / 86_400_000);
  if (days < 7) {
    if (days === 1) return "1 day old";
    return `${days} days old`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    if (weeks === 1) return "1 week old";
    return `${weeks} weeks old`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    if (months === 1) return "1 month old";
    return `${months} months old`;
  }

  const years = Math.floor(days / 365);
  if (years === 1) return "1 year old";
  return `${years} years old`;
}
