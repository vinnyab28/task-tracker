/**
 * Parses a duration string produced by addDurations (e.g. "2h 30m", "45m", "1h 0m")
 * into total minutes. Returns 0 for missing or unparseable values.
 */
export const parseDurationToMinutes = (duration?: string): number => {
    if (!duration) return 0;
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)\s*m/);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    return hours * 60 + minutes;
};

/**
 * Formats a minute count into a human-readable string (e.g. 90 → "1h 30m", 45 → "45m", 60 → "1h").
 */
export const formatMinutes = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

/**
 * Parses "HH:MM" into minutes since midnight (e.g. "07:30" → 450).
 */
export const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

/**
 * Formats minutes since midnight into a 12h label (e.g. 450 → "7:30am", 1380 → "11:00pm").
 */
export const minutesToTimeLabel = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? "pm" : "am";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayH}:${String(m).padStart(2, "0")}${ampm}`;
};

/**
 * Calculates duration between two "HH:MM" strings. Returns "" if to ≤ from.
 */
export const calcDuration = (from: string, to: string): string => {
    if (!from || !to) return "";
    const diff = timeToMinutes(to) - timeToMinutes(from);
    if (diff <= 0) return "";
    return formatMinutes(diff);
};
