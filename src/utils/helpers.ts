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
